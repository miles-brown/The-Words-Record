import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { format } from 'date-fns'

interface TopicDetail {
  id: string
  slug: string
  name: string
  displayLabel?: string
  description: string
  topicType: string
  scope: string
  status: string
  startDate?: string
  endDate?: string
  timelineStart?: string
  timelineEnd?: string
  peakDate?: string
  location?: string
  resolution?: string
  ongoingDevelopments?: string
  aliases?: string[]
  searchKeywords?: string[]
  keyFigures?: string[]
  affectedOrganizations?: string[]
  geographicScope?: string[]
  relatedPolicies?: string[]
  legislationLinks?: string[]
  trendingScore?: number
  controversyScore?: number
  publicInterestScore?: number
  mediaAttentionScore?: number
  politicalImpactScore?: number
  incidentCount: number
  statementCount: number
  sourceCount: number
  participantCount: number
  lastActivityAt?: string
  isFeatured?: boolean
  priority: number
  parentTopic?: {
    id: string
    name: string
    slug: string
  }
  childTopics?: {
    id: string
    name: string
    slug: string
    description: string
  }[]
  cases?: {
    Case: {
      id: string
      title: string
      slug: string
      caseDate: string
      summary: string
    }
    relevanceScore?: number
    isPrimary: boolean
    relationType: string
  }[]
  relatedTopics?: {
    id: string
    name: string
    slug: string
    relationType: string
  }[]
}

