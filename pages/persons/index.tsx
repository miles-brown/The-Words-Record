// @ts-nocheck
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Layout from '@/components/Layout'
import { PersonCardSkeleton } from '@/components/LoadingSkeletons'
import { PersonWithRelations, PaginatedResponse } from '@/types'
import { format } from 'date-fns'

export default function PersonsPage() {
  const [persons, setPersons] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [filters, setFilters] = useState({
    profession: '',
    nationality: '',
    organization: '',
    hasRepercussions: '',
    sortBy: 'name-asc'
  })
  const [showFilters, setShowFilters] = useState(false)

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
    fetchPersons(1)
  }, [filters])

  const fetchPersons = async (page: number) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value
          return acc
        }, {})
      })

      const response = await fetch(`/api/persons?${params}`)
      if (!response.ok) throw new Error('Failed to fetch persons')

      const data = await response.json()
      setPersons(data.persons)
      setPagination(data.pagination)
    } catch (err) {
      setError('Failed to load people. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      profession: '',
      nationality: '',
      organization: '',
      hasRepercussions: '',
      sortBy: 'name-asc'
    })
  }

  return (
    <Layout
      title="Who?"
      description="Browse profiles of individuals involved in documented public statements"
    >
      <div className="persons-page">
        <div className="page-header">
          <h1>Who?</h1>
          <p className="page-description">
            Browse profiles of individuals who have made or been subjects of documented public statements.
            Click on any profile to view their complete history and statements.
          </p>
        </div>

        {/* Filters and Sorting */}
        <div className="filters-section">
          <button
            className="toggle-filters-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? '▼' : '▶'} Filters & Sorting
          </button>

          {showFilters && (
            <div className="filters-grid">
              <div className="filter-group">
                <label htmlFor="sortBy">Sort By</label>
                <select
                  id="sortBy"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="surname-asc">Surname (A-Z)</option>
                  <option value="surname-desc">Surname (Z-A)</option>
                  <option value="birthdate-asc">Birth Date (Oldest First)</option>
                  <option value="birthdate-desc">Birth Date (Newest First)</option>
                  <option value="statements-desc">Most Statements</option>
                  <option value="statements-asc">Fewest Statements</option>
                  <option value="responses-desc">Most Responses</option>
                  <option value="responses-asc">Fewest Responses</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="profession">Profession</label>
                <input
                  id="profession"
                  type="text"
                  placeholder="e.g. Politician, Actor"
                  value={filters.profession}
                  onChange={(e) => handleFilterChange('profession', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label htmlFor="nationality">Nationality</label>
                <input
                  id="nationality"
                  type="text"
                  placeholder="e.g. British, American"
                  value={filters.nationality}
                  onChange={(e) => handleFilterChange('nationality', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label htmlFor="organization">Organization</label>
                <input
                  id="organization"
                  type="text"
                  placeholder="e.g. Labour Party, UK Parliament"
                  value={filters.organization}
                  onChange={(e) => handleFilterChange('organization', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label htmlFor="hasRepercussions">Repercussions</label>
                <select
                  id="hasRepercussions"
                  value={filters.hasRepercussions}
                  onChange={(e) => handleFilterChange('hasRepercussions', e.target.value)}
                >
                  <option value="">All</option>
                  <option value="any">Any Repercussions</option>
                  <option value="employment">Lost Employment</option>
                  <option value="contracts">Lost Contracts</option>
                  <option value="painted-negatively">Painted Negatively</option>
                </select>
              </div>

              <div className="filter-actions">
                <button className="clear-filters-btn" onClick={clearFilters}>
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="error-message" role="alert">
            <p>{error}</p>
            <button onClick={() => fetchPersons(pagination.page)}>Try Again</button>
          </div>
        )}

        <div className="persons-grid">
          {loading ? (
            <>
              {[...Array(12)].map((_, i) => (
                <PersonCardSkeleton key={i} />
              ))}
            </>
          ) : (
            persons.map((person) => (
              <Link href={`/persons/${person.slug}`} key={person.id}>
                <article className="person-card stagger-item">
                  <div className="person-header">
                    {person.imageUrl ? (
                      <div className="person-image">
                        <Image
                          src={person.imageUrl}
                          alt={person.name}
                          width={80}
                          height={80}
                          objectFit="cover"
                        />
                      </div>
                    ) : (
                      <div className="person-image placeholder">
                        <span>{person.name[0]}</span>
                      </div>
                    )}
                    <div className="person-info">
                      <h2>{person.name}</h2>
                      {person.profession && (
                        <p className="profession">{person.profession}</p>
                      )}
                      {person.nationality && (
                        <p className="nationality">{person.nationality}</p>
                      )}
                    </div>
                  </div>
                  
                  {person.bio && (
                    <p className="person-bio">{person.bio}</p>
                  )}
                  
                  <div className="person-stats">
                    <span className="stat">
                      <strong>{person._count?.incidents || 0}</strong> incidents
                    </span>
                    <span className="stat">
                      <strong>{person._count?.statements || 0}</strong> statements
                    </span>
                    <span className="stat">
                      <strong>{person._count?.responses || 0}</strong> responses
                    </span>
                  </div>

                  {person.birthDate && (
                    <p className="dates">
                      Born: {format(new Date(person.birthDate), 'yyyy')}
                      {person.deathDate && ` - ${format(new Date(person.deathDate), 'yyyy')}`}
                    </p>
                  )}
                </article>
              </Link>
            ))
          )}
        </div>

        {!loading && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => fetchPersons(pagination.page - 1)}
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
                    onClick={() => fetchPersons(pageNum)}
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
              onClick={() => fetchPersons(pagination.page + 1)}
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
        .persons-page {
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
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .toggle-filters-btn {
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .filter-group input,
        .filter-group select {
          padding: 0.6rem;
          border: 1px solid var(--border-primary);
          border-radius: 4px;
          background: var(--background-primary);
          color: var(--text-primary);
          font-size: 0.95rem;
        }

        .filter-group input:focus,
        .filter-group select:focus {
          outline: none;
          border-color: var(--accent-primary);
        }

        .filter-actions {
          display: flex;
          align-items: flex-end;
        }

        .clear-filters-btn {
          padding: 0.6rem 1.2rem;
          background: var(--accent-secondary);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: background 0.2s;
        }

        .clear-filters-btn:hover {
          background: #34495e;
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

        .persons-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .person-card {
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 1.5rem;
          background: var(--background-primary);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .person-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .person-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .person-image {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }

        .person-image.placeholder {
          background: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 2rem;
          font-weight: bold;
        }

        .person-info h2 {
          font-size: 1.3rem;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .profession, .nationality {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .person-bio {
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .person-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .stat {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .stat strong {
          color: var(--text-primary);
        }

        .dates {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0;
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

          .persons-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .person-header {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </Layout>
  )
}