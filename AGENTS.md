# AGENT.md
# This file tells any AI coding agent how to work in this project.
# Read this entire file before writing a single line of code.

---

## Who you are
You are one of three agents building this project in parallel.
Your role, owned files, and task are defined in the YOUR ASSIGNMENT
section at the bottom of this file.

---

## What we are building
A React PWA for cricket bowling video analysis.
- User uploads a bowling video
- App extracts frames at 8fps
- MediaPipe runs pose detection on each frame
- Skeleton is overlaid on each frame
- Biomechanical issues are flagged (front arm, head, release point)
- User gets a score per frame and a PDF report

---

## Rules — follow these without exception

### General
- Read CONTEXT.md fully before touching any file
- Only touch files listed under YOUR ASSIGNMENT
- Do not install any npm packages
- Do not modify package.json
- Do not modify CONTEXT.md, AGENT.md, TASKS.md, or PATTERNS.md
- Do not create files that are not in your assignment
- If something is unclear, write a TODO comment and move on
- Do not ask clarifying questions — make the safest assumption and comment it

### Code style
- React + Vite, no TypeScript, .jsx and .js files only
- Tailwind CSS for all styling — no inline styles, no separate .css files
- No default exports mixed with named exports — pick one per file
- Keep components under 150 lines — split if larger
- No console.log left in final code — use comments instead

### Data contracts
- The data types in CONTEXT.md are fixed — do not change them
- The export signatures in CONTEXT.md are fixed — do not change them
- If a function signature needs to change, leave a comment explaining why
  and do not change it — let the coordinator decide

### Git
- You are on your own branch (see YOUR ASSIGNMENT)
- Commit after each file is complete with message: "feat: add filename"
- Do not merge into main — coordinator handles all merges

---

## Project file structure
cricket-analyzer/
├── public/
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── VideoUpload.jsx     ← Agent A
│   │   ├── FramePlayer.jsx     ← Agent A
│   │   └── AnalysisPanel.jsx   ← Agent A
│   ├── lib/
│   │   ├── pose.js             ← Agent B
│   │   ├── analyze.js          ← Agent B
│   │   └── export.js           ← Agent C
│   └── App.jsx                 ← Coordinator only
├── CONTEXT.md                  ← read only
├── AGENT.md                    ← this file, read only
├── TASKS.md                    ← read only
└── package.json                ← do not touch
---

## Data types (read only — do not change)

### Frame
```js
{
  dataUrl: string,      // base64 JPEG from canvas.toDataURL('image/jpeg', 0.7)
  landmarks: Array,     // MediaPipe poseLandmarks (33 points) or null
  timestamp: number     // seconds into video
}
```

### PoseResult
```js
{
  scores: {
    frontArm: 'good' | 'warn' | 'bad',
    head:     'good' | 'warn' | 'bad',
    release:  'good' | 'warn' | 'bad'
  },
  issues: string[],
  overallScore: number,       // 0–100 integer
  metrics: {
    frontArmAngle: number,    // degrees, rounded integer
    headDrift: number,        // 0–100 rounded integer
    releaseHeight: number     // 0–100 rounded integer
  }
}
```

### SessionSummary
```js
{
  overallScore: number,   // average across non-null results
  topIssues: string[],    // top 3 most frequent issue strings
  frameCount: number,
  goodFrames: number      // frames where overallScore >= 67
}
```

---

## Styling system
| Purpose          | Tailwind class                        |
|------------------|---------------------------------------|
| Page background  | bg-gray-950                           |
| Card background  | bg-gray-900                           |
| Border           | border border-gray-800                |
| Primary text     | text-white                            |
| Secondary text   | text-gray-400                         |
| Good / pass      | text-emerald-500 bg-emerald-950       |
| Warning          | text-amber-400 bg-amber-950           |
| Bad / fail       | text-red-500 bg-red-950               |
| Border radius    | rounded-lg (cards) rounded-full (dots)|

---

## YOUR ASSIGNMENT
# Uncomment the block that applies to you before starting.
# Delete the other two blocks.

---

