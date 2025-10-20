import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import ConfirmDialog from '../../components/admin/ConfirmDialog'

interface SystemInfo {
  system: {
    hostname: string
    platform: string
    arch: string
    cpus: number
    totalMemory: string
    freeMemory: string
    uptime: string
    nodeVersion: string
    processUptime: string
    processMemory: {
      rss: string
      heapTotal: string
      heapUsed: string
      external: string
    }
  }
  environment: {
    nodeEnv: string
    nextVersion: string
    databaseConnected: string
    databaseLatency: string
  }
}

interface DatabaseStats {
  counts: {
    users: number
    cases: number
    statements: number
    people: number
    organizations: number
    sources: number
    topics: number
    sessions: number
    apiKeys: number
    auditLogs: number
  }
  databaseSize: string
  tableSizes: Array<{
    tableName: string
    size: string
    rowCount: number
  }>
}

interface SessionStats {
  stats: {
    total: number
    active: number
    expired: number
    revoked: number
  }
}

interface LogStats {
  stats: {
    total: number
    today: number
    thisWeek: number
    thisMonth: number
  }
  actionBreakdown: Array<{
    action: string
    count: number
  }>
  entityBreakdown: Array<{
    entityType: string
    count: number
  }>
}

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'database' | 'sessions' | 'logs' | 'system'>('overview')
  const [loading, setLoading] = useState(false)
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null)
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null)
  const [logStats, setLogStats] = useState<LogStats | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadSystemInfo(),
        loadDatabaseStats(),
        loadSessionStats(),
        loadLogStats(),
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      showMessage('error', 'Failed to load maintenance data')
    } finally {
      setLoading(false)
    }
  }

  const loadSystemInfo = async () => {
    try {
      const res = await fetch('/api/admin/maintenance/system')
      if (res.ok) {
        const data = await res.json()
        setSystemInfo(data)
      }
    } catch (error) {
      console.error('Error loading system info:', error)
    }
  }

  const loadDatabaseStats = async () => {
    try {
      const res = await fetch('/api/admin/maintenance/database')
      if (res.ok) {
        const data = await res.json()
        setDatabaseStats(data)
      }
    } catch (error) {
      console.error('Error loading database stats:', error)
    }
  }

  const loadSessionStats = async () => {
    try {
      const res = await fetch('/api/admin/maintenance/sessions')
      if (res.ok) {
        const data = await res.json()
        setSessionStats(data)
      }
    } catch (error) {
      console.error('Error loading session stats:', error)
    }
  }

  const loadLogStats = async () => {
    try {
      const res = await fetch('/api/admin/maintenance/logs')
      if (res.ok) {
        const data = await res.json()
        setLogStats(data)
      }
    } catch (error) {
      console.error('Error loading log stats:', error)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleDatabaseAction = async (action: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/maintenance/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (res.ok) {
        const data = await res.json()
        showMessage('success', data.message)
        await loadDatabaseStats()
      } else {
        const error = await res.json()
        showMessage('error', error.error || 'Operation failed')
      }
    } catch (error) {
      showMessage('error', 'Failed to perform database operation')
    } finally {
      setLoading(false)
    }
  }

  const handleSessionAction = async (action: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/maintenance/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (res.ok) {
        const data = await res.json()
        showMessage('success', data.message)
        await loadSessionStats()
      } else {
        const error = await res.json()
        showMessage('error', error.error || 'Operation failed')
      }
    } catch (error) {
      showMessage('error', 'Failed to perform session operation')
    } finally {
      setLoading(false)
    }
  }

  const handleLogAction = async (action: string, days?: number) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/maintenance/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, days }),
      })

      if (res.ok) {
        const data = await res.json()
        showMessage('success', data.message)
        await loadLogStats()
      } else {
        const error = await res.json()
        showMessage('error', error.error || 'Operation failed')
      }
    } catch (error) {
      showMessage('error', 'Failed to perform log operation')
    } finally {
      setLoading(false)
    }
  }

  const handleHealthCheck = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/maintenance/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'health_check' }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.healthy) {
          showMessage('success', 'System health check passed ✓')
        } else {
          showMessage('error', 'System health check failed - see console for details')
          console.log('Health check details:', data)
        }
      }
    } catch (error) {
      showMessage('error', 'Failed to perform health check')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="System Maintenance">
      <div className="maintenance-container">
        {/* Message Banner */}
        {message && (
          <div className={`message-banner ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tabs-nav">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => setActiveTab('database')}
          >
            🗄️ Database
          </button>
          <button
            className={`tab-button ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => setActiveTab('sessions')}
          >
            🔐 Sessions
          </button>
          <button
            className={`tab-button ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            📋 Logs
          </button>
          <button
            className={`tab-button ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            ⚙️ System
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <h2>System Overview</h2>

              {/* Quick Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card blue">
                  <div className="stat-icon">🗄️</div>
                  <div className="stat-value">{databaseStats?.databaseSize || '-'}</div>
                  <div className="stat-label">Database Size</div>
                </div>
                <div className="stat-card green">
                  <div className="stat-icon">📊</div>
                  <div className="stat-value">{databaseStats?.counts.statements.toLocaleString() || '-'}</div>
                  <div className="stat-label">Total Statements</div>
                </div>
                <div className="stat-card purple">
                  <div className="stat-icon">🔐</div>
                  <div className="stat-value">{sessionStats?.stats.active || '-'}</div>
                  <div className="stat-label">Active Sessions</div>
                </div>
                <div className="stat-card orange">
                  <div className="stat-icon">📋</div>
                  <div className="stat-value">{logStats?.stats.today.toLocaleString() || '-'}</div>
                  <div className="stat-label">Logs Today</div>
                </div>
              </div>

              {/* System Health */}
              <div className="panel">
                <div className="panel-header">
                  <h3>System Health</h3>
                  <button className="btn-secondary" onClick={handleHealthCheck} disabled={loading}>
                    🔍 Run Health Check
                  </button>
                </div>
                <div className="health-grid">
                  <div className="health-item">
                    <span className="health-label">Database</span>
                    <span className={`health-badge ${systemInfo?.environment.databaseConnected === 'connected' ? 'success' : 'error'}`}>
                      {systemInfo?.environment.databaseConnected || 'Unknown'}
                    </span>
                  </div>
                  <div className="health-item">
                    <span className="health-label">DB Latency</span>
                    <span className="health-value">{systemInfo?.environment.databaseLatency || '-'}</span>
                  </div>
                  <div className="health-item">
                    <span className="health-label">Platform</span>
                    <span className="health-value">{systemInfo?.system.platform || '-'}</span>
                  </div>
                  <div className="health-item">
                    <span className="health-label">Uptime</span>
                    <span className="health-value">{systemInfo?.system.processUptime || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="panel">
                <h3>Quick Actions</h3>
                <div className="action-grid">
                  <button
                    className="action-card"
                    onClick={() => {
                      setConfirmDialog({
                        open: true,
                        title: 'Vacuum Database',
                        message: 'This will optimize the database. Continue?',
                        onConfirm: () => handleDatabaseAction('vacuum'),
                      })
                    }}
                    disabled={loading}
                  >
                    <div className="action-icon">🧹</div>
                    <div className="action-label">Vacuum DB</div>
                  </button>
                  <button
                    className="action-card"
                    onClick={() => {
                      setConfirmDialog({
                        open: true,
                        title: 'Clean Expired Sessions',
                        message: 'This will remove all expired sessions. Continue?',
                        onConfirm: () => handleSessionAction('cleanup_expired'),
                      })
                    }}
                    disabled={loading}
                  >
                    <div className="action-icon">🗑️</div>
                    <div className="action-label">Clean Sessions</div>
                  </button>
                  <button
                    className="action-card"
                    onClick={() => {
                      setConfirmDialog({
                        open: true,
                        title: 'Archive Old Logs',
                        message: 'This will archive logs older than 90 days. Continue?',
                        onConfirm: () => handleLogAction('cleanup_old', 90),
                      })
                    }}
                    disabled={loading}
                  >
                    <div className="action-icon">📦</div>
                    <div className="action-label">Archive Logs</div>
                  </button>
                  <button
                    className="action-card"
                    onClick={() => loadAllData()}
                    disabled={loading}
                  >
                    <div className="action-icon">🔄</div>
                    <div className="action-label">Refresh Data</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="database-tab">
              <h2>Database Management</h2>

              {/* Database Stats */}
              <div className="panel">
                <h3>Database Statistics</h3>
                <div className="db-stats-grid">
                  <div className="db-stat">
                    <span className="db-stat-label">Total Size</span>
                    <span className="db-stat-value">{databaseStats?.databaseSize || '-'}</span>
                  </div>
                  <div className="db-stat">
                    <span className="db-stat-label">Total Records</span>
                    <span className="db-stat-value">
                      {databaseStats ? Object.values(databaseStats.counts).reduce((a, b) => a + b, 0).toLocaleString() : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Table Counts */}
              <div className="panel">
                <h3>Table Statistics</h3>
                <div className="table-stats-grid">
                  {databaseStats && Object.entries(databaseStats.counts).map(([key, value]) => (
                    <div key={key} className="table-stat-card">
                      <div className="table-stat-count">{value.toLocaleString()}</div>
                      <div className="table-stat-name">{key}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Database Actions */}
              <div className="panel">
                <h3>Database Operations</h3>
                <div className="db-actions">
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setConfirmDialog({
                        open: true,
                        title: 'Vacuum Database',
                        message: 'This will run VACUUM ANALYZE to reclaim space and update statistics. This may take several minutes. Continue?',
                        onConfirm: () => handleDatabaseAction('vacuum'),
                      })
                    }}
                    disabled={loading}
                  >
                    🧹 Vacuum Database
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setConfirmDialog({
                        open: true,
                        title: 'Analyze Database',
                        message: 'This will update query planner statistics. Continue?',
                        onConfirm: () => handleDatabaseAction('analyze'),
                      })
                    }}
                    disabled={loading}
                  >
                    📊 Analyze Database
                  </button>
                </div>
              </div>

              {/* Table Sizes */}
              {databaseStats?.tableSizes && (
                <div className="panel">
                  <h3>Largest Tables</h3>
                  <div className="table-sizes">
                    {databaseStats.tableSizes.slice(0, 10).map((table, idx) => (
                      <div key={idx} className="table-size-row">
                        <span className="table-name">{table.tableName}</span>
                        <span className="table-info">
                          <span className="table-rows">{table.rowCount.toLocaleString()} rows</span>
                          <span className="table-size">{table.size}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="sessions-tab">
              <h2>Session Management</h2>

              {/* Session Stats */}
              <div className="panel">
                <h3>Session Statistics</h3>
                <div className="session-stats-grid">
                  <div className="session-stat green">
                    <div className="session-stat-value">{sessionStats?.stats.active || 0}</div>
                    <div className="session-stat-label">Active</div>
                  </div>
                  <div className="session-stat yellow">
                    <div className="session-stat-value">{sessionStats?.stats.expired || 0}</div>
                    <div className="session-stat-label">Expired</div>
                  </div>
                  <div className="session-stat red">
                    <div className="session-stat-value">{sessionStats?.stats.revoked || 0}</div>
                    <div className="session-stat-label">Revoked</div>
                  </div>
                  <div className="session-stat blue">
                    <div className="session-stat-value">{sessionStats?.stats.total || 0}</div>
                    <div className="session-stat-label">Total</div>
                  </div>
                </div>
              </div>

              {/* Session Actions */}
              <div className="panel">
                <h3>Session Operations</h3>
                <div className="session-actions">
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setConfirmDialog({
                        open: true,
                        title: 'Clean Expired Sessions',
                        message: 'This will permanently delete all expired sessions. Continue?',
                        onConfirm: () => handleSessionAction('cleanup_expired'),
                      })
                    }}
                    disabled={loading}
                  >
                    🗑️ Clean Expired Sessions
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setConfirmDialog({
                        open: true,
                        title: 'Clean Old Revoked Sessions',
                        message: 'This will delete revoked sessions older than 30 days. Continue?',
                        onConfirm: () => handleSessionAction('cleanup_revoked'),
                      })
                    }}
                    disabled={loading}
                  >
                    🧹 Clean Old Revoked
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => {
                      setConfirmDialog({
                        open: true,
                        title: 'Revoke All Sessions',
                        message: 'This will revoke ALL active sessions except yours. This will force all other users to log in again. Continue?',
                        onConfirm: () => handleSessionAction('revoke_all'),
                      })
                    }}
                    disabled={loading}
                  >
                    ⚠️ Revoke All Sessions
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="logs-tab">
              <h2>Audit Log Management</h2>

              {/* Log Stats */}
              <div className="panel">
                <h3>Log Statistics</h3>
                <div className="log-stats-grid">
                  <div className="log-stat">
                    <div className="log-stat-value">{logStats?.stats.total.toLocaleString() || 0}</div>
                    <div className="log-stat-label">Total Logs</div>
                  </div>
                  <div className="log-stat">
                    <div className="log-stat-value">{logStats?.stats.today.toLocaleString() || 0}</div>
                    <div className="log-stat-label">Today</div>
                  </div>
                  <div className="log-stat">
                    <div className="log-stat-value">{logStats?.stats.thisWeek.toLocaleString() || 0}</div>
                    <div className="log-stat-label">This Week</div>
                  </div>
                  <div className="log-stat">
                    <div className="log-stat-value">{logStats?.stats.thisMonth.toLocaleString() || 0}</div>
                    <div className="log-stat-label">This Month</div>
                  </div>
                </div>
              </div>

              {/* Log Breakdown */}
              <div className="log-breakdown-grid">
                {logStats?.actionBreakdown && (
                  <div className="panel">
                    <h3>Top Actions</h3>
                    <div className="breakdown-list">
                      {logStats.actionBreakdown.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="breakdown-item">
                          <span className="breakdown-label">{item.action}</span>
                          <span className="breakdown-count">{item.count.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {logStats?.entityBreakdown && (
                  <div className="panel">
                    <h3>Top Entities</h3>
                    <div className="breakdown-list">
                      {logStats.entityBreakdown.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="breakdown-item">
                          <span className="breakdown-label">{item.entityType}</span>
                          <span className="breakdown-count">{item.count.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Log Actions */}
              <div className="panel">
                <h3>Log Operations</h3>
                <div className="log-actions">
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setConfirmDialog({
                        open: true,
                        title: 'Clean Old Logs',
                        message: 'This will delete audit logs older than 90 days. Continue?',
                        onConfirm: () => handleLogAction('cleanup_old', 90),
                      })
                    }}
                    disabled={loading}
                  >
                    🗑️ Clean Logs (90+ days)
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setConfirmDialog({
                        open: true,
                        title: 'Clean Old Logs',
                        message: 'This will delete audit logs older than 180 days. Continue?',
                        onConfirm: () => handleLogAction('cleanup_old', 180),
                      })
                    }}
                    disabled={loading}
                  >
                    🗑️ Clean Logs (180+ days)
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="system-tab">
              <h2>System Information</h2>

              {/* Environment Info */}
              <div className="panel">
                <h3>Environment</h3>
                <div className="info-grid">
                  <div className="info-row">
                    <span className="info-label">Node Environment</span>
                    <span className="info-value">{systemInfo?.environment.nodeEnv || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Node Version</span>
                    <span className="info-value">{systemInfo?.system.nodeVersion || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Next.js Version</span>
                    <span className="info-value">{systemInfo?.environment.nextVersion || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Platform</span>
                    <span className="info-value">{systemInfo?.system.platform || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Architecture</span>
                    <span className="info-value">{systemInfo?.system.arch || '-'}</span>
                  </div>
                </div>
              </div>

              {/* System Resources */}
              <div className="panel">
                <h3>System Resources</h3>
                <div className="info-grid">
                  <div className="info-row">
                    <span className="info-label">CPUs</span>
                    <span className="info-value">{systemInfo?.system.cpus || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Total Memory</span>
                    <span className="info-value">{systemInfo?.system.totalMemory || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Free Memory</span>
                    <span className="info-value">{systemInfo?.system.freeMemory || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">System Uptime</span>
                    <span className="info-value">{systemInfo?.system.uptime || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Process Uptime</span>
                    <span className="info-value">{systemInfo?.system.processUptime || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Process Memory */}
              <div className="panel">
                <h3>Process Memory</h3>
                <div className="info-grid">
                  <div className="info-row">
                    <span className="info-label">RSS</span>
                    <span className="info-value">{systemInfo?.system.processMemory.rss || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Heap Total</span>
                    <span className="info-value">{systemInfo?.system.processMemory.heapTotal || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Heap Used</span>
                    <span className="info-value">{systemInfo?.system.processMemory.heapUsed || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">External</span>
                    <span className="info-value">{systemInfo?.system.processMemory.external || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.open}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={() => {
            confirmDialog.onConfirm()
            setConfirmDialog({ ...confirmDialog, open: false })
          }}
          onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
          variant="warning"
        />
      </div>

      <style jsx>{`
        .maintenance-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .message-banner {
          padding: 1rem 1.5rem;
          border-radius: 0.75rem;
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .message-banner.success {
          background: #D1FAE5;
          color: #065F46;
          border: 1px solid #6EE7B7;
        }

        .message-banner.error {
          background: #FEE2E2;
          color: #991B1B;
          border: 1px solid #FCA5A5;
        }

        .tabs-nav {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #E5E7EB;
          overflow-x: auto;
          padding-bottom: 0;
        }

        .tab-button {
          padding: 0.75rem 1.5rem;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95rem;
          color: #6B7280;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .tab-button:hover {
          color: #2563EB;
          background: #F3F4F6;
        }

        .tab-button.active {
          color: #2563EB;
          border-bottom-color: #2563EB;
        }

        .tab-content {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .panel {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border: 1px solid #E5E7EB;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .panel h3 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
          color: #111827;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .panel-header h3 {
          margin: 0;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .stat-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          text-align: center;
          border: 1px solid #E5E7EB;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-card.blue { border-left: 4px solid #3B82F6; }
        .stat-card.green { border-left: 4px solid #10B981; }
        .stat-card.purple { border-left: 4px solid #8B5CF6; }
        .stat-card.orange { border-left: 4px solid #F59E0B; }

        .stat-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        /* Health Grid */
        .health-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .health-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: #F9FAFB;
          border-radius: 0.5rem;
        }

        .health-label {
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }

        .health-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .health-badge.success {
          background: #D1FAE5;
          color: #065F46;
        }

        .health-badge.error {
          background: #FEE2E2;
          color: #991B1B;
        }

        .health-value {
          font-weight: 600;
          color: #111827;
          font-size: 0.875rem;
        }

        /* Action Grid */
        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
        }

        .action-card {
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 0.75rem;
          padding: 1.25rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-card:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #2563EB;
        }

        .action-card:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .action-label {
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }

        /* Database Stats */
        .db-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .db-stat {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          background: #F9FAFB;
          border-radius: 0.75rem;
        }

        .db-stat-label {
          font-size: 0.875rem;
          color: #6B7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .db-stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        /* Table Stats */
        .table-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 1rem;
        }

        .table-stat-card {
          background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
          color: white;
          padding: 1rem;
          border-radius: 0.75rem;
          text-align: center;
        }

        .table-stat-count {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .table-stat-name {
          font-size: 0.75rem;
          text-transform: capitalize;
          opacity: 0.9;
        }

        /* Database Actions */
        .db-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        /* Table Sizes */
        .table-sizes {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .table-size-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: #F9FAFB;
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }

        .table-name {
          font-weight: 600;
          color: #374151;
          font-family: monospace;
        }

        .table-info {
          display: flex;
          gap: 1rem;
          color: #6B7280;
        }

        .table-rows {
          font-weight: 500;
        }

        .table-size {
          font-weight: 600;
          color: #2563EB;
        }

        /* Session Stats */
        .session-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
        }

        .session-stat {
          padding: 1.25rem;
          border-radius: 0.75rem;
          text-align: center;
          border: 2px solid;
        }

        .session-stat.green {
          background: #D1FAE5;
          border-color: #10B981;
        }

        .session-stat.yellow {
          background: #FEF3C7;
          border-color: #F59E0B;
        }

        .session-stat.red {
          background: #FEE2E2;
          border-color: #EF4444;
        }

        .session-stat.blue {
          background: #DBEAFE;
          border-color: #3B82F6;
        }

        .session-stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .session-stat-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Session Actions */
        .session-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        /* Log Stats */
        .log-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem;
        }

        .log-stat {
          background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
          color: white;
          padding: 1.25rem;
          border-radius: 0.75rem;
          text-align: center;
        }

        .log-stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .log-stat-label {
          font-size: 0.875rem;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Log Breakdown */
        .log-breakdown-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .breakdown-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: #F9FAFB;
          border-radius: 0.5rem;
        }

        .breakdown-label {
          font-weight: 600;
          color: #374151;
          text-transform: capitalize;
        }

        .breakdown-count {
          font-weight: 700;
          color: #2563EB;
          font-size: 1rem;
        }

        /* Log Actions */
        .log-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        /* System Info */
        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: #F9FAFB;
          border-radius: 0.5rem;
        }

        .info-label {
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }

        .info-value {
          font-weight: 600;
          color: #111827;
          font-size: 0.875rem;
          font-family: monospace;
        }

        /* Buttons */
        .btn-primary,
        .btn-secondary,
        .btn-danger {
          padding: 0.625rem 1.25rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: #2563EB;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #1D4ED8;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #F3F4F6;
          color: #374151;
          border: 1px solid #E5E7EB;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #E5E7EB;
        }

        .btn-danger {
          background: #EF4444;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background: #DC2626;
          transform: translateY(-1px);
        }

        .btn-primary:disabled,
        .btn-secondary:disabled,
        .btn-danger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .tabs-nav {
            gap: 0.25rem;
          }

          .tab-button {
            padding: 0.625rem 1rem;
            font-size: 0.875rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .action-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .table-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .log-breakdown-grid {
            grid-template-columns: 1fr;
          }

          .db-actions,
          .session-actions,
          .log-actions {
            flex-direction: column;
          }

          .btn-primary,
          .btn-secondary,
          .btn-danger {
            width: 100%;
          }
        }
      `}</style>
    </AdminLayout>
  )
}
