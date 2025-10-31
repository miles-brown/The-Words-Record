/**
 * Test database connection script
 */

import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()
dotenv.config({ path: '.env.local', override: true })

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function main() {
  console.log('\n=== Testing Database Connection ===\n')

  console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^@]+@/, ':***@'))
  console.log('DIRECT_URL:', process.env.DIRECT_URL?.replace(/:[^@]+@/, ':***@'))

  try {
    // Test connection
    console.log('\nTesting connection...')
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as db_version`
    console.log('✅ Connection successful!')
    console.log('Database info:', result)

    // Count some records
    const caseCount = await prisma.case.count()
    const statementCount = await prisma.statement.count()
    const topicCount = await prisma.topic.count()

    console.log('\n📊 Database Statistics:')
    console.log(`  - Cases: ${caseCount}`)
    console.log(`  - Statements: ${statementCount}`)
    console.log(`  - Topics: ${topicCount}`)

    // Check if status field exists in Statement
    console.log('\n📋 Checking Statement schema...')
    const firstStatement = await prisma.statement.findFirst({
      select: {
        id: true,
        status: true,
        statementType: true,
      }
    }).catch(err => {
      if (err.message.includes('status')) {
        console.log('❌ Status field does not exist in Statement model')
        return null
      }
      throw err
    })

    if (firstStatement && 'status' in firstStatement) {
      console.log('✅ Status field exists in Statement model')
    } else {
      console.log('⚠️ Status field may not exist in Statement model')
    }

  } catch (error) {
    console.error('❌ Connection failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})