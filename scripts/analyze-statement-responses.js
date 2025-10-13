/**
 * Analyze Statement Response Distribution
 *
 * This script helps understand the current state of statements and their responses
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function analyzeResponseDistribution() {
  console.log('📊 Analyzing Statement Response Distribution\n')
  console.log('='.repeat(70))

  try {
    // Fetch all statements with response counts
    const statements = await prisma.statement.findMany({
      include: {
        _count: {
          select: {
            responses: true
          }
        },
        person: {
          select: {
            name: true
          }
        },
        case: {
          select: {
            slug: true,
            title: true,
            isRealIncident: true
          }
        }
      },
      orderBy: {
        statementDate: 'desc'
      }
    })

    // Group by response count
    const distribution = {}
    statements.forEach(stmt => {
      const count = stmt._count.responses
      distribution[count] = (distribution[count] || 0) + 1
    })

    // Find top statements by response count
    const topStatements = statements
      .sort((a, b) => b._count.responses - a._count.responses)
      .slice(0, 20)

    // Calculate statistics
    const totalStatements = statements.length
    const totalResponses = statements.reduce((sum, s) => sum + s._count.responses, 0)
    const avgResponses = (totalResponses / totalStatements).toFixed(2)
    const statementsWithResponses = statements.filter(s => s._count.responses > 0).length
    const statementsWithMultipleResponses = statements.filter(s => s._count.responses > 1).length
    const qualifyingStatements = statements.filter(s => s._count.responses > 2).length

    console.log('\n📈 OVERVIEW')
    console.log('='.repeat(70))
    console.log(`Total Statements:                    ${totalStatements}`)
    console.log(`Total Responses:                     ${totalResponses}`)
    console.log(`Average Responses per Statement:     ${avgResponses}`)
    console.log(`Statements with Any Responses:       ${statementsWithResponses} (${((statementsWithResponses/totalStatements)*100).toFixed(1)}%)`)
    console.log(`Statements with Multiple Responses:  ${statementsWithMultipleResponses} (${((statementsWithMultipleResponses/totalStatements)*100).toFixed(1)}%)`)
    console.log(`Qualifying for Auto-Promotion (>2):  ${qualifyingStatements} (${((qualifyingStatements/totalStatements)*100).toFixed(1)}%)`)

    console.log('\n📊 RESPONSE DISTRIBUTION')
    console.log('='.repeat(70))
    const sortedCounts = Object.keys(distribution).sort((a, b) => parseInt(a) - parseInt(b))
    sortedCounts.forEach(count => {
      const num = parseInt(count)
      const stmts = distribution[count]
      const percentage = ((stmts / totalStatements) * 100).toFixed(1)
      const bar = '█'.repeat(Math.ceil(stmts / 10))
      const qualifier = num > 2 ? ' ✅ QUALIFIES' : ''
      console.log(`${count.padStart(3)} responses: ${stmts.toString().padStart(4)} statements (${percentage.padStart(5)}%) ${bar}${qualifier}`)
    })

    console.log('\n🏆 TOP 20 STATEMENTS BY RESPONSE COUNT')
    console.log('='.repeat(70))
    topStatements.forEach((stmt, index) => {
      const responses = stmt._count.responses
      const status = responses > 2 ? '✅' : responses > 0 ? '⚠️' : '⚪'
      const caseStatus = stmt.case?.isRealIncident ? '[CASE]' : '[STMT]'

      console.log(`${(index + 1).toString().padStart(2)}. ${status} ${responses} responses ${caseStatus}`)
      console.log(`    By: ${stmt.person?.name || 'Unknown'}`)
      console.log(`    Case: ${stmt.case?.slug || 'N/A'}`)
      console.log(`    "${stmt.content.substring(0, 100)}..."`)
      console.log('')
    })

    console.log('='.repeat(70))
    console.log('\n💡 INSIGHTS:')

    if (qualifyingStatements === 0) {
      console.log('   • No statements currently qualify for automatic promotion (need >2 responses)')
      console.log('   • Consider lowering the threshold or manually promoting high-impact statements')
    } else {
      console.log(`   • ${qualifyingStatements} statement(s) ready for auto-promotion`)
      console.log('   • Run "node scripts/auto-promote-statements.js" to promote them')
    }

    if (statementsWithResponses < totalStatements * 0.1) {
      console.log('   • Most statements have no responses - this is normal for a statement database')
    }

    if (totalResponses > 0) {
      const maxResponses = Math.max(...statements.map(s => s._count.responses))
      console.log(`   • Highest response count: ${maxResponses}`)
    }

    console.log('')

    return {
      totalStatements,
      totalResponses,
      avgResponses,
      statementsWithResponses,
      qualifyingStatements,
      distribution,
      topStatements: topStatements.slice(0, 5).map(s => ({
        id: s.id,
        responses: s._count.responses,
        content: s.content.substring(0, 100),
        person: s.person?.name,
        case: s.case?.slug
      }))
    }

  } catch (error) {
    console.error('❌ Error analyzing statements:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  analyzeResponseDistribution()
    .then(() => {
      console.log('✅ Analysis complete!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Analysis failed:', error)
      process.exit(1)
    })
}

module.exports = { analyzeResponseDistribution }
