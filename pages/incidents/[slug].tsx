// @ts-nocheck
import { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { format } from 'date-fns'
import Layout from '@/components/Layout'
import { ContentSkeleton } from '@/components/LoadingSkeletons'
import { IncidentWithRelations } from '@/types'
import prisma from '@/lib/prisma'

interface IncidentPageProps {
  incident: any | null
}

export default function IncidentPage({ incident }: IncidentPageProps) {
  const router = useRouter()

  if (router.isFallback) {
    return (
      <Layout title="Loading...">
        <ContentSkeleton />
      </Layout>
    )
  }

  if (!incident) {
    return (
      <Layout title="Incident Not Found">
        <div className="error-page">
          <h1>Incident Not Found</h1>
          <p>The incident you're looking for doesn't exist in our database.</p>
          <Link href="/incidents">
            <button>Browse All Incidents</button>
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
    "name": incident.title,
    "description": incident.summary,
    "startDate": incident.incidentDate,
    "location": {
      "@type": "Place",
      "name": incident.location || "Unspecified"
    }
  }

  return (
    <Layout 
      title={incident.title} 
      description={incident.summary}
    >
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <article className="incident-page">
        <div className="incident-header">
          <Link href="/incidents" className="back-link">
            ← Back to Incidents
          </Link>
          
          <h1>{incident.title}</h1>
          
          <div className="incident-meta">
            <span className="meta-item">
              <strong>Date:</strong>{' '}
              <time dateTime={incident.incidentDate}>
                {format(new Date(incident.incidentDate), 'MMMM d, yyyy')}
              </time>
            </span>
            <span className={`meta-item status status-${incident.status}`}>
              <strong>Status:</strong> {incident.status}
            </span>
            {incident.severity && (
              <span className={`meta-item severity severity-${incident.severity}`}>
                <strong>Severity:</strong> {incident.severity}
              </span>
            )}
            {incident.location && (
              <span className="meta-item">
                <strong>Location:</strong> {incident.location}
              </span>
            )}
          </div>

          {incident.tags && incident.tags.length > 0 && (
            <div className="tags">
              {incident.tags.map((tag: any) => (
                <span key={tag.id} className="tag">{tag.name}</span>
              ))}
            </div>
          )}
        </div>

        <section className="incident-summary">
          <h2>Summary</h2>
          <p>{incident.summary}</p>
        </section>

        <section className="incident-description">
          <h2>Full Description</h2>
          <div className="description-content">
            {incident.description.split('\n').map((paragraph: string, index: number) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </section>

        {incident.persons && incident.persons.length > 0 && (
          <section className="involved-persons">
            <h2>People Involved</h2>
            <div className="persons-grid">
              {incident.persons.map(person => (
                <Link href={`/persons/${person.slug}`} key={person.id}>
                  <div className="person-card">
                    <h3>{person.name}</h3>
                    {person.profession && <p className="profession">{person.profession}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {incident.statements && incident.statements.length > 0 && (
          <section className="statements-section">
            <h2>Statements ({incident.statements.length})</h2>
            <div className="statements-timeline">
              {incident.statements.map((statement) => (
                <div key={statement.id} className="statement-item">
                  <div className="statement-header">
                    <Link href={`/persons/${statement.person.slug}`}>
                      <span className="statement-author">{statement.person.name}</span>
                    </Link>
                    <span className="statement-date">
                      {format(new Date(statement.statementDate), 'MMMM d, yyyy')}
                    </span>
                    {statement.medium && (
                      <span className="statement-medium">via {statement.medium}</span>
                    )}
                  </div>
                  
                  <blockquote className="statement-content">
                    {statement.content}
                  </blockquote>
                  
                  {statement.context && (
                    <div className="statement-context">
                      <strong>Context:</strong> {statement.context}
                    </div>
                  )}

                  {statement.responses && statement.responses.length > 0 && (
                    <div className="responses">
                      <h4>Responses:</h4>
                      {statement.responses.map((response) => (
                        <div key={response.id} className="response-item">
                          <div className="response-header">
                            {response.person && (
                              <Link href={`/persons/${response.person.slug}`}>
                                <span className="response-author">{response.person.name}</span>
                              </Link>
                            )}
                            {response.organization && (
                              <span className="response-author">{response.organization.name}</span>
                            )}
                            <span className="response-type">{response.type}</span>
                            <span className="response-date">
                              {format(new Date(response.responseDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <p className="response-content">{response.content}</p>
                          {response.impact && (
                            <p className="response-impact">
                              <strong>Impact:</strong> {response.impact}
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

        {incident.sources && incident.sources.length > 0 && (
          <section className="sources-section">
            <h2>Sources & References</h2>
            <ol className="sources-list">
              {incident.sources.map((source) => (
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

        <footer className="incident-footer">
          <div className="publication-info">
            <p>
              <strong>Published:</strong>{' '}
              {format(new Date(incident.publicationDate), 'MMMM d, yyyy')}
            </p>
            <p>
              <strong>Last Updated:</strong>{' '}
              {format(new Date(incident.updatedAt), 'MMMM d, yyyy')}
            </p>
          </div>
          
          <div className="disclaimer">
            <h3>Disclaimer</h3>
            <p>
              This incident report is compiled from publicly available information and verified sources. 
              We strive for accuracy and neutrality in our documentation. If you have corrections or 
              additional verified sources, please contact us.
            </p>
          </div>
        </footer>
      </article>

      <style jsx>{`
        .incident-page {
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

        .incident-header {
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid var(--border-primary);
        }

        .incident-header h1 {
          font-size: 2.5rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .incident-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .meta-item {
          background: var(--background-secondary);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.95rem;
        }

        .meta-item strong {
          color: var(--text-primary);
        }

        .status-documented {
          background: #d5f4e6 !important;
          color: #27ae60 !important;
        }

        .status-ongoing {
          background: #ffeaa7 !important;
          color: #f39c12 !important;
        }

        .status-resolved {
          background: #dfe6e9 !important;
          color: #2d3436 !important;
        }

        .severity-high {
          background: #fee !important;
          color: #c33 !important;
        }

        .severity-medium {
          background: #fff3cd !important;
          color: #856404 !important;
        }

        .severity-low {
          background: #d1ecf1 !important;
          color: #0c5460 !important;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag {
          background: var(--accent-primary);
          color: white;
          padding: 0.3rem 0.8rem;
          border-radius: 4px;
          font-size: 0.85rem;
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

        .incident-summary {
          background: var(--background-secondary);
          padding: 2rem;
          border-radius: 8px;
          border-left: 4px solid var(--accent-primary);
        }

        .incident-summary p {
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

        .persons-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }

        .person-card {
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

        .person-card h3 {
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .person-card .profession {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin: 0;
        }

        .statements-timeline {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .statement-item {
          background: var(--background-secondary);
          border-radius: 8px;
          padding: 1.5rem;
          border-left: 4px solid var(--text-secondary);
        }

        .statement-header {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
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

        .statement-content {
          font-size: 1.05rem;
          line-height: 1.7;
          color: var(--text-primary);
          font-style: italic;
          margin: 1rem 0;
          padding-left: 1rem;
          border-left: 3px solid var(--border-primary);
        }

        .statement-context {
          background: var(--background-primary);
          padding: 1rem;
          border-radius: 6px;
          margin-top: 1rem;
          font-size: 0.95rem;
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

        .incident-footer {
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
          .incident-header h1 {
            font-size: 2rem;
          }

          .incident-meta {
            justify-content: center;
          }

          .persons-grid {
            grid-template-columns: 1fr;
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
        }
      `}</style>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const incidents = await prisma.incident.findMany({
    select: { slug: true }
  })

  const paths = incidents.map((incident) => ({
    params: { slug: incident.slug }
  }))

  return {
    paths,
    fallback: true
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!params?.slug || typeof params.slug !== 'string') {
    return { notFound: true }
  }

  try {
    const incident = await prisma.incident.findUnique({
      where: { slug: params.slug },
      include: {
        persons: true,
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
        responses: {
          include: {
            person: true,
            organization: true,
            statement: true
          },
          orderBy: {
            responseDate: 'desc'
          }
        },
        sources: {
          orderBy: {
            publishDate: 'desc'
          }
        }
      }
    })

    if (!incident) {
      return { notFound: true }
    }

    return {
      props: {
        incident: JSON.parse(JSON.stringify(incident)) // Serialize dates
      }
    }
  } catch (error) {
    console.error('Error fetching incident:', error)
    return { notFound: true }
  }
}