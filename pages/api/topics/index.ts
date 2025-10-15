import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      featured,
      developing,
      trending,
      highlighted,
      limit = '50',
      category
    } = req.query

    const limitNum = parseInt(limit as string)

    // Fetch different topic types based on query parameters
    let where: any = { isActive: true }

    if (featured === 'true') {
      where.isFeatured = true
    }

    if (highlighted === 'true') {
      where.controversyScore = { gt: 5 }
    }

    if (category) {
      where.topicType = category
    }

    // Fetch topics with case count
    const topics = await prisma.topic.findMany({
      where,
      include: {
        cases: {
          include: {
            Case: {
              select: {
                id: true,
                title: true,
                slug: true,
                caseDate: true,
                summary: true,
              }
            }
          }
        },
        _count: {
          select: {
            cases: true,
          }
        }
      },
      take: limitNum,
      orderBy: trending === 'true'
        ? { trendingScore: 'desc' }
        : { updatedAt: 'desc' }
    })

    // For developing stories - topics with recent start dates (last 30 days)
    if (developing === 'true') {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const developingTopics = await prisma.topic.findMany({
        where: {
          isActive: true,
          startDate: {
            gte: thirtyDaysAgo
          }
        },
        include: {
          cases: {
            include: {
              Case: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  caseDate: true,
                  summary: true,
                }
              }
            },
            take: 3,
            orderBy: {
              createdAt: 'desc'
            }
          },
          _count: {
            select: {
              cases: true,
            }
          }
        },
        take: 5,
        orderBy: {
          startDate: 'desc'
        }
      })

      return res.status(200).json({
        topics: developingTopics,
        count: developingTopics.length
      })
    }

    return res.status(200).json({
      topics,
      count: topics.length
    })

  } catch (error) {
    console.error('Topics API error:', error)
    return res.status(500).json({ error: 'Failed to fetch topics' })
  } finally {
    await prisma.$disconnect()
  }
}
