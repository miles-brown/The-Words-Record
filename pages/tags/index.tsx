import { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'

export default function TagsPage() {
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      if (!response.ok) throw new Error('Failed to fetch tags')
      const data = await response.json()
      setTags(data.tags)
    } catch (err) {
      setError('Failed to load tags')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout
      title="Tags"
      description="Browse incidents by category and topic"
    >
      <div className="tags-page">
        <div className="page-header">
          <h1>Browse by Tag</h1>
          <p className="page-description">
            Explore incidents organized by categories and topics
          </p>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading tags...</div>
        ) : (
          <div className="tags-grid">
            {tags.map((tag) => (
              <Link href={`/tags/${tag.slug}`} key={tag.id}>
                <div className="tag-card">
                  <h2>{tag.name}</h2>
                  {tag.description && <p className="tag-description">{tag.description}</p>}
                  <div className="tag-count">
                    {tag._count?.cases || 0} incident{tag._count?.cases !== 1 ? 's' : ''}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .tags-page {
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
          line-height: 1.8;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          padding: 1rem;
          text-align: center;
          color: #dc2626;
          margin-bottom: 2rem;
        }

        .loading {
          text-align: center;
          color: var(--text-secondary);
          padding: 4rem;
        }

        .tags-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .tag-card {
          background: var(--background-primary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 1.5rem;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .tag-card:hover {
          border-color: var(--border-secondary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .tag-card h2 {
          font-size: 1.3rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .tag-description {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .tag-count {
          font-size: 0.85rem;
          color: var(--accent-primary);
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .page-header h1 {
            font-size: 2rem;
          }

          .tags-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  )
}
