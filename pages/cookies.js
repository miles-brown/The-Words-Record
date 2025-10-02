import Layout from '../components/Layout';

export default function Cookies() {
  return (
    <Layout
      title="Cookies Policy"
      description="Who Said What Cookies Policy - How we use cookies and tracking technologies"
    >
      <div className="policy-page">
        <div className="policy-header">
          <h1>Cookies Policy</h1>
          <p className="last-updated">Last Updated: October 1, 2025</p>
        </div>

        <div className="policy-content">
          <section className="policy-section">
            <h2>What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your device (computer, smartphone,
              or tablet) when you visit a website. Cookies help websites recognize your device
              and remember information about your visit, such as your preferred language and other
              settings.
            </p>
            <p>
              Cookies can be "persistent" (remain on your device until expiration or deletion)
              or "session" cookies (deleted when you close your browser).
            </p>
          </section>

          <section className="policy-section">
            <h2>How We Use Cookies</h2>
            <p>
              Who Said What uses cookies and similar technologies to:
            </p>
            <ul>
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our website through analytics</li>
              <li>Improve website performance and user experience</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>Types of Cookies We Use</h2>

            <h3>1. Essential Cookies</h3>
            <p>
              These cookies are necessary for the website to function properly. They enable core
              functionality such as security, network management, and accessibility. You cannot
              opt out of these cookies without affecting how our website functions.
            </p>
            <ul>
              <li><strong>Purpose:</strong> Website functionality, security, load balancing</li>
              <li><strong>Duration:</strong> Session cookies (deleted when browser closes)</li>
            </ul>

            <h3>2. Analytics Cookies</h3>
            <p>
              These cookies help us understand how visitors interact with our website by
              collecting and reporting information anonymously. We use Google Analytics for
              this purpose.
            </p>
            <ul>
              <li><strong>Purpose:</strong> Track page views, user behavior, traffic sources</li>
              <li><strong>Duration:</strong> Up to 2 years</li>
              <li><strong>Third Party:</strong> Google Analytics</li>
            </ul>
            <p>
              <strong>Google Analytics cookies include:</strong>
            </p>
            <ul>
              <li><code>_ga</code> - Distinguishes unique users (2 years)</li>
              <li><code>_gid</code> - Distinguishes users (24 hours)</li>
              <li><code>_gat</code> - Throttles request rate (1 minute)</li>
            </ul>

            <h3>3. Functionality Cookies</h3>
            <p>
              These cookies allow the website to remember choices you make (such as your
              username, language, or region) and provide enhanced, more personalized features.
            </p>
            <ul>
              <li><strong>Purpose:</strong> Remember preferences, personalization</li>
              <li><strong>Duration:</strong> Varies (typically up to 1 year)</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>Third-Party Cookies</h2>
            <p>
              Some cookies on our website are set by third-party services. These include:
            </p>
            <ul>
              <li>
                <strong>Google Analytics:</strong> Tracks website usage and visitor behavior.
                Learn more about{' '}
                <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer">
                  Google's cookie usage
                </a>
              </li>
            </ul>
            <p>
              We do not control these third-party cookies. Please review the privacy policies
              of these services for more information about how they use cookies.
            </p>
          </section>

          <section className="policy-section">
            <h2>Managing Cookies</h2>
            <p>
              You have the right to decide whether to accept or reject cookies. You can
              manage your cookie preferences through your browser settings.
            </p>

            <h3>Browser Settings</h3>
            <p>
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul>
              <li>View and delete cookies stored on your device</li>
              <li>Block cookies from specific websites</li>
              <li>Block all third-party cookies</li>
              <li>Block all cookies (not recommended, as it may affect website functionality)</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>

            <h3>Browser-Specific Instructions</h3>
            <ul>
              <li>
                <strong>Chrome:</strong>{' '}
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
                  Manage cookies in Chrome
                </a>
              </li>
              <li>
                <strong>Firefox:</strong>{' '}
                <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">
                  Manage cookies in Firefox
                </a>
              </li>
              <li>
                <strong>Safari:</strong>{' '}
                <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer">
                  Manage cookies in Safari
                </a>
              </li>
              <li>
                <strong>Edge:</strong>{' '}
                <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">
                  Manage cookies in Edge
                </a>
              </li>
            </ul>

            <h3>Opt-Out of Google Analytics</h3>
            <p>
              You can opt out of Google Analytics tracking by installing the{' '}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                Google Analytics Opt-out Browser Add-on
              </a>
            </p>
          </section>

          <section className="policy-section">
            <h2>Impact of Disabling Cookies</h2>
            <p>
              If you choose to block or delete cookies, some features of our website may not
              function properly. Specifically:
            </p>
            <ul>
              <li>You may need to re-enter information more frequently</li>
              <li>Certain personalization features may not work</li>
              <li>We won't be able to remember your preferences</li>
              <li>Website performance may be affected</li>
            </ul>
            <p>
              However, blocking analytics cookies will not affect your ability to use the core
              features of our website.
            </p>
          </section>

          <section className="policy-section">
            <h2>Other Tracking Technologies</h2>
            <p>
              In addition to cookies, we may use other tracking technologies:
            </p>
            <ul>
              <li>
                <strong>Web Beacons:</strong> Small transparent images embedded in web pages to
                track page views and user behavior
              </li>
              <li>
                <strong>Local Storage:</strong> HTML5 local storage for persisting data on your device
              </li>
              <li>
                <strong>Log Files:</strong> Server logs that record information about your visit
                (IP address, browser type, timestamps)
              </li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>Updates to This Policy</h2>
            <p>
              We may update this Cookies Policy from time to time to reflect changes in our
              practices or for other operational, legal, or regulatory reasons. We will notify
              you of any changes by posting the new policy on this page and updating the "Last
              Updated" date.
            </p>
          </section>

          <section className="policy-section">
            <h2>Contact Us</h2>
            <p>
              If you have questions about our use of cookies or other tracking technologies,
              please contact us at:
            </p>
            <ul>
              <li><strong>Email:</strong> privacy@whosaidwhat.com</li>
            </ul>
            <p>
              For more information about how we collect and use your personal information,
              please see our <a href="/privacy">Privacy Policy</a>.
            </p>
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

        .policy-section code {
          background: var(--background-secondary);
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
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
