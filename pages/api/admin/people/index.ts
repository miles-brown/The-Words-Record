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
    const { search, page = '1', limit = '50' } = req.query
    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)
    const skip = (pageNum - 1) * limitNum

    const where = search
      ? {
          OR: [
            { firstName: { contains: search as string, mode: 'insensitive' as const } },
            { lastName: { contains: search as string, mode: 'insensitive' as const } },
            { fullName: { contains: search as string, mode: 'insensitive' as const } },
            { name: { contains: search as string, mode: 'insensitive' as const } }
          ]
        }
      : {}

    const [people, total] = await Promise.all([
      prisma.person.findMany({
        where,
        select: {
          id: true,
          slug: true,
          name: true,
          firstName: true,
          lastName: true,
          fullName: true,
          profession: true,
          professionDetail: true,
          imageUrl: true,
          nationality: true,
          dateOfBirth: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              statements: true,
              casesAsSubject: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.person.count({ where })
    ])

    return res.status(200).json({
      people,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching people:', error)
    return res.status(500).json({ error: 'Failed to fetch people' })
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, actorId: string) {
  try {
    const {
      firstName,
      middleName,
      lastName,
      fullName,
      name,
      slug,
      bio,
      profession,
      professionDetail,
      nationality,
      dateOfBirth,
      imageUrl
    } = req.body

    // Validation
    if (!firstName || !lastName || !slug) {
      return res.status(400).json({ error: 'First name, last name, and slug are required' })
    }

    // Check if slug already exists
    const existingPerson = await prisma.person.findUnique({
      where: { slug }
    })

    if (existingPerson) {
      return res.status(409).json({ error: 'A person with this slug already exists' })
    }

    // Create person
    const person = await prisma.person.create({
      data: {
        firstName,
        middleName: middleName || undefined,
        lastName,
        fullName: fullName || `${firstName} ${middleName || ''} ${lastName}`.trim(),
        name: name || `${firstName} ${lastName}`.trim(),
        slug,
        bio: bio || undefined,
        profession: profession || 'OTHER',
        professionDetail: professionDetail || undefined,
        nationality: nationality || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        imageUrl: imageUrl || undefined
      },
      select: {
        id: true,
        slug: true,
        name: true,
        firstName: true,
        lastName: true,
        fullName: true,
        profession: true,
        professionDetail: true,
        nationality: true,
        dateOfBirth: true,
        imageUrl: true,
        createdAt: true
      }
    })

    // Log audit event
    await logAuditEvent({
      action: AuditAction.CREATE,
      actorType: AuditActorType.USER,
      actorId,
      entityType: 'Person',
      entityId: person.id,
      details: {
        name: person.name,
        slug: person.slug
      }
    })

    return res.status(201).json({ person })
  } catch (error) {
    console.error('Error creating person:', error)
    return res.status(500).json({ error: 'Failed to create person' })
  }
}
