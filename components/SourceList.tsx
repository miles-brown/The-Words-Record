import React from 'react'
import HarvardCitation from './HarvardCitation'

interface Source {
  id: string
  author?: string | null
  additionalAuthors?: string[] | null
  title?: string | null
  publication?: string | null
  publishDate?: Date | string | null
  url?: string | null
  accessDate?: Date | string | null
}

interface SourceListProps {
  sources: Source[]
  title?: string
  className?: string
}

export default function SourceList({
  sources,
  title = 'Sources',
  className = ''
}: SourceListProps) {
  if (!sources || sources.length === 0) {
    return null
  }

  // Sort sources alphabetically by author
  const sortedSources = [...sources].sort((a, b) => {
    const authorA = a.author || 'Unknown'
    const authorB = b.author || 'Unknown'
    return authorA.localeCompare(authorB)
  })

  return (
    <div className={`sources-section ${className}`}>
      <h2>{title}</h2>
      <ol className="sources-list">
        {sortedSources.map((source) => (
          <li key={source.id}>
            <HarvardCitation source={source} />
          </li>
        ))}
      </ol>

      <style jsx>{`
        .sources-section {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 2px solid #e5e7eb;
        }

        .sources-section h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #111827;
        }

        .sources-list {
          list-style-type: decimal;
          padding-left: 2rem;
          line-height: 1.8;
        }

        .sources-list li {
          margin-bottom: 1rem;
          color: #374151;
        }

        .sources-list li :global(.citation-title) {
          font-style: italic;
        }

        .sources-list li :global(.citation-url) {
          color: #2563eb;
          text-decoration: underline;
          word-break: break-word;
        }

        .sources-list li :global(.citation-url:hover) {
          color: #1d4ed8;
        }

        .sources-list li :global(.citation-access) {
          font-size: 0.95em;
          color: #6b7280;
        }

        @media (max-width: 640px) {
          .sources-list {
            padding-left: 1.25rem;
          }

          .sources-list li {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  )
}
