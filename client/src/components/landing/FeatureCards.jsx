import { motion } from 'framer-motion'
import { useState } from 'react'

const features = [
  {
    title: 'Context-Aware',
    body: 'Definitions that understand the paper, not just the word. The same term means different things in biology vs. finance — ContextLens knows the difference.',
    accent: 'var(--accent-gold)',
    dot: '#d4a847',
    dotGlow: 'rgba(212,168,71,0.4)',
    cssVar: '#d4a847',
  },
  {
    title: 'Multi-Model',
    body: 'Powered by Claude, Gemini, OpenAI or OpenRouter. Choose your preferred AI or switch on the fly — always the sharpest answer for your use case.',
    accent: 'var(--accent-ember)',
    dot: '#c4622d',
    dotGlow: 'rgba(196,98,45,0.4)',
    cssVar: '#c4622d',
  },
  {
    title: 'Zero Friction',
    body: 'No signup. No extensions to install. Paste your PDF, start reading. Everything happens in the browser — fast, private, immediate.',
    accent: '#5b9e7e',
    dot: '#5b9e7e',
    dotGlow: 'rgba(91,158,126,0.4)',
    cssVar: '#5b9e7e',
  },
]

function FeatureCard({ title, body, accent, dot, dotGlow, cssVar, index }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        borderTop: `3px solid ${hovered ? cssVar : 'rgba(42,39,32,0.9)'}`,
        padding: '28px 26px 30px',
        flex: '1 1 280px',
        minWidth: '240px',
        transition: 'border-top-color var(--transition-base), box-shadow var(--transition-base)',
        boxShadow: hovered ? `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${cssVar}18` : 'none',
        cursor: 'default',
      }}
    >
      {/* Accent dot */}
      <div
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: dot,
          marginBottom: '22px',
          boxShadow: hovered ? `0 0 14px ${dotGlow}` : 'none',
          transition: 'box-shadow var(--transition-base)',
        }}
      />

      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '21px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '14px',
          lineHeight: 1.2,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          lineHeight: 1.8,
          fontWeight: 300,
        }}
      >
        {body}
      </p>
    </motion.div>
  )
}

export default function FeatureCards() {
  return (
    <section
      style={{
        padding: 'clamp(40px, 8vw, 80px) clamp(20px, 5vw, 80px) clamp(80px, 10vw, 140px)',
        maxWidth: '1160px',
        margin: '0 auto',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: '60px' }}
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
          Built for deep reading
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            color: 'var(--text-tertiary)',
            letterSpacing: '0.02em',
          }}
        >
          Every decision optimised for the moment of understanding.
        </p>
      </motion.div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {features.map((f, i) => (
          <FeatureCard key={i} {...f} index={i} />
        ))}
      </div>
    </section>
  )
}
