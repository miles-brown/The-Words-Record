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
  }

  if (req.method === 'POST') {
    return handlePost(req, res, auth.userId)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { limit = '50', offset = '0', search, page = '1' } = req.query
    const limitNum = parseInt(limit as string)
    const pageNum = parseInt(page as string)
    const skip = (pageNum - 1) * limitNum

    const where: any = {}

    // Search across multiple fields
    if (search) {
      where.OR = [
        { content: { contains: search as string, mode: 'insensitive' as const } },
        { context: { contains: search as string, mode: 'insensitive' as const } },
        { person: { name: { contains: search as string, mode: 'insensitive' as const } } },
        { organization: { name: { contains: search as string, mode: 'insensitive' as const } } }
      ]
    }

    const [statements, total] = await Promise.all([
      prisma.statement.findMany({
        where,
        take: limitNum,
        skip,
        select: {
          id: true,
          content: true,
          context: true,
          statementDate: true,
          statementType: true,
          verificationLevel: true,
          personId: true,
          organizationId: true,
          caseId: true,
          primarySourceId: true,
          respondsToId: true,
          isVerified: true,
          hasRepercussions: true,
          createdAt: true,
          updatedAt: true,
          person: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              fullName: true,
              slug: true,
              profession: true
            }
          },
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true
            }
          },
          case: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true
            }
          },
          primarySource: {
            select: {
              id: true,
              title: true,
              url: true,
              publication: true,
              verificationStatus: true
            }
          },
          respondsTo: {
            select: {
              id: true,
              content: true,
              person: {
                select: {
                  fullName: true
                }
              }
            }
          },
          _count: {
            select: {
              responses: true,
              sources: true
            }
          }
        },
        orderBy: {
          statementDate: 'desc'
        }
      }),
      prisma.statement.count({ where })
    ])

    res.status(200).json({
      statements,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, actorId: string) {
  try {
    const {
      content,
      context,
      statementDate,
      statementType,
      respondsToId,
      personId,
      organizationId,
      caseId
    } = req.body

    if (!content || !statementDate) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // If it's a response statement, validate respondsToId
    if (statementType === 'RESPONSE' && !respondsToId) {
      return res.status(400).json({ error: 'Response statements must specify respondsToId' })
    }

    const statement = await prisma.statement.create({
      data: {
        content,
        context,
        statementDate: new Date(statementDate),
        statementType: statementType || 'ORIGINAL',
        respondsToId: respondsToId || null,
        personId: personId || null,
        organizationId: organizationId || null,
        caseId: caseId || null
      },
      include: {
        person: true,
        organization: true,
        case: true,
        respondsTo: true
      }
    })

    res.status(201).json({ statement })
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
