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

      {/* Google AdSense */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5418171625369886"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      <Analytics />

      <div className="container">
        <a href="#main-content" className="skip-link">Skip to main content</a>

        {/* Utility Bar */}
        <div className="utility-bar">
          <div className="utility-content">
            <div className="utility-links">
              <Link href="/methodology" className="utility-link">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="utility-icon">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
                Methodology
              </Link>
              <Link href="/about" className="utility-link">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="utility-icon">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
                </svg>
                About
              </Link>
            </div>
          </div>
        </div>

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