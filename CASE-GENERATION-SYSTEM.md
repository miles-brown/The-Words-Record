# Case Auto-Generation & AI Enrichment System

## Overview

This system automatically identifies high-engagement statements and promotes them to full Case pages with comprehensive, Wikipedia-style documentation generated using Claude AI.

## Architecture

### Phase 1: Auto-Promotion (Multi-Factor Scoring)
Identifies statements worthy of case promotion based on engagement metrics.

### Phase 2: AI Enrichment (Claude API)
Generates comprehensive documentation with background, timeline, and multiple perspectives.

### Phase 3: Admin Review & Refinement
Admins can review, edit, and enhance AI-generated content before publication.

---

## Components

### 1. Auto-Promotion Script
**File:** [`scripts/auto-promote-statements.js`](scripts/auto-promote-statements.js)

**Purpose:** Scans all statements and promotes qualifying ones to case status.

**Criteria:**
- Response count (weight: 15 points per response)
- Media outlets (weight: 10 points per outlet)
- Article count (weight: 5 points per article)
- Social engagement (likes, shares, views)
- Repercussions (weight: 30 points if present)

**Configuration:** [`scripts/config/promotion-thresholds.json`](scripts/config/promotion-thresholds.json)

**Usage:**
```bash
# Dry run (see what would be promoted)
node scripts/auto-promote-statements.js --dry-run

# Actually promote qualifying statements
node scripts/auto-promote-statements.js

# View configuration
cat scripts/config/promotion-thresholds.json
```

**Output Example:**
```
📊 Qualification Results:
   Total statements: 476
   Qualifying (score ≥ 40): 12
   Already promoted: 5
   High priority (score ≥ 80): 3

📋 Qualifying Statements for Promotion:

1. Statement ID: abc123
   Case: elon-musk-twitter-advertisers
   Score: 85/100 ⭐ HIGH PRIORITY
   Metrics:
     - Responses: 8
     - Media Outlets: 5
     - Articles: 12
     - Social: 2500 likes, 800 shares, 15000 views
     - Repercussions: YES
   Content: "If somebody's gonna try to blackmail me with advertising..."
```

---

### 2. AI Enrichment Script
**File:** [`scripts/research-and-enrich-case.ts`](scripts/research-and-enrich-case.ts)

**Purpose:** Generates comprehensive, Wikipedia-style documentation using Claude API.

**What It Generates:**
- **Summary** (200-300 words): Concise overview
- **Description** (2000-4000 words): Comprehensive article with sections:
  - Background (what led to the statement)
  - The Statement (how, where, when it was made)
  - Immediate Reaction
  - Subsequent Developments
  - Repercussions and Consequences
  - Media Coverage and Public Discourse
  - Multiple Perspectives
  - Outcome and Current Status
- **Timeline**: Chronological list of events
- **Metadata**: Triggering event, outcome, media framing, original language

**Usage:**
```bash
# Enrich a single case
npx ts-node scripts/research-and-enrich-case.ts elon-musk-twitter-advertisers

# Dry run (see what data would be sent to Claude)
npx ts-node scripts/research-and-enrich-case.ts --dry-run some-case-slug

# Enrich all promoted cases
npx ts-node scripts/research-and-enrich-case.ts --all

# Force re-enrichment (even if already documented)
npx ts-node scripts/research-and-enrich-case.ts --force some-case-slug

# Help
npx ts-node scripts/research-and-enrich-case.ts --help
```

**Output Example:**
```
🤖 Sending data to Claude API for enrichment...
   (This may take 30-60 seconds)

✅ Claude API enrichment completed in 45.2s

📝 Generated Content:
   Summary: 1247 characters
   Description: 8523 characters
   Timeline events: 15
   Original language: en

💾 Updating case in database...
✅ Case updated successfully!

🔗 View at: /cases/elon-musk-twitter-advertisers
```

---

### 3. Claude API Wrapper
**File:** [`lib/claude-api.ts`](lib/claude-api.ts)

