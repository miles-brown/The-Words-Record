import Link from 'next/link'
import Head from 'next/head'
import Script from 'next/script'
import { ReactNode, useState, useEffect } from 'react'
import Analytics from './Analytics'
import AdSenseScript from './AdSenseScript'

interface LayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export default function LayoutRedesigned({ children, title, description }: LayoutProps) {
  const pageTitle = title ? `${title} - The Words Record` : 'The Words Record - Documented Public Statements'
  const pageDescription = description || 'Comprehensive documentation of public statements, allegations, and responses. Neutral, factual, and thoroughly sourced.'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thewordsrecord.com'

  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      <AdSenseScript />

      {/* Analytics */}
      <Analytics />

      <div className="page-wrapper">
        {/* Enhanced Header */}
        <header className={`header ${isScrolled ? 'scrolled' : ''}`} role="banner">
          <div className="header-inner">
            {/* Logo Left */}
            <div className="header-logo">
              <Link href="/" aria-label="The Words Record home">
                <img
                  src="/images/LOGO-HEADER.png"
                  alt="The Words Record"
                  className="logo-image"
                  width="120"
                  height="60"
                />
              </Link>
            </div>

            {/* Site Title Center */}
            <div className="header-title">
              <h1>The Words Record</h1>
            </div>

            {/* Menu Right */}
            <nav className="header-nav" aria-label="Main navigation">
              <div className="nav-desktop">
                <Link href="/statements" className="nav-link">Statements</Link>
                <Link href="/cases" className="nav-link">Cases</Link>
                <Link href="/people" className="nav-link">People</Link>
                <Link href="/methodology" className="nav-link">Methodology</Link>
                <Link href="/about" className="nav-link">About</Link>
                <Link href="/donate" className="nav-link nav-link-donate">Donate</Link>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                className="menu-toggle"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                <span className="menu-icon">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>
            </nav>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div className="mobile-menu" role="dialog" aria-modal="true">
            <div className="mobile-menu-content">
              <button
                type="button"
                className="menu-close"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                ×
              </button>

              <nav className="mobile-nav" aria-label="Mobile navigation">
                <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
                <Link href="/statements" onClick={() => setMenuOpen(false)}>Statements</Link>
                <Link href="/cases" onClick={() => setMenuOpen(false)}>Cases</Link>
                <Link href="/people" onClick={() => setMenuOpen(false)}>People</Link>
                <Link href="/organizations" onClick={() => setMenuOpen(false)}>Organizations</Link>
                <Link href="/topics" onClick={() => setMenuOpen(false)}>Topics</Link>
                <Link href="/sources" onClick={() => setMenuOpen(false)}>Sources</Link>
                <Link href="/methodology" onClick={() => setMenuOpen(false)}>Methodology</Link>
                <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
                <Link href="/donate" className="mobile-nav-donate" onClick={() => setMenuOpen(false)}>Donate</Link>
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main id="main-content" role="main">
          {children}
        </main>

        {/* Enhanced Footer */}
        <footer className="footer" role="contentinfo">
          <div className="footer-inner">
            <div className="footer-links">
              <Link href="/about">About</Link>
              <span className="footer-separator">·</span>
              <Link href="/methodology">Methodology</Link>
              <span className="footer-separator">·</span>
              <Link href="/privacy">Privacy</Link>
              <span className="footer-separator">·</span>
              <Link href="/cookies">Cookies</Link>
              <span className="footer-separator">·</span>
              <Link href="/terms">Terms</Link>
            </div>
            <div className="footer-copyright">
              © 2025 The Words Record. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      {/* Google Analytics */}
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

