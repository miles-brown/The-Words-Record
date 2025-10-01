// @ts-nocheck
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { IncidentCardSkeleton } from '@/components/LoadingSkeletons'
import { IncidentWithRelations } from '@/types'
import { format } from 'date-fns'

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([])
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
  const [tags, setTags] = useState([])

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const { page, totalPages } = pagination

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (page > 3) {
        pages.push('...')
      }

      // Show pages around current page
      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (page < totalPages - 2) {
        pages.push('...')
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  useEffect(() => {
    fetchTags()
  }, [])

  useEffect(() => {
    fetchIncidents(1)
  }, [sortBy, selectedTag])

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

  const fetchIncidents = async (page: number) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy: sortBy,
        ...(selectedTag && { tag: selectedTag })
      })

      const response = await fetch(`/api/incidents?${params}`)
      if (!response.ok) throw new Error('Failed to fetch incidents')

      const data = await response.json()
      setIncidents(data.incidents)
      setPagination(data.pagination)
    } catch (err) {
      setError('Failed to load incidents. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout
      title="What?"
      description="Browse documented statements and public responses"
    >
      <div className="incidents-page">
        <div className="page-header">
          <h1>What?</h1>
          <p className="page-description">
            Comprehensive documentation of public statements, allegations, and responses.
            Each entry is thoroughly researched with verified sources.
          </p>
        </div>

        {/* Top Ad Banner */}
        <div className="ad-banner ad-banner-top">
          <p>Advertisement</p>
        </div>

        {/* Filters and Sorting */}
        <div className="controls">
          <div className="filter-group">
            <label htmlFor="tag-filter">Filter by tag:</label>
            <select
              id="tag-filter"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="">All Tags</option>
              {tags.map((tag) => (
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

          {selectedTag && (
            <button
              className="clear-filter"
              onClick={() => setSelectedTag('')}
            >
              Clear Filter
            </button>
          )}
        </div>

        {error && (
          <div className="error-message" role="alert">
            <p>{error}</p>
            <button onClick={() => fetchIncidents(pagination.page)}>Try Again</button>
          </div>
        )}

        <div className="incidents-list">
          {loading ? (
            <>
              {[...Array(10)].map((_, i) => (
                <IncidentCardSkeleton key={i} />
              ))}
            </>
          ) : incidents.length === 0 ? (
            <div className="no-results">
              <h2>No incidents found</h2>
              <p>Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            incidents.map((incident, index) => (
              <>
                <Link href={`/incidents/${incident.slug}`} key={incident.id}>
                  <article className="incident-card">
                    <div className="incident-header">
                      <h2>{incident.title}</h2>
                      <span className="date">
                        {format(new Date(incident.incidentDate), 'MMMM d, yyyy')}
                      </span>
                    </div>

                    <p className="incident-excerpt">{incident.summary}</p>

                    {incident.persons && incident.persons.length > 0 && (
                      <div className="involved-persons">
                        <strong>Involved:</strong> {incident.persons.map(p => p.name).join(', ')}
                      </div>
                    )}

                    <div className="incident-footer">
                      <div className="incident-stats">
                        <span>
                          {incident._count?.statements || 0} statement{incident._count?.statements !== 1 ? 's' : ''}
                        </span>
                        <span>•</span>
                        <span>
                          {incident._count?.responses || 0} response{incident._count?.responses !== 1 ? 's' : ''}
                        </span>
                        <span>•</span>
                        <span>
                          {incident._count?.sources || 0} source{incident._count?.sources !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {incident.tags && incident.tags.length > 0 && (
                        <div className="tags">
                          {incident.tags.map(tag => (
                            <span key={tag.id} className="tag">{tag.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                </Link>

                {/* Ad Banner every 2 incidents */}
                {(index + 1) % 2 === 0 && index !== incidents.length - 1 && (
                  <div className="ad-banner ad-banner-between" key={`ad-${index}`}>
                    <p>Advertisement</p>
                  </div>
                )}
              </>
            ))
          )}
        </div>

        {!loading && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => fetchIncidents(pagination.page - 1)}
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
                    key={index}
                    onClick={() => fetchIncidents(pageNum)}
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
              onClick={() => fetchIncidents(pagination.page + 1)}
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
        .incidents-page {
          max-width: 900px;
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
          max-width: 700px;
          margin: 0 auto;
        }

        .ad-banner {
          background: var(--background-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 4px;
          padding: 3rem;
          text-align: center;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .ad-banner-top {
          margin-top: 1rem;
        }

        .ad-banner-between {
          margin: 2rem 0;
        }

        .controls {
          display: flex;
          gap: 1.5rem;
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
          min-width: 200px;
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

        .clear-filter {
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
        }

        .clear-filter:hover {
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

        .incidents-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .incident-card {
          border: 1px solid var(--border-primary);
          border-radius: 6px;
          padding: 1.75rem;
          background: var(--background-primary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .incident-card:hover {
          border-color: var(--border-secondary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .incident-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 1rem;
        }

        .incident-header h2 {
          font-size: 1.4rem;
          color: var(--text-primary);
          line-height: 1.4;
          flex: 1;
        }

        .date {
          font-size: 0.85rem;
          color: var(--text-secondary);
          white-space: nowrap;
          padding-top: 0.25rem;
        }

        .incident-excerpt {
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 1.25rem;
          font-size: 0.98rem;
        }

        .involved-persons {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .involved-persons strong {
          color: var(--text-primary);
          font-weight: 600;
        }

        .incident-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-primary);
        }

        .incident-stats {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag {
          background: var(--background-secondary);
          color: var(--text-primary);
          padding: 0.35rem 0.75rem;
          border-radius: 3px;
          font-size: 0.8rem;
          border: 1px solid var(--border-primary);
        }

        .no-results {
          text-align: center;
          padding: 4rem 0;
        }

        .no-results h2 {
          color: var(--text-secondary);
          margin-bottom: 1rem;
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

          .incident-header {
            flex-direction: column;
            gap: 0.5rem;
          }

          .date {
            align-self: flex-start;
          }

          .incident-footer {
            flex-direction: column;
            align-items: flex-start;
          }

          .incident-stats {
            width: 100%;
          }
        }
      `}</style>
    </Layout>
  )
}