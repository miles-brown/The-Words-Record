import Head from 'next/head'
import Link from 'next/link'
import { getAllCases } from '../lib/cases'
import Layout from '../components/Layout'
import FeaturedCaseCarousel from '../components/FeaturedCaseCarousel'
import SiteMetrics from '../components/SiteMetrics'
import WhatWeDoSection from '../components/WhatWeDoSection'
import MethodologyPreview from '../components/MethodologyPreview'
import CTASection from '../components/CTASection'
import CaseCardEnhanced from '../components/CaseCardEnhanced'

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
      </Head>

      {/* Featured Case Carousel */}
      {featuredCases.length > 0 && (
        <FeaturedCaseCarousel featuredCases={featuredCases} />
      )}

      {/* Site Metrics */}
      <SiteMetrics />

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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-icon {
          width: 20px;
          height: 20px;
        }

        @media (max-width: 768px) {
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
      `}</style>
    </Layout>
  )
}

export async function getStaticProps() {
  const allCases = getAllCases()

  // Filter featured cases (you can add a featured field to your markdown frontmatter)
  // For now, just use the first 3-5 most recent cases as featured
  const featuredCases: FeaturedCase[] = allCases
    .slice(0, 5)
    .map(c => ({
      slug: c.slug,
      title: c.title,
      summary: c.excerpt || c.summary || '',
      excerpt: c.excerpt,
      caseDate: c.date,
      _count: {
        sources: 0, // These would come from the database
        statements: 0
      },
      tags: normalizeTags(c.tags)
    }))

  return {
    props: {
      allCases,
      featuredCases
    }
  }
}
