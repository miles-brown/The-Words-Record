/**
 * CustomAppBuilder Component
 * Build and run custom applications
 * Redesigned to match admin design system
 */

import { useState } from 'react'

interface CustomApp {
  id: string
  name: string
  description: string
  inputs: number
  lastRun?: string
}

export default function CustomAppBuilder() {
  const [customApps] = useState<CustomApp[]>([
    { id: '1', name: 'Quick Report', description: 'Generate custom reports', inputs: 2, lastRun: '2024-01-15' },
    { id: '2', name: 'Bulk Importer', description: 'Import CSV data', inputs: 3, lastRun: '2024-01-14' },
    { id: '3', name: 'Data Validator', description: 'Validate data integrity', inputs: 1, lastRun: '2024-01-13' }
  ])

  const stats = {
    total: customApps.length,
    avgInputs: (customApps.reduce((acc, app) => acc + app.inputs, 0) / customApps.length).toFixed(1),
    recentlyUsed: customApps.filter(app => {
      if (!app.lastRun) return false
      const daysSince = (new Date().getTime() - new Date(app.lastRun).getTime()) / (1000 * 60 * 60 * 24)
      return daysSince < 7
    }).length
  }

  return (
    <>
      {/* Stats Overview */}
      <div className="admin-section">
        <h2 className="admin-section-header">Overview</h2>
        <div className="admin-grid admin-grid-cols-3">
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-purple)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>🛠️</div>
            <div className="admin-metric-value">{stats.total}</div>
            <div className="admin-metric-label">Custom Apps</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-blue)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>📝</div>
            <div className="admin-metric-value">{stats.avgInputs}</div>
            <div className="admin-metric-label">Avg Inputs</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-green)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>📈</div>
            <div className="admin-metric-value">{stats.recentlyUsed}</div>
            <div className="admin-metric-label">Recently Used</div>
          </div>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="admin-section">
        <div className="admin-flex-between admin-mb-4">
          <h2 className="admin-section-header" style={{ margin: 0 }}>Custom Applications</h2>
          <button className="admin-btn admin-btn-primary">
            + Create App
          </button>
        </div>

        <div className="admin-grid admin-grid-auto">
          {customApps.map(app => (
            <div key={app.id} className="admin-card" style={{ transition: 'box-shadow 0.3s', cursor: 'pointer' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--admin-shadow-lg)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--admin-shadow)'
              }}
            >
              <h3 className="admin-font-semibold" style={{ fontSize: '1.125rem', color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                {app.name}
              </h3>
              <p className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)', marginBottom: '1rem' }}>
                {app.description}
              </p>

              <div style={{
                padding: '0.75rem',
                backgroundColor: 'var(--admin-bg)',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div className="admin-flex-between admin-mb-2">
                  <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Inputs</span>
                  <span className="admin-text-sm admin-font-semibold">{app.inputs} fields</span>
                </div>
                <div className="admin-flex-between">
                  <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Last run</span>
                  <span className="admin-text-sm">{app.lastRun || 'Never'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="admin-btn admin-btn-primary" style={{ flex: 1 }}>
                  Run
                </button>
                <button className="admin-btn admin-btn-secondary" style={{ flex: 1 }}>
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State for Future Apps */}
      <div className="admin-section">
        <div className="admin-card" style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          backgroundColor: 'var(--admin-bg)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
          <h3 className="admin-font-semibold" style={{ fontSize: '1.25rem', color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
            Build Your Own Tools
          </h3>
          <p className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)', marginBottom: '1.5rem', maxWidth: '32rem', margin: '0 auto' }}>
            Create custom applications with configurable inputs, automated workflows, and reusable templates.
          </p>
          <button className="admin-btn admin-btn-primary">
            Get Started
          </button>
        </div>
      </div>
    </>
  )
}
