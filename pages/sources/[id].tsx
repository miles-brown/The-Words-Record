import { useState } from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { PrismaClient } from '@prisma/client'
import { generateHarvardCitation, type CitationData } from '@/lib/harvard-citation'

const prisma = new PrismaClient()

interface SourceDetailProps {
  source: any
  harvardCitation: string
}

export default function SourceDetail({ source, harvardCitation }: SourceDetailProps) {
  const [copied, setCopied] = useState(false)

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function getCredibilityColor(credibility: string) {
    switch (credibility) {
      case 'HIGH': return '#22c55e'
      case 'MEDIUM': return '#eab308'
      case 'LOW': return '#ef4444'
      default: return '#94a3b8'
    }
  }

  function formatDate(dateString?: string) {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <Layout>
      <Head>
        <title>{source.title} | Sources | Who Said What</title>
        <meta name="description" content={`Source: ${source.title}`} />
      </Head>

      <div className="source-detail">
        <div className="breadcrumbs">
          <Link href="/sources">ê Back to Sources</Link>
        </div>

        <article className="source-content">
          <header className="source-header">
            <h1>{source.title}</h1>
            <div className="badges">
              {source.isArchived && <span className="badge archived">Archived</span>}
              {source.verificationStatus === 'VERIFIED' && <span className="badge verified">Verified</span>}
              {source.sourceType && (
                <span className="badge type">{source.sourceType.replace(/_/g, ' ')}</span>
              )}
            </div>
          </header>

          <div className="citation-section">
            <h2>Harvard Reference Citation</h2>
            <div className="citation-box">
              <p className="citation-text">{harvardCitation}</p>
              <button
                onClick={() => copyToClipboard(harvardCitation)}
                className="copy-button"
              >
                {copied ? 'Copied!' : 'Copy Citation'}
              </button>
            </div>
          </div>

          <div className="metadata-grid">
            <div className="metadata-section">
              <h3>Source Information</h3>

              {(source.author || source.journalist) && (
                <div className="metadata-item">
                  <label>Author</label>
                  <div>
                    {source.journalist ? (
                      <Link href={`/journalists/${source.journalist.slug}`}>
                        {source.journalist.name}
                      </Link>
                    ) : (
                      source.author
                    )}
                  </div>
                </div>
              )}

              {(source.publication || source.mediaOutlet) && (
                <div className="metadata-item">
                  <label>Publication</label>
                  <div>
                    {source.mediaOutlet ? (
                      <Link href={`/media-outlets/${source.mediaOutlet.slug}`}>
                        {source.mediaOutlet.name}
                      </Link>
                    ) : (
                      source.publication
                    )}
                  </div>
                </div>
              )}

              <div className="metadata-item">
                <label>Publication Date</label>
                <div>{formatDate(source.publishDate)}</div>
              </div>

              <div className="metadata-item">
                <label>Access Date</label>
                <div>{formatDate(source.accessDate)}</div>
              </div>

              <div className="metadata-item">
                <label>Credibility Rating</label>
                <div>
                  <span
                    className="credibility-badge"
                    style={{ backgroundColor: getCredibilityColor(source.credibility) }}
                  >
                    {source.credibility}
                  </span>
                </div>
              </div>

              {source.verificationStatus && (
                <div className="metadata-item">
                  <label>Verification Status</label>
                  <div>{source.verificationStatus}</div>
                </div>
              )}
            </div>

            <div className="metadata-section">
              <h3>Access & Archival</h3>

              {source.url && (
                <div className="metadata-item">
                  <label>Original URL</label>
                  <div>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      View original source í
                    </a>
                  </div>
                </div>
              )}

              {source.isArchived && source.archiveUrl && (
                <div className="metadata-item">
                  <label>Archive Snapshot</label>
                  <div>
                    <a href={source.archiveUrl} target="_blank" rel="noopener noreferrer">
                      View archived version í
                    </a>
                  </div>
                </div>
              )}

              {source.archiveDate && (
                <div className="metadata-item">
                  <label>Archive Date</label>
                  <div>{formatDate(source.archiveDate)}</div>
                </div>
              )}

              {source.lastVerified && (
                <div className="metadata-item">
                  <label>Last Verified</label>
                  <div>{formatDate(source.lastVerified)}</div>
                </div>
              )}

              {source.isBroken && (
                <div className="metadata-item">
                  <label>Status</label>
                  <div className="warning-text">† Link may be broken</div>
                </div>
              )}
            </div>
          </div>

          {(source.statement || source.case) && (
            <div className="related-section">
              <h3>Related Content</h3>

              {source.statement && (
                <div className="related-card">
                  <h4>Statement</h4>
                  <p>{source.statement.text}</p>
                  {source.statement.person && (
                    <p className="person-name">
                      By{' '}
                      <Link href={`/people/${source.statement.person.slug}`}>
                        {source.statement.person.name}
                      </Link>
                    </p>
                  )}
                  <Link href={`/statements/${source.statement.slug}`} className="view-link">
                    View statement í
                  </Link>
                </div>
              )}

              {source.case && (
                <div className="related-card">
                  <h4>Case</h4>
                  <h5>
                    <Link href={`/cases/${source.case.slug}`}>
                      {source.case.title}
                    </Link>
                  </h5>
                  {source.case.summary && <p>{source.case.summary}</p>}
                  <p className="case-date">Date: {formatDate(source.case.caseDate)}</p>
                </div>
              )}
            </div>
          )}

          {source.publicNotes && (
            <div className="notes-section">
              <h3>Additional Information</h3>
              <p>{source.publicNotes}</p>
            </div>
          )}
        </article>
      </div>

      <style jsx>{`
        .source-detail {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .breadcrumbs {
          margin-bottom: 1.5rem;
        }

        .breadcrumbs a {
          color: var(--accent-color);
          text-decoration: none;
          font-size: 0.95rem;
        }

        .breadcrumbs a:hover {
          text-decoration: underline;
        }

        .source-content {
          background: var(--card-background);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 2rem;
        }

        .source-header {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid var(--border-color);
        }

        .source-header h1 {
          font-size: 2rem;
          margin: 0 0 1rem 0;
          color: var(--text-primary);
        }

        .badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .badge {
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .badge.archived {
          background: #3b82f6;
          color: white;
        }

        .badge.verified {
          background: #22c55e;
          color: white;
        }

        .badge.type {
          background: var(--secondary-color);
          color: white;
        }

        .citation-section {
          margin-bottom: 2rem;
        }

        .citation-section h2 {
          font-size: 1.5rem;
          margin: 0 0 1rem 0;
          color: var(--text-primary);
        }

        .citation-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-left: 4px solid var(--accent-color);
          border-radius: 6px;
          padding: 1.5rem;
          position: relative;
        }

        .citation-text {
          font-family: 'Georgia', serif;
          font-size: 1rem;
          line-height: 1.6;
          margin: 0 0 1rem 0;
          color: var(--text-primary);
        }

        .copy-button {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: opacity 0.2s;
        }

        .copy-button:hover {
          opacity: 0.9;
        }

        .metadata-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .metadata-section h3 {
          font-size: 1.3rem;
          margin: 0 0 1rem 0;
          color: var(--text-primary);
        }

        .metadata-item {
          margin-bottom: 1rem;
        }

        .metadata-item label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metadata-item div {
          font-size: 1rem;
          color: var(--text-primary);
        }

        .metadata-item a {
          color: var(--accent-color);
          text-decoration: none;
        }

        .metadata-item a:hover {
          text-decoration: underline;
        }

        .credibility-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          color: white;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .warning-text {
          color: #ef4444;
          font-weight: 500;
        }

        .related-section {
          margin-bottom: 2rem;
        }

        .related-section h3 {
          font-size: 1.3rem;
          margin: 0 0 1rem 0;
          color: var(--text-primary);
        }

        .related-card {
          background: #f8fafc;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        .related-card h4 {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
          margin: 0 0 0.5rem 0;
        }

        .related-card h5 {
          font-size: 1.2rem;
          margin: 0 0 0.5rem 0;
        }

        .related-card h5 a {
          color: var(--text-primary);
          text-decoration: none;
        }

        .related-card h5 a:hover {
          color: var(--accent-color);
        }

        .related-card p {
          margin: 0.5rem 0;
          color: var(--text-secondary);
        }

        .person-name {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .person-name a {
          color: var(--accent-color);
          text-decoration: none;
        }

        .person-name a:hover {
          text-decoration: underline;
        }

        .case-date {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .view-link {
          display: inline-block;
          margin-top: 0.5rem;
          color: var(--accent-color);
          text-decoration: none;
          font-size: 0.95rem;
        }

        .view-link:hover {
          text-decoration: underline;
        }

        .notes-section {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
        }

        .notes-section h3 {
          font-size: 1.3rem;
          margin: 0 0 1rem 0;
          color: var(--text-primary);
        }

        .notes-section p {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .source-content {
            padding: 1.5rem;
          }

          .source-header h1 {
            font-size: 1.5rem;
          }

          .metadata-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { id } = params as { id: string }

  const source = await prisma.source.findUnique({
    where: { id },
    include: {
      mediaOutlet: {
        select: {
          id: true,
          name: true,
          slug: true,
          country: true,
          website: true,
          type: true
        }
      },
      journalist: {
        select: {
          id: true,
          name: true,
          slug: true,
          nationality: true
        }
      },
      statement: {
        select: {
          id: true,
          text: true,
          slug: true,
          statementDate: true,
          person: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      },
      case: {
        select: {
          id: true,
          title: true,
          slug: true,
          caseDate: true,
          summary: true
        }
      }
    }
  })

  if (!source || source.isDeleted) {
    return {
      notFound: true
    }
  }

  // Generate Harvard citation
  const citationData: CitationData = {
    title: source.title,
    url: source.url || '',
    accessDate: source.accessDate,
    archiveUrl: source.archiveUrl || undefined
  }

  if (source.author) {
    citationData.author = source.author
  } else if (source.journalist) {
    citationData.author = source.journalist.name
  } else if (source.mediaOutlet) {
    citationData.authorOrg = source.mediaOutlet.name
  }

  if (source.publication) {
    citationData.publication = source.publication
  } else if (source.mediaOutlet) {
    citationData.publication = source.mediaOutlet.name
  }

  if (source.publishDate) {
    citationData.publicationDate = source.publishDate
    citationData.year = citationData.publicationDate.getFullYear()
  }

  const harvardCitation = generateHarvardCitation(citationData)

  return {
    props: {
      source: JSON.parse(JSON.stringify(source)),
      harvardCitation
    }
  }
}
