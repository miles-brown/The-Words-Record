import { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { format } from 'date-fns'

interface Topic {
  id: string
  name: string
  slug: string
  description: string
  topicType: string
  startDate?: string
  endDate?: string
  isFeatured?: boolean
  trendingScore?: number
  controversyScore?: number
  _count: {
    cases: number
  }
  cases?: {
    Case: {
      id: string
      title: string
      slug: string
      caseDate: string
      summary: string
    }
  }[]
}

export default function TopicsPage() {
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([])
  const [allTopics, setAllTopics] = useState<Topic[]>([])
  const [developingStories, setDevelopingStories] = useState<Topic[]>([])
  const [trendingTopics, setTrendingTopics] = useState<Topic[]>([])
  const [highlightedTopics, setHighlightedTopics] = useState<Topic[]>([])
  const [topicsByType, setTopicsByType] = useState<Record<string, Topic[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTopicsData()
  }, [])

  const fetchTopicsData = async () => {
    try {
      // Fetch all active topics
      const allRes = await fetch('/api/topics?limit=100')
      if (!allRes.ok) throw new Error('Failed to fetch topics')
      const allData = await allRes.json()
      const topics = allData.topics || []
      setAllTopics(topics)

      // Group topics by type
      const byType: Record<string, Topic[]> = {}
      topics.forEach((topic: Topic) => {
        const type = topic.topicType || 'OTHER'
        if (!byType[type]) {
          byType[type] = []
        }
        byType[type].push(topic)
      })
      setTopicsByType(byType)

      // Fetch developing stories (topics with recent start dates)
      const developingRes = await fetch('/api/topics?developing=true&limit=5')
      if (developingRes.ok) {
        const developingData = await developingRes.json()
        setDevelopingStories(developingData.topics || [])
      }

      // Fetch trending topics
      const trendingRes = await fetch('/api/topics?trending=true&limit=6')
      if (trendingRes.ok) {
        const trendingData = await trendingRes.json()
        setTrendingTopics(trendingData.topics || [])
      }

      // Fetch highlighted topics (high controversy/featured)
      const highlightedRes = await fetch('/api/topics?highlighted=true&limit=3')
      if (highlightedRes.ok) {
        const highlightedData = await highlightedRes.json()
        setHighlightedTopics(highlightedData.topics || [])
      }

    } catch (err) {
      setError('Failed to load topics')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleTopicSelection = (topicId: string) => {
    setSelectedTopicIds(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    )
  }

  const didYouKnowFacts = [
    "Topics are major events or issues that span multiple cases and statements",
    "Each topic tracks key figures, affected organizations, and geographic scope",
    "Topics can have parent-child relationships to show how issues evolve",
    "Trending scores are calculated based on recent activity and media attention",
  ]

  const formatTopicType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
  }

  if (loading) {
    return (
      <Layout title="Topics" description="Explore major topics and developing stories">
        <div className="topics-page">
          <div className="loading">Loading topics...</div>
        </div>
        <style jsx>{`
          .topics-page {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
          }
          .loading {
            text-align: center;
            padding: 4rem 0;
            color: var(--text-secondary);
            font-size: 1.1rem;
          }
        `}</style>
      </Layout>
    )
  }

  return (
    <Layout
      title="Topics"
      description="Explore major topics, developing stories, and curated collections of related cases"
    >
      <div className="topics-page">
        {/* Hero Header */}
        <div className="hero-header">
          <h1>Topics</h1>
          <p className="hero-description">
            Major events, issues, and ongoing stories documented through verified statements and sources
          </p>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="topics-layout">
          {/* Main Content Column */}
          <div className="main-column">
            {/* Developing Stories Section */}
            {developingStories.length > 0 && (
              <section className="section developing-stories">
                <h2 className="section-title">🔴 Developing Stories</h2>
                <p className="section-subtitle">Recently initiated topics with ongoing developments</p>
                <div className="stories-list">
                  {developingStories.map((topic) => (
                    <Link href={`/topics/${topic.slug}`} key={topic.id}>
                      <div className="story-card">
                        <div className="story-meta">
                          {topic.startDate && (
                            <span>Started {format(new Date(topic.startDate), 'MMM d, yyyy')}</span>
                          )}
                          <span className="case-badge">{topic._count?.cases || 0} cases</span>
                        </div>
                        <h3>{topic.name}</h3>
                        {topic.description && (
                          <p className="story-description">{topic.description}</p>
                        )}
                        {topic.cases && topic.cases.length > 0 && (
                          <div className="recent-cases">
                            <strong>Recent cases:</strong>
                            <ul>
                              {topic.cases.slice(0, 2).map((tc) => (
                                <li key={tc.Case.id}>{tc.Case.title}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Topics by Category Section */}
            <section className="section topics-by-category">
              <h2 className="section-title">Topics by Category</h2>
              <p className="section-subtitle">Browse topics organized by type and subject matter</p>

              {Object.keys(topicsByType).length === 0 ? (
                <div className="empty-state">
                  <p>No topics have been created yet. Topics are major events or issues that tie together multiple cases and statements.</p>
                </div>
              ) : (
                Object.entries(topicsByType).map(([type, topics]) => (
                  <div key={type} className="category-group">
                    <h3 className="category-title">{formatTopicType(type)}</h3>
                    <div className="topics-grid">
                      {topics.slice(0, 6).map((topic) => (
                        <Link href={`/topics/${topic.slug}`} key={topic.id}>
                          <div className="topic-card">
                            <h4>{topic.name}</h4>
                            <p className="topic-description">{topic.description}</p>
                            <div className="topic-meta">
                              <span className="case-count">{topic._count?.cases || 0} cases</span>
                              {topic.startDate && (
                                <span className="topic-date">
                                  {format(new Date(topic.startDate), 'MMM yyyy')}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    {topics.length > 6 && (
                      <Link href={`/topics?type=${type}`}>
                        <span className="view-more">View all {formatTopicType(type)} topics →</span>
                      </Link>
                    )}
                  </div>
                ))
              )}
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="sidebar-column">
            {/* Highlights Section */}
            {highlightedTopics.length > 0 && (
              <section className="section highlights">
                <h2 className="section-title">⭐ Highlights</h2>
                <p className="section-subtitle">Featured and high-impact topics</p>
                <div className="highlights-list">
                  {highlightedTopics.map((topic) => (
                    <Link href={`/topics/${topic.slug}`} key={topic.id}>
                      <div className="highlight-card">
                        <h4>{topic.name}</h4>
                        {topic.description && (
                          <p className="highlight-description">{topic.description}</p>
                        )}
                        <div className="highlight-meta">
                          <span className="case-count">{topic._count?.cases || 0} cases</span>
                          {topic.controversyScore && (
                            <span className="controversy-badge">
                              Controversy: {topic.controversyScore.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Did You Know Section */}
            <section className="section did-you-know">
              <h2 className="section-title">💡 Did You Know?</h2>
              <div className="dyk-list">
                {didYouKnowFacts.map((fact, index) => (
                  <div key={index} className="dyk-item">
                    <p>{fact}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Trending and Updated Section */}
            {trendingTopics.length > 0 && (
              <section className="section trending">
                <h2 className="section-title">📈 Trending & Updated</h2>
                <p className="section-subtitle">Most active topics</p>
                <div className="trending-list">
                  {trendingTopics.map((topic) => (
                    <Link href={`/topics/${topic.slug}`} key={topic.id}>
                      <div className="trending-item">
                        <div>
                          <h4>{topic.name}</h4>
                          <span className="trending-meta">{topic._count?.cases || 0} cases</span>
                        </div>
                        {topic.trendingScore && (
                          <span className="trending-score">
                            {topic.trendingScore.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Multi-Topic Filter Section */}
            {allTopics.length > 0 && (
              <section className="section topic-filter">
                <h2 className="section-title">🔍 Find by Topics</h2>
                <p className="filter-description">Select multiple topics to find cases covering these issues</p>
                <div className="topic-checkboxes">
                  {allTopics.slice(0, 15).map((topic) => (
                    <label key={topic.id} className="topic-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedTopicIds.includes(topic.id)}
                        onChange={() => toggleTopicSelection(topic.id)}
                      />
                      <span>{topic.name}</span>
                      <span className="checkbox-count">({topic._count?.cases || 0})</span>
                    </label>
                  ))}
                </div>
                {selectedTopicIds.length > 0 && (
                  <div className="filter-results">
                    <h4>Selected Topics ({selectedTopicIds.length})</h4>
                    <Link href={`/cases?topics=${selectedTopicIds.join(',')}`}>
                      <button className="view-results-btn">View Matching Cases →</button>
                    </Link>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .topics-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .hero-header {
          text-align: center;
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid var(--border-color);
        }

        .hero-header h1 {
          font-size: 3rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .hero-description {
          font-size: 1.2rem;
          color: var(--text-secondary);
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.8;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          color: #dc2626;
          margin-bottom: 2rem;
        }

        .topics-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 2.5rem;
        }

        .main-column {
          min-width: 0;
        }

        .sidebar-column {
          min-width: 0;
        }

        .section {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .section-subtitle {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0 0 1.5rem 0;
        }

        .empty-state {
          padding: 3rem 2rem;
          text-align: center;
          color: var(--text-secondary);
          background: var(--bg-secondary);
          border-radius: 6px;
        }

        /* Developing Stories */
        .stories-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .story-card {
          padding: 1.25rem;
          border: 1px solid var(--border-color);
          border-left: 4px solid #ef4444;
          border-radius: 6px;
          background: var(--bg-primary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .story-card:hover {
          border-color: #ef4444;
          background: var(--bg-secondary);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
        }

        .story-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }

        .case-badge {
          background: var(--bg-secondary);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .story-card h3 {
          font-size: 1.2rem;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .story-description {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0 0 0.75rem 0;
        }

        .recent-cases {
          font-size: 0.85rem;
          color: var(--text-secondary);
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-color);
        }

        .recent-cases ul {
          margin: 0.5rem 0 0 1rem;
          padding: 0;
        }

        .recent-cases li {
          margin: 0.25rem 0;
        }

        /* Topics by Category */
        .category-group {
          margin-bottom: 2.5rem;
        }

        .category-group:last-child {
          margin-bottom: 0;
        }

        .category-title {
          font-size: 1.3rem;
          color: var(--text-primary);
          margin: 0 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .topics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .topic-card {
          padding: 1.25rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-primary);
          cursor: pointer;
          transition: all 0.2s;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .topic-card:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .topic-card h4 {
          font-size: 1.05rem;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .topic-description {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0 0 0.75rem 0;
          flex-grow: 1;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .topic-meta {
          display: flex;
          gap: 0.75rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .case-count {
          font-weight: 500;
        }

        .topic-date {
          opacity: 0.8;
        }

        .view-more {
          display: inline-block;
          color: var(--primary);
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
          font-size: 0.95rem;
        }

        .view-more:hover {
          color: var(--primary-dark);
          text-decoration: underline;
        }

        /* Highlights */
        .highlights-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .highlight-card {
          padding: 1rem;
          border: 1px solid var(--border-color);
          border-left: 4px solid #f59e0b;
          border-radius: 6px;
          background: var(--bg-primary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .highlight-card:hover {
          border-color: #f59e0b;
          background: var(--bg-secondary);
        }

        .highlight-card h4 {
          font-size: 1rem;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .highlight-description {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0 0 0.5rem 0;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .highlight-meta {
          display: flex;
          gap: 0.75rem;
          font-size: 0.8rem;
        }

        .controversy-badge {
          background: #fef3c7;
          color: #92400e;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: 500;
        }

        /* Did You Know */
        .dyk-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .dyk-item {
          padding: 1rem;
          background: var(--bg-secondary);
          border-left: 3px solid var(--primary);
          border-radius: 4px;
        }

        .dyk-item p {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text-primary);
          line-height: 1.6;
        }

        /* Trending */
        .trending-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .trending-item {
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-primary);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .trending-item:hover {
          border-color: var(--primary);
          background: var(--bg-secondary);
        }

        .trending-item h4 {
          font-size: 0.95rem;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        .trending-meta {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .trending-score {
          background: var(--primary);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        /* Topic Filter */
        .filter-description {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0 0 1rem 0;
        }

        .topic-checkboxes {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 350px;
          overflow-y: auto;
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background: var(--bg-primary);
        }

        .topic-checkbox {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .topic-checkbox:hover {
          background: var(--bg-secondary);
        }

        .topic-checkbox input[type="checkbox"] {
          cursor: pointer;
        }

        .topic-checkbox span {
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .checkbox-count {
          font-size: 0.8rem !important;
          color: var(--text-secondary) !important;
          margin-left: auto;
        }

        .filter-results {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .filter-results h4 {
          font-size: 0.95rem;
          color: var(--text-primary);
          margin: 0 0 0.75rem 0;
        }

        .view-results-btn {
          width: 100%;
          padding: 0.75rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .view-results-btn:hover {
          background: var(--primary-dark);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .topics-layout {
            grid-template-columns: 1fr;
          }

          .sidebar-column {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .topics-page {
            padding: 1rem;
          }

          .hero-header h1 {
            font-size: 2rem;
          }

          .hero-description {
            font-size: 1rem;
          }

          .sidebar-column {
            grid-template-columns: 1fr;
          }

          .topics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  )
}
