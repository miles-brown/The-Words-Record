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
 * Bulk Delete API
 *
 * DELETE /api/admin/bulk/delete
 *
 * Body:
 * {
 *   entityType: 'case' | 'statement' | 'person' | 'organization' | 'source' | 'tag'
 *   ids: string[]
 *   reason?: string
 *   dryRun?: boolean  // Test without actually deleting
 * }
 *
 * Response:
 * {
 *   success: true
 *   deleted: number
 *   failed: number
 *   errors?: Array<{ id: string, error: string }>
 *   dryRun?: { canDelete: number, blockedBy: Array<{ id: string, reason: string }> }
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

  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { entityType, ids, reason, dryRun = false } = req.body

    // Validation
    if (!entityType || !ids || !Array.isArray(ids)) {
      return res.status(400).json({
        error: 'Invalid request. Required: entityType (string), ids (array)'
      })
    }

    if (ids.length === 0) {
      return res.status(400).json({ error: 'No IDs provided' })
    }

    if (ids.length > 1000) {
      return res.status(400).json({ error: 'Maximum 1000 items per bulk delete operation' })
    }

    // Validate entity type
    const validTypes = ['case', 'statement', 'person', 'organization', 'source', 'tag', 'user']
    if (!validTypes.includes(entityType)) {
      return res.status(400).json({
        error: `Invalid entity type. Must be one of: ${validTypes.join(', ')}`
      })
    }

    let deleted = 0
    let failed = 0
    const errors: Array<{ id: string; error: string }> = []
    const blocked: Array<{ id: string; reason: string }> = []

    // Dry run mode - check what can be deleted
    if (dryRun) {
      for (const id of ids) {
        try {
          const canDelete = await checkIfDeletable(entityType, id)
          if (!canDelete.deletable) {
            blocked.push({ id, reason: canDelete.reason || 'Unknown blocking issue' })
          }
        } catch (error) {
          blocked.push({
            id,
            reason: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      return res.status(200).json({
        success: true,
        dryRun: {
          canDelete: ids.length - blocked.length,
          total: ids.length,
          blockedBy: blocked
        }
      })
    }

    // Actual deletion
    for (const id of ids) {
      try {
        // Check if deletable
        const check = await checkIfDeletable(entityType, id)
        if (!check.deletable) {
          failed++
          errors.push({ id, error: check.reason || 'Cannot delete due to dependencies' })
          continue
        }

        // Perform deletion based on entity type
        switch (entityType) {
          case 'case':
            await prisma.case.delete({ where: { id } })
            break
          case 'statement':
            await prisma.statement.delete({ where: { id } })
            break
          case 'person':
            await prisma.person.delete({ where: { id } })
            break
          case 'organization':
            await prisma.organization.delete({ where: { id } })
            break
          case 'source':
            await prisma.source.delete({ where: { id } })
            break
          case 'tag':
            await prisma.tag.delete({ where: { id } })
            break
          case 'user':
            // Special handling - can only soft delete users
            await prisma.user.update({
              where: { id },
              data: { isActive: false }
            })
            break
        }

        deleted++

        // Log audit event
        await logAuditEvent({
          action: AuditAction.DELETE,
          actorType: AuditActorType.USER,
          actorId: auth.userId,
          entityType: entityType.charAt(0).toUpperCase() + entityType.slice(1),
          entityId: id,
          details: {
            bulkOperation: true,
            reason: reason || 'Bulk delete operation',
            timestamp: new Date().toISOString()
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
      action: AuditAction.DELETE,
      actorType: AuditActorType.USER,
      actorId: auth.userId,
      entityType: 'BulkOperation',
      entityId: `bulk-delete-${Date.now()}`,
      details: {
        entityType,
        totalRequested: ids.length,
        deleted,
        failed,
        reason: reason || 'Bulk delete operation'
      }
    })

    return res.status(200).json({
      success: true,
      deleted,
      failed,
      total: ids.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Bulk delete error:', error)
    return res.status(500).json({
      error: 'Failed to perform bulk delete',
      details: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : 'Unknown error')
        : undefined
    })
  }
}

/**
 * Check if an entity can be deleted (has no blocking dependencies)
 */
async function checkIfDeletable(
  entityType: string,
  id: string
): Promise<{ deletable: boolean; reason?: string }> {
  try {
    switch (entityType) {
      case 'case': {
        const caseItem = await prisma.case.findUnique({
          where: { id },
          select: {
            _count: {
              select: {
                statements: true,
                sources: true
              }
            }
          }
        })

        if (!caseItem) {
          return { deletable: false, reason: 'Case not found' }
        }

        if (caseItem._count.statements > 0 || caseItem._count.sources > 0) {
          return {
            deletable: false,
            reason: `Case has ${caseItem._count.statements} statements and ${caseItem._count.sources} sources`
          }
        }

        return { deletable: true }
      }

      case 'person': {
        const person = await prisma.person.findUnique({
          where: { id },
          select: {
            _count: {
              select: {
                statements: true,
                cases: true
              }
            }
          }
        })

        if (!person) {
          return { deletable: false, reason: 'Person not found' }
        }

        if (person._count.statements > 0 || person._count.cases > 0) {
          return {
            deletable: false,
            reason: `Person has ${person._count.statements} statements and ${person._count.cases} cases`
          }
        }

        return { deletable: true }
      }

      case 'organization': {
        const org = await prisma.organization.findUnique({
          where: { id },
          select: {
            _count: {
              select: {
                statements: true,
                cases: true
              }
            }
          }
        })

        if (!org) {
          return { deletable: false, reason: 'Organization not found' }
        }

        if (org._count.statements > 0 || org._count.cases > 0) {
          return {
            deletable: false,
            reason: `Organization has ${org._count.statements} statements and ${org._count.cases} cases`
          }
        }

        return { deletable: true }
      }

      case 'statement': {
        const statement = await prisma.statement.findUnique({
          where: { id },
          select: {
            _count: {
              select: {
                responses: true
              }
            }
          }
        })

        if (!statement) {
          return { deletable: false, reason: 'Statement not found' }
        }

        if (statement._count.responses > 0) {
          return {
            deletable: false,
            reason: `Statement has ${statement._count.responses} responses`
          }
        }

        return { deletable: true }
      }

      case 'tag': {
        const tag = await prisma.tag.findUnique({
          where: { id },
          select: {
            _count: {
              select: {
                cases: true
              }
            }
          }
        })

        if (!tag) {
          return { deletable: false, reason: 'Tag not found' }
        }

        if (tag._count.cases > 0) {
          return {
            deletable: false,
            reason: `Tag is used by ${tag._count.cases} cases`
          }
        }

        return { deletable: true }
      }

      case 'source':
      case 'user':
        // Sources and users can generally be deleted (users are soft-deleted)
        return { deletable: true }

      default:
        return { deletable: false, reason: 'Unknown entity type' }
    }
  } catch (error) {
    return {
      deletable: false,
      reason: error instanceof Error ? error.message : 'Error checking dependencies'
    }
  }
}
