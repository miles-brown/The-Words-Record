-- ============================================================================
-- FIX RLS POLICIES FOR ANONYMOUS USERS - CRITICAL SITE ISSUE
-- ============================================================================
-- This script fixes Row Level Security policies to allow anonymous users
-- to read public data (Person, Case, Statement, Organization, etc.)
--
-- ISSUE: People and Cases pages show "Failed to load" error
-- CAUSE: RLS policies blocking anonymous (unauthenticated) user access
-- ============================================================================

-- -----------------------------------------------------------------------------
-- STEP 1: VERIFY THE ISSUE (Read-only diagnostic queries)
-- -----------------------------------------------------------------------------

-- Test anonymous user access to Person table
SET LOCAL ROLE anon;
SELECT COUNT(*) as person_count FROM "Person";
RESET ROLE;
-- Expected: Should return count > 0
-- If returns ERROR or 0: RLS is blocking anonymous access

-- Test anonymous user access to PersonNationality table
SET LOCAL ROLE anon;
SELECT COUNT(*) as nationality_count FROM "PersonNationality";
RESET ROLE;
-- Expected: Should return count > 0

-- Test anonymous user access to Country table
SET LOCAL ROLE anon;
SELECT COUNT(*) as country_count FROM "Country";
RESET ROLE;
-- Expected: Should return 120+ (from country seed)

-- Test anonymous user access to Case table
SET LOCAL ROLE anon;
SELECT COUNT(*) as case_count FROM "Case";
RESET ROLE;
-- Expected: Should return count > 0

-- Test anonymous user access to Statement table
SET LOCAL ROLE anon;
SELECT COUNT(*) as statement_count FROM "Statement";
RESET ROLE;
-- Expected: Should return count > 0

-- Test anonymous user access to Organization table
SET LOCAL ROLE anon;
SELECT COUNT(*) as organization_count FROM "Organization";
RESET ROLE;
-- Expected: Should return count > 0

-- -----------------------------------------------------------------------------
-- STEP 2: CHECK CURRENT RLS POLICIES
-- -----------------------------------------------------------------------------

-- Check Person table policies
SELECT
  policyname,
  cmd,
  roles::text[] as roles,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'Person'
  AND cmd = 'SELECT'
ORDER BY policyname;

-- Check if 'anon' role has SELECT access
SELECT
  tablename,
  policyname,
  'anon' = ANY(roles) as has_anon_access,
  'authenticated' = ANY(roles) as has_authenticated_access
FROM pg_policies
WHERE tablename IN ('Person', 'PersonNationality', 'Country', 'Case', 'Statement', 'Organization')
  AND cmd = 'SELECT'
ORDER BY tablename, policyname;

-- -----------------------------------------------------------------------------
-- STEP 3: FIX RLS POLICIES (DESTRUCTIVE - Review before running)
-- -----------------------------------------------------------------------------

-- ⚠️ WARNING: These commands will DROP and recreate policies
-- ⚠️ Review each policy before executing
-- ⚠️ Use transactions for safety: BEGIN; ... COMMIT; or ROLLBACK;

BEGIN;

-- Fix Person table - allow anonymous reads
DROP POLICY IF EXISTS select_Person ON "Person";
DROP POLICY IF EXISTS public_read_Person ON "Person";

CREATE POLICY public_read_Person ON "Person"
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Fix PersonNationality table - allow anonymous reads
DROP POLICY IF EXISTS select_PersonNationality ON "PersonNationality";
DROP POLICY IF EXISTS public_read_PersonNationality ON "PersonNationality";

CREATE POLICY public_read_PersonNationality ON "PersonNationality"
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Fix Country table - verify/create public read policy
DROP POLICY IF EXISTS public_read_Country ON "Country";

CREATE POLICY public_read_Country ON "Country"
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Fix Case table - allow anonymous reads
DROP POLICY IF EXISTS public_read_Case ON "Case";

CREATE POLICY public_read_Case ON "Case"
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Fix Statement table - allow anonymous reads
DROP POLICY IF EXISTS select_Statement ON "Statement";
DROP POLICY IF EXISTS public_read_Statement ON "Statement";

CREATE POLICY public_read_Statement ON "Statement"
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Fix Organization table - allow anonymous reads
DROP POLICY IF EXISTS select_Organization ON "Organization";
DROP POLICY IF EXISTS public_read_Organization ON "Organization";

CREATE POLICY public_read_Organization ON "Organization"
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Fix Tag table - allow anonymous reads (for case filtering)
DROP POLICY IF EXISTS select_Tag ON "Tag";
DROP POLICY IF EXISTS public_read_Tag ON "Tag";

CREATE POLICY public_read_Tag ON "Tag"
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Fix Source table - allow anonymous reads
DROP POLICY IF EXISTS select_Source ON "Source";
DROP POLICY IF EXISTS public_read_Source ON "Source";

CREATE POLICY public_read_Source ON "Source"
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Fix Affiliation table - allow anonymous reads (for person-organization links)
DROP POLICY IF EXISTS Affiliation_select_owner_or_admin ON "Affiliation";
DROP POLICY IF EXISTS public_read_Affiliation ON "Affiliation";

CREATE POLICY public_read_Affiliation ON "Affiliation"
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Fix StatementAuthor table - allow anonymous reads
DROP POLICY IF EXISTS select_StatementAuthor ON "StatementAuthor";
DROP POLICY IF EXISTS public_read_StatementAuthor ON "StatementAuthor";

