# API Integration Examples

Complete code examples for integrating with the Priority 3 APIs.

---

## Table of Contents
1. [JavaScript/TypeScript Examples](#javascripttypescript)
2. [React Hooks](#react-hooks)
3. [Python Examples](#python)
4. [cURL Examples](#curl)

---

## JavaScript/TypeScript

### 1. Case History API

```typescript
// types.ts
export interface CaseHistoryEntry {
  id: string
  caseId: string
  actionType: string
  actionBy: string
  actionAt: string
  reason?: string
  previousValue?: string
  newValue?: string
  metadata?: Record<string, any>
}

export interface CaseHistoryResponse {
  history: CaseHistoryEntry[]
}

// api.ts
export async function getCaseHistory(slug: string): Promise<CaseHistoryResponse> {
  const response = await fetch(`/api/cases/${slug}/history`)

  if (!response.ok) {
    throw new Error(`Failed to fetch case history: ${response.statusText}`)
  }

  return response.json()
}

// Usage
try {
  const { history } = await getCaseHistory('jan-6-capitol-riot')
  console.log(`Found ${history.length} history entries`)

  history.forEach(entry => {
    console.log(`[${entry.actionAt}] ${entry.actionType} by ${entry.actionBy}`)
  })
} catch (error) {
  console.error('Error:', error)
}
```

### 2. Statement Qualification API

```typescript
// types.ts
export interface QualificationCriteria {
  hasPublicReaction: boolean
  responseCount: number
  mediaOutletCount: number
  hasRepercussion: boolean
  score: number
  meetsThreshold: boolean
  reasons: string[]
}

// api.ts
export async function checkStatementQualification(
  statementId: string
): Promise<QualificationCriteria> {
  const response = await fetch(`/api/statements/${statementId}/qualification`)

  if (!response.ok) {
    throw new Error(`Failed to check qualification: ${response.statusText}`)
  }

  return response.json()
}

// Usage with eligibility check
async function evaluateStatement(statementId: string) {
  const criteria = await checkStatementQualification(statementId)

  console.log(`Score: ${criteria.score}/100`)
  console.log(`Eligible: ${criteria.meetsThreshold ? 'Yes' : 'No'}`)

  if (criteria.meetsThreshold) {
    console.log('✅ Statement qualifies for case promotion:')
    criteria.reasons.forEach(reason => console.log(`  - ${reason}`))
  } else {
    console.log('❌ Statement does not qualify yet')
    console.log(`Needs ${50 - criteria.score} more points`)
  }

  return criteria
}
```

### 3. Analytics API

```typescript
// types.ts
export interface AnalyticsData {
  peopleByProfession: Array<{ profession: string; count: number }>
  peopleByNationality: Array<{ nationality: string; count: number }>
  peopleByInfluence: Array<{ level: string; count: number }>
  controversyDistribution: Array<{ range: string; count: number }>
  socialMediaReach: Array<{ platform: string; totalReach: number }>
  orgsByType: Array<{ type: string; count: number }>
  orgsByRegion: Array<{ region: string; count: number }>
  casesByCountry: Array<{ country: string; count: number }>
  activityTimeline: Array<{ month: string; statements: number; responses: number }>
  statementVelocity: Array<{ date: string; count: number }>
  responseRate: { total: number; withResponses: number; percentage: number }
  verificationRate: { total: number; verified: number; unverified: number; percentage: number }
  caseStatistics: { total: number; realCases: number; promotedStatements: number }
  topMediaOutlets: Array<{ publication: string; count: number }>
  mostInfluential: Array<{ name: string; score: number; type: string }>
  mostControversial: Array<{ name: string; score: number; type: string }>
  mostActive: Array<{ name: string; count: number; type: string }>
}

// api.ts
let analyticsCache: { data: AnalyticsData; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getAnalytics(forceRefresh = false): Promise<AnalyticsData> {
  // Check cache
  if (!forceRefresh && analyticsCache) {
    const age = Date.now() - analyticsCache.timestamp
    if (age < CACHE_DURATION) {
      console.log('Returning cached analytics')
      return analyticsCache.data
    }
  }

  console.log('Fetching fresh analytics...')
  const response = await fetch('/api/analytics')

  if (!response.ok) {
    throw new Error(`Failed to fetch analytics: ${response.statusText}`)
  }

  const data = await response.json()

  // Update cache
  analyticsCache = { data, timestamp: Date.now() }

  return data
}

// Usage - Dashboard Summary
async function displayDashboardSummary() {
  const analytics = await getAnalytics()

  console.log('📊 Platform Statistics')
  console.log('═'.repeat(50))

  // Response Rate
  console.log(`\n📝 Response Rate: ${analytics.responseRate.percentage}%`)
  console.log(`   ${analytics.responseRate.withResponses}/${analytics.responseRate.total} statements received responses`)

  // Verification Rate
  console.log(`\n✅ Verification Rate: ${analytics.verificationRate.percentage}%`)
  console.log(`   ${analytics.verificationRate.verified}/${analytics.verificationRate.total} statements verified`)

  // Case Statistics
  console.log(`\n📁 Cases: ${analytics.caseStatistics.total} total`)
  console.log(`   Real Cases: ${analytics.caseStatistics.realCases}`)
  console.log(`   Promoted: ${analytics.caseStatistics.promotedStatements}`)

  // Top 5 Media Outlets
  console.log('\n📰 Top Media Outlets:')
  analytics.topMediaOutlets.slice(0, 5).forEach((outlet, i) => {
    console.log(`   ${i + 1}. ${outlet.publication} (${outlet.count} citations)`)
  })

  // Top 5 Most Active
  console.log('\n🔥 Most Active:')
  analytics.mostActive.slice(0, 5).forEach((entity, i) => {
    console.log(`   ${i + 1}. ${entity.name} - ${entity.count} statements (${entity.type})`)
  })
}
```

### 4. Tags API

```typescript
// types.ts
export interface Tag {
  id: string
  name: string
  slug: string
  category: string
  description?: string
  color?: string
  icon?: string
  isControversial: boolean
  controversyScore?: number
  usageCount: number
  _count: { cases: number; aliases: number }
  aliases?: Array<{ alias: string; aliasType: string; language?: string }>
}

export interface TagsResponse {
  tags: Tag[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  filters: {
    category: string | null
    sort: string
    order: string
    search: string | null
  }
}

export interface TagQueryParams {
  category?: string
  sort?: 'name' | 'usageCount' | 'controversyScore' | 'createdAt'
  order?: 'asc' | 'desc'
  page?: number
  limit?: number
  includeAliases?: boolean
  search?: string
}

// api.ts
export async function getTags(params: TagQueryParams = {}): Promise<TagsResponse> {
  const queryParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value))
    }
  })

  const url = `/api/tags?${queryParams.toString()}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch tags: ${response.statusText}`)
  }

  return response.json()
}

// Usage - Autocomplete Search
async function searchTags(searchTerm: string) {
  const { tags } = await getTags({
    search: searchTerm,
    limit: 10,
    sort: 'usageCount',
    order: 'desc'
  })

  return tags.map(tag => ({
    value: tag.id,
    label: tag.name,
    usageCount: tag.usageCount
  }))
}

// Usage - Tag Cloud
async function getTagCloud() {
  const { tags } = await getTags({
    sort: 'usageCount',
    order: 'desc',
    limit: 50
  })

  // Calculate relative sizes (1-5)
  const maxCount = Math.max(...tags.map(t => t.usageCount))

  return tags.map(tag => ({
    text: tag.name,
    value: tag.usageCount,
    size: Math.ceil((tag.usageCount / maxCount) * 4) + 1, // 1-5 range
    color: tag.color || '#3b82f6',
    controversial: tag.isControversial
  }))
}

// Usage - Paginated List
async function* paginateTags(category?: string) {
  let page = 1
  let hasMore = true

  while (hasMore) {
    const response = await getTags({
      category,
      page,
      limit: 50,
      sort: 'name',
      order: 'asc'
    })

    yield response.tags

    hasMore = response.pagination.hasNextPage
    page++
  }
}

// Usage example for pagination
async function processAllTopicTags() {
  for await (const tagBatch of paginateTags('TOPIC')) {
    console.log(`Processing batch of ${tagBatch.length} tags`)
    // Process batch
  }
}
```

---

## React Hooks

### Custom Hook: useCaseHistory

```tsx
import { useState, useEffect } from 'react'
import { CaseHistoryResponse } from './types'

export function useCaseHistory(slug: string) {
  const [data, setData] = useState<CaseHistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchHistory() {
      try {
        setLoading(true)
        const response = await fetch(`/api/cases/${slug}/history`)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (!cancelled) {
          setData(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchHistory()

    return () => {
      cancelled = true
    }
  }, [slug])

  return { data, loading, error }
}

// Usage in component
function CaseHistoryTimeline({ slug }: { slug: string }) {
  const { data, loading, error } = useCaseHistory(slug)

  if (loading) return <div>Loading history...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!data) return null

  return (
    <div className="timeline">
      {data.history.map(entry => (
        <div key={entry.id} className="timeline-entry">
          <time>{new Date(entry.actionAt).toLocaleString()}</time>
          <strong>{entry.actionType.replace(/_/g, ' ')}</strong>
          <span>by {entry.actionBy}</span>
          {entry.reason && <p>{entry.reason}</p>}
        </div>
      ))}
    </div>
  )
}
```

### Custom Hook: useAnalytics

```tsx
import { useState, useEffect } from 'react'
import { AnalyticsData } from './types'

export function useAnalytics(autoRefresh = false, intervalMs = 5 * 60 * 1000) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics')

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()

    if (autoRefresh) {
      const interval = setInterval(fetchAnalytics, intervalMs)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, intervalMs])

  return { data, loading, error, refetch: fetchAnalytics }
}

// Usage in component
function AnalyticsDashboard() {
  const { data, loading, error, refetch } = useAnalytics(true)

  if (loading && !data) return <div>Loading analytics...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!data) return null

  return (
    <div className="dashboard">
      <button onClick={refetch}>Refresh</button>

      <div className="stats-grid">
        <StatCard
          title="Response Rate"
          value={`${data.responseRate.percentage}%`}
          subtitle={`${data.responseRate.withResponses} of ${data.responseRate.total}`}
        />
        <StatCard
          title="Verification Rate"
          value={`${data.verificationRate.percentage}%`}
          subtitle={`${data.verificationRate.verified} verified`}
        />
        <StatCard
          title="Total Cases"
          value={data.caseStatistics.total}
          subtitle={`${data.caseStatistics.realCases} real cases`}
        />
      </div>

      <h3>Top Media Outlets</h3>
      <ul>
        {data.topMediaOutlets.slice(0, 10).map(outlet => (
          <li key={outlet.publication}>
            {outlet.publication} ({outlet.count} citations)
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Custom Hook: useTags

```tsx
import { useState, useEffect } from 'react'
import { TagsResponse, TagQueryParams } from './types'

export function useTags(params: TagQueryParams = {}) {
  const [data, setData] = useState<TagsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchTags() {
      try {
        setLoading(true)

        const queryParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value))
          }
        })

        const response = await fetch(`/api/tags?${queryParams}`)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (!cancelled) {
          setData(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchTags()

    return () => {
      cancelled = true
    }
  }, [JSON.stringify(params)]) // Stringify to handle object comparison

  return { data, loading, error }
}

// Usage in component - Tag Autocomplete
function TagAutocomplete() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data, loading } = useTags({
    search: searchTerm,
    limit: 10,
    sort: 'usageCount',
    order: 'desc'
  })

  return (
    <div className="autocomplete">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search tags..."
      />
      {loading && <div>Searching...</div>}
      {data && (
        <ul className="suggestions">
          {data.tags.map(tag => (
            <li key={tag.id}>
              {tag.icon && <span>{tag.icon}</span>}
              <span>{tag.name}</span>
              <small>({tag.usageCount} uses)</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

---

## Python

### Case History API

```python
import requests
from typing import List, Dict, Optional
from datetime import datetime

class CaseHistoryClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')

    def get_case_history(self, slug: str) -> List[Dict]:
        """Fetch case history for a given slug."""
        url = f"{self.base_url}/api/cases/{slug}/history"

        response = requests.get(url)
        response.raise_for_status()

        data = response.json()
        return data['history']

    def format_history_entry(self, entry: Dict) -> str:
        """Format a history entry for display."""
        action_time = datetime.fromisoformat(entry['actionAt'].replace('Z', '+00:00'))
        action_type = entry['actionType'].replace('_', ' ').title()

        parts = [
            f"[{action_time.strftime('%Y-%m-%d %H:%M:%S')}]",
            action_type,
            f"by {entry['actionBy']}"
        ]

        if entry.get('reason'):
            parts.append(f"- {entry['reason']}")

        return ' '.join(parts)

# Usage
client = CaseHistoryClient('https://your-domain.com')
history = client.get_case_history('jan-6-capitol-riot')

for entry in history:
    print(client.format_history_entry(entry))
```

### Analytics API

```python
import requests
from typing import Dict, List
from dataclasses import dataclass

@dataclass
class ResponseRate:
    total: int
    with_responses: int
    percentage: int

@dataclass
class AnalyticsSummary:
    response_rate: ResponseRate
    verification_percentage: int
    total_cases: int
    top_outlets: List[Dict]

class AnalyticsClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')

    def get_analytics(self) -> Dict:
        """Fetch complete analytics data."""
        url = f"{self.base_url}/api/analytics"

        response = requests.get(url, timeout=10)
        response.raise_for_status()

        return response.json()

    def get_summary(self) -> AnalyticsSummary:
        """Get a simplified summary of key metrics."""
        data = self.get_analytics()

        return AnalyticsSummary(
            response_rate=ResponseRate(
                total=data['responseRate']['total'],
                with_responses=data['responseRate']['withResponses'],
                percentage=data['responseRate']['percentage']
            ),
            verification_percentage=data['verificationRate']['percentage'],
            total_cases=data['caseStatistics']['total'],
            top_outlets=data['topMediaOutlets'][:5]
        )

# Usage
client = AnalyticsClient('https://your-domain.com')
summary = client.get_summary()

print(f"Response Rate: {summary.response_rate.percentage}%")
print(f"Verification Rate: {summary.verification_percentage}%")
print(f"Total Cases: {summary.total_cases}")
print("\nTop Media Outlets:")
for outlet in summary.top_outlets:
    print(f"  - {outlet['publication']}: {outlet['count']} citations")
```

---

## cURL

### Case History API

```bash
# Basic request
curl https://your-domain.com/api/cases/jan-6-capitol-riot/history

# Pretty print with jq
curl https://your-domain.com/api/cases/jan-6-capitol-riot/history | jq '.'

# Get only action types
curl https://your-domain.com/api/cases/jan-6-capitol-riot/history | jq '.history[].actionType'

# Count history entries
curl -s https://your-domain.com/api/cases/jan-6-capitol-riot/history | jq '.history | length'
```

### Statement Qualification API

```bash
# Check qualification
curl https://your-domain.com/api/statements/clx123abc/qualification

# Check if meets threshold
curl -s https://your-domain.com/api/statements/clx123abc/qualification | jq '.meetsThreshold'

# Get score
curl -s https://your-domain.com/api/statements/clx123abc/qualification | jq '.score'
```

### Analytics API

```bash
# Get full analytics
curl https://your-domain.com/api/analytics

# Get response rate
curl -s https://your-domain.com/api/analytics | jq '.responseRate'

# Get top 5 media outlets
curl -s https://your-domain.com/api/analytics | jq '.topMediaOutlets[:5]'

# Get verification percentage
curl -s https://your-domain.com/api/analytics | jq '.verificationRate.percentage'
```

### Tags API

```bash
# Basic request
curl https://your-domain.com/api/tags

# Filter by category
curl "https://your-domain.com/api/tags?category=TOPIC"

# Sort by usage count
curl "https://your-domain.com/api/tags?sort=usageCount&order=desc&limit=20"

# Search tags
curl "https://your-domain.com/api/tags?search=israel"

# Include aliases
curl "https://your-domain.com/api/tags?includeAliases=true"

# Complex query
curl "https://your-domain.com/api/tags?category=TOPIC&sort=controversyScore&order=desc&page=1&limit=25"

# Get pagination info
curl -s "https://your-domain.com/api/tags?page=2" | jq '.pagination'

# Get just tag names
curl -s https://your-domain.com/api/tags | jq '.tags[].name'
```

---

## Error Handling Best Practices

```typescript
async function robustApiCall<T>(
  fetcher: () => Promise<Response>,
  retries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetcher()

      if (!response.ok) {
        if (response.status >= 500 && i < retries - 1) {
          // Retry on server errors
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
          continue
        }

        const error = await response.json().catch(() => ({ error: response.statusText }))
        throw new Error(error.error || 'Request failed')
      }

      return response.json()
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }

  throw new Error('Max retries exceeded')
}

// Usage
const analytics = await robustApiCall<AnalyticsData>(
  () => fetch('/api/analytics'),
  3,
  1000
)
```

---

**Last Updated:** January 15, 2025
