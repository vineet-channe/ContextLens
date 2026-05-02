'use strict'

const { getDefinition: claude } = require('./claude')
const { getDefinition: gemini } = require('./gemini')
const { getDefinition: openrouter } = require('./openrouter')
const { getDefinition: openai } = require('./openai')

const providers = { claude, gemini, openrouter, openai }

module.exports = { providers }
