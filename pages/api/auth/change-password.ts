import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken, verifyPassword, hashPassword } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit'
import { AuditAction, AuditActorType } from '@prisma/client'

async function requireAuth(req: NextApiRequest): Promise<{ userId: string } | null> {
  const token = extractTokenFromRequest(req)
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload || !payload.sub) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, isActive: true }
  })

  if (!user || !user.isActive) {
    return null
  }

  return { userId: user.id }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const auth = await requireAuth(req)
  if (!auth) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  try {
    const { currentPassword, newPassword } = req.body

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' })
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'New password must be different from current password' })
    }

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        username: true,
        passwordHash: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.passwordHash)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword)

    // Update password
    await prisma.user.update({
      where: { id: auth.userId },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      }
    })

    // Invalidate all existing sessions except current one
    const currentToken = extractTokenFromRequest(req)
    if (currentToken) {
      await prisma.session.updateMany({
        where: {
          userId: auth.userId,
          token: {
            not: currentToken
          }
        },
        data: {
          invalidatedAt: new Date()
        }
      })
    }

    // Log audit event
    await logAuditEvent({
      action: AuditAction.UPDATE,
      actorType: AuditActorType.USER,
      actorId: auth.userId,
      entityType: 'User',
      entityId: auth.userId,
      details: {
        action: 'password_changed',
        username: user.username
      }
    })

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully. Other sessions have been logged out.'
    })
  } catch (error) {
    console.error('Error changing password:', error)
    return res.status(500).json({ error: 'Failed to change password' })
  }
}
