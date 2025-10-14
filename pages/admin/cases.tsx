import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { format } from 'date-fns'

interface Case {
  id: string
  slug: string
  title: string
  summary: string
  status: string
  visibility: string
  isRealIncident: boolean
  caseDate: string
  createdAt: string
  updatedAt: string
  _count: {
    statements: number
    sources: number
    people: number
  }
}

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'cases' | 'statements'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCases()
  }, [filter])

  const fetchCases = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter === 'cases') params.set('isRealIncident', 'true')
      if (filter === 'statements') params.set('isRealIncident', 'false')

      const response = await fetch(`/api/admin/cases?${params}`, {
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to fetch cases')

      const data = await response.json()
      setCases(data.cases)
    } catch (err) {
      setError('Failed to load cases')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleVisibility = async (caseId: string, currentVisibility: string) => {
    const newVisibility = currentVisibility === 'PUBLIC' ? 'ARCHIVED' : 'PUBLIC'

    if (!confirm(`Change visibility to ${newVisibility}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ visibility: newVisibility })
      })

      if (!response.ok) throw new Error('Failed to update case')

      fetchCases()
    } catch (err) {
      alert('Failed to update case visibility')
      console.error(err)
    }
  }

  const filteredCases = cases.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AdminLayout title="Cases Management">
      <div className="cases-page">
        <div className="page-header">
          <div>
            <h2>Cases & Statements</h2>
            <p>Manage multi-statement cases and individual statements</p>
          </div>
          <Link href="/admin/statements">
            <button type="button" className="btn-primary">
              + New Statement
            </button>
          </Link>
        </div>

        <div className="controls">
          <div className="filter-group">
            <button
              type="button"
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({cases.length})
            </button>
            <button
              type="button"
              className={`filter-btn ${filter === 'cases' ? 'active' : ''}`}
              onClick={() => setFilter('cases')}
            >
              Cases Only
            </button>
            <button
              type="button"
              className={`filter-btn ${filter === 'statements' ? 'active' : ''}`}
              onClick={() => setFilter('statements')}
            >
              Statements Only
            </button>
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {loading ? (
          <div className="loading">Loading cases...</div>
        ) : (
          <div className="cases-grid">
            {filteredCases.map((caseItem) => (
              <div key={caseItem.id} className="case-card">
                <div className="card-header">
                  <div className="title-row">
                    <h3>{caseItem.title}</h3>
                    {caseItem.isRealIncident ? (
                      <span className="badge badge-case">CASE</span>
                    ) : (
                      <span className="badge badge-statement">STATEMENT</span>
                    )}
                  </div>
                  <div className="meta-row">
                    <span className="date">
                      {format(new Date(caseItem.caseDate), 'MMM d, yyyy')}
                    </span>
                    <span className={`visibility-badge ${caseItem.visibility.toLowerCase()}`}>
                      {caseItem.visibility}
                    </span>
                  </div>
                </div>

                <p className="summary">{caseItem.summary}</p>

                <div className="stats-row">
                  <div className="stat">
                    <span className="stat-value">{caseItem._count.statements}</span>
                    <span className="stat-label">Statements</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{caseItem._count.sources}</span>
                    <span className="stat-label">Sources</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{caseItem._count.people}</span>
                    <span className="stat-label">People</span>
                  </div>
                </div>

                <div className="card-actions">
                  <Link href={`/${caseItem.isRealIncident ? 'cases' : 'statements'}/${caseItem.slug}`}>
                    <button type="button" className="btn-sm btn-secondary">
                      View
                    </button>
                  </Link>
                  <button
                    type="button"
                    className="btn-sm btn-secondary"
                    onClick={() => toggleVisibility(caseItem.id, caseItem.visibility)}
                  >
                    {caseItem.visibility === 'PUBLIC' ? 'Archive' : 'Publish'}
                  </button>
                </div>
              </div>
            ))}

            {filteredCases.length === 0 && (
              <div className="no-results">
                <p>No cases found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .cases-page {
          max-width: 1400px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .page-header h2 {
          margin: 0 0 0.5rem 0;
          color: #2c3e50;
          font-size: 1.75rem;
        }

        .page-header p {
          margin: 0;
          color: #6c757d;
        }

        .btn-primary {
          background: #3498db;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 500;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: #2980b9;
        }

        .controls {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          gap: 0.5rem;
        }

        .filter-btn {
          background: white;
          border: 1px solid #e0e6ed;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          background: #f8f9fa;
        }

        .filter-btn.active {
          background: #3498db;
          color: white;
          border-color: #3498db;
        }

        .search-box input {
          padding: 0.5rem 1rem;
          border: 1px solid #e0e6ed;
          border-radius: 6px;
          font-size: 0.875rem;
          width: 300px;
        }

        .search-box input:focus {
          outline: none;
          border-color: #3498db;
        }

        .error-message {
          background: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: #6c757d;
        }

        .cases-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .case-card {
          background: white;
          border: 1px solid #e0e6ed;
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: box-shadow 0.2s;
        }

        .case-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .card-header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .case-card h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.125rem;
          line-height: 1.4;
        }

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.688rem;
          font-weight: 700;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .badge-case {
          background: #e3f2fd;
          color: #1976d2;
        }

        .badge-statement {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.813rem;
        }

        .date {
          color: #6c757d;
        }

        .visibility-badge {
          padding: 0.125rem 0.5rem;
          border-radius: 10px;
          font-size: 0.688rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .visibility-badge.public {
          background: #e8f5e9;
          color: #388e3c;
        }

        .visibility-badge.archived {
          background: #fbe9e7;
          color: #d84315;
        }

        .summary {
          color: #6c757d;
          font-size: 0.875rem;
          line-height: 1.6;
          margin: 0;
        }

        .stats-row {
          display: flex;
          gap: 1.5rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e0e6ed;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #2c3e50;
        }

        .stat-label {
          font-size: 0.688rem;
          color: #6c757d;
          text-transform: uppercase;
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-sm {
          flex: 1;
          padding: 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.813rem;
          transition: all 0.2s;
          border: none;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        .no-results {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem;
          color: #6c757d;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
          }

          .controls {
            flex-direction: column;
          }

          .search-box input {
            width: 100%;
          }

          .cases-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AdminLayout>
  )
}
