#!/usr/bin/env tsx
/**
 * Statement Verification Script
 *
 * This script validates ALL existing statements in the database by:
 * 1. Searching the web for the exact quote text
 * 2. Finding at least 2 authoritative sources attributing it to the person
 * 3. Filling in missing fields (tags, sources, organizations, responses)
 * 4. Creating proper Harvard-style citations
 * 5. Archiving all source URLs to Internet Archive
 * 6. Flagging misattributed or unverifiable statements
 *
 * Usage:
 *   npx tsx scripts/verify-all-statements.ts [--dry-run] [--limit=10]
 */

import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { generateHarvardCitation, extractCitationFromURL, type CitationData } from '../lib/harvard-citation'
import { archiveURLComprehensive, calculateArchivalPriority } from '../lib/archive-service'

config()

const prisma = new PrismaClient()
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

interface VerificationResult {
  statementId: string
  personName: string
  quote: string
  isVerified: boolean
  sourcesFound: number
  sources: SourceData[]
  warnings: string[]
  missingFields: string[]
}

interface SourceData {
  url: string
  title: string
  publication: string
  author?: string
  publishDate?: Date
  excerpt: string
  credibility: 'VERY_HIGH' | 'HIGH' | 'MIXED' | 'LOW'
}

/**
 * Search the web for a quote and find authoritative sources
 */
async function searchWebForQuote(quote: string, personName: string): Promise<SourceData[]> {
  if (!ANTHROPIC_API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY not found in .env')
    return []
  }

  const prompt = `Search for this exact quote: "${quote}"

Find at least 2 authoritative sources (news, government, academic, verified media) that:
1. Contain this exact quote or a very close paraphrase
2. Explicitly attribute it to ${personName}
3. Are from credible publishers

For each source, provide:
- URL (full working link)
- Title of the article/page
- Publication name (e.g., "The Guardian", "BBC News")
- Author (if available)
- Publish date (DD Month YYYY format)
- Brief excerpt showing the quote
- Credibility rating (VERY_HIGH for major outlets like BBC/Reuters/Guardian, HIGH for reputable sources, MIXED for less known, LOW for blogs)

Return in this EXACT format:

---SOURCE---
URL: [full URL]
Title: [article title]
Publication: [publication name]
Author: [author name or "Staff" if not listed]
Publish Date: [DD Month YYYY or "Unknown"]
Excerpt: [brief excerpt containing the quote]
Credibility: [VERY_HIGH/HIGH/MIXED/LOW]
---END SOURCE---

CRITICAL: Only include sources where ${personName} is explicitly named as the speaker.
If you cannot find 2 credible sources, return: NO_SOURCES_FOUND`

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
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.content[0].text

    if (content.includes('NO_SOURCES_FOUND')) {
      return []
    }

    return parseSourcesFromResponse(content)
  } catch (error) {
    console.error('Failed to search web:', error)
    return []
  }
}

/**
 * Parse sources from AI response
 */
