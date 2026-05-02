import { useCallback, useState } from 'react'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PDFUploadZone({ onUpload, sessions = [], onResumeSession }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  const handleFile = useCallback(
    (file) => {
      setError('')
      if (!file) return
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file.')
        return
      }
      onUpload(file)
    },
    [onUpload],
  )

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(false)
      handleFile(e.dataTransfer.files[0])
    },
    [handleFile],
  )

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragging(false), [])

  const handleInputChange = useCallback(
    (e) => handleFile(e.target.files[0]),
    [handleFile],
  )

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        background: 'var(--bg-base)',
      }}
    >
      <label
        htmlFor="pdf-upload-input"
        className={isDragging ? 'upload-zone dragging' : 'upload-zone'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          width: '100%',
          maxWidth: '440px',
          minHeight: '300px',
          border: `2px dashed ${isDragging ? 'var(--accent-gold)' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-lg)',
          background: isDragging ? 'var(--highlight-fill)' : 'var(--bg-surface)',
          cursor: 'pointer',
          padding: '48px 32px',
          transition:
            'border-color var(--transition-base), background var(--transition-base)',
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* PDF icon */}
        <div style={{ color: isDragging ? 'var(--accent-gold)' : 'var(--accent-gold-muted)' }}>
          <svg
            width="52"
            height="52"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 600,
              color: isDragging ? 'var(--accent-gold)' : 'var(--text-primary)',
              marginBottom: '10px',
              transition: 'color var(--transition-base)',
            }}
          >
            {isDragging ? 'Release to upload' : 'Drop your PDF here'}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--text-tertiary)',
            }}
          >
            or click to browse
          </div>
        </div>

        {/* Supported formats note */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            letterSpacing: '0.04em',
            textAlign: 'center',
          }}
        >
          PDF files only · Research papers, articles, legal docs
        </div>

        <input
          id="pdf-upload-input"
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
          onChange={handleInputChange}
        />
      </label>

      {error && (
        <p
          style={{
            marginTop: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--accent-ember)',
          }}
        >
          {error}
        </p>
      )}

      {/* Past papers list for signed-in users */}
      {sessions.length > 0 && (
        <div style={{ width: '100%', maxWidth: '440px', marginTop: '40px' }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-tertiary)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            Your papers
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessions.map((session) => (
              <button
                key={session._id}
                onClick={() => onResumeSession?.(session)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-gold-muted)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
              >
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: '3px',
                    }}
                  >
                    {session.documentTitle}
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    {formatDate(session.updatedAt)}
                    {session.lookupCount > 0 && ` · ${session.lookupCount} lookup${session.lookupCount === 1 ? '' : 's'}`}
                  </p>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-gold)', flexShrink: 0 }}>→</span>
              </button>
            ))}
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '10px', textAlign: 'center' }}>
            Select a paper to preload your lookups, then upload the PDF above
          </p>
        </div>
      )}
    </div>
  )
}
