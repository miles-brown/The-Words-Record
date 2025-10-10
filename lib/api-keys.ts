import crypto from 'crypto'
import type { NextApiRequest } from 'next'
import { prisma } from '@/lib/prisma'
import { recordAuditEvent, extractRequestContext } from '@/lib/audit'

export interface ApiKeyValidationResult {
  id: string
  key: string
  userId?: string | null
  name?: string | null
  permissions: string[]
  expiresAt?: Date | null
}

interface FallbackApiKey {
  id: string
  key: string
  secret: string
  permissions: string[]
  userId?: string | null
  name?: string | null
  expiresAt?: string | null
}

const API_KEY_HEADER = 'x-api-key'
const API_SECRET_HEADER = 'x-api-secret'

const FALLBACK_API_KEYS: FallbackApiKey[] = loadFallbackApiKeys()

export function generateApiKeyPair(): { id: string; key: string; secret: string; displayKey: string } {
  const id = crypto.randomUUID()
  const key = `wsw_${crypto.randomBytes(6).toString('hex')}`
  const secret = crypto.randomBytes(24).toString('base64url')
  const displayKey = `${key}.${secret}`

  return { id, key, secret, displayKey }
}

export function hashApiKeySecret(key: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', key)
  hmac.update(secret)
  return hmac.digest('hex')
}

export async function verifyApiKeyRequest(
  req: NextApiRequest,
  requiredPermissions: string[] = []
): Promise<ApiKeyValidationResult | null> {
  const rawKey = (req.headers[API_KEY_HEADER] as string)?.trim()
  const rawSecret = (req.headers[API_SECRET_HEADER] as string)?.trim()

  if (!rawKey || !rawSecret) {
    return null
  }

  const context = extractRequestContext(req)

  try {
    const apiKeyClient = (prisma as any).apiKey
    if (apiKeyClient?.findUnique) {
      const record = await apiKeyClient.findUnique({
        where: { key: rawKey }
      })

      if (!record || !record.isActive) {
        await recordAuditEvent({
          action: 'API_KEY_AUTH',
          actorType: 'API_KEY',
          actorId: record?.id,
          entityType: 'API_KEY',
          entityId: record?.id,
          status: 'FAILURE',
          description: 'API key inactive or not found',
          ...context
        })
        return null
      }

      if (record.expiresAt && record.expiresAt < new Date()) {
        await recordAuditEvent({
          action: 'API_KEY_AUTH',
          actorType: 'API_KEY',
          actorId: record.id,
          entityType: 'API_KEY',
          entityId: record.id,
          status: 'FAILURE',
          description: 'API key expired',
          ...context
        })
        return null
      }

      const suppliedHash = hashApiKeySecret(record.key, rawSecret)
      if (!constantTimeEquals(record.secretHash, suppliedHash)) {
        await recordAuditEvent({
          action: 'API_KEY_AUTH',
          actorType: 'API_KEY',
          actorId: record.id,
          entityType: 'API_KEY',
          entityId: record.id,
          status: 'FAILURE',
          description: 'API key secret mismatch',
          ...context
        })
        return null
      }

      if (!permissionsSatisfied(record.permissions ?? [], requiredPermissions)) {
        await recordAuditEvent({
          action: 'API_KEY_AUTH',
          actorType: 'API_KEY',
          actorId: record.id,
          entityType: 'API_KEY',
          entityId: record.id,
          status: 'FAILURE',
          description: 'API key missing required permissions',
          metadata: { requiredPermissions },
          ...context
        })
        return null
      }

      await recordAuditEvent({
        action: 'API_KEY_AUTH',
        actorType: 'API_KEY',
        actorId: record.id,
        entityType: 'API_KEY',
        entityId: record.id,
        status: 'SUCCESS',
        description: 'API key authenticated',
        ...context
      })

      // Update last used timestamp asynchronously (no need to await)
      void apiKeyClient.update({
        where: { id: record.id },
        data: {
          lastUsed: new Date(),
          lastUsedIp: context.ipAddress ?? null,
          lastUsedUserAgent: context.userAgent ?? null
        }
      }).catch(() => undefined)

      return {
        id: record.id,
        key: record.key,
        userId: record.userId ?? null,
        name: record.name ?? null,
        permissions: record.permissions ?? [],
        expiresAt: record.expiresAt ?? null
      }
    }
  } catch (error) {
    console.error('Database API key verification failed, falling back to environment keys:', error)
  }

  const fallbackRecord = FALLBACK_API_KEYS.find(item => item.key === rawKey)
  if (!fallbackRecord) {
    return null
  }

  if (fallbackRecord.expiresAt && new Date(fallbackRecord.expiresAt) < new Date()) {
    return null
  }

  if (!constantTimeEquals(fallbackRecord.secret, rawSecret)) {
    return null
  }

  if (!permissionsSatisfied(fallbackRecord.permissions, requiredPermissions)) {
    return null
  }

  return {
    id: fallbackRecord.id,
    key: fallbackRecord.key,
    userId: fallbackRecord.userId ?? null,
    name: fallbackRecord.name ?? null,
    permissions: fallbackRecord.permissions,
    expiresAt: fallbackRecord.expiresAt ? new Date(fallbackRecord.expiresAt) : null
  }
}

function permissionsSatisfied(current: string[], required: string[]): boolean {
  if (!required.length) {
    return true
  }

  if (current.includes('*')) {
    return true
  }

  return required.every(permission => current.includes(permission))
}

function constantTimeEquals(a: string, b: string): boolean {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)

  if (bufferA.length !== bufferB.length) {
    return false
  }

  return crypto.timingSafeEqual(bufferA, bufferB)
}

function loadFallbackApiKeys(): FallbackApiKey[] {
  const raw = process.env.ADMIN_API_KEYS_JSON
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      console.warn('ADMIN_API_KEYS_JSON must be an array of API key definitions.')
      return []
    }

    return parsed
      .map(item => ({
        id: item.id || item.key || crypto.randomUUID(),
        key: item.key,
        secret: item.secret,
        permissions: Array.isArray(item.permissions) ? item.permissions : [],
        userId: item.userId ?? null,
        name: item.name ?? null,
        expiresAt: item.expiresAt ?? null
      }))
      .filter(item => item.key && item.secret)
  } catch (error) {
    console.error('Failed to parse ADMIN_API_KEYS_JSON:', error)
    return []
  }
}
