import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        // Get all organizations with pagination and filters
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 12
        const skip = (page - 1) * limit
        const typeFilter = req.query.type as string

        // Build filter conditions
        const where: any = {}
        if (typeFilter) where.type = typeFilter

        const [organizations, total] = await Promise.all([
          prisma.organization.findMany({
            where,
            skip,
            take: limit,
            include: {
              _count: {
                select: {
                  cases: true,
                  statements: true
                }
              },
              statements: {
                where: { statementType: 'RESPONSE' },
                select: { id: true }
              }
            },
            orderBy: {
              name: 'asc'
            }
          }),
          prisma.organization.count({ where })
        ])

        // Add response count to _count object for each organization
        const organizationsWithResponseCount = organizations.map(org => {
          const responseCount = org.statements?.length || 0
          const { statements, ...orgWithoutStatements } = org
          return {
            ...orgWithoutStatements,
            _count: {
              ...org._count,
              responses: responseCount
            }
          }
        })

        res.status(200).json({
          organizations: organizationsWithResponseCount,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        })
        break

      case 'POST':
        // Create a new organization
        const { name, slug, type, description, website, founded, headquarters } = req.body

        if (!name || !slug || !type) {
          return res.status(400).json({ error: 'Name, slug, and type are required' })
        }

        const organization = await prisma.organization.create({
          data: {
            name,
            slug,
            type,
            description,
            website,
            founded: founded ? new Date(founded) : null,
            headquarters
          }
        })

        res.status(201).json(organization)
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