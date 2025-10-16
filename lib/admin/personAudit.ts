// Person Data Completeness Audit Utilities

import { PERSON_FIELDS, FIELD_CATEGORIES } from './personFieldSchema'

// Placeholder values that indicate incomplete data
export const PLACEHOLDER_VALUES = [
  'other',
  'unknown',
  'n/a',
  'na',
  'none',
  'not specified',
  'not available',
  'to be determined',
  'tbd',
  'pending',
  'various',
  'multiple',
  'unspecified'
]

// High-priority fields that should be filled
export const HIGH_PRIORITY_FIELDS = [
  'firstName',
  'lastName',
  'slug',
  'profession',
  'nationality',
  'birthDate',
  'dateOfBirth',
  'shortBio',
  'bio',
  'imageUrl',
  'bestKnownFor',
  'currentTitle',
  'currentOrganization'
]

// Medium-priority fields
export const MEDIUM_PRIORITY_FIELDS = [
  'gender',
  'birthPlace',
  'residence',
  'residenceCountry',
  'residenceCity',
  'politicalParty',
  'politicalBeliefs',
  'religion',
  'yearsActive',
  'educationLevel',
  'universities',
  'degrees',
  'officialWebsite',
  'wikipediaUrl'
]

export interface FieldIssue {
  personId: string
  personSlug: string
  personName: string
  field: string
  issueType: 'missing' | 'placeholder' | 'empty_array'
  currentValue?: any
  priority: 'high' | 'medium' | 'low'
  category: string
}

export interface AuditSummary {
  totalPeople: number
  peopleWithIssues: number
  completenessPercentage: number
  issuesByField: Record<string, {
    missing: number
    placeholder: number
    emptyArray: number
    total: number
    priority: 'high' | 'medium' | 'low'
    category: string
    affectedPeople: string[]
  }>
  issuesByPerson: Record<string, {
    personSlug: string
    personName: string
    totalIssues: number
    highPriorityIssues: number
    mediumPriorityIssues: number
    lowPriorityIssues: number
    completenessPercentage: number
    issues: FieldIssue[]
  }>
  highPriorityIssues: FieldIssue[]
}

/**
 * Check if a value is considered missing or incomplete
 */
