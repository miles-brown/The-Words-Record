/**
 * TaskManager Component
 * Manage background tasks
 * Redesigned to match admin design system
 */

import { useState } from 'react'

interface Task {
  id: string
  name: string
  type: 'scheduled' | 'manual'
  status: 'idle' | 'running' | 'paused'
  lastRun?: string
  nextRun?: string
}

export default function TaskManager() {
  const [tasks] = useState<Task[]>([
    { id: '1', name: 'Database Backup', type: 'scheduled', status: 'idle', lastRun: '2024-01-15T00:00:00Z', nextRun: '2024-01-16T00:00:00Z' },
    { id: '2', name: 'Cache Clear', type: 'manual', status: 'running', lastRun: '2024-01-15T10:00:00Z' },
    { id: '3', name: 'Report Generation', type: 'scheduled', status: 'paused', lastRun: '2024-01-14T09:00:00Z', nextRun: '2024-01-21T09:00:00Z' }
  ])

  const stats = {
    total: tasks.length,
    scheduled: tasks.filter(t => t.type === 'scheduled').length,
    running: tasks.filter(t => t.status === 'running').length,
    paused: tasks.filter(t => t.status === 'paused').length
  }

  return (
    <>
      {/* Stats Overview */}
      <div className="admin-section">
        <h2 className="admin-section-header">Overview</h2>
        <div className="admin-grid admin-grid-cols-4">
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-blue)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>📋</div>
            <div className="admin-metric-value">{stats.total}</div>
            <div className="admin-metric-label">Total Tasks</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-purple)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>📅</div>
            <div className="admin-metric-value">{stats.scheduled}</div>
            <div className="admin-metric-label">Scheduled</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-green)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>▶️</div>
            <div className="admin-metric-value">{stats.running}</div>
            <div className="admin-metric-label">Running</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-amber)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>⏸️</div>
            <div className="admin-metric-value">{stats.paused}</div>
            <div className="admin-metric-label">Paused</div>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="admin-section">
        <div className="admin-flex-between admin-mb-4">
          <h2 className="admin-section-header" style={{ margin: 0 }}>Tasks</h2>
          <button className="admin-btn admin-btn-primary">
            + New Task
          </button>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Last Run</th>
                <th>Next Run</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td className="admin-font-semibold">{task.name}</td>
                  <td>
                    <span className="admin-badge admin-badge-info">
                      {task.type}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${
                      task.status === 'running' ? 'admin-badge-warning' :
                      task.status === 'paused' ? 'admin-badge-info' :
                      'admin-badge-success'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="admin-text-sm">
                    {task.lastRun ? new Date(task.lastRun).toLocaleString() : '-'}
                  </td>
                  <td className="admin-text-sm">
                    {task.nextRun ? new Date(task.nextRun).toLocaleString() : '-'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button className="admin-btn admin-btn-primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
                        {task.status === 'paused' ? 'Resume' : task.status === 'running' ? 'Pause' : 'Run'}
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
