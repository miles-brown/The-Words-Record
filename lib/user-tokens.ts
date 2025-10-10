import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { UserTokenType } from '@prisma/client'
import type { Prisma } from '@prisma/client'

const TOKEN_BYTE_LENGTH = 32

export interface GeneratedToken {
  raw: string
  hash: string
  expiresAt: Date
}

export function generateRawToken(ttlMinutes: number): GeneratedToken {
  const raw = crypto.randomBytes(TOKEN_BYTE_LENGTH).toString('hex')
  const hash = hashToken(raw)
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000)
  return { raw, hash, expiresAt }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function createUserToken(
  userId: string,
  type: UserTokenType,
  ttlMinutes: number,
  metadata?: Record<string, unknown>
): Promise<GeneratedToken> {
  const generated = generateRawToken(ttlMinutes)

  await prisma.userToken.create({
    data: {
      userId,
      tokenType: type,
      tokenHash: generated.hash,
      expiresAt: generated.expiresAt,
      metadata: (metadata as Prisma.InputJsonValue) || undefined
    }
  })

  return generated
}

export async function consumeUserToken(token: string, type: UserTokenType) {
  const tokenHash = hashToken(token)

  const record = await prisma.userToken.findFirst({
    where: {
      tokenHash,
      tokenType: type,
      consumedAt: null,
      expiresAt: {
        gt: new Date()
      }
    }
  })

  if (!record) {
    return null
  }

  await prisma.userToken.update({
    where: { id: record.id },
    data: {
      consumedAt: new Date()
    }
  })

  return record
}

export async function invalidateUserTokens(userId: string, type?: UserTokenType) {
  await prisma.userToken.updateMany({
    where: {
      userId,
      tokenType: type,
      consumedAt: null
    },
    data: {
      consumedAt: new Date()
    }
  })
}
