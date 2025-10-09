/**
 * Admin Dashboard API
 * Provides statistics and recent activity for the admin dashboard
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export default requireAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    // Fetch statistics
    const [
      totalCases,
      totalPeople,
      totalOrganizations,
      totalStatements,
      totalSources,
      verifiedSources,
      recentCases
    ] = await Promise.all([
      prisma.case.count(),
      prisma.person.count(),
      prisma.organization.count(),
      prisma.statement.count(),
      prisma.source.count(),
      prisma.source.count({
        where: { verificationStatus: 'VERIFIED' }
      }),
      prisma.case.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          caseDate: true,
          status: true
        }
      })
    ])

    // Mock recent activity for now (will be replaced with real audit logs)
    const recentActivity = [
      {
        id: '1',
        action: 'CREATE',
        entityType: 'case',
        entityId: 'case-001',
        user: 'admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: '2',
        action: 'UPDATE',
        entityType: 'person',
        entityId: 'person-001',
        user: 'admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      },
      {
        id: '3',
        action: 'VERIFY',
        entityType: 'source',
        entityId: 'source-001',
        user: 'admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
      }
    ]

    // Mock pending items
    const pendingApprovals = 0 // Will implement when draft system is ready
    const failedHarvests = 0  // Will implement when harvest system is ready

    res.status(200).json({
      totalCases,
      totalPeople,
      totalOrganizations,
      totalStatements,
      totalSources,
      verifiedSources,
      recentCases,
      recentActivity,
      pendingApprovals,
      failedHarvests
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard data' })
  }
})