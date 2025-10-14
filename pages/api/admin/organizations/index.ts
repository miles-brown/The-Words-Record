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
    const { search, type, page = '1', limit = '50' } = req.query
    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)
    const skip = (pageNum - 1) * limitNum

    const where: any = {}

    if (search) {
      where.name = { contains: search as string, mode: 'insensitive' as const }
    }

    if (type) {
      where.type = type
    }

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        select: {
          id: true,
          slug: true,
          name: true,
          type: true,
          description: true,
          website: true,
          headquarters: true,
          founded: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              statements: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.organization.count({ where })
    ])

    return res.status(200).json({
      organizations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return res.status(500).json({ error: 'Failed to fetch organizations' })
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, actorId: string) {
  try {
    const {
      name,
      slug,
      type,
      description,
      website,
      headquarters,
      founded
    } = req.body

    // Validation
    if (!name || !slug || !type) {
      return res.status(400).json({ error: 'Name, slug, and type are required' })
    }

    // Check if slug already exists
    const existingOrganization = await prisma.organization.findUnique({
      where: { slug }
    })

    if (existingOrganization) {
      return res.status(409).json({ error: 'An organization with this slug already exists' })
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        type,
        description: description || undefined,
        website: website || undefined,
        headquarters: headquarters || undefined,
        founded: founded ? new Date(founded) : undefined
      },
      select: {
        id: true,
        slug: true,
        name: true,
        type: true,
        description: true,
        website: true,
        headquarters: true,
        founded: true,
        createdAt: true
      }
    })

    // Log audit event
    await logAuditEvent({
      action: AuditAction.CREATE,
      actorType: AuditActorType.USER,
      actorId,
      entityType: 'Organization',
      entityId: organization.id,
      details: {
        name: organization.name,
        slug: organization.slug,
        type: organization.type
      }
    })

    return res.status(201).json({ organization })
  } catch (error) {
    console.error('Error creating organization:', error)
    return res.status(500).json({ error: 'Failed to create organization' })
  }
}
