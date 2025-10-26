/**
 * Claude API Wrapper
 *
 * Provides a clean interface for interacting with Anthropic's Claude API
 * for case enrichment and content generation.
 */

import Anthropic from '@anthropic-ai/sdk'
import { jsonrepair } from 'jsonrepair'

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
  webSearchResults?: {
    mainSources: Array<{
      title: string
      url: string
      content: string
      publishedDate?: string
    }>
    background?: {
      answer?: string
      sources: Array<{
        title: string
        url: string
        content: string
      }>
    }
    mediaCoverage: Array<{
      title: string
      url: string
      content: string
    }>
    recentUpdates: Array<{
      title: string
      url: string
      content: string
    }>
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
      max_tokens: 4096, // Claude Haiku max output tokens
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
  const { statement, person, organization, responses, repercussions, sources, caseBasicInfo, webSearchResults } = input

  // Format speaker name
  const speaker = person?.name || organization?.name || 'Unknown'
  const speakerContext = person?.profession
    ? `${person.profession}`
    : organization?.organizationType
    ? `${organization.organizationType}`
    : ''

  // Format dates
  const formatDate = (date: Date) => date.toISOString().split('T')[0]

  const hasWebSearch = webSearchResults && (
    webSearchResults.mainSources.length > 0 ||
    webSearchResults.mediaCoverage.length > 0 ||
    webSearchResults.recentUpdates.length > 0
  )

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

${hasWebSearch ? `
## Additional Web Search Results

${webSearchResults!.background?.answer ? `### Background Information from Web Search
${webSearchResults!.background.answer}

**Sources:**
${webSearchResults!.background.sources.slice(0, 3).map((s, i) => `
${i + 1}. **${s.title}**
   URL: ${s.url}
   Content: ${s.content.substring(0, 200)}...
`).join('\n')}
` : ''}

### Web Search Sources (for footnote citations)
Use these source numbers for your footnote citations [1], [2], [3], etc.:

${webSearchResults!.mainSources.map((s, i) => `
[${i + 1}] **${s.title}**
    Publication: ${new URL(s.url).hostname.replace('www.', '')}
    URL: ${s.url}
    ${s.publishedDate ? `Published: ${s.publishedDate}` : ''}
    Content: ${s.content.substring(0, 300)}...
`).join('\n')}

${webSearchResults!.mediaCoverage.length > 0 ? `
### Media Coverage Analysis (${webSearchResults!.mediaCoverage.length})
${webSearchResults!.mediaCoverage.map((s, i) => `
${i + 1}. **${s.title}**
   URL: ${s.url}
   Content: ${s.content.substring(0, 250)}...
`).join('\n')}
` : ''}

${webSearchResults!.recentUpdates.length > 0 ? `
### Recent Updates (${webSearchResults!.recentUpdates.length})
${webSearchResults!.recentUpdates.map((s, i) => `
${i + 1}. **${s.title}**
   URL: ${s.url}
   Content: ${s.content.substring(0, 200)}...
`).join('\n')}
` : ''}

**IMPORTANT:** Use the web search results above to enhance your documentation with:
- Additional context and background not in the original sources
- More comprehensive media coverage analysis
- Recent developments and updates
- Multiple perspectives from different sources
- Verification and fact-checking of claims
` : ''}

---

# Instructions

Create comprehensive documentation with the following sections. Use ONLY the information provided above - do not invent or assume facts not present in the source material. If information is missing, note it as "Information not available" rather than guessing.

Return your response in the following JSON format (ensure all text is on single lines with \\n for line breaks):

\`\`\`json
{
  "summary": "2-3 paragraph concise overview (200-300 words)",
  "description": {
    "background": "Explain what led to this statement. What was the context? What events or circumstances prompted this? (Use \\n\\n for paragraph breaks)",
    "statement": "Detail how it was made, where, when, and in what context. Include details about platform, venue, medium. (Use \\n\\n for paragraph breaks)",
    "immediateReaction": "Describe the initial public and media response. Who responded first and how? (Use \\n\\n for paragraph breaks)",
    "subsequentDevelopments": "Chronicle all responses in chronological order, organized by type (criticism, support, institutional responses). (Use \\n\\n for paragraph breaks)",
    "repercussionsAndConsequences": "Detail all documented repercussions with dates and impacts. (Use \\n\\n for paragraph breaks)",
    "mediaCoverageAndPublicDiscourse": "Analyze how different outlets framed the story and public discourse evolved. (Use \\n\\n for paragraph breaks)",
    "multiplePerspectives": "Present different viewpoints: supporters, critics, neutral observers. (Use \\n\\n for paragraph breaks)",
    "outcomeAndCurrentStatus": "Summarize the final state and any ongoing developments. (Use \\n\\n for paragraph breaks)"
  },
  "triggeringEvent": "Brief description of what prompted the original statement",
  "outcome": "Summary of final outcomes and current status",
  "mediaFraming": "How media outlets primarily framed this story",
  "timeline": [
    {
      "date": "YYYY-MM-DD",
      "event": "Description of what happened",
      "type": "statement | response | repercussion"
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
- **CRITICAL FOR CITATIONS:** For EVERY fact, detail, or claim, add a Wikipedia-style footnote citation using square brackets with numbers [1], [2], [3] at the end of the sentence
- Match footnote numbers to the source list provided in the web search results above - use [1] for the first source listed, [2] for the second, etc.
- Multiple facts from the same source should reuse the same footnote number [1]...[1]
- Create a clear chronological timeline with footnote citations for each event
- Identify the original language if the statement was not in English
- Write in professional, encyclopedic style similar to Wikipedia
- Be comprehensive but concise - avoid unnecessary repetition
- **CRITICAL JSON FORMATTING:** Do NOT use quotation marks around show names, publication titles, or any text within the JSON strings - write The View not "The View", write Maus not "Maus". Use \\n for line breaks. The JSON parser will fail if you use unescaped quotes.
`
}

