import { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { format } from 'date-fns'

interface Topic {
  id: string
  name: string
  slug: string
  description: string
  category: string
  _count: {
    cases: number
  }
  isControversial?: boolean
  lastUsedAt?: string
  createdAt?: string
}

interface Case {
  id: string
  title: string
  slug: string
  caseDate: string
  summary: string
}

export default function TopicsPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [allTopics, setAllTopics] = useState<Topic[]>([])
  const [developingStories, setDevelopingStories] = useState<Case[]>([])
  const [trendingTopics, setTrendingTopics] = useState<Topic[]>([])
  const [highlightedTopics, setHighlightedTopics] = useState<Topic[]>([])
  const [topicsByCategory, setTopicsByCategory] = useState<Record<string, Topic[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTopicsData()
  }, [])

  const fetchTopicsData = async () => {
    try {
      // Fetch all topics
      const topicsRes = await fetch('/api/tags')
      if (!topicsRes.ok) throw new Error('Failed to fetch topics')
      const topicsData = await topicsRes.json()
      const topics = topicsData.tags || []
      setAllTopics(topics)

      // Group topics by category
      const byCategory: Record<string, Topic[]> = {}
      topics.forEach((topic: Topic) => {
        const category = topic.category || 'Other'
        if (!byCategory[category]) {
          byCategory[category] = []
        }
        byCategory[category].push(topic)
      })
      setTopicsByCategory(byCategory)

      // Get trending topics (those with most cases or recently used)
      const trending = [...topics]
        .sort((a, b) => (b._count?.cases || 0) - (a._count?.cases || 0))
        .slice(0, 6)
      setTrendingTopics(trending)

      // Get highlighted topics (controversial or featured)
      const highlighted = topics.filter((t: Topic) => t.isControversial).slice(0, 3)
      setHighlightedTopics(highlighted)

      // Fetch recent cases for developing stories
      const casesRes = await fetch('/api/cases?page=1&limit=5&sortBy=date-desc')
      if (casesRes.ok) {
        const casesData = await casesRes.json()
        // Filter for cases from the last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const recent = (casesData.cases || []).filter((c: Case) =>
          new Date(c.caseDate) > thirtyDaysAgo
        )
        setDevelopingStories(recent)
      }

    } catch (err) {
      setError('Failed to load topics')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const filteredTopics = selectedTags.length > 0
    ? allTopics.filter(topic => selectedTags.includes(topic.id))
    : []

  const didYouKnowFacts = [
    "Our database contains statements from over 500 public figures",
    "The most documented topic has over 100 verified statements",
    "We verify every statement with multiple credible sources",
  ]

  if (loading) {
    return (
      <Layout title="Topics" description="Explore topics and developing stories">
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
          }
        `}</style>
      </Layout>
    )
  }

  return (
    <Layout
      title="Topics"
      description="Explore featured topics, developing stories, and curated collections"
    >
      <div className="topics-page">
        {/* Hero Header */}
        <div className="hero-header">
          <h1>Topics</h1>
          <p className="hero-description">
            Explore our comprehensive collection of documented statements, organized by topic and category
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
                <div className="stories-list">
                  {developingStories.map((story) => (
                    <Link href={`/cases/${story.slug}`} key={story.id}>
                      <div className="story-card">
                        <div className="story-meta">
                          {format(new Date(story.caseDate), 'MMM d, yyyy')}
                        </div>
                        <h3>{story.title}</h3>
                        {story.summary && <p className="story-summary">{story.summary}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Topics by Category Section */}
            <section className="section topics-by-category">
              <h2 className="section-title">Topics by Category</h2>
              {Object.entries(topicsByCategory).map(([category, topics]) => (
                <div key={category} className="category-group">
                  <h3 className="category-title">{category}</h3>
                  <div className="topics-grid">
                    {topics.slice(0, 6).map((topic) => (
                      <Link href={`/tags/${topic.slug}`} key={topic.id}>
                        <div className="topic-card">
                          <h4>{topic.name}</h4>
                          <span className="case-count">{topic._count?.cases || 0} cases</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {topics.length > 6 && (
                    <Link href="/tags">
                      <span className="view-more">View all {category} topics →</span>
                    </Link>
                  )}
                </div>
              ))}
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="sidebar-column">
            {/* Highlights Section */}
            {highlightedTopics.length > 0 && (
              <section className="section highlights">
                <h2 className="section-title">⭐ Highlights</h2>
                <div className="highlights-list">
                  {highlightedTopics.map((topic) => (
                    <Link href={`/tags/${topic.slug}`} key={topic.id}>
                      <div className="highlight-card">
                        <h4>{topic.name}</h4>
                        {topic.description && (
                          <p className="highlight-description">{topic.description}</p>
                        )}
                        <span className="case-count">{topic._count?.cases || 0} cases</span>
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
            <section className="section trending">
              <h2 className="section-title">📈 Trending & Updated</h2>
              <div className="trending-list">
                {trendingTopics.map((topic) => (
                  <Link href={`/tags/${topic.slug}`} key={topic.id}>
                    <div className="trending-item">
                      <h4>{topic.name}</h4>
                      <span className="case-count">{topic._count?.cases || 0} cases</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Multi-Tag Filter Section */}
            <section className="section tag-filter">
              <h2 className="section-title">🔍 Find Topics</h2>
              <p className="filter-description">Select multiple topics to find related cases</p>
              <div className="tag-checkboxes">
                {allTopics.slice(0, 12).map((topic) => (
                  <label key={topic.id} className="tag-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(topic.id)}
                      onChange={() => toggleTag(topic.id)}
                    />
                    <span>{topic.name}</span>
                  </label>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <div className="filter-results">
                  <h4>Selected Topics ({selectedTags.length})</h4>
                  <Link href={`/tags?ids=${selectedTags.join(',')}`}>
                    <button className="view-results-btn">View Matching Cases →</button>
                  </Link>
                </div>
              )}
            </section>
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
          margin: 0 0 1.5rem 0;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid var(--border-color);
        }

        /* Developing Stories */
        .stories-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .story-card {
          padding: 1rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-primary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .story-card:hover {
          border-color: var(--primary);
          background: var(--bg-secondary);
        }

        .story-meta {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .story-card h3 {
          font-size: 1.1rem;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .story-summary {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
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
        }

        .topics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .topic-card {
          padding: 1rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-primary);
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .topic-card:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .topic-card h4 {
          font-size: 1rem;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .case-count {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .view-more {
          display: inline-block;
          color: var(--primary);
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
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
          border-left: 4px solid var(--primary);
          border-radius: 6px;
          background: var(--bg-primary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .highlight-card:hover {
          border-color: var(--primary);
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
          margin: 0;
        }

        /* Tag Filter */
        .filter-description {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0 0 1rem 0;
        }

        .tag-checkboxes {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 300px;
          overflow-y: auto;
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background: var(--bg-primary);
        }

        .tag-checkbox {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .tag-checkbox:hover {
          background: var(--bg-secondary);
        }

        .tag-checkbox input[type="checkbox"] {
          cursor: pointer;
        }

        .tag-checkbox span {
          font-size: 0.9rem;
          color: var(--text-primary);
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
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }
        }
      `}</style>
    </Layout>
  )
}
