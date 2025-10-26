/**
 * Case Research and Enrichment Script
 *
 * Uses Claude API to generate comprehensive, Wikipedia-style case documentation
 * by gathering all related information and synthesizing it into a coherent narrative.
 *
 * Usage:
 *   npx ts-node scripts/research-and-enrich-case.ts <caseSlug>
 *   npx ts-node scripts/research-and-enrich-case.ts --all  (enrich all promoted cases)
 *   npx ts-node scripts/research-and-enrich-case.ts --dry-run <caseSlug>
 *   npx ts-node scripts/research-and-enrich-case.ts --web-search <caseSlug>  (include web search)
 */

import { PrismaClient } from '@prisma/client'
import { enrichCase, testConnection, type CaseEnrichmentInput } from '../lib/claude-api.js'
import { enrichedCaseSearch, testTavilyConnection } from '../lib/tavily-search.js'

const prisma = new PrismaClient()

interface EnrichmentOptions {
  dryRun?: boolean
  force?: boolean // Re-enrich even if already enriched
  webSearch?: boolean // Include web search results
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage()
    process.exit(0)
  }

  const dryRun = args.includes('--dry-run') || args.includes('-d')
  const force = args.includes('--force') || args.includes('-f')
  const enrichAll = args.includes('--all') || args.includes('-a')
  const webSearch = args.includes('--web-search') || args.includes('-w')
  const caseSlug = args.find(arg => !arg.startsWith('--') && !arg.startsWith('-'))

  console.log('🔬 Case Research & Enrichment Tool\n')

  // Test Claude API connection first
  console.log('Testing Claude API connection...')
  const connectionOk = await testConnection()

  if (!connectionOk) {
    console.error('❌ Failed to connect to Claude API')
    console.error('Please check your ANTHROPIC_API_KEY environment variable')
    process.exit(1)
  }

  console.log('✅ Claude API connection successful')

  // Test Tavily API if web search is enabled
  if (webSearch) {
    console.log('Testing Tavily API connection...')
    const tavilyOk = await testTavilyConnection()

    if (!tavilyOk) {
      console.error('❌ Failed to connect to Tavily API')
      console.error('Please check your TAVILY_API_KEY environment variable')
      console.error('Get a free API key at https://tavily.com/ (1,000 searches/month)')
      process.exit(1)
    }

    console.log('✅ Tavily API connection successful')
  }

  console.log('')

  try {
    if (enrichAll) {
      await enrichAllCases({ dryRun, force, webSearch })
    } else if (caseSlug) {
      await enrichSingleCase(caseSlug, { dryRun, force, webSearch })
    } else {
      console.error('❌ Please provide a case slug or use --all flag')
      printUsage()
      process.exit(1)
    }

    console.log('\n✅ Enrichment process completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Enrichment process failed:', error)
    if (error instanceof Error) {
      console.error(error.stack)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Enrich a single case by slug
 */
async function enrichSingleCase(
  slug: string,
  options: EnrichmentOptions = {}
): Promise<void> {
  console.log(`\n🔍 Looking up case: ${slug}\n`)

  const caseRecord = await prisma.case.findUnique({
    where: { slug },
    include: {
      originatingStatement: {
        include: {
          person: true,
          organization: true,
          sources: true,
          responses: {
            include: {
              person: true,
              organization: true
            },
            orderBy: {
              statementDate: 'asc'
            }
          },
          repercussionsCaused: {
            orderBy: {
              startDate: 'asc'
            }
          }
        }
      },
      statements: {
        include: {
          person: true,
          organization: true,
          sources: true
        },
        orderBy: {
          statementDate: 'asc'
        }
      },
      repercussions: {
        orderBy: {
          startDate: 'asc'
        }
      },
      sources: true
    }
  })

  if (!caseRecord) {
    throw new Error(`Case not found: ${slug}`)
  }

  if (!caseRecord.isRealIncident) {
    console.log('⚠️  Warning: This case has not been promoted yet (isRealIncident = false)')
    console.log('   It may be a statement-only page without rich content\n')
  }

  // Check if already enriched
  const isEnriched = caseRecord.description && caseRecord.description.length > 1000
  if (isEnriched && !options.force) {
    console.log('ℹ️  This case already has comprehensive documentation')
    console.log('   Use --force flag to re-enrich it\n')
    return
  }

  console.log('📊 Case Information:')
  console.log(`   Title: ${caseRecord.title}`)
  console.log(`   Date: ${caseRecord.caseDate.toISOString().split('T')[0]}`)
  console.log(`   Status: ${caseRecord.status}`)
  console.log(`   Promoted: ${caseRecord.isRealIncident ? 'Yes' : 'No'}`)
  console.log(`   Current description length: ${caseRecord.description?.length || 0} chars`)
  console.log('')

  // Gather all related data
  console.log('📚 Gathering related information...')

  const origStatement = caseRecord.originatingStatement
  if (!origStatement) {
    throw new Error('No originating statement found - cannot enrich')
  }

  // Collect all responses from both the originating statement and case statements
  const allResponses = [
    ...(origStatement.responses || []),
    ...caseRecord.statements
      .filter(s => s.respondsToId && s.id !== origStatement.id)
      .map(s => ({
        ...s,
        person: s.person,
        organization: s.organization
      }))
  ]

  // Collect all repercussions
  const allRepercussions = [
    ...(origStatement.repercussionsCaused || []),
    ...caseRecord.repercussions
  ]

  // Collect all sources
  const allSources = [
    ...(origStatement.sources || []),
    ...caseRecord.statements.flatMap(s => s.sources || []),
    ...caseRecord.sources
  ]

  // Deduplicate sources by URL
  const uniqueSources = Array.from(
    new Map(allSources.map(s => [s.url || s.id, s])).values()
  )

  console.log(`   Found ${allResponses.length} responses`)
  console.log(`   Found ${allRepercussions.length} repercussions`)
  console.log(`   Found ${uniqueSources.length} unique sources`)
  console.log('')

  // Build input for Claude API
  const enrichmentInput: CaseEnrichmentInput = {
    statement: {
      id: origStatement.id,
      content: origStatement.content,
      context: origStatement.context,
      statementDate: origStatement.statementDate,
      statementTime: origStatement.statementTime,
      platform: origStatement.platform,
      venue: origStatement.venue,
      event: origStatement.event,
      medium: origStatement.medium,
      socialMediaUrl: origStatement.socialMediaUrl,
      originalLanguage: detectOriginalLanguage(origStatement.content)
    },
    person: origStatement.person ? {
      name: origStatement.person.name,
      profession: origStatement.person.professionDetail || origStatement.person.profession,
      nationality: origStatement.person.nationality,
      background: origStatement.person.background
    } : null,
    organization: origStatement.organization ? {
      name: origStatement.organization.name,
      organizationType: (origStatement.organization as any).organizationType || null
    } : null,
    responses: allResponses.map(r => ({
      content: r.content,
      statementDate: r.statementDate,
      responseType: r.responseType,
      person: r.person ? { name: r.person.name } : null,
      organization: r.organization ? { name: r.organization.name } : null
    })),
    repercussions: allRepercussions.map(r => ({
      type: r.type,
      description: r.description,
      startDate: r.startDate,
      severityScore: r.severityScore,
      impactDescription: r.impactDescription
    })),
    sources: uniqueSources.map(s => ({
      url: s.url,
      title: s.title,
      publicationName: (s as any).publication || (s as any).publicationName || null,
      publishDate: (s as any).publishDate || (s as any).publishedDate || null,
      author: s.author
    })),
    caseBasicInfo: {
      title: caseRecord.title,
      slug: caseRecord.slug,
      caseDate: caseRecord.caseDate,
      locationCity: caseRecord.locationCity,
      locationCountry: caseRecord.locationCountry
    }
  }

  // Perform web search if enabled
  if (options.webSearch && origStatement.person) {
    console.log('🌐 Performing web search for additional context...')
    console.log('   (This may take 10-20 seconds)')

    try {
      const webSearchResults = await enrichedCaseSearch({
        personName: origStatement.person.name,
        statementContent: origStatement.content,
        statementDate: origStatement.statementDate,
        caseTitle: caseRecord.title,
        context: origStatement.context || undefined
      })

      enrichmentInput.webSearchResults = webSearchResults

      console.log('✅ Web search completed!')
      console.log(`   Main sources found: ${webSearchResults.mainSources.length}`)
      console.log(`   Media coverage: ${webSearchResults.mediaCoverage.length}`)
      console.log(`   Recent updates: ${webSearchResults.recentUpdates.length}`)
      if (webSearchResults.background.answer) {
        console.log(`   Background info: ${webSearchResults.background.answer.substring(0, 80)}...`)
      }
      console.log('')
    } catch (error) {
      console.warn('⚠️  Web search failed:', error instanceof Error ? error.message : 'Unknown error')
      console.warn('   Continuing with enrichment without web search results\n')
    }
  }

  if (options.dryRun) {
    console.log('[DRY RUN] Would send the following data to Claude API:')
    console.log(JSON.stringify(enrichmentInput, null, 2))
    console.log('\n[DRY RUN] Skipping actual API call')
    return
  }

  // Call Claude API to enrich
  console.log('🤖 Sending data to Claude API for enrichment...')
  console.log('   (This may take 10-30 seconds with Claude Haiku)')
  console.log('')

  const startTime = Date.now()
  const enrichmentOutput = await enrichCase(enrichmentInput)
  const duration = ((Date.now() - startTime) / 1000).toFixed(1)

  console.log(`✅ Claude API enrichment completed in ${duration}s`)
  console.log('')
  console.log('📝 Generated Content:')
  console.log(`   Summary: ${enrichmentOutput.summary.length} characters`)
  console.log(`   Description: ${enrichmentOutput.description.length} characters`)
  console.log(`   Timeline events: ${enrichmentOutput.timeline.length}`)
  if (enrichmentOutput.originalLanguage && enrichmentOutput.originalLanguage !== 'en') {
    console.log(`   Original language: ${enrichmentOutput.originalLanguage}`)
  }
  console.log('')

  // Save web search sources to database
  if (enrichmentInput.webSearchResults) {
    console.log('💾 Saving web search sources to database...')

    const allSources = [
      ...enrichmentInput.webSearchResults.mainSources,
      ...enrichmentInput.webSearchResults.mediaCoverage,
      ...enrichmentInput.webSearchResults.recentUpdates,
      ...enrichmentInput.webSearchResults.background.sources
    ]

    let sourcesAdded = 0
    for (const source of allSources) {
      try {
        // Check if source already exists
        const existing = await prisma.source.findFirst({
          where: { url: source.url }
        })

        if (!existing) {
          // Extract publication name from URL domain
          const urlObj = new URL(source.url)
          const publication = urlObj.hostname.replace('www.', '')

          // Generate slug from title
          const slug = source.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 100)

          // Create new source
          await prisma.source.create({
            data: {
              url: source.url,
              title: source.title,
              slug: slug,
              publication: publication,
              publishDate: source.publishedDate ? new Date(source.publishedDate) : null,
              sourceType: 'NEWS_ARTICLE',
              caseId: caseRecord.id
            }
          })
          sourcesAdded++
        } else if (existing.caseId !== caseRecord.id) {
          // Update existing source to link to this case if not already linked
          await prisma.source.update({
            where: { id: existing.id },
            data: {
              caseId: caseRecord.id
            }
          })
        }
      } catch (error) {
        console.warn(`   ⚠️  Failed to save source: ${source.url}`)
      }
    }

    console.log(`   ✅ Added ${sourcesAdded} new sources to database`)
  }

  // Update the case in database
  console.log('💾 Updating case in database...')

  await prisma.case.update({
    where: { id: caseRecord.id },
    data: {
      summary: enrichmentOutput.summary,
      description: enrichmentOutput.description,
      triggeringEvent: enrichmentOutput.triggeringEvent,
      outcome: enrichmentOutput.outcome,
      mediaFraming: enrichmentOutput.mediaFraming,
      lastReviewedAt: new Date(),
      lastReviewedBy: 'AI_ENRICHMENT_SCRIPT'
    }
  })

  console.log('✅ Case updated successfully!')
  console.log(`\n🔗 View at: /cases/${caseRecord.slug}`)
}

/**
 * Enrich all promoted cases
 */
async function enrichAllCases(options: EnrichmentOptions = {}): Promise<void> {
  console.log('🔍 Finding all promoted cases...\n')

  const whereClause: any = {
    isRealIncident: true
  }

  if (!options.force) {
    whereClause.OR = [
      { description: null },
      { description: { not: { contains: 'Background' } } } // Heuristic: enriched content has sections
    ]
  }

  const cases = await prisma.case.findMany({
    where: whereClause,
    select: {
      slug: true,
      title: true,
      description: true
    },
    orderBy: {
      promotedAt: 'desc'
    }
  })

  console.log(`Found ${cases.length} cases to enrich\n`)

  if (cases.length === 0) {
    console.log('ℹ️  No cases need enrichment')
    console.log('   Use --force to re-enrich all cases')
    return
  }

  console.log('Cases to enrich:')
  cases.forEach((c, i) => {
    console.log(`${i + 1}. ${c.slug} - ${c.title}`)
  })
  console.log('')

  if (options.dryRun) {
    console.log('[DRY RUN] Would enrich these cases')
    return
  }

  let successCount = 0
  let failureCount = 0

  for (let i = 0; i < cases.length; i++) {
    const caseItem = cases[i]
    console.log(`\n${'='.repeat(70)}`)
    console.log(`Processing ${i + 1}/${cases.length}: ${caseItem.slug}`)
    console.log('='.repeat(70))

    try {
      await enrichSingleCase(caseItem.slug, { ...options, force: true })
      successCount++

      // Rate limiting: wait 2 seconds between API calls
      if (i < cases.length - 1) {
        console.log('\n⏳ Waiting 2 seconds before next case...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    } catch (error) {
      console.error(`\n❌ Failed to enrich ${caseItem.slug}:`, error instanceof Error ? error.message : error)
      failureCount++
    }
  }

  console.log(`\n${'='.repeat(70)}`)
  console.log('BATCH ENRICHMENT SUMMARY')
  console.log('='.repeat(70))
  console.log(`Total cases processed: ${cases.length}`)
  console.log(`Successful: ${successCount}`)
  console.log(`Failed: ${failureCount}`)
}

/**
 * Detect if statement is in a language other than English
 */
function detectOriginalLanguage(content: string): string {
  // Simple heuristic: check for common non-English scripts
  const hasArabic = /[\u0600-\u06FF]/.test(content)
  const hasHebrew = /[\u0590-\u05FF]/.test(content)
  const hasCyrillic = /[\u0400-\u04FF]/.test(content)
  const hasCJK = /[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/.test(content)

  if (hasArabic) return 'ar'
  if (hasHebrew) return 'he'
  if (hasCyrillic) return 'ru'
  if (hasCJK) return 'zh' // or ja/ko - would need more sophisticated detection

  // Default to English
  return 'en'
}

/**
 * Print usage instructions
 */
function printUsage() {
  console.log(`
Usage:
  npx ts-node scripts/research-and-enrich-case.ts [options] <caseSlug>

Options:
  -h, --help        Show this help message
  -d, --dry-run     Simulate enrichment without making changes
  -f, --force       Re-enrich even if case already has documentation
  -w, --web-search  Include web search results (requires TAVILY_API_KEY)
  -a, --all         Enrich all promoted cases

Examples:
  # Enrich a single case
  npx ts-node scripts/research-and-enrich-case.ts elon-musk-twitter-advertisers-2024

  # Enrich with web search for additional context
  npx ts-node scripts/research-and-enrich-case.ts --web-search elon-musk-twitter-advertisers-2024

  # Dry run to see what would be sent to Claude
  npx ts-node scripts/research-and-enrich-case.ts --dry-run some-case-slug

  # Enrich all promoted cases with web search
  npx ts-node scripts/research-and-enrich-case.ts --all --web-search

  # Force re-enrichment of all cases
  npx ts-node scripts/research-and-enrich-case.ts --all --force

Environment Variables Required:
  ANTHROPIC_API_KEY   Your Claude API key from anthropic.com
  TAVILY_API_KEY      (Optional) Your Tavily API key for web search from tavily.com
                      Free tier: 1,000 searches/month
`)
}

// Run the script
main()
