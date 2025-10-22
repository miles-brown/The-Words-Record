import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Head from 'next/head'

interface Person {
  id: string
  name: string
  slug: string
}

export default function Suggestions() {
  const [people, setPeople] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const [formData, setFormData] = useState({
    personId: '',
    statementText: '',
    statementDate: '',
    sourceUrl: '',
    additionalContext: '',
    submitterName: '',
    submitterEmail: '',
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
    setIsSubmitting(true)

    // TODO: Implement actual submission logic
    // For now, simulate API call
    setTimeout(() => {
      setSubmitStatus('success')
      setIsSubmitting(false)
      setFormData({
        personId: '',
        statementText: '',
        statementDate: '',
        sourceUrl: '',
        additionalContext: '',
        submitterName: '',
        submitterEmail: '',
      })

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000)
    }, 1500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Layout>
      <Head>
        <title>Submit a Suggestion - The Words Record</title>
        <meta name="description" content="Know of a statement by a public figure that could be included? Submit your suggestion for inclusion in The Words Record." />
      </Head>

      <div className="suggestions-page">
        <div className="page-header">
          <h1>Submit a Suggestion</h1>
          <p className="page-description">
            Know of a statement by a public figure that could be included? Use this form to nominate a statement for inclusion in The Words Record.
          </p>
        </div>

        {submitStatus === 'success' ? (
          <div className="success-card">
            <div className="success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </div>
            <h2>Thank you for your suggestion!</h2>
            <p>We'll review your submission and may contact you if we need additional information.</p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setSubmitStatus('idle')}
            >
              Submit Another Suggestion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="suggestion-form">
            <div className="form-section">
              <h2>Statement Details</h2>

              <div className="form-group">
                <label htmlFor="personId">
                  Public Figure <span className="required">*</span>
                </label>
                <select
                  id="personId"
                  name="personId"
                  value={formData.personId}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                >
                  <option value="">Select a person...</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
                <p className="field-help">Select the public figure who made the statement</p>
              </div>

              <div className="form-group">
                <label htmlFor="statementText">
                  Statement Text <span className="required">*</span>
                </label>
                <textarea
                  id="statementText"
                  name="statementText"
                  value={formData.statementText}
                  onChange={handleChange}
                  rows={6}
                  required
                  placeholder="Enter the exact statement or quote..."
                />
                <p className="field-help">Provide the exact wording of the statement</p>
              </div>

              <div className="form-group">
                <label htmlFor="statementDate">
                  Date of Statement <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="statementDate"
                  name="statementDate"
                  value={formData.statementDate}
                  onChange={handleChange}
                  required
                />
                <p className="field-help">When was this statement made?</p>
              </div>

              <div className="form-group">
                <label htmlFor="sourceUrl">
                  Source URL <span className="required">*</span>
                </label>
                <input
                  type="url"
                  id="sourceUrl"
                  name="sourceUrl"
                  value={formData.sourceUrl}
                  onChange={handleChange}
                  required
                  placeholder="https://..."
                />
                <p className="field-help">Link to the original source (news article, video, transcript, etc.)</p>
              </div>

              <div className="form-group">
                <label htmlFor="additionalContext">
                  Additional Context (Optional)
                </label>
                <textarea
                  id="additionalContext"
                  name="additionalContext"
                  value={formData.additionalContext}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Provide any additional context that might be helpful..."
                />
                <p className="field-help">Any background information or context that would help us evaluate this statement</p>
              </div>
            </div>

            <div className="form-section">
              <h2>Your Information (Optional)</h2>
              <p className="section-description">
                Providing your contact information is optional, but it helps us reach out if we need clarification.
              </p>

              <div className="form-group">
                <label htmlFor="submitterName">Your Name</label>
                <input
                  type="text"
                  id="submitterName"
                  name="submitterName"
                  value={formData.submitterName}
                  onChange={handleChange}
                  placeholder="Enter your name..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="submitterEmail">Your Email</label>
                <input
                  type="email"
                  id="submitterEmail"
                  name="submitterEmail"
                  value={formData.submitterEmail}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
              </button>
            </div>
          </form>
        )}
      </div>

      <style jsx>{`
        .suggestions-page {
          max-width: 800px;
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
          max-width: 600px;
          margin: 0 auto;
        }

        .suggestion-form {
          background: white;
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 2.5rem;
        }

        .form-section {
          margin-bottom: 2.5rem;
        }

        .form-section:last-of-type {
          margin-bottom: 2rem;
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
        }

        .form-actions {
          display: flex;
          justify-content: center;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-primary);
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
          opacity: 0.6;
          cursor: not-allowed;
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
        }

        @media (max-width: 768px) {
          .suggestions-page {
            padding: 2rem 1rem;
          }

          .page-header h1 {
            font-size: 2rem;
          }

          .suggestion-form {
            padding: 1.5rem;
          }

          .form-section h2 {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </Layout>
  )
}
