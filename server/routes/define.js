'use strict'

const express = require('express')
const { providers } = require('../providers')

const router = express.Router()

const VALID_PROVIDERS = new Set(Object.keys(providers))

function validateBody(body) {
  const { highlighted, surrounding, documentTitle, pageNumber, provider, model, followUp, previousExplanation, apiKey } = body

  if (typeof highlighted !== 'string' || highlighted.trim().length < 2) {
    return 'highlighted must be a string of at least 2 characters'
  }
  if (highlighted.length > 500) {
    return 'highlighted must be 500 characters or fewer'
  }
  if (typeof surrounding !== 'string' || surrounding.length > 1000) {
    return 'surrounding must be a string of 1000 characters or fewer'
  }
  if (typeof documentTitle !== 'string' || documentTitle.length > 300) {
    return 'documentTitle must be a string of 300 characters or fewer'
  }
  if (typeof pageNumber !== 'number' || !Number.isInteger(pageNumber) || pageNumber < 1) {
    return 'pageNumber must be a positive integer'
  }
  if (provider !== undefined && !VALID_PROVIDERS.has(provider)) {
    return `provider must be one of: ${[...VALID_PROVIDERS].join(', ')}`
  }
  if (model !== undefined && (typeof model !== 'string' || model.length > 200)) {
    return 'model must be a string of 200 characters or fewer'
  }
  if (followUp !== undefined && (typeof followUp !== 'string' || followUp.length > 500)) {
    return 'followUp must be a string of 500 characters or fewer'
  }
  if (previousExplanation !== undefined && (typeof previousExplanation !== 'string' || previousExplanation.length > 2000)) {
    return 'previousExplanation must be a string of 2000 characters or fewer'
  }
  if (apiKey != null && (typeof apiKey !== 'string' || apiKey.length > 1024)) {
    return 'apiKey must be a string of 1024 characters or fewer'
  }
  if (apiKey != null && /[\x00-\x1F\x7F]/.test(apiKey)) {
    return 'apiKey contains invalid characters'
  }
  return null
}

router.post('/', async (req, res) => {
  const validationError = validateBody(req.body)
  if (validationError) {
    return res.status(400).json({ error: validationError })
  }

  const { highlighted, surrounding, documentTitle, pageNumber, provider = 'openrouter', model, followUp, previousExplanation, apiKey } = req.body
  const trimmedKey = typeof apiKey === 'string' ? apiKey.trim() : undefined
  const payload = { highlighted, surrounding, documentTitle, pageNumber, model, followUp, previousExplanation, apiKey: trimmedKey || undefined }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  try {
    await providers[provider](payload, res)
    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    if (res.headersSent) {
      res.write('data: [ERROR] Failed to contact LLM API.\n\n')
      res.end()
    } else {
      res.status(500).json({ error: 'Failed to contact LLM API.' })
    }
  }
})

module.exports = router
