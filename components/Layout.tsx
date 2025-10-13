import Link from 'next/link'
import Head from 'next/head'
import Script from 'next/script'
import { ReactNode, useState, useEffect } from 'react'
import SearchBox from './SearchBox'
import Analytics from './Analytics'

interface LayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export default function Layout({ children, title, description }: LayoutProps) {
  const pageTitle = title ? `${title} - The Words Record` : 'The Words Record - Documented Public Statements'
  const pageDescription = description || 'Comprehensive documentation of public statements, allegations, and responses. Neutral, factual, and thoroughly sourced.'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thewordsrecord.com'

  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [menuOpen])

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
        <meta property="og:site_name" content="The Words Record" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />

        {/* Additional SEO */}
        <meta name="author" content="The Words Record" />
        <link rel="canonical" href={siteUrl} />
      </Head>

      <Analytics />

      <div className="container">
        <a href="#main-content" className="skip-link">Skip to main content</a>

        <header className={isScrolled ? 'scrolled' : ''}>
          <nav aria-label="Main navigation">
            <div className="nav-brand">
              <Link href="/">
                <h1>The Words Record</h1>
              </Link>
            </div>

            {!isScrolled && (
              <>
                <div className="nav-center">
                  <SearchBox placeholder="Search..." className="header-search" />
                </div>
                <div className="nav-links">
                  <Link href="/statements">Statements</Link>
                  <Link href="/people">People</Link>
                  <Link href="/organizations">Organizations</Link>
                  <Link href="/about">About</Link>
                </div>
              </>
            )}

            {isScrolled && (
              <button
                type="button"
                className="menu-button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                <span className="hamburger-icon">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>
            )}
          </nav>
        </header>

        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div className="menu-overlay" onClick={() => setMenuOpen(false)}>
            <div className="menu-content" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="menu-close"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                ×
              </button>

              <div className="menu-search">
                <SearchBox placeholder="Search..." />
              </div>

              <nav className="menu-links">
                <Link href="/statements" onClick={() => setMenuOpen(false)}>
                  Statements
                </Link>
                <Link href="/people" onClick={() => setMenuOpen(false)}>
                  People
                </Link>
                <Link href="/organizations" onClick={() => setMenuOpen(false)}>
                  Organizations
                </Link>
                <Link href="/about" onClick={() => setMenuOpen(false)}>
                  About
                </Link>
              </nav>
            </div>
          </div>
        )}

        <main id="main-content">{children}</main>

        <footer>
          <div className="footer-content">
            <div className="footer-section">
              <h4>About This Site</h4>
              <p>
                Neutral documentation of public statements and responses.
                All content is factual and sourced.
              </p>
              <p className="footer-link-wrapper">
                <Link href="/methodology" className="footer-link">
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
              <h4>Legal</h4>
              <div className="footer-links">
                <Link href="/privacy" className="footer-link">
                  Privacy Policy
                </Link>
                <Link href="/cookies" className="footer-link">
                  Cookies Policy
                </Link>
                <Link href="/terms" className="footer-link">
                  Terms of Use
                </Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 The Words Record. All rights reserved.</p>
          </div>
        </footer>
      </div>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-26ERR1Y5ZZ"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-26ERR1Y5ZZ');
        `}
      </Script>
    </>
  )
}