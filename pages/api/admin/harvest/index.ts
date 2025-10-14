import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit'
import { AuditAction, AuditActorType, UserRole, HarvestType, JobStatus } from '@prisma/client'

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
    const { status, type, limit = '50', offset = '0' } = req.query

    const where: any = {}

    if (status && typeof status === 'string') {
      where.status = status
    }

    if (type && typeof type === 'string' && Object.values(HarvestType).includes(type as HarvestType)) {
      where.type = type
    }

    const jobs = await prisma.harvestJob.findMany({
      where,
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    const total = await prisma.harvestJob.count({ where })

    return res.status(200).json({
      jobs,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    })
  } catch (error) {
    console.error('Error fetching harvest jobs:', error)
    return res.status(500).json({ error: 'Failed to fetch harvest jobs' })
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  actorId: string
) {
  try {
    const { type, config, priority, scheduledAt } = req.body

    // Validate required fields
    if (!type) {
      return res.status(400).json({ error: 'Harvest type is required' })
    }

    // Validate harvest type
    if (!Object.values(HarvestType).includes(type as HarvestType)) {
      return res.status(400).json({ error: 'Invalid harvest type' })
    }

    // Create the harvest job
    const job = await prisma.harvestJob.create({
      data: {
        type: type as HarvestType,
        status: scheduledAt ? JobStatus.PENDING : JobStatus.QUEUED,
        config: config || {},
        priority: priority || 5,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        createdBy: actorId
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Log audit event
    await logAuditEvent({
      action: AuditAction.CREATE,
      actorType: AuditActorType.USER,
      actorId,
      entityType: 'HarvestJob',
      entityId: job.id,
      details: {
        type: job.type,
        priority: job.priority,
        scheduledAt: job.scheduledAt
      }
    })

    return res.status(201).json({ job })
  } catch (error) {
    console.error('Error creating harvest job:', error)
    return res.status(500).json({ error: 'Failed to create harvest job' })
  }
}
