import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { getCaseHistory } from '@/lib/case-history'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { slug } = req.query

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Slug is required' })
  }

  try {
    if (req.method === 'GET') {
      // Get case by slug
      const caseData = await prisma.case.findUnique({
        where: { slug },
        select: { id: true }
      })

      if (!caseData) {
        return res.status(404).json({ error: 'Case not found' })
      }

      // Get history
      const history = await getCaseHistory(caseData.id)

      res.status(200).json({ history })
    } else {
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error: any) {
    console.error('Case history error:', error)
    res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
