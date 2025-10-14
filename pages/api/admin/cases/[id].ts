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

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid case ID' })
  }

  if (req.method === 'GET') {
    return handleGet(req, res, id)
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    return handlePut(req, res, id, auth.userId)
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res, id, auth.userId)
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'PATCH', 'DELETE'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  caseId: string
) {
  try {
    const caseItem = await prisma.case.findUnique({
      where: { id: caseId },
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
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            statements: true,
            sources: true,
            people: true,
            organizations: true
          }
        }
      }
    })

    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' })
    }

    return res.status(200).json({ case: caseItem })
  } catch (error) {
    console.error('Error fetching case:', error)
    return res.status(500).json({ error: 'Failed to fetch case' })
  }
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  caseId: string,
  actorId: string
) {
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
    if (!title || !summary || !description || !caseDate || !status || !visibility) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Check if case exists
    const existingCase = await prisma.case.findUnique({
      where: { id: caseId }
    })

    if (!existingCase) {
      return res.status(404).json({ error: 'Case not found' })
    }

    // If slug is being changed, check if new slug already exists
    if (slug && slug !== existingCase.slug) {
      const slugTaken = await prisma.case.findUnique({
        where: { slug }
      })

      if (slugTaken) {
        return res.status(409).json({ error: 'A case with this slug already exists' })
      }
    }

    // Update case
    const caseItem = await prisma.case.update({
      where: { id: caseId },
      data: {
        title,
        slug: slug || existingCase.slug,
        summary,
        description,
        caseDate: new Date(caseDate),
        status,
        severity: severity || null,
        visibility,
        locationCity: locationCity || null,
        locationState: locationState || null,
        locationCountry: locationCountry || null,
        isRealIncident: isRealIncident !== undefined ? isRealIncident : existingCase.isRealIncident
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
        updatedAt: true
      }
    })

    // Log audit event
    await logAuditEvent({
      action: AuditAction.UPDATE,
      actorType: AuditActorType.USER,
      actorId,
      entityType: 'Case',
      entityId: caseId,
      details: {
        title: caseItem.title,
        slug: caseItem.slug
      }
    })

    return res.status(200).json({ case: caseItem })
  } catch (error) {
    console.error('Error updating case:', error)
    return res.status(500).json({ error: 'Failed to update case' })
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  caseId: string,
  actorId: string
) {
  try {
    // Get case info before deletion for audit log
    const caseItem = await prisma.case.findUnique({
      where: { id: caseId },
      select: {
        id: true,
        title: true,
        slug: true,
        _count: {
          select: {
            statements: true,
            sources: true
          }
        }
      }
    })

    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' })
    }

    // Check if case has related records
    if (caseItem._count.statements > 0 || caseItem._count.sources > 0) {
      return res.status(400).json({
        error: 'Cannot delete case with existing statements or sources. Please remove related records first.',
        details: {
          statements: caseItem._count.statements,
          sources: caseItem._count.sources
        }
      })
    }

    // Delete case
    await prisma.case.delete({
      where: { id: caseId }
    })

    // Log audit event
    await logAuditEvent({
      action: AuditAction.DELETE,
      actorType: AuditActorType.USER,
      actorId,
      entityType: 'Case',
      entityId: caseId,
      details: {
        title: caseItem.title,
        slug: caseItem.slug
      }
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error deleting case:', error)
    return res.status(500).json({ error: 'Failed to delete case' })
  }
}