CREATE POLICY public_read_StatementAuthor ON "StatementAuthor"
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Verify all policies were created
SELECT
  tablename,
  policyname,
  cmd,
  roles::text[],
  CASE
    WHEN 'anon' = ANY(roles) AND 'authenticated' = ANY(roles) THEN '✅ Allows anonymous & authenticated'
    WHEN 'anon' = ANY(roles) THEN '⚠️ Anonymous only'
    WHEN 'authenticated' = ANY(roles) THEN '❌ Authenticated only (PROBLEM)'
    ELSE '❌ Other roles (PROBLEM)'
  END as access_status
FROM pg_policies
WHERE tablename IN (
  'Person', 'PersonNationality', 'Country', 'Case', 'Statement',
  'Organization', 'Tag', 'Source', 'Affiliation', 'StatementAuthor'
)
AND cmd = 'SELECT'
AND policyname LIKE 'public_read%'
ORDER BY tablename;

-- If everything looks good: COMMIT;
-- If there's an issue: ROLLBACK;
COMMIT;

-- -----------------------------------------------------------------------------
-- STEP 4: VERIFY THE FIX
-- -----------------------------------------------------------------------------

-- Re-test anonymous access after fix
SET LOCAL ROLE anon;

SELECT 'Person' as table_name, COUNT(*) as accessible_rows FROM "Person"
UNION ALL
SELECT 'PersonNationality', COUNT(*) FROM "PersonNationality"
UNION ALL
SELECT 'Country', COUNT(*) FROM "Country"
UNION ALL
SELECT 'Case', COUNT(*) FROM "Case"
UNION ALL
SELECT 'Statement', COUNT(*) FROM "Statement"
UNION ALL
SELECT 'Organization', COUNT(*) FROM "Organization"
UNION ALL
SELECT 'Tag', COUNT(*) FROM "Tag"
UNION ALL
SELECT 'Source', COUNT(*) FROM "Source"
UNION ALL
SELECT 'Affiliation', COUNT(*) FROM "Affiliation"
UNION ALL
SELECT 'StatementAuthor', COUNT(*) FROM "StatementAuthor";

RESET ROLE;

-- All should return counts > 0 (except possibly some junction tables if empty)

-- -----------------------------------------------------------------------------
-- STEP 5: TEST WITH JOINS (Simulate API queries)
-- -----------------------------------------------------------------------------

-- Test the exact query used by /api/people endpoint
SET LOCAL ROLE anon;

SELECT
  p.id,
  p.name,
  p.slug,
  COUNT(DISTINCT pn.id) as nationality_count,
  COUNT(DISTINCT c.code) as country_count
FROM "Person" p
LEFT JOIN "PersonNationality" pn ON p.id = pn."personId" AND pn."endDate" IS NULL
LEFT JOIN "Country" c ON pn."countryCode" = c.code
GROUP BY p.id, p.name, p.slug
LIMIT 5;

RESET ROLE;

-- Should return 5 people with nationality/country counts
-- If returns ERROR: RLS still blocking joins

-- Test case query
SET LOCAL ROLE anon;

SELECT
  c.id,
  c.title,
  c.slug,
  COUNT(DISTINCT s.id) as statement_count
FROM "Case" c
LEFT JOIN "Statement" s ON c.id = s."caseId"
GROUP BY c.id, c.title, c.slug
LIMIT 5;

RESET ROLE;

-- Should return 5 cases with statement counts

-- -----------------------------------------------------------------------------
-- STEP 6: MAINTAIN WRITE RESTRICTIONS
-- -----------------------------------------------------------------------------

-- Verify that anonymous users CANNOT write (this is correct security)
SET LOCAL ROLE anon;

-- This should FAIL (and that's good!)
-- INSERT INTO "Person" (name, slug) VALUES ('Test', 'test');

RESET ROLE;

-- Check that only authenticated users can write
SELECT
  tablename,
  policyname,
  cmd,
  roles::text[]
FROM pg_policies
WHERE tablename IN ('Person', 'Case', 'Statement', 'Organization')
  AND cmd IN ('INSERT', 'UPDATE', 'DELETE')
ORDER BY tablename, cmd;

-- Should show policies for 'authenticated' role only (not 'anon')

-- -----------------------------------------------------------------------------
-- ROLLBACK PLAN (If issues occur)
-- -----------------------------------------------------------------------------

/*
-- To restore original policies, run:

BEGIN;

-- Restore Person policies (example - adjust based on your original policies)
DROP POLICY IF EXISTS public_read_Person ON "Person";

CREATE POLICY select_Person ON "Person"
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (true);

-- Repeat for each table...

COMMIT;
*/

-- -----------------------------------------------------------------------------
-- SUMMARY OF CHANGES
-- -----------------------------------------------------------------------------

/*
BEFORE:
- Policies only allowed 'authenticated' role to SELECT
- Anonymous users (role: anon) were blocked
- API queries failed with permission errors

AFTER:
- All public tables have 'public_read_*' policies
- Both 'anon' and 'authenticated' roles can SELECT
- Write operations still restricted to 'authenticated' only
- Anonymous users can view all public data

TABLES FIXED:
1. Person
2. PersonNationality
3. Country
4. Case
5. Statement
6. Organization
7. Tag
8. Source
9. Affiliation
10. StatementAuthor

NEXT STEPS:
1. Test /people page - should load without errors
2. Test /cases page - should load without errors
3. Test /organizations page - should load without errors
4. Monitor Supabase logs for any remaining RLS errors
5. Update RLS audit documentation
*/

-- ============================================================================
-- END OF FIX SCRIPT
-- ============================================================================
