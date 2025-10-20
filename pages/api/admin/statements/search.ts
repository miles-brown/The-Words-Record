import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withPermission } from '@/middleware/rbac'

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { q } = req.query

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Search query required' })
  }

  try {
    // Search for statements by content or person name
    const statements = await prisma.statement.findMany({
      where: {
        OR: [
          {
            content: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            person: {
              name: {
                contains: q,
                mode: 'insensitive'
              }
            }
          },
          {
            organization: {
              name: {
                contains: q,
                mode: 'insensitive'
              }
            }
          }
        ]
      },
      include: {
        person: {
          select: {
            name: true,
            slug: true
          }
        },
        organization: {
          select: {
            name: true,
            slug: true
          }
        },
        case: {
          select: {
            title: true,
            slug: true
          }
        },
        _count: {
          select: {
            responses: true
          }
        }
      },
      orderBy: {
        statementDate: 'desc'
      },
      take: 20
    })

    res.status(200).json({ statements })
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default withPermission('content:read')(handler)
