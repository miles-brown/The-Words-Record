# Verification & Quality Control System

This document describes the comprehensive verification, citation, and quality control system for The Words Record database.

---

## 🎯 Core Principles

### 1. **Every Statement MUST Have Verified Sources**
- Minimum 2 authoritative sources attributing the quote to the person
- Sources must be from credible publishers (major news, academic, government)
- Each source must explicitly name the person as the speaker

### 2. **Harvard-Style Citations Are Mandatory**
- All sources formatted in proper Harvard referencing style
- Includes: Author, Year, Title, Publication, Date, URL, Access Date
- Different formats for: news, social media, books, academic papers, video

### 3. **All URLs Must Be Archived**
- Every source URL saved to Internet Archive (Wayback Machine)
- Archive URL stored in database for permanent reference
- Automatic re-archiving if original disappears

### 4. **No Misattributed Quotes**
- Web searches verify every quote
- Quotes without sources are flagged for removal
- Disputed quotes marked clearly

---

## 📚 System Components

### Harvard Citation System
**File:** `lib/harvard-citation.ts`

Formats citations according to Harvard referencing standards:

```typescript
// Example: News Article
"Smith, J. (2024) 'Breaking News on Israel-Palestine', The Guardian, 15 March. Available at: https://... (Accessed: 16 March 2024)."

// Example: Social Media
"Netanyahu, B. (2024) 'Statement on Gaza', X (Twitter), 10 October. Available at: https://... (Accessed: 11 October 2024)."

// Example: Academic Paper
"Finkelstein, N. (2005) 'Beyond Chutzpah', Journal of Palestine Studies, 34(2). DOI: 10.1525/jps.2005.34.2.123"
```

**Functions:**
- `generateHarvardCitation()` - Create properly formatted citation
- `extractCitationFromURL()` - Auto-extract metadata from web pages
- `validateCitation()` - Check citation format compliance
- `parseInformalCitation()` - Convert raw URLs to structured data

### Internet Archive Integration
**File:** `lib/archive-service.ts`

Automatically archives all source URLs:

```typescript
// Archive a URL
const result = await saveToWaybackMachine('https://example.com/article')
console.log(result.archiveUrl) // https://web.archive.org/web/...

// Batch archive multiple URLs
const results = await batchArchiveURLs(urls, 2000) // 2s delay between requests

// Verify archive is still accessible
const isLive = await verifyArchiveURL(archiveUrl)
```

**Features:**
- Primary: Wayback Machine (web.archive.org)
- Backup: archive.today (if Wayback fails)
- Automatic duplicate detection (checks if already archived)
- Prioritization system (high-value sources archived first)
- Paywall detection (prioritizes paywalled content)

---

## 🔍 Verification Scripts

### 1. Verify All Statements
**File:** `scripts/verify-all-statements.ts`

**Purpose:** Validate EVERY statement in the database

**What it does:**
1. Searches web for the exact quote text
2. Finds at least 2 authoritative sources
3. Verifies sources explicitly attribute quote to person
4. Creates Harvard-style citations
5. Archives all source URLs
6. Updates statement verification status
7. Flags unverifiable statements

**Usage:**
```bash
# Dry run (no changes)
npx tsx scripts/verify-all-statements.ts --dry-run

# Verify first 10 statements
npx tsx scripts/verify-all-statements.ts --limit=10

# Verify ALL statements (updates database)
npx tsx scripts/verify-all-statements.ts
```

**Output:**
- ✅ VERIFIED: 2+ credible sources found
- ⚠️ WARNING: Only 1 source found or low credibility
- ❌ CRITICAL: No sources found (flagged for manual review)

**Example Report:**
```
VERIFICATION SUMMARY
====================
Total processed:     150
✅ Verified:          120
❌ Unverified:        25
⚠️  With warnings:    5

⚠️  STATEMENTS REQUIRING MANUAL REVIEW (25):

1. John Doe
   Quote: "I never said that..."
   Issue: No sources found
```

### 2. Fix Nationalities
**File:** `scripts/fix-nationalities.ts`

**Purpose:** Standardize nationality fields

**Problems it fixes:**
- ❌ ALL CAPS: "UNITED STATES" → ✅ "United States"
- ❌ Abbreviations: "US" → ✅ "USA"
- ❌ Adjectives: "British" → ✅ "UK"
- ❌ Regions: "England" → ✅ "UK"

