# JasPIZ Automated Harvester Guide

## Overview

The JasPIZ Harvester is a fully automated 12-hour ingestion pipeline that uses Claude API with extended thinking and web search to discover, extract, and store statements about:

- Jews
- Antisemitism
- Palestine
- Israel
- Zionism

It targets statements from politicians, diplomats, world leaders, public figures, celebrities, academics, activists, and faith leaders.

## Features

✅ **Autonomous Discovery** - Uses Claude's web search to find new statements
✅ **Structured Extraction** - Extracts all Person, Statement, Source, Organization, and Affiliation data
✅ **Complete Person Profiles** - Populates ALL Person schema fields on first insert
✅ **Archive Integration** - Automatically archives every source via Internet Archive
✅ **Deduplication** - SHA-1 hash-based duplicate detection
✅ **12-Hour Scheduling** - Runs automatically every 12 hours
✅ **Comprehensive Logging** - Detailed logs and batch reports
✅ **Error Resilience** - Graceful error handling with exponential backoff

## Quick Start

### 1. Prerequisites

Ensure you have:
- ✅ Node.js installed
- ✅ PostgreSQL database running
- ✅ `.env` configured with `ANTHROPIC_API_KEY` and `DATABASE_URL`

### 2. Run Single Cycle (Test)

```bash
npx tsx scripts/jasPIZ-harvester.ts --once
```

This will:
1. Search for new JasPIZ statements
2. Extract structured data
3. Archive sources via Internet Archive
4. Populate database with full Person profiles
5. Generate batch report
6. Exit

### 3. Run as Daemon (Production)

```bash
npx tsx scripts/jasPIZ-harvester.ts --daemon
```

This runs continuously with automatic 12-hour cycles.

## Cron Setup (Recommended)

For production, use cron instead of daemon mode:

```bash
crontab -e
```

Add:
```
0 */12 * * * cd /path/to/Who-Said-What && npx tsx scripts/jasPIZ-harvester.ts --once >> logs/cron.log 2>&1
```

This runs every 12 hours (midnight and noon).

## Systemd Service (Linux)

For production Linux servers:

```bash
# Copy service file
sudo cp jaspiz-harvester.service /etc/systemd/system/

# Edit paths in service file
sudo nano /etc/systemd/system/jaspiz-harvester.service

# Enable and start
sudo systemctl enable jaspiz-harvester
sudo systemctl start jaspiz-harvester

# Check status
sudo systemctl status jaspiz-harvester

# View logs
sudo journalctl -u jaspiz-harvester -f
```

## How It Works

### 1. Global Search Phase

Uses Claude API with extended thinking to search for:
- News articles from verified outlets
- Government websites and transcripts
- Parliamentary/Congressional records
- Think tank publications
- University statements
- Social media posts from verified accounts
- Interviews and speeches
- Press releases

Search focuses on statements from the past 6 months.

### 2. Extraction Phase

For each discovered source, Claude extracts:

**Person Data** (ALL fields populated):
- Basic: name, slug, fullName, firstName, lastName
- Professional: profession, professionDetail, currentTitle, currentOrganization
- Demographic: nationality, nationalityDetail, gender
- Political: politicalAffiliation, politicalLeaning
- Biography: bio, shortBio
- Dates: birthDate (if available)

**Statement Data**:
- content (exact quote)
- context (what was happening)
- date, language, tone
- medium (e.g., TWITTER_X, PRESS_CONFERENCE)
- platform, topics, tags

**Source Data**:
- url, title, publisher
- publishDate, author
- sourceType, contentType
- credibilityRating

**Organization Data**:
- name, slug, type
- description, website

**Affiliation Data**:
- organizationName, role
- startDate, endDate, isActive

### 3. Archival Phase

Each source URL is archived via Internet Archive:
- Calls `https://web.archive.org/save/{url}`
- Retrieves Wayback Machine URL
- Stores in `Source.archiveUrl`
- Sets `Source.isArchived = true`

### 4. Database Phase

All data is upserted with proper relations:

**Person Upsert Logic**:
- Check by `slug`
- On **create**: populate ALL fields from schema
  - Use empty string `""` for unknown String fields
  - Use empty array `[]` for list fields
  - Use `null` for explicitly nullable fields
  - Use schema defaults for enums (e.g., `UNVERIFIED`)
- On **update**: only change fields explicitly supplied

**Organization Upsert**:
- Check by `slug`
- Create or update with proper enum mappings

