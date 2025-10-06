#!/usr/bin/env tsx
/**
 * Clear all auto-imported data from the database
 * This deletes persons and incidents imported from the batch AI generator
 */

import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load environment variables
config()

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Clearing auto-imported data from database...\n')

  try {
    // Get count before deletion
    const personCount = await prisma.person.count()
    const incidentCount = await prisma.incident.count()
    const statementCount = await prisma.statement.count()

    console.log(`Current database contents:`)
    console.log(`  Persons: ${personCount}`)
    console.log(`  Incidents: ${incidentCount}`)
    console.log(`  Statements: ${statementCount}`)
    console.log()

    // Delete in order due to relations
    console.log('Deleting statements (including responses)...')
    const deletedStatements = await prisma.statement.deleteMany({})
    console.log(`✅ Deleted ${deletedStatements.count} statements`)

    console.log('Deleting sources...')
    const deletedSources = await prisma.source.deleteMany({})
    console.log(`✅ Deleted ${deletedSources.count} sources`)

    console.log('Deleting incidents...')
    const deletedIncidents = await prisma.incident.deleteMany({})
    console.log(`✅ Deleted ${deletedIncidents.count} incidents`)

    console.log('Deleting affiliations...')
    const deletedAffiliations = await prisma.affiliation.deleteMany({})
    console.log(`✅ Deleted ${deletedAffiliations.count} affiliations`)

    console.log('Deleting persons...')
    const deletedPersons = await prisma.person.deleteMany({})
    console.log(`✅ Deleted ${deletedPersons.count} persons`)

    console.log()
    console.log('✨ Database cleared! Ready for fresh import.')

  } catch (error) {
    console.error('❌ Error clearing database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
