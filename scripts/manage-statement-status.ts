/**
 * Script to manage statement statuses
 * Usage:
 * - Draft all response statements: npx tsx scripts/manage-statement-status.ts --draft-responses
 * - Publish specific statement: npx tsx scripts/manage-statement-status.ts --publish [statement-id]
 * - Draft specific statement: npx tsx scripts/manage-statement-status.ts --draft [statement-id]
 * - List all draft statements: npx tsx scripts/manage-statement-status.ts --list-drafts
 */

import { PrismaClient, DraftStatus, StatementType } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()
dotenv.config({ path: '.env.local', override: true })

const prisma = new PrismaClient()

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  const statementId = args[1]

  try {
    switch (command) {
      case '--draft-responses':
        await draftResponseStatements()
        break

      case '--publish':
        if (!statementId) {
          console.error('Please provide a statement ID')
          process.exit(1)
        }
        await updateStatementStatus(statementId, 'PUBLISHED')
        break

      case '--draft':
        if (!statementId) {
          console.error('Please provide a statement ID')
          process.exit(1)
        }
        await updateStatementStatus(statementId, 'DRAFT')
        break

      case '--list-drafts':
        await listDraftStatements()
        break

      case '--list-responses':
        await listResponseStatements()
        break

      default:
        console.log(`
Usage:
  npx tsx scripts/manage-statement-status.ts [command] [options]

Commands:
  --draft-responses      Draft all response statements (except Emma Watson's)
  --publish [id]        Publish a specific statement
  --draft [id]          Draft a specific statement
  --list-drafts         List all draft statements
  --list-responses      List all response statements
        `)
    }
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

async function draftResponseStatements() {
  console.log('Finding all response statements...\n')

  // Get all response statements with person info
  const responseStatements = await prisma.statement.findMany({
    where: {
      statementType: StatementType.RESPONSE
    },
    include: {
      person: true
    }
  })

  console.log(`Found ${responseStatements.length} response statements\n`)

  // Separate Emma Watson statements
  const emmaWatsonStatements = responseStatements.filter(
    stmt => stmt.person?.name.toLowerCase().includes('emma watson')
  )
  const otherStatements = responseStatements.filter(
    stmt => !stmt.person?.name.toLowerCase().includes('emma watson')
  )

  console.log(`Emma Watson statements: ${emmaWatsonStatements.length} (will keep published)`)
  console.log(`Other response statements: ${otherStatements.length} (will draft)\n`)

  // Update non-Emma Watson response statements to DRAFT
  if (otherStatements.length > 0) {
    const result = await prisma.statement.updateMany({
      where: {
        id: {
          in: otherStatements.map(s => s.id)
        }
      },
      data: {
        status: DraftStatus.DRAFT
      }
    })

    console.log(`✅ Successfully updated ${result.count} statements to DRAFT status`)
  }

  // Show summary
  console.log('\nSummary:')
  for (const stmt of otherStatements.slice(0, 5)) {
    const personName = stmt.person?.name || 'Unknown'
    const summary = stmt.summary || stmt.content.substring(0, 50) + '...'
    console.log(`  📝 DRAFT: ${personName} - ${summary}`)
  }
  if (otherStatements.length > 5) {
    console.log(`  ... and ${otherStatements.length - 5} more`)
  }

  if (emmaWatsonStatements.length > 0) {
    console.log('\nKept published (Emma Watson):')
    for (const stmt of emmaWatsonStatements) {
      const summary = stmt.summary || stmt.content.substring(0, 50) + '...'
      console.log(`  ✅ PUBLISHED: Emma Watson - ${summary}`)
    }
  }
}

async function updateStatementStatus(statementId: string, status: DraftStatus) {
  const statement = await prisma.statement.update({
    where: { id: statementId },
    data: { status },
    include: {
      person: true
    }
  })

  const personName = statement.person?.name || 'Unknown'
  const summary = statement.summary || statement.content.substring(0, 50) + '...'

  console.log(`✅ Updated statement to ${status}:`)
  console.log(`   Person: ${personName}`)
  console.log(`   Content: ${summary}`)
  console.log(`   ID: ${statement.id}`)
}

async function listDraftStatements() {
  const draftStatements = await prisma.statement.findMany({
    where: {
      status: DraftStatus.DRAFT
    },
    include: {
      person: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  console.log(`Found ${draftStatements.length} draft statements:\n`)

  for (const stmt of draftStatements) {
    const personName = stmt.person?.name || 'Unknown'
    const summary = stmt.summary || stmt.content.substring(0, 50) + '...'
    const type = stmt.statementType

    console.log(`📝 ${personName} (${type})`)
    console.log(`   ${summary}`)
    console.log(`   ID: ${stmt.id}`)
    console.log(`   Updated: ${stmt.updatedAt.toLocaleDateString()}\n`)
  }
}

async function listResponseStatements() {
  const responseStatements = await prisma.statement.findMany({
    where: {
      statementType: StatementType.RESPONSE
    },
    include: {
      person: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  console.log(`Found ${responseStatements.length} response statements:\n`)

  // Group by status
  const byStatus = responseStatements.reduce((acc, stmt) => {
    const status = stmt.status || 'PUBLISHED'
    if (!acc[status]) acc[status] = []
    acc[status].push(stmt)
    return acc
  }, {} as Record<string, typeof responseStatements>)

  for (const [status, statements] of Object.entries(byStatus)) {
    console.log(`\n${status}: ${statements.length} statements`)
    console.log('─'.repeat(40))

    for (const stmt of statements.slice(0, 3)) {
      const personName = stmt.person?.name || 'Unknown'
      const summary = stmt.summary || stmt.content.substring(0, 50) + '...'

      console.log(`• ${personName}: ${summary}`)
    }

    if (statements.length > 3) {
      console.log(`  ... and ${statements.length - 3} more`)
    }
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})