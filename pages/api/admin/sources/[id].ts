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
      include: {
        mediaOutlet: {
          select: {
            id: true,
            organization: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        journalist: {
          select: {
            id: true,
            person: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        case: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        statement: {
          select: {
            id: true,
            content: true
          }
        },
        repercussion: {
          select: {
            id: true,
            type: true,
            description: true
          }
        },
        _count: {
          select: {
            primaryForStatements: true
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
    const body = req.body

    // Check if source exists
    const existingSource = await prisma.source.findUnique({
      where: { id }
    })

    if (!existingSource) {
      return res.status(404).json({ error: 'Source not found' })
    }

    // Build update data
    const updateData: any = {}

    // Basic info
    if (body.title !== undefined) updateData.title = body.title
    if (body.url !== undefined) updateData.url = body.url || null
    if (body.publication !== undefined) updateData.publication = body.publication || null
    if (body.publicationSlug !== undefined) updateData.publicationSlug = body.publicationSlug || null
    if (body.publicationSection !== undefined) updateData.publicationSection = body.publicationSection || null
    if (body.author !== undefined) updateData.author = body.author || null
    if (body.additionalAuthors !== undefined) updateData.additionalAuthors = body.additionalAuthors || []

    // Dates
    if (body.publishDate !== undefined) updateData.publishDate = body.publishDate ? new Date(body.publishDate) : null
    if (body.accessDate !== undefined) updateData.accessDate = body.accessDate ? new Date(body.accessDate) : null

    // Classification
    if (body.sourceType !== undefined) updateData.sourceType = body.sourceType
    if (body.sourceLevel !== undefined) updateData.sourceLevel = body.sourceLevel
    if (body.contentType !== undefined) updateData.contentType = body.contentType

    // Credibility
    if (body.credibility !== undefined) updateData.credibility = body.credibility
    if (body.credibilityLevel !== undefined) updateData.credibilityLevel = body.credibilityLevel
    if (body.credibilityScore !== undefined) updateData.credibilityScore = body.credibilityScore ? parseFloat(body.credibilityScore) : null

    // Verification
    if (body.verificationStatus !== undefined) updateData.verificationStatus = body.verificationStatus
    if (body.verificationNotes !== undefined) updateData.verificationNotes = body.verificationNotes || null

    // Fact checking
    if (body.factCheckStatus !== undefined) updateData.factCheckStatus = body.factCheckStatus
    if (body.factCheckUrl !== undefined) updateData.factCheckUrl = body.factCheckUrl || null
    if (body.factCheckBy !== undefined) updateData.factCheckBy = body.factCheckBy || null

    // Archival
    if (body.isArchived !== undefined) updateData.isArchived = body.isArchived
    if (body.archiveUrl !== undefined) updateData.archiveUrl = body.archiveUrl || null
    if (body.archiveDate !== undefined) updateData.archiveDate = body.archiveDate ? new Date(body.archiveDate) : null
    if (body.archiveMethod !== undefined) updateData.archiveMethod = body.archiveMethod
    if (body.archiveHash !== undefined) updateData.archiveHash = body.archiveHash || null
    if (body.requiresArchival !== undefined) updateData.requiresArchival = body.requiresArchival
    if (body.archivalPriority !== undefined) updateData.archivalPriority = body.archivalPriority ? parseInt(body.archivalPriority) : null
    if (body.contentSnapshot !== undefined) updateData.contentSnapshot = body.contentSnapshot || null
    if (body.screenshotUrl !== undefined) updateData.screenshotUrl = body.screenshotUrl || null
    if (body.pdfUrl !== undefined) updateData.pdfUrl = body.pdfUrl || null

    // Quality indicators
    if (body.qualityScore !== undefined) updateData.qualityScore = body.qualityScore ? parseInt(body.qualityScore) : null
    if (body.hasByline !== undefined) updateData.hasByline = body.hasByline
    if (body.hasMultipleSources !== undefined) updateData.hasMultipleSources = body.hasMultipleSources
    if (body.hasPaywall !== undefined) updateData.hasPaywall = body.hasPaywall
    if (body.isOpinion !== undefined) updateData.isOpinion = body.isOpinion
    if (body.isEditorial !== undefined) updateData.isEditorial = body.isEditorial
    if (body.isExclusive !== undefined) updateData.isExclusive = body.isExclusive
    if (body.hasDate !== undefined) updateData.hasDate = body.hasDate
    if (body.hasSources !== undefined) updateData.hasSources = body.hasSources

    // Content analysis
    if (body.wordCount !== undefined) updateData.wordCount = body.wordCount ? parseInt(body.wordCount) : null
    if (body.biasRating !== undefined) updateData.biasRating = body.biasRating
    if (body.biasNote !== undefined) updateData.biasNote = body.biasNote || null
    if (body.contentWarning !== undefined) updateData.contentWarning = body.contentWarning || null
    if (body.isGraphic !== undefined) updateData.isGraphic = body.isGraphic
    if (body.isSensitive !== undefined) updateData.isSensitive = body.isSensitive

    // Status tracking
    if (body.isDeleted !== undefined) updateData.isDeleted = body.isDeleted
    if (body.deletionDate !== undefined) updateData.deletionDate = body.deletionDate ? new Date(body.deletionDate) : null
    if (body.deletionReason !== undefined) updateData.deletionReason = body.deletionReason || null
    if (body.isBroken !== undefined) updateData.isBroken = body.isBroken
    if (body.lastCheckDate !== undefined) updateData.lastCheckDate = body.lastCheckDate ? new Date(body.lastCheckDate) : null
    if (body.checkFailCount !== undefined) updateData.checkFailCount = body.checkFailCount ? parseInt(body.checkFailCount) : 0

    // Metrics
    if (body.citationCount !== undefined) updateData.citationCount = body.citationCount ? parseInt(body.citationCount) : 0
    if (body.viewCount !== undefined) updateData.viewCount = body.viewCount ? parseInt(body.viewCount) : 0

    // Relationships
    if (body.mediaOutletId !== undefined) updateData.mediaOutletId = body.mediaOutletId || null
    if (body.journalistId !== undefined) updateData.journalistId = body.journalistId || null
    if (body.caseId !== undefined) updateData.caseId = body.caseId || null
    if (body.statementId !== undefined) updateData.statementId = body.statementId || null
    if (body.repercussionId !== undefined) updateData.repercussionId = body.repercussionId || null
    if (body.topicId !== undefined) updateData.topicId = body.topicId || null

    // Administrative
    if (body.publicNotes !== undefined) updateData.publicNotes = body.publicNotes || null
    if (body.internalNotes !== undefined) updateData.internalNotes = body.internalNotes || null
    updateData.lastEditedBy = username || actorId

    // Handle legacy isVerified field
    if (body.isVerified === true && existingSource.verificationStatus !== VerificationStatus.VERIFIED) {
      updateData.verificationStatus = VerificationStatus.VERIFIED
      updateData.verificationDate = new Date()
      updateData.verifiedBy = username || actorId
    } else if (body.isVerified === false) {
      updateData.verificationStatus = VerificationStatus.UNVERIFIED
      updateData.verificationDate = null
      updateData.verifiedBy = null
    }

    // Update source
    const source = await prisma.source.update({
      where: { id },
      data: updateData
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
            primaryForStatements: true
          }
        }
      }
    })

    if (!source) {
      return res.status(404).json({ error: 'Source not found' })
    }

    // Check if source has related records
    if (source._count.primaryForStatements > 0) {
      return res.status(400).json({
        error: 'Cannot delete source with existing statements. Please remove related records first.',
        details: {
          statements: source._count.primaryForStatements
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
