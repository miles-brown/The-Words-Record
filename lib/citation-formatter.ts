/**
 * Harvard Citation Formatter
 *
 * Implements Harvard referencing style from Database & Content Rules Guide v1:
 * Format: Author(s) (Year) Title. Publication. Available at: URL (Accessed: Date)
 */

import { Source } from '@prisma/client'

export interface CitationSource {
  author?: string | null
  additionalAuthors?: string[] | null
  title?: string | null
  publication?: string | null
  publishDate?: Date | string | null
  url?: string | null
  accessDate?: Date | string | null
}

export interface FormattedCitation {
  full: string
  short: string
  authors: string
  year: string | null
  title: string
  publication: string | null
  url: string | null
  accessDate: string
}

/**
 * Format a single author name (Last, First)
 */
function formatAuthorName(authorName: string): string {
  const parts = authorName.trim().split(' ')
  if (parts.length === 1) return parts[0]

  const lastName = parts[parts.length - 1]
  const firstNames = parts.slice(0, -1).join(' ')
  return `${lastName}, ${firstNames.charAt(0)}.`
}

/**
 * Format multiple authors for Harvard style
 */
function formatAuthors(authors: string[]): string {
  if (authors.length === 0) return 'Unknown Author'
  if (authors.length === 1) return formatAuthorName(authors[0])
  if (authors.length === 2) {
    return `${formatAuthorName(authors[0])} and ${formatAuthorName(authors[1])}`
  }

  // 3+ authors: "First et al."
  return `${formatAuthorName(authors[0])} et al.`
}

/**
 * Extract year from date
 */
function extractYear(date: Date | string | null): string | null {
  if (!date) return null
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return null
  return dateObj.getFullYear().toString()
}

/**
 * Format access date
 */
function formatAccessDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return new Date().toLocaleDateString('en-GB')

  return dateObj.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Format a source in Harvard citation style
 */
export function formatHarvardCitation(source: CitationSource): FormattedCitation {
  // Parse authors
  const authors: string[] = []
  if (source.author) {
    authors.push(source.author)
  }
  if (source.additionalAuthors && Array.isArray(source.additionalAuthors)) {
    authors.push(...source.additionalAuthors)
  }

  const formattedAuthors = formatAuthors(authors)
  const year = extractYear(source.publishDate || null)
  const title = source.title || 'Untitled'
  const publication = source.publication || null
  const url = source.url || null
  const accessDate = formatAccessDate(source.accessDate || new Date())

  // Build full citation
  let fullCitation = formattedAuthors

  if (year) {
    fullCitation += ` (${year})`
  }

  fullCitation += ` *${title}*`

  if (publication) {
    fullCitation += `. ${publication}`
  }

  if (url) {
    fullCitation += `. Available at: ${url}`
  }

  fullCitation += ` (Accessed: ${accessDate})`

  // Build short citation (Author, Year)
  const shortCitation = year ? `${formattedAuthors} (${year})` : formattedAuthors

  return {
    full: fullCitation,
    short: shortCitation,
    authors: formattedAuthors,
    year,
    title,
    publication,
    url,
    accessDate
  }
}

/**
 * Format multiple sources as a bibliography
 */
export function formatBibliography(sources: CitationSource[]): string[] {
  return sources
    .map(formatHarvardCitation)
    .map(citation => citation.full)
    .sort() // Alphabetical by author
}

/**
 * Generate inline citation (Author, Year)
 */
export function formatInlineCitation(source: CitationSource): string {
  const citation = formatHarvardCitation(source)
  return citation.short
}

/**
 * Validate source has minimum required fields for citation
 */
export function validateSourceForCitation(source: CitationSource): {
  valid: boolean
  missing: string[]
} {
  const missing: string[] = []

  if (!source.title) missing.push('title')
  if (!source.author && (!source.additionalAuthors || source.additionalAuthors.length === 0)) {
    missing.push('author')
  }
  if (!source.url && !source.publication) {
    missing.push('url or publication')
  }

  return {
    valid: missing.length === 0,
    missing
  }
}

/**
 * Format citation for different output formats
 */
export function formatCitationAs(
  source: Partial<Source>,
  format: 'html' | 'markdown' | 'plain'
): string {
  const citation = formatHarvardCitation(source)

  switch (format) {
    case 'html':
      let html = citation.authors
      if (citation.year) html += ` (${citation.year})`
      html += ` <em>${citation.title}</em>`
      if (citation.publication) html += `. ${citation.publication}`
      if (citation.url) {
        html += `. Available at: <a href="${citation.url}" target="_blank" rel="noopener">${citation.url}</a>`
      }
      html += ` (Accessed: ${citation.accessDate})`
      return html

    case 'markdown':
      let md = citation.authors
      if (citation.year) md += ` (${citation.year})`
      md += ` *${citation.title}*`
      if (citation.publication) md += `. ${citation.publication}`
      if (citation.url) {
        md += `. Available at: [${citation.url}](${citation.url})`
      }
      md += ` (Accessed: ${citation.accessDate})`
      return md

    case 'plain':
    default:
      return citation.full
  }
}
