import { useState, useRef, useEffect } from 'react'

const PROVIDERS = [
  { value: 'claude', label: 'Claude' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'openrouter', label: 'OpenRouter' },
]

export default function ProviderSelector({
  provider,
  setProvider,
  openRouterModel,
  setOpenRouterModel,
  hasKeyForProvider,
  onOpenKeyModal,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = PROVIDERS.find((p) => p.value === provider)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* Dropdown trigger */}
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Select AI provider"
          aria-haspopup="listbox"
          aria-expanded={open}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '5px 10px 5px 8px',
            cursor: 'pointer',
            transition:
              'border-color var(--transition-fast), color var(--transition-fast)',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-gold-muted)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-default)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          {/* Live dot */}
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--accent-gold)',
              flexShrink: 0,
              boxShadow: '0 0 6px rgba(212,168,71,0.6)',
            }}
          />
          {current?.label}
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            style={{
              opacity: 0.45,
              transform: open ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform var(--transition-fast)',
            }}
          >
            <path
              d="M2 3.5L5 6.5L8 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>

        {/* Dropdown menu */}
        {open && (
          <div
            role="listbox"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              zIndex: 200,
              minWidth: '150px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
            }}
          >
            {PROVIDERS.map((p) => (
              <button
                key={p.value}
                role="option"
                aria-selected={provider === p.value}
                onClick={() => {
                  setProvider(p.value)
                  setOpen(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '9px 14px',
                  textAlign: 'left',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color:
                    provider === p.value
                      ? 'var(--accent-gold)'
                      : 'var(--text-secondary)',
                  background:
                    provider === p.value
                      ? 'rgba(212,168,71,0.07)'
                      : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (provider !== p.value)
                    e.currentTarget.style.background = 'var(--bg-surface)'
                }}
                onMouseLeave={(e) => {
                  if (provider !== p.value)
                    e.currentTarget.style.background = 'transparent'
                }}
              >
                {provider === p.value && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    style={{ flexShrink: 0 }}
                  >
                    <path
                      d="M2 5L4.2 7.5L8 2.5"
                      stroke="var(--accent-gold)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {provider !== p.value && (
                  <span style={{ width: 10, flexShrink: 0 }} />
                )}
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Key icon button */}
      <button
        onClick={onOpenKeyModal}
        aria-label={hasKeyForProvider ? 'Edit your API key' : 'Add your API key'}
        title={hasKeyForProvider ? 'Using your API key — click to edit' : 'Add your own API key'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          background: hasKeyForProvider ? 'rgba(212,168,71,0.12)' : 'var(--bg-elevated)',
          border: `1px solid ${hasKeyForProvider ? 'var(--accent-gold-muted)' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          color: hasKeyForProvider ? 'var(--accent-gold)' : 'var(--text-tertiary)',
          transition: 'border-color var(--transition-fast), color var(--transition-fast), background var(--transition-fast)',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-gold-muted)'
          e.currentTarget.style.color = 'var(--accent-gold)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = hasKeyForProvider ? 'var(--accent-gold-muted)' : 'var(--border-default)'
          e.currentTarget.style.color = hasKeyForProvider ? 'var(--accent-gold)' : 'var(--text-tertiary)'
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="15" r="4" />
          <path d="M12 11l8-8" />
          <path d="M20 3l1 1" />
          <path d="M17 6l1 1" />
        </svg>
      </button>

      {/* Model input for providers that accept a custom model slug */}
      {(provider === 'openrouter' || provider === 'openai') && (
        <input
          type="text"
          value={openRouterModel}
          onChange={(e) => setOpenRouterModel(e.target.value)}
          placeholder={provider === 'openai' ? 'e.g. gpt-4o' : 'model slug'}
          aria-label={provider === 'openai' ? 'OpenAI model' : 'OpenRouter model'}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-primary)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '5px 10px',
            outline: 'none',
            width: '170px',
            transition: 'border-color var(--transition-fast)',
          }}
          onFocus={(e) =>
            (e.target.style.borderColor = 'var(--accent-gold-muted)')
          }
          onBlur={(e) =>
            (e.target.style.borderColor = 'var(--border-default)')
          }
        />
      )}
    </div>
  )
}
