# Cases vs Statements Data Analysis

## Date: October 13, 2025

---

## 🚨 PROBLEM IDENTIFIED

Your data has been incorrectly structured. Individual statements have been imported as "Cases" when they should be in the Statement table.

---

## Current Database State

### Case Table (263 records)
Examples of what's currently in Cases:
- "Gilberto Gil - Twitter Statement (15 May 2021)"
- "Alessandro Molon - Twitter/X Statement (12 October 2023)"
- "Marcelo Freixo - Official Statement Statement (12 May 2021)"
- "Jean Wyllys - Twitter Statement (14 May 2018)"

**These are NOT cases - they are individual statements!**

### Statement Table (476 records)
- 264 ORIGINAL statements
- 212 RESPONSE statements
- **ALL 476 statements have a caseId** (they're all linked to the "cases" above)
- **0 standalone statements**

---

## The Intended Architecture

Based on the schema, this is how it SHOULD work:

### **Statement** (Primary entity for quotes/comments)
- Individual statements made by people or organizations
- Examples:
  - "I support Palestinian rights" - Person X, Twitter, May 2021
  - "We condemn this statement" - Organization Y, Press Release, May 2021
- Can be ORIGINAL or RESPONSE type
- Should be visible at:
  - Person pages: `/people/[slug]` (showing all their statements)
  - Organization pages: `/organizations/[slug]` (showing their statements)
  - Optionally: `/statements/[id]` (if you create this route)

### **Case** (Incident/Controversy that contains multiple statements)
- A significant incident or controversy
- Contains MULTIPLE related statements
- Example: "Gaza War Comments Controversy - May 2021"
  - Originating statement: Person X's tweet
  - Response 1: Organization Y condemns
  - Response 2: Person Z supports
  - Response 3: Media outlet comments
- Should be at: `/cases/[slug]`

---

## What Went Wrong?

### Data Import Issue
During data import, each individual statement was created as its own "case" with:
- Case title: "[Person Name] - [Medium] Statement ([Date])"
- One or more Statement records linked to that case

This created a 1:1 or 1:few relationship when it should be many:1 (many statements to one case).

### Result
- 263 "cases" that are actually just individual statements
- No true incident/controversy cases
- All statements are hidden inside individual "case" pages
- `/cases/` route shows individual statements instead of controversies

---

## How It Should Be Structured

### Example: Gaza War Comments (May 2021)

**ONE Case:**
```
Title: "Brazilian Artists' Statements on Gaza Conflict"
Slug: "brazilian-artists-gaza-statements-may-2021"
Summary: "Multiple Brazilian public figures made statements..."
Date: 2021-05-14
```

**MULTIPLE Statements linked to this case:**
1. Statement by Gilberto Gil (ORIGINAL)
   - Content: "Free Palestine..."
   - Medium: Twitter
   - Date: 2021-05-14
   - caseId: [links to the case above]

2. Response by Jewish Federation (RESPONSE)
   - Content: "We are disappointed..."
   - Medium: Press Release
   - Date: 2021-05-15
   - respondsToId: [links to Gil's statement]
   - caseId: [links to the case above]

3. Support statement by Solidarity Group (RESPONSE)
   - Content: "Gil speaks truth..."
   - Medium: Twitter
   - Date: 2021-05-15
   - caseId: [links to the case above]

---

## Proposed Solution Options

### Option 1: Keep Current Structure (Quick Fix)
**What:** Rename "Cases" concept to "Statement Pages"
- Change UI labels from "Cases" to "Statements"
- Each "case" represents one primary statement + its responses
- Keep the 1:1 or 1:few structure

**Pros:**
- No data migration needed
- Minimal code changes
- Website continues working

**Cons:**
- Not using the intended architecture
- Mixing Case and Statement concepts
- Can't group related statements into true controversies

---

### Option 2: Restructure Data (Proper Fix)
**What:** Migrate data to match intended architecture

**Steps:**
1. Create proper Case records for actual controversies
2. Re-link Statement records to appropriate cases
3. Delete the fake "case" records that are really just statements
4. Create optional `/statements/[id]` route for standalone statements

**Pros:**
- Uses intended architecture
- Cleaner data model
- Better for future features (grouping related incidents)
- More scalable

**Cons:**
- Requires data migration
- More complex
- Need to identify which statements belong together

---

### Option 3: Hybrid Approach (Recommended)
**What:** Keep both structures but clarify the distinction

**Steps:**
1. Keep existing "cases" but mark them as `wasManuallyPromoted: false`
2. Add ability to create true multi-statement cases
3. Create `/statements/` route to view individual statements
4. In UI, show:
   - "Statement Pages" for simple 1:1 cases
   - "Incident Pages" for true multi-statement cases

**Pros:**
- Preserves existing data and URLs
- Allows proper incident tracking going forward
- Gradual migration path
- No downtime

**Cons:**
- Maintains some data inconsistency
- Need UI to distinguish types

---

## Data Verification Queries

```sql
-- Find "cases" that are really just individual statements
SELECT id, slug, title
FROM "Case"
WHERE title LIKE '% - % Statement (%'
LIMIT 10;

-- Find cases with only 1-2 statements (probably not real incidents)
SELECT c.id, c.slug, c.title, COUNT(s.id) as statement_count
FROM "Case" c
LEFT JOIN "Statement" s ON s."caseId" = c.id
GROUP BY c.id, c.slug, c.title
HAVING COUNT(s.id) <= 2
ORDER BY COUNT(s.id);

-- Find statements without a case (should be most of them!)
SELECT COUNT(*) FROM "Statement" WHERE "caseId" IS NULL;
-- Current result: 0 (should be hundreds!)

-- Find responses that respond to statements in different cases
SELECT
  s1.id as response_id,
  s1."respondsToId" as original_id,
  s1."caseId" as response_case,
  s2."caseId" as original_case
FROM "Statement" s1
JOIN "Statement" s2 ON s1."respondsToId" = s2.id
WHERE s1."caseId" != s2."caseId"
  OR s1."caseId" IS NULL
  OR s2."caseId" IS NULL;
```

---

## Routing Issue

### Current Routes
- ✅ `/cases/` - Lists all "cases" (actually individual statements)
- ✅ `/cases/[slug]` - Shows a "case" with its statements
- ❌ `/statements/` - DOES NOT EXIST
- ❌ `/statements/[id]` - DOES NOT EXIST

### Where Statements Currently Appear
- On individual "case" pages
- Nowhere else accessible directly

### Where Statements SHOULD Appear
- Person pages: showing all statements by that person
- Organization pages: showing all statements by that org
- Case pages: showing all statements related to that incident
- Optionally: dedicated statement pages

---

## Recommendations

### Immediate Actions (Don't break the site)
1. ✅ **Verify data integrity** (nationality migration)
2. ✅ **Document this issue** (this file)
3. 🔜 **Decide on approach:** Option 1, 2, or 3

### If Choosing Option 3 (Recommended)
1. Add `isSimpleStatement` flag to Case table
2. Mark existing 1:1 cases as simple statements
3. Create `/statements/` route
4. Update UI to show "Statement" vs "Incident" labels
5. Going forward, import data correctly

---

## Questions to Answer

1. **Do you want to keep the current URLs working?**
   - `/cases/gilberto-gil-twitter-statement-15-may-2021`
   - If yes, we need migration path that preserves URLs

2. **How do you want to group statements?**
   - By topic/controversy?
   - By date?
   - Manually curated?

3. **Should statements be accessible at /statements/[id]?**
   - Or only visible on person/org/case pages?

4. **What defines a "Case"?**
   - Multiple related statements?
   - Significant repercussions?
   - Media coverage?
   - Manual curation?

---

## Next Steps

Let me know which approach you prefer, and I can help implement it safely without breaking the existing site.
