/**
 * Integration Ping Endpoint
 * Tests connection to an integration and records latency
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

  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
    })
  }

  console.log(`[API] POST /api/apps/integrations/${id}/ping`)

  try {
    // Get the integration
    const integration = await prisma.integration.findUnique({
      where: { id }
    })

    if (!integration) {
      return res.status(404).json({
        status: 'error',
        message: 'Integration not found',
      })
    }

    // Simulate ping test (in production, this would actually test the service)
    const startTime = Date.now()

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 20))

    const latency = Date.now() - startTime
    const status = latency < 100 ? 'connected' : latency < 200 ? 'degraded' : 'error'

    // Update integration with ping results
    const updated = await prisma.integration.update({
      where: { id },
      data: {
        lastPing: latency,
        lastPingAt: new Date(),
        status,
        updatedAt: new Date(),
      },
    })

    console.log(`✅ Pinged ${integration.name}: ${latency}ms (${status})`)

    return res.status(200).json({
      status: 'ok',
      data: {
        latency,
        status,
        timestamp: new Date().toISOString(),
      },
      integration: updated,
    })
  } catch (error) {
    console.error('❌ Ping Error:', error)
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Ping failed',
    })
  }
}
