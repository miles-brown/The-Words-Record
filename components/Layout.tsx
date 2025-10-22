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
  const [darkMode, setDarkMode] = useState(false)

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

  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setDarkMode(true)
      document.documentElement.classList.add('dark-mode')
    }
  }, [])

  const toggleTheme = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    if (newMode) {
      document.documentElement.classList.add('dark-mode')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark-mode')
      localStorage.setItem('theme', 'light')
    }
  }

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

        <header className={isScrolled ? 'scrolled' : ''}>
          <nav aria-label="Main navigation">
            <div className="nav-brand">
              <Link href="/">
                <img
                  src="/images/logo-2.png"
                  alt="The Words Record"
                  className="site-logo"
                />
              </Link>
            </div>

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
          </nav>
        </header>

        {/* Hamburger Menu */}
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

              <nav className="menu-links">
                <Link href="/" onClick={() => setMenuOpen(false)}>
                  Home
                </Link>
                <Link href="/statements" onClick={() => setMenuOpen(false)}>
                  Statements
                </Link>
                <Link href="/cases" onClick={() => setMenuOpen(false)}>
                  Cases
                </Link>
                <Link href="/people" onClick={() => setMenuOpen(false)}>
                  People
                </Link>
                <Link href="/organizations" onClick={() => setMenuOpen(false)}>
                  Organizations
                </Link>
                <Link href="/tags" onClick={() => setMenuOpen(false)}>
                  Topics
                </Link>
                <Link href="/sources" onClick={() => setMenuOpen(false)}>
                  Sources
                </Link>
                <Link href="/methodology" onClick={() => setMenuOpen(false)}>
                  Methodology
                </Link>
                <Link href="/about" onClick={() => setMenuOpen(false)}>
                  About
                </Link>
                <Link href="/report" onClick={() => setMenuOpen(false)}>
                  Report
                </Link>
                <Link href="/suggestions" onClick={() => setMenuOpen(false)}>
                  Suggest
                </Link>
                <Link href="/donate" onClick={() => setMenuOpen(false)} className="menu-link-accent">
                  Donate
                </Link>

                <div className="theme-switcher">
                  <button
                    onClick={toggleTheme}
                    className="theme-toggle"
                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {darkMode ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="5"></circle>
                          <line x1="12" y1="1" x2="12" y2="3"></line>
                          <line x1="12" y1="21" x2="12" y2="23"></line>
                          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                          <line x1="1" y1="12" x2="3" y2="12"></line>
                          <line x1="21" y1="12" x2="23" y2="12"></line>
                          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                        Light Mode
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                        Dark Mode
                      </>
                    )}
                  </button>
                </div>
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
                <button
                  onClick={() => {
                    // Reopen Google Funding Choices consent dialog
                    if (typeof window !== 'undefined' && (window as any).__tcfapi) {
                      (window as any).__tcfapi('displayConsentUi', 2, () => {});
                    }
                  }}
                  className="footer-link cookie-settings-btn"
                  aria-label="Cookie Settings"
                >
                  Cookie Settings
                </button>
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