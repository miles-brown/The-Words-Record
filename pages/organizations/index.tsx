// @ts-nocheck
import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { PersonCardSkeleton } from '@/components/LoadingSkeletons'
import { Organization } from '@/types'
import { format } from 'date-fns'

interface OrganizationsPageProps {
  initialData?: {
    organizations: (Organization & {
      _count: {
        incidents: number
        responses: number
      }
    })[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export default function OrganizationsPage({ initialData }: OrganizationsPageProps) {
  const [organizations, setOrganizations] = useState(initialData?.organizations || [])
  const [pagination, setPagination] = useState(initialData?.pagination || {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    if (!initialData) {
      fetchOrganizations(1)
    }
  }, [])

  const fetchOrganizations = async (page: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(filter && { type: filter })
      })
      
      const response = await fetch(`/api/organizations?${params}`)
      if (!response.ok) throw new Error('Failed to fetch organizations')
      
      const data = await response.json()
      setOrganizations(data.organizations)
      setPagination(data.pagination)
    } catch (err) {
      setError('Failed to load organizations. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilter = () => {
    fetchOrganizations(1)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'media': return 'type-media'
      case 'advocacy': return 'type-advocacy'
      case 'corporate': return 'type-corporate'
      case 'government': return 'type-government'
      case 'nonprofit': return 'type-nonprofit'
      default: return 'type-other'
    }
  }

  return (
    <Layout
      title="Organizations"
      description="Browse organizations involved in documented incidents and statements"
    >
      <div className="organizations-page">
        <div className="page-header">
          <h1>Organizations</h1>
          <p className="page-description">
            Explore organizations that have been involved in documented incidents, 
            made official statements, or responded to allegations.
          </p>
        </div>

        <div className="filters-section">
          <h2>Filter by Type</h2>
          <div className="filters">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter by organization type"
            >
              <option value="">All Types</option>
              <option value="media">Media</option>
              <option value="advocacy">Advocacy Groups</option>
              <option value="corporate">Corporate</option>
              <option value="government">Government</option>
              <option value="nonprofit">Non-profit</option>
            </select>
            <button onClick={applyFilter} className="apply-filter">
              Apply Filter
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message" role="alert">
            <p>{error}</p>
            <button onClick={() => fetchOrganizations(pagination.page)}>Try Again</button>
          </div>
        )}

        <div className="organizations-grid">
          {loading ? (
            <>
              {[...Array(12)].map((_, i) => (
                <PersonCardSkeleton key={i} />
              ))}
            </>
          ) : organizations.length === 0 ? (
            <div className="no-results">
              <h2>No organizations found</h2>
              <p>Try adjusting your filter or check back later.</p>
            </div>
          ) : (
            organizations.map((org) => (
              <Link href={`/organizations/${org.slug}`} key={org.id}>
                <article className="org-card">
                  <div className="org-header">
                    <h2>{org.name}</h2>
                    <span className={`org-type ${getTypeColor(org.type)}`}>
                      {org.type}
                    </span>
                  </div>
                  
                  {org.description && (
                    <p className="org-description">{org.description}</p>
                  )}
                  
                  <div className="org-details">
                    {org.headquarters && (
                      <p className="detail">
                        <strong>HQ:</strong> {org.headquarters}
                      </p>
                    )}
                    {org.founded && (
                      <p className="detail">
                        <strong>Founded:</strong> {format(new Date(org.founded), 'yyyy')}
                      </p>
                    )}
                    {org.website && (
                      <p className="detail">
                        <strong>Website:</strong>{' '}
                        <a href={org.website} target="_blank" rel="noopener noreferrer" 
                           onClick={(e) => e.stopPropagation()}>
                          {new URL(org.website).hostname}
                        </a>
                      </p>
                    )}
                  </div>
                  
                  <div className="org-stats">
                    <span>
                      <strong>{org._count.incidents}</strong> incidents
                    </span>
                    <span>
                      <strong>{org._count.responses}</strong> responses
                    </span>
                  </div>
                </article>
              </Link>
            ))
          )}
        </div>

        {!loading && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => fetchOrganizations(pagination.page - 1)}
              disabled={pagination.page === 1}
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="page-info">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchOrganizations(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .organizations-page {
          max-width: 1200px;
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
          align-items: center;
        }

        .filters select {
          padding: 0.5rem;
          border: 1px solid var(--border-primary);
          border-radius: 4px;
          background: white;
          min-width: 200px;
        }

        .apply-filter {
          background: var(--accent-primary);
          color: white;
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .apply-filter:hover {
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

        .organizations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .org-card {
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 1.5rem;
          background: var(--background-primary);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .org-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .org-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .org-header h2 {
          font-size: 1.3rem;
          color: var(--text-primary);
          margin: 0;
          flex: 1;
        }

        .org-type {
          font-size: 0.85rem;
          padding: 0.3rem 0.8rem;
          border-radius: 4px;
          font-weight: 500;
          white-space: nowrap;
        }

        .type-media {
          background: #e3f2fd;
          color: #1976d2;
        }

        .type-advocacy {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .type-corporate {
          background: #e8f5e9;
          color: #388e3c;
        }

        .type-government {
          background: #fff3e0;
          color: #f57c00;
        }

        .type-nonprofit {
          background: #fce4ec;
          color: #c2185b;
        }

        .type-other {
          background: var(--background-secondary);
          color: var(--text-secondary);
        }

        .org-description {
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .org-details {
          margin-bottom: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-primary);
        }

        .detail {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0.25rem 0;
        }

        .detail strong {
          color: var(--text-primary);
        }

        .detail a {
          color: var(--accent-primary);
          text-decoration: none;
        }

        .detail a:hover {
          text-decoration: underline;
        }

        .org-stats {
          display: flex;
          gap: 1.5rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-top: auto;
          padding-top: 1rem;
        }

        .org-stats strong {
          color: var(--text-primary);
        }

        .no-results {
          grid-column: 1 / -1;
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

          .organizations-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .filters {
            flex-direction: column;
            align-items: stretch;
          }

          .filters select {
            width: 100%;
          }

          .org-header {
            flex-direction: column;
          }
        }
      `}</style>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/organizations?page=1&limit=12`)
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
    console.error('Error fetching organizations:', error)
    return {
      props: {}
    }
  }
}