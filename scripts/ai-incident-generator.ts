#!/usr/bin/env tsx
/**
 * AI Incident Generator
 *
 * This script uses AI to research and generate incident markdown files automatically.
 *
 * Usage:
 *   npx tsx scripts/ai-incident-generator.ts "Person Name" [--auto-import]
 *
 * Example:
 *   npx tsx scripts/ai-incident-generator.ts "Elon Musk" --auto-import
 *
 * Setup:
 *   1. Add your OpenAI or Anthropic API key to .env
 *   2. Run this script with a person's name
 *   3. AI will research and create a markdown file
 *   4. Use --auto-import to automatically import to database
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
import { config } from 'dotenv'
import { generateHarvardCitation, extractCitationFromURL } from '../lib/harvard-citation'
import { saveToWaybackMachine, checkWaybackArchive } from '../lib/archive-service'
import { classifyIntoTopics } from '../lib/topic-classifier'

// Load environment variables
config()

// Configuration
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const DATA_DIR = path.join(process.cwd(), 'data')
const AUTO_GENERATED_DIR = path.join(DATA_DIR, 'auto-generated')

interface IncidentData {
  personName: string
  profession: string
  date: string
  exactWording: string
  context: string
  platform: string
  mediaCoverage: string
  categories: string
  responseOutcome: string
  citations: string
}

/**
 * AI Research Prompt Template
 */
