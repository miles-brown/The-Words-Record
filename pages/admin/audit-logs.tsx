import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'
import { format } from 'date-fns'

interface AuditLog {
  id: string
  action: string
  actorType: string
  actorId: string
  entityType: string
  entityId: string
  timestamp: string
  details: Record<string, any>
  apiKey?: {
    id: string
    name: string
  }
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState<Record<string, number>>({})

  // Filters
  const [action, setAction] = useState('')
  const [entityType, setEntityType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [page, action, entityType, startDate, endDate])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50'
      })

      if (action) params.set('action', action)
      if (entityType) params.set('entityType', entityType)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      if (search) params.set('search', search)

      const response = await fetch(`/api/admin/audit-logs?${params}`)
      if (!response.ok) throw new Error('Failed to fetch logs')

      const data = await response.json()
      setLogs(data.logs)
      setTotalPages(data.pagination.totalPages)
      setStats(data.stats || {})
    } catch (err) {
      setError('Failed to load audit logs')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchLogs()
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'action-create'
      case 'UPDATE': return 'action-update'
      case 'DELETE': return 'action-delete'
      case 'READ': return 'action-read'
      case 'EXPORT': return 'action-export'
      default: return 'action-other'
    }
  }

  return (
    <>
      <Head>
        <title>Audit Logs - Admin - The Words Record</title>
      </Head>

      <AdminLayout title="Audit Logs">
        <div className="audit-logs-page">
          <div className="page-header">
            <div>
              <h1>Audit Logs</h1>
              <p className="page-subtitle">System activity and change history</p>
            </div>
            <button onClick={fetchLogs} className="btn-secondary">
              Refresh
            </button>
          </div>

          {/* Stats Summary */}
          {stats && Object.keys(stats).length > 0 && (
            <div className="stats-grid">
              {Object.entries(stats).map(([actionType, count]) => (
                <div key={actionType} className="stat-card">
                  <div className="stat-label">{actionType}</div>
                  <div className="stat-value">{count}</div>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="filters-container">
            <div className="filter-row">
              <div className="filter-group">
                <label>Action</label>
                <select value={action} onChange={(e) => setAction(e.target.value)}>
                  <option value="">All Actions</option>
                  <option value="CREATE">CREATE</option>
                  <option value="READ">READ</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                  <option value="EXPORT">EXPORT</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Entity Type</label>
                <select value={entityType} onChange={(e) => setEntityType(e.target.value)}>
                  <option value="">All Types</option>
                  <option value="Case">Cases</option>
                  <option value="Statement">Statements</option>
                  <option value="Person">People</option>
                  <option value="Organization">Organizations</option>
                  <option value="User">Users</option>
                  <option value="ApiKey">API Keys</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-row">
              <div className="search-group">
                <input
                  type="text"
                  placeholder="Search entity ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} className="btn-primary">
                  Search
                </button>
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Loading audit logs...</div>
          ) : (
            <>
              <div className="logs-container">
                {logs.length === 0 ? (
                  <div className="empty-state">
                    <p>No audit logs found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="logs-list">
                    {logs.map((log) => (
                      <div key={log.id} className="log-entry">
                        <div className="log-header">
                          <span className={`action-badge ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                          <span className="entity-type">{log.entityType}</span>
                          <span className="timestamp">
                            {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                          </span>
                        </div>

                        <div className="log-body">
                          <div className="log-meta">
                            <strong>Entity ID:</strong> {log.entityId}
                          </div>
                          <div className="log-meta">
                            <strong>Actor:</strong> {log.actorType} ({log.actorId})
                          </div>
                          {log.apiKey && (
                            <div className="log-meta">
                              <strong>API Key:</strong> {log.apiKey.name}
                            </div>
                          )}
                        </div>

                        {log.details && Object.keys(log.details).length > 0 && (
                          <details className="log-details">
                            <summary>View Details</summary>
                            <pre>{JSON.stringify(log.details, null, 2)}</pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary"
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-secondary"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <style jsx>{`
          .audit-logs-page {
            max-width: 1400px;
          }

          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 2rem;
          }

          .page-header h1 {
            margin: 0 0 0.5rem 0;
            font-size: 1.875rem;
            font-weight: 700;
            color: #0f172a;
          }

          .page-subtitle {
            margin: 0;
            font-size: 0.9375rem;
            color: #64748b;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .stat-card {
            background: white;
            border-radius: 8px;
            padding: 1rem;
            border: 1px solid #e5e7eb;
            text-align: center;
          }

          .stat-label {
            font-size: 0.875rem;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 0.5rem;
          }

          .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #0f172a;
          }

          .filters-container {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            border: 1px solid #e5e7eb;
          }

          .filter-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .filter-row:last-child {
            margin-bottom: 0;
          }

          .filter-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #0f172a;
          }

          .filter-group select,
          .filter-group input,
          .search-group input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 0.875rem;
          }

          .search-group {
            display: flex;
            gap: 0.5rem;
            grid-column: 1 / -1;
          }

          .search-group input {
            flex: 1;
          }

          .btn-primary {
            padding: 0.5rem 1.5rem;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-primary:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          }

          .btn-secondary {
            padding: 0.75rem 1.5rem;
            background: white;
            color: #475569;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-secondary:hover:not(:disabled) {
            background: #f8fafc;
            border-color: #94a3b8;
          }

          .btn-secondary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .error-message {
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #991b1b;
            padding: 1rem 1.25rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            font-weight: 500;
          }

          .loading {
            text-align: center;
            padding: 3rem;
            color: #64748b;
          }

          .empty-state {
            background: white;
            border-radius: 12px;
            padding: 3rem 2rem;
            text-align: center;
            color: #64748b;
            border: 1px solid #e5e7eb;
          }

          .logs-container {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            border: 1px solid #e5e7eb;
            margin-bottom: 2rem;
          }

          .logs-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .log-entry {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            transition: box-shadow 0.2s;
          }

          .log-entry:hover {
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }

          .log-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 0.75rem;
            flex-wrap: wrap;
          }

          .action-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
          }

          .action-create { background: #d1fae5; color: #065f46; }
          .action-update { background: #dbeafe; color: #1e40af; }
          .action-delete { background: #fee2e2; color: #991b1b; }
          .action-read { background: #e5e7eb; color: #475569; }
          .action-export { background: #fef3c7; color: #92400e; }
          .action-other { background: #f3e5f5; color: #7b1fa2; }

          .entity-type {
            font-weight: 600;
            color: #0f172a;
          }

          .timestamp {
            margin-left: auto;
            font-size: 0.875rem;
            color: #64748b;
          }

          .log-body {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .log-meta {
            font-size: 0.875rem;
            color: #475569;
          }

          .log-meta strong {
            color: #0f172a;
            font-weight: 600;
          }

          .log-details {
            margin-top: 0.75rem;
            padding: 0.75rem;
            background: #f8fafc;
            border-radius: 6px;
          }

          .log-details summary {
            cursor: pointer;
            font-weight: 600;
            color: #3b82f6;
            font-size: 0.875rem;
          }

          .log-details pre {
            margin-top: 0.75rem;
            font-size: 0.75rem;
            overflow-x: auto;
            padding: 0.5rem;
            background: white;
            border-radius: 4px;
          }

          .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem;
          }

          .page-info {
            font-size: 0.9375rem;
            color: #64748b;
          }

          @media (max-width: 768px) {
            .filter-row {
              grid-template-columns: 1fr;
            }

            .page-header {
              flex-direction: column;
              gap: 1rem;
            }

            .log-header {
              flex-direction: column;
              align-items: flex-start;
            }

            .timestamp {
              margin-left: 0;
            }
          }
        `}</style>
      </AdminLayout>
    </>
  )
}
