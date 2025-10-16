/**
 * AutomationDashboard Component
 * Monitor and manage automations
 * Redesigned to match admin design system
 */

import { useState } from 'react'

interface Automation {
  id: string
  name: string
  trigger: string
  enabled: boolean
  lastRun?: string
  lastStatus?: 'ok' | 'error' | 'skipped'
}

export default function AutomationDashboard() {
  const [automations] = useState<Automation[]>([
    {
      id: '1',
      name: 'New User Welcome',
      trigger: 'event:user.created',
      enabled: true,
      lastRun: '2024-01-15T10:00:00Z',
      lastStatus: 'ok'
    },
    {
      id: '2',
      name: 'Daily Report',
      trigger: 'cron:0 9 * * *',
      enabled: true,
      lastRun: '2024-01-15T09:00:00Z',
      lastStatus: 'ok'
    },
    {
      id: '3',
      name: 'Backup Reminder',
      trigger: 'cron:0 0 * * SUN',
      enabled: false,
      lastRun: '2024-01-07T00:00:00Z',
      lastStatus: 'skipped'
    }
  ])

  const stats = {
    total: automations.length,
    enabled: automations.filter(a => a.enabled).length,
    successful: automations.filter(a => a.lastStatus === 'ok').length,
    errors: automations.filter(a => a.lastStatus === 'error').length
  }

  return (
    <>
      {/* Stats Overview */}
      <div className="admin-section">
        <h2 className="admin-section-header">Overview</h2>
        <div className="admin-grid admin-grid-cols-4">
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-purple)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>🧩</div>
            <div className="admin-metric-value">{stats.total}</div>
            <div className="admin-metric-label">Total Automations</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-green)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>✅</div>
            <div className="admin-metric-value">{stats.enabled}</div>
            <div className="admin-metric-label">Active</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-blue)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>✓</div>
            <div className="admin-metric-value">{stats.successful}</div>
            <div className="admin-metric-label">Successful</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-pink)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>❌</div>
            <div className="admin-metric-value">{stats.errors}</div>
            <div className="admin-metric-label">Errors</div>
          </div>
        </div>
      </div>

      {/* Automations Grid */}
      <div className="admin-section">
        <div className="admin-flex-between admin-mb-4">
          <h2 className="admin-section-header" style={{ margin: 0 }}>Automations</h2>
          <button className="admin-btn admin-btn-primary">
            + New Automation
          </button>
        </div>

        <div className="admin-grid admin-grid-auto">
          {automations.map(auto => (
            <div key={auto.id} className="admin-card">
              <div className="admin-flex-between" style={{ marginBottom: '0.75rem' }}>
                <h3 className="admin-font-semibold" style={{ fontSize: '1.125rem', color: 'var(--admin-text-primary)', margin: 0 }}>
                  {auto.name}
                </h3>
                <span className={`admin-badge ${
                  auto.enabled ? 'admin-badge-success' : 'admin-badge-info'
                }`}>
                  {auto.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <p className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)', marginBottom: '1rem' }}>
                <code style={{
                  backgroundColor: 'var(--admin-bg)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem'
                }}>
                  {auto.trigger}
                </code>
              </p>

              <div style={{
                padding: '0.75rem',
                backgroundColor: 'var(--admin-bg)',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div className="admin-flex-between admin-mb-2">
                  <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Last Run</span>
                  <span className="admin-text-sm">{auto.lastRun ? new Date(auto.lastRun).toLocaleString() : 'Never'}</span>
                </div>
                <div className="admin-flex-between">
                  <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Status</span>
                  {auto.lastStatus && (
                    <span className={`admin-badge ${
                      auto.lastStatus === 'ok' ? 'admin-badge-success' :
                      auto.lastStatus === 'error' ? 'admin-badge-error' :
                      'admin-badge-info'
                    }`} style={{ fontSize: '0.75rem' }}>
                      {auto.lastStatus}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="admin-btn admin-btn-primary" style={{ flex: 1 }}>
                  Run Now
                </button>
                <button className="admin-btn admin-btn-secondary">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
