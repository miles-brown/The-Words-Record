/**
 * UsageQuotasTracker Component
 * Track usage quotas for integrations
 * Redesigned to match admin design system
 */

import { useState } from 'react'

interface Quota {
  provider: string
  unit: string
  used: number
  limit: number
  period: string
  resetAt: string
}

export default function UsageQuotasTracker() {
  const [quotas] = useState<Quota[]>([
    { provider: 'OpenAI', unit: 'tokens', used: 450000, limit: 1000000, period: 'monthly', resetAt: '2024-02-01' },
    { provider: 'Gmail', unit: 'emails', used: 234, limit: 500, period: 'daily', resetAt: '2024-01-16' },
    { provider: 'Supabase', unit: 'GB bandwidth', used: 12.5, limit: 50, period: 'monthly', resetAt: '2024-02-01' },
    { provider: 'Cloudflare', unit: 'requests', used: 890000, limit: 1000000, period: 'monthly', resetAt: '2024-02-01' },
    { provider: 'Vercel', unit: 'function calls', used: 45000, limit: 100000, period: 'monthly', resetAt: '2024-02-01' },
    { provider: 'Discord', unit: 'messages', used: 4500, limit: 5000, period: 'daily', resetAt: '2024-01-16' }
  ])

  const stats = {
    atRisk: quotas.filter(q => (q.used / q.limit) * 100 >= 80).length,
    avgUsage: (quotas.reduce((acc, q) => acc + (q.used / q.limit) * 100, 0) / quotas.length).toFixed(1),
    total: quotas.length
  }

  return (
    <>
      {/* Stats Overview */}
      <div className="admin-section">
        <div className="admin-flex-between">
          <h2 className="admin-section-header" style={{ margin: 0 }}>Overview</h2>
          <button className="admin-btn admin-btn-primary">
            Export Report
          </button>
        </div>

        <div className="admin-grid admin-grid-cols-3" style={{ marginTop: '1.5rem' }}>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-amber)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>⚠️</div>
            <div className="admin-metric-value">{stats.atRisk}</div>
            <div className="admin-metric-label">Services at Risk</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-blue)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>📊</div>
            <div className="admin-metric-value">{stats.avgUsage}%</div>
            <div className="admin-metric-label">Average Usage</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-green)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>🔌</div>
            <div className="admin-metric-value">{stats.total}</div>
            <div className="admin-metric-label">Total Services</div>
          </div>
        </div>
      </div>

      {/* Quotas Grid */}
      <div className="admin-section">
        <h2 className="admin-section-header">Usage & Quotas</h2>
        <div className="admin-grid admin-grid-cols-2">
          {quotas.map(quota => {
            const percentage = (quota.used / quota.limit) * 100

            return (
              <div key={`${quota.provider}-${quota.unit}`} className="admin-card">
                <div className="admin-flex-between" style={{ marginBottom: '1rem' }}>
                  <div>
                    <h3 className="admin-font-semibold" style={{ fontSize: '1.125rem', color: 'var(--admin-text-primary)', margin: 0, marginBottom: '0.25rem' }}>
                      {quota.provider}
                    </h3>
                    <p className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)', margin: 0 }}>
                      {quota.unit}
                    </p>
                  </div>
                  {percentage >= 80 && (
                    <span className={`admin-badge ${
                      percentage >= 95 ? 'admin-badge-error' : 'admin-badge-warning'
                    }`}>
                      {percentage >= 95 ? 'Critical' : 'Warning'}
                    </span>
                  )}
                </div>

                <div style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--admin-bg)',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div className="admin-flex-between admin-mb-3">
                    <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Usage</span>
                    <span className="admin-text-sm admin-font-semibold">
                      {quota.used.toLocaleString()} / {quota.limit.toLocaleString()} {quota.unit}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '0.75rem',
                    backgroundColor: 'var(--admin-card-bg)',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: percentage < 50 ? '#10B981' :
                                      percentage < 80 ? '#F59E0B' :
                                      percentage < 95 ? '#F97316' : '#EF4444',
                      transition: 'width 0.5s'
                    }} />
                  </div>

                  <div className="admin-flex-between">
                    <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                      {percentage.toFixed(1)}% used
                    </span>
                    <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                      Resets {quota.period}
                    </span>
                  </div>
                </div>

                {quota.resetAt && (
                  <div style={{
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--admin-border)'
                  }}>
                    <p className="admin-text-sm" style={{ color: 'var(--admin-text-muted)', margin: 0 }}>
                      Next reset: {new Date(quota.resetAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
