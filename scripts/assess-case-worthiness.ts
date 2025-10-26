/**
 * Assess Case Worthiness
 *
 * Uses web search to determine if a statement is worthy of a full case page
 * by checking media coverage, controversy level, and public impact
 *
 * Usage:
 *   npx ts-node scripts/assess-case-worthiness.ts <case-slug>
 *   npx ts-node scripts/assess-case-worthiness.ts --scan-all  (assess all statement-only pages)
 */

import { PrismaClient } from '@prisma/client'
import { TavilyClient } from 'tavily'

const prisma = new PrismaClient()

interface AssessmentResult {
  slug: string
  title: string
  isWorthy: boolean
  score: number
  reasons: string[]
  mediaArticles: number
  publicReaction: 'high' | 'medium' | 'low'
  hasControversy: boolean
  hasConsequences: boolean
}

/**
 * Assess if a statement is worthy of a full case page
 */
async function assessCaseWorthiness(slug: string): Promise<AssessmentResult> {
  const apiKey = process.env.TAVILY_API_KEY

  if (!apiKey) {
    throw new Error('TAVILY_API_KEY required for assessment')
  }

  const client = new TavilyClient({ apiKey })

  // Get the case and statement
  const caseRecord = await prisma.case.findUnique({
    where: { slug },
    include: {
      statements: {
        take: 1,
        include: {
          person: true
        }
      }
    }
  })

  if (!caseRecord) {
    throw new Error(`Case not found: ${slug}`)
  }

  const statement = caseRecord.statements[0]
  if (!statement) {
    throw new Error(`No statement found for case: ${slug}`)
  }

  const personName = statement.person?.name || 'Unknown'
  const statementPreview = statement.content.substring(0, 100)

  console.log(`\n🔍 Assessing: ${caseRecord.title}`)
  console.log(`   Person: ${personName}`)
  console.log(`   Statement: "${statementPreview}..."`)
  console.log(`\n🌐 Searching web for coverage and impact...`)

  // Build search query
  const searchQuery = `"${personName}" ${statementPreview} controversy reaction`

  // Search for coverage
  const searchResults = await client.search({
    query: searchQuery,
    max_results: 10,
    search_depth: 'advanced',
    include_answer: true
  })

  // Analyze results
  let score = 0
  const reasons: string[] = []
  let hasControversy = false
  let hasConsequences = false

  // Count reputable news sources
  const reputableDomains = [
    'nytimes.com', 'washingtonpost.com', 'theguardian.com', 'bbc.com', 'reuters.com',
    'apnews.com', 'cnn.com', 'foxnews.com', 'nbcnews.com', 'abcnews.com',
    'npr.org', 'wsj.com', 'bloomberg.com', 'ft.com', 'economist.com',
    'politico.com', 'thehill.com', 'axios.com', 'usatoday.com', 'latimes.com'
  ]

  const reputableArticles = searchResults.results.filter((r: any) =>
    reputableDomains.some(domain => r.url.includes(domain))
  )

  // Scoring criteria
  if (reputableArticles.length >= 5) {
    score += 40
    reasons.push(`${reputableArticles.length} major news outlets covered it`)
  } else if (reputableArticles.length >= 3) {
    score += 25
    reasons.push(`${reputableArticles.length} news outlets covered it`)
  } else if (reputableArticles.length >= 1) {
    score += 10
    reasons.push(`${reputableArticles.length} news outlet covered it`)
  }

  // Check for controversy indicators in results
  const controversyKeywords = [
    'controversy', 'backlash', 'criticism', 'outrage', 'condemned',
    'fired', 'suspended', 'apologize', 'scandal', 'antisemitic', 'antisemitism',
    'racist', 'offensive', 'sparked debate', 'under fire', 'facing backlash'
  ]

  const resultsText = searchResults.results.map((r: any) =>
    `${r.title} ${r.content}`.toLowerCase()
  ).join(' ')

  const foundKeywords = controversyKeywords.filter(kw => resultsText.includes(kw))
  if (foundKeywords.length >= 5) {
    score += 30
    hasControversy = true
    reasons.push('Major controversy indicators found')
  } else if (foundKeywords.length >= 3) {
    score += 20
    hasControversy = true
    reasons.push('Moderate controversy indicators')
  }

  // Check for consequences
  const consequenceKeywords = [
    'fired', 'suspended', 'resigned', 'cancelled', 'dropped', 'lost deal',
    'investigation', 'lawsuit', 'banned', 'removed', 'apology', 'apologized'
  ]

  const foundConsequences = consequenceKeywords.filter(kw => resultsText.includes(kw))
  if (foundConsequences.length >= 2) {
    score += 20
    hasConsequences = true
    reasons.push('Real-world consequences documented')
  }

  // Public figure boost
  const highProfileIndicators = ['celebrity', 'politician', 'congressman', 'senator', 'mp', 'minister']
  if (highProfileIndicators.some(ind => resultsText.includes(ind))) {
    score += 10
    reasons.push('High-profile public figure')
  }

  // Determine public reaction level
  let publicReaction: 'high' | 'medium' | 'low' = 'low'
  if (searchResults.results.length >= 8 && reputableArticles.length >= 3) {
    publicReaction = 'high'
  } else if (searchResults.results.length >= 5) {
    publicReaction = 'medium'
  }

  const isWorthy = score >= 40 // Threshold for case-worthiness

  return {
    slug,
    title: caseRecord.title,
    isWorthy,
    score,
    reasons,
    mediaArticles: reputableArticles.length,
    publicReaction,
    hasControversy,
    hasConsequences
  }
}

