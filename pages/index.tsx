import Head from 'next/head'
import Link from 'next/link'
import { PrismaClient } from '@prisma/client'
import Layout from '../components/Layout'
import FeaturedCaseCarousel from '../components/FeaturedCaseCarousel'
import SiteMetrics from '../components/SiteMetrics'
import WhatWeDoSection from '../components/WhatWeDoSection'
import MethodologyPreview from '../components/MethodologyPreview'
import CTASection from '../components/CTASection'
import CaseCardEnhanced from '../components/CaseCardEnhanced'
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

interface FeaturedCase {
  slug: string
  title: string
  summary?: string
  excerpt?: string
  date?: string
  caseDate?: string
  _count?: {
    sources?: number
    statements?: number
  }
  tags?: Array<{
    name: string
    slug: string
  }>
}

interface HomeProps {
  allCases: CaseStudy[]
  featuredCases: FeaturedCase[]
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

export default function Home({ allCases, featuredCases }: HomeProps) {
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

      {/* Featured Case Carousel - Auto-rotates every 5 seconds */}
      {featuredCases.length > 0 && (
        <FeaturedCaseCarousel featuredCases={featuredCases} />
      )}

      {/* Site Metrics */}
      <SiteMetrics />

      {/* Hero Mission Statement */}
      <section className="hero-mission" aria-label="About The Words Record">
        <div className="mission-wrapper">
          <div className="mission-container">
            <div className="quote-mark opening">"</div>

            <div className="mission-content">
              <p className="mission-first">
                <strong>The Words Record</strong> exists to preserve the statements, denials, and defences that have shaped the world's most enduring conflict: the question of justice, identity, and power surrounding Palestine and Israel.
              </p>

              <p className="mission-text">
                This is not a regional story. It is a global one, about how truth is spoken, silenced, or rewritten, and about what happens when words become weapons or shields.
              </p>

              <p className="mission-text">
                Every record in this archive is factual, sourced, and traceable. Together they reveal how language defines allegiance, how narratives shape conscience, and how the world measures its own humanity through this single debate.
              </p>

              <p className="mission-final">
                The purpose is simple: to ensure that what was said remains visible, because how we remember these words will determine what kind of world we create next.
              </p>
            </div>

            <div className="quote-mark closing">"</div>

            <p className="mission-attribution">
              — Words from the founder of The Words Record
            </p>

            <div className="mission-cta">
              <Link href="/cases">
                <button type="button" className="btn-enter-record">
                  Enter the Record
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Cases Section */}
      <section className="cases-preview" aria-label="Recent cases">
        <div className="section-header">
          <h2>Recent Cases</h2>
          <p className="section-description">
            Latest documented public statements and responses
          </p>
        </div>

        <div className="cases-grid">
          {allCases.slice(0, 6).map((caseStudy) => (
            <CaseCardEnhanced
              key={caseStudy.slug}
              slug={caseStudy.slug}
              title={caseStudy.title}
              excerpt={caseStudy.excerpt}
              date={caseStudy.date}
              tags={normalizeTags(caseStudy.tags)}
              _count={caseStudy._count}
              status={caseStudy.status}
              isVerified={caseStudy.isVerified}
            />
          ))}
        </div>

        <div className="view-all">
          <Link href="/statements">
            <button type="button" className="btn-primary">
              View All Statements
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="btn-icon">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </button>
          </Link>
        </div>
      </section>

      {/* What We Do Section */}
      <WhatWeDoSection />

      {/* Methodology Preview */}
      <MethodologyPreview />

      {/* Call to Action Section */}
      <CTASection />

