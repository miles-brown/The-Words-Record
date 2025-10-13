import type { NextApiRequest, NextApiResponse } from 'next'
import { extractTokenFromRequest, verifyToken } from '@/lib/auth'
import { validateSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { getUserEffectivePermissions } from '@/lib/permissions'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const token = extractTokenFromRequest(req)
    if (!token) {
      return res.status(401).json({ error: 'No token found' })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    if (payload.sid) {
      const session = await validateSession(payload.sid)
      if (!session) {
        return res.status(401).json({ error: 'Session expired' })
      }
    }

    if (!payload.sub) {
      return res.status(200).json({ user: payload, permissions: [] })
    }

    const userRecord = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        mfaEnabled: true,
        isActive: true
      }
    })

    if (!userRecord || !userRecord.isActive) {
      return res.status(401).json({ error: 'Account disabled' })
    }

    const permissions = await getUserEffectivePermissions(userRecord.id, userRecord.role)

    return res.status(200).json({
      user: userRecord,
      permissions
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return res.status(500).json({ error: 'Authentication check failed' })
  }
}
