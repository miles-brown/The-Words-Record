import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        // Get all persons with pagination
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const skip = (page - 1) * limit

        const [persons, total] = await Promise.all([
          prisma.person.findMany({
            skip,
            take: limit,
            include: {
              _count: {
                select: {
                  incidents: true,
                  statements: true,
                  responses: true
                }
              }
            },
            orderBy: {
              name: 'asc'
            }
          }),
          prisma.person.count()
        ])

        res.status(200).json({
          persons,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        })
        break

      case 'POST':
        // Create a new person
        const { name, slug, bio, imageUrl, profession, nationality, birthDate, deathDate } = req.body

        if (!name || !slug) {
          return res.status(400).json({ error: 'Name and slug are required' })
        }

        const person = await prisma.person.create({
          data: {
            name,
            slug,
            bio,
            imageUrl,
            profession,
            nationality,
            birthDate: birthDate ? new Date(birthDate) : null,
            deathDate: deathDate ? new Date(deathDate) : null
          }
        })

        res.status(201).json(person)
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