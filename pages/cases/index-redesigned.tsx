import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { format } from 'date-fns'
import debounce from 'lodash/debounce'

// View mode types
type ViewMode = 'grid' | 'list' | 'timeline'

// Case interface
interface Case {
  id: string
  slug: string
  title: string
  summary: string
  caseDate: string
  status: string
  isVerified: boolean
  isFeatured: boolean
  viewCount: number
  _count: {
    statements: number
    sources: number
  }
  tags: Array<{ name: string; slug: string }>
  person?: { name: string; slug: string }
  organizations?: Array<{ name: string; slug: string }>
}

interface Statistics {
  totalCases: number
  casesThisMonth: number
  verifiedCount: number
  featuredCount: number
  topTags: Array<{ name: string; count: number }>
}

export default function CasesPageRedesigned() {
  // State management
  const router = useRouter()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')

  // Pagination
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalCases, setTotalCases] = useState(0)

  // Statistics
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [tags, setTags] = useState<Array<{ name: string; slug: string; count: number }>>([])

  // Quick filters
  const quickFilters = [
    { label: 'This Week', value: 'week' },
    { label: 'Verified', value: 'verified' },
    { label: 'Featured', value: 'featured' },
    { label: 'Most Viewed', value: 'popular' }
  ]

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setPage(1)
      fetchCases(1, query)
    }, 500),
    []
  )

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery)
    } else {
      fetchCases(1)
    }
  }, [searchQuery])

  useEffect(() => {
    fetchCases(1)
  }, [selectedTags, dateRange, statusFilter, sortBy])

  const fetchInitialData = async () => {
    try {
      // Fetch tags and statistics in parallel
      const [tagsRes, statsRes] = await Promise.all([
        fetch('/api/tags'),
        fetch('/api/cases/statistics')
      ])

      if (tagsRes.ok) {
        const tagsData = await tagsRes.json()
        setTags(tagsData.tags || [])
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStatistics(statsData)
      }

      // Fetch initial cases
      await fetchCases(1)
    } catch (err) {
      console.error('Failed to fetch initial data:', err)
    }
  }

  const fetchCases = async (pageNum: number, search?: string) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: viewMode === 'timeline' ? '20' : '12',
        sortBy,
        ...(search || searchQuery ? { search: search || searchQuery } : {}),
        ...(selectedTags.length > 0 ? { tags: selectedTags.join(',') } : {}),
        ...(dateRange.start ? { startDate: dateRange.start } : {}),
        ...(dateRange.end ? { endDate: dateRange.end } : {}),
        ...(statusFilter !== 'all' ? { status: statusFilter } : {})
      })

      const response = await fetch(`/api/cases?${params}`)
      if (!response.ok) throw new Error('Failed to fetch cases')

      const data = await response.json()

      if (pageNum === 1) {
        setCases(data.cases)
      } else {
        setCases(prev => [...prev, ...data.cases])
      }

      setTotalCases(data.pagination?.total || 0)
      setHasMore(data.cases.length === (viewMode === 'timeline' ? 20 : 12))
    } catch (err) {
      setError('Failed to load cases. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleQuickFilter = (filter: string) => {
    switch(filter) {
      case 'week':
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        setDateRange({
          start: weekAgo.toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        })
        break
      case 'verified':
        setStatusFilter('verified')
        break
      case 'featured':
        setStatusFilter('featured')
        break
      case 'popular':
        setSortBy('views-desc')
        break
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedTags([])
    setDateRange({ start: '', end: '' })
    setStatusFilter('all')
    setSortBy('date-desc')
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchCases(nextPage)
    }
  }

  return (
    <Layout>
      <Head>
        <title>Cases Archive - The Words Record</title>
        <meta name="description" content="Explore our comprehensive archive of documented cases, statements, and investigations." />
      </Head>

      <div className="cases-container">
        {/* Header Section */}
        <header className="cases-header">
          <div className="header-content">
            <h1>Cases Archive</h1>
            <p className="subtitle">
              Explore {totalCases} documented cases with verified sources and comprehensive analysis
            </p>
          </div>

          {/* Statistics Bar */}
          {statistics && (
            <div className="statistics-bar">
              <div className="stat-item">
                <span className="stat-value">{statistics.totalCases}</span>
                <span className="stat-label">Total Cases</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{statistics.casesThisMonth}</span>
                <span className="stat-label">This Month</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{statistics.verifiedCount}</span>
                <span className="stat-label">Verified</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{statistics.featuredCount}</span>
                <span className="stat-label">Featured</span>
              </div>
            </div>
          )}
        </header>

        {/* Filters Section */}
        <section className="filters-section">
          {/* Search Bar */}
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search cases, people, organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Quick Filters */}
          <div className="quick-filters">
            {quickFilters.map(filter => (
              <button
                key={filter.value}
                className="filter-pill"
                onClick={() => handleQuickFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Advanced Filters */}
          <div className="advanced-filters">
            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="views-desc">Most Viewed</option>
                <option value="statements-desc">Most Statements</option>
                <option value="relevance">Relevance</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Cases</option>
                <option value="verified">Verified Only</option>
                <option value="featured">Featured</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Date Range</label>
              <div className="date-inputs">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="date-input"
                />
                <span>to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="date-input"
                />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM9 2.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zM9 10.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
                </svg>
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M2.5 11.5A.5.5 0 0 1 3 11h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 3 7h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 3 3h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                </svg>
              </button>
              <button
                className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
                onClick={() => setViewMode('timeline')}
                title="Timeline view"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h9.586a1 1 0 0 1 .707.293l2.853 2.853a.5.5 0 0 0 .854-.353V2zM3.5 3h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1 0-1zm0 2.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1 0-1zm0 2.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="selected-filters">
              <span className="filter-label">Active filters:</span>
              {selectedTags.map(tag => (
                <button
                  key={tag}
                  className="filter-tag"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                  <span className="remove-tag">×</span>
                </button>
              ))}
              <button className="clear-filters" onClick={clearFilters}>
                Clear all
              </button>
            </div>
          )}
        </section>

        {/* Tag Cloud */}
        {tags.length > 0 && (
          <section className="tag-cloud">
            <h3>Popular Topics</h3>
            <div className="tags-container">
              {tags.slice(0, 20).map(tag => (
                <button
                  key={tag.slug}
                  className={`tag-btn ${selectedTags.includes(tag.slug) ? 'active' : ''}`}
                  onClick={() => handleTagToggle(tag.slug)}
                  style={{ fontSize: `${Math.min(1.2, 0.8 + (tag.count / 10))}rem` }}
                >
                  {tag.name} ({tag.count})
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Cases Display */}
        <section className="cases-display">
          {loading && cases.length === 0 ? (
            <div className="loading-container">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="case-skeleton">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-line"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="error-container">
              <p>{error}</p>
              <button onClick={() => fetchCases(1)}>Try Again</button>
            </div>
          ) : cases.length === 0 ? (
            <div className="no-results">
              <p>No cases found matching your filters</p>
              <button onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="cases-grid">
                  {cases.map(caseItem => (
                    <Link key={caseItem.id} href={`/cases/${caseItem.slug}`}>
                      <article className="case-card">
                        {caseItem.isFeatured && (
                          <span className="featured-badge">Featured</span>
                        )}
                        {caseItem.isVerified && (
                          <span className="verified-badge" title="Verified">✓</span>
                        )}
                        <div className="case-header">
                          <h3 className="case-title">{caseItem.title}</h3>
                          <time className="case-date">
                            {format(new Date(caseItem.caseDate), 'MMM d, yyyy')}
                          </time>
                        </div>
                        <p className="case-summary">{caseItem.summary}</p>
                        <div className="case-meta">
                          <span className="meta-item">
                            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {caseItem._count.statements} statements
                          </span>
                          <span className="meta-item">
                            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            {caseItem._count.sources} sources
                          </span>
                          <span className="meta-item">
                            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {caseItem.viewCount} views
                          </span>
                        </div>
                        {caseItem.tags.length > 0 && (
                          <div className="case-tags">
                            {caseItem.tags.slice(0, 3).map(tag => (
                              <span key={tag.slug} className="tag">
                                {tag.name}
                              </span>
                            ))}
                            {caseItem.tags.length > 3 && (
                              <span className="tag more">+{caseItem.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </article>
                    </Link>
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="cases-list">
                  {cases.map(caseItem => (
                    <Link key={caseItem.id} href={`/cases/${caseItem.slug}`}>
                      <article className="case-list-item">
                        <div className="list-item-header">
                          <h3 className="list-item-title">
                            {caseItem.isVerified && <span className="verified-icon">✓</span>}
                            {caseItem.title}
                          </h3>
                          <time className="list-item-date">
                            {format(new Date(caseItem.caseDate), 'MMM d, yyyy')}
                          </time>
                        </div>
                        <p className="list-item-summary">{caseItem.summary}</p>
                        <div className="list-item-footer">
                          <div className="list-item-meta">
                            <span>{caseItem._count.statements} statements</span>
                            <span>•</span>
                            <span>{caseItem._count.sources} sources</span>
                            <span>•</span>
                            <span>{caseItem.viewCount} views</span>
                          </div>
                          {caseItem.tags.length > 0 && (
                            <div className="list-item-tags">
                              {caseItem.tags.map(tag => (
                                <span key={tag.slug} className="tag-small">
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}

              {/* Timeline View */}
              {viewMode === 'timeline' && (
                <div className="cases-timeline">
                  {cases.map((caseItem, index) => (
                    <div key={caseItem.id} className="timeline-item">
                      <div className="timeline-marker">
                        <span className="marker-dot"></span>
                        {index < cases.length - 1 && <span className="marker-line"></span>}
                      </div>
                      <Link href={`/cases/${caseItem.slug}`}>
                        <article className="timeline-content">
                          <time className="timeline-date">
                            {format(new Date(caseItem.caseDate), 'MMMM d, yyyy')}
                          </time>
                          <h3 className="timeline-title">
                            {caseItem.isVerified && <span className="verified-badge">✓</span>}
                            {caseItem.title}
                          </h3>
                          <p className="timeline-summary">{caseItem.summary}</p>
                          <div className="timeline-meta">
                            <span>{caseItem._count.statements} statements</span>
                            <span>•</span>
                            <span>{caseItem._count.sources} sources</span>
                          </div>
                        </article>
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {hasMore && (
                <div className="load-more-container">
                  <button
                    className="load-more-btn"
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load More Cases'}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <style jsx>{`
        .cases-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* Header Section */
        .cases-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .header-content h1 {
          font-family: 'Cinzel', serif;
          font-size: 3rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto 2rem;
        }

        /* Statistics Bar */
        .statistics-bar {
          display: flex;
          justify-content: center;
          gap: 3rem;
          padding: 1.5rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 600;
          color: var(--accent);
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        /* Filters Section */
        .filters-section {
          background: white;
          border-radius: 8px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        /* Search Container */
        .search-container {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid var(--border-light);
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(74, 95, 113, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: var(--text-secondary);
        }

        /* Quick Filters */
        .quick-filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .filter-pill {
          padding: 0.5rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: 20px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .filter-pill:hover {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        /* Advanced Filters */
        .advanced-filters {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          align-items: end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
        }

        .filter-group label {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .filter-select {
          padding: 0.75rem;
          border: 1px solid var(--border-light);
          border-radius: 6px;
          background: white;
          cursor: pointer;
        }

        .date-inputs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .date-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid var(--border-light);
          border-radius: 6px;
        }

        /* View Toggle */
        .view-toggle {
          display: flex;
          gap: 0.5rem;
          justify-self: end;
        }

        .view-btn {
          padding: 0.75rem;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-btn:hover {
          background: var(--bg-secondary);
        }

        .view-btn.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        /* Selected Filters */
        .selected-filters {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-light);
          flex-wrap: wrap;
        }

        .filter-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .filter-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 15px;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .remove-tag {
          font-size: 1.2rem;
          line-height: 1;
        }

        .clear-filters {
          padding: 0.25rem 0.75rem;
          background: transparent;
          color: var(--accent);
          border: 1px solid var(--accent);
          border-radius: 15px;
          font-size: 0.85rem;
          cursor: pointer;
        }

        /* Tag Cloud */
        .tag-cloud {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .tag-cloud h3 {
          font-size: 1.2rem;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .tag-btn {
          padding: 0.5rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .tag-btn:hover {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .tag-btn.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        /* Cases Grid */
        .cases-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }

        .case-card {
          position: relative;
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s;
          cursor: pointer;
        }

        .case-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .featured-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.25rem 0.75rem;
          background: gold;
          color: black;
          border-radius: 15px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .verified-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          width: 24px;
          height: 24px;
          background: green;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .case-header {
          margin-bottom: 1rem;
        }

        .case-title {
          font-size: 1.3rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .case-date {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .case-summary {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .case-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .icon {
          width: 16px;
          height: 16px;
        }

        .case-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .tag {
          padding: 0.25rem 0.75rem;
          background: var(--bg-secondary);
          border-radius: 15px;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .tag.more {
          background: transparent;
          border: 1px solid var(--border-light);
        }

        /* List View */
        .cases-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .case-list-item {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s;
          cursor: pointer;
        }

        .case-list-item:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .list-item-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 0.75rem;
        }

        .list-item-title {
          font-size: 1.2rem;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .verified-icon {
          color: green;
        }

        .list-item-date {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .list-item-summary {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .list-item-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .list-item-meta {
          display: flex;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .list-item-tags {
          display: flex;
          gap: 0.5rem;
        }

        .tag-small {
          padding: 0.2rem 0.6rem;
          background: var(--bg-secondary);
          border-radius: 12px;
          font-size: 0.75rem;
        }

        /* Timeline View */
        .cases-timeline {
          position: relative;
          padding-left: 3rem;
        }

        .timeline-item {
          display: flex;
          margin-bottom: 2rem;
          position: relative;
        }

        .timeline-marker {
          position: absolute;
          left: -3rem;
          top: 0;
        }

        .marker-dot {
          display: block;
          width: 12px;
          height: 12px;
          background: var(--accent);
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 0 1px var(--border-light);
        }

        .marker-line {
          position: absolute;
          left: 5px;
          top: 18px;
          width: 2px;
          height: calc(100% + 2rem);
          background: var(--border-light);
        }

        .timeline-content {
          flex: 1;
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          cursor: pointer;
          transition: all 0.3s;
        }

        .timeline-content:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .timeline-date {
          font-size: 0.85rem;
          color: var(--accent);
          font-weight: 600;
          text-transform: uppercase;
        }

        .timeline-title {
          font-size: 1.2rem;
          color: var(--text-primary);
          margin: 0.5rem 0;
        }

        .timeline-summary {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .timeline-meta {
          display: flex;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        /* Loading States */
        .loading-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }

        .case-skeleton {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .skeleton-image {
          width: 100%;
          height: 200px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .skeleton-content {
          space-y: 0.5rem;
        }

        .skeleton-line {
          height: 20px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }

        .skeleton-line.short {
          width: 60%;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* Error & No Results */
        .error-container, .no-results {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 8px;
        }

        .error-container p, .no-results p {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .error-container button, .no-results button {
          padding: 0.75rem 2rem;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        /* Load More */
        .load-more-container {
          text-align: center;
          margin-top: 3rem;
        }

        .load-more-btn {
          padding: 1rem 3rem;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .load-more-btn:hover:not(:disabled) {
          background: var(--accent-dark);
          transform: translateY(-2px);
        }

        .load-more-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* CSS Variables */
        :root {
          --text-primary: #2f3538;
          --text-secondary: #5f6f7a;
          --bg-primary: #f9f8f6;
          --bg-secondary: #f2f1ef;
          --accent: #4a5f71;
          --accent-dark: #3a4f61;
          --border-light: #e8e6e3;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .cases-container {
            padding: 1rem;
          }

          .header-content h1 {
            font-size: 2rem;
          }

          .statistics-bar {
            flex-wrap: wrap;
            gap: 1rem;
          }

          .stat-item {
            flex: 1 1 40%;
          }

          .advanced-filters {
            grid-template-columns: 1fr;
          }

          .cases-grid {
            grid-template-columns: 1fr;
          }

          .case-meta {
            flex-wrap: wrap;
          }

          .timeline-content {
            padding: 1rem;
          }
        }
      `}</style>
    </Layout>
  )
}