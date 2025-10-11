// @ts-nocheck
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { format } from 'date-fns'
import Layout from '@/components/Layout'
import { ContentSkeleton } from '@/components/LoadingSkeletons'
import { prisma } from '@/lib/prisma'

interface OrganizationPageProps {
  organization: any | null
}

export default function OrganizationPage({ organization }: OrganizationPageProps) {
  const router = useRouter()

  if (router.isFallback) {
    return (
      <Layout title="Loading...">
        <ContentSkeleton />
      </Layout>
    )
  }

  if (!organization) {
    return (
      <Layout title="Organization Not Found">
        <div className="error-page">
          <h1>Organization Not Found</h1>
          <p>The organization you're looking for doesn't exist in our database.</p>
          <Link href="/organizations">
            <button>Browse All Organizations</button>
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'media': return 'type-media'
      case 'advocacy': return 'type-advocacy'
      case 'corporate': return 'type-corporate'
      case 'government': return 'type-government'
      case 'nonprofit': return 'type-nonprofit'
      default: return 'type-other'
    }
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": organization.name,
    "description": organization.description,
    "url": organization.website,
    "foundingDate": organization.founded,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": organization.headquarters
    }
  }

  return (
    <Layout 
      title={organization.name} 
      description={organization.description || `Profile of ${organization.name}`}
    >
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <article className="organization-page">
        <div className="org-header">
          <Link href="/organizations" className="back-link">
            ← Back to Organizations
          </Link>
          
          <div className="org-title-section">
            <h1>{organization.name}</h1>
            <span className={`org-type ${getTypeColor(organization.type)}`}>
              {organization.type}
            </span>
          </div>
          
          <div className="org-meta">
            {organization.website && (
              <div className="meta-item">
                <strong>Website:</strong>{' '}
                <a href={organization.website} target="_blank" rel="noopener noreferrer">
                  {organization.website}
                </a>
              </div>
            )}
            {organization.headquarters && (
              <div className="meta-item">
                <strong>Headquarters:</strong> {organization.headquarters}
              </div>
            )}
            {organization.founded && !isNaN(new Date(organization.founded).getTime()) && (
              <div className="meta-item">
                <strong>Founded:</strong> {format(new Date(organization.founded), 'MMMM yyyy')}
              </div>
            )}
          </div>
          
          {organization.description && (
            <div className="org-description">
              <h2>About</h2>
              <p>{organization.description}</p>
            </div>
          )}
        </div>

        {organization.cases && organization.cases.length > 0 && (
          <section className="cases-section">
            <h2>Related Cases ({organization.cases.length})</h2>
            
            <div className="cases-list">
              {organization.cases.map((caseItem: any) => (
                <Link href={`/cases/${caseItem.slug}`} key={caseItem.id}>
                  <article className="case-card">
                    <div className="case-header">
                      <h3>{caseItem.title}</h3>
                      <span className="case-date">
                        {format(new Date(caseItem.caseDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                    
                    <p className="case-summary">{caseItem.summary}</p>
                    
                    {caseItem.people && caseItem.people.length > 0 && (
                      <div className="case-people">
                        <strong>Involved:</strong> {caseItem.people.map((p: any) => p.name).join(', ')}
                      </div>
                    )}
                    
                    <div className="case-stats">
                      <span>{caseItem._count?.statements || 0} statements</span>
                      <span>{caseItem._count?.responses || 0} responses</span>
                      <span>{caseItem._count?.sources || 0} sources</span>
                    </div>
                    
                    {caseItem.tags && caseItem.tags.length > 0 && (
                      <div className="tags">
                        {caseItem.tags.map((tag: any) => (
                          <span key={tag.id} className="tag">{tag.name}</span>
                        ))}
                      </div>
                    )}
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        {organization.responses && organization.responses.length > 0 && (
          <section className="responses-section">
            <h2>Official Responses ({organization.responses.length})</h2>
            
            <div className="responses-list">
              {organization.responses.map((response: any) => (
                <div key={response.id} className="response-item">
                  <div className="response-header">
                    <span className="response-type">{response.responseType}</span>
                    <span className="response-date">
                      {format(new Date(response.statementDate), 'MMMM d, yyyy')}
                    </span>
                    {response.caseItem && (
                      <Link href={`/cases/${response.caseItem.slug}`}>
                        <span className="response-case">
                          Re: {response.caseItem.title}
                        </span>
                      </Link>
                    )}
                  </div>
                  
                  <div className="response-content">
                    <p>{response.content}</p>
                  </div>
                  
                  {response.impact && (
                    <div className="response-impact">
                      <strong>Impact:</strong> {response.impact}
                    </div>
                  )}
                  
                  {response.statement && response.statement.people && (
                    <div className="response-context">
                      <span>In response to statement by{' '}</span>
                      <Link href={`/people/${response.statement.people.slug}`}>
                        <span className="person-link">{response.statement.people.name}</span>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="org-footer">
          <div className="timestamps">
            <p>
              <strong>Profile Created:</strong>{' '}
              {format(new Date(organization.createdAt), 'MMMM d, yyyy')}
            </p>
            <p>
              <strong>Last Updated:</strong>{' '}
              {format(new Date(organization.updatedAt), 'MMMM d, yyyy')}
            </p>
          </div>
        </footer>
      </article>

      <style jsx>{`
        .organization-page {
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

        .org-header {
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid var(--border-primary);
        }

        .org-title-section {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .org-title-section h1 {
          font-size: 2.5rem;
          color: var(--text-primary);
          margin: 0;
        }

        .org-type {
          font-size: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 500;
          white-space: nowrap;
        }

        .type-media {
          background: #e3f2fd;
          color: #1976d2;
        }

        .type-advocacy {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .type-corporate {
          background: #e8f5e9;
          color: #388e3c;
        }

        .type-government {
          background: #fff3e0;
          color: #f57c00;
        }

        .type-nonprofit {
          background: #fce4ec;
          color: #c2185b;
        }

        .type-other {
          background: var(--background-secondary);
          color: var(--text-secondary);
        }

        .org-meta {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .meta-item {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .meta-item strong {
          color: var(--text-primary);
        }

        .meta-item a {
          color: var(--accent-primary);
          text-decoration: none;
        }

        .meta-item a:hover {
          text-decoration: underline;
        }

        .org-description {
          margin-top: 2rem;
        }

        .org-description h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .org-description p {
          line-height: 1.8;
          color: var(--text-secondary);
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

        .cases-section {
          margin: 3rem 0;
        }
        .cases-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .case-card {
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 1.5rem;
          background: var(--background-primary);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .case-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .case-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .case-header h3 {
          color: var(--text-primary);
          margin: 0;
          flex: 1;
        }
        .case-date {
          color: var(--text-secondary);
          font-size: 0.9rem;
          white-space: nowrap;
        }
        .case-summary {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        .case-people {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }
        .case-people strong {
          color: var(--text-primary);
        }
        .case-stats {
          display: flex;
          gap: 1.5rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
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
          font-size: 0.8rem;
        }

        .responses-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .response-item {
          background: var(--background-secondary);
          border-radius: 8px;
          padding: 1.5rem;
          border-left: 4px solid var(--accent-primary);
        }

        .response-header {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
          align-items: center;
        }

        .response-type {
          background: var(--text-secondary);
          color: white;
          padding: 0.3rem 0.8rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .response-date {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .response-case {
          color: var(--accent-primary);
          font-size: 0.9rem;
          cursor: pointer;
        }
        .response-case:hover {
          text-decoration: underline;
        }

        .response-content {
          margin-bottom: 1rem;
        }

        .response-content p {
          line-height: 1.7;
          color: var(--text-primary);
          margin: 0;
        }

        .response-impact {
          background: var(--background-primary);
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        .response-impact strong {
          color: var(--text-primary);
        }

        .response-context {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .person-link {
          color: var(--accent-primary);
          cursor: pointer;
        }
        .person-link:hover {
          text-decoration: underline;
        }

        .org-footer {
          margin-top: 4rem;
          padding-top: 2rem;
          border-top: 2px solid var(--border-primary);
        }

        .timestamps {
          display: flex;
          gap: 2rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .timestamps strong {
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .org-title-section {
            flex-direction: column;
            align-items: flex-start;
          }

          .org-title-section h1 {
            font-size: 2rem;
          }

          .org-meta {
            gap: 0.5rem;
          }

          .case-header {
            flex-direction: column;
          }

          .response-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .timestamps {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  if (!params?.slug || typeof params.slug !== 'string') {
    return { notFound: true }
  }

  try {
    const organization = await prisma.organization.findUnique({
      where: { slug: params.slug },
      include: {
        cases: {
          include: {
            tags: true,
            people: true,
            _count: {
              select: {
                statements: true,
                sources: true
              }
            },
            statements: {
              where: { statementType: 'RESPONSE' },
              select: { id: true }
            }
          },
          orderBy: {
            caseDate: 'desc'
          }
        },
        statements: {
          include: {
            case: true,
            people: true,
            sources: true,
            respondsTo: true,
            responses: true
          },
          orderBy: {
            statementDate: 'desc'
          }
        }
      }
    })

    if (!organization) {
      return { notFound: true }
    }

    // Add response count to cases and separate responses from statements
    // Note: The "people" field now replaces the previous "persons" field in included data.
    const responses = organization.statements?.filter(s => s.statementType === 'RESPONSE') || []
    const organizationWithResponseCounts = {
      ...organization,
      responses,
      cases: organization.cases.map(caseItem => {
        const responseCount = caseItem.statements?.length || 0
        const { statements, ...caseWithoutStatements } = caseItem
        return {
          ...caseWithoutStatements,
          _count: {
            ...caseItem._count,
            responses: responseCount
          }
        }
      })
    }

    return {
      props: {
        organization: JSON.parse(JSON.stringify(organizationWithResponseCounts)) // Serialize dates
      }
    }
  } catch (error) {
    console.error('Error fetching organization:', error)
    return { notFound: true }
  }
}