function getResearchPrompt(personName: string): string {
  return `Research any public statement, comment, or position by ${personName} related to Israel, Palestine, Jews, Judaism, Zionism, or antisemitism.

CRITICAL REQUIREMENTS - Find a statement that:
1. Is directly related to Israel, Palestine, Jews, Judaism, Zionism, antisemitism, or the Israeli-Palestinian conflict
2. Was made publicly by ${personName} (speech, tweet, interview, vote, letter, etc.)
3. Is verifiable with credible sources
4. The statement does NOT need to be controversial - it can be supportive, neutral, or critical
5. Include the most notable or well-documented statement on this topic
6. If absolutely NO statement exists on this topic, return "NO_INCIDENT_FOUND"

IMPORTANT: Almost all politicians have made statements on Israel/Palestine - look for speeches, votes, tweets, interviews, letters, or policy positions. Include any relevant statement, whether supportive, neutral, or critical.

Find the most notable verifiable statement:

Return the information in this EXACT format (replace placeholders with actual data):

## ${personName}

### PERSON INFORMATION (COMPLETE ALL FIELDS - RESEARCH THOROUGHLY):
CRITICAL: Every field must be completed with accurate information. Research thoroughly to fill ALL fields.

- **AKA Names:** [Alternative names, nicknames, maiden names - comma separated. If none, write "N/A"]
- **Profession:** [REQUIRED - Comma-separated tags from: Politician, Actor, Journalist, Activist, Podcaster, Painter, Singer, Presenter, News Anchor, TV Personality, Entrepreneur, Diplomat, Author, Comedian, etc.]
- **Role Description:** [REQUIRED - Short description of their main job/role]
- **Years Active:** [REQUIRED - e.g., "2005-2019" or "2005-present"]
- **Best Known For:** [REQUIRED - One sentence summary of what they're famous for]
- **Nationality:** [REQUIRED - MUST be country name (ISO standard), NEVER use adjectives like "British" or "American". Correct: "United Kingdom", "United States", "France". For dual citizenship use comma-separated: "United Kingdom, Ireland". Use "Stateless" for stateless individuals.]
- **Racial/Ethnic Group:** [REQUIRED - If publicly known, specify. Examples: "White", "Black", "Arab", "Jewish", "Asian", etc. If not publicly known, write "Not publicly disclosed"]
- **Religion:** [REQUIRED - Choose EXACTLY ONE: Jewish, Christian, Muslim, Hindu, Buddhist, Sikh, Other, Unknown, No Religion. DO NOT use "Atheist" or "Agnostic" here.]
- **Religious Denomination:** [REQUIRED - Specific denomination/affiliation. IF Christian: Anglican, Baptist, Evangelical, Lutheran, Methodist, Orthodox, Roman Catholic, Presbyterian, etc. IF Muslim: Sunni, Shia, Ahmadiyya, Ibadi, etc. IF Jewish: Modern Orthodox, Haredi, Hasidic, Conservative, Reform, Reconstructionist, Sephardi, Mizrahi, etc. IF No Religion: Atheist, Agnostic, Spiritual, Secular Humanist, etc. IF Other: Scientology, Baháʼí, Jainism, Zoroastrianism, Rastafarianism, etc. IF Hindu/Buddhist/Sikh/Unknown: "Not Applicable"]
- **Birth Date:** [REQUIRED - DD Month YYYY format - Research to find exact date]
- **Birth Place:** [REQUIRED - City, Country]
- **Death Date:** [DD Month YYYY format - ONLY if deceased, otherwise leave blank]
- **Death Place:** [City, Country - ONLY if deceased, otherwise leave blank]
- **Residence:** [REQUIRED if alive - Current main place of residence - City, Country]
- **Political Party:** [If applicable - Party name with years in brackets if changed, e.g., "Labour Party (2005-present)". If not in a party, write "Independent" or "N/A"]
- **Political Beliefs:** [REQUIRED - Political ideology/position if known: Progressive, Conservative, Liberal, Socialist, Libertarian, Centrist, etc. If not publicly known, write "Not publicly disclosed"]
- **Biography:** [REQUIRED - 3-4 medium paragraphs covering: Early life and background, Career development and achievements, Current work and influence, Controversial positions or public stances if relevant]
- **Affiliated Organizations:** [REQUIRED - Format as: "Organization Name (Role)" - comma separated. Specify the person's role/relationship with each organization. Examples: "Labour Party (Elected Politician)", "UK Parliament (Member of Parliament)", "Campaign for Nuclear Disarmament (Activist)", "Momentum (Supporter)", "Daily Telegraph (Columnist)", "UN (Ambassador)", "Conservative Party (Former Leader)". Use roles like: Elected Politician, Member, Activist, Supporter, Founder, Board Member, Columnist, Employee, Ambassador, Former Leader, etc. If none, list their employer/company.]

### STATEMENT/INCIDENT INFORMATION:
- **Date:** [Date in format: DD Month YYYY - THIS IS PARAMOUNT, FIND THE EXACT DATE]
- **Exact Wording:** *"[The exact quote or statement, or 'N/A' if not applicable]"*
- **Context:** [Detailed background: What was happening? What led to this? What were the circumstances?]
- **Platform:** [Where it occurred: Instagram, Twitter, Court, Interview, etc.]
- **Media Coverage / Framing:** [How did major outlets report this? Include key headlines and perspectives. Be neutral and factual.]
- **Categories:** [3-5 relevant categories separated by /]
- **Response / Outcome:** [How did the person respond? Was there an apology, clarification, legal outcome, or further action?]
- **Repercussions:** [Answer YES or NO for each]
  - Lost Employment: [YES/NO - Did they lose their job/employment as a result?]
  - Lost Contracts: [YES/NO - Did they lose contracts, sponsorships, or deals?]
  - Painted Negatively: [YES/NO - Were they painted negatively in media coverage, regardless of whether rightly or wrongly?]
  - Details: [Brief description of the repercussions if any occurred]
- **Citations:** [List 2-3 credible source URLs with titles, publication names, and dates for Harvard citation]

### RESPONSES TO THE STATEMENT (CRITICAL - RESEARCH THOROUGHLY):
IMPORTANT: Research if ANYONE responded to this statement - on social media, in interviews, in statements, or directly. Include ALL significant responses.

Format each response as:
---RESPONSE---
- **Responder Name:** [Full name of person/organization who responded]
- **Responder Type:** [Person/Organization]
- **Response Date:** [DD Month YYYY - exact date of response]
- **Response Content:** *"[Exact quote of their response]"*
- **Response Type:** [Criticism/Support/Clarification/Apology/Denial]
- **Platform:** [Where they responded: Twitter, Interview, Statement, etc.]
- **Impact:** [Brief description of what happened after this response]
---END RESPONSE---

IMPORTANT: If NO responses were found, write: "NO_RESPONSES_FOUND"
Include responses from: politicians, celebrities, organizations, activists, journalists, etc.

IMPORTANT RULES:
- Be strictly factual and neutral
- Only include verified information
- Use direct quotes when available
- Cite credible sources (major news outlets, court documents, official statements)
- If no significant incident exists, say "NO_INCIDENT_FOUND"
- Format dates as: "3 January 2022" not "Jan 3, 2022"
- Categories should be general topics like: Legal / Entertainment / Politics / Social Media / Business / Sports / Child Safety / Solidarity / etc.`
}

