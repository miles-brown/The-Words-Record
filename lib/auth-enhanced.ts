/**
 * Enhanced Authentication System with MFA and Role-Based Access Control
 */

import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import crypto from 'crypto'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from './prisma'
import { UserRole, AuditAction } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex')
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || crypto.randomBytes(32).toString('hex')
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')

export interface AuthUser {
  id: string
  username: string
  email: string
  role: UserRole
  firstName?: string
  lastName?: string
  mfaEnabled: boolean
}

export interface TokenPayload {
  userId: string
  username: string
  role: UserRole
  sessionId: string
  type: 'access' | 'refresh'
}

/**
 * Role permission definitions
 */
export const ROLE_PERMISSIONS = {
  ADMIN: ['*'], // All permissions
  DE: ['content:*', 'source:*', 'tag:*'], // Data Editor
  DBO: ['content:read', 'content:export', 'content:import', 'db:*'], // Database Operator
  CM: ['content:*', 'approval:*'], // Content Manager
  CI: ['content:create', 'content:read', 'draft:*'], // Content Intern
  BOT: ['api:write', 'harvest:*'], // Bot
  QA: ['content:read', 'content:flag', 'comment:*'], // Quality Assurance
  AI_CUR: ['content:read', 'suggestion:create'], // AI Curator
  AI_ED: ['content:edit', 'ai:enhance'], // AI Editor
  AI_VAL: ['content:read', 'validation:*'], // AI Validator
  AI_CITE: ['source:*', 'citation:*'], // AI Citation
  VIEWER: ['content:read'] // Read-only
} as const

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate JWT tokens
 */
export function generateTokens(user: AuthUser, sessionId: string): {
  accessToken: string
  refreshToken: string
} {
  const accessToken = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role,
      sessionId,
      type: 'access'
    } as TokenPayload,
    JWT_SECRET,
    { expiresIn: '15m' } // Short-lived access token
  )

  const refreshToken = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role,
      sessionId,
      type: 'refresh'
    } as TokenPayload,
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // Longer-lived refresh token
  )

  return { accessToken, refreshToken }
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string, type: 'access' | 'refresh' = 'access'): TokenPayload | null {
  try {
    const secret = type === 'access' ? JWT_SECRET : JWT_REFRESH_SECRET
    const payload = jwt.verify(token, secret) as TokenPayload

    if (payload.type !== type) {
      return null
    }

    return payload
  } catch (error) {
    return null
  }
}

/**
 * Generate MFA secret and QR code
 */
export async function generateMfaSecret(user: AuthUser): Promise<{
  secret: string
  qrCode: string
  backupCodes: string[]
}> {
  const secret = speakeasy.generateSecret({
    name: `Who Said What (${user.email})`,
    issuer: 'Who Said What',
    length: 32
  })

  const qrCode = await QRCode.toDataURL(secret.otpauth_url!)

  // Generate backup codes
  const backupCodes = Array.from({ length: 10 }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  )

  return {
    secret: secret.base32,
    qrCode,
    backupCodes
  }
}

/**
 * Verify MFA token
 */
export function verifyMfaToken(token: string, secret: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2 // Allow 2 time steps tolerance
  })
}

/**
 * Create user session
 */
export async function createSession(
  user: AuthUser,
  ipAddress: string,
  userAgent?: string
): Promise<{
  session: any
  tokens: { accessToken: string; refreshToken: string }
}> {
  const sessionId = crypto.randomUUID()

  const session = await prisma.session.create({
    data: {
      id: sessionId,
      userId: user.id,
      token: crypto.randomBytes(32).toString('hex'),
      refreshToken: crypto.randomBytes(32).toString('hex'),
      ipAddress,
      userAgent: userAgent || 'Unknown',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  })

  const tokens = generateTokens(user, sessionId)

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLogin: new Date(),
      loginAttempts: 0,
      lockedUntil: null
    }
  })

  // Log the login
  await logAuditEvent({
    userId: user.id,
    action: AuditAction.LOGIN,
    entityType: 'user',
    entityId: user.id,
    ipAddress,
    userAgent
  })

  return { session, tokens }
}

/**
 * Check if user has permission
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const rolePerms = ROLE_PERMISSIONS[role] || []

  // Admin has all permissions
  if (rolePerms.includes('*')) return true

  // Check exact permission
  if (rolePerms.includes(permission)) return true

  // Check wildcard permissions
  for (const perm of rolePerms) {
    if (perm.endsWith(':*')) {
      const prefix = perm.slice(0, -2)
      if (permission.startsWith(prefix + ':')) return true
    }
  }

  return false
}

/**
 * Middleware for route protection
 */