**Source Upsert**:
- Check by `url` (deduplicate)
- Include `archiveUrl` and `archiveDate`

**Statement Creation**:
- Compute SHA-1 hash of content
- Skip if duplicate hash exists
- Link to Person, Source, and Tags
- Track in logs for auditing

**Affiliation Creation**:
- Link Person ↔ Organization
- Include role, dates, and status

### 5. Deduplication

Prevents duplicate statements:
```typescript
SHA-1 hash = sha1(content.trim().toLowerCase())
```

If hash exists in database → skip and log.

### 6. Validation

- Enum values validated against Prisma schema
- Dates converted to ISO format
- Required fields enforced
- Malformed data logged and skipped

### 7. Logging

**Console + File Logging**:
- Location: `logs/ingestion.log`
- Format: `[timestamp] [level] message`
- Levels: INFO, WARN, ERROR

**Duplicate Logging**:
```json
{
  "timestamp": "2025-01-15T14:30:00Z",
  "reason": "duplicate_content",
  "hash": "abc123...",
  "contentPreview": "First 100 chars..."
}
```

### 8. Batch Reports

After each cycle, generates:
```
data/auto-generated/batch-reports/batch-{timestamp}.txt
```

Contains:
```
╔════════════════════════════════════════════════════════════════════════════╗
║                        JASPIZ INGESTION SUMMARY                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  Imported:            12 new statements                                    ║
║  Updated:              8 people                                            ║
║  Archived:            12 sources                                           ║
║  Skipped:              3 duplicates                                        ║
║  Errors:               1 failures                                          ║
║                                                                            ║
║  Duration:            45 seconds                                           ║
║  Started:             2025-01-15 12:00:00                                  ║
║  Completed:           2025-01-15 12:00:45                                  ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

## Configuration

### Environment Variables

Required in `.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
DATABASE_URL=postgresql://...
```

### Search Scope

Edit `JASPIZ_TOPICS` array in script:
```typescript
const JASPIZ_TOPICS = [
  'Jews',
  'antisemitism',
  'Palestine',
  'Israel',
  'Zionism',
  // Add more topics...
];
```

### Target Entities

Edit `TARGET_ENTITY_TYPES` array:
```typescript
const TARGET_ENTITY_TYPES = [
  'politicians',
  'diplomats',
  'world leaders',
  // Add more types...
];
```

### Rate Limiting

Adjust delay between API calls:
```typescript
// Line ~670
await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds
```

## Monitoring

### Check Logs

```bash
tail -f logs/ingestion.log
```

### Check Batch Reports

```bash
ls -lrt data/auto-generated/batch-reports/
cat data/auto-generated/batch-reports/batch-*.txt
```

### Check Database Stats

```bash
npx tsx scripts/check-db.ts
```

Or via Prisma Studio:
```bash
npm run db:studio
```

## Troubleshooting

### "No API key found"
Add `ANTHROPIC_API_KEY` to `.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### "Database connection failed"
Check `DATABASE_URL` in `.env` and verify PostgreSQL is running:
```bash
psql $DATABASE_URL -c "SELECT 1"
```

### "Archive API returned 429"
Internet Archive rate limit hit. Script automatically handles this gracefully - archived URL will be null but source is still saved.

### "Extraction error: Invalid JSON"
Claude's response couldn't be parsed. This is logged and skipped. Increase `max_tokens` if truncation is suspected.

### Rate limit errors from Anthropic
The script includes 2-second delays between API calls. If you still hit limits, increase the delay:
```typescript
await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds
```

### High memory usage
If processing large batches, restart the daemon periodically:
```bash
# In cron
0 0 * * * sudo systemctl restart jaspiz-harvester
```

## Cost Estimates

### Anthropic API Costs

**Claude 3.5 Sonnet**:
- Search: ~10,000 tokens input, ~8,000 tokens output = ~$0.15 per search
- Extraction: ~2,000 tokens input, ~2,000 tokens output = ~$0.03 per extraction
- **Per cycle**: ~20 extractions = ~$0.15 + ($0.03 × 20) = **~$0.75**
- **Per day** (2 cycles): **~$1.50**
- **Per month**: **~$45**

Actual costs may vary based on:
- Number of results found
- Complexity of extractions
- Use of extended thinking (adds ~10k tokens)

### Optimization Tips

