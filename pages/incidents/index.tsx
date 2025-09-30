// @ts-nocheck
import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { IncidentCardSkeleton } from '@/components/LoadingSkeletons'
import { IncidentWithRelations } from '@/types'
import { format } from 'date-fns'

interface IncidentsPageProps {
  initialData?: {
    incidents: IncidentWithRelations[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export default function IncidentsPage({ initialData }: IncidentsPageProps) {
  const [incidents, setIncidents] = useState(initialData?.incidents || [])
  const [pagination, setPagination] = useState(initialData?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    tag: '',
    person: ''
  })

  useEffect(() => {
    if (!initialData) {
      fetchIncidents(1)
    }
  }, [])

  const fetchIncidents = async (page: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.status && { status: filters.status }),
        ...(filters.tag && { tag: filters.tag }),
        ...(filters.person && { person: filters.person })
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

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
  }

  const applyFilters = () => {
    fetchIncidents(1)
  }

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case 'high': return 'severity-high'
      case 'medium': return 'severity-medium'
      case 'low': return 'severity-low'
      default: return ''
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'documented': return 'status-documented'
      case 'ongoing': return 'status-ongoing'
      case 'resolved': return 'status-resolved'
      default: return ''
    }
  }

  return (
    <Layout
      title="Incidents"
      description="Browse documented incidents and public statements"
    >
      <div className="incidents-page">
        <div className="page-header">
          <h1>Incidents & Events</h1>
          <p className="page-description">
            Comprehensive documentation of public statements, allegations, and responses.
            Each incident is thoroughly researched with verified sources.
          </p>
        </div>

        <div className="filters-section">
          <h2>Filter Incidents</h2>
          <div className="filters">
            <div className="filter-group">
              <label htmlFor="status-filter">Status</label>
              <select
                id="status-filter"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="documented">Documented</option>
                <option value="ongoing">Ongoing</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <button onClick={applyFilters} className="apply-filters">
              Apply Filters
            </button>
          </div>
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
            incidents.map((incident) => (
              <Link href={`/incidents/${incident.slug}`} key={incident.id}>
                <article className="incident-card">
                  <div className="incident-header">
                    <h2>{incident.title}</h2>
                    <div className="incident-meta">
                      <span className="date">
                        <time dateTime={incident.incidentDate}>
                          {format(new Date(incident.incidentDate), 'MMMM d, yyyy')}
                        </time>
                      </span>
                      <span className={`status ${getStatusColor(incident.status)}`}>
                        {incident.status}
                      </span>
                      {incident.severity && (
                        <span className={`severity ${getSeverityColor(incident.severity)}`}>
                          {incident.severity} severity
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="incident-summary">{incident.summary}</p>

                  {incident.persons && incident.persons.length > 0 && (
                    <div className="involved-persons">
                      <strong>Involved:</strong> {incident.persons.map(p => p.name).join(', ')}
                    </div>
                  )}

                  <div className="incident-stats">
                    <span>
                      <strong>{incident._count?.statements || 0}</strong> statements
                    </span>
                    <span>
                      <strong>{incident._count?.responses || 0}</strong> responses
                    </span>
                    <span>
                      <strong>{incident._count?.sources || 0}</strong> sources
                    </span>
                  </div>

                  {incident.tags && incident.tags.length > 0 && (
                    <div className="tags">
                      {incident.tags.map(tag => (
                        <span key={tag.id} className="tag">{tag.name}</span>
                      ))}
                    </div>
                  )}
                </article>
              </Link>
            ))
          )}
        </div>

        {!loading && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => fetchIncidents(pagination.page - 1)}
              disabled={pagination.page === 1}
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="page-info">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchIncidents(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .incidents-page {
          max-width: 1000px;
          margin: 0 auto;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .page-header h1 {
          font-size: 2.5rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .page-description {
          font-size: 1.1rem;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 700px;
          margin: 0 auto;
        }

        .filters-section {
          background: var(--background-secondary);
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .filters-section h2 {
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }

        .filters {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-weight: 500;
          color: var(--text-primary);
        }

        .filter-group select {
          padding: 0.5rem;
          border: 1px solid var(--border-primary);
          border-radius: 4px;
          background: white;
          min-width: 150px;
        }

        .apply-filters {
          background: var(--accent-primary);
          color: white;
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .apply-filters:hover {
          background: #2980b9;
        }

        .error-message {
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .error-message p {
          color: #c33;
          margin-bottom: 1rem;
        }

        .error-message button {
          background: #c33;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .incidents-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .incident-card {
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 2rem;
          background: var(--background-primary);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .incident-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .incident-header {
          margin-bottom: 1rem;
        }

        .incident-header h2 {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin-bottom: 0.8rem;
        }

        .incident-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .incident-meta span {
          font-size: 0.9rem;
          padding: 0.3rem 0.8rem;
          border-radius: 4px;
        }

        .date {
          background: var(--background-secondary);
          color: var(--text-secondary);
        }

        .status {
          font-weight: 500;
        }

        .status-documented {
          background: #d5f4e6;
          color: #27ae60;
        }

        .status-ongoing {
          background: #ffeaa7;
          color: #f39c12;
        }

        .status-resolved {
          background: #dfe6e9;
          color: #2d3436;
        }

        .severity-high {
          background: #fee;
          color: #c33;
        }

        .severity-medium {
          background: #fff3cd;
          color: #856404;
        }

        .severity-low {
          background: #d1ecf1;
          color: #0c5460;
        }

        .incident-summary {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .involved-persons {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .involved-persons strong {
          color: var(--text-primary);
        }

        .incident-stats {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .incident-stats strong {
          color: var(--text-primary);
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag {
          background: var(--accent-primary);
          color: white;
          padding: 0.3rem 0.8rem;
          border-radius: 4px;
          font-size: 0.8rem;
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
          gap: 2rem;
          margin-top: 3rem;
        }

        .pagination button {
          background: var(--accent-primary);
          color: white;
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .pagination button:hover:not(:disabled) {
          background: #2980b9;
        }

        .pagination button:disabled {
          background: var(--text-secondary);
          cursor: not-allowed;
        }

        .page-info {
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .page-header h1 {
            font-size: 2rem;
          }

          .filters {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-group select {
            width: 100%;
          }

          .incident-meta {
            justify-content: center;
          }

          .incident-stats {
            justify-content: center;
          }
        }
      `}</style>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/incidents?page=1&limit=10`)
    if (!response.ok) {
      throw new Error('Failed to fetch')
    }
    
    const data = await response.json()
    
    return {
      props: {
        initialData: data
      }
    }
  } catch (error) {
    console.error('Error fetching incidents:', error)
    return {
      props: {}
    }
  }
}