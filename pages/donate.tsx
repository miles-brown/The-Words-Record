import Head from 'next/head'
import Link from 'next/link'

export default function DonatePage() {
  return (
    <>
      <Head>
        <title>Ways to Contribute - The Words Record</title>
        <meta
          name="description"
          content="Support The Words Record - an independent project documenting verified statements and public discourse. Your contribution keeps truth accessible."
        />
        <meta property="og:title" content="Ways to Contribute - The Words Record" />
        <meta
          property="og:description"
          content="Support independent documentation of verified statements and public discourse."
        />
      </Head>

      <main className="donate-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <h1>Your support keeps truth accessible.</h1>
            <p className="intro-text">
              The Words Record is an independent, non-commercial project documenting verified statements,
              responses, and context from public life. We don't run ads or sponsored content — every
              contribution directly supports the upkeep and maintenance of the site.
            </p>
            <div className="cta-buttons">
              <a
                href="https://buymeacoffee.com/thewordsrecord"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Donate via Buy Me a Coffee
              </a>
              <a
                href="#stripe"
                className="btn btn-primary"
              >
                Donate via Stripe
              </a>
              <a
                href="#paypal"
                className="btn btn-primary"
              >
                Donate via PayPal
              </a>
            </div>
          </div>
        </section>

        {/* Where Your Donation Goes */}
        <section className="section section-purple">
          <div className="container">
            <h2>Where your donation goes</h2>
            <p className="section-intro">
              Your donation helps keep The Words Record online, transparent, and accessible to everyone.
              Below are examples of what your support covers:
            </p>
            <div className="cost-breakdown">
              <div className="cost-item">
                <span className="cost-amount">£40</span>
                <span className="cost-description">pays for our web hosting for one year.</span>
              </div>
              <div className="cost-item">
                <span className="cost-amount">£15</span>
                <span className="cost-description">pays for our domain name for one year.</span>
              </div>
              <div className="cost-item">
                <span className="cost-amount">£30</span>
                <span className="cost-description">
                  pays for our database to stay alive and all content to remain free for the public for one year.
                </span>
              </div>
            </div>
            <p className="section-footer">
              Every pound goes directly toward maintaining uptime, research tools, and future development.
            </p>
          </div>
        </section>

        {/* Ways to Contribute */}
        <section className="section section-blue">
          <div className="container">
            <h2>Ways to contribute</h2>
            <div className="contribution-methods">
              <div className="method-card">
                <div className="method-icon">💳</div>
                <h3>Make a one-time or monthly donation</h3>
                <p>
                  Support through Stripe, PayPal, or Buy Me a Coffee — whichever is most convenient.
                </p>
              </div>
              <div className="method-card">
                <div className="method-icon">🔗</div>
                <h3>Share on social media, spread the word and reference the site</h3>
                <p>
                  Citing The Words Record helps maintain factual visibility in search results and archives.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Accountability & Transparency */}
        <section className="section section-green">
          <div className="container">
            <h2>Accountability & transparency</h2>
            <p className="section-intro">
              We value openness. Every donation supports the independence, accuracy, and preservation of
              factual records. The project publishes occasional transparency summaries detailing hosting,
              database, and development costs.
            </p>
            {/* <a href="/transparency" className="btn btn-secondary">
              View Transparency Report →
            </a> */}
          </div>
        </section>

        {/* Thank You Note */}
        <section className="section section-orange">
          <div className="container">
            <h2>Thank you</h2>
            <p className="section-intro">
              Every contribution — large or small — helps protect the factual record from deletion,
              distortion, or neglect. Thank you for helping to preserve independent documentation for future
              generations.
            </p>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="footer-cta">
          <div className="container">
            <h2>Ready to help?</h2>
            <div className="cta-buttons">
              <a
                href="https://buymeacoffee.com/thewordsrecord"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Donate via Buy Me a Coffee
              </a>
              <a
                href="#stripe"
                className="btn btn-primary"
              >
                Donate via Stripe
              </a>
              <a
                href="#paypal"
                className="btn btn-primary"
              >
                Donate via PayPal
              </a>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .donate-page {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 5rem 0;
          text-align: center;
        }

        .hero-section h1 {
          font-size: 3rem;
          font-weight: 700;
          margin: 0 0 1.5rem 0;
          line-height: 1.2;
        }

        .intro-text {
          font-size: 1.25rem;
          line-height: 1.8;
          max-width: 800px;
          margin: 0 auto 2.5rem auto;
          opacity: 0.95;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-block;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
        }

        .btn-primary {
          background: white;
          color: #667eea;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid white;
        }

        .btn-secondary:hover {
          background: white;
          color: #667eea;
        }

        /* Section Styles */
        .section {
          padding: 4rem 0;
        }

        .section h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 1.5rem 0;
          text-align: center;
        }

        .section-intro {
          font-size: 1.125rem;
          line-height: 1.8;
          max-width: 800px;
          margin: 0 auto 2rem auto;
          text-align: center;
        }

        .section-footer {
          font-size: 1rem;
          line-height: 1.8;
          max-width: 800px;
          margin: 2rem auto 0 auto;
          text-align: center;
          font-weight: 500;
        }

        /* Purple Section - Cost Breakdown */
        .section-purple {
          background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
        }

        .cost-breakdown {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 700px;
          margin: 2rem auto;
        }

        .cost-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .cost-amount {
          font-size: 2rem;
          font-weight: 700;
          color: #667eea;
          min-width: 80px;
        }

        .cost-description {
          font-size: 1.125rem;
          line-height: 1.6;
          color: #334155;
        }

        /* Blue Section - Contribution Methods */
        .section-blue {
          background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
        }

        .contribution-methods {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .method-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          text-align: center;
        }

        .method-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .method-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          color: #0f172a;
        }

        .method-card p {
          font-size: 1rem;
          line-height: 1.7;
          color: #475569;
          margin: 0;
        }

        /* Green Section - Transparency */
        .section-green {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        }

        /* Orange Section - Thank You */
        .section-orange {
          background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
        }

        /* Footer CTA */
        .footer-cta {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          padding: 4rem 0;
          text-align: center;
        }

        .footer-cta h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 2rem 0;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-section h1 {
            font-size: 2rem;
          }

          .intro-text {
            font-size: 1rem;
          }

          .section h2 {
            font-size: 2rem;
          }

          .cost-item {
            flex-direction: column;
            text-align: center;
          }

          .cost-amount {
            min-width: auto;
          }

          .contribution-methods {
            grid-template-columns: 1fr;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: stretch;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </>
  )
}
