import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check URL for token delivered by OAuth callback redirect
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('token')
    if (urlToken) {
      localStorage.setItem('cl_token', urlToken)
      // Clean the token out of the URL without a page reload
      const clean = window.location.pathname + window.location.hash
      window.history.replaceState({}, '', clean)
      fetchUser(urlToken)
      return
    }

    const stored = localStorage.getItem('cl_token')
    if (stored) {
      fetchUser(stored)
    } else {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchUser(token) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        localStorage.removeItem('cl_token')
      }
    } catch {
      // Network error — keep stored token, will retry on next load
    } finally {
      setLoading(false)
    }
  }

  const login = useCallback(() => {
    window.location.href = `${API_BASE}/api/auth/google`
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('cl_token')
    setUser(null)
  }, [])

  // Authenticated fetch — automatically attaches Bearer token
  const authFetch = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem('cl_token')
    if (!token) return null
    return fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, authFetch, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
