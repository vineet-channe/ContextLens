'use strict'

const crypto = require('crypto')

const ENC_ALGO = 'aes-256-gcm'

function getEncryptionKey() {
  const secret = process.env.KEY_POOL_ENCRYPTION_SECRET
  if (!secret) {
    throw new Error('KEY_POOL_ENCRYPTION_SECRET is not configured.')
  }
  return crypto.createHash('sha256').update(secret).digest()
}

function getFingerprintSecret() {
  const secret = process.env.KEY_POOL_FINGERPRINT_SECRET
  if (!secret) {
    throw new Error('KEY_POOL_FINGERPRINT_SECRET is not configured.')
  }
  return secret
}

function encryptApiKey(plainText) {
  const iv = crypto.randomBytes(12)
  const key = getEncryptionKey()
  const cipher = crypto.createCipheriv(ENC_ALGO, key, iv)
  const ciphertext = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return {
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  }
}

function decryptApiKey(encrypted) {
  const key = getEncryptionKey()
  const decipher = crypto.createDecipheriv(
    ENC_ALGO,
    key,
    Buffer.from(encrypted.iv, 'base64'),
  )
  decipher.setAuthTag(Buffer.from(encrypted.tag, 'base64'))
  const plain = Buffer.concat([
    decipher.update(Buffer.from(encrypted.ciphertext, 'base64')),
    decipher.final(),
  ])
  return plain.toString('utf8')
}

function createKeyFingerprint(provider, apiKey) {
  const hmac = crypto.createHmac('sha256', getFingerprintSecret())
  hmac.update(`${provider}:${apiKey}`)
  return hmac.digest('hex')
}

module.exports = {
  encryptApiKey,
  decryptApiKey,
  createKeyFingerprint,
}
