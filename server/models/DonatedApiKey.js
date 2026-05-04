'use strict'

const mongoose = require('mongoose')

const donatedApiKeySchema = new mongoose.Schema(
  {
    provider: { type: String, required: true, enum: ['claude', 'gemini', 'openai', 'openrouter'] },
    encryptedKey: {
      iv: { type: String, required: true },
      tag: { type: String, required: true },
      ciphertext: { type: String, required: true },
    },
    keyFingerprintHash: { type: String, required: true, unique: true },
    donorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['active', 'cooling_down', 'exhausted', 'revoked'],
      default: 'active',
    },
    failCount: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 },
    cooldownUntil: { type: Date, default: null },
    lastUsedAt: { type: Date, default: null },
    lastError: { type: String, default: null },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

donatedApiKeySchema.index({ provider: 1, status: 1, cooldownUntil: 1, lastUsedAt: 1 })
donatedApiKeySchema.index({ donorUserId: 1, createdAt: -1 })

module.exports = mongoose.model('DonatedApiKey', donatedApiKeySchema)