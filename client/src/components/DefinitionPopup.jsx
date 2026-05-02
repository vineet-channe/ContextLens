import { useEffect, useRef, useState, useCallback } from 'react'

const POPUP_WIDTH = 360
const POPUP_OFFSET = 12

export default function DefinitionPopup({
  anchor,
  highlighted,
  status,
  explanation,
  error,
  onClose,
}) {
  const popupRef = useRef(null)
  const mobileRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const [followUpOpen, setFollowUpOpen] = useState(false)

  // Drag state — null means "use anchor-based positioning"
  const [position, setPosition] = useState(null)
  const isDragging = useRef(false)
  const dragStart = useRef(null)

  // Reset dragged position whenever a new highlight comes in
  useEffect(() => {
    setPosition(null)
  }, [anchor])

  // Position: above selection when near bottom of viewport, else below
  const showAbove = anchor.viewportBottom > anchor.viewportHeight * 0.6

  const popupTop = showAbove
    ? anchor.top - POPUP_OFFSET - 8
    : anchor.bottom + POPUP_OFFSET

  // Horizontal: clamp so popup doesn't overflow viewport
  const rawLeft = anchor.left + (anchor.right - anchor.left) / 2 - POPUP_WIDTH / 2
  const popupLeft = Math.max(8, Math.min(rawLeft, window.innerWidth - POPUP_WIDTH - 8))

  // Drag handlers
  const handleHeaderMouseDown = useCallback((e) => {
    if (e.target.closest('button')) return // let close button work normally
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
      const newTop = Math.max(0, Math.min(dragStart.current.popupTop + dy, window.innerHeight - 80))
      const newLeft = Math.max(0, Math.min(dragStart.current.popupLeft + dx, window.innerWidth - POPUP_WIDTH - 8))
      setPosition({ top: newTop, left: newLeft })
    }
    const onMouseUp = () => { isDragging.current = false }
    document.addEventListener('mousemove', onMouseMove)
    // capture: true so stopPropagation() on child elements can't block this
    document.addEventListener('mouseup', onMouseUp, true)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp, true)
    }
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      const inDesktop = popupRef.current && popupRef.current.contains(e.target)
      const inMobile = mobileRef.current && mobileRef.current.contains(e.target)
      if (!inDesktop && !inMobile) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleCopy = useCallback(() => {
    if (!explanation) return
    navigator.clipboard.writeText(explanation).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [explanation])

  const popupStyle = position
    ? { width: POPUP_WIDTH, top: position.top, left: position.left, bottom: 'auto' }
    : {
        width: POPUP_WIDTH,
        top: showAbove ? 'auto' : popupTop,
        bottom: showAbove ? window.innerHeight - anchor.top + POPUP_OFFSET : 'auto',
        left: popupLeft,
      }

  return (
    <>
      {/* Desktop popup */}
      <div
        ref={popupRef}
        onMouseUp={(e) => e.stopPropagation()}
        className={`
          fixed z-50 hidden sm:block
          bg-gray-900 border border-gray-700 rounded-xl shadow-2xl
          overflow-hidden
          transition-all duration-150
        `}
        style={popupStyle}
        role="dialog"
        aria-label="Contextual definition"
      >
        {/* Header — drag handle */}
        <div
          onMouseDown={handleHeaderMouseDown}
          className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-800/60 cursor-grab active:cursor-grabbing select-none"
        >
          <span className="text-indigo-300 font-semibold text-sm truncate max-w-[250px]">
            &ldquo;{highlighted}&rdquo;
          </span>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors ml-2 flex-shrink-0"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3 min-h-[80px]">
          {status === 'loading' && (
            <div className="flex items-center gap-1.5 py-4 justify-center">
              <span className="w-2 h-2 bg-indigo-400 rounded-full dot-1" />
              <span className="w-2 h-2 bg-indigo-400 rounded-full dot-2" />
              <span className="w-2 h-2 bg-indigo-400 rounded-full dot-3" />
            </div>
          )}

          {status === 'streaming' && (
            <p className="text-gray-200 text-sm leading-relaxed">
              {explanation}
              <span className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 animate-pulse align-middle" />
            </p>
          )}

          {status === 'success' && (
            <p className="text-gray-200 text-sm leading-relaxed">
              {explanation}
            </p>
          )}

          {status === 'error' && (
            <p className="text-red-400 text-sm">
              {error ?? 'Something went wrong. Please try again.'}
            </p>
          )}
        </div>

        {/* Footer actions */}
        {(status === 'success' || status === 'streaming') && (
          <div className="flex items-center gap-2 px-4 py-2 border-t border-gray-800 bg-gray-800/40">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
            <div className="w-px h-3 bg-gray-700" />
            <button
              onClick={() => setFollowUpOpen((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Ask follow-up
            </button>
          </div>
        )}

        {/* Follow-up stub */}
        {followUpOpen && (
          <div className="px-4 pb-3 border-t border-gray-800">
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Ask a follow-up question…"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                onClick={() => {}}
              >
                Ask
              </button>
            </div>
            <p className="text-gray-600 text-xs mt-2">Follow-up coming soon</p>
          </div>
        )}
      </div>

      {/* Mobile bottom sheet */}
      <div
        className={`
          sm:hidden fixed inset-x-0 bottom-0 z-50
          bg-gray-900 border-t border-gray-700 rounded-t-2xl shadow-2xl
          transition-transform duration-200
        `}
        ref={mobileRef}
        onMouseUp={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-700 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-2 border-b border-gray-800">
          <span className="text-indigo-300 font-semibold text-sm truncate max-w-[250px]">
            &ldquo;{highlighted}&rdquo;
          </span>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 ml-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 min-h-[100px]">
          {status === 'loading' && (
            <div className="flex items-center gap-2 py-4 justify-center">
              <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full dot-1" />
              <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full dot-2" />
              <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full dot-3" />
            </div>
          )}
          {(status === 'streaming' || status === 'success') && (
            <p className="text-gray-200 text-base leading-relaxed">{explanation}</p>
          )}
          {status === 'error' && (
            <p className="text-red-400 text-base">{error ?? 'Something went wrong.'}</p>
          )}
        </div>

        {(status === 'success' || status === 'streaming') && (
          <div className="flex gap-3 px-5 pb-6">
            <button
              onClick={handleCopy}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={() => setFollowUpOpen((v) => !v)}
              className="flex-1 bg-indigo-700 hover:bg-indigo-600 text-white py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Ask follow-up
            </button>
          </div>
        )}

        {followUpOpen && (
          <div className="px-5 pb-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask a follow-up question…"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-base text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <button className="bg-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-medium">
                Ask
              </button>
            </div>
            <p className="text-gray-600 text-xs mt-2 text-center">Follow-up coming soon</p>
          </div>
        )}
      </div>
    </>
  )
}
