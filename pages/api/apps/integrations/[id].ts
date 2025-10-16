/**
 * Integration API Endpoint - Single Integration
 * Handles operations on individual integrations
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid integration ID',
    })
  }

  console.log(`[API] ${req.method} /api/apps/integrations/${id}`)

  try {
    switch (req.method) {
      case 'GET': {
        // Get single integration
        const integration = await prisma.integration.findUnique({
          where: { id }
        })

        if (!integration) {
          return res.status(404).json({
            status: 'error',
            message: 'Integration not found',
          })
        }

        return res.status(200).json({
          status: 'ok',
          data: integration,
        })
      }

      case 'PUT':
      case 'PATCH': {
        // Update integration
        const { name, description, config, status, logo } = req.body

        const updated = await prisma.integration.update({
          where: { id },
          data: {
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(config && { config }),
            ...(status && { status }),
            ...(logo && { logo }),
            updatedAt: new Date(),
          },
        })

        console.log('✅ Updated integration:', updated.name)
        return res.status(200).json({
          status: 'ok',
          data: updated,
        })
      }

      case 'DELETE': {
        // Delete integration
        await prisma.integration.delete({
          where: { id }
        })

        console.log('✅ Deleted integration:', id)
        return res.status(200).json({
          status: 'ok',
          message: 'Integration deleted',
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

    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          status: 'error',
          message: 'Integration not found',
        })
      }
    }

    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal server error',
    })
  }
}
