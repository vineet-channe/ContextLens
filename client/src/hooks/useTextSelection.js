import { useCallback } from 'react'

/**
 * Detects text selection in a PDF viewer and extracts the relevant context.
 * Returns a handleMouseUp handler to attach to the PDF container.
 */
export function useTextSelection({ onSelect }) {
  const handleMouseUp = useCallback(() => {
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

    // Walk up DOM to find which page we're on
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

    const rect = range.getBoundingClientRect()
    onSelect({
      highlighted,
      surrounding,
      pageNumber,
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
