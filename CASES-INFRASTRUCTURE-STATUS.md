# Cases Infrastructure - Progress Status

## Date: October 13, 2025

---

## ✅ Phase 1: Database Schema - COMPLETE

### What Was Done:

1. **Added Classification Flags**
   ```prisma
   isRealIncident     Boolean  @default(false)  // Distinguishes real cases from statement pages
   wasAutoImported    Boolean  @default(true)   // Tracks imported data
   ```

2. **Added Promotion System**
   ```prisma
   qualificationScore Int?     @default(0)      // 0-100 scoring for auto-promotion
   promotedAt         DateTime?                  // When promoted
   promotedBy         String?                    // Who promoted it
   promotionReason    String?                    // Why promoted
   wasManuallyPromoted Boolean? @default(false)  // Manual vs automatic
   ```

3. **Added Metrics for Promotion**
   ```prisma
   responseCount      Int?     @default(0)
   mediaOutletCount   Int?     @default(0)
   hasPublicReaction  Boolean? @default(false)
   hasRepercussion    Boolean? @default(false)
   ```

4. **Marked All Existing Data**
   - 263 cases marked as `isRealIncident = false` (statement pages)
   - All marked as `wasAutoImported = true`
   - Qualification scores calculated

### Current Data State:

**Score Distribution:**
- 📄 **262 cases** - Low scores (<30) - Simple statement pages
- 📋 **1 case** - Moderate score (30-59) - Slightly more complex
- ⭐ **0 cases** - Ready for promotion (>= 60)

**What This Means:**
- Current data is correctly identified as simple statement pages
- None currently qualify as multi-statement cases
- System is ready to identify future candidates

---

## 🔨 Phase 2: Build Case Pages - IN PROGRESS

### What Needs to Be Built:

### 1. `/pages/cases/index.tsx` - Case List Page

**Purpose:** List all real multi-statement cases (not statement pages)

**Features:**
- Filter: Active, Archived, Featured
- Sort: Recent, Prominent, Trending
- Show only cases where `isRealIncident = true`
- Stats: statement count, people involved, media coverage
- Timeline view option

**Example Layout:**
```
Cases - Documented Controversies

Filters: [All] [Active] [Featured] [Archived]
Sort by: [Most Recent ▼]

┌─────────────────────────────────────────────────┐
│ Brazilian Artists Gaza Comments - May 2021      │
│ 23 statements • 15 people • 12 media outlets   │
│ Status: Active • Featured                       │
│ May 14-20, 2021                                 │
└─────────────────────────────────────────────────┘

Currently: 0 real cases
(263 statement pages at /statements/)
```

### 2. `/pages/cases/[slug].tsx` - Case Detail Page

**Purpose:** Show complete incident with all related statements

**Sections:**
- **Overview** - Title, summary, description, timeline
- **Timeline** - Chronological event list
- **Statements** - All related statements organized
- **People & Organizations** - Who was involved
- **Repercussions** - Documented consequences
- **Media Coverage** - Outlets, reach, impact
- **Sources** - All source materials
- **Analytics** - Engagement, reach, impact metrics

**Example Layout:**
```
Case: Brazilian Artists Gaza Comments

Overview:
  Multiple Brazilian public figures made statements regarding
  the Gaza conflict in May 2021, leading to widespread reactions...

Timeline:
  May 14, 2021 - Gilberto Gil tweets support for Palestine
  May 15, 2021 - Jewish Federation issues condemnation
  May 15, 2021 - 10 additional artists respond
  May 16, 2021 - Media coverage begins
  May 20, 2021 - Political figures weigh in

Statements (23):
  Original Statements (5)
    ├─ Gilberto Gil - Twitter, May 14
    ├─ Alessandro Molon - Twitter, May 15
    ...

  Responses (18)
    ├─ Jewish Federation - Press Release, May 15
    ├─ Solidarity Group - Statement, May 15
    ...

People Involved: 15
Organizations Involved: 8
Media Outlets: 12
Social Reach: 2.3M
```

---

## 🎯 Phase 3: Promotion Logic - TODO

### What Needs to Be Built:

### 1. Qualification Score Calculator

**File:** `/lib/case-promotion.ts`

