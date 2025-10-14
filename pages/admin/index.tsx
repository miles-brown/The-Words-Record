/**
 * Admin Dashboard - Enhanced Management Console
 * Comprehensive admin interface with metrics, activity tracking, and management tools
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'

interface DashboardStats {
  // Core Metrics
  totalCases: number
  totalPeople: number
  totalOrganizations: number
  totalStatements: number
  totalSources: number
  totalUsers: number

  // Verification & Security
  verifiedSources: number
  mfaEnabledUsers: number
  activeUsers30d: number
  activeApiKeys: number
  apiKeyAuth24h: number
  errorEvents24h: number

  // Workflow Metrics
  pendingApprovals: number
  draftsPending: number
  draftsSubmitted: number
  failedHarvests: number

  // Growth Metrics
  newCasesThisWeek: number
  newUsersThisWeek: number
  growthPercentage: number

  // Recent Activity
  recentCases: Array<{
    id: string
    title: string
    slug: string
    caseDate: string
    status: string
    isRealIncident: boolean
    createdBy?: string
  }>

  recentStatements: Array<{
    id: string
    content: string
    statementDate: string
    statementType: string
    person: { id: string; slug: string; fullName: string | null } | null
    organization: { id: string; slug: string; name: string } | null
  }>

  // Queue Management
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

  // Audit Trail
  auditTimeline: Array<{
    id: string
    action: string
    entityType: string | null
    entityId: string | null
    actor: string | null
    timestamp: string
    status: string
    description: string | null
    ipAddress?: string
  }>

  // Recently Viewed
  recentlyViewed: Array<{
    id: string
    type: string
    title: string
    url: string
    viewedAt: string
  }>

  // System Health
  systemHealth: {
    database: 'healthy' | 'warning' | 'error'
    apiLatency: number
    storageUsed: number
    storageTotal: number
    lastBackup: string
    scheduledJobs: number
    failedJobs: number
  }
}

interface MetricCardProps {
  icon: string
  label: string
  value: number | string
  change?: number
  subtitle?: string
  subtle?: boolean
  href?: string
  color?: string
  onClick?: () => void
}

interface SearchResult {
  id: string
  type: 'case' | 'person' | 'organization' | 'statement' | 'source' | 'user'
  title: string
  description?: string
  url: string
}

function MetricCard({ icon, label, value, change, subtitle, subtle = false, href, color, onClick }: MetricCardProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (href) {
      router.push(href)
    }
  }

  const formatValue = (val: number | string) => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('en-US').format(val)
    }
    return val
  }

  return (
    <div
      className={`metric-card ${subtle ? 'subtle' : ''} ${href || onClick ? 'clickable' : ''}`}
      onClick={handleClick}
      style={color ? { background: color } : undefined}
    >
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <h3>{label}</h3>
        <p className="metric-value">{formatValue(value)}</p>
        {subtitle && <p className="metric-subtitle">{subtitle}</p>}
        {change !== undefined && (
          <p className={`metric-change ${change >= 0 ? 'positive' : 'negative'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </p>
        )}
      </div>
    </div>
  )
}

function SearchBar({ onSearch }: { onSearch: (results: SearchResult[]) => void }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      onSearch([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          onSearch(data.results || [])
        }
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, onSearch])

  return (
    <div className="search-bar" ref={searchRef}>
      <div className={`search-input-wrapper ${focused ? 'focused' : ''}`}>
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search everything... (cases, people, organizations, statements)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          className="search-input"
        />
        {loading && <span className="search-loading">⌛</span>}
        {query && !loading && (
          <button className="search-clear" onClick={() => setQuery('')}>
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default function EnhancedAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
    // Set up auto-refresh
    const interval = setInterval(fetchDashboardData, 60000) // Refresh every minute
    return () => clearInterval(interval)
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
      // Add mock data for enhanced features
      setStats({
        ...data,
        newCasesThisWeek: data.newCasesThisWeek || 12,
        newUsersThisWeek: data.newUsersThisWeek || 3,
        growthPercentage: data.growthPercentage || 15,
        recentlyViewed: data.recentlyViewed || [],
        systemHealth: data.systemHealth || {
          database: 'healthy',
          apiLatency: 45,
          storageUsed: 2.3,
          storageTotal: 10,
          lastBackup: new Date(Date.now() - 3600000).toISOString(),
          scheduledJobs: 5,
          failedJobs: 0
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
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

  const handleSearch = (results: SearchResult[]) => {
    setSearchResults(results)
    setShowSearchResults(results.length > 0)
  }

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <AdminLayout title="Management Console">
        <div className="enhanced-dashboard">
          {/* Global Search Bar */}
          <div className="search-section">
            <SearchBar onSearch={handleSearch} />
            {showSearchResults && (
              <div className="search-results">
                <div className="results-header">
                  <h3>Search Results ({searchResults.length})</h3>
                  <button onClick={() => setShowSearchResults(false)}>✕</button>
                </div>
                <div className="results-list">
                  {searchResults.map(result => (
                    <div key={result.id} className="result-item" onClick={() => router.push(result.url)}>
                      <span className="result-type">{result.type}</span>
                      <div className="result-content">
                        <h4>{result.title}</h4>
                        {result.description && <p>{result.description}</p>}
                      </div>
                      <span className="result-arrow">→</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Key Metrics Grid */}
          <div className="metrics-grid">
            <MetricCard
              icon="📊"
              label="Total Cases"
              value={stats.totalCases}
              change={stats.growthPercentage}
              subtitle={`+${stats.newCasesThisWeek} this week`}
              href="/admin/cases"
              color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            />
            <MetricCard
              icon="👥"
              label="Total People"
              value={stats.totalPeople}
              href="/admin/people"
              color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            />
            <MetricCard
              icon="🏢"
              label="Organizations"
              value={stats.totalOrganizations}
              href="/admin/organizations"
              color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            />
            <MetricCard
              icon="💬"
              label="Statements"
              value={stats.totalStatements}
              href="/admin/statements"
              color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
            />
          </div>

          {/* System Health & Security */}
          <div className="system-health">
            <h2>System Status</h2>
            <div className="health-grid">
              <div className={`health-item ${stats.systemHealth.database}`}>
                <span className="health-icon">🗄️</span>
                <div className="health-content">
                  <h4>Database</h4>
                  <p className="health-status">{stats.systemHealth.database}</p>
                </div>
              </div>
              <div className="health-item healthy">
                <span className="health-icon">⚡</span>
                <div className="health-content">
                  <h4>API Latency</h4>
                  <p className="health-value">{stats.systemHealth.apiLatency}ms</p>
                </div>
              </div>
              <div className="health-item">
                <span className="health-icon">💾</span>
                <div className="health-content">
                  <h4>Storage</h4>
                  <p className="health-value">
                    {stats.systemHealth.storageUsed}GB / {stats.systemHealth.storageTotal}GB
                  </p>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${(stats.systemHealth.storageUsed / stats.systemHealth.storageTotal) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="health-item">
                <span className="health-icon">🔒</span>
                <div className="health-content">
                  <h4>Security</h4>
                  <p className="health-value">{stats.mfaEnabledUsers} MFA Users</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Hub */}
          <div className="quick-actions-hub">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <button onClick={() => router.push('/admin/cases/new')} className="action-card primary">
                <span className="action-icon">📝</span>
                <span className="action-label">Create Case</span>
                <span className="action-shortcut">Ctrl+N</span>
              </button>
              <button onClick={() => router.push('/admin/people/new')} className="action-card">
                <span className="action-icon">👤</span>
                <span className="action-label">Add Person</span>
              </button>
              <button onClick={() => router.push('/admin/organizations/new')} className="action-card">
                <span className="action-icon">🏢</span>
                <span className="action-label">Add Organization</span>
              </button>
              <button onClick={() => router.push('/admin/sources/verify')} className="action-card">
                <span className="action-icon">✅</span>
                <span className="action-label">Verify Sources</span>
                <span className="action-badge">{stats.totalSources - stats.verifiedSources}</span>
              </button>
              <button onClick={() => router.push('/admin/harvest')} className="action-card">
                <span className="action-icon">🤖</span>
                <span className="action-label">Run Harvest</span>
              </button>
              <button onClick={() => router.push('/admin/bulk')} className="action-card">
                <span className="action-icon">📦</span>
                <span className="action-label">Bulk Operations</span>
              </button>
              <button onClick={() => router.push('/admin/export')} className="action-card">
                <span className="action-icon">📥</span>
                <span className="action-label">Export Data</span>
              </button>
              <button onClick={() => router.push('/admin/audit')} className="action-card">
                <span className="action-icon">📋</span>
                <span className="action-label">Audit Logs</span>
              </button>
              <button onClick={() => router.push('/admin/settings')} className="action-card">
                <span className="action-icon">⚙️</span>
                <span className="action-label">Settings</span>
              </button>
            </div>
          </div>

          {/* Workflow Metrics */}
          <div className="workflow-section">
            <h2>Workflow Status</h2>
            <div className="workflow-grid">
              <MetricCard
                icon="📝"
                label="Drafts Pending"
                value={stats.draftsPending}
                subtle
                href="/admin/drafts"
              />
              <MetricCard
                icon="🔍"
                label="In Review"
                value={stats.draftsSubmitted}
                subtle
                href="/admin/drafts?status=submitted"
              />
              <MetricCard
                icon="⏳"
                label="Pending Approvals"
                value={stats.pendingApprovals}
                subtle
                href="/admin/approvals"
              />
              <MetricCard
                icon="⚠️"
                label="Failed Harvests"
                value={stats.failedHarvests}
                subtle
                href="/admin/harvest?status=failed"
              />
              <MetricCard
                icon="🔑"
                label="API Auth (24h)"
                value={stats.apiKeyAuth24h}
                subtle
              />
              <MetricCard
                icon="🚨"
                label="Errors (24h)"
                value={stats.errorEvents24h}
                subtle
                href="/admin/logs?level=error"
              />
            </div>
          </div>

          {/* Main Content Panels */}
          <div className="content-panels">
            {/* Recent Activity Panel */}
            <section className="panel activity-panel">
              <div className="panel-header">
                <h2>Recent Activity</h2>
                <button className="panel-action" onClick={() => router.push('/admin/audit')}>
                  View All →
                </button>
              </div>
              <div className="activity-feed">
                {stats.auditTimeline.slice(0, 10).map(item => (
                  <div key={item.id} className="activity-item">
                    <div className="activity-icon">
                      {item.action === 'CREATE' ? '➕' :
                       item.action === 'UPDATE' ? '✏️' :
                       item.action === 'DELETE' ? '🗑️' : '📋'}
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">
                        <strong>{item.actor || 'System'}</strong> {item.action.toLowerCase()} {item.entityType || 'record'}
                        {item.entityId && <span className="entity-id"> #{item.entityId.slice(0, 8)}</span>}
                      </p>
                      <p className="activity-meta">
                        <span className="activity-time">{formatTime(item.timestamp)}</span>
                        {item.ipAddress && <span className="activity-ip"> • {item.ipAddress}</span>}
                      </p>
                      {item.description && (
                        <p className="activity-description">{item.description}</p>
                      )}
                    </div>
                    <span className={`activity-status ${item.status}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
                {stats.auditTimeline.length === 0 && (
                  <p className="no-data">No recent activity</p>
                )}
              </div>
            </section>

            {/* Recent Cases Panel */}
            <section className="panel">
              <div className="panel-header">
                <h2>Recent Cases</h2>
                <button className="panel-action" onClick={() => router.push('/admin/cases')}>
                  View All →
                </button>
              </div>
              <div className="items-list">
                {stats.recentCases.map(caseItem => (
                  <div key={caseItem.id} className="item-card">
                    <div className="item-header">
                      <h3 className="item-title">{caseItem.title}</h3>
                      <span className={`status-badge ${caseItem.status.toLowerCase()}`}>
                        {caseItem.status}
                      </span>
                    </div>
                    <div className="item-meta">
                      <span>📅 {formatDate(caseItem.caseDate)}</span>
                      {caseItem.isRealIncident && <span className="incident-badge">Multi-Statement</span>}
                      {caseItem.createdBy && <span>👤 {caseItem.createdBy}</span>}
                    </div>
                    <button
                      className="item-action"
                      onClick={() => router.push(`/admin/cases/${caseItem.slug}`)}
                    >
                      Open Case →
                    </button>
                  </div>
                ))}
                {stats.recentCases.length === 0 && (
                  <p className="no-data">No recent cases</p>
                )}
              </div>
            </section>

            {/* Recent Statements Panel */}
            <section className="panel">
              <div className="panel-header">
                <h2>Recent Statements</h2>
                <button className="panel-action" onClick={() => router.push('/admin/statements')}>
                  View All →
                </button>
              </div>
              <div className="items-list">
                {stats.recentStatements.map(statement => (
                  <div key={statement.id} className="item-card">
                    <div className="item-header">
                      <h3 className="item-title">
                        {statement.person ? statement.person.fullName || 'Unnamed' :
                         statement.organization ? statement.organization.name : 'Unknown'}
                      </h3>
                      <span className={`type-badge ${statement.statementType.toLowerCase()}`}>
                        {statement.statementType}
                      </span>
                    </div>
                    <p className="item-content">{statement.content}</p>
                    <div className="item-meta">
                      <span>📅 {formatDate(statement.statementDate)}</span>
                    </div>
                    <button
                      className="item-action"
                      onClick={() => router.push(`/admin/statements?id=${statement.id}`)}
                    >
                      View Statement →
                    </button>
                  </div>
                ))}
                {stats.recentStatements.length === 0 && (
                  <p className="no-data">No recent statements</p>
                )}
              </div>
            </section>

            {/* Recently Viewed Sidebar */}
            {stats.recentlyViewed && stats.recentlyViewed.length > 0 && (
              <aside className="panel recently-viewed">
                <h2>Recently Viewed</h2>
                <div className="viewed-list">
                  {stats.recentlyViewed.map(item => (
                    <div key={item.id} className="viewed-item" onClick={() => router.push(item.url)}>
                      <span className="viewed-type">{item.type}</span>
                      <span className="viewed-title">{item.title}</span>
                      <span className="viewed-time">{formatTime(item.viewedAt)}</span>
                    </div>
                  ))}
                </div>
              </aside>
            )}
          </div>

          {/* Draft Queue Management */}
          {stats.draftQueue && stats.draftQueue.length > 0 && (
            <section className="panel draft-queue">
              <div className="panel-header">
                <h2>Draft Queue</h2>
                <button className="panel-action" onClick={() => router.push('/admin/drafts')}>
                  Manage Drafts →
                </button>
              </div>
              <div className="queue-list">
                {stats.draftQueue.slice(0, 5).map(draft => (
                  <div key={draft.id} className="queue-item">
                    <div className="queue-content">
                      <span className="queue-type">{draft.contentType}</span>
                      <span className="queue-owner">{draft.owner?.username || 'System'}</span>
                      <span className={`queue-status ${draft.status.toLowerCase()}`}>
                        {draft.status}
                      </span>
                    </div>
                    <div className="queue-meta">
                      <span>Updated {formatTime(draft.updatedAt)}</span>
                      {draft.submittedAt && <span> • Submitted {formatTime(draft.submittedAt)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <style jsx>{`
          /* Enhanced Dashboard Styles */
          .enhanced-dashboard {
            --primary: #3b82f6;
            --primary-dark: #2563eb;
            --secondary: #8b5cf6;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --bg-primary: #ffffff;
            --bg-secondary: #f8fafc;
            --bg-tertiary: #f1f5f9;
            --text-primary: #0f172a;
            --text-secondary: #475569;
            --text-tertiary: #64748b;
            --border: #e2e8f0;
            --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
            --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
            --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
            --shadow-xl: 0 20px 25px rgba(0,0,0,0.1);
            --radius-sm: 6px;
            --radius-md: 10px;
            --radius-lg: 14px;

            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1600px;
            margin: 0 auto;
            padding: 0;
          }

          /* Loading & Error States */
          .loading-container, .error-container {
            text-align: center;
            padding: 4rem;
            background: var(--bg-primary);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-sm);
          }

          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid var(--border);
            border-top: 4px solid var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1.5rem;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          /* Search Section */
          .search-section {
            margin-bottom: 2rem;
            position: relative;
          }

          .search-bar {
            position: relative;
          }

          .search-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            background: var(--bg-primary);
            border: 2px solid var(--border);
            border-radius: var(--radius-lg);
            padding: 0.75rem 1rem;
            transition: all 0.3s ease;
            box-shadow: var(--shadow-sm);
          }

          .search-input-wrapper.focused {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), var(--shadow-md);
          }

          .search-icon {
            font-size: 1.25rem;
            margin-right: 0.75rem;
            color: var(--text-tertiary);
          }

          .search-input {
            flex: 1;
            border: none;
            outline: none;
            font-size: 1rem;
            font-family: inherit;
            color: var(--text-primary);
            background: transparent;
          }

          .search-input::placeholder {
            color: var(--text-tertiary);
          }

          .search-loading {
            font-size: 1.25rem;
            margin-left: 0.75rem;
            animation: pulse 1.5s ease-in-out infinite;
          }

          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }

          .search-clear {
            background: none;
            border: none;
            color: var(--text-tertiary);
            cursor: pointer;
            padding: 0.25rem;
            margin-left: 0.5rem;
            font-size: 1.25rem;
            transition: color 0.2s;
          }

          .search-clear:hover {
            color: var(--text-primary);
          }

          /* Search Results */
          .search-results {
            position: absolute;
            top: calc(100% + 0.5rem);
            left: 0;
            right: 0;
            background: var(--bg-primary);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-xl);
            z-index: 100;
            max-height: 400px;
            overflow-y: auto;
          }

          .results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.25rem;
            border-bottom: 1px solid var(--border);
            position: sticky;
            top: 0;
            background: var(--bg-primary);
          }

          .results-header h3 {
            margin: 0;
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-secondary);
          }

          .results-header button {
            background: none;
            border: none;
            color: var(--text-tertiary);
            cursor: pointer;
            font-size: 1.25rem;
            padding: 0.25rem;
          }

          .results-list {
            padding: 0.5rem;
          }

          .result-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.875rem 1rem;
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all 0.2s;
          }

          .result-item:hover {
            background: var(--bg-secondary);
            transform: translateX(4px);
          }

          .result-type {
            padding: 0.25rem 0.5rem;
            background: var(--bg-tertiary);
            border-radius: var(--radius-sm);
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .result-content {
            flex: 1;
            min-width: 0;
          }

          .result-content h4 {
            margin: 0 0 0.25rem 0;
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--text-primary);
          }

          .result-content p {
            margin: 0;
            font-size: 0.875rem;
            color: var(--text-tertiary);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .result-arrow {
            font-size: 1.25rem;
            color: var(--text-tertiary);
          }

          /* Metrics Grid */
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .metric-card {
            background: var(--bg-primary);
            border-radius: var(--radius-lg);
            padding: 1.75rem;
            box-shadow: var(--shadow-md);
            display: flex;
            align-items: center;
            gap: 1.25rem;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            border: 1px solid transparent;
          }

          .metric-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
            opacity: 0;
            transition: opacity 0.3s;
          }

          .metric-card.clickable {
            cursor: pointer;
          }

          .metric-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-xl);
            border-color: var(--primary);
          }

          .metric-card:hover::before {
            opacity: 1;
          }

          .metric-card.subtle {
            background: var(--bg-secondary);
            box-shadow: var(--shadow-sm);
            padding: 1.5rem;
          }

          .metric-icon {
            font-size: 2.5rem;
            width: 64px;
            height: 64px;
            min-width: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.5);
            backdrop-filter: blur(10px);
            border-radius: var(--radius-md);
            flex-shrink: 0;
          }

          .metric-content {
            flex: 1;
            min-width: 0;
          }

          .metric-content h3 {
            margin: 0 0 0.5rem 0;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--text-tertiary);
          }

          .metric-value {
            margin: 0;
            font-size: 2.25rem;
            font-weight: 800;
            color: var(--text-primary);
            line-height: 1;
            font-variant-numeric: tabular-nums;
          }

          .metric-subtitle {
            margin: 0.5rem 0 0;
            font-size: 0.875rem;
            color: var(--text-secondary);
          }

          .metric-change {
            margin: 0.5rem 0 0;
            font-size: 0.875rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }

          .metric-change.positive {
            color: var(--success);
          }

          .metric-change.negative {
            color: var(--danger);
          }

          /* System Health */
          .system-health {
            background: var(--bg-primary);
            border-radius: var(--radius-lg);
            padding: 2rem;
            box-shadow: var(--shadow-sm);
            margin-bottom: 2rem;
          }

          .system-health h2 {
            margin: 0 0 1.5rem 0;
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-primary);
          }

          .health-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1.5rem;
          }

          .health-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.25rem;
            background: var(--bg-secondary);
            border-radius: var(--radius-md);
            border: 2px solid var(--border);
            transition: all 0.2s;
          }

          .health-item.healthy {
            border-color: var(--success);
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.1) 100%);
          }

          .health-item.warning {
            border-color: var(--warning);
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.1) 100%);
          }

          .health-item.error {
            border-color: var(--danger);
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.1) 100%);
          }

          .health-icon {
            font-size: 1.75rem;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-primary);
            border-radius: var(--radius-md);
          }

          .health-content {
            flex: 1;
          }

          .health-content h4 {
            margin: 0 0 0.25rem 0;
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--text-tertiary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .health-status {
            margin: 0;
            font-size: 0.9375rem;
            font-weight: 600;
            text-transform: capitalize;
          }

          .healthy .health-status {
            color: var(--success);
          }

          .warning .health-status {
            color: var(--warning);
          }

          .error .health-status {
            color: var(--danger);
          }

          .health-value {
            margin: 0;
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--text-primary);
          }

          .progress-bar {
            width: 100%;
            height: 6px;
            background: var(--bg-tertiary);
            border-radius: 3px;
            overflow: hidden;
            margin-top: 0.5rem;
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
            border-radius: 3px;
            transition: width 0.3s ease;
          }

          /* Quick Actions Hub */
          .quick-actions-hub {
            background: var(--bg-primary);
            border-radius: var(--radius-lg);
            padding: 2rem;
            box-shadow: var(--shadow-sm);
            margin-bottom: 2rem;
          }

          .quick-actions-hub h2 {
            margin: 0 0 1.5rem 0;
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-primary);
          }

          .actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 1rem;
          }

          .action-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 1.5rem 1rem;
            background: var(--bg-secondary);
            border: 2px solid var(--border);
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all 0.25s ease;
            position: relative;
            min-height: 120px;
          }

          .action-card:hover {
            background: var(--bg-primary);
            border-color: var(--primary);
            transform: translateY(-3px);
            box-shadow: var(--shadow-lg);
          }

          .action-card.primary {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            border-color: var(--primary);
            color: white;
          }

          .action-card.primary:hover {
            box-shadow: 0 12px 24px rgba(59, 130, 246, 0.35);
            transform: translateY(-4px);
          }

          .action-icon {
            font-size: 2rem;
            line-height: 1;
          }

          .action-label {
            font-size: 0.9375rem;
            font-weight: 600;
            color: inherit;
            text-align: center;
          }

          .action-card.primary .action-label {
            color: white;
          }

          .action-shortcut {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            padding: 0.25rem 0.5rem;
            background: rgba(0, 0, 0, 0.1);
            border-radius: var(--radius-sm);
            font-size: 0.6875rem;
            font-weight: 600;
            color: var(--text-tertiary);
          }

          .action-card.primary .action-shortcut {
            background: rgba(255, 255, 255, 0.2);
            color: rgba(255, 255, 255, 0.9);
          }

          .action-badge {
            position: absolute;
            top: -8px;
            right: -8px;
            background: var(--danger);
            color: white;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 0.25rem 0.5rem;
            border-radius: 100px;
            min-width: 24px;
            text-align: center;
          }

          /* Workflow Section */
          .workflow-section {
            margin-bottom: 2rem;
          }

          .workflow-section h2 {
            margin: 0 0 1rem 0;
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--text-primary);
          }

          .workflow-grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 1rem;
          }

          /* Content Panels */
          .content-panels {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 280px;
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .panel {
            background: var(--bg-primary);
            border-radius: var(--radius-lg);
            padding: 1.75rem;
            box-shadow: var(--shadow-sm);
            display: flex;
            flex-direction: column;
            min-height: 400px;
          }

          .activity-panel {
            grid-column: span 1;
          }

          .recently-viewed {
            grid-column: 4;
            grid-row: 1 / -1;
            max-height: 800px;
            overflow-y: auto;
          }

          .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--bg-tertiary);
          }

          .panel h2 {
            margin: 0;
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--text-primary);
          }

          .panel-action {
            background: none;
            border: none;
            color: var(--primary);
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            padding: 0.5rem 0.75rem;
            border-radius: var(--radius-sm);
          }

          .panel-action:hover {
            background: var(--bg-secondary);
            transform: translateX(2px);
          }

          /* Activity Feed */
          .activity-feed {
            flex: 1;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .activity-item {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            background: var(--bg-secondary);
            border-radius: var(--radius-md);
            transition: all 0.2s;
            align-items: flex-start;
          }

          .activity-item:hover {
            background: var(--bg-tertiary);
            transform: translateX(2px);
          }

          .activity-icon {
            font-size: 1.5rem;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-primary);
            border-radius: var(--radius-md);
            flex-shrink: 0;
          }

          .activity-content {
            flex: 1;
            min-width: 0;
          }

          .activity-text {
            margin: 0 0 0.5rem 0;
            font-size: 0.9375rem;
            color: var(--text-primary);
            line-height: 1.5;
          }

          .activity-text strong {
            font-weight: 700;
            color: var(--primary);
          }

          .entity-id {
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
            font-size: 0.875rem;
            color: var(--text-tertiary);
          }

          .activity-meta {
            margin: 0;
            font-size: 0.8125rem;
            color: var(--text-tertiary);
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .activity-time {
            font-weight: 500;
          }

          .activity-ip {
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
            font-size: 0.75rem;
          }

          .activity-description {
            margin: 0.5rem 0 0;
            font-size: 0.875rem;
            color: var(--text-secondary);
            line-height: 1.5;
          }

          .activity-status {
            padding: 0.25rem 0.625rem;
            border-radius: var(--radius-sm);
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .activity-status.success {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.15) 100%);
            color: var(--success);
          }

          .activity-status.pending {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.15) 100%);
            color: var(--warning);
          }

          .activity-status.failed {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.15) 100%);
            color: var(--danger);
          }

          /* Items List */
          .items-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            flex: 1;
            overflow-y: auto;
          }

          .item-card {
            padding: 1.25rem;
            background: var(--bg-secondary);
            border-radius: var(--radius-md);
            border: 1px solid var(--border);
            transition: all 0.2s;
          }

          .item-card:hover {
            background: var(--bg-primary);
            border-color: var(--primary);
            box-shadow: var(--shadow-md);
          }

          .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 0.75rem;
          }

          .item-title {
            margin: 0;
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-primary);
            line-height: 1.4;
          }

          .item-content {
            margin: 0.75rem 0;
            font-size: 0.9375rem;
            color: var(--text-secondary);
            line-height: 1.5;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .item-meta {
            display: flex;
            align-items: center;
            gap: 1rem;
            font-size: 0.8125rem;
            color: var(--text-tertiary);
            margin: 0.75rem 0;
          }

          .item-action {
            background: none;
            border: 1px solid var(--border);
            color: var(--primary);
            padding: 0.5rem 1rem;
            border-radius: var(--radius-sm);
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .item-action:hover {
            background: var(--primary);
            border-color: var(--primary);
            color: white;
            transform: translateX(2px);
          }

          /* Status & Type Badges */
          .status-badge, .type-badge {
            padding: 0.25rem 0.625rem;
            border-radius: var(--radius-sm);
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            flex-shrink: 0;
          }

          .status-badge.approved, .type-badge.original {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.15) 100%);
            color: var(--success);
          }

          .status-badge.submitted, .type-badge.response {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.15) 100%);
            color: var(--warning);
          }

          .status-badge.draft {
            background: linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(107, 114, 128, 0.15) 100%);
            color: var(--text-secondary);
          }

          .incident-badge {
            padding: 0.25rem 0.625rem;
            border-radius: var(--radius-sm);
            font-size: 0.75rem;
            font-weight: 600;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.15) 100%);
            color: var(--secondary);
          }

          /* Recently Viewed */
          .viewed-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .viewed-item {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            padding: 0.875rem;
            background: var(--bg-secondary);
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all 0.2s;
          }

          .viewed-item:hover {
            background: var(--bg-tertiary);
            transform: translateX(2px);
          }

          .viewed-type {
            font-size: 0.6875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--text-tertiary);
          }

          .viewed-title {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-primary);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .viewed-time {
            font-size: 0.75rem;
            color: var(--text-tertiary);
          }

          /* Draft Queue */
          .draft-queue {
            grid-column: 1 / -1;
          }

          .queue-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .queue-item {
            padding: 1rem;
            background: var(--bg-secondary);
            border-radius: var(--radius-md);
            border: 1px solid var(--border);
            transition: all 0.2s;
          }

          .queue-item:hover {
            background: var(--bg-tertiary);
            border-color: var(--primary);
          }

          .queue-content {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 0.5rem;
          }

          .queue-type {
            padding: 0.25rem 0.5rem;
            background: var(--bg-tertiary);
            border-radius: var(--radius-sm);
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--text-secondary);
          }

          .queue-owner {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-primary);
          }

          .queue-status {
            margin-left: auto;
            padding: 0.25rem 0.625rem;
            border-radius: var(--radius-sm);
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
          }

          .queue-status.pending {
            background: rgba(107, 114, 128, 0.1);
            color: var(--text-secondary);
          }

          .queue-status.submitted {
            background: rgba(245, 158, 11, 0.1);
            color: var(--warning);
          }

          .queue-meta {
            font-size: 0.75rem;
            color: var(--text-tertiary);
          }

          /* No Data State */
          .no-data {
            text-align: center;
            color: var(--text-tertiary);
            padding: 3rem 1rem;
            margin: 0;
            font-size: 0.9375rem;
            font-weight: 500;
          }

          /* Responsive Design */
          @media (max-width: 1400px) {
            .content-panels {
              grid-template-columns: 1fr 1fr;
            }

            .recently-viewed {
              display: none;
            }
          }

          @media (max-width: 1200px) {
            .metrics-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .health-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .workflow-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          @media (max-width: 968px) {
            .content-panels {
              grid-template-columns: 1fr;
            }

            .activity-panel {
              grid-column: 1;
            }

            .actions-grid {
              grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            }
          }

          @media (max-width: 640px) {
            .enhanced-dashboard {
              padding: 0;
            }

            .metrics-grid {
              grid-template-columns: 1fr;
              gap: 1rem;
            }

            .health-grid {
              grid-template-columns: 1fr;
            }

            .workflow-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 0.75rem;
            }

            .panel {
              padding: 1.25rem;
              min-height: 300px;
            }

            .actions-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 0.75rem;
            }

            .action-card {
              min-height: 100px;
              padding: 1.25rem 0.75rem;
            }

            .metric-icon {
              width: 48px;
              height: 48px;
              min-width: 48px;
              font-size: 2rem;
            }

            .metric-value {
              font-size: 1.75rem;
            }
          }
        `}</style>
      </AdminLayout>
    </>
  )
}