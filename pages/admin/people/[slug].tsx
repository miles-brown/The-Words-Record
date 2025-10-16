import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'
import { ChangeHistoryModal } from '@/components/admin/ChangeHistoryModal'

interface PersonForm {
  firstName: string
  middleName: string
  lastName: string
  namePrefix: string
  nameSuffix: string
  slug: string
  bio: string
  shortBio: string
  profession: string
  professionDetail: string
  currentTitle: string
  currentOrganization: string
  nationality: string
  birthDate: string
  deathDate: string
  birthPlace: string
  deathPlace: string
  imageUrl: string
  gender: string
  background: string
  bestKnownFor: string
  politicalParty: string
  politicalBeliefs: string
  religion: string
  religionDenomination: string
  residence: string
  roleDescription: string
  yearsActive: string
  twitterHandle: string
  linkedInUrl: string
  officialWebsite: string
  wikipediaUrl: string
}

export default function EditPerson() {
  const router = useRouter()
  const { slug } = router.query
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [personName, setPersonName] = useState('')
  const [formData, setFormData] = useState<PersonForm>({
    firstName: '',
    middleName: '',
    lastName: '',
    namePrefix: '',
    nameSuffix: '',
    slug: '',
    bio: '',
    shortBio: '',
    profession: 'OTHER',
    professionDetail: '',
    currentTitle: '',
    currentOrganization: '',
    nationality: '',
    birthDate: '',
    deathDate: '',
    birthPlace: '',
    deathPlace: '',
    imageUrl: '',
    gender: '',
    background: '',
    bestKnownFor: '',
    politicalParty: '',
    politicalBeliefs: '',
    religion: '',
    religionDenomination: '',
    residence: '',
    roleDescription: '',
    yearsActive: '',
    twitterHandle: '',
    linkedInUrl: '',
    officialWebsite: '',
    wikipediaUrl: ''
  })

  useEffect(() => {
    if (slug) {
      fetchPerson()
    }
  }, [slug])

  const fetchPerson = async () => {
    try {
      const response = await fetch(`/api/admin/people/${slug}`)
      if (response.ok) {
        const data = await response.json()
        const person = data.person

        setPersonName(person.name || `${person.firstName} ${person.lastName}`)

        setFormData({
          firstName: person.firstName || '',
          middleName: person.middleName || '',
          lastName: person.lastName || '',
          namePrefix: person.namePrefix || '',
          nameSuffix: person.nameSuffix || '',
          slug: person.slug || '',
          bio: person.bio || '',
          shortBio: person.shortBio || '',
          profession: person.profession || 'OTHER',
          professionDetail: person.professionDetail || '',
          currentTitle: person.currentTitle || '',
          currentOrganization: person.currentOrganization || '',
          nationality: person.nationality || '',
          birthDate: (person.birthDate || person.dateOfBirth) ? (person.birthDate || person.dateOfBirth).split('T')[0] : '',
          deathDate: person.deathDate ? person.deathDate.split('T')[0] : '',
          birthPlace: person.birthPlace || '',
          deathPlace: person.deathPlace || '',
          imageUrl: person.imageUrl || '',
          gender: person.gender || '',
          background: person.background || '',
          bestKnownFor: person.bestKnownFor || '',
          politicalParty: person.politicalParty || '',
          politicalBeliefs: person.politicalBeliefs || '',
          religion: person.religion || '',
          religionDenomination: person.religionDenomination || '',
          residence: person.residence || '',
          roleDescription: person.roleDescription || '',
          yearsActive: person.yearsActive || '',
          twitterHandle: person.twitterHandle || '',
          linkedInUrl: person.linkedInUrl || '',
          officialWebsite: person.officialWebsite || '',
          wikipediaUrl: person.wikipediaUrl || ''
        })
      } else {
        setError('Person not found')
      }
    } catch (err) {
      setError('Failed to load person')
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
      const response = await fetch(`/api/admin/people/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          middleName: formData.middleName || undefined,
          lastName: formData.lastName,
          namePrefix: formData.namePrefix || undefined,
          nameSuffix: formData.nameSuffix || undefined,
          fullName: `${formData.namePrefix || ''} ${formData.firstName} ${formData.middleName || ''} ${formData.lastName} ${formData.nameSuffix || ''}`.replace(/\s+/g, ' ').trim(),
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          slug: formData.slug,
          bio: formData.bio || undefined,
          shortBio: formData.shortBio || undefined,
          profession: formData.profession,
          professionDetail: formData.professionDetail || undefined,
          currentTitle: formData.currentTitle || undefined,
          currentOrganization: formData.currentOrganization || undefined,
          nationality: formData.nationality || undefined,
          birthDate: formData.birthDate || undefined,
          deathDate: formData.deathDate || undefined,
          birthPlace: formData.birthPlace || undefined,
          deathPlace: formData.deathPlace || undefined,
          imageUrl: formData.imageUrl || undefined,
          gender: formData.gender || undefined,
          background: formData.background || undefined,
          bestKnownFor: formData.bestKnownFor || undefined,
          politicalParty: formData.politicalParty || undefined,
          politicalBeliefs: formData.politicalBeliefs || undefined,
          religion: formData.religion || undefined,
          religionDenomination: formData.religionDenomination || undefined,
          residence: formData.residence || undefined,
          roleDescription: formData.roleDescription || undefined,
          yearsActive: formData.yearsActive || undefined,
          twitterHandle: formData.twitterHandle || undefined,
          linkedInUrl: formData.linkedInUrl || undefined,
          officialWebsite: formData.officialWebsite || undefined,
          wikipediaUrl: formData.wikipediaUrl || undefined
        })
      })

      if (response.ok) {
        router.push('/admin/people')
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

  if (loading) {
    return (
      <AdminLayout title="Edit Person">
        <div className="loading">Loading person...</div>
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
              <p className="page-subtitle">Update person profile</p>
            </div>
            <div className="header-actions">
              <button onClick={() => setShowHistory(true)} className="btn-history">
                📜 Change History
              </button>
              <button onClick={handleDelete} className="btn-danger">
                Delete
              </button>
              <button onClick={() => router.push('/admin/people')} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>

          {showHistory && (
            <ChangeHistoryModal
              personSlug={slug as string}
              personName={personName}
              onClose={() => setShowHistory(false)}
            />
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="form-container">
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Basic Information</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Name Prefix</label>
                    <input
                      type="text"
                      name="namePrefix"
                      value={formData.namePrefix}
                      onChange={handleChange}
                      placeholder="Dr., Mr., Ms., etc."
                    />
                  </div>

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
                </div>

                <div className="form-row">
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

                  <div className="form-group">
                    <label>Name Suffix</label>
                    <input
                      type="text"
                      name="nameSuffix"
                      value={formData.nameSuffix}
                      onChange={handleChange}
                      placeholder="Jr., Sr., III, PhD, etc."
                    />
                  </div>

                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">Select...</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="NON_BINARY">Non-Binary</option>
                      <option value="OTHER">Other</option>
                      <option value="PREFER_NOT_TO_SAY">Prefer Not to Say</option>
                    </select>
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
                  <label>Short Bio (max 500 chars)</label>
                  <textarea
                    name="shortBio"
                    value={formData.shortBio}
                    onChange={handleChange}
                    rows={2}
                    maxLength={500}
                    placeholder="Brief one-line description..."
                  />
                  <small>{formData.shortBio.length}/500 characters</small>
                </div>

                <div className="form-group">
                  <label>Full Biography</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Detailed biography..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Best Known For</label>
                    <input
                      type="text"
                      name="bestKnownFor"
                      value={formData.bestKnownFor}
                      onChange={handleChange}
                      placeholder="e.g., Author of..., Former President of..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Background</label>
                    <input
                      type="text"
                      name="background"
                      value={formData.background}
                      onChange={handleChange}
                      placeholder="Brief background summary"
                    />
                  </div>
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
                    <label>Current Title</label>
                    <input
                      type="text"
                      name="currentTitle"
                      value={formData.currentTitle}
                      onChange={handleChange}
                      placeholder="e.g., Chief Executive Officer"
                    />
                  </div>

                  <div className="form-group">
                    <label>Current Organization</label>
                    <input
                      type="text"
                      name="currentOrganization"
                      value={formData.currentOrganization}
                      onChange={handleChange}
                      placeholder="e.g., Acme Corporation"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Role Description</label>
                    <input
                      type="text"
                      name="roleDescription"
                      value={formData.roleDescription}
                      onChange={handleChange}
                      placeholder="Brief description of role"
                    />
                  </div>

                  <div className="form-group">
                    <label>Years Active</label>
                    <input
                      type="text"
                      name="yearsActive"
                      value={formData.yearsActive}
                      onChange={handleChange}
                      placeholder="e.g., 2005-present, 1990-2020"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Personal Information</h3>

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
                    <label>Residence</label>
                    <input
                      type="text"
                      name="residence"
                      value={formData.residence}
                      onChange={handleChange}
                      placeholder="e.g., New York, NY"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Birth Place</label>
                    <input
                      type="text"
                      name="birthPlace"
                      value={formData.birthPlace}
                      onChange={handleChange}
                      placeholder="e.g., Boston, MA, USA"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Date of Death</label>
                    <input
                      type="date"
                      name="deathDate"
                      value={formData.deathDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Death Place</label>
                    <input
                      type="text"
                      name="deathPlace"
                      value={formData.deathPlace}
                      onChange={handleChange}
                      placeholder="e.g., Los Angeles, CA, USA"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Political & Religious Information</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Political Party</label>
                    <input
                      type="text"
                      name="politicalParty"
                      value={formData.politicalParty}
                      onChange={handleChange}
                      placeholder="e.g., Democratic Party, Independent"
                    />
                  </div>

                  <div className="form-group">
                    <label>Political Beliefs</label>
                    <input
                      type="text"
                      name="politicalBeliefs"
                      value={formData.politicalBeliefs}
                      onChange={handleChange}
                      placeholder="e.g., Progressive, Conservative"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Religion</label>
                    <input
                      type="text"
                      name="religion"
                      value={formData.religion}
                      onChange={handleChange}
                      placeholder="e.g., Christianity, Judaism, Islam"
                    />
                  </div>

                  <div className="form-group">
                    <label>Religious Denomination</label>
                    <input
                      type="text"
                      name="religionDenomination"
                      value={formData.religionDenomination}
                      onChange={handleChange}
                      placeholder="e.g., Catholic, Methodist, Sunni"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Online Presence</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Official Website</label>
                    <input
                      type="url"
                      name="officialWebsite"
                      value={formData.officialWebsite}
                      onChange={handleChange}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Wikipedia URL</label>
                    <input
                      type="url"
                      name="wikipediaUrl"
                      value={formData.wikipediaUrl}
                      onChange={handleChange}
                      placeholder="https://en.wikipedia.org/wiki/..."
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Twitter Handle</label>
                    <input
                      type="text"
                      name="twitterHandle"
                      value={formData.twitterHandle}
                      onChange={handleChange}
                      placeholder="@username"
                    />
                  </div>

                  <div className="form-group">
                    <label>LinkedIn URL</label>
                    <input
                      type="url"
                      name="linkedInUrl"
                      value={formData.linkedInUrl}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>
              </div>

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

          .btn-history {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-history:hover {
            background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
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
