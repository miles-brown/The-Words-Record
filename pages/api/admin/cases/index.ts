import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/auth'
import { UserRole } from '@prisma/client'

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

  if (req.method === 'GET') {
    return handleGet(req, res)
  } else {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { isRealIncident } = req.query

    const where: any = {}

    if (isRealIncident === 'true') {
      where.isRealIncident = true
    } else if (isRealIncident === 'false') {
      where.isRealIncident = false
    }

    const cases = await prisma.case.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: {
            statements: true,
            sources: true,
            people: true,
            organizations: true
          }
        }
      }
    })

    return res.status(200).json({ cases })
  } catch (error) {
    console.error('Error fetching cases:', error)
    return res.status(500).json({ error: 'Failed to fetch cases' })
  }
}
