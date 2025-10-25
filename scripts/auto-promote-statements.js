/**
 * Auto-Promotion Script for Statements to Cases
 *
 * Enhanced Multi-Factor Promotion System:
 * 1. Response count (engagement with other statements)
 * 2. Media attention (outlets and article coverage)
 * 3. Social engagement (likes, shares, views)
 * 4. Repercussions (real-world consequences)
 *
 * This script:
 * - Calculates weighted qualification scores for all statements
 * - Identifies candidates based on configurable thresholds
 * - Promotes qualifying statements to case status
 * - Records detailed promotion metadata
 * - Optionally triggers AI enrichment for promoted cases
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const prisma = new PrismaClient()

// Load configuration
const configPath = path.join(__dirname, 'config', 'promotion-thresholds.json')
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

async function autoPromoteStatements(dryRun = false) {
  console.log('🔍 Starting enhanced auto-promotion scan...\n')
  console.log(`Configuration loaded from: ${configPath}`)
  console.log(`Dry run mode: ${dryRun ? 'YES (no changes will be made)' : 'NO'}\n`)

  try {
    // Step 1: Fetch all statements with engagement data
    console.log('Step 1: Fetching all statements with engagement metrics...')
    const statements = await prisma.statement.findMany({
      include: {
        _count: {
          select: {
            responses: true,
            repercussionsCaused: true
          }
        },
        case: {
          select: {
            id: true,
            isRealIncident: true,
            slug: true
          }
        }
      }
    })

    console.log(`Found ${statements.length} total statements\n`)

    // Step 2: Calculate qualification scores for each statement
    console.log('Step 2: Calculating multi-factor qualification scores...')
    const statementsWithScores = statements.map(statement => {
      const score = calculateEnhancedQualificationScore(statement, statement._count)
      return {
        ...statement,
        calculatedScore: score
      }
    })

    // Step 3: Filter statements that qualify for promotion
    const qualifyingStatements = statementsWithScores.filter(statement => {
      const hasCase = statement.case !== null
      const isAlreadyRealCase = hasCase && statement.case.isRealIncident === true
      const meetsThreshold = statement.calculatedScore >= config.thresholds.minimumQualificationScore

      return meetsThreshold && !isAlreadyRealCase
    })

    // Sort by score (highest first)
    qualifyingStatements.sort((a, b) => b.calculatedScore - a.calculatedScore)

    console.log(`📊 Qualification Results:`)
    console.log(`   Total statements: ${statements.length}`)
    console.log(`   Qualifying (score ≥ ${config.thresholds.minimumQualificationScore}): ${qualifyingStatements.length}`)
    console.log(`   Already promoted: ${statements.filter(s => s.case?.isRealIncident).length}`)
    console.log(`   High priority (score ≥ ${config.thresholds.highPriorityScore}): ${qualifyingStatements.filter(s => s.calculatedScore >= config.thresholds.highPriorityScore).length}\n`)

    if (qualifyingStatements.length === 0) {
      console.log('✅ No statements need promotion at this time.')
      return {
        total: statements.length,
        qualified: 0,
        promoted: 0,
        skipped: 0
      }
    }

    // Step 4: Display qualifying statements with detailed metrics
    console.log(`\n📋 Qualifying Statements for Promotion:\n`)
    qualifyingStatements.forEach((stmt, index) => {
      console.log(`${index + 1}. Statement ID: ${stmt.id}`)
      console.log(`   Case: ${stmt.case?.slug || 'N/A'}`)
      console.log(`   Score: ${stmt.calculatedScore}/100 ${stmt.calculatedScore >= config.thresholds.highPriorityScore ? '⭐ HIGH PRIORITY' : ''}`)
      console.log(`   Metrics:`)
      console.log(`     - Responses: ${stmt._count.responses}`)
      console.log(`     - Media Outlets: ${stmt.mediaOutlets || 0}`)
      console.log(`     - Articles: ${stmt.articleCount || 0}`)
      console.log(`     - Social: ${stmt.likes || 0} likes, ${stmt.shares || 0} shares, ${stmt.views || 0} views`)
      console.log(`     - Repercussions: ${stmt._count.repercussionsCaused > 0 ? 'YES' : 'NO'}`)
      console.log(`   Content: ${stmt.content.substring(0, 80)}...`)
      console.log('')
    })

    // Step 5: Promote each qualifying statement
    console.log(`\n🚀 ${dryRun ? 'DRY RUN: Simulating promotion of' : 'Promoting'} ${qualifyingStatements.length} statement(s) to cases...\n`)

    let promotedCount = 0
    let skippedCount = 0
    const results = []

    for (const statement of qualifyingStatements) {
      try {
        if (!statement.case) {
          console.log(`⚠️  Skipping statement ${statement.id}: No associated case found`)
          skippedCount++
          continue
        }

        if (dryRun) {
          console.log(`[DRY RUN] Would promote: ${statement.case.slug}`)
          console.log(`   Score: ${statement.calculatedScore}/100`)
          console.log(`   Engagement breakdown:`)
          console.log(`     - Responses: ${statement._count.responses} (${statement._count.responses * config.weights.responseCount} points)`)
          console.log(`     - Media: ${statement.mediaOutlets || 0} outlets, ${statement.articleCount || 0} articles (${((statement.mediaOutlets || 0) * config.weights.mediaOutlets) + ((statement.articleCount || 0) * config.weights.articleCount)} points)`)
          console.log(`     - Social: ${statement.likes || 0}/${statement.shares || 0}/${statement.views || 0} (${calculateSocialScore(statement)} points)`)
          console.log(`     - Repercussions: ${statement._count.repercussionsCaused > 0 ? 'Yes' : 'No'} (${statement._count.repercussionsCaused > 0 ? config.weights.hasRepercussions : 0} points)\n`)
          promotedCount++
          continue
        }

        // Generate detailed promotion reason
        const promotionReasons = []
        if (statement._count.responses >= 5) promotionReasons.push(`${statement._count.responses} responses`)
        if ((statement.mediaOutlets || 0) >= 2) promotionReasons.push(`${statement.mediaOutlets} media outlets`)
        if ((statement.articleCount || 0) >= 5) promotionReasons.push(`${statement.articleCount} articles`)
        if (statement._count.repercussionsCaused > 0) promotionReasons.push('documented repercussions')
        const socialEngagement = (statement.likes || 0) + (statement.shares || 0)
        if (socialEngagement >= 1000) promotionReasons.push(`${socialEngagement.toLocaleString()} social engagements`)

        const promotionReason = `Multi-factor auto-promotion (score: ${statement.calculatedScore}/100) - ${promotionReasons.join(', ')}`

        // Promote the case
        const updatedCase = await prisma.case.update({
          where: {
            id: statement.case.id
          },
          data: {
            isRealIncident: true,
            wasAutoImported: false,
            promotedAt: new Date(),
            promotedBy: 'AUTO_PROMOTION_SCRIPT_V2',
            promotionReason,
            wasManuallyPromoted: false,
            originatingStatementId: statement.id,
            qualificationScore: Math.min(100, Math.round(statement.calculatedScore)),
            responseCount: statement._count.responses,
            mediaOutletCount: statement.mediaOutlets || 0,
            hasPublicReaction: statement._count.responses > 0 || (statement.likes || 0) > 0,
            hasRepercussion: statement._count.repercussionsCaused > 0,
            visibility: 'PUBLIC',
            status: 'DOCUMENTED'
          }
        })

        promotedCount++
        results.push({
          caseId: updatedCase.id,
          slug: updatedCase.slug,
          statementId: statement.id,
          calculatedScore: statement.calculatedScore,
          qualificationScore: updatedCase.qualificationScore,
          promotionReason
        })

        console.log(`✅ Promoted: ${updatedCase.slug}`)
        console.log(`   Score: ${updatedCase.qualificationScore}/100`)
        console.log(`   Reason: ${promotionReason}`)
        console.log(`   Principal Statement: ${statement.id}\n`)

      } catch (error) {
        console.error(`❌ Error promoting statement ${statement.id}:`, error.message)
        skippedCount++
      }
    }

    // Step 5: Summary
    console.log(`\n${'='.repeat(60)}`)
    console.log('📊 AUTO-PROMOTION SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total Statements Scanned:     ${statements.length}`)
    console.log(`Qualified for Promotion:      ${qualifyingStatements.length}`)
    console.log(`Successfully Promoted:        ${promotedCount}`)
    console.log(`Skipped (errors/no case):     ${skippedCount}`)
    console.log(`Already Real Cases:           ${statements.filter(s => s.case?.isRealIncident).length}`)
    console.log('='.repeat(60))

    return {
      total: statements.length,
      qualified: qualifyingStatements.length,
      promoted: promotedCount,
      skipped: skippedCount,
      results
    }

  } catch (error) {
    console.error('❌ Fatal error during auto-promotion:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Calculate enhanced multi-factor qualification score
 * Considers: responses, media attention, social engagement, repercussions
 * Returns a score from 0-100
 */
