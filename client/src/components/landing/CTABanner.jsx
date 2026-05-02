import { motion } from 'framer-motion'
import { useTransition } from '../../context/TransitionContext'

export default function CTABanner() {
  const { navigateTo } = useTransition()

  return (
    <section
      style={{
        padding: 'clamp(80px, 12vw, 140px) clamp(20px, 5vw, 80px)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top separator line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--border-default), transparent)',
        }}
      />

      {/* Radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '400px',
          background:
            'radial-gradient(ellipse at center, rgba(212,168,71,0.07) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '24px',
          }}
        >
          Ready to begin?
        </p>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 5.5vw, 60px)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '48px',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
          }}
        >
          Your next paper awaits.
        </h2>

        <button className="cta-btn" onClick={() => navigateTo('reader')}>
          Start Reading →
        </button>
      </motion.div>
    </section>
  )
}
