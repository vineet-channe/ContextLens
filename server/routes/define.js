'use strict'

const express = require('express')
const { providers } = require('../providers')
const {
  takeNextKey,
  markKeySuccess,
  markKeyFailure,
} = require('../services/donatedKeyPool')

const router = express.Router()

const VALID_PROVIDERS = new Set(Object.keys(providers))
const PROVIDER_ENV_KEY = {
  claude: 'ANTHROPIC_API_KEY',
  gemini: 'GEMINI_API_KEY',
  openai: 'OPENAI_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
}

function getEnvKeyForProvider(provider) {
  const envName = PROVIDER_ENV_KEY[provider]
  if (!envName) return null
  const value = process.env[envName]
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function validateBody(body) {
  const { highlighted, surrounding, documentTitle, pageNumber, provider, model, messages, sectionHeading, apiKey } = body

  if (typeof highlighted !== 'string' || highlighted.trim().length < 2) {
    return 'highlighted must be a string of at least 2 characters'
  }
  if (highlighted.length > 500) {
    return 'highlighted must be 500 characters or fewer'
  }
  if (typeof surrounding !== 'string' || surrounding.length > 2000) {
    return 'surrounding must be a string of 2000 characters or fewer'
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
  if (sectionHeading !== undefined && (typeof sectionHeading !== 'string' || sectionHeading.length > 200)) {
    return 'sectionHeading must be a string of 200 characters or fewer'
  }
  if (messages !== undefined) {
    if (!Array.isArray(messages)) return 'messages must be an array'
    if (messages.length > 40) return 'messages must have 40 entries or fewer'
    for (const m of messages) {
      if (!m || typeof m !== 'object') return 'each message must be an object'
      if (m.role !== 'user' && m.role !== 'assistant') return 'message role must be "user" or "assistant"'
      if (typeof m.content !== 'string' || m.content.length > 4000) {
        return 'message content must be a string of 4000 characters or fewer'
      }
    }
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

  const { highlighted, surrounding, documentTitle, pageNumber, provider = 'openrouter', model, messages, sectionHeading, apiKey } = req.body
  const trimmedKey = typeof apiKey === 'string' ? apiKey.trim() : undefined
  const basePayload = {
    highlighted,
    surrounding,
    documentTitle,
    pageNumber,
    model,
    messages,
    sectionHeading,
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  let streamedAnyData = false
  const originalWrite = res.write.bind(res)
  res.write = (chunk, ...args) => {
    if (typeof chunk === 'string' && chunk.startsWith('data: ') && !chunk.includes('[DONE]') && !chunk.includes('[ERROR]')) {
      streamedAnyData = true
    }
    return originalWrite(chunk, ...args)
  }

  try {
    if (trimmedKey) {
      await providers[provider]({ ...basePayload, apiKey: trimmedKey }, res)
      res.write('data: [DONE]\n\n')
      return res.end()
    }

    const envKey = getEnvKeyForProvider(provider)
    if (envKey) {
      try {
        await providers[provider]({ ...basePayload, apiKey: envKey }, res)
        res.write('data: [DONE]\n\n')
        return res.end()
      } catch (envErr) {
        if (streamedAnyData) throw envErr
        // Fall through to donated key pool.
      }
    }

    const maxPoolAttempts = 3
    let attempts = 0
    while (attempts < maxPoolAttempts) {
      attempts += 1
      const donated = await takeNextKey(provider)
      if (!donated) break

      try {
        await providers[provider]({ ...basePayload, apiKey: donated.apiKey }, res)
        await markKeySuccess(donated.keyId)
        res.write('data: [DONE]\n\n')
        return res.end()
      } catch (poolErr) {
        await markKeyFailure(donated.keyId, poolErr)
        if (streamedAnyData) throw poolErr
      }
    }

    throw new Error('No available API keys for this provider right now.')
  } catch (_err) {
    if (res.headersSent) {
      res.write('data: [ERROR] Failed to contact LLM API.\n\n')
      res.end()
    } else {
      res.status(500).json({ error: 'Failed to contact LLM API.' })
    }
  }
})

module.exports = router
