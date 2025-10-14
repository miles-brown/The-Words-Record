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
    isRealIncident: boolean
  }>
  recentStatements: Array<{
    id: string
    content: string
    statementDate: string
    statementType: string
    person: { id: string; slug: string; fullName: string } | null
    organization: { id: string; slug: string; name: string } | null
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
  href?: string
  color?: string
}

function MetricCard({ icon, label, value, subtle = false, href, color }: MetricCardProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    }
  }

  return (
    <div
      className={`stat-card ${subtle ? 'subtle' : ''} ${href ? 'clickable' : ''}`}
      onClick={handleClick}
      style={color ? { background: color } : undefined}
    >
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
            <MetricCard icon="📰" label="Total Cases" value={stats.totalCases} href="/admin/cases" color="linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)" />
            <MetricCard icon="👤" label="People" value={stats.totalPeople} href="/admin/people" color="linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)" />
            <MetricCard icon="🏢" label="Organizations" value={stats.totalOrganizations} href="/admin/organizations" color="linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)" />
            <MetricCard icon="💬" label="Statements" value={stats.totalStatements} href="/admin/statements" color="linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)" />
            <MetricCard icon="🧑‍🤝‍🧑" label="Users" value={stats.totalUsers} href="/admin/users" color="linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)" />
            <MetricCard icon="🔥" label="Active (30d)" value={stats.activeUsers30d} color="linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)" />
            <MetricCard icon="🔐" label="MFA Enabled" value={stats.mfaEnabledUsers} color="linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)" />
            <MetricCard icon="🗝️" label="Active API Keys" value={stats.activeApiKeys} color="linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%)" />
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
              <h2>Recent Statements</h2>
              <div className="recent-list">
                {stats.recentStatements && stats.recentStatements.map(statement => (
                  <div key={statement.id} className="recent-item">
                    <div className="item-main">
                      <span className="item-title">
                        {statement.person ? statement.person.fullName :
                         statement.organization ? statement.organization.name : 'Unknown'}
                      </span>
                      <p className="item-content">{statement.content}</p>
                      <p className="item-meta">
                        {formatDate(statement.statementDate)} •
                        <span className={`status status-${statement.statementType.toLowerCase()}`}>
                          {statement.statementType}
                        </span>
                      </p>
                    </div>
                    <div className="item-actions">
                      <button
                        onClick={() => router.push(`/admin/statements?id=${statement.id}`)}
                        className="mini-btn"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
                {(!stats.recentStatements || stats.recentStatements.length === 0) &&
                  <p className="no-data">No recent statements</p>}
              </div>
            </section>

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
                        {caseItem.isRealIncident && <span className="badge-incident">Multi-Statement Case</span>}
                      </p>
                    </div>
                    <div className="item-actions">
                      <button
                        onClick={() => router.push(`/admin/cases/${caseItem.slug}`)}
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
          /* Admin Dashboard Container with CSS Variables */
          .dashboard {
            --spacing-unit: 1.5rem;
            --radius-sm: 8px;
            --radius-md: 12px;
            --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
            --shadow-md: 0 2px 8px rgba(0,0,0,0.1);
            --shadow-lg: 0 4px 16px rgba(0,0,0,0.12);
            max-width: 1400px;
            margin: 0 auto;
            padding: 0;
          }

          /* Reset global button styles for admin */
          .dashboard button {
            all: unset;
            box-sizing: border-box;
            cursor: pointer;
            user-select: none;
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

          /* Primary Stats Grid - 4 columns, consistent sizing */
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: var(--spacing-unit);
            margin-bottom: var(--spacing-unit);
          }

          /* Workflow Stats Grid - 6 columns, smaller cards */
          .workflow-grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: var(--spacing-unit);
            margin-bottom: calc(var(--spacing-unit) * 1.5);
          }

          /* Stat Card - Fixed height for alignment */
          .stat-card {
            background: white;
            border-radius: var(--radius-md);
            padding: 1.5rem;
            box-shadow: var(--shadow-md);
            display: flex;
            align-items: center;
            gap: 1rem;
            min-height: 120px;
            transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
            border: 1px solid rgba(0, 0, 0, 0.08);
            position: relative;
          }

          .stat-card.clickable {
            cursor: pointer;
          }

          .stat-card.clickable::after {
            content: '→';
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0;
            transition: opacity 0.2s, transform 0.2s;
            font-size: 1.5rem;
            font-weight: bold;
            color: rgba(0, 0, 0, 0.4);
          }

          .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-lg);
            filter: brightness(0.98);
          }

          .stat-card.clickable:hover::after {
            opacity: 1;
            transform: translateY(-50%) translateX(3px);
          }

          .stat-card.subtle {
            background: #fafbfc;
            border: 1px solid #e5e7eb;
            box-shadow: var(--shadow-sm);
            min-height: 100px;
            padding: 1.25rem;
          }

          .stat-card.subtle:hover {
            background: white;
            transform: translateY(-1px);
          }

          .stat-card.wide {
            grid-column: span 2;
          }

          /* Stat Icon - Consistent sizing */
          .stat-icon {
            font-size: 2rem;
            width: 56px;
            height: 56px;
            min-width: 56px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            border-radius: 12px;
            flex-shrink: 0;
          }

          .stat-card.subtle .stat-icon {
            width: 48px;
            height: 48px;
            min-width: 48px;
            font-size: 1.75rem;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          }

          /* Typography Hierarchy */
          .stat-content {
            flex: 1;
            min-width: 0;
          }

          .stat-content h3 {
            margin: 0 0 0.5rem 0;
            font-size: 0.75rem;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            line-height: 1.2;
          }

          .stat-number {
            margin: 0;
            font-size: 1.875rem;
            font-weight: 700;
            color: #0f172a;
            line-height: 1;
          }

          .stat-card.subtle .stat-number {
            font-size: 1.5rem;
          }

          .stat-subtitle {
            margin: 0.5rem 0 0;
            font-size: 0.8125rem;
            color: #64748b;
            font-weight: 400;
            line-height: 1.4;
          }

          /* Quick Actions Section */
          .quick-actions {
            background: white;
            border-radius: var(--radius-md);
            padding: 2rem;
            box-shadow: var(--shadow-md);
            margin-bottom: calc(var(--spacing-unit) * 1.5);
            border: 1px solid #f3f4f6;
          }

          .quick-actions h2 {
            margin: 0 0 1.25rem 0;
            font-size: 1.125rem;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: -0.01em;
          }

          .action-buttons {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1rem;
          }

          .action-btn {
            padding: 1.25rem 1.5rem;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.25s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            color: #475569;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            min-height: 100px;
          }

          .action-btn span {
            font-size: 2rem;
            line-height: 1;
            display: block;
          }

          .action-btn:hover {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-color: #3b82f6;
            color: #3b82f6;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.15);
          }

          .action-btn.primary {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            border-color: #3b82f6;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
          }

          .action-btn.primary:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            border-color: #2563eb;
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35);
            transform: translateY(-3px);
          }

          /* Panels Grid */
          .panels {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--spacing-unit);
            margin-bottom: calc(var(--spacing-unit) * 1.5);
          }

          .panel {
            background: white;
            border-radius: var(--radius-md);
            padding: 2rem;
            box-shadow: var(--shadow-md);
            border: 1px solid #f3f4f6;
            display: flex;
            flex-direction: column;
            min-height: 400px;
          }

          .panel h2 {
            margin: 0 0 1.5rem 0;
            font-size: 1.125rem;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: -0.01em;
            padding-bottom: 1rem;
            border-bottom: 2px solid #f1f5f9;
          }

          /* Recent Lists & Activity Feed */
          .recent-list, .activity-feed {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            flex: 1;
            overflow-y: auto;
          }

          .recent-item, .activity-item {
            padding: 1rem 1.25rem;
            background: #fafbfc;
            border-radius: var(--radius-sm);
            border: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            transition: all 0.2s;
          }

          .recent-item:hover, .activity-item:hover {
            background: white;
            border-color: #d1d5db;
            box-shadow: var(--shadow-sm);
          }

          .item-main {
            flex: 1;
            min-width: 0;
          }

          .item-title {
            font-weight: 600;
            color: #0f172a;
            font-size: 0.9375rem;
            line-height: 1.4;
            margin: 0 0 0.375rem 0;
            display: block;
          }

          .item-content {
            font-size: 0.875rem;
            color: #475569;
            line-height: 1.5;
            margin: 0.5rem 0;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .item-meta {
            font-size: 0.8125rem;
            color: #64748b;
            margin: 0;
            line-height: 1.5;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
          }

          .item-actions {
            flex-shrink: 0;
          }

          .mini-btn {
            padding: 0.5rem 1rem;
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 0.8125rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            color: #475569;
          }

          .mini-btn:hover {
            background: #f8fafc;
            border-color: #3b82f6;
            color: #3b82f6;
            transform: translateY(-1px);
          }

          /* Activity Items */
          .activity-item {
            align-items: flex-start;
            background: white;
            border: 1px solid #f3f4f6;
          }

          .activity-icon {
            font-size: 1.25rem;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            border-radius: 8px;
            flex-shrink: 0;
          }

          .activity-content {
            flex: 1;
            min-width: 0;
          }

          .activity-text {
            margin: 0 0 0.5rem;
            font-size: 0.9375rem;
            color: #0f172a;
            line-height: 1.5;
          }

          .activity-text strong {
            font-weight: 700;
            color: #3b82f6;
          }

          .activity-time {
            margin: 0;
            font-size: 0.8125rem;
            color: #64748b;
            font-weight: 500;
          }

          .activity-description {
            margin: 0.5rem 0 0;
            font-size: 0.875rem;
            color: #64748b;
            line-height: 1.5;
          }

          /* Status Badges */
          .status {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.625rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
            line-height: 1;
          }

          .status-documented {
            background: #dbeafe;
            color: #1e40af;
          }

          .status-approved {
            background: #d1fae5;
            color: #065f46;
          }

          .status-submitted {
            background: #fef3c7;
            color: #92400e;
          }

          .status-in_review {
            background: #f3f4f6;
            color: #374151;
          }

          .status-failed {
            background: #fee2e2;
            color: #991b1b;
          }

          .status-original {
            background: #e0e7ff;
            color: #3730a3;
          }

          .status-response {
            background: #fef3c7;
            color: #78350f;
          }

          .badge-incident {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.625rem;
            border-radius: 6px;
            font-size: 0.7rem;
            font-weight: 600;
            line-height: 1;
            background: #ddd6fe;
            color: #5b21b6;
            margin-left: 0.5rem;
          }

          .no-data {
            text-align: center;
            color: #94a3b8;
            padding: 3rem 1rem;
            margin: 0;
            font-size: 0.9375rem;
            font-weight: 500;
          }

          /* Responsive Design */
          @media (max-width: 1200px) {
            .stats-grid {
              grid-template-columns: repeat(3, 1fr);
            }

            .workflow-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          @media (max-width: 968px) {
            .stats-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .workflow-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .panels {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 640px) {
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

            .panel {
              padding: 1.5rem;
              min-height: 300px;
            }

            .quick-actions {
              padding: 1.5rem;
            }

            .action-buttons {
              flex-direction: column;
            }

            .action-btn {
              width: 100%;
              justify-content: center;
            }

            .stat-card {
              min-height: 100px;
              padding: 1.25rem;
            }

            .stat-icon {
              width: 48px;
              height: 48px;
              min-width: 48px;
              font-size: 1.5rem;
            }

            .stat-number {
              font-size: 1.5rem;
            }
          }
        `}</style>
      </AdminLayout>
    </>
  )
}
