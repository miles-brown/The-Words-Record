/**
 * Jobs API Endpoint
 * Handles operations for background job queue
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import type { Job, JobMetrics } from '@/lib/apps/types'

const sampleJobs: Job[] = [
  {
    id: '1',
    queue: 'emails',
    status: 'completed',
    attempts: 1,
    maxAttempts: 3,
    payload: { to: 'user@example.com', subject: 'Welcome' },
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: '2',
    queue: 'images',
    status: 'active',
    attempts: 1,
    maxAttempts: 3,
    payload: { file: 'upload.jpg', resize: [800, 600] },
    createdAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
  },
  {
    id: '3',
    queue: 'sync',
    status: 'failed',
    attempts: 3,
    maxAttempts: 3,
    payload: { source: 'api', target: 'database' },
    error: 'Connection timeout',
    createdAt: new Date().toISOString(),
    failedAt: new Date().toISOString(),
  },
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(`[API] ${req.method} /api/apps/jobs`)

  try {
    switch (req.method) {
      case 'GET':
        const metrics: JobMetrics = {
          queued: sampleJobs.filter(j => j.status === 'queued').length,
          active: sampleJobs.filter(j => j.status === 'active').length,
          completed: sampleJobs.filter(j => j.status === 'completed').length,
          failed: sampleJobs.filter(j => j.status === 'failed').length,
          delayed: sampleJobs.filter(j => j.status === 'delayed').length,
        }
        console.log('✅ Returning', sampleJobs.length, 'jobs with metrics')
        return res.status(200).json({ status: 'ok', data: sampleJobs, metrics })

      default:
        return res.status(405).json({ status: 'error', message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('❌ API Error:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}
