import { useState, useEffect } from 'react'
import { useTransition } from '../../context/TransitionContext'
import { useAuth } from '../../context/AuthContext'

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const { navigateTo } = useTransition()
  const { user, isAuthenticated, login, logout, loading } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(24px, 5vw, 64px)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        background: 'rgba(14,13,11,0.82)',
        borderBottom: scrolled
          ? '1px solid rgba(212,168,71,0.18)'
          : '1px solid transparent',
        transition: 'border-bottom-color var(--transition-slow)',
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '21px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          cursor: 'default',
          userSelect: 'none',
        }}
      >
        Context<span style={{ color: 'var(--accent-gold)' }}>Lens</span>
      </div>

      {/* Right: auth + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {!loading && (
          isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {user?.avatar && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border-default)' }}
                />
              )}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                {user?.name?.split(' ')[0]}
              </span>
              <button
                onClick={logout}
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
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 500,
                padding: '7px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'border-color var(--transition-fast), color var(--transition-fast)',
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
              Sign in
            </button>
          )
        )}

        {/* CTA */}
      <button
        onClick={() => navigateTo('reader')}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          fontWeight: 500,
          padding: '8px 22px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--accent-gold)',
          background: 'transparent',
          color: 'var(--accent-gold)',
          cursor: 'pointer',
          transition: 'background var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast)',
          letterSpacing: '0.04em',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--accent-gold)'
          e.currentTarget.style.color = 'var(--bg-base)'
          e.currentTarget.style.boxShadow = '0 0 16px rgba(212,168,71,0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--accent-gold)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        Get Started
      </button>      </div>    </nav>
  )
}
