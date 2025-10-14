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

  const { slug } = req.query

  if (typeof slug !== 'string') {
    return res.status(400).json({ error: 'Invalid person slug' })
  }

  if (req.method === 'GET') {
    return handleGet(req, res, slug)
  } else if (req.method === 'PUT') {
    return handlePut(req, res, slug, auth.userId)
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res, slug, auth.userId)
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  slug: string
) {
  try {
    const person = await prisma.person.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        firstName: true,
        middleName: true,
        lastName: true,
        fullName: true,
        bio: true,
        profession: true,
        professionDetail: true,
        nationality: true,
        dateOfBirth: true,
        birthDate: true,
        deathDate: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            statements: true,
            cases: true
          }
        }
      }
    })

    if (!person) {
      return res.status(404).json({ error: 'Person not found' })
    }

    return res.status(200).json({ person })
  } catch (error) {
    console.error('Error fetching person:', error)
    return res.status(500).json({ error: 'Failed to fetch person' })
  }
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  slug: string,
  actorId: string
) {
  try {
    const {
      firstName,
      middleName,
      lastName,
      fullName,
      name,
      slug: newSlug,
      bio,
      profession,
      professionDetail,
      nationality,
      dateOfBirth,
      imageUrl
    } = req.body

    // Validation
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' })
    }

    // Check if person exists
    const existingPerson = await prisma.person.findUnique({
      where: { slug }
    })

    if (!existingPerson) {
      return res.status(404).json({ error: 'Person not found' })
    }

    // If slug is being changed, check if new slug already exists
    if (newSlug && newSlug !== slug) {
      const slugTaken = await prisma.person.findUnique({
        where: { slug: newSlug }
      })

      if (slugTaken) {
        return res.status(409).json({ error: 'A person with this slug already exists' })
      }
    }

    // Update person
    const person = await prisma.person.update({
      where: { slug },
      data: {
        firstName,
        middleName: middleName || null,
        lastName,
        fullName: fullName || `${firstName} ${middleName || ''} ${lastName}`.trim(),
        name: name || `${firstName} ${lastName}`.trim(),
        slug: newSlug || slug,
        bio: bio || null,
        profession: profession || 'OTHER',
        professionDetail: professionDetail || null,
        nationality: nationality || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        imageUrl: imageUrl || null
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
        updatedAt: true
      }
    })

    // Log audit event
    await logAuditEvent({
      action: AuditAction.UPDATE,
      actorType: AuditActorType.USER,
      actorId,
      entityType: 'Person',
      entityId: person.id,
      details: {
        name: person.name,
        slug: person.slug
      }
    })

    return res.status(200).json({ person })
  } catch (error) {
    console.error('Error updating person:', error)
    return res.status(500).json({ error: 'Failed to update person' })
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  slug: string,
  actorId: string
) {
  try {
    // Get person info before deletion for audit log
    const person = await prisma.person.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            statements: true,
            cases: true
          }
        }
      }
    })

    if (!person) {
      return res.status(404).json({ error: 'Person not found' })
    }

    // Check if person has related records
    if (person._count.statements > 0 || person._count.cases > 0) {
      return res.status(400).json({
        error: 'Cannot delete person with existing statements or cases. Please remove related records first.',
        details: {
          statements: person._count.statements,
          cases: person._count.cases
        }
      })
    }

    // Delete person
    await prisma.person.delete({
      where: { slug }
    })

    // Log audit event
    await logAuditEvent({
      action: AuditAction.DELETE,
      actorType: AuditActorType.USER,
      actorId,
      entityType: 'Person',
      entityId: person.id,
      details: {
        name: person.name,
        slug: person.slug
      }
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error deleting person:', error)
    return res.status(500).json({ error: 'Failed to delete person' })
  }
}
