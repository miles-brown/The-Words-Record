import React from 'react'
import { formatHarvardCitation } from '@/lib/citation-formatter'

interface HarvardCitationProps {
  source: {
    author?: string | null
    additionalAuthors?: string[] | null
    title?: string | null
    publication?: string | null
    publishDate?: Date | string | null
    url?: string | null
    accessDate?: Date | string | null
  }
  format?: 'full' | 'short' | 'inline'
  className?: string
}

export default function HarvardCitation({
  source,
  format = 'full',
  className = ''
}: HarvardCitationProps) {
  const citation = formatHarvardCitation(source)

  if (format === 'short' || format === 'inline') {
    return (
      <cite className={className}>
        {citation.short}
      </cite>
    )
  }

  // Full citation with proper HTML formatting
  return (
    <cite className={`citation-harvard ${className}`}>
      <span className="citation-authors">{citation.authors}</span>
      {citation.year && (
        <> <span className="citation-year">({citation.year})</span></>
      )}
      {' '}
      <em className="citation-title">{citation.title}</em>
      {citation.publication && (
        <>. <span className="citation-publication">{citation.publication}</span></>
      )}
      {citation.url && (
        <>
          . Available at:{' '}
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="citation-url"
          >
            {citation.url}
          </a>
        </>
      )}
      {' '}
      <span className="citation-access">(Accessed: {citation.accessDate})</span>
    </cite>
  )
}
