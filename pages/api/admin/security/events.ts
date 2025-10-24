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

interface SecurityEvent {
  id: string
  type: 'login' | 'logout' | 'failed_login' | 'permission_change' | 'data_export' | 'suspicious'
  user: string
  description: string
  timestamp: string
  ipAddress: string
  risk: 'low' | 'medium' | 'high'
}

/**
 * Security Events API
 *
 * GET /api/admin/security/events
 * Returns recent security-related activity from audit logs
 *
 * Query Parameters:
 * - timeRange: '24h' | '7d' | '30d' (default: '24h')
 * - limit: number (default: 20, max: 100)
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
    const { timeRange = '24h', limit = '20' } = req.query

    // Calculate time threshold based on range
    let hoursAgo = 24
    if (timeRange === '7d') hoursAgo = 24 * 7
    else if (timeRange === '30d') hoursAgo = 24 * 30

    const timeThreshold = new Date(Date.now() - hoursAgo * 60 * 60 * 1000)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)))

    // Fetch relevant audit logs
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        occuredAt: {
          gte: timeThreshold
        },
        action: {
          in: [
            'LOGIN',
            'LOGIN_FAILED',
            'LOGOUT',
            'UPDATE',
            'EXPORT',
            'AUTHZ_DENIED'
          ]
        }
      },
      select: {
        id: true,
        action: true,
        actorId: true,
        actorType: true,
        entityType: true,
        entityId: true,
        description: true,
        ipAddress: true,
        occuredAt: true,
        status: true,
        user: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        occuredAt: 'desc'
      },
      take: limitNum
    })

    // Transform audit logs to security events
    const events: SecurityEvent[] = auditLogs.map(log => {
      const event: SecurityEvent = {
        id: log.id,
        type: mapActionToType(log.action),
        user: log.user?.username || log.user?.email || log.actorId || 'Unknown',
        description: log.description || getDefaultDescription(log.action, log.entityType),
        timestamp: formatTimestamp(log.occuredAt),
        ipAddress: log.ipAddress || 'Unknown',
        risk: calculateRisk(log.action, log.status)
      }
      return event
    })

    return res.status(200).json({ events })
  } catch (error) {
    console.error('Failed to fetch security events:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function mapActionToType(action: AuditAction): SecurityEvent['type'] {
  switch (action) {
    case 'LOGIN':
      return 'login'
    case 'LOGIN_FAILED':
      return 'failed_login'
    case 'LOGOUT':
      return 'logout'
    case 'UPDATE':
      return 'permission_change'
    case 'EXPORT':
      return 'data_export'
    case 'AUTHZ_DENIED':
      return 'suspicious'
    default:
      return 'login'
  }
}

function getDefaultDescription(action: AuditAction, entityType: string | null): string {
  switch (action) {
    case 'LOGIN':
      return 'Successful login'
    case 'LOGIN_FAILED':
      return 'Failed login attempt'
    case 'LOGOUT':
      return 'User logged out'
    case 'UPDATE':
      return entityType === 'User' ? 'User permissions updated' : `${entityType || 'Entity'} updated`
    case 'EXPORT':
      return 'Data exported'
    case 'AUTHZ_DENIED':
      return 'Authorization denied - suspicious activity'
    default:
      return 'Security event'
  }
}

function calculateRisk(action: AuditAction, status: string): SecurityEvent['risk'] {
  if (action === 'LOGIN_FAILED' || action === 'AUTHZ_DENIED') {
    return 'high'
  }
  if (action === 'UPDATE' || action === 'EXPORT') {
    return 'medium'
  }
  return 'low'
}

function formatTimestamp(date: Date): string {
  const now = Date.now()
  const diff = now - date.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return `${seconds} seconds ago`
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`

  return date.toLocaleDateString()
}
