import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface SearchResult {
  type: 'person' | 'case' | 'organization'
  id: string
  title: string
  slug: string
  description: string
  relevanceScore: number
  metadata: any
}

interface SearchBoxProps {
  placeholder?: string
  className?: string
  showQuickResults?: boolean
}

export default function SearchBox({ 
  placeholder = "Search people, cases, organizations...", 
  className = "",
  showQuickResults = true 
}: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (query.length >= 2) {
      timeoutRef.current = setTimeout(() => {
        performSearch(query)
      }, 300)
    } else {
      setResults([])
      setShowResults(false)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const performSearch = async (searchQuery: string) => {
    if (!showQuickResults) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
        setShowResults(true)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setShowResults(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          const result = results[selectedIndex]
          const url = `/${result.type === 'person' ? 'people' : 
                        result.type === 'case' ? 'cases' : 
                        'organizations'}/${result.slug}`
          router.push(url)
          setShowResults(false)
        } else {
          handleSubmit(e)
        }
        break
      case 'Escape':
        setShowResults(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'person': return '👤'
      case 'case': return '📰'
      case 'organization': return '🏢'
      default: return '📄'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'person': return 'type-person'
      case 'case': return 'type-case'
      case 'organization': return 'type-organization'
      default: return 'type-default'
    }
  }

  return (
    <div className={`search-box ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            placeholder={placeholder}
            className="search-input"
            aria-label="Search"
            aria-expanded={showResults}
            aria-autocomplete="list"
            aria-controls="search-results"
            role="combobox"
          />
          <button type="submit" className="search-button" aria-label="Search">
            🔍
          </button>
        </div>
      </form>

      {showQuickResults && showResults && (
        <div id="search-results" className="search-results" role="listbox">
          {isLoading ? (
            <div className="search-loading">
              <div className="loading-spinner"></div>
              <span>Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <>
              {results.map((result, index) => (
                <Link 
                  href={`/${result.type === 'person' ? 'people' : 
                          result.type === 'case' ? 'cases' : 
                          'organizations'}/${result.slug}`}
                  key={result.id}
                >
                  <div 
                    className={`search-result-item ${
                      index === selectedIndex ? 'selected' : ''
                    }`}
                    role="option"
                    aria-selected={index === selectedIndex}
                  >
                    <div className="result-header">
                      <span className="result-icon">{getTypeIcon(result.type)}</span>
                      <span className="result-title">{result.title}</span>
                      <span className={`result-type ${getTypeColor(result.type)}`}>
                        {result.type}
                      </span>
                    </div>
                    <p className="result-description">{result.description}</p>
                  </div>
                </Link>
              ))}
              <div className="search-results-footer">
                <Link href={`/search?q=${encodeURIComponent(query)}`}>
                  <span className="view-all-link">
                    View all results for "{query}"
                  </span>
                </Link>
              </div>
            </>
          ) : query.length >= 2 ? (
            <div className="no-results">
              <p>No results found for "{query}"</p>
              <Link href={`/search?q=${encodeURIComponent(query)}`}>
                <span className="advanced-search-link">Try advanced search</span>
              </Link>
            </div>
          ) : null}
        </div>
      )}

      <style jsx>{`
        .search-box {
          position: relative;
          width: 100%;
          max-width: 500px;
        }

        .search-form {
          width: 100%;
        }

        .search-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 3rem 0.75rem 1rem;
          border: 2px solid var(--border-primary);
          border-radius: 25px;
          font-size: 1rem;
          background: var(--background-primary);
          color: var(--text-primary);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .search-button {
          position: absolute;
          right: 0.5rem;
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .search-button:hover {
          background: var(--background-secondary);
        }

        .search-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--background-primary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          max-height: 400px;
          overflow-y: auto;
          z-index: 1000;
          margin-top: 0.5rem;
        }

        .search-loading {
          padding: 1rem;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: var(--text-secondary);
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid var(--border-primary);
          border-top: 2px solid var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .search-result-item {
          padding: 1rem;
          border-bottom: 1px solid var(--border-primary);
          cursor: pointer;
          transition: background 0.2s;
        }

        .search-result-item:hover,
        .search-result-item.selected {
          background: var(--background-secondary);
        }

        .search-result-item:last-of-type {
          border-bottom: none;
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .result-icon {
          font-size: 1.1rem;
        }

        .result-title {
          font-weight: 500;
          color: var(--text-primary);
          flex: 1;
        }

        .result-type {
          font-size: 0.8rem;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          font-weight: 500;
        }

        .type-person {
          background: #e3f2fd;
          color: #1976d2;
        }

        .type-case {
          background: #fff3e0;
          color: #f57c00;
        }

        .type-organization {
          background: #e8f5e9;
          color: #388e3c;
        }

        .type-default {
          background: var(--background-secondary);
          color: var(--text-secondary);
        }

        .result-description {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .search-results-footer {
          padding: 0.75rem 1rem;
          border-top: 1px solid var(--border-primary);
          background: var(--background-secondary);
        }

        .view-all-link {
          color: var(--accent-primary);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
        }

        .view-all-link:hover {
          text-decoration: underline;
        }

        .no-results {
          padding: 1.5rem 1rem;
          text-align: center;
        }

        .no-results p {
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .advanced-search-link {
          color: var(--accent-primary);
          font-size: 0.9rem;
          cursor: pointer;
        }

        .advanced-search-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .search-input {
            padding: 0.6rem 2.5rem 0.6rem 0.8rem;
            font-size: 0.9rem;
          }

          .search-button {
            right: 0.3rem;
            font-size: 1rem;
          }

          .search-results {
            max-height: 300px;
          }

          .result-header {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  )
}