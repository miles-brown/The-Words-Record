import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit'
import { AuditAction, AuditActorType, UserRole } from '@prisma/client'

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
    return res.status(400).json({ error: 'Invalid user ID' })
  }

  if (req.method === 'PATCH') {
    return handlePatch(req, res, id, auth.userId)
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res, id, auth.userId)
  } else {
    res.setHeader('Allow', ['PATCH', 'DELETE'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

async function handlePatch(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
  actorId: string
) {
  try {
    const { isActive, role } = req.body

    // Prevent self-deactivation
    if (userId === actorId && isActive === false) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' })
    }

    const updateData: any = {}
    if (typeof isActive === 'boolean') updateData.isActive = isActive
    if (role && Object.values(UserRole).includes(role)) updateData.role = role

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true
      }
    })

    // Log audit event
    await logAuditEvent({
      action: AuditAction.UPDATE,
      actorType: AuditActorType.USER,
      actorId,
      entityType: 'User',
      entityId: userId,
      details: {
        changes: updateData,
        username: user.username
      }
    })

    return res.status(200).json({ user })
  } catch (error) {
    console.error('Error updating user:', error)
    return res.status(500).json({ error: 'Failed to update user' })
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
  actorId: string
) {
  try {
    // Prevent self-deletion
    if (userId === actorId) {
      return res.status(400).json({ error: 'Cannot delete your own account' })
    }

    // Get user info before deletion for audit log
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        email: true,
        role: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId }
    })

    // Log audit event
    await logAuditEvent({
      action: AuditAction.DELETE,
      actorType: AuditActorType.USER,
      actorId,
      entityType: 'User',
      entityId: userId,
      details: {
        username: user.username,
        email: user.email,
        role: user.role
      }
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return res.status(500).json({ error: 'Failed to delete user' })
  }
}
