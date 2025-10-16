/**
 * ScriptManager Component
 * Manages scheduled scripts and code execution
 * Redesigned to match admin design system
 */

import { useState, useEffect } from 'react'

interface Script {
  id: string
  name: string
  description?: string
  schedule?: string
  codeRef: string
  enabled: boolean
  lastRunAt?: string
  lastRunStatus?: 'ok' | 'error'
  nextRunAt?: string
  createdAt: string
  updatedAt: string
}

export default function ScriptManager() {
  const [scripts, setScripts] = useState<Script[]>([
    {
      id: '1',
      name: 'Daily Backup',
      description: 'Backup database to S3',
      schedule: '0 0 * * *',
      codeRef: 'scripts/backup.js',
      enabled: true,
      lastRunAt: '2024-01-15T00:00:00Z',
      lastRunStatus: 'ok',
      nextRunAt: '2024-01-16T00:00:00Z',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Cache Cleaner',
      description: 'Clear expired cache entries',
      schedule: '0 */6 * * *',
      codeRef: 'scripts/cache-clean.js',
      enabled: true,
      lastRunAt: '2024-01-15T06:00:00Z',
      lastRunStatus: 'ok',
      nextRunAt: '2024-01-15T12:00:00Z',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '3',
      name: 'Report Generator',
      description: 'Generate weekly reports',
      schedule: '0 9 * * MON',
      codeRef: 'scripts/reports.js',
      enabled: false,
      lastRunAt: '2024-01-08T09:00:00Z',
      lastRunStatus: 'error',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [selectedScript, setSelectedScript] = useState<Script | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const handleRunNow = async (id: string) => {
    try {
      const response = await fetch('/api/admin/apps/scripts/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId: id })
      })

      if (response.ok) {
        setScripts(scripts.map(s =>
          s.id === id ? { ...s, lastRunAt: new Date().toISOString(), lastRunStatus: 'ok' } : s
        ))
      }
    } catch (error) {
      console.error('Failed to run script:', error)
    }
  }

  const handleViewLogs = async (script: Script) => {
    setSelectedScript(script)
    setLogs([
      '[2024-01-15 00:00:00] Starting script execution...',
      '[2024-01-15 00:00:01] Connecting to database...',
      '[2024-01-15 00:00:02] Processing 1000 records...',
      '[2024-01-15 00:00:05] Backup completed successfully',
      '[2024-01-15 00:00:05] Script execution completed'
    ])
    setShowLogsModal(true)
  }

  const stats = {
    total: scripts.length,
    enabled: scripts.filter(s => s.enabled).length,
    successful: scripts.filter(s => s.lastRunStatus === 'ok').length,
    errors: scripts.filter(s => s.lastRunStatus === 'error').length
  }

  return (
    <>
      {/* Stats Overview */}
      <div className="admin-section">
        <h2 className="admin-section-header">Overview</h2>
        <div className="admin-grid admin-grid-cols-4">
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-blue)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>📜</div>
            <div className="admin-metric-value">{stats.total}</div>
            <div className="admin-metric-label">Total Scripts</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-green)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>✅</div>
            <div className="admin-metric-value">{stats.enabled}</div>
            <div className="admin-metric-label">Enabled</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-indigo)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>✓</div>
            <div className="admin-metric-value">{stats.successful}</div>
            <div className="admin-metric-label">Successful Runs</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-pink)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>⚠️</div>
            <div className="admin-metric-value">{stats.errors}</div>
            <div className="admin-metric-label">Errors</div>
          </div>
        </div>
      </div>

      {/* Scripts Table */}
      <div className="admin-section">
        <div className="admin-flex-between admin-mb-4">
          <h2 className="admin-section-header" style={{ margin: 0 }}>Scripts</h2>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="admin-btn admin-btn-primary"
          >
            + New Script
          </button>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Schedule</th>
                <th style={{ textAlign: 'center' }}>Enabled</th>
                <th>Last Run</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scripts.map((script) => (
                <tr key={script.id}>
                  <td>
                    <div>
                      <div className="admin-font-semibold">{script.name}</div>
                      <div className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                        {script.description}
                      </div>
                    </div>
                  </td>
                  <td>
                    <code className="admin-text-sm" style={{
                      backgroundColor: 'var(--admin-bg)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem'
                    }}>
                      {script.schedule || 'Manual'}
                    </code>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      style={{
                        width: '3rem',
                        height: '1.5rem',
                        borderRadius: '9999px',
                        backgroundColor: script.enabled ? '#10B981' : 'var(--admin-border)',
                        position: 'relative',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <div style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '0.125rem',
                        left: script.enabled ? '1.625rem' : '0.125rem',
                        transition: 'left 0.2s'
                      }} />
                    </button>
                  </td>
                  <td className="admin-text-sm">
                    {script.lastRunAt ? new Date(script.lastRunAt).toLocaleString() : 'Never'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {script.lastRunStatus && (
                      <span className={`admin-badge ${
                        script.lastRunStatus === 'ok' ? 'admin-badge-success' : 'admin-badge-error'
                      }`}>
                        {script.lastRunStatus}
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleRunNow(script.id)}
                        className="admin-btn admin-btn-primary"
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                      >
                        Run Now
                      </button>
                      <button
                        type="button"
                        onClick={() => handleViewLogs(script)}
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                      >
                        View Logs
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logs Modal */}
      {showLogsModal && selectedScript && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div className="admin-card" style={{ maxWidth: '42rem', width: '100%', margin: '1rem' }}>
            <h3 className="admin-section-header" style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
              Logs: {selectedScript.name}
            </h3>
            <div style={{
              backgroundColor: 'var(--admin-bg)',
              borderRadius: '0.5rem',
              padding: '1rem',
              maxHeight: '24rem',
              overflowY: 'auto'
            }}>
              <pre className="admin-text-sm" style={{
                fontFamily: 'Monaco, monospace',
                color: 'var(--admin-text-secondary)',
                margin: 0
              }}>
                {logs.join('\n')}
              </pre>
            </div>
            <button
              type="button"
              onClick={() => setShowLogsModal(false)}
              className="admin-btn admin-btn-secondary"
              style={{ marginTop: '1rem', width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
