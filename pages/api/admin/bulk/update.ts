import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit'
import { AuditAction, AuditActorType, UserRole } from '@prisma/client'

async function requireAdmin(req: NextApiRequest): Promise<{ userId: string } | null> {
  const token = extractTokenFromRequest(req)
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload || !payload.sub) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, role: true, isActive: true }
  })

  if (!user || !user.isActive || user.role !== UserRole.ADMIN) {
    return null
  }

  return { userId: user.id }
}

/**
 * Bulk Update API
 *
 * PATCH /api/admin/bulk/update
 *
 * Body:
 * {
 *   entityType: 'case' | 'statement' | 'person' | 'organization' | 'source' | 'tag'
 *   ids: string[]
 *   updates: Record<string, any>  // Fields to update
 *   reason?: string
 * }
 *
 * Example:
 * {
 *   entityType: 'case',
 *   ids: ['id1', 'id2', 'id3'],
 *   updates: { status: 'VERIFIED', visibility: 'PUBLIC' },
 *   reason: 'Bulk verification after review'
 * }
 *
 * Response:
 * {
 *   success: true
 *   updated: number
 *   failed: number
 *   errors?: Array<{ id: string, error: string }>
 * }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = await requireAdmin(req)
  if (!auth) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { entityType, ids, updates, reason } = req.body

    // Validation
    if (!entityType || !ids || !Array.isArray(ids) || !updates) {
      return res.status(400).json({
        error: 'Invalid request. Required: entityType (string), ids (array), updates (object)'
      })
    }

    if (ids.length === 0) {
      return res.status(400).json({ error: 'No IDs provided' })
    }

    if (ids.length > 1000) {
      return res.status(400).json({ error: 'Maximum 1000 items per bulk update operation' })
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' })
    }

    // Validate entity type
    const validTypes = ['case', 'statement', 'person', 'organization', 'source', 'tag']
    if (!validTypes.includes(entityType)) {
      return res.status(400).json({
        error: `Invalid entity type. Must be one of: ${validTypes.join(', ')}`
      })
    }

    // Sanitize updates - remove protected fields
    const sanitizedUpdates = sanitizeUpdates(entityType, updates)

    if (Object.keys(sanitizedUpdates).length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update (protected fields were removed)'
      })
    }

    let updated = 0
    let failed = 0
    const errors: Array<{ id: string; error: string }> = []

    // Perform updates
    for (const id of ids) {
      try {
        switch (entityType) {
          case 'case':
            await prisma.case.update({
              where: { id },
              data: sanitizedUpdates
            })
            break

          case 'statement':
            await prisma.statement.update({
              where: { id },
              data: sanitizedUpdates
            })
            break

          case 'person':
            await prisma.person.update({
              where: { id },
              data: sanitizedUpdates
            })
            break

          case 'organization':
            await prisma.organization.update({
              where: { id },
              data: sanitizedUpdates
            })
            break

          case 'source':
            await prisma.source.update({
              where: { id },
              data: sanitizedUpdates
            })
            break

          case 'tag':
            await prisma.tag.update({
              where: { id },
              data: sanitizedUpdates
            })
            break
        }

        updated++

        // Log audit event for each update
        await logAuditEvent({
          action: AuditAction.UPDATE,
          actorType: AuditActorType.USER,
          actorId: auth.userId,
          entityType: entityType.charAt(0).toUpperCase() + entityType.slice(1),
          entityId: id,
          details: {
            bulkOperation: true,
            updates: sanitizedUpdates,
            reason: reason || 'Bulk update operation'
          }
        })
      } catch (error) {
        failed++
        errors.push({
          id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Log bulk operation summary
    await logAuditEvent({
      action: AuditAction.UPDATE,
      actorType: AuditActorType.USER,
      actorId: auth.userId,
      entityType: 'BulkOperation',
      entityId: `bulk-update-${Date.now()}`,
      details: {
        entityType,
        totalRequested: ids.length,
        updated,
        failed,
        updates: sanitizedUpdates,
        reason: reason || 'Bulk update operation'
      }
    })

    return res.status(200).json({
      success: true,
      updated,
      failed,
      total: ids.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Bulk update error:', error)
    return res.status(500).json({
      error: 'Failed to perform bulk update',
      details: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : 'Unknown error')
        : undefined
    })
  }
}

/**
 * Sanitize updates by removing protected/system fields
 */
function sanitizeUpdates(entityType: string, updates: Record<string, any>): Record<string, any> {
  // Protected fields that should never be bulk updated
  const protectedFields = [
    'id',
    'createdAt',
    'updatedAt',
    'deletedAt',
    'createdBy',
    'originatingStatementId',
    'promotedBy',
    'promotedAt',
    'qualificationScore'
  ]

  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(updates)) {
    // Skip protected fields
    if (protectedFields.includes(key)) {
      continue
    }

    // Skip null/undefined values
    if (value === null || value === undefined) {
      continue
    }

    // Entity-specific validation
    switch (entityType) {
      case 'case':
        // Only allow certain fields for cases
        const allowedCaseFields = [
          'status',
          'severity',
          'visibility',
          'isVerified',
          'isArchived',
          'isFeatured',
          'prominenceScore',
          'lastReviewedAt'
        ]
        if (allowedCaseFields.includes(key)) {
          sanitized[key] = value
        }
        break

      case 'statement':
        const allowedStatementFields = [
          'isVerified',
          'verificationLevel',
          'lostEmployment',
          'lostContracts',
          'paintedNegatively',
          'responseImpact'
        ]
        if (allowedStatementFields.includes(key)) {
          sanitized[key] = value
        }
        break

      case 'person':
        const allowedPersonFields = [
          'verificationLevel',
          'influenceLevel',
          'influenceScore',
          'controversyScore'
        ]
        if (allowedPersonFields.includes(key)) {
          sanitized[key] = value
        }
        break

      case 'organization':
        const allowedOrgFields = [
          'verificationLevel',
          'controversyScore'
        ]
        if (allowedOrgFields.includes(key)) {
          sanitized[key] = value
        }
        break

      case 'source':
        const allowedSourceFields = [
          'isVerified',
          'verificationStatus',
          'isArchived'
        ]
        if (allowedSourceFields.includes(key)) {
          sanitized[key] = value
        }
        break

      case 'tag':
        const allowedTagFields = [
          'category',
          'isControversial',
          'controversyScore',
          'color',
          'icon'
        ]
        if (allowedTagFields.includes(key)) {
          sanitized[key] = value
        }
        break

      default:
        // For unknown types, be very restrictive
        break
    }
  }

  return sanitized
}