/**
 * Parse Claude's response into structured output
 */
function parseEnrichmentResponse(response: string): CaseEnrichmentOutput {
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/)
    let jsonStr = jsonMatch ? jsonMatch[1] : response

    // Pre-process to fix common Claude issues with unescaped quotes in strings
    // The regex approach is too complex. Instead, use a state machine to properly escape quotes
    let inString = false
    let result = ''
    let i = 0

    while (i < jsonStr.length) {
      const char = jsonStr[i]
      const prevChar = i > 0 ? jsonStr[i - 1] : ''
      const nextChar = i < jsonStr.length - 1 ? jsonStr[i + 1] : ''

      if (char === '"' && prevChar !== '\\') {
        if (!inString) {
          // Starting a string
          inString = true
          result += char
        } else {
          // Ending a string - check if next char is : or , or } which indicates end of value
          if (nextChar === ':' || nextChar === ',' || nextChar === '}' || nextChar === ']' || nextChar === '\n') {
            inString = false
            result += char
          } else {
            // This is a quote within the string - escape it
            result += '\\"'
          }
        }
      } else {
        result += char
      }
      i++
    }

    jsonStr = result

    // Try parsing first - if it works, great!
    let parsed: any
    try {
      parsed = JSON.parse(jsonStr)
    } catch (firstError) {
      // If parsing still fails, try a more aggressive fix
      console.warn('Initial JSON parse failed, attempting to repair...')

      try {
        // Try jsonrepair as last resort
        const repairedJson = jsonrepair(jsonStr)
        parsed = JSON.parse(repairedJson)
        console.log('✓ JSON repaired successfully')
      } catch (repairError) {
        console.error('JSON repair also failed')
        // Save the problematic JSON to a file for debugging
        console.error('Problematic JSON (first 1000 chars):')
        console.error(jsonStr.substring(0, 1000))
        throw firstError // Throw original error for better debugging
      }
    }

    // Validate required fields
    if (!parsed.summary || !parsed.description) {
      throw new Error('Response missing required fields (summary or description)')
    }

    // If description is an object with sections, convert to markdown
    let descriptionText: string
    if (typeof parsed.description === 'object' && !Array.isArray(parsed.description)) {
      const sections = parsed.description
      descriptionText = `## Background\n\n${sections.background || 'Information not available'}\n\n` +
        `## The Statement\n\n${sections.statement || 'Information not available'}\n\n` +
        `## Immediate Reaction\n\n${sections.immediateReaction || 'Information not available'}\n\n` +
        `## Subsequent Developments\n\n${sections.subsequentDevelopments || 'Information not available'}\n\n` +
        `## Repercussions and Consequences\n\n${sections.repercussionsAndConsequences || 'Information not available'}\n\n` +
        `## Media Coverage and Public Discourse\n\n${sections.mediaCoverageAndPublicDiscourse || 'Information not available'}\n\n` +
        `## Multiple Perspectives\n\n${sections.multiplePerspectives || 'Information not available'}\n\n` +
        `## Outcome and Current Status\n\n${sections.outcomeAndCurrentStatus || 'Information not available'}`
    } else {
      descriptionText = parsed.description
    }

    return {
      summary: parsed.summary,
      description: descriptionText,
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