1. **Reduce search frequency**: Use 24-hour cycles instead of 12-hour
2. **Limit search scope**: Reduce `JASPIZ_TOPICS` array
3. **Filter entities**: Narrow `TARGET_ENTITY_TYPES`
4. **Smaller model**: Use Claude 3 Haiku for extractions (10x cheaper)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     JasPIZ Harvester                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   1. Global Search (Claude API)       │
        │      - Web search for JasPIZ topics   │
        │      - Extended thinking enabled      │
        │      - Returns URLs + context         │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   2. Extraction (Claude API)          │
        │      - Parse each source              │
        │      - Extract structured JSON        │
        │      - Person, Statement, Source, etc │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   3. Deduplication (SHA-1)            │
        │      - Hash statement content         │
        │      - Check if exists in DB          │
        │      - Skip if duplicate              │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   4. Archival (Internet Archive)      │
        │      - POST to archive.org/save       │
        │      - Get Wayback Machine URL        │
        │      - Store in Source.archiveUrl     │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   5. Database Upsert (Prisma)         │
        │      - Upsert Person (all fields)     │
        │      - Upsert Organizations           │
        │      - Create Source (with archive)   │
        │      - Create Statement               │
        │      - Create Affiliations            │
        │      - Create Tags                    │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   6. Logging & Reporting              │
        │      - Write to logs/ingestion.log    │
        │      - Generate batch report          │
        │      - Save to batch-reports/         │
        └───────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │   7. Schedule Next Run (12 hours)     │
        └───────────────────────────────────────┘
```

## Integration with Existing Scripts

The harvester complements existing automation:

| Script | Purpose | Relation to Harvester |
|--------|---------|----------------------|
| `ai-incident-generator.ts` | Generate incidents for specific people | Manual targeted research |
| `batch-ai-generator.ts` | Batch process list of people | Manual batch import |
| **`jasPIZ-harvester.ts`** | **Autonomous discovery** | **Fully automated pipeline** |
| `comprehensive-population.ts` | Enrich existing Person records | Post-import enrichment |
| `verify-statements-batch.ts` | Verify statement authenticity | Post-import verification |
| `check-death-updates.ts` | Monitor person death status | Periodic maintenance |

### Recommended Workflow

1. **Automated discovery**: `jasPIZ-harvester.ts` runs every 12 hours
2. **Manual enrichment**: Run `comprehensive-population.ts` weekly
3. **Verification**: Run `verify-statements-batch.ts` monthly
4. **Maintenance**: Run `check-death-updates.ts` weekly

## Security Considerations

### API Key Protection
- Store in `.env` (never commit)
- Use read-only database user for harvester
- Rotate keys quarterly

### Rate Limiting
- Built-in 2-second delays between requests
- Exponential backoff on errors
- Respects API quotas

### Data Validation
- All inputs sanitized before DB insertion
- Enum values validated against schema
- SQL injection prevented by Prisma ORM

### Archive Integrity
- All sources archived before import
- Archive URLs stored permanently
- Verification possible via Wayback Machine

## Future Enhancements

Potential improvements:

1. **Multi-language support** - Extract statements in Arabic, Hebrew, French
2. **Sentiment analysis** - Auto-classify tone (supportive, critical, neutral)
3. **Relationship mapping** - Auto-detect connections between entities
4. **Image extraction** - Download and store person photos
5. **Social media integration** - Direct API access to Twitter, Facebook
6. **Real-time alerts** - Notify on high-profile statements
7. **Quality scoring** - Rate source credibility automatically
8. **Duplicate fuzzy matching** - Detect paraphrased duplicates
9. **Topic clustering** - Auto-categorize statements by sub-topic
10. **Export functionality** - Generate reports for external tools

## Compliance

### Data Collection
- Public data only (no private information)
- Respects robots.txt
- Archives via official Internet Archive API
- Complies with copyright fair use (quotation)

### Attribution
- All sources credited with URL
- Publisher and author tracked
- Publication date preserved

### Neutrality
- AI instructed to maintain strict neutrality
- No editorial bias in extraction
- Factual statements only

## Support

For issues or questions:
1. Check logs: `logs/ingestion.log`
2. Review batch reports: `data/auto-generated/batch-reports/`
3. Open GitHub issue with logs attached
4. Email: support@thewordsrecord.com

## License

Part of The Words Record project.
See main repository LICENSE file.

---

**Generated by**: Claude Code
**Last Updated**: 2025-01-15
**Version**: 1.0.0
