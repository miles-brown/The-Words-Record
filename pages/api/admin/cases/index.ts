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
    const { isRealIncident, page = '1', limit = '50' } = req.query
    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)
    const skip = (pageNum - 1) * limitNum

    const where: any = {}

    if (isRealIncident === 'true') {
      where.isRealIncident = true
    } else if (isRealIncident === 'false') {
      where.isRealIncident = false
    }

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
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
        },
        skip,
        take: limitNum
      }),
      prisma.case.count({ where })
    ])

    return res.status(200).json({
      cases,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching cases:', error)
    return res.status(500).json({ error: 'Failed to fetch cases' })
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, actorId: string) {
  try {
    const {
      title,
      slug,
      summary,
      description,
      caseDate,
      status,
      severity,
      visibility,
      locationCity,
      locationState,
      locationCountry,
      isRealIncident
    } = req.body

    // Validation
    if (!title || !slug || !summary || !description || !caseDate || !status || !visibility) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Check if slug already exists
    const existingCase = await prisma.case.findUnique({
      where: { slug }
    })

    if (existingCase) {
      return res.status(409).json({ error: 'A case with this slug already exists' })
    }

    // Create case
    const caseItem = await prisma.case.create({
      data: {
        title,
        slug,
        summary,
        description,
        caseDate: new Date(caseDate),
        status,
        severity: severity || undefined,
        visibility,
        locationCity: locationCity || undefined,
        locationState: locationState || undefined,
        locationCountry: locationCountry || undefined,
        isRealIncident: isRealIncident !== undefined ? isRealIncident : false
      },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        description: true,
        caseDate: true,
        status: true,
        severity: true,
        visibility: true,
        locationCity: true,
        locationState: true,
        locationCountry: true,
        isRealIncident: true,
        createdAt: true
      }
    })

    // Log audit event
    await logAuditEvent({
      action: AuditAction.CREATE,
      actorType: AuditActorType.USER,
      actorId,
      entityType: 'Case',
      entityId: caseItem.id,
      details: {
        title: caseItem.title,
        slug: caseItem.slug,
        status: caseItem.status
      }
    })

    return res.status(201).json({ case: caseItem })
  } catch (error) {
    console.error('Error creating case:', error)
    return res.status(500).json({ error: 'Failed to create case' })
  }
}
