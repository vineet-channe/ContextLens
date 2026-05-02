import { useEffect } from 'react'

export function useMagneticText(selector, containerRef) {
  useEffect(() => {
    if ('ontouchstart' in window) return
    const container = containerRef.current
    if (!container) return

    const elements = container.querySelectorAll(selector)

    const onMove = (e) => {
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const dx = e.clientX - centerX
        const dy = e.clientY - centerY
        const dist = Math.sqrt(dx * dx + dy * dy)
        const maxDist = 280

        if (dist < maxDist) {
          const strength = (1 - dist / maxDist) * 5
          const moveX = (dx / dist) * strength
          const moveY = (dy / dist) * strength
          el.style.transform = `translate(${moveX}px, ${moveY}px)`
          el.style.transition = 'transform 0.15s ease-out'
        } else {
          el.style.transform = 'translate(0, 0)'
          el.style.transition = 'transform 0.4s ease-out'
        }
      })
    }

    const onLeave = () => {
      elements.forEach((el) => {
        el.style.transform = 'translate(0, 0)'
        el.style.transition = 'transform 0.6s ease-out'
      })
    }

    container.addEventListener('mousemove', onMove)
    container.addEventListener('mouseleave', onLeave)

    return () => {
      container.removeEventListener('mousemove', onMove)
      container.removeEventListener('mouseleave', onLeave)
      elements.forEach((el) => {
        el.style.transform = ''
        el.style.transition = ''
      })
    }
  }, [selector, containerRef])
}
