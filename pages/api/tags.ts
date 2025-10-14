import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { TagCategory } from '@prisma/client'

/**
 * Enhanced Tags API
 *
 * Query Parameters:
 * - category: Filter by tag category (TOPIC, LOCATION, SENTIMENT, etc.)
 * - sort: Sort by 'name', 'usageCount', or 'controversyScore' (default: 'name')
 * - order: 'asc' or 'desc' (default: 'asc')
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50, max: 200)
 * - includeAliases: Include tag aliases (default: false)
 * - search: Search tag name or description
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      category,
      sort = 'name',
      order = 'asc',
      page = '1',
      limit = '50',
      includeAliases = 'false',
      search
    } = req.query

    // Parse and validate pagination
    const pageNum = Math.max(1, parseInt(page as string, 10))
    const limitNum = Math.min(200, Math.max(1, parseInt(limit as string, 10)))
    const skip = (pageNum - 1) * limitNum

    // Build where clause
    const where: any = {}

    // Filter by category
    if (category && typeof category === 'string') {
      // Validate category against enum
      if (Object.values(TagCategory).includes(category as TagCategory)) {
        where.category = category as TagCategory
      }
    }

    // Search functionality
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Build orderBy clause
    const validSortFields = ['name', 'usageCount', 'controversyScore', 'createdAt']
    const sortField = validSortFields.includes(sort as string) ? sort as string : 'name'
    const sortOrder = order === 'desc' ? 'desc' : 'asc'

    const orderBy: any = {}
    orderBy[sortField] = sortOrder

    // Execute queries in parallel
    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          _count: {
            select: {
              cases: true,
              aliases: true
            },
          },
          aliases: includeAliases === 'true' ? {
            select: {
              alias: true,
              aliasType: true,
              language: true
            }
          } : false,
        },
      }),
      prisma.tag.count({ where })
    ])

    return res.status(200).json({
      tags,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPreviousPage: pageNum > 1
      },
      filters: {
        category: category || null,
        sort: sortField,
        order: sortOrder,
        search: search || null
      }
    })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return res.status(500).json({
      error: 'Failed to fetch tags',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    })
  }
}
