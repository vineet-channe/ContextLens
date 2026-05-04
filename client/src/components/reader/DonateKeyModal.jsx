import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDonatedKeys } from '../../hooks/useDonatedKeys'

const PROVIDER_META = {
  claude:     { label: 'Claude (Anthropic)',  placeholder: 'sk-ant-api03-...' },
  gemini:     { label: 'Gemini (Google)',      placeholder: 'AIzaSy...' },
  openai:     { label: 'OpenAI',               placeholder: 'sk-proj-...' },
  openrouter: { label: 'OpenRouter',           placeholder: 'sk-or-v1-...' },
}

const STATUS_COLOR = {
  active:       'var(--accent-gold)',
  cooling_down: '#c4622d',
  exhausted:    'var(--text-tertiary)',
  revoked:      'var(--text-tertiary)',
}

export default function DonateKeyModal({ onClose }) {
  const [tab, setTab] = useState('donate') // 'donate' | 'my'
  const [provider, setProvider] = useState('claude')
  const [apiKey, setApiKey] = useState('')
  const [cap, setCap] = useState('')
  const [visible, setVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [revokeError, setRevokeError] = useState(null)

  const { donations, loading, error, fetchMyDonations, donateKey, revokeKey } = useDonatedKeys()

  useEffect(() => {
    if (tab === 'my') fetchMyDonations()
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleDonate() {
    setSubmitError(null)
    setSubmitSuccess(false)
    if (!apiKey.trim()) { setSubmitError('API key is required'); return }
    setSubmitting(true)
    try {
      await donateKey({
        provider,
        apiKey: apiKey.trim(),
      })
      setSubmitSuccess(true)
      setApiKey('')
    } catch (err) {
      setSubmitError(err.message ?? 'Failed to donate key')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRevoke(id) {
    setRevokeError(null)
    try {
      await revokeKey(id)
    } catch (err) {
      setRevokeError(err.message ?? 'Failed to revoke key')
    }
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 400,
          backdropFilter: 'blur(2px)',
        }}
      />

      <div
        key="modal-wrapper"
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 401,
          width: '400px',
          maxWidth: 'calc(100vw - 32px)',
        }}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Donate API Key
            </span>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '2px', lineHeight: 1, fontSize: '18px' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
            >×</button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '3px' }}>
            {[['donate', 'Donate a key'], ['my', 'My donations']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  flex: 1,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: tab === key ? 500 : 400,
                  color: tab === key ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  background: tab === key ? 'var(--bg-elevated)' : 'transparent',
                  border: tab === key ? '1px solid var(--border-default)' : '1px solid transparent',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  transition: 'color var(--transition-fast), background var(--transition-fast)',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Donate tab ── */}
          {tab === 'donate' && (
            <div>
              {/* Provider select */}
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                Provider
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  marginBottom: '14px',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  transition: 'border-color var(--transition-fast)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent-gold-muted)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
              >
                {Object.entries(PROVIDER_META).map(([val, meta]) => (
                  <option key={val} value={val}>{meta.label}</option>
                ))}
              </select>

              {/* API Key input */}
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                API key
              </label>
              <div style={{ position: 'relative', marginBottom: '14px' }}>
                <input
                  type={visible ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleDonate() }}
                  placeholder={PROVIDER_META[provider].placeholder}
                  spellCheck={false}
                  autoComplete="off"
                  style={{
                    width: '100%',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    padding: '9px 36px 9px 12px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color var(--transition-fast)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent-gold-muted)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
                />
                <button
                  onClick={() => setVisible((v) => !v)}
                  aria-label={visible ? 'Hide key' : 'Show key'}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '2px', lineHeight: 1 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                >
                  {visible ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Note */}
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)', margin: '12px 0 16px', lineHeight: 1.5 }}>
                Your key is encrypted at rest and never exposed to other users. It is used as a fallback when the server quota runs out.
              </p>

              {/* Errors / success */}
              {submitError && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#c4622d', marginBottom: '12px' }}>{submitError}</p>
              )}
              {submitSuccess && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-gold)', marginBottom: '12px' }}>
                  Key donated — thank you!
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleDonate}
                  disabled={submitting}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: apiKey.trim() ? 'var(--bg-base)' : 'var(--text-tertiary)',
                    background: apiKey.trim() ? 'var(--accent-gold)' : 'var(--bg-surface)',
                    border: '1px solid',
                    borderColor: apiKey.trim() ? 'var(--accent-gold)' : 'var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    padding: '7px 18px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.6 : 1,
                    transition: 'background var(--transition-fast), color var(--transition-fast)',
                  }}
                >
                  {submitting ? 'Donating…' : 'Donate key'}
                </button>
              </div>
            </div>
          )}

          {/* ── My donations tab ── */}
          {tab === 'my' && (
            <div>
              {loading && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px 0' }}>
                  Loading…
                </p>
              )}
              {error && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#c4622d', marginBottom: '10px' }}>{error}</p>
              )}
              {revokeError && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#c4622d', marginBottom: '10px' }}>{revokeError}</p>
              )}
              {!loading && donations.length === 0 && !error && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '24px 0' }}>
                  No donations yet.
                </p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {donations.map((d) => (
                  <div
                    key={d._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)' }}>
                          {PROVIDER_META[d.provider]?.label ?? d.provider}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          color: STATUS_COLOR[d.status] ?? 'var(--text-tertiary)',
                          background: 'rgba(0,0,0,0.2)',
                          border: `1px solid ${STATUS_COLOR[d.status] ?? 'var(--border-default)'}`,
                          borderRadius: '4px',
                          padding: '1px 6px',
                          opacity: 0.85,
                        }}>
                          {d.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-tertiary)' }}>
                        {d.usageCount ?? 0} uses
                        {' · '}
                        {d.successCount ?? 0} success
                        {' · '}
                        {d.failCount ?? 0} fail
                      </div>
                    </div>

                    {d.status !== 'revoked' && (
                      <button
                        onClick={() => handleRevoke(d._id)}
                        title="Revoke this donation"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: 'var(--text-tertiary)',
                          background: 'none',
                          border: '1px solid var(--border-default)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '4px 10px',
                          cursor: 'pointer',
                          flexShrink: 0,
                          transition: 'color var(--transition-fast), border-color var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#c4622d'
                          e.currentTarget.style.borderColor = '#c4622d'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-tertiary)'
                          e.currentTarget.style.borderColor = 'var(--border-default)'
                        }}
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
