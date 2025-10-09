/**
 * Age calculation utilities for people
 */

/**
 * Calculate age from birth date to current date or death date
 * @param birthDate - Date of birth
 * @param deathDate - Optional date of death
 * @returns Age in years
 */
export function calculateAge(birthDate: Date | string, deathDate?: Date | string | null): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  const endDate = deathDate
    ? (typeof deathDate === 'string' ? new Date(deathDate) : deathDate)
    : new Date()

  let age = endDate.getFullYear() - birth.getFullYear()
  const monthDiff = endDate.getMonth() - birth.getMonth()

  // Adjust if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birth.getDate())) {
    age--
  }

  return age
}

/**
 * Get formatted age string with "aged XX" in brackets
 * @param birthDate - Date of birth
 * @param deathDate - Optional date of death
 * @returns Formatted string like "(aged 65)" or null if birthDate invalid
 */
export function getAgeString(birthDate: Date | string | null, deathDate?: Date | string | null): string | null {
  if (!birthDate) return null

  try {
    const age = calculateAge(birthDate, deathDate)
    return `(aged ${age})`
  } catch (error) {
    console.error('Error calculating age:', error)
    return null
  }
}

/**
 * Check if a person is deceased
 * @param deathDate - Optional date of death
 * @returns True if deceased
 */
export function isDeceased(deathDate?: Date | string | null): boolean {
  return !!deathDate
}
