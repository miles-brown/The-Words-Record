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
      publication,
      credibility,
      sourceType,
      verified,
      year,
      search,
      limit = '50',
      offset = '0',
      sortBy = 'publishDate',
      sortOrder = 'desc'
    } = req.query

    let where: any = {
      isDeleted: false
    }

    // Filter by publication
    if (publication && typeof publication === 'string') {
      where.publication = { contains: publication, mode: 'insensitive' }
    }

    // Filter by credibility
    if (credibility && typeof credibility === 'string') {
      where.credibility = credibility
    }

    // Filter by source type
    if (sourceType && typeof sourceType === 'string') {
      where.sourceType = sourceType
    }

    // Filter by verification status
    if (verified === 'true') {
      where.verificationStatus = 'VERIFIED'
    } else if (verified === 'false') {
      where.verificationStatus = { not: 'VERIFIED' }
    }

    // Filter by year
    if (year && typeof year === 'string') {
      const yearNum = parseInt(year)
      if (!isNaN(yearNum)) {
        const startOfYear = new Date(yearNum, 0, 1)
        const endOfYear = new Date(yearNum, 11, 31, 23, 59, 59)
        where.publishDate = {
          gte: startOfYear,
          lte: endOfYear
        }
      }
    }

    // Search in title, publication, author
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { publication: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Determine sort field
    const orderBy: any = {}
    const sortField = typeof sortBy === 'string' ? sortBy : 'publishDate'
    const order = sortOrder === 'asc' ? 'asc' : 'desc'
    orderBy[sortField] = order

    const sources = await prisma.source.findMany({
      where,
      orderBy,
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    })

    // Get total count for pagination
    const total = await prisma.source.count({ where })

    return res.status(200).json({
      sources,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: parseInt(offset as string) + sources.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching sources:', error)
    return res.status(500).json({ error: 'Failed to fetch sources' })
  }
}
