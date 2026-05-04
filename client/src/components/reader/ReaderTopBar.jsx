import ProviderSelector from './ProviderSelector'
import { useTransition } from '../../context/TransitionContext'
import { useAuth } from '../../context/AuthContext'

export default function ReaderTopBar({
  fileName,
  provider,
  setProvider,
  openRouterModel,
  setOpenRouterModel,
  onUploadNew,
  hasKeyForProvider,
  onOpenKeyModal,
  onOpenDonateModal,
}) {
  const { navigateTo } = useTransition()
  const { user, isAuthenticated, login } = useAuth()

  return (
    <header
      style={{
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '12px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexShrink: 0,
      }}
    >
      {/* Wordmark */}
      <button
        onClick={() => navigateTo('landing')}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '17px',
          fontWeight: 700,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          padding: '0 4px 0 0',
          flexShrink: 0,
          transition: 'opacity var(--transition-fast)',
        }}
        aria-label="Back to home"
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        Context<span style={{ color: 'var(--accent-gold)' }}>Lens</span>
      </button>

      {/* Separator */}
      <div
        style={{
          width: '1px',
          height: '18px',
          background: 'var(--border-default)',
          flexShrink: 0,
        }}
      />

      {/* Filename */}
      <span
        style={{
          flex: 1,
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
        }}
      >
        {fileName ?? (
          <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
            No document loaded
          </span>
        )}
      </span>

      {/* Right controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
        }}
      >
        <ProviderSelector
          provider={provider}
          setProvider={setProvider}
          openRouterModel={openRouterModel}
          setOpenRouterModel={setOpenRouterModel}
          hasKeyForProvider={hasKeyForProvider}
        />

        {/* Upload new button */}
        <button
          onClick={onUploadNew}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: 'var(--radius-sm)',
            transition: 'color var(--transition-fast)',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
        >
          Upload new
        </button>

        {/* BYOK key button */}
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

        {/* Donate key button — visible only when signed in */}
        {isAuthenticated && (
          <button
            onClick={onOpenDonateModal}
            aria-label="Donate an API key"
            title="Donate an API key to the shared pool"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              flexShrink: 0,
              transition: 'color var(--transition-fast), border-color var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-gold-muted)'
              e.currentTarget.style.color = 'var(--accent-gold)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)'
              e.currentTarget.style.color = 'var(--text-tertiary)'
            }}
          >
            {/* Gift / donate icon */}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 12 20 22 4 22 4 12" />
              <rect x="2" y="7" width="20" height="5" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
          </button>
        )}

        {/* User avatar / sign-in */}
        {isAuthenticated ? (
          user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              referrerPolicy="no-referrer"
              title={user.name}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                border: '1px solid var(--border-default)',
                flexShrink: 0,
              }}
            />
          ) : null
        ) : (
          <button
            onClick={login}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-tertiary)',
              background: 'none',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              padding: '4px 10px',
              transition: 'color var(--transition-fast), border-color var(--transition-fast)',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.borderColor = 'var(--accent-gold-muted)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)'
              e.currentTarget.style.borderColor = 'var(--border-default)'
            }}
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  )
}
