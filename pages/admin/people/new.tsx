import { useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'

interface PersonForm {
  firstName: string
  middleName: string
  lastName: string
  slug: string
  bio: string
  profession: string
  professionDetail: string
  nationality: string
  birthDate: string
  imageUrl: string
}

export default function NewPerson() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<PersonForm>({
    firstName: '',
    middleName: '',
    lastName: '',
    slug: '',
    bio: '',
    profession: 'OTHER',
    professionDetail: '',
    nationality: '',
    birthDate: '',
    imageUrl: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Auto-generate slug from name if slug field is empty
    if ((name === 'firstName' || name === 'lastName') && !formData.slug) {
      generateSlug()
    }
  }

  const generateSlug = () => {
    const fullName = `${formData.firstName} ${formData.lastName}`.trim()
    if (fullName) {
      const slug = fullName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          middleName: formData.middleName || undefined,
          lastName: formData.lastName,
          fullName: `${formData.firstName} ${formData.middleName || ''} ${formData.lastName}`.trim(),
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          slug: formData.slug,
          bio: formData.bio || undefined,
          profession: formData.profession,
          professionDetail: formData.professionDetail || undefined,
          nationality: formData.nationality || undefined,
          dateOfBirth: formData.birthDate || undefined,
          imageUrl: formData.imageUrl || undefined
        })
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/people/${data.person.slug}`)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create person')
      }
    } catch (err) {
      setError('An error occurred while creating the person')
    } finally {
      setLoading(false)
    }
  }

  const professionOptions = [
    { value: 'POLITICIAN', label: 'Politician' },
    { value: 'JOURNALIST', label: 'Journalist' },
    { value: 'ACTIVIST', label: 'Activist' },
    { value: 'ACADEMIC', label: 'Academic' },
    { value: 'BUSINESS', label: 'Business Leader' },
    { value: 'RELIGIOUS_LEADER', label: 'Religious Leader' },
    { value: 'MILITARY', label: 'Military' },
    { value: 'ARTIST', label: 'Artist' },
    { value: 'ATHLETE', label: 'Athlete' },
    { value: 'ENTERTAINER', label: 'Entertainer' },
    { value: 'SCIENTIST', label: 'Scientist' },
    { value: 'LEGAL', label: 'Legal Professional' },
    { value: 'HEALTHCARE', label: 'Healthcare' },
    { value: 'EDUCATOR', label: 'Educator' },
    { value: 'OTHER', label: 'Other' }
  ]

  return (
    <>
      <Head>
        <title>Add Person - Admin - The Words Record</title>
      </Head>

      <AdminLayout title="Add Person">
        <div className="admin-page">
          <div className="page-header">
            <div>
              <h1>Add New Person</h1>
              <p className="page-subtitle">Create a new person profile</p>
            </div>
            <button onClick={() => router.push('/admin/people')} className="btn-secondary">
              Cancel
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-container">
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Basic Information</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Middle Name</label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
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
                  <label>Biography</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Brief biography..."
                  />
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Professional Information</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Profession *</label>
                    <select
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      required
                    >
                      {professionOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Profession Details</label>
                    <input
                      type="text"
                      name="professionDetail"
                      value={formData.professionDetail}
                      onChange={handleChange}
                      placeholder="e.g., U.S. Senator, CEO, etc."
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nationality</label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      placeholder="e.g., American, British, etc."
                    />
                  </div>

                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => router.push('/admin/people')}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Person'}
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
