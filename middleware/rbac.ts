/**
 * Role-Based Access Control Middleware
 * Provides granular permission checking for all admin operations
 */

import { NextApiRequest, NextApiResponse } from 'next'
import type { Session, UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  extractTokenFromRequest,
  verifyToken,
  getDefaultAdminUser,
  TokenPayload
} from '@/lib/auth'
import { recordAuditEvent, extractRequestContext } from '@/lib/audit'
import { verifyApiKeyRequest } from '@/lib/api-keys'
import type { ApiKeyValidationResult } from '@/lib/api-keys'
import {
  Permission,
  PERMISSION_MATRIX,
  getUserEffectivePermissions,
  userHasPermissionFromList
} from '@/lib/permissions'
import { validateSession } from '@/lib/session'

export const AuditAction = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  VIEW: 'VIEW',
  EXPORT: 'EXPORT',
  IMPORT: 'IMPORT',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  VERIFY: 'VERIFY',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  ARCHIVE: 'ARCHIVE',
  RESTORE: 'RESTORE'
} as const

export type AuditActionType = typeof AuditAction[keyof typeof AuditAction]

interface AuthUser {
  id: string
  username: string
  email: string
  role: UserRole
  isActive: boolean
}

interface AuthContext {
  token: string | null
  payload: TokenPayload | null
  user: AuthUser | null
  apiKey: ApiKeyValidationResult | null
  session: Session | null
}

export function withPermission(permission: Permission) {
  return (handler: Function) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        const auth = await authenticateRequest(req)
        const context = extractRequestContext(req)

        if (!auth.user) {
          const apiKeyResult = await verifyApiKeyRequest(req, [permission])
          if (apiKeyResult) {
            ;(req as any).apiKey = apiKeyResult
            return handler(req, res)
          }

          await recordAuditEvent({
            action: 'AUTHZ_DENIED',
            actorId: auth.payload?.sub,
            actorType: 'USER',
            status: 'FAILURE',
            description: 'Missing or invalid token for permission check',
            metadata: { permission },
            ...context
          })
          return res.status(401).json({ error: 'Authentication required' })
        }

        if (!auth.user.isActive) {
          await recordAuditEvent({
            action: 'AUTHZ_DENIED',
            actorId: auth.user.id,
            actorType: 'USER',
            status: 'FAILURE',
            description: 'Inactive user attempted permission-restricted resource',
            metadata: { permission },
            ...context
          })
          return res.status(401).json({ error: 'User not active' })
        }

        const permissions = await getUserEffectivePermissions(auth.user.id, auth.user.role)

        if (!userHasPermissionFromList(permissions, permission)) {
          await recordAuditEvent({
            action: 'AUTHZ_DENIED',
            actorId: auth.user.id,
            actorType: 'USER',
            status: 'FAILURE',
            description: 'Insufficient permissions',
            metadata: { requiredPermission: permission, role: auth.user.role },
            ...context
          })

          return res.status(403).json({
            error: 'Insufficient permissions',
            required: permission,
            role: auth.user.role
          })
        }

        ;(req as any).user = auth.user
        ;(req as any).session = auth.session
        ;(req as any).permissions = permissions
        return handler(req, res)
      } catch (error) {
        console.error('Permission middleware error:', error)
        return res.status(500).json({ error: 'Authorization error' })
      }
    }
  }
}

export function withAnyPermission(permissions: Permission[]) {
  return (handler: Function) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        const auth = await authenticateRequest(req)
        const context = extractRequestContext(req)

        if (!auth.user) {
          const apiKeyResult = await verifyApiKeyRequest(req, permissions)
          if (apiKeyResult) {
            ;(req as any).apiKey = apiKeyResult
            return handler(req, res)
          }

          await recordAuditEvent({
            action: 'AUTHZ_DENIED',
            actorId: auth.payload?.sub,
            actorType: 'USER',
            status: 'FAILURE',
            description: 'Missing or invalid token for permission set',
            metadata: { permissions },
            ...context
          })
          return res.status(401).json({ error: 'Authentication required' })
        }

        if (!auth.user.isActive) {
          await recordAuditEvent({
            action: 'AUTHZ_DENIED',
            actorId: auth.user.id,
            actorType: 'USER',
            status: 'FAILURE',
            description: 'Inactive user attempted multi-permission access',
            metadata: { permissions },
            ...context
          })
          return res.status(401).json({ error: 'User not active' })
        }

        const userPermissions = await getUserEffectivePermissions(auth.user.id, auth.user.role)
        const hasPermission = permissions.some(perm =>
          userHasPermissionFromList(userPermissions, perm)
        )

        if (!hasPermission) {
          await recordAuditEvent({
            action: 'AUTHZ_DENIED',
            actorId: auth.user.id,
            actorType: 'USER',
            status: 'FAILURE',
            description: 'Insufficient permissions',
            metadata: { requiredPermissions: permissions, role: auth.user.role },
            ...context
          })

          return res.status(403).json({
            error: 'Insufficient permissions',
            required: permissions,
            role: auth.user.role
          })
        }

        ;(req as any).user = auth.user
        ;(req as any).session = auth.session
        ;(req as any).permissions = userPermissions
        return handler(req, res)
      } catch (error) {
        console.error('Permission middleware error:', error)
        return res.status(500).json({ error: 'Authorization error' })
      }
    }
  }
}

