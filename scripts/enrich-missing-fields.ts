#!/usr/bin/env tsx
/**
 * Missing Field Enrichment Script
 *
 * Searches web and asks Claude API to fill in missing Person fields:
 * - Nationality
 * - Date of birth
 * - Religious affiliation
 * - Political movement/party
 *
 * Uses small, focused queries (3-4 fields at a time) for better accuracy.
 *
 * Usage:
 *   npx tsx scripts/enrich-missing-fields.ts [--dry-run] [--limit=10]
 */

import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config()

const prisma = new PrismaClient()
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

interface EnrichmentData {
  nationality?: string
  dateOfBirth?: string
  religion?: string
  religionDenomination?: string
  politicalParty?: string
  politicalBeliefs?: string
  confidence: 'high' | 'medium' | 'low'
  sources: string[]
}

/**
 * Query Claude for missing fields (in small batches)
 */
async function queryMissingFields(personName: string, missingFields: string[]): Promise<EnrichmentData | null> {
  if (!ANTHROPIC_API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY not found')
    return null
  }

  // Build focused prompt for 3-4 fields
  const fieldQuestions = []
  if (missingFields.includes('nationality')) {
    fieldQuestions.push('- What is the nationality of this person? (provide country name, not adjective)')
  }
  if (missingFields.includes('dateOfBirth')) {
    fieldQuestions.push('- What is the date of birth? (DD Month YYYY format)')
  }
  if (missingFields.includes('religion')) {
    fieldQuestions.push('- What is the religious affiliation? (Jewish, Christian, Muslim, Hindu, Buddhist, Sikh, No Religion, Unknown)')
  }
  if (missingFields.includes('religionDenomination')) {
    fieldQuestions.push('- What is the specific religious denomination? (e.g., Roman Catholic, Sunni, Reform Jewish, etc.)')
  }
  if (missingFields.includes('politicalParty')) {
    fieldQuestions.push('- What political party are they affiliated with? (with years if changed parties)')
  }
  if (missingFields.includes('politicalBeliefs')) {
    fieldQuestions.push('- What are their political beliefs/ideology? (Progressive, Conservative, Liberal, Socialist, etc.)')
  }

  const prompt = `Please provide factual, verifiable information about ${personName}:

${fieldQuestions.join('\n')}

CRITICAL INSTRUCTIONS:
- Only provide information that is publicly documented and verifiable
- If you're not certain, say "Unknown" rather than guessing
- Provide sources (URLs) for your information
- Use proper formatting (country names not adjectives, dates as DD Month YYYY)

Return in this EXACT format:

---DATA---
Nationality: [country name or "Unknown"]
Date of Birth: [DD Month YYYY or "Unknown"]
Religion: [Jewish/Christian/Muslim/Hindu/Buddhist/Sikh/No Religion/Unknown]
Religion Denomination: [specific denomination or "N/A"]
Political Party: [party name with years or "Unknown"]
Political Beliefs: [ideology or "Unknown"]
Confidence: [high/medium/low]
Sources: [comma-separated URLs or "Public knowledge"]
---END DATA---

If absolutely no information is available, return: NO_DATA_FOUND`

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
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.content[0].text

    if (content.includes('NO_DATA_FOUND')) {
      return null
    }

    return parseEnrichmentData(content)
  } catch (error) {
    console.error('Failed to query API:', error)
    return null
  }
}

/**
 * Parse enrichment data from AI response
 */
function parseEnrichmentData(response: string): EnrichmentData | null {
  const dataBlock = response.match(/---DATA---[\s\S]*?---END DATA---/)
  if (!dataBlock) return null

  const text = dataBlock[0]

  const result: EnrichmentData = {
    confidence: 'medium',
    sources: []
  }

  const nationalityMatch = text.match(/Nationality:\s*(.+)/)
  if (nationalityMatch && nationalityMatch[1].trim() !== 'Unknown') {
    result.nationality = nationalityMatch[1].trim()
  }

  const dobMatch = text.match(/Date of Birth:\s*(.+)/)
  if (dobMatch && dobMatch[1].trim() !== 'Unknown') {
    result.dateOfBirth = dobMatch[1].trim()
  }

  const religionMatch = text.match(/Religion:\s*(.+)/)
  if (religionMatch && religionMatch[1].trim() !== 'Unknown') {
    result.religion = religionMatch[1].trim()
  }

  const denomMatch = text.match(/Religion Denomination:\s*(.+)/)
  if (denomMatch && denomMatch[1].trim() !== 'N/A' && denomMatch[1].trim() !== 'Unknown') {
    result.religionDenomination = denomMatch[1].trim()
  }

  const partyMatch = text.match(/Political Party:\s*(.+)/)
  if (partyMatch && partyMatch[1].trim() !== 'Unknown') {
    result.politicalParty = partyMatch[1].trim()
  }

  const beliefsMatch = text.match(/Political Beliefs:\s*(.+)/)
  if (beliefsMatch && beliefsMatch[1].trim() !== 'Unknown') {
    result.politicalBeliefs = beliefsMatch[1].trim()
  }

  const confidenceMatch = text.match(/Confidence:\s*(high|medium|low)/)
  if (confidenceMatch) {
    result.confidence = confidenceMatch[1] as any
  }

  const sourcesMatch = text.match(/Sources:\s*(.+)/)
  if (sourcesMatch) {
    result.sources = sourcesMatch[1].split(',').map(s => s.trim())
  }

  return result
}

