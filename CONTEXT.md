# Cricket Analyzer — Shared Context

## What we're building
A React PWA that lets cricketers upload bowling videos, runs MediaPipe pose
detection on extracted frames, overlays a skeleton, and flags biomechanical
issues like front arm collapse, head drift, and low release point.

## Stack
- React + Vite (no TypeScript)
- Tailwind CSS for all styling
- MediaPipe Pose loaded via CDN script injection (not npm)
- jspdf for PDF export (already installed)
- PWA via vite-plugin-pwa

## File ownership — each session touches ONLY its assigned files
src/
  components/
    VideoUpload.jsx       → Session 1
    FramePlayer.jsx       → Session 1
    AnalysisPanel.jsx     → Session 1
  lib/
    pose.js               → Session 2
    analyze.js            → Session 2
    export.js             → Session 3
  App.jsx                 → Coordinator only (do not touch)
  index.css               → Do not touch
public/
  manifest.json           → Do not touch

## Data contracts — these signatures are fixed, do not change them

### Frame object
{
  dataUrl: string,        // base64 JPEG from canvas
  landmarks: Array | null, // MediaPipe pose landmarks (33 points)
  timestamp: number       // seconds into video
}

### PoseResult object
{
  scores: {
    frontArm: 'good' | 'warn' | 'bad',
    head:     'good' | 'warn' | 'bad',
    release:  'good' | 'warn' | 'bad'
  },
  issues: string[],       // human-readable issue descriptions
  overallScore: number,   // 0–100
  metrics: {
    frontArmAngle: number,  // degrees
    headDrift: number,      // 0–100 percentage
    releaseHeight: number   // 0–100 percentage
  }
}

### SessionSummary object
{
  overallScore: number,   // average across all frames
  topIssues: string[],    // top 3 most frequent issues
  frameCount: number,
  goodFrames: number      // frames where overallScore >= 67
}

## pose.js must export exactly
extractFrames(videoFile, fps = 8) → Promise<Frame[]>
  - draws video to canvas at given fps
  - loads MediaPipe via CDN script injection if not already loaded
  - runs pose detection on each frame
  - returns array of Frame objects

analyzePose(landmarks, isLeftArm = true) → PoseResult | null
  - returns null if landmarks is null or detection confidence too low
  - calculates front arm angle, head lateral drift, release point height
  - maps to scores and issues for a left-arm wrist spin bowler

## analyze.js must export exactly
summarizeSession(frames, poseResults) → SessionSummary
  - takes Frame[] and PoseResult[] (same length, some poseResults may be null)
  - skips null results
  - returns SessionSummary

## export.js must export exactly
generateReport(bowlerName, date, frames, summary) → Promise<Blob>
  - bowlerName: string
  - date: string (e.g. "6 May 2026")
  - frames: Frame[]
  - summary: SessionSummary
  - uses jspdf (already installed, import from 'jspdf')
  - PDF includes: bowler name, date, overall score, top issues,
    grid of worst 6 frames with their scores
  - returns a PDF Blob

## Component props contracts

### VideoUpload.jsx props
{ onFile: (file: File) => void }
- drag and drop + click to upload
- accepts video/* only
- dark background, centered layout

### FramePlayer.jsx props
{
  frame: Frame,
  landmarks: Array | null,
  analysis: PoseResult | null,
  currentFrame: number,
  totalFrames: number,
  onChange: (index: number) => void
}
- shows frame image (dataUrl) as background
- overlays skeleton on canvas using landmarks
- slider + prev/next buttons for scrubbing
- shows frame number and overall score overlay

### AnalysisPanel.jsx props
{
  analysis: PoseResult | null,
  analyses: PoseResult[],
  currentFrame: number,
  onFrameSelect: (index: number) => void
}
- shows scores for frontArm, head, release (color coded)
- lists issues for current frame
- shows frame timeline as colored dots (green/yellow/red)

## Styling rules
- Dark theme throughout: bg-gray-950 or bg-gray-900
- Text: white or gray-400
- Accent color: emerald-500 for good, amber-400 for warn, red-500 for bad
- Rounded corners: rounded-lg or rounded-xl
- All spacing via Tailwind utility classes only

## Git branches
Session 1 → feat/ui
Session 2 → feat/pose-engine
Session 3 → feat/export

## Rules for all sessions
- Do not install new npm packages
- Do not modify files outside your ownership list
- Do not change any export signature defined above
- Use Tailwind for all styling — no inline styles, no CSS files
- No TypeScript — plain .jsx and .js only
- If something is unclear, implement the safest/simplest version
  and leave a comment explaining the assumption
