# 🔧 Affiliation Migration - Action Plan

**Created:** 2025-10-11
**Status:** 🟡 Action Required
**Priority:** High

---

## 📋 Overview

A Supabase migration was executed to replace `createdBy = 'service_role'` placeholder values with a dedicated service-account UUID (`00000000-0000-0000-0000-000000000000`) in the `Affiliation` table. This document outlines required follow-up actions.

---

## ✅ Immediate Actions (Do Now)

### 1. Verify Migration Success
**Priority:** 🔴 Critical
**Effort:** 5 minutes

Run in Supabase SQL Editor:
```sql
-- Should return 0
SELECT count(*) AS remaining_service_role_count
FROM public."Affiliation"
WHERE "createdBy" = 'service_role';

-- Should return rows with new UUID
SELECT id, "createdBy", "createdAt"
FROM public."Affiliation"
WHERE "createdBy" = '00000000-0000-0000-0000-000000000000'
LIMIT 10;
```

**Expected Results:**
- First query: 0 rows (no more 'service_role' placeholders)
- Second query: Multiple rows with UUID `00000000-0000-0000-0000-000000000000`

**If issues found:** Run rollback migration from `docs/SUPABASE-AFFILIATION-BACKFILL-2025-10-11.md`

---

### 2. Review Audit Table
**Priority:** 🟡 High
**Effort:** 10 minutes

```sql
-- See all audited changes
SELECT * FROM public.affiliation_backfill_audit
ORDER BY backfilled_at DESC;

-- Count total rows changed
SELECT COUNT(*) FROM public.affiliation_backfill_audit;
```

**Action:** Verify that all expected rows were captured in the audit table.

---

### 3. Export Audit Table (Backup)
**Priority:** 🟡 High
**Effort:** 5 minutes

**Option A: Via Supabase Dashboard**
1. Navigate to Table Editor → `affiliation_backfill_audit`
2. Click "Export" → CSV
3. Save to: `backups/affiliation_backfill_audit_2025-10-11.csv`

**Option B: Via SQL**
```sql
-- Export to CSV (if you have file access)
COPY public.affiliation_backfill_audit
TO '/tmp/affiliation_backfill_audit.csv'
WITH CSV HEADER;
```

**Why:** Creates offline backup before potentially dropping the audit table.

---

## 🔍 Investigation Actions (Next 24 Hours)

### 4. Check Other Tables for 'service_role' Placeholders
**Priority:** 🟡 High
**Effort:** 10 minutes

Run this diagnostic query:
```sql
-- Find all tables with service_role placeholders
SELECT 'Case' AS table_name, COUNT(*) AS count
FROM public."Case"
WHERE "createdBy" = 'service_role'

UNION ALL

SELECT 'Statement', COUNT(*)
FROM public."Statement"
WHERE "createdBy" = 'service_role'

UNION ALL

SELECT 'Person', COUNT(*)
FROM public."Person"
WHERE "createdBy" = 'service_role'

UNION ALL

SELECT 'Organization', COUNT(*)
FROM public."Organization"
WHERE "createdBy" = 'service_role'

UNION ALL

SELECT 'Source', COUNT(*)
FROM public."Source"
WHERE "createdBy" = 'service_role'

UNION ALL

SELECT 'PersonNationality', COUNT(*)
FROM public."PersonNationality"
WHERE "createdBy" = 'service_role'

UNION ALL

SELECT 'Country', COUNT(*)
FROM public."Country"
WHERE "createdBy" = 'service_role';
```

**Expected:** Some tables may have rows with 'service_role'.

**Action:** For any table with count > 0, create similar backfill migration.

---

### 5. Check for Other Placeholder Patterns
**Priority:** 🟢 Medium
**Effort:** 15 minutes

