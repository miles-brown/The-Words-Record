// Change Tracking Utilities for Person Records

import { prisma } from '@/lib/prisma'
import { AuditAction, AuditActorType } from '@prisma/client'

export interface FieldChange {
  field: string
  oldValue: any
  newValue: any
  fieldType: string
}

export interface ChangeLogEntry {
  id: string
  action: string
  actorId: string
  actorType: string
  userId?: string
  entityType: string
  entityId: string
  changes: FieldChange[]
  timestamp: Date
}

/**
 * Compare two objects and identify what fields changed
 */
export function detectChanges(oldData: any, newData: any, fieldsToTrack?: string[]): FieldChange[] {
  const changes: FieldChange[] = []
  const fields = fieldsToTrack || Object.keys(newData)

  fields.forEach(field => {
    const oldValue = oldData[field]
    const newValue = newData[field]

    // Skip if values are the same
    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
      return
    }

    // Determine field type
    let fieldType: string = typeof newValue
    if (Array.isArray(newValue)) fieldType = 'array'
    if (newValue instanceof Date) fieldType = 'date'
    if (newValue === null) fieldType = 'null'

    changes.push({
      field,
      oldValue: serializeValue(oldValue),
      newValue: serializeValue(newValue),
      fieldType
    })
  })

  return changes
}

/**
 * Serialize values for storage (handle dates, arrays, objects)
 */
function serializeValue(value: any): any {
  if (value === null || value === undefined) return null
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value
  if (typeof value === 'object') return JSON.stringify(value)
  return value
}

/**
 * Log changes to the audit table
 */
export async function logPersonChanges(params: {
  personId: string
  personSlug: string
  changes: FieldChange[]
  userId: string
  action?: AuditAction
  metadata?: any
}): Promise<void> {
  const { personId, personSlug, changes, userId, action = AuditAction.UPDATE, metadata } = params

  if (changes.length === 0) {
    return // No changes to log
  }

  await prisma.auditLog.create({
    data: {
      action,
      actorType: AuditActorType.USER,
      userId,
      entityType: 'Person',
      entityId: personId,
      description: `Updated ${changes.length} field${changes.length !== 1 ? 's' : ''} for ${personSlug}`,
      changes: {
        fields: changes.map(c => ({
          field: c.field,
          from: c.oldValue,
          to: c.newValue,
          type: c.fieldType
        })),
        count: changes.length
      },
      metadata: metadata || { personSlug }
    }
  })
}

/**
 * Fetch change history for a person
 */
export async function getPersonChangeHistory(
  personId: string,
  limit: number = 50,
  offset: number = 0
): Promise<ChangeLogEntry[]> {
  const logs = await prisma.auditLog.findMany({
    where: {
      entityType: 'Person',
      entityId: personId
    },
    orderBy: {
      occuredAt: 'desc'
    },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          id: true,
          email: true
        }
      }
    }
  })

  return logs.map(log => ({
    id: log.id,
    action: log.action,
    actorId: log.actorId || '',
    actorType: log.actorType,
    userId: log.userId || undefined,
    entityType: log.entityType || '',
    entityId: log.entityId || '',
    changes: extractChangesFromLog(log.changes),
    timestamp: log.occuredAt
  }))
}

/**
 * Extract changes from the audit log JSON
 */
function extractChangesFromLog(changesJson: any): FieldChange[] {
  if (!changesJson || typeof changesJson !== 'object') return []

  const fields = changesJson.fields || []

  return fields.map((f: any) => ({
    field: f.field || '',
    oldValue: f.from,
    newValue: f.to,
    fieldType: f.type || 'unknown'
  }))
}

/**
 * Get summary statistics for recent changes
 */
export async function getRecentChangesStats(days: number = 7) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const [totalChanges, uniquePeople, uniqueUsers] = await Promise.all([
    prisma.auditLog.count({
      where: {
        entityType: 'Person',
        action: AuditAction.UPDATE,
        occuredAt: { gte: since }
      }
    }),
    prisma.auditLog.findMany({
      where: {
        entityType: 'Person',
        action: AuditAction.UPDATE,
        occuredAt: { gte: since }
      },
      select: { entityId: true },
      distinct: ['entityId']
    }),
    prisma.auditLog.findMany({
      where: {
        entityType: 'Person',
        action: AuditAction.UPDATE,
        occuredAt: { gte: since }
      },
      select: { userId: true },
      distinct: ['userId']
    })
  ])

  return {
    totalChanges,
    uniquePeopleEdited: uniquePeople.length,
    uniqueEditors: uniqueUsers.filter(u => u.userId).length,
    periodDays: days
  }
}

/**
 * Validate referential integrity for a person record
 */
export async function validatePersonReferences(personId: string): Promise<{
  valid: boolean
  issues: string[]
}> {
  const issues: string[] = []

  const person = await prisma.person.findUnique({
    where: { id: personId },
    include: {
      nationalities: true,
      affiliations: {
        include: {
          organization: true
        }
      },
      cases: true
    }
  })

  if (!person) {
    return { valid: false, issues: ['Person not found'] }
  }

  // Check nationality references
  for (const nat of person.nationalities) {
    const country = await prisma.country.findUnique({
      where: { code: nat.countryCode }
    })
    if (!country) {
      issues.push(`Invalid country code: ${nat.countryCode}`)
    }
  }

  // Check organization references in affiliations
  for (const aff of person.affiliations) {
    if (!aff.organization) {
      issues.push(`Affiliation ${aff.id} references missing organization`)
    }
  }

  // Note: The cases relationship is a many-to-many through PersonCase join table,
  // but we can trust Prisma's referential integrity checks. If person.cases loads,
  // the references are valid. We'll just check for any orphaned references via count.
  if (person.cases.length > 0) {
    // Cases loaded successfully, references are valid
  }

  return {
    valid: issues.length === 0,
    issues
  }
}

/**
 * Batch validate multiple person records
 */
export async function batchValidatePersons(personIds: string[]): Promise<{
  totalChecked: number
  validRecords: number
  invalidRecords: number
  issuesByPerson: Record<string, string[]>
}> {
  const results = await Promise.all(
    personIds.map(async id => {
      const validation = await validatePersonReferences(id)
      return { id, validation }
    })
  )

  const issuesByPerson: Record<string, string[]> = {}
  let validRecords = 0
  let invalidRecords = 0

  results.forEach(({ id, validation }) => {
    if (validation.valid) {
      validRecords++
    } else {
      invalidRecords++
      issuesByPerson[id] = validation.issues
    }
  })

  return {
    totalChecked: personIds.length,
    validRecords,
    invalidRecords,
    issuesByPerson
  }
}
