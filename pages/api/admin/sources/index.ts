import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit'
import { AuditAction, AuditActorType, UserRole, VerificationStatus } from '@prisma/client'

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
  } else if (req.method === 'POST') {
    return handlePost(req, res, auth.userId)
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { search, verified, page = '1', limit = '50' } = req.query
    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)
    const skip = (pageNum - 1) * limitNum

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' as const } },
        { url: { contains: search as string, mode: 'insensitive' as const } },
        { publication: { contains: search as string, mode: 'insensitive' as const } }
      ]
    }

    // Filter by verification status
    if (verified === 'true') {
      where.verificationStatus = VerificationStatus.VERIFIED
    } else if (verified === 'false') {
      where.verificationStatus = VerificationStatus.UNVERIFIED
    }

    const [sources, total] = await Promise.all([
      prisma.source.findMany({
        where,
        select: {
          id: true,
          title: true,
          url: true,
          publication: true,
          author: true,
          publishDate: true,
          verificationStatus: true,
          verificationDate: true,
          verifiedBy: true,
          sourceType: true,
          sourceLevel: true,
          contentType: true,
          credibilityLevel: true,
          credibilityScore: true,
          isArchived: true,
          archiveUrl: true,
          archiveDate: true,
          hasPaywall: true,
          isOpinion: true,
          isDeleted: true,
          isBroken: true,
          citationCount: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              primaryForStatements: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.source.count({ where })
    ])

    // Map verificationStatus to isVerified for backwards compatibility with UI
    const sourcesWithIsVerified = sources.map(source => ({
      ...source,
      isVerified: source.verificationStatus === VerificationStatus.VERIFIED
    }))

    return res.status(200).json({
      sources: sourcesWithIsVerified,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching sources:', error)
    return res.status(500).json({ error: 'Failed to fetch sources' })
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, actorId: string) {
  try {
    const {
      title,
      url,
      publication,
      author,
      publishDate,
      sourceType,
      credibilityLevel
    } = req.body

    // Validation
    if (!title) {
      return res.status(400).json({ error: 'Title is required' })
    }

    // Create source
    const source = await prisma.source.create({
      data: {
        title,
        url: url || undefined,
        publication: publication || undefined,
        author: author || undefined,
        publishDate: publishDate ? new Date(publishDate) : undefined,
        sourceType: sourceType || 'NEWS_ARTICLE',
        credibilityLevel: credibilityLevel || 'UNKNOWN',
        verificationStatus: VerificationStatus.UNVERIFIED
      },
      select: {
        id: true,
        title: true,
        url: true,
        publication: true,
        author: true,
        publishDate: true,
        sourceType: true,
        credibilityLevel: true,
        verificationStatus: true,
        createdAt: true
      }
    })

    // Log audit event
    await logAuditEvent({
      action: AuditAction.CREATE,
      actorType: AuditActorType.USER,
      actorId,
      entityType: 'Source',
      entityId: source.id,
      details: {
        title: source.title,
        url: source.url
      }
    })

    return res.status(201).json({ source })
  } catch (error) {
    console.error('Error creating source:', error)
    return res.status(500).json({ error: 'Failed to create source' })
  }
}
