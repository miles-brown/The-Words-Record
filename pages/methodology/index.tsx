import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'

export default function MethodologyPage() {
  return (
    <Layout>
      <Head>
        <title>Methodology | Who Said What</title>
        <meta name="description" content="Our verification process and methodology for documenting public statements" />
      </Head>

      <div className="methodology-page">
        <header className="page-header">
          <h1>Our Methodology</h1>
          <p className="subtitle">
            How we verify, document, and preserve public statements
          </p>
        </header>

        <div className="content-sections">
          <section className="overview-section">
            <h2>Overview</h2>
            <p>
              Who Said What employs a rigorous, multi-stage verification process to ensure that
              all documented statements are accurate, properly attributed, and verifiable. Our
              methodology combines journalistic standards with academic citation practices.
            </p>
          </section>

          <section className="process-section">
            <h2>Verification Process</h2>

            <div className="process-stage">
              <h3>1. Source Discovery & Collection</h3>
              <p>
                We monitor a wide range of sources including:
              </p>
              <ul>
                <li>Reputable news outlets and wire services</li>
                <li>Official statements from government and institutional channels</li>
                <li>Verified social media accounts</li>
                <li>Press releases and official communications</li>
                <li>Video and audio recordings of speeches and interviews</li>
                <li>Academic publications and reports</li>
              </ul>
            </div>

            <div className="process-stage">
              <h3>2. Primary Source Verification</h3>
              <p>
                Before adding any statement to our database, we:
              </p>
              <ul>
                <li>Locate the primary source (original video, audio, or official text)</li>
                <li>Verify the date and context of the statement</li>
                <li>Confirm proper attribution to the speaker</li>
                <li>Check for any clarifications or corrections issued after publication</li>
                <li>Cross-reference with multiple sources when possible</li>
              </ul>
            </div>

            <div className="process-stage">
              <h3>3. Credibility Assessment</h3>
              <p>
                We rate source credibility on a four-tier system:
              </p>
              <div className="credibility-ratings">
                <div className="rating high">
                  <strong>HIGH</strong>
                  <p>
                    Primary sources: Official statements, verified videos/audio, government
                    records, court documents
                  </p>
                </div>
                <div className="rating medium">
                  <strong>MEDIUM</strong>
                  <p>
                    Established news outlets with editorial oversight, reputable journalists,
                    credible secondary sources
                  </p>
                </div>
                <div className="rating low">
                  <strong>LOW</strong>
                  <p>
                    Unverified social media, opinion pieces, sources with known bias or
                    reliability issues
                  </p>
                </div>
                <div className="rating unknown">
                  <strong>UNKNOWN</strong>
                  <p>
                    Sources that haven't been fully evaluated or lack sufficient information
                    for credibility assessment
                  </p>
                </div>
              </div>
            </div>

            <div className="process-stage">
              <h3>4. Documentation & Citation</h3>
              <p>
                Every statement in our database includes:
              </p>
              <ul>
                <li>Full Harvard-style citation of all sources</li>
                <li>Date and time of statement (when available)</li>
                <li>Context and relevant background information</li>
                <li>Links to primary and secondary sources</li>
                <li>Related statements and responses</li>
              </ul>
            </div>

            <div className="process-stage">
              <h3>5. Archival & Preservation</h3>
              <p>
                To ensure long-term verifiability:
              </p>
              <ul>
                <li>All web sources are archived using Internet Archive and similar services</li>
                <li>Screenshots and PDFs are created for critical sources</li>
                <li>Archive snapshots are linked in all citations</li>
                <li>Regular monitoring checks for broken or modified sources</li>
                <li>Alternative sources are documented when available</li>
              </ul>
            </div>
          </section>

          <section className="citation-section">
            <h2>Citation Standards</h2>
            <p>
              We use Harvard referencing style for all citations. This includes:
            </p>
            <div className="citation-example">
              <h4>Example Citation:</h4>
              <p className="example-text">
                Smith, J. (2024) 'Statement on International Relations', The Guardian, 15 March.
                Available at: https://theguardian.com/article [Archived at:
                https://web.archive.org/...] (Accessed: 16 March 2024).
              </p>
            </div>
            <p>
              All citations can be copied directly from our site for academic or research
              purposes. See our <Link href="/sources">Sources</Link> page for the complete
              bibliography.
            </p>
          </section>

          <section className="quality-section">
            <h2>Quality Assurance</h2>
            <p>
              We maintain quality through:
            </p>
            <ul>
              <li><strong>Regular audits</strong> - Periodic reviews of existing entries for accuracy</li>
              <li><strong>Source monitoring</strong> - Automated checks for broken links and source availability</li>
              <li><strong>Community feedback</strong> - User-submitted corrections and additional sources</li>
              <li><strong>Update tracking</strong> - Clear documentation of all changes and updates</li>
              <li><strong>Transparency</strong> - All verification status and credibility ratings are publicly visible</li>
            </ul>
          </section>

          <section className="limitations-section">
            <h2>Limitations & Caveats</h2>
            <p>
              We acknowledge the following limitations:
            </p>
            <ul>
              <li>
                <strong>Language barriers</strong> - Most sources are in English; translations
                may introduce inaccuracies
              </li>
              <li>
                <strong>Source availability</strong> - Some historical statements may lack
                verifiable primary sources
              </li>
              <li>
                <strong>Context</strong> - Written statements may not fully capture tone,
                delivery, or non-verbal communication
              </li>
              <li>
                <strong>Timeliness</strong> - There may be delays between when a statement is
                made and when it appears in our database
              </li>
              <li>
                <strong>Selection</strong> - Not all public statements are documented; we
                prioritize based on public interest and significance
              </li>
            </ul>
          </section>

          <section className="corrections-section">
            <h2>Corrections & Updates</h2>
            <p>
              We welcome corrections and additional verified sources. If you find an error or
              have additional information:
            </p>
            <ol>
              <li>Contact us with the specific statement and issue</li>
              <li>Provide verifiable sources for your correction</li>
              <li>We will review and verify the information</li>
              <li>Corrections are implemented with update notes</li>
              <li>Significant changes are documented in the entry history</li>
            </ol>
            <div className="contact-cta">
              <Link href="/contact" className="cta-button">Submit a Correction</Link>
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .methodology-page {
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

        .subtitle {
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

        .content-sections h3 {
          font-size: 1.5rem;
          margin: 0 0 1rem 0;
          color: var(--text-primary);
        }

        .content-sections h4 {
          font-size: 1.2rem;
          margin: 0 0 0.75rem 0;
          color: var(--text-primary);
        }

        .content-sections p {
          font-size: 1.05rem;
          line-height: 1.8;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .content-sections ul, .content-sections ol {
          font-size: 1.05rem;
          line-height: 1.8;
          color: var(--text-secondary);
          margin: 1rem 0 1rem 1.5rem;
        }

        .content-sections li {
          margin-bottom: 0.5rem;
        }

        .content-sections strong {
          color: var(--text-primary);
        }

        .process-stage {
          background: var(--card-background);
          border-left: 4px solid var(--accent-color);
          padding: 1.5rem;
          margin-bottom: 2rem;
          border-radius: 4px;
        }

        .process-stage h3 {
          margin-top: 0;
        }

        .credibility-ratings {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .rating {
          border-radius: 6px;
          padding: 1rem;
          text-align: center;
        }

        .rating.high {
          background: rgba(34, 197, 94, 0.1);
          border: 2px solid #22c55e;
        }

        .rating.medium {
          background: rgba(234, 179, 8, 0.1);
          border: 2px solid #eab308;
        }

        .rating.low {
          background: rgba(239, 68, 68, 0.1);
          border: 2px solid #ef4444;
        }

        .rating.unknown {
          background: rgba(148, 163, 184, 0.1);
          border: 2px solid #94a3b8;
        }

        .rating strong {
          display: block;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        .rating p {
          font-size: 0.9rem;
          margin: 0;
        }

        .citation-example {
          background: #f8fafc;
          border: 1px solid var(--border-color);
          border-left: 4px solid var(--accent-color);
          padding: 1.5rem;
          border-radius: 4px;
          margin: 1.5rem 0;
        }

        .example-text {
          font-family: 'Georgia', serif;
          font-size: 1rem;
          font-style: italic;
          margin: 0.5rem 0 0 0;
        }

        .contact-cta {
          text-align: center;
          margin-top: 2rem;
        }

        .cta-button {
          display: inline-block;
          background: var(--accent-color);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .cta-button:hover {
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .page-header h1 {
            font-size: 2rem;
          }

          .subtitle {
            font-size: 1.1rem;
          }

          .credibility-ratings {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  )
}