```typescript
export function calculateQualificationScore(
  statementCount: number,
  responseCount: number,
  mediaOutletCount: number,
  hasRepercussions: boolean,
  hasPublicReaction: boolean,
  prominenceScore: number
): number {
  let score = 0;

  // Statement count (0-30 points)
  if (statementCount >= 10) score += 30;
  else if (statementCount >= 5) score += 20;
  else if (statementCount >= 3) score += 10;

  // Response count (0-20 points)
  if (responseCount >= 10) score += 20;
  else if (responseCount >= 5) score += 15;
  else if (responseCount >= 3) score += 10;

  // Media coverage (0-20 points)
  if (mediaOutletCount >= 5) score += 20;
  else if (mediaOutletCount >= 3) score += 15;
  else if (mediaOutletCount >= 2) score += 10;

  // Repercussions (0-15 points)
  if (hasRepercussions) score += 15;

  // Public reaction (0-10 points)
  if (hasPublicReaction) score += 10;

  // Prominence bonus (0-5 points)
  if (prominenceScore >= 80) score += 5;

  return Math.min(score, 100);
}
```

### 2. Auto-Promotion Function

```typescript
export async function promoteToCase(
  statementId: string,
  options: {
    reason: string;
    isAutomatic?: boolean;
    userId?: string;
  }
): Promise<Case> {
  // 1. Get statement and related data
  // 2. Create new Case record
  // 3. Link all related statements
  // 4. Create CaseHistory entry
  // 5. Return new case
}
```

### 3. Cron Job for Daily Scoring

**File:** `/pages/api/cron/update-case-scores.ts`

Run daily at 2 AM to:
- Calculate scores for all statement pages
- Identify promotion candidates
- Auto-promote if score >= 75
- Send admin notifications for review candidates (score 60-74)

---

## 👨‍💼 Phase 4: Admin Interface - TODO

### What Needs to Be Built:

### 1. Cases Management Dashboard

**File:** `/pages/admin/cases/index.tsx`

**Features:**
- List all real cases
- Create new case button
- Filter/sort options
- Quick actions (edit, archive, feature)

### 2. Case Editor

**File:** `/pages/admin/cases/[id]/edit.tsx`

**Features:**
- Edit case details
- Link/unlink statements
- Add people & organizations
- Manage repercussions
- Set visibility & prominence
- View history

### 3. Promotion Queue

**File:** `/pages/admin/cases/promotion-queue.tsx`

**Features:**
- Show statement pages with score >= 60
- One-click promote button
- Bulk actions
- Dismiss candidates
- Manual promotion reasons

### 4. Create Case Wizard

**File:** `/pages/admin/cases/create.tsx`

**Features:**
- Step 1: Basic info (title, summary, date)
- Step 2: Link statements
- Step 3: Add people & organizations
- Step 4: Add repercussions
- Step 5: Review & publish

---

## 🔄 API Endpoints Needed

### Public Endpoints

```typescript
GET  /api/cases                  // List real cases
GET  /api/cases/[slug]           // Get case details
GET  /api/cases/[slug]/timeline  // Get case timeline
```

### Admin Endpoints

```typescript
// Case Management
POST   /api/admin/cases/create              // Create new case
PUT    /api/admin/cases/[id]                // Update case
DELETE /api/admin/cases/[id]                // Delete case
POST   /api/admin/cases/[id]/archive        // Archive case
POST   /api/admin/cases/[id]/feature        // Toggle featured

// Promotion
GET    /api/admin/cases/candidates          // Get promotion candidates
POST   /api/admin/cases/promote             // Promote statement to case
POST   /api/admin/cases/[id]/link-statement // Link statement to case

// Scoring
POST   /api/admin/cases/recalculate-scores  // Recalculate all scores
```

---

## 📈 Success Criteria

When complete, the system should:

✅ **For Users:**
- See real multi-statement cases at `/cases/`
- See individual statements at `/statements/`
- Navigate between related content easily
- Understand the difference between statements and cases

✅ **For Admins:**
- Create cases manually
- Promote statements to cases
- See promotion candidates automatically
- Track all changes via history
- Manage case visibility and prominence

✅ **For System:**
- Calculate scores daily
- Auto-promote qualifying statements
- Maintain data integrity
- Log all changes

---

## 🎯 What's Next?

### Immediate Next Steps:

1. **Build Case List Page** (`/pages/cases/index.tsx`)
   - Filter to show only `isRealIncident = true`
   - Empty state: "No cases yet - create your first case!"
   - Link to admin creation

2. **Build Case Detail Page** (`/pages/cases/[slug].tsx`)
   - Full case view with all sections
   - Statement timeline
   - Analytics

3. **Create API Endpoints**
   - Start with GET `/api/cases`
   - Then GET `/api/cases/[slug]`

4. **Build Admin Pages**
   - Case creation wizard
   - Promotion queue
   - Case editor

Would you like me to start building the case pages now?

---

**Current Status: Phase 1 Complete ✅ | Phase 2 Ready to Start 🚀**
