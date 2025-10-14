# Priority 3 API Endpoints - Complete Documentation

## Overview

This document provides comprehensive documentation for all Priority 3 API endpoints, including usage examples, query parameters, response formats, and best practices.

---

## 1. Case History API

**Endpoint:** `GET /api/cases/[slug]/history`

### Description
Retrieves the complete modification history for a case, including all actions, changes, and audit trail information.

### Path Parameters
- `slug` (string, required) - The unique slug identifier for the case

### Response Format
```typescript
{
  history: Array<{
    id: string
    caseId: string
    actionType: CaseHistoryAction
    actionBy: string
    actionAt: string (ISO 8601)
    reason?: string
    previousValue?: string
    newValue?: string
    metadata?: Record<string, any>
  }>
}
```

### Action Types
- `CREATED` - Case was created
- `PROMOTED_FROM_STATEMENT` - Case was promoted from a statement
- `STATUS_CHANGED` - Case status was modified
- `VISIBILITY_CHANGED` - Visibility settings changed
- `STATEMENT_LINKED` - Statement was linked to case
- `ARCHIVED` / `UNARCHIVED` - Case archived/restored
- `LOCKED` - Case locked for editing
- `FEATURED` - Case featured on homepage
- `PERSON_ADDED` / `PERSON_REMOVED` - Person associations changed
- `ORGANIZATION_ADDED` / `ORGANIZATION_REMOVED` - Organization associations changed
- `TAG_ADDED` / `TAG_REMOVED` - Tag associations changed

### Example Request
```bash
curl https://your-domain.com/api/cases/jan-6-capitol-riot/history
```

### Example Response
```json
{
  "history": [
    {
      "id": "clx123abc",
      "caseId": "clx456def",
      "actionType": "STATUS_CHANGED",
      "actionBy": "admin@example.com",
      "actionAt": "2025-01-15T10:30:00Z",
      "reason": "Case verified by fact-checking team",
      "previousValue": "DOCUMENTED",
      "newValue": "VERIFIED"
    },
    {
      "id": "clx789ghi",
      "caseId": "clx456def",
      "actionType": "PROMOTED_FROM_STATEMENT",
      "actionBy": "system",
      "actionAt": "2025-01-10T08:15:00Z",
      "reason": "Promoted from statement clx999jkl",
      "metadata": {
        "originatingStatementId": "clx999jkl"
      }
    }
  ]
}
```

### Error Responses
- `400` - Invalid slug format
- `404` - Case not found
- `500` - Server error

---

## 2. Statement Qualification API

**Endpoint:** `GET /api/statements/[id]/qualification`

### Description
Calculates the qualification score for a statement to determine if it meets the criteria to be promoted to a case.

### Path Parameters
- `id` (string, required) - The unique ID of the statement

### Qualification Criteria
1. **Response Count** (25 points) - Statement has 2+ notable responses
2. **Media Coverage** (30 points) - Covered by 3+ media outlets
3. **Repercussions** (30 points) - Has documented consequences
4. **Public Reaction** (15 points) - High public engagement (10,000+ views)

**Threshold:** Must score ≥50 points AND meet ≥2 criteria

### Response Format
```typescript
{
  hasPublicReaction: boolean
  responseCount: number
  mediaOutletCount: number
  hasRepercussion: boolean
  score: number  // 0-100
  meetsThreshold: boolean
  reasons: string[]
}
```

### Example Request
```bash
curl https://your-domain.com/api/statements/clx123abc/qualification
```

### Example Response
```json
{
  "hasPublicReaction": true,
  "responseCount": 5,
  "mediaOutletCount": 4,
  "hasRepercussion": true,
  "score": 100,
  "meetsThreshold": true,
  "reasons": [
    "5 responses from notable people",
    "Covered by 4 media outlets",
    "Has 2 documented repercussion(s)",
    "High public engagement"
  ]
}
```

### Use Cases
- **Automated Promotion:** Check eligibility before auto-promoting statements
- **Dashboard Widget:** Show qualification progress on statement pages
- **Moderation Queue:** Identify statements ready for review

### Error Responses
- `400` - Invalid statement ID
- `404` - Statement not found
- `500` - Server error

---

## 3. Analytics API (Enhanced)

**Endpoint:** `GET /api/analytics`

### Description
Provides comprehensive analytics and metrics about the platform, including people, organizations, statements, cases, and activity trends.

### Query Parameters
None (future versions may add date range filtering)

