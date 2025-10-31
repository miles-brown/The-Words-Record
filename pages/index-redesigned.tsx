import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { PrismaClient } from '@prisma/client'
import Layout from '../components/Layout'
import CaseCardEnhanced from '../components/CaseCardEnhanced'
import AdSlot from '../components/AdSlot'
import StructuredData, { generateOrganizationSchema, generateWebsiteSchema } from '../components/StructuredData'

interface CaseStudy {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: Array<{ name: string; slug: string }> | string[]
  _count?: {
    sources?: number
    statements?: number
  }
  status?: string
  isVerified?: boolean
  isFeatured?: boolean
  summary?: string
  caseDate?: string
}

interface HomeProps {
  allCases: CaseStudy[]
  featuredCase: CaseStudy | null
}

// Transform tags to proper format if they're strings
function normalizeTags(tags: Array<{ name: string; slug: string }> | string[] | undefined): Array<{ name: string; slug: string }> {
  if (!tags) return []
  if (Array.isArray(tags) && typeof tags[0] === 'string') {
    return (tags as string[]).map(tag => ({
      name: tag,
      slug: tag.toLowerCase().replace(/\s+/g, '-')
    }))
  }
  return tags as Array<{ name: string; slug: string }>
}

export default function HomeRedesigned({ allCases, featuredCase }: HomeProps) {
  const [email, setEmail] = useState('')
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubscribeStatus('loading')

    // TODO: Implement actual subscription logic
    setTimeout(() => {
      setSubscribeStatus('success')
      setEmail('')
      setTimeout(() => setSubscribeStatus('idle'), 3000)
    }, 1000)
  }

  return (
    <Layout>
      <Head>
        <title>The Words Record - Documentation of Public Statements</title>
        <meta name="description" content="Comprehensive documentation of public statements, allegations, and responses. Neutral, factual, and thoroughly sourced." />
        <meta name="keywords" content="public statements, fact checking, documentation, news archive, accountability, transparency" />
      </Head>

      {/* Structured Data for SEO */}
      <StructuredData type="organization" data={generateOrganizationSchema()} />
      <StructuredData type="website" data={generateWebsiteSchema()} />

      {/* Top Banner Ad */}
      <div className="top-ad-container">
        <AdSlot position="top-banner" lazy={false} />
      </div>

      {/* Main Grid Layout Container */}
      <div className="layout-grid">
        {/* Left Sidebar Ad */}
        <aside className="ad-left" aria-label="Left advertisement">
          <AdSlot position="left-sidebar" />
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          {/* Hero Section */}
          <section className="hero" aria-label="About The Words Record">
            <div className="hero-inner">
              <h1 className="hero-title">The Words Record</h1>
              <div className="hero-divider"></div>

              <div className="hero-text">
                <p className="hero-intro">
                  This archive exists to preserve the statements, denials, and defences that have shaped the world's most enduring conflict: the question of justice, identity, and power surrounding Palestine and Israel.
                </p>

                <p className="hero-body">
                  This is not a regional story. It is a global one, about how truth is spoken, silenced, or rewritten, and about what happens when words become weapons or shields.
                </p>

                <p className="hero-body">
                  Every record in this archive is factual, sourced, and traceable. Together they reveal how language defines allegiance, how narratives shape conscience, and how the world measures its own humanity through this single debate.
                </p>

                <p className="hero-conclusion">
                  The purpose is simple: to ensure that what was said remains visible, because how we remember these words will determine what kind of world we create next.
                </p>
              </div>

              <p className="hero-attribution">— Founder, The Words Record</p>
            </div>
          </section>

          {/* Latest Cases Section */}
          <section className="latest-cases" aria-label="Latest documented cases">
            <div className="section-header">
              <h2>Latest Cases</h2>
              <div className="section-line"></div>
            </div>

            <div className="cases-grid">
              {allCases.slice(0, 6).map((caseStudy, index) => (
                <div key={caseStudy.slug} className="case-item">
                  <CaseCardEnhanced
                    slug={caseStudy.slug}
                    title={caseStudy.title}
                    excerpt={caseStudy.excerpt}
                    date={caseStudy.date}
                    tags={normalizeTags(caseStudy.tags)}
                    _count={caseStudy._count}
                    status={caseStudy.status}
                    isVerified={caseStudy.isVerified}
                  />

                  {/* Mobile inline ad after 3rd case */}
                  {index === 2 && (
                    <div className="mobile-ad-inline">
                      <AdSlot position="mobile-inline" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="view-more">
              <Link href="/cases">
                <button type="button" className="btn-view-all" aria-label="View all cases">
                  View All Cases
                  <svg className="btn-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 10H14M14 10L10 6M14 10L10 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </Link>
            </div>
          </section>

          {/* Featured Case Section */}
          {featuredCase && (
            <section className="featured-case" aria-label="Featured case">
              <div className="section-header">
                <h2>Featured Case</h2>
                <div className="section-line"></div>
              </div>

              <article className="featured-card">
                <div className="featured-content">
                  <h3 className="featured-title">
                    <Link href={`/cases/${featuredCase.slug}`}>
                      {featuredCase.title}
                    </Link>
                  </h3>

                  <p className="featured-excerpt">
                    {featuredCase.summary || featuredCase.excerpt}
                  </p>

                  <div className="featured-meta">
                    <span className="featured-date">{new Date(featuredCase.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    {featuredCase._count && (
                      <div className="featured-stats">
                        <span>{featuredCase._count.sources || 0} sources</span>
                        <span className="stat-separator">·</span>
                        <span>{featuredCase._count.statements || 0} statements</span>
                      </div>
                    )}
                  </div>

                  <Link href={`/cases/${featuredCase.slug}`}>
                    <span className="featured-link">Read Full Case →</span>
                  </Link>
                </div>
              </article>
            </section>
          )}

          {/* Methodology Section */}
          <section className="methodology" aria-label="Documentation methodology">
            <div className="section-header">
              <h2>How We Work</h2>
              <div className="section-line"></div>
            </div>

            <div className="methodology-grid">
              <div className="methodology-step">
                <div className="step-number">1</div>
                <h3>Identification</h3>
                <p>We identify significant public statements from verified sources</p>
              </div>

              <div className="methodology-step">
                <div className="step-number">2</div>
                <h3>Documentation</h3>
                <p>Each statement is documented with full context and timeline</p>
              </div>

              <div className="methodology-step">
                <div className="step-number">3</div>
                <h3>Verification</h3>
                <p>Multiple sources are cross-referenced for accuracy</p>
              </div>

              <div className="methodology-step">
                <div className="step-number">4</div>
                <h3>Attribution</h3>
                <p>Clear attribution to speakers and original sources</p>
              </div>

              <div className="methodology-step">
                <div className="step-number">5</div>
                <h3>Contextualization</h3>
                <p>Relevant background and responses are included</p>
              </div>

              <div className="methodology-step">
                <div className="step-number">6</div>
                <h3>Preservation</h3>
                <p>Permanent archival for historical record</p>
              </div>
            </div>

            <div className="methodology-cta">
              <Link href="/methodology">
                <button type="button" className="btn-secondary">
                  View Full Methodology
                </button>
              </Link>
            </div>
          </section>

          {/* Newsletter Section */}
          <section className="newsletter" aria-label="Newsletter subscription">
            <div className="newsletter-inner">
              <h2>Stay Informed</h2>
              <p className="newsletter-description">
                Receive weekly updates on newly documented statements and cases
              </p>

              <form className="newsletter-form" onSubmit={handleSubscribe} aria-label="Subscribe to newsletter">
                <div className="form-group">
                  <input
                    type="email"
                    className="email-input"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-label="Email address"
                    disabled={subscribeStatus === 'loading'}
                  />
                  <button
                    type="submit"
                    className="btn-subscribe"
                    disabled={subscribeStatus === 'loading'}
                    aria-label="Subscribe"
                  >
                    {subscribeStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </div>

                {subscribeStatus === 'success' && (
                  <p className="form-message success" role="alert">Thank you for subscribing!</p>
                )}

                {subscribeStatus === 'error' && (
                  <p className="form-message error" role="alert">Something went wrong. Please try again.</p>
                )}

                <p className="privacy-note">
                  We respect your privacy. Read our <Link href="/privacy">Privacy Policy</Link>.
                </p>
              </form>
            </div>
          </section>

          {/* Mobile Footer Banner Ad */}
          <div className="mobile-ad-footer">
            <AdSlot position="footer-banner" />
          </div>
        </main>

        {/* Right Sidebar Ad */}
        <aside className="ad-right" aria-label="Right advertisement">
          <AdSlot position="right-sidebar" />
        </aside>
      </div>

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

        /* Top Banner Ad Container */
        .top-ad-container {
          background: var(--bg-secondary);
          padding: 1rem 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 106px;
          border-bottom: 1px solid var(--border-light);
        }

        /* Main Layout Grid */
        .layout-grid {
          display: grid;
          grid-template-columns: 160px 1fr 160px;
          gap: 20px;
          max-width: 1240px;
          margin: 0 auto;
          padding: 2rem 1rem;
          background: var(--bg-primary);
        }

        /* Sidebar Ads */
        .ad-left, .ad-right {
          position: sticky;
          top: 80px;
          height: fit-content;
        }

        /* Main Content Area */
        .main-content {
          max-width: 680px;
          margin: 0 auto;
          width: 100%;
        }

        /* Hero Section */
        .hero {
          background: white;
          padding: 3rem 2.5rem;
          border-radius: 2px;
          border: 1px solid var(--border-light);
          margin-bottom: 3rem;
          text-align: center;
        }

        .hero-inner {
          max-width: 580px;
          margin: 0 auto;
        }

        .hero-title {
          font-family: 'Cinzel', serif;
          font-size: 2.5rem;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          letter-spacing: 0.05em;
        }

        .hero-divider {
          width: 80px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          margin: 0 auto 2rem;
        }

        .hero-text {
          margin-bottom: 2rem;
        }

        .hero-intro {
          font-family: 'Inter', sans-serif;
          font-size: 1.15rem;
          line-height: 1.8;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
          font-weight: 500;
        }

        .hero-body {
          font-family: 'Inter', sans-serif;
          font-size: 1.05rem;
          line-height: 1.75;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .hero-conclusion {
          font-family: 'Inter', sans-serif;
          font-size: 1.05rem;
          line-height: 1.75;
          color: var(--text-primary);
          font-weight: 500;
          font-style: italic;
        }

        .hero-attribution {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          color: var(--text-secondary);
          font-style: italic;
          margin-top: 1.5rem;
        }

        /* Section Headers */
        .section-header {
          margin-bottom: 2rem;
        }

        .section-header h2 {
          font-family: 'Cinzel', serif;
          font-size: 1.875rem;
          font-weight: 500;
          color: var(--text-primary);
          text-align: center;
          margin-bottom: 1rem;
        }

        .section-line {
          width: 60px;
          height: 1px;
          background: var(--accent);
          margin: 0 auto;
          opacity: 0.5;
        }

        /* Latest Cases */
        .latest-cases {
          margin-bottom: 3rem;
        }

        .cases-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .case-item {
          position: relative;
        }

        .mobile-ad-inline {
          display: none;
        }

        .view-more {
          text-align: center;
          margin-top: 2rem;
        }

        .btn-view-all {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-primary);
          background: transparent;
          border: 1px solid var(--border-dark);
          padding: 0.75rem 2rem;
          border-radius: 2px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          letter-spacing: 0.025em;
        }

        .btn-view-all:hover {
          background: var(--text-primary);
          color: white;
          transform: translateY(-2px);
        }

        .btn-arrow {
          transition: transform 0.3s ease;
        }

        .btn-view-all:hover .btn-arrow {
          transform: translateX(4px);
        }

        /* Featured Case */
        .featured-case {
          margin-bottom: 3rem;
        }

        .featured-card {
          background: white;
          padding: 2.5rem;
          border-radius: 2px;
          border: 1px solid var(--border-light);
          transition: box-shadow 0.3s ease;
        }

        .featured-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .featured-title {
          font-family: 'Cinzel', serif;
          font-size: 1.5rem;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .featured-title a {
          color: inherit;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .featured-title a:hover {
          color: var(--accent);
        }

        .featured-excerpt {
          font-family: 'Inter', sans-serif;
          font-size: 1.05rem;
          line-height: 1.7;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .featured-meta {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 1rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .featured-stats {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stat-separator {
          color: var(--border-dark);
        }

        .featured-link {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--accent);
          text-decoration: none;
          transition: all 0.3s ease;
          display: inline-block;
        }

        .featured-link:hover {
          color: var(--text-primary);
          transform: translateX(4px);
        }

        /* Methodology Section */
        .methodology {
          background: white;
          padding: 3rem 2.5rem;
          border-radius: 2px;
          border: 1px solid var(--border-light);
          margin-bottom: 3rem;
        }

        .methodology-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-bottom: 2.5rem;
        }

        .methodology-step {
          text-align: center;
          padding: 1.5rem;
          background: var(--bg-primary);
          border-radius: 2px;
          transition: transform 0.3s ease, background 0.3s ease;
        }

        .methodology-step:hover {
          transform: translateY(-4px);
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--accent);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: 1.25rem;
          margin: 0 auto 1rem;
        }

        .methodology-step h3 {
          font-family: 'Inter', sans-serif;
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .methodology-step p {
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        .methodology-cta {
          text-align: center;
        }

        .btn-secondary {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--accent);
          background: transparent;
          border: 1px solid var(--accent);
          padding: 0.75rem 2rem;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
          letter-spacing: 0.025em;
        }

        .btn-secondary:hover {
          background: var(--accent);
          color: white;
        }

        /* Newsletter Section */
        .newsletter {
          background: var(--bg-secondary);
          padding: 3rem;
          border-radius: 2px;
          border: 1px solid var(--border-light);
          margin-bottom: 3rem;
        }

        .newsletter-inner {
          max-width: 500px;
          margin: 0 auto;
          text-align: center;
        }

        .newsletter h2 {
          font-family: 'Cinzel', serif;
          font-size: 1.875rem;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .newsletter-description {
          font-family: 'Inter', sans-serif;
          font-size: 1.05rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .newsletter-form {
          margin-top: 1.5rem;
        }

        .form-group {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .email-input {
          flex: 1;
          padding: 0.75rem 1rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          border: 1px solid var(--border-dark);
          border-radius: 2px;
          background: white;
          color: var(--text-primary);
          transition: border-color 0.3s ease;
        }

        .email-input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .email-input::placeholder {
          color: #999;
        }

        .btn-subscribe {
          padding: 0.75rem 2rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
          letter-spacing: 0.025em;
        }

        .btn-subscribe:hover:not(:disabled) {
          background: var(--text-primary);
          transform: translateY(-2px);
        }

        .btn-subscribe:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-message {
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          margin-top: 0.75rem;
          padding: 0.5rem;
          border-radius: 2px;
        }

        .form-message.success {
          color: #2e7d32;
          background: #e8f5e9;
        }

        .form-message.error {
          color: #c62828;
          background: #ffebee;
        }

        .privacy-note {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: 1rem;
        }

        .privacy-note a {
          color: var(--accent);
          text-decoration: underline;
        }

        .privacy-note a:hover {
          color: var(--text-primary);
        }

        .mobile-ad-footer {
          display: none;
        }

        /* Responsive Design */
        @media (max-width: 1300px) {
          .layout-grid {
            grid-template-columns: 140px 1fr 140px;
            gap: 16px;
            max-width: 1100px;
          }
        }

        @media (max-width: 1100px) {
          .layout-grid {
            grid-template-columns: 1fr;
            padding: 1rem;
            max-width: 750px;
          }

          .ad-left, .ad-right {
            display: none;
          }

          .cases-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .methodology-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .top-ad-container {
            min-height: 66px;
            padding: 0.75rem 0;
          }

          .hero {
            padding: 2rem 1.5rem;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-intro {
            font-size: 1.05rem;
          }

          .hero-body, .hero-conclusion {
            font-size: 1rem;
          }

          .cases-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .mobile-ad-inline {
            display: block;
            margin: 1.5rem 0;
            padding: 1rem;
            background: var(--bg-secondary);
            border-radius: 2px;
          }

          .methodology-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .methodology-step {
            padding: 1rem;
          }

          .newsletter {
            padding: 2rem 1.5rem;
          }

          .form-group {
            flex-direction: column;
          }

          .email-input, .btn-subscribe {
            width: 100%;
          }

          .mobile-ad-footer {
            display: flex;
            justify-content: center;
            margin-top: 2rem;
            padding: 1rem;
            background: var(--bg-secondary);
            border-radius: 2px;
          }
        }

        @media (max-width: 480px) {
          .main-content {
            padding: 0;
          }

          .hero {
            padding: 1.5rem 1rem;
            margin-bottom: 2rem;
          }

          .hero-title {
            font-size: 1.75rem;
          }

          .section-header h2 {
            font-size: 1.5rem;
          }

          .featured-title {
            font-size: 1.25rem;
          }

          .methodology, .newsletter {
            padding: 1.5rem 1rem;
            margin-bottom: 2rem;
          }

          .btn-view-all, .btn-secondary, .btn-subscribe {
            font-size: 0.9rem;
            padding: 0.65rem 1.5rem;
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

        /* Dark Mode Support */
        @media (prefers-color-scheme: dark) {
          :root {
            --bg-primary: #1a1a1a;
            --bg-secondary: #242424;
            --text-primary: #f0f0f0;
            --text-secondary: #b0b0b0;
            --border-light: #3a3a3a;
            --border-dark: #4a4a4a;
          }

          .hero, .featured-card, .methodology {
            background: var(--bg-secondary);
          }

          .methodology-step {
            background: var(--bg-primary);
          }

          .methodology-step:hover {
            background: var(--bg-secondary);
          }

          .email-input {
            background: var(--bg-primary);
            color: var(--text-primary);
          }
        }
      `}</style>
    </Layout>
  )
}

export async function getStaticProps() {
  const prisma = new PrismaClient()

  try {
    // Get promoted cases with sources and statements count
    const promotedCases = await prisma.case.findMany({
      where: {
        isRealIncident: true,
        wasManuallyPromoted: true
      },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        caseDate: true,
        _count: {
          select: {
            sources: true,
            statements: true
          }
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        promotedAt: 'desc'
      },
      take: 10
    })

    // Featured case is the most recent promoted case
    const featuredCase: CaseStudy | null = promotedCases.length > 0 ? {
      slug: promotedCases[0].slug,
      title: promotedCases[0].title,
      date: promotedCases[0].caseDate?.toISOString() || new Date().toISOString(),
      caseDate: promotedCases[0].caseDate?.toISOString(),
      excerpt: promotedCases[0].summary || '',
      summary: promotedCases[0].summary || '',
      _count: promotedCases[0]._count,
      tags: promotedCases[0].tags.map(t => ({
        name: t.name,
        slug: t.slug
      })),
      status: 'DOCUMENTED',
      isVerified: true,
      isFeatured: true
    } : null

    // All cases for the latest cases section (excluding the featured one)
    const allCases: CaseStudy[] = promotedCases.slice(1).map(c => ({
      slug: c.slug,
      title: c.title,
      date: c.caseDate?.toISOString() || new Date().toISOString(),
      caseDate: c.caseDate?.toISOString(),
      excerpt: c.summary || '',
      summary: c.summary || '',
      _count: c._count,
      tags: c.tags.map(t => ({
        name: t.name,
        slug: t.slug
      })),
      status: 'DOCUMENTED',
      isVerified: true
    }))

    await prisma.$disconnect()

    return {
      props: {
        allCases,
        featuredCase
      },
      revalidate: 300 // Revalidate every 5 minutes
    }
  } catch (error) {
    console.error('Error fetching cases:', error)
    await prisma.$disconnect()

    // Return empty arrays as fallback
    return {
      props: {
        allCases: [],
        featuredCase: null
      },
      revalidate: 60
    }
  }
}