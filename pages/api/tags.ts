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
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { incidents: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return res.status(200).json({ tags })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return res.status(500).json({ error: 'Failed to fetch tags' })
  }
}
