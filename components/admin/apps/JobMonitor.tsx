/**
 * JobMonitor Component
 * Monitor background jobs and queues
 * Redesigned to match admin design system
 */

import { useState } from 'react'

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
    <>
      {/* Stats Overview */}
      <div className="admin-section">
        <h2 className="admin-section-header">Overview</h2>
        <div className="admin-grid admin-grid-cols-4">
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-grey)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>⏳</div>
            <div className="admin-metric-value">{metrics.queued}</div>
            <div className="admin-metric-label">Queued</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-amber)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>⚡</div>
            <div className="admin-metric-value">{metrics.active}</div>
            <div className="admin-metric-label">Active</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-green)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>✓</div>
            <div className="admin-metric-value">{metrics.completed}</div>
            <div className="admin-metric-label">Completed</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-pink)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>❌</div>
            <div className="admin-metric-value">{metrics.failed}</div>
            <div className="admin-metric-label">Failed</div>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="admin-section">
        <h2 className="admin-section-header">Background Jobs</h2>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Queue</th>
                <th>Status</th>
                <th>Attempts</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td className="admin-font-semibold">{job.queue}</td>
                  <td>
                    <span className={`admin-badge ${
                      job.status === 'completed' ? 'admin-badge-success' :
                      job.status === 'active' ? 'admin-badge-warning' :
                      job.status === 'failed' ? 'admin-badge-error' :
                      'admin-badge-info'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="admin-text-sm">{job.attempts}/3</td>
                  <td className="admin-text-sm">
                    {new Date(job.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      {job.status === 'failed' && (
                        <button className="admin-btn admin-btn-primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
                          Retry
                        </button>
                      )}
                      <button className="admin-btn admin-btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
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
    </>
  )
}