### AGENT A — UI components
# Branch: feat/ui
# Files you own:
#   src/components/VideoUpload.jsx
#   src/components/FramePlayer.jsx
#   src/components/AnalysisPanel.jsx
#
# Your tasks:
#   1. Build VideoUpload.jsx
#      Props: { onFile }
#      - onFile(file) called when user picks or drops a video file
#      - Accepts video/* only, rejects everything else
#      - Full screen height, dark bg, centered drag-drop zone
#      - Click anywhere in zone to open file picker
#
#   2. Build FramePlayer.jsx
#      Props: { frame, landmarks, analysis, currentFrame, totalFrames, onChange }
#      - Render frame.dataUrl as an img
#      - Overlay a <canvas> on top, draw skeleton using landmarks
#      - Skeleton: draw lines between connected joints, dots on each joint
#      - Score badge top-right: analysis.overallScore (green/amber/red)
#      - Frame counter bottom-left: "Frame X / Y"
#      - Slider full width below video
#      - Prev / Next buttons beside slider
#
#   3. Build AnalysisPanel.jsx
#      Props: { analysis, analyses, currentFrame, onFrameSelect }
#      - 3 score rows: Front arm, Head position, Release point
#      - Each row shows label + metric value + good/warn/bad badge
#      - Issues list below scores
#      - Frame timeline: one 10x10px dot per frame
#        green if overallScore>=67, amber if >=34, red if <34
#        current frame dot is white
#        clicking a dot calls onFrameSelect(index)
#
# Do not import from src/lib/ — use props only.
# Assume all props are valid — no need to handle undefined.

---

### AGENT B — Pose logic
# Branch: feat/pose-engine
# Files you own:
#   src/lib/pose.js
#   src/lib/analyze.js
#
# Your tasks:
#   1. Build pose.js — export extractFrames and analyzePose
#
#      extractFrames(videoFile, fps = 8) → Promise<Frame[]>
#      - Create a hidden <video> element, set src to object URL
#      - Create a 640x360 <canvas>, draw video frame at each interval
#      - Inject MediaPipe script via <script> tag if window.Pose undefined:
#        src: https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js
#      - Init Pose with locateFile pointing to same CDN base URL
#      - Run pose.send({ image: canvas }) on each frame
#      - Max 40 frames total
#      - Return Frame[]
#
#      analyzePose(landmarks, isLeftArm = true) → PoseResult | null
#      - Return null if landmarks is null or undefined
#      - Bowling arm indices if isLeftArm:
#        shoulder=11, elbow=13, wrist=15
#        front shoulder=12, front elbow=14
#      - Flip indices if isLeftArm=false
#      - Front arm angle: angle at front elbow joint
#      - Head drift: abs(nose.x - shoulder midpoint x) * 100
#      - Release height: wrist.y * 100
#      - Thresholds:
#        frontArm: angle>120 good, >80 warn, else bad
#        head: drift<6 good, <12 warn, else bad
#        release: height<35 good, <55 warn, else bad
#      - overallScore: (good count / 3) * 100, rounded
#
#   2. Build analyze.js — export summarizeSession
#
#      summarizeSession(frames, poseResults) → SessionSummary
#      - Filter out null poseResults
#      - Average overallScore across valid results
#      - Count issue frequency across all results, return top 3
#      - Count goodFrames where overallScore >= 67
#
# No UI code. No imports from src/components/.

---

### AGENT C — Export
# Branch: feat/export
# Files you own:
#   src/lib/export.js
#
# Your tasks:
#   1. Build export.js — export generateReport
#
#      generateReport(bowlerName, date, frames, summary) → Promise<Blob>
#      - Import: import { jsPDF } from 'jspdf'
#      - Page 1:
#        - Title: "Cricket Action Analysis Report"
#        - Bowler name and date
#        - Overall score large (e.g. "74 / 100")
#        - Top issues as a numbered list
#      - Page 2:
#        - Heading: "Worst Frames"
#        - Find 6 frames with lowest overallScore from poseResults
#        - Add each as an image (frame.dataUrl) in a 2-column grid
#        - Label each with its score
#      - Return doc.output('blob')
#
# No UI code. No imports from src/components/.
# jspdf is already installed — do not install anything else.
