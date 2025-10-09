import { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { format } from 'date-fns'

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError('Failed to load statistics')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout title="Statistics" description="Site statistics and overview">
        <div className="stats-page">
          <h1>Loading statistics...</h1>
        </div>
      </Layout>
    )
  }

  if (error || !stats) {
    return (
      <Layout title="Statistics" description="Site statistics and overview">
        <div className="stats-page">
          <h1>Error loading statistics</h1>
          <p>{error}</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      title="Statistics"
      description="Overview of documented incidents, people, and statements"
    >
      <div className="stats-page">
        <header className="page-header">
          <h1>Site Statistics</h1>
          <p className="page-description">
            Comprehensive overview of all documented content
          </p>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.counts.cases}</div>
            <div className="stat-label">Documented Incidents</div>
            <Link href="/cases" className="stat-link">View all →</Link>
          </div>

          <div className="stat-card">
            <div className="stat-number">{stats.counts.people}</div>
            <div className="stat-label">People</div>
            <Link href="/people" className="stat-link">View all →</Link>
          </div>

          <div className="stat-card">
            <div className="stat-number">{stats.counts.organizations}</div>
            <div className="stat-label">Organizations</div>
            <Link href="/organizations" className="stat-link">View all →</Link>
          </div>

          <div className="stat-card">
            <div className="stat-number">{stats.counts.statements}</div>
            <div className="stat-label">Statements</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">{stats.counts.responses}</div>
            <div className="stat-label">Responses</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">{stats.counts.sources}</div>
            <div className="stat-label">Sources</div>
          </div>
        </section>

        <div className="stats-columns">
          <section className="stats-section">
            <h2>Recent Activity</h2>
            <div className="recent-list">
              {stats.recentIncidents.map((caseItem: any) => (
                <Link href={`/cases/${caseItem.slug}`} key={caseItem.id}>
                  <div className="recent-item">
                    <h3>{caseItem.title}</h3>
                    <span className="date">
                      {format(new Date(caseItem.caseDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="stats-section">
            <h2>Most Active People</h2>
            <div className="list-items">
              {stats.activePeople.map((person: any) => (
                <Link href={`/people/${person.slug}`} key={person.id}>
                  <div className="list-item">
                    <span className="name">{person.name}</span>
                    <span className="count">
                      {person._count.cases} incident{person._count.cases !== 1 ? 's' : ''}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="stats-section">
            <h2>Popular Tags</h2>
            <div className="tags-list">
              {stats.popularTags.map((tag: any) => (
                <div key={tag.id} className="tag-item">
                  <span className="tag-name">{tag.name}</span>
                  <span className="tag-count">{tag._count.cases}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .stats-page {
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
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 4rem;
        }

        .stat-card {
          background: var(--background-primary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          border-color: var(--border-secondary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .stat-number {
          font-size: 3rem;
          font-weight: bold;
          color: var(--accent-primary);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 1rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .stat-link {
          color: var(--accent-primary);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .stat-link:hover {
          text-decoration: underline;
        }

        .stats-columns {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .stats-section {
          background: var(--background-primary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 2rem;
        }

        .stats-section h2 {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .recent-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .recent-item {
          padding: 1rem;
          background: var(--background-secondary);
          border-radius: 6px;
          transition: background 0.2s;
        }

        .recent-item:hover {
          background: var(--border-primary);
        }

        .recent-item h3 {
          font-size: 1rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .date {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .list-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: var(--background-secondary);
          border-radius: 6px;
          transition: background 0.2s;
        }

        .list-item:hover {
          background: var(--border-primary);
        }

        .name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .count {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .tag-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--background-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 4px;
        }

        .tag-name {
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .tag-count {
          font-size: 0.85rem;
          color: var(--text-secondary);
          background: var(--background-primary);
          padding: 0.15rem 0.5rem;
          border-radius: 3px;
        }

        @media (max-width: 768px) {
          .page-header h1 {
            font-size: 2rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stats-columns {
            grid-template-columns: 1fr;
          }

          .stat-number {
            font-size: 2rem;
          }
        }
      `}</style>
    </Layout>
  )
}
