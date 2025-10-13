# Cases Infrastructure - Complete Design Document

## Date: October 13, 2025

---

## Overview

**Goal:** Transform Cases from individual statement pages into proper incident clusters that contain multiple related statements.

**Current State:**
- 263 "cases" that are actually individual statement pages
- Each has 1-2 statements attached
- Routes at `/statements/[slug]`

**Target State:**
- Real Cases = Incidents/Controversies with multiple related statements
- Displayed at `/cases/[slug]`
- Auto-promotion when statements meet criteria
- Manual case creation in admin

---

## 1. Database Schema Changes

### Add Fields to Case Table

```prisma
model Case {
  // ... existing fields ...

  // ===== NEW FIELDS =====

  // Classification flags
  isRealIncident     Boolean  @default(false)     // True = multi-statement case
  wasAutoImported    Boolean  @default(true)      // True = imported as statement page

  // Qualification scoring for auto-promotion
  qualificationScore Int?     @default(0)         // Score 0-100 for promotion eligibility

  // Promotion tracking
  promotedAt         DateTime?                    // When promoted to real case
  promotedBy         String?                      // User who promoted (manual)
  promotionReason    String?                      // Why it was promoted

  // Stats for promotion criteria
  responseCount      Int?     @default(0)         // Number of responses
  mediaOutletCount   Int?     @default(0)         // Number of media outlets covering it
  hasPublicReaction  Boolean? @default(false)     // Public controversy indicator
  hasRepercussion    Boolean? @default(false)     // Repercussions indicator
  wasManuallyPromoted Boolean? @default(false)    // Manual vs automatic promotion

  // Display settings
  visibility         CaseVisibility? @default(PUBLIC)  // Draft, Public, etc.
  isFeatured         Boolean? @default(false)          // Featured on homepage
  isArchived         Boolean? @default(false)          // Archived cases
  archivedAt         DateTime?
  archivedBy         String?
  archivedReason     String?

  // Quality indicators
  prominenceScore    Int?     @default(50)        // 0-100 overall prominence
  lastReviewedAt     DateTime?
  lastReviewedBy     String?
  internalNotes      String?                       // Admin notes

  // ===== END NEW FIELDS =====
}

enum CaseVisibility {
  DRAFT                  // Being prepared
  PUBLIC                 // Published
  PENDING_VERIFICATION   // Needs review
  ARCHIVED               // No longer active
  LOCKED                 // Locked for editing
}
```

### New Model: CaseHistory

Track all changes to cases for transparency:

```prisma
model CaseHistory {
  id              String              @id @default(cuid())
  caseId          String
  actionType      CaseHistoryAction
  actionBy        String              // User ID or system
  actionAt        DateTime            @default(now())
  reason          String?
  previousValue   String?             // JSON of old values
  newValue        String?             // JSON of new values
  metadata        Json?

  case            Case                @relation(fields: [caseId], references: [id], onDelete: Cascade)

  @@index([caseId])
  @@index([actionAt])
  @@index([actionType])
}

enum CaseHistoryAction {
  CREATED
  PROMOTED_FROM_STATEMENT
  STATUS_CHANGED
  VISIBILITY_CHANGED
  ARCHIVED
  UNARCHIVED
  LOCKED
  UNLOCKED
  FEATURED
  UNFEATURED
  STATEMENT_LINKED
  STATEMENT_UNLINKED
  PERSON_ADDED
  PERSON_REMOVED
  ORGANIZATION_ADDED
  ORGANIZATION_REMOVED
  TAG_ADDED
  TAG_REMOVED
  EDITED
  MERGED
}
```

---

## 2. Promotion Criteria & Scoring

### Qualification Score Calculation (0-100)

```typescript
function calculateQualificationScore(case: Case): number {
  let score = 0;

  // Statement count (0-30 points)
  const statementCount = case.statements?.length || 0;
  if (statementCount >= 10) score += 30;
  else if (statementCount >= 5) score += 20;
  else if (statementCount >= 3) score += 10;

  // Response count (0-20 points)
  const responseCount = case.responseCount || 0;
  if (responseCount >= 10) score += 20;
  else if (responseCount >= 5) score += 15;
  else if (responseCount >= 3) score += 10;

  // Media coverage (0-20 points)
  const mediaCount = case.mediaOutletCount || 0;
  if (mediaCount >= 5) score += 20;
  else if (mediaCount >= 3) score += 15;
  else if (mediaCount >= 2) score += 10;

  // Repercussions (0-15 points)
  if (case.hasRepercussion) score += 15;

  // Public reaction (0-10 points)
  if (case.hasPublicReaction) score += 10;

  // Prominence score bonus (0-5 points)
  if ((case.prominenceScore || 0) >= 80) score += 5;

  return Math.min(score, 100);
}
```

