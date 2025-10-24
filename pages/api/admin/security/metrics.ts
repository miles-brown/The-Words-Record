import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/auth'
import { UserRole } from '@prisma/client'

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

interface SecurityMetrics {
  activeSessions: number
  failedLogins24h: number
  mfaEnabledPercent: number
  apiKeys: number
}

/**
 * Security Metrics API
 *
 * GET /api/admin/security/metrics
 * Returns current security metrics and statistics
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
    // Calculate metrics
    const [
      activeSessionsCount,
      failedLoginsCount,
      totalUsers,
      mfaEnabledUsers,
      apiKeysCount
    ] = await Promise.all([
      // Active sessions (users who logged in within last 24 hours)
      prisma.user.count({
        where: {
          isActive: true,
          lastLogin: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Failed logins in last 24 hours
      prisma.auditLog.count({
        where: {
          action: 'LOGIN_FAILED',
          occuredAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Total active users
      prisma.user.count({
        where: {
          isActive: true
        }
      }),

      // Users with MFA enabled
      prisma.user.count({
        where: {
          isActive: true,
          mfaEnabled: true
        }
      }),

      // Active API keys
      prisma.apiKey.count({
        where: {
          expiresAt: {
            gt: new Date()
          },
          revokedAt: null
        }
      })
    ])

    // Calculate MFA percentage
    const mfaPercent = totalUsers > 0
      ? Math.round((mfaEnabledUsers / totalUsers) * 100)
      : 0

    const metrics: SecurityMetrics = {
      activeSessions: activeSessionsCount,
      failedLogins24h: failedLoginsCount,
      mfaEnabledPercent: mfaPercent,
      apiKeys: apiKeysCount
    }

    return res.status(200).json(metrics)
  } catch (error) {
    console.error('Failed to fetch security metrics:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
