import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'
import { TabbedFormSection } from '@/components/admin/forms/TabbedFormSection'

export default function EditPersonNew() {
  const router = useRouter()
  const { slug } = router.query
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (slug) {
      fetchPerson()
    }
  }, [slug])

  const fetchPerson = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/people/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setFormData(data.person)
      } else {
        setError('Person not found')
      }
    } catch (err) {
      setError('Failed to load person')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    // Clear success message on any change
    if (success) {
      setSuccess(null)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!formData.slug?.trim()) {
      newErrors.slug = 'URL slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.publicEmail && !emailRegex.test(formData.publicEmail)) {
      newErrors.publicEmail = 'Invalid email format'
    }
    if (formData.agentEmail && !emailRegex.test(formData.agentEmail)) {
      newErrors.agentEmail = 'Invalid email format'
    }

    // URL validation
    const urlRegex = /^https?:\/\/.+/
    if (formData.imageUrl && !urlRegex.test(formData.imageUrl)) {
      newErrors.imageUrl = 'Must be a valid URL starting with http:// or https://'
    }
    if (formData.officialWebsite && !urlRegex.test(formData.officialWebsite)) {
      newErrors.officialWebsite = 'Must be a valid URL starting with http:// or https://'
    }
    if (formData.wikipediaUrl && !urlRegex.test(formData.wikipediaUrl)) {
      newErrors.wikipediaUrl = 'Must be a valid URL starting with http:// or https://'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const prepareDataForSubmit = (data: any) => {
    const prepared: any = {}

    // Copy all fields
    Object.keys(data).forEach(key => {
      const value = data[key]

      // Skip null, undefined, empty strings, and empty arrays
      if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        prepared[key] = undefined
        return
      }

      // Handle dates
      if (key.includes('Date') && typeof value === 'string') {
        prepared[key] = value
      }
      // Handle numbers
      else if (typeof value === 'number') {
        prepared[key] = value
      }
      // Handle booleans
      else if (typeof value === 'boolean') {
        prepared[key] = value
      }
      // Handle arrays
      else if (Array.isArray(value)) {
        prepared[key] = value
      }
      // Handle strings
      else {
        prepared[key] = value
      }
    })

    // Compute fullName from parts
    const parts = [
      prepared.namePrefix,
      prepared.firstName,
      prepared.middleName,
      prepared.lastName,
      prepared.nameSuffix
    ].filter(Boolean)
    prepared.fullName = parts.join(' ')

    // Compute name (legacy) from first + last
    prepared.name = [prepared.firstName, prepared.lastName].filter(Boolean).join(' ')

    return prepared
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setError('Please fix the errors in the form')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const submitData = prepareDataForSubmit(formData)

      const response = await fetch(`/api/admin/people/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        setSuccess('Changes saved successfully!')
        // Refresh data
        await fetchPerson()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update person')
      }
    } catch (err) {
      setError('An error occurred while updating the person')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this person? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/people/${slug}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/admin/people')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete person')
      }
    } catch (err) {
      setError('An error occurred while deleting the person')
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Edit Person">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading person...</p>
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

  return (
    <>
      <Head>
        <title>Edit Person - Admin - The Words Record</title>
      </Head>

      <AdminLayout title="Edit Person">
        <div className="admin-page">
          <div className="page-header">
            <div>
              <h1>Edit Person</h1>
              <p className="page-subtitle">
                {formData.fullName || formData.name || 'Update person profile'}
              </p>
            </div>
            <div className="header-actions">
              <button onClick={handleDelete} className="btn-danger">
                Delete
              </button>
              <button onClick={() => router.push('/admin/people')} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => window.open(`/people/${slug}`, '_blank')}
                className="btn-secondary"
              >
                View Public Page
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <TabbedFormSection
              formData={formData}
              onChange={handleChange}
              errors={errors}
            />

            <div className="form-actions">
              <button
                type="button"
                onClick={() => router.push('/admin/people')}
                className="btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-sm"></span>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
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
            display: flex;
            align-items: center;
            gap: 0.5rem;
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

          .alert {
            padding: 1rem 1.25rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 500;
          }

          .alert-error {
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #991b1b;
          }

          .alert-success {
            background: #d1fae5;
            border: 1px solid #a7f3d0;
            color: #065f46;
          }

          .alert-icon {
            font-size: 1.25rem;
          }

          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            padding-top: 2rem;
          }

          .spinner-sm {
            display: inline-block;
            width: 1rem;
            height: 1rem;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          @media (max-width: 768px) {
            .page-header {
              flex-direction: column;
              gap: 1rem;
            }

            .header-actions {
              width: 100%;
              flex-wrap: wrap;
            }

            .header-actions button {
              flex: 1;
              min-width: 120px;
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
