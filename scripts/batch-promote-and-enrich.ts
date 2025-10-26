/**
 * Batch Promote and Enrich Cases
 *
 * Processes multiple cases at once based on assessment scores
 * Promotes cases to full status and optionally enriches them with AI
 *
 * Usage:
 *   npx ts-node scripts/batch-promote-and-enrich.ts --min-score 75
 *   npx ts-node scripts/batch-promote-and-enrich.ts --min-score 75 --enrich
 *   npx ts-node scripts/batch-promote-and-enrich.ts --min-score 75 --enrich --web-search
 *   npx ts-node scripts/batch-promote-and-enrich.ts --slugs-file worthy-cases.txt --enrich
 */

import { PrismaClient } from '@prisma/client'
import { enrichCase, testConnection, type CaseEnrichmentInput } from '../lib/claude-api'
import { enrichedCaseSearch, testTavilyConnection } from '../lib/tavily-search'
import * as fs from 'fs'

const prisma = new PrismaClient()

interface BatchOptions {
  minScore?: number
  slugsFile?: string
  enrich?: boolean
  webSearch?: boolean
  dryRun?: boolean
  limit?: number
}

/**
 * Load slugs from assessment log file
 */
function loadSlugsFromAssessment(minScore: number): string[] {
  const logPath = '/tmp/case-assessment.log'

  if (!fs.existsSync(logPath)) {
    console.error('❌ Assessment log not found at /tmp/case-assessment.log')
    console.error('   Run: npx ts-node scripts/assess-case-worthiness.ts --scan-all')
    process.exit(1)
  }

  const content = fs.readFileSync(logPath, 'utf-8')
  const lines = content.split('\n')

  const slugs: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Look for case-worthy entries in the summary section
    // Format: "1. slug-here"
    const summaryMatch = line.match(/^\d+\.\s+([a-z0-9-]+)$/)
    if (summaryMatch) {
      const slug = summaryMatch[1]
      // Check the next few lines for the score
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const scoreMatch = lines[j].match(/Score:\s+(\d+)\/100/)
        if (scoreMatch) {
          const score = parseInt(scoreMatch[1])
          if (score >= minScore) {
            slugs.push(slug)
          }
          break
        }
      }
    }
  }

  return slugs
}

/**
 * Load slugs from a text file (one per line)
 */
function loadSlugsFromFile(filePath: string): string[] {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    process.exit(1)
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
}

/**
 * Promote a single case
 */
