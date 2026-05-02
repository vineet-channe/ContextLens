import { useEffect, useRef } from 'react'

export function useMouseGlow(containerRef) {
  const posRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef(null)

  useEffect(() => {
    if ('ontouchstart' in window) return
    const el = containerRef.current
    if (!el) return

    const overlay = document.createElement('div')
    overlay.setAttribute('aria-hidden', 'true')
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 1;
      transition: opacity 600ms ease;
      opacity: 0;
    `
    el.appendChild(overlay)

    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY }
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        const { x, y } = posRef.current
        overlay.style.background = `
          radial-gradient(600px circle at ${x}px ${y}px,
            rgba(212, 168, 71, 0.06) 0%,
            rgba(212, 168, 71, 0.03) 30%,
            transparent 70%
          ),
          radial-gradient(200px circle at ${x}px ${y}px,
            rgba(212, 168, 71, 0.09) 0%,
            rgba(196, 98, 45, 0.04) 40%,
            transparent 70%
          ),
          radial-gradient(80px circle at ${x}px ${y}px,
            rgba(240, 208, 128, 0.12) 0%,
            transparent 60%
          )
        `
        overlay.style.opacity = '1'
        rafRef.current = null
      })
    }

    const onLeave = () => { overlay.style.opacity = '0' }
    const onEnter = () => { overlay.style.opacity = '1' }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    el.addEventListener('mouseenter', onEnter)

    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      el.removeEventListener('mouseenter', onEnter)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
    }
  }, [containerRef])
}