```sql
-- Check for other common placeholder patterns in Affiliation
SELECT DISTINCT "createdBy", COUNT(*)
FROM public."Affiliation"
GROUP BY "createdBy"
ORDER BY COUNT(*) DESC;

-- Check for NULL createdBy (should use service account)
SELECT COUNT(*) FROM public."Affiliation" WHERE "createdBy" IS NULL;

-- Check for empty string createdBy
SELECT COUNT(*) FROM public."Affiliation" WHERE "createdBy" = '';
```

**Action:** Document any other placeholder patterns that need migration.

---

## 🔧 Configuration Actions (Next Week)

### 6. Update Application Code
**Priority:** 🟡 High
**Effort:** 30 minutes

**Files to Update:**
- Any code that creates `Affiliation` records with `createdBy: 'service_role'`
- Replace with: `createdBy: '00000000-0000-0000-0000-000000000000'`

**Search for:**
```bash
grep -r "service_role" lib/ components/ pages/api/
grep -r "createdBy.*service" lib/ components/ pages/api/
```

**Common locations:**
- `lib/*` - Helper functions
- `pages/api/*/` - API endpoints
- `components/*` - UI components that create data

**Changes needed:**
```typescript
// OLD (WRONG)
createdBy: 'service_role'

// NEW (CORRECT)
createdBy: '00000000-0000-0000-0000-000000000000'

// OR BETTER - Use constant
const SERVICE_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000'
createdBy: SERVICE_ACCOUNT_ID
```

---

### 7. Create Service Account Constant
**Priority:** 🟡 High
**Effort:** 15 minutes

Create file: `lib/constants/service-accounts.ts`

```typescript
/**
 * Service Account IDs
 * These represent system-owned/automated records
 */

export const SERVICE_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000'

// Use this for any system-created records where no user is authenticated
export const getSystemUserId = (): string => SERVICE_ACCOUNT_ID
```

**Then update all code to use:**
```typescript
import { SERVICE_ACCOUNT_ID } from '@/lib/constants/service-accounts'

// In your API/code
createdBy: SERVICE_ACCOUNT_ID
```

---

### 8. Add Validation to Prevent Future 'service_role' Strings
**Priority:** 🟢 Medium
**Effort:** 20 minutes

**Option A: Database CHECK Constraint**
```sql
-- Prevent future insertions of 'service_role' string
ALTER TABLE public."Affiliation"
ADD CONSTRAINT no_service_role_string
CHECK ("createdBy" != 'service_role');
```

**Option B: Application-level validation**
Add to your Prisma middleware or API validation:
```typescript
// Validate createdBy is not 'service_role'
if (data.createdBy === 'service_role') {
  throw new Error('Invalid createdBy: use SERVICE_ACCOUNT_ID instead')
}
```

---

## 📊 Monitoring Actions (Ongoing)

### 9. Monitor for New 'service_role' Entries
**Priority:** 🟢 Medium
**Effort:** 5 minutes weekly

Create a weekly check:
```sql
-- Run weekly to ensure no new service_role entries
SELECT
  'Affiliation' AS table_name,
  COUNT(*) AS service_role_count
FROM public."Affiliation"
WHERE "createdBy" = 'service_role'

UNION ALL

SELECT 'Case', COUNT(*)
FROM public."Case"
WHERE "createdBy" = 'service_role'

UNION ALL

SELECT 'Statement', COUNT(*)
FROM public."Statement"
WHERE "createdBy" = 'service_role';
```

**Expected:** All counts should be 0.

**If not 0:** Investigate source and re-run migration.

---

## 🗑️ Cleanup Actions (After 30-90 Days)

### 10. Drop Audit Table (After Safe Retention Period)
**Priority:** 🟢 Low
**Effort:** 2 minutes
**⚠️ Wait:** 30-90 days after migration

**Prerequisites:**
- ✅ Migration verified successful
- ✅ Audit table exported to CSV
- ✅ No rollback needed
- ✅ Application updated to use new UUID

