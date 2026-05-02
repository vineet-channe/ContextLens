import { useState, useCallback } from 'react'

const STORAGE_PREFIX = 'cl_apikey_'
const PROVIDERS = ['claude', 'gemini', 'openai', 'openrouter']

function loadFromStorage() {
  const result = {}
  for (const provider of PROVIDERS) {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${provider}`)
    if (stored) result[provider] = stored
  }
  return result
}

export function useApiKeys() {
  const [keys, setKeys] = useState(loadFromStorage)

  const setKey = useCallback((provider, value) => {
    const trimmed = value?.trim() || ''
    if (trimmed) {
      localStorage.setItem(`${STORAGE_PREFIX}${provider}`, trimmed)
    } else {
      localStorage.removeItem(`${STORAGE_PREFIX}${provider}`)
    }
    setKeys((prev) => {
      const next = { ...prev }
      if (trimmed) {
        next[provider] = trimmed
      } else {
        delete next[provider]
      }
      return next
    })
  }, [])

  const getKey = useCallback((provider) => keys[provider] ?? null, [keys])

  const hasKey = useCallback((provider) => Boolean(keys[provider]), [keys])

  return { getKey, setKey, hasKey, keys }
}
