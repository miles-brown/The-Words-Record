import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'

export default function AboutPage() {
  return (
    <Layout>
      <Head>
        <title>About | Who Said What</title>
        <meta name="description" content="Learn about Who Said What - our mission to document, verify, and preserve public statements for accountability" />
      </Head>

      <div className="about-page">
        <header className="page-header">
          <h1>About Who Said What</h1>
          <p className="tagline">
            Documenting public statements for accountability and truth
          </p>
        </header>

        <div className="content-sections">
          <section className="mission-section">
            <h2>Our Mission</h2>
            <p>
              Who Said What is dedicated to creating a comprehensive, verified archive of public
              statements made by public figures, organizations, and institutions. We believe that
              accountability begins with accurate documentation.
            </p>
            <p>
              In an era of rapidly changing narratives and information overload, we provide a
              reliable reference point for what was actually said, when it was said, and in what
              context. Every statement in our database is meticulously sourced and cited using
              Harvard referencing standards.
            </p>
          </section>

          <section className="values-section">
            <h2>Our Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon"></div>
                <h3>Accuracy</h3>
                <p>
                  Every statement is verified against primary sources. We cite our sources using
                  academic standards and maintain archives for long-term verification.
                </p>
              </div>

              <div className="value-card">
                <div className="value-icon">�</div>
                <h3>Neutrality</h3>
                <p>
                  We document statements without editorial commentary. Our role is to preserve
                  the record, not to interpret it.
                </p>
              </div>

              <div className="value-card">
                <div className="value-icon">=</div>
                <h3>Transparency</h3>
                <p>
                  All our sources are publicly accessible. We show our methodology and make our
                  verification process clear to all users.
                </p>
              </div>

              <div className="value-card">
                <div className="value-icon">=�</div>
                <h3>Preservation</h3>
                <p>
                  We archive sources to ensure that statements remain verifiable even if
                  original sources are removed or altered.
                </p>
              </div>
            </div>
          </section>

          <section className="what-we-do-section">
            <h2>What We Document</h2>
            <ul className="documentation-list">
              <li>
                <strong>Public Statements</strong> - Speeches, interviews, social media posts,
                and official announcements by public figures
              </li>
              <li>
                <strong>Responses & Reactions</strong> - How individuals and organizations
                respond to events and allegations
              </li>
              <li>
                <strong>Cases & Events</strong> - Documented timelines of significant events
                with all related statements
              </li>
              <li>
                <strong>Sources & Citations</strong> - Comprehensive bibliography of all source
                materials with archive snapshots
              </li>
            </ul>
          </section>

          <section className="how-we-work-section">
            <h2>How We Work</h2>
            <div className="process-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Collection</h3>
                  <p>
                    We monitor public statements from credible news sources, official channels,
                    and verified social media accounts.
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Verification</h3>
                  <p>
                    Each statement is cross-referenced with primary sources. We verify dates,
                    context, and attribution.
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Documentation</h3>
                  <p>
                    Statements are documented with full Harvard-style citations, context, and
                    relevant background information.
                  </p>
                </div>
              </div>

              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Archival</h3>
                  <p>
                    All sources are archived using web archiving services to ensure long-term
                    availability and verification.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="standards-section">
            <h2>Our Standards</h2>
            <p>
              We adhere to rigorous academic and journalistic standards in all our work:
            </p>
            <ul>
              <li>All sources must be verifiable and from credible outlets</li>
              <li>Primary sources are preferred over secondary sources</li>
              <li>Citations follow Harvard referencing style</li>
              <li>Archive snapshots are created for all web sources</li>
              <li>Updates and corrections are clearly documented</li>
              <li>Source credibility ratings are transparently applied</li>
            </ul>
          </section>

          <section className="contact-section">
            <h2>Get In Touch</h2>
            <p>
              We welcome corrections, additional sources, and feedback. If you have verified
              information that should be added to our database, please contact us.
            </p>
            <div className="contact-links">
              <Link href="/contact" className="contact-link">Contact Us</Link>
              <Link href="/methodology" className="contact-link">Our Methodology</Link>
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .about-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid var(--border-color);
        }

        .page-header h1 {
          font-size: 3rem;
          margin: 0 0 1rem 0;
          color: var(--text-primary);
        }

        .tagline {
          font-size: 1.3rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .content-sections section {
          margin-bottom: 3rem;
        }

        .content-sections h2 {
          font-size: 2rem;
          margin: 0 0 1.5rem 0;
          color: var(--text-primary);
        }

        .content-sections p {
          font-size: 1.05rem;
          line-height: 1.8;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .value-card {
          background: var(--card-background);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1.5rem;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .value-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .value-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .value-card h3 {
          font-size: 1.3rem;
          margin: 0 0 0.75rem 0;
          color: var(--text-primary);
        }

        .value-card p {
          font-size: 0.95rem;
          margin: 0;
        }

        .documentation-list {
          list-style: none;
          padding: 0;
          margin-top: 1.5rem;
        }

        .documentation-list li {
          background: var(--card-background);
          border-left: 4px solid var(--accent-color);
          padding: 1rem 1.5rem;
          margin-bottom: 1rem;
          border-radius: 4px;
          font-size: 1.05rem;
          line-height: 1.6;
        }

        .documentation-list strong {
          color: var(--text-primary);
        }

        .process-steps {
          margin-top: 1.5rem;
        }

        .step {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .step-number {
          flex-shrink: 0;
          width: 50px;
          height: 50px;
          background: var(--accent-color);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .step-content h3 {
          font-size: 1.3rem;
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
        }

        .step-content p {
          margin: 0;
        }

        .standards-section ul {
          list-style: none;
          padding: 0;
          margin-top: 1.5rem;
        }

        .standards-section li {
          padding: 0.75rem 0 0.75rem 2rem;
          position: relative;
          font-size: 1.05rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        .standards-section li:before {
          content: "�";
          position: absolute;
          left: 0;
          color: var(--accent-color);
          font-weight: bold;
        }

        .contact-section {
          background: var(--card-background);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
        }

        .contact-links {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 1.5rem;
        }

        .contact-link {
          background: var(--accent-color);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .contact-link:hover {
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .page-header h1 {
            font-size: 2rem;
          }

          .tagline {
            font-size: 1.1rem;
          }

          .values-grid {
            grid-template-columns: 1fr;
          }

          .step {
            flex-direction: column;
          }

          .step-number {
            align-self: flex-start;
          }

          .contact-links {
            flex-direction: column;
          }
        }
      `}</style>
    </Layout>
  )
}
