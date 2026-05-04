'use strict'

const OpenAI = require('openai')
const { buildSystemPrompt, buildInitialUserMessage } = require('./prompt')

const DEFAULT_MODEL = 'openai/gpt-oss-120b:free'

async function getDefinition(payload, res) {
  const apiKey = payload.apiKey || process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured.')

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:5173',
      'X-Title': 'ContextLens',
    },
  })

  const model = payload.model || DEFAULT_MODEL
  const systemPrompt = buildSystemPrompt(payload)
  const conversationMessages = payload.messages?.length > 0
    ? payload.messages
    : [{ role: 'user', content: buildInitialUserMessage(payload) }]

  const stream = await client.chat.completions.create({
    model,
    max_tokens: 500,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...conversationMessages,
    ],
  })

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content
    if (text) res.write(`data: ${text}\n\n`)
  }
}

module.exports = { getDefinition }
