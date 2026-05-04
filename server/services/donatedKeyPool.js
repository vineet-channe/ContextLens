'use strict'

const DonatedApiKey = require('../models/DonatedApiKey')
const {
  encryptApiKey,
  decryptApiKey,
  createKeyFingerprint,
} = require('../utils/keyCrypto')

const VALID_PROVIDERS = new Set(['claude', 'gemini', 'openai', 'openrouter'])

function assertValidProvider(provider) {
  if (!VALID_PROVIDERS.has(provider)) {
    throw new Error('Invalid provider')
  }
}

function sanitizeApiKey(value) {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  if (!trimmed || trimmed.length > 1024) {
    throw new Error('apiKey must be a non-empty string of 1024 characters or fewer')
  }
  if (/[\x00-\x1F\x7F]/.test(trimmed)) {
    throw new Error('apiKey contains invalid characters')
  }
  return trimmed
}

function classifyProviderError(err) {
  const status = Number(err?.status || err?.statusCode || 0)
  const code = String(err?.code || '').toLowerCase()
  const message = String(err?.message || '').toLowerCase()

  const isAuthError =
    status === 401 ||
    status === 403 ||
    code.includes('auth') ||
    code.includes('invalid_api_key') ||
    message.includes('invalid api key') ||
    message.includes('api key') && message.includes('invalid') ||
    message.includes('authentication')

  const isQuotaError =
    status === 429 ||
    code.includes('rate') ||
    code.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('quota') ||
    message.includes('too many requests')

  if (isAuthError) return 'hard_invalid'
  if (isQuotaError) return 'rate_limited'
  return 'transient'
}

async function donateKey({ provider, apiKey, donorUserId }) {
  assertValidProvider(provider)
  const safeApiKey = sanitizeApiKey(apiKey)
  const fingerprint = createKeyFingerprint(provider, safeApiKey)

  const existing = await DonatedApiKey.findOne({ keyFingerprintHash: fingerprint }).lean()
  if (existing && existing.status !== 'revoked') {
    const err = new Error('This API key has already been donated.')
    err.code = 'DUPLICATE_KEY'
    throw err
  }

  if (existing && existing.status === 'revoked') {
    await DonatedApiKey.updateOne(
      { _id: existing._id },
      {
        provider,
        encryptedKey: encryptApiKey(safeApiKey),
        donorUserId,
        status: 'active',
        failCount: 0,
        successCount: 0,
        usageCount: 0,
        lastError: null,
        cooldownUntil: null,
        revokedAt: null,
      },
    )
    return DonatedApiKey.findById(existing._id)
  }

  const created = await DonatedApiKey.create({
    provider,
    encryptedKey: encryptApiKey(safeApiKey),
    keyFingerprintHash: fingerprint,
    donorUserId,
  })

  return created
}

async function getMyDonations(donorUserId) {
  return DonatedApiKey.find({ donorUserId })
    .sort({ createdAt: -1 })
    .select('provider status failCount successCount usageCount cooldownUntil lastUsedAt createdAt revokedAt')
    .lean()
}

async function revokeDonation({ donationId, donorUserId }) {
  return DonatedApiKey.findOneAndUpdate(
    { _id: donationId, donorUserId },
    {
      status: 'revoked',
      revokedAt: new Date(),
      cooldownUntil: null,
      lastError: 'Revoked by donor',
    },
    { new: true },
  ).lean()
}

async function takeNextKey(provider) {
  assertValidProvider(provider)
  const now = new Date()

  const keyDoc = await DonatedApiKey.findOneAndUpdate(
    {
      provider,
      status: { $in: ['active', 'cooling_down'] },
      $or: [{ cooldownUntil: null }, { cooldownUntil: { $lte: now } }],
    },
    {
      $set: {
        status: 'active',
        lastUsedAt: now,
      },
    },
    {
      sort: { lastUsedAt: 1, createdAt: 1 },
      new: true,
    },
  )

  if (!keyDoc) return null

  return {
    keyId: keyDoc._id.toString(),
    provider: keyDoc.provider,
    apiKey: decryptApiKey(keyDoc.encryptedKey),
  }
}

async function markKeySuccess(keyId) {
  await DonatedApiKey.updateOne(
    { _id: keyId },
    {
      $inc: { successCount: 1, usageCount: 1 },
      $set: { status: 'active', cooldownUntil: null, lastError: null },
    },
  )
}

async function markKeyFailure(keyId, err) {
  const kind = classifyProviderError(err)

  if (kind === 'hard_invalid') {
    await DonatedApiKey.updateOne(
      { _id: keyId },
      {
        $inc: { failCount: 1 },
        $set: { status: 'exhausted', lastError: String(err?.message || 'Key rejected by provider') },
      },
    )
    return
  }

  const backoffMs = kind === 'rate_limited' ? 15 * 60 * 1000 : 3 * 60 * 1000
  await DonatedApiKey.updateOne(
    { _id: keyId },
    {
      $inc: { failCount: 1 },
      $set: {
        status: 'cooling_down',
        cooldownUntil: new Date(Date.now() + backoffMs),
        lastError: String(err?.message || 'Temporary provider failure'),
      },
    },
  )
}

module.exports = {
  VALID_PROVIDERS,
  donateKey,
  getMyDonations,
  revokeDonation,
  takeNextKey,
  markKeySuccess,
  markKeyFailure,
}
