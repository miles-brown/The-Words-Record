import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { getPersonChangeHistory } from '@/lib/admin/changeTracking'

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
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const auth = await requireAdmin(req)
  if (!auth) {
    return res.status(403).json({ error: 'Unauthorized - Admin access required' })
  }

  try {
    const { slug } = req.query
    const { limit = '50', offset = '0' } = req.query

    if (typeof slug !== 'string') {
      return res.status(400).json({ error: 'Invalid person slug' })
    }

    // Get person ID from slug
    const person = await prisma.person.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true }
    })

    if (!person) {
      return res.status(404).json({ error: 'Person not found' })
    }

    // Fetch change history
    const history = await getPersonChangeHistory(
      person.id,
      parseInt(limit as string, 10),
      parseInt(offset as string, 10)
    )

    // Get total count for pagination
    const totalCount = await prisma.auditLog.count({
      where: {
        entityType: 'Person',
        entityId: person.id
      }
    })

    return res.status(200).json({
      person: {
        id: person.id,
        slug: person.slug,
        name: person.name
      },
      history,
      pagination: {
        total: totalCount,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
        hasMore: totalCount > parseInt(offset as string, 10) + history.length
      }
    })
  } catch (error) {
    console.error('Error fetching change history:', error)
    return res.status(500).json({ error: 'Failed to fetch change history' })
  }
}
