'use strict'

const mongoose = require('mongoose')

const followUpSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false },
)

const definitionLookupSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaperSession', required: true },
    highlighted: { type: String, required: true },
    explanation: { type: String, required: true },
    pageNumber: { type: Number, required: true },
    surrounding: { type: String, default: '' },
    provider: { type: String, default: 'claude' },
    model: { type: String },
    followUps: { type: [followUpSchema], default: [] },
  },
  { timestamps: true },
)

module.exports = mongoose.model('DefinitionLookup', definitionLookupSchema)
