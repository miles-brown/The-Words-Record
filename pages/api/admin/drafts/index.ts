import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/auth'
import { UserRole, DraftStatus } from '@prisma/client'

async function requireAuth(req: NextApiRequest): Promise<{ userId: string; role: UserRole } | null> {
  const token = extractTokenFromRequest(req)
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload || !payload.sub) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, role: true, isActive: true }
  })

  if (!user || !user.isActive) return null

  return { userId: user.id, role: user.role }
}

/**
 * Content Drafts API
 *
 * GET /api/admin/drafts - List drafts (with filters)
 * POST /api/admin/drafts - Create new draft
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = await requireAuth(req)
  if (!auth) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    return handleGet(req, res, auth)
  } else if (req.method === 'POST') {
    return handlePost(req, res, auth)
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  auth: { userId: string; role: UserRole }
) {
  try {
    const {
      status,
      contentType,
      page = '1',
      limit = '20',
      userId: filterUserId
    } = req.query

    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)
    const skip = (pageNum - 1) * limitNum

    const where: any = {}

    // Regular users can only see their own drafts
    // ADMIN, CM (Content Manager), and DBO (Database Officer) can see all drafts
    if (auth.role !== UserRole.ADMIN && auth.role !== UserRole.CM && auth.role !== UserRole.DBO) {
      where.userId = auth.userId
    } else if (filterUserId) {
      where.userId = filterUserId
    }

    if (status) {
      where.status = status
    }

    if (contentType) {
      where.contentType = contentType
    }

    const [drafts, total] = await Promise.all([
      prisma.contentDraft.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          approvals: {
            include: {
              reviewer: {
                select: {
                  id: true,
                  username: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.contentDraft.count({ where })
    ])

    return res.status(200).json({
      drafts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching drafts:', error)
    return res.status(500).json({ error: 'Failed to fetch drafts' })
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  auth: { userId: string; role: UserRole }
) {
  try {
    const { contentType, contentId, data, notes } = req.body

    if (!contentType || !data) {
      return res.status(400).json({ error: 'contentType and data are required' })
    }

    const draft = await prisma.contentDraft.create({
      data: {
        userId: auth.userId,
        contentType,
        contentId,
        data,
        notes,
        status: DraftStatus.DRAFT
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    })

    return res.status(201).json({ draft })
  } catch (error) {
    console.error('Error creating draft:', error)
    return res.status(500).json({ error: 'Failed to create draft' })
  }
}
