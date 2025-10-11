-- ============================================================================
-- TASK 1: VERIFY JWT TOKENS INCLUDE user_role CLAIM
-- ============================================================================
-- Run these queries in Supabase SQL Editor to verify JWT configuration
-- All queries are READ-ONLY and safe to execute
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 1.1: Check if custom JWT claims are configured via auth hook
-- -----------------------------------------------------------------------------
-- This queries the auth schema to find any custom claim configuration

SELECT
  'Auth Hook Configuration' as check_name,
  EXISTS (
    SELECT 1
    FROM information_schema.routines
    WHERE routine_schema = 'auth'
    AND routine_name LIKE '%hook%'
  ) as has_auth_hook;

-- -----------------------------------------------------------------------------
-- 1.2: List all auth schema functions (to find JWT customization)
-- -----------------------------------------------------------------------------

SELECT
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'auth'
AND routine_name LIKE '%jwt%' OR routine_name LIKE '%claim%' OR routine_name LIKE '%token%'
ORDER BY routine_name;

-- -----------------------------------------------------------------------------
-- 1.3: Check User table for role-related columns
-- -----------------------------------------------------------------------------

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'User'
AND column_name ILIKE '%role%'
ORDER BY ordinal_position;

-- -----------------------------------------------------------------------------
-- 1.4: Sample User roles to understand role structure
-- -----------------------------------------------------------------------------

SELECT
  role,
  COUNT(*) as user_count,
  array_agg(DISTINCT email) FILTER (WHERE email IS NOT NULL) as sample_emails
FROM "User"
GROUP BY role
ORDER BY user_count DESC;

-- -----------------------------------------------------------------------------
-- 1.5: Check for JWT template in Supabase config (if accessible)
-- -----------------------------------------------------------------------------
-- Note: This may not return results if config is not exposed to SQL

SELECT
  name,
  setting
FROM pg_settings
WHERE name LIKE '%jwt%' OR name LIKE '%auth%'
ORDER BY name;

-- -----------------------------------------------------------------------------
-- 1.6: Test current JWT structure (if you're authenticated)
-- -----------------------------------------------------------------------------
-- Run this while authenticated to see your JWT claims

SELECT
  auth.uid() as user_id,
  auth.jwt() as full_jwt_payload,
  auth.jwt() -> 'user_role' as user_role_claim,
  auth.jwt() -> 'role' as role_claim,
  auth.jwt() -> 'email' as email_claim;

-- -----------------------------------------------------------------------------
-- 1.7: Check RLS policies that reference user_role claim
-- -----------------------------------------------------------------------------

SELECT
  schemaname,
  tablename,
  policyname,
  qual as policy_condition,
  with_check as with_check_condition
FROM pg_policies
WHERE qual::text LIKE '%user_role%'
   OR with_check::text LIKE '%user_role%'
ORDER BY tablename, policyname;

-- -----------------------------------------------------------------------------
-- EXPECTED RESULTS:
-- -----------------------------------------------------------------------------
-- 1.4: Should show user roles (e.g., 'ADMIN', 'USER', etc.)
-- 1.6: Should show JWT with user_role claim if properly configured
-- 1.7: Should show all policies using auth.jwt() -> 'user_role'
--
-- If 1.6 returns NULL for user_role_claim:
--   - JWT template needs to be configured in Supabase dashboard
--   - Go to: Authentication > Settings > JWT Template
--   - Add custom claim: "user_role": "{{ .Role }}" or similar
--
-- If 1.7 returns results but 1.6 is NULL:
--   - Policies expect user_role but it's not in JWT
--   - This will cause RLS failures for admin operations
-- ============================================================================
