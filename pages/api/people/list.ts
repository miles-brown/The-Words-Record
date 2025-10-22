import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const people = await prisma.person.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return res.status(200).json(people)
  } catch (error) {
    console.error('Error fetching people:', error)
    return res.status(500).json({ error: 'Failed to fetch people' })
  }
}
