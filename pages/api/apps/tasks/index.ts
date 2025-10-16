/**
 * Tasks API Endpoint
 * Handles CRUD operations for task management
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import type { Task } from '@/lib/apps/types'

const sampleTasks: Task[] = [
  {
    id: '1',
    name: 'Database Backup',
    description: 'Regular database backup to S3',
    type: 'scheduled',
    status: 'idle',
    schedule: '0 0 * * *',
    lastRun: new Date().toISOString(),
    nextRun: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Cache Clear',
    description: 'Manual cache clearing task',
    type: 'manual',
    status: 'running',
    lastRun: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(`[API] ${req.method} /api/apps/tasks`)

  try {
    switch (req.method) {
      case 'GET':
        console.log('✅ Returning', sampleTasks.length, 'tasks')
        return res.status(200).json({ status: 'ok', data: sampleTasks })

      case 'POST':
        const newTask: Task = {
          id: Date.now().toString(),
          ...req.body,
          status: 'idle',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        console.log('✅ Created new task:', newTask.name)
        return res.status(201).json({ status: 'ok', data: newTask })

      default:
        return res.status(405).json({ status: 'error', message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('❌ API Error:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}
