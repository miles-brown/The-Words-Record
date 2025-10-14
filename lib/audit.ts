import type { NextApiRequest } from 'next'
import { prisma } from '@/lib/prisma'

export type AuditActorType = 'USER' | 'API_KEY' | 'SYSTEM' | 'ANONYMOUS'

export interface AuditLogEntry {
  action: string
  actorId?: string
  actorType?: AuditActorType
  entityType?: string
  entityId?: string
  description?: string
  details?: Record<string, unknown> | null  // Alias for changes/metadata
  changes?: Record<string, unknown> | null
  metadata?: Record<string, unknown> | null
  ipAddress?: string
  userAgent?: string | null
  status?: 'SUCCESS' | 'FAILURE'
  occuredAt?: Date
}

/**
 * Persist an audit event. Falls back to console logging if the audit table
 * is not yet available (e.g., prior to running migrations).
 */
export async function recordAuditEvent(entry: AuditLogEntry): Promise<void> {
  // Map 'details' to 'metadata' for backwards compatibility
  const payload: AuditLogEntry = {
    ...entry,
    metadata: entry.metadata ?? entry.details ?? null,
    occuredAt: entry.occuredAt ?? new Date(),
    actorType: entry.actorType ?? (entry.actorId ? 'USER' : 'ANONYMOUS'),
    status: entry.status ?? 'SUCCESS'
  }

  try {
    const auditModel = (prisma as any).auditLog

    if (auditModel?.create) {
      const userId =
        payload.actorType === 'USER' && payload.actorId ? payload.actorId : null

      await auditModel.create({
        data: {
          action: payload.action,
          actorId: payload.actorId ?? null,
          actorType: payload.actorType ?? 'ANONYMOUS',
          userId,
          entityType: payload.entityType ?? null,
          entityId: payload.entityId ?? null,
          description: payload.description ?? null,
          changes: payload.changes ?? null,
          metadata: payload.metadata ?? null,
          ipAddress: payload.ipAddress ?? null,
          userAgent: payload.userAgent ?? null,
          status: payload.status ?? 'SUCCESS',
          occuredAt: payload.occuredAt ?? new Date()
        }
      })
      return
    }
  } catch (error) {
    console.error('Failed to persist audit event:', error)
  }

  // Fallback logging for local development or before migrations run.
  const safePayload = {
    ...payload,
    occuredAt: payload.occuredAt?.toISOString() ?? new Date().toISOString()
  }
  console.info('[AUDIT]', safePayload)
}

export function extractRequestContext(req: NextApiRequest | null | undefined) {
  if (!req) {
    return {
      ipAddress: undefined,
      userAgent: undefined as string | undefined
    }
  }

  const forwarded = (req.headers['x-forwarded-for'] as string) || ''
  const ipAddress = forwarded.split(',')[0]?.trim() || req.socket?.remoteAddress || undefined
  const userAgent = (req.headers['user-agent'] as string) || undefined

  return {
    ipAddress,
    userAgent
  }
}

// Alias for backwards compatibility
export const logAuditEvent = recordAuditEvent
