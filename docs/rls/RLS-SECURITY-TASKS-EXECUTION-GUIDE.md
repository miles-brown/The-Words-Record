# RLS Security Tasks - Execution Guide

**Date**: 2025-10-11
**Project**: Who-Said-What
**Database**: sboopxosgongujqkpbxo.supabase.co

## Overview

This guide provides step-by-step instructions for executing 4 critical RLS security tasks identified in the audit:

1. ✅ Verify JWT tokens include user_role claim
2. ✅ Test service account access configuration
3. ⚠️ Standardize policy naming conventions (DESTRUCTIVE)
4. ⚠️ Set retention policy for affiliation_backfill_audit (DESTRUCTIVE)

## Files Created

All SQL scripts are located in `/tmp`:

- **TASK-1-JWT-VERIFICATION.sql** - JWT token and role claim verification
- **TASK-2-SERVICE-ACCOUNT-VERIFICATION.sql** - Service account UUID validation
- **TASK-3-POLICY-NAMING-STANDARDIZATION.sql** - Policy renaming scripts (⚠️ DESTRUCTIVE)
- **TASK-4-AUDIT-TABLE-RETENTION.sql** - Audit data retention and cleanup (⚠️ DESTRUCTIVE)

## Task 1: Verify JWT Tokens Include user_role Claim

### Purpose
Confirm that Supabase JWT tokens include the `user_role` custom claim required by RLS policies.

### Steps

1. **Open Supabase SQL Editor**
   - Navigate to: https://supabase.com/dashboard/project/sboopxosgongujqkpbxo/sql

2. **Run verification queries from TASK-1-JWT-VERIFICATION.sql**

   Priority queries:
   ```sql
   -- 1.4: Check user roles in database
   SELECT role, COUNT(*) as user_count
   FROM "User"
   GROUP BY role;

   -- 1.6: Check current JWT structure (must be authenticated)
   SELECT
     auth.uid() as user_id,
     auth.jwt() -> 'user_role' as user_role_claim,
     auth.jwt() -> 'role' as role_claim;

   -- 1.7: Find policies using user_role
   SELECT tablename, policyname
   FROM pg_policies
   WHERE qual::text LIKE '%user_role%'
   ORDER BY tablename;
   ```

3. **Expected Results**
   - Query 1.4: Should show roles like 'ADMIN', 'USER', etc.
   - Query 1.6: Should return user_role claim value (NOT NULL)
   - Query 1.7: Should list all policies checking user_role

4. **If user_role claim is NULL**

   **Action Required**: Configure JWT template in Supabase

   a. Go to: Authentication > Settings > JWT Template

   b. Add custom claim:
   ```json
   {
     "user_role": "{{ .UserMetaData.role }}"
   }
   ```

   c. Or map from User table:
   ```json
   {
     "user_role": "{{ .Role }}"
   }
   ```

   d. Save and test again with query 1.6

### Verification Checklist

- [ ] User table has role column
- [ ] JWT includes user_role claim
- [ ] Policies reference auth.jwt() -> 'user_role'
- [ ] Admin users have correct role value

---

## Task 2: Test Service Account Access Configuration

### Purpose
Verify the service account UUID (00000000-0000-0000-0000-000000000000) is properly configured and the Affiliation migration was successful.

### Steps

1. **Run verification queries from TASK-2-SERVICE-ACCOUNT-VERIFICATION.sql**

   Critical queries:
   ```sql
   -- 2.3: Check records created by service account
   SELECT 'Affiliation' as table_name, COUNT(*) as records_created
   FROM "Affiliation"
   WHERE "createdBy" = '00000000-0000-0000-0000-000000000000';

   -- 2.5: Verify NO service_role strings remain
   SELECT COUNT(*) as service_role_count
   FROM "Affiliation"
   WHERE "createdBy"::text = 'service_role';

   -- 2.6: Check audit records
   SELECT COUNT(*) as total_audit_records,
          COUNT(DISTINCT affiliation_id) as unique_affiliations
   FROM affiliation_backfill_audit;

   -- 2.8: Check OTHER tables for service_role
   SELECT 'Person' as table_name, COUNT(*) as service_role_count
   FROM "Person"
   WHERE "createdBy"::text = 'service_role'
   UNION ALL
   SELECT 'Statement', COUNT(*)
   FROM "Statement"
   WHERE "createdBy"::text = 'service_role';
   ```

