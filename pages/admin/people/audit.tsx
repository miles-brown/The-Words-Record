import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'
import { getFieldLabel, getCategoryLabel } from '@/lib/admin/personAudit'
import { QuickFixModal } from '@/components/admin/QuickFixModal'

interface AuditData {
  summary: {
    totalPeople: number
    peopleWithIssues: number
    peopleComplete: number
    completenessPercentage: number
    totalIssues: number
    issuesByPriority: {
      high: number
      medium: number
      low: number
    }
    generatedAt: string
  }
  issuesByField: Record<string, {
    missing: number
    placeholder: number
    emptyArray: number
    total: number
    priority: 'high' | 'medium' | 'low'
    category: string
    affectedPeople: string[]
  }>
  issuesByPerson: Record<string, {
    personSlug: string
    personName: string
    totalIssues: number
    highPriorityIssues: number
    mediumPriorityIssues: number
    completenessPercentage: number
    missingFields: string[]
  }>
}

export default function PeopleAudit() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [auditData, setAuditData] = useState<AuditData | null>(null)
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'total' | 'missing' | 'placeholder'>('total')
  const [viewMode, setViewMode] = useState<'by-field' | 'by-person'>('by-field')
  const [searchQuery, setSearchQuery] = useState('')
  const [quickFixPerson, setQuickFixPerson] = useState<{ slug: string, name: string, fields: string[] } | null>(null)

  useEffect(() => {
    fetchAudit()
  }, [filterPriority, filterCategory])

  const fetchAudit = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterPriority !== 'all') params.append('priority', filterPriority)
      if (filterCategory !== 'all') params.append('category', filterCategory)

      const response = await fetch(`/api/admin/people/audit?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAuditData(data)
      } else {
        setError('Failed to load audit data')
      }
    } catch (err) {
      setError('Failed to load audit data')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!auditData) return

    const rows: string[][] = [['Field', 'Missing', 'Placeholder', 'Empty Array', 'Total', 'Priority', 'Category', 'Affected People']]

    Object.entries(auditData.issuesByField).forEach(([field, data]) => {
      rows.push([
        getFieldLabel(field),
        data.missing.toString(),
        data.placeholder.toString(),
        data.emptyArray.toString(),
        data.total.toString(),
        data.priority,
        getCategoryLabel(data.category),
        data.affectedPeople.length.toString()
      ])
    })

    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `people-audit-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getFieldEntries = () => {
    if (!auditData) return []

    let entries = Object.entries(auditData.issuesByField)

    // Sort
    entries.sort((a, b) => {
      if (sortBy === 'total') return b[1].total - a[1].total
      if (sortBy === 'missing') return b[1].missing - a[1].missing
      if (sortBy === 'placeholder') return b[1].placeholder - a[1].placeholder
      return 0
    })

    // Filter by search
    if (searchQuery) {
      entries = entries.filter(([field]) =>
        getFieldLabel(field).toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return entries
  }

  const getPersonEntries = () => {
    if (!auditData) return []

    let entries = Object.entries(auditData.issuesByPerson)

    // Filter out people with no issues
    entries = entries.filter(([_, person]) => person.totalIssues > 0)

    // Sort by completeness percentage (ascending)
    entries.sort((a, b) => a[1].completenessPercentage - b[1].completenessPercentage)

    // Filter by search
    if (searchQuery) {
      entries = entries.filter(([_, person]) =>
        person.personName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return entries
  }

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'priority-high'
    if (priority === 'medium') return 'priority-medium'
    return 'priority-low'
  }

  const getCompletenessColor = (percentage: number) => {
    if (percentage >= 90) return 'completeness-excellent'
    if (percentage >= 70) return 'completeness-good'
    if (percentage >= 50) return 'completeness-fair'
    return 'completeness-poor'
  }

  if (loading) {
    return (
      <AdminLayout title="Data Audit">
        <div className="loading">
          <div className="spinner"></div>
          <p>Analyzing data completeness...</p>
        </div>
        <style jsx>{`
          .loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem;
            color: #64748b;
          }
          .spinner {
            width: 3rem;
            height: 3rem;
            border: 3px solid #e5e7eb;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 1rem;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </AdminLayout>
    )
  }

  if (error || !auditData) {
    return (
      <AdminLayout title="Data Audit">
        <div className="error-state">
          <h2>Failed to Load Audit</h2>
          <p>{error}</p>
          <button onClick={fetchAudit} className="btn-primary">Retry</button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Data Audit & Completeness - Admin - The Words Record</title>
      </Head>

      <AdminLayout title="Data Audit">
        <div className="audit-page">
          {/* Header */}
          <div className="page-header">
            <div>
              <h1>Data Audit & Completeness</h1>
              <p className="subtitle">
                Identify missing fields and improve data quality
              </p>
            </div>
            <div className="header-actions">
              <button onClick={exportToCSV} className="btn-secondary">
                📥 Export CSV
              </button>
              <button onClick={fetchAudit} className="btn-secondary">
                🔄 Refresh
              </button>
              <button onClick={() => router.push('/admin/people')} className="btn-secondary">
                ← Back to List
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="summary-grid">
            <div className="summary-card">
              <div className="card-icon">👥</div>
              <div className="card-content">
                <div className="card-label">Total People</div>
                <div className="card-value">{auditData.summary.totalPeople}</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">✅</div>
              <div className="card-content">
                <div className="card-label">Complete Records</div>
                <div className="card-value">{auditData.summary.peopleComplete}</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">⚠️</div>
              <div className="card-content">
                <div className="card-label">With Issues</div>
                <div className="card-value">{auditData.summary.peopleWithIssues}</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <div className="card-label">Avg Completeness</div>
                <div className="card-value">{auditData.summary.completenessPercentage}%</div>
              </div>
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="priority-breakdown">
            <h3>Issues by Priority</h3>
            <div className="priority-bars">
              <div className="priority-bar priority-high">
                <span className="bar-label">High Priority</span>
                <div className="bar-fill" style={{ width: `${(auditData.summary.issuesByPriority.high / auditData.summary.totalIssues) * 100}%` }}></div>
                <span className="bar-count">{auditData.summary.issuesByPriority.high}</span>
              </div>
              <div className="priority-bar priority-medium">
                <span className="bar-label">Medium Priority</span>
                <div className="bar-fill" style={{ width: `${(auditData.summary.issuesByPriority.medium / auditData.summary.totalIssues) * 100}%` }}></div>
                <span className="bar-count">{auditData.summary.issuesByPriority.medium}</span>
              </div>
              <div className="priority-bar priority-low">
                <span className="bar-label">Low Priority</span>
                <div className="bar-fill" style={{ width: `${(auditData.summary.issuesByPriority.low / auditData.summary.totalIssues) * 100}%` }}></div>
                <span className="bar-count">{auditData.summary.issuesByPriority.low}</span>
              </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="controls-section">
            <div className="view-mode-toggle">
              <button
                onClick={() => setViewMode('by-field')}
                className={`toggle-btn ${viewMode === 'by-field' ? 'active' : ''}`}
              >
                By Field
              </button>
              <button
                onClick={() => setViewMode('by-person')}
                className={`toggle-btn ${viewMode === 'by-person' ? 'active' : ''}`}
              >
                By Person
              </button>
            </div>

            <div className="filters">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />

              {viewMode === 'by-field' && (
                <>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="filter-select"
                  >
                    <option value="total">Sort by Total</option>
                    <option value="missing">Sort by Missing</option>
                    <option value="placeholder">Sort by Placeholder</option>
                  </select>
                </>
              )}
            </div>
          </div>

          {/* Data Table */}
          {viewMode === 'by-field' ? (
            <div className="content-card">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th className="text-center">Missing</th>
                    <th className="text-center">Placeholder</th>
                    <th className="text-center">Empty Array</th>
                    <th className="text-center">Total Issues</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFieldEntries().map(([field, data]) => (
                    <tr key={field}>
                      <td className="font-semibold">{getFieldLabel(field)}</td>
                      <td><span className="category-badge">{getCategoryLabel(data.category)}</span></td>
                      <td><span className={`priority-badge ${getPriorityColor(data.priority)}`}>{data.priority}</span></td>
                      <td className="text-center">{data.missing}</td>
                      <td className="text-center">{data.placeholder}</td>
                      <td className="text-center">{data.emptyArray}</td>
                      <td className="text-center font-semibold">{data.total}</td>
                      <td>
                        <button
                          onClick={() => router.push(`/admin/people?missing=${field}`)}
                          className="btn-sm"
                        >
                          View Records
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="content-card">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Person</th>
                    <th className="text-center">Completeness</th>
                    <th className="text-center">Total Issues</th>
                    <th className="text-center">High Priority</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getPersonEntries().map(([id, person]) => (
                    <tr key={id}>
                      <td className="font-semibold">{person.personName}</td>
                      <td className="text-center">
                        <div className="completeness-indicator">
                          <div className={`completeness-bar ${getCompletenessColor(person.completenessPercentage)}`}>
                            <div className="bar-fill" style={{ width: `${person.completenessPercentage}%` }}></div>
                          </div>
                          <span className="completeness-text">{person.completenessPercentage}%</span>
                        </div>
                      </td>
                      <td className="text-center">{person.totalIssues}</td>
                      <td className="text-center">
                        {person.highPriorityIssues > 0 && (
                          <span className="priority-badge priority-high">{person.highPriorityIssues}</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => setQuickFixPerson({
                              slug: person.personSlug,
                              name: person.personName,
                              fields: person.missingFields || []
                            })}
                            className="btn-sm btn-quick-fix"
                            title="Quick fix missing fields"
                          >
                            ⚡ Quick Fix
                          </button>
                          <button
                            onClick={() => router.push(`/admin/people/${person.personSlug}`)}
                            className="btn-sm"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Quick Fix Modal */}
          {quickFixPerson && (
            <QuickFixModal
              personSlug={quickFixPerson.slug}
              personName={quickFixPerson.name}
              missingFields={quickFixPerson.fields}
              onClose={() => setQuickFixPerson(null)}
              onSave={() => {
                setQuickFixPerson(null)
                fetchAudit() // Refresh audit data
              }}
            />
          )}
        </div>

        <style jsx>{`
          .audit-page {
            max-width: 1400px;
          }

          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }

          .page-header h1 {
            margin: 0 0 0.25rem 0;
            font-size: 1.875rem;
            font-weight: 700;
            color: #0f172a;
          }

          .subtitle {
            margin: 0;
            font-size: 0.9375rem;
            color: #64748b;
          }

          .header-actions {
            display: flex;
            gap: 0.75rem;
          }

          .btn-primary, .btn-secondary {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-primary {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
          }

          .btn-secondary {
            background: white;
            color: #475569;
            border: 1px solid #d1d5db;
          }

          .btn-secondary:hover {
            background: #f8fafc;
            border-color: #94a3b8;
          }

          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .summary-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid #f3f4f6;
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .card-icon {
            font-size: 2.5rem;
          }

          .card-label {
            font-size: 0.875rem;
            color: #64748b;
            margin-bottom: 0.25rem;
          }

          .card-value {
            font-size: 2rem;
            font-weight: 700;
            color: #0f172a;
          }

          .priority-breakdown {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid #f3f4f6;
            margin-bottom: 2rem;
          }

          .priority-breakdown h3 {
            margin: 0 0 1rem 0;
            font-size: 1.125rem;
            font-weight: 700;
            color: #0f172a;
          }

          .priority-bars {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .priority-bar {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .bar-label {
            min-width: 120px;
            font-size: 0.875rem;
            font-weight: 600;
          }

          .bar-fill {
            height: 2rem;
            border-radius: 6px;
            transition: width 0.3s;
          }

          .priority-high .bar-label { color: #dc2626; }
          .priority-high .bar-fill { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }

          .priority-medium .bar-label { color: #ea580c; }
          .priority-medium .bar-fill { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); }

          .priority-low .bar-label { color: #64748b; }
          .priority-low .bar-fill { background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%); }

          .bar-count {
            min-width: 40px;
            text-align: right;
            font-weight: 700;
            color: #0f172a;
          }

          .controls-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
            gap: 1rem;
          }

          .view-mode-toggle {
            display: flex;
            background: white;
            border-radius: 8px;
            padding: 0.25rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }

          .toggle-btn {
            padding: 0.5rem 1rem;
            background: transparent;
            border: none;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 600;
            color: #64748b;
            cursor: pointer;
            transition: all 0.2s;
          }

          .toggle-btn.active {
            background: #3b82f6;
            color: white;
          }

          .filters {
            display: flex;
            gap: 0.75rem;
          }

          .search-input, .filter-select {
            padding: 0.625rem 1rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 0.875rem;
          }

          .search-input {
            min-width: 250px;
          }

          .content-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid #f3f4f6;
          }

          .audit-table {
            width: 100%;
            border-collapse: collapse;
          }

          .audit-table thead {
            background: #f8fafc;
            border-bottom: 2px solid #e5e7eb;
          }

          .audit-table th {
            text-align: left;
            padding: 1rem 1.5rem;
            font-size: 0.8125rem;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .audit-table td {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #f1f5f9;
            font-size: 0.9375rem;
            color: #0f172a;
          }

          .audit-table tbody tr:hover {
            background: #fafbfc;
          }

          .text-center {
            text-align: center;
          }

          .font-semibold {
            font-weight: 600;
          }

          .category-badge {
            display: inline-block;
            padding: 0.25rem 0.625rem;
            background: #e0e7ff;
            color: #4f46e5;
            border-radius: 6px;
            font-size: 0.8125rem;
            font-weight: 500;
          }

          .priority-badge {
            display: inline-block;
            padding: 0.25rem 0.625rem;
            border-radius: 6px;
            font-size: 0.8125rem;
            font-weight: 600;
            text-transform: uppercase;
          }

          .priority-badge.priority-high {
            background: #fee2e2;
            color: #dc2626;
          }

          .priority-badge.priority-medium {
            background: #fed7aa;
            color: #ea580c;
          }

          .priority-badge.priority-low {
            background: #e2e8f0;
            color: #64748b;
          }

          .completeness-indicator {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .completeness-bar {
            flex: 1;
            height: 1.5rem;
            background: #f1f5f9;
            border-radius: 6px;
            overflow: hidden;
          }

          .completeness-bar .bar-fill {
            height: 100%;
            transition: width 0.3s;
          }

          .completeness-excellent .bar-fill { background: #22c55e; }
          .completeness-good .bar-fill { background: #3b82f6; }
          .completeness-fair .bar-fill { background: #f59e0b; }
          .completeness-poor .bar-fill { background: #ef4444; }

          .completeness-text {
            min-width: 45px;
            font-weight: 600;
            font-size: 0.875rem;
          }

          .action-buttons {
            display: flex;
            gap: 0.5rem;
          }

          .btn-sm {
            padding: 0.375rem 0.875rem;
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 0.8125rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            color: #475569;
          }

          .btn-sm:hover {
            background: #f8fafc;
            border-color: #3b82f6;
            color: #3b82f6;
          }

          .btn-quick-fix {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border-color: #10b981;
          }

          .btn-quick-fix:hover {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            border-color: #059669;
            color: white;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
          }

          @media (max-width: 768px) {
            .page-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 1rem;
            }

            .header-actions {
              width: 100%;
              flex-wrap: wrap;
            }

            .controls-section {
              flex-direction: column;
              align-items: stretch;
            }

            .filters {
              flex-direction: column;
            }

            .search-input {
              min-width: 100%;
            }

            .audit-table {
              font-size: 0.875rem;
            }

            .audit-table th,
            .audit-table td {
              padding: 0.75rem 0.5rem;
            }
          }
        `}</style>
      </AdminLayout>
    </>
  )
}