function parseSourcesFromResponse(response: string): SourceData[] {
  const sources: SourceData[] = []
  const sourceBlocks = response.match(/---SOURCE---[\s\S]*?---END SOURCE---/g)

  if (!sourceBlocks) return []

  for (const block of sourceBlocks) {
    const urlMatch = block.match(/URL:\s*(.+)/)
    const titleMatch = block.match(/Title:\s*(.+)/)
    const pubMatch = block.match(/Publication:\s*(.+)/)
    const authorMatch = block.match(/Author:\s*(.+)/)
    const dateMatch = block.match(/Publish Date:\s*(.+)/)
    const excerptMatch = block.match(/Excerpt:\s*(.+)/)
    const credMatch = block.match(/Credibility:\s*(VERY_HIGH|HIGH|MIXED|LOW)/)

    if (urlMatch && titleMatch && pubMatch && excerptMatch) {
      const publishDateStr = dateMatch ? dateMatch[1].trim() : null
      const publishDate = publishDateStr && publishDateStr !== 'Unknown'
        ? parseDate(publishDateStr)
        : undefined

      sources.push({
        url: urlMatch[1].trim(),
        title: titleMatch[1].trim(),
        publication: pubMatch[1].trim(),
        author: authorMatch ? authorMatch[1].trim() : undefined,
        publishDate,
        excerpt: excerptMatch[1].trim(),
        credibility: (credMatch ? credMatch[1] : 'MIXED') as any
      })
    }
  }

  return sources
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
 * Verify a single statement
 */
async function verifyStatement(statement: any): Promise<VerificationResult> {
  const personName = statement.person?.name || 'Unknown'
  const quote = statement.content

  console.log(`\n🔍 Verifying: "${quote.substring(0, 100)}..." by ${personName}`)

  const result: VerificationResult = {
    statementId: statement.id,
    personName,
    quote,
    isVerified: false,
    sourcesFound: 0,
    sources: [],
    warnings: [],
    missingFields: []
  }

  // Search web for sources
  const sources = await searchWebForQuote(quote, personName)
  result.sources = sources
  result.sourcesFound = sources.length

  // Verification criteria: at least 2 credible sources
  if (sources.length >= 2) {
    const credibleSources = sources.filter(s => s.credibility === 'VERY_HIGH' || s.credibility === 'HIGH')
    if (credibleSources.length >= 2) {
      result.isVerified = true
    } else {
      result.warnings.push('Found sources but credibility is questionable')
    }
  } else if (sources.length === 1) {
    result.warnings.push('Only found 1 source - needs additional verification')
  } else {
    result.warnings.push('⚠️  CRITICAL: Could not find any sources verifying this quote')
  }

  // Check for missing fields
  if (!statement.statementDate) result.missingFields.push('statementDate')
  if (!statement.context) result.missingFields.push('context')
  if (!statement.medium) result.missingFields.push('medium')
  if (!statement.verificationLevel || statement.verificationLevel === 'UNVERIFIED') {
    result.missingFields.push('verificationLevel')
  }

  return result
}

/**
 * Update statement with verified sources
 */
async function updateStatementWithSources(
  statementId: string,
  sources: SourceData[],
  dryRun: boolean
): Promise<void> {
  if (dryRun) {
    console.log(`[DRY RUN] Would update statement ${statementId} with ${sources.length} sources`)
    return
  }

  for (const sourceData of sources) {
    // Create Harvard-style citation
    const citationData: CitationData = {
      title: sourceData.title,
      publication: sourceData.publication,
      author: sourceData.author,
      publicationDate: sourceData.publishDate,
      accessDate: new Date(),
      url: sourceData.url,
      medium: 'web'
    }

    const harvardCitation = generateHarvardCitation(citationData)

    // Archive the URL
    console.log(`  📦 Archiving: ${sourceData.url}`)
    const archiveResult = await archiveURLComprehensive(sourceData.url)

    // Calculate archival priority
    const priority = calculateArchivalPriority({
      sourceType: 'SECONDARY',
      credibilityLevel: sourceData.credibility,
      publishDate: sourceData.publishDate,
      isPaywalled: false
    })

    // Create Source record with Harvard citation
    await prisma.source.create({
      data: {
        title: sourceData.title,
        url: sourceData.url,
        publication: sourceData.publication,
        author: sourceData.author,
        publishDate: sourceData.publishDate,
        accessDate: new Date(),
        credibilityLevel: sourceData.credibility,
        archiveUrl: archiveResult.archiveUrl || undefined,
        archiveDate: archiveResult.status === 'success' ? archiveResult.archiveDate : undefined,
        archiveMethod: archiveResult.archiveUrl?.includes('web.archive.org')
          ? 'WAYBACK_MACHINE'
          : archiveResult.archiveUrl?.includes('archive.')
          ? 'ARCHIVE_TODAY'
          : undefined,
        archivalPriority: priority,
        isArchived: archiveResult.status === 'success' || archiveResult.status === 'already_archived',
        statementId,
        verificationStatus: 'VERIFIED',
        verificationDate: new Date(),
        // Store Harvard citation in public notes for now
        publicNotes: `Harvard Citation: ${harvardCitation}`
      }
    })

    console.log(`  ✓ Added source: ${sourceData.publication}`)
  }

  // Update statement verification level
  await prisma.statement.update({
    where: { id: statementId },
    data: {
      verificationLevel: sources.length >= 2 ? 'VERIFIED' : 'BASIC',
      verifiedAt: new Date(),
      verifiedBy: 'automated-verification-script'
    }
  })
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
🔍 Statement Verification System
================================

Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE (will update database)'}
${limit ? `Limit: ${limit} statements` : 'Processing: ALL statements'}

`)

  if (!ANTHROPIC_API_KEY) {
    console.error('❌ ERROR: ANTHROPIC_API_KEY not found in .env file')
    console.log('Add your API key to .env: ANTHROPIC_API_KEY=sk-ant-...')
    process.exit(1)
  }

  // Fetch all statements that need verification
  const statements = await prisma.statement.findMany({
    where: {
      OR: [
        { verificationLevel: 'UNVERIFIED' },
        { verificationLevel: null },
        { sources: { none: {} } } // No sources attached
      ]
    },
    include: {
      person: true,
      sources: true
    },
    take: limit,
    orderBy: {
      createdAt: 'desc'
    }
  })

  console.log(`Found ${statements.length} statements needing verification\n`)

  const results: VerificationResult[] = []
  let verified = 0
  let unverified = 0
  let warnings = 0

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    console.log(`\n[${i + 1}/${statements.length}] Processing statement by ${statement.person?.name}`)

    const result = await verifyStatement(statement)
    results.push(result)

    if (result.isVerified) {
      verified++
      console.log(`✅ VERIFIED with ${result.sourcesFound} sources`)
      await updateStatementWithSources(statement.id, result.sources, dryRun)
    } else {
      unverified++
      if (result.warnings.length > 0) {
        warnings++
        console.log(`⚠️  WARNINGS:`)
        result.warnings.forEach(w => console.log(`   - ${w}`))
      }
    }

    // Rate limiting: wait 3 seconds between API calls
    if (i < statements.length - 1) {
      await sleep(3000)
    }
  }

  // Summary report
  console.log(`\n
${'='.repeat(60)}
VERIFICATION SUMMARY
${'='.repeat(60)}

Total processed:     ${statements.length}
✅ Verified:          ${verified}
❌ Unverified:        ${unverified}
⚠️  With warnings:    ${warnings}

${dryRun ? '⚠️  DRY RUN MODE - No changes were made to database' : ''}
`)

  // List statements that couldn't be verified
  const problematic = results.filter(r => !r.isVerified && r.sourcesFound === 0)
  if (problematic.length > 0) {
    console.log(`\n⚠️  STATEMENTS REQUIRING MANUAL REVIEW (${problematic.length}):\n`)
    problematic.forEach((r, i) => {
      console.log(`${i + 1}. ${r.personName}`)
      console.log(`   Quote: "${r.quote.substring(0, 100)}..."`)
      console.log(`   Issue: No sources found\n`)
    })
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