2. **Expected Results**
   - Query 2.3: Should show count > 0 (Affiliation records with service account UUID)
   - Query 2.5: Should return 0 (✅ migration complete)
   - Query 2.6: Should show audit records from migration
   - Query 2.8: Should return 0 for all tables

3. **If service_role strings still exist**

   **Action Required**: Re-run Affiliation migration

   Refer to: `SUPABASE-AFFILIATION-BACKFILL-2025-10-11.md`

4. **If OTHER tables have service_role strings**

   **Action Required**: Create similar migration for those tables

   Use Affiliation migration as template.

### Verification Checklist

- [ ] Affiliation table has 0 'service_role' strings
- [ ] Affiliation table has records with service account UUID
- [ ] affiliation_backfill_audit has migration records
- [ ] No other tables have 'service_role' strings
- [ ] Export affiliation_backfill_audit to CSV for backup

---

## Task 3: Standardize Policy Naming Conventions

### Purpose
Rename RLS policies to follow consistent naming convention: `{table}_{operation}_{scope}`

### ⚠️ WARNING: DESTRUCTIVE OPERATION

This task involves dropping and recreating policies. **DO NOT PROCEED** without:
1. Full database backup
2. Testing in staging environment
3. Confirmation from team

### Steps

1. **Backup current policies**

   Run query 3.3 from TASK-3-POLICY-NAMING-STANDARDIZATION.sql:
   ```sql
   SELECT format(
     'CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s USING (%s)%s;',
     policyname, schemaname, tablename,
     CASE WHEN permissive = 'PERMISSIVE' THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END,
     cmd, array_to_string(roles, ', '),
     COALESCE(qual, 'true'),
     CASE WHEN with_check IS NOT NULL THEN ' WITH CHECK (' || with_check || ')' ELSE '' END
   ) as backup_sql
   FROM pg_policies
   WHERE schemaname = 'public';
   ```

   Save output to file: `/tmp/policy-backup-2025-10-11.sql`

2. **Analyze current naming patterns**

   Run queries 3.1 and 3.2 to see inconsistencies:
   ```sql
   SELECT tablename, policyname,
     CASE
       WHEN policyname LIKE 'insert_%' THEN '{operation}_{table}'
       WHEN policyname LIKE '%_insert_%' THEN '{table}_{operation}_{modifier}'
       ELSE 'other'
     END as pattern
   FROM pg_policies
   WHERE schemaname = 'public'
   ORDER BY pattern, tablename;
   ```

3. **Test on ONE table first**

   Use Person table as example (query 3.5):
   ```sql
   BEGIN;

   DROP POLICY IF EXISTS insert_Person ON "Person";
   DROP POLICY IF EXISTS select_Person ON "Person";
   DROP POLICY IF EXISTS update_Person ON "Person";
   DROP POLICY IF EXISTS delete_Person ON "Person";

   CREATE POLICY Person_insert_authenticated ON "Person"
     AS PERMISSIVE FOR INSERT TO authenticated
     USING (true) WITH CHECK (true);

   CREATE POLICY Person_select_authenticated ON "Person"
     AS PERMISSIVE FOR SELECT TO authenticated
     USING (true);

   CREATE POLICY Person_update_authenticated ON "Person"
     AS PERMISSIVE FOR UPDATE TO authenticated
     USING (true) WITH CHECK (true);

   CREATE POLICY Person_delete_authenticated ON "Person"
     AS PERMISSIVE FOR DELETE TO authenticated
     USING (true);

   -- Verify
   SELECT policyname FROM pg_policies WHERE tablename = 'Person';

   -- Test application still works!
   -- If OK: COMMIT;
   -- If broken: ROLLBACK;
   ```

4. **Test application functionality**
   - Try CRUD operations on Person records
   - Verify RLS works for different user roles
   - Check API endpoints that use Person table

5. **If test succeeds, apply to remaining tables**

   Run query 3.4 to generate rename scripts for all tables.

   Execute in batches:
   - Batch 1: Person-related tables (Person, PersonNationality)
   - Batch 2: Content tables (Case, Statement, Source)
   - Batch 3: User tables (User, Session, ApiKey)
   - Batch 4: Other tables

6. **Monitor for RLS errors**

   Check Supabase logs for any RLS policy errors after each batch.

### Proposed Naming Standard

**Current inconsistencies**:
- `insert_Person` (operation first)
- `Affiliation_insert_owner_or_admin` (table first)
- `public_read_Country` (access level first)

**New standard**: `{table}_{operation}_{scope}`

