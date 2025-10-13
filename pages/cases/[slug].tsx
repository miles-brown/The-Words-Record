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
          <p>The case you're looking for doesn't exist or hasn't been promoted to case status yet.</p>
          <Link href="/cases">
            <button type="button">Browse All Cases</button>
          </Link>
          <Link href="/statements">
            <button type="button" className="secondary-btn">View Statements</button>
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
            margin: 0.5rem;
            cursor: pointer;
          }

          .secondary-btn {
            background: var(--text-secondary);
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
            { label: 'Cases', href: '/cases' },
            { label: caseItem.title }
          ]}
        />

        <div className="case-header">
          <div className="case-badge">Multi-Statement Case</div>
          <h1>{caseItem.title}</h1>

          <div className="case-meta">
            <span className="meta-item">
              <time dateTime={caseItem.caseDate}>
                {format(new Date(caseItem.caseDate), 'MMMM d, yyyy')}
              </time>
            </span>
            {caseItem.location && (
              <span className="meta-item">
                📍 {caseItem.location}
              </span>
            )}
            {caseItem.status && (
              <span className={`status-badge status-${caseItem.status.toLowerCase()}`}>
                {caseItem.status}
              </span>
            )}
            {caseItem.severity && (
              <span className={`severity-badge severity-${caseItem.severity.toLowerCase()}`}>
                {caseItem.severity}
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

        {/* Case Metrics Overview */}
        <section className="case-metrics-overview">
          <div className="metric-card">
            <div className="metric-value">{caseItem._count?.statements || 0}</div>
            <div className="metric-label">Statements</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{caseItem._count?.people || 0}</div>
            <div className="metric-label">People</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{caseItem._count?.organizations || 0}</div>
            <div className="metric-label">Organizations</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{caseItem._count?.sources || 0}</div>
            <div className="metric-label">Sources</div>
          </div>
        </section>

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

        {caseItem.people && caseItem.people.length > 0 && (
          <section className="involved-people">
            <h2>People Involved ({caseItem.people.length})</h2>
            <div className="people-grid">
              {caseItem.people.filter((person: any): person is NonNullable<typeof person> => person !== null).map((person: any) => {
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

        {caseItem.organizations && caseItem.organizations.length > 0 && (
          <section className="involved-organizations">
            <h2>Organizations Involved ({caseItem.organizations.length})</h2>
            <div className="organizations-grid">
              {caseItem.organizations.map((org: any) => (
                <Link href={`/organizations/${org.slug}`} key={org.id}>
                  <div className="org-card">
                    <h3>{org.name}</h3>
                    {org.orgType && <p className="org-type">{org.orgType.replace(/_/g, ' ')}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {caseItem.statements && caseItem.statements.length > 0 && (
          <section className="statements-section">
            <h2>Statement Timeline ({caseItem.statements.length})</h2>
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
                      <h4>Responses ({statement.responses.length}):</h4>
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

        {/* Repercussions Section - Only show if repercussions exist */}
        {caseItem.repercussions && caseItem.repercussions.length > 0 && (
          <section className="repercussions-section">
            <div className="repercussions-header">
              <h2>⚠️ Repercussions & Consequences</h2>
              <p className="repercussions-intro">
                Real-world impacts and consequences resulting from the statements in this case.
              </p>
            </div>

            <div className="repercussions-list">
              {caseItem.repercussions.map((repercussion: any) => (
                <div key={repercussion.id} className="repercussion-item">
                  <div className="repercussion-header-row">
                    <div className="repercussion-type-badge">
                      {repercussion.type.replace(/_/g, ' ')}
                    </div>
                    {repercussion.isVerified && (
                      <div className="verified-badge">✓ Verified</div>
                    )}
                    {repercussion.isOngoing && (
                      <div className="ongoing-badge">Ongoing</div>
                    )}
                  </div>

                  {/* Affected Party */}
                  {(repercussion.affectedPerson || repercussion.affectedOrganization) && (
                    <div className="affected-party">
                      <strong>Affected:</strong>{' '}
                      {repercussion.affectedPerson && (
                        <Link href={`/people/${repercussion.affectedPerson.slug}`}>
                          <span className="affected-link">
                            {repercussion.affectedPerson.name}
                            {repercussion.affectedPerson.profession && (
                              <span className="affected-profession">
                                {' '}({repercussion.affectedPerson.profession})
                              </span>
                            )}
                          </span>
                        </Link>
                      )}
                      {repercussion.affectedOrganization && (
                        <Link href={`/organizations/${repercussion.affectedOrganization.slug}`}>
                          <span className="affected-link">
                            {repercussion.affectedOrganization.name}
                          </span>
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Severity Score */}
                  <div className="severity-display">
                    <div className="severity-label">Severity:</div>
                    <div className="severity-bar">
                      <div
                        className="severity-fill"
                        style={{ width: `${repercussion.severityScore * 10}%` }}
                      />
                    </div>
                    <div className="severity-score">{repercussion.severityScore}/10</div>
                  </div>

                  {/* Timeline */}
                  <div className="repercussion-timeline">
                    <div className="timeline-item">
                      <strong>Started:</strong>{' '}
                      {format(new Date(repercussion.startDate), 'MMMM d, yyyy')}
                    </div>
                    {repercussion.endDate && (
                      <div className="timeline-item">
                        <strong>Ended:</strong>{' '}
                        {format(new Date(repercussion.endDate), 'MMMM d, yyyy')}
                      </div>
                    )}
                    {repercussion.duration && (
                      <div className="timeline-item">
                        <strong>Duration:</strong> {repercussion.duration} days
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="repercussion-description">
                    <p>{repercussion.description}</p>
                  </div>

                  {/* Impact Description */}
                  {repercussion.impactDescription && (
                    <div className="impact-description">
                      <strong>Impact:</strong> {repercussion.impactDescription}
                    </div>
                  )}

                  {/* Outcome */}
                  {repercussion.outcome && (
                    <div className="repercussion-outcome">
                      <strong>Outcome:</strong> {repercussion.outcome}
                      {repercussion.wasSuccessful !== null && (
                        <span className={`outcome-status ${repercussion.wasSuccessful ? 'successful' : 'unsuccessful'}`}>
                          {repercussion.wasSuccessful ? ' (Successful)' : ' (Unsuccessful)'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Media Coverage */}
                  {repercussion.mediaOutlets && repercussion.mediaOutlets.length > 0 && (
                    <div className="media-coverage">
                      <strong>Media Coverage:</strong>{' '}
                      <span className="outlet-count">{repercussion.mediaOutlets.length} outlets</span>
                      {repercussion.coverageIntensity && (
                        <span className="coverage-intensity"> ({repercussion.coverageIntensity})</span>
                      )}
                    </div>
                  )}

                  {/* Response Statement Link */}
                  {repercussion.responseStatement && (
                    <div className="response-link">
                      <strong>Related Response:</strong>{' '}
                      "{repercussion.responseStatement.content.substring(0, 100)}..."
                      <br />
                      <em>
                        by {repercussion.responseStatement.person?.name || 'Unknown'} on{' '}
                        {format(new Date(repercussion.responseStatement.statementDate), 'MMM d, yyyy')}
                      </em>
                    </div>
                  )}

                  {/* Tactical Coordination Flag */}
                  {repercussion.isTactical && (
                    <div className="tactical-badge">
                      <strong>⚡ Coordinated Action</strong>
                      {repercussion.coordinationEvidence && (
                        <p className="coordination-evidence">{repercussion.coordinationEvidence}</p>
                      )}
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
                    {related.status && (
                      <span className={`related-status status-${related.status.toLowerCase()}`}>
                        {related.status}
                      </span>
                    )}
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
              This case is compiled from multiple verified statements and publicly available information.
              We strive for accuracy, neutrality, and comprehensive coverage. If you have corrections,
              additional verified sources, or relevant statements, please contact us.
            </p>
          </div>
        </footer>
      </article>

      <style jsx>{`
        .case-page {
          max-width: 900px;
          margin: 0 auto;
        }

        .case-badge {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 1rem;
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
          align-items: center;
        }

        .meta-item {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .status-badge,
        .severity-badge {
          padding: 0.35rem 0.85rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-documented {
          background: #e0f2fe;
          color: #0369a1;
        }

        .status-ongoing {
          background: #fef3c7;
          color: #d97706;
        }

        .status-resolved {
          background: #dcfce7;
          color: #15803d;
        }

        .status-disputed {
          background: #fee2e2;
          color: #dc2626;
        }

        .severity-low {
          background: #f0fdf4;
          color: #15803d;
        }

        .severity-moderate {
          background: #fef3c7;
          color: #d97706;
        }

        .severity-high {
          background: #fee2e2;
          color: #dc2626;
        }

        .severity-critical {
          background: #1e1b4b;
          color: white;
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

        .case-metrics-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
          margin: 2rem 0 3rem;
        }

        .metric-card {
          background: var(--background-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 1.5rem;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .metric-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--accent-primary);
          margin-bottom: 0.5rem;
        }

        .metric-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
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

        .organizations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .org-card {
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 1.25rem;
          background: var(--background-primary);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .org-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .org-card h3 {
          color: var(--text-primary);
          font-size: 1.05rem;
          margin-bottom: 0.5rem;
        }

        .org-type {
          color: var(--text-secondary);
          font-size: 0.85rem;
          text-transform: capitalize;
          margin: 0;
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

        /* Repercussions Section Styles */
        .repercussions-section {
          background: linear-gradient(135deg, #fff3cd 0%, #ffe5a7 100%);
          border: 2px solid #f39c12;
          border-radius: 12px;
          padding: 2.5rem;
          margin: 3rem 0;
          box-shadow: 0 4px 16px rgba(243, 156, 18, 0.15);
        }

        .repercussions-header h2 {
          color: #856404;
          font-size: 2rem;
          margin-bottom: 0.75rem;
          border-bottom: none;
          padding-bottom: 0;
        }

        .repercussions-intro {
          color: #856404;
          font-size: 1.05rem;
          line-height: 1.7;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .repercussions-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .repercussion-item {
          background: white;
          border: 1px solid rgba(243, 156, 18, 0.3);
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .repercussion-header-row {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--border-primary);
        }

        .repercussion-type-badge {
          background: #f39c12;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.95rem;
          text-transform: capitalize;
        }

        .verified-badge {
          background: #27ae60;
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .ongoing-badge {
          background: #e74c3c;
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .affected-party {
          font-size: 1.05rem;
          margin-bottom: 1.25rem;
          color: var(--text-primary);
        }

        .affected-link {
          color: var(--accent-primary);
          text-decoration: underline;
          cursor: pointer;
          font-weight: 600;
        }

        .affected-link:hover {
          color: #2c3e50;
        }

        .affected-profession {
          color: var(--text-secondary);
          font-weight: 400;
        }

        .severity-display {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .severity-label {
          font-weight: 600;
          color: var(--text-primary);
          min-width: 80px;
        }

        .severity-bar {
          flex: 1;
          height: 24px;
          background: #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }

        .severity-fill {
          height: 100%;
          background: linear-gradient(90deg, #27ae60 0%, #f39c12 50%, #e74c3c 100%);
          transition: width 0.5s ease;
        }

        .severity-score {
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--text-primary);
          min-width: 50px;
          text-align: right;
        }

        .repercussion-timeline {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: var(--background-secondary);
          border-radius: 6px;
        }

        .timeline-item {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .timeline-item strong {
          color: var(--text-primary);
          margin-right: 0.5rem;
        }

        .repercussion-description {
          margin-bottom: 1.5rem;
        }

        .repercussion-description p {
          font-size: 1.05rem;
          line-height: 1.8;
          color: var(--text-primary);
          margin: 0;
        }

        .impact-description {
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          padding: 1rem;
          margin-bottom: 1.5rem;
          border-radius: 4px;
          color: #1565c0;
          line-height: 1.7;
        }

        .impact-description strong {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .repercussion-outcome {
          background: var(--background-secondary);
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
          line-height: 1.7;
        }

        .outcome-status {
          font-weight: 600;
          margin-left: 0.5rem;
        }

        .outcome-status.successful {
          color: #27ae60;
        }

        .outcome-status.unsuccessful {
          color: #e74c3c;
        }

        .media-coverage {
          padding: 1rem;
          background: #f3e5f5;
          border-left: 4px solid #9c27b0;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          color: #6a1b9a;
        }

        .outlet-count {
          font-weight: 700;
          font-size: 1.1rem;
        }

        .coverage-intensity {
          font-style: italic;
          opacity: 0.9;
        }

        .response-link {
          background: #e8f5e9;
          border-left: 4px solid #4caf50;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          color: #2e7d32;
          line-height: 1.7;
        }

        .response-link em {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-top: 0.5rem;
          display: block;
        }

        .tactical-badge {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
          color: white;
          padding: 1.25rem;
          border-radius: 8px;
          margin-top: 1rem;
          border: 2px solid #c92a2a;
        }

        .tactical-badge strong {
          display: block;
          font-size: 1.1rem;
          margin-bottom: 0.75rem;
        }

        .coordination-evidence {
          margin: 0.75rem 0 0 0;
          line-height: 1.6;
          opacity: 0.95;
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
          margin-bottom: 0.5rem;
        }

        .related-status {
          display: inline-block;
          padding: 0.25rem 0.6rem;
          border-radius: 3px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
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
            justify-content: flex-start;
          }

          .case-metrics-overview {
            grid-template-columns: repeat(2, 1fr);
          }

          .people-grid {
            grid-template-columns: 1fr;
          }

          .organizations-grid {
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
    // Only get real incidents (multi-statement cases)
    const cases = await prisma.case.findMany({
      where: {
        isRealIncident: true
      },
      select: { slug: true }
    })

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
    const caseItem = await prisma.case.findUnique({
      where: {
        slug: params.slug,
        // Only return real incidents
        isRealIncident: true
      },
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
        },
        repercussions: {
          include: {
            affectedPerson: {
              select: {
                id: true,
                name: true,
                slug: true,
                profession: true,
                imageUrl: true
              }
            },
            affectedOrganization: {
              select: {
                id: true,
                name: true,
                slug: true,
                type: true
              }
            },
            responseStatement: {
              select: {
                id: true,
                content: true,
                statementDate: true,
                person: {
                  select: {
                    name: true,
                    slug: true
                  }
                }
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        },
        _count: {
          select: {
            statements: true,
            sources: true,
            people: true,
            organizations: true,
            repercussions: true
          }
        }
      }
    })

    if (!caseItem) {
      return { notFound: true }
    }

    const relatedCases = (caseItem.tags?.length > 0 || caseItem.people?.length > 0)
      ? await prisma.case.findMany({
          where: {
            AND: [
              { id: { not: caseItem.id } },
              { isRealIncident: true }, // Only real incidents
              {
                OR: [
                  ...(caseItem.tags?.length > 0 ? [{
                    tags: {
                      some: {
                        id: { in: caseItem.tags.map(t => t.id) }
                      }
                    }
                  }] : []),
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
            status: true
          },
          orderBy: {
            caseDate: 'desc'
          },
          take: 3
        })
      : []

    return {
      props: {
        caseItem: JSON.parse(JSON.stringify({
          ...caseItem,
          relatedCases
        }))
      },
      revalidate: 3600
    }
  } catch (error) {
    console.error('Error fetching case:', error)
    return { notFound: true }
  }
}
