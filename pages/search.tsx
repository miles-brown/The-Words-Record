import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '@/components/Layout'
import SearchBox from '@/components/SearchBox'
import { format } from 'date-fns'

interface SearchResult {
  type: 'person' | 'incident' | 'organization'
  id: string
  title: string
  slug: string
  description: string
  relevanceScore: number
  metadata: any
}

interface SearchResponse {
  query: string
  totalResults: number
  results: SearchResult[]
  summary: {
    persons: number
    incidents: number
    organizations: number
  }
}

export default function SearchPage() {
  const router = useRouter()
  const { q: initialQuery, type: initialType } = router.query
  
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState({ persons: 0, incidents: 0, organizations: 0 })
  const [activeFilter, setActiveFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'name'>('relevance')

  useEffect(() => {
    if (initialQuery && typeof initialQuery === 'string') {
      setQuery(initialQuery)
      performSearch(initialQuery, initialType as string || '')
    }
  }, [initialQuery, initialType])

  const performSearch = async (searchQuery: string, typeFilter: string = '') => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        limit: '50'
      })
      
      if (typeFilter) {
        params.append('type', typeFilter)
      }

      const response = await fetch(`/api/search?${params}`)
      
      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data: SearchResponse = await response.json()
      setResults(data.results)
      setSummary(data.summary)

      // Update URL without causing page reload
      const newUrl = `/search?q=${encodeURIComponent(searchQuery)}${typeFilter ? `&type=${typeFilter}` : ''}`
      window.history.replaceState(null, '', newUrl)

    } catch (err) {
      setError('Search failed. Please try again.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
    if (query) {
      performSearch(query, filter)
    }
  }

  const handleSortChange = (newSort: 'relevance' | 'date' | 'name') => {
    setSortBy(newSort)
    
    const sortedResults = [...results].sort((a, b) => {
      switch (newSort) {
        case 'relevance':
          return b.relevanceScore - a.relevanceScore
        case 'date':
          const aDate = a.metadata.incidentDate || a.metadata.founded || 0
          const bDate = b.metadata.incidentDate || b.metadata.founded || 0
          return new Date(bDate).getTime() - new Date(aDate).getTime()
        case 'name':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })
    
    setResults(sortedResults)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'person': return '👤'
      case 'incident': return '📰'
      case 'organization': return '🏢'
      default: return '📄'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'person': return 'type-person'
      case 'incident': return 'type-incident'
      case 'organization': return 'type-organization'
      default: return 'type-default'
    }
  }

  const renderResultCard = (result: SearchResult) => {
    const url = `/${result.type === 'person' ? 'persons' : 
                  result.type === 'incident' ? 'incidents' : 
                  'organizations'}/${result.slug}`

    return (
      <Link href={url} key={result.id}>
        <article className="result-card">
          <div className="result-header">
            <div className="result-title-section">
              <span className="result-icon">{getTypeIcon(result.type)}</span>
              <h2>{result.title}</h2>
            </div>
            <span className={`result-type ${getTypeColor(result.type)}`}>
              {result.type}
            </span>
          </div>
          
          <p className="result-description">{result.description}</p>
          
          <div className="result-metadata">
            {result.type === 'person' && (
              <>
                {result.metadata.profession && (
                  <span className="meta-item">👔 {result.metadata.profession}</span>
                )}
                <span className="meta-item">
                  📊 {result.metadata.incidentCount} incidents
                </span>
              </>
            )}
            
            {result.type === 'incident' && (
              <>
                <span className="meta-item">
                  📅 {format(new Date(result.metadata.incidentDate), 'MMM d, yyyy')}
                </span>
                {result.metadata.location && (
                  <span className="meta-item">📍 {result.metadata.location}</span>
                )}
                <span className={`meta-item status-${result.metadata.status}`}>
                  {result.metadata.status}
                </span>
              </>
            )}
            
            {result.type === 'organization' && (
              <>
                <span className="meta-item">🏷️ {result.metadata.type}</span>
                {result.metadata.headquarters && (
                  <span className="meta-item">📍 {result.metadata.headquarters}</span>
                )}
                <span className="meta-item">
                  📊 {result.metadata.incidentCount} incidents
                </span>
              </>
            )}
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Layout
      title={query ? `Search results for "${query}"` : 'Search'}
      description={query ? `Search results for "${query}"` : 'Search people, incidents, and organizations'}
    >
      <div className="search-page">
        <div className="search-header">
          <h1>Search</h1>
          <div className="search-box-container">
            <SearchBox 
              showQuickResults={false}
              className="main-search"
            />
          </div>
        </div>

        {query && (
          <div className="search-controls">
            <div className="search-summary">
              <h2>Results for "{query}"</h2>
              {!loading && (
                <div className="summary-stats">
                  <span className="total-count">{results.length} total results</span>
                  {summary.persons > 0 && (
                    <span className="category-count">{summary.persons} people</span>
                  )}
                  {summary.incidents > 0 && (
                    <span className="category-count">{summary.incidents} incidents</span>
                  )}
                  {summary.organizations > 0 && (
                    <span className="category-count">{summary.organizations} organizations</span>
                  )}
                </div>
              )}
            </div>

            <div className="search-filters">
              <div className="filter-section">
                <label>Filter by type:</label>
                <div className="filter-buttons">
                  <button
                    className={`filter-btn ${activeFilter === '' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('')}
                  >
                    All
                  </button>
                  <button
                    className={`filter-btn ${activeFilter === 'persons' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('persons')}
                  >
                    👤 People
                  </button>
                  <button
                    className={`filter-btn ${activeFilter === 'incidents' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('incidents')}
                  >
                    📰 Incidents
                  </button>
                  <button
                    className={`filter-btn ${activeFilter === 'organizations' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('organizations')}
                  >
                    🏢 Organizations
                  </button>
                </div>
              </div>

              <div className="sort-section">
                <label htmlFor="sort-select">Sort by:</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as any)}
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Date</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="search-content">
          {loading ? (
            <div className="loading-section">
              <div className="loading-spinner"></div>
              <p>Searching...</p>
            </div>
          ) : error ? (
            <div className="error-section">
              <p>{error}</p>
              <button onClick={() => query && performSearch(query, activeFilter)}>
                Try Again
              </button>
            </div>
          ) : results.length > 0 ? (
            <div className="results-grid">
              {results.map(renderResultCard)}
            </div>
          ) : query ? (
            <div className="no-results">
              <h3>No results found</h3>
              <p>Try adjusting your search terms or filters.</p>
              <div className="search-suggestions">
                <h4>Search tips:</h4>
                <ul>
                  <li>Use different keywords</li>
                  <li>Check your spelling</li>
                  <li>Try broader terms</li>
                  <li>Remove filters to expand results</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="search-placeholder">
              <h3>Start searching</h3>
              <p>Enter keywords to search across people, incidents, and organizations.</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .search-page {
          max-width: 1000px;
          margin: 0 auto;
        }

        .search-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .search-header h1 {
          font-size: 2.5rem;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .search-box-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .search-controls {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .search-summary {
          margin-bottom: 1.5rem;
        }

        .search-summary h2 {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .summary-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .total-count {
          font-weight: 500;
          color: var(--text-primary);
        }

        .category-count {
          background: var(--background-secondary);
          padding: 0.3rem 0.8rem;
          border-radius: 4px;
        }

        .search-filters {
          display: flex;
          gap: 2rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .filter-section, .sort-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .filter-section label, .sort-section label {
          font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .filter-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          border: 1px solid var(--border-primary);
          background: var(--background-primary);
          color: var(--text-secondary);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .filter-btn:hover {
          background: var(--background-secondary);
        }

        .filter-btn.active {
          background: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
        }

        .sort-section select {
          padding: 0.5rem;
          border: 1px solid var(--border-primary);
          border-radius: 4px;
          background: var(--background-primary);
          color: var(--text-primary);
        }

        .loading-section {
          text-align: center;
          padding: 4rem 0;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-primary);
          border-top: 3px solid var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-section {
          text-align: center;
          padding: 2rem;
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 8px;
          margin: 2rem 0;
        }

        .error-section p {
          color: #c33;
          margin-bottom: 1rem;
        }

        .error-section button {
          background: #c33;
          color: white;
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .results-grid {
          display: grid;
          gap: 1.5rem;
        }

        .result-card {
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 1.5rem;
          background: var(--background-primary);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .result-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .result-title-section {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }

        .result-icon {
          font-size: 1.2rem;
        }

        .result-header h2 {
          font-size: 1.3rem;
          color: var(--text-primary);
          margin: 0;
        }

        .result-type {
          font-size: 0.8rem;
          padding: 0.3rem 0.8rem;
          border-radius: 4px;
          font-weight: 500;
          white-space: nowrap;
        }

        .type-person {
          background: #e3f2fd;
          color: #1976d2;
        }

        .type-incident {
          background: #fff3e0;
          color: #f57c00;
        }

        .type-organization {
          background: #e8f5e9;
          color: #388e3c;
        }

        .result-description {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .result-metadata {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .meta-item {
          font-size: 0.85rem;
          color: var(--text-secondary);
          background: var(--background-secondary);
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
        }

        .status-documented {
          background: #d5f4e6 !important;
          color: #27ae60 !important;
        }

        .status-ongoing {
          background: #ffeaa7 !important;
          color: #f39c12 !important;
        }

        .no-results, .search-placeholder {
          text-align: center;
          padding: 4rem 0;
        }

        .no-results h3, .search-placeholder h3 {
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .no-results p, .search-placeholder p {
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .search-suggestions {
          background: var(--background-secondary);
          padding: 1.5rem;
          border-radius: 8px;
          max-width: 400px;
          margin: 0 auto;
        }

        .search-suggestions h4 {
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .search-suggestions ul {
          text-align: left;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .search-header h1 {
            font-size: 2rem;
          }

          .search-filters {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .filter-section, .sort-section {
            flex-direction: column;
            align-items: flex-start;
          }

          .summary-stats {
            flex-direction: column;
            gap: 0.5rem;
          }

          .result-header {
            flex-direction: column;
          }

          .result-metadata {
            justify-content: center;
          }
        }
      `}</style>
    </Layout>
  )
}