**Purpose:** Clean interface for interacting with Anthropic's Claude API.

**Key Functions:**
- `enrichCase(input: CaseEnrichmentInput)`: Main enrichment function
- `testConnection()`: Verify API key is working

**API Model:** `claude-3-5-sonnet-20241022`

---

### 4. Admin UI Integration
**Files:**
- [`pages/api/admin/cases/enrich.ts`](pages/api/admin/cases/enrich.ts) - API endpoint
- [`pages/admin/cases/[id].tsx`](pages/admin/cases/[id].tsx) - Admin interface

**Features:**
- **✨ AI Enrich** button in case editor
- Real-time enrichment progress
- Success/error notifications
- Auto-scroll to enriched content
- Force re-enrichment option

**User Flow:**
1. Admin opens case in editor
2. Clicks "✨ AI Enrich" button
3. Confirms action (30-60 second wait)
4. AI-generated content populates form
5. Admin reviews, edits, and saves

---

## Setup & Configuration

### Environment Variables

Add to your `.env` file:
```bash
# Required for AI enrichment
ANTHROPIC_API_KEY=sk-ant-xxxxx...

# Get your API key from: https://console.anthropic.com/
```

### Installation

All dependencies are already installed:
- `@anthropic-ai/sdk` (v0.67.0) - Claude API client
- `@prisma/client` - Database access

### Vercel Environment Setup

If using Vercel for production:
1. Go to Project Settings → Environment Variables
2. Add `ANTHROPIC_API_KEY` with your key
3. Redeploy

---

## Workflows

### Automated Workflow (Recommended)

**Step 1: Auto-Promote Qualifying Statements**
```bash
# Run weekly via cron or GitHub Actions
node scripts/auto-promote-statements.js
```

**Step 2: AI Enrich All New Cases**
```bash
# Run after promotion script
npx ts-node scripts/research-and-enrich-case.ts --all
```

**Step 3: Admin Review**
- Check `/admin/cases` for newly enriched cases
- Review AI-generated content
- Make any necessary edits
- Publish

### Manual Workflow

**Option A: From Admin UI**
1. Go to `/admin/cases/<id>`
2. Click "✨ AI Enrich" button
3. Review generated content
4. Save changes

**Option B: From Command Line**
```bash
# Promote a specific statement first
# (Find statement ID from database)

# Then enrich the resulting case
npx ts-node scripts/research-and-enrich-case.ts <case-slug>
```

---

## Configuration

### Promotion Thresholds

Edit [`scripts/config/promotion-thresholds.json`](scripts/config/promotion-thresholds.json):

```json
{
  "weights": {
    "responseCount": 15,      // Points per response
    "mediaOutlets": 10,       // Points per media outlet
    "articleCount": 5,        // Points per article
    "likes": 0.01,            // Points per like
    "shares": 0.02,           // Points per share
    "views": 0.0001,          // Points per view
    "hasRepercussions": 30    // Bonus if repercussions exist
  },
  "thresholds": {
    "minimumQualificationScore": 40,  // Min score to qualify
    "autoPromoteScore": 60,           // Auto-promote at this score
    "highPriorityScore": 80           // Flag as high priority
  }
}
```

**Example Calculations:**
- **Case A:** 5 responses, 2 outlets, 10 articles = (5×15) + (2×10) + (10×5) = **145 points** ⭐
- **Case B:** 3 responses, 1 outlet, 5 articles, with repercussions = (3×15) + (1×10) + (5×5) + 30 = **110 points** ⭐
- **Case C:** 2 responses only = (2×15) = **30 points** ❌ (below threshold)

### Claude API Settings

Edit [`lib/claude-api.ts`](lib/claude-api.ts) to customize:
- Model version
- Temperature (default: 0.3 for factual output)
- Max tokens (default: 8000)
- System prompt

---

## Monitoring & Maintenance

### Check Enrichment Status

