import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Fetch people analytics
    const [
      peopleByProfession,
      peopleByNationality,
      peopleByInfluence,
      controversyData,
      socialMediaData,
      orgsByType,
      orgsByRegion,
      casesByCountry,
      statementVelocity,
      mostInfluentialPeople,
      mostControversialPeople,
      mostActivePeople,
      mostInfluentialOrgs,
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

      // People by nationality - using cached nationality field
      prisma.person.groupBy({
        by: ['nationality_primary_code'],
        _count: true,
        where: { nationality_primary_code: { not: null } },
        orderBy: { _count: { nationality_primary_code: 'desc' } },
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

      // Organizations by region (based on statements)
      prisma.$queryRaw`
        SELECT
          COALESCE(o."locationCountry", 'Unknown') as region,
          COUNT(DISTINCT o.id) as count
        FROM "Organization" o
        GROUP BY o."locationCountry"
        ORDER BY count DESC
        LIMIT 10
      `,

      // Case distribution by country
      prisma.$queryRaw`
        SELECT
          COALESCE("locationCountry", 'Unknown') as country,
          COUNT(*) as count
        FROM "Case"
        WHERE "locationCountry" IS NOT NULL
        GROUP BY "locationCountry"
        ORDER BY count DESC
        LIMIT 10
      `,

      // Statement velocity (last 30 days)
      prisma.$queryRaw`
        SELECT
          DATE("statementDate") as date,
          COUNT(*) as count
        FROM "Statement"
        WHERE "statementDate" >= NOW() - INTERVAL '30 days'
        GROUP BY DATE("statementDate")
        ORDER BY date DESC
      `,

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
        COUNT(CASE WHEN "statementType" = 'ORIGINAL' THEN 1 END) as statements,
        COUNT(CASE WHEN "statementType" = 'RESPONSE' THEN 1 END) as responses
      FROM "Statement"
      WHERE "statementDate" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "statementDate")
      ORDER BY DATE_TRUNC('month', "statementDate")
    `

    // Enhanced Metrics - Response & Verification Rates
    const [statementStats, verificationStats, caseStats] = await Promise.all([
      // Statement response ratio
      prisma.$queryRaw<Array<{ total: bigint; with_responses: bigint }>>`
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN EXISTS (
            SELECT 1 FROM "Statement" s2 WHERE s2."respondsToId" = s1.id
          ) THEN 1 END) as with_responses
        FROM "Statement" s1
        WHERE s1."statementType" = 'ORIGINAL'
      `,

      // Verification rate
      prisma.$queryRaw<Array<{ total: bigint; verified: bigint; unverified: bigint }>>`
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN "isVerified" = true THEN 1 END) as verified,
          COUNT(CASE WHEN "isVerified" = false THEN 1 END) as unverified
        FROM "Statement"
      `,

      // Case statistics
      prisma.$queryRaw<Array<{ total: bigint; real_cases: bigint; promoted: bigint }>>`
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN "isRealIncident" = true THEN 1 END) as real_cases,
          COUNT(CASE WHEN "wasManuallyPromoted" = true THEN 1 END) as promoted
        FROM "Case"
      `
    ])

    // Top media outlets
    const topMediaOutlets = await prisma.$queryRaw<Array<{ publication: string; count: bigint }>>`
      SELECT
        publication,
        COUNT(*) as count
      FROM "Source"
      WHERE publication IS NOT NULL AND publication != ''
      GROUP BY publication
      ORDER BY count DESC
      LIMIT 10
    `

    // Format the response
    const analyticsData = {
      // People analytics
      peopleByProfession: peopleByProfession.map(p => ({
        profession: p.primaryProfession?.replace(/_/g, ' ') || 'Unknown',
        count: p._count
      })),
      peopleByNationality: peopleByNationality.map(p => ({
        nationality: p.nationality_primary_code || 'Unknown',
        count: p._count
      })),
      peopleByInfluence: peopleByInfluence.map(p => ({
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
      orgsByRegion: orgsByRegion,
      casesByCountry: casesByCountry,

      // Timeline & Velocity
      activityTimeline,
      statementVelocity: statementVelocity,

      // Enhanced Metrics
      responseRate: {
        total: Number(statementStats[0]?.total || 0),
        withResponses: Number(statementStats[0]?.with_responses || 0),
        percentage: statementStats[0]
          ? Math.round((Number(statementStats[0].with_responses) / Number(statementStats[0].total)) * 100)
          : 0
      },
      verificationRate: {
        total: Number(verificationStats[0]?.total || 0),
        verified: Number(verificationStats[0]?.verified || 0),
        unverified: Number(verificationStats[0]?.unverified || 0),
        percentage: verificationStats[0]
          ? Math.round((Number(verificationStats[0].verified) / Number(verificationStats[0].total)) * 100)
          : 0
      },
      caseStatistics: {
        total: Number(caseStats[0]?.total || 0),
        realCases: Number(caseStats[0]?.real_cases || 0),
        promotedStatements: Number(caseStats[0]?.promoted || 0)
      },
      topMediaOutlets: topMediaOutlets.map(m => ({
        publication: m.publication,
        count: Number(m.count)
      })),

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

      mostControversial: mostControversialPeople.map(p => ({
        name: p.name,
        score: p.controversyScore || 0,
        type: 'Person'
      })),

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
  }
}