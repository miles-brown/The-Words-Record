import Layout from '../components/Layout';
import Link from 'next/link';

export default function About() {
  return (
    <Layout
      title="About"
      description="Learn about Who Said What and our mission to document public statements with verified sources"
    >
      <div className="about-page">
        <div className="about-header">
          <h1>About Who Said What</h1>
          <p className="tagline">
            Documenting public statements, allegations, and responses with verified sources
          </p>
        </div>

        <div className="about-content">
          <section className="about-section">
            <h2>What We Do</h2>
            <p>
              Who Said What is a comprehensive documentation platform tracking public statements,
              allegations, and official responses from public figures, organizations, and institutions.
              We focus on capturing the exact words spoken or written, preserving context, and
              maintaining a thoroughly sourced record of what was said, when, and where.
            </p>
            <p>
              Our database covers a wide range of incidents including public controversies, official
              statements, allegations, denials, apologies, and responses. Each entry is meticulously
              researched and backed by verifiable sources.
            </p>
          </section>

          <section className="about-section">
            <h2>Why We Exist</h2>
            <p>
              In an age of rapidly evolving narratives and selective memory, we believe in the
              importance of preserving an accurate, searchable record of what public figures actually
              said. Words matter. Context matters. Accuracy matters.
            </p>
            <p>
              Public figures often make statements that are later walked back, denied, or
              mischaracterized. Media coverage can be fragmented or biased. Who Said What provides
              a centralized, neutral platform where anyone can find the original statements,
              complete with context and sources.
            </p>
          </section>

          <section className="about-section">
            <h2>How It Works</h2>
            <p>
              Each incident in our database includes:
            </p>
            <ul>
              <li><strong>The Statement:</strong> The exact words that were said or written</li>
              <li><strong>Context:</strong> When and where the statement was made</li>
              <li><strong>Platform:</strong> The medium used (interview, social media, press release, etc.)</li>
              <li><strong>Sources:</strong> Links to original reporting and primary sources</li>
              <li><strong>Responses:</strong> Official replies, denials, clarifications, or apologies</li>
              <li><strong>Related Incidents:</strong> Connections to other relevant statements</li>
            </ul>
            <p>
              You can browse incidents chronologically, search by person or organization,
              filter by category tags, and explore related statements. Every claim is backed
              by citations to credible sources.
            </p>
          </section>

          <section className="about-section">
            <h2>What Makes Us Different</h2>
            <p>
              Unlike news aggregators or social media platforms, Who Said What focuses exclusively
              on preserving factual records with full context. We don't editorialize, we don't take
              sides, and we don't amplify inflammatory takes. We simply document what was said,
              with sources.
            </p>
            <p>
              Our goal is not to judge or sensationalize, but to create a reliable historical
              record that journalists, researchers, and the public can reference for years to come.
            </p>
          </section>

          <section className="about-section">
            <h2>Who It's For</h2>
            <p>
              Who Said What serves multiple audiences:
            </p>
            <ul>
              <li><strong>Journalists:</strong> Quick access to verified quotes and sources for fact-checking</li>
              <li><strong>Researchers:</strong> A comprehensive database for studying public discourse</li>
              <li><strong>The Public:</strong> A transparent resource for understanding what actually happened</li>
              <li><strong>Legal Professionals:</strong> Documented evidence of public statements</li>
              <li><strong>Students:</strong> Historical records for academic study</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Our Commitment</h2>
            <p>
              We are committed to accuracy, transparency, and continuous improvement. Every entry
              is thoroughly researched and sourced. We welcome corrections and additional context
              from the community. Our aim is to be the most reliable resource for understanding
              what was actually said in matters of public interest.
            </p>
          </section>

          <section className="about-section">
            <h2>Questions or Feedback?</h2>
            <p>
              Have a suggestion? Found an error? Want to contribute? Check out our
              {' '}<Link href="/methodology">Methodology page</Link> to learn more about how we verify and
              document statements.
            </p>
          </section>
        </div>
      </div>

      <style jsx>{`
        .about-page {
          max-width: 800px;
          margin: 0 auto;
        }

        .about-header {
          text-align: center;
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid var(--border-primary);
        }

        .about-header h1 {
          font-size: 2.75rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .tagline {
          font-size: 1.2rem;
          color: var(--text-secondary);
          line-height: 1.6;
          font-style: italic;
        }

        .about-content {
          line-height: 1.8;
        }

        .about-section {
          margin-bottom: 3rem;
        }

        .about-section h2 {
          font-size: 1.8rem;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .about-section p {
          color: var(--text-primary);
          margin-bottom: 1.25rem;
          font-size: 1.05rem;
        }

        .about-section ul {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }

        .about-section li {
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-size: 1.05rem;
        }

        .about-section li strong {
          color: var(--accent-primary);
          font-weight: 600;
        }

        .about-section a {
          color: var(--accent-primary);
          text-decoration: underline;
          transition: color 0.2s;
        }

        .about-section a:hover {
          color: #2c3e50;
        }

        @media (max-width: 768px) {
          .about-header h1 {
            font-size: 2rem;
          }

          .tagline {
            font-size: 1rem;
          }

          .about-section h2 {
            font-size: 1.5rem;
          }

          .about-section p,
          .about-section li {
            font-size: 1rem;
          }
        }
      `}</style>
    </Layout>
  );
}