```sql
-- Cases that need enrichment
SELECT slug, title, qualificationScore, isRealIncident
FROM "Case"
WHERE isRealIncident = true
  AND (description IS NULL OR LENGTH(description) < 1000)
ORDER BY qualificationScore DESC;

-- Recently enriched cases
SELECT slug, title, lastReviewedAt, lastReviewedBy
FROM "Case"
WHERE lastReviewedBy = 'AI_ENRICHMENT_SCRIPT'
ORDER BY lastReviewedAt DESC
LIMIT 10;
```

### Logs

Auto-promotion and enrichment scripts output detailed logs:
- Qualification scores and breakdown
- API call duration
- Generated content statistics
- Errors and warnings

### Rate Limiting

The enrichment script includes automatic rate limiting:
- 2-second delay between cases when using `--all`
- Claude API has generous rate limits (10 requests/min on paid plans)

---

## Troubleshooting

### "Failed to connect to Claude API"
**Solution:** Check your `ANTHROPIC_API_KEY` in `.env`

### "Case already has comprehensive documentation"
**Solution:** Use `--force` flag or set `force: true` in API call

### "No originating statement found"
**Solution:** Case needs to be properly promoted first with `isRealIncident = true`

### Generated content is too short/generic
**Solution:**
- Ensure statement has sufficient responses, sources, and repercussions
- Check that all related data is properly linked in database

### TypeScript compilation errors
**Solution:**
```bash
npm run build
# or
npx tsc --noEmit
```

---

## Cost Estimates

### Claude API Pricing (as of 2024)
- **Model:** claude-3-5-sonnet-20241022
- **Input:** ~$3 per million tokens
- **Output:** ~$15 per million tokens

### Per-Enrichment Cost
- Input: ~4,000 tokens × $0.003 = $0.012
- Output: ~3,000 tokens × $0.015 = $0.045
- **Total: ~$0.06 per case**

### Monthly Estimates
- 10 cases/month: ~$0.60
- 50 cases/month: ~$3.00
- 100 cases/month: ~$6.00

Very affordable for high-quality, comprehensive documentation.

---

## Future Enhancements

### Potential Additions:
1. **Auto-sourcing:** AI searches web for additional sources
2. **Fact-checking:** Verify claims against known databases
3. **Multilingual support:** Detect and translate non-English statements
4. **Related cases:** Auto-link to similar controversies
5. **Sentiment analysis:** Categorize public reaction
6. **SEO optimization:** Generate meta descriptions and keywords
7. **Image analysis:** If statement includes images, describe them

### Feedback Welcome
Found a bug or have a suggestion? Open an issue!

---

## Examples

### Example: High-Engagement Statement → Case

**Before (Statement Page):**
```
Content: "If somebody's gonna try to blackmail me with advertising..."
Responses: 8
Media Outlets: 5
Status: Statement only
```

**After Auto-Promotion:**
```
Title: Elon Musk's Response to Advertiser Exodus from X (2024)
Qualification Score: 85/100
Status: Promoted Case
```

**After AI Enrichment:**
```
Summary: On December 1, 2023, Elon Musk made controversial remarks...

Description:
## Background
Following allegations of antisemitism and hate speech proliferation...

## The Statement
During an interview at the New York Times DealBook Summit...

## Immediate Reaction
Major advertisers including Apple, Disney, and IBM...

[...8,000+ words of comprehensive documentation...]

## Timeline
- Nov 15, 2023: Initial controversy begins
- Nov 29, 2023: Advertisers pause spending
- Dec 1, 2023: Musk's statement at DealBook Summit
- Dec 5, 2023: Additional advertisers withdraw
- Dec 12, 2023: X files lawsuit against Media Matters
```

---

## Credits

- **AI Model:** Claude 3.5 Sonnet by Anthropic
- **Database:** PostgreSQL via Prisma
- **Framework:** Next.js 14
- **Type Safety:** TypeScript

---

## License

This feature is part of The Words Record project and follows the project's overall license.