async function promoteCase(slug: string, score: number): Promise<boolean> {
  const caseRecord = await prisma.case.findUnique({
    where: { slug },
    include: {
      statements: {
        take: 1,
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  if (!caseRecord) {
    console.error(`   ❌ Case not found: ${slug}`)
    return false
  }

  if (caseRecord.isRealIncident) {
    console.log(`   ℹ️  Already promoted`)
    return true
  }

  const originatingStatement = caseRecord.statements[0]

  if (!originatingStatement) {
    console.error(`   ❌ No statements found`)
    return false
  }

  await prisma.case.update({
    where: { id: caseRecord.id },
    data: {
      isRealIncident: true,
      wasAutoImported: false,
      wasManuallyPromoted: true,
      promotedAt: new Date(),
      promotedBy: 'BATCH_PROMOTION_SCRIPT',
      promotionReason: `Promoted based on assessment score: ${score}/100`,
      originatingStatementId: originatingStatement.id,
      qualificationScore: score,
      visibility: 'PUBLIC',
      status: 'DOCUMENTED'
    }
  })

  console.log(`   ✅ Promoted (score: ${score})`)
  return true
}

/**
 * Enrich a single case
 */
async function enrichCaseBySlug(
  slug: string,
  webSearch: boolean
): Promise<boolean> {
  try {
    const caseRecord = await prisma.case.findUnique({
      where: { slug },
      include: {
        statements: {
          include: {
            person: true,
            organization: true,
            sources: true
          }
        }
      }
    })

    if (!caseRecord) {
      console.error(`   ❌ Case not found: ${slug}`)
      return false
    }

    // Get the originating statement
    const origStatement = caseRecord.statements[0]
    if (!origStatement) {
      console.error(`   ❌ No statement found`)
      return false
    }

    // Build enrichment input
    const enrichmentInput: CaseEnrichmentInput = {
      caseId: caseRecord.id,
      caseTitle: caseRecord.title,
      statements: caseRecord.statements.map(s => ({
        id: s.id,
        content: s.content,
        statementDate: s.statementDate,
        context: s.context || undefined,
        personName: s.person?.name || null,
        personRole: s.person?.primaryRole || null,
        organizationName: (s.organization as any)?.name || null,
        organizationType: (s.organization as any)?.organizationType || null,
        sourceUrls: s.sources.map(src => src.url)
      })),
      existingSources: caseRecord.statements.flatMap(s =>
        s.sources.map(src => ({
          url: src.url,
          title: src.title || null,
          publicationName: (src as any).publication || (src as any).publicationName || null,
          publicationDate: src.publicationDate || null,
          sourceType: src.sourceType
        }))
      ),
      existingDescription: caseRecord.description || undefined,
      existingBackground: caseRecord.background || undefined,
      existingSignificance: caseRecord.significance || undefined,
      existingTimeline: caseRecord.timeline || undefined
    }

    // Perform web search if requested
    if (webSearch && origStatement.person) {
      console.log(`   🌐 Performing web search...`)

      try {
        const webSearchResults = await enrichedCaseSearch({
          personName: origStatement.person.name,
          statementContent: origStatement.content,
          statementDate: origStatement.statementDate,
          caseTitle: caseRecord.title,
          context: origStatement.context || undefined
        })

        enrichmentInput.webSearchResults = webSearchResults
        console.log(`   ✓ Web search complete (${webSearchResults.mainSources.length} sources)`)
      } catch (error) {
        console.warn(`   ⚠️  Web search failed, continuing without it`)
      }
    }

    // Call Claude API for enrichment
    console.log(`   🤖 Generating AI documentation...`)
    const enrichedData = await enrichCase(enrichmentInput)

    // Save enriched data
    await prisma.case.update({
      where: { id: caseRecord.id },
      data: {
        description: enrichedData.description,
        background: enrichedData.background,
        significance: enrichedData.significance,
        timeline: enrichedData.timeline,
        lastEnrichedAt: new Date(),
        enrichmentVersion: (caseRecord.enrichmentVersion || 0) + 1
      }
    })

    console.log(`   ✅ Enriched successfully`)
    return true
  } catch (error) {
    console.error(`   ❌ Enrichment failed:`, error instanceof Error ? error.message : error)
    return false
  }
}

/**
 * Main batch processing function
 */
async function batchProcess(options: BatchOptions) {
  console.log('📦 Batch Case Promotion and Enrichment\n')

  // Load slugs
  let slugs: string[] = []

  if (options.slugsFile) {
    console.log(`📄 Loading slugs from file: ${options.slugsFile}`)
    slugs = loadSlugsFromFile(options.slugsFile)
  } else if (options.minScore !== undefined) {
    console.log(`📊 Loading cases with score >= ${options.minScore} from assessment log`)
    slugs = loadSlugsFromAssessment(options.minScore)
  } else {
    console.error('❌ Must specify either --min-score or --slugs-file')
    process.exit(1)
  }

  if (slugs.length === 0) {
    console.log('No cases found matching criteria')
    return
  }

  if (options.limit) {
    slugs = slugs.slice(0, options.limit)
  }

  console.log(`Found ${slugs.length} cases to process\n`)

  if (options.dryRun) {
    console.log('🔍 DRY RUN - No changes will be made\n')
    slugs.forEach((slug, i) => {
      console.log(`${i + 1}. ${slug}`)
    })
    return
  }

  // Test API connections if enriching
  if (options.enrich) {
    console.log('Testing Claude API connection...')
    const claudeOk = await testConnection()
    if (!claudeOk) {
      console.error('❌ Failed to connect to Claude API')
      process.exit(1)
    }
    console.log('✅ Claude API connected\n')

    if (options.webSearch) {
      console.log('Testing Tavily API connection...')
      const tavilyOk = await testTavilyConnection()
      if (!tavilyOk) {
        console.error('❌ Failed to connect to Tavily API')
        process.exit(1)
      }
      console.log('✅ Tavily API connected\n')
    }
  }

  // Process each case
  let promoted = 0
  let enriched = 0
  let errors = 0

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i]
    console.log(`\n[${i + 1}/${slugs.length}] Processing: ${slug}`)

    // Step 1: Promote
    const scoreMatch = options.minScore
    const promoteSuccess = await promoteCase(slug, scoreMatch || 75)

    if (promoteSuccess) {
      promoted++
    } else {
      errors++
      continue
    }

    // Step 2: Enrich (if requested)
    if (options.enrich) {
      // Small delay between enrichments to avoid rate limits
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      const enrichSuccess = await enrichCaseBySlug(slug, options.webSearch || false)

      if (enrichSuccess) {
        enriched++
      } else {
        errors++
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70))
  console.log('BATCH PROCESSING SUMMARY')
  console.log('='.repeat(70))
  console.log(`Total processed: ${slugs.length}`)
  console.log(`Promoted: ${promoted}`)
  if (options.enrich) {
    console.log(`Enriched: ${enriched}`)
  }
  console.log(`Errors: ${errors}`)
  console.log('')
}

/**
 * Print usage information
 */
function printUsage() {
  console.log(`
Usage:
  npx ts-node scripts/batch-promote-and-enrich.ts [options]

Options:
  --min-score <number>    Promote cases with score >= number from assessment log
  --slugs-file <path>     Read slugs from a text file (one per line)
  --enrich                Also enrich cases with AI after promotion
  --web-search            Include web search in enrichment (requires --enrich)
  --limit <number>        Only process first N cases
  --dry-run               Show what would be done without making changes

Examples:
  # Promote all cases with score >= 75 (no enrichment)
  npx ts-node scripts/batch-promote-and-enrich.ts --min-score 75

  # Promote and enrich cases scoring 75+
  npx ts-node scripts/batch-promote-and-enrich.ts --min-score 75 --enrich

  # Promote and enrich with web search (most comprehensive)
  npx ts-node scripts/batch-promote-and-enrich.ts --min-score 75 --enrich --web-search

  # Test first 5 cases
  npx ts-node scripts/batch-promote-and-enrich.ts --min-score 75 --limit 5 --dry-run

  # Process specific cases from a file
  npx ts-node scripts/batch-promote-and-enrich.ts --slugs-file worthy-cases.txt --enrich

Note:
  - Enrichment with --web-search takes ~15-20 seconds per case
  - Without web search, enrichment takes ~5-10 seconds per case
  - Promotion-only takes < 1 second per case
`)
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage()
    process.exit(0)
  }

  const options: BatchOptions = {
    minScore: args.includes('--min-score')
      ? parseInt(args[args.indexOf('--min-score') + 1])
      : undefined,
    slugsFile: args.includes('--slugs-file')
      ? args[args.indexOf('--slugs-file') + 1]
      : undefined,
    enrich: args.includes('--enrich'),
    webSearch: args.includes('--web-search'),
    dryRun: args.includes('--dry-run'),
    limit: args.includes('--limit')
      ? parseInt(args[args.indexOf('--limit') + 1])
      : undefined
  }

  try {
    await batchProcess(options)
    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Batch processing failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

main()
