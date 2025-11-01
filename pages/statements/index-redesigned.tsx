import { useState, useEffect, useCallback, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { format, parseISO } from 'date-fns'
import debounce from 'lodash/debounce'

// Statement types based on Prisma model
interface Statement {
  id: string
  content: string
  context?: string
  summary?: string
  statementDate: string
  statementType: 'ORIGINAL' | 'RESPONSE' | 'CLARIFICATION' | 'RETRACTION'
  responseType?: string
  isVerified: boolean
  verificationLevel?: 'UNVERIFIED' | 'PARTIALLY_VERIFIED' | 'VERIFIED' | 'FACT_CHECKED'

  // Response tracking
  responseDepth?: number
  respondsToId?: string
  responseTime?: number

  // Impact metrics
  lostEmployment?: boolean
  lostContracts?: boolean
  paintedNegatively?: boolean
  viewCount?: number

  // Relations
  person?: {
    id: string
    name: string
    slug: string
    nationality?: string
  }
  organization?: {
    id: string
    name: string
    slug: string
  }
  case?: {
    id: string
    title: string
    slug: string
  }
  sources?: Array<{
    id: string
    title: string
    url?: string
    mediaOutlet?: { name: string }
  }>
  responses?: Statement[]
  _count?: {
    responses: number
    sources: number
  }
}

interface FilterState {
  search: string
  statementType: string
  responseType: string
  verificationLevel: string
  personId: string
  organizationId: string
  caseId: string
  dateFrom: string
  dateTo: string
  hasImpact: boolean
  isVerified: boolean
  sortBy: string
}

export default function StatementsPageRedesigned() {
  const router = useRouter()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // Core state
  const [statements, setStatements] = useState<Statement[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pagination
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    statementType: 'all',
    responseType: 'all',
    verificationLevel: 'all',
    personId: '',
    organizationId: '',
    caseId: '',
    dateFrom: '',
    dateTo: '',
    hasImpact: false,
    isVerified: false,
    sortBy: 'date-desc'
  })

  // View preferences
  const [viewMode, setViewMode] = useState<'compact' | 'detailed' | 'thread'>('detailed')
  const [showFilters, setShowFilters] = useState(true)
  const [selectedStatement, setSelectedStatement] = useState<string | null>(null)

  // Reference data for filters
  const [people, setPeople] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string }>>([])
  const [cases, setCases] = useState<Array<{ id: string; title: string; slug: string }>>([])

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    responses: 0,
    withImpact: 0,
    thisMonth: 0
  })

  // Quick filter presets
  const filterPresets = [
    { label: 'Verified Only', key: 'verified', filters: { isVerified: true } },
    { label: 'With Impact', key: 'impact', filters: { hasImpact: true } },
    { label: 'Original Statements', key: 'original', filters: { statementType: 'ORIGINAL' } },
    { label: 'Responses', key: 'responses', filters: { statementType: 'RESPONSE' } },
    { label: 'This Month', key: 'recent', filters: { dateFrom: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0] } },
    { label: 'Controversial', key: 'controversial', filters: { sortBy: 'responses-desc' } }
  ]

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      setPage(1)
      setStatements([])
      fetchStatements(1, { ...filters, search: searchTerm })
    }, 500),
    [filters]
  )

  // Initialize data
  useEffect(() => {
    fetchInitialData()
  }, [])

  // Handle filter changes
  useEffect(() => {
    if (page === 1) {
      fetchStatements(1, filters)
    } else {
      setPage(1)
      setStatements([])
    }
  }, [filters.statementType, filters.responseType, filters.verificationLevel,
      filters.personId, filters.organizationId, filters.caseId,
      filters.dateFrom, filters.dateTo, filters.hasImpact,
      filters.isVerified, filters.sortBy])

  // Search effect
  useEffect(() => {
    if (filters.search) {
      debouncedSearch(filters.search)
    } else if (page === 1) {
      fetchStatements(1, filters)
    }
  }, [filters.search])

  // Infinite scroll setup
  useEffect(() => {
    if (loading || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setPage(prev => prev + 1)
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    observerRef.current = observer

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loading, hasMore, loadingMore])

  // Load more on page change
  useEffect(() => {
    if (page > 1) {
      fetchStatements(page, filters)
    }
  }, [page])

  const fetchInitialData = async () => {
    try {
      const [peopleRes, orgsRes, casesRes, statsRes] = await Promise.all([
        fetch('/api/people?limit=100'),
        fetch('/api/organizations?limit=100'),
        fetch('/api/cases?limit=50'),
        fetch('/api/statements/statistics')
      ])

      if (peopleRes.ok) {
        const data = await peopleRes.json()
        setPeople(data.people || [])
      }

      if (orgsRes.ok) {
        const data = await orgsRes.json()
        setOrganizations(data.organizations || [])
      }

      if (casesRes.ok) {
        const data = await casesRes.json()
        setCases(data.cases || [])
      }

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }

      // Fetch initial statements
      await fetchStatements(1, filters)
    } catch (err) {
      console.error('Failed to fetch initial data:', err)
    }
  }

  const fetchStatements = async (pageNum: number, currentFilters: FilterState) => {
    if (pageNum === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    setError(null)

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        ...(currentFilters.search && { search: currentFilters.search }),
        ...(currentFilters.statementType !== 'all' && { statementType: currentFilters.statementType }),
        ...(currentFilters.responseType !== 'all' && { responseType: currentFilters.responseType }),
        ...(currentFilters.verificationLevel !== 'all' && { verificationLevel: currentFilters.verificationLevel }),
        ...(currentFilters.personId && { personId: currentFilters.personId }),
        ...(currentFilters.organizationId && { organizationId: currentFilters.organizationId }),
        ...(currentFilters.caseId && { caseId: currentFilters.caseId }),
        ...(currentFilters.dateFrom && { dateFrom: currentFilters.dateFrom }),
        ...(currentFilters.dateTo && { dateTo: currentFilters.dateTo }),
        ...(currentFilters.hasImpact && { hasImpact: 'true' }),
        ...(currentFilters.isVerified && { isVerified: 'true' }),
        sortBy: currentFilters.sortBy
      })

      const response = await fetch(`/api/statements?${params}`)
      if (!response.ok) throw new Error('Failed to fetch statements')

      const data = await response.json()

      if (pageNum === 1) {
        setStatements(data.statements || [])
      } else {
        setStatements(prev => [...prev, ...(data.statements || [])])
      }

      setTotalCount(data.pagination?.total || 0)
      setHasMore(data.statements?.length === 20)
    } catch (err) {
      setError('Failed to load statements. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const applyPreset = (preset: any) => {
    setFilters(prev => ({ ...prev, ...preset.filters }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      statementType: 'all',
      responseType: 'all',
      verificationLevel: 'all',
      personId: '',
      organizationId: '',
      caseId: '',
      dateFrom: '',
      dateTo: '',
      hasImpact: false,
      isVerified: false,
      sortBy: 'date-desc'
    })
    setPage(1)
    setStatements([])
  }

  const getVerificationBadge = (level?: string) => {
    switch(level) {
      case 'VERIFIED':
        return <span className="badge verified">✓ Verified</span>
      case 'FACT_CHECKED':
        return <span className="badge fact-checked">✓ Fact Checked</span>
      case 'PARTIALLY_VERIFIED':
        return <span className="badge partial">⚠ Partial</span>
      default:
        return null
    }
  }

  const getImpactIndicators = (statement: Statement) => {
    const impacts = []
    if (statement.lostEmployment) impacts.push('Job Loss')
    if (statement.lostContracts) impacts.push('Contract Loss')
    if (statement.paintedNegatively) impacts.push('Reputation Damage')
    return impacts
  }

  return (
    <Layout>
      <Head>
        <title>Statements Archive - The Words Record</title>
        <meta name="description" content="Browse thousands of documented statements with sources, responses, and verified impact." />
      </Head>

      <div className="statements-container">
        {/* Header */}
        <header className="statements-header">
          <h1>Statements Archive</h1>
          <p className="subtitle">
            {totalCount.toLocaleString()} documented statements with verified sources and response chains
          </p>

          {/* Statistics Bar */}
          <div className="stats-bar">
            <div className="stat">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.verified}</span>
              <span className="stat-label">Verified</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.responses}</span>
              <span className="stat-label">Responses</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.withImpact}</span>
              <span className="stat-label">With Impact</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.thisMonth}</span>
              <span className="stat-label">This Month</span>
            </div>
          </div>
        </header>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search statements, people, organizations, or keywords..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="search-input"
            />
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Quick Filters */}
          <div className="quick-filters">
            {filterPresets.map(preset => (
              <button
                key={preset.key}
                className="preset-btn"
                onClick={() => applyPreset(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="content-area">
          {/* Filters Sidebar */}
          <aside className={`filters-panel ${showFilters ? 'open' : 'closed'}`}>
            <div className="filters-header">
              <h3>Filters</h3>
              <button
                className="toggle-filters"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? '←' : '→'}
              </button>
            </div>

            <div className="filter-group">
              <label>Statement Type</label>
              <select
                value={filters.statementType}
                onChange={(e) => setFilters(prev => ({ ...prev, statementType: e.target.value }))}
              >
                <option value="all">All Types</option>
                <option value="ORIGINAL">Original</option>
                <option value="RESPONSE">Response</option>
                <option value="CLARIFICATION">Clarification</option>
                <option value="RETRACTION">Retraction</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Verification</label>
              <select
                value={filters.verificationLevel}
                onChange={(e) => setFilters(prev => ({ ...prev, verificationLevel: e.target.value }))}
              >
                <option value="all">All Levels</option>
                <option value="VERIFIED">Verified</option>
                <option value="FACT_CHECKED">Fact Checked</option>
                <option value="PARTIALLY_VERIFIED">Partially Verified</option>
                <option value="UNVERIFIED">Unverified</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Person</label>
              <select
                value={filters.personId}
                onChange={(e) => setFilters(prev => ({ ...prev, personId: e.target.value }))}
              >
                <option value="">All People</option>
                {people.map(person => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Organization</label>
              <select
                value={filters.organizationId}
                onChange={(e) => setFilters(prev => ({ ...prev, organizationId: e.target.value }))}
              >
                <option value="">All Organizations</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Case</label>
              <select
                value={filters.caseId}
                onChange={(e) => setFilters(prev => ({ ...prev, caseId: e.target.value }))}
              >
                <option value="">All Cases</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Date Range</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                placeholder="From"
              />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                placeholder="To"
              />
            </div>

            <div className="filter-group">
              <label>
                <input
                  type="checkbox"
                  checked={filters.hasImpact}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasImpact: e.target.checked }))}
                />
                Has Impact
              </label>
            </div>

            <div className="filter-group">
              <label>
                <input
                  type="checkbox"
                  checked={filters.isVerified}
                  onChange={(e) => setFilters(prev => ({ ...prev, isVerified: e.target.checked }))}
                />
                Verified Only
              </label>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="responses-desc">Most Responses</option>
                <option value="impact-desc">Most Impact</option>
                <option value="relevance">Relevance</option>
              </select>
            </div>

            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All Filters
            </button>
          </aside>

          {/* Statements List */}
          <main className="statements-main">
            {/* View Mode Toggle */}
            <div className="view-controls">
              <div className="view-toggle">
                <button
                  className={viewMode === 'compact' ? 'active' : ''}
                  onClick={() => setViewMode('compact')}
                >
                  Compact
                </button>
                <button
                  className={viewMode === 'detailed' ? 'active' : ''}
                  onClick={() => setViewMode('detailed')}
                >
                  Detailed
                </button>
                <button
                  className={viewMode === 'thread' ? 'active' : ''}
                  onClick={() => setViewMode('thread')}
                >
                  Threads
                </button>
              </div>
              <span className="result-count">
                {totalCount > 0 && `${totalCount.toLocaleString()} results`}
              </span>
            </div>

            {/* Statements Display */}
            {loading && statements.length === 0 ? (
              <div className="loading-skeleton">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton-item">
                    <div className="skeleton-line long"></div>
                    <div className="skeleton-line medium"></div>
                    <div className="skeleton-line short"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={() => fetchStatements(1, filters)}>Try Again</button>
              </div>
            ) : statements.length === 0 ? (
              <div className="no-results">
                <p>No statements found matching your filters</p>
                <button onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className={`statements-list view-${viewMode}`}>
                  {statements.map((statement) => (
                    <article
                      key={statement.id}
                      className={`statement-item ${selectedStatement === statement.id ? 'selected' : ''}`}
                      onClick={() => setSelectedStatement(statement.id)}
                    >
                      {/* Statement Header */}
                      <div className="statement-header">
                        <div className="statement-meta">
                          <span className="statement-date">
                            {format(parseISO(statement.statementDate), 'MMM d, yyyy')}
                          </span>
                          {statement.person && (
                            <Link href={`/people/${statement.person.slug}`}>
                              <a className="author-link">{statement.person.name}</a>
                            </Link>
                          )}
                          {statement.organization && (
                            <Link href={`/organizations/${statement.organization.slug}`}>
                              <a className="author-link">{statement.organization.name}</a>
                            </Link>
                          )}
                          {statement.case && (
                            <Link href={`/cases/${statement.case.slug}`}>
                              <a className="case-link">📁 {statement.case.title}</a>
                            </Link>
                          )}
                        </div>
                        <div className="statement-badges">
                          {getVerificationBadge(statement.verificationLevel)}
                          {statement.statementType !== 'ORIGINAL' && (
                            <span className="badge type">{statement.statementType}</span>
                          )}
                          {statement.responseDepth && statement.responseDepth > 0 && (
                            <span className="badge depth">↳ Response #{statement.responseDepth}</span>
                          )}
                        </div>
                      </div>

                      {/* Statement Content */}
                      <div className="statement-content">
                        {viewMode === 'compact' ? (
                          <p className="statement-text compact">
                            {statement.summary || statement.content.substring(0, 200)}...
                          </p>
                        ) : (
                          <>
                            <p className="statement-text">
                              {statement.content}
                            </p>
                            {statement.context && (
                              <div className="statement-context">
                                <strong>Context:</strong> {statement.context}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Statement Footer */}
                      <div className="statement-footer">
                        <div className="statement-stats">
                          {statement._count?.sources && statement._count.sources > 0 && (
                            <span className="stat-item">
                              📎 {statement._count.sources} source{statement._count.sources > 1 ? 's' : ''}
                            </span>
                          )}
                          {statement._count?.responses && statement._count.responses > 0 && (
                            <span className="stat-item">
                              💬 {statement._count.responses} response{statement._count.responses > 1 ? 's' : ''}
                            </span>
                          )}
                          {statement.viewCount && (
                            <span className="stat-item">
                              👁 {statement.viewCount} views
                            </span>
                          )}
                        </div>

                        {/* Impact Indicators */}
                        {(statement.lostEmployment || statement.lostContracts || statement.paintedNegatively) && (
                          <div className="impact-indicators">
                            <span className="impact-label">Impact:</span>
                            {getImpactIndicators(statement).map(impact => (
                              <span key={impact} className="impact-badge">{impact}</span>
                            ))}
                          </div>
                        )}

                        <Link href={`/statements/${statement.id}`}>
                          <a className="view-details">View Details →</a>
                        </Link>
                      </div>

                      {/* Response Thread (if in thread view) */}
                      {viewMode === 'thread' && statement.responses && statement.responses.length > 0 && (
                        <div className="response-thread">
                          {statement.responses.slice(0, 2).map(response => (
                            <div key={response.id} className="thread-response">
                              <span className="thread-line"></span>
                              <div className="response-content">
                                <span className="response-author">
                                  {response.person?.name || response.organization?.name}:
                                </span>
                                <p className="response-text">
                                  {response.content.substring(0, 150)}...
                                </p>
                              </div>
                            </div>
                          ))}
                          {statement.responses.length > 2 && (
                            <Link href={`/statements/${statement.id}#responses`}>
                              <a className="see-all-responses">
                                See all {statement.responses.length} responses →
                              </a>
                            </Link>
                          )}
                        </div>
                      )}
                    </article>
                  ))}
                </div>

                {/* Infinite Scroll Trigger */}
                {hasMore && (
                  <div ref={loadMoreRef} className="load-more-trigger">
                    {loadingMore && (
                      <div className="loading-more">
                        <span className="spinner"></span>
                        Loading more statements...
                      </div>
                    )}
                  </div>
                )}

                {!hasMore && statements.length > 0 && (
                  <div className="end-of-results">
                    <p>— End of results —</p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <style jsx>{`
        .statements-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* Header */
        .statements-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .statements-header h1 {
          font-family: 'Cinzel', serif;
          font-size: 3rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        /* Statistics Bar */
        .stats-bar {
          display: flex;
          justify-content: center;
          gap: 3rem;
          padding: 1.5rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .stat {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 2rem;
          font-weight: 600;
          color: var(--accent);
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        /* Search Section */
        .search-section {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .search-container {
          position: relative;
          margin-bottom: 1rem;
        }

        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid var(--border-light);
          border-radius: 8px;
          font-size: 1rem;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--accent);
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
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .preset-btn {
          padding: 0.5rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .preset-btn:hover {
          background: var(--accent);
          color: white;
        }

        /* Content Area */
        .content-area {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2rem;
        }

        /* Filters Panel */
        .filters-panel {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          height: fit-content;
          position: sticky;
          top: 1rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .filters-panel.closed {
          width: 60px;
          padding: 1rem 0.5rem;
        }

        .filters-panel.closed .filter-group,
        .filters-panel.closed .clear-filters-btn {
          display: none;
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .filters-header h3 {
          font-size: 1.2rem;
          margin: 0;
        }

        .toggle-filters {
          padding: 0.25rem 0.5rem;
          background: transparent;
          border: 1px solid var(--border-light);
          border-radius: 4px;
          cursor: pointer;
        }

        .filter-group {
          margin-bottom: 1.5rem;
        }

        .filter-group label {
          display: block;
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .filter-group select,
        .filter-group input[type="date"] {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--border-light);
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }

        .filter-group input[type="checkbox"] {
          margin-right: 0.5rem;
        }

        .clear-filters-btn {
          width: 100%;
          padding: 0.75rem;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        /* Main Content */
        .statements-main {
          min-height: 600px;
        }

        /* View Controls */
        .view-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
        }

        .view-toggle {
          display: flex;
          gap: 0.5rem;
        }

        .view-toggle button {
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid var(--border-light);
          border-radius: 4px;
          cursor: pointer;
        }

        .view-toggle button.active {
          background: var(--accent);
          color: white;
        }

        .result-count {
          color: var(--text-secondary);
        }

        /* Statements List */
        .statements-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* Statement Item */
        .statement-item {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: all 0.2s;
          cursor: pointer;
        }

        .statement-item:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }

        .statement-item.selected {
          border: 2px solid var(--accent);
        }

        /* Statement Header */
        .statement-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .statement-meta {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .statement-date {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .author-link {
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
        }

        .author-link:hover {
          text-decoration: underline;
        }

        .case-link {
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-decoration: none;
        }

        /* Badges */
        .statement-badges {
          display: flex;
          gap: 0.5rem;
        }

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .badge.verified {
          background: #d4edda;
          color: #155724;
        }

        .badge.fact-checked {
          background: #cce5ff;
          color: #004085;
        }

        .badge.partial {
          background: #fff3cd;
          color: #856404;
        }

        .badge.type {
          background: var(--bg-secondary);
          color: var(--text-secondary);
        }

        .badge.depth {
          background: #f0f0f0;
          color: var(--text-secondary);
        }

        /* Statement Content */
        .statement-content {
          margin-bottom: 1rem;
        }

        .statement-text {
          line-height: 1.6;
          color: var(--text-primary);
        }

        .statement-text.compact {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .statement-context {
          margin-top: 0.5rem;
          padding: 0.75rem;
          background: var(--bg-secondary);
          border-radius: 4px;
          font-size: 0.9rem;
        }

        /* Statement Footer */
        .statement-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-light);
        }

        .statement-stats {
          display: flex;
          gap: 1rem;
        }

        .stat-item {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        /* Impact Indicators */
        .impact-indicators {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .impact-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .impact-badge {
          padding: 0.2rem 0.6rem;
          background: #f8d7da;
          color: #721c24;
          border-radius: 12px;
          font-size: 0.75rem;
        }

        .view-details {
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
        }

        /* Response Thread */
        .response-thread {
          margin-top: 1rem;
          padding-left: 2rem;
          position: relative;
        }

        .thread-response {
          position: relative;
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }

        .thread-line {
          position: absolute;
          left: 0;
          top: 0;
          bottom: -1rem;
          width: 2px;
          background: var(--border-light);
        }

        .response-content {
          background: var(--bg-secondary);
          padding: 0.75rem;
          border-radius: 6px;
        }

        .response-author {
          font-weight: 500;
          color: var(--accent);
        }

        .response-text {
          margin-top: 0.25rem;
          font-size: 0.9rem;
        }

        .see-all-responses {
          color: var(--accent);
          text-decoration: none;
          font-size: 0.9rem;
        }

        /* Loading States */
        .loading-skeleton {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .skeleton-item {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .skeleton-line {
          height: 16px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }

        .skeleton-line.long { width: 100%; }
        .skeleton-line.medium { width: 70%; }
        .skeleton-line.short { width: 40%; }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Load More */
        .load-more-trigger {
          text-align: center;
          padding: 2rem;
        }

        .loading-more {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid var(--border-light);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* End of Results */
        .end-of-results {
          text-align: center;
          padding: 2rem;
          color: var(--text-secondary);
        }

        /* Error & No Results */
        .error-message, .no-results {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 8px;
        }

        /* CSS Variables */
        :root {
          --text-primary: #2f3538;
          --text-secondary: #5f6f7a;
          --bg-primary: #f9f8f6;
          --bg-secondary: #f2f1ef;
          --accent: #4a5f71;
          --border-light: #e8e6e3;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .content-area {
            grid-template-columns: 1fr;
          }

          .filters-panel {
            position: static;
            margin-bottom: 2rem;
          }

          .stats-bar {
            flex-wrap: wrap;
            gap: 1rem;
          }
        }

        @media (max-width: 768px) {
          .statements-container {
            padding: 1rem;
          }

          .statements-header h1 {
            font-size: 2rem;
          }

          .statement-header {
            flex-direction: column;
            gap: 0.5rem;
          }

          .statement-footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </Layout>
  )
}