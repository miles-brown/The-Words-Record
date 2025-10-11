-- ============================================================================
-- TASK 2: TEST SERVICE ACCOUNT ACCESS (UUID: 00000000-0000-0000-0000-000000000000)
-- ============================================================================
-- Run these queries in Supabase SQL Editor to verify service account config
-- All queries are READ-ONLY and safe to execute
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 2.1: Check if service account UUID exists in auth.users
-- -----------------------------------------------------------------------------

SELECT
  'Service Account in auth.users' as check_name,
  EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = '00000000-0000-0000-0000-000000000000'::uuid
  ) as exists,
  (
    SELECT email
    FROM auth.users
    WHERE id = '00000000-0000-0000-0000-000000000000'::uuid
  ) as service_account_email;

-- -----------------------------------------------------------------------------
-- 2.2: Check if service account exists in public.User table
-- -----------------------------------------------------------------------------

SELECT
  'Service Account in public.User' as check_name,
  EXISTS (
    SELECT 1
    FROM "User"
    WHERE id = '00000000-0000-0000-0000-000000000000'::uuid
  ) as exists,
  (
    SELECT row_to_json(u.*)
    FROM "User" u
    WHERE id = '00000000-0000-0000-0000-000000000000'::uuid
  ) as service_account_details;

-- -----------------------------------------------------------------------------
-- 2.3: Find all records created by service account across tables
-- -----------------------------------------------------------------------------

SELECT 'Affiliation' as table_name, COUNT(*) as records_created
FROM "Affiliation"
WHERE "createdBy" = '00000000-0000-0000-0000-000000000000'
UNION ALL
SELECT 'Person', COUNT(*)
FROM "Person"
WHERE "createdBy" = '00000000-0000-0000-0000-000000000000'
UNION ALL
SELECT 'Source', COUNT(*)
FROM "Source"
WHERE "createdBy" = '00000000-0000-0000-0000-000000000000'
UNION ALL
SELECT 'Statement', COUNT(*)
FROM "Statement"
WHERE "createdBy" = '00000000-0000-0000-0000-000000000000'
UNION ALL
SELECT 'Tag', COUNT(*)
FROM "Tag"
WHERE "createdBy" = '00000000-0000-0000-0000-000000000000'
UNION ALL
SELECT 'HarvestJob', COUNT(*)
FROM "HarvestJob"
WHERE "createdBy" = '00000000-0000-0000-0000-000000000000'
ORDER BY records_created DESC;

-- -----------------------------------------------------------------------------
-- 2.4: Check for RLS policies that explicitly reference service account UUID
-- -----------------------------------------------------------------------------

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check
FROM pg_policies
WHERE qual::text LIKE '%00000000-0000-0000-0000-000000000000%'
   OR with_check::text LIKE '%00000000-0000-0000-0000-000000000000%'
ORDER BY tablename, policyname;

-- -----------------------------------------------------------------------------
-- 2.5: Check for any remaining 'service_role' string placeholders
-- -----------------------------------------------------------------------------
-- This verifies the Affiliation migration was complete

SELECT
  'Affiliation with service_role string' as check_name,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ Migration complete - no service_role strings found'
    ELSE '❌ Migration incomplete - service_role strings still exist'
  END as status
FROM "Affiliation"
WHERE "createdBy"::text = 'service_role';

-- -----------------------------------------------------------------------------
-- 2.6: Verify affiliation_backfill_audit records
-- -----------------------------------------------------------------------------

SELECT
  COUNT(*) as total_audit_records,
  COUNT(DISTINCT affiliation_id) as unique_affiliations_updated,
  MIN(updated_at) as first_update,
  MAX(updated_at) as last_update,
  array_agg(DISTINCT old_created_by) as old_values_found
FROM affiliation_backfill_audit;

-- -----------------------------------------------------------------------------
-- 2.7: Sample audit records to verify migration
-- -----------------------------------------------------------------------------

SELECT
  affiliation_id,
  old_created_by,
  new_created_by,
  updated_at
FROM affiliation_backfill_audit
ORDER BY updated_at DESC
LIMIT 10;

-- -----------------------------------------------------------------------------
-- 2.8: Check all tables for 'service_role' in createdBy columns
-- -----------------------------------------------------------------------------

SELECT
  'Case' as table_name,
  COUNT(*) as service_role_count
FROM "Case"
WHERE "createdBy"::text = 'service_role'
UNION ALL
SELECT 'Statement', COUNT(*)
FROM "Statement"
WHERE "createdBy"::text = 'service_role'
UNION ALL
SELECT 'Person', COUNT(*)
FROM "Person"
WHERE "createdBy"::text = 'service_role'
UNION ALL
SELECT 'Organization', COUNT(*)
FROM "Organization"
WHERE "createdBy"::text = 'service_role'
UNION ALL
SELECT 'Source', COUNT(*)
FROM "Source"
WHERE "createdBy"::text = 'service_role'
UNION ALL
SELECT 'Tag', COUNT(*)
FROM "Tag"
WHERE "createdBy"::text = 'service_role'
UNION ALL
SELECT 'HarvestJob', COUNT(*)
FROM "HarvestJob"
WHERE "createdBy"::text = 'service_role'
ORDER BY service_role_count DESC;

-- -----------------------------------------------------------------------------
-- EXPECTED RESULTS:
-- -----------------------------------------------------------------------------
-- 2.1: May return FALSE - service account might not exist in auth.users
--      (This is OK if using UUID as a placeholder only)
--
-- 2.2: Should return TRUE if service account is used in application
--
-- 2.3: Should show count of records created by service account UUID
--      Affiliation should have highest count after migration
--
-- 2.5: Should return 0 count (✅ status) - migration complete
--      If > 0, migration needs to be re-run
--
-- 2.6: Should show audit records matching migration scope
--
-- 2.8: Should return 0 for all tables
--      If > 0, those tables need similar migration
--
-- ACTION REQUIRED IF:
-- - Query 2.5 shows count > 0: Re-run Affiliation migration
-- - Query 2.8 shows count > 0: Create migration scripts for those tables
-- ============================================================================