### Response Format
```typescript
{
  // People Analytics
  peopleByProfession: Array<{ profession: string, count: number }>
  peopleByNationality: Array<{ nationality: string, count: number }>
  peopleByInfluence: Array<{ level: string, count: number }>
  controversyDistribution: Array<{ range: string, count: number }>
  socialMediaReach: Array<{ platform: string, totalReach: number }>

  // Organization Analytics
  orgsByType: Array<{ type: string, count: number }>
  orgsByRegion: Array<{ region: string, count: number }>
  casesByCountry: Array<{ country: string, count: number }>

  // Timeline & Activity
  activityTimeline: Array<{ month: string, statements: number, responses: number }>
  statementVelocity: Array<{ date: string, count: number }>

  // Enhanced Metrics
  responseRate: {
    total: number
    withResponses: number
    percentage: number
  }
  verificationRate: {
    total: number
    verified: number
    unverified: number
    percentage: number
  }
  caseStatistics: {
    total: number
    realCases: number
    promotedStatements: number
  }
  topMediaOutlets: Array<{ publication: string, count: number }>

  // Rankings
  mostInfluential: Array<{ name: string, score: number, type: 'Person' | 'Organization' }>
  mostControversial: Array<{ name: string, score: number, type: 'Person' }>
  mostActive: Array<{ name: string, count: number, type: 'Person' | 'Organization' }>
}
```

### Example Request
```bash
curl https://your-domain.com/api/analytics
```

### Enhanced Metrics Explained

#### Response Rate
Percentage of original statements that received at least one response from notable people.
- **High rate (>40%):** Indicates controversial or impactful statements
- **Low rate (<20%):** May indicate low engagement or less notable speakers

#### Verification Rate
Percentage of statements that have been fact-checked and verified.
- **Target:** 80%+ verification rate for credibility
- **Monitor:** Trends over time to ensure quality control

#### Statement Velocity
Daily statement count over the last 30 days showing activity trends.
- **Use for:** Capacity planning, identifying viral events
- **Anomalies:** Spikes indicate major events or controversies

#### Top Media Outlets
Most frequently cited news sources.
- **Use for:** Partnership opportunities, source diversity analysis
- **Quality indicator:** Presence of reputable outlets

### Performance Considerations
- **Caching:** Response is cached for 5 minutes (future implementation)
- **Query time:** ~2-3 seconds for large datasets
- **Best practice:** Poll no more than once per minute

### Error Responses
- `405` - Method not allowed (only GET supported)
- `500` - Server error

---

## 4. Tags API (Enhanced)

**Endpoint:** `GET /api/tags`

### Description
Retrieves a filterable, sortable, paginated list of tags with optional alias information.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | TagCategory | none | Filter by tag category |
| `sort` | string | `name` | Sort field: `name`, `usageCount`, `controversyScore`, `createdAt` |
| `order` | string | `asc` | Sort order: `asc` or `desc` |
| `page` | number | `1` | Page number (min: 1) |
| `limit` | number | `50` | Items per page (min: 1, max: 200) |
| `includeAliases` | boolean | `false` | Include tag aliases in response |
| `search` | string | none | Search in tag name or description |

### Tag Categories
- `TOPIC` - Subject matter tags (e.g., "climate-change", "immigration")
- `LOCATION` - Geographic tags (e.g., "middle-east", "washington-dc")
- `SENTIMENT` - Tone tags (e.g., "controversial", "bipartisan")
- `EVENT` - Specific events (e.g., "jan-6-attack")
- `POLICY` - Policy areas (e.g., "healthcare", "foreign-policy")
- `PERSON_TYPE` - Role classifications (e.g., "politician", "activist")
- `MEDIA` - Media-related (e.g., "press-conference", "social-media")
- `OTHER` - Miscellaneous

### Response Format
```typescript
{
  tags: Array<{
    id: string
    name: string
    slug: string
    category: TagCategory
    description?: string
    color?: string
    icon?: string
    isControversial: boolean
    controversyScore?: number
    usageCount: number
    _count: {
      cases: number
      aliases: number
    }
    aliases?: Array<{
      alias: string
      aliasType: string
      language?: string
    }>
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  filters: {
    category: TagCategory | null
    sort: string
    order: 'asc' | 'desc'
    search: string | null
  }
}
```

### Example Requests

#### Basic Usage
```bash
curl "https://your-domain.com/api/tags"
```

#### Filter by Category
```bash
curl "https://your-domain.com/api/tags?category=TOPIC"
```

#### Sort by Usage Count
```bash
curl "https://your-domain.com/api/tags?sort=usageCount&order=desc&limit=20"
```

#### Search with Pagination
```bash
curl "https://your-domain.com/api/tags?search=israel&page=1&limit=10"
```

