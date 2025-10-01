import Link from 'next/link'
import Head from 'next/head'
import { ReactNode } from 'react'
import SearchBox from './SearchBox'
import Analytics from './Analytics'

interface LayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export default function Layout({ children, title, description }: LayoutProps) {
  const pageTitle = title ? `${title} - Who Said What` : 'Who Said What - Documented Public Statements'
  const pageDescription = description || 'Comprehensive documentation of public statements, allegations, and responses. Neutral, factual, and thoroughly sourced.'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whosaidwhat.com'

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* Basic Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:site_name" content="Who Said What" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />

        {/* Additional SEO */}
        <meta name="author" content="Who Said What" />
        <link rel="canonical" href={siteUrl} />
      </Head>

      <Analytics />
      
      <div className="container">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        
        <header>
          <nav aria-label="Main navigation">
            <div className="nav-brand">
              <Link href="/">
                <h1>Who Said What</h1>
              </Link>
            </div>
            <div className="nav-center">
              <SearchBox placeholder="Search..." className="header-search" />
            </div>
            <div className="nav-links">
              <Link href="/incidents">What?</Link>
              <Link href="/persons">Who?</Link>
              <Link href="/organizations">Organizations</Link>
              <Link href="/about">About</Link>
            </div>
          </nav>
        </header>

        <main id="main-content">{children}</main>

        <footer>
          <div className="footer-content">
            <div className="footer-section">
              <h4>About This Site</h4>
              <p>
                Neutral documentation of public statements and responses.
                All content is factual and sourced.
              </p>
              <p style={{ marginTop: '1rem' }}>
                <Link href="/methodology" style={{ color: 'var(--accent-secondary)', textDecoration: 'underline' }}>
                  View our Methodology
                </Link>
              </p>
            </div>
            <div className="footer-section">
              <h4>Disclaimer</h4>
              <p>
                This site presents factual information from public sources.
                We maintain strict neutrality and do not endorse any viewpoints.
              </p>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <p>
                For corrections or additional sources:
                <br />contact@whosaidwhat.com
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Who Said What. All rights reserved.</p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .skip-link {
          position: absolute;
          top: -40px;
          left: 0;
          background: var(--accent-primary);
          color: white;
          padding: 8px 16px;
          text-decoration: none;
          border-radius: 0 0 4px 0;
          z-index: 200;
        }

        .skip-link:focus {
          top: 0;
        }
      `}</style>
    </>
  )
}