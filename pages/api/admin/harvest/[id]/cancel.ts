import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit'
import { AuditAction, AuditActorType, UserRole, JobStatus } from '@prisma/client'

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
    return res.status(400).json({ error: 'Invalid job ID' })
  }

  if (req.method === 'POST') {
    return handlePost(req, res, id, auth.userId)
  } else {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  jobId: string,
  actorId: string
) {
  try {
    // First, check if the job exists and can be cancelled
    const job = await prisma.harvestJob.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        type: true,
        status: true
      }
    })

    if (!job) {
      return res.status(404).json({ error: 'Harvest job not found' })
    }

    // Only allow cancellation of jobs that are pending, queued, or running
    if (![JobStatus.PENDING, JobStatus.QUEUED, JobStatus.RUNNING].includes(job.status)) {
      return res.status(400).json({
        error: `Cannot cancel job with status ${job.status}. Only PENDING, QUEUED, or RUNNING jobs can be cancelled.`
      })
    }

    // Update the job status to CANCELLED
    const updatedJob = await prisma.harvestJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.CANCELLED,
        completedAt: new Date()
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
      action: AuditAction.UPDATE,
      actorType: AuditActorType.USER,
      actorId,
      entityType: 'HarvestJob',
      entityId: jobId,
      details: {
        action: 'cancelled',
        previousStatus: job.status,
        newStatus: JobStatus.CANCELLED,
        type: job.type
      }
    })

    return res.status(200).json({ job: updatedJob })
  } catch (error) {
    console.error('Error cancelling harvest job:', error)
    return res.status(500).json({ error: 'Failed to cancel harvest job' })
  }
}
