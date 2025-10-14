import Link from 'next/link'

export default function WhatWeDoSection() {
  return (
    <section className="what-we-do-section" aria-label="What we document">
      <div className="content-container">
        <div className="section-grid">
          {/* What We Document */}
          <div className="section-column">
            <div className="column-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
              </svg>
            </div>
            <h3>What We Document</h3>
            <p className="section-intro">
              We preserve a comprehensive record of public discourse on matters of significant public interest.
            </p>
            <ul className="feature-list">
              <li>
                <span className="list-icon" aria-hidden="true">•</span>
                <span><strong>Public Statements:</strong> Speeches, interviews, press conferences, and official declarations</span>
              </li>
              <li>
                <span className="list-icon" aria-hidden="true">•</span>
                <span><strong>Allegations & Claims:</strong> Accusations, controversies, and disputed assertions</span>
              </li>
              <li>
                <span className="list-icon" aria-hidden="true">•</span>
                <span><strong>Responses & Rebuttals:</strong> Official replies, denials, clarifications, and counter-statements</span>
              </li>
              <li>
                <span className="list-icon" aria-hidden="true">•</span>
                <span><strong>Institutional Positions:</strong> Organization statements, policy declarations, and official positions</span>
              </li>
              <li>
                <span className="list-icon" aria-hidden="true">•</span>
                <span><strong>Historical Context:</strong> Background information, timelines, and relevant precedents</span>
              </li>
            </ul>
          </div>

          {/* Who We Cover */}
          <div className="section-column">
            <div className="column-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
                <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
              </svg>
            </div>
            <h3>Who We Cover</h3>
            <p className="section-intro">
              We focus on statements that have significant public impact and come from verifiable sources.
            </p>
            <ul className="feature-list">
              <li>
                <span className="list-icon" aria-hidden="true">•</span>
                <span><strong>Public Figures:</strong> Politicians, government officials, and elected representatives</span>
              </li>
              <li>
                <span className="list-icon" aria-hidden="true">•</span>
                <span><strong>Institutions:</strong> Government agencies, universities, major organizations</span>
              </li>
              <li>
                <span className="list-icon" aria-hidden="true">•</span>
                <span><strong>Media Personalities:</strong> Journalists, commentators, and influential voices</span>
              </li>
              <li>
                <span className="list-icon" aria-hidden="true">•</span>
                <span><strong>Organizations:</strong> NGOs, advocacy groups, political parties, and think tanks</span>
              </li>
              <li>
                <span className="list-icon" aria-hidden="true">•</span>
                <span><strong>Criteria:</strong> Statements must be publicly documented and from credible sources</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="cta-footer">
          <p>Every statement is meticulously sourced and verified.</p>
          <div className="cta-buttons">
            <Link href="/statements">
              <button type="button" className="btn-browse-cases">
                Browse All Cases
              </button>
            </Link>
            <Link href="/about">
              <button type="button" className="btn-learn-more">
                Learn More About Our Mission
              </button>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .what-we-do-section {
          background: var(--background-primary);
          padding: 4rem 2rem;
        }

        .content-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 4rem;
          margin-bottom: 3rem;
        }

        .section-column {
          background: var(--background-secondary);
          padding: 2.5rem;
          border-radius: 12px;
          border: 1px solid var(--border-primary);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .section-column:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .column-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .column-icon svg {
          width: 32px;
          height: 32px;
          color: white;
        }

        .section-column h3 {
          font-size: 1.8rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .section-intro {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .feature-list li {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
          color: var(--text-primary);
          line-height: 1.6;
          font-size: 1rem;
        }

        .list-icon {
          color: #667eea;
          font-weight: 700;
          font-size: 1.5rem;
          line-height: 1.4;
        }

        .feature-list strong {
          color: var(--accent-primary);
          font-weight: 600;
        }

        .cta-footer {
          text-align: center;
          padding: 2.5rem 0 1rem;
          border-top: 1px solid var(--border-primary);
        }

        .cta-footer p {
          font-size: 1.2rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .cta-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .btn-browse-cases {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-browse-cases:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-learn-more {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
        }

        .btn-learn-more:hover {
          transform: translateY(-2px);
          background: #f5f7fa;
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
        }

        @media (max-width: 968px) {
          .section-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 768px) {
          .what-we-do-section {
            padding: 3rem 1.5rem;
          }

          .section-column {
            padding: 2rem;
          }

          .section-column h3 {
            font-size: 1.5rem;
          }

          .section-intro {
            font-size: 1rem;
          }

          .feature-list li {
            font-size: 0.95rem;
          }

          .cta-footer p {
            font-size: 1.05rem;
          }
        }

        @media (max-width: 480px) {
          .section-column {
            padding: 1.5rem;
          }

          .column-icon {
            width: 50px;
            height: 50px;
          }

          .column-icon svg {
            width: 26px;
            height: 26px;
          }
        }
      `}</style>
    </section>
  )
}
