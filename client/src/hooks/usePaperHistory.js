import { useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

export function usePaperHistory() {
  const { isAuthenticated, authFetch } = useAuth()
  const sessionIdRef = useRef(null)

  // Create or retrieve a session for a given document title
  const initSession = useCallback(
    async (documentTitle) => {
      if (!isAuthenticated) return null
      try {
        const res = await authFetch('/api/history/sessions', {
          method: 'POST',
          body: JSON.stringify({ documentTitle }),
        })
        if (!res?.ok) return null
        const data = await res.json()
        sessionIdRef.current = data.session._id
        return data.session
      } catch {
        return null
      }
    },
    [isAuthenticated, authFetch],
  )

  // Fetch all past lookups for a session and map to in-memory history format
  const loadSessionLookups = useCallback(
    async (sessionId) => {
      if (!isAuthenticated) return []
      try {
        const res = await authFetch(`/api/history/sessions/${sessionId}/lookups`)
        if (!res?.ok) return []
        const data = await res.json()
        return data.lookups.map((l) => ({
          highlighted: l.highlighted,
          explanation: l.explanation,
          pageNumber: l.pageNumber,
          surrounding: l.surrounding,
          documentTitle: l.documentTitle || '',
          provider: l.provider,
          model: l.model,
          followUps: l.followUps || [],
          lookupId: l._id,
        }))
      } catch {
        return []
      }
    },
    [isAuthenticated, authFetch],
  )

  // Save a new lookup to the current session
  const saveLookup = useCallback(
    async (lookupData) => {
      if (!isAuthenticated || !sessionIdRef.current) return null
      try {
        const res = await authFetch(`/api/history/sessions/${sessionIdRef.current}/lookups`, {
          method: 'POST',
          body: JSON.stringify(lookupData),
        })
        if (!res?.ok) return null
        const data = await res.json()
        return data.lookup
      } catch {
        return null
      }
    },
    [isAuthenticated, authFetch],
  )

  // Update follow-ups on an existing lookup
  const updateLookupFollowUps = useCallback(
    async (lookupId, followUps) => {
      if (!isAuthenticated || !sessionIdRef.current) return
      try {
        await authFetch(`/api/history/sessions/${sessionIdRef.current}/lookups/${lookupId}`, {
          method: 'PATCH',
          body: JSON.stringify({ followUps }),
        })
      } catch {
        // Fire-and-forget — non-critical
      }
    },
    [isAuthenticated, authFetch],
  )

  // Update the last-read page for the current session
  const updateLastPage = useCallback(
    async (page) => {
      if (!isAuthenticated || !sessionIdRef.current) return
      try {
        await authFetch(`/api/history/sessions/${sessionIdRef.current}`, {
          method: 'PATCH',
          body: JSON.stringify({ lastPage: page }),
        })
      } catch {
        // Fire-and-forget
      }
    },
    [isAuthenticated, authFetch],
  )

  // Fetch all paper sessions (for the landing page "Your Papers" list)
  const fetchAllSessions = useCallback(async () => {
    if (!isAuthenticated) return []
    try {
      const res = await authFetch('/api/history/sessions')
      if (!res?.ok) return []
      const data = await res.json()
      return data.sessions
    } catch {
      return []
    }
  }, [isAuthenticated, authFetch])

  return {
    sessionIdRef,
    initSession,
    loadSessionLookups,
    saveLookup,
    updateLookupFollowUps,
    updateLastPage,
    fetchAllSessions,
  }
}
