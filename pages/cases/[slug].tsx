import { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import Layout from '@/components/Layout'
import Breadcrumbs from '@/components/Breadcrumbs'
import { ContentSkeleton } from '@/components/LoadingSkeletons'
import { CaseWithRelations } from '@/types'
import { prisma } from '@/lib/prisma'

interface CasePageProps {
  caseItem: any | null
}

export default function CasePage({ caseItem }: CasePageProps) {
  const router = useRouter()

  if (router.isFallback) {
    return (
      <Layout title="Loading...">
        <ContentSkeleton />
      </Layout>
    )
  }

  if (!caseItem) {
    return (
      <Layout title="Case Not Found">
        <div className="error-page">
          <h1>Case Not Found</h1>
          <p>The case you're looking for doesn't exist in our database.</p>
          <Link href="/cases">
            <button type="button">Browse All Cases</button>
          </Link>
        </div>

        <style jsx>{`
          .error-page {
            text-align: center;
            padding: 4rem 0;
          }

          .error-page h1 {
            color: #e74c3c;
            margin-bottom: 1rem;
          }

          button {
            background: var(--accent-primary);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            margin-top: 1rem;
            cursor: pointer;
          }
        `}</style>
      </Layout>
    )
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": caseItem.title,
    "description": caseItem.summary,
    "startDate": caseItem.caseDate,
    "location": {
      "@type": "Place",
      "name": caseItem.location || "Unspecified"
    }
  }

  return (
    <Layout
      title={caseItem.title}
      description={caseItem.summary}
    >
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <article className="case-page">
        <Breadcrumbs
          items={[
            { label: 'What?', href: '/cases' },
            { label: caseItem.title }
          ]}
        />

        <div className="case-header">
          <h1>{caseItem.title}</h1>

          <div className="case-meta">
            <span className="meta-item">
              <time dateTime={caseItem.caseDate}>
                {format(new Date(caseItem.caseDate), 'MMMM d, yyyy')}
              </time>
            </span>
            {caseItem.location && (
              <span className="meta-item">
                {caseItem.location}
              </span>
            )}
          </div>

          {caseItem.tags && caseItem.tags.length > 0 && (
            <div className="tags">
              {caseItem.tags.map((tag: any) => (
                <span key={tag.id} className="tag">{tag.name}</span>
              ))}
            </div>
          )}
        </div>

        <section className="case-summary">
          <h2>Summary</h2>
          <p>{caseItem.summary}</p>
        </section>

        <section className="case-description">
          <h2>Full Description</h2>
          <div className="description-content markdown-content">
            <ReactMarkdown>{caseItem.description}</ReactMarkdown>
          </div>
        </section>

        {/* Mid-page Ad Banner */}
        <div className="ad-banner ad-banner-mid">
          <p>Advertisement</p>
        </div>

        {caseItem.people && caseItem.people.length > 0 && (
          <section className="involved-people">
            <h2>People Involved</h2>
            <div className="people-grid">
              {caseItem.people.filter((person: any): person is NonNullable<typeof person> => person !== null).map((person: any) => {
                // Determine if person made a statement or response
                const madeStatement = caseItem.statements?.some((s: any) => s.person?.id === person.id)
                const madeResponse = caseItem.statements?.some((s: any) =>
                                     s.responses?.some((r: any) => r.person?.id === person.id)
                                   )

                return (
                  <Link href={`/people/${person.slug}`} key={person.id}>
                    <div className="person-card">
                      <div className="person-card-image">
                        {person.imageUrl ? (
                          <Image
                            src={person.imageUrl}
                            alt={person.name}
                            width={60}
                            height={60}
                            objectFit="cover"
                          />
                        ) : (
                          <div className="person-card-placeholder">
                            {person.name[0]}
                          </div>
                        )}
                      </div>
                      <div className="person-card-info">
                        <h3>{person.name}</h3>
                        {person.profession && <p className="profession">{person.profession}</p>}
                        <div className="person-role">
                          {madeStatement && <span className="role-badge statement">Made Statement</span>}
                          {madeResponse && <span className="role-badge response">Responded</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {caseItem.statements && caseItem.statements.length > 0 && (
          <section className="statements-section">
            <h2>Statements ({caseItem.statements.length})</h2>
            <div className="statements-timeline">
              {caseItem.statements.map((statement: any) => (
                <div key={statement.id} className="statement-item stagger-item">
                  <div className="statement-header">
                    {statement.person ? (
                      <Link href={`/people/${statement.person.slug}`}>
                        <span className="statement-author">{statement.person.name}</span>
                      </Link>
                    ) : (
                      <span className="statement-author">Unknown</span>
                    )}
                    <span className="statement-date">
                      {format(new Date(statement.statementDate), 'MMMM d, yyyy')}
                    </span>
                    {statement.medium && (
                      <span className="statement-medium">via {statement.medium}</span>
                    )}
                  </div>

                  <div className="block-quote">
                    <span className="quote-mark">&ldquo;</span>
                    <div className="quote-content">{statement.content}</div>
                  </div>

                  {statement.context && (
                    <div className="statement-context">
                      <strong>Context:</strong> {statement.context}
                    </div>
                  )}

                  {statement.responses && statement.responses.length > 0 && (
                    <div className="responses">
                      <h4>Responses:</h4>
                      {statement.responses.map((response: any) => (
                        <div key={response.id} className="response-item">
                          <div className="response-header">
                            {response.person && (
                              <Link href={`/people/${response.person.slug}`}>
                                <span className="response-author">{response.person.name}</span>
                              </Link>
                            )}
                            {response.organization && (
                              <span className="response-author">{response.organization.name}</span>
                            )}
                            <span className="response-type">{response.responseType}</span>
                            <span className="response-date">
                              {format(new Date(response.statementDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <p className="response-content">{response.content}</p>
                          {response.responseImpact && (
                            <p className="response-impact">
                              <strong>Impact:</strong> {response.responseImpact}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {caseItem.sources && caseItem.sources.length > 0 && (
          <section className="sources-section">
            <h2>Sources & References</h2>
            <ol className="sources-list">
              {caseItem.sources.map((source: any) => (
                <li key={source.id}>
                  {source.url ? (
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.title}
                    </a>
                  ) : (
                    <span>{source.title}</span>
                  )}
                  {source.publication && <span className="publication"> - {source.publication}</span>}
                  {source.author && <span className="author"> by {source.author}</span>}
                  {source.publishDate && (
                    <span className="publish-date">
                      {' '}({format(new Date(source.publishDate), 'MMMM yyyy')})
                    </span>
                  )}
                  {source.credibility && (
                    <span className={`credibility credibility-${source.credibility}`}>
                      [{source.credibility}]
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        {caseItem.relatedCases && caseItem.relatedCases.length > 0 && (
          <section className="related-cases">
            <h2>Related Cases</h2>
            <div className="related-grid">
              {caseItem.relatedCases.map((related: any) => (
                <Link href={`/cases/${related.slug}`} key={related.id}>
                  <div className="related-card">
                    <h3>{related.title}</h3>
                    <span className="related-date">
                      {format(new Date(related.caseDate), 'MMM d, yyyy')}
                    </span>
                    <p className="related-summary">{related.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <footer className="case-footer">
          <div className="publication-info">
            <p>
              <strong>Published:</strong>{' '}
              {format(new Date(caseItem.publicationDate), 'MMMM d, yyyy')}
            </p>
            <p>
              <strong>Last Updated:</strong>{' '}
              {format(new Date(caseItem.updatedAt), 'MMMM d, yyyy')}
            </p>
          </div>

          <div className="disclaimer">
            <h3>Disclaimer</h3>
            <p>
              This case report is compiled from publicly available information and verified sources.
              We strive for accuracy and neutrality in our documentation. If you have corrections or
              additional verified sources, please contact us.
            </p>
          </div>
        </footer>
      </article>

      <style jsx>{`
        .case-page {
          max-width: 900px;
          margin: 0 auto;
        }

        .back-link {
          color: var(--accent-primary);
          text-decoration: none;
          display: inline-block;
          margin-bottom: 2rem;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        .case-header {
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid var(--border-primary);
        }

        .case-header h1 {
          font-size: 2.5rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .case-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .meta-item {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .ad-banner {
          background: var(--background-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 4px;
          padding: 3rem;
          text-align: center;
          color: var(--text-secondary);
          margin: 3rem 0;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag {
          background: var(--background-secondary);
          color: var(--text-primary);
          padding: 0.35rem 0.75rem;
          border-radius: 3px;
          font-size: 0.8rem;
          border: 1px solid var(--border-primary);
        }

        section {
          margin: 3rem 0;
        }

        section h2 {
          font-size: 1.8rem;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--border-primary);
        }

        .case-summary {
          background: var(--background-secondary);
          padding: 2rem;
          border-radius: 8px;
          border-left: 4px solid var(--accent-primary);
        }

        .case-summary p {
          font-size: 1.1rem;
          line-height: 1.8;
          color: var(--text-primary);
          margin: 0;
        }

        .description-content p {
          line-height: 1.8;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .markdown-content {
          font-size: 1.05rem;
        }

        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3,
        .markdown-content h4 {
          color: var(--text-primary);
          margin-top: 2rem;
          margin-bottom: 1rem;
          line-height: 1.4;
        }

        .markdown-content h1 {
          font-size: 2rem;
          border-bottom: 2px solid var(--border-primary);
          padding-bottom: 0.5rem;
        }

        .markdown-content h2 {
          font-size: 1.6rem;
        }

        .markdown-content h3 {
          font-size: 1.3rem;
        }

        .markdown-content ul,
        .markdown-content ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }

        .markdown-content li {
          margin-bottom: 0.75rem;
          line-height: 1.7;
        }

        .markdown-content strong {
          font-weight: 600;
          color: var(--text-primary);
        }

        .markdown-content em {
          font-style: italic;
        }

        .markdown-content a {
          color: var(--accent-primary);
          text-decoration: underline;
          transition: color 0.2s;
        }

        .markdown-content a:hover {
          color: #2c3e50;
        }

        .markdown-content blockquote {
          border-left: 4px solid var(--border-secondary);
          padding-left: 1.5rem;
          margin: 1.5rem 0;
          color: var(--text-secondary);
          font-style: italic;
        }

        .markdown-content code {
          background: var(--background-secondary);
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          color: var(--text-primary);
        }

        .markdown-content pre {
          background: var(--background-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 6px;
          padding: 1rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        .markdown-content pre code {
          background: none;
          padding: 0;
        }

        .markdown-content hr {
          border: none;
          border-top: 1px solid var(--border-primary);
          margin: 2rem 0;
        }

        .markdown-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }

        .markdown-content th,
        .markdown-content td {
          border: 1px solid var(--border-primary);
          padding: 0.75rem;
          text-align: left;
        }

        .markdown-content th {
          background: var(--background-secondary);
          font-weight: 600;
        }

        .people-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }

        .person-card {
          display: flex;
          gap: 1rem;
          align-items: center;
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 1rem;
          background: var(--background-primary);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .person-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .person-card-image {
          flex-shrink: 0;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid var(--border-primary);
        }

        .person-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .person-card-placeholder {
          width: 100%;
          height: 100%;
          background: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          font-weight: bold;
          font-family: 'Merriweather', Georgia, serif;
        }

        .person-card-info {
          flex: 1;
          min-width: 0;
        }

        .person-card h3 {
          color: var(--text-primary);
          margin-bottom: 0.25rem;
          font-size: 1.1rem;
        }

        .person-card .profession {
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin: 0 0 0.5rem 0;
        }

        .person-role {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .role-badge {
          font-size: 0.75rem;
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          font-weight: 500;
          white-space: nowrap;
        }

        .role-badge.statement {
          background: #e3f2fd;
          color: #1976d2;
        }

        .role-badge.response {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .statements-timeline {
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .statement-item {
          margin: 1.5rem 0;
        }

        .statement-header {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-primary);
          font-size: 0.9rem;
        }

        .statement-author {
          color: var(--accent-primary);
          font-weight: 500;
          cursor: pointer;
        }

        .statement-author:hover {
          text-decoration: underline;
        }

        .statement-date, .statement-medium {
          color: var(--text-secondary);
        }

        .block-quote {
          position: relative;
          margin: 1rem 0 1.5rem 3rem;
          padding-left: 1rem;
        }

        .quote-mark {
          position: absolute;
          left: -2.5rem;
          top: -0.5rem;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 5rem;
          font-weight: bold;
          line-height: 1;
          color: var(--accent-primary);
          opacity: 0.6;
          font-style: italic;
        }

        .quote-content {
          font-family: Garamond, 'EB Garamond', Georgia, serif;
          font-size: 1.05rem;
          line-height: 1.8;
          color: var(--text-primary);
          text-align: justify;
        }

        .statement-context {
          background: var(--background-secondary);
          padding: 1rem;
          border-radius: 6px;
          margin: 1rem 0 1rem 3rem;
          font-size: 0.95rem;
          border-left: 3px solid var(--accent-primary);
        }

        .responses {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-primary);
        }

        .responses h4 {
          font-size: 1.1rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .response-item {
          background: var(--background-primary);
          border: 1px solid var(--border-primary);
          border-radius: 6px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .response-header {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          font-size: 0.85rem;
        }

        .response-author {
          color: var(--accent-primary);
          font-weight: 500;
          cursor: pointer;
        }

        .response-author:hover {
          text-decoration: underline;
        }

        .response-type {
          background: var(--text-secondary);
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .response-date {
          color: var(--text-secondary);
        }

        .response-content {
          line-height: 1.6;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .response-impact {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .sources-section {
          background: var(--background-secondary);
          padding: 2rem;
          border-radius: 8px;
        }

        .sources-list {
          margin: 0;
          padding-left: 1.5rem;
        }

        .sources-list li {
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }

        .sources-list a {
          color: var(--accent-primary);
          text-decoration: none;
        }

        .sources-list a:hover {
          text-decoration: underline;
        }

        .publication, .author, .publish-date {
          color: var(--text-secondary);
        }

        .credibility {
          font-size: 0.85rem;
          margin-left: 0.5rem;
          font-weight: 500;
        }

        .credibility-primary {
          color: #27ae60;
        }

        .credibility-verified {
          color: #3498db;
        }

        .credibility-secondary {
          color: #f39c12;
        }

        .credibility-unverified {
          color: #e74c3c;
        }

        .related-cases {
          background: var(--background-secondary);
          border-radius: 8px;
          padding: 2rem;
        }

        .related-cases h2 {
          margin-bottom: 1.5rem;
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .related-card {
          background: var(--background-primary);
          border: 1px solid var(--border-primary);
          border-radius: 6px;
          padding: 1.5rem;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .related-card:hover {
          border-color: var(--border-secondary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .related-card h3 {
          font-size: 1.1rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }

        .related-date {
          font-size: 0.85rem;
          color: var(--text-secondary);
          display: block;
          margin-bottom: 0.75rem;
        }

        .related-summary {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .case-footer {
          margin-top: 4rem;
          padding-top: 2rem;
          border-top: 2px solid var(--border-primary);
        }

        .publication-info {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
          color: var(--text-secondary);
        }

        .publication-info strong {
          color: var(--text-primary);
        }

        .disclaimer {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .disclaimer h3 {
          color: #856404;
          margin-bottom: 0.75rem;
        }

        .disclaimer p {
          color: #856404;
          line-height: 1.6;
          margin: 0;
        }

        @media (max-width: 768px) {
          .case-header h1 {
            font-size: 2rem;
          }

          .case-meta {
            justify-content: center;
          }

          .people-grid {
            grid-template-columns: 1fr;
          }

          .person-card {
            gap: 0.75rem;
            padding: 0.75rem;
          }

          .person-card-image {
            width: 50px;
            height: 50px;
          }

          .person-card h3 {
            font-size: 1rem;
          }

          .person-card .profession {
            font-size: 0.8rem;
          }

          .statement-header,
          .response-header {
            flex-direction: column;
            gap: 0.5rem;
          }

          .publication-info {
            flex-direction: column;
            gap: 0.5rem;
          }

          .block-quote {
            margin: 1rem 0 1.5rem 2rem;
            padding-left: 0.5rem;
          }

          .quote-mark {
            left: -1.8rem;
            font-size: 3.5rem;
          }

          .statement-context {
            margin-left: 2rem;
          }
        }
      `}</style>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    // Corrected Prisma model reference: using prisma.case (schema defines 'model Case')
    const cases = await prisma.case.findMany({
      select: { slug: true }
    })

    // Safety check: ensure cases is defined and is an array
    if (!cases || !Array.isArray(cases)) {
      return {
        paths: [],
        fallback: true
      }
    }

    const paths = cases.map((caseItem) => ({
      params: { slug: caseItem.slug }
    }))

    return {
      paths,
      fallback: true
    }
  } catch (error) {
    console.error('Error in getStaticPaths:', error)
    // Return empty paths with fallback enabled to allow dynamic generation
    return {
      paths: [],
      fallback: true
    }
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!params?.slug || typeof params.slug !== 'string') {
    return { notFound: true }
  }

  try {
    // Corrected Prisma model reference: using prisma.case (schema defines 'model Case')
    const caseItem = await prisma.case.findUnique({
      where: { slug: params.slug },
      include: {
        people: true,
        organizations: true,
        tags: true,
        statements: {
          include: {
            person: true,
            sources: true,
            responses: {
              include: {
                person: true,
                organization: true
              }
            }
          },
          orderBy: {
            statementDate: 'desc'
          }
        },
        sources: {
          orderBy: {
            publishDate: 'desc'
          }
        }
      }
    })

    if (!caseItem) {
      return { notFound: true }
    }

    // Corrected Prisma model reference: using prisma.case for related cases query
    // Safety check: only fetch related cases if we have tags or people
    const relatedCases = (caseItem.tags?.length > 0 || caseItem.people?.length > 0)
      ? await prisma.case.findMany({
          where: {
            AND: [
              { id: { not: caseItem.id } }, // Exclude current case
              {
                OR: [
                  // Cases with shared tags (only if tags exist)
                  ...(caseItem.tags?.length > 0 ? [{
                    tags: {
                      some: {
                        id: { in: caseItem.tags.map(t => t.id) }
                      }
                    }
                  }] : []),
                  // Cases with shared people (only if people exist)
                  ...(caseItem.people?.length > 0 ? [{
                    people: {
                      some: {
                        id: { in: caseItem.people.map(p => p.id) }
                      }
                    }
                  }] : [])
                ]
              }
            ]
          },
          select: {
            id: true,
            slug: true,
            title: true,
            summary: true,
            caseDate: true,
          },
          orderBy: {
            caseDate: 'desc'
          },
          take: 3
        })
      : [] // Return empty array if no tags or people to match

    return {
      props: {
        caseItem: JSON.parse(JSON.stringify({
          ...caseItem,
          relatedCases
        })) // Serialize dates
      },
      revalidate: 3600 // Revalidate every hour
    }
  } catch (error) {
    console.error('Error fetching case:', error)
    return { notFound: true }
  }
}

