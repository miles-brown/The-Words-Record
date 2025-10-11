# Supabase Affiliation Backfill Migration — 2025-10-11

**Project:** sboopxosgongujqkpbxo
**Date:** 2025-10-11
**Status:** ✅ Successfully Executed

---

## 📋 Executive Summary

Successfully migrated all `Affiliation` table rows that had `createdBy = 'service_role'` to use a dedicated service-account UUID instead. This resolves authentication issues where placeholder values were used instead of proper user references.

### Key Changes:
- **Old Value:** `createdBy = 'service_role'` (placeholder string)
- **New Value:** `createdBy = '00000000-0000-0000-0000-000000000000'` (service-account UUID)
- **Rows Affected:** Multiple rows (verified via audit table)
- **Verification:** 0 rows remaining with 'service_role' placeholder

---

## 🔧 Migration Details

### Service Account UUID Used:
```
00000000-0000-0000-0000-000000000000
```

### Tables Modified:
1. **`public.Affiliation`**
   - Column: `createdBy`
   - Changed from: `'service_role'` (string)
   - Changed to: `'00000000-0000-0000-0000-000000000000'` (UUID)

### Audit Table Created:
**`public.affiliation_backfill_audit`**
- `id` (text, primary key) - Affiliation ID
- `old_createdBy` (text) - Original createdBy value before migration
- `backfilled_at` (timestamp) - When the audit entry was created

---

## 📜 Migration SQL Files

### Up Migration (Executed)
**File:** `2025-10-11__affiliation_replace_service_role.up.sql`

```sql
-- 2025-10-11__affiliation_replace_service_role.up.sql
BEGIN;

-- 1) Create an audit table to record previous values (safe, idempotent)
CREATE TABLE IF NOT EXISTS public.affiliation_backfill_audit (
  id text PRIMARY KEY,
  old_createdBy text,
  backfilled_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- 2) Insert rows we will change into the audit table (only new ones)
INSERT INTO public.affiliation_backfill_audit (id, old_createdBy)
SELECT a.id, a."createdBy"
FROM public."Affiliation" a
LEFT JOIN public.affiliation_backfill_audit b ON a.id = b.id
WHERE a."createdBy" = 'service_role'
  AND b.id IS NULL;

-- 3) Perform the update to the dedicated service-account UUID
UPDATE public."Affiliation"
SET "createdBy" = '00000000-0000-0000-0000-000000000000'
WHERE "createdBy" = 'service_role';

COMMIT;

-- 4) Verification queries (run after commit)
-- Count remaining placeholders (should be 0)
SELECT count(*) AS remaining_service_role_count
FROM public."Affiliation"
WHERE "createdBy" = 'service_role';

-- Sample of updated rows (first 50)
SELECT id, "createdBy", "createdAt"
FROM public."Affiliation"
WHERE "createdBy" = '00000000-0000-0000-0000-000000000000'
ORDER BY "createdAt" DESC
LIMIT 50;
```

### Down Migration (Rollback)
**File:** `2025-10-11__affiliation_replace_service_role.down.sql`

```sql
-- 2025-10-11__affiliation_replace_service_role.down.sql
BEGIN;

-- Safety: ensure the audit table exists
CREATE TABLE IF NOT EXISTS public.affiliation_backfill_audit (
  id text PRIMARY KEY,
  old_createdBy text,
  backfilled_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Restore previous createdBy values for rows recorded in the audit table
UPDATE public."Affiliation" a
SET "createdBy" = b.old_createdBy
FROM public.affiliation_backfill_audit b
WHERE a.id = b.id
  AND a."createdBy" = '00000000-0000-0000-0000-000000000000';

COMMIT;

-- Optional: verify remaining service-account assignments (should be 0 for restored rows)
SELECT count(*) AS remaining_service_account_count
FROM public."Affiliation"
WHERE "createdBy" = '00000000-0000-0000-0000-000000000000';
```

---

## ✅ Verification Results

### Post-Migration Verification:
```sql
-- Count remaining placeholders (should be 0)
SELECT count(*) AS remaining_service_role_count
FROM public."Affiliation"
WHERE "createdBy" = 'service_role';
```
**Result:** 0 rows (✅ Success)

