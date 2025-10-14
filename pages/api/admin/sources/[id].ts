import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit'
import { AuditAction, AuditActorType, UserRole, VerificationStatus } from '@prisma/client'

async function requireAdmin(req: NextApiRequest): Promise<{ userId: string; username?: string } | null> {
  const token = extractTokenFromRequest(req)
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload || !payload.sub) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, username: true, role: true, isActive: true }
  })

  if (!user || !user.isActive || user.role !== UserRole.ADMIN) {
    return null
  }

  return { userId: user.id, username: user.username }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = await requireAdmin(req)
  if (!auth) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid source ID' })
  }

  if (req.method === 'GET') {
    return handleGet(req, res, id)
  } else if (req.method === 'PATCH') {
    return handlePatch(req, res, id, auth.userId, auth.username)
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res, id, auth.userId)
  } else {
    res.setHeader('Allow', ['GET', 'PATCH', 'DELETE'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    const source = await prisma.source.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        url: true,
        publication: true,
        author: true,
        publishDate: true,
        verificationStatus: true,
        verificationDate: true,
        verifiedBy: true,
        sourceType: true,
        sourceLevel: true,
        credibilityLevel: true,
        credibilityScore: true,
        verificationNotes: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            statements: true
          }
        }
      }
    })

    if (!source) {
      return res.status(404).json({ error: 'Source not found' })
    }

    // Add isVerified for backwards compatibility
    const sourceWithIsVerified = {
      ...source,
      isVerified: source.verificationStatus === VerificationStatus.VERIFIED
    }

    return res.status(200).json({ source: sourceWithIsVerified })
  } catch (error) {
    console.error('Error fetching source:', error)
    return res.status(500).json({ error: 'Failed to fetch source' })
  }
}

async function handlePatch(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
  actorId: string,
  username?: string
) {
  try {
    const {
      title,
      url,
      publication,
      author,
      publishDate,
      sourceType,
      credibilityLevel,
      isVerified
    } = req.body

    // Check if source exists
    const existingSource = await prisma.source.findUnique({
      where: { id }
    })

    if (!existingSource) {
      return res.status(404).json({ error: 'Source not found' })
    }

    // Build update data
    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (url !== undefined) updateData.url = url
    if (publication !== undefined) updateData.publication = publication
    if (author !== undefined) updateData.author = author
    if (publishDate !== undefined) updateData.publishDate = publishDate ? new Date(publishDate) : null
    if (sourceType !== undefined) updateData.sourceType = sourceType
    if (credibilityLevel !== undefined) updateData.credibilityLevel = credibilityLevel

    // Handle verification status
    if (isVerified === true && existingSource.verificationStatus !== VerificationStatus.VERIFIED) {
      updateData.verificationStatus = VerificationStatus.VERIFIED
      updateData.verificationDate = new Date()
      updateData.verifiedBy = username || actorId
    } else if (isVerified === false) {
      updateData.verificationStatus = VerificationStatus.UNVERIFIED
      updateData.verificationDate = null
      updateData.verifiedBy = null
    }

    // Update source
    const source = await prisma.source.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        url: true,
        publication: true,
        author: true,
        publishDate: true,
        verificationStatus: true,
        verificationDate: true,
        verifiedBy: true,
        sourceType: true,
        credibilityLevel: true,
        updatedAt: true
      }
    })

    // Log audit event
    await logAuditEvent({
      action: AuditAction.UPDATE,
      actorType: AuditActorType.USER,
      actorId,
      entityType: 'Source',
      entityId: source.id,
      details: {
        title: source.title,
        changes: updateData
      }
    })

    // Add isVerified for backwards compatibility
    const sourceWithIsVerified = {
      ...source,
      isVerified: source.verificationStatus === VerificationStatus.VERIFIED
    }

    return res.status(200).json({ source: sourceWithIsVerified })
  } catch (error) {
    console.error('Error updating source:', error)
    return res.status(500).json({ error: 'Failed to update source' })
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
  actorId: string
) {
  try {
    // Get source info before deletion for audit log
    const source = await prisma.source.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        url: true,
        _count: {
          select: {
            statements: true
          }
        }
      }
    })

    if (!source) {
      return res.status(404).json({ error: 'Source not found' })
    }

    // Check if source has related records
    if (source._count.statements > 0) {
      return res.status(400).json({
        error: 'Cannot delete source with existing statements. Please remove related records first.',
        details: {
          statements: source._count.statements
        }
      })
    }

    // Delete source
    await prisma.source.delete({
      where: { id }
    })

    // Log audit event
    await logAuditEvent({
      action: AuditAction.DELETE,
      actorType: AuditActorType.USER,
      actorId,
      entityType: 'Source',
      entityId: source.id,
      details: {
        title: source.title,
        url: source.url
      }
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error deleting source:', error)
    return res.status(500).json({ error: 'Failed to delete source' })
  }
}
