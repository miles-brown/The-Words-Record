import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'

interface UnverifiedSource {
  id: string
  url: string
  title: string | null
  publisher: string | null
  createdAt: string
  _count?: {
    statements: number
  }
}

export default function VerifySources() {
  const [sources, setSources] = useState<UnverifiedSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUnverifiedSources()
  }, [])

  const fetchUnverifiedSources = async () => {
    try {
      const response = await fetch('/api/admin/sources?verified=false')
      if (response.ok) {
        const data = await response.json()
        setSources(data.sources || [])
      } else {
        setError('Failed to load unverified sources')
      }
    } catch (err) {
      setError('Failed to load unverified sources')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (sourceId: string) => {
    setVerifying(sourceId)
    try {
      const response = await fetch(`/api/admin/sources/${sourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: true })
      })

      if (response.ok) {
        setSources(sources.filter(s => s.id !== sourceId))
      } else {
        setError('Failed to verify source')
      }
    } catch (err) {
      setError('Failed to verify source')
    } finally {
      setVerifying(null)
    }
  }

  const handleReject = async (sourceId: string) => {
    if (!confirm('Are you sure you want to delete this source? This action cannot be undone.')) {
      return
    }

    setVerifying(sourceId)
    try {
      const response = await fetch(`/api/admin/sources/${sourceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSources(sources.filter(s => s.id !== sourceId))
      } else {
        setError('Failed to delete source')
      }
    } catch (err) {
      setError('Failed to delete source')
    } finally {
      setVerifying(null)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Verify Sources">
        <div className="loading">Loading unverified sources...</div>
      </AdminLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Verify Sources - Admin - The Words Record</title>
      </Head>

      <AdminLayout title="Verify Sources">
        <div className="admin-page">
          <div className="page-header">
            <div>
              <h1>Verify Sources</h1>
              <p className="page-subtitle">Review and verify unverified sources before they appear on the site</p>
            </div>
            <button onClick={() => router.push('/admin/sources')} className="btn-secondary">
              Back to Sources
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {sources.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✓</div>
              <h3>All sources verified!</h3>
              <p>There are no unverified sources at the moment.</p>
              <button onClick={() => router.push('/admin/sources')} className="btn-primary">
                View All Sources
              </button>
            </div>
          ) : (
            <div className="sources-grid">
              {sources.map((source) => (
                <div key={source.id} className="source-card">
                  <div className="source-header">
                    <div className="source-info">
                      <h3>{source.title || 'Untitled Source'}</h3>
                      {source.publisher && <p className="publisher">{source.publisher}</p>}
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="source-url"
                      >
                        {source.url}
                      </a>
                    </div>
                    <div className="source-meta">
                      <span className="meta-item">
                        📅 {new Date(source.createdAt).toLocaleDateString()}
                      </span>
                      {source._count && (
                        <span className="meta-item">
                          💬 {source._count.statements} statement{source._count.statements !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="source-actions">
                    <button
                      onClick={() => handleVerify(source.id)}
                      disabled={verifying === source.id}
                      className="btn-verify"
                    >
                      {verifying === source.id ? 'Verifying...' : '✓ Verify'}
                    </button>
                    <button
                      onClick={() => router.push(`/admin/sources/${source.id}`)}
                      className="btn-edit"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleReject(source.id)}
                      disabled={verifying === source.id}
                      className="btn-reject"
                    >
                      ✕ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <style jsx>{`
          .admin-page {
            max-width: 1200px;
          }

          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 2rem;
          }

          .page-header h1 {
            margin: 0 0 0.5rem 0;
            font-size: 1.875rem;
            font-weight: 700;
            color: #0f172a;
          }

          .page-subtitle {
            margin: 0;
            font-size: 0.9375rem;
            color: #64748b;
          }

          .btn-secondary {
            padding: 0.75rem 1.5rem;
            background: white;
            color: #475569;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-secondary:hover {
            background: #f8fafc;
            border-color: #94a3b8;
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
          }

          .btn-primary:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }

          .sources-grid {
            display: grid;
            gap: 1.5rem;
          }

          .source-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 2px solid #fef3c7;
            transition: all 0.2s;
          }

          .source-card:hover {
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          }

          .source-header {
            margin-bottom: 1.5rem;
          }

          .source-info h3 {
            margin: 0 0 0.5rem 0;
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f172a;
          }

          .publisher {
            margin: 0 0 0.75rem 0;
            font-size: 0.9375rem;
            color: #64748b;
            font-style: italic;
          }

          .source-url {
            display: inline-block;
            color: #3b82f6;
            text-decoration: none;
            font-size: 0.875rem;
            font-family: 'Monaco', 'Courier New', monospace;
            word-break: break-all;
          }

          .source-url:hover {
            text-decoration: underline;
          }

          .source-meta {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
          }

          .meta-item {
            font-size: 0.875rem;
            color: #64748b;
          }

          .source-actions {
            display: flex;
            gap: 0.75rem;
          }

          .btn-verify {
            flex: 1;
            padding: 0.75rem 1.25rem;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-verify:hover:not(:disabled) {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          }

          .btn-verify:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .btn-edit {
            padding: 0.75rem 1.25rem;
            background: white;
            color: #475569;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-edit:hover {
            background: #f8fafc;
            border-color: #3b82f6;
            color: #3b82f6;
          }

          .btn-reject {
            padding: 0.75rem 1.25rem;
            background: white;
            color: #dc2626;
            border: 1px solid #fecaca;
            border-radius: 8px;
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-reject:hover:not(:disabled) {
            background: #fee2e2;
            border-color: #dc2626;
          }

          .btn-reject:disabled {
            opacity: 0.5;
            cursor: not-allowed;
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
            color: #10b981;
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
