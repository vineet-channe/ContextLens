'use strict'

const express = require('express')
const { requireAuth } = require('../middleware/authMiddleware')
const PaperSession = require('../models/PaperSession')
const DefinitionLookup = require('../models/DefinitionLookup')

const router = express.Router()
router.use(requireAuth)

// List all paper sessions for the logged-in user
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await PaperSession.find({ userId: req.userId })
      .sort({ updatedAt: -1 })
      .lean()
    res.json({ sessions })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create or retrieve a session by documentTitle (upsert)
router.post('/sessions', async (req, res) => {
  const { documentTitle } = req.body
  if (!documentTitle || typeof documentTitle !== 'string' || documentTitle.length > 300) {
    return res.status(400).json({ error: 'documentTitle must be a non-empty string of 300 characters or fewer' })
  }
  try {
    const session = await PaperSession.findOneAndUpdate(
      { userId: req.userId, documentTitle },
      { $setOnInsert: { userId: req.userId, documentTitle } },
      { upsert: true, new: true },
    ).lean()
    res.json({ session })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update lastPage for a session
router.patch('/sessions/:sessionId', async (req, res) => {
  const { lastPage } = req.body
  if (typeof lastPage !== 'number') return res.status(400).json({ error: 'lastPage must be a number' })
  try {
    const session = await PaperSession.findOneAndUpdate(
      { _id: req.params.sessionId, userId: req.userId },
      { lastPage },
      { new: true },
    ).lean()
    if (!session) return res.status(404).json({ error: 'Session not found' })
    res.json({ session })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get all lookups for a session
router.get('/sessions/:sessionId/lookups', async (req, res) => {
  try {
    const session = await PaperSession.findOne({ _id: req.params.sessionId, userId: req.userId }).lean()
    if (!session) return res.status(404).json({ error: 'Session not found' })
    const lookups = await DefinitionLookup.find({ sessionId: req.params.sessionId })
      .sort({ createdAt: -1 })
      .lean()
    res.json({ lookups })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

const VALID_PROVIDERS = new Set(['claude', 'gemini', 'openai', 'openrouter'])

// Save a new lookup
router.post('/sessions/:sessionId/lookups', async (req, res) => {
  try {
    const session = await PaperSession.findOne({ _id: req.params.sessionId, userId: req.userId })
    if (!session) return res.status(404).json({ error: 'Session not found' })

    const { highlighted, explanation, pageNumber, surrounding, provider, model } = req.body
    if (typeof highlighted !== 'string' || highlighted.length < 1 || highlighted.length > 500) {
      return res.status(400).json({ error: 'highlighted must be a string of 1–500 characters' })
    }
    if (typeof explanation !== 'string' || explanation.length < 1 || explanation.length > 5000) {
      return res.status(400).json({ error: 'explanation must be a string of 1–5000 characters' })
    }
    if (typeof pageNumber !== 'number' || !Number.isInteger(pageNumber) || pageNumber < 1) {
      return res.status(400).json({ error: 'pageNumber must be a positive integer' })
    }
    if (surrounding !== undefined && (typeof surrounding !== 'string' || surrounding.length > 1000)) {
      return res.status(400).json({ error: 'surrounding must be a string of 1000 characters or fewer' })
    }
    if (provider !== undefined && !VALID_PROVIDERS.has(provider)) {
      return res.status(400).json({ error: 'invalid provider' })
    }
    if (model !== undefined && (typeof model !== 'string' || model.length > 200)) {
      return res.status(400).json({ error: 'model must be a string of 200 characters or fewer' })
    }

    const lookup = await DefinitionLookup.create({
      userId: req.userId,
      sessionId: session._id,
      highlighted,
      explanation,
      pageNumber,
      surrounding: surrounding || '',
      provider: provider || 'claude',
      model: model || undefined,
      followUps: [],
    })

    await PaperSession.updateOne({ _id: session._id }, { $inc: { lookupCount: 1 } })

    res.json({ lookup })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update follow-ups on a lookup
router.patch('/sessions/:sessionId/lookups/:lookupId', async (req, res) => {
  const { followUps } = req.body
  if (!Array.isArray(followUps) || followUps.length > 20) {
    return res.status(400).json({ error: 'followUps must be an array of 20 items or fewer' })
  }
  const validFollowUps = followUps.every(
    (f) =>
      f && typeof f.question === 'string' && f.question.length <= 500 &&
      typeof f.answer === 'string' && f.answer.length <= 5000,
  )
  if (!validFollowUps) {
    return res.status(400).json({ error: 'each followUp must have question (≤500 chars) and answer (≤5000 chars)' })
  }
  try {
    const lookup = await DefinitionLookup.findOneAndUpdate(
      { _id: req.params.lookupId, userId: req.userId, sessionId: req.params.sessionId },
      { followUps },
      { new: true },
    ).lean()
    if (!lookup) return res.status(404).json({ error: 'Lookup not found' })
    res.json({ lookup })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
