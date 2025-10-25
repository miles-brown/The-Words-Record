/**
 * Claude API Wrapper
 *
 * Provides a clean interface for interacting with Anthropic's Claude API
 * for case enrichment and content generation.
 */

import Anthropic from '@anthropic-ai/sdk'

// Initialize Claude client
const getClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY environment variable is not set. ' +
      'Please add it to your .env file.'
    )
  }

  return new Anthropic({
    apiKey
  })
}

export interface CaseEnrichmentInput {
  statement: {
    id: string
    content: string
    context?: string | null
    statementDate: Date
    statementTime?: string | null
    platform?: string | null
    venue?: string | null
    event?: string | null
    medium?: string | null
    socialMediaUrl?: string | null
    originalLanguage?: string
  }
  person?: {
    name: string
    profession?: string | null
    nationality?: string | null
    background?: string | null
  } | null
  organization?: {
    name: string
    organizationType?: string | null
  } | null
  responses: Array<{
    content: string
    statementDate: Date
    responseType?: string | null
    person?: { name: string } | null
    organization?: { name: string } | null
  }>
  repercussions: Array<{
    type: string
    description: string
    startDate: Date
    severityScore: number
    impactDescription?: string | null
  }>
  sources: Array<{
    url?: string | null
    title?: string | null
    publicationName?: string | null
    publishDate?: Date | null
    author?: string | null
  }>
  caseBasicInfo: {
    title: string
    slug: string
    caseDate: Date
    locationCity?: string | null
    locationCountry?: string | null
  }
}

export interface CaseEnrichmentOutput {
  summary: string // 200-300 words
  description: string // 2000-4000 words, Wikipedia-style
  triggeringEvent?: string
  outcome?: string
  mediaFraming?: string
  timeline: Array<{
    date: string
    event: string
    type: 'statement' | 'response' | 'repercussion'
  }>
  originalLanguage?: string
  translationNotes?: string
}

/**
 * Generate comprehensive Wikipedia-style case documentation using Claude
 */
