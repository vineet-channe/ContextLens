import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingDots from '../shared/LoadingDots'

const POPUP_WIDTH = 360
const POPUP_OFFSET = 14

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    setIsMobile(mq.matches)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

export default function DefinitionPopup({
  anchor,
  highlighted,
  status,
  explanation,
  error,
  onClose,
}) {
  const popupRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const [position, setPosition] = useState(null) // null = anchor-based
  const isDragging = useRef(false)
  const dragStart = useRef(null)
  const isMobile = useIsMobile()

  // Reset drag position on new selection
  useEffect(() => {
    setPosition(null)
  }, [anchor])

  // --- Dragging ---
  const handleHeaderMouseDown = useCallback((e) => {
    if (e.target.closest('button')) return
    e.preventDefault()
    const rect = popupRef.current.getBoundingClientRect()
    isDragging.current = true
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      popupTop: rect.top,
      popupLeft: rect.left,
    }
  }, [])

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging.current || !dragStart.current) return
      const dx = e.clientX - dragStart.current.mouseX
      const dy = e.clientY - dragStart.current.mouseY
      const newTop = Math.max(
        0,
        Math.min(dragStart.current.popupTop + dy, window.innerHeight - 80),
      )
      const newLeft = Math.max(
        0,
        Math.min(dragStart.current.popupLeft + dx, window.innerWidth - POPUP_WIDTH - 8),
      )
      setPosition({ top: newTop, left: newLeft })
    }
    const onMouseUp = () => {
      isDragging.current = false
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp, true)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp, true)
    }
  }, [])

  // --- Dismiss ---
  useEffect(() => {
    const onClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose()
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  // --- Copy ---
  const handleCopy = useCallback(() => {
    if (!explanation) return
    navigator.clipboard.writeText(explanation).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }, [explanation])

  // --- Position calculation ---
  const showAbove = anchor.viewportBottom > anchor.viewportHeight * 0.62
  const rawLeft =
    anchor.left + (anchor.right - anchor.left) / 2 - POPUP_WIDTH / 2
  const clampedLeft = Math.max(8, Math.min(rawLeft, window.innerWidth - POPUP_WIDTH - 8))
  const anchoredTop = showAbove
    ? anchor.top - POPUP_OFFSET
    : anchor.bottom + POPUP_OFFSET

  const desktopStyle = position
    ? { top: position.top, left: position.left }
    : {
        top: anchoredTop,
        left: clampedLeft,
        transformOrigin: showAbove ? 'bottom center' : 'top center',
      }

  const popupContent = (
    <div
      ref={popupRef}
      onMouseUp={(e) => e.stopPropagation()}
      style={{
        width: isMobile ? '100%' : POPUP_WIDTH,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: isMobile ? '20px 20px 0 0' : 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: isMobile
          ? '0 -8px 40px rgba(0,0,0,0.6)'
          : '0 20px 56px rgba(0,0,0,0.65), 0 0 0 1px var(--border-subtle)',
      }}
      role="dialog"
      aria-label={`Definition of "${highlighted}"`}
    >
      {/* Drag handle (mobile) */}
      {isMobile && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '10px 0 4px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '4px',
              borderRadius: '2px',
              background: 'var(--border-default)',
            }}
          />
        </div>
      )}

      {/* Header */}
      <div
        onMouseDown={!isMobile ? handleHeaderMouseDown : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px 10px',
          borderBottom: '1px solid var(--border-subtle)',
          cursor: isMobile ? 'default' : 'grab',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            minWidth: 0,
            flex: 1,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {highlighted}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--accent-gold)',
              background: 'rgba(212,168,71,0.1)',
              border: '1px solid rgba(212,168,71,0.2)',
              padding: '2px 8px',
              borderRadius: '99px',
              flexShrink: 0,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}
          >
            In context
          </span>
        </div>

        <button
          onClick={onClose}
          aria-label="Close definition"
          style={{
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-tertiary)',
            borderRadius: 'var(--radius-sm)',
            flexShrink: 0,
            marginLeft: '8px',
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M1 1L12 12M1 12L12 1" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div
        style={{
          padding: '14px 14px 12px',
          minHeight: '80px',
          maxHeight: isMobile ? '50vh' : '260px',
          overflowY: 'auto',
        }}
      >
        {status === 'loading' && (
          <div style={{ paddingTop: '18px', paddingBottom: '10px' }}>
            <LoadingDots />
          </div>
        )}

        {(status === 'streaming' || status === 'success') && (
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.8,
              margin: 0,
              fontWeight: 300,
            }}
          >
            {explanation}
            {status === 'streaming' && (
              <span
                style={{
                  display: 'inline-block',
                  width: '2px',
                  height: '13px',
                  background: 'var(--accent-gold)',
                  marginLeft: '2px',
                  verticalAlign: 'middle',
                  animation: 'cursor-blink 0.9s ease-in-out infinite',
                }}
              />
            )}
          </p>
        )}

        {status === 'error' && (
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--accent-ember)',
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            {error ?? 'Something went wrong. Please try again.'}
          </p>
        )}

      </div>

      {/* Footer actions */}
      {(status === 'success' || status === 'streaming') && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '8px 12px 12px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={handleCopy}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: copied ? 'var(--accent-gold)' : 'var(--text-tertiary)',
              background: 'none',
              border: `1px solid ${copied ? 'rgba(212,168,71,0.3)' : 'var(--border-default)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '4px 12px',
              cursor: 'pointer',
              transition: 'color var(--transition-fast), border-color var(--transition-fast)',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={(e) => {
              if (!copied) {
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.borderColor = 'var(--accent-gold-muted)'
              }
            }}
            onMouseLeave={(e) => {
              if (!copied) {
                e.currentTarget.style.color = 'var(--text-tertiary)'
                e.currentTarget.style.borderColor = 'var(--border-default)'
              }
            }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  )

  // Mobile: bottom sheet with backdrop
  if (isMobile) {
    return (
      <>
        <motion.div
          className="bottom-sheet-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        />
        <motion.div
          className="bottom-sheet"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 350 }}
        >
          {popupContent}
        </motion.div>
      </>
    )
  }

  // Desktop: floating popup near selection
  return (
    <motion.div
      style={{
        position: 'fixed',
        zIndex: 1000,
        ...desktopStyle,
      }}
      initial={{ opacity: 0, scale: 0.92, y: showAbove ? -8 : 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: showAbove ? -4 : 4 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {popupContent}
    </motion.div>
  )
}
