/**
 * Harvard Referencing System Utilities
 * Generates Harvard-style citations for all sources
 */

export interface HarvardReference {
  authors?: string[]
  year?: number
  title: string
  publication?: string
  volume?: string
  issue?: string
  pages?: string
  doi?: string
  url?: string
  accessDate?: Date
  publisher?: string
  place?: string
  edition?: string
  editors?: string[]
  translators?: string[]
  isbn?: string
}

/**
 * Format author names for Harvard citation
 * @example ["John Smith", "Jane Doe"] => "Smith, J. and Doe, J."
 */
function formatAuthors(authors: string[]): string {
  if (!authors || authors.length === 0) return 'Anon.'

  const formatted = authors.map((author, index) => {
    const parts = author.trim().split(' ')
    if (parts.length === 0) return ''

    const lastName = parts[parts.length - 1]
    const initials = parts
      .slice(0, -1)
      .map(part => part[0]?.toUpperCase() + '.')
      .join('')

    return `${lastName}, ${initials}`
  })

  if (formatted.length === 1) return formatted[0]
  if (formatted.length === 2) return formatted.join(' and ')
  if (formatted.length > 6) {
    return formatted.slice(0, 3).join(', ') + ' et al.'
  }

  const lastAuthor = formatted.pop()
  return formatted.join(', ') + ' and ' + lastAuthor
}

/**
 * Format date for Harvard citation
 */
function formatAccessDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }
  return date.toLocaleDateString('en-GB', options)
}

/**
 * Generate in-text citation
 * @example (Smith, 2023) or (Smith and Doe, 2023) or (Smith et al., 2023)
 */
export function generateInTextCitation(ref: HarvardReference): string {
  const year = ref.year || 'n.d.'

  if (!ref.authors || ref.authors.length === 0) {
    // Use publication name if no authors
    if (ref.publication) {
      return `(${ref.publication}, ${year})`
    }
    return `(Anon., ${year})`
  }

  const authors = ref.authors.map(author => {
    const parts = author.trim().split(' ')
    return parts[parts.length - 1] // Last name only
  })

  if (authors.length === 1) {
    return `(${authors[0]}, ${year})`
  } else if (authors.length === 2) {
    return `(${authors.join(' and ')}, ${year})`
  } else {
    return `(${authors[0]} et al., ${year})`
  }
}

/**
 * Generate full Harvard reference citation
 */
export function generateFullCitation(ref: HarvardReference): string {
  const parts: string[] = []

  // Authors
  if (ref.authors && ref.authors.length > 0) {
    parts.push(formatAuthors(ref.authors))
  } else {
    parts.push('Anon.')
  }

  // Year
  parts.push(`(${ref.year || 'n.d.'})`)

  // Title (in italics for books/websites, in quotes for articles)
  if (ref.publication) {
    // Article in publication
    parts.push(`'${ref.title}'`)
  } else {
    // Book or website
    parts.push(`<i>${ref.title}</i>`)
  }

  // Editors
  if (ref.editors && ref.editors.length > 0) {
    parts.push(`In: ${formatAuthors(ref.editors)} (eds.)}`)
  }

  // Publication/Journal (in italics)
  if (ref.publication) {
    parts.push(`<i>${ref.publication}</i>`)
  }

  // Edition
  if (ref.edition) {
    parts.push(`${ref.edition} edn`)
  }

  // Volume and Issue
  if (ref.volume) {
    let volIssue = ref.volume
    if (ref.issue) {
      volIssue += `(${ref.issue})`
    }
    parts.push(volIssue)
  }

  // Publisher and Place
  if (ref.publisher) {
    if (ref.place) {
      parts.push(`${ref.place}: ${ref.publisher}`)
    } else {
      parts.push(ref.publisher)
    }
  }

  // Pages
  if (ref.pages) {
    parts.push(`pp. ${ref.pages}`)
  }

  // DOI
  if (ref.doi) {
    parts.push(`doi: ${ref.doi}`)
  }

  // ISBN
  if (ref.isbn) {
    parts.push(`ISBN: ${ref.isbn}`)
  }

  // URL and Access date
  if (ref.url) {
    parts.push(`Available at: ${ref.url}`)
    if (ref.accessDate) {
      parts.push(`[Accessed ${formatAccessDate(ref.accessDate)}]`)
    }
  }

  return parts.join(', ') + '.'
}

/**
 * Extract citation info from various source types
 */
