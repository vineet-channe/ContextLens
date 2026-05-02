import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingDots from '../shared/LoadingDots'

function EmptyHint() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        textAlign: 'center',
        gap: '16px',
      }}
    >
      {/* Animated highlight illustration */}
      <div style={{ opacity: 0.4 }}>
        <svg
          width="44"
          height="44"
          viewBox="0 0 44 44"
          fill="none"
        >
          {/* Document lines */}
          <rect x="6" y="8" width="32" height="3" rx="1.5" fill="var(--text-tertiary)" />
          {/* Highlighted line */}
          <rect
            x="6"
            y="15"
            width="22"
            height="3"
            rx="1.5"
            fill="var(--highlight-fill)"
            stroke="var(--highlight-border)"
            strokeWidth="0.5"
          />
          <rect x="6" y="22" width="28" height="3" rx="1.5" fill="var(--text-tertiary)" />
          <rect x="6" y="29" width="20" height="3" rx="1.5" fill="var(--text-tertiary)" />
          {/* Cursor */}
          <line
            x1="28"
            y1="12"
            x2="28"
            y2="20"
            stroke="var(--accent-gold)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--text-tertiary)',
          lineHeight: 1.75,
          maxWidth: '200px',
          fontWeight: 300,
        }}
      >
        Highlight any word or phrase
        <br />
        to get a contextual explanation.
      </p>
    </div>
  )
}

export default function DefinitionPanel({ state, history, onSelectHistory, onFollowUp, liveFollowUp }) {
  const { status, highlighted, explanation, followUps, error } = state
  const hasContent = status === 'success'
  const showPanel = hasContent || history.length > 0
  const [followUpInput, setFollowUpInput] = useState('')
  const isFollowUpActive = liveFollowUp !== null

  return (
    <AnimatePresence mode="wait">
      {!showPanel ? (
        <EmptyHint key="empty" />
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Chat section — shown when a history item is selected */}
          {hasContent && (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                minHeight: 0,
              }}
            >
              {/* Scrollable conversation thread */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '20px 20px 8px',
                }}
              >
                {/* Term + badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    marginBottom: '14px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '17px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      lineHeight: 1.2,
                    }}
                  >
                    {highlighted}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: 'var(--accent-gold)',
                      background: 'rgba(212,168,71,0.1)',
                      border: '1px solid rgba(212,168,71,0.2)',
                      padding: '2px 8px',
                      borderRadius: '99px',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                      marginTop: '2px',
                    }}
                  >
                    In context
                  </span>
                </div>

                {/* Initial explanation */}
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.8,
                    margin: 0,
                    fontWeight: 300,
                  }}
                >
                  {explanation}
                </p>

                {/* Completed follow-ups */}
                {followUps && followUps.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      marginTop: '18px',
                    }}
                  >
                    {followUps.map((fu, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            color: 'var(--accent-gold)',
                            background: 'rgba(212,168,71,0.07)',
                            border: '1px solid rgba(212,168,71,0.18)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '5px 10px',
                            lineHeight: 1.6,
                          }}
                        >
                          {fu.question}
                        </div>
                        <p
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.8,
                            margin: 0,
                            fontWeight: 300,
                            paddingLeft: '4px',
                          }}
                        >
                          {fu.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* In-progress follow-up (loading / streaming) */}
                {liveFollowUp && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      marginTop: '18px',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'var(--accent-gold)',
                        background: 'rgba(212,168,71,0.07)',
                        border: '1px solid rgba(212,168,71,0.18)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '5px 10px',
                        lineHeight: 1.6,
                      }}
                    >
                      {liveFollowUp.question}
                    </div>
                    {liveFollowUp.status === 'loading' ? (
                      <div style={{ padding: '6px 4px' }}>
                        <LoadingDots />
                      </div>
                    ) : (
                      <p
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.8,
                          margin: 0,
                          fontWeight: 300,
                          paddingLeft: '4px',
                        }}
                      >
                        {liveFollowUp.answer}
                        <span
                          style={{
                            display: 'inline-block',
                            width: '2px',
                            height: '12px',
                            background: 'var(--accent-gold)',
                            marginLeft: '2px',
                            verticalAlign: 'middle',
                            animation: 'cursor-blink 0.9s ease-in-out infinite',
                          }}
                        />
                      </p>
                    )}
                  </div>
                )}

                {/* Error */}
                {status === 'error' && (
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--accent-ember)',
                      margin: '12px 0 0',
                      lineHeight: 1.7,
                    }}
                  >
                    {error}
                  </p>
                )}
              </div>

              {/* Follow-up input — pinned to bottom of chat section */}
              {onFollowUp && (
                <div
                  style={{
                    padding: '8px 16px 12px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    gap: '6px',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <input
                    type="text"
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && followUpInput.trim() && !isFollowUpActive) {
                        onFollowUp(followUpInput.trim())
                        setFollowUpInput('')
                      }
                    }}
                    placeholder="Ask a follow-up…"
                    disabled={isFollowUpActive}
                    style={{
                      flex: 1,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 10px',
                      outline: 'none',
                      opacity: isFollowUpActive ? 0.5 : 1,
                      transition: 'border-color var(--transition-fast)',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(212,168,71,0.5)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
                  />
                  <button
                    disabled={!followUpInput.trim() || isFollowUpActive}
                    onClick={() => {
                      if (!followUpInput.trim() || isFollowUpActive) return
                      onFollowUp(followUpInput.trim())
                      setFollowUpInput('')
                    }}
                    aria-label="Send follow-up"
                    style={{
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background:
                        followUpInput.trim() && !isFollowUpActive
                          ? 'rgba(212,168,71,0.15)'
                          : 'none',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      cursor:
                        followUpInput.trim() && !isFollowUpActive ? 'pointer' : 'default',
                      color:
                        followUpInput.trim() && !isFollowUpActive
                          ? 'var(--accent-gold)'
                          : 'var(--text-tertiary)',
                      flexShrink: 0,
                      transition: 'background var(--transition-fast), color var(--transition-fast)',
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 2L11 13" />
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* History list */}
          {history.length > 0 && (
            <div
              style={{
                overflowY: 'auto',
                padding: '12px 16px',
                borderTop: hasContent ? '1px solid var(--border-subtle)' : 'none',
                ...(hasContent ? { maxHeight: '180px' } : { flex: 1 }),
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--text-tertiary)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Previous lookups
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {history.map((item, i) => (
                  <motion.button
                    key={i}
                    onClick={() => onSelectHistory(item)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      textAlign: 'left',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '7px 10px',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'background var(--transition-fast), color var(--transition-fast)',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-elevated)'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none'
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }}
                  >
                    <span
                      style={{
                        color: 'var(--accent-gold-muted)',
                        fontSize: '10px',
                        flexShrink: 0,
                      }}
                    >
                      ›
                    </span>
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.highlighted}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