Examples:
- `Person_insert_authenticated`
- `Person_select_authenticated`
- `Person_update_authenticated`
- `Person_delete_authenticated`
- `Country_select_public`
- `Country_all_admin`
- `Affiliation_select_owner_or_admin` (already correct)

### Verification Checklist

- [ ] Backup all policies to SQL file
- [ ] Test rename on Person table in transaction
- [ ] Verify application works after test rename
- [ ] Apply to remaining tables in batches
- [ ] Monitor Supabase logs for RLS errors
- [ ] Update any code that references policy names
- [ ] Document new naming convention

### Rollback Plan

If issues occur:
1. ROLLBACK transaction immediately
2. Restore policies from backup SQL file
3. Investigate which policy is causing issues
4. Fix policy logic before retrying

---

## Task 4: Set Retention Policy for affiliation_backfill_audit

### Purpose
Automatically delete old audit records to prevent table bloat while maintaining compliance requirements.

### ⚠️ WARNING: CONTAINS DELETE OPERATIONS

This task will permanently delete old audit records. **DO NOT PROCEED** without:
1. Exporting current audit data to CSV
2. Confirming retention period with team
3. Understanding compliance requirements

### Steps

1. **Check if pg_cron is available**

   Run query 4.1 from TASK-4-AUDIT-TABLE-RETENTION.sql:
   ```sql
   SELECT extname, extversion
   FROM pg_extension
   WHERE extname IN ('pg_cron', 'pg_agent');
   ```

2. **Analyze current audit data**

   Run query 4.2:
   ```sql
   SELECT
     COUNT(*) as total_records,
     MIN(updated_at) as oldest_record,
     MAX(updated_at) as newest_record,
     EXTRACT(DAY FROM NOW() - MIN(updated_at)) as days_of_data,
     pg_size_pretty(pg_total_relation_size('affiliation_backfill_audit')) as table_size
   FROM affiliation_backfill_audit;
   ```

3. **Export current data to CSV** (REQUIRED before any deletion)

   Option A - Supabase SQL Editor:
   ```sql
   SELECT * FROM affiliation_backfill_audit ORDER BY updated_at DESC;
   ```
   Then click "Export" → CSV → Download

   Option B - psql command:
   ```sql
   COPY (
     SELECT * FROM affiliation_backfill_audit ORDER BY updated_at DESC
   ) TO '/tmp/affiliation_backfill_audit_export_2025-10-11.csv'
   WITH (FORMAT CSV, HEADER true);
   ```

4. **Decide retention period**

   Recommended options:
   - **30 days**: Minimal retention, saves storage
   - **90 days**: Standard retention (RECOMMENDED)
   - **180 days**: Extended compliance retention
   - **365 days**: Annual audit retention

   **Choose**: _____ days (default: 90)

5. **Create cleanup function**

   Run query 4.3:
   ```sql
   CREATE OR REPLACE FUNCTION cleanup_affiliation_audit(retention_days INTEGER DEFAULT 90)
   RETURNS TABLE(deleted_count BIGINT, oldest_kept TIMESTAMPTZ)
   LANGUAGE plpgsql
   SECURITY DEFINER
   AS $$
   DECLARE
     v_deleted_count BIGINT;
     v_oldest_kept TIMESTAMPTZ;
     v_cutoff_date TIMESTAMPTZ;
   BEGIN
     v_cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;

     DELETE FROM affiliation_backfill_audit
     WHERE updated_at < v_cutoff_date;

     GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

     SELECT MIN(updated_at) INTO v_oldest_kept
     FROM affiliation_backfill_audit;

     RETURN QUERY SELECT v_deleted_count, v_oldest_kept;
   END;
   $$;
   ```

6. **Test cleanup (DRY RUN)**

   Preview what will be deleted:
   ```sql
   SELECT COUNT(*) as would_delete,
          MIN(updated_at) as oldest_to_delete,
          MAX(updated_at) as newest_to_delete
   FROM affiliation_backfill_audit
   WHERE updated_at < NOW() - INTERVAL '90 days';
   ```

7. **Schedule automatic cleanup**

   **If pg_cron is available**, run query 4.4:
   ```sql
   SELECT cron.schedule(
     'cleanup-affiliation-audit',
     '0 2 * * 0',  -- Every Sunday at 2 AM UTC
     $$SELECT cleanup_affiliation_audit(90)$$
   );
   ```

   **If pg_cron is NOT available**:
   - Set up external cron job on server
   - Or manually run cleanup monthly
   - Or use Supabase Edge Function with scheduled trigger

