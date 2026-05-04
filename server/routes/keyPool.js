'use strict'

const express = require('express')
const { requireAuth } = require('../middleware/authMiddleware')
const {
  donateKey,
  getMyDonations,
  revokeDonation,
  VALID_PROVIDERS,
} = require('../services/donatedKeyPool')

const router = express.Router()
router.use(requireAuth)

router.get('/my-donations', async (req, res) => {
  try {
    const donations = await getMyDonations(req.userId)
    return res.json({ donations })
  } catch {
    return res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/donate', async (req, res) => {
  const { provider, apiKey } = req.body

  if (typeof provider !== 'string' || !VALID_PROVIDERS.has(provider)) {
    return res.status(400).json({ error: 'provider must be one of: claude, gemini, openai, openrouter' })
  }

  try {
    const donation = await donateKey({
      provider,
      apiKey,
      donorUserId: req.userId,
    })
    return res.status(201).json({
      donation: {
        id: donation._id,
        provider: donation.provider,
        status: donation.status,
        createdAt: donation.createdAt,
      },
    })
  } catch (err) {
    if (err?.code === 'DUPLICATE_KEY') {
      return res.status(409).json({ error: err.message })
    }
    if (String(err?.message || '').includes('apiKey')) {
      return res.status(400).json({ error: err.message })
    }
    return res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:donationId', async (req, res) => {
  try {
    const donation = await revokeDonation({
      donationId: req.params.donationId,
      donorUserId: req.userId,
    })
    if (!donation) return res.status(404).json({ error: 'Donation not found' })
    return res.json({ success: true })
  } catch {
    return res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
