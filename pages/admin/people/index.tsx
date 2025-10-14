import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'

interface Person {
  id: string
  firstName: string
  lastName: string
  fullName: string
  slug: string
  profession: string | null
  createdAt: string
  _count?: {
    statements: number
  }
}

export default function AdminPeople() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const router = useRouter()

  useEffect(() => {
    fetchPeople()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search])

  const fetchPeople = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '100',
        ...(search && { search })
      })
      const response = await fetch(`/api/admin/people?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPeople(data.people || [])
        setTotal(data.pagination?.total || 0)
        setTotalPages(data.pagination?.totalPages || 1)
      } else {
        setError('Failed to load people')
      }
    } catch (err) {
      setError('Failed to load people')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  return (
    <>
      <Head>
        <title>People - Admin - The Words Record</title>
      </Head>

      <AdminLayout title="People">
        <div className="admin-page">
          <div className="page-header">
            <div>
              <h1>People Management</h1>
              <p className="subtitle">{total} {total === 1 ? 'person' : 'people'} total</p>
            </div>
            <button onClick={() => router.push('/admin/people/new')} className="btn-primary">
              <span>➕</span> Add Person
            </button>
          </div>

          <div className="search-bar">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">Search</button>
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setSearchInput('')
                    setPage(1)
                  }}
                  className="clear-btn"
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Loading people...</div>
          ) : people.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <h3>No people found</h3>
              <p>{search ? 'Try adjusting your search criteria.' : 'Start by adding your first person to the database.'}</p>
              {!search && (
                <button onClick={() => router.push('/admin/people/new')} className="btn-primary">
                  Add Person
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="content-card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Profession</th>
                      <th>Statements</th>
                      <th>Slug</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {people.map((person) => (
                      <tr key={person.id}>
                        <td className="font-semibold">{person.fullName || `${person.firstName} ${person.lastName}`}</td>
                        <td>{person.profession || '—'}</td>
                        <td>{person._count?.statements || 0}</td>
                        <td><code>{person.slug}</code></td>
                        <td>{new Date(person.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={() => router.push(`/admin/people/${person.slug}`)}
                            className="btn-sm"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="pagination-btn"
                  >
                    ← Previous
                  </button>
                  <span className="pagination-info">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="pagination-btn"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <style jsx>{`
          .admin-page {
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

          .search-bar {
            margin-bottom: 1.5rem;
          }

          .search-bar form {
            display: flex;
            gap: 0.75rem;
          }

          .search-input {
            flex: 1;
            max-width: 400px;
            padding: 0.75rem 1rem;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 0.9375rem;
            transition: border-color 0.2s;
          }

          .search-input:focus {
            outline: none;
            border-color: #3b82f6;
          }

          .search-btn, .clear-btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .search-btn {
            background: #3b82f6;
            color: white;
          }

          .search-btn:hover {
            background: #2563eb;
          }

          .clear-btn {
            background: #f3f4f6;
            color: #64748b;
          }

          .clear-btn:hover {
            background: #e5e7eb;
          }

          .btn-primary {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .btn-primary:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }

          .content-card {
            background: white;
            border-radius: 12px;
            padding: 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid #f3f4f6;
            overflow: hidden;
            margin-bottom: 1.5rem;
          }

          .data-table {
            width: 100%;
            border-collapse: collapse;
          }

          .data-table thead {
            background: #f8fafc;
            border-bottom: 2px solid #e5e7eb;
          }

          .data-table th {
            text-align: left;
            padding: 1rem 1.5rem;
            font-size: 0.8125rem;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .data-table td {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #f1f5f9;
            font-size: 0.9375rem;
            color: #0f172a;
          }

          .data-table tbody tr:hover {
            background: #fafbfc;
          }

          .data-table tbody tr:last-child td {
            border-bottom: none;
          }

          .font-semibold {
            font-weight: 600;
          }

          code {
            background: #f1f5f9;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.875rem;
            font-family: 'Monaco', 'Courier New', monospace;
            color: #64748b;
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

          .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem;
            padding: 1.5rem;
          }

          .pagination-btn {
            padding: 0.625rem 1.25rem;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            color: #475569;
          }

          .pagination-btn:hover:not(:disabled) {
            background: #f8fafc;
            border-color: #3b82f6;
            color: #3b82f6;
          }

          .pagination-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .pagination-info {
            font-size: 0.9375rem;
            color: #64748b;
            font-weight: 500;
          }

          .empty-state {
            background: white;
            border-radius: 12px;
            padding: 4rem 2rem;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid #f3f4f6;
          }

          .empty-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }

          .empty-state h3 {
            margin: 0 0 0.5rem 0;
            font-size: 1.5rem;
            font-weight: 700;
            color: #0f172a;
          }

          .empty-state p {
            margin: 0 0 2rem 0;
            color: #64748b;
            font-size: 1rem;
          }

          .loading {
            text-align: center;
            padding: 3rem;
            color: #64748b;
          }

          .error-message {
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #991b1b;
            padding: 1rem 1.25rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            font-weight: 500;
          }
        `}</style>
      </AdminLayout>
    </>
  )
}
