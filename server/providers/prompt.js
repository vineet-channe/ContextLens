'use strict'

function buildPrompt({ highlighted, surrounding, documentTitle, pageNumber, followUp, previousExplanation }) {
  if (followUp && previousExplanation) {
    return `You are helping a reader understand a complex document.

Document: "${documentTitle}"
Page ${pageNumber} context: "${surrounding}"

The reader previously highlighted: "${highlighted}" and received this explanation: "${previousExplanation}"

They now ask: "${followUp}"

Answer specifically in 2–4 sentences, staying grounded in how the term is used in this document. Do not repeat the original explanation.`
  }

  return `You are helping a reader understand a complex document.

Document: "${documentTitle}"
Page ${pageNumber} context: "${surrounding}"

The reader highlighted: "${highlighted}"

In 2–4 sentences, explain what "${highlighted}" means specifically within this document's context and subject matter. Do not give a generic dictionary definition. Ground your explanation in how the term is being used here.`
}

module.exports = { buildPrompt }
