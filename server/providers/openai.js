'use strict'

const OpenAI = require('openai')
const { buildPrompt } = require('./prompt')

const DEFAULT_MODEL = 'gpt-4o-mini'

async function getDefinition(payload, res) {
  const apiKey = payload.apiKey || process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured.')
  }

  const client = new OpenAI({ apiKey })
  const model = payload.model || DEFAULT_MODEL
  const prompt = buildPrompt(payload)

  const stream = await client.chat.completions.create({
    model,
    max_tokens: 300,
    stream: true,
    messages: [{ role: 'user', content: prompt }],
  })

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content
    if (text) res.write(`data: ${text}\n\n`)
  }
}

module.exports = { getDefinition }