### Auto-Promotion Thresholds

```typescript
const PROMOTION_THRESHOLDS = {
  AUTO_PROMOTE: 75,      // Automatically promote if score >= 75
  SUGGEST_REVIEW: 60,    // Suggest admin review if score >= 60
  KEEP_AS_STATEMENT: 59  // Keep as statement page if score < 60
};
```

---

## 3. Page Architecture

### Statement Pages (`/statements/[slug]`)

**Purpose:** Individual statement + immediate responses

**Shows:**
- Primary statement
- Direct responses (1-5 typically)
- Basic metadata
- "Part of Case" link if belongs to a case

**Example:**
```
Statement: "Gilberto Gil's Gaza Comments"
├── Original statement by Gil
├── Response from Jewish Federation
└── Response from Solidarity Group

[Part of larger case: "Brazilian Artists Gaza Controversy →"]
```

### Case Pages (`/cases/[slug]`)

**Purpose:** Full incident with all related statements

**Shows:**
- Incident overview & timeline
- All related statements (organized)
- Multiple people/organizations involved
- Repercussions
- Media coverage
- Analytics (reach, impact)

**Example:**
```
Case: "Brazilian Artists' Gaza Comments - May 2021"

Overview: Multiple Brazilian public figures made statements...

Timeline:
├── May 14: Gilberto Gil tweets support for Palestine
├── May 15: Jewish Federation condemns
├── May 15: 10 other artists respond
├── May 16: Media coverage begins
└── May 20: Political reaction

Statements (23):
├── Original Statements (5)
│   ├── Gilberto Gil
│   ├── Alessandro Molon
│   └── ...
├── Responses (18)
│   ├── Organizations (8)
│   └── Individuals (10)

Impact:
├── Media Outlets: 12
├── Social Media Reach: 2.3M
└── Repercussions: 3 documented
```

---

## 4. API Endpoints

### GET `/api/cases`
List all real cases (incidents)

```typescript
// Query params:
// - status: 'all' | 'active' | 'archived'
// - sort: 'recent' | 'prominent' | 'trending'
// - page, limit

Response: {
  cases: Case[],
  pagination: { ... },
  filters: { ... }
}
```

### GET `/api/cases/[slug]`
Get single case with all related data

```typescript
Response: {
  case: Case,
  statements: Statement[],
  people: Person[],
  organizations: Organization[],
  repercussions: Repercussion[],
  sources: Source[],
  timeline: TimelineEvent[],
  stats: {
    totalStatements: number,
    responseCount: number,
    mediaOutlets: number,
    socialReach: number
  }
}
```

### POST `/api/admin/cases/promote`
Promote statement to case (admin only)

```typescript
Request: {
  statementId?: string,      // Promote from statement
  title: string,
  summary: string,
  reason: string,
  relatedStatementIds: string[]
}

Response: {
  case: Case,
  history: CaseHistory
}
```

### POST `/api/admin/cases/create`
Create new case manually

```typescript
Request: {
  title: string,
  summary: string,
  description: string,
  caseDate: Date,
  severity?: CaseSeverity,
  statementIds: string[],
  peopleIds: string[],
  organizationIds: string[]
}
```

### POST `/api/admin/cases/[id]/link-statement`
Link statement to existing case

```typescript
Request: {
  statementId: string,
  relationshipNote?: string
}
```

### GET `/api/admin/cases/candidates`
Get statement pages eligible for promotion

```typescript
// Returns statements with qualification score >= 60
Response: {
  candidates: Array<{
    id: string,
    slug: string,
    title: string,
    qualificationScore: number,
    statementCount: number,
    responseCount: number,
    mediaOutletCount: number,
    reason: string  // Why it's a candidate
  }>
}
```

---

## 5. Admin Interface

### Cases Management Dashboard

**Location:** `/admin/cases`

**Features:**
- List all cases (real incidents only)
- Filter: Active, Archived, Draft, Featured
- Sort: Recent, Prominent, Trending
- Actions: Edit, Archive, Feature, Lock

### Case Editor

**Location:** `/admin/cases/[id]/edit`

**Sections:**
1. **Basic Info**
   - Title, slug, summary, description
   - Date, status, severity

2. **Related Statements**
   - Search and link statements
   - Reorder statements
   - Set relationship types

