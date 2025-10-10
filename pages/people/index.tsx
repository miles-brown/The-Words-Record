import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Layout from '@/components/Layout'
import { PersonCardSkeleton } from '@/components/LoadingSkeletons'
import { PersonWithRelations, PaginatedResponse } from '@/types'
import { format } from 'date-fns'
import { getReligionIcon, getProfessionIcon } from '@/utils/icons'
import { getAllCountryOptions } from '@/lib/countries'

export default function PeoplePage() {
  const [people, setPeople] = useState<PersonWithRelations[]>([])
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
    sortBy: 'name-asc'
  })
  const [showFilters, setShowFilters] = useState(false)

  // Filter options from database
  const [filterOptions, setFilterOptions] = useState({
    professions: [] as string[],
    nationalities: [] as string[],
    organizations: [] as string[]
  })

  // View settings
  const [viewMode, setViewMode] = useState<'card' | 'list' | 'grid' | 'profile'>('card')
  const [itemsPerPage, setItemsPerPage] = useState(12)

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

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions()
  }, [])

  // Fetch people when filters or itemsPerPage change
  useEffect(() => {
    fetchPeople(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, itemsPerPage])

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/people/filter-options')
      if (!response.ok) throw new Error('Failed to fetch filter options')
      const data = await response.json()
      setFilterOptions(data)
    } catch (err) {
      console.error('Failed to load filter options:', err)
    }
  }

  // Fetch people list from API
  const fetchPeople = async (page: number) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...Object.entries(filters).reduce((acc: any, [key, value]) => {
          if (value) acc[key] = value
          return acc
        }, {} as Record<string, any>)
      })

      const response = await fetch(`/api/people?${params}`)
      if (!response.ok) throw new Error('Failed to fetch people')

      const data = await response.json()
      setPeople(data.people)
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
      sortBy: 'name-asc'
    })
  }

  return (
    <Layout
      title="Who?"
      description="Browse profiles of individuals involved in documented public statements"
    >
      <div className="people-page">
        <div className="page-header">
          <h1>Who?</h1>
          <p className="page-description">
            Browse profiles of individuals who have made or been subjects of documented public statements.
            Click on any profile to view their complete history and statements.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="view-controls">
          <div className="view-mode-buttons">
            <button
              className={`view-mode-btn ${viewMode === 'card' ? 'active' : ''}`}
              onClick={() => setViewMode('card')}
              title="Card View"
            >
              📇 Card
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              📋 List
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              ⊞ Grid
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'profile' ? 'active' : ''}`}
              onClick={() => setViewMode('profile')}
              title="Profile Only View"
            >
              👤 Profile
            </button>
          </div>
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
                <select
                  id="profession"
                  value={filters.profession}
                  onChange={(e) => handleFilterChange('profession', e.target.value)}
                >
                  <option value="">All Professions</option>
                  {filterOptions.professions.map(prof => (
                    <option key={prof} value={prof}>{prof}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="nationality">Nationality</label>
                <select
                  id="nationality"
                  value={filters.nationality}
                  onChange={(e) => handleFilterChange('nationality', e.target.value)}
                >
                  <option value="">All Nationalities</option>
                  {/* Use canonical country options with flags */}
                  {getAllCountryOptions().map(({ code, name, emoji }) => (
                    <option key={code} value={code}>
                      {emoji} {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="organization">Organization</label>
                <select
                  id="organization"
                  value={filters.organization}
                  onChange={(e) => handleFilterChange('organization', e.target.value)}
                >
                  <option value="">All Organizations</option>
                  {filterOptions.organizations.map(org => (
                    <option key={org} value={org}>{org}</option>
                  ))}
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
            <button onClick={() => fetchPeople(pagination.page)}>Try Again</button>
          </div>
        )}

        <div className={`people-container view-${viewMode}`}>
          {loading ? (
            <>
              {[...Array(itemsPerPage)].map((_, i) => (
                <PersonCardSkeleton key={i} />
              ))}
            </>
          ) : (
            people.map((person) => {
              const birthYear = person.birthDate ? new Date(person.birthDate).getFullYear() : null
              const deathYear = person.deathDate ? new Date(person.deathDate).getFullYear() : null
              const firstNationality = person.nationality ? person.nationality.split(',')[0].trim() : null

              return <Link href={`/people/${person.slug}`} key={person.id}>
                <article className={`person-item ${viewMode}-view stagger-item`}>
                  {viewMode === 'grid' ? (
                    // GRID VIEW: Large image + name only
                    <div className="grid-layout">
                      {person.imageUrl ? (
                        <div className="person-image">
                          <Image
                            src={person.imageUrl}
                            alt={person.name}
                            width={180}
                            height={180}
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                          />
                        </div>
                      ) : (
                        <div className="person-image placeholder">
                          <span>{person.name[0]}</span>
                        </div>
                      )}
                      <h3 className="person-name">{person.name}</h3>
                    </div>
                  ) : viewMode === 'list' ? (
                    // LIST VIEW: No images, compact data row
                    <div className="list-layout">
                      <div className="list-content">
                        <h2>{person.name}</h2>
                        <div className="list-meta">
                          {person.profession && (
                            <span className="profession">{person.profession}</span>
                          )}
                          {firstNationality && (
                            <span className="nationality">{getCountryFlag(firstNationality)}</span>
                          )}
                          {birthYear && (
                            <span className="years">b. {birthYear}</span>
                          )}
                          {deathYear && (
                            <span className="years">d. {deathYear}</span>
                          )}
                        </div>
                      </div>
                      <div className="list-stats">
                        <span>{person._count?.cases || 0}</span>
                        <span>{person._count?.statements || 0}</span>
                        <span>{person._count?.responses || 0}</span>
                      </div>
                    </div>
                  ) : viewMode === 'profile' ? (
                    // PROFILE VIEW: Image, name, profession, nationality, stats
                    <div className="profile-layout">
                      {person.imageUrl ? (
                        <div className="person-image">
                          <Image
                            src={person.imageUrl}
                            alt={person.name}
                            width={88}
                            height={88}
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                          />
                        </div>
                      ) : (
                        <div className="person-image placeholder">
                          <span>{person.name[0]}</span>
                        </div>
                      )}
                      <div className="profile-info">
                        <h3>{person.name}</h3>
                        {person.profession && (
                          <p className="profession">{person.profession}</p>
                        )}
                        <div className="profile-meta">
                          {person.nationality && (
                            <span className="nationality">
                              <span className="icon">{getCountryFlag(person.nationality)}</span>
                              {person.nationality}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="profile-stats">
                        <span>
                          <strong>{person._count?.cases || 0}</strong> {person._count?.cases === 1 ? 'case' : 'cases'}
                        </span>
                        <span><strong>{person._count?.statements || 0}</strong> statements</span>
                        <span><strong>{person._count?.responses || 0}</strong> responses</span>
                      </div>
                    </div>
                  ) : (
                    // CARD VIEW: Image left + name, profession, stats only
                    <div className="card-layout">
                      {person.imageUrl ? (
                        <div className="person-image">
                          <Image
                            src={person.imageUrl}
                            alt={person.name}
                            width={100}
                            height={100}
                            objectFit="cover"
                          />
                        </div>
                      ) : (
                        <div className="person-image placeholder">
                          <span>{person.name[0]}</span>
                        </div>
                      )}
                      <div className="card-content">
                        <h2>{person.name}</h2>
                        {person.profession && (
                          <p className="profession">{person.profession}</p>
                        )}
                        <div className="card-stats">
                          <span className="stat">
                            <strong>{person._count?.cases || 0}</strong> {person._count?.cases === 1 ? 'case' : 'cases'}
                          </span>
                          <span className="stat">
                            <strong>{person._count?.statements || 0}</strong> statements
                          </span>
                          <span className="stat">
                            <strong>{person._count?.responses || 0}</strong> responses
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              </Link>
            })
          )}
        </div>

        {!loading && (
          <div className="pagination-controls">
            {/* Items per page selector */}
            <div className="items-per-page">
              <label>Items per page:</label>
              <div className="items-per-page-buttons">
                {[12, 24, 48, 96].map(count => (
                  <button
                    key={count}
                    className={`items-btn ${itemsPerPage === count ? 'active' : ''}`}
                    onClick={() => setItemsPerPage(count)}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => fetchPeople(pagination.page - 1)}
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
                        onClick={() => fetchPeople(pageNum)}
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
                  onClick={() => fetchPeople(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  aria-label="Next page"
                  className="pagination-next"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .people-page {
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

        .view-controls {
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: center;
        }

        .view-mode-buttons {
          display: flex;
          gap: 0.5rem;
          background: var(--background-secondary);
          padding: 0.5rem;
          border-radius: 8px;
          border: 1px solid var(--border-primary);
        }

        .view-mode-btn {
          padding: 0.6rem 1rem;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 4px;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .view-mode-btn:hover {
          background: var(--background-primary);
          color: var(--text-primary);
        }

        .view-mode-btn.active {
          background: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
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

        /* Container for different view modes */
        .people-container {
          margin-bottom: 3rem;
        }

        /* CARD VIEW */
        .people-container.view-card {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }

        .card-layout {
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
        }

        .card-layout .person-image {
          flex-shrink: 0;
          width: 100px;
          height: 100px;
          border-radius: 8px;
          overflow: hidden;
        }

        .card-content {
          flex: 1;
          min-width: 0;
        }

        .card-content h2 {
          font-size: 1.3rem;
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
        }

        .card-content .profession {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0 0 1rem 0;
        }

        .card-stats {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .card-stats .stat strong {
          color: var(--accent-primary);
          font-weight: 600;
        }

        /* LIST VIEW */
        .people-container.view-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .view-list .person-item {
          padding: 0.75rem 1rem;
        }

        .list-layout {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .list-content {
          flex: 1;
          min-width: 0;
        }

        .list-content h2 {
          margin: 0 0 0.25rem 0;
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .list-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .list-meta .profession,
        .list-meta .nationality,
        .list-meta .years {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        .list-stats {
          display: flex;
          gap: 1.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        /* GRID VIEW */
        .people-container.view-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1.5rem;
        }

        .view-grid .person-item {
          padding: 1rem;
        }

        .grid-layout {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .grid-layout .person-image {
          width: 100%;
          height: 180px;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--background-secondary);
        }

        .grid-layout .person-name {
          font-size: 1rem;
          margin: 0;
          color: var(--text-primary);
          font-weight: 500;
        }

        /* PROFILE VIEW */
        .people-container.view-profile {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .profile-layout {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .profile-layout .person-image {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          overflow: hidden;
          align-self: center;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--background-secondary);
        }

        .profile-info {
          text-align: center;
        }

        .profile-info h3 {
          font-size: 1.1rem;
          margin: 0 0 0.25rem 0;
          color: var(--text-primary);
        }

        .profile-info .profession {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0 0 0.75rem 0;
        }

        .profile-meta {
          display: flex;
          justify-content: center;
          gap: 1rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          flex-wrap: wrap;
        }

        .profile-meta .nationality,
        .profile-meta .religion {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        .profile-stats {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-align: center;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-primary);
        }

        .profile-stats strong {
          color: var(--accent-primary);
          font-weight: 600;
        }

        /* Common styles */
        .person-item {
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 1.5rem;
          background: var(--background-primary);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .person-item:hover {
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

        .profession, .nationality, .religion {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .profession .icon, .nationality .icon, .religion .icon {
          font-size: 1.1rem;
          line-height: 1;
        }

        .list-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          align-items: center;
        }

        .list-meta .profession,
        .list-meta .nationality,
        .list-meta .religion {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
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

        .pagination-controls {
          margin-top: 3rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          align-items: center;
        }

        .items-per-page {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .items-per-page label {
          font-size: 0.95rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .items-per-page-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .items-btn {
          padding: 0.5rem 1rem;
          background: var(--background-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 4px;
          color: var(--text-primary);
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .items-btn:hover {
          background: var(--background-primary);
          border-color: var(--accent-primary);
        }

        .items-btn.active {
          background: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
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

          .people-container.view-card,
          .people-container.view-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .people-container.view-profile {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }

          .list-layout {
            flex-direction: column;
            align-items: flex-start;
          }

          .list-stats {
            text-align: left;
            flex-direction: row;
            gap: 1rem;
          }

          .person-header {
            flex-direction: column;
            text-align: center;
          }

          .view-mode-buttons {
            flex-wrap: wrap;
          }

          .view-mode-btn {
            font-size: 0.85rem;
            padding: 0.5rem 0.75rem;
          }

          .items-per-page {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </Layout>
  )
}