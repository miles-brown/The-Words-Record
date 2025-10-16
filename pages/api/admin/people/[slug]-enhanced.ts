import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit'
import { AuditAction, AuditActorType, UserRole } from '@prisma/client'
import { detectChanges, logPersonChanges, validatePersonReferences } from '@/lib/admin/changeTracking'

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
    // Fetch ALL person fields - Prisma includes all scalar fields by default
    const person = await prisma.person.findUnique({
      where: { slug }
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
    const updateData = req.body

    // Validation - only check required fields
    if (!updateData.firstName || !updateData.lastName) {
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
    if (updateData.slug && updateData.slug !== slug) {
      const slugTaken = await prisma.person.findUnique({
        where: { slug: updateData.slug }
      })

      if (slugTaken) {
        return res.status(409).json({ error: 'A person with this slug already exists' })
      }
    }

    // Process data for Prisma
    const processedData: any = {}

    // Handle all fields dynamically
    Object.keys(updateData).forEach(key => {
      const value = updateData[key]

      // Skip undefined values (they won't be updated)
      if (value === undefined) {
        return
      }

      // Convert null/empty strings to null for database
      if (value === '' || value === null) {
        processedData[key] = null
        return
      }

      // Handle dates - convert string dates to Date objects
      if (key.includes('Date') && typeof value === 'string' && value) {
        try {
          processedData[key] = new Date(value)
        } catch (e) {
          processedData[key] = null
        }
        return
      }

      // Handle arrays
      if (Array.isArray(value)) {
        processedData[key] = value.length > 0 ? value : null
        return
      }

      // Handle booleans
      if (typeof value === 'boolean') {
        processedData[key] = value
        return
      }

      // Handle numbers
      if (typeof value === 'number') {
        processedData[key] = value
        return
      }

      // Handle strings
      processedData[key] = value
    })

    // Ensure computed fields are set
    if (processedData.firstName || processedData.lastName) {
      processedData.name = `${processedData.firstName || existingPerson.firstName} ${processedData.lastName || existingPerson.lastName}`.trim()

      const parts = [
        processedData.namePrefix ?? existingPerson.namePrefix,
        processedData.firstName ?? existingPerson.firstName,
        processedData.middleName ?? existingPerson.middleName,
        processedData.lastName ?? existingPerson.lastName,
        processedData.nameSuffix ?? existingPerson.nameSuffix
      ].filter(Boolean)

      processedData.fullName = parts.join(' ')
    }

    // Set lastEditedBy metadata
    processedData.lastEditedBy = actorId

    // Detect changes before update
    const changes = detectChanges(existingPerson, processedData)

    // Use transaction for atomic update
    const person = await prisma.$transaction(async (tx) => {
      const updated = await tx.person.update({
        where: { slug },
        data: processedData
      })
      return updated
    })

    // Log changes to audit system (after successful transaction)
    if (changes.length > 0) {
      await logPersonChanges({
        personId: person.id,
        personSlug: person.slug,
        changes,
        userId: actorId,
        metadata: {
          source: 'admin_dashboard',
          endpoint: '/api/admin/people/[slug]-enhanced',
          fieldsUpdated: Object.keys(processedData)
        }
      })
    }

    // Validate referential integrity (asynchronously, don't block response)
    validatePersonReferences(person.id).catch(err => {
      console.error('Referential integrity check failed:', err)
    })

    // Trigger ISR revalidation for the person's public page
    try {
      await res.revalidate(`/people/${person.slug}`)
    } catch (e) {
      console.warn('Failed to revalidate person page:', e)
      // Don't fail the request if revalidation fails
    }

    return res.status(200).json({
      person,
      changes: changes.length,
      synced: true
    })
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
