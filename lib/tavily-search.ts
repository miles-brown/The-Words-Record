/**
 * Tavily Search API Wrapper
 *
 * Provides web search capabilities for case enrichment
 * Finds additional sources, news articles, and context about statements
 */

import tavily from 'tavily'

export interface SearchResult {
  title: string
  url: string
  content: string
  score: number
  publishedDate?: string
}

export interface SearchOptions {
  maxResults?: number
  searchDepth?: 'basic' | 'advanced'
  includeDomains?: string[]
  excludeDomains?: string[]
  includeAnswer?: boolean
  includeImages?: boolean
}

/**
 * Initialize Tavily client
 */
function getClient() {
  const apiKey = process.env.TAVILY_API_KEY

  if (!apiKey) {
    throw new Error(
      'TAVILY_API_KEY environment variable is not set. ' +
      'Get a free API key at https://tavily.com/ (1,000 searches/month free)'
    )
  }

  return tavily({ apiKey })
}

/**
 * Search the web for information about a statement/case
 */
export async function searchForCase(params: {
  query: string
  options?: SearchOptions
}): Promise<{
  results: SearchResult[]
  answer?: string
  images?: string[]
}> {
  const client = getClient()
  const { query, options = {} } = params

  const {
    maxResults = 10,
    searchDepth = 'advanced',
    includeDomains,
    excludeDomains,
    includeAnswer = true,
    includeImages = false
  } = options

  try {
    const response = await client.search(query, {
      maxResults,
      searchDepth,
      includeDomains,
      excludeDomains,
      includeAnswer,
      includeImages
    })

    return {
      results: response.results.map((r: any) => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score,
        publishedDate: r.published_date
      })),
      answer: response.answer,
      images: response.images || []
    }
  } catch (error) {
    console.error('Tavily search failed:', error)
    throw new Error(
      `Web search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Search for additional sources about a specific statement
 */
export async function searchForStatementSources(params: {
  personName: string
  statementKeywords: string
  date?: Date
  context?: string
}): Promise<SearchResult[]> {
  const { personName, statementKeywords, date, context } = params

  // Build search query
  let query = `"${personName}" ${statementKeywords}`

  if (date) {
    const year = date.getFullYear()
    query += ` ${year}`
  }

  if (context) {
    query += ` ${context}`
  }

  // Prioritize news sources
  const newsDomainsToInclude = [
    'nytimes.com',
    'washingtonpost.com',
    'theguardian.com',
    'bbc.com',
    'reuters.com',
    'apnews.com',
    'cnn.com',
    'npr.org',
    'bloomberg.com',
    'wsj.com'
  ]

  const { results } = await searchForCase({
    query,
    options: {
      maxResults: 10,
      searchDepth: 'advanced',
      includeAnswer: false
    }
  })

  return results
}

/**
 * Search for recent developments/updates about a case
 */
export async function searchForUpdates(params: {
  caseTitle: string
  personName?: string
  sinceDate?: Date
}): Promise<SearchResult[]> {
  const { caseTitle, personName, sinceDate } = params

  let query = caseTitle

  if (personName) {
    query += ` "${personName}"`
  }

  // Add recency indicators
  if (sinceDate) {
    const monthsAgo = Math.floor(
      (Date.now() - sinceDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    )
    if (monthsAgo < 12) {
      query += ' latest update'
    }
  } else {
    query += ' recent news'
  }

  const { results } = await searchForCase({
    query,
    options: {
      maxResults: 5,
      searchDepth: 'basic',
      includeAnswer: false
    }
  })

  return results
}

/**
 * Search for background information about a person
 */
export async function searchForPersonBackground(params: {
  personName: string
  profession?: string
}): Promise<{ answer?: string; sources: SearchResult[] }> {
  const { personName, profession } = params

  let query = `"${personName}"`
  if (profession) {
    query += ` ${profession}`
  }
  query += ' biography background'

  const { results, answer } = await searchForCase({
    query,
    options: {
      maxResults: 5,
      searchDepth: 'basic',
      includeAnswer: true
    }
  })

  return {
    answer,
    sources: results
  }
}

/**
 * Search for media coverage and reactions
 */
export async function searchForMediaCoverage(params: {
  topic: string
  dateRange?: { start: Date; end: Date }
}): Promise<SearchResult[]> {
  const { topic, dateRange } = params

  let query = `"${topic}" media coverage reaction`

  if (dateRange) {
    const startYear = dateRange.start.getFullYear()
    const endYear = dateRange.end.getFullYear()
    if (startYear === endYear) {
      query += ` ${startYear}`
    } else {
      query += ` ${startYear}-${endYear}`
    }
  }

  const { results } = await searchForCase({
    query,
    options: {
      maxResults: 8,
      searchDepth: 'advanced',
      includeAnswer: false
    }
  })

  return results
}

/**
 * Test Tavily API connection
 */
export async function testTavilyConnection(): Promise<boolean> {
  try {
    const { results } = await searchForCase({
      query: 'test query',
      options: { maxResults: 1, searchDepth: 'basic', includeAnswer: false }
    })

    return results.length > 0
  } catch (error) {
    console.error('Tavily connection test failed:', error)
    return false
  }
}

/**
 * Build comprehensive search queries for case enrichment
 */
export async function enrichedCaseSearch(params: {
  personName: string
  statementContent: string
  statementDate: Date
  caseTitle: string
  context?: string
}): Promise<{
  mainSources: SearchResult[]
  background: { answer?: string; sources: SearchResult[] }
  mediaCoverage: SearchResult[]
  recentUpdates: SearchResult[]
}> {
  const { personName, statementContent, statementDate, caseTitle, context } = params

  // Extract keywords from statement (first 5 significant words)
  const keywords = statementContent
    .split(/\s+/)
    .filter(w => w.length > 4)
    .slice(0, 5)
    .join(' ')

  // Run searches in parallel
  const [mainSources, background, mediaCoverage, recentUpdates] = await Promise.all([
    searchForStatementSources({
      personName,
      statementKeywords: keywords,
      date: statementDate,
      context
    }),
    searchForPersonBackground({
      personName
    }),
    searchForMediaCoverage({
      topic: caseTitle,
      dateRange: {
        start: new Date(statementDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week before
        end: new Date(statementDate.getTime() + 30 * 24 * 60 * 60 * 1000) // 1 month after
      }
    }),
    searchForUpdates({
      caseTitle,
      personName,
      sinceDate: statementDate
    })
  ])

  return {
    mainSources,
    background,
    mediaCoverage,
    recentUpdates
  }
}