3. **People & Organizations**
   - Link involved parties
   - Set roles/relationships

4. **Repercussions**
   - Add/edit repercussions
   - Link to statements

5. **Media Coverage**
   - Track outlets
   - Social media reach

6. **Settings**
   - Visibility, featured status
   - Prominence score
   - Archive/lock options

### Promotion Queue

**Location:** `/admin/cases/promotion-queue`

**Purpose:** Review statement pages eligible for promotion

**Shows:**
- Candidates sorted by qualification score
- Auto-promotion suggestions
- One-click promote button
- Bulk actions

**Example:**
```
┌─────────────────────────────────────────────────────────┐
│ Promotion Candidates                         Score      │
├─────────────────────────────────────────────────────────┤
│ ⭐ Auto-Promote Recommended (Score >= 75)               │
├─────────────────────────────────────────────────────────┤
│ □ "Gil's Gaza Tweet" - 82 points                        │
│   📊 12 statements, 8 responses, 4 media outlets        │
│   [Promote] [View] [Dismiss]                           │
├─────────────────────────────────────────────────────────┤
│ 📋 Review Suggested (Score >= 60)                       │
├─────────────────────────────────────────────────────────┤
│ □ "Molon's Comments" - 67 points                        │
│   📊 5 statements, 4 responses, 2 media outlets         │
│   [Promote] [View] [Dismiss]                           │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Cron Jobs / Background Tasks

### Daily: Calculate Qualification Scores

```typescript
// Run at 2 AM daily
async function updateQualificationScores() {
  const statementPages = await prisma.case.findMany({
    where: { isRealIncident: false },
    include: { statements: true, repercussions: true }
  });

  for (const page of statementPages) {
    const score = calculateQualificationScore(page);
    await prisma.case.update({
      where: { id: page.id },
      data: { qualificationScore: score }
    });
  }
}
```

### Daily: Auto-Promote Eligible Cases

```typescript
async function autoPromoteCases() {
  const candidates = await prisma.case.findMany({
    where: {
      isRealIncident: false,
      qualificationScore: { gte: 75 },
      wasManuallyPromoted: false
    }
  });

  for (const candidate of candidates) {
    await promoteToCase(candidate, {
      reason: 'Auto-promoted: High qualification score',
      isAutomatic: true
    });
  }
}
```

---

## 7. Implementation Steps

### Phase 1: Database Schema ✅ (Ready to implement)
1. Add new fields to Case model
2. Create CaseHistory model
3. Run migration
4. Mark existing records: `isRealIncident = false`, `wasAutoImported = true`

### Phase 2: Backend Logic
1. Create qualification score calculator
2. Build promotion functions
3. Create API endpoints
4. Set up cron jobs

### Phase 3: Case Pages (Frontend)
1. Create `/pages/cases/index.tsx` (list real cases)
2. Create `/pages/cases/[slug].tsx` (case detail page)
3. Build case components (timeline, statement list, stats)

### Phase 4: Admin Interface
1. Create case management dashboard
2. Build case editor
3. Create promotion queue
4. Add quick actions

### Phase 5: Integration
1. Update statement pages to show "Part of case" link
2. Add case creation to admin menu
3. Set up automated tasks
4. Testing & refinement

---

## 8. Migration Strategy

### Step 1: Add Schema (Safe, No Data Changes)
```sql
-- Add new columns with defaults
ALTER TABLE "Case"
  ADD COLUMN "isRealIncident" BOOLEAN DEFAULT false,
  ADD COLUMN "wasAutoImported" BOOLEAN DEFAULT true,
  ADD COLUMN "qualificationScore" INTEGER DEFAULT 0,
  ...
```

### Step 2: Populate Data
```sql
-- Mark all existing as statement pages
UPDATE "Case"
SET
  "isRealIncident" = false,
  "wasAutoImported" = true,
  "qualificationScore" = 0
WHERE "isRealIncident" IS NULL;
```

### Step 3: Calculate Initial Scores
```typescript
// Run script to calculate scores for all existing
await updateQualificationScores();
```

---

## 9. Success Metrics

**After Implementation:**
- ✅ Real cases displayed at `/cases/`
- ✅ Statement pages at `/statements/`
- ✅ Auto-promotion working for high-score statements
- ✅ Admin can manually create/promote cases
- ✅ Users can navigate from statement → case
- ✅ Clear distinction in UI
- ✅ All old URLs still work

---

## Next: Let's Implement! 🚀

Ready to start with Phase 1 (Database Schema)?
