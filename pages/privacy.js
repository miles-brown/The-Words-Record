import Layout from '../components/Layout';
import Link from 'next/link';

export default function Privacy() {
  return (
    <Layout
      title="Privacy Policy"
      description="The Words Record Privacy Policy - How we collect, use, and protect your information"
    >
      <div className="policy-page">
        <div className="policy-header">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: October 1, 2025</p>
        </div>

        <div className="policy-content">
          <section className="policy-section">
            <h2>Introduction</h2>
            <p>
              The Words Record ("we," "our," or "us") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you visit our website.
            </p>
            <p>
              Please read this privacy policy carefully. If you do not agree with the terms of
              this privacy policy, please do not access the site.
            </p>
          </section>

          <section className="policy-section">
            <h2>Information We Collect</h2>

            <h3>Information You Provide</h3>
            <p>
              We may collect information that you voluntarily provide when you:
            </p>
            <ul>
              <li>Contact us via email or forms</li>
              <li>Subscribe to newsletters (if applicable)</li>
              <li>Participate in surveys or feedback forms</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <p>
              When you visit our website, we automatically collect certain information about
              your device, including:
            </p>
            <ul>
              <li><strong>Log Data:</strong> IP address, browser type, operating system, referring URLs, pages viewed, and timestamps</li>
              <li><strong>Analytics Data:</strong> We use Google Analytics to understand how visitors use our site</li>
              <li><strong>Cookies:</strong> Small data files stored on your device (see our Cookies Policy for details)</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul>
              <li>Operate and maintain our website</li>
              <li>Improve user experience and site functionality</li>
              <li>Understand how our website is used through analytics</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Send administrative information and updates</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>Third-Party Services</h2>
            <p>
              We use the following third-party services that may collect information:
            </p>
            <ul>
              <li>
                <strong>Google Analytics:</strong> Tracks website usage and visitor behavior.
                Google's privacy policy is available at{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                  https://policies.google.com/privacy
                </a>
              </li>
              <li>
                <strong>Hosting Providers:</strong> Our website is hosted by third-party service
                providers who may have access to server logs
              </li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>Data Retention</h2>
            <p>
              We retain your information only for as long as necessary to fulfill the purposes
              outlined in this Privacy Policy, unless a longer retention period is required or
              permitted by law. Analytics data is retained according to Google Analytics'
              retention policies.
            </p>
          </section>

          <section className="policy-section">
            <h2>Your Privacy Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information:
            </p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Opt-Out:</strong> Opt out of certain data collection (e.g., analytics)</li>
              <li><strong>Data Portability:</strong> Request your data in a portable format</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided at the
              end of this policy.
            </p>
          </section>

          <section className="policy-section">
            <h2>Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your experience.
              For detailed information about our use of cookies, please see our{' '}
              <Link href="/cookies">Cookies Policy</Link>.
            </p>
            <p>
              You can configure your browser to refuse cookies or alert you when cookies are
              being sent. However, some features of our website may not function properly
              without cookies.
            </p>
          </section>

          <section className="policy-section">
            <h2>Children's Privacy</h2>
            <p>
              Our website is not intended for children under the age of 13. We do not knowingly
              collect personal information from children under 13. If you become aware that a
              child has provided us with personal information, please contact us, and we will
              take steps to delete such information.
            </p>
          </section>

          <section className="policy-section">
            <h2>Data Security</h2>
            <p>
              We implement reasonable security measures to protect your information from
              unauthorized access, alteration, disclosure, or destruction. However, no method
              of transmission over the internet or electronic storage is 100% secure, and we
              cannot guarantee absolute security.
            </p>
          </section>

          <section className="policy-section">
            <h2>International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your
              country of residence. These countries may have data protection laws different from
              your country. By using our website, you consent to such transfers.
            </p>
          </section>

          <section className="policy-section">
            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new Privacy Policy on this page and updating the "Last
              Updated" date. You are advised to review this Privacy Policy periodically for
              any changes.
            </p>
          </section>

          <section className="policy-section">
            <h2>Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy, please contact us at:
            </p>
            <ul>
              <li><strong>Email:</strong> privacy@whosaidwhat.com</li>
            </ul>
          </section>
        </div>
      </div>

      <style jsx>{`
        .policy-page {
          max-width: 850px;
          margin: 0 auto;
        }

        .policy-header {
          text-align: center;
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid var(--border-primary);
        }

        .policy-header h1 {
          font-size: 2.75rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .last-updated {
          font-size: 0.95rem;
          color: var(--text-secondary);
          font-style: italic;
        }

        .policy-content {
          line-height: 1.8;
        }

        .policy-section {
          margin-bottom: 3rem;
        }

        .policy-section h2 {
          font-size: 1.8rem;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .policy-section h3 {
          font-size: 1.3rem;
          color: var(--text-primary);
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }

        .policy-section p {
          color: var(--text-primary);
          margin-bottom: 1.25rem;
          font-size: 1.05rem;
        }

        .policy-section ul {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }

        .policy-section li {
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-size: 1.05rem;
          line-height: 1.7;
        }

        .policy-section li strong {
          color: var(--accent-primary);
          font-weight: 600;
        }

        .policy-section a {
          color: var(--accent-primary);
          text-decoration: underline;
          transition: color 0.2s;
        }

        .policy-section a:hover {
          color: #2c3e50;
        }

        @media (max-width: 768px) {
          .policy-header h1 {
            font-size: 2rem;
          }

          .policy-section h2 {
            font-size: 1.5rem;
          }

          .policy-section h3 {
            font-size: 1.2rem;
          }

          .policy-section p,
          .policy-section li {
            font-size: 1rem;
          }
        }
      `}</style>
    </Layout>
  );
}
