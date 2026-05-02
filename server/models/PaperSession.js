'use strict'

const mongoose = require('mongoose')

const paperSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    documentTitle: { type: String, required: true },
    lastPage: { type: Number, default: 1 },
    lookupCount: { type: Number, default: 0 },
  },
  { timestamps: true },
)

paperSessionSchema.index({ userId: 1, documentTitle: 1 }, { unique: true })

module.exports = mongoose.model('PaperSession', paperSessionSchema)
