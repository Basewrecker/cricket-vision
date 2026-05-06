/*
 * FramePlayer — displays a cricket bowling frame with MediaPipe pose skeleton
 * overlay, score badge, frame counter, and prev/next slider navigation.
 * Exports: FramePlayer (default)
 * Assumptions: landmarks are MediaPipe Pose normalized coords (33 pts, x/y 0–1).
 *   frame.dataUrl is a valid image data URL. onChange(index) expects a number.
 *
 * Pseudo-tests:
 *   PASS: renders img with src=frame.dataUrl
 *   PASS: canvas redraws skeleton on landmarks/frame change
 *   PASS: skeleton lines connect correct joint pairs; dots drawn on each landmark
 *   PASS: score badge is green >=67, amber 34-66, red <34
 *   PASS: frame counter shows "Frame X / Y" (1-based)
 *   PASS: slider value mirrors currentFrame; onChange fires with numeric index
 *   PASS: Prev disabled and not callable at frame 0
 *   PASS: Next disabled and not callable at last frame
 *   PASS: canvas.width=0 guard prevents drawing on unmounted/invisible canvas
 */
import { useRef, useEffect } from 'react'

const POSE_CONNECTIONS = [
  // face outline
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
  // shoulders
  [11, 12],
  // left arm
  [11, 13], [13, 15], [15, 17], [15, 19], [17, 19],
  // right arm
  [12, 14], [14, 16], [16, 18], [16, 20], [18, 20],
  // torso
  [11, 23], [12, 24], [23, 24],
  // left leg
  [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
  // right leg
  [24, 26], [26, 28], [28, 30], [28, 32], [30, 32],
  // head to torso
  [0, 11], [0, 12],
]

function scoreColor(score) {
  if (score >= 67) return '#22c55e'
  if (score >= 34) return '#f59e0b'
  return '#ef4444'
}

const btnBase = {
  padding: '6px 14px',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
}

export default function FramePlayer({ frame, landmarks, analysis, currentFrame, totalFrames, onChange }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !landmarks || landmarks.length === 0) return

    // requestAnimationFrame ensures layout is settled before reading dimensions
    const rafId = requestAnimationFrame(() => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      if (canvas.width === 0 || canvas.height === 0) return

      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = 'rgba(139,92,246,0.85)'
      ctx.lineWidth = 2
      for (const [a, b] of POSE_CONNECTIONS) {
        const lA = landmarks[a]
        const lB = landmarks[b]
        if (!lA || !lB) continue
        ctx.beginPath()
        ctx.moveTo(lA.x * canvas.width, lA.y * canvas.height)
        ctx.lineTo(lB.x * canvas.width, lB.y * canvas.height)
        ctx.stroke()
      }

      ctx.fillStyle = '#c4b5fd'
      for (const lm of landmarks) {
        if (!lm) continue
        ctx.beginPath()
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    return () => cancelAnimationFrame(rafId)
  }, [landmarks, frame])

  const badgeColor = scoreColor(analysis.overallScore)
  const atStart = currentFrame === 0
  const atEnd = currentFrame === totalFrames - 1

  return (
    <div style={{ background: '#0d0d0f' }}>
      <div style={{ position: 'relative', width: '100%' }}>
        <img
          src={frame.dataUrl}
          alt={`Frame ${currentFrame + 1}`}
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%',
            zIndex: 1,
          }}
        />
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          background: badgeColor,
          color: '#fff',
          borderRadius: '8px',
          padding: '4px 10px',
          fontWeight: 700,
          fontSize: '15px',
          fontFamily: 'monospace',
          lineHeight: 1.4,
          zIndex: 2,
        }}>
          {analysis.overallScore}
        </div>
        <div style={{
          position: 'absolute', bottom: '12px', left: '12px',
          background: 'rgba(0,0,0,0.6)',
          color: '#e5e7eb',
          borderRadius: '6px',
          padding: '3px 8px',
          fontSize: '13px',
          fontFamily: 'monospace',
          zIndex: 2,
        }}>
          Frame {currentFrame + 1} / {totalFrames}
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        background: '#111114',
      }}>
        <button
          style={{ ...btnBase, background: atStart ? '#1f2937' : '#374151', color: atStart ? '#6b7280' : '#f3f4f6', cursor: atStart ? 'default' : 'pointer' }}
          disabled={atStart}
          onClick={() => onChange(currentFrame - 1)}
        >
          ‹ Prev
        </button>
        <input
          type="range"
          min={0}
          max={totalFrames - 1}
          value={currentFrame}
          onChange={e => onChange(Number(e.target.value))}
          style={{ flex: 1, accentColor: '#7c3aed' }}
        />
        <button
          style={{ ...btnBase, background: atEnd ? '#1f2937' : '#374151', color: atEnd ? '#6b7280' : '#f3f4f6', cursor: atEnd ? 'default' : 'pointer' }}
          disabled={atEnd}
          onClick={() => onChange(currentFrame + 1)}
        >
          Next ›
        </button>
      </div>
    </div>
  )
}
