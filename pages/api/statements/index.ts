import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { CaseVisibility } from '@prisma/client'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'GET') {
        try {
            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 10
            const sortBy = req.query.sortBy as string || 'date-desc'
            const tag = req.query.tag as string
            const person = req.query.person as string
            const statusFilter = req.query.status as string
            const includeArchived = req.query.includeArchived === 'true'

            // Build filter conditions - only show statement pages (not multi-statement cases)
            const where: any = {
                isRealIncident: false,  // CRITICAL: Only show statement-only pages
                visibility: {
                    in: includeArchived
                        ? [CaseVisibility.PUBLIC, CaseVisibility.ARCHIVED]
                        : [CaseVisibility.PUBLIC]
                }
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
                case 'updated-desc':
                    orderBy = { updatedAt: 'desc' }
                    break
                case 'updated-asc':
                    orderBy = { updatedAt: 'asc' }
                    break
            }

            const skip = (page - 1) * limit

            // Fetch statements with their related data
            const [statements, total] = await Promise.all([
                prisma.case.findMany({
                    where,
                    orderBy,
                    skip,
                    take: limit,
                    include: {
                        tags: {
                            select: {
                                id: true,
                                name: true,
                                slug: true
                            }
                        },
                        people: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                profession: true,
                                imageUrl: true
                            }
                        },
                        organizations: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                type: true
                            }
                        },
                        originatingStatement: {
                            select: {
                                id: true,
                                content: true,
                                statementDate: true,
                                statementType: true,
                                person: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                        imageUrl: true
                                    }
                                },
                                organization: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true
                                    }
                                },
                                _count: {
                                    select: {
                                        responses: true
                                    }
                                }
                            }
                        },
                        _count: {
                            select: {
                                statements: true,
                                sources: true,
                                people: true,
                                organizations: true
                            }
                        }
                    }
                }),
                prisma.case.count({ where })
            ])

            const totalPages = Math.ceil(total / limit)

            res.status(200).json({
                cases: statements,  // Keep the key as "cases" for compatibility with frontend
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            })
        } catch (error) {
            console.error('Error fetching statements:', error)
            res.status(500).json({ error: 'Failed to fetch statements' })
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' })
    }
}
