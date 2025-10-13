# Auto-Promotion System Documentation

## Overview

The auto-promotion system automatically elevates statements to full case status when they meet specific criteria, ensuring that high-impact statements with significant response activity are properly categorized as multi-statement cases.

## Promotion Pathways

### 1. Automatic Promotion (Response Threshold)

**Criteria:** Statements with **MORE THAN 2 responses** (>2)

When a statement receives more than 2 response statements, it automatically qualifies for promotion to case status. This indicates the statement has generated significant discussion, reactions, or controversy.

**Process:**
1. System scans all statements
2. Counts response statements for each
3. Identifies statements with >2 responses
4. Automatically promotes to case status
5. Sets the original statement as the principal/originating statement

**Example:**
```
Original Statement by Person A
├─ Response 1 by Person B
├─ Response 2 by Organization X
└─ Response 3 by Person C
    └─ TRIGGERS AUTO-PROMOTION → Becomes a Case
```

### 2. Manual Promotion (Admin-Selected)

**Criteria:** Admin selects a statement in the admin console

An admin can manually promote any statement to case status, regardless of response count. This is useful for:
- Statements that are culturally/historically significant
- High-profile statements that deserve case status
- Breaking news that will likely generate responses
- Editorial decisions based on impact assessment

**Process:**
1. Admin reviews statement in admin console
2. Clicks "Promote to Case" button
3. Statement becomes the principal statement of a new case
4. System records manual promotion metadata

## Database Schema

### Case Model Fields

```prisma
model Case {
  // Principal Statement Tracking
  originatingStatementId  String?     // ID of the statement that became this case
  originatingStatement    Statement?  @relation("OriginatingStatement", ...)

  // Classification
  isRealIncident          Boolean     @default(false)  // true = real case, false = statement page
  wasAutoImported         Boolean     @default(true)   // legacy import flag

  // Promotion Metadata
  promotedAt              DateTime?                     // When promoted
  promotedBy              String?                       // Who/what promoted it
  promotionReason         String?                       // Why it was promoted
  wasManuallyPromoted     Boolean?    @default(false) // Manual vs auto

  // Qualification Metrics
  qualificationScore      Int?        @default(0)      // 0-100 score
  responseCount           Int?        @default(0)      // Number of responses
  mediaOutletCount        Int?        @default(0)      // Media coverage
  hasPublicReaction       Boolean?    @default(false)  // Public interest
  hasRepercussion         Boolean?    @default(false)  // Real-world impact
}
```

### Statement Relationships

```prisma
model Statement {
  // Response Chain
  respondsToId  String?       // Points to another statement
  respondsTo    Statement?    @relation("StatementResponses", ...)
  responses     Statement[]   @relation("StatementResponses")

  // Case Association
  caseId        String?
  case          Case?         @relation(...)

  // Can originate a case
  originatedCase Case?        @relation("OriginatingStatement")
}
```

## Qualification Scoring

The qualification score is calculated on a 0-100 scale based on multiple factors:

### Response Count Scoring

```javascript
function calculateQualificationScore(responseCount) {
  if (responseCount <= 2)  return 0      // Doesn't qualify
  if (responseCount <= 5)  return 40-60  // Low qualification
  if (responseCount <= 10) return 61-80  // Medium qualification
  if (responseCount > 10)  return 81-100 // High qualification
}
```

### Score Breakdown

| Responses | Score Range | Status |
|-----------|-------------|--------|
| 0-2       | 0           | Statement Page (not qualified) |
| 3-5       | 40-60       | Qualified - Low Activity |
| 6-10      | 61-80       | Qualified - Medium Activity |
| 11+       | 81-100      | Qualified - High Activity |

### Future Enhancements

Additional factors that could contribute to qualification score:
- Media outlet count (number of news organizations covering it)
- Public reaction indicators (social media engagement, etc.)
- Real-world repercussions (employment loss, contract loss, etc.)
- Time span of responses (longer debate = higher score)
- Response diversity (responses from different sectors/backgrounds)

## Scripts

### 1. Auto-Promotion Script

**Location:** `scripts/auto-promote-statements.js`

**Purpose:** Scans database and promotes qualifying statements

**Usage:**
```bash
node scripts/auto-promote-statements.js
```

**What it does:**
1. Fetches all statements with response counts
2. Filters statements with >2 responses
3. Excludes already-promoted cases
4. Promotes each qualifying statement
5. Sets promotion metadata
6. Calculates qualification scores
7. Reports summary statistics

**Output Example:**
```
🔍 Starting auto-promotion scan...

📊 Qualification Results:
   Total statements: 476
   Qualifying (>2 responses): 5
   Already promoted: 2

🚀 Promoting 5 statement(s) to cases...

✅ Promoted: statement-slug-1
   Responses: 4
   Score: 50/100
   Principal Statement: cuid123

📊 AUTO-PROMOTION SUMMARY
========================================
Successfully Promoted:        5
Skipped (errors/no case):     0
Already Real Cases:           2
```

### 2. Response Analysis Script

**Location:** `scripts/analyze-statement-responses.js`

**Purpose:** Analyzes distribution of responses across statements

**Usage:**
```bash
node scripts/analyze-statement-responses.js
```

**What it does:**
1. Fetches all statements with counts
2. Calculates response distribution
3. Identifies top statements by response count
4. Shows statistics and insights
5. Highlights statements ready for promotion

**Output Includes:**
- Total statement count
- Average responses per statement
- Distribution histogram
- Top 20 most-responded statements
- Promotion eligibility summary

## Current Database State (as of October 2025)

