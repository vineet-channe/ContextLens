import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

export function useDonatedKeys() {
  const { authFetch } = useAuth()
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMyDonations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await authFetch('/api/key-pool/my-donations')
      if (!res) { setError('Not signed in'); return }
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to load donations'); return }
      setDonations(data.donations ?? [])
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [authFetch])

  const donateKey = useCallback(async ({ provider, apiKey, monthlyUsageCap }) => {
    const body = { provider, apiKey }
    if (monthlyUsageCap) body.monthlyUsageCap = Number(monthlyUsageCap)
    const res = await authFetch('/api/key-pool/donate', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    if (!res) throw new Error('Not signed in')
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Failed to donate key')
    return data.donation
  }, [authFetch])

  const revokeKey = useCallback(async (donationId) => {
    const res = await authFetch(`/api/key-pool/${donationId}`, { method: 'DELETE' })
    if (!res) throw new Error('Not signed in')
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Failed to revoke key')
    setDonations((prev) => prev.filter((d) => d._id !== donationId))
  }, [authFetch])

  return { donations, loading, error, fetchMyDonations, donateKey, revokeKey }
}