export default function TopicDetailPage() {
  const router = useRouter()
  const { slug } = router.query
  const [topic, setTopic] = useState<TopicDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'analysis' | 'connections'>('overview')

  useEffect(() => {
    if (slug) {
      fetchTopic(slug as string)
    }
  }, [slug])

  const fetchTopic = async (topicSlug: string) => {
    try {
      const response = await fetch(`/api/topics/${topicSlug}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError('Topic not found')
        } else {
          throw new Error('Failed to fetch topic')
        }
        return
      }
      const data = await response.json()
      setTopic(data.topic)
    } catch (err) {
      setError('Failed to load topic')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatTopicType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
  }

  const formatRelationType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase()
  }

  if (loading) {
    return (
      <Layout title="Loading..." description="">
        <div className="topic-page">
          <div className="loading">Loading topic...</div>
        </div>
        <style jsx>{`
          .topic-page {
            max-width: 1200px;
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

  if (error || !topic) {
    return (
      <Layout title="Topic Not Found" description="">
        <div className="topic-page">
          <div className="error-state">
            <h1>Topic Not Found</h1>
            <p>{error || 'The requested topic could not be found.'}</p>
            <Link href="/topics">
              <button className="back-button">← Back to Topics</button>
            </Link>
          </div>
        </div>
        <style jsx>{`
          .topic-page {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
          }
          .error-state {
            text-align: center;
            padding: 4rem 2rem;
          }
          .error-state h1 {
            font-size: 2rem;
            color: var(--text-primary);
            margin-bottom: 1rem;
          }
          .error-state p {
            color: var(--text-secondary);
            margin-bottom: 2rem;
          }
          .back-button {
            padding: 0.75rem 1.5rem;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
          }
          .back-button:hover {
            background: var(--primary-dark);
          }
        `}</style>
      </Layout>
    )
  }

  return (
    <Layout
      title={topic.displayLabel || topic.name}
      description={topic.description}
    >
      <div className="topic-page">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link href="/topics">Topics</Link>
          <span className="separator">›</span>
          {topic.parentTopic && (
            <>
              <Link href={`/topics/${topic.parentTopic.slug}`}>
                {topic.parentTopic.name}
              </Link>
              <span className="separator">›</span>
            </>
          )}
          <span className="current">{topic.name}</span>
        </nav>

        {/* Header */}
        <header className="topic-header">
          <div className="header-content">
            <div className="topic-meta">
              <span className="topic-type">{formatTopicType(topic.topicType)}</span>
              {topic.status && <span className="topic-status">{topic.status}</span>}
              {topic.isFeatured && <span className="featured-badge">⭐ Featured</span>}
            </div>
            <h1>{topic.displayLabel || topic.name}</h1>
            {topic.aliases && topic.aliases.length > 0 && (
              <p className="aliases">
                Also known as: {topic.aliases.join(', ')}
              </p>
            )}
            <p className="description">{topic.description}</p>

            {/* Key Stats */}
            <div className="key-stats">
              <div className="stat">
                <span className="stat-value">{topic.incidentCount}</span>
                <span className="stat-label">Cases</span>
              </div>
              <div className="stat">
                <span className="stat-value">{topic.statementCount}</span>
                <span className="stat-label">Statements</span>
              </div>
              <div className="stat">
                <span className="stat-value">{topic.sourceCount}</span>
                <span className="stat-label">Sources</span>
              </div>
              {topic.participantCount > 0 && (
                <div className="stat">
                  <span className="stat-value">{topic.participantCount}</span>
                  <span className="stat-label">Participants</span>
                </div>
              )}
            </div>
          </div>

          {/* Scores Sidebar */}
          <div className="scores-panel">
            <h3>Impact Metrics</h3>
            {topic.controversyScore !== undefined && (
              <div className="score-item">
                <span className="score-label">Controversy</span>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: `${Math.min(topic.controversyScore * 10, 100)}%` }} />
                </div>
                <span className="score-value">{topic.controversyScore.toFixed(1)}</span>
              </div>
            )}
            {topic.publicInterestScore !== undefined && (
              <div className="score-item">
                <span className="score-label">Public Interest</span>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: `${Math.min(topic.publicInterestScore * 10, 100)}%` }} />
                </div>
                <span className="score-value">{topic.publicInterestScore.toFixed(1)}</span>
              </div>
            )}
            {topic.mediaAttentionScore !== undefined && (
              <div className="score-item">
                <span className="score-label">Media Attention</span>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: `${Math.min(topic.mediaAttentionScore * 10, 100)}%` }} />
                </div>
                <span className="score-value">{topic.mediaAttentionScore.toFixed(1)}</span>
              </div>
            )}
            {topic.politicalImpactScore !== undefined && (
              <div className="score-item">
                <span className="score-label">Political Impact</span>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: `${Math.min(topic.politicalImpactScore * 10, 100)}%` }} />
                </div>
                <span className="score-value">{topic.politicalImpactScore.toFixed(1)}</span>
              </div>
            )}
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="tab-navigation">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'timeline' ? 'active' : ''}
            onClick={() => setActiveTab('timeline')}
          >
            Timeline & History
          </button>
          <button
            className={activeTab === 'analysis' ? 'active' : ''}
            onClick={() => setActiveTab('analysis')}
          >
            Analysis & Context
          </button>
          <button
            className={activeTab === 'connections' ? 'active' : ''}
            onClick={() => setActiveTab('connections')}
          >
            Connections
          </button>
        </nav>

        {/* Content Sections */}
        <div className="topic-content">
          {activeTab === 'overview' && (
            <div className="content-section">
              <article className="main-article">
                <section className="article-section">
                  <h2>Overview</h2>
                  <p>{topic.description}</p>

                  {topic.location && (
                    <div className="info-box">
                      <strong>Location:</strong> {topic.location}
                    </div>
                  )}

                  {topic.geographicScope && topic.geographicScope.length > 0 && (
                    <div className="info-box">
                      <strong>Geographic Scope:</strong> {topic.geographicScope.join(', ')}
                    </div>
                  )}
                </section>

                {topic.keyFigures && topic.keyFigures.length > 0 && (
                  <section className="article-section">
                    <h2>Key Figures</h2>
                    <ul className="key-list">
                      {topic.keyFigures.map((figure, index) => (
                        <li key={index}>{figure}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {topic.affectedOrganizations && topic.affectedOrganizations.length > 0 && (
                  <section className="article-section">
                    <h2>Affected Organizations</h2>
                    <ul className="key-list">
                      {topic.affectedOrganizations.map((org, index) => (
                        <li key={index}>{org}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {topic.ongoingDevelopments && (
                  <section className="article-section">
                    <h2>Ongoing Developments</h2>
                    <p>{topic.ongoingDevelopments}</p>
                  </section>
                )}

                {topic.resolution && (
                  <section className="article-section">
                    <h2>Resolution & Outcomes</h2>
                    <p>{topic.resolution}</p>
                  </section>
                )}
              </article>

              <aside className="sidebar">
                {topic.cases && topic.cases.length > 0 && (
                  <div className="sidebar-section">
                    <h3>Related Cases</h3>
                    <div className="case-list">
                      {topic.cases.slice(0, 5).map((tc) => (
                        <Link href={`/cases/${tc.Case.slug}`} key={tc.Case.id}>
                          <div className="case-item">
                            {tc.isPrimary && <span className="primary-badge">Primary</span>}
                            <h4>{tc.Case.title}</h4>
                            <p className="case-date">
                              {format(new Date(tc.Case.caseDate), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    {topic.cases.length > 5 && (
                      <Link href={`/cases?topic=${topic.id}`}>
                        <span className="view-all">View all {topic.cases.length} cases →</span>
                      </Link>
                    )}
                  </div>
                )}
              </aside>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="content-section">
              <article className="main-article">
                <section className="article-section">
                  <h2>Timeline & History</h2>

                  <div className="timeline">
                    {topic.startDate && (
                      <div className="timeline-item">
                        <div className="timeline-marker start"></div>
                        <div className="timeline-content">
                          <h4>Started</h4>
                          <p className="timeline-date">{format(new Date(topic.startDate), 'MMMM d, yyyy')}</p>
                        </div>
                      </div>
                    )}

                    {topic.peakDate && (
                      <div className="timeline-item">
                        <div className="timeline-marker peak"></div>
                        <div className="timeline-content">
                          <h4>Peak Activity</h4>
                          <p className="timeline-date">{format(new Date(topic.peakDate), 'MMMM d, yyyy')}</p>
                        </div>
                      </div>
                    )}

                    {topic.endDate && (
                      <div className="timeline-item">
                        <div className="timeline-marker end"></div>
                        <div className="timeline-content">
                          <h4>Concluded</h4>
                          <p className="timeline-date">{format(new Date(topic.endDate), 'MMMM d, yyyy')}</p>
                        </div>
                      </div>
                    )}

                    {topic.lastActivityAt && !topic.endDate && (
                      <div className="timeline-item">
                        <div className="timeline-marker ongoing"></div>
                        <div className="timeline-content">
                          <h4>Last Activity</h4>
                          <p className="timeline-date">{format(new Date(topic.lastActivityAt), 'MMMM d, yyyy')}</p>
                          <p className="timeline-note">Ongoing</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {topic.cases && topic.cases.length > 0 && (
                  <section className="article-section">
                    <h2>Case Timeline</h2>
                    <div className="case-timeline">
                      {topic.cases
                        .sort((a, b) => new Date(a.Case.caseDate).getTime() - new Date(b.Case.caseDate).getTime())
                        .map((tc) => (
                          <Link href={`/cases/${tc.Case.slug}`} key={tc.Case.id}>
                            <div className="case-timeline-item">
                              <div className="case-timeline-date">
                                {format(new Date(tc.Case.caseDate), 'MMM d, yyyy')}
                              </div>
                              <div className="case-timeline-content">
                                <h4>{tc.Case.title}</h4>
                                {tc.Case.summary && <p>{tc.Case.summary}</p>}
                              </div>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </section>
                )}
              </article>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="content-section">
              <article className="main-article">
                <section className="article-section">
                  <h2>Analysis & Context</h2>
                  <p className="placeholder-text">
                    Detailed analysis, causes, context, and background information will be displayed here.
                    This section will address the facts, interpretations, narratives, and frameworks
                    surrounding this topic.
                  </p>
                </section>

                {topic.relatedPolicies && topic.relatedPolicies.length > 0 && (
                  <section className="article-section">
                    <h2>Related Policies</h2>
                    <ul className="key-list">
                      {topic.relatedPolicies.map((policy, index) => (
                        <li key={index}>{policy}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {topic.legislationLinks && topic.legislationLinks.length > 0 && (
                  <section className="article-section">
                    <h2>Related Legislation</h2>
                    <ul className="key-list">
                      {topic.legislationLinks.map((link, index) => (
                        <li key={index}>
                          <a href={link} target="_blank" rel="noopener noreferrer">
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </article>
            </div>
          )}

          {activeTab === 'connections' && (
            <div className="content-section">
              <article className="main-article">
                {topic.parentTopic && (
                  <section className="article-section">
                    <h2>Parent Topic</h2>
                    <Link href={`/topics/${topic.parentTopic.slug}`}>
                      <div className="related-topic-card parent">
                        <span className="relation-type">Part of</span>
                        <h3>{topic.parentTopic.name}</h3>
                      </div>
                    </Link>
                  </section>
                )}

                {topic.childTopics && topic.childTopics.length > 0 && (
                  <section className="article-section">
                    <h2>Subtopics</h2>
                    <div className="related-topics-grid">
                      {topic.childTopics.map((child) => (
                        <Link href={`/topics/${child.slug}`} key={child.id}>
                          <div className="related-topic-card child">
                            <h4>{child.name}</h4>
                            <p>{child.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {topic.relatedTopics && topic.relatedTopics.length > 0 && (
                  <section className="article-section">
                    <h2>Related Topics</h2>
                    <div className="related-topics-grid">
                      {topic.relatedTopics.map((related) => (
                        <Link href={`/topics/${related.slug}`} key={related.id}>
                          <div className="related-topic-card">
                            <span className="relation-type">{formatRelationType(related.relationType)}</span>
                            <h4>{related.name}</h4>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </article>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .topic-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* Breadcrumb */
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .breadcrumb a {
          color: var(--primary);
          transition: color 0.2s;
        }

        .breadcrumb a:hover {
          color: var(--primary-dark);
          text-decoration: underline;
        }

        .breadcrumb .separator {
          color: var(--text-secondary);
        }

        .breadcrumb .current {
          color: var(--text-primary);
          font-weight: 500;
        }

        /* Header */
        .topic-header {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 2rem;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid var(--border-color);
        }

        .header-content {
          min-width: 0;
        }

        .topic-meta {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .topic-type,
        .topic-status,
        .featured-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .topic-type {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .topic-status {
          background: #dbeafe;
          color: #1e40af;
        }

        .featured-badge {
          background: #fef3c7;
          color: #92400e;
        }

        .topic-header h1 {
          font-size: 2.5rem;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
          line-height: 1.2;
        }

        .aliases {
          font-size: 0.9rem;
          color: var(--text-secondary);
          font-style: italic;
          margin: 0 0 1rem 0;
        }

        .description {
          font-size: 1.1rem;
          color: var(--text-primary);
          line-height: 1.7;
          margin: 0 0 1.5rem 0;
        }

        .key-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 1rem;
        }

        .stat {
          text-align: center;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 6px;
        }

        .stat-value {
          display: block;
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Scores Panel */
        .scores-panel {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1.5rem;
          height: fit-content;
        }

        .scores-panel h3 {
          font-size: 1.1rem;
          color: var(--text-primary);
          margin: 0 0 1.5rem 0;
        }

        .score-item {
          margin-bottom: 1.5rem;
        }

        .score-item:last-child {
          margin-bottom: 0;
        }

        .score-label {
          display: block;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .score-bar {
          height: 8px;
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .score-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--primary-dark));
          transition: width 0.3s ease;
        }

        .score-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        /* Tab Navigation */
        .tab-navigation {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid var(--border-color);
        }

        .tab-navigation button {
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: -2px;
        }

        .tab-navigation button:hover {
          color: var(--text-primary);
        }

        .tab-navigation button.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        /* Content Sections */
        .content-section {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 2rem;
        }

        .main-article {
          min-width: 0;
        }

        .article-section {
          margin-bottom: 3rem;
        }

        .article-section h2 {
          font-size: 1.8rem;
          color: var(--text-primary);
          margin: 0 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .article-section p {
          font-size: 1rem;
          color: var(--text-primary);
          line-height: 1.8;
          margin: 0 0 1rem 0;
        }

        .info-box {
          background: var(--bg-secondary);
          padding: 1rem;
          border-radius: 6px;
          margin: 1rem 0;
        }

        .key-list {
          list-style: disc;
          padding-left: 1.5rem;
          margin: 0;
        }

        .key-list li {
          margin: 0.5rem 0;
          color: var(--text-primary);
          line-height: 1.6;
        }

        .placeholder-text {
          color: var(--text-secondary);
          font-style: italic;
        }

        /* Sidebar */
        .sidebar {
          min-width: 0;
        }

        .sidebar-section {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .sidebar-section h3 {
          font-size: 1.1rem;
          color: var(--text-primary);
          margin: 0 0 1rem 0;
        }

        .case-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .case-item {
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .case-item:hover {
          border-color: var(--primary);
          background: var(--bg-secondary);
        }

        .primary-badge {
          display: inline-block;
          padding: 0.2rem 0.5rem;
          background: var(--primary);
          color: white;
          font-size: 0.75rem;
          border-radius: 3px;
          margin-bottom: 0.5rem;
        }

        .case-item h4 {
          font-size: 0.95rem;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        .case-date {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .view-all {
          display: inline-block;
          color: var(--primary);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
        }

        .view-all:hover {
          color: var(--primary-dark);
          text-decoration: underline;
        }

        /* Timeline */
        .timeline {
          position: relative;
          padding-left: 2rem;
          margin: 2rem 0;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 0.5rem;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--border-color);
        }

        .timeline-item {
          position: relative;
          margin-bottom: 2rem;
        }

        .timeline-marker {
          position: absolute;
          left: -1.5rem;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid var(--primary);
          background: white;
        }

        .timeline-marker.start {
          background: #10b981;
          border-color: #10b981;
        }

        .timeline-marker.peak {
          background: #f59e0b;
          border-color: #f59e0b;
        }

        .timeline-marker.end {
          background: #ef4444;
          border-color: #ef4444;
        }

        .timeline-marker.ongoing {
          background: var(--primary);
          border-color: var(--primary);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .timeline-content h4 {
          font-size: 1rem;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        .timeline-date {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .timeline-note {
          font-size: 0.85rem;
          color: var(--primary);
          font-weight: 500;
          margin: 0.25rem 0 0 0;
        }

        /* Case Timeline */
        .case-timeline {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .case-timeline-item {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 1.5rem;
          padding: 1rem;
          border: 1px solid var(--border-color);
          border-left: 4px solid var(--primary);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .case-timeline-item:hover {
          border-color: var(--primary);
          background: var(--bg-secondary);
        }

        .case-timeline-date {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .case-timeline-content h4 {
          font-size: 1rem;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .case-timeline-content p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Related Topics */
        .related-topics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }

        .related-topic-card {
          padding: 1.25rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .related-topic-card:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .related-topic-card.parent {
          border-left: 4px solid #3b82f6;
        }

        .related-topic-card.child {
          border-left: 4px solid #10b981;
        }

        .relation-type {
          display: inline-block;
          padding: 0.2rem 0.5rem;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-size: 0.75rem;
          border-radius: 3px;
          margin-bottom: 0.5rem;
        }

        .related-topic-card h3,
        .related-topic-card h4 {
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .related-topic-card h3 {
          font-size: 1.2rem;
        }

        .related-topic-card h4 {
          font-size: 1rem;
        }

        .related-topic-card p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .topic-header {
            grid-template-columns: 1fr;
          }

          .content-section {
            grid-template-columns: 1fr;
          }

          .sidebar {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .topic-page {
            padding: 1rem;
          }

          .topic-header h1 {
            font-size: 1.8rem;
          }

          .tab-navigation {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .tab-navigation button {
            white-space: nowrap;
            padding: 0.75rem 1rem;
          }

          .sidebar {
            grid-template-columns: 1fr;
          }

          .case-timeline-item {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
        }
      `}</style>
    </Layout>
  )
}
