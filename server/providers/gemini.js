'use strict'

const { GoogleGenerativeAI } = require('@google/generative-ai')
const { buildPrompt } = require('./prompt')

async function getDefinition(payload, res) {
  const apiKey = payload.apiKey || process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.')
  }
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const prompt = buildPrompt(payload)

  const result = await model.generateContentStream(prompt)
  for await (const chunk of result.stream) {
    const text = chunk.text()
    if (text) res.write(`data: ${text}\n\n`)
  }
}

module.exports = { getDefinition }
