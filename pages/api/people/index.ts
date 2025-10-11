import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withNormalizedNationality } from '@/lib/mappers/person-nationality'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      page = '1',
      limit = '12',
      profession,
      nationality,
      organization,
      sortBy = 'name-asc'
    } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Build where clause for filters
    const where: any = {}

    if (profession) {
      where.profession = {
        contains: profession as string
      }
    }

    // Nationality filter: Now uses ISO codes directly from PersonNationality table
    if (nationality) {
      where.nationalities = {
        some: {
          countryCode: nationality as string,
          endDate: null // Only active nationalities
        }
      }
    }

    if (organization) {
      where.affiliations = {
        some: {
          organization: {
            name: {
              contains: organization as string
            }
          }
        }
      }
    }

    // Build orderBy clause for sorting
    let orderBy: any = {}

    switch (sortBy) {
      case 'name-asc':
        orderBy = { name: 'asc' }
        break
      case 'name-desc':
        orderBy = { name: 'desc' }
        break
      case 'surname-asc':
        // Sort by lastName field directly from database
        orderBy = { lastName: 'asc' }
        break
      case 'surname-desc':
        // Sort by lastName field directly from database
        orderBy = { lastName: 'desc' }
        break
      case 'birthdate-asc':
        orderBy = { birthDate: 'asc' }
        break
      case 'birthdate-desc':
        orderBy = { birthDate: 'desc' }
        break
      case 'statements-asc':
      case 'statements-desc':
        // Count-based sorting handled differently
        orderBy = { statements: { _count: sortBy === 'statements-asc' ? 'asc' : 'desc' } }
        break
      case 'responses-asc':
      case 'responses-desc':
        // Responses are now part of statements
        orderBy = { statements: { _count: sortBy === 'responses-asc' ? 'asc' : 'desc' } }
        break
      default:
        orderBy = { name: 'asc' }
    }

    // Get total count
    const total = await prisma.person.count({ where })

    // Fetch people with counts and nationality relations
    let people = await prisma.person.findMany({
      where,
      skip,
      take: limitNum,
      orderBy,
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
        },
        nationalities: {
          where: { endDate: null }, // Only active nationalities
          include: { country: true },
          orderBy: [
            { isPrimary: 'desc' },
            { displayOrder: 'asc' }
          ]
        }
      }
    })

    // Add response count and normalize nationality data
    const peopleWithResponseCount = people.map(person => {
      const responseCount = person.statements?.length || 0
      const { statements, ...personWithoutStatements } = person
      const normalized = withNormalizedNationality(personWithoutStatements)
      return {
        ...normalized,
        _count: {
          ...person._count,
          responses: responseCount
        }
      }
    })

    res.status(200).json({
      people: peopleWithResponseCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching people:', error)
    res.status(500).json({ error: 'Failed to fetch people' })
  }
}