/**
 * Enrich a single person's data
 */
async function enrichPerson(person: any, dryRun: boolean): Promise<boolean> {
  // Identify missing fields
  const missingFields: string[] = []

  if (!person.primaryNationality) {
    missingFields.push('nationality')
  }
  if (!person.dateOfBirth && !person.birthDate) {
    missingFields.push('dateOfBirth')
  }
  if (!person.religion) {
    missingFields.push('religion')
  }
  if (!person.religionDenomination) {
    missingFields.push('religionDenomination')
  }
  if (!person.politicalParty) {
    missingFields.push('politicalParty')
  }
  if (!person.politicalBeliefs) {
    missingFields.push('politicalBeliefs')
  }
  if (!person.shortBio) {
    missingFields.push('shortBio')
  }
  if (!person.bestKnownFor) {
    missingFields.push('bestKnownFor')
  }

  if (missingFields.length === 0) {
    return false // Nothing to enrich
  }

  console.log(`  🔍 Querying for: ${missingFields.join(', ')}`)

  const enrichmentData = await queryMissingFields(person.name, missingFields)

  if (!enrichmentData) {
    console.log(`  ⚠️  No data found`)
    return false
  }

  if (dryRun) {
    console.log(`  [DRY RUN] Would update with:`)
    if (enrichmentData.nationality) console.log(`    Nationality: ${enrichmentData.nationality}`)
    if (enrichmentData.dateOfBirth) console.log(`    DOB: ${enrichmentData.dateOfBirth}`)
    if (enrichmentData.religion) console.log(`    Religion: ${enrichmentData.religion}`)
    if (enrichmentData.religionDenomination) console.log(`    Denomination: ${enrichmentData.religionDenomination}`)
    if (enrichmentData.politicalParty) console.log(`    Party: ${enrichmentData.politicalParty}`)
    if (enrichmentData.politicalBeliefs) console.log(`    Beliefs: ${enrichmentData.politicalBeliefs}`)
    console.log(`    Confidence: ${enrichmentData.confidence}`)
    return true
  }

  // Update database
  const updateData: any = {}

  if (enrichmentData.nationality) {
    updateData.nationality = enrichmentData.nationality
  }
  if (enrichmentData.dateOfBirth) {
    const date = parseDate(enrichmentData.dateOfBirth)
    if (date) updateData.dateOfBirth = date
  }
  if (enrichmentData.religion) {
    updateData.religion = enrichmentData.religion
  }
  if (enrichmentData.religionDenomination) {
    updateData.religionDenomination = enrichmentData.religionDenomination
  }
  if (enrichmentData.politicalParty) {
    updateData.politicalParty = enrichmentData.politicalParty
  }
  if (enrichmentData.politicalBeliefs) {
    updateData.politicalBeliefs = enrichmentData.politicalBeliefs
  }

  // Add sources to internal notes
  if (enrichmentData.sources.length > 0) {
    updateData.internalNotes = `Auto-enriched sources:\n${enrichmentData.sources.join('\n')}`
  }

  await prisma.person.update({
    where: { id: person.id },
    data: updateData
  })

  console.log(`  ✅ Enriched (confidence: ${enrichmentData.confidence})`)
  return true
}

/**
 * Parse date string
 */
function parseDate(dateStr: string): Date | undefined {
  try {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? undefined : date
  } catch {
    return undefined
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const limitArg = args.find(arg => arg.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined

  console.log(`
🔍 Missing Field Enrichment Script
==================================

Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE (will update database)'}
${limit ? `Limit: ${limit} people` : 'Processing: ALL people'}

`)

  if (!ANTHROPIC_API_KEY) {
    console.error('❌ ERROR: ANTHROPIC_API_KEY not found in .env')
    process.exit(1)
  }

  // Fetch people with missing fields
  const people = await prisma.person.findMany({
    where: {
      OR: [
        { primaryNationality: null },
        { dateOfBirth: null },
        { religion: null },
        { politicalParty: null },
        { politicalBeliefs: null },
        { shortBio: null },
        { bestKnownFor: null }
      ]
    },
    take: limit,
    orderBy: {
      statementCount: 'desc' // Prioritize people with more statements
    }
  })

  console.log(`Found ${people.length} people with missing fields\n`)

  let enriched = 0
  let noData = 0
  let errors = 0

  for (let i = 0; i < people.length; i++) {
    const person = people[i]
    console.log(`\n[${i + 1}/${people.length}] ${person.name}`)

    try {
      const wasEnriched = await enrichPerson(person, dryRun)
      if (wasEnriched) {
        enriched++
      } else {
        noData++
      }

      // Rate limiting: 3 seconds between API calls
      if (i < people.length - 1) {
        await sleep(3000)
      }
    } catch (error) {
      console.error(`  ❌ Error:`, error)
      errors++
    }
  }

  // Summary
  console.log(`\n
${'='.repeat(60)}
SUMMARY
${'='.repeat(60)}

Total processed:     ${people.length}
✅ Enriched:          ${enriched}
⚠️  No data found:    ${noData}
❌ Errors:            ${errors}

${dryRun ? '⚠️  DRY RUN MODE - No changes were made' : '✅ Database updated successfully'}
`)

  if (dryRun && enriched > 0) {
    console.log(`\n💡 Run without --dry-run to apply:\n   npx tsx scripts/enrich-missing-fields.ts\n`)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
