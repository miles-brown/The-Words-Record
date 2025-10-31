import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'
import { useState, useEffect } from 'react'

interface DonationMethod {
  id: string
  name: string
  url: string
  icon: string
  description: string
  isActive: boolean
  displayOrder: number
}

export default function DonatePageRedesigned() {
  const [donationMethods, setDonationMethods] = useState<DonationMethod[]>([
    {
      id: 'buymeacoffee',
      name: 'Buy Me a Coffee',
      url: 'https://buymeacoffee.com/thewordsrecord',
      icon: '☕',
      description: 'Quick and easy one-time support',
      isActive: true,
      displayOrder: 1
    },
    {
      id: 'stripe',
      name: 'Stripe',
      url: '#stripe',
      icon: '💳',
      description: 'Secure recurring or one-time donations',
      isActive: true,
      displayOrder: 2
    },
    {
      id: 'paypal',
      name: 'PayPal',
      url: '#paypal',
      icon: '💰',
      description: 'Trusted worldwide payment platform',
      isActive: true,
      displayOrder: 3
    }
  ])

  // Load donation methods from API in production
  useEffect(() => {
    fetchDonationMethods()
  }, [])

  const fetchDonationMethods = async () => {
    try {
      const res = await fetch('/api/donation-methods')
      if (res.ok) {
        const data = await res.json()
        if (data && data.length > 0) {
          setDonationMethods(data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch donation methods:', error)
    }
  }

  const activeMethods = donationMethods
    .filter(m => m.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder)

  return (
    <Layout>
      <Head>
        <title>Support Our Mission - The Words Record</title>
        <meta
          name="description"
          content="Support The Words Record's mission to preserve factual documentation. Your contribution keeps truth accessible and independent."
        />
        <meta property="og:title" content="Support Our Mission - The Words Record" />
        <meta
          property="og:description"
          content="Help maintain independent documentation of verified public statements and discourse."
        />
      </Head>

      <main className="donate-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-inner">
            <h1 className="hero-title">Support Independent Documentation</h1>
            <div className="hero-divider"></div>
            <p className="hero-text">
              The Words Record operates without advertising or sponsored content.
              Every contribution directly supports the preservation of factual records
              and keeps our archive accessible to everyone.
            </p>
          </div>
        </section>

        {/* Quick Donate Buttons */}
        <section className="quick-donate">
          <div className="container">
            <h2>Choose Your Preferred Method</h2>
            <div className="donation-grid">
              {activeMethods.map((method) => (
                <a
                  key={method.id}
                  href={method.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="donation-card"
                >
                  <span className="donation-icon">{method.icon}</span>
                  <h3>{method.name}</h3>
                  <p>{method.description}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="impact-section">
          <div className="container">
            <h2>Your Impact</h2>
            <p className="section-intro">
              Every contribution helps maintain our commitment to factual, unbiased documentation.
            </p>
            <div className="impact-grid">
              <div className="impact-item">
                <div className="amount">£15</div>
                <div className="description">Domain Registration</div>
                <div className="detail">Keeps our site accessible for one year</div>
              </div>
              <div className="impact-item">
                <div className="amount">£30</div>
                <div className="description">Database Hosting</div>
                <div className="detail">Maintains all records and archives for one year</div>
              </div>
              <div className="impact-item">
                <div className="amount">£40</div>
                <div className="description">Web Infrastructure</div>
                <div className="detail">Powers the website and API for one year</div>
              </div>
              <div className="impact-item">
                <div className="amount">£100</div>
                <div className="description">Research Tools</div>
                <div className="detail">Verification and fact-checking resources</div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Support Section */}
        <section className="why-support">
          <div className="container">
            <h2>Why Your Support Matters</h2>
            <div className="reasons-grid">
              <div className="reason-card">
                <div className="reason-number">1</div>
                <h3>Independence</h3>
                <p>
                  No corporate sponsors, no political affiliations.
                  Your support ensures we remain neutral and factual.
                </p>
              </div>
              <div className="reason-card">
                <div className="reason-number">2</div>
                <h3>Accessibility</h3>
                <p>
                  Keep verified information free and accessible to everyone,
                  without paywalls or registration requirements.
                </p>
              </div>
              <div className="reason-card">
                <div className="reason-number">3</div>
                <h3>Preservation</h3>
                <p>
                  Protect the historical record from deletion, distortion,
                  or manipulation by maintaining independent archives.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Other Ways Section */}
        <section className="other-ways">
          <div className="container">
            <h2>Other Ways to Help</h2>
            <div className="help-methods">
              <div className="help-card">
                <svg className="help-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
                </svg>
                <h3>Share & Cite</h3>
                <p>
                  Reference our documentation in your research, articles, or social media.
                  Visibility helps maintain the factual record.
                </p>
              </div>
              <div className="help-card">
                <svg className="help-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3>Contribute Content</h3>
                <p>
                  Submit verified statements or corrections through our report system.
                  Community input strengthens our documentation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Transparency Section */}
        <section className="transparency">
          <div className="container">
            <div className="transparency-content">
              <h2>Our Commitment to Transparency</h2>
              <p>
                We believe in complete openness about our operations and funding.
                Every donation is tracked and reported in our periodic transparency summaries,
                detailing exactly how contributions support the project's infrastructure and development.
              </p>
              <Link href="/methodology">
                <button className="btn-learn-more">
                  Learn About Our Methodology
                  <svg className="btn-arrow" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Thank You Section */}
        <section className="thank-you">
          <div className="container">
            <div className="thank-you-content">
              <h2>Thank You</h2>
              <p>
                Your support — whether through donations, sharing, or contributions —
                helps preserve the integrity of public discourse. Together, we ensure
                that factual records remain accessible for future generations.
              </p>
              <div className="final-cta">
                {activeMethods.slice(0, 2).map((method) => (
                  <a
                    key={method.id}
                    href={method.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-donate"
                  >
                    {method.icon} Donate via {method.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        /* Using the design system colors */
        :root {
          --bg-primary: #f9f8f6;
          --bg-secondary: #f2f1ef;
          --text-primary: #2f3538;
          --text-secondary: #5f6f7a;
          --accent: #4a5f71;
          --border-light: #e8e6e3;
          --border-dark: #d4d2cf;
        }

        .donate-page {
          background: var(--bg-primary);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* Hero Section */
        .hero-section {
          background: white;
          padding: 4rem 2rem;
          text-align: center;
          border-bottom: 1px solid var(--border-light);
        }

        .hero-inner {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-title {
          font-family: 'Cinzel', serif;
          font-size: 2.5rem;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          letter-spacing: 0.02em;
        }

        .hero-divider {
          width: 80px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          margin: 0 auto 2rem;
        }

        .hero-text {
          font-size: 1.15rem;
          line-height: 1.8;
          color: var(--text-secondary);
          max-width: 650px;
          margin: 0 auto;
        }

        /* Quick Donate Section */
        .quick-donate {
          padding: 4rem 0;
        }

        .quick-donate h2 {
          font-family: 'Cinzel', serif;
          font-size: 2rem;
          text-align: center;
          color: var(--text-primary);
          margin-bottom: 3rem;
        }

        .donation-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .donation-card {
          background: white;
          padding: 2.5rem 2rem;
          border-radius: 2px;
          border: 1px solid var(--border-light);
          text-align: center;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .donation-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: var(--accent);
        }

        .donation-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 1rem;
        }

        .donation-card h3 {
          font-family: 'Inter', sans-serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .donation-card p {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Impact Section */
        .impact-section {
          background: var(--bg-secondary);
          padding: 4rem 0;
        }

        .impact-section h2 {
          font-family: 'Cinzel', serif;
          font-size: 2rem;
          text-align: center;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .section-intro {
          text-align: center;
          color: var(--text-secondary);
          font-size: 1.1rem;
          margin-bottom: 3rem;
        }

        .impact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .impact-item {
          background: white;
          padding: 2rem;
          border-radius: 2px;
          text-align: center;
          border: 1px solid var(--border-light);
        }

        .amount {
          font-family: 'Cinzel', serif;
          font-size: 2.5rem;
          font-weight: 600;
          color: var(--accent);
          margin-bottom: 0.5rem;
        }

        .description {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }

        .detail {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* Why Support Section */
        .why-support {
          padding: 4rem 0;
          background: white;
        }

        .why-support h2 {
          font-family: 'Cinzel', serif;
          font-size: 2rem;
          text-align: center;
          color: var(--text-primary);
          margin-bottom: 3rem;
        }

        .reasons-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .reason-card {
          padding: 2rem;
          text-align: center;
          position: relative;
        }

        .reason-number {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--accent);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cinzel', serif;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 auto 1.5rem;
        }

        .reason-card h3 {
          font-family: 'Inter', sans-serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .reason-card p {
          font-size: 1rem;
          line-height: 1.7;
          color: var(--text-secondary);
        }

        /* Other Ways Section */
        .other-ways {
          background: var(--bg-secondary);
          padding: 4rem 0;
        }

        .other-ways h2 {
          font-family: 'Cinzel', serif;
          font-size: 2rem;
          text-align: center;
          color: var(--text-primary);
          margin-bottom: 3rem;
        }

        .help-methods {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .help-card {
          background: white;
          padding: 2.5rem;
          border-radius: 2px;
          border: 1px solid var(--border-light);
          text-align: center;
        }

        .help-icon {
          width: 48px;
          height: 48px;
          color: var(--accent);
          margin: 0 auto 1.5rem;
          display: block;
        }

        .help-card h3 {
          font-family: 'Inter', sans-serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .help-card p {
          font-size: 1rem;
          line-height: 1.7;
          color: var(--text-secondary);
        }

        /* Transparency Section */
        .transparency {
          padding: 4rem 0;
          background: white;
        }

        .transparency-content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
          padding: 0 2rem;
        }

        .transparency h2 {
          font-family: 'Cinzel', serif;
          font-size: 2rem;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .transparency p {
          font-size: 1.1rem;
          line-height: 1.8;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .btn-learn-more {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-primary);
          background: transparent;
          border: 1px solid var(--border-dark);
          padding: 0.75rem 2rem;
          border-radius: 2px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .btn-learn-more:hover {
          background: var(--text-primary);
          color: white;
          transform: translateY(-2px);
        }

        .btn-arrow {
          width: 20px;
          height: 20px;
          transition: transform 0.3s ease;
        }

        .btn-learn-more:hover .btn-arrow {
          transform: translateX(4px);
        }

        /* Thank You Section */
        .thank-you {
          background: var(--bg-secondary);
          padding: 4rem 0;
        }

        .thank-you-content {
          max-width: 700px;
          margin: 0 auto;
          text-align: center;
          padding: 0 2rem;
        }

        .thank-you h2 {
          font-family: 'Cinzel', serif;
          font-size: 2rem;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .thank-you p {
          font-size: 1.1rem;
          line-height: 1.8;
          color: var(--text-secondary);
          margin-bottom: 2.5rem;
        }

        .final-cta {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-donate {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          background: var(--accent);
          color: white;
          padding: 0.85rem 1.75rem;
          border-radius: 2px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .btn-donate:hover {
          background: var(--text-primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }

          .hero-text {
            font-size: 1.05rem;
          }

          .donation-grid {
            grid-template-columns: 1fr;
          }

          .impact-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .reasons-grid,
          .help-methods {
            grid-template-columns: 1fr;
          }

          .amount {
            font-size: 2rem;
          }

          .final-cta {
            flex-direction: column;
          }

          .btn-donate {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 1.75rem;
          }

          .hero-text {
            font-size: 1rem;
          }

          .impact-grid {
            grid-template-columns: 1fr;
          }

          .container {
            padding: 0 1rem;
          }

          .donation-card,
          .help-card {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </Layout>
  )
}