import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'

interface Source {
  id: string
  title: string
  url?: string
  publication?: string
  author?: string
  publishDate?: string
  credibility: string
  sourceType?: string
  verificationStatus?: string
  isArchived: boolean
  archiveUrl?: string
  mediaOutlet?: {
    id: string
    name: string
    slug: string
    country?: string
  }
  journalist?: {
    id: string
    name: string
    slug: string
  }
  statement?: {
    id: string
    text: string
    slug: string
  }
  case?: {
    id: string
    title: string
    slug: string
  }
}

export default function SourcesIndex() {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [credibilityFilter, setCredibilityFilter] = useState<string>('')
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string>('')
  const [verifiedFilter, setVerifiedFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState('publishDate')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    fetchSources()
  }, [search, credibilityFilter, sourceTypeFilter, verifiedFilter, sortBy, sortOrder])

  async function fetchSources() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (credibilityFilter) params.append('credibility', credibilityFilter)
      if (sourceTypeFilter) params.append('sourceType', sourceTypeFilter)
      if (verifiedFilter) params.append('verified', verifiedFilter)
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)

      const response = await fetch(`/api/sources?${params.toString()}`)
      const data = await response.json()
      setSources(data.sources || [])
    } catch (error) {
      console.error('Error fetching sources:', error)
    } finally {
      setLoading(false)
    }
  }

  function getCredibilityColor(credibility: string) {
    switch (credibility) {
      case 'HIGH': return '#22c55e'
      case 'MEDIUM': return '#eab308'
      case 'LOW': return '#ef4444'
      default: return '#94a3b8'
    }
  }

  function formatDate(dateString?: string) {
    if (!dateString) return 'No date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <Layout>
      <Head>
        <title>Sources | Who Said What</title>
        <meta name="description" content="Browse our verified sources and citations" />
      </Head>

      <div className="sources-page">
        <header className="page-header">
          <h1>Sources</h1>
          <p className="subtitle">
            All sources are cited using Harvard referencing style and archived for verification
          </p>
        </header>

        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search sources by title, author, or publication..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filters-row">
            <select
              value={credibilityFilter}
              onChange={(e) => setCredibilityFilter(e.target.value)}
            >
              <option value="">All Credibility</option>
              <option value="HIGH">High Credibility</option>
              <option value="MEDIUM">Medium Credibility</option>
              <option value="LOW">Low Credibility</option>
              <option value="UNKNOWN">Unknown</option>
            </select>

            <select
              value={sourceTypeFilter}
              onChange={(e) => setSourceTypeFilter(e.target.value)}
            >
              <option value="">All Source Types</option>
              <option value="NEWS_ARTICLE">News Article</option>
              <option value="SOCIAL_MEDIA">Social Media</option>
              <option value="VIDEO">Video</option>
              <option value="BOOK">Book</option>
              <option value="ACADEMIC_PAPER">Academic Paper</option>
              <option value="GOVERNMENT_DOCUMENT">Government Document</option>
            </select>

            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
            >
              <option value="">All Verification Status</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="publishDate">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="credibility">Sort by Credibility</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="sort-toggle"
            >
              {sortOrder === 'asc' ? '‘' : '“'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading sources...</div>
        ) : sources.length === 0 ? (
          <div className="no-results">No sources found</div>
        ) : (
          <div className="sources-list">
            {sources.map((source) => (
              <article key={source.id} className="source-card">
                <div className="source-header">
                  <h2>
                    <Link href={`/sources/${source.id}`}>
                      {source.title}
                    </Link>
                  </h2>
                  <div className="source-badges">
                    {source.isArchived && (
                      <span className="badge archived">Archived</span>
                    )}
                    {source.verificationStatus === 'VERIFIED' && (
                      <span className="badge verified">Verified</span>
                    )}
                  </div>
                </div>

                <div className="source-meta">
                  {(source.author || source.journalist) && (
                    <div className="meta-item">
                      <strong>Author:</strong>{' '}
                      {source.journalist ? (
                        <Link href={`/journalists/${source.journalist.slug}`}>
                          {source.journalist.name}
                        </Link>
                      ) : (
                        source.author
                      )}
                    </div>
                  )}

                  {(source.publication || source.mediaOutlet) && (
                    <div className="meta-item">
                      <strong>Publication:</strong>{' '}
                      {source.mediaOutlet ? (
                        <Link href={`/media-outlets/${source.mediaOutlet.slug}`}>
                          {source.mediaOutlet.name}
                        </Link>
                      ) : (
                        source.publication
                      )}
                    </div>
                  )}

                  <div className="meta-item">
                    <strong>Published:</strong> {formatDate(source.publishDate)}
                  </div>

                  <div className="meta-item">
                    <strong>Credibility:</strong>{' '}
                    <span
                      className="credibility-badge"
                      style={{ backgroundColor: getCredibilityColor(source.credibility) }}
                    >
                      {source.credibility}
                    </span>
                  </div>

                  {source.sourceType && (
                    <div className="meta-item">
                      <strong>Type:</strong>{' '}
                      {source.sourceType.replace(/_/g, ' ')}
                    </div>
                  )}
                </div>

                {source.url && (
                  <div className="source-url">
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      View original source ’
                    </a>
                  </div>
                )}

                {(source.statement || source.case) && (
                  <div className="related-content">
                    {source.statement && (
                      <div className="related-item">
                        Related to statement:{' '}
                        <Link href={`/statements/${source.statement.slug}`}>
                          {source.statement.text.slice(0, 100)}...
                        </Link>
                      </div>
                    )}
                    {source.case && (
                      <div className="related-item">
                        Related to case:{' '}
                        <Link href={`/cases/${source.case.slug}`}>
                          {source.case.title}
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .sources-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2.5rem;
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
        }

        .subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .filters-section {
          background: var(--card-background);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .search-box {
          margin-bottom: 1rem;
        }

        .search-box input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 1rem;
        }

        .filters-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filters-row select {
          flex: 1;
          min-width: 150px;
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 0.95rem;
        }

        .sort-toggle {
          padding: 0.5rem 1rem;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1.2rem;
        }

        .sort-toggle:hover {
          opacity: 0.9;
        }

        .loading, .no-results {
          text-align: center;
          padding: 3rem;
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .sources-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .source-card {
          background: var(--card-background);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1.5rem;
          transition: box-shadow 0.2s;
        }

        .source-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .source-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .source-header h2 {
          margin: 0;
          font-size: 1.3rem;
          flex: 1;
        }

        .source-header h2 a {
          color: var(--text-primary);
          text-decoration: none;
        }

        .source-header h2 a:hover {
          color: var(--accent-color);
        }

        .source-badges {
          display: flex;
          gap: 0.5rem;
        }

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .badge.archived {
          background: #3b82f6;
          color: white;
        }

        .badge.verified {
          background: #22c55e;
          color: white;
        }

        .source-meta {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .meta-item {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .meta-item strong {
          color: var(--text-primary);
        }

        .meta-item a {
          color: var(--accent-color);
          text-decoration: none;
        }

        .meta-item a:hover {
          text-decoration: underline;
        }

        .credibility-badge {
          padding: 0.15rem 0.5rem;
          border-radius: 3px;
          color: white;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .source-url {
          margin: 1rem 0;
        }

        .source-url a {
          color: var(--accent-color);
          text-decoration: none;
          font-size: 0.95rem;
        }

        .source-url a:hover {
          text-decoration: underline;
        }

        .related-content {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .related-item {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .related-item a {
          color: var(--accent-color);
          text-decoration: none;
        }

        .related-item a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .page-header h1 {
            font-size: 2rem;
          }

          .filters-row {
            flex-direction: column;
          }

          .filters-row select {
            width: 100%;
          }

          .source-meta {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  )
}
