/*
 * pose.js — MediaPipe Pose extraction and analysis for cricket bowling mechanics.
 * Exports: extractFrames(videoFile, fps?) → Promise<Frame[]>
 *          analyzePose(landmarks, isLeftArm?) → PoseResult | null
 *
 * Frame    = { landmarks: Landmark[] | null, frameIndex: number, timestamp: number }
 * Landmark = { x: number, y: number, z: number, visibility: number }  (MediaPipe normalised)
 * PoseResult = { frontArm, frontArmAngle, head, headDrift, release, releaseHeight, overallScore }
 *
 * Assumptions:
 *  - Runs in a browser context (requires window, document, HTMLVideoElement, HTMLCanvasElement)
 *  - MediaPipe WASM files are served from the same CDN as the main script
 *  - pose.send() resolves only after onResults has fired (MediaPipe 0.5.x contract)
 */

/*
 * PSEUDO-TESTS
 *
 * analyzePose(null) → null
 * analyzePose(undefined) → null
 *
 * analyzePose(landmarks, true):
 *   uses indices shoulder=11, elbow=13, wrist=15, frontShoulder=12, frontElbow=14, frontWrist=16
 *
 * analyzePose(landmarks, false):
 *   uses indices shoulder=12, elbow=14, wrist=16, frontShoulder=11, frontElbow=13, frontWrist=15
 *
 * frontArmAngle > 120 → frontArm = 'good'
 * frontArmAngle 80–120 → frontArm = 'warn'
 * frontArmAngle < 80 → frontArm = 'bad'
 *
 * headDrift < 6 → head = 'good'
 * headDrift 6–12 → head = 'warn'
 * headDrift >= 12 → head = 'bad'
 *
 * releaseHeight < 35 → release = 'good'
 * releaseHeight 35–55 → release = 'warn'
 * releaseHeight >= 55 → release = 'bad'
 *
 * all 3 good → overallScore = 100
 * 2 good → overallScore = 67
 * 1 good → overallScore = 33
 * 0 good → overallScore = 0
 *
 * extractFrames: max 40 frames regardless of duration or fps
 * extractFrames: rejects if video errors or MediaPipe fails to load
 */

const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404'

function loadMediaPipe() {
  if (typeof window.Pose === 'function') return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `${MEDIAPIPE_CDN}/pose.js`
    script.crossOrigin = 'anonymous'
    script.onload = resolve
    script.onerror = () => reject(new Error('Failed to load MediaPipe Pose from CDN'))
    document.head.appendChild(script)
  })
}

function angleDeg(a, b, c) {
  const ba = { x: a.x - b.x, y: a.y - b.y, z: (a.z || 0) - (b.z || 0) }
  const bc = { x: c.x - b.x, y: c.y - b.y, z: (c.z || 0) - (b.z || 0) }
  const dot = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z
  const magBA = Math.sqrt(ba.x ** 2 + ba.y ** 2 + ba.z ** 2)
  const magBC = Math.sqrt(bc.x ** 2 + bc.y ** 2 + bc.z ** 2)
  if (magBA === 0 || magBC === 0) return 0
  return Math.acos(Math.max(-1, Math.min(1, dot / (magBA * magBC)))) * (180 / Math.PI)
}

export async function extractFrames(videoFile, fps = 8) {
  await loadMediaPipe()

  const video = document.createElement('video')
  video.style.cssText = 'position:fixed;opacity:0;pointer-events:none;'
  video.muted = true
  video.playsInline = true
  document.body.appendChild(video)

  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 360
  const ctx = canvas.getContext('2d')

  const objectUrl = URL.createObjectURL(videoFile)
  video.src = objectUrl

  try {
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve
      video.onerror = () => reject(new Error('Video failed to load'))
    })

    const pose = new window.Pose({
      locateFile: (file) => `${MEDIAPIPE_CDN}/${file}`,
    })
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    let currentLandmarks = null
    pose.onResults((results) => {
      currentLandmarks = results.poseLandmarks || null
    })

    const duration = video.duration
    const totalFrames = Math.min(Math.floor(duration * fps), 40)
    const frames = []

    for (let i = 0; i < totalFrames; i++) {
      const timestamp = i / fps

      video.currentTime = timestamp
      await new Promise((resolve) => {
        video.onseeked = resolve
      })

      ctx.drawImage(video, 0, 0, 640, 360)
      currentLandmarks = null
      await pose.send({ image: canvas })

      frames.push({ landmarks: currentLandmarks, frameIndex: i, timestamp })
    }

    return frames
  } finally {
    URL.revokeObjectURL(objectUrl)
    document.body.removeChild(video)
  }
}

export function analyzePose(landmarks, isLeftArm = true) {
  if (landmarks == null) return null

  const idx = isLeftArm
    ? { shoulder: 11, elbow: 13, wrist: 15, frontShoulder: 12, frontElbow: 14, frontWrist: 16 }
    : { shoulder: 12, elbow: 14, wrist: 16, frontShoulder: 11, frontElbow: 13, frontWrist: 15 }

  const nose = landmarks[0]
  const shoulder = landmarks[idx.shoulder]
  const wrist = landmarks[idx.wrist]
  const frontShoulder = landmarks[idx.frontShoulder]
  const frontElbow = landmarks[idx.frontElbow]
  const frontWrist = landmarks[idx.frontWrist]

  const frontArmAngle = angleDeg(frontShoulder, frontElbow, frontWrist)
  const shoulderMidX = (shoulder.x + frontShoulder.x) / 2
  const headDrift = Math.abs(nose.x - shoulderMidX) * 100
  const releaseHeight = wrist.y * 100

  const frontArmStatus = frontArmAngle > 120 ? 'good' : frontArmAngle > 80 ? 'warn' : 'bad'
  const headStatus = headDrift < 6 ? 'good' : headDrift < 12 ? 'warn' : 'bad'
  const releaseStatus = releaseHeight < 35 ? 'good' : releaseHeight < 55 ? 'warn' : 'bad'

  const goodCount = [frontArmStatus, headStatus, releaseStatus].filter((s) => s === 'good').length

  return {
    frontArm: frontArmStatus,
    frontArmAngle,
    head: headStatus,
    headDrift,
    release: releaseStatus,
    releaseHeight,
    overallScore: Math.round((goodCount / 3) * 100),
  }
}
