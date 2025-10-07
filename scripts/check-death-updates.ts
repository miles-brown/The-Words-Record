#!/usr/bin/env tsx
/**
 * Death Information Monitor Script
 *
 * Checks for recently deceased people in the database and updates their records.
 *
 * Priority Schedule:
 * - Age 80+: Check every 2 weeks
 * - Age 60-79: Check every 4 weeks
 * - Age <60: Check every 8 months
 *
 * Usage:
 *   npx tsx scripts/check-death-updates.ts [--force] [--age-group=80|60|under60]
 *
 * Examples:
 *   npx tsx scripts/check-death-updates.ts              # Check based on schedule
 *   npx tsx scripts/check-death-updates.ts --force      # Force check all
 *   npx tsx scripts/check-death-updates.ts --age-group=80  # Check only 80+ group
 */

import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config()

const prisma = new PrismaClient()
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY not found in .env')
  process.exit(1)
}

interface DeathInfo {
  isDead: boolean
  deathDate?: string // Format: DD Month YYYY
  deathPlace?: string // Format: City, Country
  deathCause?: string
  sources: Array<{
    url: string
    title: string
    publication: string
    date: string
  }>
  confidence: number
}

/**
 * Calculate age from birth date
 */
function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

/**
 * Check if person should be checked based on last check date and age
 */
function shouldCheck(person: any, ageGroup: string | null, forceCheck: boolean): boolean {
  if (forceCheck) return true

  // Don't check if already marked as deceased
  if (person.isDeceased || person.deceasedDate || person.deathDate) return false

  // Don't check if no birth date
  const birthDate = person.birthDate || person.dateOfBirth
  if (!birthDate) return false

  const age = calculateAge(birthDate)
  const lastCheck = person.lastDeathCheck ? new Date(person.lastDeathCheck) : null
  const now = new Date()

  // If age group filter is specified, only check that group
  if (ageGroup) {
    if (ageGroup === '80' && age < 80) return false
    if (ageGroup === '60' && (age < 60 || age >= 80)) return false
    if (ageGroup === 'under60' && age >= 60) return false
  }

  // Age 80+: Check every 2 weeks (14 days)
  if (age >= 80) {
    if (!lastCheck) return true
    const daysSinceCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceCheck >= 14
  }

  // Age 60-79: Check every 4 weeks (28 days)
  if (age >= 60) {
    if (!lastCheck) return true
    const daysSinceCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceCheck >= 28
  }

  // Age <60: Check every 8 months (240 days)
  if (!lastCheck) return true
  const daysSinceCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24)
  return daysSinceCheck >= 240
}

/**
 * Search for death information using Claude API
 */
