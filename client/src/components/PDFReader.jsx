import { useState, useCallback, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import DefinitionPopup from './DefinitionPopup'
import { useContextDefinition } from '../hooks/useContextDefinition'

// Use the bundled worker from pdfjs-dist
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export default function PDFReader({ file, provider, model }) {
  const [numPages, setNumPages] = useState(null)
  const [containerWidth, setContainerWidth] = useState(800)
  const [zoom, setZoom] = useState(100)
  const containerRef = useRef(null)
  const documentTitle = file?.name ?? 'Unknown document'

  const {
    state,
    popupAnchor,
    fetchDefinition,
    clearDefinition,
  } = useContextDefinition()

  // Resize observer to make PDF fill container
  const measureContainer = useCallback((node) => {
    if (!node) return
    containerRef.current = node
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width)
    })
    ro.observe(node)
  }, [])

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages)
  }, [])

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return

    const highlighted = selection.toString().trim()
    if (highlighted.length < 2) return
    if (highlighted.length > 500) return

    // Get surrounding text (~200 chars on each side) from the range
    const range = selection.getRangeAt(0)
    const container = range.commonAncestorContainer
    const fullText = container.textContent ?? ''
    const startOffset = Math.max(0, range.startOffset - 200)
    const endOffset = Math.min(fullText.length, range.endOffset + 200)
    const surrounding = fullText.slice(startOffset, endOffset)

    // Figure out which page number from the DOM hierarchy
    let pageNode = range.startContainer
    let pageNumber = 1
    while (pageNode && pageNode !== document.body) {
      const num = pageNode.dataset?.pageNumber
      if (num) { pageNumber = Number(num); break }
      pageNode = pageNode.parentElement
    }

    // Anchor popup to the selection bounding rect
    const rect = range.getBoundingClientRect()
    const anchor = {
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      viewportBottom: rect.bottom,
      viewportHeight: window.innerHeight,
    }

    fetchDefinition({ highlighted, surrounding, documentTitle, pageNumber, provider, model, anchor })
  }, [documentTitle, provider, model, fetchDefinition])

  return (
    <>
      {/* Sticky zoom controls */}
      <div className="sticky top-[57px] z-20 flex justify-center">
        <div className="flex items-center gap-1 bg-gray-800/90 backdrop-blur border border-gray-700 rounded-lg px-2 py-1 shadow">
          <button
            onClick={() => setZoom((z) => Math.max(50, z - 25))}
            className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
            aria-label="Zoom out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-xs text-gray-400 w-10 text-center tabular-nums">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(300, z + 25))}
            className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
            aria-label="Zoom in"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          {zoom !== 100 && (
            <button
              onClick={() => setZoom(100)}
              className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors ml-0.5"
              aria-label="Reset zoom"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div
        className="w-full overflow-x-auto px-4 pb-16 pdf-scroll select-text"
        ref={measureContainer}
        onMouseUp={handleMouseUp}
      >
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        className="flex flex-col gap-6 pt-6"
        loading={
          <div className="flex items-center justify-center h-64 text-gray-500">
            Loading PDF…
          </div>
        }
        error={
          <div className="flex items-center justify-center h-64 text-red-400">
            Failed to load PDF.
          </div>
        }
      >
        {numPages &&
          Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
            <div
              key={page}
              data-page-number={page}
              className="mx-auto shadow-2xl rounded bg-white relative"
            >
              <Page
                pageNumber={page}
                width={Math.round(containerWidth * (zoom / 100))}
                renderTextLayer={true}
                renderAnnotationLayer={false}
              />
            </div>
          ))}
      </Document>

      {state.status !== 'idle' && popupAnchor && (
        <DefinitionPopup
          anchor={popupAnchor}
          highlighted={state.highlighted}
          status={state.status}
          explanation={state.explanation}
          error={state.error}
          onClose={clearDefinition}
        />
      )}
      </div>
    </>
  )
}