/**
 * Call AI API to research incident
 */
async function researchIncident(personName: string): Promise<string | null> {
  console.log(`🤖 AI is researching incidents involving ${personName}...`)

  // For now, this is a placeholder that shows how to structure the API call
  // You'll need to add actual API integration below

  if (ANTHROPIC_API_KEY) {
    return await callAnthropicAPI(personName)
  } else if (OPENAI_API_KEY) {
    return await callOpenAIAPI(personName)
  } else {
    console.error('❌ No AI API key found!')
    console.log('\nTo use AI automation, add one of these to your .env file:')
    console.log('  ANTHROPIC_API_KEY=your_key_here')
    console.log('  OPENAI_API_KEY=your_key_here')
    console.log('\nAlternatively, you can manually create markdown files in data/ folder.')
    return null
  }
}

/**
 * Call Anthropic Claude API
 */
async function callAnthropicAPI(personName: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: getResearchPrompt(personName)
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Response:', response.status, errorText)
      throw new Error(`API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.content[0].text

    if (content.includes('NO_INCIDENT_FOUND')) {
      console.log(`ℹ️  No significant incidents found for ${personName}`)
      return null
    }

    return content
  } catch (error) {
    console.error('❌ Anthropic API error:', error)
    return null
  }
}

/**
 * Call OpenAI API
 */
async function callOpenAIAPI(personName: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'user',
          content: getResearchPrompt(personName)
        }],
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    if (content.includes('NO_INCIDENT_FOUND')) {
      console.log(`ℹ️  No significant incidents found for ${personName}`)
      return null
    }

    return content
  } catch (error) {
    console.error('❌ OpenAI API error:', error)
    return null
  }
}

/**
 * Process citations and add Harvard formatting with archiving
 */
async function processCitations(content: string): Promise<string> {
  console.log('📚 Processing citations with Harvard format and archiving...')

  // Extract citation URLs from the content
  const citationRegex = /- \*\*Citations:\*\* \[(.*?)\]/g
  const match = citationRegex.exec(content)

  if (!match || !match[1]) return content

  const citations = match[1].split(',').map(c => c.trim())
  const harvardCitations: string[] = []

  for (const citation of citations) {
    // If it's a URL, extract citation info and archive it
    if (citation.startsWith('http')) {
      try {
        // Archive the URL
        const archiveResult = await saveToWaybackMachine(citation)

        // Extract citation data from URL
        const citationData = await extractCitationFromURL(citation)

        // Generate Harvard citation
        const harvardCitation = generateHarvardCitation({
          ...citationData,
          archiveUrl: archiveResult.archiveUrl
        })

        harvardCitations.push(harvardCitation)
      } catch (error) {
        console.warn(`⚠️ Could not process citation: ${citation}`)
        harvardCitations.push(citation) // Keep original if processing fails
      }
    } else {
      harvardCitations.push(citation)
    }
  }

  // Replace citations in content with Harvard format
  const harvardCitationsText = harvardCitations.join('\n  ')
  return content.replace(
    /- \*\*Citations:\*\* \[.*?\]/,
    `- **Citations (Harvard Style):**\n  ${harvardCitationsText}`
  )
}

/**
 * Add topic classification to content
 */
async function addTopicClassification(content: string, personName: string): Promise<string> {
  console.log('🏷️ Classifying topics...')

  try {
    // Extract the statement/incident section
    const statementMatch = content.match(/- \*\*Exact Wording:\*\* \*"(.*?)"\*/s)
    const contextMatch = content.match(/- \*\*Context:\*\* (.*?)\n/s)

    if (statementMatch && contextMatch) {
      const classification = await classifyIntoTopics(
        statementMatch[1],
        contextMatch[1],
        personName,
        null
      )

      // Add topic classification to content
      const topicSection = `
### TOPIC CLASSIFICATION:
- **Primary Topics:** ${classification.topics.join(', ')}
- **Relevance Scores:** ${JSON.stringify(classification.relevanceScores)}
- **Confidence:** ${classification.confidence}
- **Related Topics:** ${classification.relatedTopics.join(', ')}
`

      // Insert before the RESPONSES section
      return content.replace(
        '### RESPONSES TO THE STATEMENT',
        topicSection + '\n### RESPONSES TO THE STATEMENT'
      )
    }
  } catch (error) {
    console.warn('⚠️ Could not classify topics:', error)
  }

  return content
}

/**
 * Save markdown file
 */
function saveMarkdownFile(personName: string, content: string): string {
  // Create auto-generated directory if it doesn't exist
  if (!fs.existsSync(AUTO_GENERATED_DIR)) {
    fs.mkdirSync(AUTO_GENERATED_DIR, { recursive: true })
  }

  const slug = personName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `${slug}-${timestamp}.md`
  const filepath = path.join(AUTO_GENERATED_DIR, filename)

  fs.writeFileSync(filepath, content, 'utf-8')
  console.log(`✅ Markdown file created: ${filepath}`)

  return filepath
}

/**
 * Auto-import to database
 */
function importToDatabase(filepath: string): boolean {
  try {
    console.log(`\n📥 Importing to database...`)
    execSync(`npx tsx scripts/import-markdown-enhanced.ts "${filepath}"`, {
      stdio: 'inherit',
      cwd: process.cwd()
    })
    console.log(`✅ Successfully imported to database!`)
    return true
  } catch (error) {
    console.error('❌ Import failed:', error)
    return false
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
🤖 AI Incident Generator

Usage:
  npx tsx scripts/ai-incident-generator.ts "Person Name" [--auto-import]

Examples:
  npx tsx scripts/ai-incident-generator.ts "Elon Musk"
  npx tsx scripts/ai-incident-generator.ts "Taylor Swift" --auto-import

Options:
  --auto-import    Automatically import the generated file to database
  --help           Show this help message

Setup:
  Add your AI API key to .env:
    ANTHROPIC_API_KEY=your_key_here
  or
    OPENAI_API_KEY=your_key_here
`)
    process.exit(0)
  }

  const personName = args.find(arg => !arg.startsWith('--')) || ''
  const autoImport = args.includes('--auto-import')

  if (!personName) {
    console.error('❌ Please provide a person name')
    console.log('Example: npx tsx scripts/ai-incident-generator.ts "Person Name"')
    process.exit(1)
  }

  console.log(`\n🚀 Starting AI research for: ${personName}\n`)

  // Research incident using AI
  let markdownContent = await researchIncident(personName)

  if (!markdownContent) {
    console.log('\n❌ Failed to generate incident data')
    process.exit(1)
  }

  // Process citations with Harvard format and archiving
  markdownContent = await processCitations(markdownContent)

  // Add topic classification
  markdownContent = await addTopicClassification(markdownContent, personName)

  // Save to markdown file
  const filepath = saveMarkdownFile(personName, markdownContent)

  // Optional: Auto-import to database
  if (autoImport) {
    const success = importToDatabase(filepath)
    if (success) {
      console.log(`\n✨ All done! Check your website to see the new incident.`)
    }
  } else {
    console.log(`\n✨ Markdown file created!`)
    console.log(`\nTo import to database, run:`)
    console.log(`  npx tsx scripts/import-markdown.ts "${filepath}"`)
  }
}

main().catch(console.error)
