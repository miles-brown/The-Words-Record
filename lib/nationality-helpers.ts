/**
 * Nationality Helper Utilities
 * Computes Person nationality caches from PersonNationality facts
 */

import { PrismaClient, NationalityType } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Compute and update nationality cache fields for a person
 * Reads from PersonNationality (active rows: endDate IS NULL)
 * Writes to Person.nationality_primary_code and nationality_codes_cached
 */
export async function computeCachesForPerson(personId: string): Promise<void> {
  // Fetch active nationalities ordered by priority
  const nationalities = await prisma.personNationality.findMany({
    where: {
      personId,
      endDate: null, // Only active/current nationalities
    },
    orderBy: [
      { isPrimary: 'desc' },     // Primary first
      { displayOrder: 'asc' },   // Then by display order
      { type: 'asc' },           // Then by type (CITIZENSHIP first in enum)
      { createdAt: 'asc' },      // Then oldest first
    ],
  })

  // Extract unique country codes
  const codes = Array.from(new Set(nationalities.map(n => n.countryCode)))

  // Determine primary: first isPrimary=true CITIZENSHIP, else first by order
  const primaryNationality = nationalities.find(
    n => n.isPrimary && n.type === NationalityType.CITIZENSHIP
  ) || nationalities.find(
    n => n.type === NationalityType.CITIZENSHIP
  ) || nationalities[0]

  const primaryCode = primaryNationality?.countryCode || null

  // Update Person caches using raw SQL to avoid validation errors from corrupted data
  await prisma.$executeRaw`
    UPDATE "Person"
    SET
      "nationality_primary_code" = ${primaryCode},
      "nationality_codes_cached" = ${codes}::text[]
    WHERE id = ${personId}
  `
}

/**
 * Validate nationality rules before insert/update
 * Enforces governance: max one primary CITIZENSHIP, no overlapping facts, etc.
 */
export async function validatePersonNationalityRules(
  personId: string,
  countryCode: string,
  type: NationalityType,
  isPrimary: boolean,
  startDate: Date | null,
  endDate: Date | null,
  excludeId?: string // For updates, exclude current record
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = []

  // Rule 1: At most one primary CITIZENSHIP (active)
  if (isPrimary && type === NationalityType.CITIZENSHIP && !endDate) {
    const existingPrimary = await prisma.personNationality.findFirst({
      where: {
        personId,
        type: NationalityType.CITIZENSHIP,
        isPrimary: true,
        endDate: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    })

    if (existingPrimary) {
      errors.push(
        `Person already has a primary citizenship: ${existingPrimary.countryCode}. ` +
        `Set isPrimary=false on existing record first.`
      )
    }
  }

  // Rule 2: No overlapping identical facts (same person, country, type with overlapping dates)
  // Simplified: check for any active (endDate null) fact of same type
  const existingActive = await prisma.personNationality.findFirst({
    where: {
      personId,
      countryCode,
      type,
      endDate: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  })

  if (existingActive && !endDate) {
    errors.push(
      `Active ${type} fact for ${countryCode} already exists. ` +
      `Close existing fact (set endDate) before creating a new one.`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Create or update PersonNationality with validation and cache update
 */
export async function upsertPersonNationality(data: {
  id?: string // If present, update; else create
  personId: string
  countryCode: string
  type: NationalityType
  acquisition?: string
  isPrimary?: boolean
  displayOrder?: number
  startDate?: Date | null
  endDate?: Date | null
  sourceId?: string | null
  confidence?: number | null
  note?: string | null
}): Promise<{ success: boolean; errors?: string[]; id?: string }> {
  const {
    id,
    personId,
    countryCode,
    type,
    acquisition,
    isPrimary = false,
    displayOrder = 0,
    startDate = null,
    endDate = null,
    sourceId = null,
    confidence = null,
    note = null,
  } = data

  // Validate rules
  const validation = await validatePersonNationalityRules(
    personId,
    countryCode,
    type,
    isPrimary,
    startDate,
    endDate,
    id // Exclude self if updating
  )

  if (!validation.valid) {
    return { success: false, errors: validation.errors }
  }

  // Upsert
  const result = id
    ? await prisma.personNationality.update({
        where: { id },
        data: {
          countryCode,
          type,
          acquisition: acquisition as any,
          isPrimary,
          displayOrder,
          startDate,
          endDate,
          sourceId,
          confidence,
          note,
        },
      })
    : await prisma.personNationality.create({
        data: {
          personId,
          countryCode,
          type,
          acquisition: acquisition as any,
          isPrimary,
          displayOrder,
          startDate,
          endDate,
          sourceId,
          confidence,
          note,
        },
      })

  // Recompute caches
  await computeCachesForPerson(personId)

  return { success: true, id: result.id }
}

/**
 * Close (end-date) an active PersonNationality
 */
export async function closePersonNationality(
  id: string,
  endDate: Date = new Date()
): Promise<void> {
  const record = await prisma.personNationality.findUnique({ where: { id } })
  if (!record) throw new Error(`PersonNationality ${id} not found`)

  await prisma.personNationality.update({
    where: { id },
    data: { endDate },
  })

  // Recompute caches
  await computeCachesForPerson(record.personId)
}
