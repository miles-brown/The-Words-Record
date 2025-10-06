import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Fetch people analytics
    const [
      personsByProfession,
      personsByNationality,
      personsByInfluence,
      controversyData,
      socialMediaData,
      orgsByType,
      orgsByPoliticalLeaning,
      orgsByStanceOnIsrael,
      fundingData,
      mostInfluentialPeople,
      mostControversialPeople,
      mostActivePeople,
      mostInfluentialOrgs,
      mostControversialOrgs,
      mostActiveOrgs
    ] = await Promise.all([
      // People by profession
      prisma.person.groupBy({
        by: ['primaryProfession'],
        _count: true,
        where: { primaryProfession: { not: null } },
        orderBy: { _count: { primaryProfession: 'desc' } },
        take: 10
      }),

      // People by nationality
      prisma.person.groupBy({
        by: ['primaryNationality'],
        _count: true,
        where: { primaryNationality: { not: null } },
        orderBy: { _count: { primaryNationality: 'desc' } },
        take: 8
      }),

      // People by influence level
      prisma.person.groupBy({
        by: ['influenceLevel'],
        _count: true,
        where: { influenceLevel: { not: null } },
        orderBy: { influenceLevel: 'asc' }
      }),

      // Controversy score distribution
      prisma.$queryRaw`
        SELECT
          CASE
            WHEN "controversyScore" < 20 THEN '0-20'
            WHEN "controversyScore" < 40 THEN '20-40'
            WHEN "controversyScore" < 60 THEN '40-60'
            WHEN "controversyScore" < 80 THEN '60-80'
            ELSE '80-100'
          END as range,
          COUNT(*) as count
        FROM "Person"
        WHERE "controversyScore" IS NOT NULL
        GROUP BY range
        ORDER BY range
      `,

      // Social media reach
      prisma.$queryRaw`
        SELECT
          'Twitter' as platform,
          SUM("twitterFollowers") as "totalReach"
        FROM "Person"
        WHERE "twitterFollowers" IS NOT NULL
        UNION ALL
        SELECT
          'Instagram' as platform,
          SUM("instagramFollowers") as "totalReach"
        FROM "Person"
        WHERE "instagramFollowers" IS NOT NULL
        UNION ALL
        SELECT
          'Facebook' as platform,
          SUM("facebookFollowers") as "totalReach"
        FROM "Person"
        WHERE "facebookFollowers" IS NOT NULL
      `,

      // Organizations by type
      prisma.organization.groupBy({
        by: ['orgType'],
        _count: true,
        where: { orgType: { not: null } },
        orderBy: { _count: { orgType: 'desc' } },
        take: 10
      }),

      // Organizations by political leaning - placeholder until field is added
      Promise.resolve([]),

      // Organizations by stance on Israel - placeholder until field is added
      Promise.resolve([]),

      // Funding sources - placeholder until field is added
      Promise.resolve([]),

      // Most influential people
      prisma.person.findMany({
        where: { influenceScore: { not: null } },
        orderBy: { influenceScore: 'desc' },
        take: 10,
        select: {
          name: true,
          influenceScore: true
        }
      }),

      // Most controversial people
      prisma.person.findMany({
        where: { controversyScore: { not: null } },
        orderBy: { controversyScore: 'desc' },
        take: 10,
        select: {
          name: true,
          controversyScore: true
        }
      }),

      // Most active people
      prisma.person.findMany({
        orderBy: { statementCount: 'desc' },
        take: 10,
        select: {
          name: true,
          statementCount: true
        }
      }),

      // Most influential organizations
      prisma.organization.findMany({
        orderBy: { statementCount: 'desc' },
        take: 5,
        select: {
          name: true,
          statementCount: true
        }
      }),

      // Organizations with most controversies - placeholder
      Promise.resolve([]),

      // Most active organizations
      prisma.organization.findMany({
        orderBy: { statementCount: 'desc' },
        take: 5,
        select: {
          name: true,
          statementCount: true
        }
      })
    ])

    // Activity timeline (last 12 months)
    const activityTimeline = await prisma.$queryRaw`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "statementDate"), 'Mon YYYY') as month,
        COUNT(CASE WHEN "statementType" = 'STATEMENT' THEN 1 END) as statements,
        COUNT(CASE WHEN "statementType" = 'RESPONSE' THEN 1 END) as responses
      FROM "Statement"
      WHERE "statementDate" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "statementDate")
      ORDER BY DATE_TRUNC('month', "statementDate")
    `

    // Format the response
    const analyticsData = {
      // People analytics
      personsByProfession: personsByProfession.map(p => ({
        profession: p.primaryProfession?.replace(/_/g, ' ') || 'Unknown',
        count: p._count
      })),
      personsByNationality: personsByNationality.map(p => ({
        nationality: p.primaryNationality || 'Unknown',
        count: p._count
      })),
      personsByInfluence: personsByInfluence.map(p => ({
        level: p.influenceLevel || 'Unknown',
        count: p._count
      })),
      controversyDistribution: controversyData,
      socialMediaReach: socialMediaData,

      // Organization analytics
      orgsByType: orgsByType.map(o => ({
        type: o.orgType?.replace(/_/g, ' ') || 'Unknown',
        count: o._count
      })),
      orgsByPoliticalLeaning: [], // Placeholder - field not in schema yet
      orgsByStanceOnIsrael: [], // Placeholder - field not in schema yet
      fundingSourceDistribution: [], // Placeholder - field not in schema yet

      // Timeline
      activityTimeline,

      // Rankings
      mostInfluential: [
        ...mostInfluentialPeople.map(p => ({
          name: p.name,
          score: p.influenceScore || 0,
          type: 'Person'
        })),
        ...mostInfluentialOrgs.slice(0, 5).map(o => ({
          name: o.name,
          score: o.statementCount, // Using statement count as proxy for org influence
          type: 'Organization'
        }))
      ].sort((a, b) => b.score - a.score).slice(0, 10),

      mostControversial: [
        ...mostControversialPeople.map(p => ({
          name: p.name,
          score: p.controversyScore || 0,
          type: 'Person'
        })),
        ...(mostControversialOrgs as any[]).map(o => ({
          name: o.name,
          score: o.controversy_count * 20, // Scale controversy count
          type: 'Organization'
        }))
      ].sort((a, b) => b.score - a.score).slice(0, 10),

      mostActive: [
        ...mostActivePeople.map(p => ({
          name: p.name,
          count: p.statementCount,
          type: 'Person'
        })),
        ...mostActiveOrgs.map(o => ({
          name: o.name,
          count: o.statementCount,
          type: 'Organization'
        }))
      ].sort((a, b) => b.count - a.count).slice(0, 10)
    }

    res.status(200).json(analyticsData)
  } catch (error) {
    console.error('Analytics API error:', error)
    res.status(500).json({
      message: 'Failed to fetch analytics data',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    })
  } finally {
    await prisma.$disconnect()
  }
}