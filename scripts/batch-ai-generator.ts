#!/usr/bin/env tsx
/**
 * Batch AI Incident Generator
 *
 * This script processes a list of people and automatically researches incidents for each one.
 *
 * Usage:
 *   npx tsx scripts/batch-ai-generator.ts people-list.txt [--auto-import]
 *
 * Example people-list.txt:
 *   Elon Musk
 *   Taylor Swift
 *   Kanye West
 *
 * Features:
 *   - Processes multiple people from a text file
 *   - Rate limiting to avoid API overuse
 *   - Progress tracking
 *   - Optional auto-import to database
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

const DELAY_BETWEEN_REQUESTS = 5000 // 5 seconds between AI calls

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
🤖 Batch AI Incident Generator

Usage:
  npx tsx scripts/batch-ai-generator.ts people-list.txt [--auto-import]

Create a people-list.txt file with one name per line:
  Emma Watson
  Elon Musk
  Taylor Swift

Options:
  --auto-import    Automatically import all generated files to database
  --help           Show this help message
`)
    process.exit(0)
  }

  const listFile = args.find(arg => !arg.startsWith('--'))
  const autoImport = args.includes('--auto-import')

  if (!listFile || !fs.existsSync(listFile)) {
    console.error('❌ Please provide a valid people list file')
    console.log('Example: npx tsx scripts/batch-ai-generator.ts people-list.txt')
    process.exit(1)
  }

  // Read the list of people
  const content = fs.readFileSync(listFile, 'utf-8')
  const people = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))

  console.log(`\n🚀 Starting batch processing for ${people.length} people...\n`)

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < people.length; i++) {
    const person = people[i]
    console.log(`\n[${i + 1}/${people.length}] Processing: ${person}`)
    console.log('─'.repeat(50))

    try {
      const cmd = autoImport
        ? `npx tsx scripts/ai-incident-generator.ts "${person}" --auto-import`
        : `npx tsx scripts/ai-incident-generator.ts "${person}"`

      execSync(cmd, {
        stdio: 'inherit',
        cwd: process.cwd()
      })

      successCount++
    } catch (error) {
      console.error(`❌ Failed to process ${person}`)
      failCount++
    }

    // Rate limiting: wait between requests (except for last one)
    if (i < people.length - 1) {
      console.log(`\n⏳ Waiting ${DELAY_BETWEEN_REQUESTS / 1000}s before next request...`)
      await sleep(DELAY_BETWEEN_REQUESTS)
    }
  }

  console.log(`\n${'='.repeat(50)}`)
  console.log(`✨ Batch processing complete!`)
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ❌ Failed: ${failCount}`)
  console.log(`${'='.repeat(50)}\n`)
}

main().catch(console.error)
