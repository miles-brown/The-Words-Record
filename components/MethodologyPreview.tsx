import Link from 'next/link'

export default function MethodologyPreview() {
  return (
    <section className="methodology-preview" aria-label="Our methodology">
      <div className="methodology-container">
        <div className="methodology-header">
          <h2>How We Work</h2>
          <p>Rigorous standards for documenting and verifying public statements</p>
        </div>

        <div className="methodology-grid">
          {/* Step 1: Collection */}
          <div className="methodology-step">
            <div className="step-number" aria-label="Step 1">
              <span>1</span>
            </div>
            <div className="step-content">
              <h3>Collection</h3>
              <p>
                We identify and collect public statements from credible sources including
                press conferences, interviews, official documents, and verified social media.
              </p>
            </div>
          </div>

          {/* Step 2: Verification */}
          <div className="methodology-step">
            <div className="step-number" aria-label="Step 2">
              <span>2</span>
            </div>
            <div className="step-content">
              <h3>Verification</h3>
              <p>
                Each statement is verified against primary sources. We prioritize direct
                recordings, transcripts, and reputable journalism with editorial standards.
              </p>
            </div>
          </div>

          {/* Step 3: Contextualization */}
          <div className="methodology-step">
            <div className="step-number" aria-label="Step 3">
              <span>3</span>
            </div>
            <div className="step-content">
              <h3>Contextualization</h3>
              <p>
                We document the full context: when, where, and why statements were made,
                along with relevant background information and related statements.
              </p>
            </div>
          </div>

          {/* Step 4: Documentation */}
          <div className="methodology-step">
            <div className="step-number" aria-label="Step 4">
              <span>4</span>
            </div>
            <div className="step-content">
              <h3>Documentation</h3>
              <p>
                Statements are preserved with exact wording, complete attribution,
                timestamps, and links to all primary and secondary sources.
              </p>
            </div>
          </div>

          {/* Step 5: Response Tracking */}
          <div className="methodology-step">
            <div className="step-number" aria-label="Step 5">
              <span>5</span>
            </div>
            <div className="step-content">
              <h3>Response Tracking</h3>
              <p>
                We monitor and document official responses, clarifications, denials,
                and rebuttals with the same rigor as original statements.
              </p>
            </div>
          </div>

          {/* Step 6: Ongoing Updates */}
          <div className="methodology-step">
            <div className="step-number" aria-label="Step 6">
              <span>6</span>
            </div>
            <div className="step-content">
              <h3>Ongoing Updates</h3>
              <p>
                Cases are continuously updated as new information emerges, sources are
                archived, and the public record evolves over time.
              </p>
            </div>
          </div>
        </div>

        <div className="methodology-principles">
          <div className="principle-cards">
            <div className="principle-card">
              <div className="principle-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
              </div>
              <h4>Accuracy</h4>
              <p>Every statement matches source material exactly</p>
            </div>

            <div className="principle-card">
              <div className="principle-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h4>Transparency</h4>
              <p>All sources are linked and publicly accessible</p>
            </div>

            <div className="principle-card">
              <div className="principle-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M12 1.5a.75.75 0 01.75.75V4.5a.75.75 0 01-1.5 0V2.25A.75.75 0 0112 1.5zM5.636 4.136a.75.75 0 011.06 0l1.592 1.591a.75.75 0 01-1.061 1.06l-1.591-1.59a.75.75 0 010-1.061zm12.728 0a.75.75 0 010 1.06l-1.591 1.592a.75.75 0 01-1.06-1.061l1.59-1.591a.75.75 0 011.061 0zm-6.816 4.496a.75.75 0 01.82.311l5.228 7.917a.75.75 0 01-.777 1.148l-2.097-.43 1.045 3.9a.75.75 0 01-1.45.388l-1.044-3.899-1.601 1.42a.75.75 0 01-1.247-.606l.569-9.47a.75.75 0 01.554-.68zM3 10.5a.75.75 0 01.75-.75H6a.75.75 0 010 1.5H3.75A.75.75 0 013 10.5zm14.25 0a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H18a.75.75 0 01-.75-.75zm-8.962 3.712a.75.75 0 010 1.061l-1.591 1.591a.75.75 0 11-1.061-1.06l1.591-1.592a.75.75 0 011.06 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h4>Neutrality</h4>
              <p>No editorial bias or political agenda</p>
            </div>

            <div className="principle-card">
              <div className="principle-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
                </svg>
              </div>
              <h4>Updates</h4>
              <p>Cases evolve as new information emerges</p>
            </div>
          </div>
        </div>

        <div className="methodology-cta">
          <p>See our complete verification and documentation standards</p>
          <Link href="/methodology">
            <button type="button" className="btn-methodology">
              Read Full Methodology
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="btn-icon">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .methodology-preview {
          background: linear-gradient(to bottom, #f7f8fc 0%, #e9ecf5 100%);
          padding: 5rem 2rem;
          position: relative;
        }

        .methodology-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .methodology-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .methodology-header h2 {
          font-size: 2.5rem;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .methodology-header p {
          font-size: 1.2rem;
          color: var(--text-secondary);
        }

        .methodology-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2.5rem;
          margin-bottom: 4rem;
        }

        .methodology-step {
          display: flex;
          gap: 1.5rem;
          animation: slideUp 0.6s ease-out backwards;
        }

        .methodology-step:nth-child(1) { animation-delay: 0.1s; }
        .methodology-step:nth-child(2) { animation-delay: 0.2s; }
        .methodology-step:nth-child(3) { animation-delay: 0.3s; }
        .methodology-step:nth-child(4) { animation-delay: 0.4s; }
        .methodology-step:nth-child(5) { animation-delay: 0.5s; }
        .methodology-step:nth-child(6) { animation-delay: 0.6s; }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .step-number {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.25rem;
          font-family: 'Merriweather', Georgia, serif;
        }

        .step-content h3 {
          font-size: 1.3rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .step-content p {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        .methodology-principles {
          background: white;
          border-radius: 16px;
          padding: 3rem 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          margin-bottom: 3rem;
        }

        .principle-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 2rem;
        }

        .principle-card {
          text-align: center;
        }

        .principle-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .principle-icon svg {
          width: 28px;
          height: 28px;
          color: white;
        }

        .principle-card h4 {
          font-size: 1.1rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .principle-card p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .methodology-cta {
          text-align: center;
        }

        .methodology-cta p {
          font-size: 1.15rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .btn-methodology {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-methodology:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-icon {
          width: 20px;
          height: 20px;
        }

        @media (max-width: 768px) {
          .methodology-preview {
            padding: 3rem 1.5rem;
          }

          .methodology-header h2 {
            font-size: 2rem;
          }

          .methodology-header p {
            font-size: 1.05rem;
          }

          .methodology-grid {
            gap: 2rem;
          }

          .methodology-principles {
            padding: 2rem 1.5rem;
          }

          .principle-cards {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .principle-cards {
            grid-template-columns: 1fr;
          }

          .methodology-step {
            gap: 1rem;
          }

          .step-number {
            width: 40px;
            height: 40px;
            font-size: 1.1rem;
          }
        }
      `}</style>
    </section>
  )
}
