import { useEffect, useRef } from 'react'

export function useCursorTrail(containerRef) {
  const lastEmit = useRef(0)

  useEffect(() => {
    if ('ontouchstart' in window) return
    const container = containerRef.current
    if (!container) return

    const onMove = (e) => {
      const now = Date.now()
      if (now - lastEmit.current < 40) return
      lastEmit.current = now

      const particle = document.createElement('div')
      const size = Math.random() * 4 + 2
      const opacity = Math.random() * 0.4 + 0.1
      const drift = (Math.random() - 0.5) * 24
      const rise = Math.random() * 20 + 10

      particle.setAttribute('aria-hidden', 'true')
      particle.style.cssText = `
        position: fixed;
        left: ${e.clientX - size / 2}px;
        top: ${e.clientY - size / 2}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(212, 168, 71, ${opacity});
        pointer-events: none;
        z-index: 2;
        transform: translate(0, 0);
        transition:
          transform 600ms ease-out,
          opacity 600ms ease-out;
      `

      document.body.appendChild(particle)

      // Double-RAF: ensures initial position is painted before transition fires
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          particle.style.transform = `translate(${drift}px, -${rise}px)`
          particle.style.opacity = '0'
        })
      })

      setTimeout(() => {
        if (particle.parentNode) particle.parentNode.removeChild(particle)
      }, 650)
    }

    container.addEventListener('mousemove', onMove)
    return () => {
      container.removeEventListener('mousemove', onMove)
    }
  }, [containerRef])
}
