/**
 * Role-Based Access Control Middleware
 * Provides granular permission checking for all admin operations
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '@/lib/auth'
// Temporarily define types until Prisma schema is updated
type UserRole = 'ADMIN' | 'DE' | 'DBO' | 'CM' | 'CI' | 'BOT' | 'QA' | 'AI_CUR' | 'AI_ED' | 'AI_VAL' | 'AI_CITE' | 'VIEWER'
type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'IMPORT' | 'LOGIN' | 'LOGOUT' | 'VERIFY' | 'APPROVE' | 'REJECT' | 'ARCHIVE' | 'RESTORE'

interface AuthUser {
  id: string
  username: string
  email: string
  role: UserRole
  isActive: boolean
}

export type Permission =
  | 'content:create'
  | 'content:read'
  | 'content:update'
  | 'content:delete'
  | 'content:export'
  | 'content:import'
  | 'content:approve'
  | 'content:archive'
  | 'source:create'
  | 'source:read'
  | 'source:update'
  | 'source:delete'
  | 'source:verify'
  | 'source:archive'
  | 'user:create'
  | 'user:read'
  | 'user:update'
  | 'user:delete'
  | 'user:manage'
  | 'api:manage'
  | 'harvest:manage'
  | 'audit:read'
  | 'settings:manage'
  | 'db:export'
  | 'db:import'
  | 'db:backup'

/**
 * Permission matrix by role
 */
export const PERMISSION_MATRIX: Record<UserRole, Permission[]> = {
  ADMIN: ['content:create', 'content:read', 'content:update', 'content:delete', 'content:export',
          'content:import', 'content:approve', 'content:archive', 'source:create', 'source:read',
          'source:update', 'source:delete', 'source:verify', 'source:archive', 'user:create',
          'user:read', 'user:update', 'user:delete', 'user:manage', 'api:manage', 'harvest:manage',
          'audit:read', 'settings:manage', 'db:export', 'db:import', 'db:backup'],

  DE: ['content:create', 'content:read', 'content:update', 'content:delete', 'content:export',
       'source:create', 'source:read', 'source:update', 'source:delete', 'source:verify'],

  DBO: ['content:read', 'content:export', 'content:import', 'source:read', 'db:export',
        'db:import', 'db:backup', 'audit:read'],

  CM: ['content:create', 'content:read', 'content:update', 'content:approve', 'content:archive',
       'source:create', 'source:read', 'source:update', 'source:verify'],

  CI: ['content:create', 'content:read', 'source:create', 'source:read'],

  BOT: ['content:create', 'content:read', 'source:create', 'source:archive', 'harvest:manage'],

  QA: ['content:read', 'source:read', 'source:verify', 'audit:read'],

  AI_CUR: ['content:read', 'source:read'],

  AI_ED: ['content:read', 'content:update', 'source:read'],

  AI_VAL: ['content:read', 'source:read', 'source:verify'],

  AI_CITE: ['source:create', 'source:read', 'source:update', 'source:verify', 'source:archive'],

  VIEWER: ['content:read', 'source:read']
}

/**
 * Check if user has specific permission
 */
export function userHasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = PERMISSION_MATRIX[role] || []
  return permissions.includes(permission)
}

/**
 * Middleware factory for permission checking
 */
export function withPermission(permission: Permission) {
  return (handler: Function) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        // Get token from header or cookie
        const authHeader = req.headers.authorization
        const token = authHeader?.startsWith('Bearer ')
          ? authHeader.substring(7)
          : getCookieToken(req)

        if (!token) {
          return res.status(401).json({ error: 'Authentication required' })
        }

        // Verify token
        const payload = verifyToken(token) as any
        if (!payload) {
          return res.status(401).json({ error: 'Invalid or expired token' })
        }

        // Temporary user lookup (replace with Prisma when schema is updated)
        // For now, use a simple admin user
        const user = payload.username === 'admin' ? {
          id: 'admin-001',
          username: 'admin',
          email: 'admin@thewordsrecord.com',
          role: 'ADMIN' as UserRole,
          isActive: true
        } : null

        if (!user || !user.isActive) {
          return res.status(401).json({ error: 'User not found or inactive' })
        }

        // Check permission
        if (!userHasPermission(user.role, permission)) {
          // Log unauthorized attempt (simplified for now)
          console.log('AUDIT: Unauthorized access attempt', {
            userId: user.id,
            action: AuditAction.VIEW,
            entityType: 'permission',
            entityId: permission,
            metadata: { denied: true },
            ipAddress: getClientIp(req),
            userAgent: req.headers['user-agent']
          })

          return res.status(403).json({
            error: 'Insufficient permissions',
            required: permission,
            role: user.role
          })
        }

        // Attach user to request
        (req as any).user = user

        // Call the actual handler
        return handler(req, res)
      } catch (error) {
        console.error('Permission middleware error:', error)
        return res.status(500).json({ error: 'Authorization error' })
      }
    }
  }
}

/**
 * Middleware for role checking
 */
