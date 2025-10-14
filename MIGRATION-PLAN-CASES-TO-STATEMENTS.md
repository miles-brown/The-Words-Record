# Migration Plan: Cases → Statements

## Overview
Rename current "Cases" to "Statements" and prepare infrastructure for real incident-based Cases.

---

## Phase 1: Rename Routes and Navigation ✅ SAFE TO DO NOW

### Step 1.1: Rename pages/cases to pages/statements
- Move `pages/cases/index.tsx` → `pages/statements/index.tsx`
- Move `pages/cases/[slug].tsx` → `pages/statements/[slug].tsx`

### Step 1.2: Update Navigation in Layout.tsx
- Change "What?" link from `/cases` → `/statements`
- Change "Who?" label → "People" (route stays `/people`)

### Step 1.3: Add URL Redirects (preserve old URLs)
- Create `pages/cases/index.tsx` with redirect to `/statements`
- Create `pages/cases/[slug].tsx` with redirect to `/statements/[slug]`

### Step 1.4: Update Internal Links
Search and replace all internal links:
- `/cases` → `/statements`
- Keep checking components, API routes, etc.

---

## Phase 2: Database Schema Updates

### Step 2.1: Add Migration Flags to Case Table
Add these columns to help distinguish:
```prisma
model Case {
  // ... existing fields ...

  // New fields to distinguish statement pages from real incidents
  isRealIncident     Boolean  @default(false)  // True for multi-statement cases
  wasAutoImported    Boolean  @default(true)   // True for imported statement pages
  migratedToStatement String?                  // If converted, link to statement
}
```

### Step 2.2: Mark Current "Cases" as Statement Pages
```sql
UPDATE "Case"
SET "isRealIncident" = false,
    "wasAutoImported" = true
WHERE "originatingStatementId" IS NULL;
```

---

## Phase 3: Create Real Cases Infrastructure

### Step 3.1: Create /cases/ Route (new)
New case pages for actual multi-statement incidents:
- `pages/cases/index.tsx` - List real incidents
- `pages/cases/[slug].tsx` - Show incident with all related statements

### Step 3.2: Update Case Model Logic
- Real cases have multiple statements
- Can be manually created in admin
- Auto-promotion logic when statement meets criteria

### Step 3.3: Admin Interface Updates
- Add "Create Real Case" functionality
- Add "Promote Statement to Case" feature
- Add case management tools

---

## Phase 4: Auto-Promotion Logic

Define criteria for when a statement page becomes a real case:
- X number of responses (e.g., 5+)
- High controversy score
- Multiple media outlets
- Manual promotion by admin

---

## Files to Update

### Navigation/Layout
- [x] `components/Layout.tsx` - Update nav links

### Route Files
- [ ] `pages/cases/index.tsx` → Move to statements
- [ ] `pages/cases/[slug].tsx` → Move to statements
- [ ] Create redirect files in old location

### API Routes
- [ ] Check all API files for `/cases` references
- [ ] `pages/api/cases/*` - Rename or update

### Components
- [ ] Search for components using "cases" terminology
- [ ] Update breadcrumbs, links, labels

### Types/Interfaces
- [ ] Update TypeScript types if needed
- [ ] Check for "Case" vs "Statement" confusion

---

## Testing Checklist

- [ ] Old `/cases` URLs redirect properly
- [ ] New `/statements` pages work
- [ ] Navigation links updated
- [ ] Search functionality works
- [ ] Admin dashboard updated
- [ ] No broken links

---

## Rollback Plan

If issues occur:
1. Git revert the commits
2. Redeploy previous version
3. No database changes needed yet (flags are additive)

---

## Admin System Status

✅ **Admin system EXISTS:**
- Located at `/admin`
- Has login page
- Has dashboard with stats
- Has draft queue
- Has audit logging
- Content management capabilities

**Current Admin Features:**
- User management
- API key management
- Draft/approval workflow
- Audit trail
- Stats dashboard

**Admin Updates Needed:**
- Add "Case" vs "Statement" distinction in UI
- Add case creation tools
- Add statement promotion tools

---

## Timeline

**Immediate (Safe to do now):**
1. Rename routes and navigation
2. Add redirects
3. Deploy and test

**Next Phase (After testing):**
4. Add database flags
5. Create real cases infrastructure
6. Build admin tools

**Future:**
7. Implement auto-promotion logic
8. Migrate data if needed
