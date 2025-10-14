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
  dissolved: string
  legalName: string
  employeeCount: string
  headquartersCity: string
  incorporationCountry: string
  incorporationState: string
  legalStructure: string
  taxStatus: string
  isPersonalBrand: boolean
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
    founded: '',
    dissolved: '',
    legalName: '',
    employeeCount: '',
    headquartersCity: '',
    incorporationCountry: '',
    incorporationState: '',
    legalStructure: '',
    taxStatus: '',
    isPersonalBrand: false
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

        // Handle founded date - extract year or full date
        let foundedValue = ''
        if (org.founded) {
          const foundedDate = new Date(org.founded)
          const year = foundedDate.getFullYear()
          // Check if it's January 1st (likely just a year entry)
          if (foundedDate.getMonth() === 0 && foundedDate.getDate() === 1) {
            foundedValue = year.toString()
          } else {
            foundedValue = org.founded.split('T')[0]
          }
        }

        // Handle dissolved date
        let dissolvedValue = ''
        if (org.dissolved) {
          const dissolvedDate = new Date(org.dissolved)
          const year = dissolvedDate.getFullYear()
          if (dissolvedDate.getMonth() === 0 && dissolvedDate.getDate() === 1) {
            dissolvedValue = year.toString()
          } else {
            dissolvedValue = org.dissolved.split('T')[0]
          }
        }

        setFormData({
          name: org.name || '',
          slug: org.slug || '',
          type: org.type || 'CORPORATION',
          description: org.description || '',
          website: org.website || '',
          headquarters: org.headquarters || '',
          founded: foundedValue,
          dissolved: dissolvedValue,
          legalName: org.legalName || '',
          employeeCount: org.employeeCount ? org.employeeCount.toString() : '',
          headquartersCity: org.headquartersCity || '',
          incorporationCountry: org.incorporationCountry || '',
          incorporationState: org.incorporationState || '',
          legalStructure: org.legalStructure || '',
          taxStatus: org.taxStatus || '',
          isPersonalBrand: org.isPersonalBrand || false
        })
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Failed to fetch organization:', response.status, errorData)
        setError(errorData.error || `Failed to load organization (${response.status})`)
      }
    } catch (err) {
      console.error('Error fetching organization:', err)
      setError(`Failed to load organization: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Process founded date - convert year to full date if needed
      let foundedDate = formData.founded ? formData.founded.trim() : undefined
      if (foundedDate && /^\d{4}$/.test(foundedDate)) {
        // If only year provided, use January 1st of that year
        foundedDate = `${foundedDate}-01-01`
      }

      // Process dissolved date
      let dissolvedDate = formData.dissolved ? formData.dissolved.trim() : undefined
      if (dissolvedDate && /^\d{4}$/.test(dissolvedDate)) {
        dissolvedDate = `${dissolvedDate}-01-01`
      }

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
          founded: foundedDate,
          dissolved: dissolvedDate,
          legalName: formData.legalName || undefined,
          employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : undefined,
          headquartersCity: formData.headquartersCity || undefined,
          incorporationCountry: formData.incorporationCountry || undefined,
          incorporationState: formData.incorporationState || undefined,
          legalStructure: formData.legalStructure || undefined,
          taxStatus: formData.taxStatus || undefined,
          isPersonalBrand: formData.isPersonalBrand
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
                    <label>Founded Year</label>
                    <input
                      type="text"
                      name="founded"
                      value={formData.founded}
                      onChange={handleChange}
                      placeholder="e.g., 1990 or 1990-01-15"
                      pattern="^\d{4}(-\d{2}-\d{2})?$"
                    />
                    <small>Enter year (e.g., 1990) or full date (e.g., 1990-01-15)</small>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Legal Name</label>
                    <input
                      type="text"
                      name="legalName"
                      value={formData.legalName}
                      onChange={handleChange}
                      placeholder="Official legal name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Dissolved Year</label>
                    <input
                      type="text"
                      name="dissolved"
                      value={formData.dissolved}
                      onChange={handleChange}
                      placeholder="e.g., 2020 or 2020-12-31"
                      pattern="^\d{4}(-\d{2}-\d{2})?$"
                    />
                    <small>Leave empty if organization is active</small>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <input
                      type="checkbox"
                      name="isPersonalBrand"
                      checked={formData.isPersonalBrand}
                      onChange={handleChange}
                      style={{width: 'auto', margin: 0}}
                    />
                    Personal Brand (individual-run organization)
                  </label>
                </div>
              </div>

              <div className="form-section">
                <h3>Location Information</h3>

                <div className="form-row">
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

                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="headquartersCity"
                      value={formData.headquartersCity}
                      onChange={handleChange}
                      placeholder="e.g., New York"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Incorporation Country</label>
                    <input
                      type="text"
                      name="incorporationCountry"
                      value={formData.incorporationCountry}
                      onChange={handleChange}
                      placeholder="e.g., United States"
                    />
                  </div>

                  <div className="form-group">
                    <label>Incorporation State/Province</label>
                    <input
                      type="text"
                      name="incorporationState"
                      value={formData.incorporationState}
                      onChange={handleChange}
                      placeholder="e.g., Delaware, CA"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Legal & Financial Information</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Legal Structure</label>
                    <select
                      name="legalStructure"
                      value={formData.legalStructure}
                      onChange={handleChange}
                    >
                      <option value="">Select...</option>
                      <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship</option>
                      <option value="PARTNERSHIP">Partnership</option>
                      <option value="LLC">LLC</option>
                      <option value="CORPORATION">Corporation</option>
                      <option value="C_CORP">C Corporation</option>
                      <option value="S_CORP">S Corporation</option>
                      <option value="B_CORP">B Corporation</option>
                      <option value="NONPROFIT">Non-Profit</option>
                      <option value="COOPERATIVE">Cooperative</option>
                      <option value="TRUST">Trust</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Tax Status</label>
                    <select
                      name="taxStatus"
                      value={formData.taxStatus}
                      onChange={handleChange}
                    >
                      <option value="">Select...</option>
                      <option value="FOR_PROFIT">For-Profit</option>
                      <option value="NONPROFIT_501C3">Non-Profit 501(c)(3)</option>
                      <option value="NONPROFIT_501C4">Non-Profit 501(c)(4)</option>
                      <option value="NONPROFIT_501C6">Non-Profit 501(c)(6)</option>
                      <option value="NONPROFIT_OTHER">Non-Profit (Other)</option>
                      <option value="TAX_EXEMPT">Tax Exempt</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Employee Count</label>
                  <input
                    type="number"
                    name="employeeCount"
                    value={formData.employeeCount}
                    onChange={handleChange}
                    placeholder="e.g., 500"
                    min="0"
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