export function withRole(allowedRoles: UserRole[]) {
  return (handler: Function) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        const authHeader = req.headers.authorization
        const token = authHeader?.startsWith('Bearer ')
          ? authHeader.substring(7)
          : getCookieToken(req)

        if (!token) {
          return res.status(401).json({ error: 'Authentication required' })
        }

        const payload = verifyToken(token) as any
        if (!payload) {
          return res.status(401).json({ error: 'Invalid or expired token' })
        }

        // Temporary user lookup
        const user = payload.username === 'admin' ? {
          id: 'admin-001',
          username: 'admin',
          email: 'admin@thewordsrecord.com',
          role: 'ADMIN' as UserRole,
          isActive: true
        } : null

        if (!user || !user.isActive) {
          return res.status(401).json({ error: 'User not found or inactive' })
        }

        if (!allowedRoles.includes(user.role)) {
          return res.status(403).json({
            error: 'Role not authorized',
            required: allowedRoles,
            current: user.role
          })
        }

        (req as any).user = user
        return handler(req, res)
      } catch (error) {
        console.error('Role middleware error:', error)
        return res.status(500).json({ error: 'Authorization error' })
      }
    }
  }
}

/**
 * Combine multiple permissions (OR logic)
 */
export function withAnyPermission(permissions: Permission[]) {
  return (handler: Function) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        const authHeader = req.headers.authorization
        const token = authHeader?.startsWith('Bearer ')
          ? authHeader.substring(7)
          : getCookieToken(req)

        if (!token) {
          return res.status(401).json({ error: 'Authentication required' })
        }

        const payload = verifyToken(token) as any
        if (!payload) {
          return res.status(401).json({ error: 'Invalid or expired token' })
        }

        // Temporary user lookup
        const user = payload.username === 'admin' ? {
          id: 'admin-001',
          username: 'admin',
          email: 'admin@thewordsrecord.com',
          role: 'ADMIN' as UserRole,
          isActive: true
        } : null

        if (!user || !user.isActive) {
          return res.status(401).json({ error: 'User not found or inactive' })
        }

        // Check if user has any of the required permissions
        const hasPermission = permissions.some(perm =>
          userHasPermission(user.role, perm)
        )

        if (!hasPermission) {
          return res.status(403).json({
            error: 'Insufficient permissions',
            required: permissions,
            role: user.role
          })
        }

        (req as any).user = user
        return handler(req, res)
      } catch (error) {
        console.error('Permission middleware error:', error)
        return res.status(500).json({ error: 'Authorization error' })
      }
    }
  }
}

/**
 * Check content ownership
 */
export function withContentOwnership(contentType: 'draft' | 'apikey') {
  return (handler: Function) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        // First authenticate
        const authHeader = req.headers.authorization
        const token = authHeader?.startsWith('Bearer ')
          ? authHeader.substring(7)
          : getCookieToken(req)

        if (!token) {
          return res.status(401).json({ error: 'Authentication required' })
        }

        const payload = verifyToken(token) as any
        if (!payload) {
          return res.status(401).json({ error: 'Invalid or expired token' })
        }

        const user = payload.username === 'admin' ? {
          id: 'admin-001',
          username: 'admin',
          email: 'admin@thewordsrecord.com',
          role: 'ADMIN' as UserRole,
          isActive: true
        } : null

        if (!user || !user.isActive) {
          return res.status(401).json({ error: 'User not found or inactive' })
        }

        // Check ownership based on content type
        const contentId = req.query.id as string
        if (!contentId) {
          return res.status(400).json({ error: 'Content ID required' })
        }

        let isOwner = false

        switch (contentType) {
          case 'draft':
            // Temporary: always allow for admin
            isOwner = user.role === 'ADMIN'
            break

          case 'apikey':
            // Temporary: always allow for admin
            isOwner = user.role === 'ADMIN'
            break
        }

        // Admins can access everything
        if (!isOwner && user.role !== 'ADMIN') {
          return res.status(403).json({ error: 'Access denied - not owner' })
        }

        (req as any).user = user
        return handler(req, res)
      } catch (error) {
        console.error('Ownership middleware error:', error)
        return res.status(500).json({ error: 'Authorization error' })
      }
    }
  }
}

/**
 * Rate limiting middleware for API endpoints
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function withRateLimit(limit: number = 100, windowMs: number = 60000) {
  return (handler: Function) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const clientId = getClientIp(req)
      const now = Date.now()

      const clientData = rateLimitMap.get(clientId)

      if (!clientData || now > clientData.resetTime) {
        // Reset or initialize
        rateLimitMap.set(clientId, {
          count: 1,
          resetTime: now + windowMs
        })
      } else if (clientData.count >= limit) {
        // Rate limit exceeded
        const retryAfter = Math.ceil((clientData.resetTime - now) / 1000)
        res.setHeader('Retry-After', String(retryAfter))
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter
        })
      } else {
        // Increment count
        clientData.count++
      }

      return handler(req, res)
    }
  }
}

/**
 * Helper to get client IP
 */
function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'] as string
  const realIp = req.headers['x-real-ip'] as string

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  return req.socket?.remoteAddress || 'unknown'
}

/**
 * Helper to get token from cookie
 */
function getCookieToken(req: NextApiRequest): string | null {
  const cookies = req.headers.cookie
  if (!cookies) return null

  const tokenCookie = cookies
    .split(';')
    .find(c => c.trim().startsWith('auth_token='))

  if (!tokenCookie) return null

  return tokenCookie.split('=')[1]
}