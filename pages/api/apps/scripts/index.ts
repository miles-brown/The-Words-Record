/**
 * Scripts API Endpoint
 * Handles CRUD operations for scheduled scripts
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import type { Script } from '@/lib/apps/types'

const sampleScripts: Script[] = [
  {
    id: '1',
    name: 'Daily Backup',
    description: 'Backup database to S3',
    schedule: '0 0 * * *',
    codeRef: 'scripts/backup.js',
    enabled: true,
    lastRunAt: new Date().toISOString(),
    lastRunStatus: 'ok',
    nextRunAt: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Cache Cleaner',
    description: 'Clear expired cache entries',
    schedule: '0 */6 * * *',
    codeRef: 'scripts/cache-clean.js',
    enabled: true,
    lastRunAt: new Date().toISOString(),
    lastRunStatus: 'ok',
    nextRunAt: new Date(Date.now() + 21600000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(`[API] ${req.method} /api/apps/scripts`)

  try {
    switch (req.method) {
      case 'GET':
        console.log('✅ Returning', sampleScripts.length, 'scripts')
        return res.status(200).json({ status: 'ok', data: sampleScripts })

      case 'POST':
        const newScript: Script = {
          id: Date.now().toString(),
          ...req.body,
          enabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        console.log('✅ Created new script:', newScript.name)
        return res.status(201).json({ status: 'ok', data: newScript })

      default:
        return res.status(405).json({ status: 'error', message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('❌ API Error:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}