async function searchDeathInfo(personName: string, birthDate: string, nationality: string): Promise<DeathInfo> {
  const prompt = `Search for death information about this person:

Name: ${personName}
Birth Date: ${birthDate}
Nationality: ${nationality}

TASK:
1. Determine if this person has died
2. If deceased, find:
   - Exact death date (DD Month YYYY format)
   - Death place (City, Country format)
   - Cause of death if publicly disclosed
   - At least 2 credible sources (obituaries, news articles, official announcements)

3. Only return isDead: true if you find CREDIBLE EVIDENCE of death
4. For living people or uncertain cases, return isDead: false

Return JSON only:
{
  "isDead": boolean,
  "deathDate": "DD Month YYYY or null",
  "deathPlace": "City, Country or null",
  "deathCause": "cause if known or null",
  "sources": [
    {
      "url": "full URL",
      "title": "article title",
      "publication": "publication name",
      "date": "YYYY-MM-DD"
    }
  ],
  "confidence": 0.0-1.0,
  "notes": "brief explanation"
}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.content[0].text

    // Parse JSON from Claude's response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const result = JSON.parse(jsonMatch[0])
    return result
  } catch (error) {
    console.error('❌ Search error:', error)
    return {
      isDead: false,
      sources: [],
      confidence: 0
    }
  }
}

/**
 * Parse date string to Date object
 */
function parseDeathDate(dateStr: string): Date | null {
  try {
    // Try to parse "DD Month YYYY" format
    const months: Record<string, number> = {
      'january': 0, 'february': 1, 'march': 2, 'april': 3,
      'may': 4, 'june': 5, 'july': 6, 'august': 7,
      'september': 8, 'october': 9, 'november': 10, 'december': 11
    }

    const parts = dateStr.toLowerCase().split(' ')
    if (parts.length === 3) {
      const day = parseInt(parts[0])
      const month = months[parts[1]]
      const year = parseInt(parts[2])

      if (!isNaN(day) && month !== undefined && !isNaN(year)) {
        return new Date(year, month, day)
      }
    }

    // Fallback to standard parsing
    return new Date(dateStr)
  } catch (error) {
    console.warn(`⚠️ Could not parse date: ${dateStr}`)
    return null
  }
}

/**
 * Main function to check death updates
 */
async function checkDeathUpdates(options: { force?: boolean; ageGroup?: string } = {}) {
  console.log('\n💀 Starting death information check...\n')

  // Get all living people without death dates
  const people = await prisma.person.findMany({
    where: {
      AND: [
        { isDeceased: false },
        {
          OR: [
            { birthDate: { not: null } },
            { dateOfBirth: { not: null } }
          ]
        }
      ]
    },
    orderBy: {
      birthDate: 'asc' // Oldest first
    }
  })

  console.log(`Found ${people.length} living people in database\n`)

  // Filter based on schedule
  const peopleToCheck = people.filter(person =>
    shouldCheck(person, options.ageGroup || null, options.force || false)
  )

  if (peopleToCheck.length === 0) {
    console.log('✅ No people need checking at this time based on schedule')
    console.log('\nSchedule:')
    console.log('  - Age 80+: Every 2 weeks')
    console.log('  - Age 60-79: Every 4 weeks')
    console.log('  - Age <60: Every 8 months')
    console.log('\nUse --force to check all people regardless of schedule')
    return
  }

  console.log(`Checking ${peopleToCheck.length} people based on schedule:\n`)

  // Group by age for reporting
  const age80Plus = peopleToCheck.filter(p => {
    const bd = p.birthDate || p.dateOfBirth
    return bd && calculateAge(bd) >= 80
  })
  const age60to79 = peopleToCheck.filter(p => {
    const bd = p.birthDate || p.dateOfBirth
    if (!bd) return false
    const age = calculateAge(bd)
    return age >= 60 && age < 80
  })
  const ageUnder60 = peopleToCheck.filter(p => {
    const bd = p.birthDate || p.dateOfBirth
    return bd && calculateAge(bd) < 60
  })

  console.log(`  - Age 80+: ${age80Plus.length}`)
  console.log(`  - Age 60-79: ${age60to79.length}`)
  console.log(`  - Age <60: ${ageUnder60.length}\n`)

  let deceased = 0
  let checked = 0
  let errors = 0

  for (const person of peopleToCheck) {
    const birthDate = person.birthDate || person.dateOfBirth
    if (!birthDate) continue

    const age = calculateAge(birthDate)
    console.log(`\nChecking: ${person.name} (Age: ${age})`)

    // Rate limiting - wait 2 seconds between API calls
    await new Promise(resolve => setTimeout(resolve, 2000))

    const result = await searchDeathInfo(
      person.name,
      birthDate.toISOString().split('T')[0],
      person.primaryNationality || 'Unknown'
    )

    // Update last check time
    await prisma.person.update({
      where: { id: person.id },
      data: { lastDeathCheck: new Date() }
    })

    if (result.isDead && result.confidence > 0.7) {
      console.log(`  💀 DECEASED - Confidence: ${result.confidence}`)
      console.log(`  📅 Death Date: ${result.deathDate || 'Unknown'}`)
      console.log(`  📍 Death Place: ${result.deathPlace || 'Unknown'}`)
      console.log(`  📰 Sources: ${result.sources.length}`)

      // Parse death date
      const deathDate = result.deathDate ? parseDeathDate(result.deathDate) : null

      // Update person record with death information
      await prisma.person.update({
        where: { id: person.id },
        data: {
          isDeceased: true,
          deceasedDate: deathDate,
          deathDate,
          deathPlace: result.deathPlace || null,
          deathCause: result.deathCause || null,
          isActive: false
        }
      })

      // Create source records for death information
      for (const source of result.sources) {
        try {
          await prisma.source.create({
            data: {
              url: source.url,
              title: source.title,
              publication: source.publication,
              publishDate: new Date(source.date),
              credibilityLevel: result.confidence > 0.8 ? 'VERY_HIGH' : 'HIGH',
              sourceType: 'NEWS_ARTICLE'
            }
          })
        } catch (error) {
          console.warn(`  ⚠️ Could not create source record: ${error instanceof Error ? error.message : String(error)}`)
        }
      }

      deceased++
    } else {
      console.log(`  ✅ Still living (or insufficient evidence)`)
    }

    checked++
  }

  console.log(`\n📊 Summary:`)
  console.log(`   💀 Found deceased: ${deceased}`)
  console.log(`   ✅ Checked: ${checked}`)
  console.log(`   ❌ Errors: ${errors}`)

  await prisma.$disconnect()
}

// Parse command line arguments
const args = process.argv.slice(2)
const options = {
  force: args.includes('--force'),
  ageGroup: args.find(arg => arg.startsWith('--age-group='))?.split('=')[1]
}

if (args.includes('--help')) {
  console.log(`
Death Information Monitor Script

Usage:
  npx tsx scripts/check-death-updates.ts [options]

Options:
  --force              Force check all people regardless of schedule
  --age-group=GROUP    Only check specific age group (80, 60, or under60)
  --help               Show this help message

Schedule:
  - Age 80+: Checked every 2 weeks
  - Age 60-79: Checked every 4 weeks
  - Age <60: Checked every 8 months

Examples:
  npx tsx scripts/check-death-updates.ts              # Check based on schedule
  npx tsx scripts/check-death-updates.ts --force      # Force check all
  npx tsx scripts/check-death-updates.ts --age-group=80  # Only check 80+
  npx tsx scripts/check-death-updates.ts --age-group=60  # Only check 60-79

This script:
- Searches for death information for people in database
- Prioritizes elderly people with more frequent checks
- Updates death date, place, and cause when found
- Creates source records for obituaries and death notices
- Tracks last check time to avoid unnecessary API calls
`)
  process.exit(0)
}

checkDeathUpdates(options).catch(console.error)