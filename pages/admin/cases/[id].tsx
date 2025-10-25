import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'

interface CaseForm {
  title: string
  slug: string
  summary: string
  description: string
  caseDate: string
  status: string
  severity: string
  visibility: string
  locationCity: string
  locationState: string
  locationCountry: string
  isRealIncident: boolean
}

export default function EditCase() {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [enriching, setEnriching] = useState(false)
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enrichmentSuccess, setEnrichmentSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<CaseForm>({
    title: '',
    slug: '',
    summary: '',
    description: '',
    caseDate: '',
    status: 'DOCUMENTED',
    severity: 'MEDIUM',
    visibility: 'DRAFT',
    locationCity: '',
    locationState: '',
    locationCountry: '',
    isRealIncident: true
  })

  useEffect(() => {
    if (id) {
      fetchCase()
    }
  }, [id])

  const fetchCase = async () => {
    try {
      const response = await fetch(`/api/admin/cases/${id}`, { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        const caseData = data.case

        setFormData({
          title: caseData.title || '',
          slug: caseData.slug || '',
          summary: caseData.summary || '',
          description: caseData.description || '',
          caseDate: caseData.caseDate ? caseData.caseDate.split('T')[0] : '',
          status: caseData.status || 'DOCUMENTED',
          severity: caseData.severity || 'MEDIUM',
          visibility: caseData.visibility || 'DRAFT',
          locationCity: caseData.locationCity || '',
          locationState: caseData.locationState || '',
          locationCountry: caseData.locationCountry || '',
          isRealIncident: caseData.isRealIncident !== undefined ? caseData.isRealIncident : true
        })
      } else {
        setError('Case not found')
      }
    } catch (err) {
      setError('Failed to load case')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/cases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          summary: formData.summary,
          description: formData.description,
          caseDate: new Date(formData.caseDate).toISOString(),
          status: formData.status,
          severity: formData.severity || undefined,
          visibility: formData.visibility,
          locationCity: formData.locationCity || undefined,
          locationState: formData.locationState || undefined,
          locationCountry: formData.locationCountry || undefined,
          isRealIncident: formData.isRealIncident
        })
      })

      if (response.ok) {
        router.push('/admin/cases')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update case')
      }
    } catch (err) {
      setError('An error occurred while updating the case')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/cases/${id}`, {
        credentials: 'include',
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/admin/cases')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete case')
      }
    } catch (err) {
      setError('An error occurred while deleting the case')
    }
  }

  const handleEnrich = async (force = false) => {
    const timeEstimate = webSearchEnabled ? '30-60 seconds' : '10-30 seconds'
    const confirmMessage = force
      ? `This case already has documentation. Re-enrich with AI${webSearchEnabled ? ' (with web search)' : ''}? This may take ${timeEstimate}.`
      : `Generate comprehensive Wikipedia-style documentation using AI${webSearchEnabled ? ' with web search' : ''}? This may take ${timeEstimate}.`

    if (!confirm(confirmMessage)) {
      return
    }

    setEnriching(true)
    setError(null)
    setEnrichmentSuccess(null)

    try {
      const response = await fetch('/api/admin/cases/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ caseId: id, force, webSearch: webSearchEnabled })
      })

      const data = await response.json()

      if (response.ok) {
        // Update form with enriched content
        setFormData(prev => ({
          ...prev,
          summary: data.case.summary || prev.summary,
          description: data.case.description || prev.description
        }))

        setEnrichmentSuccess(
          `✓ AI enrichment completed! Generated ${data.enrichmentMetadata.summaryLength} char summary ` +
          `and ${data.enrichmentMetadata.descriptionLength} char description using ` +
          `${data.enrichmentMetadata.sourcesUsed} sources, ${data.enrichmentMetadata.responsesAnalyzed} responses, ` +
          `and ${data.enrichmentMetadata.repercussionsAnalyzed} repercussions.`
        )

        // Scroll to description field
        setTimeout(() => {
          const descriptionElement = document.querySelector('textarea[name="description"]')
          descriptionElement?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      } else {
        setError(data.error || 'Failed to enrich case')
      }
    } catch (err) {
      setError('An error occurred during enrichment')
    } finally {
      setEnriching(false)
    }
  }

  const statusOptions = [
    { value: 'DOCUMENTED', label: 'Documented' },
    { value: 'VERIFIED', label: 'Verified' },
    { value: 'DISPUTED', label: 'Disputed' },
    { value: 'ALLEGED', label: 'Alleged' },
    { value: 'DEVELOPING', label: 'Developing' },
    { value: 'ONGOING', label: 'Ongoing' },
    { value: 'RESOLVED', label: 'Resolved' }
  ]

  const severityOptions = [
    { value: 'MINIMAL', label: 'Minimal' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' }
  ]

  const visibilityOptions = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PUBLIC', label: 'Public' },
    { value: 'PENDING_VERIFICATION', label: 'Pending Verification' },
    { value: 'ARCHIVED', label: 'Archived' }
  ]

  if (loading) {
    return (
      <AdminLayout title="Edit Case">
        <div className="loading">Loading case...</div>
      </AdminLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Edit Case - Admin - The Words Record</title>
      </Head>

      <AdminLayout title="Edit Case">
        <div className="admin-page">
          <div className="page-header">
            <div>
              <h1>Edit Case</h1>
              <p className="page-subtitle">Update case information</p>
            </div>
            <div className="header-actions">
              {formData.isRealIncident && (
                <>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.9rem',
                    marginRight: '12px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={webSearchEnabled}
                      onChange={(e) => setWebSearchEnabled(e.target.checked)}
                      disabled={enriching}
                      style={{ cursor: 'pointer' }}
                    />
                    <span title="Search the web for additional context and sources (requires TAVILY_API_KEY)">
                      🌐 Web Search
                    </span>
                  </label>
                  <button
                    onClick={() => handleEnrich(formData.description.length > 1000)}
                    disabled={enriching}
                    className="btn-primary"
                    title="Generate comprehensive Wikipedia-style documentation using AI"
                    style={{ marginRight: '8px' }}
                  >
                    {enriching ? '🤖 Enriching...' : '✨ AI Enrich'}
                  </button>
                </>
              )}
              <button onClick={handleDelete} className="btn-danger">
                Delete
              </button>
              <button onClick={() => router.push('/admin/cases')} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {enrichmentSuccess && (
            <div className="success-message" style={{
              background: 'var(--success-bg, #d4edda)',
              color: 'var(--success-text, #155724)',
              padding: '1rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              border: '1px solid var(--success-border, #c3e6cb)'
            }}>
              {enrichmentSuccess}
            </div>
          )}

          <div className="form-container">
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Basic Information</h3>

                <div className="form-group">
                  <label>Case Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Response to XYZ Statement"
                  />
                </div>

                <div className="form-group">
                  <label>URL Slug *</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    pattern="[a-z0-9-]+"
                    required
                  />
                  <small>Used in URLs (lowercase letters, numbers, and hyphens only)</small>
                </div>

                <div className="form-group">
                  <label>Summary *</label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    rows={3}
                    required
                    placeholder="Brief summary (2-3 sentences)"
                  />
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={8}
                    required
                    placeholder="Detailed description of the case..."
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Classification</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Case Date *</label>
                    <input
                      type="date"
                      name="caseDate"
                      value={formData.caseDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Severity</label>
                    <select
                      name="severity"
                      value={formData.severity}
                      onChange={handleChange}
                    >
                      {severityOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Visibility *</label>
                    <select
                      name="visibility"
                      value={formData.visibility}
                      onChange={handleChange}
                      required
                    >
                      {visibilityOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isRealIncident"
                      checked={formData.isRealIncident}
                      onChange={handleChange}
                    />
                    <span>This is a real multi-statement case</span>
                  </label>
                  <small>Uncheck if this is an auto-imported statement page</small>
                </div>
              </div>

              <div className="form-section">
                <h3>Location (Optional)</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="locationCity"
                      value={formData.locationCity}
                      onChange={handleChange}
                      placeholder="e.g., Washington"
                    />
                  </div>

                  <div className="form-group">
                    <label>State/Province</label>
                    <input
                      type="text"
                      name="locationState"
                      value={formData.locationState}
                      onChange={handleChange}
                      placeholder="e.g., DC"
                    />
                  </div>

                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="locationCountry"
                      value={formData.locationCountry}
                      onChange={handleChange}
                      placeholder="e.g., United States"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => router.push('/admin/cases')}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
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

          .header-actions {
            display: flex;
            gap: 0.75rem;
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

          .btn-danger {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-danger:hover {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
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
          .form-group textarea,
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
          .form-group textarea:focus,
          .form-group select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .form-group textarea {
            resize: vertical;
          }

          .form-group small {
            display: block;
            margin-top: 0.25rem;
            font-size: 0.8125rem;
            color: #64748b;
          }

          .checkbox-group label {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
          }

          .checkbox-group input[type="checkbox"] {
            width: auto;
            margin: 0;
          }

          .checkbox-group span {
            font-weight: 500;
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

            .header-actions {
              width: 100%;
              justify-content: space-between;
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
