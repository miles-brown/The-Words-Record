/**
 * Automations API Endpoint
 * Handles CRUD operations for automation workflows
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import type { Automation } from '@/lib/apps/types'

const sampleAutomations: Automation[] = [
  {
    id: '1',
    name: 'New User Welcome',
    description: 'Send welcome email to new users',
    trigger: 'event:user.created',
    enabled: true,
    lastRun: new Date().toISOString(),
    lastStatus: 'ok',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Daily Report',
    description: 'Generate and send daily analytics report',
    trigger: 'cron:0 9 * * *',
    enabled: true,
    lastRun: new Date().toISOString(),
    lastStatus: 'ok',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(`[API] ${req.method} /api/apps/automations`)

  try {
    switch (req.method) {
      case 'GET':
        console.log('✅ Returning', sampleAutomations.length, 'automations')
        return res.status(200).json({ status: 'ok', data: sampleAutomations })

      case 'POST':
        const newAutomation: Automation = {
          id: Date.now().toString(),
          ...req.body,
          enabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        console.log('✅ Created new automation:', newAutomation.name)
        return res.status(201).json({ status: 'ok', data: newAutomation })

      default:
        return res.status(405).json({ status: 'error', message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('❌ API Error:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}
