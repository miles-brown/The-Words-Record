import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'

export default function ContactPage() {
  return (
    <Layout>
      <Head>
        <title>Contact | Who Said What</title>
        <meta name="description" content="Get in touch with Who Said What - submit corrections, additional sources, or general inquiries" />
      </Head>

      <div className="contact-page">
        <header className="page-header">
          <h1>Contact Us</h1>
          <p className="subtitle">
            We welcome corrections, additional sources, and feedback
          </p>
        </header>

        <div className="content-grid">
          <section className="contact-reasons">
            <h2>Get In Touch For:</h2>
            <ul className="reasons-list">
              <li>
                <strong>Corrections</strong>
                <p>Found an error or inaccuracy? We appreciate corrections with verifiable sources.</p>
              </li>
              <li>
                <strong>Additional Sources</strong>
                <p>Have a credible source we should add to our database? Let us know.</p>
              </li>
              <li>
                <strong>Missing Statements</strong>
                <p>Know of a significant public statement we haven't documented?</p>
              </li>
              <li>
                <strong>Technical Issues</strong>
                <p>Experiencing problems with the site? Report bugs and technical issues.</p>
              </li>
              <li>
                <strong>General Inquiries</strong>
                <p>Questions about our methodology, mission, or how we work?</p>
              </li>
              <li>
                <strong>Partnership Opportunities</strong>
                <p>Interested in collaborating or using our data for research?</p>
              </li>
            </ul>
          </section>

          <section className="contact-form-section">
            <h2>Send Us a Message</h2>
            <form className="contact-form" action="/api/contact" method="POST">
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input type="text" id="name" name="name" required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" required />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <select id="subject" name="subject" required>
                  <option value="">Select a topic...</option>
                  <option value="correction">Correction</option>
                  <option value="source">Additional Source</option>
                  <option value="missing">Missing Statement</option>
                  <option value="technical">Technical Issue</option>
                  <option value="general">General Inquiry</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={8}
                  required
                  placeholder="Please provide as much detail as possible. For corrections, include links to verifiable sources."
                ></textarea>
              </div>

              <button type="submit" className="submit-button">
                Send Message
              </button>
            </form>

            <div className="form-note">
              <p>
                <strong>Note:</strong> We review all submissions carefully. For corrections and
                source additions, please include links to verifiable primary sources whenever
                possible.
              </p>
            </div>
          </section>
        </div>

        <section className="alternative-contact">
          <h2>Other Ways to Reach Us</h2>
          <div className="contact-methods">
            <div className="method">
              <h3>GitHub</h3>
              <p>Report technical issues or contribute to our open source project</p>
              <a href="https://github.com/miles-brown/Who-Said-What" target="_blank" rel="noopener noreferrer" className="method-link">
                View on GitHub →
              </a>
            </div>

            <div className="method">
              <h3>Documentation</h3>
              <p>Learn more about our verification process and standards</p>
              <Link href="/methodology" className="method-link">
                Read Methodology →
              </Link>
            </div>

            <div className="method">
              <h3>About</h3>
              <p>Understand our mission and values</p>
              <Link href="/about" className="method-link">
                About Us →
              </Link>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .contact-page {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
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

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .contact-reasons h2 {
          font-size: 1.5rem;
          margin: 0 0 1.5rem 0;
          color: var(--text-primary);
        }

        .reasons-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .reasons-list li {
          background: var(--card-background);
          border-left: 4px solid var(--accent-color);
          padding: 1rem;
          margin-bottom: 1rem;
          border-radius: 4px;
        }

        .reasons-list strong {
          display: block;
          font-size: 1.1rem;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .reasons-list p {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
        }

        .contact-form-section h2 {
          font-size: 1.5rem;
          margin: 0 0 1.5rem 0;
          color: var(--text-primary);
        }

        .contact-form {
          background: var(--card-background);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 1rem;
          font-family: inherit;
          background: var(--background-primary);
          color: var(--text-primary);
          box-sizing: border-box;
        }

        .form-group textarea {
          resize: vertical;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--accent-color);
        }

        .submit-button {
          width: 100%;
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 6px;
          font-size: 1.05rem;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .submit-button:hover {
          opacity: 0.9;
        }

        .form-note {
          background: #f8fafc;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 1rem;
          margin-top: 1rem;
        }

        .form-note p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.6;
        }

        .alternative-contact {
          margin-top: 4rem;
          padding-top: 3rem;
          border-top: 2px solid var(--border-color);
        }

        .alternative-contact h2 {
          font-size: 2rem;
          margin: 0 0 2rem 0;
          color: var(--text-primary);
          text-align: center;
        }

        .contact-methods {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .method {
          background: var(--card-background);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1.5rem;
          text-align: center;
        }

        .method h3 {
          font-size: 1.3rem;
          margin: 0 0 0.75rem 0;
          color: var(--text-primary);
        }

        .method p {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin: 0 0 1rem 0;
          line-height: 1.6;
        }

        .method-link {
          color: var(--accent-color);
          text-decoration: none;
          font-weight: 500;
        }

        .method-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .page-header h1 {
            font-size: 2rem;
          }

          .subtitle {
            font-size: 1.1rem;
          }

          .content-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .contact-form {
            padding: 1.5rem;
          }

          .contact-methods {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  )
}
