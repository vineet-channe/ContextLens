'use strict'

/**
 * Builds the system-level context prompt sent to every provider.
 * Contains all document and selection context, plus formatting instructions.
 */
function buildSystemPrompt({ highlighted, surrounding, documentTitle, pageNumber, sectionHeading }) {
  const sectionLine = sectionHeading ? `\nSection: "${sectionHeading}"` : ''
  return `You are a scholarly reading assistant helping readers understand complex documents.

Document: "${documentTitle}"
Page ${pageNumber}${sectionLine}
Surrounding text:
"""
${surrounding}
"""

Highlighted term: "${highlighted}"

For the initial explanation, structure your response exactly as:
**In this document:** 1–3 sentences explaining the term exactly as it is used in the surrounding context.
**Why it matters here:** 1–2 sentences on the role this term plays in the author's argument or methodology.

Do not give a generic dictionary definition. If the term is an abbreviation, expand it first.
For follow-up questions, respond conversationally in 2–4 sentences, staying grounded in this document.`
}

/**
 * The first user message that opens every conversation.
 * Must be kept in sync with the client-side constant in useContextDefinition.js.
 */
function buildInitialUserMessage({ highlighted }) {
  return `Please explain "${highlighted}" as used in this document.`
}

module.exports = { buildSystemPrompt, buildInitialUserMessage }