      <style jsx>{`
        /* Hero Mission Statement */
        .hero-mission {
          background: #f8f9fa;
          padding: 5rem 2rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .mission-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: flex-start;
        }

        .mission-container {
          max-width: 70%;
          position: relative;
        }

        .quote-mark {
          font-family: 'Merriweather', Georgia, serif;
          font-size: 6rem;
          line-height: 0.5;
          color: #4a708b;
          opacity: 0.25;
          position: absolute;
        }

        .quote-mark.opening {
          top: -30px;
          left: -45px;
        }

        .quote-mark.closing {
          bottom: 90px;
          right: -30px;
        }

        .mission-content {
          padding: 20px 0;
        }

        .mission-first {
          font-family: 'Lato', sans-serif;
          font-size: 1.25rem;
          font-weight: 400;
          line-height: 1.7;
          color: #1f1f1f;
          margin-bottom: 1.25rem;
        }

        .mission-first strong {
          font-weight: 700;
        }

        .mission-text {
          font-family: 'Lato', sans-serif;
          font-size: 1.1875rem;
          font-weight: 400;
          line-height: 1.65;
          color: #1f1f1f;
          margin-bottom: 1.25rem;
        }

        .mission-final {
          font-family: 'Lato', sans-serif;
          font-size: 1.1875rem;
          font-weight: 500;
          font-style: normal;
          line-height: 1.65;
          color: #1f1f1f;
          margin-bottom: 0;
        }

        .mission-attribution {
          font-family: 'Lato', sans-serif;
          font-size: 1rem;
          font-weight: 400;
          font-style: italic;
          color: #4a708b;
          text-align: right;
          margin-top: 1.5rem;
          margin-bottom: 2rem;
        }

        .mission-cta {
          margin-top: 2.5rem;
        }

        .btn-enter-record {
          background: transparent;
          color: var(--text-primary);
          border: 1px solid rgba(0, 0, 0, 0.12);
          padding: 0.75rem 2rem;
          border-radius: 2px;
          font-family: 'Lato', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: 0.025em;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .dark-mode .btn-enter-record {
          border-color: rgba(255, 255, 255, 0.15);
        }

        .btn-enter-record::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.03), transparent);
          transition: left 0.5s ease;
        }

        .dark-mode .btn-enter-record::before {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
        }

        .btn-enter-record:hover::before {
          left: 100%;
        }

        .btn-enter-record:hover {
          border-color: rgba(0, 0, 0, 0.25);
          background: rgba(0, 0, 0, 0.02);
          transform: translateY(-1px);
        }

        .dark-mode .btn-enter-record:hover {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.03);
        }

        .btn-enter-record:active {
          transform: translateY(0);
        }

        .cases-preview {
          max-width: 1200px;
          margin: 0 auto;
          padding: 4rem 0;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-header h2 {
          font-size: 2.5rem;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .section-description {
          font-size: 1.15rem;
          color: var(--text-secondary);
        }

        .cases-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .view-all {
          text-align: center;
          margin-top: 3rem;
        }

        .btn-primary {
          background: transparent;
          color: var(--text-primary);
          border: 1px solid rgba(0, 0, 0, 0.12);
          padding: 0.65rem 1.4rem;
          border-radius: 2px;
          font-family: 'Lato', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.025em;
          position: relative;
          overflow: hidden;
        }

        .dark-mode .btn-primary {
          border-color: rgba(255, 255, 255, 0.15);
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.03), transparent);
          transition: left 0.5s ease;
        }

        .dark-mode .btn-primary::before {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
        }

        .btn-primary:hover::before {
          left: 100%;
        }

        .btn-primary:hover {
          border-color: rgba(0, 0, 0, 0.25);
          background: rgba(0, 0, 0, 0.02);
          transform: translateY(-1px);
        }

        .dark-mode .btn-primary:hover {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.03);
        }

        .btn-icon {
          width: 20px;
          height: 20px;
        }

        @media (max-width: 768px) {
          .hero-mission {
            padding: 4rem 2rem;
          }

          .mission-first {
            font-size: 1.125rem;
            line-height: 1.9;
          }

          .mission-text {
            font-size: 1.0625rem;
            line-height: 1.9;
          }

          .mission-final {
            font-size: 1.0625rem;
          }

          .mission-attribution {
            font-size: 0.95rem;
          }

          .btn-enter-record {
            padding: 1rem 2.5rem;
            font-size: 1rem;
          }

          .cases-preview {
            padding: 3rem 0;
          }

          .section-header h2 {
            font-size: 2rem;
          }

          .section-description {
            font-size: 1.05rem;
          }

          .cases-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .hero-mission {
            padding: 3rem 1.5rem;
          }

          .mission-first {
            font-size: 1.0625rem;
            line-height: 1.85;
          }

          .mission-text {
            font-size: 1rem;
            line-height: 1.85;
          }

          .mission-final {
            font-size: 1rem;
          }

          .mission-attribution {
            font-size: 0.9rem;
          }

          .btn-enter-record {
            padding: 1rem 2.5rem;
            font-size: 1rem;
            width: 100%;
            max-width: 300px;
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

    // Select 4-5 featured cases for the carousel (top promoted cases)
    const featuredCases: FeaturedCase[] = promotedCases.slice(0, 5).map(c => ({
      slug: c.slug,
      title: c.title,
      summary: c.summary || '',
      excerpt: c.summary || '',
      caseDate: c.caseDate?.toISOString() || new Date().toISOString(),
      _count: c._count,
      tags: c.tags.map(t => ({
        name: t.name,
        slug: t.slug
      }))
    }))

    // All cases for the recent cases section
    const allCases: CaseStudy[] = promotedCases.map(c => ({
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
        featuredCases
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
        featuredCases: []
      },
      revalidate: 60
    }
  }
}
