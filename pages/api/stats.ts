import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get counts
    const [
      caseCount,
      personCount,
      organizationCount,
      statementCount,
      responseCount,
      sourceCount,
      tagCount,
    ] = await Promise.all([
      prisma.case.count(),
      prisma.person.count(),
      prisma.organization.count(),
      prisma.statement.count(),
      prisma.statement.count({ where: { statementType: 'RESPONSE' } }),
      prisma.source.count(),
      prisma.tag.count(),
    ])

    // Get recent activity
    const recentCases = await prisma.case.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        caseDate: true,
        createdAt: true,
      },
    })

    // Get most active tags
    const popularTags = await prisma.tag.findMany({
      take: 10,
      include: {
        _count: {
          select: { cases: true },
        },
      },
      orderBy: {
        cases: {
          _count: 'desc',
        },
      },
    })

    // Get people with most cases
    const activePeople = await prisma.person.findMany({
      take: 10,
      include: {
        _count: {
          select: { cases: true, statements: true },
        },
      },
      orderBy: {
        cases: {
          _count: 'desc',
        },
      },
    })

    return res.status(200).json({
      counts: {
        cases: caseCount,
        people: personCount,
        organizations: organizationCount,
        statements: statementCount,
        responses: responseCount,
        sources: sourceCount,
        tags: tagCount,
      },
      recentCases,
      popularTags,
      activePeople,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return res.status(500).json({ error: 'Failed to fetch statistics' })
  }
}
