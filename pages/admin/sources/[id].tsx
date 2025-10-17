import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'

interface SourceForm {
  // Basic Info
  title: string
  url: string
  publication: string
  publicationSlug: string
  publicationSection: string
  author: string
  additionalAuthors: string[]

  // Dates
  publishDate: string
  accessDate: string

  // Classification
  sourceType: string
  sourceLevel: string
  contentType: string

  // Credibility & Verification
  credibility: string
  credibilityLevel: string
  credibilityScore: string
  verificationStatus: string
  verificationNotes: string
  factCheckStatus: string
  factCheckUrl: string
  factCheckBy: string

  // Archival
  isArchived: boolean
  archiveUrl: string
  archiveDate: string
  archiveMethod: string
  archiveHash: string
  requiresArchival: boolean
  archivalPriority: string
  screenshotUrl: string
  pdfUrl: string

  // Quality Indicators
  qualityScore: string
  hasByline: boolean
  hasMultipleSources: boolean
  hasPaywall: boolean
  isOpinion: boolean
  isEditorial: boolean
  isExclusive: boolean
  hasDate: boolean
  hasSources: boolean

  // Content Analysis
  wordCount: string
  biasRating: string
  biasNote: string
  contentWarning: string
  isGraphic: boolean
  isSensitive: boolean

  // Status Tracking
  isDeleted: boolean
  deletionDate: string
  deletionReason: string
  isBroken: boolean
  lastCheckDate: string
  checkFailCount: string

  // Metrics
  citationCount: string
  viewCount: string

  // Relationships
  mediaOutletId: string
  journalistId: string
  caseId: string
  statementId: string
  repercussionId: string
  topicId: string

  // Administrative
  publicNotes: string
  internalNotes: string
}

