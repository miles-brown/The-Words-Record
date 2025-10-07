/**
 * Harvard Citation Display Component
 *
 * Renders properly formatted Harvard-style citations throughout the site
 */

import React from 'react'
import Link from 'next/link'

export interface CitationProps {
  author?: string
  authorOrg?: string
  year?: number
  title: string
  publication?: string
  publicationDate?: Date | string
  accessDate: Date | string
  url: string
  archiveUrl?: string
  medium?: 'web' | 'social' | 'book' | 'academic' | 'video' | 'government'
  platform?: string
  doi?: string
  credibilityLevel?: 'VERY_HIGH' | 'HIGH' | 'MIXED' | 'LOW' | 'VERY_LOW'
  showArchiveLink?: boolean
  compact?: boolean
}

export function HarvardCitation({
  author,
  authorOrg,
  year,
  title,
  publication,
  publicationDate,
  accessDate,
  url,
  archiveUrl,
  medium = 'web',
  platform,
  doi,
  credibilityLevel,
  showArchiveLink = true,
  compact = false
}: CitationProps) {

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December']
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  }

  const getCredibilityColor = () => {
    switch (credibilityLevel) {
      case 'VERY_HIGH': return '#10b981' // green
      case 'HIGH': return '#3b82f6' // blue
      case 'MIXED': return '#f59e0b' // amber
      case 'LOW': return '#ef4444' // red
      case 'VERY_LOW': return '#dc2626' // dark red
      default: return '#6b7280' // gray
    }
  }

  const getCredibilityLabel = () => {
    switch (credibilityLevel) {
      case 'VERY_HIGH': return 'Very High Credibility'
      case 'HIGH': return 'High Credibility'
      case 'MIXED': return 'Mixed Credibility'
      case 'LOW': return 'Low Credibility'
      case 'VERY_LOW': return 'Very Low Credibility'
      default: return null
    }
  }

  return (
    <div className={`harvard-citation ${compact ? 'compact' : ''}`}>
      <div className="citation-text">
        {/* Author */}
        <span className="citation-author">
          {author || authorOrg || 'Anon.'}
        </span>
        {' '}

        {/* Year */}
        <span className="citation-year">
          ({year || (publicationDate ? new Date(publicationDate).getFullYear() : 'n.d.')})
        </span>
        {' '}

        {/* Title */}
        <span className="citation-title">
          '{title}'
        </span>

        {/* Publication/Platform */}
        {(medium === 'social' && platform) ? (
          <>, {platform}</>
        ) : publication ? (
          <>, <em>{publication}</em></>
        ) : null}

        {/* Date for web/social */}
        {publicationDate && (medium === 'web' || medium === 'social') && (
          <>, {formatDate(publicationDate)}</>
        )}

        {/* DOI */}
        {doi && (
          <>. DOI: <Link href={`https://doi.org/${doi}`} target="_blank" rel="noopener noreferrer">
            {doi}
          </Link></>
        )}

        {/* URL */}
        . Available at: <Link href={url} target="_blank" rel="noopener noreferrer" className="citation-url">
          {url}
        </Link>

        {/* Access Date */}
        {' '}(Accessed: {formatDate(accessDate)}).
      </div>

      {/* Archive Link */}
      {showArchiveLink && archiveUrl && (
        <div className="citation-archive">
          <Link href={archiveUrl} target="_blank" rel="noopener noreferrer" className="archive-link">
            📦 Archived Version
          </Link>
        </div>
      )}

      {/* Credibility Badge */}
      {credibilityLevel && !compact && (
        <div className="citation-credibility">
          <span
            className="credibility-badge"
            style={{
              backgroundColor: getCredibilityColor(),
              color: 'white',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            {getCredibilityLabel()}
          </span>
        </div>
      )}

      <style jsx>{`
        .harvard-citation {
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 1rem 0;
          padding: 1rem;
          background: var(--bg-secondary, #f9fafb);
          border-left: 3px solid var(--accent-primary, #3b82f6);
          border-radius: 4px;
        }

        .harvard-citation.compact {
          padding: 0.5rem;
          margin: 0.5rem 0;
          font-size: 0.875rem;
        }

        .citation-text {
          color: var(--text-primary, #1f2937);
        }

        .citation-author {
          font-weight: 600;
        }

        .citation-year {
          font-weight: 500;
        }

        .citation-title {
          font-style: italic;
        }

        .citation-url {
          color: var(--accent-primary, #3b82f6);
          text-decoration: underline;
          word-break: break-all;
        }

        .citation-url:hover {
          color: var(--accent-secondary, #2563eb);
        }

        .citation-archive {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid var(--border-primary, #e5e7eb);
        }

        .archive-link {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          color: var(--accent-primary, #3b82f6);
          text-decoration: none;
        }

        .archive-link:hover {
          text-decoration: underline;
        }

        .citation-credibility {
          margin-top: 0.5rem;
        }

        @media (max-width: 768px) {
          .harvard-citation {
            font-size: 0.875rem;
            padding: 0.75rem;
          }

          .citation-url {
            word-break: break-word;
          }
        }
      `}</style>
    </div>
  )
}

/**
 * Source List Component - displays multiple citations
 */
export interface SourceListProps {
  sources: Array<CitationProps & { id?: string }>
  title?: string
  showCredibility?: boolean
}

export function SourceList({ sources, title = 'Sources', showCredibility = true }: SourceListProps) {
  if (!sources || sources.length === 0) {
    return null
  }

  return (
    <div className="source-list">
      <h3 className="source-list-title">{title}</h3>
      <div className="source-list-items">
        {sources.map((source, index) => (
          <div key={source.id || index} className="source-item">
            <span className="source-number">[{index + 1}]</span>
            <HarvardCitation
              {...source}
              credibilityLevel={showCredibility ? source.credibilityLevel : undefined}
              compact
            />
          </div>
        ))}
      </div>

      <style jsx>{`
        .source-list {
          margin: 2rem 0;
        }

        .source-list-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary, #1f2937);
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--border-primary, #e5e7eb);
        }

        .source-list-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .source-item {
          display: flex;
          gap: 0.75rem;
        }

        .source-number {
          flex-shrink: 0;
          font-weight: 600;
          color: var(--accent-primary, #3b82f6);
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        @media (max-width: 768px) {
          .source-list {
            margin: 1.5rem 0;
          }

          .source-list-title {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  )
}

/**
 * Inline Citation Reference Component
 */
export interface InlineCitationProps {
  sourceNumber: number
  sourceId?: string
  onClick?: () => void
}

export function InlineCitation({ sourceNumber, sourceId, onClick }: InlineCitationProps) {
  return (
    <sup className="inline-citation">
      <a
        href={sourceId ? `#source-${sourceId}` : `#source-${sourceNumber}`}
        onClick={onClick}
        className="citation-link"
      >
        [{sourceNumber}]
      </a>

      <style jsx>{`
        .inline-citation {
          font-size: 0.75em;
          line-height: 0;
          position: relative;
          vertical-align: baseline;
          top: -0.5em;
        }

        .citation-link {
          color: var(--accent-primary, #3b82f6);
          text-decoration: none;
          font-weight: 600;
          padding: 0 2px;
        }

        .citation-link:hover {
          text-decoration: underline;
          color: var(--accent-secondary, #2563eb);
        }
      `}</style>
    </sup>
  )
}
