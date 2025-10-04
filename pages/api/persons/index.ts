import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

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
        contains: profession as string,
        mode: 'insensitive'
      }
    }

    if (nationality) {
      where.nationality = {
        contains: nationality as string,
        mode: 'insensitive'
      }
    }

    if (organization) {
      where.affiliations = {
        some: {
          organization: {
            name: {
              contains: organization as string,
              mode: 'insensitive'
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
      case 'surname-desc':
        // For surname sorting, we'll need to sort in the application layer
        orderBy = { name: sortBy === 'surname-asc' ? 'asc' : 'desc' }
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
        orderBy = { responses: { _count: sortBy === 'responses-asc' ? 'asc' : 'desc' } }
        break
      default:
        orderBy = { name: 'asc' }
    }

    // Get total count
    const total = await prisma.person.count({ where })

    // Fetch persons with counts
    let persons = await prisma.person.findMany({
      where,
      skip,
      take: limitNum,
      orderBy,
      include: {
        _count: {
          select: {
            incidents: true,
            statements: true,
            responses: true
          }
        }
      }
    })

    // Handle surname sorting in application layer
    if (sortBy === 'surname-asc' || sortBy === 'surname-desc') {
      persons = persons.sort((a, b) => {
        const getSurname = (name: string) => name.split(' ').pop() || name
        const surnameA = getSurname(a.name)
        const surnameB = getSurname(b.name)

        if (sortBy === 'surname-asc') {
          return surnameA.localeCompare(surnameB)
        } else {
          return surnameB.localeCompare(surnameA)
        }
      })
    }

    res.status(200).json({
      persons,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching persons:', error)
    res.status(500).json({ error: 'Failed to fetch persons' })
  }
}
