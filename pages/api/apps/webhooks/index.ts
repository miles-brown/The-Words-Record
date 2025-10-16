/**
 * Webhooks API Endpoint
 * Handles CRUD operations for webhooks
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import type { Webhook } from '@/lib/apps/types'

const sampleWebhooks: Webhook[] = [
  {
    id: '1',
    direction: 'outgoing',
    name: 'Slack Notifications',
    url: 'https://hooks.slack.com/services/xxx',
    secretLast4: '...b5c8',
    enabled: true,
    lastStatus: '200',
    lastFired: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    direction: 'incoming',
    name: 'GitHub Events',
    url: 'https://api.who-said-what.com/webhooks/github',
    secretLast4: '...a3f4',
    enabled: true,
    lastStatus: '200',
    lastFired: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(`[API] ${req.method} /api/apps/webhooks`)

  try {
    switch (req.method) {
      case 'GET':
        console.log('✅ Returning', sampleWebhooks.length, 'webhooks')
        return res.status(200).json({
          status: 'ok',
          data: sampleWebhooks,
        })

      case 'POST':
        const newWebhook: Webhook = {
          id: Date.now().toString(),
          ...req.body,
          enabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        console.log('✅ Created new webhook:', newWebhook.name)
        return res.status(201).json({
          status: 'ok',
          data: newWebhook,
        })

      default:
        return res.status(405).json({ status: 'error', message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('❌ API Error:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}
