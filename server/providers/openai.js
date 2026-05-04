'use strict'

const OpenAI = require('openai')
const { buildSystemPrompt, buildInitialUserMessage } = require('./prompt')

const DEFAULT_MODEL = 'gpt-4o-mini'

async function getDefinition(payload, res) {
  const apiKey = payload.apiKey || process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured.')

  const client = new OpenAI({ apiKey })
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
