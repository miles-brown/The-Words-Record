import jwt, { Algorithm, SignOptions, VerifyOptions } from 'jsonwebtoken'
import type { StringValue } from 'ms'
import bcrypt from 'bcryptjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import { UserRole } from '@prisma/client'
import type { User as PrismaUser } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { validateSession } from '@/lib/session'

type SameSiteOption = 'Strict' | 'Lax' | 'None'

export interface AdminUser {
  id?: string
  username: string
  role: UserRole
  email?: string
  permissions?: string[]
}

export interface TokenPayload extends AdminUser {
  sub: string
  iss?: string
  aud?: string | string[]
  iat?: number
  exp?: number
  sid?: string
}

interface TokenOptions extends SignOptions {
  sessionId?: string
}

const DEV_FALLBACK_SECRET = 'wsw-admin-dev-secret-change-me'
const ADMIN_COOKIE_NAME = process.env.ADMIN_AUTH_COOKIE || 'admin_token'
const COOKIE_DOMAIN = process.env.ADMIN_COOKIE_DOMAIN
const COOKIE_PATH = process.env.ADMIN_COOKIE_PATH || '/'
const COOKIE_SAME_SITE = (process.env.ADMIN_COOKIE_SAMESITE as SameSiteOption) || 'Strict'
const COOKIE_SECURE =
  process.env.ADMIN_COOKIE_SECURE === 'true' ||
  (process.env.ADMIN_COOKIE_SECURE !== 'false' && process.env.NODE_ENV === 'production')

const JWT_ISSUER = process.env.JWT_ISSUER || 'who-said-what'
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'admin-console'
const ACCESS_TOKEN_TTL = process.env.JWT_EXPIRES_IN || '15m'
const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

const rawPrivateKey = normalizeKey(process.env.JWT_PRIVATE_KEY)
const rawPublicKey = normalizeKey(process.env.JWT_PUBLIC_KEY)
const rawSecret = process.env.JWT_SECRET

const JWT_ALGORITHM: Algorithm = selectJwtAlgorithm(
  (process.env.JWT_ALGORITHM as Algorithm) || undefined,
  rawPrivateKey,
  rawPublicKey,
  rawSecret
)

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@thewordsrecord.com'
const DEV_PASSWORD = process.env.ADMIN_DEV_PASSWORD || 'admin123'

export function generateToken(user: AdminUser, options: TokenOptions = {}): string {
  const { sessionId, ...signOverrides } = options

  // Don't include sub, iss, aud in payload - they're set in signOptions
  const payload: any = {
    username: user.username,
    role: user.role,
    email: user.email,
    permissions: user.permissions
  }

  if (sessionId) {
    payload.sid = sessionId
  }

  const signOptions: SignOptions = {
    algorithm: JWT_ALGORITHM,
    expiresIn: ACCESS_TOKEN_TTL as StringValue | number,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    subject: user.id || user.username,
    ...signOverrides
  }

  return jwt.sign(payload, getSigningKey(), signOptions)
}

export function generateRefreshToken(user: AdminUser, options: TokenOptions = {}): string {
  const { sessionId, ...signOverrides } = options

  // Don't include sub, iss, aud in payload - they're set in signOptions
  const payload: any = {
    username: user.username,
    role: user.role,
    email: user.email,
    permissions: user.permissions
  }

  if (sessionId) {
    payload.sid = sessionId
  }

  const signOptions: SignOptions = {
    algorithm: JWT_ALGORITHM,
    expiresIn: REFRESH_TOKEN_TTL as StringValue | number,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    subject: user.id || user.username,
    ...signOverrides
  }

  return jwt.sign(payload, getSigningKey(), signOptions)
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const verifyOptions: VerifyOptions = {
      algorithms: [JWT_ALGORITHM],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
    }

    const payload = jwt.verify(token, getVerifyingKey(), verifyOptions) as TokenPayload
    return payload
  } catch (error) {
    return null
  }
}

export interface CredentialValidationResult {
  user: AdminUser
  record?: PrismaUser
}