- **Total Statements:** 476
- **Total Responses:** 0
- **Statements with >2 Responses:** 0
- **Auto-Promoted Cases:** 0

**Interpretation:** Your database currently tracks standalone statements without response chains. The auto-promotion system is ready but waiting for response data to be populated.

## Workflow Examples

### Example 1: Automatic Promotion Flow

```
Day 1: Statement created
  "Person A makes controversial statement about Topic X"
  Status: Statement Page
  Responses: 0

Day 2: First response added
  "Organization B criticizes Person A"
  Status: Statement Page
  Responses: 1

Day 3: Second response added
  "Person C supports Person A"
  Status: Statement Page
  Responses: 2

Day 4: Third response added
  "Organization D calls for boycott"
  Status: ⚡ AUTO-PROMOTED TO CASE
  Responses: 3
  Qualification Score: 40

Case Created:
  - Title: [from original statement]
  - Principal Statement: Person A's statement
  - Timeline: 3 responses over 4 days
  - isRealIncident: true
```

### Example 2: Manual Promotion Flow

```
Admin reviews high-profile statement
  "World Leader makes historic declaration"
  Current Status: Statement Page
  Responses: 0

Admin Decision: Promote to Case
  Reason: "Historic significance, expected to generate significant response"

Case Created:
  - isRealIncident: true
  - wasManuallyPromoted: true
  - promotedBy: "admin_user_id"
  - promotionReason: "Historic significance..."
  - Principal Statement: World Leader's statement
```

## API Integration

### Check if Statement Qualifies

```typescript
async function checkQualification(statementId: string) {
  const statement = await prisma.statement.findUnique({
    where: { id: statementId },
    include: {
      _count: {
        select: { responses: true }
      }
    }
  })

  return {
    qualifies: statement._count.responses > 2,
    responseCount: statement._count.responses,
    threshold: 2
  }
}
```

### Manually Promote Statement

```typescript
async function manuallyPromote(statementId: string, userId: string, reason: string) {
  const statement = await prisma.statement.findUnique({
    where: { id: statementId },
    include: { case: true }
  })

  if (!statement.case) {
    throw new Error('Statement must have an associated case')
  }

  const promoted = await prisma.case.update({
    where: { id: statement.case.id },
    data: {
      isRealIncident: true,
      wasManuallyPromoted: true,
      promotedAt: new Date(),
      promotedBy: userId,
      promotionReason: reason,
      originatingStatementId: statementId
    }
  })

  return promoted
}
```

## Frontend Integration

### Cases List Page

**URL:** `/cases`

**Behavior:**
- Shows only cases where `isRealIncident = true`
- Filters out statement pages
- Empty state when no promoted cases exist
- Links to individual statement pages

### Case Detail Page

**URL:** `/cases/[slug]`

**Displays:**
- Principal statement prominently
- "Multi-Statement Case" badge
- Complete timeline of all statements/responses
- Metrics (statement count, response count, etc.)
- People and organizations involved

## Maintenance

### Regular Tasks

1. **Run Auto-Promotion** (weekly or after bulk imports)
   ```bash
   node scripts/auto-promote-statements.js
   ```

2. **Analyze Response Patterns** (monthly)
   ```bash
   node scripts/analyze-statement-responses.js
   ```

3. **Review Qualification Scores** (as needed)
   - Check if threshold (>2) needs adjustment
   - Review manually promoted cases
   - Verify principal statement assignments

### Monitoring

**Key Metrics:**
- Promotion rate (auto vs manual)
- Average response count for promoted cases
- Time from statement to case promotion
- Case quality scores

**Health Checks:**
- Verify all cases have originatingStatementId
- Check for orphaned statements
- Validate response chains
- Audit promotion metadata

## Future Enhancements

### Planned Features

1. **Dynamic Thresholds**
   - Adjust >2 threshold based on topic
   - Different thresholds for different time periods
   - Configurable promotion rules

2. **Enhanced Scoring**
   - Factor in media outlet count
   - Consider source credibility
   - Weight by response quality/significance
   - Time-decay for older statements

3. **Admin Dashboard**
   - View promotion candidates
   - Manual review queue
   - Bulk promotion tools
   - Analytics and trends

4. **Notifications**
   - Alert admins when statements qualify
   - Email digest of promotions
   - Slack/webhook integration

5. **Response Quality Analysis**
   - Identify significant vs trivial responses
   - Filter spam/duplicate responses
   - Score response impact

## Troubleshooting

### No Statements Qualifying

**Issue:** Auto-promotion finds 0 qualifying statements

**Causes:**
- No response chains exist yet
- Response threshold too high
- Responses not properly linked

**Solutions:**
- Populate response data
- Lower threshold temporarily
- Verify Statement.respondsToId relationships

### Statements Promoted Multiple Times

**Issue:** Same statement promoted repeatedly

**Causes:**
- Script run multiple times
- No check for existing promotion

**Solutions:**
- Script already checks `isRealIncident` status
- Verify case.isRealIncident before promoting

### Incorrect Principal Statement

**Issue:** Wrong statement marked as originating

**Causes:**
- Statement updated after promotion
- Manual error in assignment

**Solutions:**
- Verify originatingStatementId
- Use admin tools to reassign
- Check statement.respondsToId chain

## Support

For questions or issues with the auto-promotion system:

1. Check this documentation first
2. Review script output logs
3. Run analysis script to understand data state
4. Verify database schema matches expectations
5. Test with sample data before production run

---

**Last Updated:** October 2025
**Version:** 1.0
**Status:** ✅ Production Ready
