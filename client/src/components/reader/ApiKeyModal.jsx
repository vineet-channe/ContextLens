import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PROVIDER_META = {
  claude: {
    label: 'Claude (Anthropic)',
    placeholder: 'sk-ant-api03-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    docsLabel: 'console.anthropic.com',
  },
  gemini: {
    label: 'Gemini (Google)',
    placeholder: 'AIzaSy...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    docsLabel: 'aistudio.google.com',
  },
  openai: {
    label: 'OpenAI',
    placeholder: 'sk-proj-...',
    docsUrl: 'https://platform.openai.com/api-keys',
    docsLabel: 'platform.openai.com',
  },
  openrouter: {
    label: 'OpenRouter',
    placeholder: 'sk-or-v1-...',
    docsUrl: 'https://openrouter.ai/settings/keys',
    docsLabel: 'openrouter.ai',
  },
}

export default function ApiKeyModal({ provider, currentKey, onSave, onClose }) {
  const meta = PROVIDER_META[provider] ?? PROVIDER_META.claude
  const [value, setValue] = useState(currentKey ?? '')
  const [visible, setVisible] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  function handleSave() {
    onSave(provider, value.trim())
    onClose()
  }

  function handleClear() {
    onSave(provider, '')
    onClose()
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
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 400,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Modal — outer div handles centering, inner motion.div handles animation */}
      <div
        key="modal-wrapper"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 401,
          width: '380px',
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {meta.label} Key
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '2px', lineHeight: 1, fontSize: '18px' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            ×
          </button>
        </div>

        {/* Input */}
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <input
            ref={inputRef}
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
            placeholder={meta.placeholder}
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
          {/* Show/hide toggle */}
          <button
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide key' : 'Show key'}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              padding: '2px',
              lineHeight: 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            {visible ? (
              // Eye-off icon
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              // Eye icon
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        {/* Privacy note */}
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '16px', lineHeight: 1.5 }}>
          Stored in your browser. Sent to our server per request to reach the AI provider — never logged or saved.{' '}
          <a
            href={meta.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent-gold-muted)', textDecoration: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--accent-gold-muted)')}
          >
            Get a key →
          </a>
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          {currentKey && (
            <button
              onClick={handleClear}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                background: 'none',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '7px 14px',
                cursor: 'pointer',
                transition: 'color var(--transition-fast), border-color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.borderColor = 'var(--border-muted)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-tertiary)'
                e.currentTarget.style.borderColor = 'var(--border-default)'
              }}
            >
              Clear
            </button>
          )}
          <button
            onClick={handleSave}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: value.trim() ? 'var(--bg-base)' : 'var(--text-tertiary)',
              background: value.trim() ? 'var(--accent-gold)' : 'var(--bg-surface)',
              border: '1px solid',
              borderColor: value.trim() ? 'var(--accent-gold)' : 'var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '7px 16px',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'background var(--transition-fast), color var(--transition-fast)',
            }}
          >
            Save Key
          </button>
        </div>
      </motion.div>
      </div>
    </AnimatePresence>
  )
}
