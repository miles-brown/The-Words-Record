/**
 * Integrations API Endpoint
 * Handles CRUD operations for external service integrations
 */

import type { NextApiRequest, NextApiResponse} from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(`[API] ${req.method} /api/apps/integrations`)

  try {
    switch (req.method) {
      case 'GET': {
        // Return list of integrations
        const integrations = await prisma.integration.findMany({
          orderBy: {
            createdAt: 'desc'
          }
        })

        console.log('✅ Returning', integrations.length, 'integrations')
        return res.status(200).json({
          status: 'ok',
          data: integrations,
          count: integrations.length,
        })
      }

      case 'POST': {
        // Create new integration
        const { provider, name, description, config, logo } = req.body

        // Validate required fields
        if (!provider || !name) {
          return res.status(400).json({
            status: 'error',
            message: 'Provider and name are required',
          })
        }

        // Check if integration already exists
        const existing = await prisma.integration.findUnique({
          where: { provider }
        })

        if (existing) {
          return res.status(409).json({
            status: 'error',
            message: 'Integration with this provider already exists',
          })
        }

        const newIntegration = await prisma.integration.create({
          data: {
            provider,
            name,
            description,
            config: config || {},
            logo: logo || '🔌',
            status: 'connected',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })

        console.log('✅ Created new integration:', newIntegration.name)
        return res.status(201).json({
          status: 'ok',
          data: newIntegration,
        })
      }

      case 'DELETE': {
        // Delete all integrations (for testing/reset)
        const count = await prisma.integration.deleteMany({})
        console.log('✅ Deleted', count.count, 'integrations')
        return res.status(200).json({
          status: 'ok',
          message: `Deleted ${count.count} integrations`,
        })
      }

      default:
        return res.status(405).json({
          status: 'error',
          message: 'Method not allowed',
        })
    }
  } catch (error) {
    console.error('❌ API Error:', error)
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal server error',
    })
  }
}
