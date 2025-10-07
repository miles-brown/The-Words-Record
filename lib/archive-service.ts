/**
 * Internet Archive Integration
 *
 * Automatically saves URLs to Wayback Machine and retrieves archive links
 */

export interface ArchiveResult {
  originalUrl: string
  archiveUrl: string
  archiveDate: Date
  status: 'success' | 'already_archived' | 'failed'
  error?: string
}

/**
 * Save a URL to the Wayback Machine
 */
export async function saveToWaybackMachine(url: string): Promise<ArchiveResult> {
  try {
    // First, check if already archived
    const existingArchive = await checkWaybackArchive(url)
    if (existingArchive) {
      return {
        originalUrl: url,
        archiveUrl: existingArchive.archiveUrl,
        archiveDate: existingArchive.archiveDate,
        status: 'already_archived'
      }
    }

    // Save to Wayback Machine
    const saveUrl = `https://web.archive.org/save/${url}`
    const response = await fetch(saveUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (TheWordsRecord/1.0; +https://thewordsrecord.com)'
      },
      redirect: 'follow'
    })

    if (!response.ok) {
      throw new Error(`Archive failed: HTTP ${response.status}`)
    }

    // Extract archive URL from response
    const archiveUrl = response.url.replace('/save/', '/')

    return {
      originalUrl: url,
      archiveUrl,
      archiveDate: new Date(),
      status: 'success'
    }
  } catch (error) {
    console.error(`Failed to archive ${url}:`, error)
    return {
      originalUrl: url,
      archiveUrl: '',
      archiveDate: new Date(),
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Check if URL already exists in Wayback Machine
 */
export async function checkWaybackArchive(url: string): Promise<{ archiveUrl: string; archiveDate: Date } | null> {
  try {
    const apiUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`
    const response = await fetch(apiUrl)

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (data.archived_snapshots && data.archived_snapshots.closest) {
      const snapshot = data.archived_snapshots.closest
      return {
        archiveUrl: snapshot.url,
        archiveDate: new Date(snapshot.timestamp.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
      }
    }

    return null
  } catch (error) {
    console.error(`Failed to check archive for ${url}:`, error)
    return null
  }
}

/**
 * Get most recent archive snapshot for a URL
 */
export async function getMostRecentArchive(url: string): Promise<string | null> {
  try {
    const archive = await checkWaybackArchive(url)
    return archive ? archive.archiveUrl : null
  } catch (error) {
    return null
  }
}

/**
 * Batch archive multiple URLs with rate limiting
 */
export async function batchArchiveURLs(
  urls: string[],
  delayMs: number = 2000
): Promise<ArchiveResult[]> {
  const results: ArchiveResult[] = []

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    console.log(`Archiving ${i + 1}/${urls.length}: ${url}`)

    const result = await saveToWaybackMachine(url)
    results.push(result)

    // Rate limiting: wait between requests
    if (i < urls.length - 1) {
      await sleep(delayMs)
    }
  }

  return results
}

/**
 * Verify that an archived URL is still accessible
 */
export async function verifyArchiveURL(archiveUrl: string): Promise<boolean> {
  try {
    const response = await fetch(archiveUrl, { method: 'HEAD' })
    return response.ok
  } catch (error) {
    return false
  }
}

/**
 * Alternative: archive.today (archive.is) as backup
 */
export async function saveToArchiveToday(url: string): Promise<ArchiveResult> {
  try {
    // archive.today doesn't have a public API, so we use their submission form
    const submitUrl = 'https://archive.today/submit/'
    const formData = new URLSearchParams()
    formData.append('url', url)

    const response = await fetch(submitUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (TheWordsRecord/1.0)'
      },
      body: formData,
      redirect: 'manual'
    })

    // archive.today redirects to the archived page
    const location = response.headers.get('location')
    if (location) {
      return {
        originalUrl: url,
        archiveUrl: location,
        archiveDate: new Date(),
        status: 'success'
      }
    }

    throw new Error('No redirect location received')
  } catch (error) {
    console.error(`Failed to archive to archive.today: ${url}`, error)
    return {
      originalUrl: url,
      archiveUrl: '',
      archiveDate: new Date(),
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Comprehensive archiving: tries Wayback Machine, then archive.today as backup
 */
export async function archiveURLComprehensive(url: string): Promise<ArchiveResult> {
  // Try Wayback Machine first
  let result = await saveToWaybackMachine(url)

  if (result.status === 'success' || result.status === 'already_archived') {
    return result
  }

  // If failed, try archive.today as backup
  console.log(`Wayback Machine failed for ${url}, trying archive.today...`)
  result = await saveToArchiveToday(url)

  return result
}

/**
 * Generate archive metadata for database storage
 */
export interface ArchiveMetadata {
  archiveUrl: string
  archiveDate: Date
  archiveMethod: 'WAYBACK_MACHINE' | 'ARCHIVE_TODAY' | 'LOCAL_STORAGE'
  isVerified: boolean
  lastVerified: Date
}

export async function generateArchiveMetadata(
  originalUrl: string,
  archiveResult: ArchiveResult
): Promise<ArchiveMetadata | null> {
  if (archiveResult.status === 'failed' || !archiveResult.archiveUrl) {
    return null
  }

  const isVerified = await verifyArchiveURL(archiveResult.archiveUrl)

  return {
    archiveUrl: archiveResult.archiveUrl,
    archiveDate: archiveResult.archiveDate,
    archiveMethod: archiveResult.archiveUrl.includes('web.archive.org')
      ? 'WAYBACK_MACHINE'
      : 'ARCHIVE_TODAY',
    isVerified,
    lastVerified: new Date()
  }
}

/**
 * Utility: Sleep function for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Check if URL is likely to be paywalled
 */
export function isLikelyPaywalled(url: string): boolean {
  const paywallDomains = [
    'nytimes.com',
    'wsj.com',
    'ft.com',
    'economist.com',
    'thetimes.co.uk',
    'telegraph.co.uk'
  ]

  return paywallDomains.some(domain => url.includes(domain))
}

/**
 * Priority scoring for archival (higher = more urgent)
 */
export function calculateArchivalPriority(sourceData: {
  sourceType?: string
  credibilityLevel?: string
  publishDate?: Date
  isPaywalled?: boolean
}): number {
  let priority = 5 // Default

  // Primary sources are highest priority
  if (sourceData.sourceType === 'PRIMARY') priority += 5

  // High credibility sources are important
  if (sourceData.credibilityLevel === 'VERY_HIGH' || sourceData.credibilityLevel === 'HIGH') {
    priority += 3
  }

  // Recent sources need archiving quickly
  if (sourceData.publishDate) {
    const daysSincePublish = Math.floor(
      (Date.now() - sourceData.publishDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSincePublish < 7) priority += 4
    else if (daysSincePublish < 30) priority += 2
  }

  // Paywalled content is more likely to disappear
  if (sourceData.isPaywalled) priority += 3

  return Math.min(priority, 10) // Cap at 10
}
