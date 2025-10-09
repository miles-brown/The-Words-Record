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
  verifiedSources: number
  recentCases: Array<{
    id: string
    title: string
    slug: string
    caseDate: string
    status: string
  }>
  recentActivity: Array<{
    id: string
    action: string
    entityType: string
    entityId: string
    user: string
    timestamp: string
  }>
  pendingApprovals: number
  failedHarvests: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
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
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📰</div>
              <div className="stat-content">
                <h3>Total Cases</h3>
                <p className="stat-number">{formatNumber(stats.totalCases)}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👤</div>
              <div className="stat-content">
                <h3>People</h3>
                <p className="stat-number">{formatNumber(stats.totalPeople)}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏢</div>
              <div className="stat-content">
                <h3>Organizations</h3>
                <p className="stat-number">{formatNumber(stats.totalOrganizations)}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-content">
                <h3>Statements</h3>
                <p className="stat-number">{formatNumber(stats.totalStatements)}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <h3>Sources</h3>
                <p className="stat-number">{formatNumber(stats.totalSources)}</p>
                <p className="stat-subtitle">
                  {stats.verifiedSources} verified ({Math.round((stats.verifiedSources / stats.totalSources) * 100)}%)
                </p>
              </div>
            </div>

            <div className="stat-card alert">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <h3>Needs Attention</h3>
                <p className="stat-number">{stats.pendingApprovals + stats.failedHarvests}</p>
                <p className="stat-subtitle">
                  {stats.pendingApprovals} approvals, {stats.failedHarvests} failed harvests
                </p>
              </div>
            </div>
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

          {/* Recent Cases & Activity */}
          <div className="dashboard-grid">
            <div className="recent-section">
              <h2>Recent Cases</h2>
              <div className="recent-list">
                {stats.recentCases.map(caseItem => (
                  <div key={caseItem.id} className="recent-item">
                    <div className="item-main">
                      <a
                        href={`/admin/cases/${caseItem.slug}`}
                        className="item-title"
                      >
                        {caseItem.title}
                      </a>
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
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
                {stats.recentCases.length === 0 && (
                  <p className="no-data">No recent cases</p>
                )}
              </div>
            </div>

            <div className="recent-section">
              <h2>Recent Activity</h2>
              <div className="activity-feed">
                {stats.recentActivity.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      {activity.action === 'CREATE' && '➕'}
                      {activity.action === 'UPDATE' && '✏️'}
                      {activity.action === 'DELETE' && '🗑️'}
                      {activity.action === 'VERIFY' && '✅'}
                      {activity.action === 'APPROVE' && '👍'}
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">
                        <strong>{activity.user}</strong> {activity.action.toLowerCase()}d a {activity.entityType}
                      </p>
                      <p className="activity-time">{formatTime(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
                {stats.recentActivity.length === 0 && (
                  <p className="no-data">No recent activity</p>
                )}
              </div>
            </div>
          </div>
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
            margin-bottom: 3rem;
          }

          .stat-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            display: flex;
            align-items: center;
            gap: 1rem;
            transition: transform 0.2s, box-shadow 0.2s;
          }

          .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
          }

          .stat-card.alert {
            background: #fff3cd;
            border: 1px solid #ffc107;
          }

          .stat-icon {
            font-size: 2rem;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8f9fa;
            border-radius: 10px;
          }

          .stat-card.alert .stat-icon {
            background: #ffc107;
          }

          .stat-content h3 {
            margin: 0;
            font-size: 0.875rem;
            color: #6c757d;
            font-weight: 500;
          }

          .stat-number {
            margin: 0.25rem 0 0;
            font-size: 1.75rem;
            font-weight: 700;
            color: #2c3e50;
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
            margin-bottom: 3rem;
          }

          .quick-actions h2 {
            margin: 0 0 1rem;
            font-size: 1.25rem;
            color: #2c3e50;
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

          .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 2rem;
          }

          .recent-section {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }

          .recent-section h2 {
            margin: 0 0 1rem;
            font-size: 1.25rem;
            color: #2c3e50;
          }

          .recent-list, .activity-feed {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .recent-item {
            padding: 0.75rem;
            background: #f8f9fa;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .item-title {
            color: #2c3e50;
            text-decoration: none;
            font-weight: 500;
            display: block;
            margin-bottom: 0.25rem;
          }

          .item-title:hover {
            color: #3498db;
            text-decoration: underline;
          }

          .item-meta {
            font-size: 0.875rem;
            color: #6c757d;
            margin: 0;
          }

          .status {
            padding: 0.125rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            margin-left: 0.5rem;
          }

          .status-verified {
            background: #d4edda;
            color: #155724;
          }

          .status-documented {
            background: #d1ecf1;
            color: #0c5460;
          }

          .status-disputed {
            background: #fff3cd;
            color: #856404;
          }

          .mini-btn {
            padding: 0.25rem 0.75rem;
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            font-size: 0.875rem;
            cursor: pointer;
          }

          .mini-btn:hover {
            background: #f8f9fa;
            border-color: #3498db;
            color: #3498db;
          }

          .activity-item {
            display: flex;
            gap: 0.75rem;
            padding: 0.75rem;
            background: #f8f9fa;
            border-radius: 8px;
          }

          .activity-icon {
            font-size: 1.25rem;
          }

          .activity-text {
            margin: 0 0 0.25rem;
            font-size: 0.9rem;
          }

          .activity-time {
            margin: 0;
            font-size: 0.75rem;
            color: #6c757d;
          }

          .no-data {
            text-align: center;
            color: #6c757d;
            padding: 2rem;
            margin: 0;
          }

          @media (max-width: 768px) {
            .stats-grid {
              grid-template-columns: 1fr;
            }

            .dashboard-grid {
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