export async function enrichCase(
  input: CaseEnrichmentInput
): Promise<CaseEnrichmentOutput> {
  const client = getClient()

  // Build structured prompt with all available data
  const prompt = buildEnrichmentPrompt(input)

  try {
    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 8000,
      temperature: 0.3, // Lower temperature for more factual, consistent output
      system: `You are a professional journalist and historian specializing in creating comprehensive, neutral documentation of public statements and controversies. Your writing style is similar to Wikipedia: factual, well-sourced, neutral point of view, comprehensive coverage of all angles, and well-structured with clear sections. You excel at synthesizing information from multiple sources to create coherent narratives.`,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    // Extract text from response
    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude API')
    }

    // Parse the structured response
    const output = parseEnrichmentResponse(content.text)

    return output
  } catch (error) {
    console.error('Claude API enrichment failed:', error)
    throw new Error(`Failed to enrich case: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Build comprehensive prompt for case enrichment
 */
function buildEnrichmentPrompt(input: CaseEnrichmentInput): string {
  const { statement, person, organization, responses, repercussions, sources, caseBasicInfo } = input

  // Format speaker name
  const speaker = person?.name || organization?.name || 'Unknown'
  const speakerContext = person?.profession
    ? `${person.profession}`
    : organization?.organizationType
    ? `${organization.organizationType}`
    : ''

  // Format dates
  const formatDate = (date: Date) => date.toISOString().split('T')[0]

  return `# Task: Create Comprehensive Case Documentation

You are tasked with creating comprehensive, Wikipedia-style documentation for a public statement controversy.

## Case Overview
**Title:** ${caseBasicInfo.title}
**Date:** ${formatDate(caseBasicInfo.caseDate)}
**Location:** ${caseBasicInfo.locationCity || 'Unknown'}, ${caseBasicInfo.locationCountry || 'Unknown'}

## Original Statement
**Speaker:** ${speaker}${speakerContext ? ` (${speakerContext})` : ''}
**Date:** ${formatDate(statement.statementDate)}${statement.statementTime ? ` at ${statement.statementTime}` : ''}
**Platform/Venue:** ${statement.platform || statement.venue || statement.event || 'Unknown'}
**Medium:** ${statement.medium || 'Unknown'}

**Statement Content:**
"${statement.content}"

${statement.context ? `**Context:** ${statement.context}` : ''}

${person?.background ? `\n**Speaker Background:** ${person.background}` : ''}

## Responses (${responses.length} total)
${responses.length > 0 ? responses.map((r, i) => `
${i + 1}. **Date:** ${formatDate(r.statementDate)}
   **From:** ${r.person?.name || r.organization?.name || 'Unknown'}
   **Type:** ${r.responseType || 'Response'}
   **Content:** "${r.content.substring(0, 200)}${r.content.length > 200 ? '...' : ''}"
`).join('\n') : 'No responses recorded yet.'}

## Repercussions (${repercussions.length} total)
${repercussions.length > 0 ? repercussions.map((r, i) => `
${i + 1}. **Type:** ${r.type}
   **Date:** ${formatDate(r.startDate)}
   **Severity:** ${r.severityScore}/10
   **Description:** ${r.description}
   ${r.impactDescription ? `**Impact:** ${r.impactDescription}` : ''}
`).join('\n') : 'No documented repercussions yet.'}

## Sources (${sources.length} total)
${sources.length > 0 ? sources.map((s, i) => `
${i + 1}. ${s.title || 'Untitled'}
   ${s.publicationName ? `**Publication:** ${s.publicationName}` : ''}
   ${s.author ? `**Author:** ${s.author}` : ''}
   ${s.publishDate ? `**Date:** ${formatDate(s.publishDate)}` : ''}
   ${s.url ? `**URL:** ${s.url}` : ''}
`).join('\n') : 'No sources provided.'}

---

# Instructions

Create comprehensive documentation with the following sections. Use ONLY the information provided above - do not invent or assume facts not present in the source material. If information is missing, note it as "Information not available" rather than guessing.

Return your response in the following JSON format:

\`\`\`json
{
  "summary": "2-3 paragraph concise overview (200-300 words)",
  "description": "Comprehensive Wikipedia-style article (2000-4000 words) with the following structure:

    ## Background
    Explain what led to this statement. What was the context? What events or circumstances prompted this?

    ## The Statement
    Detail how it was made, where, when, and in what context. Include details about platform, venue, medium.

    ## Immediate Reaction
    Describe the initial public and media response. Who responded first and how?

    ## Subsequent Developments
    Chronicle all responses in chronological order, organized by type (criticism, support, institutional responses).

    ## Repercussions and Consequences
    Detail all documented repercussions with dates and impacts.

    ## Media Coverage and Public Discourse
    Analyze how different outlets framed the story and public discourse evolved.

    ## Multiple Perspectives
    Present different viewpoints: supporters, critics, neutral observers.

    ## Outcome and Current Status
    Summarize the final state and any ongoing developments.",
  "triggeringEvent": "Brief description of what prompted the original statement",
  "outcome": "Summary of final outcomes and current status",
  "mediaFraming": "How media outlets primarily framed this story",
  "timeline": [
    {
      "date": "YYYY-MM-DD",
      "event": "Description of what happened",
      "type": "statement" | "response" | "repercussion"
    }
  ],
  "originalLanguage": "Language code if not English (e.g., 'es', 'fr', 'he', 'ar')",
  "translationNotes": "Any notes about translation if applicable"
}
\`\`\`

**Important Guidelines:**
- Maintain strict neutrality - present all sides fairly
- Use only factual information from the provided sources
- If information is missing, state "Information not available" rather than speculating
- Cite specific dates, names, and quotes from the source material
- Create a clear chronological timeline
- Identify the original language if the statement was not in English
- Write in professional, encyclopedic style similar to Wikipedia
- Be comprehensive but concise - avoid unnecessary repetition
`
}

/**
 * Parse Claude's response into structured output
 */
function parseEnrichmentResponse(response: string): CaseEnrichmentOutput {
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/)
    const jsonStr = jsonMatch ? jsonMatch[1] : response

    const parsed = JSON.parse(jsonStr)

    // Validate required fields
    if (!parsed.summary || !parsed.description) {
      throw new Error('Response missing required fields (summary or description)')
    }

    return {
      summary: parsed.summary,
      description: parsed.description,
      triggeringEvent: parsed.triggeringEvent,
      outcome: parsed.outcome,
      mediaFraming: parsed.mediaFraming,
      timeline: parsed.timeline || [],
      originalLanguage: parsed.originalLanguage,
      translationNotes: parsed.translationNotes
    }
  } catch (error) {
    console.error('Failed to parse Claude response:', error)
    console.error('Raw response:', response)
    throw new Error('Failed to parse enrichment response from Claude')
  }
}

/**
 * Test the Claude API connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = getClient()

    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: 'Reply with "OK" if you can read this.'
        }
      ]
    })

    return response.content[0].type === 'text' &&
           response.content[0].text.toLowerCase().includes('ok')
  } catch (error) {
    console.error('Claude API connection test failed:', error)
    return false
  }
}
