/**
 * API Keys Vault Endpoint
 * Handles CRUD operations for API key management
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import type { ApiKey } from '@/lib/apps/types'

const sampleKeys: ApiKey[] = [
  {
    id: '1',
    label: 'Production API',
    scope: 'api:production',
    last4: 'a3f4',
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
  },
  {
    id: '2',
    label: 'OpenAI Key',
    scope: 'integration:openai',
    last4: 'b5c8',
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
  },
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(`[API] ${req.method} /api/apps/keys`)

  try {
    switch (req.method) {
      case 'GET':
        console.log('✅ Returning', sampleKeys.length, 'API keys')
        return res.status(200).json({ status: 'ok', data: sampleKeys })

      case 'POST':
        const newKey: ApiKey = {
          id: Date.now().toString(),
          ...req.body,
          last4: req.body.secret?.slice(-4) || '****',
          enabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        console.log('✅ Created new API key:', newKey.label)
        return res.status(201).json({ status: 'ok', data: newKey })

      default:
        return res.status(405).json({ status: 'error', message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('❌ API Error:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}
