import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'
import Link from 'next/link'

interface Statement {
  id: string
  content: string
  context: string | null
  statementDate: string
  statementType: string
  responseType: string | null
  verificationStatus: string | null
  credibilityScore: number | null
  category: string | null
  sentiment: string | null
  personId: string | null
  organizationId: string | null
  caseId: string | null
  primarySourceId: string | null
  respondsToId: string | null
  isPublic: boolean
  isVerified: boolean
  isFlagged: boolean
  flagReason: string | null
  hasMedia: boolean
  mediaType: string | null
  platform: string | null
  medium: string | null
  likes: number | null
  shares: number | null
  views: number | null
  responseCount: number | null
  isRetracted: boolean | null
  isDeleted: boolean | null
  isDisputed: boolean | null
  createdAt: string
  updatedAt: string
  person: {
    id: string
    firstName: string
    lastName: string
    fullName: string
    slug: string
    profession: string | null
  } | null
  organization: {
    id: string
    name: string
    slug: string
    organizationType: string | null
  } | null
  case: {
    id: string
    title: string
    slug: string
    status: string
  } | null
  primarySource: {
    id: string
    title: string
    url: string | null
    publication: string | null
    verificationStatus: string | null
  } | null
  respondsTo: {
    id: string
    content: string
    person: {
      fullName: string
    } | null
  } | null
  _count: {
    responses: number
    repercussions: number
    additionalSources: number
    analyses: number
  }
}

