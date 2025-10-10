/**
 * Migrate legacy nationality fields to PersonNationality relational model
 * One-time migration script
 *
 * Reads: Person.nationality, nationalityArray, primaryNationality, nationalityDetail
 * Writes: PersonNationality rows
 * Updates: Person cache fields via computeCachesForPerson
 */

import { PrismaClient, NationalityType, AcquisitionMethod } from '@prisma/client'
import { normalizeCountry, normalizeCountries } from '../lib/countries'
import { computeCachesForPerson } from '../lib/nationality-helpers'

const prisma = new PrismaClient()

async function migrateLegacyNationalities() {
  console.log('🔄 Starting legacy nationality migration...\n')

  const people = await prisma.person.findMany({
    select: {
      id: true,
      name: true,
      nationality: true,
      nationalityArray: true,
      primaryNationality: true,
      nationalityDetail: true,
    },
  })

  console.log(`Found ${people.length} people\n`)

  let migrated = 0
  let skipped = 0
  let errors = 0

  for (const person of people) {
    try {
      const nationalityCodes = new Set<string>()
      let primaryCode: string | null = null

      // Collect from all legacy sources
      if (person.primaryNationality) {
        const code = normalizeCountry(person.primaryNationality)
        if (code) {
          nationalityCodes.add(code)
          primaryCode = code // Mark as primary
        }
      }

      if (person.nationality) {
        const code = normalizeCountry(person.nationality)
        if (code) {
          nationalityCodes.add(code)
          if (!primaryCode) primaryCode = code // First becomes primary
        }
      }

      if (person.nationalityArray && person.nationalityArray.length > 0) {
        const codes = normalizeCountries(person.nationalityArray)
        codes.forEach(c => nationalityCodes.add(c))
        if (!primaryCode && codes.length > 0) primaryCode = codes[0]
      }

      if (nationalityCodes.size === 0) {
        skipped++
        continue // No valid nationality data
      }

      // Check if already migrated
      const existing = await prisma.personNationality.findFirst({
        where: { personId: person.id },
      })

      if (existing) {
        skipped++
        continue // Already migrated
      }

      // Create PersonNationality rows
      let displayOrder = 0
      for (const code of nationalityCodes) {
        const isPrimary = code === primaryCode

        // Infer type and acquisition from detail field
        let type = NationalityType.CITIZENSHIP
        let acquisition: AcquisitionMethod | undefined = undefined
        const detail = person.nationalityDetail?.toLowerCase() || ''

        if (detail.includes('ethnic') || detail.includes('heritage')) {
          type = NationalityType.ETHNIC_ORIGIN
        } else if (detail.includes('cultural') || detail.includes('identity')) {
          type = NationalityType.CULTURAL_IDENTITY
        }

        if (detail.includes('birth')) {
          acquisition = AcquisitionMethod.BY_BIRTH
        } else if (detail.includes('descent') || detail.includes('parent')) {
          acquisition = AcquisitionMethod.BY_DESCENT
        } else if (detail.includes('natural')) {
          acquisition = AcquisitionMethod.NATURALISATION
        } else if (detail.includes('marriage')) {
          acquisition = AcquisitionMethod.MARRIAGE
        }

        await prisma.personNationality.create({
          data: {
            personId: person.id,
            countryCode: code,
            type,
            acquisition,
            isPrimary,
            displayOrder: displayOrder++,
            note: person.nationalityDetail || undefined,
            confidence: person.nationalityDetail ? 80 : 60, // Lower if no detail
          },
        })
      }

      // Compute caches
      await computeCachesForPerson(person.id)

      console.log(`  ✅ ${person.name}: ${Array.from(nationalityCodes).join(', ')} (primary: ${primaryCode})`)
      migrated++

    } catch (error) {
      console.error(`  ❌ Error migrating ${person.name}:`, error)
      errors++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 Migration Summary:')
  console.log(`  ✅ Migrated: ${migrated}`)
  console.log(`  ⏭️  Skipped: ${skipped}`)
  console.log(`  ❌ Errors: ${errors}`)
  console.log('='.repeat(60) + '\n')
}

migrateLegacyNationalities()
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
