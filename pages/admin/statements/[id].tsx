import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'
import Link from 'next/link'

interface Statement {
  id: string
  content: string
  context: string | null
  summary: string | null
  statementDate: string
  statementTime: string | null
  statementType: string
  responseType: string | null
  medium: string | null
  mediumUrl: string | null
  platform: string | null
  socialMediaUrl: string | null
  socialMediaId: string | null
  venue: string | null
  event: string | null
  speakerRole: string | null
  category: string | null
  sentiment: string | null
  credibilityScore: number | null
  isVerified: boolean
  verificationLevel: string | null
  verificationStatus: string | null
  verifiedBy: string | null
  verifiedAt: string | null
  verificationDate: string | null
  isPublic: boolean
  isFlagged: boolean
  flagReason: string | null
  isRetracted: boolean | null
  retractionDate: string | null
  retractionText: string | null
  isDeleted: boolean | null
  deletedDate: string | null
  isDisputed: boolean | null
  disputeNotes: string | null
  isGroupStatement: boolean | null
  contentWarning: string | null
  responseDepth: number | null
  responseTime: number | null
  hasRepercussions: boolean | null
  lostEmployment: boolean
  lostContracts: boolean
  paintedNegatively: boolean
  repercussionDetails: string | null
  responseImpact: string | null
  likes: number | null
  shares: number | null
  views: number | null
  responseCount: number | null
  criticismCount: number | null
  supportCount: number | null
  mediaOutlets: number | null
  articleCount: number | null
  personId: string | null
  organizationId: string | null
  caseId: string | null
  respondsToId: string | null
  primarySourceId: string | null
  onBehalfOfOrgId: string | null
  createdAt: string
  updatedAt: string
  person: any
  organization: any
  case: any
  primarySource: any
  sources: any[]
  respondsTo: any
  responses: any[]
  groupAuthors: any[]
  groupOrganizations: any[]
  repercussionsCaused: any[]
  _count: {
    responses: number
    sources: number
    repercussionsCaused: number
    repercussionsAbout: number
  }
}

