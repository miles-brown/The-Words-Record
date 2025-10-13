import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { slug } = req.query

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Invalid slug parameter' })
  }

  try {
    const caseItem = await prisma.case.findUnique({
      where: {
        slug: slug,
        // Only return real incidents (multi-statement cases)
        isRealIncident: true
      },
      include: {
        people: true,
        organizations: true,
        tags: true,
        statements: {
          include: {
            person: true,
            sources: true,
            responses: {
              include: {
                person: true,
                organization: true
              }
            }
          },
          orderBy: {
            statementDate: 'desc'
          }
        },
        sources: {
          orderBy: {
            publishDate: 'desc'
          }
        },
        repercussions: {
          include: {
            affectedPerson: {
              select: {
                id: true,
                name: true,
                slug: true,
                profession: true,
                imageUrl: true
              }
            },
            affectedOrganization: {
              select: {
                id: true,
                name: true,
                slug: true,
                type: true
              }
            },
            responseStatement: {
              select: {
                id: true,
                content: true,
                statementDate: true,
                person: {
                  select: {
                    name: true,
                    slug: true
                  }
                }
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        },
        _count: {
          select: {
            statements: true,
            sources: true,
            people: true,
            organizations: true,
            repercussions: true
          }
        }
      }
    })

    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' })
    }

    // Fetch related cases based on shared tags or people
    const relatedCases = (caseItem.tags?.length > 0 || caseItem.people?.length > 0)
      ? await prisma.case.findMany({
          where: {
            AND: [
              { id: { not: caseItem.id } },
              { isRealIncident: true }, // Only show real incidents
              {
                OR: [
                  ...(caseItem.tags?.length > 0 ? [{
                    tags: {
                      some: {
                        id: { in: caseItem.tags.map(t => t.id) }
                      }
                    }
                  }] : []),
                  ...(caseItem.people?.length > 0 ? [{
                    people: {
                      some: {
                        id: { in: caseItem.people.map(p => p.id) }
                      }
                    }
                  }] : [])
                ]
              }
            ]
          },
          select: {
            id: true,
            slug: true,
            title: true,
            summary: true,
            caseDate: true,
            status: true,
            severity: true
          },
          orderBy: {
            caseDate: 'desc'
          },
          take: 3
        })
      : []

    res.status(200).json({
      ...caseItem,
      relatedCases
    })
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
