/**
 * Run migration SQL directly on the database
 */

import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
dotenv.config()
dotenv.config({ path: '.env.local', override: true })

const prisma = new PrismaClient()

async function main() {
  console.log('\n=== Running Migration: Add Status to Statements ===\n')

  try {
    // Check if status field already exists
    console.log('Checking if status field already exists...')
    const checkQuery = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Statement'
      AND column_name = 'status'
    ` as any[]

    if (checkQuery.length > 0) {
      console.log('✅ Status field already exists in Statement table')

      // Count statements by status
      const statusCounts = await prisma.$queryRaw`
        SELECT status, COUNT(*) as count
        FROM "Statement"
        GROUP BY status
      ` as any[]

      console.log('\n📊 Current status distribution:')
      for (const row of statusCounts) {
        console.log(`  - ${row.status || 'NULL'}: ${row.count} statements`)
      }

      return
    }

    console.log('Status field does not exist, creating it...\n')

    // Read migration SQL file
    const migrationPath = path.join(process.cwd(), 'prisma/migrations/add_status_to_statements.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    // Split SQL into individual statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`)
      try {
        await prisma.$executeRawUnsafe(statement)
        console.log('✅ Success')
      } catch (err: any) {
        if (err.message.includes('already exists')) {
          console.log('⚠️ Already exists, skipping')
        } else {
          throw err
        }
      }
    }

    console.log('\n✅ Migration completed successfully!')

    // Show final counts
    const finalCounts = await prisma.$queryRaw`
      SELECT status, "statementType", COUNT(*) as count
      FROM "Statement"
      GROUP BY status, "statementType"
      ORDER BY status, "statementType"
    ` as any[]

    console.log('\n📊 Final status distribution:')
    for (const row of finalCounts) {
      console.log(`  - ${row.status} / ${row.statementType}: ${row.count} statements`)
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})