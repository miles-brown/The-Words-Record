import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Head from 'next/head'

interface Person {
  id: string
  name: string
  slug: string
}

const REPORT_TYPES = [
  { value: 'factual_error', label: 'Factual Error' },
  { value: 'broken_link', label: 'Broken Link or Source' },
  { value: 'missing_information', label: 'Missing Information' },
  { value: 'incorrect_attribution', label: 'Incorrect Attribution' },
  { value: 'date_error', label: 'Date or Timeline Error' },
  { value: 'formatting_issue', label: 'Formatting or Display Issue' },
  { value: 'privacy_concern', label: 'Privacy Concern' },
  { value: 'copyright_issue', label: 'Copyright Issue' },
  { value: 'other', label: 'Other' },
]

const URGENCY_LEVELS = [
  { value: 'low', label: 'Low - Minor issue, no rush' },
  { value: 'medium', label: 'Medium - Should be addressed soon' },
  { value: 'high', label: 'High - Significant error affecting accuracy' },
  { value: 'critical', label: 'Critical - Urgent correction needed' },
]

export default function Report() {
  const [people, setPeople] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const [formData, setFormData] = useState({
    reportType: '',
    urgency: 'medium',
    personId: '',
    pageUrl: '',
    issueDescription: '',
    suggestedCorrection: '',
    evidenceUrl: '',
    reporterName: '',
    reporterEmail: '',
    allowContact: false,
    privacyConsent: false,
  })

  useEffect(() => {
    fetchPeople()
  }, [])

  const fetchPeople = async () => {
    try {
      const response = await fetch('/api/people/list')
      if (response.ok) {
        const data = await response.json()
        setPeople(data)
      }
    } catch (error) {
      console.error('Error fetching people:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.privacyConsent) {
      alert('Please accept the privacy policy to submit your report.')
      return
    }

    setIsSubmitting(true)

    // TODO: Implement actual submission logic
    // For now, simulate API call
    setTimeout(() => {
      setSubmitStatus('success')
      setIsSubmitting(false)
      setFormData({
        reportType: '',
        urgency: 'medium',
        personId: '',
        pageUrl: '',
        issueDescription: '',
        suggestedCorrection: '',
        evidenceUrl: '',
        reporterName: '',
        reporterEmail: '',
        allowContact: false,
        privacyConsent: false,
      })

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000)
    }, 1500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  return (
    <Layout>
      <Head>
        <title>Report an Error - The Words Record</title>
        <meta name="description" content="Found an inaccuracy or broken link? Help us maintain quality standards by reporting issues." />
      </Head>

      <div className="report-page">
        <div className="page-header">
          <h1>Report an Error</h1>
          <p className="page-description">
            Found an inaccuracy, broken link, or other issue? Help us maintain the highest quality standards by reporting it here. We take all reports seriously and will investigate promptly.
          </p>
        </div>

        {submitStatus === 'success' ? (
          <div className="success-card">
            <div className="success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </div>
            <h2>Thank you for your report!</h2>
            <p>We'll review your submission and take appropriate action. If you provided contact information, we may reach out if we need additional details.</p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setSubmitStatus('idle')}
            >
              Submit Another Report
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-section">
              <h2>What type of issue are you reporting?</h2>

              <div className="form-group">
                <label htmlFor="reportType">
                  Issue Type <span className="required">*</span>
                </label>
                <select
                  id="reportType"
                  name="reportType"
                  value={formData.reportType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select issue type...</option>
                  {REPORT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="urgency">
                  Urgency Level <span className="required">*</span>
                </label>
                <select
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  required
                >
                  {URGENCY_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                <p className="field-help">How quickly should this issue be addressed?</p>
              </div>
            </div>

            <div className="form-section">
              <h2>Where is the issue?</h2>

              <div className="form-group">
                <label htmlFor="pageUrl">
                  Page URL <span className="required">*</span>
                </label>
                <input
                  type="url"
                  id="pageUrl"
                  name="pageUrl"
                  value={formData.pageUrl}
                  onChange={handleChange}
                  required
                  placeholder="https://thewordsrecord.com/..."
                />
                <p className="field-help">Link to the page where you found the issue</p>
              </div>

              <div className="form-group">
                <label htmlFor="personId">
                  Related to Person (Optional)
                </label>
                <select
                  id="personId"
                  name="personId"
                  value={formData.personId}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">Select a person (if applicable)...</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
                <p className="field-help">If the issue relates to a specific person's profile or statement</p>
              </div>
            </div>

            <div className="form-section">
              <h2>Describe the issue</h2>

              <div className="form-group">
                <label htmlFor="issueDescription">
                  Issue Description <span className="required">*</span>
                </label>
                <textarea
                  id="issueDescription"
                  name="issueDescription"
                  value={formData.issueDescription}
                  onChange={handleChange}
                  rows={6}
                  required
                  placeholder="Please describe the issue in detail..."
                />
                <p className="field-help">Be as specific as possible about what's wrong</p>
              </div>

              <div className="form-group">
                <label htmlFor="suggestedCorrection">
                  Suggested Correction (Optional)
                </label>
                <textarea
                  id="suggestedCorrection"
                  name="suggestedCorrection"
                  value={formData.suggestedCorrection}
                  onChange={handleChange}
                  rows={4}
                  placeholder="If you know the correct information, please share it here..."
                />
                <p className="field-help">What should it say instead?</p>
              </div>

              <div className="form-group">
                <label htmlFor="evidenceUrl">
                  Evidence or Source URL (Optional)
                </label>
                <input
                  type="url"
                  id="evidenceUrl"
                  name="evidenceUrl"
                  value={formData.evidenceUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                />
                <p className="field-help">Link to supporting evidence or correct source</p>
              </div>
            </div>

            <div className="form-section">
              <h2>Your Contact Information (Optional)</h2>
              <p className="section-description">
                Providing your contact information is optional, but it helps us follow up if we need clarification or want to thank you for your contribution.
              </p>

              <div className="form-group">
                <label htmlFor="reporterName">Your Name</label>
                <input
                  type="text"
                  id="reporterName"
                  name="reporterName"
                  value={formData.reporterName}
                  onChange={handleChange}
                  placeholder="Enter your name..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="reporterEmail">Your Email</label>
                <input
                  type="email"
                  id="reporterEmail"
                  name="reporterEmail"
                  value={formData.reporterEmail}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="allowContact"
                    checked={formData.allowContact}
                    onChange={handleChange}
                  />
                  <span>You may contact me about this report</span>
                </label>
                <p className="field-help">Check this if we can reach out for more information</p>
              </div>
            </div>

            <div className="form-section privacy-section">
              <h2>Privacy & Compliance</h2>

              <div className="privacy-notice">
                <h3>How we handle your report:</h3>
                <ul>
                  <li>Your report will be reviewed by our editorial team</li>
                  <li>Contact information (if provided) will only be used to follow up on this report</li>
                  <li>We do not sell, share, or distribute your personal information</li>
                  <li>Reports are retained for quality assurance purposes</li>
                  <li>You can request deletion of your information at any time</li>
                </ul>
              </div>

              <div className="form-group checkbox-group required-checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="privacyConsent"
                    checked={formData.privacyConsent}
                    onChange={handleChange}
                    required
                  />
                  <span>
                    I have read and agree to the <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and understand how my information will be used <span className="required">*</span>
                  </span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting || !formData.privacyConsent}
              >
                {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>

      <style jsx>{`
        .report-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .page-header h1 {
          font-size: 2.5rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .page-description {
          font-size: 1.125rem;
          color: var(--text-secondary);
          line-height: 1.7;
          max-width: 700px;
          margin: 0 auto;
        }

        .report-form {
          background: white;
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 2.5rem;
        }

        .form-section {
          margin-bottom: 2.5rem;
          padding-bottom: 2.5rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .form-section:last-of-type {
          border-bottom: none;
          margin-bottom: 2rem;
          padding-bottom: 0;
        }

        .form-section h2 {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .section-description {
          color: var(--text-secondary);
          font-size: 0.9375rem;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          font-family: 'Lato', sans-serif;
        }

        .required {
          color: #e53e3e;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-primary);
          border-radius: 6px;
          font-size: 1rem;
          font-family: 'Lato', sans-serif;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--accent-primary);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 100px;
        }

        .field-help {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-top: 0.375rem;
          line-height: 1.5;
        }

        .checkbox-group {
          margin-top: 1rem;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
          font-weight: 400;
        }

        .checkbox-label input[type="checkbox"] {
          width: auto;
          margin-top: 0.25rem;
          cursor: pointer;
          flex-shrink: 0;
        }

        .checkbox-label span {
          line-height: 1.6;
        }

        .checkbox-label a {
          color: var(--accent-primary);
          text-decoration: underline;
        }

        .checkbox-label a:hover {
          color: var(--accent-secondary);
        }

        .required-checkbox .checkbox-label {
          font-weight: 500;
        }

        .privacy-section {
          background: #f8f9fa;
          padding: 2rem;
          border-radius: 8px;
          margin-top: 2rem;
        }

        .privacy-notice {
          background: white;
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .privacy-notice h3 {
          font-size: 1.125rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .privacy-notice ul {
          list-style-position: outside;
          padding-left: 1.5rem;
          color: var(--text-secondary);
        }

        .privacy-notice li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }

        .form-actions {
          display: flex;
          justify-content: center;
          padding-top: 1.5rem;
        }

        .btn-primary {
          padding: 0.875rem 2rem;
          background: var(--accent-primary);
          color: white;
          border: none;
          border-radius: 6px;
          font-family: 'Lato', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(74, 112, 139, 0.25);
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--accent-secondary);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(74, 112, 139, 0.35);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .success-card {
          background: white;
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 3rem 2rem;
          text-align: center;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: #48bb78;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .success-icon svg {
          width: 48px;
          height: 48px;
          color: white;
        }

        .success-card h2 {
          font-size: 2rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .success-card p {
          font-size: 1.125rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          line-height: 1.7;
        }

        @media (max-width: 768px) {
          .report-page {
            padding: 2rem 1rem;
          }

          .page-header h1 {
            font-size: 2rem;
          }

          .report-form {
            padding: 1.5rem;
          }

          .form-section {
            padding-bottom: 2rem;
            margin-bottom: 2rem;
          }

          .form-section h2 {
            font-size: 1.25rem;
          }

          .privacy-section {
            padding: 1.5rem;
          }
        }
      `}</style>
    </Layout>
  )
}
