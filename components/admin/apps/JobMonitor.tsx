import { useState, useEffect } from 'react'

interface Job {
  id: string
  queue: string
  status: 'queued' | 'active' | 'completed' | 'failed' | 'delayed'
  attempts: number
  payload: any
  error?: string
  createdAt: string
  completedAt?: string
}

export default function JobMonitor() {
  const [jobs] = useState<Job[]>([
    {
      id: '1',
      queue: 'emails',
      status: 'completed',
      attempts: 1,
      payload: { to: 'user@example.com', subject: 'Welcome' },
      createdAt: '2024-01-15T10:00:00Z',
      completedAt: '2024-01-15T10:00:05Z'
    },
    {
      id: '2',
      queue: 'images',
      status: 'active',
      attempts: 1,
      payload: { file: 'upload.jpg', resize: [800, 600] },
      createdAt: '2024-01-15T10:05:00Z'
    },
    {
      id: '3',
      queue: 'sync',
      status: 'failed',
      attempts: 3,
      payload: { source: 'api', target: 'database' },
      error: 'Connection timeout',
      createdAt: '2024-01-15T09:00:00Z'
    }
  ])

  const metrics = {
    queued: jobs.filter(j => j.status === 'queued').length,
    active: jobs.filter(j => j.status === 'active').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Background Job Monitor</h2>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Queued</p>
          <p className="text-2xl font-bold text-white">{metrics.queued}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Active</p>
          <p className="text-2xl font-bold text-yellow-400">{metrics.active}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Completed</p>
          <p className="text-2xl font-bold text-green-400">{metrics.completed}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">Failed</p>
          <p className="text-2xl font-bold text-red-400">{metrics.failed}</p>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Queue</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Attempts</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Created</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="py-3 px-6 text-white">{job.queue}</td>
                <td className="py-3 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    job.status === 'completed' ? 'bg-green-900/50 text-green-400' :
                    job.status === 'active' ? 'bg-yellow-900/50 text-yellow-400' :
                    job.status === 'failed' ? 'bg-red-900/50 text-red-400' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="py-3 px-6 text-gray-300">{job.attempts}/3</td>
                <td className="py-3 px-6 text-gray-400 text-sm">
                  {new Date(job.createdAt).toLocaleString()}
                </td>
                <td className="py-3 px-6">
                  <div className="flex justify-end gap-2">
                    {job.status === 'failed' && (
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">
                        Retry
                      </button>
                    )}
                    <button className="px-3 py-1 bg-gray-700 text-white rounded-md text-sm">
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}