**Usage:**
```bash
# Dry run (see what would change)
npx tsx scripts/fix-nationalities.ts --dry-run

# Apply fixes
npx tsx scripts/fix-nationalities.ts
```

**Example:**
```
[DRY RUN] Would update John Smith:
  Old: UNITED STATES / []
  New: USA / [USA, UK]  (dual citizenship)
```

### 3. Enrich Missing Fields
**File:** `scripts/enrich-missing-fields.ts`

**Purpose:** Fill in missing Person data using Claude API

**Fields enriched:**
- Nationality
- Date of birth
- Religion & denomination
- Political party affiliation
- Political beliefs/ideology

**Usage:**
```bash
# Dry run on 10 people
npx tsx scripts/enrich-missing-fields.ts --dry-run --limit=10

# Enrich all people with missing fields
npx tsx scripts/enrich-missing-fields.ts
```

**How it works:**
1. Identifies people with missing fields
2. Queries Claude API with focused questions (3-4 fields at a time)
3. Validates responses for accuracy
4. Provides confidence scores (high/medium/low)
5. Stores source URLs in internal notes
6. Only updates if confidence is acceptable

**Example:**
```
[3/50] Jeremy Corbyn
  🔍 Querying for: religion, religionDenomination, politicalParty
  ✅ Enriched (confidence: high)
    Religion: Jewish
    Denomination: Secular
    Party: Labour Party (1983-2020)
```

---

## 🚀 Enhanced AI Generator

### Updated Features

The AI incident generator has been enhanced with:

#### 1. **Harvard Citation Requirements**

The AI prompt now requires:
```
For each source, provide:
- Author: [Last name, First initial]
- Year: [YYYY]
- Title: [Article title]
- Publication: [Publisher name]
- Date: [DD Month YYYY]
- URL: [Full URL]
```

#### 2. **Source Verification**

Before importing:
- Validates citation format
- Checks URLs are accessible
- Archives each URL to Internet Archive
- Verifies quote appears in source

#### 3. **Quality Gates**

Statements are only imported if:
- At least 2 sources provided
- Citations properly formatted
- URLs accessible and archived
- Person is explicitly named in sources

---

## 📋 Recommended Workflow

### For New Statements

```bash
# Step 1: Generate with AI (includes citations)
npx tsx scripts/ai-incident-generator.ts "Person Name" --auto-import

# Step 2: Verify immediately
npx tsx scripts/verify-all-statements.ts --limit=1

# Step 3: Archive sources
# (Automatic in verify script)
```

### For Existing Database

```bash
# Step 1: Fix nationalities
npx tsx scripts/fix-nationalities.ts

# Step 2: Enrich missing fields
npx tsx scripts/enrich-missing-fields.ts --limit=50

# Step 3: Verify all statements
npx tsx scripts/verify-all-statements.ts

# Step 4: Review flagged statements
# Check output for statements that couldn't be verified
```

### Daily Maintenance

```bash
# Verify recent additions (last 24 hours)
npx tsx scripts/verify-all-statements.ts --since=24h

# Re-verify old sources (check for dead links)
npx tsx scripts/verify-all-statements.ts --reverify-old

# Archive any unarchived URLs
npx tsx scripts/archive-missing-sources.ts
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Required for verification
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Database
DATABASE_URL=postgresql://...

# Optional: Custom archive service
ARCHIVE_SERVICE_URL=https://custom-archive.org
```

### Rate Limiting

To avoid API limits:

```typescript
// In verify-all-statements.ts
const DELAY_BETWEEN_SEARCHES = 3000 // 3 seconds

// In archive-service.ts
const DELAY_BETWEEN_ARCHIVES = 2000 // 2 seconds
```

---

## 📊 Quality Metrics

### Database Health Check

```sql
-- Statements without sources
SELECT COUNT(*) FROM "Statement" WHERE id NOT IN (
  SELECT DISTINCT "statementId" FROM "Source" WHERE "statementId" IS NOT NULL
);

-- Statements not verified
SELECT COUNT(*) FROM "Statement" WHERE "verificationLevel" = 'UNVERIFIED';

-- Sources without archive URLs
SELECT COUNT(*) FROM "Source" WHERE "archiveUrl" IS NULL;

-- Sources with broken archives
SELECT COUNT(*) FROM "Source" WHERE "isArchived" = false;
```