export function withRole(allowedRoles: UserRole[]) {
  return (handler: Function) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        const auth = await authenticateRequest(req)
        const context = extractRequestContext(req)

        if (!auth.user) {
          await recordAuditEvent({
            action: 'AUTHZ_DENIED',
            actorId: auth.payload?.sub,
            actorType: 'USER',
            status: 'FAILURE',
            description: 'Missing or invalid token for role check',
            metadata: { allowedRoles },
            ...context
          })
          return res.status(401).json({ error: 'Authentication required' })
        }

        if (!auth.user.isActive) {
          await recordAuditEvent({
            action: 'AUTHZ_DENIED',
            actorId: auth.user.id,
            actorType: 'USER',
            status: 'FAILURE',
            description: 'Inactive user attempted role-restricted access',
            metadata: { allowedRoles },
            ...context
          })
          return res.status(401).json({ error: 'User not active' })
        }

        if (!allowedRoles.includes(auth.user.role)) {
          await recordAuditEvent({
            action: 'AUTHZ_DENIED',
            actorId: auth.user.id,
            actorType: 'USER',
            status: 'FAILURE',
            description: 'Role not authorized',
            metadata: { allowedRoles, currentRole: auth.user.role },
            ...context
          })
          return res.status(403).json({
            error: 'Role not authorized',
            required: allowedRoles,
            current: auth.user.role
          })
        }

        ;(req as any).user = auth.user
        ;(req as any).session = auth.session
        return handler(req, res)
      } catch (error) {
        console.error('Role middleware error:', error)
        return res.status(500).json({ error: 'Authorization error' })
      }
    }
  }
}

export function withContentOwnership(contentType: 'draft' | 'apikey') {
  return (handler: Function) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        const auth = await authenticateRequest(req)
        const context = extractRequestContext(req)

        if (!auth.user) {
          await recordAuditEvent({
            action: 'AUTHZ_DENIED',
            actorId: auth.payload?.sub,
            actorType: 'USER',
            status: 'FAILURE',
            description: 'Missing or invalid token for ownership check',
            metadata: { contentType },
            ...context
          })
          return res.status(401).json({ error: 'Authentication required' })
        }

        if (!auth.user.isActive) {
          await recordAuditEvent({
            action: 'AUTHZ_DENIED',
            actorId: auth.user.id,
            actorType: 'USER',
            status: 'FAILURE',
            description: 'Inactive user attempted ownership-restricted access',
            metadata: { contentType },
            ...context
          })
          return res.status(401).json({ error: 'User not active' })
        }

        const contentId = req.query.id as string
        if (!contentId) {
          return res.status(400).json({ error: 'Content ID required' })
        }

        let isOwner = false
        switch (contentType) {
          case 'draft': {
            const draft = await prisma.contentDraft.findUnique({
              where: { id: contentId },
              select: { userId: true }
            })
            isOwner = draft ? draft.userId === auth.user!.id : false
            break
          }
          case 'apikey': {
            const apiKey = await prisma.apiKey.findUnique({
              where: { id: contentId },
              select: { userId: true }
            })
            isOwner = apiKey ? apiKey.userId === auth.user!.id : false
            break
          }
        }

        if (!isOwner && auth.user.role !== 'ADMIN') {
          await recordAuditEvent({
            action: 'AUTHZ_DENIED',
            actorId: auth.user.id,
            actorType: 'USER',
            status: 'FAILURE',
            description: 'Ownership check failed',
            metadata: { contentType, contentId },
            ...context
          })
          return res.status(403).json({ error: 'Access denied - not owner' })
        }

        ;(req as any).user = auth.user
        ;(req as any).session = auth.session
        return handler(req, res)
      } catch (error) {
        console.error('Ownership middleware error:', error)
        return res.status(500).json({ error: 'Authorization error' })
      }
    }
  }
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function withRateLimit(limit = 100, windowMs = 60_000) {
  return (handler: Function) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const clientId = getClientIp(req)
      const now = Date.now()

      const clientData = rateLimitMap.get(clientId)

      if (!clientData || now > clientData.resetTime) {
        rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs })
      } else if (clientData.count >= limit) {
        const retryAfter = Math.ceil((clientData.resetTime - now) / 1000)
        res.setHeader('Retry-After', String(retryAfter))
        return res.status(429).json({ error: 'Too many requests', retryAfter })
      } else {
        clientData.count++
      }

      return handler(req, res)
    }
  }
}

async function authenticateRequest(req: NextApiRequest): Promise<AuthContext> {
  const token = extractTokenFromRequest(req)

  if (!token) {
    return { token: null, payload: null, user: null, apiKey: null, session: null }
  }

  const payload = verifyToken(token)
  const user = resolveUserFromPayload(payload)
  let session: Session | null = null

  if (payload?.sid) {
    session = await validateSession(payload.sid)
    if (!session) {
      return { token: null, payload: null, user: null, apiKey: null, session: null }
    }
  }

  return { token, payload, user, apiKey: null, session }
}

function resolveUserFromPayload(payload: TokenPayload | null): AuthUser | null {
  if (!payload) return null

  const base = getDefaultAdminUser()
  const username = payload.username || base.username
  const email = payload.email || base.email || `${username}@thewordsrecord.local`

  return {
    id: payload.sub || payload.id || base.id || username,
    username,
    email,
    role: normalizeRole(payload.role || base.role),
    isActive: true
  }
}

function normalizeRole(value?: string | null): UserRole {
  const normalized = (value || '').toUpperCase() as UserRole
  if (PERMISSION_MATRIX[normalized]) {
    return normalized
  }
  return 'ADMIN'
}

function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'] as string
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = req.headers['x-real-ip'] as string
  if (realIp) {
    return realIp
  }

  return req.socket?.remoteAddress || 'unknown'
}