export function extractCitationInfo(source: any): HarvardReference {
  return {
    authors: source.authors || source.additionalAuthors || [],
    year: source.publicationYear || (source.publishDate ? new Date(source.publishDate).getFullYear() : undefined),
    title: source.title,
    publication: source.publication,
    volume: source.volume,
    issue: source.issue,
    pages: source.pageNumbers,
    doi: source.doi,
    isbn: source.isbn,
    url: source.url,
    accessDate: source.accessDate ? new Date(source.accessDate) : new Date(),
    publisher: source.publisher,
    place: source.placeOfPublication,
    edition: source.edition,
    editors: source.editors,
    translators: source.translators
  }
}

/**
 * Validate Harvard reference completeness
 */
export function validateCitation(ref: HarvardReference): {
  isValid: boolean
  missing: string[]
  warnings: string[]
} {
  const missing: string[] = []
  const warnings: string[] = []

  // Required fields
  if (!ref.title) missing.push('title')

  // Conditional requirements
  if (!ref.authors || ref.authors.length === 0) {
    if (!ref.publication) {
      warnings.push('No authors specified - using Anonymous')
    }
  }

  if (!ref.year) {
    warnings.push('No year specified - using n.d. (no date)')
  }

  // Online sources should have access date
  if (ref.url && !ref.accessDate) {
    warnings.push('Online source should include access date')
  }

  // Journal articles should have volume/issue
  if (ref.publication && !ref.volume) {
    warnings.push('Journal article should include volume number')
  }

  // Books should have publisher
  if (!ref.publication && !ref.publisher && !ref.url) {
    warnings.push('Book reference should include publisher')
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings
  }
}

/**
 * Parse author string into structured format
 * @example "John Smith, Jane Doe" => ["John Smith", "Jane Doe"]
 */
export function parseAuthors(authorString: string): string[] {
  if (!authorString) return []

  // Handle various separators
  const separators = [';', ',', ' and ', ' & ']
  let authors = [authorString]

  for (const sep of separators) {
    if (authorString.includes(sep)) {
      authors = authorString.split(sep).map(a => a.trim()).filter(a => a)
      break
    }
  }

  return authors
}

/**
 * Format source for display with Harvard citation
 */
export function formatSourceDisplay(source: any): {
  inText: string
  full: string
  html: string
} {
  const ref = extractCitationInfo(source)
  const inText = generateInTextCitation(ref)
  const full = generateFullCitation(ref)

  // Convert italic markers to HTML
  const html = full
    .replace(/<i>/g, '<em>')
    .replace(/<\/i>/g, '</em>')

  return {
    inText,
    full,
    html
  }
}

/**
 * Generate bibliography from multiple sources
 */
export function generateBibliography(sources: any[]): string {
  const citations = sources
    .map(source => {
      const ref = extractCitationInfo(source)
      return {
        citation: generateFullCitation(ref),
        sortKey: (ref.authors?.[0] || 'Anon.') + (ref.year || '9999')
      }
    })
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(item => item.citation)

  return citations.join('\n\n')
}

/**
 * Archive source with Wayback Machine
 */
export async function archiveWithWayback(url: string): Promise<{
  success: boolean
  archiveUrl?: string
  error?: string
}> {
  try {
    // Save to Wayback Machine
    const saveResponse = await fetch(`https://web.archive.org/save/${url}`, {
      method: 'GET',
      redirect: 'follow'
    })

    if (saveResponse.ok) {
      // Get the archived URL
      const location = saveResponse.headers.get('Content-Location') ||
                      saveResponse.headers.get('Location')

      if (location) {
        const archiveUrl = `https://web.archive.org${location}`
        return { success: true, archiveUrl }
      }
    }

    // Check if already archived
    const availabilityResponse = await fetch(
      `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`
    )

    if (availabilityResponse.ok) {
      const data = await availabilityResponse.json()
      if (data.archived_snapshots?.closest?.available) {
        return {
          success: true,
          archiveUrl: data.archived_snapshots.closest.url
        }
      }
    }

    return {
      success: false,
      error: 'Failed to archive URL with Wayback Machine'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Archive error'
    }
  }
}

/**
 * Check if URL is already archived
 */
export async function checkWaybackArchive(url: string): Promise<{
  isArchived: boolean
  archiveUrl?: string
  timestamp?: string
}> {
  try {
    const response = await fetch(
      `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`
    )

    if (response.ok) {
      const data = await response.json()
      if (data.archived_snapshots?.closest?.available) {
        return {
          isArchived: true,
          archiveUrl: data.archived_snapshots.closest.url,
          timestamp: data.archived_snapshots.closest.timestamp
        }
      }
    }

    return { isArchived: false }
  } catch (error) {
    console.error('Wayback check error:', error)
    return { isArchived: false }
  }
}