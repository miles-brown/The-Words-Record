import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'

interface Source {
  id: string
  title: string
  url: string | null
  publication: string | null
  author: string | null
  publishDate: string | null
  sourceType: string | null
  sourceLevel: string | null
  credibilityLevel: string | null
  credibilityScore: number | null
  verificationStatus: string | null
  verificationDate: string | null
  verifiedBy: string | null
  contentType: string | null
  isArchived: boolean
  archiveUrl: string | null
  archiveDate: string | null
  hasPaywall: boolean | null
  isOpinion: boolean | null
  isDeleted: boolean | null
  isBroken: boolean | null
  citationCount: number | null
  createdAt: string
  updatedAt: string
  isVerified?: boolean
  _count?: {
    primaryForStatements: number
  }
}

export default function AdminSources() {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const router = useRouter()

  useEffect(() => {
    fetchSources()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page, search])

  const fetchSources = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(search && { search }),
        ...(filter !== 'all' && { verified: filter === 'verified' ? 'true' : 'false' })
      })

      const response = await fetch(`/api/admin/sources?${params}`, { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setSources(data.sources || [])
        setTotal(data.pagination?.total || 0)
        setTotalPages(data.pagination?.totalPages || 1)
      } else {
        setError('Failed to load sources')
      }
    } catch (err) {
      setError('Failed to load sources')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const unverifiedCount = sources.filter(s => s.verificationStatus === 'UNVERIFIED').length
  const archivedCount = sources.filter(s => s.isArchived).length
  const brokenCount = sources.filter(s => s.isBroken).length

  const getCredibilityBadge = (level: string | null) => {
    const badges: Record<string, { label: string; className: string }> = {
      VERY_HIGH: { label: 'Very High', className: 'badge-success' },
      HIGH: { label: 'High', className: 'badge-success' },
      MIXED: { label: 'Mixed', className: 'badge-warning' },
      LOW: { label: 'Low', className: 'badge-danger' },
      VERY_LOW: { label: 'Very Low', className: 'badge-danger' },
      UNKNOWN: { label: 'Unknown', className: 'badge-gray' }
    }
    const badge = badges[level || 'UNKNOWN'] || badges.UNKNOWN
    return <span className={`badge ${badge.className}`}>{badge.label}</span>
  }

  const getVerificationBadge = (status: string | null) => {
    const badges: Record<string, { label: string; icon: string; className: string }> = {
      VERIFIED: { label: 'Verified', icon: '✓', className: 'badge-success' },
      PARTIALLY_VERIFIED: { label: 'Partial', icon: '~', className: 'badge-warning' },
      UNVERIFIED: { label: 'Unverified', icon: '⚠', className: 'badge-warning' },
      DISPUTED: { label: 'Disputed', icon: '!', className: 'badge-danger' },
      DEBUNKED: { label: 'Debunked', icon: '✗', className: 'badge-danger' }
    }
    const badge = badges[status || 'UNVERIFIED'] || badges.UNVERIFIED
    return (
      <span className={`badge ${badge.className}`}>
        <span className="badge-icon">{badge.icon}</span> {badge.label}
      </span>
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
            <div>
              <h1>📰 Sources Management</h1>
              <p className="subtitle">
                {total} {total === 1 ? 'source' : 'sources'} total
                {unverifiedCount > 0 && ` • ${unverifiedCount} unverified`}
                {brokenCount > 0 && ` • ${brokenCount} broken`}
                {archivedCount > 0 && ` • ${archivedCount} archived`}
              </p>
            </div>
            <div className="header-actions">
              {unverifiedCount > 0 && (
                <button
                  onClick={() => router.push('/admin/sources/verify')}
                  className="btn-warning"
                >
                  ⚠️ Verify {unverifiedCount}
                </button>
              )}
              <button onClick={() => router.push('/admin/sources/new')} className="btn-primary">
                ➕ Add Source
              </button>
            </div>
          </div>

          <div className="search-bar">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search by title, URL, publication, or author..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">Search</button>
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setSearchInput('')
                    setPage(1)
                  }}
                  className="clear-btn"
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          <div className="filter-bar">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => { setFilter('all'); setPage(1) }}
            >
              All Sources
            </button>
            <button
              className={`filter-btn ${filter === 'verified' ? 'active' : ''}`}
              onClick={() => { setFilter('verified'); setPage(1) }}
            >
              ✓ Verified
            </button>
            <button
              className={`filter-btn ${filter === 'unverified' ? 'active' : ''}`}
              onClick={() => { setFilter('unverified'); setPage(1) }}
            >
              ⚠ Unverified
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading sources...</p>
            </div>
          ) : sources.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📰</div>
              <h3>No sources {search ? 'found' : filter !== 'all' ? `(${filter})` : 'yet'}</h3>
              <p>
                {search
                  ? 'Try adjusting your search criteria.'
                  : filter !== 'all'
                  ? `No ${filter} sources found. Try changing the filter.`
                  : 'Start by adding your first source to the database.'}
              </p>
              {!search && filter === 'all' && (
                <button onClick={() => router.push('/admin/sources/new')} className="btn-primary">
                  Add Source
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="content-card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Publication</th>
                      <th>Author</th>
                      <th>Type</th>
                      <th>Level</th>
                      <th>Credibility</th>
                      <th>Status</th>
                      <th>Citations</th>
                      <th>Flags</th>
                      <th>Published</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((source) => {
                      const hasIssues = source.isBroken || source.isDeleted || (source.hasPaywall && !source.isArchived)
                      const statementCount = source._count?.primaryForStatements || 0

                      return (
                        <tr key={source.id} className={hasIssues ? 'row-warning' : ''}>
                          <td className="title-cell">
                            <div className="title-wrapper">
                              <span className="title-text" title={source.title}>
                                {source.title}
                              </span>
                              {source.url && (
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="url-icon"
                                  title={source.url}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  🔗
                                </a>
                              )}
                            </div>
                          </td>
                          <td>{source.publication || '—'}</td>
                          <td>{source.author || '—'}</td>
                          <td>
                            <code className="type-badge">
                              {source.sourceType?.replace('_', ' ') || 'Unknown'}
                            </code>
                          </td>
                          <td>
                            <code className="level-badge">
                              {source.sourceLevel || '—'}
                            </code>
                          </td>
                          <td>{getCredibilityBadge(source.credibilityLevel)}</td>
                          <td>{getVerificationBadge(source.verificationStatus)}</td>
                          <td className="text-center">
                            <span className={`citation-count ${statementCount > 0 ? 'has-citations' : ''}`}>
                              {statementCount}
                            </span>
                          </td>
                          <td>
                            <div className="flags">
                              {source.isArchived && <span className="flag flag-archived" title="Archived">📦</span>}
                              {source.isBroken && <span className="flag flag-broken" title="Broken link">🔴</span>}
                              {source.isDeleted && <span className="flag flag-deleted" title="Deleted">🗑️</span>}
                              {source.isOpinion && <span className="flag flag-opinion" title="Opinion piece">💭</span>}
                              {source.hasPaywall && !source.isArchived && (
                                <span className="flag flag-paywall" title="Paywall (not archived)">💰</span>
                              )}
                            </div>
                          </td>
                          <td className="date-cell">
                            {source.publishDate
                              ? new Date(source.publishDate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : '—'}
                          </td>
                          <td>
                            <button
                              onClick={() => router.push(`/admin/sources/${source.id}`)}
                              className="btn-sm"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="pagination-btn"
                  >
                    ← Previous
                  </button>
                  <span className="pagination-info">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="pagination-btn"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <style jsx>{`
          .admin-page {
            max-width: 1600px;
          }

          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }

          .page-header h1 {
            margin: 0 0 0.25rem 0;
            font-size: 1.875rem;
            font-weight: 700;
            color: var(--admin-text-primary, #0f172a);
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .subtitle {
            margin: 0;
            font-size: 0.9375rem;
            color: var(--admin-text-secondary, #64748b);
          }

          .header-actions {
            display: flex;
            gap: 0.75rem;
          }

          .btn-primary, .btn-warning {
            padding: 0.75rem 1.5rem;
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

          .btn-primary {
            background: linear-gradient(135deg, var(--admin-accent, #3b82f6) 0%, #2563eb 100%);
          }

          .btn-primary:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }

          .btn-warning {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          }

          .btn-warning:hover {
            background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
          }

          .search-bar {
            margin-bottom: 1rem;
          }

          .search-bar form {
            display: flex;
            gap: 0.75rem;
          }

          .search-input {
            flex: 1;
            max-width: 600px;
            padding: 0.75rem 1rem;
            border: 2px solid var(--admin-border, #e5e7eb);
            border-radius: 8px;
            font-size: 0.9375rem;
            transition: border-color 0.2s;
          }

          .search-input:focus {
            outline: none;
            border-color: var(--admin-accent, #3b82f6);
          }

          .search-btn, .clear-btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .search-btn {
            background: var(--admin-accent, #3b82f6);
            color: white;
          }

          .search-btn:hover {
            background: #2563eb;
          }

          .clear-btn {
            background: #f3f4f6;
            color: #64748b;
          }

          .clear-btn:hover {
            background: #e5e7eb;
          }

          .filter-bar {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            padding: 0.5rem;
            background: white;
            border-radius: 8px;
            border: 1px solid var(--admin-border, #e5e7eb);
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
            background: var(--admin-accent, #3b82f6);
            color: white;
          }

          .content-card {
            background: white;
            border-radius: 12px;
            padding: 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid #f3f4f6;
            overflow: hidden;
            margin-bottom: 1.5rem;
          }

          .data-table {
            width: 100%;
            border-collapse: collapse;
          }

          .data-table thead {
            background: var(--admin-bg, #f8fafc);
            border-bottom: 2px solid var(--admin-border, #e5e7eb);
          }

          .data-table th {
            text-align: left;
            padding: 1rem;
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--admin-text-secondary, #475569);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            white-space: nowrap;
          }

          .data-table td {
            padding: 0.875rem 1rem;
            border-bottom: 1px solid #f1f5f9;
            font-size: 0.875rem;
            color: var(--admin-text-primary, #0f172a);
          }

          .data-table tbody tr:hover {
            background: #fafbfc;
          }

          .data-table tbody tr.row-warning {
            background: #fffbeb;
          }

          .data-table tbody tr.row-warning:hover {
            background: #fef3c7;
          }

          .data-table tbody tr:last-child td {
            border-bottom: none;
          }

          .title-cell {
            max-width: 350px;
          }

          .title-wrapper {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .title-text {
            font-weight: 600;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
          }

          .url-icon {
            font-size: 0.875rem;
            text-decoration: none;
            opacity: 0.6;
            transition: opacity 0.2s;
          }

          .url-icon:hover {
            opacity: 1;
          }

          .type-badge, .level-badge {
            background: #f1f5f9;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-family: 'Monaco', 'Courier New', monospace;
            color: #64748b;
            text-transform: uppercase;
            white-space: nowrap;
          }

          .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.25rem 0.625rem;
            border-radius: 12px;
            font-size: 0.6875rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            white-space: nowrap;
          }

          .badge-icon {
            font-size: 0.75rem;
          }

          .badge-success {
            background: #d1fae5;
            color: #065f46;
          }

          .badge-warning {
            background: #fef3c7;
            color: #92400e;
          }

          .badge-danger {
            background: #fee2e2;
            color: #991b1b;
          }

          .badge-gray {
            background: #f3f4f6;
            color: #6b7280;
          }

          .text-center {
            text-align: center;
          }

          .citation-count {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 600;
            background: #f3f4f6;
            color: #9ca3af;
          }

          .citation-count.has-citations {
            background: #dbeafe;
            color: #1e40af;
          }

          .flags {
            display: flex;
            gap: 0.25rem;
            align-items: center;
          }

          .flag {
            font-size: 1rem;
            cursor: help;
            transition: transform 0.2s;
          }

          .flag:hover {
            transform: scale(1.2);
          }

          .date-cell {
            white-space: nowrap;
            font-size: 0.8125rem;
            color: #64748b;
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
            border-color: var(--admin-accent, #3b82f6);
            color: var(--admin-accent, #3b82f6);
          }

          .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem;
            padding: 1.5rem;
          }

          .pagination-btn {
            padding: 0.625rem 1.25rem;
            background: white;
            border: 2px solid var(--admin-border, #e5e7eb);
            border-radius: 8px;
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            color: #475569;
          }

          .pagination-btn:hover:not(:disabled) {
            background: #f8fafc;
            border-color: var(--admin-accent, #3b82f6);
            color: var(--admin-accent, #3b82f6);
          }

          .pagination-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .pagination-info {
            font-size: 0.9375rem;
            color: #64748b;
            font-weight: 500;
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
            padding: 4rem 2rem;
            color: #64748b;
          }

          .spinner {
            width: 40px;
            height: 40px;
            margin: 0 auto 1rem;
            border: 4px solid #f3f4f6;
            border-top: 4px solid var(--admin-accent, #3b82f6);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
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

          @media (max-width: 768px) {
            .page-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 1rem;
            }

            .header-actions {
              width: 100%;
              flex-direction: column;
            }

            .header-actions button {
              width: 100%;
            }

            .search-bar form {
              flex-direction: column;
            }

            .search-input {
              max-width: 100%;
            }

            .data-table {
              font-size: 0.75rem;
            }

            .data-table th,
            .data-table td {
              padding: 0.5rem;
            }

            .title-cell {
              max-width: 200px;
            }
          }
        `}</style>
      </AdminLayout>
    </>
  )
}
