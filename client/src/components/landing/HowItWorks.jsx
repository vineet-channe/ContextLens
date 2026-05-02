import { motion } from 'framer-motion'

const steps = [
  {
    num: '01',
    label: 'Upload',
    tagline: 'Drop in your PDF',
    desc: 'Drag and drop any research paper, article, or document directly into the reader. Supports any PDF — scanned or text-based.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <polyline points="9 15 12 12 15 15" />
      </svg>
    ),
  },
  {
    num: '02',
    label: 'Highlight',
    tagline: 'Select any text',
    desc: 'Click and drag over any word, phrase, or technical term you want to understand in the context of what you are reading.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="9" />
      </svg>
    ),
  },
  {
    num: '03',
    label: 'Understand',
    tagline: 'Get context-aware meaning',
    desc: 'Receive an AI-powered explanation that reads the paper, understands the field, and explains the term in its proper setting.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  return (
    <section
      style={{
        padding: 'clamp(80px, 10vw, 140px) clamp(20px, 5vw, 80px)',
        maxWidth: '1160px',
        margin: '0 auto',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: '80px' }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '16px',
          }}
        >
          How it works
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            color: 'var(--text-tertiary)',
            letterSpacing: '0.02em',
          }}
        >
          Three steps. Zero friction.
        </p>
      </motion.div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {steps.map((step, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              flex: '1 1 260px',
              minWidth: '220px',
              maxWidth: '340px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: i * 0.13 }}
              style={{
                flex: 1,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px 26px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative large numeral */}
              <div
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '18px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '68px',
                  fontWeight: 700,
                  color: 'var(--accent-gold-muted)',
                  opacity: 0.12,
                  lineHeight: 1,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              >
                {step.num}
              </div>

              {/* Icon */}
              <div
                style={{
                  color: 'var(--accent-gold)',
                  marginBottom: '20px',
                  width: '42px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(212,168,71,0.08)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(212,168,71,0.12)',
                }}
              >
                {step.icon}
              </div>

              {/* Label */}
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 500,
                  color: 'var(--accent-gold)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: '8px',
                }}
              >
                {step.label}
              </div>

              {/* Tagline */}
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: '12px',
                  lineHeight: 1.4,
                }}
              >
                {step.tagline}
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.75,
                  fontWeight: 300,
                }}
              >
                {step.desc}
              </p>
            </motion.div>

            {/* Arrow connector */}
            {i < steps.length - 1 && (
              <div
                style={{
                  color: 'var(--text-tertiary)',
                  fontSize: '18px',
                  padding: '0 10px',
                  marginTop: '58px',
                  flexShrink: 0,
                  userSelect: 'none',
                  opacity: 0.6,
                }}
              >
                →
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
