import { useState } from 'react'

export default function CTASection() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call - replace with actual newsletter API
    setTimeout(() => {
      setSubmitStatus('success')
      setIsSubmitting(false)
      setEmail('')

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000)
    }, 1500)
  }

  return (
    <section className="cta-section" aria-label="Get involved">
      <div className="cta-container">
        <div className="cta-header">
          <h2>Stay Informed</h2>
          <p>Join our community to track public discourse and hold figures accountable</p>
        </div>

        <div className="cta-grid">
          {/* Newsletter Signup */}
          <div className="cta-card cta-primary">
            <div className="card-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
              </svg>
            </div>
            <h3>Newsletter</h3>
            <p>Get notified when new cases are documented and major developments occur</p>

            {submitStatus === 'success' ? (
              <div className="success-message">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                <span>Thanks for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isSubmitting}
                  aria-label="Email address for newsletter"
                  className="email-input"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-subscribe"
                  aria-label="Subscribe to newsletter"
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}

            {submitStatus === 'error' && (
              <p className="error-message">Something went wrong. Please try again.</p>
            )}
          </div>

          {/* Suggest a Case */}
          <div className="cta-card">
            <div className="card-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
              </svg>
            </div>
            <h3>Suggest a Case</h3>
            <p>Know of a public statement that should be documented? Let us know</p>
            <button type="button" className="btn-secondary" onClick={() => {
              // This could open a modal or navigate to a form
              window.location.href = 'mailto:contact@thewordsrecord.com?subject=Case%20Suggestion'
            }}>
              Submit Suggestion
            </button>
          </div>

          {/* Report an Error */}
          <div className="cta-card">
            <div className="card-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
            </div>
            <h3>Report an Error</h3>
            <p>Found an inaccuracy or broken link? Help us maintain quality standards</p>
            <button type="button" className="btn-secondary" onClick={() => {
              window.location.href = 'mailto:contact@thewordsrecord.com?subject=Error%20Report'
            }}>
              Report Issue
            </button>
          </div>
        </div>

        <div className="cta-footer">
          <p className="footer-text">
            The Words Record is an independent project dedicated to preserving accurate public records.
          </p>
        </div>
      </div>

      <style jsx>{`
        .cta-section {
          background: var(--background-primary);
          padding: 4rem 2rem;
          border-top: 1px solid var(--border-primary);
        }

        .cta-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .cta-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .cta-header h2 {
          font-size: 2.5rem;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .cta-header p {
          font-size: 1.15rem;
          color: var(--text-secondary);
        }

        .cta-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .cta-card {
          background: white;
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .cta-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .cta-primary {
          grid-column: 1 / -1;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
        }

        .cta-primary p {
          color: rgba(255, 255, 255, 0.9);
        }

        .card-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cta-primary .card-icon {
          background: rgba(255, 255, 255, 0.2);
        }

        .cta-card:not(.cta-primary) .card-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .card-icon svg {
          width: 24px;
          height: 24px;
          color: white;
        }

        .cta-card h3 {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin: 0;
        }

        .cta-primary h3 {
          color: white;
        }

        .cta-card p {
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .newsletter-form {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .email-input {
          flex: 1;
          padding: 0.875rem 1rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          color: white;
          transition: all 0.2s;
        }

        .email-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }

        .email-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.6);
          background: rgba(255, 255, 255, 0.2);
        }

        .email-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-subscribe {
          padding: 0.875rem 1.75rem;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .btn-subscribe:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        .btn-subscribe:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: auto;
        }

        .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }

        .success-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 1rem;
          border-radius: 8px;
          color: white;
          font-weight: 500;
        }

        .success-message svg {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }

        .error-message {
          color: #ff6b6b;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .cta-footer {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid var(--border-primary);
        }

        .footer-text {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .cta-section {
            padding: 3rem 1.5rem;
          }

          .cta-header h2 {
            font-size: 2rem;
          }

          .cta-header p {
            font-size: 1.05rem;
          }

          .cta-grid {
            gap: 1.5rem;
          }

          .newsletter-form {
            flex-direction: column;
          }

          .btn-subscribe {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .cta-card {
            padding: 1.5rem;
          }

          .cta-header h2 {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </section>
  )
}
