export default function LoadingDots({ size = 7, color = 'var(--accent-gold)' }) {
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="dot"
          style={{ width: size, height: size, background: color }}
        />
      ))}
    </div>
  )
}