### Quality Targets

| Metric | Target | Current |
|--------|--------|---------|
| Statements with 2+ sources | >95% | Run verification |
| Verified statements | >90% | Run verification |
| Harvard-formatted citations | 100% | Run verification |
| Archived sources | 100% | Run archiving |
| Broken archive links | <5% | Run re-archiving |

---

## 🚨 Handling Problem Cases

### Statement Can't Be Verified

```bash
# Flag for manual review
npx tsx scripts/flag-unverified.ts

# Or delete if clearly false
npx tsx scripts/delete-statement.ts --id=STATEMENT_ID --reason="No sources found"
```

### Source URL Dead

```bash
# Re-archive from Wayback Machine
npx tsx scripts/recover-from-archive.ts --source-id=SOURCE_ID

# Or find alternative source
npx tsx scripts/find-alternative-source.ts --statement-id=STATEMENT_ID
```

### Misattributed Quote

```bash
# Update attribution
npx tsx scripts/correct-attribution.ts --statement-id=STATEMENT_ID --correct-person="Actual Name"

# Or delete if completely wrong
npx tsx scripts/delete-statement.ts --id=STATEMENT_ID --reason="Misattributed"
```

---

## 📈 Monitoring

### Automated Checks

Set up cron jobs:

```bash
# Daily: Verify new statements
0 2 * * * cd /path/to/project && npx tsx scripts/verify-all-statements.ts --since=24h

# Weekly: Re-verify random sample
0 3 * * 0 cd /path/to/project && npx tsx scripts/verify-all-statements.ts --random-sample=100

# Monthly: Check all archive links
0 4 1 * * cd /path/to/project && npx tsx scripts/verify-archives.ts
```

### Quality Dashboard

```bash
# Generate quality report
npx tsx scripts/quality-report.ts

# Output:
# ✅ 95% of statements verified
# ✅ 98% of sources archived
# ⚠️  12 statements need manual review
# ❌ 3 broken archive links
```

---

## 🛡️ Best Practices

### DO:
✅ Verify every new statement immediately
✅ Archive sources as soon as added
✅ Use Harvard citations for all sources
✅ Require minimum 2 sources per statement
✅ Check sources explicitly name the speaker
✅ Store archive URLs in database
✅ Re-verify old statements periodically

### DON'T:
❌ Import statements without sources
❌ Use raw URLs without Harvard formatting
❌ Skip archiving "because it's a big website"
❌ Accept single-source statements
❌ Trust AI-generated quotes without verification
❌ Leave broken links in database

---

## 📞 Troubleshooting

### "No sources found" for well-known quote

**Likely cause:** Quote is paraphrased or taken out of context

**Solution:**
1. Search for the actual wording used in media
2. Update statement content to match verified sources
3. Add context field explaining discrepancy

### Archive.org rate limiting

**Symptom:** `HTTP 429 Too Many Requests`

**Solution:**
```typescript
// Increase delay in archive-service.ts
const DELAY_BETWEEN_ARCHIVES = 5000 // 5 seconds instead of 2
```

### Claude API costs too high

**Solution:**
```bash
# Process in smaller batches
npx tsx scripts/verify-all-statements.ts --limit=20

# Use caching (automatic in latest version)
# Claude caches system prompts to reduce costs
```

---

## 📚 Additional Resources

- **Harvard Referencing Guide:** https://www.mendeley.com/guides/harvard-citation-guide
- **Internet Archive API:** https://archive.org/help/wayback_api.php
- **Citation Style Examples:** See `lib/harvard-citation.ts` for full examples
- **Anthropic API Docs:** https://docs.anthropic.com/

---

## 🎯 Success Criteria

Your database is high-quality when:

1. ✅ **Every statement has 2+ verified sources**
2. ✅ **All sources have Harvard-style citations**
3. ✅ **All URLs are archived to Internet Archive**
4. ✅ **No misattributed quotes**
5. ✅ **Person fields properly standardized**
6. ✅ **Missing fields enriched with high confidence**
7. ✅ **Regular verification runs detect issues early**

---

**Remember:** Quality over quantity. Better to have 500 fully verified, properly sourced statements than 5,000 questionable ones.
