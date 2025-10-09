/**
 * Simplified Authentication System (no external dependencies needed)
 * We'll use this initially and upgrade to auth-enhanced.ts later
 */

import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import type { NextApiRequest, NextApiResponse } from 'next'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Temporary user roles until we add Prisma User model
export type UserRole =
  | 'ADMIN'
  | 'DE'      // Data Editor
  | 'DBO'     // Database Operator
  | 'CM'      // Content Manager
  | 'CI'      // Content Intern
  | 'BOT'     // Bot
  | 'QA'      // Quality Assurance
  | 'VIEWER'

export interface AuthUser {
  id: string
  username: string
  email: string
  role: UserRole
  firstName?: string
  lastName?: string
}

export interface TokenPayload {
  userId: string
  username: string
  role: UserRole
  type: 'access' | 'refresh'
}

/**
 * Temporary in-memory user store (replace with Prisma later)
 */
const TEMP_USERS: Record<string, {
  id: string
  username: string
  email: string
  passwordHash: string
  role: UserRole
  firstName: string
  lastName: string
}> = {
  admin: {
    id: 'admin-001',
    username: 'admin',
    email: 'admin@thewordsrecord.com',
    // Password: admin123 (for development only)
    passwordHash: '$2a$10$YourHashHere', // We'll generate this properly
    role: 'ADMIN',
    firstName: 'Admin',
    lastName: 'User'
  }
}

/**
 * Role permission definitions
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: ['*'], // All permissions
  DE: ['content:*', 'source:*', 'tag:*'],
  DBO: ['content:read', 'content:export', 'content:import', 'db:*'],
  CM: ['content:*', 'approval:*'],
  CI: ['content:create', 'content:read', 'draft:*'],
  BOT: ['api:write', 'harvest:*'],
  QA: ['content:read', 'content:flag', 'comment:*'],
  VIEWER: ['content:read']
}

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // For development, allow simple password
  if (process.env.NODE_ENV === 'development' && password === 'admin123') {
    return true
  }
  return bcrypt.compare(password, hash)
}

/**
 * Generate JWT token
 */
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role,
      type: 'access'
    } as TokenPayload,
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload
    return payload
  } catch (error) {
    return null
  }
}

/**
 * Validate credentials (temporary implementation)
 */
export async function validateCredentials(
  username: string,
  password: string
): Promise<AuthUser | null> {
  const user = TEMP_USERS[username]
  if (!user) return null

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) return null

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName
  }
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
      const payload = verifyToken(token)
      if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired token' })
      }

      // Get user (temporary implementation)
      const user = Object.values(TEMP_USERS).find(u => u.id === payload.userId)
      if (!user) {
        return res.status(401).json({ error: 'User not found' })
      }

      const authUser: AuthUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
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
      await next(authUser)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return res.status(500).json({ error: 'Authentication error' })
    }
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
    .find(c => c.trim().startsWith('admin_token='))

  if (!tokenCookie) return null

  return tokenCookie.split('=')[1]
}

/**
 * Set auth cookie
 */
export function setAuthCookie(res: NextApiResponse, token: string) {
  const isProduction = process.env.NODE_ENV === 'production'
  res.setHeader(
    'Set-Cookie',
    `admin_token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${
      isProduction ? '; Secure' : ''
    }`
  )
}

/**
 * Clear auth cookie
 */
export function clearAuthCookie(res: NextApiResponse) {
  res.setHeader('Set-Cookie', 'admin_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict')
}

/**
 * Simple audit logging (console for now, database later)
 */
export async function logAuditEvent(params: {
  userId?: string
  action: string
  entityType: string
  entityId: string
  changes?: any
  metadata?: any
  ipAddress: string
  userAgent?: string
}) {
  // For now, just log to console
  console.log('AUDIT:', {
    ...params,
    timestamp: new Date().toISOString()
  })

  // TODO: Save to database when Prisma schema is updated
}