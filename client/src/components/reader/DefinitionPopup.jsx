import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingDots from '../shared/LoadingDots'

// Renders **bold** markers and \n paragraph breaks in AI response text
function renderInline(text) {
  const segments = []
  const regex = /\*\*(.+?)\*\*/g
  let last = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) segments.push({ type: 'text', value: text.slice(last, match.index) })
    segments.push({ type: 'bold', value: match[1] })
    last = match.index + match[0].length
  }
  if (last < text.length) segments.push({ type: 'text', value: text.slice(last) })
  return segments.map((seg, i) =>
    seg.type === 'bold' ? (
      <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{seg.value}</strong>
    ) : (
      seg.value
    ),
  )
}

function MarkdownText({ text, style }) {
  if (!text) return null
  // Ensure **Heading:** patterns always start on their own line, even if the
  // AI placed them inline with no preceding newline
  const normalized = text
    .replace(/([^\n])\s*(\*\*[A-Z][^*]+:\*\*)/g, '$1\n$2')
    .trim()
  const paragraphs = normalized.split('\n').filter((l) => l.trim().length > 0)
  if (paragraphs.length <= 1) {
    return <p style={style}>{renderInline(normalized)}</p>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {paragraphs.map((para, i) => (
        <p key={i} style={{ ...style, margin: 0 }}>{renderInline(para)}</p>
      ))}
    </div>
  )
}

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
  conversationHistory,
  onFollowUp,
  onClose,
}) {
  const popupRef = useRef(null)
  const bodyRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const [followUpInput, setFollowUpInput] = useState('')
  const [position, setPosition] = useState(null) // null = anchor-based
  const isDragging = useRef(false)
  const dragStart = useRef(null)
  const isMobile = useIsMobile()

  // Reset drag position and follow-up input on new selection
  useEffect(() => {
    setPosition(null)
    setFollowUpInput('')
  }, [anchor])

  // Auto-scroll body to bottom when conversation grows
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [conversationHistory, explanation])

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
    if (!explanation && !conversationHistory?.length) return
    // Build a readable text version of the full conversation
    const lines = (conversationHistory ?? []).map((m) =>
      m.role === 'user' ? `Q: ${m.content}` : m.content,
    )
    // If the latest explanation isn't already the last assistant turn, include it
    const lastAssistant = (conversationHistory ?? []).findLast?.((m) => m.role === 'assistant')
    if (explanation && explanation !== lastAssistant?.content) lines.push(explanation)
    const text = lines.join('\n\n') || explanation
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }, [explanation, conversationHistory])

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

      {/* Body — conversation thread */}
      <div
        ref={bodyRef}
        style={{
          padding: '14px 14px 12px',
          minHeight: '80px',
          maxHeight: isMobile ? '50vh' : '360px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* Initial loading state (no turns yet) */}
        {(conversationHistory ?? []).length === 0 && status === 'loading' && (
          <div style={{ paddingTop: '18px', paddingBottom: '10px' }}>
            <LoadingDots />
          </div>
        )}

        {/* Initial streaming (no completed turns yet) */}
        {(conversationHistory ?? []).length === 0 && status === 'streaming' && (
          <MarkdownText
            text={explanation}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.8,
              margin: 0,
              fontWeight: 300,
            }}
          />
        )}

        {/* Completed conversation turns */}
        {(conversationHistory ?? []).map((turn, i) =>
          turn.role === 'user' ? (
            <div
              key={i}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--accent-gold)',
                background: 'rgba(212,168,71,0.07)',
                border: '1px solid rgba(212,168,71,0.18)',
                borderRadius: 'var(--radius-sm)',
                padding: '5px 10px',
                lineHeight: 1.6,
                alignSelf: 'flex-start',
                maxWidth: '95%',
              }}
            >
              {turn.content}
            </div>
          ) : (
            <MarkdownText
              key={i}
              text={turn.content}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
                margin: 0,
                fontWeight: 300,
              }}
            />
          ),
        )}

        {/* Follow-up in progress: last turn is the user question */}
        {(conversationHistory ?? []).length > 0 &&
          (conversationHistory ?? [])[(conversationHistory ?? []).length - 1].role === 'user' && (
            <>
              {status === 'loading' && (
                <div style={{ paddingTop: '4px', paddingBottom: '4px' }}>
                  <LoadingDots />
                </div>
              )}
              {status === 'streaming' && explanation && (
                <MarkdownText
                  text={explanation}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.8,
                    margin: 0,
                    fontWeight: 300,
                  }}
                />
              )}
            </>
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

      {/* Follow-up input */}
      {onFollowUp && (conversationHistory ?? []).length > 0 && (
        <div
          style={{
            padding: '8px 12px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const text = followUpInput.trim()
              if (!text || status === 'loading' || status === 'streaming') return
              onFollowUp(text)
              setFollowUpInput('')
            }}
            style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
          >
            <input
              type="text"
              value={followUpInput}
              onChange={(e) => setFollowUpInput(e.target.value)}
              placeholder="Ask a follow-up…"
              disabled={status === 'loading' || status === 'streaming'}
              style={{
                flex: 1,
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--text-primary)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '5px 10px',
                outline: 'none',
                minWidth: 0,
                opacity: status === 'loading' || status === 'streaming' ? 0.5 : 1,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-gold-muted)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
            />
            <button
              type="submit"
              disabled={!followUpInput.trim() || status === 'loading' || status === 'streaming'}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--accent-gold)',
                background: 'rgba(212,168,71,0.1)',
                border: '1px solid rgba(212,168,71,0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 10px',
                cursor: 'pointer',
                flexShrink: 0,
                opacity: !followUpInput.trim() || status === 'loading' || status === 'streaming' ? 0.4 : 1,
                transition: 'opacity var(--transition-fast)',
              }}
            >
              ↵
            </button>
          </form>
        </div>
      )}

      {/* Footer actions */}
      {((conversationHistory ?? []).length > 0 || status === 'success') && (
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
