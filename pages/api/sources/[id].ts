import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid source ID' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const source = await prisma.source.findUnique({
      where: { id },
      include: {
        mediaOutlet: {
          select: {
            id: true,
            name: true,
            slug: true,
            country: true,
            website: true,
            type: true
          }
        },
        journalist: {
          select: {
            id: true,
            name: true,
            slug: true,
            nationality: true
          }
        },
        statement: {
          select: {
            id: true,
            text: true,
            slug: true,
            statementDate: true,
            person: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        case: {
          select: {
            id: true,
            title: true,
            slug: true,
            caseDate: true,
            summary: true
          }
        }
      }
    })

    if (!source) {
      return res.status(404).json({ error: 'Source not found' })
    }

    if (source.isDeleted) {
      return res.status(410).json({ error: 'Source has been deleted' })
    }

    return res.status(200).json({ source })
  } catch (error) {
    console.error('Error fetching source:', error)
    return res.status(500).json({ error: 'Failed to fetch source' })
  }
}
