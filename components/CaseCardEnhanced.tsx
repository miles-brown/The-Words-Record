import Link from 'next/link'
import { format } from 'date-fns'

interface CaseCardProps {
  slug: string
  title: string
  excerpt: string
  date: string
  tags: Array<{
    name: string
    slug: string
  }>
  _count?: {
    sources?: number
    statements?: number
    responses?: number
  }
  status?: string
  isVerified?: boolean
}

export default function CaseCardEnhanced({
  slug,
  title,
  excerpt,
  date,
  tags = [],
  _count,
  status,
  isVerified
}: CaseCardProps) {
  return (
    <Link href={`/statements/${slug}`}>
      <article className="case-card-enhanced">
        <div className="card-header">
          <div className="card-badges">
            {isVerified && (
              <span className="badge badge-verified" title="Verified case">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="badge-icon">
                  <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            )}
            {status && (
              <span className={`badge badge-status badge-${status.toLowerCase()}`}>
                {status}
              </span>
            )}
          </div>
          <time className="card-date" dateTime={date}>
            {format(new Date(date), 'MMM d, yyyy')}
          </time>
        </div>

        <h3 className="card-title">{title}</h3>
        <p className="card-excerpt">{excerpt}</p>

        {tags && tags.length > 0 && (
          <div className="card-tags">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag.slug} className="tag" title={tag.name}>
                {tag.name}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="tag tag-more">+{tags.length - 3}</span>
            )}
          </div>
        )}

        {_count && (
          <div className="card-meta">
            {_count.statements !== undefined && (
              <div className="meta-item" title={`${_count.statements} statements`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="meta-icon">
                  <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.06 1.06z" />
                </svg>
                <span>{_count.statements}</span>
              </div>
            )}
            {_count.sources !== undefined && (
              <div className="meta-item" title={`${_count.sources} sources`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="meta-icon">
                  <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                </svg>
                <span>{_count.sources}</span>
              </div>
            )}
            {_count.responses !== undefined && _count.responses > 0 && (
              <div className="meta-item" title={`${_count.responses} responses`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="meta-icon">
                  <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 005.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2z" clipRule="evenodd" />
                </svg>
                <span>{_count.responses}</span>
              </div>
            )}
          </div>
        )}

        <div className="card-footer">
          <span className="read-more">
            Read more
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="arrow-icon">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </article>

      <style jsx>{`
        .case-card-enhanced {
          background: white;
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          height: 100%;
        }

        .case-card-enhanced:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          border-color: #667eea;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .card-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.7rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge-verified {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .badge-icon {
          width: 14px;
          height: 14px;
        }

        .badge-status {
          background: var(--background-secondary);
          color: var(--text-secondary);
        }

        .badge-documented {
          background: #e3f2fd;
          color: #1565c0;
        }

        .badge-verified {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .badge-ongoing {
          background: #fff3e0;
          color: #e65100;
        }

        .card-date {
          color: var(--text-secondary);
          font-size: 0.85rem;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .card-title {
          font-size: 1.25rem;
          color: var(--text-primary);
          line-height: 1.3;
          margin: 0;
          font-weight: 600;
        }

        .card-excerpt {
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 0.95rem;
          margin: 0;
          flex: 1;
        }

        .card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag {
          background: var(--background-secondary);
          color: var(--text-primary);
          padding: 0.3rem 0.65rem;
          border-radius: 8px;
          font-size: 0.8rem;
          transition: background 0.2s;
        }

        .tag-more {
          background: #667eea;
          color: white;
          font-weight: 600;
        }

        .card-meta {
          display: flex;
          gap: 1.25rem;
          padding-top: 0.5rem;
          border-top: 1px solid var(--border-primary);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .meta-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        .card-footer {
          display: flex;
          justify-content: flex-end;
        }

        .read-more {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: #667eea;
          font-weight: 600;
          font-size: 0.9rem;
          transition: gap 0.2s;
        }

        .case-card-enhanced:hover .read-more {
          gap: 0.5rem;
        }

        .arrow-icon {
          width: 16px;
          height: 16px;
        }

        @media (max-width: 768px) {
          .case-card-enhanced {
            padding: 1.25rem;
          }

          .card-title {
            font-size: 1.1rem;
          }

          .card-excerpt {
            font-size: 0.9rem;
          }

          .card-meta {
            gap: 1rem;
          }
        }
      `}</style>
    </Link>
  )
}
