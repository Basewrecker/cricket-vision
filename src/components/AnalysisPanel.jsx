/*
 * AnalysisPanel — per-frame cricket bowling scores, issues list, and a
 * colour-coded clickable frame timeline.
 * Exports: AnalysisPanel (default)
 * Assumptions: analysis.frontArm / headPosition / releasePoint each have
 *   { metric, score }. analyses is an array with one entry per frame.
 *   onFrameSelect(index) expects a number.
 *
 * Pseudo-tests:
 *   PASS: renders exactly 3 score rows (frontArm, headPosition, releasePoint)
 *   PASS: each row shows label, metric value, and correct good/warn/bad badge
 *   PASS: badge is green >=67, amber 34-66, red <34 based on row score
 *   PASS: issues section only renders when analysis.issues.length > 0
 *   PASS: timeline renders one dot per entry in analyses
 *   PASS: current frame dot is white; others are green/amber/red
 *   PASS: clicking any dot calls onFrameSelect with that dot's index
 */

function dotColor(score, isCurrent) {
  if (isCurrent) return '#ffffff'
  if (score >= 67) return '#22c55e'
  if (score >= 34) return '#f59e0b'
  return '#ef4444'
}

function badge(score) {
  if (score >= 67) return { label: 'Good', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' }
  if (score >= 34) return { label: 'Warn', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' }
  return { label: 'Bad', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
}

const sectionLabel = {
  fontSize: '11px',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '8px',
  fontWeight: 600,
}

export default function AnalysisPanel({ analysis, analyses, currentFrame, onFrameSelect }) {
  const rows = [
    { label: 'Front arm',     ...analysis.frontArm },
    { label: 'Head position', ...analysis.headPosition },
    { label: 'Release point', ...analysis.releasePoint },
  ]

  return (
    <div style={{ background: '#111114', color: '#e5e7eb', padding: '16px', fontFamily: 'system-ui, sans-serif' }}>

      {/* Score rows */}
      <div style={{ marginBottom: '20px' }}>
        {rows.map(({ label, metric, score }) => {
          const b = badge(score)
          return (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 0',
                borderBottom: '1px solid #1f2937',
              }}
            >
              <span style={{ color: '#9ca3af', fontSize: '13px', flex: '0 0 110px' }}>{label}</span>
              <span style={{ color: '#f3f4f6', fontSize: '13px', fontFamily: 'monospace', flex: 1 }}>
                {metric}
              </span>
              <span style={{
                background: b.bg,
                color: b.color,
                border: `1px solid ${b.color}44`,
                borderRadius: '5px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                flexShrink: 0,
              }}>
                {b.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Issues */}
      {analysis.issues.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <p style={sectionLabel}>Issues</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {analysis.issues.map((issue, i) => (
              <li key={i} style={{ fontSize: '13px', color: '#fca5a5', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }}>•</span>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Frame timeline */}
      <div>
        <p style={sectionLabel}>Timeline</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {analyses.map((a, i) => (
            <button
              key={i}
              onClick={() => onFrameSelect(i)}
              aria-label={`Frame ${i + 1}`}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                background: dotColor(a.overallScore, i === currentFrame),
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                outline: i === currentFrame ? '2px solid #7c3aed' : 'none',
                outlineOffset: '1px',
                transition: 'background 0.15s',
              }}
            />
          ))}
        </div>
      </div>

    </div>
  )
}
