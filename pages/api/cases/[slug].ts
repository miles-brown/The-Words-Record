import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { slug } = req.query

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Slug is required' })
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get an incident by slug with all related data
        const caseItem = await prisma.case.findUnique({
          where: { slug },
          include: {
            persons: true,
            organizations: true,
            tags: true,
            statements: {
              include: {
                person: true,
                organization: true,
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
            _count: {
              select: {
                statements: true,
                sources: true
              }
            }
          }
        })

        if (!caseItem) {
          return res.status(404).json({ error: 'Case not found' })
        }

        // Collect all responses to this incident's statements
        const responses = caseItem.statements?.filter(s => s.statementType === 'RESPONSE') || []

        // Count responses
        const responseCount = responses.length

        // Add response count to _count and responses array
        const caseWithResponses = {
          ...caseItem,
          responses,
          _count: {
            ...caseItem._count,
            responses: responseCount
          }
        }

        res.status(200).json(caseWithResponses)
        break

      case 'PUT':
        // Update an incident
        const {
          title,
          summary,
          description,
          caseDate,
          status,
          severity,
          locationCity,
          locationState,
          locationCountry,
          locationDetail,
          personIds,
          organizationIds,
          tagIds
        } = req.body

        const updateData: any = {
          title,
          summary,
          description,
          status,
          severity,
          locationCity,
          locationState,
          locationCountry,
          locationDetail
        }

        if (caseDate) {
          updateData.caseDate = new Date(caseDate)
        }

        // Update relationships if provided
        if (personIds) {
          updateData.persons = {
            set: personIds.map((id: string) => ({ id }))
          }
        }
        if (organizationIds) {
          updateData.organizations = {
            set: organizationIds.map((id: string) => ({ id }))
          }
        }
        if (tagIds) {
          updateData.tags = {
            set: tagIds.map((id: string) => ({ id }))
          }
        }

        const updatedIncident = await prisma.case.update({
          where: { slug },
          data: updateData,
          include: {
            persons: true,
            organizations: true,
            tags: true
          }
        })

        res.status(200).json(updatedIncident)
        break

      case 'DELETE':
        // Delete an incident
        await prisma.case.delete({
          where: { slug }
        })

        res.status(204).end()
        break

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}