export default function EditSource() {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [relatedData, setRelatedData] = useState<any>({})
  const [formData, setFormData] = useState<SourceForm>({
    title: '',
    url: '',
    publication: '',
    publicationSlug: '',
    publicationSection: '',
    author: '',
    additionalAuthors: [],
    publishDate: '',
    accessDate: '',
    sourceType: 'NEWS_ARTICLE',
    sourceLevel: 'SECONDARY',
    contentType: 'TEXT',
    credibility: 'UNKNOWN',
    credibilityLevel: 'UNKNOWN',
    credibilityScore: '',
    verificationStatus: 'UNVERIFIED',
    verificationNotes: '',
    factCheckStatus: '',
    factCheckUrl: '',
    factCheckBy: '',
    isArchived: false,
    archiveUrl: '',
    archiveDate: '',
    archiveMethod: '',
    archiveHash: '',
    requiresArchival: true,
    archivalPriority: '5',
    screenshotUrl: '',
    pdfUrl: '',
    qualityScore: '',
    hasByline: false,
    hasMultipleSources: false,
    hasPaywall: false,
    isOpinion: false,
    isEditorial: false,
    isExclusive: false,
    hasDate: false,
    hasSources: false,
    wordCount: '',
    biasRating: '',
    biasNote: '',
    contentWarning: '',
    isGraphic: false,
    isSensitive: false,
    isDeleted: false,
    deletionDate: '',
    deletionReason: '',
    isBroken: false,
    lastCheckDate: '',
    checkFailCount: '0',
    citationCount: '0',
    viewCount: '0',
    mediaOutletId: '',
    journalistId: '',
    caseId: '',
    statementId: '',
    repercussionId: '',
    topicId: '',
    publicNotes: '',
    internalNotes: ''
  })

  useEffect(() => {
    if (id) {
      fetchSource()
    }
  }, [id])

  const fetchSource = async () => {
    try {
      const response = await fetch(`/api/admin/sources/${id}`)
      if (response.ok) {
        const data = await response.json()
        const source = data.source

        setRelatedData({
          mediaOutlet: source.mediaOutlet,
          journalist: source.journalist,
          case: source.case,
          statement: source.statement,
          repercussion: source.repercussion
        })

        setFormData({
          title: source.title || '',
          url: source.url || '',
          publication: source.publication || '',
          publicationSlug: source.publicationSlug || '',
          publicationSection: source.publicationSection || '',
          author: source.author || '',
          additionalAuthors: source.additionalAuthors || [],
          publishDate: source.publishDate ? source.publishDate.split('T')[0] : '',
          accessDate: source.accessDate ? source.accessDate.split('T')[0] : '',
          sourceType: source.sourceType || 'NEWS_ARTICLE',
          sourceLevel: source.sourceLevel || 'SECONDARY',
          contentType: source.contentType || 'TEXT',
          credibility: source.credibility || 'UNKNOWN',
          credibilityLevel: source.credibilityLevel || 'UNKNOWN',
          credibilityScore: source.credibilityScore?.toString() || '',
          verificationStatus: source.verificationStatus || 'UNVERIFIED',
          verificationNotes: source.verificationNotes || '',
          factCheckStatus: source.factCheckStatus || '',
          factCheckUrl: source.factCheckUrl || '',
          factCheckBy: source.factCheckBy || '',
          isArchived: source.isArchived || false,
          archiveUrl: source.archiveUrl || '',
          archiveDate: source.archiveDate ? source.archiveDate.split('T')[0] : '',
          archiveMethod: source.archiveMethod || '',
          archiveHash: source.archiveHash || '',
          requiresArchival: source.requiresArchival !== false,
          archivalPriority: source.archivalPriority?.toString() || '5',
          screenshotUrl: source.screenshotUrl || '',
          pdfUrl: source.pdfUrl || '',
          qualityScore: source.qualityScore?.toString() || '',
          hasByline: source.hasByline || false,
          hasMultipleSources: source.hasMultipleSources || false,
          hasPaywall: source.hasPaywall || false,
          isOpinion: source.isOpinion || false,
          isEditorial: source.isEditorial || false,
          isExclusive: source.isExclusive || false,
          hasDate: source.hasDate || false,
          hasSources: source.hasSources || false,
          wordCount: source.wordCount?.toString() || '',
          biasRating: source.biasRating || '',
          biasNote: source.biasNote || '',
          contentWarning: source.contentWarning || '',
          isGraphic: source.isGraphic || false,
          isSensitive: source.isSensitive || false,
          isDeleted: source.isDeleted || false,
          deletionDate: source.deletionDate ? source.deletionDate.split('T')[0] : '',
          deletionReason: source.deletionReason || '',
          isBroken: source.isBroken || false,
          lastCheckDate: source.lastCheckDate ? source.lastCheckDate.split('T')[0] : '',
          checkFailCount: source.checkFailCount?.toString() || '0',
          citationCount: source.citationCount?.toString() || '0',
          viewCount: source.viewCount?.toString() || '0',
          mediaOutletId: source.mediaOutletId || '',
          journalistId: source.journalistId || '',
          caseId: source.caseId || '',
          statementId: source.statementId || '',
          repercussionId: source.repercussionId || '',
          topicId: source.topicId || '',
          publicNotes: source.publicNotes || '',
          internalNotes: source.internalNotes || ''
        })
      } else {
        setError('Source not found')
      }
    } catch (err) {
      setError('Failed to load source')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      const response = await fetch(`/api/admin/sources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          credibilityScore: formData.credibilityScore || undefined,
          qualityScore: formData.qualityScore || undefined,
          wordCount: formData.wordCount || undefined,
          checkFailCount: formData.checkFailCount || undefined,
          citationCount: formData.citationCount || undefined,
          viewCount: formData.viewCount || undefined,
          archivalPriority: formData.archivalPriority || undefined,
          publishDate: formData.publishDate || undefined,
          accessDate: formData.accessDate || undefined,
          archiveDate: formData.archiveDate || undefined,
          deletionDate: formData.deletionDate || undefined,
          lastCheckDate: formData.lastCheckDate || undefined
        })
      })

      if (response.ok) {
        router.push('/admin/sources')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update source')
      }
    } catch (err) {
      setError('An error occurred while updating the source')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this source? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/sources/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/admin/sources')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete source')
      }
    } catch (err) {
      setError('An error occurred while deleting the source')
    }
  }

  // Options
  const sourceTypes = [
    { value: 'NEWS_ARTICLE', label: 'News Article' },
    { value: 'OPINION_PIECE', label: 'Opinion Piece' },
    { value: 'EDITORIAL', label: 'Editorial' },
    { value: 'PRESS_RELEASE', label: 'Press Release' },
    { value: 'GOVERNMENT_DOCUMENT', label: 'Government Document' },
    { value: 'ACADEMIC_PAPER', label: 'Academic Paper' },
    { value: 'SOCIAL_MEDIA_POST', label: 'Social Media Post' },
    { value: 'VIDEO', label: 'Video' },
    { value: 'AUDIO', label: 'Audio/Podcast' },
    { value: 'TRANSCRIPT', label: 'Transcript' },
    { value: 'LEGAL_DOCUMENT', label: 'Legal Document' },
    { value: 'REPORT', label: 'Report' },
    { value: 'BOOK', label: 'Book' },
    { value: 'WEBSITE', label: 'Website' },
    { value: 'INTERVIEW', label: 'Interview' },
    { value: 'SPEECH', label: 'Speech' },
    { value: 'LEAKED_DOCUMENT', label: 'Leaked Document' },
    { value: 'OTHER', label: 'Other' }
  ]

  const sourceLevels = [
    { value: 'PRIMARY', label: 'Primary' },
    { value: 'SECONDARY', label: 'Secondary' },
    { value: 'TERTIARY', label: 'Tertiary' },
    { value: 'ANALYSIS', label: 'Analysis' }
  ]

  const contentTypes = [
    { value: 'TEXT', label: 'Text' },
    { value: 'VIDEO', label: 'Video' },
    { value: 'AUDIO', label: 'Audio' },
    { value: 'IMAGE', label: 'Image' },
    { value: 'DOCUMENT', label: 'Document' },
    { value: 'INTERACTIVE', label: 'Interactive' },
    { value: 'DATA', label: 'Data' }
  ]

  const credibilityRatings = [
    { value: 'UNKNOWN', label: 'Unknown' },
    { value: 'VERY_LOW', label: 'Very Low' },
    { value: 'LOW', label: 'Low' },
    { value: 'MIXED', label: 'Mixed' },
    { value: 'HIGH', label: 'High' },
    { value: 'VERY_HIGH', label: 'Very High' }
  ]

  const verificationStatuses = [
    { value: 'UNVERIFIED', label: 'Unverified' },
    { value: 'PARTIALLY_VERIFIED', label: 'Partially Verified' },
    { value: 'VERIFIED', label: 'Verified' },
    { value: 'DISPUTED', label: 'Disputed' },
    { value: 'DEBUNKED', label: 'Debunked' }
  ]

  const factCheckStatuses = [
    { value: '', label: 'Not Checked' },
    { value: 'TRUE', label: 'True' },
    { value: 'MOSTLY_TRUE', label: 'Mostly True' },
    { value: 'MIXED', label: 'Mixed' },
    { value: 'MOSTLY_FALSE', label: 'Mostly False' },
    { value: 'FALSE', label: 'False' },
    { value: 'UNPROVEN', label: 'Unproven' },
    { value: 'PENDING', label: 'Pending' }
  ]

  const archiveMethods = [
    { value: '', label: 'None' },
    { value: 'WAYBACK_MACHINE', label: 'Wayback Machine' },
    { value: 'ARCHIVE_TODAY', label: 'Archive.today' },
    { value: 'LOCAL_STORAGE', label: 'Local Storage' },
    { value: 'SCREENSHOT', label: 'Screenshot' },
    { value: 'PDF_CAPTURE', label: 'PDF Capture' },
    { value: 'FULL_CAPTURE', label: 'Full Capture' }
  ]

  const biasRatings = [
    { value: '', label: 'Not Rated' },
    { value: 'EXTREME_LEFT', label: 'Extreme Left' },
    { value: 'LEFT', label: 'Left' },
    { value: 'LEFT_CENTER', label: 'Left-Center' },
    { value: 'CENTER', label: 'Center' },
    { value: 'RIGHT_CENTER', label: 'Right-Center' },
    { value: 'RIGHT', label: 'Right' },
    { value: 'EXTREME_RIGHT', label: 'Extreme Right' },
    { value: 'PRO_SCIENCE', label: 'Pro-Science' },
    { value: 'CONSPIRACY_PSEUDOSCIENCE', label: 'Conspiracy/Pseudoscience' },
    { value: 'SATIRE', label: 'Satire' }
  ]

  if (loading) {
    return (
      <AdminLayout title="Edit Source">
        <div className="loading">Loading source...</div>
      </AdminLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Edit Source - Admin - The Words Record</title>
      </Head>

      <AdminLayout title="Edit Source">
        <div className="admin-page">
          <div className="page-header">
            <div>
              <h1>Edit Source</h1>
              <p className="page-subtitle">Update source reference and metadata</p>
            </div>
            <div className="header-actions">
              <button onClick={handleDelete} className="btn-danger">
                Delete
              </button>
              <button onClick={() => router.push('/admin/sources')} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-container">
            <form onSubmit={handleSubmit}>

              {/* BASIC INFORMATION */}
              <div className="form-section">
                <h3>Basic Information</h3>

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
                    <label>Publication / Outlet</label>
                    <input
                      type="text"
                      name="publication"
                      value={formData.publication}
                      onChange={handleChange}
                      placeholder="e.g., The New York Times"
                    />
                  </div>

                  <div className="form-group">
                    <label>Publication Slug</label>
                    <input
                      type="text"
                      name="publicationSlug"
                      value={formData.publicationSlug}
                      onChange={handleChange}
                      placeholder="e.g., nyt"
                    />
                  </div>
                </div>

                <div className="form-row">
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

                  <div className="form-group">
                    <label>Publication Section</label>
                    <input
                      type="text"
                      name="publicationSection"
                      value={formData.publicationSection}
                      onChange={handleChange}
                      placeholder="e.g., Politics, World, Opinion"
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
                    <label>Access Date</label>
                    <input
                      type="date"
                      name="accessDate"
                      value={formData.accessDate}
                      onChange={handleChange}
                    />
                    <small>When this source was first accessed</small>
                  </div>
                </div>
              </div>

              {/* SOURCE CLASSIFICATION */}
              <div className="form-section">
                <h3>Source Classification</h3>

                <div className="form-row">
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

                  <div className="form-group">
                    <label>Source Level *</label>
                    <select
                      name="sourceLevel"
                      value={formData.sourceLevel}
                      onChange={handleChange}
                      required
                    >
                      {sourceLevels.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <small>Primary = firsthand; Secondary = reporting; Tertiary = reference</small>
                  </div>
                </div>

                <div className="form-group">
                  <label>Content Type</label>
                  <select
                    name="contentType"
                    value={formData.contentType}
                    onChange={handleChange}
                  >
                    {contentTypes.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CREDIBILITY & VERIFICATION */}
              <div className="form-section">
                <h3>Credibility & Verification</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Credibility Level</label>
                    <select
                      name="credibilityLevel"
                      value={formData.credibilityLevel}
                      onChange={handleChange}
                    >
                      {credibilityRatings.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Credibility Score (0-100)</label>
                    <input
                      type="number"
                      name="credibilityScore"
                      value={formData.credibilityScore}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="0-100"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Verification Status</label>
                    <select
                      name="verificationStatus"
                      value={formData.verificationStatus}
                      onChange={handleChange}
                    >
                      {verificationStatuses.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Fact Check Status</label>
                    <select
                      name="factCheckStatus"
                      value={formData.factCheckStatus}
                      onChange={handleChange}
                    >
                      {factCheckStatuses.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Verification Notes</label>
                  <textarea
                    name="verificationNotes"
                    value={formData.verificationNotes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Notes about verification process or concerns..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fact Check URL</label>
                    <input
                      type="url"
                      name="factCheckUrl"
                      value={formData.factCheckUrl}
                      onChange={handleChange}
                      placeholder="https://factcheck.org/..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Fact Checked By</label>
                    <input
                      type="text"
                      name="factCheckBy"
                      value={formData.factCheckBy}
                      onChange={handleChange}
                      placeholder="e.g., Snopes, PolitiFact"
                    />
                  </div>
                </div>
              </div>

              {/* ARCHIVAL */}
              <div className="form-section">
                <h3>Archival & Preservation</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="isArchived"
                        checked={formData.isArchived}
                        onChange={handleChange}
                        style={{ marginRight: '8px' }}
                      />
                      Source is Archived
                    </label>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="requiresArchival"
                        checked={formData.requiresArchival}
                        onChange={handleChange}
                        style={{ marginRight: '8px' }}
                      />
                      Requires Archival
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Archive URL</label>
                  <input
                    type="url"
                    name="archiveUrl"
                    value={formData.archiveUrl}
                    onChange={handleChange}
                    placeholder="https://web.archive.org/..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Archive Date</label>
                    <input
                      type="date"
                      name="archiveDate"
                      value={formData.archiveDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Archive Method</label>
                    <select
                      name="archiveMethod"
                      value={formData.archiveMethod}
                      onChange={handleChange}
                    >
                      {archiveMethods.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Archive Hash (SHA-256)</label>
                    <input
                      type="text"
                      name="archiveHash"
                      value={formData.archiveHash}
                      onChange={handleChange}
                      placeholder="Content verification hash"
                    />
                  </div>

                  <div className="form-group">
                    <label>Archival Priority (1-10)</label>
                    <input
                      type="number"
                      name="archivalPriority"
                      value={formData.archivalPriority}
                      onChange={handleChange}
                      min="1"
                      max="10"
                    />
                    <small>Higher = more urgent</small>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Screenshot URL</label>
                    <input
                      type="url"
                      name="screenshotUrl"
                      value={formData.screenshotUrl}
                      onChange={handleChange}
                      placeholder="URL to screenshot image"
                    />
                  </div>

                  <div className="form-group">
                    <label>PDF URL</label>
                    <input
                      type="url"
                      name="pdfUrl"
                      value={formData.pdfUrl}
                      onChange={handleChange}
                      placeholder="URL to PDF capture"
                    />
                  </div>
                </div>
              </div>

              {/* QUALITY INDICATORS */}
              <div className="form-section">
                <h3>Quality Indicators</h3>

                <div className="form-group">
                  <label>Quality Score (0-100)</label>
                  <input
                    type="number"
                    name="qualityScore"
                    value={formData.qualityScore}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    placeholder="Overall quality assessment"
                  />
                </div>

                <div className="checkbox-grid">
                  <label>
                    <input
                      type="checkbox"
                      name="hasByline"
                      checked={formData.hasByline}
                      onChange={handleChange}
                    />
                    Has Byline
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      name="hasMultipleSources"
                      checked={formData.hasMultipleSources}
                      onChange={handleChange}
                    />
                    Multiple Sources Cited
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      name="hasPaywall"
                      checked={formData.hasPaywall}
                      onChange={handleChange}
                    />
                    Behind Paywall
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      name="isOpinion"
                      checked={formData.isOpinion}
                      onChange={handleChange}
                    />
                    Opinion Piece
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      name="isEditorial"
                      checked={formData.isEditorial}
                      onChange={handleChange}
                    />
                    Editorial
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      name="isExclusive"
                      checked={formData.isExclusive}
                      onChange={handleChange}
                    />
                    Exclusive Report
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      name="hasDate"
                      checked={formData.hasDate}
                      onChange={handleChange}
                    />
                    Has Date
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      name="hasSources"
                      checked={formData.hasSources}
                      onChange={handleChange}
                    />
                    Has Sources
                  </label>
                </div>
              </div>

              {/* CONTENT ANALYSIS */}
              <div className="form-section">
                <h3>Content Analysis</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Word Count</label>
                    <input
                      type="number"
                      name="wordCount"
                      value={formData.wordCount}
                      onChange={handleChange}
                      min="0"
                      placeholder="Approximate word count"
                    />
                  </div>

                  <div className="form-group">
                    <label>Bias Rating</label>
                    <select
                      name="biasRating"
                      value={formData.biasRating}
                      onChange={handleChange}
                    >
                      {biasRatings.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Bias Note</label>
                  <textarea
                    name="biasNote"
                    value={formData.biasNote}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Notes about political or editorial bias..."
                  />
                </div>

                <div className="form-group">
                  <label>Content Warning</label>
                  <input
                    type="text"
                    name="contentWarning"
                    value={formData.contentWarning}
                    onChange={handleChange}
                    placeholder="e.g., Violence, Graphic Content"
                  />
                </div>

                <div className="form-row">
                  <label>
                    <input
                      type="checkbox"
                      name="isGraphic"
                      checked={formData.isGraphic}
                      onChange={handleChange}
                      style={{ marginRight: '8px' }}
                    />
                    Contains Graphic Content
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      name="isSensitive"
                      checked={formData.isSensitive}
                      onChange={handleChange}
                      style={{ marginRight: '8px' }}
                    />
                    Contains Sensitive Material
                  </label>
                </div>
              </div>

              {/* STATUS TRACKING */}
              <div className="form-section">
                <h3>Status Tracking</h3>

                <div className="form-row">
                  <label>
                    <input
                      type="checkbox"
                      name="isDeleted"
                      checked={formData.isDeleted}
                      onChange={handleChange}
                      style={{ marginRight: '8px' }}
                    />
                    Source Deleted from Origin
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      name="isBroken"
                      checked={formData.isBroken}
                      onChange={handleChange}
                      style={{ marginRight: '8px' }}
                    />
                    Link is Broken
                  </label>
                </div>

                {formData.isDeleted && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Deletion Date</label>
                      <input
                        type="date"
                        name="deletionDate"
                        value={formData.deletionDate}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Deletion Reason</label>
                      <input
                        type="text"
                        name="deletionReason"
                        value={formData.deletionReason}
                        onChange={handleChange}
                        placeholder="Why was it deleted?"
                      />
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Last Check Date</label>
                    <input
                      type="date"
                      name="lastCheckDate"
                      value={formData.lastCheckDate}
                      onChange={handleChange}
                    />
                    <small>Last time link was verified</small>
                  </div>

                  <div className="form-group">
                    <label>Check Fail Count</label>
                    <input
                      type="number"
                      name="checkFailCount"
                      value={formData.checkFailCount}
                      onChange={handleChange}
                      min="0"
                    />
                    <small>Number of failed check attempts</small>
                  </div>
                </div>
              </div>

              {/* METRICS */}
              <div className="form-section">
                <h3>Metrics</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Citation Count</label>
                    <input
                      type="number"
                      name="citationCount"
                      value={formData.citationCount}
                      onChange={handleChange}
                      min="0"
                    />
                    <small>How many times cited in system</small>
                  </div>

                  <div className="form-group">
                    <label>View Count</label>
                    <input
                      type="number"
                      name="viewCount"
                      value={formData.viewCount}
                      onChange={handleChange}
                      min="0"
                    />
                    <small>Public views of this source</small>
                  </div>
                </div>
              </div>

              {/* RELATIONSHIPS */}
              <div className="form-section">
                <h3>Relationships</h3>

                {relatedData.mediaOutlet && (
                  <div className="related-item">
                    <strong>Media Outlet:</strong> {relatedData.mediaOutlet.organization.name}
                  </div>
                )}

                {relatedData.journalist && (
                  <div className="related-item">
                    <strong>Journalist:</strong> {relatedData.journalist.person.name}
                  </div>
                )}

                {relatedData.case && (
                  <div className="related-item">
                    <strong>Case:</strong> {relatedData.case.title}
                  </div>
                )}

                {relatedData.statement && (
                  <div className="related-item">
                    <strong>Statement:</strong> {relatedData.statement.content.substring(0, 100)}...
                  </div>
                )}

                {relatedData.repercussion && (
                  <div className="related-item">
                    <strong>Repercussion:</strong> {relatedData.repercussion.type} - {relatedData.repercussion.description}
                  </div>
                )}

                <div className="info-box">
                  Relationship management (linking to Media Outlets, Journalists, Cases, Statements, and Repercussions) is handled through dedicated relationship pages.
                </div>
              </div>

              {/* ADMINISTRATIVE NOTES */}
              <div className="form-section">
                <h3>Administrative Notes</h3>

                <div className="form-group">
                  <label>Public Notes</label>
                  <textarea
                    name="publicNotes"
                    value={formData.publicNotes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Notes visible to the public..."
                  />
                </div>

                <div className="form-group">
                  <label>Internal Notes</label>
                  <textarea
                    name="internalNotes"
                    value={formData.internalNotes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Internal notes (not public)..."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => router.push('/admin/sources')}
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

          .checkbox-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
          }

          .checkbox-grid label {
            display: flex;
            align-items: center;
            font-size: 0.875rem;
            color: #0f172a;
            cursor: pointer;
          }

          .checkbox-grid input[type="checkbox"] {
            margin-right: 0.5rem;
            cursor: pointer;
          }

          .related-item {
            padding: 0.75rem 1rem;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            margin-bottom: 0.75rem;
            font-size: 0.875rem;
          }

          .related-item strong {
            color: #0f172a;
            margin-right: 0.5rem;
          }

          .info-box {
            padding: 1rem;
            background: #dbeafe;
            border: 1px solid #bfdbfe;
            border-radius: 6px;
            color: #1e40af;
            font-size: 0.875rem;
            margin-top: 1rem;
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

            .checkbox-grid {
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
