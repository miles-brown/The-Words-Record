import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withPermission } from '@/middleware/rbac'
import { ApprovalStatus, JobStatus, AuditAction, AuditActorType } from '@prisma/client'
import { recordAuditEvent, extractRequestContext } from '@/lib/audit'

interface DashboardResponse {
  totalCases: number
  totalPeople: number
  totalOrganizations: number
  totalStatements: number
  totalSources: number
  totalUsers: number
  verifiedSources: number
  mfaEnabledUsers: number
  activeUsers30d: number
  activeApiKeys: number
  apiKeyAuth24h: number
  errorEvents24h: number
  pendingApprovals: number
  draftsPending: number
  draftsSubmitted: number
  failedHarvests: number
  recentCases: Array<{
    id: string
    title: string
    slug: string
    caseDate: string
    status: string
    isRealIncident: boolean
  }>
  recentStatements: Array<{
    id: string
    content: string
    statementDate: string
    statementType: string
    person: { id: string; slug: string; fullName: string | null } | null
    organization: { id: string; slug: string; name: string } | null
  }>
  draftQueue: Array<{
    id: string
    contentType: string
    status: string
    updatedAt: string
    submittedAt: string | null
    owner: {
      id: string
      username: string
    } | null
  }>
  auditTimeline: Array<{
    id: string
    action: string
    entityType: string | null
    entityId: string | null
    actor: string | null
    timestamp: string
    status: string
    description: string | null
  }>
}

async function dashboardHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  try {
    const now = new Date()
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Run queries sequentially to avoid prepared statement conflicts
    // This is slower but more reliable with Prisma + Supabase
    const totalCases = await prisma.case.count()
    const totalPeople = await prisma.person.count()
    const totalOrganizations = await prisma.organization.count()
    const totalStatements = await prisma.statement.count()
    const totalSources = await prisma.source.count()
    const verifiedSources = await prisma.source.count({
      where: {
        contentSnapshot: {
          not: null
        }
      }
    })
    const totalUsers = await prisma.user.count()
    const mfaEnabledUsers = await prisma.user.count({ where: { mfaEnabled: true } })
    const activeUsers30d = await prisma.user.count({
      where: {
        lastLogin: {
          gte: last30Days
        }
      }
    })
    const activeApiKeys = await prisma.apiKey.count({ where: { isActive: true } })
    const apiKeyAuth24h = await prisma.auditLog.count({
      where: {
        action: AuditAction.LOGIN,
        actorType: AuditActorType.API_KEY,
        status: 'SUCCESS',
        occuredAt: {
          gte: last24Hours
        }
      }
    })
    const errorEvents24h = await prisma.auditLog.count({
      where: {
        status: 'FAILURE',
        occuredAt: {
          gte: last24Hours
        }
      }
    })
    const recentCases = await prisma.case.findMany({
      take: 5,
      where: {
        isRealIncident: true  // Only show actual multi-statement cases
      },
      orderBy: { caseDate: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        caseDate: true,
        status: true,
        isRealIncident: true
      }
    })
    const recentStatements = await prisma.statement.findMany({
      take: 10,
      orderBy: { statementDate: 'desc' },
      select: {
        id: true,
        content: true,
        statementDate: true,
        statementType: true,
        person: {
          select: {
            id: true,
            slug: true,
            fullName: true
          }
        },
        organization: {
          select: {
            id: true,
            slug: true,
            name: true
          }
        }
      }
    })
    const auditTimeline = await prisma.auditLog.findMany({
      take: 15,
      orderBy: { occuredAt: 'desc' },
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        actorId: true,
        actorType: true,
        occuredAt: true,
        status: true,
        description: true
      }
    })
    const pendingApprovals = await prisma.contentApproval.count({
      where: {
        status: ApprovalStatus.PENDING
      }
    })
    const draftsPending = await prisma.contentDraft.count({ where: { status: 'SUBMITTED' } })
    const draftsSubmitted = await prisma.contentDraft.count({
      where: {
        status: {
          in: ['IN_REVIEW']
        }
      }
    })
    const draftQueue = await prisma.contentDraft.findMany({
      where: {
        status: {
          in: ['SUBMITTED', 'IN_REVIEW']
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        contentType: true,
        status: true,
        updatedAt: true,
        submittedAt: true,
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })
    const failedHarvests = await prisma.harvestJob.count({
      where: {
        status: {
          in: [JobStatus.FAILED, JobStatus.RETRY]
        }
      }
    })

    const response: DashboardResponse = {
      totalCases,
      totalPeople,
      totalOrganizations,
      totalStatements,
      totalSources,
      totalUsers,
      verifiedSources,
      mfaEnabledUsers,
      activeUsers30d,
      activeApiKeys,
      apiKeyAuth24h,
      errorEvents24h,
      pendingApprovals,
      draftsPending,
      draftsSubmitted,
      failedHarvests,
      recentCases: recentCases.map(item => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        caseDate: item.caseDate?.toISOString() ?? new Date().toISOString(),
        status: item.status,
        isRealIncident: item.isRealIncident
      })),
      recentStatements: recentStatements.map(item => ({
        id: item.id,
        content: item.content.substring(0, 150) + (item.content.length > 150 ? '...' : ''),
        statementDate: item.statementDate.toISOString(),
        statementType: item.statementType,
        person: item.person,
        organization: item.organization
      })),
      draftQueue: draftQueue.map(item => ({
        id: item.id,
        contentType: item.contentType,
        status: item.status,
        updatedAt: item.updatedAt.toISOString(),
        submittedAt: item.submittedAt ? item.submittedAt.toISOString() : null,
        owner: item.user
          ? {
              id: item.user.id,
              username: item.user.username
            }
          : null
      })),
      auditTimeline: auditTimeline.map(item => ({
        id: item.id,
        action: item.action,
        entityType: item.entityType,
        entityId: item.entityId,
        actor: item.actorId ? `${item.actorType}:${item.actorId}` : null,
        timestamp: item.occuredAt.toISOString(),
        status: item.status,
        description: item.description
      }))
    }

    await recordAuditEvent({
      action: 'VIEW',
      actorId: (req as any).user?.id ?? (req as any).apiKey?.id,
      actorType: (req as any).apiKey ? 'API_KEY' : 'USER',
      entityType: 'dashboard',
      entityId: 'admin-dashboard',
      description: 'Admin dashboard viewed',
      ...extractRequestContext(req)
    })

    return res.status(200).json(response)
  } catch (error) {
    console.error('Admin dashboard error:', error)
    return res.status(500).json({ error: 'Failed to load dashboard data' })
  }
}

export default withPermission('content:read')(dashboardHandler)