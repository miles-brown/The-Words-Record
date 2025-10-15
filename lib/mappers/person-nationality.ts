/**
 * Person Nationality Mapper
 * Maps Person with PersonNationality relations to normalized DTO
 */

import type { Person, PersonNationality, Country } from '@prisma/client'
import { flagEmojiFromCode, countryNameFromCode } from '../countries'

export type PersonWithNationalities = Person & {
  nationalities?: (PersonNationality & { country: Country })[]
}

export interface NationalityDTO {
  code: string
  name: string
  flagEmoji: string
  type: string
  acquisition?: string
  isPrimary: boolean
  startDate?: string | null
  endDate?: string | null
  note?: string | null
}

/**
 * Add normalized nationality data to Person DTO
 * Works with either full PersonNationality relations or cache fields
 */
export function withNormalizedNationality(person: PersonWithNationalities) {
  const nationalityCodes = person.nationality_codes_cached || []
  const primaryCode = person.nationality_primary_code

  // If we have full relations, use them; otherwise fallback to caches
  const nationalitiesExpanded: NationalityDTO[] = person.nationalities
    ? person.nationalities
        .filter(n => !n.endDate) // Active only
        .map(n => ({
          code: n.countryCode,
          name: n.country.name_en,
          flagEmoji: n.country.flag_emoji || '🌐',
          type: n.type,
          acquisition: n.acquisition || undefined,
          isPrimary: n.isPrimary,
          startDate: n.startDate?.toISOString() || null,
          endDate: n.endDate?.toISOString() || null,
          note: n.note || null,
        }))
    : nationalityCodes.map(code => ({
        code,
        name: countryNameFromCode(code as any),
        flagEmoji: flagEmojiFromCode(code as any),
        type: 'CITIZENSHIP',
        isPrimary: code === primaryCode,
        startDate: null,
        endDate: null,
        note: null,
      }))

  return {
    ...person,
    nationalityCodes,
    nationalityPrimaryCode: primaryCode,
    nationalities: nationalitiesExpanded,
  }
}