export async function validateCredentials(username: string, password: string): Promise<CredentialValidationResult | null> {
  if (!username || !password) {
    return null
  }

  try {
    const userRecord = await prisma.user.findUnique({
      where: { username }
    })

    if (userRecord) {
      if (!userRecord.isActive) {
        return null
      }

      if (userRecord.lockedUntil && userRecord.lockedUntil > new Date()) {
        return null
      }

      const isValid = await bcrypt.compare(password, userRecord.passwordHash)
      if (!isValid) {
        await prisma.user.update({
          where: { id: userRecord.id },
          data: {
            loginAttempts: { increment: 1 }
          }
        }).catch(() => undefined)
        return null
      }

      await prisma.user.update({
        where: { id: userRecord.id },
        data: {
          lastLogin: new Date(),
          loginAttempts: 0,
          lockedUntil: null
        }
      }).catch(() => undefined)

      return {
        user: {
          id: userRecord.id,
          username: userRecord.username,
          role: userRecord.role,
          email: userRecord.email ?? undefined,
          permissions: undefined
        },
        record: userRecord
      }
    }
  } catch (error) {
    console.error('Credential validation error:', error)
  }

  if (username !== ADMIN_USERNAME) {
    return null
  }

  const isDevMode = process.env.NODE_ENV !== 'production'

  if (!ADMIN_PASSWORD_HASH) {
    if (isDevMode && password === DEV_PASSWORD) {
      return {
        user: {
          id: 'admin-fallback',
          username: ADMIN_USERNAME,
          role: UserRole.ADMIN,
          email: ADMIN_EMAIL,
          permissions: undefined
        }
      }
    }

    if (!isDevMode) {
      console.warn('ADMIN_PASSWORD_HASH environment variable is not set. Access denied.')
    }
    return null
  }

  try {
    const matches = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
    if (!matches) {
      return null
    }
  } catch (error) {
    console.error('Credential validation error:', error)
    return null
  }

  return {
    user: {
      id: 'admin-env',
      username: ADMIN_USERNAME,
      role: UserRole.ADMIN,
      email: ADMIN_EMAIL,
      permissions: undefined
    }
  }
}

export function requireAuth(handler: (req: NextApiRequest, res: NextApiResponse, user: TokenPayload) => void) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const token = extractTokenFromRequest(req)

      if (!token) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      const payload = verifyToken(token)

      if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired token' })
      }

      if (payload.sid) {
        const session = await validateSession(payload.sid)
        if (!session) {
          return res.status(401).json({ error: 'Session expired' })
        }
        ;(req as any).session = session
      }

      ;(req as any).user = payload
      return handler(req, res, payload)
    } catch (error) {
      console.error('Auth error:', error)
      return res.status(500).json({ error: 'Authentication error' })
    }
  }
}

export function extractTokenFromRequest(req: NextApiRequest): string | null {
  const headerToken = getTokenFromHeader(req)
  if (headerToken) {
    return headerToken
  }

  return getTokenFromCookie(req)
}

export function getTokenFromHeader(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  return authHeader.substring(7)
}

export function getTokenFromCookie(req: NextApiRequest): string | null {
  const cookies = req.headers.cookie
  if (!cookies) return null

  const cookieMap = parseCookies(cookies)
  const token = cookieMap[ADMIN_COOKIE_NAME]

  return token ? decodeURIComponent(token) : null
}

export function getRefreshTokenFromCookie(req: NextApiRequest): string | null {
  const cookies = req.headers.cookie
  if (!cookies) return null

  const cookieMap = parseCookies(cookies)
  const token = cookieMap[`${ADMIN_COOKIE_NAME}_refresh`]
  return token ? decodeURIComponent(token) : null
}

export function setAuthCookie(res: NextApiResponse, token: string, maxAgeSeconds?: number): void {
  const effectiveMaxAge = typeof maxAgeSeconds === 'number'
    ? maxAgeSeconds
    : durationToSeconds(ACCESS_TOKEN_TTL) || 60 * 60

  const cookie = serializeCookie(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: shouldUseSecureCookies(),
    sameSite: COOKIE_SAME_SITE,
    path: COOKIE_PATH,
    domain: COOKIE_DOMAIN,
    maxAge: effectiveMaxAge
  })

  appendCookie(res, cookie)
}

export function setRefreshCookie(res: NextApiResponse, token: string, maxAgeSeconds?: number): void {
  const effectiveMaxAge = typeof maxAgeSeconds === 'number'
    ? maxAgeSeconds
    : durationToSeconds(REFRESH_TOKEN_TTL) || 60 * 60 * 24 * 7

  const cookie = serializeCookie(`${ADMIN_COOKIE_NAME}_refresh`, token, {
    httpOnly: true,
    secure: shouldUseSecureCookies(),
    sameSite: COOKIE_SAME_SITE === 'None' ? 'None' : 'Lax',
    path: COOKIE_PATH,
    domain: COOKIE_DOMAIN,
    maxAge: effectiveMaxAge
  })

  appendCookie(res, cookie)
}

export function clearAuthCookie(res: NextApiResponse): void {
  const cookie = serializeCookie(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: shouldUseSecureCookies(),
    sameSite: COOKIE_SAME_SITE,
    path: COOKIE_PATH,
    domain: COOKIE_DOMAIN,
    maxAge: 0
  })

  appendCookie(res, cookie)

  const refreshCookie = serializeCookie(`${ADMIN_COOKIE_NAME}_refresh`, '', {
    httpOnly: true,
    secure: shouldUseSecureCookies(),
    sameSite: COOKIE_SAME_SITE === 'None' ? 'None' : 'Lax',
    path: COOKIE_PATH,
    domain: COOKIE_DOMAIN,
    maxAge: 0
  })

  appendCookie(res, refreshCookie)
}

