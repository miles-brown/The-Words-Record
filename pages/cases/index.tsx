import { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { CaseCardSkeleton } from '@/components/LoadingSkeletons'
import { format } from 'date-fns'

export default function CasesPage() {
  const [cases, setCases] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('date-desc')
  const [selectedTag, setSelectedTag] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [includeArchived, setIncludeArchived] = useState(false)
  const [tags, setTags] = useState([])

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const { page, totalPages } = pagination

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (page > 3) {
        pages.push('...')
      }

      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (page < totalPages - 2) {
        pages.push('...')
      }

      pages.push(totalPages)
    }

    return pages
  }

  useEffect(() => {
    fetchTags()
  }, [])

  useEffect(() => {
    fetchCases(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, selectedTag, statusFilter, includeArchived])

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      if (response.ok) {
        const data = await response.json()
        setTags(data.tags)
      }
    } catch (err) {
      console.error('Failed to fetch tags:', err)
    }
  }

  const fetchCases = async (page: number) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy: sortBy,
        ...(selectedTag && { tag: selectedTag }),
        ...(statusFilter && { status: statusFilter }),
        ...(includeArchived && { includeArchived: 'true' })
      })

      const response = await fetch(`/api/cases?${params}`)
      if (!response.ok) throw new Error('Failed to fetch cases')

      const data = await response.json()
      setCases(data.cases)
      setPagination(data.pagination)
    } catch (err) {
      setError('Failed to load cases. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const hasActiveFilters = selectedTag || statusFilter || includeArchived

  return (
    <Layout
      title="Cases - Multi-Statement Incidents"
      description="Browse high-impact cases with multiple statements, responses, and widespread coverage"
    >
      <div className="cases-page">
        <div className="page-header">
          <h1>Cases</h1>
          <p className="page-description">
            Major incidents and controversies with multiple statements, public responses,
            and significant coverage. Cases represent clusters of related statements
            that have generated substantial public attention.
          </p>
          <div className="cases-vs-statements">
            <p>
              Looking for individual statements? Visit the <Link href="/statements">Statements page</Link>.
            </p>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="controls">
          <div className="filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="DOCUMENTED">Documented</option>
              <option value="ONGOING">Ongoing</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DISPUTED">Disputed</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="tag-filter">Topic:</label>
            <select
              id="tag-filter"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="">All Topics</option>
              {tags.map((tag: any) => (
                <option key={tag.id} value={tag.slug}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sort-group">
            <label htmlFor="sort-by">Sort by:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
            </select>
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={(e) => setIncludeArchived(e.target.checked)}
              />
              <span>Include archived</span>
            </label>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="clear-filters"
              onClick={() => {
                setSelectedTag('')
                setStatusFilter('')
                setIncludeArchived(false)
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {error && (
          <div className="error-message" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => fetchCases(pagination.page)}>Try Again</button>
          </div>
        )}

        <div className="cases-list">
          {loading ? (
            <>
              {[...Array(5)].map((_, i) => (
                <CaseCardSkeleton key={i} />
              ))}
            </>
          ) : cases.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h2>No Cases Found</h2>
              <p>
                Cases are major incidents with multiple statements and widespread coverage.
                {hasActiveFilters ? (
                  <>
                    <br />
                    Try adjusting your filters to see more results.
                  </>
                ) : (
                  <>
                    <br />
                    Individual statements are automatically promoted to cases when they meet
                    certain criteria: multiple responses, media coverage, or significant public reaction.
                    <br /><br />
                    Currently, no statements have been promoted to case status. Check the{' '}
                    <Link href="/statements">Statements page</Link> to see all documented statements.
                  </>
                )}
              </p>
            </div>
          ) : (
            cases.map((caseItem: any) => (
              <Link href={`/cases/${caseItem.slug}`} key={caseItem.id}>
                <article className="case-card">
                  <div className="case-header">
                    <div className="case-title-section">
                      <h2>{caseItem.title}</h2>
                      <div className="case-meta">
                        <span className="date">
                          {format(new Date(caseItem.caseDate), 'MMMM d, yyyy')}
                        </span>
                        {caseItem.status && (
                          <>
                            <span className="separator">•</span>
                            <span className={`status status-${caseItem.status.toLowerCase()}`}>
                              {caseItem.status}
                            </span>
                          </>
                        )}
                        {caseItem.severity && (
                          <>
                            <span className="separator">•</span>
                            <span className={`severity severity-${caseItem.severity.toLowerCase()}`}>
                              {caseItem.severity}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="case-summary">{caseItem.summary}</p>

                  {caseItem.people && caseItem.people.length > 0 && (
                    <div className="involved-section">
                      <strong>People Involved:</strong>{' '}
                      <span>{caseItem.people.map((p: any) => p.name).join(', ')}</span>
                    </div>
                  )}

                  {caseItem.organizations && caseItem.organizations.length > 0 && (
                    <div className="involved-section">
                      <strong>Organizations:</strong>{' '}
                      <span>{caseItem.organizations.map((o: any) => o.name).join(', ')}</span>
                    </div>
                  )}

                  <div className="case-footer">
                    <div className="case-metrics">
                      <div className="metric">
                        <span className="metric-value">{caseItem._count?.statements || 0}</span>
                        <span className="metric-label">
                          statement{caseItem._count?.statements !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="metric">
                        <span className="metric-value">{caseItem._count?.responses || 0}</span>
                        <span className="metric-label">
                          response{caseItem._count?.responses !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="metric">
                        <span className="metric-value">{caseItem._count?.sources || 0}</span>
                        <span className="metric-label">
                          source{caseItem._count?.sources !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {caseItem._count?.people > 0 && (
                        <div className="metric">
                          <span className="metric-value">{caseItem._count.people}</span>
                          <span className="metric-label">
                            {caseItem._count.people === 1 ? 'person' : 'people'}
                          </span>
                        </div>
                      )}
                    </div>

                    {caseItem.tags && caseItem.tags.length > 0 && (
                      <div className="tags">
                        {caseItem.tags.map((tag: any) => (
                          <span key={tag.id} className="tag">{tag.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            ))
          )}
        </div>

        {!loading && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              type="button"
              onClick={() => fetchCases(pagination.page - 1)}
              disabled={pagination.page === 1}
              aria-label="Previous page"
              className="pagination-prev"
            >
              Previous
            </button>

            <div className="page-numbers">
              {getPageNumbers().map((pageNum, index) => (
                typeof pageNum === 'number' ? (
                  <button
                    type="button"
                    key={index}
                    onClick={() => fetchCases(pageNum)}
                    className={`page-number ${pagination.page === pageNum ? 'active' : ''}`}
                    aria-label={`Go to page ${pageNum}`}
                    aria-current={pagination.page === pageNum ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                ) : (
                  <span key={index} className="page-ellipsis">
                    {pageNum}
                  </span>
                )
              ))}
            </div>

            <button
              type="button"
              onClick={() => fetchCases(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              aria-label="Next page"
              className="pagination-next"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .cases-page {
          max-width: 1000px;
          margin: 0 auto;
        }

        .page-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .page-header h1 {
          font-size: 2.5rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .page-description {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.8;
          max-width: 750px;
          margin: 0 auto 1rem;
        }

        .cases-vs-statements {
          margin-top: 1rem;
          padding: 1rem;
          background: var(--background-secondary);
          border-radius: 6px;
          display: inline-block;
        }

        .cases-vs-statements p {
          margin: 0;
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .cases-vs-statements a {
          color: var(--accent-primary);
          text-decoration: underline;
          font-weight: 500;
        }

        .cases-vs-statements a:hover {
          color: #2c3e50;
        }

        .controls {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
          padding: 1.5rem;
          background: var(--background-primary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .filter-group,
        .sort-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
          min-width: 160px;
        }

        .filter-group label,
        .sort-group label {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .filter-group select,
        .sort-group select {
          padding: 0.6rem;
          border: 1px solid var(--border-primary);
          border-radius: 6px;
          background: var(--background-primary);
          color: var(--text-primary);
          font-size: 0.95rem;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .filter-group select:hover,
        .sort-group select:hover {
          border-color: var(--border-secondary);
        }

        .filter-group select:focus,
        .sort-group select:focus {
          outline: none;
          border-color: var(--accent-primary);
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          padding-top: 1.5rem;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .checkbox-group input[type="checkbox"] {
          cursor: pointer;
          width: 18px;
          height: 18px;
        }

        .clear-filters {
          background: var(--text-secondary);
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: background 0.2s;
          white-space: nowrap;
          margin-top: 1.5rem;
        }

        .clear-filters:hover {
          background: var(--text-primary);
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          padding: 1rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .error-message p {
          color: #dc2626;
          margin-bottom: 1rem;
        }

        .error-message button {
          background: #dc2626;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .error-message button:hover {
          background: #b91c1c;
        }

        .cases-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .empty-state {
          text-align: center;
          padding: 5rem 2rem;
          background: var(--background-secondary);
          border-radius: 8px;
          border: 1px solid var(--border-primary);
        }

        .empty-state-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          opacity: 0.5;
        }

        .empty-state h2 {
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-size: 1.75rem;
        }

        .empty-state p {
          color: var(--text-secondary);
          line-height: 1.8;
          max-width: 600px;
          margin: 0 auto;
        }

        .empty-state a {
          color: var(--accent-primary);
          text-decoration: underline;
          font-weight: 500;
        }

        .empty-state a:hover {
          color: #2c3e50;
        }

        .case-card {
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 2rem;
          background: var(--background-primary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .case-card:hover {
          border-color: var(--accent-primary);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .case-header {
          margin-bottom: 1.25rem;
        }

        .case-title-section h2 {
          font-size: 1.5rem;
          color: var(--text-primary);
          line-height: 1.4;
          margin-bottom: 0.75rem;
        }

        .case-meta {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          flex-wrap: wrap;
          font-size: 0.9rem;
        }

        .date {
          color: var(--text-secondary);
        }

        .separator {
          color: var(--text-secondary);
          opacity: 0.5;
        }

        .status,
        .severity {
          padding: 0.25rem 0.65rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-documented {
          background: #e0f2fe;
          color: #0369a1;
        }

        .status-ongoing {
          background: #fef3c7;
          color: #d97706;
        }

        .status-resolved {
          background: #dcfce7;
          color: #15803d;
        }

        .status-disputed {
          background: #fee2e2;
          color: #dc2626;
        }

        .severity-low {
          background: #f0fdf4;
          color: #15803d;
        }

        .severity-moderate {
          background: #fef3c7;
          color: #d97706;
        }

        .severity-high {
          background: #fee2e2;
          color: #dc2626;
        }

        .severity-critical {
          background: #1e1b4b;
          color: white;
        }

        .case-summary {
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 1.25rem;
          font-size: 1rem;
        }

        .involved-section {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }

        .involved-section strong {
          color: var(--text-primary);
          font-weight: 600;
        }

        .case-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.25rem;
          padding-top: 1.25rem;
          margin-top: 1.25rem;
          border-top: 1px solid var(--border-primary);
        }

        .case-metrics {
          display: flex;
          gap: 1.5rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--accent-primary);
        }

        .metric-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag {
          background: var(--background-secondary);
          color: var(--text-primary);
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          font-size: 0.8rem;
          border: 1px solid var(--border-primary);
          font-weight: 500;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 3rem;
          flex-wrap: wrap;
        }

        .page-numbers {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .pagination-prev,
        .pagination-next {
          background: var(--accent-primary);
          color: white;
          border: none;
          padding: 0.6rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .pagination-prev:hover:not(:disabled),
        .pagination-next:hover:not(:disabled) {
          background: #2c3e50;
        }

        .pagination-prev:disabled,
        .pagination-next:disabled {
          background: var(--accent-secondary);
          cursor: not-allowed;
          opacity: 0.6;
        }

        .page-number {
          background: var(--background-primary);
          color: var(--text-primary);
          border: 1px solid var(--border-primary);
          padding: 0.5rem 0.85rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
          font-size: 0.9rem;
          min-width: 38px;
        }

        .page-number:hover {
          border-color: var(--accent-primary);
          background: var(--background-secondary);
        }

        .page-number.active {
          background: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
          cursor: default;
        }

        .page-ellipsis {
          color: var(--text-secondary);
          padding: 0.5rem 0.25rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .page-header h1 {
            font-size: 2rem;
          }

          .controls {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-group,
          .sort-group {
            min-width: auto;
          }

          .checkbox-group {
            padding-top: 0;
          }

          .clear-filters {
            margin-top: 0;
          }

          .case-header {
            flex-direction: column;
            gap: 0.5rem;
          }

          .case-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .case-footer {
            flex-direction: column;
            align-items: flex-start;
          }

          .case-metrics {
            width: 100%;
            justify-content: space-between;
          }

          .metric {
            flex: 1;
          }
        }
      `}</style>
    </Layout>
  )
}