export function isMissingValue(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

/**
 * Check if a value is a placeholder
 */
export function isPlaceholderValue(value: any): boolean {
  if (typeof value !== 'string') return false
  const normalized = value.toLowerCase().trim()
  return PLACEHOLDER_VALUES.includes(normalized)
}

/**
 * Get field priority
 */
export function getFieldPriority(fieldName: string): 'high' | 'medium' | 'low' {
  if (HIGH_PRIORITY_FIELDS.includes(fieldName)) return 'high'
  if (MEDIUM_PRIORITY_FIELDS.includes(fieldName)) return 'medium'
  return 'low'
}

/**
 * Get field category
 */
export function getFieldCategory(fieldName: string): string {
  const field = PERSON_FIELDS.find(f => f.name === fieldName)
  return field?.category || 'other'
}

/**
 * Audit a single person record
 */
export function auditPerson(person: any): FieldIssue[] {
  const issues: FieldIssue[] = []

  // Get all auditable fields (excluding computed/disabled fields)
  const auditableFields = PERSON_FIELDS.filter(f => !f.disabled && f.name !== 'id')

  auditableFields.forEach(field => {
    const value = person[field.name]
    const priority = getFieldPriority(field.name)
    const category = field.category

    // Check for missing values
    if (isMissingValue(value)) {
      // Only report high and medium priority missing fields
      if (priority === 'high' || priority === 'medium') {
        issues.push({
          personId: person.id,
          personSlug: person.slug,
          personName: person.name || `${person.firstName} ${person.lastName}`,
          field: field.name,
          issueType: Array.isArray(value) ? 'empty_array' : 'missing',
          currentValue: value,
          priority,
          category
        })
      }
    }
    // Check for placeholder values
    else if (isPlaceholderValue(value)) {
      issues.push({
        personId: person.id,
        personSlug: person.slug,
        personName: person.name || `${person.firstName} ${person.lastName}`,
        field: field.name,
        issueType: 'placeholder',
        currentValue: value,
        priority,
        category
      })
    }
  })

  return issues
}

/**
 * Calculate completeness percentage for a person
 */
export function calculateCompletenessPercentage(person: any): number {
  const auditableFields = PERSON_FIELDS.filter(f => !f.disabled && f.name !== 'id')
  const totalFields = auditableFields.length

  let filledFields = 0

  auditableFields.forEach(field => {
    const value = person[field.name]
    if (!isMissingValue(value) && !isPlaceholderValue(value)) {
      filledFields++
    }
  })

  return Math.round((filledFields / totalFields) * 100)
}

/**
 * Generate comprehensive audit summary
 */
export function generateAuditSummary(people: any[]): AuditSummary {
  const issuesByField: Record<string, any> = {}
  const issuesByPerson: Record<string, any> = {}
  const allHighPriorityIssues: FieldIssue[] = []

  let peopleWithIssues = 0

  people.forEach(person => {
    const issues = auditPerson(person)
    const completeness = calculateCompletenessPercentage(person)

    if (issues.length > 0) {
      peopleWithIssues++

      // Group by person
      issuesByPerson[person.id] = {
        personSlug: person.slug,
        personName: person.name || `${person.firstName} ${person.lastName}`,
        totalIssues: issues.length,
        highPriorityIssues: issues.filter(i => i.priority === 'high').length,
        mediumPriorityIssues: issues.filter(i => i.priority === 'medium').length,
        lowPriorityIssues: issues.filter(i => i.priority === 'low').length,
        completenessPercentage: completeness,
        issues
      }

      // Group by field
      issues.forEach(issue => {
        if (!issuesByField[issue.field]) {
          issuesByField[issue.field] = {
            missing: 0,
            placeholder: 0,
            emptyArray: 0,
            total: 0,
            priority: issue.priority,
            category: issue.category,
            affectedPeople: []
          }
        }

        issuesByField[issue.field].total++
        issuesByField[issue.field].affectedPeople.push(person.slug)

        if (issue.issueType === 'missing') {
          issuesByField[issue.field].missing++
        } else if (issue.issueType === 'placeholder') {
          issuesByField[issue.field].placeholder++
        } else if (issue.issueType === 'empty_array') {
          issuesByField[issue.field].emptyArray++
        }

        // Collect high-priority issues
        if (issue.priority === 'high') {
          allHighPriorityIssues.push(issue)
        }
      })
    } else {
      // Person has no issues, still add to summary
      issuesByPerson[person.id] = {
        personSlug: person.slug,
        personName: person.name || `${person.firstName} ${person.lastName}`,
        totalIssues: 0,
        highPriorityIssues: 0,
        mediumPriorityIssues: 0,
        lowPriorityIssues: 0,
        completenessPercentage: completeness,
        issues: []
      }
    }
  })

  // Calculate overall completeness
  const totalCompleteness = Object.values(issuesByPerson).reduce(
    (sum: number, person: any) => sum + person.completenessPercentage,
    0
  )
  const avgCompleteness = people.length > 0 ? Math.round(totalCompleteness / people.length) : 0

  return {
    totalPeople: people.length,
    peopleWithIssues,
    completenessPercentage: avgCompleteness,
    issuesByField,
    issuesByPerson,
    highPriorityIssues: allHighPriorityIssues
  }
}

/**
 * Get field label from schema
 */
export function getFieldLabel(fieldName: string): string {
  const field = PERSON_FIELDS.find(f => f.name === fieldName)
  return field?.label || fieldName
}

/**
 * Get category label
 */
export function getCategoryLabel(categoryKey: string): string {
  return FIELD_CATEGORIES[categoryKey as keyof typeof FIELD_CATEGORIES] || categoryKey
}