export function getDefaultAdminUser(): AdminUser {
  return {
    id: 'admin-default',
    username: ADMIN_USERNAME,
    role: UserRole.ADMIN,
    email: ADMIN_EMAIL
  }
}

function selectJwtAlgorithm(
  requested: Algorithm | undefined,
  privateKey?: string,
  publicKey?: string,
  secret?: string
): Algorithm {
  const normalizedRequested = requested ? (requested.toUpperCase() as Algorithm) : undefined

  const hasAsymmetricKeys = Boolean(privateKey || publicKey)

  if (normalizedRequested && normalizedRequested.startsWith('RS')) {
    if (!hasAsymmetricKeys) {
      console.warn(
        `JWT_ALGORITHM "${normalizedRequested}" requested but JWT_PRIVATE_KEY / JWT_PUBLIC_KEY are not configured. Falling back to HS512.`
      )
      return 'HS512'
    }
    return normalizedRequested
  }

  if (hasAsymmetricKeys) {
    return normalizedRequested || 'RS256'
  }

  if (normalizedRequested && normalizedRequested.startsWith('HS')) {
    return normalizedRequested
  }

  if (!secret) {
    console.warn('JWT_SECRET is not set. Using insecure development fallback secret.')
  }

  return 'HS512'
}

function getSigningKey(): string {
  if (JWT_ALGORITHM.startsWith('HS')) {
    return rawSecret || DEV_FALLBACK_SECRET
  }

  if (rawPrivateKey) {
    return rawPrivateKey
  }

  throw new Error('JWT_PRIVATE_KEY is required for the selected JWT algorithm.')
}

function getVerifyingKey(): string {
  if (JWT_ALGORITHM.startsWith('HS')) {
    return rawSecret || DEV_FALLBACK_SECRET
  }

  if (rawPublicKey) {
    return rawPublicKey
  }

  if (rawPrivateKey) {
    return rawPrivateKey
  }

  throw new Error('JWT_PUBLIC_KEY or JWT_PRIVATE_KEY is required to verify tokens.')
}

function parseCookies(cookieHeader: string): Record<string, string> {
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split('=')
    if (!key) {
      return acc
    }
    acc[key] = rest.join('=')
    return acc
  }, {})
}

interface InternalCookieOptions {
  httpOnly?: boolean
  secure?: boolean
  sameSite?: SameSiteOption
  path?: string
  domain?: string
  maxAge?: number
}

function serializeCookie(name: string, value: string, options: InternalCookieOptions = {}): string {
  const segments = [`${name}=${encodeURIComponent(value)}`]

  if (options.maxAge !== undefined) {
    segments.push(`Max-Age=${Math.floor(options.maxAge)}`)
  }

  segments.push(`Path=${options.path || '/'}`)

  if (options.domain) {
    segments.push(`Domain=${options.domain}`)
  }

  if (options.sameSite) {
    segments.push(`SameSite=${options.sameSite}`)
  }

  if (options.secure) {
    segments.push('Secure')
  }

  if (options.httpOnly !== false) {
    segments.push('HttpOnly')
  }

  return segments.join('; ')
}

function appendCookie(res: NextApiResponse, cookie: string): void {
  const existing = res.getHeader('Set-Cookie')

  if (!existing) {
    res.setHeader('Set-Cookie', cookie)
    return
  }

  if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing, cookie])
    return
  }

  res.setHeader('Set-Cookie', [existing as string, cookie])
}

function shouldUseSecureCookies(): boolean {
  if (COOKIE_SAME_SITE === 'None') {
    return true
  }
  return COOKIE_SECURE
}

function normalizeKey(key?: string): string | undefined {
  if (!key) return undefined

  const cleaned = key.replace(/\\n/g, '\n').trim()

  if (cleaned.includes('BEGIN') && cleaned.includes('KEY')) {
    return cleaned
  }

  try {
    const decoded = Buffer.from(cleaned, 'base64').toString('utf8')
    if (decoded.includes('BEGIN') && decoded.includes('KEY')) {
      return decoded
    }
  } catch (error) {
    // ignore decoding errors
  }

  return cleaned
}

function durationToSeconds(duration: string | number): number | undefined {
  if (typeof duration === 'number') {
    return duration
  }

  if (!duration) {
    return undefined
  }

  const trimmed = duration.trim()

  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10)
  }

  const match = trimmed.match(/^(\d+)([smhd])$/i)
  if (!match) {
    return undefined
  }

  const value = parseInt(match[1], 10)
  const unit = match[2].toLowerCase()

  switch (unit) {
    case 's':
      return value
    case 'm':
      return value * 60
    case 'h':
      return value * 60 * 60
    case 'd':
      return value * 60 * 60 * 24
    default:
      return undefined
  }
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
