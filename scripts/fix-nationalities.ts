#!/usr/bin/env tsx
/**
 * Nationality Standardization Script
 *
 * Fixes nationality fields to proper format:
 * - Proper case (not ALL CAPS): "United States" not "UNITED STATES"
 * - Full country names: "United Kingdom" not "UK"
 * - Primary nationality in main field
 * - Additional nationalities in nationalityArray
 *
 * Usage:
 *   npx tsx scripts/fix-nationalities.ts [--dry-run]
 */

import { PrismaClient, Nationality } from '@prisma/client'
import { config } from 'dotenv'

config()

const prisma = new PrismaClient()

/**
 * Mapping of incorrect formats to correct Nationality enum values
 */
const NATIONALITY_FIXES: Record<string, Nationality> = {
  // ALL CAPS fixes
  'UNITED STATES': 'USA',
  'UNITED KINGDOM': 'UK',
  'FRANCE': 'FRANCE',
  'GERMANY': 'GERMANY',
  'BRAZIL': 'BRAZIL',
  'CANADA': 'CANADA',
  'AUSTRALIA': 'AUSTRALIA',
  'ISRAEL': 'ISRAEL',
  'PALESTINE': 'PALESTINE',
  'RUSSIA': 'RUSSIA',
  'CHINA': 'CHINA',
  'INDIA': 'INDIA',
  'MEXICO': 'MEXICO',
  'JAPAN': 'JAPAN',
  'SOUTH KOREA': 'SOUTH_KOREA',
  'SAUDI ARABIA': 'SAUDI_ARABIA',
  'IRAN': 'IRAN',
  'EGYPT': 'EGYPT',
  'TURKEY': 'TURKEY',
  'SOUTH AFRICA': 'SOUTH_AFRICA',
  'NIGERIA': 'NIGERIA',

  // Common abbreviations
  'US': 'USA',
  'U.S.': 'USA',
  'U.S.A.': 'USA',
  'UK': 'UK',
  'U.K.': 'UK',
  'GB': 'UK',

  // Adjectives to country names
  'American': 'USA',
  'British': 'UK',
  'French': 'FRANCE',
  'German': 'GERMANY',
  'Brazilian': 'BRAZIL',
  'Canadian': 'CANADA',
  'Australian': 'AUSTRALIA',
  'Israeli': 'ISRAEL',
  'Palestinian': 'PALESTINE',
  'Russian': 'RUSSIA',
  'Chinese': 'CHINA',
  'Indian': 'INDIA',
  'Mexican': 'MEXICO',
  'Japanese': 'JAPAN',
  'South Korean': 'SOUTH_KOREA',
  'Saudi': 'SAUDI_ARABIA',
  'Iranian': 'IRAN',
  'Egyptian': 'EGYPT',
  'Turkish': 'TURKEY',
  'South African': 'SOUTH_AFRICA',
  'Nigerian': 'NIGERIA',

  // Special cases
  'England': 'UK',
  'Scotland': 'UK',
  'Wales': 'UK',
  'Northern Ireland': 'UK'
}

/**
 * Parse nationality string and return array of Nationality enums
 */
function parseNationalities(nationalityStr: string | null | undefined): Nationality[] {
  if (!nationalityStr) return []

  const parts = nationalityStr.split(/[,;/]/).map(s => s.trim())
  const nationalities: Nationality[] = []

  for (const part of parts) {
    const upperPart = part.toUpperCase()
    const fixed = NATIONALITY_FIXES[upperPart] || NATIONALITY_FIXES[part]

    if (fixed) {
      nationalities.push(fixed)
    } else {
      console.warn(`⚠️  Unknown nationality format: "${part}" - mapping to OTHER`)
      nationalities.push('OTHER')
    }
  }

  return nationalities
}

/**
 * Fix a single person's nationality
 */
async function fixPersonNationality(person: any, dryRun: boolean): Promise<boolean> {
  const oldNationality = person.nationality
  const oldNationalityDetail = person.nationalityDetail
  const oldNationalityArray = person.nationalityArray || []

  // Parse old data
  const parsedFromOld = parseNationalities(oldNationality)
  const parsedFromDetail = parseNationalities(oldNationalityDetail)
  const combined = [...new Set([...parsedFromOld, ...parsedFromDetail, ...oldNationalityArray])]

  if (combined.length === 0) {
    console.log(`  ⚠️  No nationality data for ${person.name}`)
    return false
  }

  const primaryNationality = combined[0]
  const nationalityArray = combined

  // Check if fix is needed
  if (person.primaryNationality === primaryNationality &&
      JSON.stringify(person.nationalityArray) === JSON.stringify(nationalityArray)) {
    return false // No change needed
  }

  if (dryRun) {
    console.log(`  [DRY RUN] Would update ${person.name}:`)
    console.log(`    Old: ${oldNationality} / ${oldNationalityArray.join(', ')}`)
    console.log(`    New: ${primaryNationality} / ${nationalityArray.join(', ')}`)
    return true
  }

  // Update database
  await prisma.person.update({
    where: { id: person.id },
    data: {
      primaryNationality,
      nationalityArray: nationalityArray,
      nationality: undefined, // Clear old field (deprecated)
      nationalityDetail: undefined // Clear old field (deprecated)
    }
  })

  console.log(`  ✅ Updated ${person.name}: ${primaryNationality}`)
  return true
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')

  console.log(`
🌍 Nationality Standardization Script
====================================

Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE (will update database)'}

`)

  // Fetch all people
  const people = await prisma.person.findMany({
    select: {
      id: true,
      name: true,
      nationality: true,
      nationalityDetail: true,
      nationalityArray: true,
      primaryNationality: true
    }
  })

  console.log(`Found ${people.length} people in database\n`)

  let fixed = 0
  let noChange = 0
  let errors = 0

  for (const person of people) {
    try {
      const wasFixed = await fixPersonNationality(person, dryRun)
      if (wasFixed) {
        fixed++
      } else {
        noChange++
      }
    } catch (error) {
      console.error(`❌ Error fixing ${person.name}:`, error)
      errors++
    }
  }

  // Summary
  console.log(`\n
${'='.repeat(60)}
SUMMARY
${'='.repeat(60)}

Total people:        ${people.length}
✅ Fixed:             ${fixed}
✓  No change needed:  ${noChange}
❌ Errors:            ${errors}

${dryRun ? '⚠️  DRY RUN MODE - No changes were made' : '✅ Database updated successfully'}
`)

  if (dryRun && fixed > 0) {
    console.log(`\n💡 Run without --dry-run to apply these changes:\n   npx tsx scripts/fix-nationalities.ts\n`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