export function requireAuth(
  requiredPermission?: string,
  allowedRoles?: UserRole[]
) {
  return async (
    req: NextApiRequest,
    res: NextApiResponse,
    next: (user: AuthUser) => Promise<void>
  ) => {
    try {
      // Extract token from header or cookie
      const authHeader = req.headers.authorization
      const token = authHeader?.startsWith('Bearer ')
        ? authHeader.substring(7)
        : getTokenFromCookie(req)

      if (!token) {
        return res.status(401).json({ error: 'No token provided' })
      }

      // Verify token
      const payload = verifyToken(token, 'access')
      if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired token' })
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          mfaEnabled: true,
          isActive: true
        }
      })

      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'User not found or inactive' })
      }

      // Check role-based access
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }

      // Check specific permission
      if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
        return res.status(403).json({ error: 'Permission denied' })
      }

      // Pass user to handler
      await next(user as AuthUser)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return res.status(500).json({ error: 'Authentication error' })
    }
  }
}

/**
 * Log audit event
 */
export async function logAuditEvent(params: {
  userId?: string
  action: AuditAction
  entityType: string
  entityId: string
  changes?: any
  metadata?: any
  ipAddress: string
  userAgent?: string
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        changes: params.changes || {},
        metadata: params.metadata || {},
        ipAddress: params.ipAddress,
        userAgent: params.userAgent
      }
    })
  } catch (error) {
    console.error('Audit logging error:', error)
    // Don't throw - audit logging should not break the application
  }
}

/**
 * Handle login attempts and account locking
 */
export async function handleLoginAttempt(
  username: string,
  success: boolean,
  ipAddress: string
) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, loginAttempts: true, lockedUntil: true }
  })

  if (!user) return

  if (success) {
    // Reset attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockedUntil: null }
    })
  } else {
    // Increment failed attempts
    const attempts = user.loginAttempts + 1
    const updateData: any = { loginAttempts: attempts }

    // Lock account after 5 failed attempts
    if (attempts >= 5) {
      updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData
    })

    // Log failed attempt
    await logAuditEvent({
      userId: user.id,
      action: AuditAction.LOGIN,
      entityType: 'user',
      entityId: user.id,
      metadata: { success: false, attempts },
      ipAddress,
      userAgent: undefined
    })
  }
}

/**
 * Get token from cookie
 */
export function getTokenFromCookie(req: NextApiRequest): string | null {
  const cookies = req.headers.cookie
  if (!cookies) return null

  const tokenCookie = cookies
    .split(';')
    .find(c => c.trim().startsWith('auth_token='))

  if (!tokenCookie) return null

  return tokenCookie.split('=')[1]
}

/**
 * Set auth cookies
 */
export function setAuthCookies(res: NextApiResponse, tokens: {
  accessToken: string
  refreshToken: string
}) {
  const isProduction = process.env.NODE_ENV === 'production'

  // Access token cookie (short-lived)
  res.setHeader('Set-Cookie', [
    `auth_token=${tokens.accessToken}; HttpOnly; Path=/; Max-Age=900; SameSite=Strict${isProduction ? '; Secure' : ''}`,
    `refresh_token=${tokens.refreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict${isProduction ? '; Secure' : ''}`
  ])
}

/**
 * Clear auth cookies
 */
export function clearAuthCookies(res: NextApiResponse) {
  res.setHeader('Set-Cookie', [
    'auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict',
    'refresh_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
  ])
}

/**
 * Generate API key for bot/automation access
 */
export async function generateApiKey(
  userId: string,
  name: string,
  permissions: string[],
  expiresInDays?: number
): Promise<{
  key: string
  secret: string
}> {
  const key = `wsw_${crypto.randomBytes(24).toString('hex')}`
  const secret = crypto.randomBytes(32).toString('hex')

  await prisma.apiKey.create({
    data: {
      userId,
      name,
      key,
      secret: await hashPassword(secret), // Hash the secret
      permissions,
      expiresAt: expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null
    }
  })

  return { key, secret }
}

/**
 * Verify API key and return permissions
 */
export async function verifyApiKey(
  key: string,
  signature?: string
): Promise<{
  valid: boolean
  userId?: string
  permissions?: string[]
}> {
  const apiKey = await prisma.apiKey.findUnique({
    where: { key },
    select: {
      userId: true,
      secret: true,
      permissions: true,
      expiresAt: true,
      isActive: true
    }
  })

  if (!apiKey || !apiKey.isActive) {
    return { valid: false }
  }

  // Check expiration
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { valid: false }
  }

  // If signature provided, verify it
  if (signature) {
    // TODO: Implement HMAC signature verification
    // const valid = verifyHmacSignature(signature, apiKey.secret, requestData)
    // if (!valid) return { valid: false }
  }

  // Update last used
  await prisma.apiKey.update({
    where: { key },
    data: { lastUsed: new Date() }
  })

  return {
    valid: true,
    userId: apiKey.userId,
    permissions: apiKey.permissions as string[]
  }
}