import { useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'

interface SourceForm {
  title: string
  url: string
  publication: string
  author: string
  publishDate: string
  sourceType: string
  credibilityLevel: string
}

export default function NewSource() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<SourceForm>({
    title: '',
    url: '',
    publication: '',
    author: '',
    publishDate: '',
    sourceType: 'NEWS_ARTICLE',
    credibilityLevel: 'UNKNOWN'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          url: formData.url || undefined,
          publication: formData.publication || undefined,
          author: formData.author || undefined,
          publishDate: formData.publishDate || undefined,
          sourceType: formData.sourceType,
          credibilityLevel: formData.credibilityLevel
        })
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/sources/${data.source.id}`)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create source')
      }
    } catch (err) {
      setError('An error occurred while creating the source')
    } finally {
      setLoading(false)
    }
  }

  const sourceTypes = [
    { value: 'NEWS_ARTICLE', label: 'News Article' },
    { value: 'REPORT', label: 'Report' },
    { value: 'PRESS_RELEASE', label: 'Press Release' },
    { value: 'INTERVIEW', label: 'Interview' },
    { value: 'SOCIAL_MEDIA', label: 'Social Media' },
    { value: 'VIDEO', label: 'Video' },
    { value: 'AUDIO', label: 'Audio/Podcast' },
    { value: 'BOOK', label: 'Book' },
    { value: 'ACADEMIC_PAPER', label: 'Academic Paper' },
    { value: 'COURT_DOCUMENT', label: 'Court Document' },
    { value: 'GOVERNMENT_DOCUMENT', label: 'Government Document' },
    { value: 'OTHER', label: 'Other' }
  ]

  const credibilityLevels = [
    { value: 'UNKNOWN', label: 'Unknown' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
    { value: 'VERY_LOW', label: 'Very Low' }
  ]

  return (
    <>
      <Head>
        <title>Add Source - Admin - The Words Record</title>
      </Head>

      <AdminLayout title="Add Source">
        <div className="admin-page">
          <div className="page-header">
            <div>
              <h1>Add New Source</h1>
              <p className="page-subtitle">Create a new source reference</p>
            </div>
            <button onClick={() => router.push('/admin/sources')} className="btn-secondary">
              Cancel
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-container">
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Source Information</h3>

                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Article headline or document title"
                  />
                </div>

                <div className="form-group">
                  <label>URL</label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    placeholder="https://example.com/article"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Publication / Publisher</label>
                    <input
                      type="text"
                      name="publication"
                      value={formData.publication}
                      onChange={handleChange}
                      placeholder="e.g., The New York Times"
                    />
                  </div>

                  <div className="form-group">
                    <label>Author</label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      placeholder="e.g., John Smith"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Publish Date</label>
                    <input
                      type="date"
                      name="publishDate"
                      value={formData.publishDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Source Type *</label>
                    <select
                      name="sourceType"
                      value={formData.sourceType}
                      onChange={handleChange}
                      required
                    >
                      {sourceTypes.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Credibility Level</label>
                  <select
                    name="credibilityLevel"
                    value={formData.credibilityLevel}
                    onChange={handleChange}
                  >
                    {credibilityLevels.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <small>Assessment of source reliability and trustworthiness</small>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => router.push('/admin/sources')}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Source'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <style jsx>{`
          .admin-page {
            max-width: 900px;
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

          .btn-primary:hover:not(:disabled) {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }

          .btn-primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
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

          .btn-secondary:hover:not(:disabled) {
            background: #f8fafc;
            border-color: #94a3b8;
          }

          .btn-secondary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
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

          .form-container {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid #f3f4f6;
          }

          .form-section {
            margin-bottom: 2.5rem;
          }

          .form-section:last-of-type {
            margin-bottom: 0;
          }

          .form-section h3 {
            margin: 0 0 1.5rem 0;
            font-size: 1.125rem;
            font-weight: 700;
            color: #0f172a;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid #e5e7eb;
          }

          .form-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 1.5rem;
          }

          .form-group {
            margin-bottom: 1.5rem;
          }

          .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #0f172a;
          }

          .form-group input,
          .form-group select {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 0.9375rem;
            transition: all 0.2s;
            box-sizing: border-box;
          }

          .form-group input:focus,
          .form-group select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .form-group small {
            display: block;
            margin-top: 0.25rem;
            font-size: 0.8125rem;
            color: #64748b;
          }

          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e5e7eb;
          }

          @media (max-width: 768px) {
            .page-header {
              flex-direction: column;
              gap: 1rem;
            }

            .form-container {
              padding: 1.5rem;
            }

            .form-row {
              grid-template-columns: 1fr;
            }

            .form-actions {
              flex-direction: column-reverse;
            }

            .form-actions button {
              width: 100%;
            }
          }
        `}</style>
      </AdminLayout>
    </>
  )
}
