#!/usr/bin/env tsx
/**
 * Batch Statement Verification Script
 * Verifies unverified statements in small batches to manage costs
 * Uses Claude Pro subscription efficiently
 */

import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { generateHarvardCitation, extractCitationFromURL } from '../lib/harvard-citation'
import { saveToWaybackMachine } from '../lib/archive-service'

config()

const prisma = new PrismaClient()
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY not found in .env')
  process.exit(1)
}

interface VerificationResult {
  isVerified: boolean
  sources: Array<{
    url: string
    title: string
    publication: string
    date: string
    author?: string
    harvardCitation: string
    archiveUrl?: string
  }>
  confidence: number
  notes: string
}

async function verifyStatementWithClaude(
  quote: string,
  personName: string,
  date: string,
  context: string
): Promise<VerificationResult> {
  const prompt = `Verify this statement by searching for credible sources:

Person: ${personName}
Date: ${date}
Statement: "${quote}"
Context: ${context}

TASK:
1. Search for credible sources that confirm this exact statement or very similar wording
2. Prioritize: major news outlets, official transcripts, verified social media, court documents
3. Return at least 2 independent sources if the statement is verifiable
4. Assess confidence level (0.0-1.0) based on source quality and consistency

Return JSON only:
{
  "isVerified": boolean,
  "sources": [
    {
      "url": "full URL",
      "title": "article title",
      "publication": "publication name",
      "date": "YYYY-MM-DD",
      "author": "author name if available"
    }
  ],
  "confidence": 0.0-1.0,
  "notes": "brief verification notes"
}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY!,
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
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.content[0].text

    // Parse JSON from Claude's response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const result = JSON.parse(jsonMatch[0])

    // Process sources to add Harvard citations and archiving
    const processedSources = []
    for (const source of result.sources || []) {
      try {
        // Try to archive the URL (but don't fail if archiving fails)
        let archiveUrl = undefined
        try {
          const archiveResult = await saveToWaybackMachine(source.url)
          archiveUrl = archiveResult.archiveUrl
        } catch (archiveError) {
          console.warn(`⚠️ Could not archive ${source.url}, continuing without archive`)
        }

        // Generate Harvard citation
        const harvardCitation = generateHarvardCitation({
          author: source.author || 'Unknown',
          year: new Date(source.date).getFullYear(),
          title: source.title,
          publication: source.publication,
          publicationDate: new Date(source.date),
          url: source.url,
          archiveUrl,
          accessDate: new Date()
        })

        processedSources.push({
          ...source,
          harvardCitation,
          archiveUrl
        })
      } catch (error) {
        console.warn(`⚠️ Could not process source: ${source.url}`)
        processedSources.push(source)
      }
    }

    return {
      ...result,
      sources: processedSources
    }
  } catch (error) {
    console.error('❌ Verification error:', error)
    return {
      isVerified: false,
      sources: [],
      confidence: 0,
      notes: `Verification failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

async function verifyStatements(limit: number = 10) {
  console.log(`\n🔍 Starting statement verification (batch of ${limit})...\n`)

  // Get unverified statements
  const statements = await prisma.statement.findMany({
    where: { isVerified: false },
    take: limit,
    include: {
      person: true,
      organization: true
    }
  })

  if (statements.length === 0) {
    console.log('✅ All statements are already verified!')
    return
  }

  console.log(`Found ${statements.length} unverified statements to process\n`)

  let verified = 0
  let failed = 0

  for (const statement of statements) {
    const entityName = statement.person?.name || statement.organization?.name || 'Unknown'
    const quote = statement.content?.substring(0, 100) || ''

    console.log(`\nVerifying: ${entityName}`)
    console.log(`Quote: "${quote}..."`)

    // Rate limiting - wait 1 second between API calls
    await new Promise(resolve => setTimeout(resolve, 1000))

    const result = await verifyStatementWithClaude(
      statement.content || '',
      entityName,
      statement.statementDate.toISOString().split('T')[0],
      statement.context || ''
    )

    if (result.isVerified && result.sources.length > 0) {
      // Create source records
      const sourceRecords = []
      for (const source of result.sources) {
        const sourceRecord = await prisma.source.create({
          data: {
            url: source.url,
            title: source.title,
            publication: source.publication,
            author: source.author || null,
            publishDate: new Date(source.date),
            archiveUrl: source.archiveUrl || null,
            credibilityLevel: result.confidence > 0.8 ? 'VERY_HIGH' :
                           result.confidence > 0.5 ? 'HIGH' : 'MIXED',
            statementId: statement.id
          }
        })
        sourceRecords.push(sourceRecord)
      }

      // Update statement
      await prisma.statement.update({
        where: { id: statement.id },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
          verifiedBy: 'AI Verification System',
          verificationLevel: result.confidence > 0.8 ? 'FULLY_VERIFIED' :
                           result.confidence > 0.5 ? 'VERIFIED' : 'BASIC',
          primarySourceId: sourceRecords[0]?.id
        }
      })

      console.log(`✅ Verified with ${result.sources.length} sources (confidence: ${result.confidence})`)
      verified++
    } else {
      console.log(`❌ Could not verify: ${result.notes}`)
      failed++
    }
  }

  console.log(`\n📊 Verification Summary:`)
  console.log(`   ✅ Verified: ${verified}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log(`   📝 Total processed: ${verified + failed}`)

  // Check remaining
  const remaining = await prisma.statement.count({
    where: { isVerified: false }
  })
  console.log(`   ⏳ Remaining unverified: ${remaining}`)

  if (remaining > 0) {
    console.log(`\nTo continue verification, run:`)
    console.log(`  npx tsx scripts/verify-statements-batch.ts`)
  }

  await prisma.$disconnect()
}

// Parse command line arguments
const args = process.argv.slice(2)
const limit = args[0] ? parseInt(args[0]) : 10

if (args.includes('--help')) {
  console.log(`
Statement Verification Script

Usage:
  npx tsx scripts/verify-statements-batch.ts [limit]

Examples:
  npx tsx scripts/verify-statements-batch.ts        # Verify 10 statements (default)
  npx tsx scripts/verify-statements-batch.ts 20     # Verify 20 statements
  npx tsx scripts/verify-statements-batch.ts 5      # Verify 5 statements

Options:
  [limit]    Number of statements to verify (default: 10)
  --help     Show this help message

This script:
- Verifies unverified statements using Claude API
- Creates Harvard-style citations for sources
- Archives all source URLs to Wayback Machine
- Updates database with verification results
- Manages API costs by processing in small batches
`)
  process.exit(0)
}

verifyStatements(limit).catch(console.error)