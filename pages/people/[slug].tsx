import { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import Layout from '@/components/Layout'
import Breadcrumbs from '@/components/Breadcrumbs'
import { ContentSkeleton } from '@/components/LoadingSkeletons'
import InArticleAd from '@/components/InArticleAd'
import { PersonWithRelations } from '@/types'
import { prisma } from '@/lib/prisma'
import { getAgeString } from '@/lib/ageUtils'
import { getReligionIcon, getProfessionIcon } from '@/utils/icons'
import { normalizeCountries, formatCountryDisplay, CountryCode } from '@/lib/countries'

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
          <Link href="/people">
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
            { label: 'People', href: '/people' },
            { label: person.name }
          ]}
        />

        <div className="profile-layout">
          <aside className="profile-infobox">
            <div className="infobox-image">
              {person.imageUrl ? (
                <Image
                  src={person.imageUrl}
                  alt={person.name}
                  width={250}
                  height={250}
                  objectFit="cover"
                />
              ) : (
                <div className="image-placeholder">
                  <span>{person.name[0]}</span>
                </div>
              )}
            </div>

            <div className="infobox-content">
              <h2 className="infobox-title">{person.name}</h2>

              <div className="infobox-section">
                <h3>Quick Facts</h3>

                {person.bestKnownFor && (
                  <div className="info-row">
                    <span className="info-label">Best Known For:</span>
                    <span className="info-value">{person.bestKnownFor}</span>
                  </div>
                )}

                {person.akaNames && (
                  <div className="info-row">
                    <span className="info-label">Also Known As:</span>
                    <span className="info-value">{person.akaNames}</span>
                  </div>
                )}

                {person.birthDate && (
                  <div className="info-row">
                    <span className="info-label">Born:</span>
                    <span className="info-value">
                      {format(new Date(person.birthDate), 'MMMM d, yyyy')}
                      {person.birthPlace && ` in ${person.birthPlace}`}
                      {!person.deathDate && getAgeString(person.birthDate, null) && ` ${getAgeString(person.birthDate, null)}`}
                    </span>
                  </div>
                )}

                {person.deathDate && (
                  <div className="info-row">
                    <span className="info-label">Died:</span>
                    <span className="info-value">
                      {format(new Date(person.deathDate), 'MMMM d, yyyy')}
                      {person.deathPlace && ` in ${person.deathPlace}`}
                      {person.birthDate && getAgeString(person.birthDate, person.deathDate) && ` ${getAgeString(person.birthDate, person.deathDate)}`}
                    </span>
                  </div>
                )}

                {person.residence && (
                  <div className="info-row">
                    <span className="info-label">Residence:</span>
                    <span className="info-value">{person.residence}</span>
                  </div>
                )}

                {/* Nationality */}
                {person.nationalities && person.nationalities.length > 0 && (() => {
                  const codes = person.nationalities.map(n => n.countryCode as CountryCode);
                  return (
                    <div className="info-row">
                      <span className="info-label">Nationality:</span>
                      <span className="info-value">
                        {formatCountryDisplay(codes, { includeFlags: true, separator: ', ', maxDisplay: 5 })}
                      </span>
                    </div>
                  );
                })()}

                {person.racialGroup && (
                  <div className="info-row">
                    <span className="info-label">Ethnicity:</span>
                    <span className="info-value">{person.racialGroup}</span>
                  </div>
                )}

                {person.religion && (
                  <div className="info-row">
                    <span className="info-label">Religion:</span>
                    <span className="info-value">
                      <span className="icon">{getReligionIcon(person.religion)}</span>
                      {person.religion}
                    </span>
                  </div>
                )}

                {person.profession && (
                  <div className="info-row">
                    <span className="info-label">Profession:</span>
                    <span className="info-value">
                      <span className="icon">{getProfessionIcon(person.profession)}</span>
                      {person.profession}
                    </span>
                  </div>
                )}

                {person.roleDescription && (
                  <div className="info-row">
                    <span className="info-label">Role:</span>
                    <span className="info-value">{person.roleDescription}</span>
                  </div>
                )}

                {person.yearsActive && (
                  <div className="info-row">
                    <span className="info-label">Years Active:</span>
                    <span className="info-value">{person.yearsActive}</span>
                  </div>
                )}

                {person.politicalParty && (
                  <div className="info-row">
                    <span className="info-label">Political Party:</span>
                    <span className="info-value">{person.politicalParty}</span>
                  </div>
                )}

                {person.politicalBeliefs && (
                  <div className="info-row">
                    <span className="info-label">Political Beliefs:</span>
                    <span className="info-value">{person.politicalBeliefs}</span>
                  </div>
                )}
              </div>

              {/* TODO: Re-enable affiliations when field is added back to schema */}
              {(person as any).affiliations && (person as any).affiliations.length > 0 && (
                <div className="infobox-section">
                  <h3>Affiliations</h3>
                  <div className="affiliations-list">
                    {(person as any).affiliations.map((affiliation: any) => (
                      <div key={affiliation.id} className="affiliation-item">
                        <div className="affiliation-role">{affiliation.role}</div>
                        <Link href={`/organizations/${affiliation.organization.slug}`}>
                          <div className="affiliation-org">{affiliation.organization.name}</div>
                        </Link>
                        {(affiliation.startDate || affiliation.endDate) && (
                          <div className="affiliation-dates">
                            {affiliation.startDate && format(new Date(affiliation.startDate), 'yyyy')}
                            {affiliation.startDate && affiliation.endDate && ' - '}
                            {affiliation.endDate ? format(new Date(affiliation.endDate), 'yyyy') : affiliation.isActive && 'present'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          <div className="profile-main">
            <h1>{person.name}</h1>

            {person.background && (
              <section className="background-section">
                <h2>Background</h2>
                <p>{person.background}</p>
              </section>
            )}

            {person.bio && (
              <section className="biography-section">
                <h2>Biography</h2>
                <p>{person.bio}</p>
              </section>
            )}
          </div>
        </div>

        {/* Ad Position 1: ~2/5 down the page */}
        <InArticleAd />

        <section className="cases-section">
          <h2>Related Cases ({person.cases?.length || 0})</h2>
          
          {person.cases && person.cases.length > 0 ? (
            <div className="cases-list">
              {person.cases.map((caseItem) => (
                <Link href={`/cases/${caseItem.slug}`} key={caseItem.id}>
                  <article className="case-card">
                    <h3>{caseItem.title}</h3>
                    <div className="case-meta">
                      <span className="date">
                        {format(new Date(caseItem.caseDate), 'MMMM d, yyyy')}
                      </span>
                      <span className={`status status-${caseItem.status}`}>
                        {caseItem.status}
                      </span>
                    </div>
                    <p className="summary">{caseItem.summary}</p>
                    <div className="case-stats">
                      <span>{caseItem._count?.statements || 0} statements</span>
                      <span>{caseItem._count?.sources || 0} sources</span>
                    </div>
                    {caseItem.tags && caseItem.tags.length > 0 && (
                      <div className="tags">
                        {caseItem.tags.map(tag => (
                          <span key={tag.id} className="tag">{tag.name}</span>
                        ))}
                      </div>
                    )}
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <p className="no-cases">No cases documented for this person.</p>
          )}
        </section>

        {/* Ad Position 2: ~2/3 down the page */}
        <InArticleAd />

        {person.statements && person.statements.length > 0 && (
          <section className="statements-section">
            <h2>Statements ({person.statements.length})</h2>
            <div className="statements-list">
              {person.statements.slice(0, 5).map((statement) => (
                <div key={statement.id} className="statement-item stagger-item">
                  <div className="block-quote">
                    <span className="quote-mark">&ldquo;</span>
                    <div className="quote-content">{statement.content}</div>
                  </div>
                  <div className="statement-citation">
                    <span className="citation-date">
                      {format(new Date(statement.statementDate), 'MMMM d, yyyy')}
                    </span>
                    {statement.medium && (
                      <span className="citation-medium">via {statement.medium}</span>
                    )}
                    {statement.case && (
                      <Link href={`/cases/${statement.case.slug}`}>
                        <span className="citation-case">
                          Related to: {statement.case.title}
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
          max-width: 1200px;
          margin: 0 auto;
        }

        .profile-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .profile-infobox {
          grid-column: 2;
          grid-row: 1;
          background: var(--background-primary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          overflow: hidden;
          align-self: start;
          position: sticky;
          top: 80px;
        }

        .infobox-image {
          width: 100%;
          padding: 1.5rem;
          display: flex;
          justify-content: center;
          align-items: center;
          background: var(--background-secondary);
        }

        .infobox-image img {
          width: 220px;
          height: 220px;
          object-fit: cover;
          border-radius: 50%;
          border: 3px solid var(--border-primary);
        }

        .image-placeholder {
          width: 220px;
          height: 220px;
          background: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 4rem;
          font-weight: bold;
          border-radius: 50%;
          border: 3px solid var(--border-primary);
        }

        .infobox-content {
          padding: 1.5rem;
        }

        .infobox-title {
          font-size: 1.3rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--border-primary);
        }

        .infobox-section {
          margin-bottom: 1.5rem;
        }

        .infobox-section h3 {
          font-size: 1rem;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-primary);
          padding-bottom: 0.25rem;
        }

        .info-row {
          display: flex;
          flex-direction: column;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border-primary);
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .info-value {
          font-size: 0.9rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .info-value .icon {
          font-size: 1.2rem;
          line-height: 1;
        }

        .affiliations-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .affiliation-item {
          padding: 0.5rem;
          background: var(--background-secondary);
          border-radius: 4px;
        }

        .affiliation-role {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .affiliation-org {
          font-size: 0.9rem;
          color: var(--accent-primary);
          cursor: pointer;
          margin-bottom: 0.25rem;
        }

        .affiliation-org:hover {
          text-decoration: underline;
        }

        .affiliation-dates {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .profile-main {
          grid-column: 1;
          grid-row: 1;
        }

        .profile-main h1 {
          font-size: 2.5rem;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .background-section,
        .biography-section {
          margin-bottom: 2rem;
        }

        .background-section h2,
        .biography-section h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .background-section p,
        .biography-section p {
          line-height: 1.8;
          color: var(--text-secondary);
        }

        .cases-section, .statements-section {
          margin: 3rem 0;
        }

        .cases-section h2, .statements-section h2 {
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--border-primary);
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

        .case-card h3 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .case-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .case-meta span {
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

        .summary {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
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
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .no-cases {
          color: var(--text-secondary);
          font-style: italic;
        }

        .statements-list {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .statement-item {
          margin: 1.5rem 0;
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

        .quote-content p {
          margin-bottom: 1rem;
        }

        .quote-content p:first-line {
          text-indent: 0;
        }

        .quote-content p + p {
          text-indent: 2rem;
        }

        .statement-citation {
          margin-left: 3rem;
          padding-left: 1rem;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
          border-top: 1px solid var(--border-primary);
          padding-top: 0.75rem;
        }

        .citation-date {
          font-weight: 500;
        }

        .citation-case {
          color: var(--accent-primary);
          cursor: pointer;
        }

        .citation-case:hover {
          text-decoration: underline;
        }

        .more-link {
          text-align: center;
          color: var(--text-secondary);
          font-style: italic;
          margin-top: 1rem;
        }

        @media (max-width: 968px) {
          .profile-layout {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .profile-infobox {
            grid-column: 1;
            grid-row: 2;
            position: static;
          }

          .profile-main {
            grid-column: 1;
            grid-row: 1;
          }

          .profile-main h1 {
            font-size: 2rem;
          }

          .case-meta {
            justify-content: flex-start;
          }
        }

        @media (max-width: 768px) {
          .profile-main h1 {
            font-size: 1.8rem;
          }

          .infobox-image {
            padding: 1rem;
          }

          .infobox-image img {
            width: 180px;
            height: 180px;
          }

          .image-placeholder {
            width: 180px;
            height: 180px;
            font-size: 3rem;
          }

          .block-quote {
            margin: 1rem 0 1.5rem 2rem;
            padding-left: 0.5rem;
          }

          .quote-mark {
            left: -1.8rem;
            font-size: 3.5rem;
          }

          .statement-citation {
            margin-left: 2rem;
            padding-left: 0.5rem;
          }
        }
      `}</style>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Only pre-generate top 5 most important people at build time
  // Remaining pages will be generated on-demand with fallback: 'blocking'
  // This significantly reduces build time while maintaining good UX
  const people = await prisma.person.findMany({
    where: {
      isActive: true
    },
    select: { slug: true, _count: { select: { statements: true } } },
    orderBy: [
      { statements: { _count: 'desc' } }, // Most statements first
      { createdAt: 'desc' }
    ],
    take: 5
  })

  const paths = people.map((person) => ({
    params: { slug: person.slug }
  }))

  return {
    paths,
    fallback: 'blocking' // Generate remaining pages on-demand
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
        nationalities: {
          include: {
            country: true
          }
        },
        cases: {
          include: {
            tags: true,
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
            sources: true,
            respondsTo: true,
            responses: true
          },
          orderBy: {
            statementDate: 'desc'
          }
        },
        affiliations: {
          include: {
            organization: true
          },
          orderBy: {
            isActive: 'desc'
          }
        }
      }
    })

    if (!person) {
      return { notFound: true }
    }

    // Add response count to cases and separate responses from statements
    const responses = person.statements?.filter(s => s.statementType === 'RESPONSE') || []
    const personWithResponseCounts = {
      ...person,
      responses,
      cases: person.cases.map((caseItem: any) => {
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
        person: JSON.parse(JSON.stringify(personWithResponseCounts)) // Serialize dates
      },
      revalidate: 60 // Revalidate every 60 seconds
    }
  } catch (error) {
    console.error('Error fetching person:', error)
    return { notFound: true }
  }
}

