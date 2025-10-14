import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit'
import { AuditAction, AuditActorType, UserRole, CaseVisibility } from '@prisma/client'

async function requireAdmin(req: NextApiRequest): Promise<{ userId: string } | null> {
  const token = extractTokenFromRequest(req)
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload || !payload.sub) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, role: true, isActive: true }
  })

  if (!user || !user.isActive || user.role !== UserRole.ADMIN) {
    return null
  }

  return { userId: user.id }
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
    return res.status(400).json({ error: 'Invalid case ID' })
  }

  if (req.method === 'PATCH') {
    return handlePatch(req, res, id, auth.userId)
  } else {
    res.setHeader('Allow', ['PATCH'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

async function handlePatch(
  req: NextApiRequest,
  res: NextApiResponse,
  caseId: string,
  actorId: string
) {
  try {
    const { visibility, status } = req.body

    const updateData: any = {}

    if (visibility && Object.values(CaseVisibility).includes(visibility)) {
      updateData.visibility = visibility
    }

    if (status) {
      updateData.status = status
    }

    const caseItem = await prisma.case.update({
      where: { id: caseId },
      data: updateData,
      select: {
        id: true,
        title: true,
        slug: true,
        visibility: true,
        status: true
      }
    })

    // Log audit event
    await logAuditEvent({
      action: AuditAction.CASE_UPDATED,
      actorType: AuditActorType.USER,
      actorId,
      entityType: 'Case',
      entityId: caseId,
      details: {
        changes: updateData,
        title: caseItem.title
      }
    })

    return res.status(200).json({ case: caseItem })
  } catch (error) {
    console.error('Error updating case:', error)
    return res.status(500).json({ error: 'Failed to update case' })
  }
}