#### Include Aliases
```bash
curl "https://your-domain.com/api/tags?includeAliases=true&category=LOCATION"
```

#### Complex Query
```bash
curl "https://your-domain.com/api/tags?category=TOPIC&sort=controversyScore&order=desc&page=2&limit=25&includeAliases=true"
```

### Example Response
```json
{
  "tags": [
    {
      "id": "clx123abc",
      "name": "Israel-Palestine Conflict",
      "slug": "israel-palestine-conflict",
      "category": "TOPIC",
      "description": "Statements related to the ongoing Israeli-Palestinian conflict",
      "color": "#d32f2f",
      "icon": "🇮🇱🇵🇸",
      "isControversial": true,
      "controversyScore": 95,
      "usageCount": 234,
      "_count": {
        "cases": 234,
        "aliases": 5
      },
      "aliases": [
        {
          "alias": "Gaza Conflict",
          "aliasType": "COMMON",
          "language": "en"
        },
        {
          "alias": "Mideast Crisis",
          "aliasType": "HISTORICAL",
          "language": "en"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 156,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "filters": {
    "category": "TOPIC",
    "sort": "controversyScore",
    "order": "desc",
    "search": null
  }
}
```

### Use Cases

#### Tag Cloud Widget
```bash
# Get top 50 tags by usage
curl "https://your-domain.com/api/tags?sort=usageCount&order=desc&limit=50"
```

#### Controversy Dashboard
```bash
# Get most controversial tags
curl "https://your-domain.com/api/tags?sort=controversyScore&order=desc&limit=20"
```

#### Tag Autocomplete
```bash
# Search as user types
curl "https://your-domain.com/api/tags?search=clim&limit=10"
```

#### Category Explorer
```bash
# Browse location tags
curl "https://your-domain.com/api/tags?category=LOCATION&sort=usageCount&order=desc"
```

### Performance Tips
- Use pagination for large result sets
- Set appropriate `limit` values (default 50 is optimal for most use cases)
- Enable `includeAliases` only when needed (adds ~20% query time)
- Cache results on client side for frequently accessed pages

### Error Responses
- `400` - Invalid query parameters
- `405` - Method not allowed (only GET supported)
- `500` - Server error with details in development mode

---

## Best Practices

### Authentication
Currently, these endpoints are public. Future implementations will add:
- Rate limiting (100 requests/minute per IP)
- API key authentication for high-volume users
- JWT authentication for admin-only endpoints

### Caching
Recommended caching strategies:
- **Analytics:** 5 minutes (data changes infrequently)
- **Tags:** 15 minutes (tags rarely change)
- **Case History:** 1 minute (updates are relatively rare)
- **Statement Qualification:** No cache (real-time scoring required)

### Error Handling
All endpoints follow consistent error format:
```json
{
  "error": "Human-readable error message",
  "details": "Technical details (development mode only)"
}
```

### Pagination Best Practices
1. Always check `hasNextPage` before fetching next page
2. Use `totalPages` for pagination UI
3. Don't exceed `limit=200` (performance impact)
4. Cache frequently accessed pages

### Rate Limiting (Future)
Endpoints will be rate-limited as follows:
- Analytics: 60 requests/hour
- Tags: 300 requests/hour
- Case History: 180 requests/hour
- Statement Qualification: 120 requests/hour

---

## Changelog

### Version 2.0.0 (2025-01-15)
**Analytics API**
- ✅ Fixed connection pool issue (now uses singleton PrismaClient)
- ✅ Removed placeholder data
- ✅ Added `responseRate` metric (% statements with responses)
- ✅ Added `verificationRate` metric (% verified statements)
- ✅ Added `caseStatistics` (real cases vs promoted statements)
- ✅ Added `topMediaOutlets` (most cited publications)
- ✅ Added `statementVelocity` (30-day activity chart)
- ✅ Added `orgsByRegion` (organization geographic distribution)
- ✅ Added `casesByCountry` (case geographic distribution)

**Tags API**
- ✅ Added filtering by `category`
- ✅ Added sorting by `name`, `usageCount`, `controversyScore`, `createdAt`
- ✅ Added pagination with `page` and `limit`
- ✅ Added `includeAliases` option
- ✅ Added search functionality
- ✅ Enhanced response with pagination metadata

### Version 1.0.0 (Initial Release)
- Case History API
- Statement Qualification API
- Analytics API (basic)
- Tags API (basic)

---

## Support

For questions or issues:
- GitHub Issues: [Link to repo]
- Documentation: [Link to docs]
- Email: support@example.com

---

**Last Updated:** January 15, 2025
**API Version:** 2.0.0
**Status:** Production Ready ✅
