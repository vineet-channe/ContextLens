'use strict'

const Anthropic = require('@anthropic-ai/sdk')
const { buildPrompt } = require('./prompt')

async function getDefinition(payload, res) {
  const apiKey = payload.apiKey || process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured.')
  }
  const client = new Anthropic({ apiKey })
  const prompt = buildPrompt(payload)

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta?.type === 'text_delta'
    ) {
      res.write(`data: ${event.delta.text}\n\n`)
    }
  }
}

module.exports = { getDefinition }
