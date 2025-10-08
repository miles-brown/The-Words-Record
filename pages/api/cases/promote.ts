import type { NextApiRequest, NextApiResponse } from 'next'
import {
  calculateQualificationScore,
  getQualifiedStatements,
  promoteStatementToCase
} from '@/lib/case-qualification'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        // Get statements that qualify for promotion
        const limit = parseInt(req.query.limit as string) || 50
        const qualified = await getQualifiedStatements(limit)

        res.status(200).json({
          qualified: qualified.map(q => ({
            statement: {
              id: q.statement.id,
              content: q.statement.content.substring(0, 200),
              person: q.statement.person,
              statementDate: q.statement.statementDate,
            },
            criteria: q.criteria
          }))
        })
        break

      case 'POST':
        // Promote a statement to a case
        const { statementId, promotedBy, promotionReason, isManualOverride } = req.body

        if (!statementId) {
          return res.status(400).json({ error: 'Statement ID is required' })
        }

        if (!promotedBy) {
          return res.status(400).json({ error: 'Promoted by (user) is required' })
        }

        const newCase = await promoteStatementToCase(
          statementId,
          promotedBy,
          promotionReason,
          isManualOverride
        )

        res.status(201).json({ case: newCase })
        break

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error: any) {
    console.error('Case promotion error:', error)
    res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
