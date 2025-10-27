import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

async function draftResponseStatements() {
  console.log('Starting to draft response statements...\n')

  // First, find all response statements with person names
  const responseStatements = await prisma.statement.findMany({
    where: {
      statementType: 'RESPONSE'
    },
    include: {
      person: true
    },
    orderBy: {
      person: {
        name: 'asc'
      }
    }
  })

  console.log(`Found ${responseStatements.length} response statements:\n`)

  // Show what we found
  for (const stmt of responseStatements) {
    const personName = stmt.person?.name || 'Unknown'
    const isEmmaWatson = personName.toLowerCase().includes('emma watson')
    const action = isEmmaWatson ? '⏭️  SKIP (Emma Watson)' : '📝 DRAFT'
    console.log(`${action} - ${personName}: ${stmt.title}`)
    console.log(`   Status: ${stmt.status} → ${isEmmaWatson ? stmt.status : 'DRAFT'}`)
    console.log(`   Slug: ${stmt.slug}\n`)
  }

  // Update all response statements to DRAFT except Emma Watson's
  const emmaWatsonIds = responseStatements
    .filter(stmt => stmt.person?.name.toLowerCase().includes('emma watson'))
    .map(stmt => stmt.id)

  const result = await prisma.statement.updateMany({
    where: {
      statementType: 'RESPONSE',
      id: {
        notIn: emmaWatsonIds
      }
    },
    data: {
      status: 'DRAFT'
    }
  })

  console.log(`\n✅ Successfully updated ${result.count} statements to DRAFT status`)
  console.log(`✅ Kept ${emmaWatsonIds.length} Emma Watson statement(s) published`)

  await prisma.$disconnect()
}

draftResponseStatements()
  .catch(error => {
    console.error('Error:', error)
    process.exit(1)
  })
