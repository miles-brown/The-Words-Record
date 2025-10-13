/**
 * Auto-Promotion Script for Statements to Cases
 *
 * Promotion Criteria:
 * 1. Statements with MORE THAN 2 responses (>2) automatically qualify for case promotion
 * 2. The original statement becomes the principal statement of the case
 *
 * This script:
 * - Finds all statements with >2 responses
 * - Checks if they're already promoted (isRealIncident = true)
 * - Promotes qualifying statements to cases
 * - Sets the statement as the originating/principal statement
 * - Records promotion metadata
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function autoPromoteStatements() {
  console.log('🔍 Starting auto-promotion scan...\n')

  try {
    // Step 1: Find all statements with their response counts
    console.log('Step 1: Fetching all statements with response counts...')
    const statements = await prisma.statement.findMany({
      include: {
        _count: {
          select: {
            responses: true
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

    // Step 2: Filter statements that qualify for promotion (>2 responses)
    const qualifyingStatements = statements.filter(statement => {
      const responseCount = statement._count.responses
      const hasCase = statement.case !== null
      const isAlreadyRealCase = hasCase && statement.case.isRealIncident === true

      return responseCount > 2 && !isAlreadyRealCase
    })

    console.log(`📊 Qualification Results:`)
    console.log(`   Total statements: ${statements.length}`)
    console.log(`   Qualifying (>2 responses): ${qualifyingStatements.length}`)
    console.log(`   Already promoted: ${statements.filter(s => s.case?.isRealIncident).length}\n`)

    if (qualifyingStatements.length === 0) {
      console.log('✅ No statements need promotion at this time.')
      return {
        total: statements.length,
        qualified: 0,
        promoted: 0,
        skipped: 0
      }
    }

    // Step 3: Display qualifying statements
    console.log(`\n📋 Qualifying Statements for Promotion:\n`)
    qualifyingStatements.forEach((stmt, index) => {
      console.log(`${index + 1}. Statement ID: ${stmt.id}`)
      console.log(`   Case: ${stmt.case?.slug || 'N/A'}`)
      console.log(`   Responses: ${stmt._count.responses}`)
      console.log(`   Current Status: ${stmt.case?.isRealIncident ? 'Real Case' : 'Statement Page'}`)
      console.log(`   Content: ${stmt.content.substring(0, 80)}...`)
      console.log('')
    })

    // Step 4: Promote each qualifying statement
    console.log(`\n🚀 Promoting ${qualifyingStatements.length} statement(s) to cases...\n`)

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

        // Promote the case
        const updatedCase = await prisma.case.update({
          where: {
            id: statement.case.id
          },
          data: {
            isRealIncident: true,
            wasAutoImported: false,
            promotedAt: new Date(),
            promotedBy: 'AUTO_PROMOTION_SCRIPT',
            promotionReason: `Automatically promoted: ${statement._count.responses} responses (threshold: >2)`,
            wasManuallyPromoted: false,
            originatingStatementId: statement.id, // Set as principal statement
            qualificationScore: calculateQualificationScore(statement._count.responses),
            responseCount: statement._count.responses
          }
        })

        promotedCount++
        results.push({
          caseId: updatedCase.id,
          slug: updatedCase.slug,
          statementId: statement.id,
          responseCount: statement._count.responses,
          qualificationScore: updatedCase.qualificationScore
        })

        console.log(`✅ Promoted: ${updatedCase.slug}`)
        console.log(`   Responses: ${statement._count.responses}`)
        console.log(`   Score: ${updatedCase.qualificationScore}/100`)
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
 * Calculate qualification score based on response count
 * - 3-5 responses: 40-60 points
 * - 6-10 responses: 61-80 points
 * - 11+ responses: 81-100 points
 */
function calculateQualificationScore(responseCount) {
  if (responseCount <= 2) return 0
  if (responseCount <= 5) return 40 + (responseCount - 3) * 10 // 40-60
  if (responseCount <= 10) return 61 + (responseCount - 6) * 4 // 61-80
  return Math.min(100, 81 + (responseCount - 11) * 2) // 81-100
}

// Run the script
if (require.main === module) {
  autoPromoteStatements()
    .then((results) => {
      console.log('\n✅ Auto-promotion completed successfully!')
      console.log(`\nPromoted ${results.promoted} statement(s) to case status.`)

      if (results.results && results.results.length > 0) {
        console.log('\n📝 Promoted Cases:')
        results.results.forEach(r => {
          console.log(`   - ${r.slug} (${r.responseCount} responses, score: ${r.qualificationScore})`)
        })
      }

      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Auto-promotion failed:', error)
      process.exit(1)
    })
}

module.exports = { autoPromoteStatements, calculateQualificationScore }
