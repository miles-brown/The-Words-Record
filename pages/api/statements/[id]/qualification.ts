import type { NextApiRequest, NextApiResponse } from 'next'
import { calculateQualificationScore } from '@/lib/case-qualification'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Statement ID is required' })
  }

  try {
    if (req.method === 'GET') {
      const criteria = await calculateQualificationScore(id)
      res.status(200).json(criteria)
    } else {
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error: any) {
    console.error('Qualification check error:', error)
    res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