      <style jsx>{`
        /* Color Scheme */
        :root {
          --bg-primary: #f9f8f6;
          --bg-secondary: #f2f1ef;
          --text-primary: #2f3538;
          --text-secondary: #5f6f7a;
          --accent: #4a5f71;
          --border-light: #e8e6e3;
          --border-dark: #d4d2cf;
        }

        .page-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }

        /* Header */
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: white;
          border-bottom: 1px solid var(--border-light);
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .header.scrolled {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .header-inner {
          max-width: 1600px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: grid;
          grid-template-columns: 150px 1fr 400px;
          align-items: center;
          gap: 2rem;
        }

        .header.scrolled .header-inner {
          padding: 0.75rem 2rem;
        }

        /* Logo */
        .header-logo {
          display: flex;
          align-items: center;
        }

        .logo-image {
          height: 60px;
          width: auto;
          transition: height 0.3s ease;
        }

        .header.scrolled .logo-image {
          height: 45px;
        }

        /* Title */
        .header-title {
          text-align: center;
        }

        .header-title h1 {
          font-family: 'Cinzel', serif;
          font-size: 1.75rem;
          font-weight: 500;
          color: var(--text-primary);
          margin: 0;
          letter-spacing: 0.05em;
          transition: font-size 0.3s ease;
        }

        .header.scrolled .header-title h1 {
          font-size: 1.5rem;
        }

        /* Navigation */
        .header-nav {
          justify-self: end;
        }

        .nav-desktop {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .nav-link {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-primary);
          text-decoration: none;
          transition: color 0.3s ease;
          position: relative;
          padding: 0.5rem 0;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--accent);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .nav-link:hover {
          color: var(--accent);
        }

        .nav-link:hover::after {
          transform: scaleX(1);
        }

        .nav-link-donate {
          background: var(--accent);
          color: white;
          padding: 0.5rem 1.25rem;
          border-radius: 2px;
        }

        .nav-link-donate:hover {
          background: var(--text-primary);
          color: white;
        }

        .nav-link-donate::after {
          display: none;
        }

        /* Mobile Menu Toggle */
        .menu-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
        }

        .menu-icon {
          display: block;
          width: 24px;
          height: 20px;
          position: relative;
        }

        .menu-icon span {
          display: block;
          width: 100%;
          height: 2px;
          background: var(--text-primary);
          position: absolute;
          transition: all 0.3s ease;
        }

        .menu-icon span:nth-child(1) {
          top: 0;
        }

        .menu-icon span:nth-child(2) {
          top: 50%;
          transform: translateY(-50%);
        }

        .menu-icon span:nth-child(3) {
          bottom: 0;
        }

        /* Mobile Menu */
        .mobile-menu {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 2000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .mobile-menu-content {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 280px;
          background: white;
          padding: 2rem;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .menu-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 2rem;
          color: var(--text-primary);
          cursor: pointer;
        }

        .mobile-nav {
          margin-top: 3rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .mobile-nav a {
          font-family: 'Inter', sans-serif;
          font-size: 1.05rem;
          color: var(--text-primary);
          text-decoration: none;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border-light);
          transition: color 0.3s ease;
        }

        .mobile-nav a:hover {
          color: var(--accent);
        }

        .mobile-nav-donate {
          background: var(--accent);
          color: white !important;
          padding: 0.75rem !important;
          text-align: center;
          border-radius: 2px;
          border-bottom: none !important;
          margin-top: 1rem;
        }

        /* Main Content */
        #main-content {
          flex: 1;
          padding-top: 100px;
        }

        .header.scrolled ~ #main-content {
          padding-top: 80px;
        }

        /* Footer */
        .footer {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-light);
          padding: 2rem;
          margin-top: 4rem;
        }

        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .footer-links a {
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer-links a:hover {
          color: var(--accent);
        }

        .footer-separator {
          color: var(--border-dark);
        }

        .footer-copyright {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .header-inner {
            grid-template-columns: 120px 1fr 350px;
            padding: 1rem 1.5rem;
          }

          .header-title h1 {
            font-size: 1.5rem;
          }

          .nav-desktop {
            gap: 1rem;
          }

          .nav-link {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 1024px) {
          .header-inner {
            grid-template-columns: auto 1fr auto;
            padding: 1rem;
          }

          .header-title h1 {
            font-size: 1.25rem;
          }

          .nav-desktop {
            display: none;
          }

          .menu-toggle {
            display: block;
          }

          #main-content {
            padding-top: 80px;
          }
        }

        @media (max-width: 768px) {
          .header-title {
            text-align: left;
          }

          .header-title h1 {
            font-size: 1.1rem;
          }

          .logo-image {
            height: 45px;
          }

          .header.scrolled .logo-image {
            height: 40px;
          }

          .footer {
            padding: 1.5rem 1rem;
            margin-top: 2rem;
          }

          .footer-links {
            gap: 0.75rem;
          }

          .footer-links a {
            font-size: 0.85rem;
          }
        }

        @media (max-width: 480px) {
          .header-inner {
            gap: 1rem;
          }

          .header-title h1 {
            font-size: 1rem;
          }

          .mobile-menu-content {
            width: 100%;
          }

          .footer-separator {
            display: none;
          }

          .footer-links {
            flex-direction: column;
            gap: 0.5rem;
          }
        }

        /* Accessibility - Focus States */
        *:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  )
}