### Sample Updated Rows:
```sql
SELECT id, "createdBy", "createdAt"
FROM public."Affiliation"
WHERE "createdBy" = '00000000-0000-0000-0000-000000000000'
ORDER BY "createdAt" DESC
LIMIT 50;
```

**Sample Results:**
- `cmgbi8rzy0009rooa0ny1usth` — `00000000-0000-0000-0000-000000000000` — 2025-10-03 23:58:18.046
- `cmgbi8rzv0006rooahcbyjh6y` — `00000000-0000-0000-0000-000000000000` — 2025-10-03 23:58:18.044
- `cmgbi8rzr0003rooasqwxhlvw` — `00000000-0000-0000-0000-000000000000` — 2025-10-03 23:58:18.040
- *(additional rows truncated)*

---

## 🔐 Safety Controls Implemented

1. **Audit Table**: `public.affiliation_backfill_audit`
   - Records all original `createdBy` values before changes
   - Enables safe rollback if needed
   - Prevents duplicate audit entries via `LEFT JOIN` check

2. **Transaction Wrapper**:
   - Entire migration wrapped in `BEGIN; ... COMMIT;`
   - Atomic operation - all or nothing

3. **Idempotent Design**:
   - `CREATE TABLE IF NOT EXISTS` - safe to re-run
   - Audit INSERT checks for existing entries
   - Update only affects rows with 'service_role'

4. **Rollback Plan**:
   - Down migration file ready to restore original values
   - Uses audit table to revert changes
   - Only affects rows recorded in audit table

---

## 📊 Audit Table Review

### Check Audit Entries:
```sql
SELECT * FROM public.affiliation_backfill_audit LIMIT 200;
```

### Export Audit Table (if needed):
```sql
COPY public.affiliation_backfill_audit TO '/tmp/affiliation_backfill_audit.csv' WITH CSV HEADER;
```

---

## 🚨 Important Notes

### Service Account UUID:
- **UUID:** `00000000-0000-0000-0000-000000000000`
- This represents system-owned/automated rows
- Used for rows created by service_role (system processes)
- If you need a different UUID, it can be changed via migration

### Rollback Limitations:
- Rollback only affects rows in `affiliation_backfill_audit`
- If additional rows were changed after audit creation, they won't be reverted
- Test rollback in staging before using in production

### Audit Table Retention:
- Keep `affiliation_backfill_audit` for safe retention period
- Consider exporting to CSV for offline backup before dropping
- To drop (use with caution):
  ```sql
  DROP TABLE public.affiliation_backfill_audit;
  ```

---

## 🔄 Related Tables to Check

The same pattern may need to be applied to other tables using 'service_role' placeholders:

### Find Other Tables with 'service_role':
```sql
-- Check other tables for service_role placeholders
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
WHERE "createdBy" = 'service_role';
```

---

## 📋 Next Steps Checklist

- [ ] Review audit table entries: `SELECT * FROM public.affiliation_backfill_audit LIMIT 200;`
- [ ] Export audit table to CSV for offline records (optional)
- [ ] Check other tables for 'service_role' placeholders (see query above)
- [ ] Apply same migration pattern to other affected tables
- [ ] After safe retention period (30-90 days), consider dropping audit table
- [ ] Update application code to use service-account UUID instead of 'service_role' string
- [ ] Document service-account UUID in application configuration

---

## 🎯 Success Criteria

✅ **All criteria met:**
- Migration executed successfully
- 0 rows remaining with 'service_role' placeholder
- Audit table contains original values for rollback
- Sample rows verified with new UUID
- Rollback SQL prepared and documented

---

## 📞 Support Information

**Project ID:** sboopxosgongujqkpbxo
**Migration Date:** 2025-10-11
**Service Account UUID:** `00000000-0000-0000-0000-000000000000`

For questions or issues:
1. Check audit table: `SELECT * FROM public.affiliation_backfill_audit;`
2. Verify current state: `SELECT COUNT(*) FROM "Affiliation" WHERE "createdBy" = 'service_role';`
3. Rollback if needed: Run down migration SQL
4. Contact support with Project ID and migration date

---

**End of Migration Documentation**
