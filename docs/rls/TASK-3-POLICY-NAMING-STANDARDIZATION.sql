-- ============================================================================
-- TASK 3: STANDARDIZE POLICY NAMING CONVENTIONS
-- ============================================================================
-- This file contains:
-- 1. Analysis of current naming inconsistencies
-- 2. Proposed standardized naming convention
-- 3. Safe DROP + CREATE statements to rename all policies
--
-- ⚠️ WARNING: This contains DESTRUCTIVE operations (DROP POLICY)
-- DO NOT RUN without confirmation and backup
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 3.1: Current Policy Naming Analysis
-- -----------------------------------------------------------------------------
-- Run this first to see current inconsistencies

SELECT
  tablename,
  policyname,
  cmd as operation,
  CASE
    WHEN policyname LIKE '%_insert_%' OR policyname LIKE '%_select_%' OR policyname LIKE '%_update_%' OR policyname LIKE '%_delete_%'
      THEN 'Pattern: {table}_{operation}_{modifier}'
    WHEN policyname LIKE 'insert_%' OR policyname LIKE 'select_%' OR policyname LIKE 'update_%' OR policyname LIKE 'delete_%'
      THEN 'Pattern: {operation}_{table}'
    WHEN policyname LIKE 'public_read_%'
      THEN 'Pattern: public_read_{table}'
    WHEN policyname LIKE 'admin_write_%'
      THEN 'Pattern: admin_write_{table}'
    ELSE 'Pattern: other'
  END as naming_pattern
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY naming_pattern, tablename, policyname;

-- -----------------------------------------------------------------------------
-- 3.2: Count policies by naming pattern
-- -----------------------------------------------------------------------------

SELECT
  naming_pattern,
  COUNT(*) as policy_count
FROM (
  SELECT
    CASE
      WHEN policyname LIKE '%_insert_%' OR policyname LIKE '%_select_%' OR policyname LIKE '%_update_%' OR policyname LIKE '%_delete_%'
        THEN '{table}_{operation}_{modifier}'
      WHEN policyname LIKE 'insert_%' OR policyname LIKE 'select_%' OR policyname LIKE 'update_%' OR policyname LIKE 'delete_%'
        THEN '{operation}_{table}'
      WHEN policyname LIKE 'public_read_%'
        THEN 'public_read_{table}'
      WHEN policyname LIKE 'admin_write_%'
        THEN 'admin_write_{table}'
      ELSE 'other'
    END as naming_pattern
  FROM pg_policies
  WHERE schemaname = 'public'
) patterns
GROUP BY naming_pattern
ORDER BY policy_count DESC;

-- -----------------------------------------------------------------------------
-- PROPOSED STANDARD: {table}_{operation}_{scope}
-- -----------------------------------------------------------------------------
-- Examples:
--   - Affiliation_select_owner_or_admin
--   - Person_insert_authenticated
--   - Country_select_public
--   - Country_all_admin
--
-- Benefits:
--   1. Table name first for easier sorting/grouping
--   2. Operation second (select, insert, update, delete, all)
--   3. Scope last (public, authenticated, owner, admin, owner_or_admin)
--   4. Consistent with existing Affiliation policies
--
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- 3.3: BACKUP - Generate policy definitions before dropping
-- -----------------------------------------------------------------------------
-- Run this to save current policy definitions to a backup file

SELECT
  format(
    E'-- Backup: %s.%s\nCREATE POLICY %I ON %I.%I\n  AS %s\n  FOR %s\n  TO %s\n  USING (%s)%s;\n',
    schemaname,
    policyname,
    policyname,
    schemaname,
    tablename,
    CASE WHEN permissive = 'PERMISSIVE' THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END,
    cmd,
    array_to_string(roles, ', '),
    COALESCE(qual, 'true'),
    CASE WHEN with_check IS NOT NULL THEN E'\n  WITH CHECK (' || with_check || ')' ELSE '' END
  ) as backup_policy_sql
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- -----------------------------------------------------------------------------
-- 3.4: Generate DROP + CREATE statements for renaming
-- -----------------------------------------------------------------------------
-- ⚠️ DO NOT RUN THIS SECTION WITHOUT CONFIRMATION ⚠️
-- Copy the output and review before executing

-- Pattern 1: Rename {operation}_{table} -> {table}_{operation}_{scope}
-- Example: insert_Person -> Person_insert_authenticated

SELECT format(
  E'-- Rename: %s -> %s\nDROP POLICY %I ON %I;\nCREATE POLICY %I ON %I.%I\n  AS PERMISSIVE\n  FOR %s\n  TO %s\n  USING (%s)%s;\n',
  policyname,
  -- New name: {table}_{operation}_{scope}
  tablename || '_' || lower(cmd) || '_authenticated',
  policyname, -- old name for DROP
  tablename,
  tablename || '_' || lower(cmd) || '_authenticated', -- new name for CREATE
  schemaname,
  tablename,
  cmd,
  array_to_string(roles, ', '),
  COALESCE(qual, 'true'),
  CASE WHEN with_check IS NOT NULL THEN E'\n  WITH CHECK (' || with_check || ')' ELSE '' END
) as rename_policy_sql
FROM pg_policies
WHERE schemaname = 'public'
AND (
  policyname LIKE 'insert_%'
  OR policyname LIKE 'select_%'
  OR policyname LIKE 'update_%'
  OR policyname LIKE 'delete_%'
)
AND policyname NOT LIKE '%_insert_%' -- Exclude already standardized
AND policyname NOT LIKE '%_select_%'
AND policyname NOT LIKE '%_update_%'
AND policyname NOT LIKE '%_delete_%'
ORDER BY tablename, policyname;

-- Pattern 2: Keep public_read_{table} and admin_write_{table} as is
-- These are already well-named and consistent

-- Pattern 3: Affiliation policies are already standardized
-- Keep: Affiliation_insert_owner_or_admin, etc.

-- -----------------------------------------------------------------------------
-- 3.5: EXAMPLE - Rename single table's policies (Person table)
-- -----------------------------------------------------------------------------
-- ⚠️ DESTRUCTIVE - Only run after review ⚠️

/*
-- Example: Standardize Person table policies
BEGIN;

-- Backup current policies (run SELECT first to verify)
DROP POLICY IF EXISTS insert_Person ON "Person";
DROP POLICY IF EXISTS select_Person ON "Person";
DROP POLICY IF EXISTS update_Person ON "Person";
DROP POLICY IF EXISTS delete_Person ON "Person";

-- Recreate with standardized names
CREATE POLICY Person_insert_authenticated ON "Person"
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY Person_select_authenticated ON "Person"
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY Person_update_authenticated ON "Person"
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY Person_delete_authenticated ON "Person"
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING (true);

-- Verify policies were created correctly
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'Person';

-- If everything looks good: COMMIT;
-- If there's an issue: ROLLBACK;
COMMIT;
*/

-- -----------------------------------------------------------------------------
-- EXECUTION PLAN:
-- -----------------------------------------------------------------------------
-- 1. Run 3.3 to backup all policy definitions (save output to file)
-- 2. Run 3.4 to generate rename scripts (review output carefully)
-- 3. Test on one table first (use 3.5 as template)
-- 4. Verify application still works after rename
-- 5. Apply to remaining tables in batches
-- 6. Monitor for any RLS errors in logs
--
-- ROLLBACK STRATEGY:
-- - Keep backup from step 1
-- - If issues occur, restore original policy names from backup
-- - Test thoroughly in staging environment first
-- ============================================================================
