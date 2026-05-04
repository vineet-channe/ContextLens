'use strict'

const { GoogleGenerativeAI } = require('@google/generative-ai')
const { buildSystemPrompt, buildInitialUserMessage } = require('./prompt')

async function getDefinition(payload, res) {
  const apiKey = payload.apiKey || process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: buildSystemPrompt(payload),
  })

  if (!payload.messages?.length) {
    // Initial lookup: single-turn
    const result = await model.generateContentStream(buildInitialUserMessage(payload))
    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) res.write(`data: ${text}\n\n`)
    }
    return
  }

  // Multi-turn: use startChat with prior turns as history
  const history = payload.messages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const lastMessage = payload.messages[payload.messages.length - 1].content

  const chat = model.startChat({ history })
  const result = await chat.sendMessageStream(lastMessage)
  for await (const chunk of result.stream) {
    const text = chunk.text()
    if (text) res.write(`data: ${text}\n\n`)
  }
}

module.exports = { getDefinition }