/**
 * Scan all statement-only pages and assess them
 */
async function scanAllCases() {
  console.log('🔍 Scanning all statement-only pages...\n')

  const cases = await prisma.case.findMany({
    where: { isRealIncident: false },
    select: { slug: true, title: true }
  })

  console.log(`Found ${cases.length} statement-only pages to assess`)
  console.log('This will use approximately ${cases.length * 4} Tavily searches')
  console.log('(Your free tier includes 1,000 searches/month)\n')

  const worthy: AssessmentResult[] = []
  const notWorthy: AssessmentResult[] = []
  let errors = 0

  for (let i = 0; i < cases.length; i++) {
    const caseItem = cases[i]

    try {
      console.log(`\n[${ i + 1}/${cases.length}] Assessing: ${caseItem.slug}`)

      const assessment = await assessCaseWorthiness(caseItem.slug)

      if (assessment.isWorthy) {
        worthy.push(assessment)
        console.log(`   ✅ WORTHY (score: ${assessment.score}/100)`)
      } else {
        notWorthy.push(assessment)
        console.log(`   ❌ Not worthy (score: ${assessment.score}/100)`)
      }

      // Rate limiting - wait 1 second between requests
      if (i < cases.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error(`   ⚠️  Error: ${error instanceof Error ? error.message : 'Unknown'}`)
      errors++
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70))
  console.log('ASSESSMENT SUMMARY')
  console.log('='.repeat(70))
  console.log(`Total assessed: ${cases.length}`)
  console.log(`Case-worthy: ${worthy.length}`)
  console.log(`Not case-worthy: ${notWorthy.length}`)
  console.log(`Errors: ${errors}`)
  console.log('')

  if (worthy.length > 0) {
    console.log('\n📋 CASE-WORTHY STATEMENTS:')
    console.log('These should be promoted and enriched:\n')

    worthy.sort((a, b) => b.score - a.score)

    worthy.forEach((w, i) => {
      console.log(`${i + 1}. ${w.slug}`)
      console.log(`   Score: ${w.score}/100`)
      console.log(`   Media articles: ${w.mediaArticles}`)
      console.log(`   Controversy: ${w.hasControversy ? 'YES' : 'NO'}`)
      console.log(`   Consequences: ${w.hasConsequences ? 'YES' : 'NO'}`)
      console.log(`   Reasons: ${w.reasons.join(', ')}`)
      console.log('')
    })

    console.log('\n🚀 To promote and enrich these cases:')
    console.log('\nOption 1: Promote all at once')
    console.log('   (Create a script to promote all worthy cases)')
    console.log('\nOption 2: Promote individually')
    worthy.slice(0, 5).forEach(w => {
      console.log(`   npx ts-node scripts/manually-promote-case.ts ${w.slug}`)
      console.log(`   npx ts-node scripts/research-and-enrich-case.ts --web-search ${w.slug}`)
      console.log('')
    })
  }
}

async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage:
  npx ts-node scripts/assess-case-worthiness.ts <case-slug>
  npx ts-node scripts/assess-case-worthiness.ts --scan-all

Examples:
  # Assess a single case
  npx ts-node scripts/assess-case-worthiness.ts jeremy-corbyn-facebook-post-and-public-statement-statement-30-october-2020

  # Scan all statement-only pages and identify worthy ones
  npx ts-node scripts/assess-case-worthiness.ts --scan-all

Scoring Criteria:
  - Major news coverage (5+ outlets): 40 points
  - Controversy indicators: up to 30 points
  - Real-world consequences: 20 points
  - High-profile figure: 10 points

  Threshold: 40+ points = Case-worthy
`)
    process.exit(0)
  }

  const scanAll = args.includes('--scan-all')
  const slug = args.find(arg => !arg.startsWith('--'))

  try {
    if (scanAll) {
      await scanAllCases()
    } else if (slug) {
      const assessment = await assessCaseWorthiness(slug)

      console.log('\n' + '='.repeat(70))
      console.log('ASSESSMENT RESULT')
      console.log('='.repeat(70))
      console.log(`Title: ${assessment.title}`)
      console.log(`Score: ${assessment.score}/100`)
      console.log(`Verdict: ${assessment.isWorthy ? '✅ CASE-WORTHY' : '❌ NOT CASE-WORTHY'}`)
      console.log(`Media articles: ${assessment.mediaArticles}`)
      console.log(`Public reaction: ${assessment.publicReaction}`)
      console.log(`Has controversy: ${assessment.hasControversy ? 'YES' : 'NO'}`)
      console.log(`Has consequences: ${assessment.hasConsequences ? 'YES' : 'NO'}`)
      console.log(`\nReasons:`)
      assessment.reasons.forEach(r => console.log(`  - ${r}`))

      if (assessment.isWorthy) {
        console.log('\n🚀 Next steps:')
        console.log(`   1. Promote: npx ts-node scripts/manually-promote-case.ts ${slug}`)
        console.log(`   2. Enrich: npx ts-node scripts/research-and-enrich-case.ts --web-search ${slug}`)
      }
    } else {
      console.error('Please provide a case slug or use --scan-all')
      process.exit(1)
    }

    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

main()
