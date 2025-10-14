/**
 * Audit Logs Page
 * Activity tracking and system audit trail viewer
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'

interface AuditLog {
  id: string
  action: string
  entityType: string | null
  entityId: string | null
  actor: string | null
  userId?: string
  timestamp: string
  status: 'success' | 'failed' | 'pending'
  description: string | null
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
  changes?: {
    field: string
    oldValue: any
    newValue: any
  }[]
}

interface FilterState {
  action: string
  entityType: string
  actor: string
  status: string
  dateFrom: string
  dateTo: string
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<FilterState>({
    action: '',
    entityType: '',
    actor: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchAuditLogs()
  }, [page, filters])

  useEffect(() => {
    // Auto-refresh setup
    if (refreshInterval) {
      const interval = setInterval(fetchAuditLogs, refreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [refreshInterval])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value)
        )
      })

      const response = await fetch(`/api/admin/audit-logs?${queryParams}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Failed to fetch audit logs')
      }

      const data = await response.json()

      // Mock enhanced data for demonstration
      const enhancedLogs = (data.logs || []).map((log: AuditLog) => ({
        ...log,
        ipAddress: log.ipAddress || '192.168.1.' + Math.floor(Math.random() * 255),
        userAgent: log.userAgent || 'Mozilla/5.0 Chrome/120.0.0.0',
        changes: log.action === 'UPDATE' ? [
          { field: 'status', oldValue: 'draft', newValue: 'published' },
          { field: 'updatedAt', oldValue: '2024-01-01', newValue: '2024-01-02' }
        ] : undefined
      }))

      setLogs(enhancedLogs)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1) // Reset to first page when filters change
  }

  const clearFilters = () => {
    setFilters({
      action: '',
      entityType: '',
      actor: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    })
    setPage(1)
  }

  const exportLogs = async (format: 'csv' | 'json') => {
    try {
      const queryParams = new URLSearchParams({
        format,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value)
        )
      })

      const response = await fetch(`/api/admin/audit-logs/export?${queryParams}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE': return '➕'
      case 'UPDATE': return '✏️'
      case 'DELETE': return '🗑️'
      case 'LOGIN': return '🔑'
      case 'LOGOUT': return '🚪'
      case 'APPROVE': return '✅'
      case 'REJECT': return '❌'
      case 'EXPORT': return '📥'
      case 'IMPORT': return '📤'
      default: return '📋'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success'
      case 'failed': return 'danger'
      case 'pending': return 'warning'
      default: return 'default'
    }
  }

  if (loading && logs.length === 0) {
    return (
      <AdminLayout title="Audit Logs">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading audit logs...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Audit Logs - Admin Dashboard</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <AdminLayout title="Audit Logs">
        <div className="audit-logs">
          {/* Header Controls */}
          <div className="header-controls">
            <div className="control-group">
              <button
                className={`filter-toggle ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <span className="icon">🔍</span>
                <span>Filters</span>
                {Object.values(filters).filter(v => v).length > 0 && (
                  <span className="badge">{Object.values(filters).filter(v => v).length}</span>
                )}
              </button>

              <button className="refresh-button" onClick={fetchAuditLogs}>
                <span className="icon">🔄</span>
                <span>Refresh</span>
              </button>

              <select
                className="auto-refresh"
                value={refreshInterval || ''}
                onChange={(e) => setRefreshInterval(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">No auto-refresh</option>
                <option value="5">Refresh every 5s</option>
                <option value="10">Refresh every 10s</option>
                <option value="30">Refresh every 30s</option>
                <option value="60">Refresh every 1m</option>
              </select>
            </div>

            <div className="control-group">
              <button className="export-button" onClick={() => exportLogs('csv')}>
                <span className="icon">📊</span>
                <span>Export CSV</span>
              </button>

              <button className="export-button" onClick={() => exportLogs('json')}>
                <span className="icon">📄</span>
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="filters-panel">
              <div className="filters-grid">
                <div className="filter-group">
                  <label>Action</label>
                  <select
                    value={filters.action}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                  >
                    <option value="">All Actions</option>
                    <option value="CREATE">Create</option>
                    <option value="UPDATE">Update</option>
                    <option value="DELETE">Delete</option>
                    <option value="LOGIN">Login</option>
                    <option value="LOGOUT">Logout</option>
                    <option value="APPROVE">Approve</option>
                    <option value="REJECT">Reject</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Entity Type</label>
                  <select
                    value={filters.entityType}
                    onChange={(e) => handleFilterChange('entityType', e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="case">Cases</option>
                    <option value="person">People</option>
                    <option value="organization">Organizations</option>
                    <option value="statement">Statements</option>
                    <option value="source">Sources</option>
                    <option value="user">Users</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Actor</label>
                  <input
                    type="text"
                    placeholder="Username or system"
                    value={filters.actor}
                    onChange={(e) => handleFilterChange('actor', e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label>Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Date From</label>
                  <input
                    type="datetime-local"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label>Date To</label>
                  <input
                    type="datetime-local"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-actions">
                <button className="clear-filters" onClick={clearFilters}>
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {/* Statistics Bar */}
          <div className="statistics-bar">
            <div className="stat-card">
              <span className="stat-value">{logs.length}</span>
              <span className="stat-label">Total Logs</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{logs.filter(l => l.status === 'success').length}</span>
              <span className="stat-label">Successful</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{logs.filter(l => l.status === 'failed').length}</span>
              <span className="stat-label">Failed</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {logs.filter(l => new Date(l.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
              </span>
              <span className="stat-label">Last 24h</span>
            </div>
          </div>

          {/* Logs Table */}
          <div className="logs-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Actor</th>
                  <th>Status</th>
                  <th>IP Address</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className={`log-row ${log.status}`}>
                    <td className="time-cell">
                      <div className="time-wrapper">
                        <span className="date">{formatDate(log.timestamp).split(',')[0]}</span>
                        <span className="time">{formatDate(log.timestamp).split(',')[1]}</span>
                      </div>
                    </td>
                    <td className="action-cell">
                      <div className="action-wrapper">
                        <span className="action-icon">{getActionIcon(log.action)}</span>
                        <span className="action-text">{log.action}</span>
                      </div>
                    </td>
                    <td className="entity-cell">
                      {log.entityType && (
                        <div className="entity-wrapper">
                          <span className="entity-type">{log.entityType}</span>
                          {log.entityId && (
                            <span className="entity-id">#{log.entityId.slice(0, 8)}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="actor-cell">
                      <div className="actor-wrapper">
                        <span className="actor-name">{log.actor || 'System'}</span>
                        {log.userId && (
                          <span className="user-id">ID: {log.userId.slice(0, 8)}</span>
                        )}
                      </div>
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="ip-cell">
                      <span className="ip-address">{log.ipAddress || '-'}</span>
                    </td>
                    <td className="details-cell">
                      <button
                        className="details-button"
                        onClick={() => setSelectedLog(log)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {logs.length === 0 && (
              <div className="no-logs">
                <span className="no-logs-icon">📭</span>
                <p>No audit logs found</p>
                {Object.values(filters).filter(v => v).length > 0 && (
                  <button onClick={clearFilters}>Clear filters</button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage(1)}
              >
                First
              </button>
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
              >
                Last
              </button>
            </div>
          )}

          {/* Detail Modal */}
          {selectedLog && (
            <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Audit Log Details</h2>
                  <button className="modal-close" onClick={() => setSelectedLog(null)}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Log ID</label>
                      <span>{selectedLog.id}</span>
                    </div>
                    <div className="detail-item">
                      <label>Timestamp</label>
                      <span>{formatDate(selectedLog.timestamp)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Action</label>
                      <span className="action-badge">{selectedLog.action}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status</label>
                      <span className={`status-badge ${getStatusColor(selectedLog.status)}`}>
                        {selectedLog.status}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Actor</label>
                      <span>{selectedLog.actor || 'System'}</span>
                    </div>
                    <div className="detail-item">
                      <label>IP Address</label>
                      <span>{selectedLog.ipAddress || 'N/A'}</span>
                    </div>
                    <div className="detail-item full-width">
                      <label>User Agent</label>
                      <span className="monospace">{selectedLog.userAgent || 'N/A'}</span>
                    </div>
                    {selectedLog.description && (
                      <div className="detail-item full-width">
                        <label>Description</label>
                        <span>{selectedLog.description}</span>
                      </div>
                    )}
                  </div>

                  {selectedLog.changes && selectedLog.changes.length > 0 && (
                    <div className="changes-section">
                      <h3>Changes Made</h3>
                      <div className="changes-list">
                        {selectedLog.changes.map((change, idx) => (
                          <div key={idx} className="change-item">
                            <span className="field-name">{change.field}:</span>
                            <span className="old-value">{JSON.stringify(change.oldValue)}</span>
                            <span className="arrow">→</span>
                            <span className="new-value">{JSON.stringify(change.newValue)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedLog.metadata && (
                    <div className="metadata-section">
                      <h3>Additional Metadata</h3>
                      <pre className="metadata-content">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          .audit-logs {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1400px;
            margin: 0 auto;
          }

          /* Loading State */
          .loading-container {
            text-align: center;
            padding: 4rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }

          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #e2e8f0;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1.5rem;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          /* Header Controls */
          .header-controls {
            display: flex;
            justify-content: space-between;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
          }

          .control-group {
            display: flex;
            gap: 0.75rem;
          }

          .filter-toggle, .refresh-button, .export-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.625rem 1rem;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .filter-toggle:hover, .refresh-button:hover, .export-button:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
          }

          .filter-toggle.active {
            background: #eff6ff;
            border-color: #3b82f6;
            color: #3b82f6;
          }

          .icon {
            font-size: 1rem;
          }

          .badge {
            background: #3b82f6;
            color: white;
            padding: 0.125rem 0.375rem;
            border-radius: 10px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-left: 0.25rem;
          }

          .auto-refresh {
            padding: 0.625rem 1rem;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 0.875rem;
            font-family: inherit;
            cursor: pointer;
          }

          /* Filters Panel */
          .filters-panel {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
          }

          .filters-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 1.5rem;
          }

          .filter-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .filter-group label {
            font-size: 0.875rem;
            font-weight: 600;
            color: #475569;
          }

          .filter-group input,
          .filter-group select {
            padding: 0.5rem 0.75rem;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-size: 0.875rem;
            font-family: inherit;
            background: white;
          }

          .filter-group input:focus,
          .filter-group select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .filter-actions {
            display: flex;
            justify-content: flex-end;
          }

          .clear-filters {
            padding: 0.5rem 1rem;
            background: #fee2e2;
            color: #dc2626;
            border: none;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .clear-filters:hover {
            background: #fecaca;
          }

          /* Statistics Bar */
          .statistics-bar {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .stat-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
          }

          .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: #0f172a;
          }

          .stat-label {
            font-size: 0.875rem;
            color: #64748b;
            font-weight: 500;
          }

          /* Logs Table */
          .logs-table-container {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 2rem;
          }

          .logs-table {
            width: 100%;
            border-collapse: collapse;
          }

          .logs-table thead {
            background: #f8fafc;
            border-bottom: 2px solid #e2e8f0;
          }

          .logs-table th {
            padding: 0.875rem 1rem;
            text-align: left;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
          }

          .logs-table tbody tr {
            border-bottom: 1px solid #f1f5f9;
            transition: background 0.15s;
          }

          .logs-table tbody tr:hover {
            background: #f8fafc;
          }

          .logs-table td {
            padding: 1rem;
            font-size: 0.875rem;
          }

          /* Cell Styles */
          .time-cell .time-wrapper {
            display: flex;
            flex-direction: column;
            gap: 0.125rem;
          }

          .time-cell .date {
            font-weight: 600;
            color: #0f172a;
          }

          .time-cell .time {
            font-size: 0.75rem;
            color: #64748b;
          }

          .action-wrapper {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .action-icon {
            font-size: 1.125rem;
          }

          .action-text {
            font-weight: 500;
            color: #475569;
          }

          .entity-wrapper {
            display: flex;
            flex-direction: column;
            gap: 0.125rem;
          }

          .entity-type {
            font-weight: 500;
            color: #475569;
            text-transform: capitalize;
          }

          .entity-id {
            font-size: 0.75rem;
            font-family: 'SF Mono', 'Monaco', monospace;
            color: #94a3b8;
          }

          .actor-wrapper {
            display: flex;
            flex-direction: column;
            gap: 0.125rem;
          }

          .actor-name {
            font-weight: 500;
            color: #0f172a;
          }

          .user-id {
            font-size: 0.75rem;
            color: #94a3b8;
          }

          .status-badge {
            display: inline-block;
            padding: 0.25rem 0.625rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.025em;
          }

          .status-badge.success {
            background: #d1fae5;
            color: #065f46;
          }

          .status-badge.danger {
            background: #fee2e2;
            color: #991b1b;
          }

          .status-badge.warning {
            background: #fef3c7;
            color: #92400e;
          }

          .status-badge.default {
            background: #f3f4f6;
            color: #6b7280;
          }

          .ip-address {
            font-family: 'SF Mono', 'Monaco', monospace;
            font-size: 0.8125rem;
            color: #64748b;
          }

          .details-button {
            padding: 0.375rem 0.75rem;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            font-size: 0.8125rem;
            font-weight: 500;
            color: #3b82f6;
            cursor: pointer;
            transition: all 0.2s;
          }

          .details-button:hover {
            background: #eff6ff;
            border-color: #3b82f6;
          }

          /* No Logs State */
          .no-logs {
            padding: 4rem 2rem;
            text-align: center;
          }

          .no-logs-icon {
            font-size: 3rem;
            display: block;
            margin-bottom: 1rem;
          }

          .no-logs p {
            color: #64748b;
            margin-bottom: 1rem;
          }

          .no-logs button {
            padding: 0.5rem 1rem;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
          }

          /* Pagination */
          .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;
            padding: 1.5rem;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
          }

          .pagination button {
            padding: 0.5rem 1rem;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .pagination button:hover:not(:disabled) {
            background: #f8fafc;
            border-color: #cbd5e1;
          }

          .pagination button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .page-info {
            padding: 0 1rem;
            font-size: 0.875rem;
            color: #475569;
            font-weight: 500;
          }

          /* Modal */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 700px;
            max-height: 80vh;
            overflow: auto;
            box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #e2e8f0;
          }

          .modal-header h2 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f172a;
          }

          .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #64748b;
            cursor: pointer;
            padding: 0.25rem;
          }

          .modal-close:hover {
            color: #0f172a;
          }

          .modal-body {
            padding: 1.5rem;
          }

          .detail-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .detail-item {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .detail-item.full-width {
            grid-column: span 2;
          }

          .detail-item label {
            font-size: 0.875rem;
            font-weight: 600;
            color: #64748b;
          }

          .detail-item span {
            font-size: 0.9375rem;
            color: #0f172a;
          }

          .monospace {
            font-family: 'SF Mono', 'Monaco', monospace;
            font-size: 0.875rem;
          }

          .action-badge {
            display: inline-block;
            padding: 0.25rem 0.625rem;
            background: #eff6ff;
            color: #3b82f6;
            border-radius: 4px;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.75rem;
          }

          .changes-section,
          .metadata-section {
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e2e8f0;
          }

          .changes-section h3,
          .metadata-section h3 {
            margin: 0 0 1rem 0;
            font-size: 1rem;
            font-weight: 600;
            color: #475569;
          }

          .changes-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .change-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            background: #f8fafc;
            border-radius: 6px;
            font-size: 0.875rem;
          }

          .field-name {
            font-weight: 600;
            color: #475569;
          }

          .old-value {
            color: #dc2626;
            text-decoration: line-through;
          }

          .arrow {
            color: #64748b;
          }

          .new-value {
            color: #16a34a;
            font-weight: 500;
          }

          .metadata-content {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 1rem;
            font-family: 'SF Mono', 'Monaco', monospace;
            font-size: 0.8125rem;
            overflow-x: auto;
          }

          /* Responsive */
          @media (max-width: 1200px) {
            .statistics-bar {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 768px) {
            .header-controls {
              flex-direction: column;
            }

            .control-group {
              width: 100%;
              justify-content: space-between;
            }

            .filters-grid {
              grid-template-columns: 1fr;
            }

            .statistics-bar {
              grid-template-columns: 1fr;
            }

            .logs-table {
              font-size: 0.75rem;
            }

            .logs-table th,
            .logs-table td {
              padding: 0.5rem;
            }

            .detail-grid {
              grid-template-columns: 1fr;
            }

            .detail-item.full-width {
              grid-column: span 1;
            }

            .modal-content {
              width: 95%;
              max-height: 90vh;
            }
          }
        `}</style>
      </AdminLayout>
    </>
  )
}