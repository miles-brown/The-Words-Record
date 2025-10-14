import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'

interface Source {
  id: string
  url: string
  title: string | null
  publisher: string | null
  isVerified: boolean
  createdAt: string
}

export default function AdminSources() {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all')
  const router = useRouter()

  useEffect(() => {
    fetchSources()
  }, [filter])

  const fetchSources = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('verified', filter === 'verified' ? 'true' : 'false')
      }

      const response = await fetch(`/api/admin/sources?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSources(data.sources || [])
      } else {
        setError('Failed to load sources')
      }
    } catch (err) {
      setError('Failed to load sources')
    } finally {
      setLoading(false)
    }
  }

  const unverifiedCount = sources.filter(s => !s.isVerified).length

  if (loading) {
    return (
      <AdminLayout title="Sources">
        <div className="loading">Loading sources...</div>
      </AdminLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Sources - Admin - The Words Record</title>
      </Head>

      <AdminLayout title="Sources">
        <div className="admin-page">
          <div className="page-header">
            <h1>Sources Management</h1>
            <div className="header-actions">
              {unverifiedCount > 0 && (
                <button
                  onClick={() => router.push('/admin/sources/verify')}
                  className="btn-warning"
                >
                  <span>⚠️</span> Verify {unverifiedCount} Source{unverifiedCount !== 1 ? 's' : ''}
                </button>
              )}
              <button onClick={() => router.push('/admin/sources/new')} className="btn-primary">
                <span>➕</span> Add Source
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="filter-bar">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Sources
            </button>
            <button
              className={`filter-btn ${filter === 'verified' ? 'active' : ''}`}
              onClick={() => setFilter('verified')}
            >
              Verified
            </button>
            <button
              className={`filter-btn ${filter === 'unverified' ? 'active' : ''}`}
              onClick={() => setFilter('unverified')}
            >
              Unverified
            </button>
          </div>

          {sources.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📰</div>
              <h3>No sources {filter !== 'all' ? `(${filter})` : 'yet'}</h3>
              <p>
                {filter !== 'all'
                  ? `No ${filter} sources found. Try changing the filter.`
                  : 'Start by adding your first source to the database.'}
              </p>
              {filter === 'all' && (
                <button onClick={() => router.push('/admin/sources/new')} className="btn-primary">
                  Add Source
                </button>
              )}
            </div>
          ) : (
            <div className="content-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Publisher</th>
                    <th>URL</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((source) => (
                    <tr key={source.id}>
                      <td className="font-semibold">{source.title || 'Untitled'}</td>
                      <td>{source.publisher || '—'}</td>
                      <td className="url-cell">
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="url-link">
                          {new URL(source.url).hostname}
                        </a>
                      </td>
                      <td>
                        <span className={`status-badge ${source.isVerified ? 'verified' : 'unverified'}`}>
                          {source.isVerified ? '✓ Verified' : '⚠ Unverified'}
                        </span>
                      </td>
                      <td>{new Date(source.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => router.push(`/admin/sources/${source.id}`)}
                          className="btn-sm"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <style jsx>{`
          .admin-page {
            max-width: 1400px;
          }

          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }

          .page-header h1 {
            margin: 0;
            font-size: 1.875rem;
            font-weight: 700;
            color: #0f172a;
          }

          .header-actions {
            display: flex;
            gap: 0.75rem;
          }

          .btn-primary {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .btn-primary:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }

          .btn-warning {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .btn-warning:hover {
            background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
          }

          .filter-bar {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            padding: 0.5rem;
            background: white;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }

          .filter-btn {
            padding: 0.5rem 1rem;
            background: transparent;
            border: none;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            color: #64748b;
          }

          .filter-btn:hover {
            background: #f8fafc;
            color: #0f172a;
          }

          .filter-btn.active {
            background: #3b82f6;
            color: white;
          }

          .content-card {
            background: white;
            border-radius: 12px;
            padding: 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid #f3f4f6;
            overflow: hidden;
          }

          .data-table {
            width: 100%;
            border-collapse: collapse;
          }

          .data-table thead {
            background: #f8fafc;
            border-bottom: 2px solid #e5e7eb;
          }

          .data-table th {
            text-align: left;
            padding: 1rem 1.5rem;
            font-size: 0.8125rem;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .data-table td {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #f1f5f9;
            font-size: 0.9375rem;
            color: #0f172a;
          }

          .data-table tbody tr:hover {
            background: #fafbfc;
          }

          .data-table tbody tr:last-child td {
            border-bottom: none;
          }

          .font-semibold {
            font-weight: 600;
          }

          .url-cell {
            max-width: 200px;
          }

          .url-link {
            color: #3b82f6;
            text-decoration: none;
            font-size: 0.875rem;
            font-family: 'Monaco', 'Courier New', monospace;
          }

          .url-link:hover {
            text-decoration: underline;
          }

          .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .status-badge.verified {
            background: #d1fae5;
            color: #065f46;
          }

          .status-badge.unverified {
            background: #fef3c7;
            color: #92400e;
          }

          .btn-sm {
            padding: 0.375rem 0.875rem;
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 0.8125rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            color: #475569;
          }

          .btn-sm:hover {
            background: #f8fafc;
            border-color: #3b82f6;
            color: #3b82f6;
          }

          .empty-state {
            background: white;
            border-radius: 12px;
            padding: 4rem 2rem;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid #f3f4f6;
          }

          .empty-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }

          .empty-state h3 {
            margin: 0 0 0.5rem 0;
            font-size: 1.5rem;
            font-weight: 700;
            color: #0f172a;
          }

          .empty-state p {
            margin: 0 0 2rem 0;
            color: #64748b;
            font-size: 1rem;
          }

          .loading {
            text-align: center;
            padding: 3rem;
            color: #64748b;
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
        `}</style>
      </AdminLayout>
    </>
  )
}