```sql
-- ONLY run after prerequisites met
DROP TABLE IF EXISTS public.affiliation_backfill_audit;
```

**Why wait:** Provides safety window in case rollback is needed.

---

## 🔄 Similar Migrations Needed

If diagnostic query (Action #4) found other tables with 'service_role', create similar migrations:

### Template Migration for Other Tables

**For each table with service_role placeholders:**

1. **Create audit table**
   ```sql
   CREATE TABLE IF NOT EXISTS public.[TABLE]_backfill_audit (
     id text PRIMARY KEY,
     old_createdBy text,
     backfilled_at timestamp DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. **Audit current values**
   ```sql
   INSERT INTO public.[TABLE]_backfill_audit (id, old_createdBy)
   SELECT id, "createdBy"
   FROM public."[TABLE]"
   WHERE "createdBy" = 'service_role';
   ```

3. **Update to service account UUID**
   ```sql
   UPDATE public."[TABLE]"
   SET "createdBy" = '00000000-0000-0000-0000-000000000000'
   WHERE "createdBy" = 'service_role';
   ```

4. **Verify**
   ```sql
   SELECT COUNT(*) FROM public."[TABLE]" WHERE "createdBy" = 'service_role';
   -- Should be 0
   ```

---

## 📝 Documentation Actions

### 11. Update Schema Documentation
**Priority:** 🟢 Medium
**Effort:** 15 minutes

Update any schema documentation to reflect:
- Service account UUID: `00000000-0000-0000-0000-000000000000`
- No longer using 'service_role' string
- Purpose of service account (system-owned records)

**Files to update:**
- `README.md`
- `docs/DATABASE-SCHEMA.md` (if exists)
- `prisma/schema.prisma` comments

---

### 12. Add to Environment Variables (Optional)
**Priority:** 🟢 Low
**Effort:** 10 minutes

Add to `.env.example`:
```bash
# Service Account ID for system-owned records
SERVICE_ACCOUNT_ID=00000000-0000-0000-0000-000000000000
```

Add to `.env`:
```bash
SERVICE_ACCOUNT_ID=00000000-0000-0000-0000-000000000000
```

Update `lib/constants/service-accounts.ts`:
```typescript
export const SERVICE_ACCOUNT_ID = process.env.SERVICE_ACCOUNT_ID ||
  '00000000-0000-0000-0000-000000000000'
```

---

## ✅ Action Checklist Summary

### Immediate (Today)
- [ ] Verify migration success (Action #1)
- [ ] Review audit table (Action #2)
- [ ] Export audit table to CSV (Action #3)

### This Week
- [ ] Check other tables for service_role (Action #4)
- [ ] Check for other placeholder patterns (Action #5)
- [ ] Update application code (Action #6)
- [ ] Create service account constant (Action #7)
- [ ] Add validation to prevent future issues (Action #8)

### Ongoing
- [ ] Weekly monitoring for new service_role entries (Action #9)

### After 30-90 Days
- [ ] Drop audit table (Action #10)

### Documentation
- [ ] Update schema documentation (Action #11)
- [ ] Add to environment variables (Action #12)

---

## 🆘 Rollback Instructions

If you need to revert the migration:

1. **Run the down migration:**
   ```sql
   -- See docs/SUPABASE-AFFILIATION-BACKFILL-2025-10-11.md
   -- Section: "Down Migration (Rollback)"
   ```

2. **Verify rollback:**
   ```sql
   SELECT COUNT(*) FROM public."Affiliation"
   WHERE "createdBy" = 'service_role';
   -- Should match original count
   ```

3. **Report issue:** Document why rollback was needed for future reference

---

## 📞 Support

**Documentation:** `docs/SUPABASE-AFFILIATION-BACKFILL-2025-10-11.md`
**Project ID:** sboopxosgongujqkpbxo
**Service Account UUID:** `00000000-0000-0000-0000-000000000000`

For questions, check the main migration document first.

---

**End of Action Plan**
