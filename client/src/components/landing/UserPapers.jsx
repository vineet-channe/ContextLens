import { useEffect, useState } from 'react'
import { usePaperHistory } from '../../hooks/usePaperHistory'
import { useAuth } from '../../context/AuthContext'
import { useTransition } from '../../context/TransitionContext'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function UserPapers() {
  const { isAuthenticated } = useAuth()
  const { fetchAllSessions } = usePaperHistory()
  const { navigateTo } = useTransition()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    fetchAllSessions().then((s) => {
      setSessions(s)
      setLoading(false)
    })
  }, [isAuthenticated, fetchAllSessions])

  if (!isAuthenticated || (sessions.length === 0 && !loading)) return null

  return (
    <section
      style={{
        padding: 'clamp(48px, 8vw, 96px) clamp(24px, 5vw, 64px)',
        borderTop: '1px solid var(--border-subtle)',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(22px, 3vw, 30px)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '8px',
          letterSpacing: '-0.02em',
        }}
      >
        Your Papers
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          marginBottom: '32px',
        }}
      >
        Continue where you left off.
      </p>

      {loading ? (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-tertiary)' }}>
          Loading…
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {sessions.map((session) => (
            <button
              key={session._id}
              onClick={() => navigateTo('reader', { sessionId: session._id, documentTitle: session.documentTitle })}
              style={{
                textAlign: 'left',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 22px',
                cursor: 'pointer',
                transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-gold-muted)'
                e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent-gold-muted)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Title */}
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '10px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.4',
                }}
              >
                {session.documentTitle}
              </p>

              {/* Meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  {formatDate(session.updatedAt)}
                </span>
                {session.lookupCount > 0 && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--accent-gold)',
                      background: 'rgba(212,168,71,0.1)',
                      border: '1px solid rgba(212,168,71,0.2)',
                      borderRadius: '4px',
                      padding: '2px 7px',
                    }}
                  >
                    {session.lookupCount} {session.lookupCount === 1 ? 'lookup' : 'lookups'}
                  </span>
                )}
              </div>

              {/* CTA arrow */}
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--accent-gold)',
                  marginTop: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Continue reading <span style={{ fontSize: '14px' }}>→</span>
              </p>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
