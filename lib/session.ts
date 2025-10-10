import { nanoid } from 'nanoid'
import { prisma } from '@/lib/prisma'
import { hashToken } from '@/lib/user-tokens'

const refreshTtlMinutes = parseInt(process.env.SESSION_REFRESH_TTL_MINUTES || '43200', 10) // 30 days

export interface SessionContext {
  ipAddress?: string | null
  userAgent?: string | null
}

export interface CreatedSession {
  sessionId: string
  refreshToken: string
  expiresAt: Date
}

export interface RotatedSession {
  refreshToken: string
  expiresAt: Date
  session: Awaited<ReturnType<typeof prisma.session.update>>
}

function buildRefreshToken(sessionId: string, secret: string) {
  return `${sessionId}.${secret}`
}

function parseRefreshToken(token: string) {
  const [sessionId, secret] = token.split('.')
  if (!sessionId || !secret) {
    throw new Error('Malformed refresh token')
  }
  return { sessionId, secret }
}

export async function createSession(userId: string, context: SessionContext = {}): Promise<CreatedSession> {
  const sessionId = nanoid(24)
  const refreshSecret = nanoid(64)
  const refreshHash = hashToken(refreshSecret)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + refreshTtlMinutes * 60 * 1000)

  await prisma.session.create({
    data: {
      userId,
      token: sessionId,
      refreshToken: refreshHash,
      issuedAt: now,
      expiresAt,
      ipAddress: context.ipAddress ? context.ipAddress.substring(0, 255) : null,
      userAgent: context.userAgent ? context.userAgent.substring(0, 255) : null
    }
  })

  return {
    sessionId,
    refreshToken: buildRefreshToken(sessionId, refreshSecret),
    expiresAt
  }
}

export async function rotateRefreshToken(tokenString: string, context: SessionContext = {}): Promise<RotatedSession> {
  const { sessionId, secret } = parseRefreshToken(tokenString)
  const session = await prisma.session.findUnique({ where: { token: sessionId } })

  if (!session || session.revokedAt || session.invalidatedAt) {
    throw new Error('Session not found')
  }

  if (session.expiresAt <= new Date()) {
    throw new Error('Session expired')
  }

  const expectedHash = session.refreshToken
  if (expectedHash && expectedHash !== hashToken(secret)) {
    throw new Error('Invalid refresh token')
  }

  const newSecret = nanoid(64)
  const newHash = hashToken(newSecret)
  const now = new Date()
  const newExpiry = new Date(now.getTime() + refreshTtlMinutes * 60 * 1000)

  return {
    refreshToken: buildRefreshToken(sessionId, newSecret),
    expiresAt: newExpiry,
    session: await prisma.session.update({
      where: { token: sessionId },
      data: {
        refreshToken: newHash,
        rotatedAt: now,
        expiresAt: newExpiry,
        ipAddress: context.ipAddress ? context.ipAddress.substring(0, 255) : null,
        userAgent: context.userAgent ? context.userAgent.substring(0, 255) : null
      }
    })
  }
}

export async function validateSession(sessionId?: string | null) {
  if (!sessionId) return null

  const session = await prisma.session.findUnique({ where: { token: sessionId } })
  if (!session) return null
  if (session.revokedAt || session.invalidatedAt) return null
  if (session.expiresAt <= new Date()) return null
  return session
}

export async function revokeSession(sessionId?: string | null) {
  if (!sessionId) return
  await prisma.session.updateMany({
    where: { token: sessionId },
    data: { revokedAt: new Date() }
  })
}

export async function revokeAllSessionsForUser(userId: string) {
  await prisma.session.updateMany({
    where: { userId },
    data: { invalidatedAt: new Date() }
  })
}

export function parseRefreshTokenString(tokenString: string) {
  return parseRefreshToken(tokenString)
}
