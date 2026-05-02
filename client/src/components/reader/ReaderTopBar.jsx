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
          onOpenKeyModal={onOpenKeyModal}
        />

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