function calculateEnhancedQualificationScore(statement, counts) {
  const weights = config.weights
  let score = 0

  // Response engagement
  const responseScore = (counts.responses || 0) * weights.responseCount
  score += responseScore

  // Media attention
  const mediaScore = ((statement.mediaOutlets || 0) * weights.mediaOutlets) +
                     ((statement.articleCount || 0) * weights.articleCount)
  score += mediaScore

  // Social engagement
  const socialScore = calculateSocialScore(statement)
  score += socialScore

  // Repercussions (binary multiplier)
  if (counts.repercussionsCaused > 0) {
    score += weights.hasRepercussions
  }

  // Cap at 100
  return Math.min(100, Math.round(score))
}

/**
 * Calculate social engagement score
 */
function calculateSocialScore(statement) {
  const weights = config.weights
  return ((statement.likes || 0) * weights.likes) +
         ((statement.shares || 0) * weights.shares) +
         ((statement.views || 0) * weights.views)
}

/**
 * Legacy function - kept for backwards compatibility
 * Calculate qualification score based on response count only
 */
function calculateQualificationScore(responseCount) {
  if (responseCount <= 2) return 0
  if (responseCount <= 5) return 40 + (responseCount - 3) * 10 // 40-60
  if (responseCount <= 10) return 61 + (responseCount - 6) * 4 // 61-80
  return Math.min(100, 81 + (responseCount - 11) * 2) // 81-100
}