export default function AdminStatements() {
  const [statements, setStatements] = useState<Statement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified' | 'flagged'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const router = useRouter()

  useEffect(() => {
    fetchStatements()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page, search])

  const fetchStatements = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(search && { search })
      })

      const response = await fetch(`/api/admin/statements?${params}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Failed to fetch statements')
      }

      const data = await response.json()
      setStatements(data.statements || [])
      setTotal(data.pagination?.total || 0)
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (err) {
      setError('Failed to load statements')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const filteredStatements = statements.filter(stmt => {
    if (filter === 'verified') return stmt.isVerified
    if (filter === 'unverified') return !stmt.isVerified
    if (filter === 'flagged') return stmt.isFlagged
    return true
  })

  const unverifiedCount = statements.filter(s => !s.isVerified).length
  const flaggedCount = statements.filter(s => s.isFlagged).length
  const responseCount = statements.filter(s => s.statementType === 'RESPONSE').length

  const getVerificationBadge = (status: string | null, isVerified: boolean) => {
    if (status === 'VERIFIED' || isVerified) {
      return <span className="badge badge-success"><span className="badge-icon">✓</span> Verified</span>
    }
    if (status === 'DISPUTED') {
      return <span className="badge badge-danger"><span className="badge-icon">!</span> Disputed</span>
    }
    if (status === 'DEBUNKED') {
      return <span className="badge badge-danger"><span className="badge-icon">✗</span> Debunked</span>
    }
    return <span className="badge badge-gray"><span className="badge-icon">⚠</span> Unverified</span>
  }

  const getSentimentBadge = (sentiment: string | null) => {
    if (!sentiment) return <span className="badge badge-gray">—</span>
    const badges: Record<string, { className: string; icon: string }> = {
      POSITIVE: { className: 'badge-success', icon: '😊' },
      NEGATIVE: { className: 'badge-danger', icon: '😠' },
      NEUTRAL: { className: 'badge-gray', icon: '😐' },
      MIXED: { className: 'badge-warning', icon: '🤔' }
    }
    const badge = badges[sentiment] || badges.NEUTRAL
    return <span className={`badge ${badge.className}`}><span className="badge-icon">{badge.icon}</span> {sentiment}</span>
  }

  return (
    <>
      <Head>
        <title>Statements - Admin - The Words Record</title>
      </Head>

      <AdminLayout title="Statements">
        <div className="admin-page">
          <div className="page-header">
            <div>
              <h1>💬 Statements Management</h1>
              <p className="subtitle">
                {total} {total === 1 ? 'statement' : 'statements'} total
                {unverifiedCount > 0 && ` • ${unverifiedCount} unverified`}
                {flaggedCount > 0 && ` • ${flaggedCount} flagged`}
                {responseCount > 0 && ` • ${responseCount} responses`}
              </p>
            </div>
            <div className="header-actions">
              <button onClick={() => router.push('/admin/statements/new')} className="btn-primary">
                ➕ Add Statement
              </button>
            </div>
          </div>

          <div className="search-bar">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search by content, person, organization, or case..."
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
              All Statements
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
            <button
              className={`filter-btn ${filter === 'flagged' ? 'active' : ''}`}
              onClick={() => { setFilter('flagged'); setPage(1) }}
            >
              🚩 Flagged
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading statements...</p>
            </div>
          ) : filteredStatements.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3>No statements {search ? 'found' : filter !== 'all' ? `(${filter})` : 'yet'}</h3>
              <p>
                {search
                  ? 'Try adjusting your search criteria.'
                  : filter !== 'all'
                  ? `No ${filter} statements found. Try changing the filter.`
                  : 'Start by adding your first statement to the database.'}
              </p>
              {!search && filter === 'all' && (
                <button onClick={() => router.push('/admin/statements/new')} className="btn-primary">
                  Add Statement
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="content-card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Content</th>
                      <th>Speaker</th>
                      <th>Case</th>
                      <th>Type</th>
                      <th>Response Type</th>
                      <th>Status</th>
                      <th>Platform</th>
                      <th>Medium</th>
                      <th>Source</th>
                      <th>Engagement</th>
                      <th>Relationships</th>
                      <th>Flags</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStatements.map((stmt) => {
                      const speaker = stmt.person
                        ? `${stmt.person.fullName || `${stmt.person.firstName} ${stmt.person.lastName}`}`
                        : stmt.organization
                        ? stmt.organization.name
                        : 'Unknown'

                      const hasRelationships =
                        stmt._count.responses > 0 ||
                        stmt._count.repercussions > 0 ||
                        stmt.respondsToId ||
                        stmt._count.additionalSources > 0

                      return (
                        <tr key={stmt.id} className={stmt.isFlagged ? 'row-warning' : ''}>
                          <td className="content-cell">
                            <div className="content-wrapper">
                              <span className="content-text" title={stmt.content}>
                                {stmt.content.length > 100 ? `${stmt.content.substring(0, 100)}...` : stmt.content}
                              </span>
                            </div>
                          </td>
                          <td>
                            {stmt.person ? (
                              <Link href={`/admin/people/${stmt.person.slug}`} className="speaker-link">
                                {speaker}
                              </Link>
                            ) : (
                              speaker
                            )}
                          </td>
                          <td>
                            {stmt.case ? (
                              <Link href={`/admin/cases/${stmt.case.id}`} className="case-link">
                                {stmt.case.title}
                              </Link>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td>
                            <code className="type-badge">
                              {stmt.statementType === 'RESPONSE' ? '↩️ RESPONSE' : '💬 ORIGINAL'}
                            </code>
                          </td>
                          <td>
                            {stmt.responseType ? (
                              <code className="type-badge response-type">
                                {stmt.responseType}
                              </code>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td>{getVerificationBadge(stmt.verificationStatus, stmt.isVerified)}</td>
                          <td>
                            {stmt.platform ? (
                              <span className="platform-badge">{stmt.platform}</span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td>
                            {stmt.medium ? (
                              <code className="type-badge">{stmt.medium}</code>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td>
                            {stmt.primarySource ? (
                              <span className="source-indicator" title={stmt.primarySource.title}>
                                📰 {stmt.primarySource.publication || 'Source'}
                              </span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td>
                            <div className="engagement-stats">
                              {(stmt.likes || stmt.shares || stmt.views) ? (
                                <>
                                  {stmt.likes != null && stmt.likes > 0 && (
                                    <span className="stat-badge" title="Likes">
                                      ❤️ {stmt.likes.toLocaleString()}
                                    </span>
                                  )}
                                  {stmt.shares != null && stmt.shares > 0 && (
                                    <span className="stat-badge" title="Shares">
                                      🔄 {stmt.shares.toLocaleString()}
                                    </span>
                                  )}
                                  {stmt.views != null && stmt.views > 0 && (
                                    <span className="stat-badge" title="Views">
                                      👁️ {stmt.views.toLocaleString()}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="relationships">
                              {stmt.respondsToId && (
                                <span className="rel-badge" title="Is a response">
                                  ↩️
                                </span>
                              )}
                              {stmt._count.responses > 0 && (
                                <span className="rel-badge" title={`${stmt._count.responses} responses`}>
                                  💬 {stmt._count.responses}
                                </span>
                              )}
                              {stmt._count.repercussions > 0 && (
                                <span className="rel-badge" title={`${stmt._count.repercussions} repercussions`}>
                                  ⚡ {stmt._count.repercussions}
                                </span>
                              )}
                              {stmt._count.additionalSources > 0 && (
                                <span className="rel-badge" title={`${stmt._count.additionalSources} additional sources`}>
                                  📎 {stmt._count.additionalSources}
                                </span>
                              )}
                              {!hasRelationships && <span className="text-muted">—</span>}
                            </div>
                          </td>
                          <td>
                            <div className="flags">
                              {stmt.isFlagged && (
                                <span className="flag flag-flagged" title={stmt.flagReason || 'Flagged'}>🚩</span>
                              )}
                              {stmt.isRetracted && (
                                <span className="flag flag-retracted" title="Retracted">↩️</span>
                              )}
                              {stmt.isDeleted && (
                                <span className="flag flag-deleted" title="Deleted">🗑️</span>
                              )}
                              {stmt.isDisputed && (
                                <span className="flag flag-disputed" title="Disputed">⚠️</span>
                              )}
                              {!stmt.isPublic && (
                                <span className="flag flag-private" title="Private">🔒</span>
                              )}
                              {stmt.hasMedia && (
                                <span className="flag flag-media" title={`Has ${stmt.mediaType || 'media'}`}>
                                  {stmt.mediaType === 'VIDEO' ? '🎥' : stmt.mediaType === 'AUDIO' ? '🎵' : '📷'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="date-cell">
                            {new Date(stmt.statementDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td>
                            <button
                              onClick={() => router.push(`/admin/statements/${stmt.id}`)}
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
            max-width: 100%;
            width: 100%;
            padding: 0 1rem;
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

          .btn-primary {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, var(--admin-accent, #3b82f6) 0%, #2563eb 100%);
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

          .search-bar {
            margin-bottom: 1rem;
          }

          .search-bar form {
            display: flex;
            gap: 0.75rem;
          }

          .search-input {
            flex: 1;
            max-width: 700px;
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
            overflow-x: auto;
            overflow-y: visible;
            margin-bottom: 1.5rem;
          }

          .data-table {
            width: 100%;
            min-width: 2000px;
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

          .content-cell {
            max-width: 400px;
          }

          .content-wrapper {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .content-text {
            font-weight: 500;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
          }

          .speaker-link, .case-link {
            color: var(--admin-accent, #3b82f6);
            text-decoration: none;
            font-weight: 600;
          }

          .speaker-link:hover, .case-link:hover {
            text-decoration: underline;
          }

          .type-badge {
            background: #f1f5f9;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-family: 'Monaco', 'Courier New', monospace;
            color: #64748b;
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

          .source-indicator {
            font-size: 0.8125rem;
            color: #64748b;
          }

          .relationships {
            display: flex;
            gap: 0.375rem;
            align-items: center;
            flex-wrap: wrap;
          }

          .rel-badge {
            font-size: 0.75rem;
            padding: 0.125rem 0.375rem;
            background: #f1f5f9;
            border-radius: 4px;
            white-space: nowrap;
          }

          .platform-badge {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
            background: #dbeafe;
            color: #1e40af;
            border-radius: 4px;
            font-weight: 600;
            white-space: nowrap;
          }

          .engagement-stats {
            display: flex;
            gap: 0.375rem;
            align-items: center;
            flex-wrap: wrap;
          }

          .stat-badge {
            font-size: 0.6875rem;
            padding: 0.125rem 0.375rem;
            background: #f1f5f9;
            border-radius: 4px;
            white-space: nowrap;
            color: #475569;
            font-weight: 600;
          }

          .response-type {
            background: #fef3c7;
            color: #92400e;
          }

          .flags {
            display: flex;
            gap: 0.25rem;
            align-items: center;
            flex-wrap: wrap;
          }

          .flag {
            font-size: 1rem;
            cursor: help;
            transition: transform 0.2s;
          }

          .flag:hover {
            transform: scale(1.2);
          }

          .text-muted {
            color: #9ca3af;
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

            .content-cell {
              max-width: 200px;
            }
          }
        `}</style>
      </AdminLayout>
    </>
  )
}
