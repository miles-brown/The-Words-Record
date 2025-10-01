// @ts-nocheck
import { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import Layout from '@/components/Layout'
import Breadcrumbs from '@/components/Breadcrumbs'
import { ContentSkeleton } from '@/components/LoadingSkeletons'
import { PersonWithRelations } from '@/types'
import prisma from '@/lib/prisma'

interface PersonPageProps {
  person: PersonWithRelations | null
}

export default function PersonPage({ person }: PersonPageProps) {
  const router = useRouter()

  if (router.isFallback) {
    return (
      <Layout title="Loading...">
        <ContentSkeleton />
      </Layout>
    )
  }

  if (!person) {
    return (
      <Layout title="Person Not Found">
        <div className="error-page">
          <h1>Person Not Found</h1>
          <p>The person you're looking for doesn't exist in our database.</p>
          <Link href="/persons">
            <button>Browse All People</button>
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

  return (
    <Layout 
      title={person.name} 
      description={person.bio || `Profile of ${person.name}`}
    >
      <article className="person-profile">
        <Breadcrumbs
          items={[
            { label: 'Who?', href: '/persons' },
            { label: person.name }
          ]}
        />

        <div className="profile-header">
          <div className="profile-info">
            <div className="profile-image">
              {person.imageUrl ? (
                <Image
                  src={person.imageUrl}
                  alt={person.name}
                  width={150}
                  height={150}
                  objectFit="cover"
                />
              ) : (
                <div className="image-placeholder">
                  <span>{person.name[0]}</span>
                </div>
              )}
            </div>
            
            <div className="profile-details">
              <h1>{person.name}</h1>
              <div className="meta-info">
                {person.profession && (
                  <span className="meta-item">
                    <strong>Profession:</strong> {person.profession}
                  </span>
                )}
                {person.nationality && (
                  <span className="meta-item">
                    <strong>Nationality:</strong> {person.nationality}
                  </span>
                )}
                {person.birthDate && (
                  <span className="meta-item">
                    <strong>Born:</strong> {format(new Date(person.birthDate), 'MMMM d, yyyy')}
                    {person.deathDate && ` - ${format(new Date(person.deathDate), 'MMMM d, yyyy')}`}
                  </span>
                )}
              </div>
              
              {person.bio && (
                <div className="biography">
                  <h2>Biography</h2>
                  <p>{person.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="incidents-section">
          <h2>Related Incidents ({person.incidents?.length || 0})</h2>
          
          {person.incidents && person.incidents.length > 0 ? (
            <div className="incidents-list">
              {person.incidents.map((incident) => (
                <Link href={`/incidents/${incident.slug}`} key={incident.id}>
                  <article className="incident-card">
                    <h3>{incident.title}</h3>
                    <div className="incident-meta">
                      <span className="date">
                        {format(new Date(incident.incidentDate), 'MMMM d, yyyy')}
                      </span>
                      <span className={`status status-${incident.status}`}>
                        {incident.status}
                      </span>
                      {incident.severity && (
                        <span className={`severity severity-${incident.severity}`}>
                          {incident.severity} severity
                        </span>
                      )}
                    </div>
                    <p className="summary">{incident.summary}</p>
                    <div className="incident-stats">
                      <span>{incident._count?.statements || 0} statements</span>
                      <span>{incident._count?.responses || 0} responses</span>
                      <span>{incident._count?.sources || 0} sources</span>
                    </div>
                    {incident.tags && incident.tags.length > 0 && (
                      <div className="tags">
                        {incident.tags.map(tag => (
                          <span key={tag.id} className="tag">{tag.name}</span>
                        ))}
                      </div>
                    )}
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <p className="no-incidents">No incidents documented for this person.</p>
          )}
        </section>

        {person.statements && person.statements.length > 0 && (
          <section className="statements-section">
            <h2>Statements ({person.statements.length})</h2>
            <div className="statements-list">
              {person.statements.slice(0, 5).map((statement) => (
                <div key={statement.id} className="statement-item">
                  <blockquote>{statement.content}</blockquote>
                  <div className="statement-meta">
                    <span className="date">
                      {format(new Date(statement.statementDate), 'MMMM d, yyyy')}
                    </span>
                    {statement.medium && (
                      <span className="medium">via {statement.medium}</span>
                    )}
                    {statement.incident && (
                      <Link href={`/incidents/${statement.incident.slug}`}>
                        <span className="related-incident">
                          Related to: {statement.incident.title}
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
              {person.statements.length > 5 && (
                <p className="more-link">
                  And {person.statements.length - 5} more statements...
                </p>
              )}
            </div>
          </section>
        )}
      </article>

      <style jsx>{`
        .person-profile {
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

        .profile-header {
          margin-bottom: 3rem;
        }

        .profile-info {
          display: flex;
          gap: 2rem;
          align-items: start;
        }

        .profile-image {
          flex-shrink: 0;
        }

        .profile-image img {
          border-radius: 50%;
        }

        .image-placeholder {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 3rem;
          font-weight: bold;
        }

        .profile-details {
          flex: 1;
        }

        .profile-details h1 {
          font-size: 2.5rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .meta-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .meta-item {
          color: var(--text-secondary);
        }

        .meta-item strong {
          color: var(--text-primary);
        }

        .biography {
          margin-top: 2rem;
        }

        .biography h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .biography p {
          line-height: 1.8;
          color: var(--text-secondary);
        }

        .incidents-section, .statements-section {
          margin: 3rem 0;
        }

        .incidents-section h2, .statements-section h2 {
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--border-primary);
        }

        .incidents-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .incident-card {
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 1.5rem;
          background: var(--background-primary);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .incident-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .incident-card h3 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .incident-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .incident-meta span {
          font-size: 0.9rem;
          padding: 0.2rem 0.6rem;
          background: var(--background-secondary);
          border-radius: 4px;
        }

        .status-documented {
          background: #d5f4e6 !important;
          color: #27ae60 !important;
        }

        .status-ongoing {
          background: #ffeaa7 !important;
          color: #d63031 !important;
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

        .summary {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .incident-stats {
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
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .no-incidents {
          color: var(--text-secondary);
          font-style: italic;
        }

        .statements-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .statement-item {
          background: var(--background-secondary);
          padding: 1.5rem;
          border-radius: 8px;
          border-left: 4px solid var(--accent-primary);
        }

        blockquote {
          margin: 0 0 1rem 0;
          font-style: italic;
          color: var(--text-primary);
          line-height: 1.6;
        }

        .statement-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .related-incident {
          color: var(--accent-primary);
          cursor: pointer;
        }

        .related-incident:hover {
          text-decoration: underline;
        }

        .more-link {
          text-align: center;
          color: var(--text-secondary);
          font-style: italic;
          margin-top: 1rem;
        }

        @media (max-width: 768px) {
          .profile-info {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .profile-details h1 {
            font-size: 2rem;
          }

          .incident-meta {
            justify-content: center;
          }
        }
      `}</style>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const persons = await prisma.person.findMany({
    select: { slug: true }
  })

  const paths = persons.map((person) => ({
    params: { slug: person.slug }
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
    const person = await prisma.person.findUnique({
      where: { slug: params.slug },
      include: {
        incidents: {
          include: {
            tags: true,
            _count: {
              select: {
                statements: true,
                responses: true,
                sources: true
              }
            }
          },
          orderBy: {
            incidentDate: 'desc'
          }
        },
        statements: {
          include: {
            incident: true,
            sources: true
          },
          orderBy: {
            statementDate: 'desc'
          }
        },
        responses: {
          include: {
            incident: true,
            statement: true
          },
          orderBy: {
            responseDate: 'desc'
          }
        }
      }
    })

    if (!person) {
      return { notFound: true }
    }

    return {
      props: {
        person: JSON.parse(JSON.stringify(person)) // Serialize dates
      }
    }
  } catch (error) {
    console.error('Error fetching person:', error)
    return { notFound: true }
  }
}