import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { CaseVisibility } from '@prisma/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        // Get all cases with filters and pagination
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const skip = (page - 1) * limit
        const statusFilter = req.query.status as string
        const tag = req.query.tag as string
        const person = req.query.person as string
        const sortBy = req.query.sortBy as string || 'date-desc'
        const includeArchived = req.query.includeArchived === 'true'
        const featuredOnly = req.query.featured === 'true'

        // Build filter conditions - only show real incidents (not statement pages)
        const where: any = {
          isRealIncident: true,  // CRITICAL: Only show multi-statement cases
          visibility: {
            in: includeArchived
              ? [CaseVisibility.PUBLIC, CaseVisibility.ARCHIVED]
              : [CaseVisibility.PUBLIC]
          }
        }

        if (featuredOnly) {
          where.isFeatured = true
        }

        if (statusFilter) where.status = statusFilter
        if (tag) {
          where.tags = {
            some: {
              slug: tag
            }
          }
        }
        if (person) {
          where.people = {
            some: {
              slug: person
            }
          }
        }

        // Build orderBy based on sortBy parameter
        let orderBy: any = { caseDate: 'desc' }
        switch (sortBy) {
          case 'date-asc':
            orderBy = { caseDate: 'asc' }
            break
          case 'date-desc':
            orderBy = { caseDate: 'desc' }
            break
          case 'title-asc':
            orderBy = { title: 'asc' }
            break
          case 'title-desc':
            orderBy = { title: 'desc' }
            break
        }

        const [cases, total] = await Promise.all([
          prisma.case.findMany({
            where,
            skip,
            take: limit,
            include: {
              people: true,
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
          prisma.case.count({ where })
        ])

        // Add response count to _count object for each case
        const casesWithResponseCount = cases.map(caseItem => {
          const responseCount = caseItem.statements?.length || 0
          const { statements, ...caseWithoutStatements } = caseItem
          return {
            ...caseWithoutStatements,
            _count: {
              ...caseItem._count,
              responses: responseCount
            }
          }
        })

        res.status(200).json({
          cases: casesWithResponseCount,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        })
        break

      case 'POST':
        // Create a new case
        const {
          title,
          slug,
          summary,
          description,
          caseDate,
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

        if (!title || !slug || !summary || !description || !caseDate) {
          return res.status(400).json({
            error: 'Title, slug, summary, description, and case date are required'
          })
        }

        const newCase = await prisma.case.create({
          data: {
            title,
            slug,
            summary,
            description,
            caseDate: new Date(caseDate),
            status: status || 'DOCUMENTED',
            severity,
            locationCity,
            locationState,
            locationCountry,
            locationDetail,
            people: {
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
            people: true,
            organizations: true,
            tags: true
          }
        })

        res.status(201).json(newCase)
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