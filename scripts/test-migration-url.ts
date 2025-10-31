/**
 * Test DIRECT_URL connection for migrations
 */

import { createConnection } from 'net'
import { connect } from 'tls'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()
dotenv.config({ path: '.env.local', override: true })

async function testConnection(url: string, label: string): Promise<boolean> {
  console.log(`\nTesting ${label}...`)
  console.log(`URL: ${url.replace(/:[^@]+@/, ':***@')}`)

  // Parse the URL
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
  if (!match) {
    console.error('Invalid URL format')
    return false
  }

  const [, user, password, host, port, database] = match

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.log(`❌ Connection timeout after 5 seconds`)
      resolve(false)
    }, 5000)

    const socket = createConnection({
      host,
      port: parseInt(port),
    }, () => {
      console.log(`✅ TCP connection successful to ${host}:${port}`)
      clearTimeout(timeout)
      socket.end()
      resolve(true)
    })

    socket.on('error', (err) => {
      console.log(`❌ Connection failed: ${err.message}`)
      clearTimeout(timeout)
      resolve(false)
    })
  })
}

async function main() {
  console.log('=== Testing Database URLs ===')

  const poolerUrl = process.env.DATABASE_URL
  const directUrl = process.env.DIRECT_URL

  if (poolerUrl) {
    await testConnection(poolerUrl, 'Pooler URL (DATABASE_URL)')
  }

  if (directUrl) {
    await testConnection(directUrl, 'Direct URL (DIRECT_URL)')
  }

  // Test alternative URLs
  console.log('\n=== Testing Alternative URLs ===')

  // Test the original db.supabase.co URL
  const oldDirectUrl = `postgresql://postgres.sboopxosgongujqkpbxo:${process.env.SUPABASE_DB_PASSWORD || 'UXypAyfqxq4mxq1f'}@db.sboopxosgongujqkpbxo.supabase.co:5432/postgres`
  await testConnection(oldDirectUrl, 'Old Direct URL (db.supabase.co)')

  // Test port 5432 on pooler
  const poolerPort5432 = `postgresql://postgres.sboopxosgongujqkpbxo:${process.env.SUPABASE_DB_PASSWORD || 'UXypAyfqxq4mxq1f'}@aws-1-eu-west-1.pooler.supabase.com:5432/postgres`
  await testConnection(poolerPort5432, 'Pooler on port 5432')
}

main().catch(console.error)