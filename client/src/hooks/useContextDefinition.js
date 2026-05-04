import { useState, useRef, useCallback } from 'react'

const DEBOUNCE_MS = 500
const CACHE_MAX = 50
// Must match server/providers/prompt.js buildInitialUserMessage
const INITIAL_USER_MSG = (highlighted) => `Please explain "${highlighted}" as used in this document.`

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

function getApiUrl(path) {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path
}

function getCacheKey(highlighted, documentTitle, pageNumber) {
  return `${documentTitle}::${pageNumber}::${highlighted.toLowerCase().trim()}`
}

export function useContextDefinition() {
  const [state, setState] = useState({
    status: 'idle', // idle | loading | streaming | success | error
    highlighted: '',
    explanation: '',
    error: null,
    // Full conversation thread: [{role: 'user'|'assistant', content: string}]
    // Only contains COMPLETED turns. The current streaming answer lives in `explanation`.
    conversationHistory: [],
  })
  const [popupAnchor, setPopupAnchor] = useState(null)

  const debounceTimer = useRef(null)
  const abortController = useRef(null)
  // Always-fresh ref to conversationHistory for use inside memoised callbacks
  const convHistRef = useRef([])
  // Persist last call params so follow-ups can reuse them
  const lastCallRef = useRef(null)
  // Per-document definition cache: getCacheKey → explanation string
  const cacheRef = useRef(new Map())

  /**
   * Core streaming function.
   * @param {object}  body        - Request body sent to /api/define
   * @param {object|null} anchor  - Popup anchor rect (null to keep existing)
   * @param {object}  opts
   * @param {boolean} opts.isFollowUp    - When true, appends to conversationHistory instead of resetting
   * @param {string}  opts.followUpText  - The user's follow-up question (for history tracking)
   */
  const streamRequest = useCallback(async (body, anchor, { isFollowUp = false, followUpText = null } = {}) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    if (abortController.current) abortController.current.abort()

    if (isFollowUp && followUpText) {
      // Append the user question to the conversation thread immediately
      const updated = [...convHistRef.current, { role: 'user', content: followUpText }]
      convHistRef.current = updated
      setState((s) => ({ ...s, status: 'loading', explanation: '', error: null, conversationHistory: updated }))
    } else {
      // New initial lookup — reset conversation history
      convHistRef.current = []
      setState({ status: 'loading', highlighted: body.highlighted, explanation: '', error: null, conversationHistory: [] })
    }

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

      outer: while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const text = line.slice(6)
          if (text === '[DONE]') break outer
          if (text.startsWith('[ERROR]')) {
            const errMsg = text.replace('[ERROR]', '').trim() || 'Failed to contact LLM API.'
            setState((s) => ({ ...s, status: 'error', error: errMsg }))
            return
          }
          accumulated += text
          setState((s) => ({ ...s, explanation: accumulated }))
        }
      }

      // Append completed AI answer to conversation history
      const finalHistory = [...convHistRef.current, { role: 'assistant', content: accumulated }]
      convHistRef.current = finalHistory
      setState((s) => ({ ...s, status: 'success', explanation: accumulated, conversationHistory: finalHistory }))

      // Cache initial lookups only
      if (!isFollowUp && body.highlighted && body.documentTitle && body.pageNumber) {
        const key = getCacheKey(body.highlighted, body.documentTitle, body.pageNumber)
        cacheRef.current.set(key, accumulated)
        if (cacheRef.current.size > CACHE_MAX) {
          cacheRef.current.delete(cacheRef.current.keys().next().value)
        }
      }
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
    ({ highlighted, surrounding, documentTitle, pageNumber, provider = 'openrouter', model, apiKey, sectionHeading, anchor }) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)

      // Cache hit — no API call needed
      const key = getCacheKey(highlighted, documentTitle, pageNumber)
      const cached = cacheRef.current.get(key)
      if (cached) {
        convHistRef.current = [{ role: 'assistant', content: cached }]
        setState({
          status: 'success',
          highlighted,
          explanation: cached,
          error: null,
          conversationHistory: [{ role: 'assistant', content: cached }],
        })
        if (anchor) setPopupAnchor(anchor)
        lastCallRef.current = { highlighted, surrounding, documentTitle, pageNumber, provider, model, apiKey, sectionHeading }
        return
      }

      lastCallRef.current = { highlighted, surrounding, documentTitle, pageNumber, provider, model, apiKey, sectionHeading }
      debounceTimer.current = setTimeout(() => {
        streamRequest(
          { highlighted, surrounding, documentTitle, pageNumber, provider, model, apiKey, sectionHeading },
          anchor,
        )
      }, DEBOUNCE_MS)
    },
    [streamRequest],
  )

  /**
   * Continue the live popup conversation with a follow-up question.
   * Builds the full messages array from the current conversation history.
   */
  const sendFollowUp = useCallback(
    (followUpText) => {
      const last = lastCallRef.current
      if (!last) return

      // Build messages: initial Q, prior turns, new user question
      const priorHistory = convHistRef.current
      const messages = [
        { role: 'user', content: INITIAL_USER_MSG(last.highlighted) },
        ...priorHistory,
        { role: 'user', content: followUpText },
      ]

      streamRequest(
        {
          highlighted: last.highlighted,
          surrounding: last.surrounding,
          documentTitle: last.documentTitle,
          pageNumber: last.pageNumber,
          provider: last.provider,
          model: last.model,
          apiKey: last.apiKey,
          sectionHeading: last.sectionHeading,
          messages,
        },
        null,
        { isFollowUp: true, followUpText },
      )
    },
    [streamRequest],
  )

  /**
   * Send a follow-up for a historical lookup shown in the definition panel.
   * Reconstructs the full message thread from the stored history item.
   */
  const sendFollowUpForHistory = useCallback(
    (item, followUpText) => {
      const messages = [
        { role: 'user', content: INITIAL_USER_MSG(item.highlighted) },
        { role: 'assistant', content: item.explanation },
        ...(item.followUps ?? []).flatMap((fu) => [
          { role: 'user', content: fu.question },
          { role: 'assistant', content: fu.answer },
        ]),
        { role: 'user', content: followUpText },
      ]

      streamRequest(
        {
          highlighted: item.highlighted,
          surrounding: item.surrounding ?? '',
          documentTitle: item.documentTitle ?? '',
          pageNumber: item.pageNumber,
          provider: item.provider ?? 'openrouter',
          model: item.model,
          messages,
        },
        null,
      )
    },
    [streamRequest],
  )

  const clearDefinition = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    if (abortController.current) abortController.current.abort()
    convHistRef.current = []
    setState({ status: 'idle', highlighted: '', explanation: '', error: null, conversationHistory: [] })
    setPopupAnchor(null)
    window.getSelection()?.removeAllRanges()
  }, [])

  return { state, popupAnchor, fetchDefinition, sendFollowUp, sendFollowUpForHistory, clearDefinition }
}
