import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/auth'
import { UserRole, AuditAction } from '@prisma/client'

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
 * Audit Logs API
 *
 * GET /api/admin/audit-logs
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 50, max: 200)
 * - action: AuditAction filter
 * - entityType: Entity type filter
 * - actorId: Filter by actor
 * - startDate: Filter from date (ISO 8601)
 * - endDate: Filter to date (ISO 8601)
 * - search: Search in entityId or details
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = await requireAdmin(req)
  if (!auth) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const {
      page = '1',
      limit = '50',
      action,
      entityType,
      actorId,
      startDate,
      endDate,
      search
    } = req.query

    // Parse pagination
    const pageNum = Math.max(1, parseInt(page as string, 10))
    const limitNum = Math.min(200, Math.max(1, parseInt(limit as string, 10)))
    const skip = (pageNum - 1) * limitNum

    // Build where clause
    const where: any = {}

    if (action) {
      // Validate action is a valid enum value
      if (Object.values(AuditAction).includes(action as AuditAction)) {
        where.action = action as AuditAction
      }
    }

    if (entityType && typeof entityType === 'string') {
      where.entityType = entityType
    }

    if (actorId && typeof actorId === 'string') {
      where.actorId = actorId
    }

    // Date range filter
    if (startDate || endDate) {
      where.occuredAt = {}
      if (startDate) {
        where.occuredAt.gte = new Date(startDate as string)
      }
      if (endDate) {
        where.occuredAt.lte = new Date(endDate as string)
      }
    }

    // Search filter
    if (search && typeof search === 'string') {
      where.OR = [
        { entityId: { contains: search, mode: 'insensitive' } },
        // Note: Can't search in JSON fields directly with Prisma
        // Would need to use raw SQL for JSON search
      ]
    }

    // Execute queries in parallel
    const [logs, total, stats] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          apiKey: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { occuredAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.auditLog.count({ where }),
      // Get summary stats
      prisma.auditLog.groupBy({
        by: ['action'],
        _count: true,
        where: where.occuredAt ? { occuredAt: where.occuredAt } : undefined
      })
    ])

    return res.status(200).json({
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPreviousPage: pageNum > 1
      },
      stats: stats.reduce((acc, stat) => {
        acc[stat.action] = stat._count
        return acc
      }, {} as Record<string, number>),
      filters: {
        action: action || null,
        entityType: entityType || null,
        actorId: actorId || null,
        startDate: startDate || null,
        endDate: endDate || null,
        search: search || null
      }
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return res.status(500).json({
      error: 'Failed to fetch audit logs',
      details: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : 'Unknown error')
        : undefined
    })
  }
}
