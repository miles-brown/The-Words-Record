/**
 * Check and add status field to Statement table
 */

import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()
dotenv.config({ path: '.env.local', override: true })

const prisma = new PrismaClient()

async function main() {
  console.log('\n=== Checking and Adding Status Field ===\n')

  try {
    // Check if status column exists
    console.log('Checking if status column exists...')
    const checkQuery = await prisma.$queryRaw`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'Statement'
      AND column_name = 'status'
    ` as any[]

    if (checkQuery.length > 0) {
      console.log('✅ Status column already exists:')
      console.log('   Type:', checkQuery[0].data_type)
      console.log('   Default:', checkQuery[0].column_default)
    } else {
      console.log('❌ Status column does not exist, adding it now...\n')

      // First check if DraftStatus enum exists
      const enumCheck = await prisma.$queryRaw`
        SELECT typname
        FROM pg_type
        WHERE typname = 'DraftStatus'
      ` as any[]

      if (enumCheck.length === 0) {
        console.log('Creating DraftStatus enum...')
        await prisma.$executeRawUnsafe(`
          CREATE TYPE "DraftStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED')
        `)
        console.log('✅ DraftStatus enum created')
      }

      // Add status column
      console.log('Adding status column to Statement table...')
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Statement"
        ADD COLUMN IF NOT EXISTS "status" "DraftStatus" DEFAULT 'PUBLISHED'
      `)
      console.log('✅ Status column added')

      // Create index
      console.log('Creating index on status column...')
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "Statement_status_idx" ON "Statement"("status")
      `)
      console.log('✅ Index created')
    }

    // Now update response statements to DRAFT (except Emma Watson)
    console.log('\nUpdating response statements to DRAFT status...')

    // First, count what we'll update
    const responseCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "Statement" s
      LEFT JOIN "Person" p ON s."personId" = p.id
      WHERE s."statementType" = 'RESPONSE'
      AND (p.name IS NULL OR LOWER(p.name) NOT LIKE '%emma watson%')
    ` as any[]

    console.log(`Found ${responseCount[0].count} response statements to draft (excluding Emma Watson)`)

    if (responseCount[0].count > 0) {
      // Update them
      const updateResult = await prisma.$executeRawUnsafe(`
        UPDATE "Statement"
        SET "status" = 'DRAFT'
        WHERE "statementType" = 'RESPONSE'
        AND "personId" NOT IN (
          SELECT id FROM "Person"
          WHERE LOWER(name) LIKE '%emma watson%'
        )
      `)
      console.log(`✅ Updated statements to DRAFT status`)
    }

    // Show final counts
    console.log('\n📊 Final status distribution:')
    const statusCounts = await prisma.$queryRaw`
      SELECT
        COALESCE("status"::text, 'NULL') as status,
        "statementType",
        COUNT(*) as count
      FROM "Statement"
      GROUP BY "status", "statementType"
      ORDER BY "status", "statementType"
    ` as any[]

    for (const row of statusCounts) {
      console.log(`  - ${row.status} / ${row.statementType}: ${row.count} statements`)
    }

    // Show Emma Watson's statements specifically
    console.log('\n📌 Emma Watson statements:')
    const emmaStatements = await prisma.$queryRaw`
      SELECT
        s."statementType",
        COALESCE(s."status"::text, 'NULL') as status,
        COUNT(*) as count
      FROM "Statement" s
      JOIN "Person" p ON s."personId" = p.id
      WHERE LOWER(p.name) LIKE '%emma watson%'
      GROUP BY s."statementType", s."status"
    ` as any[]

    for (const row of emmaStatements) {
      console.log(`  - ${row.statementtype} / ${row.status}: ${row.count} statements`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})