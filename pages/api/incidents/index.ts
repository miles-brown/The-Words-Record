import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        // Get all incidents with filters and pagination
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const skip = (page - 1) * limit
        const statusFilter = req.query.status as string
        const tag = req.query.tag as string
        const person = req.query.person as string
        const sortBy = req.query.sortBy as string || 'date-desc'

        // Build filter conditions
        const where: any = {}
        if (statusFilter) where.status = statusFilter
        if (tag) {
          where.tags = {
            some: {
              slug: tag
            }
          }
        }
        if (person) {
          where.persons = {
            some: {
              slug: person
            }
          }
        }

        // Build orderBy based on sortBy parameter
        let orderBy: any = { incidentDate: 'desc' }
        switch (sortBy) {
          case 'date-asc':
            orderBy = { incidentDate: 'asc' }
            break
          case 'date-desc':
            orderBy = { incidentDate: 'desc' }
            break
          case 'title-asc':
            orderBy = { title: 'asc' }
            break
          case 'title-desc':
            orderBy = { title: 'desc' }
            break
        }

        const [incidents, total] = await Promise.all([
          prisma.incident.findMany({
            where,
            skip,
            take: limit,
            include: {
              persons: true,
              organizations: true,
              tags: true,
              _count: {
                select: {
                  statements: true,
                  sources: true
                }
              },
              statements: {
                where: { statementType: 'RESPONSE' },
                select: { id: true }
              }
            },
            orderBy
          }),
          prisma.incident.count({ where })
        ])

        // Add response count to _count object for each incident
        const incidentsWithResponseCount = incidents.map(incident => {
          const responseCount = incident.statements?.length || 0
          const { statements, ...incidentWithoutStatements } = incident
          return {
            ...incidentWithoutStatements,
            _count: {
              ...incident._count,
              responses: responseCount
            }
          }
        })

        res.status(200).json({
          incidents: incidentsWithResponseCount,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        })
        break

      case 'POST':
        // Create a new incident
        const {
          title,
          slug,
          summary,
          description,
          incidentDate,
          status,
          severity,
          locationCity,
          locationState,
          locationCountry,
          locationDetail,
          personIds = [],
          organizationIds = [],
          tagIds = []
        } = req.body

        if (!title || !slug || !summary || !description || !incidentDate) {
          return res.status(400).json({ 
            error: 'Title, slug, summary, description, and incident date are required' 
          })
        }

        const incident = await prisma.incident.create({
          data: {
            title,
            slug,
            summary,
            description,
            incidentDate: new Date(incidentDate),
            status: status || 'DOCUMENTED',
            severity,
            locationCity,
            locationState,
            locationCountry,
            locationDetail,
            persons: {
              connect: personIds.map((id: string) => ({ id }))
            },
            organizations: {
              connect: organizationIds.map((id: string) => ({ id }))
            },
            tags: {
              connect: tagIds.map((id: string) => ({ id }))
            }
          },
          include: {
            persons: true,
            organizations: true,
            tags: true
          }
        })

        res.status(201).json(incident)
        break

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}