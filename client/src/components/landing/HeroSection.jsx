import { motion } from 'framer-motion'
import { useTransition } from '../../context/TransitionContext'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
}

export default function HeroSection() {
  const { navigateTo } = useTransition()

  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '100px clamp(20px, 5vw, 64px) 80px',
      }}
    >
      {/* Radial glow behind headline */}
      <div
        style={{
          position: 'absolute',
          top: '42%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '720px',
          height: '480px',
          background:
            'radial-gradient(ellipse at center, rgba(212,168,71,0.08) 0%, rgba(196,98,45,0.03) 40%, transparent 65%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Subtle grid */}
      <div className="hero-grid" />

      {/* Grain texture */}
      <div className="noise-overlay" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          textAlign: 'center',
          maxWidth: '900px',
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Eyebrow label */}
        <motion.div variants={itemVariants}>
          <span
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--accent-gold)',
              background: 'rgba(212,168,71,0.1)',
              border: '1px solid rgba(212,168,71,0.2)',
              borderRadius: '99px',
              padding: '4px 14px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '36px',
            }}
          >
            AI-Powered Reading Companion
          </span>
        </motion.div>

        {/* Line 1 */}
        <motion.div variants={itemVariants}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(46px, 9vw, 92px)',
              lineHeight: 1.02,
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontStyle: 'italic',
              letterSpacing: '-0.01em',
            }}
          >
            <span className="magnetic-word" style={{ display: 'inline-block' }}>
              Read anything.
            </span>
          </h1>
        </motion.div>

        {/* Line 2 — gold, with animated underline */}
        <motion.div variants={itemVariants}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(46px, 9vw, 92px)',
              lineHeight: 1.02,
              fontWeight: 700,
              fontStyle: 'italic',
              letterSpacing: '-0.01em',
              marginBottom: '52px',
              position: 'relative',
              display: 'block',
            }}
          >
            <span
              className="magnetic-word"
              style={{
                display: 'inline-block',
                color: 'var(--accent-gold)',
                position: 'relative',
              }}
            >
              Understand everything.
              <span className="underline-draw" />
            </span>
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(13px, 1.8vw, 17px)',
            color: 'var(--text-secondary)',
            lineHeight: 1.8,
            maxWidth: '540px',
            margin: '0 auto 56px',
            fontWeight: 300,
          }}
        >
          Upload any paper or article. Highlight a word or phrase.
          <br />
          Get an instant explanation rooted in the document&apos;s own context —
          <br />
          not a dictionary, but a lens.
        </motion.p>

        {/* CTA */}
        <motion.div variants={itemVariants}>
          <button
            className="cta-btn magnetic-word"
            style={{ display: 'inline-flex' }}
            onClick={() => navigateTo('reader')}
          >
            Start Reading →
          </button>
        </motion.div>

        {/* Fine print */}
        <motion.p
          variants={itemVariants}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            marginTop: '28px',
            letterSpacing: '0.04em',
          }}
        >
          Works with research papers, legal documents, medical literature, and more.
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: '44px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.7 }}
      >
        <div className="scroll-indicator" />
      </motion.div>
    </section>
  )
}
