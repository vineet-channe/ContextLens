import { useCallback } from 'react'

/**
 * Walks the DOM upward from `node` to find a react-pdf page container
 * (the element with data-page-number). Returns [pageNode, pageNumber].
 */
function findPageNode(node) {
  let cur = node
  while (cur && cur !== document.body) {
    const num = cur.dataset?.pageNumber
    if (num) return [cur, Number(num)]
    cur = cur.parentElement
  }
  return [null, 1]
}

/**
 * Extracts the full text content of a react-pdf page's text layer.
 * Falls back to the commonAncestorContainer text if the layer isn't found.
 */
function getPageFullText(pageNode, fallbackContainer) {
  if (!pageNode) return fallbackContainer?.textContent ?? ''
  const textLayer =
    pageNode.querySelector('.react-pdf__Page__textContent') ??
    pageNode.querySelector('[class*="textContent"]')
  return (textLayer ?? pageNode).textContent ?? ''
}

/**
 * Slices `fullText` around `highlighted`, then expands to the nearest
 * sentence boundaries on each side. Window is ±600 chars before clamping.
 */
function extractWithSentenceBounds(fullText, highlighted) {
  const WINDOW = 600
  const idx = fullText.indexOf(highlighted)

  let rawStart, rawEnd
  if (idx !== -1) {
    rawStart = Math.max(0, idx - WINDOW / 2)
    rawEnd = Math.min(fullText.length, idx + highlighted.length + WINDOW / 2)
  } else {
    // Term not found verbatim — fall back to centre of text
    const mid = Math.floor(fullText.length / 2)
    rawStart = Math.max(0, mid - WINDOW / 2)
    rawEnd = Math.min(fullText.length, mid + WINDOW / 2)
  }

  let slice = fullText.slice(rawStart, rawEnd)

  // Expand start to sentence boundary (look for ". X" or "! X" or "? X")
  if (rawStart > 0) {
    const sentenceStart = slice.match(/[.!?]\s+[A-Z]/)
    if (sentenceStart && sentenceStart.index < 120) {
      slice = slice.slice(sentenceStart.index + 2).trimStart()
    }
  }

  // Trim end to last complete sentence
  if (rawEnd < fullText.length) {
    const lastPunct = Math.max(
      slice.lastIndexOf('. '),
      slice.lastIndexOf('! '),
      slice.lastIndexOf('? '),
    )
    if (lastPunct > slice.length - 150 && lastPunct > 0) {
      slice = slice.slice(0, lastPunct + 1)
    }
  }

  return slice.trim()
}

/**
 * Looks backward through the page's text spans to find a heading-like span
 * (larger font-size) before the selection point.
 */
function findSectionHeading(pageNode, rangeStartContainer) {
  if (!pageNode) return null
  const textLayer =
    pageNode.querySelector('.react-pdf__Page__textContent') ??
    pageNode.querySelector('[class*="textContent"]')
  if (!textLayer) return null

  const spans = Array.from(textLayer.querySelectorAll('span'))
  if (spans.length === 0) return null

  const selSpan =
    rangeStartContainer.nodeType === Node.TEXT_NODE
      ? rangeStartContainer.parentElement
      : rangeStartContainer

  const selIdx = spans.findIndex((s) => s === selSpan || s.contains(selSpan))
  if (selIdx === -1) return null

  const selFontSize = parseFloat(selSpan?.style?.fontSize ?? '0')

  for (let i = selIdx - 1; i >= 0; i--) {
    const spanSize = parseFloat(spans[i].style?.fontSize ?? '0')
    const text = spans[i].textContent?.trim() ?? ''
    if (
      spanSize > selFontSize * 1.1 &&
      text.length > 3 &&
      text.length < 120
    ) {
      return text
    }
  }
  return null
}

/**
 * Detects text selection in a PDF viewer and extracts rich context.
 * Returns a handleMouseUp handler to attach to the PDF container.
 */
export function useTextSelection({ onSelect }) {
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return

    const highlighted = selection.toString().trim()
    if (highlighted.length < 2) return
    if (highlighted.length > 500) return

    const range = selection.getRangeAt(0)

    // Find the react-pdf page container and page number
    const [pageNode, pageNumber] = findPageNode(range.startContainer)

    // Get the full page text for a proper surrounding context window
    const fullText = getPageFullText(pageNode, range.commonAncestorContainer)
    const surrounding = extractWithSentenceBounds(fullText, highlighted)

    // Optionally detect the nearest section heading above the selection
    const sectionHeading = findSectionHeading(pageNode, range.startContainer)

    const rect = range.getBoundingClientRect()
    onSelect({
      highlighted,
      surrounding,
      pageNumber,
      sectionHeading: sectionHeading ?? undefined,
      anchor: {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        viewportBottom: rect.bottom,
        viewportHeight: window.innerHeight,
      },
    })
  }, [onSelect])

  return { handleMouseUp }
}
