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

  const { slug } = req.query

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Invalid slug parameter' })
  }

  try {
    // Fetch topic with all relations
    const topic = await prisma.topic.findUnique({
      where: { slug },
      include: {
        parentTopic: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        childTopics: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
          where: {
            isActive: true
          }
        },
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
          orderBy: {
            relevanceScore: 'desc'
          }
        },
        relationsFrom: {
          include: {
            toTopic: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        },
        _count: {
          select: {
            cases: true,
          }
        }
      }
    })

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' })
    }

    // Format related topics from relations
    const relatedTopics = topic.relationsFrom.map(rel => ({
      id: rel.toTopic.id,
      name: rel.toTopic.name,
      slug: rel.toTopic.slug,
      relationType: rel.relationType,
    }))

    // Clean up the response
    const { relationsFrom, ...topicData } = topic

    return res.status(200).json({
      topic: {
        ...topicData,
        relatedTopics
      }
    })

  } catch (error) {
    console.error('Topic detail API error:', error)
    return res.status(500).json({ error: 'Failed to fetch topic' })
  } finally {
    await prisma.$disconnect()
  }
}
