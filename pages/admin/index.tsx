/**
 * Admin Dashboard - Redesigned with unified design system
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
    person: { id: string; slug: string; fullName: string | null } | null
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

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="admin-flex-center" style={{ minHeight: '60vh' }}>
          <div className="admin-skeleton" style={{ width: '100px', height: '100px', borderRadius: '50%' }}></div>
        </div>
      </AdminLayout>
    )
  }

  const metrics = [
    {
      icon: '📁',
      label: 'Total Cases',
      value: stats?.totalCases || 0,
      color: 'var(--metric-amber)',
      href: '/admin/cases'
    },
    {
      icon: '👥',
      label: 'People',
      value: stats?.totalPeople || 0,
      color: 'var(--metric-blue)',
      href: '/admin/people'
    },
    {
      icon: '🏢',
      label: 'Organizations',
      value: stats?.totalOrganizations || 0,
      color: 'var(--metric-green)',
      href: '/admin/organizations'
    },
    {
      icon: '💬',
      label: 'Statements',
      value: stats?.totalStatements || 0,
      color: 'var(--metric-indigo)',
      href: '/admin/statements'
    },
    {
      icon: '📰',
      label: 'Sources',
      value: stats?.totalSources || 0,
      color: 'var(--metric-purple)',
      href: '/admin/sources'
    },
    {
      icon: '👤',
      label: 'Users',
      value: stats?.totalUsers || 0,
      color: 'var(--metric-pink)',
      href: '/admin/users'
    },
    {
      icon: '✅',
      label: 'Verified',
      value: stats?.verifiedSources || 0,
      color: 'var(--metric-green)',
      subtle: true
    },
    {
      icon: '🔐',
      label: 'MFA Enabled',
      value: stats?.mfaEnabledUsers || 0,
      color: 'var(--metric-grey)',
      subtle: true
    }
  ]

  const quickActions = [
    { icon: '📝', label: 'New Case', href: '/admin/cases/new' },
    { icon: '👤', label: 'Add Person', href: '/admin/people/new' },
    { icon: '💬', label: 'Add Statement', href: '/admin/statements/new' },
    { icon: '📰', label: 'Add Source', href: '/admin/sources/new' },
    { icon: '🏢', label: 'Add Organization', href: '/admin/organizations/new' }
  ]

  return (
    <>
      <Head>
        <title>Dashboard - TWR Admin</title>
      </Head>

      <AdminLayout title="Dashboard">
        {/* Main Metrics Grid */}
        <div className="admin-section">
          <h2 className="admin-section-header">Overview</h2>
          <div className="admin-grid admin-grid-auto">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="admin-metric-card"
                style={{
                  backgroundColor: metric.color,
                  cursor: metric.href ? 'pointer' : 'default',
                  opacity: metric.subtle ? 0.8 : 1
                }}
                onClick={() => metric.href && router.push(metric.href)}
              >
                <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
                  {metric.icon}
                </div>
                <div className="admin-metric-value">{metric.value.toLocaleString()}</div>
                <div className="admin-metric-label">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Management Section */}
        <div className="admin-grid admin-grid-cols-2" style={{ gap: '1.5rem' }}>
          {/* Recent Cases */}
          <div className="admin-section">
            <div className="admin-flex-between admin-mb-4">
              <h2 className="admin-section-header" style={{ margin: 0 }}>Recent Cases</h2>
              <button
                onClick={() => router.push('/admin/cases')}
                className="admin-btn admin-btn-secondary admin-text-sm"
              >
                View All
              </button>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentCases.slice(0, 5).map(item => (
                    <tr key={item.id} onClick={() => router.push(`/admin/cases/${item.slug}`)} style={{ cursor: 'pointer' }}>
                      <td className="admin-font-medium">{item.title}</td>
                      <td className="admin-text-sm">{new Date(item.caseDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`admin-badge ${
                          item.status === 'PUBLISHED' ? 'admin-badge-success' :
                          item.status === 'DRAFT' ? 'admin-badge-warning' :
                          'admin-badge-info'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!stats?.recentCases || stats.recentCases.length === 0) && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                        No recent cases
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Statements */}
          <div className="admin-section">
            <div className="admin-flex-between admin-mb-4">
              <h2 className="admin-section-header" style={{ margin: 0 }}>Recent Statements</h2>
              <button
                onClick={() => router.push('/admin/statements')}
                className="admin-btn admin-btn-secondary admin-text-sm"
              >
                View All
              </button>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Content</th>
                    <th>By</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentStatements.slice(0, 5).map(item => (
                    <tr key={item.id} style={{ cursor: 'pointer' }}>
                      <td className="admin-font-medium" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.content}
                      </td>
                      <td className="admin-text-sm">
                        {item.person?.fullName || item.organization?.name || 'Unknown'}
                      </td>
                      <td className="admin-text-sm">
                        {new Date(item.statementDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {(!stats?.recentStatements || stats.recentStatements.length === 0) && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                        No recent statements
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* System Status Section */}
        <div className="admin-grid admin-grid-cols-3" style={{ gap: '1.5rem' }}>
          {/* Draft Queue */}
          <div className="admin-card">
            <h3 className="admin-section-header admin-text-lg">Draft Queue</h3>
            <div className="admin-gap-4">
              <div className="admin-flex-between admin-mb-2">
                <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Pending</span>
                <span className="admin-font-semibold">{stats?.draftsPending || 0}</span>
              </div>
              <div className="admin-flex-between admin-mb-2">
                <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Submitted</span>
                <span className="admin-font-semibold">{stats?.draftsSubmitted || 0}</span>
              </div>
              <div className="admin-flex-between">
                <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Approvals</span>
                <span className="admin-font-semibold">{stats?.pendingApprovals || 0}</span>
              </div>
            </div>
          </div>

          {/* API Activity */}
          <div className="admin-card">
            <h3 className="admin-section-header admin-text-lg">API Activity</h3>
            <div className="admin-gap-4">
              <div className="admin-flex-between admin-mb-2">
                <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Active Keys</span>
                <span className="admin-font-semibold">{stats?.activeApiKeys || 0}</span>
              </div>
              <div className="admin-flex-between admin-mb-2">
                <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Auth (24h)</span>
                <span className="admin-font-semibold">{stats?.apiKeyAuth24h || 0}</span>
              </div>
              <div className="admin-flex-between">
                <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Errors (24h)</span>
                <span className="admin-font-semibold" style={{ color: stats?.errorEvents24h ? 'var(--admin-accent)' : 'inherit' }}>
                  {stats?.errorEvents24h || 0}
                </span>
              </div>
            </div>
          </div>

          {/* User Activity */}
          <div className="admin-card">
            <h3 className="admin-section-header admin-text-lg">User Activity</h3>
            <div className="admin-gap-4">
              <div className="admin-flex-between admin-mb-2">
                <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Active (30d)</span>
                <span className="admin-font-semibold">{stats?.activeUsers30d || 0}</span>
              </div>
              <div className="admin-flex-between admin-mb-2">
                <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>MFA Users</span>
                <span className="admin-font-semibold">{stats?.mfaEnabledUsers || 0}</span>
              </div>
              <div className="admin-flex-between">
                <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Total Users</span>
                <span className="admin-font-semibold">{stats?.totalUsers || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-section">
          <h2 className="admin-section-header">Quick Actions</h2>
          <div className="admin-quick-actions">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="admin-quick-action-card"
                onClick={() => router.push(action.href)}
              >
                <div className="admin-quick-action-icon">{action.icon}</div>
                <div className="admin-quick-action-label">{action.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Timeline */}
        <div className="admin-section">
          <div className="admin-flex-between admin-mb-4">
            <h2 className="admin-section-header" style={{ margin: 0 }}>Recent Activity</h2>
            <button
              onClick={() => router.push('/admin/audit')}
              className="admin-btn admin-btn-secondary admin-text-sm"
            >
              View Audit Log
            </button>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>User</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.auditTimeline.slice(0, 10).map(item => (
                  <tr key={item.id}>
                    <td className="admin-font-medium">{item.action.replace(/_/g, ' ')}</td>
                    <td className="admin-text-sm">
                      {item.entityType && item.entityId ? `${item.entityType}:${item.entityId}` : '-'}
                    </td>
                    <td className="admin-text-sm">{item.actor || 'System'}</td>
                    <td className="admin-text-sm">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <span className={`admin-badge ${
                        item.status === 'SUCCESS' ? 'admin-badge-success' :
                        item.status === 'FAILURE' ? 'admin-badge-error' :
                        'admin-badge-info'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!stats?.auditTimeline || stats.auditTimeline.length === 0) && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                      No recent activity
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}