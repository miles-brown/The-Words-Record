/**
 * Harvard-Style Citation System
 *
 * Formats citations according to Harvard referencing style for:
 * - News articles
 * - Social media posts
 * - Books
 * - Academic papers
 * - Government documents
 * - Videos
 */

export interface CitationData {
  author?: string
  authorOrg?: string
  year?: number
  title: string
  publication?: string
  publicationDate?: Date
  accessDate: Date
  url: string
  medium?: 'web' | 'social' | 'book' | 'academic' | 'video' | 'government'
  platform?: string // For social media: Twitter, Facebook, etc.
  publisher?: string // For books
  doi?: string // For academic papers
}

/**
 * Generate Harvard-style citation from data
 */
export function generateHarvardCitation(data: CitationData): string {
  const { author, authorOrg, year, title, publication, publicationDate, accessDate, url, medium, platform, publisher, doi } = data

  let citation = ''

  // Author (Last name, First initial)
  if (author) {
    citation += `${author}`
  } else if (authorOrg) {
    citation += `${authorOrg}`
  } else {
    citation += 'Anon.'
  }

  // Year
  if (year) {
    citation += ` (${year})`
  } else if (publicationDate) {
    citation += ` (${publicationDate.getFullYear()})`
  } else {
    citation += ` (n.d.)`
  }

  // Title (in single quotes for articles, italics for books)
  citation += ` '${title}'`

  // Publication/Platform
  if (medium === 'social' && platform) {
    citation += `, ${platform}`
  } else if (publication) {
    citation += `, ${publication}`
  }

  // Date (for web/social media)
  if (publicationDate && (medium === 'web' || medium === 'social')) {
    citation += `, ${formatDate(publicationDate)}`
  }

  // Publisher (for books)
  if (publisher) {
    citation += `, ${publisher}`
  }

  // DOI (for academic papers)
  if (doi) {
    citation += `. DOI: ${doi}`
  }

  // Access information
  citation += `. Available at: ${url}`
  citation += ` (Accessed: ${formatDate(accessDate)})`

  return citation + '.'
}

/**
 * Format date as "DD Month YYYY"
 */
function formatDate(date: Date): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December']
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

/**
 * Parse a URL and extract citation metadata
 */
export async function extractCitationFromURL(url: string): Promise<Partial<CitationData>> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CitationBot/1.0)'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()

    // Extract metadata from HTML
    const metadata: Partial<CitationData> = {
      url,
      accessDate: new Date()
    }

    // Extract title
    const titleMatch = html.match(/<title>(.*?)<\/title>/i)
    if (titleMatch) {
      metadata.title = cleanText(titleMatch[1])
    }

    // Extract Open Graph metadata
    const ogTitle = html.match(/<meta property="og:title" content="(.*?)"/i)
    if (ogTitle) {
      metadata.title = cleanText(ogTitle[1])
    }

    const ogSiteName = html.match(/<meta property="og:site_name" content="(.*?)"/i)
    if (ogSiteName) {
      metadata.publication = cleanText(ogSiteName[1])
    }

    // Extract author
    const authorMeta = html.match(/<meta name="author" content="(.*?)"/i)
    if (authorMeta) {
      metadata.author = cleanText(authorMeta[1])
    }

    // Extract publication date
    const dateMeta = html.match(/<meta property="article:published_time" content="(.*?)"/i)
    if (dateMeta) {
      metadata.publicationDate = new Date(dateMeta[1])
      metadata.year = metadata.publicationDate.getFullYear()
    }

    // Detect medium based on URL
    if (url.includes('twitter.com') || url.includes('x.com')) {
      metadata.medium = 'social'
      metadata.platform = 'X (Twitter)'
    } else if (url.includes('facebook.com')) {
      metadata.medium = 'social'
      metadata.platform = 'Facebook'
    } else if (url.includes('instagram.com')) {
      metadata.medium = 'social'
      metadata.platform = 'Instagram'
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      metadata.medium = 'video'
      metadata.platform = 'YouTube'
    } else if (url.includes('gov.uk') || url.includes('.gov')) {
      metadata.medium = 'government'
    } else {
      metadata.medium = 'web'
    }

    return metadata
  } catch (error) {
    console.error(`Failed to extract citation from ${url}:`, error)
    return {
      url,
      accessDate: new Date(),
      medium: 'web'
    }
  }
}

/**
 * Clean extracted text (remove HTML entities, extra whitespace)
 */
function cleanText(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Validate Harvard citation format
 */
export function validateCitation(citation: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check for author
  if (!citation.match(/^[A-Z][a-z]+,?\s+[A-Z]\.?|^[A-Z][^(]+\(/)) {
    errors.push('Missing or invalid author format')
  }

  // Check for year
  if (!citation.match(/\(\d{4}\)|n\.d\./)) {
    errors.push('Missing or invalid year')
  }

  // Check for title
  if (!citation.match(/'[^']+'/)) {
    errors.push('Missing or improperly formatted title (should be in single quotes)')
  }

  // Check for URL
  if (!citation.match(/Available at: https?:\/\//)) {
    errors.push('Missing or invalid URL')
  }

  // Check for access date
  if (!citation.match(/Accessed: \d{1,2} [A-Z][a-z]+ \d{4}/)) {
    errors.push('Missing or invalid access date')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Parse existing informal citation into structured data
 */
export function parseInformalCitation(text: string): Partial<CitationData> {
  const data: Partial<CitationData> = {
    accessDate: new Date()
  }

  // Extract URL
  const urlMatch = text.match(/https?:\/\/[^\s,]+/)
  if (urlMatch) {
    data.url = urlMatch[0]
  }

  // Extract title (text in quotes)
  const titleMatch = text.match(/["']([^"']+)["']/)
  if (titleMatch) {
    data.title = titleMatch[1]
  }

  // Extract publication name
  const pubMatch = text.match(/(?:from|in|on)\s+([A-Z][a-zA-Z\s&]+?)(?:,|\.|$)/)
  if (pubMatch) {
    data.publication = pubMatch[1].trim()
  }

  // Extract year
  const yearMatch = text.match(/\b(19|20)\d{2}\b/)
  if (yearMatch) {
    data.year = parseInt(yearMatch[0])
  }

  return data
}

/**
 * Examples of properly formatted Harvard citations
 */
export const CITATION_EXAMPLES = {
  newsArticle: "Smith, J. (2024) 'Breaking News on Israel-Palestine Conflict', The Guardian, 15 March. Available at: https://theguardian.com/article (Accessed: 16 March 2024).",

  socialMedia: "Netanyahu, B. (2024) 'Statement on Gaza operations', X (Twitter), 10 October. Available at: https://twitter.com/netanyahu/status/123 (Accessed: 11 October 2024).",

  book: "Said, E. (1978) Orientalism. New York: Pantheon Books.",

  academic: "Finkelstein, N. (2005) 'Beyond Chutzpah: On the Misuse of Anti-Semitism', Journal of Palestine Studies, 34(2). DOI: 10.1525/jps.2005.34.2.123",

  government: "UK Government (2023) 'Statement on IHRA Definition', gov.uk, 5 December. Available at: https://gov.uk/statement (Accessed: 6 December 2023).",

  video: "Chomsky, N. (2023) 'Israel-Palestine: The Truth', YouTube, 20 May. Available at: https://youtube.com/watch?v=abc123 (Accessed: 21 May 2023)."
}
