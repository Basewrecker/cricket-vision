/*
 * VideoUpload — full-screen drag-drop / click-to-upload zone for video files.
 * Exports: VideoUpload (default)
 * Assumptions: onFile is always a function; rejecting non-video on MIME type is sufficient.
 *
 * Pseudo-tests:
 *   PASS: dropping a video/mp4 file calls onFile(file)
 *   PASS: clicking the zone opens the file picker; selecting a video calls onFile(file)
 *   PASS: dropping a non-video file does NOT call onFile
 *   PASS: dragging over the zone highlights the border; dragging out removes it
 *   PASS: dragging out of the window (relatedTarget=null) also clears highlight
 */
import { useRef, useState } from 'react'

export default function VideoUpload({ onFile }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handleDragOver(e) {
    e.preventDefault()
    setDragging(true)
  }

  function handleDragLeave(e) {
    if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) {
      setDragging(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) {
      onFile(file)
    }
  }

  function handleChange(e) {
    const file = e.target.files[0]
    if (file) onFile(file)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0d0d0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <div
        style={{
          border: `2px dashed ${dragging ? '#7c3aed' : '#374151'}`,
          borderRadius: '16px',
          padding: '64px 80px',
          textAlign: 'center',
          transition: 'border-color 0.2s, background 0.2s',
          background: dragging ? 'rgba(124,58,237,0.08)' : 'transparent',
          pointerEvents: 'none',
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke={dragging ? '#7c3aed' : '#6b7280'}
          strokeWidth="1.5"
          style={{ margin: '0 auto 20px', display: 'block', transition: 'stroke 0.2s' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <p style={{ color: '#d1d5db', fontSize: '18px', marginBottom: '8px', fontWeight: 500 }}>
          {dragging ? 'Drop video here' : 'Drop a video or click to upload'}
        </p>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          MP4, MOV, AVI, WebM supported
        </p>
      </div>
    </div>
  )
}
