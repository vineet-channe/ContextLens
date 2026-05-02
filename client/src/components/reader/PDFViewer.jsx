import { useState, useCallback, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export default function PDFViewer({ file, onTextSelect, scrollToPageRef }) {
  const [numPages, setNumPages] = useState(null)
  const [containerWidth, setContainerWidth] = useState(760)
  const [zoom, setZoom] = useState(100)
  const [historyHighlight, setHistoryHighlight] = useState(null)
  const containerRef = useRef(null)

  // Expose scroll-to-page to parent via ref
  if (scrollToPageRef) {
    scrollToPageRef.current = (pageNum, highlightedText) => {
      const container = containerRef.current
      if (!container) return
      const pageEl = container.querySelector(`[data-page-number="${pageNum}"]`)
      if (pageEl) {
        pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
        if (highlightedText) {
          // Wait for scroll to settle, then find & select the exact text
          setTimeout(() => {
            window.getSelection()?.removeAllRanges()
            window.find(highlightedText, false, false, false, false, false, false)
          }, 400)
        }
      }
    }
  }

  const measureContainer = useCallback((node) => {
    if (!node) return
    containerRef.current = node
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width - 32) // 16px padding each side
    })
    ro.observe(node)
  }, [])

  const onDocumentLoadSuccess = useCallback(({ numPages: n }) => {
    setNumPages(n)
  }, [])

  const handleMouseUp = useCallback(() => {
    setHistoryHighlight(null) // clear overlay on new selection
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return

    const highlighted = selection.toString().trim()
    if (highlighted.length < 2) return

    const range = selection.getRangeAt(0)
    const container = range.commonAncestorContainer
    const fullText = container.textContent ?? ''
    const startOffset = Math.max(0, range.startOffset - 300)
    const endOffset = Math.min(fullText.length, range.endOffset + 300)
    const surrounding = fullText.slice(startOffset, endOffset)

    // Walk up to find page number
    let pageNode = range.startContainer
    let pageNumber = 1
    while (pageNode && pageNode !== document.body) {
      const num = pageNode.dataset?.pageNumber
      if (num) {
        pageNumber = Number(num)
        break
      }
      pageNode = pageNode.parentElement
    }

    const rects = Array.from(range.getClientRects()).filter(
      (r) => r.width > 0 && r.height > 0,
    )
    if (rects.length === 0) return

    const pageElement = pageNode?.dataset?.pageNumber ? pageNode : null
    if (pageElement) {
      const pageBounds = pageElement.getBoundingClientRect()
      const normalizedRects = rects.map((r) => ({
        top: r.top - pageBounds.top,
        left: r.left - pageBounds.left,
        width: r.width,
        height: r.height,
      }))
      setHistoryHighlight({ pageNum: pageNumber, rects: normalizedRects })
      // Hide browser-native selection highlight; rely on our overlay for a clean look.
      selection.removeAllRanges()
    }

    const top = Math.min(...rects.map((r) => r.top))
    const bottom = Math.max(...rects.map((r) => r.bottom))
    const left = Math.min(...rects.map((r) => r.left))
    const right = Math.max(...rects.map((r) => r.right))

    onTextSelect({
      highlighted,
      surrounding,
      pageNumber,
      anchor: {
        top,
        bottom,
        left,
        right,
        viewportBottom: bottom,
        viewportHeight: window.innerHeight,
      },
    })
  }, [onTextSelect])

  const pageWidth = Math.max(200, Math.floor(containerWidth * (zoom / 100)))

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Zoom toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '6px 12px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '2px',
          }}
        >
          <ZoomBtn
            aria-label="Zoom out"
            onClick={() => setZoom((z) => Math.max(50, z - 25))}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </ZoomBtn>

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-tertiary)',
              width: '38px',
              textAlign: 'center',
              userSelect: 'none',
            }}
          >
            {zoom}%
          </span>

          <ZoomBtn
            aria-label="Zoom in"
            onClick={() => setZoom((z) => Math.min(300, z + 25))}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </ZoomBtn>
        </div>

        {numPages && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-tertiary)',
            }}
          >
            {numPages} {numPages === 1 ? 'page' : 'pages'}
          </span>
        )}
      </div>

      {/* Scrollable PDF column */}
      <div
        ref={measureContainer}
        onMouseUp={handleMouseUp}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'auto',
          padding: '24px 16px',
          background: '#0a0908',
        }}
      >
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
                gap: '8px',
              }}
            >
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          }
          error={
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--accent-ember)',
                textAlign: 'center',
                padding: '40px',
              }}
            >
              Failed to load PDF. Please try another file.
            </div>
          }
        >
          {Array.from({ length: numPages ?? 0 }, (_, i) => i + 1).map(
            (pageNum) => (
              <div
                key={pageNum}
                data-page-number={pageNum}
                style={{
                  marginBottom: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                <Page
                  pageNumber={pageNum}
                  width={pageWidth}
                  renderAnnotationLayer={false}
                  renderTextLayer
                  loading={null}
                />
                {/* Custom highlight overlay */}
                {historyHighlight?.pageNum === pageNum &&
                  historyHighlight.rects.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        top: r.top,
                        left: r.left,
                        width: r.width,
                        height: r.height,
                        background: 'rgba(212, 168, 71, 0.42)',
                        borderRadius: '1px',
                        pointerEvents: 'none',
                        zIndex: 10,
                      }}
                    />
                  ))}
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--text-tertiary)',
                    marginTop: '10px',
                    letterSpacing: '0.06em',
                  }}
                >
                  — {pageNum} / {numPages} —
                </div>
              </div>
            ),
          )}
        </Document>
      </div>
    </div>
  )
}

function ZoomBtn({ children, onClick, 'aria-label': ariaLabel }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        borderRadius: 'var(--radius-sm)',
        transition: 'background var(--transition-fast), color var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-surface)'
        e.currentTarget.style.color = 'var(--text-primary)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'none'
        e.currentTarget.style.color = 'var(--text-secondary)'
      }}
    >
      {children}
    </button>
  )
}
