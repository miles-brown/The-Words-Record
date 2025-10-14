import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit'
import { AuditAction, AuditActorType, UserRole, DraftStatus, ApprovalStatus } from '@prisma/client'

async function requireReviewer(req: NextApiRequest): Promise<{ userId: string } | null> {
  const token = extractTokenFromRequest(req)
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload || !payload.sub) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, role: true, isActive: true }
  })

  if (!user || !user.isActive) return null
  // Allow ADMIN, CM (Content Manager), and DBO (Database Officer) to reject drafts
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.CM && user.role !== UserRole.DBO) return null

  return { userId: user.id }
}

/**
 * Reject Draft API
 * POST /api/admin/drafts/[id]/reject
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = await requireReviewer(req)
  if (!auth) {
    return res.status(403).json({ error: 'Unauthorized - Reviewer role required' })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { id } = req.query
  const { comments, requestChanges = false } = req.body

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid draft ID' })
  }

  if (!comments) {
    return res.status(400).json({ error: 'Comments are required for rejection' })
  }

  try {
    // Get draft
    const draft = await prisma.contentDraft.findUnique({
      where: { id }
    })

    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' })
    }

    // Create approval record
    await prisma.contentApproval.create({
      data: {
        draftId: id,
        reviewerId: auth.userId,
        status: requestChanges ? ApprovalStatus.CHANGES_REQUESTED : ApprovalStatus.REJECTED,
        comments
      }
    })

    // Update draft status
    const updatedDraft = await prisma.contentDraft.update({
      where: { id },
      data: {
        status: requestChanges ? DraftStatus.IN_REVIEW : DraftStatus.REJECTED
      },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        },
        approvals: {
          include: {
            reviewer: {
              select: { id: true, username: true }
            }
          }
        }
      }
    })

    // Log rejection
    await logAuditEvent({
      action: AuditAction.UPDATE,
      actorType: AuditActorType.USER,
      actorId: auth.userId,
      entityType: 'ContentDraft',
      entityId: id,
      details: {
        action: requestChanges ? 'changes_requested' : 'rejected',
        comments,
        contentType: draft.contentType,
        authorId: draft.userId
      }
    })

    return res.status(200).json({ draft: updatedDraft })
  } catch (error) {
    console.error('Error rejecting draft:', error)
    return res.status(500).json({ error: 'Failed to reject draft' })
  }
}
