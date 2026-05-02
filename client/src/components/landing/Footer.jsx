const socialLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com/vineet-channe',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/vineetchanne',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
]

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '28px clamp(20px, 5vw, 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <style>{`
        @keyframes footerPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.3); }
        }
        @keyframes socialSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .footer-social-link {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px solid transparent;
          text-decoration: none;
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: var(--text-tertiary);
          background: transparent;
          transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
          animation: socialSlideIn 0.4s ease both;
        }
        .footer-social-link:hover {
          color: var(--text-primary);
          border-color: var(--accent-gold-muted);
          background: rgba(255,255,255,0.04);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
        }
        .footer-social-link:nth-child(2) { animation-delay: 0.08s; }
        .footer-heart {
          display: inline-block;
          animation: footerPulse 1.8s ease-in-out infinite;
          color: var(--accent-ember);
          font-size: 13px;
        }
      `}</style>

      {/* Wordmark */}
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '15px',
          fontWeight: 700,
          color: 'var(--text-tertiary)',
          letterSpacing: '-0.01em',
          userSelect: 'none',
        }}
      >
        Context<span style={{ color: 'var(--accent-gold-muted)' }}>Lens</span>
      </div>

      {/* Center credits */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          textAlign: 'center',
          letterSpacing: '0.02em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          flex: '1 1 auto',
          minWidth: '200px',
        }}
      >
        Made with <span className="footer-heart">♥</span> by Vineet
      </div>

      {/* Social links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {socialLinks.map(({ label, href, icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="footer-social-link"
          >
            {icon}
            {label}
          </a>
        ))}
      </div>
    </footer>
  )
}