8. **Verify scheduled job**

   ```sql
   SELECT * FROM cron.job WHERE command LIKE '%cleanup_affiliation_audit%';
   ```

9. **Monitor cleanup runs**

   Run query 4.7 periodically:
   ```sql
   SELECT jobid, start_time, end_time, status, return_message
   FROM cron.job_run_details
   WHERE command LIKE '%cleanup_affiliation_audit%'
   ORDER BY start_time DESC
   LIMIT 10;
   ```

### Retention Periods by Use Case

| Use Case | Retention | Rationale |
|----------|-----------|-----------|
| Development/Testing | 30 days | Short-term debugging only |
| Production (Standard) | 90 days | Balance storage vs. audit trail |
| Compliance (Extended) | 180 days | Regulatory requirements |
| Financial/Legal | 365 days | Annual audit cycles |
| Permanent Archive | Never delete | Export to cold storage instead |

### Verification Checklist

- [ ] Export current audit data to CSV backup
- [ ] Choose retention period (default: 90 days)
- [ ] Create cleanup function
- [ ] Test with DRY RUN query
- [ ] Schedule automatic cleanup (pg_cron or external)
- [ ] Verify scheduled job is active
- [ ] Set calendar reminder to monitor cleanup runs
- [ ] Document retention policy in team wiki

### Rollback Plan

If too much data is deleted:
1. Restore from CSV export (step 3)
2. Re-import using psql COPY command
3. Adjust retention period
4. Re-schedule cleanup job

---

## Execution Timeline

### Phase 1: Read-Only Verification (Day 1)
- [ ] Task 1: Verify JWT tokens (30 min)
- [ ] Task 2: Service account verification (30 min)
- [ ] Export all audit data to CSV (15 min)
- [ ] Create full database backup (30 min)

### Phase 2: Low-Risk Changes (Day 2-3)
- [ ] Task 4: Create retention cleanup function (1 hour)
- [ ] Task 4: Schedule automatic cleanup (30 min)
- [ ] Monitor for 24 hours

### Phase 3: High-Risk Changes (Day 4-5 - Staging Only)
- [ ] Task 3: Test policy renaming on ONE table in staging (2 hours)
- [ ] Task 3: Verify staging application works (2 hours)
- [ ] Task 3: Apply to remaining tables in staging (4 hours)
- [ ] Full regression testing in staging (1 day)

### Phase 4: Production Deployment (Day 6)
- [ ] Task 3: Apply policy renaming to production (4 hours)
- [ ] Monitor production for 48 hours
- [ ] Document new naming convention

## Emergency Contacts

If issues occur during execution:

1. **Database Issues**: Rollback transaction immediately
2. **RLS Errors**: Check Supabase logs for policy violations
3. **Application Broken**: Restore from backup SQL files
4. **Data Loss**: Restore from CSV exports

## Success Criteria

- ✅ All JWT tokens include user_role claim
- ✅ Service account UUID properly configured
- ✅ No 'service_role' strings in any table
- ✅ All policies follow standard naming: {table}_{operation}_{scope}
- ✅ Audit retention cleanup runs automatically
- ✅ Application functions correctly after changes
- ✅ No RLS policy errors in logs

## Files & Documentation

**Generated Files** (in `/tmp`):
- `rls-audit-report-2025-10-11.json` - Full audit report (JSON)
- `RLS-AUDIT-SUMMARY-2025-10-11.md` - Audit analysis & recommendations
- `TASK-1-JWT-VERIFICATION.sql` - JWT verification queries
- `TASK-2-SERVICE-ACCOUNT-VERIFICATION.sql` - Service account checks
- `TASK-3-POLICY-NAMING-STANDARDIZATION.sql` - Policy rename scripts
- `TASK-4-AUDIT-TABLE-RETENTION.sql` - Retention cleanup scripts
- `RLS-SECURITY-TASKS-EXECUTION-GUIDE.md` - This guide

**Previous Documentation**:
- `SUPABASE-AFFILIATION-BACKFILL-2025-10-11.md` - Affiliation migration log
- `AFFILIATION-MIGRATION-ACTION-PLAN.md` - Migration action plan
- `IMMEDIATE-VERIFICATION-QUERIES.sql` - Quick verification queries

---

**Document Version**: 1.0
**Last Updated**: 2025-10-11
**Author**: Claude Code Assistant
**Status**: Ready for Execution
