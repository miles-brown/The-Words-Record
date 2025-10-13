/**
 * Admin Dashboard
 * Main admin interface with stats, recent activity, and quick actions
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'

interface DashboardStats {
  totalCases: number
  totalPeople: number
  totalOrganizations: number
  totalStatements: number
  totalSources: number
  totalUsers: number
  verifiedSources: number
  mfaEnabledUsers: number
  activeUsers30d: number
  activeApiKeys: number
  apiKeyAuth24h: number
  errorEvents24h: number
  recentCases: Array<{
    id: string
    title: string
    slug: string
    caseDate: string
    status: string
  }>
  draftQueue: Array<{
    id: string
    contentType: string
    status: string
    updatedAt: string
    submittedAt: string | null
    owner: {
      id: string
      username: string
    } | null
  }>
  auditTimeline: Array<{
    id: string
    action: string
    entityType: string | null
    entityId: string | null
    actor: string | null
    timestamp: string
    status: string
    description: string | null
  }>
  pendingApprovals: number
  draftsPending: number
  draftsSubmitted: number
  failedHarvests: number
}

interface MetricCardProps {
  icon: string
  label: string
  value: number
  subtle?: boolean
}

function MetricCard({ icon, label, value, subtle = false }: MetricCardProps) {
  return (
    <div className={`stat-card ${subtle ? 'subtle' : ''}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3>{label}</h3>
        <p className="stat-number">{new Intl.NumberFormat('en-US').format(value)}</p>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dashboard', {
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'just now'
  }

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout title="Dashboard">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchDashboardData}>Retry</button>
        </div>
      </AdminLayout>
    )
  }

  if (!stats) {
    return (
      <AdminLayout title="Dashboard">
        <div className="error-container">
          <p>No data available</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - The Words Record</title>
      </Head>

      <AdminLayout title="Dashboard">
        <div className="dashboard">
          <div className="stats-grid">
            <MetricCard icon="📰" label="Total Cases" value={stats.totalCases} />
            <MetricCard icon="👤" label="People" value={stats.totalPeople} />
            <MetricCard icon="🏢" label="Organizations" value={stats.totalOrganizations} />
            <MetricCard icon="💬" label="Statements" value={stats.totalStatements} />
            <MetricCard icon="🧑‍🤝‍🧑" label="Users" value={stats.totalUsers} />
            <MetricCard icon="🔥" label="Active (30d)" value={stats.activeUsers30d} />
            <MetricCard icon="🔐" label="MFA Enabled" value={stats.mfaEnabledUsers} />
            <MetricCard icon="🗝️" label="Active API Keys" value={stats.activeApiKeys} />
            <div className="stat-card wide">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <h3>Sources</h3>
                <p className="stat-number">{formatNumber(stats.totalSources)}</p>
                <p className="stat-subtitle">
                  {stats.verifiedSources} verified ({stats.totalSources ? Math.round((stats.verifiedSources / stats.totalSources) * 100) : 0}%)
                </p>
              </div>
            </div>
          </div>

          <div className="workflow-grid">
            <MetricCard icon="📝" label="Drafts Pending" value={stats.draftsPending} subtle />
            <MetricCard icon="🔍" label="Drafts In Review" value={stats.draftsSubmitted} subtle />
            <MetricCard icon="✅" label="Approvals Pending" value={stats.pendingApprovals} subtle />
            <MetricCard icon="⚠️" label="Failed Harvests" value={stats.failedHarvests} subtle />
            <MetricCard icon="🔑" label="API Auth (24h)" value={stats.apiKeyAuth24h} subtle />
            <MetricCard icon="🚨" label="Errors (24h)" value={stats.errorEvents24h} subtle />
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <button onClick={() => router.push('/admin/cases/new')} className="action-btn primary">
                <span>➕</span> New Case
              </button>
              <button onClick={() => router.push('/admin/people/new')} className="action-btn">
                <span>👤</span> Add Person
              </button>
              <button onClick={() => router.push('/admin/sources/verify')} className="action-btn">
                <span>✅</span> Verify Sources
              </button>
              <button onClick={() => router.push('/admin/harvest')} className="action-btn">
                <span>🤖</span> Run Harvester
              </button>
              <button onClick={() => router.push('/admin/export')} className="action-btn">
                <span>📥</span> Export Data
              </button>
            </div>
          </div>

          <div className="panels">
            <section className="panel">
              <h2>Recent Cases</h2>
              <div className="recent-list">
                {stats.recentCases.map(caseItem => (
                  <div key={caseItem.id} className="recent-item">
                    <div className="item-main">
                      <span className="item-title">{caseItem.title}</span>
                      <p className="item-meta">
                        {formatDate(caseItem.caseDate)} •
                        <span className={`status status-${caseItem.status.toLowerCase()}`}>
                          {caseItem.status}
                        </span>
                      </p>
                    </div>
                    <div className="item-actions">
                      <button
                        onClick={() => router.push(`/admin/cases/${caseItem.slug}/edit`)}
                        className="mini-btn"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))}
                {stats.recentCases.length === 0 && <p className="no-data">No recent cases</p>}
              </div>
            </section>

            <section className="panel">
              <h2>Draft Review Queue</h2>
              <div className="recent-list">
                {stats.draftQueue.map(draft => (
                  <div key={draft.id} className="recent-item">
                    <div className="item-main">
                      <span className="item-title">{draft.contentType}</span>
                      <p className="item-meta">
                        {draft.owner ? draft.owner.username : 'system'} •
                        <span className={`status status-${draft.status.toLowerCase()}`}>
                          {draft.status}
                        </span>
                        • {formatTime(draft.updatedAt)}
                      </p>
                    </div>
                  </div>
                ))}
                {stats.draftQueue.length === 0 && <p className="no-data">No drafts awaiting review</p>}
              </div>
            </section>
          </div>

          <section className="panel audit-panel">
            <h2>Audit Timeline</h2>
            <div className="activity-feed">
              {stats.auditTimeline.map(item => (
                <div key={item.id} className="activity-item">
                  <div className="activity-icon">🕒</div>
                  <div className="activity-content">
                    <p className="activity-text">
                      <strong>{item.actor || 'system'}</strong> {item.action.toLowerCase()} {item.entityType || 'record'} {item.entityId || ''}
                    </p>
                    <p className="activity-time">{formatTime(item.timestamp)}</p>
                    {item.description && (
                      <p className="activity-description">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
              {stats.auditTimeline.length === 0 && <p className="no-data">No recent activity</p>}
            </div>
          </section>
        </div>

        <style jsx>{`
          .dashboard {
            max-width: 1400px;
            margin: 0 auto;
          }

          .loading-container, .error-container {
            text-align: center;
            padding: 3rem;
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e0e6ed;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .workflow-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1rem;
            margin-bottom: 2.5rem;
          }

          .stat-card {
            background: white;
            border-radius: 12px;
            padding: 1.25rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            display: flex;
            align-items: center;
            gap: 1rem;
            transition: transform 0.2s, box-shadow 0.2s;
          }

          .stat-card:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
          }

          .stat-card.subtle {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            box-shadow: none;
          }

          .stat-card.wide {
            grid-column: span 2;
          }

          .stat-icon {
            font-size: 2rem;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f1f5f9;
            border-radius: 10px;
          }

          .stat-content h3 {
            margin: 0;
            font-size: 0.85rem;
            color: #6c757d;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .stat-number {
            margin: 0.25rem 0 0;
            font-size: 1.6rem;
            font-weight: 700;
            color: #1e293b;
          }

          .stat-subtitle {
            margin: 0.25rem 0 0;
            font-size: 0.75rem;
            color: #6c757d;
          }

          .quick-actions {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            margin-bottom: 2.5rem;
          }

          .quick-actions h2 {
            margin: 0 0 1rem;
            font-size: 1.25rem;
            color: #1f2937;
          }

          .action-buttons {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
          }

          .action-btn {
            padding: 0.75rem 1.5rem;
            background: white;
            border: 2px solid #e0e6ed;
            border-radius: 8px;
            font-size: 0.95rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .action-btn:hover {
            background: #f8f9fa;
            border-color: #3498db;
            color: #3498db;
          }

          .action-btn.primary {
            background: #3498db;
            color: white;
            border-color: #3498db;
          }

          .action-btn.primary:hover {
            background: #2980b9;
            border-color: #2980b9;
          }

          .panels {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2.5rem;
          }

          .panel {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }

          .panel h2 {
            margin: 0 0 1rem;
            font-size: 1.25rem;
            color: #1f2937;
          }

          .recent-list, .activity-feed {
            display: flex;
            flex-direction: column;
            gap: 0.85rem;
          }

          .recent-item, .activity-item {
            padding: 0.9rem;
            background: #f8fafc;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            gap: 1rem;
          }

          .item-title {
            font-weight: 600;
            color: #1f2937;
          }

          .item-meta {
            font-size: 0.8rem;
            color: #64748b;
            margin: 0.25rem 0 0;
          }

          .mini-btn {
            padding: 0.3rem 0.8rem;
            background: white;
            border: 1px solid #cbd5f5;
            border-radius: 6px;
            font-size: 0.75rem;
            cursor: pointer;
          }

          .mini-btn:hover {
            background: #f8f9fa;
            border-color: #3498db;
            color: #3498db;
          }

          .draft-label {
            font-weight: 600;
            color: #1f2937;
          }

          .draft-meta {
            margin: 0.3rem 0 0;
            font-size: 0.8rem;
            color: #64748b;
          }

          .activity-item {
            align-items: flex-start;
            background: white;
          }

          .activity-icon {
            font-size: 1.2rem;
          }

          .activity-text {
            margin: 0 0 0.3rem;
            font-size: 0.95rem;
            color: #1f2937;
          }

          .activity-time {
            margin: 0;
            font-size: 0.75rem;
            color: #6b7280;
          }

          .status {
            padding: 0.125rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            margin-left: 0.5rem;
          }

          .status-documented {
            background: #d1ecf1;
            color: #0c5460;
          }

          .status-approved {
            background: #d4edda;
            color: #155724;
          }

          .status-submitted {
            background: #fff3cd;
            color: #856404;
          }

          .status-in_review {
            background: #e9ecef;
            color: #495057;
          }

          .status-failed {
            background: #f8d7da;
            color: #721c24;
          }

          .no-data {
            text-align: center;
            color: #6c757d;
            padding: 1.5rem 0;
            margin: 0;
          }

          @media (max-width: 768px) {
            .stats-grid {
              grid-template-columns: 1fr;
            }

            .workflow-grid {
              grid-template-columns: 1fr;
            }

            .stat-card.wide {
              grid-column: span 1;
            }

            .panels {
              grid-template-columns: 1fr;
            }

            .action-buttons {
              flex-direction: column;
            }

            .action-btn {
              width: 100%;
              justify-content: center;
            }
          }
        `}</style>
      </AdminLayout>
    </>
  )
}
