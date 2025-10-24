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

interface AuditFinding {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: 'authentication' | 'access_control' | 'data_security' | 'configuration' | 'compliance'
  title: string
  description: string
  recommendation: string
  affectedItems?: string[]
}

interface AuditReport {
  timestamp: string
  overallScore: number
  findings: AuditFinding[]
  summary: {
    critical: number
    high: number
    medium: number
    low: number
    total: number
  }
  checks: {
    total: number
    passed: number
    failed: number
  }
}

/**
 * Security Audit API
 *
 * POST /api/admin/security/audit
 * Runs a comprehensive security audit and returns findings
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = await requireAdmin(req)
  if (!auth) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const findings: AuditFinding[] = []
    let totalChecks = 0
    let passedChecks = 0

    // Check 1: Inactive user accounts
    totalChecks++
    const inactiveUsers = await prisma.user.findMany({
      where: {
        isActive: false,
        role: { not: UserRole.VIEWER }
      },
      select: {
        id: true,
        username: true,
        lastLogin: true
      }
    })

    if (inactiveUsers.length > 0) {
      findings.push({
        id: 'inactive_accounts',
        severity: 'medium',
        category: 'access_control',
        title: 'Inactive User Accounts Detected',
        description: `Found ${inactiveUsers.length} inactive user account(s) that still have elevated privileges.`,
        recommendation: 'Review and remove or permanently deactivate unused accounts to reduce attack surface.',
        affectedItems: inactiveUsers.map(u => u.username || u.id)
      })
    } else {
      passedChecks++
    }

    // Check 2: Users without recent login
    totalChecks++
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const staleUsers = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { not: UserRole.VIEWER },
        OR: [
          { lastLogin: { lt: thirtyDaysAgo } },
          { lastLogin: null }
        ]
      },
      select: {
        id: true,
        username: true,
        role: true,
        lastLogin: true
      }
    })

    if (staleUsers.length > 0) {
      findings.push({
        id: 'stale_accounts',
        severity: 'low',
        category: 'access_control',
        title: 'Stale User Accounts',
        description: `Found ${staleUsers.length} user account(s) with no login activity in the last 30 days.`,
        recommendation: 'Review accounts with no recent activity and consider disabling or removing them.',
        affectedItems: staleUsers.map(u => `${u.username || u.id} (last login: ${u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'never'})`)
      })
    } else {
      passedChecks++
    }

    // Check 3: Multiple failed login attempts
    totalChecks++
    const recentFailedLogins = await prisma.auditLog.findMany({
      where: {
        action: 'LOGIN_FAILED',
        occuredAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      select: {
        actorId: true,
        description: true,
        occuredAt: true
      }
    })

    // Group by IP address or user
    const failedLoginsByActor: Record<string, number> = {}
    recentFailedLogins.forEach(log => {
      const actor = log.actorId || 'unknown'
      failedLoginsByActor[actor] = (failedLoginsByActor[actor] || 0) + 1
    })

    const suspiciousActors = Object.entries(failedLoginsByActor)
      .filter(([_, count]) => count >= 5)
      .map(([actor, count]) => `${actor} (${count} attempts)`)

    if (suspiciousActors.length > 0) {
      findings.push({
        id: 'brute_force_attempts',
        severity: 'high',
        category: 'authentication',
        title: 'Potential Brute Force Attacks',
        description: `Detected ${suspiciousActors.length} actor(s) with 5+ failed login attempts in the last 24 hours.`,
        recommendation: 'Implement rate limiting, account lockout policies, and consider IP blocking for suspicious addresses.',
        affectedItems: suspiciousActors
      })
    } else {
      passedChecks++
    }

    // Check 4: Admin users count
    totalChecks++
    const adminCount = await prisma.user.count({
      where: {
        role: UserRole.ADMIN,
        isActive: true
      }
    })

    if (adminCount > 5) {
      findings.push({
        id: 'excessive_admins',
        severity: 'medium',
        category: 'access_control',
        title: 'Excessive Admin Accounts',
        description: `Found ${adminCount} active admin accounts. Principle of least privilege suggests limiting admin access.`,
        recommendation: 'Review admin accounts and downgrade permissions for users who do not require full admin access.'
      })
    } else {
      passedChecks++
    }

    // Check 5: Recent sensitive data exports
    totalChecks++
    const recentExports = await prisma.auditLog.findMany({
      where: {
        action: 'EXPORT',
        occuredAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      select: {
        actorId: true,
        occuredAt: true,
        description: true
      },
      orderBy: {
        occuredAt: 'desc'
      },
      take: 10
    })

    if (recentExports.length > 10) {
      findings.push({
        id: 'frequent_exports',
        severity: 'medium',
        category: 'data_security',
        title: 'Frequent Data Exports',
        description: `Detected ${recentExports.length} data export operations in the last 7 days.`,
        recommendation: 'Review export activity and ensure all exports are authorized and necessary.',
        affectedItems: recentExports.slice(0, 5).map(e => `${e.actorId} at ${new Date(e.occuredAt).toLocaleString()}`)
      })
    } else {
      passedChecks++
    }

    // Check 6: Recent permission changes
    totalChecks++
    const recentPermissionChanges = await prisma.auditLog.findMany({
      where: {
        action: 'UPDATE',
        entityType: 'User',
        occuredAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      select: {
        actorId: true,
        entityId: true,
        occuredAt: true,
        description: true
      },
      orderBy: {
        occuredAt: 'desc'
      }
    })

    if (recentPermissionChanges.length > 0) {
      findings.push({
        id: 'permission_changes',
        severity: 'low',
        category: 'access_control',
        title: 'Recent Permission Changes',
        description: `Found ${recentPermissionChanges.length} user update(s) in the last 7 days.`,
        recommendation: 'Review recent permission changes to ensure they were authorized and appropriate.',
        affectedItems: recentPermissionChanges.slice(0, 5).map(e => `User ${e.entityId} modified by ${e.actorId}`)
      })
    } else {
      passedChecks++
    }

    // Check 7: Database connection security
    totalChecks++
    const databaseUrl = process.env.DATABASE_URL || ''
    if (!databaseUrl.includes('sslmode=require') && !databaseUrl.includes('ssl=true')) {
      findings.push({
        id: 'database_ssl',
        severity: 'high',
        category: 'configuration',
        title: 'Database SSL Not Enforced',
        description: 'Database connection string does not explicitly require SSL/TLS encryption.',
        recommendation: 'Add "?sslmode=require" or "?ssl=true" to your DATABASE_URL to ensure encrypted connections.'
      })
    } else {
      passedChecks++
    }

    // Check 8: Session timeout configuration
    totalChecks++
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d'
    const expiryMatch = jwtExpiresIn.match(/(\d+)([dhms])/)
    let expiryHours = 168 // default 7 days

    if (expiryMatch) {
      const value = parseInt(expiryMatch[1])
      const unit = expiryMatch[2]
      if (unit === 'd') expiryHours = value * 24
      else if (unit === 'h') expiryHours = value
      else if (unit === 'm') expiryHours = value / 60
      else if (unit === 's') expiryHours = value / 3600
    }

    if (expiryHours > 168) {
      findings.push({
        id: 'long_session_timeout',
        severity: 'medium',
        category: 'authentication',
        title: 'Long Session Timeout',
        description: `JWT session timeout is set to ${jwtExpiresIn}, which exceeds the recommended 7 days.`,
        recommendation: 'Reduce JWT_EXPIRES_IN to 24h or 7d maximum to limit exposure from stolen tokens.'
      })
    } else {
      passedChecks++
    }

    // Calculate severity counts
    const summary = {
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
      low: findings.filter(f => f.severity === 'low').length,
      total: findings.length
    }

    // Calculate overall security score (0-100)
    // Base score of 100, deduct points for findings
    let score = 100
    findings.forEach(finding => {
      switch (finding.severity) {
        case 'critical':
          score -= 20
          break
        case 'high':
          score -= 10
          break
        case 'medium':
          score -= 5
          break
        case 'low':
          score -= 2
          break
      }
    })
    score = Math.max(0, Math.min(100, score)) // Clamp between 0-100

    const report: AuditReport = {
      timestamp: new Date().toISOString(),
      overallScore: score,
      findings,
      summary,
      checks: {
        total: totalChecks,
        passed: passedChecks,
        failed: totalChecks - passedChecks
      }
    }

    return res.status(200).json(report)
  } catch (error) {
    console.error('Security audit failed:', error)
    return res.status(500).json({ error: 'Internal server error during security audit' })
  }
}