// Run the script
if (require.main === module) {
  // Check for command-line arguments
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run') || args.includes('-d')

  if (dryRun) {
    console.log('⚠️  Running in DRY RUN mode - no changes will be made\n')
  }

  autoPromoteStatements(dryRun)
    .then((results) => {
      console.log(`\n✅ Auto-promotion ${dryRun ? 'simulation' : 'process'} completed successfully!`)
      console.log(`\n${dryRun ? 'Would promote' : 'Promoted'} ${results.promoted} statement(s) to case status.`)

      if (results.results && results.results.length > 0) {
        console.log('\n📝 ' + (dryRun ? 'Cases that would be promoted:' : 'Promoted Cases:'))
        results.results.forEach(r => {
          console.log(`   - ${r.slug} (score: ${r.qualificationScore || r.calculatedScore}/100)`)
          if (r.promotionReason) {
            console.log(`     Reason: ${r.promotionReason}`)
          }
        })
      }

      if (dryRun) {
        console.log('\n💡 Run without --dry-run flag to actually promote these statements')
      }

      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Auto-promotion failed:', error)
      console.error(error.stack)
      process.exit(1)
    })
}

module.exports = {
  autoPromoteStatements,
  calculateQualificationScore,
  calculateEnhancedQualificationScore,
  calculateSocialScore
}
