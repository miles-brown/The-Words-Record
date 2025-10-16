/**
 * IntegrationHealthPanel Component
 * Monitor integration health and dependencies
 * Redesigned to match admin design system
 */

import { useState, useEffect } from 'react'

interface HealthCheck {
  provider: string
  status: 'ok' | 'error' | 'timeout'
  latencyMs: number
  checkedAt: string
  message?: string
}

export default function IntegrationHealthPanel() {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    { provider: 'Supabase', status: 'ok', latencyMs: 12, checkedAt: new Date().toISOString() },
    { provider: 'Vercel', status: 'ok', latencyMs: 8, checkedAt: new Date().toISOString() },
    { provider: 'Cloudflare', status: 'ok', latencyMs: 3, checkedAt: new Date().toISOString() },
    { provider: 'OpenAI', status: 'ok', latencyMs: 125, checkedAt: new Date().toISOString() },
    { provider: 'Discord', status: 'error', latencyMs: 0, checkedAt: new Date().toISOString(), message: 'Invalid token' },
    { provider: 'Gmail', status: 'timeout', latencyMs: 5000, checkedAt: new Date().toISOString(), message: 'Request timeout' }
  ])

  useEffect(() => {
    const handleRefresh = async () => {
      try {
        const response = await fetch('/api/admin/apps/health')
        if (response.ok) {
          const data = await response.json()
          setHealthChecks(data)
        }
      } catch (error) {
        console.error('Health check failed:', error)
      }
    }

    window.addEventListener('refresh-health', handleRefresh)
    return () => window.removeEventListener('refresh-health', handleRefresh)
  }, [])

  const overallHealth = healthChecks.filter(h => h.status === 'ok').length / healthChecks.length * 100

  const stats = {
    healthy: healthChecks.filter(h => h.status === 'ok').length,
    errors: healthChecks.filter(h => h.status === 'error').length,
    timeout: healthChecks.filter(h => h.status === 'timeout').length,
    avgLatency: Math.round(healthChecks.filter(h => h.status === 'ok').reduce((acc, h) => acc + h.latencyMs, 0) / healthChecks.filter(h => h.status === 'ok').length)
  }

  return (
    <>
      {/* Stats Overview */}
      <div className="admin-section">
        <div className="admin-flex-between">
          <h2 className="admin-section-header" style={{ margin: 0 }}>Overview</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
              Overall Health: <span style={{
                fontWeight: 600,
                color: overallHealth >= 80 ? '#10B981' : overallHealth >= 50 ? '#F59E0B' : '#EF4444'
              }}>
                {overallHealth.toFixed(0)}%
              </span>
            </span>
            <button className="admin-btn admin-btn-primary">
              Ping All
            </button>
          </div>
        </div>

        <div className="admin-grid admin-grid-cols-4" style={{ marginTop: '1.5rem' }}>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-green)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>✅</div>
            <div className="admin-metric-value">{stats.healthy}</div>
            <div className="admin-metric-label">Healthy</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-pink)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>❌</div>
            <div className="admin-metric-value">{stats.errors}</div>
            <div className="admin-metric-label">Errors</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-amber)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>⏱️</div>
            <div className="admin-metric-value">{stats.timeout}</div>
            <div className="admin-metric-label">Timeouts</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-blue)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>⚡</div>
            <div className="admin-metric-value">{stats.avgLatency}ms</div>
            <div className="admin-metric-label">Avg Latency</div>
          </div>
        </div>
      </div>

      {/* Health Checks Grid */}
      <div className="admin-section">
        <h2 className="admin-section-header">Service Health</h2>
        <div className="admin-grid admin-grid-auto">
          {healthChecks.map(check => (
            <div key={check.provider} className="admin-card">
              <div className="admin-flex-between" style={{ marginBottom: '1rem' }}>
                <h3 className="admin-font-semibold" style={{ fontSize: '1.125rem', color: 'var(--admin-text-primary)', margin: 0 }}>
                  {check.provider}
                </h3>
                <span style={{
                  fontSize: '1.5rem',
                  color: check.status === 'ok' ? '#10B981' : check.status === 'error' ? '#EF4444' : '#F59E0B'
                }}>
                  {check.status === 'ok' ? '✓' : check.status === 'error' ? '✗' : '⚠'}
                </span>
              </div>

              <div style={{
                padding: '0.75rem',
                backgroundColor: 'var(--admin-bg)',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div className="admin-flex-between admin-mb-2">
                  <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Status</span>
                  <span className={`admin-badge ${
                    check.status === 'ok' ? 'admin-badge-success' :
                    check.status === 'error' ? 'admin-badge-error' :
                    'admin-badge-warning'
                  }`} style={{ fontSize: '0.75rem' }}>
                    {check.status}
                  </span>
                </div>
                <div className="admin-flex-between">
                  <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Latency</span>
                  <span className="admin-text-sm admin-font-semibold" style={{
                    color: check.latencyMs < 50 ? '#10B981' : check.latencyMs < 200 ? '#F59E0B' : '#EF4444'
                  }}>
                    {check.latencyMs}ms
                  </span>
                </div>
                {check.message && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem',
                    backgroundColor: 'var(--admin-card-bg)',
                    borderRadius: '0.25rem'
                  }}>
                    <p className="admin-text-sm" style={{ color: 'var(--admin-text-muted)', margin: 0 }}>
                      {check.message}
                    </p>
                  </div>
                )}
              </div>

              <button className="admin-btn admin-btn-secondary" style={{ width: '100%' }}>
                Test Connection
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dependency Map */}
      <div className="admin-section">
        <h2 className="admin-section-header">Dependency Map</h2>
        <div className="admin-card">
          <div className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)', lineHeight: 1.8 }}>
            <div style={{ marginBottom: '0.5rem' }}>• Authentication → Supabase</div>
            <div style={{ marginBottom: '0.5rem' }}>• Hosting → Vercel</div>
            <div style={{ marginBottom: '0.5rem' }}>• CDN → Cloudflare</div>
            <div style={{ marginBottom: '0.5rem' }}>• AI Features → OpenAI</div>
            <div>• Notifications → Discord, Gmail</div>
          </div>
        </div>
      </div>
    </>
  )
}
