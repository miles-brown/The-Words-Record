import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // TODO: Add authentication check here
  // For now, allowing access for development

  if (req.method === 'GET') {
    return handleGet(req, res)
  }

  if (req.method === 'POST') {
    return handlePost(req, res)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { limit = '50', offset = '0' } = req.query

    const statements = await prisma.statement.findMany({
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      include: {
        person: {
          select: {
            name: true,
            slug: true
          }
        },
        organization: {
          select: {
            name: true,
            slug: true
          }
        },
        case: {
          select: {
            title: true,
            slug: true
          }
        },
        respondsTo: {
          select: {
            id: true,
            content: true,
            person: {
              select: {
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            responses: true
          }
        }
      },
      orderBy: {
        statementDate: 'desc'
      }
    })

    const total = await prisma.statement.count()

    res.status(200).json({
      statements,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    })
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      content,
      context,
      statementDate,
      statementType,
      respondsToId,
      personId,
      organizationId,
      caseId
    } = req.body

    if (!content || !statementDate) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // If it's a response statement, validate respondsToId
    if (statementType === 'RESPONSE' && !respondsToId) {
      return res.status(400).json({ error: 'Response statements must specify respondsToId' })
    }

    const statement = await prisma.statement.create({
      data: {
        content,
        context,
        statementDate: new Date(statementDate),
        statementType: statementType || 'ORIGINAL',
        respondsToId: respondsToId || null,
        personId: personId || null,
        organizationId: organizationId || null,
        caseId: caseId || null
      },
      include: {
        person: true,
        organization: true,
        case: true,
        respondsTo: true
      }
    })

    res.status(201).json({ statement })
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
