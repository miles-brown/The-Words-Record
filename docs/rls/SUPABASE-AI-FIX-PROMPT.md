# 🚨 URGENT: Fix RLS Policies for Anonymous Users

## Problem
My website pages are failing with "Failed to load people/cases" errors. The API endpoints are blocked by Row Level Security policies that don't allow anonymous (unauthenticated) users to read public data.

## Required Fix
I need to create `public_read_*` policies for all public-facing tables that allow BOTH `anon` and `authenticated` roles to SELECT data, while keeping write operations restricted to authenticated users only.

## Tables That Need Public Read Access

Please create policies for these tables to allow anonymous users to SELECT (read) data:

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

## SQL Fix Required

For EACH table above, please:

1. Drop any existing SELECT policies that restrict access
2. Create a new `public_read_{TableName}` policy that allows both `anon` and `authenticated` roles to SELECT

Example pattern for each table:

```sql
-- Drop existing restrictive SELECT policies
DROP POLICY IF EXISTS select_{TableName} ON "{TableName}";
DROP POLICY IF EXISTS {TableName}_select_owner_or_admin ON "{TableName}";

-- Create new public read policy
CREATE POLICY public_read_{TableName} ON "{TableName}"
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (true);
```

## Important Requirements

✅ Allow SELECT for both `anon` AND `authenticated` roles
✅ Keep all INSERT/UPDATE/DELETE policies restricted to `authenticated` only
✅ Use `USING (true)` for unrestricted read access
✅ Wrap everything in a transaction (BEGIN/COMMIT)

## Verification After Fix

After creating the policies, please verify with:

```sql
-- Test anonymous access
SET LOCAL ROLE anon;
SELECT COUNT(*) FROM "Person";
SELECT COUNT(*) FROM "PersonNationality";
SELECT COUNT(*) FROM "Country";
SELECT COUNT(*) FROM "Case";
SELECT COUNT(*) FROM "Statement";
RESET ROLE;
```

All queries should return counts > 0 (not errors).

## Expected Result

After this fix:
- Anonymous users can READ all public data ✅
- Anonymous users CANNOT write data ✅
- Website pages will load properly ✅
- API endpoints will return data successfully ✅

Please execute this fix immediately as it's blocking the entire website from functioning.
