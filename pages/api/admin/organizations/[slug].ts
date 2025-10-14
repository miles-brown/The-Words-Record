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
    return res.status(400).json({ error: 'Invalid organization slug' })
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
    const organization = await prisma.organization.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        type: true,
        description: true,
        website: true,
        headquarters: true,
        founded: true,
        dissolved: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            statements: true
          }
        }
      }
    })

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' })
    }

    return res.status(200).json({ organization })
  } catch (error) {
    console.error('Error fetching organization:', error)
    return res.status(500).json({ error: 'Failed to fetch organization' })
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
      name,
      slug: newSlug,
      type,
      description,
      website,
      headquarters,
      founded
    } = req.body

    // Validation
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' })
    }

    // Check if organization exists
    const existingOrganization = await prisma.organization.findUnique({
      where: { slug }
    })

    if (!existingOrganization) {
      return res.status(404).json({ error: 'Organization not found' })
    }

    // If slug is being changed, check if new slug already exists
    if (newSlug && newSlug !== slug) {
      const slugTaken = await prisma.organization.findUnique({
        where: { slug: newSlug }
      })

      if (slugTaken) {
        return res.status(409).json({ error: 'An organization with this slug already exists' })
      }
    }

    // Update organization
    const organization = await prisma.organization.update({
      where: { slug },
      data: {
        name,
        slug: newSlug || slug,
        type,
        description: description || null,
        website: website || null,
        headquarters: headquarters || null,
        founded: founded ? new Date(founded) : null
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
        updatedAt: true
      }
    })

    // Log audit event
    await logAuditEvent({
      action: AuditAction.UPDATE,
      actorType: AuditActorType.USER,
      actorId,
      entityType: 'Organization',
      entityId: organization.id,
      details: {
        name: organization.name,
        slug: organization.slug
      }
    })

    return res.status(200).json({ organization })
  } catch (error) {
    console.error('Error updating organization:', error)
    return res.status(500).json({ error: 'Failed to update organization' })
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  slug: string,
  actorId: string
) {
  try {
    // Get organization info before deletion for audit log
    const organization = await prisma.organization.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            statements: true
          }
        }
      }
    })

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' })
    }

    // Check if organization has related records
    if (organization._count.statements > 0) {
      return res.status(400).json({
        error: 'Cannot delete organization with existing statements. Please remove related records first.',
        details: {
          statements: organization._count.statements
        }
      })
    }

    // Delete organization
    await prisma.organization.delete({
      where: { slug }
    })

    // Log audit event
    await logAuditEvent({
      action: AuditAction.DELETE,
      actorType: AuditActorType.USER,
      actorId,
      entityType: 'Organization',
      entityId: organization.id,
      details: {
        name: organization.name,
        slug: organization.slug
      }
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error deleting organization:', error)
    return res.status(500).json({ error: 'Failed to delete organization' })
  }
}
