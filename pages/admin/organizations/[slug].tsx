import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'

interface OrganizationForm {
  name: string
  slug: string
  type: string
  description: string
  website: string
  headquarters: string
  founded: string
}

export default function EditOrganization() {
  const router = useRouter()
  const { slug } = router.query
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<OrganizationForm>({
    name: '',
    slug: '',
    type: 'CORPORATION',
    description: '',
    website: '',
    headquarters: '',
    founded: ''
  })

  useEffect(() => {
    if (slug) {
      fetchOrganization()
    }
  }, [slug])

  const fetchOrganization = async () => {
    try {
      const response = await fetch(`/api/admin/organizations/${slug}`)
      if (response.ok) {
        const data = await response.json()
        const org = data.organization

        setFormData({
          name: org.name || '',
          slug: org.slug || '',
          type: org.type || 'CORPORATION',
          description: org.description || '',
          website: org.website || '',
          headquarters: org.headquarters || '',
          founded: org.founded ? org.founded.split('T')[0] : ''
        })
      } else {
        setError('Organization not found')
      }
    } catch (err) {
      setError('Failed to load organization')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/organizations/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          type: formData.type,
          description: formData.description || undefined,
          website: formData.website || undefined,
          headquarters: formData.headquarters || undefined,
          founded: formData.founded || undefined
        })
      })

      if (response.ok) {
        router.push('/admin/organizations')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update organization')
      }
    } catch (err) {
      setError('An error occurred while updating the organization')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/organizations/${slug}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/admin/organizations')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete organization')
      }
    } catch (err) {
      setError('An error occurred while deleting the organization')
    }
  }

  const organizationTypes = [
    { value: 'CORPORATION', label: 'Corporation' },
    { value: 'NON_PROFIT', label: 'Non-Profit' },
    { value: 'GOVERNMENT', label: 'Government' },
    { value: 'MEDIA', label: 'Media' },
    { value: 'EDUCATIONAL', label: 'Educational' },
    { value: 'POLITICAL', label: 'Political' },
    { value: 'RELIGIOUS', label: 'Religious' },
    { value: 'ADVOCACY', label: 'Advocacy' },
    { value: 'THINK_TANK', label: 'Think Tank' },
    { value: 'OTHER', label: 'Other' }
  ]

  if (loading) {
    return (
      <AdminLayout title="Edit Organization">
        <div className="loading">Loading organization...</div>
      </AdminLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Edit Organization - Admin - The Words Record</title>
      </Head>

      <AdminLayout title="Edit Organization">
        <div className="admin-page">
          <div className="page-header">
            <div>
              <h1>Edit Organization</h1>
              <p className="page-subtitle">Update organization profile</p>
            </div>
            <div className="header-actions">
              <button onClick={handleDelete} className="btn-danger">
                Delete
              </button>
              <button onClick={() => router.push('/admin/organizations')} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-container">
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Basic Information</h3>

                <div className="form-group">
                  <label>Organization Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
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
                  <label>Organization Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    {organizationTypes.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Brief description of the organization..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Founded Date</label>
                    <input
                      type="date"
                      name="founded"
                      value={formData.founded}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Headquarters</label>
                  <input
                    type="text"
                    name="headquarters"
                    value={formData.headquarters}
                    onChange={handleChange}
                    placeholder="e.g., New York, NY, USA"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => router.push('/admin/organizations')}
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