export default function StatementEdit() {
  const router = useRouter()
  const { id } = router.query
  const [statement, setStatement] = useState<Statement | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (id) {
      fetchStatement()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchStatement = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/statements/${id}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 404) {
          setError('Statement not found')
          return
        }
        if (response.status === 401 || response.status === 403) {
          router.push('/admin/login')
          return
        }
        throw new Error('Failed to fetch statement')
      }

      const data = await response.json()
      setStatement(data.statement)
    } catch (err) {
      setError('Failed to load statement')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!statement) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      const response = await fetch(`/api/admin/statements/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(statement)
      })

      if (!response.ok) {
        throw new Error('Failed to update statement')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this statement?')) return

    try {
      const response = await fetch(`/api/admin/statements/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to delete statement')
      }

      router.push('/admin/statements')
    } catch (err) {
      setError('Failed to delete statement')
    }
  }

  const updateField = (field: keyof Statement, value: any) => {
    if (!statement) return
    setStatement({ ...statement, [field]: value })
  }

  if (loading) {
    return (
      <AdminLayout title="Loading...">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading statement...</p>
        </div>
      </AdminLayout>
    )
  }

  if (error && !statement) {
    return (
      <AdminLayout title="Error">
        <div className="error-page">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => router.push('/admin/statements')} className="btn-primary">
            Back to Statements
          </button>
        </div>
      </AdminLayout>
    )
  }

  if (!statement) return null

  return (
    <>
      <Head>
        <title>Edit Statement - Admin - The Words Record</title>
      </Head>

      <AdminLayout title="Edit Statement">
        <div className="admin-page">
          <div className="page-header">
            <div>
              <h1>📝 Edit Statement</h1>
              <p className="subtitle">
                Statement ID: {statement.id}
              </p>
            </div>
            <div className="header-actions">
              <button onClick={() => router.push('/admin/statements')} className="btn-secondary">
                ← Back to List
              </button>
              <button onClick={handleDelete} className="btn-danger">
                🗑️ Delete
              </button>
              <button onClick={handleSubmit} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">✅ Changes saved successfully!</div>}

          <form onSubmit={handleSubmit} className="edit-form">
            {/* Core Content Section */}
            <div className="form-section">
              <h2>📄 Core Content</h2>

              <div className="form-group">
                <label htmlFor="content">Statement Content *</label>
                <textarea
                  id="content"
                  value={statement.content}
                  onChange={(e) => updateField('content', e.target.value)}
                  rows={6}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="summary">Summary (500 chars max)</label>
                <textarea
                  id="summary"
                  value={statement.summary || ''}
                  onChange={(e) => updateField('summary', e.target.value)}
                  maxLength={500}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="context">Context</label>
                <textarea
                  id="context"
                  value={statement.context || ''}
                  onChange={(e) => updateField('context', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="statementDate">Statement Date *</label>
                  <input
                    type="date"
                    id="statementDate"
                    value={statement.statementDate?.split('T')[0] || ''}
                    onChange={(e) => updateField('statementDate', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="statementTime">Statement Time</label>
                  <input
                    type="time"
                    id="statementTime"
                    value={statement.statementTime || ''}
                    onChange={(e) => updateField('statementTime', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Classification Section */}
            <div className="form-section">
              <h2>🏷️ Classification</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="statementType">Statement Type *</label>
                  <select
                    id="statementType"
                    value={statement.statementType}
                    onChange={(e) => updateField('statementType', e.target.value)}
                    required
                  >
                    <option value="ORIGINAL">Original</option>
                    <option value="RESPONSE">Response</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="responseType">Response Type</label>
                  <select
                    id="responseType"
                    value={statement.responseType || ''}
                    onChange={(e) => updateField('responseType', e.target.value || null)}
                  >
                    <option value="">None</option>
                    <option value="DEFENSE">Defense</option>
                    <option value="CRITICISM">Criticism</option>
                    <option value="SUPPORT">Support</option>
                    <option value="CLARIFICATION">Clarification</option>
                    <option value="APOLOGY">Apology</option>
                    <option value="RETRACTION">Retraction</option>
                    <option value="COUNTERARGUMENT">Counterargument</option>
                    <option value="ESCALATION">Escalation</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <input
                    type="text"
                    id="category"
                    value={statement.category || ''}
                    onChange={(e) => updateField('category', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sentiment">Sentiment</label>
                  <select
                    id="sentiment"
                    value={statement.sentiment || ''}
                    onChange={(e) => updateField('sentiment', e.target.value || null)}
                  >
                    <option value="">None</option>
                    <option value="POSITIVE">Positive</option>
                    <option value="NEGATIVE">Negative</option>
                    <option value="NEUTRAL">Neutral</option>
                    <option value="MIXED">Mixed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="credibilityScore">Credibility Score (0-100)</label>
                  <input
                    type="number"
                    id="credibilityScore"
                    value={statement.credibilityScore || ''}
                    onChange={(e) => updateField('credibilityScore', e.target.value ? parseInt(e.target.value) : null)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>

            {/* Platform & Medium Section */}
            <div className="form-section">
              <h2>📱 Platform & Medium</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="platform">Platform</label>
                  <input
                    type="text"
                    id="platform"
                    value={statement.platform || ''}
                    onChange={(e) => updateField('platform', e.target.value)}
                    placeholder="e.g. Twitter, Press Conference"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="medium">Medium</label>
                  <select
                    id="medium"
                    value={statement.medium || ''}
                    onChange={(e) => updateField('medium', e.target.value || null)}
                  >
                    <option value="">None</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="SOCIAL_MEDIA">Social Media</option>
                    <option value="PRESS_CONFERENCE">Press Conference</option>
                    <option value="SPEECH">Speech</option>
                    <option value="ARTICLE">Article</option>
                    <option value="VIDEO">Video</option>
                    <option value="AUDIO">Audio</option>
                    <option value="DOCUMENT">Document</option>
                    <option value="EMAIL">Email</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="mediumUrl">Medium URL</label>
                <input
                  type="url"
                  id="mediumUrl"
                  value={statement.mediumUrl || ''}
                  onChange={(e) => updateField('mediumUrl', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="socialMediaUrl">Social Media URL</label>
                <input
                  type="url"
                  id="socialMediaUrl"
                  value={statement.socialMediaUrl || ''}
                  onChange={(e) => updateField('socialMediaUrl', e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="venue">Venue</label>
                  <input
                    type="text"
                    id="venue"
                    value={statement.venue || ''}
                    onChange={(e) => updateField('venue', e.target.value)}
                    placeholder="e.g. City Hall, CNN Studio"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="event">Event</label>
                  <input
                    type="text"
                    id="event"
                    value={statement.event || ''}
                    onChange={(e) => updateField('event', e.target.value)}
                    placeholder="e.g. Campaign Rally, Town Hall"
                  />
                </div>
              </div>
            </div>

            {/* Relationships Section */}
            <div className="form-section">
              <h2>🔗 Relationships</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="personId">Speaker (Person ID)</label>
                  <input
                    type="text"
                    id="personId"
                    value={statement.personId || ''}
                    onChange={(e) => updateField('personId', e.target.value || null)}
                  />
                  {statement.person && (
                    <p className="form-hint">
                      Current: <Link href={`/admin/people/${statement.person.slug}`}>
                        {statement.person.fullName || statement.person.name}
                      </Link>
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="organizationId">Organization ID</label>
                  <input
                    type="text"
                    id="organizationId"
                    value={statement.organizationId || ''}
                    onChange={(e) => updateField('organizationId', e.target.value || null)}
                  />
                  {statement.organization && (
                    <p className="form-hint">
                      Current: <Link href={`/admin/organizations/${statement.organization.slug}`}>
                        {statement.organization.name}
                      </Link>
                    </p>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="caseId">Case ID</label>
                  <input
                    type="text"
                    id="caseId"
                    value={statement.caseId || ''}
                    onChange={(e) => updateField('caseId', e.target.value || null)}
                  />
                  {statement.case && (
                    <p className="form-hint">
                      Current: <Link href={`/admin/cases/${statement.case.id}`}>
                        {statement.case.title}
                      </Link>
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="respondsToId">Responds To (Statement ID)</label>
                  <input
                    type="text"
                    id="respondsToId"
                    value={statement.respondsToId || ''}
                    onChange={(e) => updateField('respondsToId', e.target.value || null)}
                  />
                  {statement.respondsTo && (
                    <p className="form-hint">
                      Responding to: "{statement.respondsTo.content.substring(0, 60)}..."
                    </p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="primarySourceId">Primary Source ID</label>
                <input
                  type="text"
                  id="primarySourceId"
                  value={statement.primarySourceId || ''}
                  onChange={(e) => updateField('primarySourceId', e.target.value || null)}
                />
                {statement.primarySource && (
                  <p className="form-hint">
                    Current: {statement.primarySource.title}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={statement.isGroupStatement || false}
                    onChange={(e) => updateField('isGroupStatement', e.target.checked)}
                  />
                  {' '}Is Group Statement
                </label>
              </div>

              {statement.isGroupStatement && (
                <div className="form-group">
                  <p className="form-hint">
                    Group has {statement.groupAuthors?.length || 0} authors and {statement.groupOrganizations?.length || 0} organizations
                  </p>
                </div>
              )}
            </div>

            {/* Verification Section */}
            <div className="form-section">
              <h2>✓ Verification</h2>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={statement.isVerified}
                    onChange={(e) => updateField('isVerified', e.target.checked)}
                  />
                  {' '}Is Verified
                </label>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="verificationLevel">Verification Level</label>
                  <select
                    id="verificationLevel"
                    value={statement.verificationLevel || ''}
                    onChange={(e) => updateField('verificationLevel', e.target.value || null)}
                  >
                    <option value="">None</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="PARTIALLY_VERIFIED">Partially Verified</option>
                    <option value="UNVERIFIED">Unverified</option>
                    <option value="DISPUTED">Disputed</option>
                    <option value="DEBUNKED">Debunked</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="verificationStatus">Verification Status</label>
                  <select
                    id="verificationStatus"
                    value={statement.verificationStatus || ''}
                    onChange={(e) => updateField('verificationStatus', e.target.value || null)}
                  >
                    <option value="">None</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="PARTIALLY_VERIFIED">Partially Verified</option>
                    <option value="UNVERIFIED">Unverified</option>
                    <option value="DISPUTED">Disputed</option>
                    <option value="DEBUNKED">Debunked</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="verifiedBy">Verified By</label>
                  <input
                    type="text"
                    id="verifiedBy"
                    value={statement.verifiedBy || ''}
                    onChange={(e) => updateField('verifiedBy', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="verificationDate">Verification Date</label>
                  <input
                    type="date"
                    id="verificationDate"
                    value={statement.verificationDate?.split('T')[0] || ''}
                    onChange={(e) => updateField('verificationDate', e.target.value || null)}
                  />
                </div>
              </div>
            </div>

            {/* Status & Flags Section */}
            <div className="form-section">
              <h2>🚩 Status & Flags</h2>

              <div className="form-group checkboxes">
                <label>
                  <input
                    type="checkbox"
                    checked={statement.isPublic}
                    onChange={(e) => updateField('isPublic', e.target.checked)}
                  />
                  {' '}Is Public
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={statement.isFlagged}
                    onChange={(e) => updateField('isFlagged', e.target.checked)}
                  />
                  {' '}Is Flagged
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={statement.isRetracted || false}
                    onChange={(e) => updateField('isRetracted', e.target.checked)}
                  />
                  {' '}Is Retracted
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={statement.isDeleted || false}
                    onChange={(e) => updateField('isDeleted', e.target.checked)}
                  />
                  {' '}Is Deleted
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={statement.isDisputed || false}
                    onChange={(e) => updateField('isDisputed', e.target.checked)}
                  />
                  {' '}Is Disputed
                </label>
              </div>

              {statement.isFlagged && (
                <div className="form-group">
                  <label htmlFor="flagReason">Flag Reason</label>
                  <textarea
                    id="flagReason"
                    value={statement.flagReason || ''}
                    onChange={(e) => updateField('flagReason', e.target.value)}
                    rows={2}
                  />
                </div>
              )}

              {statement.isRetracted && (
                <div className="form-group">
                  <label htmlFor="retractionText">Retraction Text</label>
                  <textarea
                    id="retractionText"
                    value={statement.retractionText || ''}
                    onChange={(e) => updateField('retractionText', e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              {statement.isDisputed && (
                <div className="form-group">
                  <label htmlFor="disputeNotes">Dispute Notes</label>
                  <textarea
                    id="disputeNotes"
                    value={statement.disputeNotes || ''}
                    onChange={(e) => updateField('disputeNotes', e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="contentWarning">Content Warning</label>
                <input
                  type="text"
                  id="contentWarning"
                  value={statement.contentWarning || ''}
                  onChange={(e) => updateField('contentWarning', e.target.value)}
                  placeholder="e.g. Graphic content, Sensitive topic"
                />
              </div>
            </div>

            {/* Engagement Metrics Section */}
            <div className="form-section">
              <h2>📊 Engagement Metrics</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="likes">Likes</label>
                  <input
                    type="number"
                    id="likes"
                    value={statement.likes || ''}
                    onChange={(e) => updateField('likes', e.target.value ? parseInt(e.target.value) : null)}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="shares">Shares</label>
                  <input
                    type="number"
                    id="shares"
                    value={statement.shares || ''}
                    onChange={(e) => updateField('shares', e.target.value ? parseInt(e.target.value) : null)}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="views">Views</label>
                  <input
                    type="number"
                    id="views"
                    value={statement.views || ''}
                    onChange={(e) => updateField('views', e.target.value ? parseInt(e.target.value) : null)}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="responseCount">Response Count</label>
                  <input
                    type="number"
                    id="responseCount"
                    value={statement.responseCount || ''}
                    onChange={(e) => updateField('responseCount', e.target.value ? parseInt(e.target.value) : null)}
                    min="0"
                  />
                  <p className="form-hint">Actual: {statement._count.responses}</p>
                </div>

                <div className="form-group">
                  <label htmlFor="criticismCount">Criticism Count</label>
                  <input
                    type="number"
                    id="criticismCount"
                    value={statement.criticismCount || ''}
                    onChange={(e) => updateField('criticismCount', e.target.value ? parseInt(e.target.value) : null)}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="supportCount">Support Count</label>
                  <input
                    type="number"
                    id="supportCount"
                    value={statement.supportCount || ''}
                    onChange={(e) => updateField('supportCount', e.target.value ? parseInt(e.target.value) : null)}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="mediaOutlets">Media Outlets</label>
                  <input
                    type="number"
                    id="mediaOutlets"
                    value={statement.mediaOutlets || ''}
                    onChange={(e) => updateField('mediaOutlets', e.target.value ? parseInt(e.target.value) : null)}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="articleCount">Article Count</label>
                  <input
                    type="number"
                    id="articleCount"
                    value={statement.articleCount || ''}
                    onChange={(e) => updateField('articleCount', e.target.value ? parseInt(e.target.value) : null)}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Repercussions Section */}
            <div className="form-section">
              <h2>⚡ Repercussions</h2>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={statement.hasRepercussions || false}
                    onChange={(e) => updateField('hasRepercussions', e.target.checked)}
                  />
                  {' '}Has Repercussions
                </label>
                <p className="form-hint">
                  {statement._count.repercussionsCaused + statement._count.repercussionsAbout} repercussions linked
                </p>
              </div>

              <div className="form-group checkboxes">
                <label>
                  <input
                    type="checkbox"
                    checked={statement.lostEmployment}
                    onChange={(e) => updateField('lostEmployment', e.target.checked)}
                  />
                  {' '}Lost Employment
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={statement.lostContracts}
                    onChange={(e) => updateField('lostContracts', e.target.checked)}
                  />
                  {' '}Lost Contracts
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={statement.paintedNegatively}
                    onChange={(e) => updateField('paintedNegatively', e.target.checked)}
                  />
                  {' '}Painted Negatively
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="repercussionDetails">Repercussion Details</label>
                <textarea
                  id="repercussionDetails"
                  value={statement.repercussionDetails || ''}
                  onChange={(e) => updateField('repercussionDetails', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="responseImpact">Response Impact</label>
                <textarea
                  id="responseImpact"
                  value={statement.responseImpact || ''}
                  onChange={(e) => updateField('responseImpact', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Additional Metadata */}
            <div className="form-section">
              <h2>📋 Additional Metadata</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="speakerRole">Speaker Role</label>
                  <input
                    type="text"
                    id="speakerRole"
                    value={statement.speakerRole || ''}
                    onChange={(e) => updateField('speakerRole', e.target.value)}
                    placeholder="e.g. CEO, Spokesperson"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="responseDepth">Response Depth</label>
                  <input
                    type="number"
                    id="responseDepth"
                    value={statement.responseDepth || ''}
                    onChange={(e) => updateField('responseDepth', e.target.value ? parseInt(e.target.value) : null)}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="responseTime">Response Time (hours)</label>
                  <input
                    type="number"
                    id="responseTime"
                    value={statement.responseTime || ''}
                    onChange={(e) => updateField('responseTime', e.target.value ? parseInt(e.target.value) : null)}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Related Items */}
            <div className="form-section">
              <h2>🔗 Related Items</h2>

              {statement.responses.length > 0 && (
                <div className="related-items">
                  <h3>Responses ({statement._count.responses})</h3>
                  <ul>
                    {statement.responses.slice(0, 5).map((response: any) => (
                      <li key={response.id}>
                        <Link href={`/admin/statements/${response.id}`}>
                          {response.person?.fullName || response.person?.name || 'Unknown'}: "{response.content.substring(0, 80)}..."
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {statement._count.responses > 5 && (
                    <p>+ {statement._count.responses - 5} more</p>
                  )}
                </div>
              )}

              {statement.sources.length > 0 && (
                <div className="related-items">
                  <h3>Additional Sources ({statement._count.sources})</h3>
                  <ul>
                    {statement.sources.map((source: any) => (
                      <li key={source.id}>
                        <a href={source.url || '#'} target="_blank" rel="noopener noreferrer">
                          {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {statement.repercussionsCaused.length > 0 && (
                <div className="related-items">
                  <h3>Repercussions Caused ({statement._count.repercussionsCaused})</h3>
                  <ul>
                    {statement.repercussionsCaused.map((rep: any) => (
                      <li key={rep.id}>
                        {rep.type}: {rep.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => router.push('/admin/statements')} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <style jsx>{`
          .admin-page {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
          }

          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }

          .page-header h1 {
            margin: 0 0 0.5rem 0;
            font-size: 2rem;
            font-weight: 700;
            color: #0f172a;
          }

          .subtitle {
            margin: 0;
            font-size: 0.875rem;
            color: #64748b;
          }

          .header-actions {
            display: flex;
            gap: 0.75rem;
          }

          .btn-primary, .btn-secondary, .btn-danger {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-primary {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
          }

          .btn-primary:hover:not(:disabled) {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }

          .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .btn-secondary {
            background: #f3f4f6;
            color: #475569;
          }

          .btn-secondary:hover {
            background: #e5e7eb;
          }

          .btn-danger {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
          }

          .btn-danger:hover {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          }

          .error-message, .success-message {
            padding: 1rem 1.25rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            font-weight: 500;
          }

          .error-message {
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #991b1b;
          }

          .success-message {
            background: #d1fae5;
            border: 1px solid #a7f3d0;
            color: #065f46;
          }

          .edit-form {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .form-section {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid #f3f4f6;
          }

          .form-section h2 {
            margin: 0 0 1.5rem 0;
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f172a;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 0.75rem;
          }

          .form-section h3 {
            margin: 0 0 0.75rem 0;
            font-size: 1rem;
            font-weight: 600;
            color: #475569;
          }

          .form-group {
            margin-bottom: 1.25rem;
          }

          .form-group:last-child {
            margin-bottom: 0;
          }

          .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #374151;
          }

          .form-group input[type="text"],
          .form-group input[type="url"],
          .form-group input[type="number"],
          .form-group input[type="date"],
          .form-group input[type="time"],
          .form-group select,
          .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 0.9375rem;
            transition: border-color 0.2s;
          }

          .form-group input:focus,
          .form-group select:focus,
          .form-group textarea:focus {
            outline: none;
            border-color: #3b82f6;
          }

          .form-group textarea {
            resize: vertical;
            font-family: inherit;
          }

          .form-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
          }

          .form-group.checkboxes {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .form-group.checkboxes label {
            display: flex;
            align-items: center;
            font-weight: 500;
          }

          .form-group input[type="checkbox"] {
            width: auto;
            margin-right: 0.5rem;
          }

          .form-hint {
            margin: 0.5rem 0 0 0;
            font-size: 0.8125rem;
            color: #64748b;
          }

          .form-hint a {
            color: #3b82f6;
            text-decoration: none;
          }

          .form-hint a:hover {
            text-decoration: underline;
          }

          .related-items {
            margin-bottom: 1.5rem;
          }

          .related-items:last-child {
            margin-bottom: 0;
          }

          .related-items ul {
            margin: 0.5rem 0 0 0;
            padding-left: 1.5rem;
          }

          .related-items li {
            margin-bottom: 0.5rem;
          }

          .related-items a {
            color: #3b82f6;
            text-decoration: none;
          }

          .related-items a:hover {
            text-decoration: underline;
          }

          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            padding-top: 1rem;
          }

          .loading, .error-page {
            text-align: center;
            padding: 4rem 2rem;
          }

          .spinner {
            width: 40px;
            height: 40px;
            margin: 0 auto 1rem;
            border: 4px solid #f3f4f6;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @media (max-width: 768px) {
            .admin-page {
              padding: 1rem;
            }

            .page-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 1rem;
            }

            .header-actions {
              width: 100%;
              flex-direction: column;
            }

            .header-actions button {
              width: 100%;
            }

            .form-row {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </AdminLayout>
    </>
  )
}
