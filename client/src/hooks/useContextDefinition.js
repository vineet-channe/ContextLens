import { useState, useRef, useCallback } from 'react'

const DEBOUNCE_MS = 500
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

function getApiUrl(path) {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path
}

export function useContextDefinition() {
  const [state, setState] = useState({
    status: 'idle', // idle | loading | streaming | success | error
    highlighted: '',
    explanation: '',
    error: null,
  })
  const [popupAnchor, setPopupAnchor] = useState(null)

  const debounceTimer = useRef(null)
  const abortController = useRef(null)
  // Persist last call params so follow-ups can reuse them
  const lastCallRef = useRef(null)

  const streamRequest = useCallback(async (body, anchor) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    if (abortController.current) abortController.current.abort()

    setState({ status: 'loading', highlighted: body.highlighted, explanation: '', error: null })
    if (anchor) setPopupAnchor(anchor)

    const controller = new AbortController()
    abortController.current = controller

    try {
      const response = await fetch(getApiUrl('/api/define'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error ?? `Server error ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      setState((s) => ({ ...s, status: 'streaming' }))

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const text = line.slice(6)
            if (text === '[DONE]') continue
            accumulated += text
            setState((s) => ({ ...s, explanation: accumulated }))
          }
        }
      }

      setState((s) => ({ ...s, status: 'success', explanation: accumulated }))
    } catch (err) {
      if (err.name === 'AbortError') return
      setState((s) => ({
        ...s,
        status: 'error',
        error: err.message ?? 'Failed to fetch explanation.',
      }))
    }
  }, [])

  const fetchDefinition = useCallback(
    ({ highlighted, surrounding, documentTitle, pageNumber, provider = 'openrouter', model, apiKey, anchor }) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      // Store params for follow-up reuse
      lastCallRef.current = { highlighted, surrounding, documentTitle, pageNumber, provider, model, apiKey }
      debounceTimer.current = setTimeout(() => {
        streamRequest({ highlighted, surrounding, documentTitle, pageNumber, provider, model, apiKey }, anchor)
      }, DEBOUNCE_MS)
    },
    [streamRequest],
  )

  const sendFollowUp = useCallback(
    (followUpText) => {
      const last = lastCallRef.current
      if (!last) return
      const previousExplanation = state.explanation
      streamRequest(
        {
          highlighted: last.highlighted,
          surrounding: last.surrounding,
          documentTitle: last.documentTitle,
          pageNumber: last.pageNumber,
          provider: last.provider,
          model: last.model,
          apiKey: last.apiKey,
          followUp: followUpText,
          previousExplanation,
        },
        null, // keep existing anchor
      )
    },
    [state.explanation, streamRequest],
  )

  const sendFollowUpForHistory = useCallback(
    (item, followUpText) => {
      const previousExplanation =
        item.followUps?.length
          ? item.followUps[item.followUps.length - 1].answer
          : item.explanation
      streamRequest(
        {
          highlighted: item.highlighted,
          surrounding: item.surrounding ?? '',
          documentTitle: item.documentTitle ?? '',
          pageNumber: item.pageNumber,
          provider: item.provider ?? 'claude',
          model: item.model,
          followUp: followUpText,
          previousExplanation,
        },
        null,
      )
    },
    [streamRequest],
  )

  const clearDefinition = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    if (abortController.current) abortController.current.abort()
    setState({ status: 'idle', highlighted: '', explanation: '', error: null })
    setPopupAnchor(null)
    window.getSelection()?.removeAllRanges()
  }, [])

  return { state, popupAnchor, fetchDefinition, sendFollowUpForHistory, clearDefinition }
}
