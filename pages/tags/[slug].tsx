// @ts-nocheck
import { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { format } from 'date-fns'
import Layout from '@/components/Layout'
import Breadcrumbs from '@/components/Breadcrumbs'
import { ContentSkeleton } from '@/components/LoadingSkeletons'
import prisma from '@/lib/prisma'

interface TagPageProps {
  tag: any | null
}

export default function TagPage({ tag }: TagPageProps) {
  const router = useRouter()

  if (router.isFallback) {
    return (
      <Layout title="Loading...">
        <ContentSkeleton />
      </Layout>
    )
  }

  if (!tag) {
    return (
      <Layout title="Tag Not Found">
        <div className="error-page">
          <h1>Tag Not Found</h1>
          <p>The tag you're looking for doesn't exist.</p>
          <Link href="/tags">
            <button>Browse All Tags</button>
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      title={tag.name}
      description={tag.description || `Incidents tagged with ${tag.name}`}
    >
      <div className="tag-page">
        <Breadcrumbs
          items={[
            { label: 'Tags', href: '/tags' },
            { label: tag.name }
          ]}
        />

        <div className="page-header">
          <h1>{tag.name}</h1>
          {tag.description && (
            <p className="tag-description">{tag.description}</p>
          )}
          <p className="incident-count">
            {tag.incidents.length} incident{tag.incidents.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="incidents-list">
          {tag.incidents.map((incident) => (
            <Link href={`/incidents/${incident.slug}`} key={incident.id}>
              <article className="incident-card">
                <div className="incident-header">
                  <h2>{incident.title}</h2>
                  <span className="date">
                    {format(new Date(incident.incidentDate), 'MMMM d, yyyy')}
                  </span>
                </div>

                <p className="incident-excerpt">{incident.summary}</p>

                {incident.persons && incident.persons.length > 0 && (
                  <div className="involved-persons">
                    <strong>Involved:</strong> {incident.persons.map(p => p.name).join(', ')}
                  </div>
                )}

                <div className="incident-footer">
                  <div className="incident-stats">
                    <span>
                      {incident._count?.statements || 0} statement{incident._count?.statements !== 1 ? 's' : ''}
                    </span>
                    <span>•</span>
                    <span>
                      {incident._count?.responses || 0} response{incident._count?.responses !== 1 ? 's' : ''}
                    </span>
                    <span>•</span>
                    <span>
                      {incident._count?.sources || 0} source{incident._count?.sources !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .tag-page {
          max-width: 900px;
          margin: 0 auto;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .page-header h1 {
          font-size: 2.5rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .tag-description {
          font-size: 1.1rem;
          color: var(--text-secondary);
          line-height: 1.8;
          max-width: 700px;
          margin: 0 auto 1rem;
        }

        .incident-count {
          font-size: 0.95rem;
          color: var(--accent-primary);
          font-weight: 500;
        }

        .incidents-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .incident-card {
          border: 1px solid var(--border-primary);
          border-radius: 6px;
          padding: 1.75rem;
          background: var(--background-primary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .incident-card:hover {
          border-color: var(--border-secondary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .incident-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 1rem;
        }

        .incident-header h2 {
          font-size: 1.4rem;
          color: var(--text-primary);
          line-height: 1.4;
          flex: 1;
        }

        .date {
          font-size: 0.85rem;
          color: var(--text-secondary);
          white-space: nowrap;
          padding-top: 0.25rem;
        }

        .incident-excerpt {
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 1.25rem;
          font-size: 0.98rem;
        }

        .involved-persons {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .involved-persons strong {
          color: var(--text-primary);
          font-weight: 600;
        }

        .incident-footer {
          padding-top: 1rem;
          border-top: 1px solid var(--border-primary);
        }

        .incident-stats {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .error-page {
          text-align: center;
          padding: 4rem 0;
        }

        .error-page h1 {
          color: var(--text-primary);
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
          font-weight: 500;
        }

        button:hover {
          background: #2c3e50;
        }

        @media (max-width: 768px) {
          .page-header h1 {
            font-size: 2rem;
          }

          .incident-header {
            flex-direction: column;
            gap: 0.5rem;
          }

          .date {
            align-self: flex-start;
          }
        }
      `}</style>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const tags = await prisma.tag.findMany({
    select: { slug: true },
  })

  const paths = tags.map((tag) => ({
    params: { slug: tag.slug },
  }))

  return {
    paths,
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string

  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      incidents: {
        include: {
          persons: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              statements: true,
              sources: true,
            },
          },
          statements: {
            where: { statementType: 'RESPONSE' },
            select: { id: true }
          }
        },
        orderBy: {
          incidentDate: 'desc',
        },
      },
    },
  })

  if (!tag) {
    return {
      props: { tag: null },
      revalidate: 60,
    }
  }

  // Add response count to _count object for each incident
  const tagWithResponseCounts = {
    ...tag,
    incidents: tag.incidents.map(incident => {
      const responseCount = incident.statements?.length || 0
      const { statements, ...incidentWithoutStatements } = incident
      return {
        ...incidentWithoutStatements,
        _count: {
          ...incident._count,
          responses: responseCount
        }
      }
    })
  }

  return {
    props: {
      tag: JSON.parse(JSON.stringify(tagWithResponseCounts)),
    },
    revalidate: 60,
  }
}

// Enable AMP for tag pages
export const config = {
  amp: 'hybrid'
}
