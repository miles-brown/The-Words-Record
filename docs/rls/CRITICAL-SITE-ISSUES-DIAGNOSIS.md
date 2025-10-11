# Critical Site Issues - Diagnosis & Action Plan

**Date**: 2025-10-11
**Status**: 🚨 **CRITICAL** - Multiple user-facing pages non-functional

## Issues Reported

### 1. ❌ People Page - "Failed to load people"
**URL**: `/people`
**Error**: "Failed to load people. Please try again."
**Impact**: HIGH - Core functionality broken

### 2. ❌ Cases/Statements Page - "Failed to load cases"
**URL**: `/cases` (statements)
**Error**: "Failed to load cases. Please try again."
**Impact**: HIGH - Core functionality broken

### 3. ❌ Organization Detail Pages - 404 Error
**URL**: `/organizations/[slug]`
**Error**: 404 Page Not Found
**Impact**: HIGH - Individual organization pages inaccessible
**Note**: Organization list page (`/organizations`) works fine

## Root Cause Analysis

### Issue 1 & 2: API Failures (People & Cases Pages)

**Likely Causes**:

1. **RLS (Row Level Security) Blocking Queries** ⚠️ MOST LIKELY
   - Recent RLS audit shows all tables have policies enabled
   - Anonymous/unauthenticated users may be blocked from SELECT
   - Policies like `public_read_*` should allow SELECT but may not be working

2. **Database Connection Issues**
   - Prisma client not properly connected
   - Supabase connection pooling exhausted
   - Environment variables misconfigured

3. **PersonNationality Relation Issues**
   - Recent nationality migration added `PersonNationality` joins
   - If RLS blocks PersonNationality reads, entire query fails
   - API at [pages/api/people/index.ts:116-123](pages/api/people/index.ts#L116-L123) includes nationality relations

**Evidence from Code**:

```typescript
// pages/api/people/index.ts:100-125
let people = await prisma.person.findMany({
  where,
  skip,
  take: limitNum,
  orderBy,
  include: {
    _count: { select: { cases: true, statements: true } },
    statements: { where: { statementType: 'RESPONSE' }, select: { id: true } },
    nationalities: {  // ← This join may be blocked by RLS
      where: { endDate: null },
      include: { country: true },  // ← Country table also has RLS
      orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }]
    }
  }
})
```

**RLS Policy Check**:
- `Person` table: Has RLS enabled with 4 policies
- `PersonNationality` table: Has RLS enabled with 4 policies
- `Country` table: Has RLS enabled with `public_read_Country` + `admin_write_Country`

**Issue**: If `public_read_*` policies are not properly configured for anonymous users, the JOIN will fail.

### Issue 3: Organization 404s

**Root Cause**: Static Site Generation (SSG) with stale build

**Evidence**:
```typescript
// pages/organizations/[slug].tsx:566-578
export const getStaticPaths: GetStaticPaths = async () => {
  const organizations = await prisma.organization.findMany({
    select: { slug: true }
  })

  return {
    paths: organizations.map((org) => ({ params: { slug: org.slug } })),
    fallback: true  // ← Should handle new orgs, but may not be working
  }
}
```

**Problem**:
- Pages are pre-rendered at BUILD time only
- New organizations added after build are not in the static paths
- `fallback: true` should handle this, but may have issues:
  - Build-time Prisma query may have failed
  - ISR (Incremental Static Regeneration) not working
  - Need to rebuild/redeploy for new organizations

## Immediate Actions Required

### Priority 1: Fix RLS for Anonymous Users (People & Cases Pages)

**Step 1: Verify RLS is the issue**

Run in Supabase SQL Editor:

```sql
-- Test anonymous user access to Person table
SET LOCAL ROLE anon;
SELECT COUNT(*) FROM "Person";
RESET ROLE;

-- Test anonymous user access to PersonNationality table
SET LOCAL ROLE anon;
SELECT COUNT(*) FROM "PersonNationality";
RESET ROLE;

-- Test anonymous user access to Country table
SET LOCAL ROLE anon;
SELECT COUNT(*) FROM "Country";
RESET ROLE;

-- Test anonymous user access to Case table
SET LOCAL ROLE anon;
SELECT COUNT(*) FROM "Case";
RESET ROLE;
```

**Expected**: All should return counts > 0
**If returns 0 or error**: RLS is blocking anonymous access

**Step 2: Fix RLS policies for public read**

If RLS is blocking, run:

```sql
-- Fix Person table - allow anonymous reads
DROP POLICY IF EXISTS public_read_Person ON "Person";
CREATE POLICY public_read_Person ON "Person"
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Fix PersonNationality table - allow anonymous reads
DROP POLICY IF EXISTS public_read_PersonNationality ON "PersonNationality";
CREATE POLICY public_read_PersonNationality ON "PersonNationality"
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Verify Country table has public read (should already exist)
SELECT policyname, cmd, roles FROM pg_policies
WHERE tablename = 'Country' AND cmd = 'SELECT';

-- Fix Case table - allow anonymous reads
DROP POLICY IF EXISTS public_read_Case ON "Case";
CREATE POLICY public_read_Case ON "Case"
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Fix Statement table - allow anonymous reads
DROP POLICY IF EXISTS public_read_Statement ON "Statement";
CREATE POLICY public_read_Statement ON "Statement"
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (true);
```

**Step 3: Test API endpoints**

After fixing RLS:

```bash
# Test people API
curl 'http://localhost:3000/api/people?page=1&limit=1'

# Test cases API
curl 'http://localhost:3000/api/cases?page=1&limit=1'
```

### Priority 2: Fix Organization 404s

**Option A: Rebuild Site (Immediate fix)**

```bash
cd /Users/milesbrown/Documents/Who-Said-What/Who-Said-What
npm run build
# Then redeploy to Vercel
```

**Option B: Convert to Server-Side Rendering (Long-term fix)**

Change [pages/organizations/[slug].tsx](pages/organizations/[slug].tsx) from SSG to SSR:

```typescript
// Replace getStaticPaths and getStaticProps with:
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  if (!params?.slug || typeof params.slug !== 'string') {
    return { notFound: true }
  }

  try {
    const organization = await prisma.organization.findUnique({
      where: { slug: params.slug },
      include: {
        // ... existing includes
      }
    })

    if (!organization) {
      return { notFound: true }
    }

    return {
      props: {
        organization: JSON.parse(JSON.stringify(organization))
      }
    }
  } catch (error) {
    console.error('Error fetching organization:', error)
    return { notFound: true }
  }
}
```

**Option C: Hybrid - Keep SSG but add revalidation**

```typescript
// In getStaticProps, add:
return {
  props: { organization: ... },
  revalidate: 60 // Rebuild page every 60 seconds if accessed
}
```

### Priority 3: Check All Related Tables

**Run comprehensive RLS audit for anonymous access**:

```sql
-- Check all public-facing tables
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND cmd = 'SELECT'
  AND (policyname LIKE 'public_read%' OR policyname LIKE '%select%')
ORDER BY tablename;

-- Find tables with RLS enabled but NO anonymous/public read policy
SELECT DISTINCT
  t.tablename,
  t.rowsecurity as rls_enabled,
  COUNT(p.policyname) FILTER (WHERE 'anon' = ANY(p.roles) OR 'public' = ANY(p.roles)) as public_policies
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
GROUP BY t.tablename, t.rowsecurity
HAVING COUNT(p.policyname) FILTER (WHERE 'anon' = ANY(p.roles) OR 'public' = ANY(p.roles)) = 0;
```

## Testing Checklist

After implementing fixes:

### People Page
- [ ] Navigate to `/people`
- [ ] Page loads without "Failed to load" error
- [ ] Person cards display with names
- [ ] Nationalities show with flags (from new PersonNationality system)
- [ ] Pagination works
- [ ] Filters work (profession, nationality, organization)

### Cases Page
- [ ] Navigate to `/cases`
- [ ] Page loads without "Failed to load" error
- [ ] Case cards display
- [ ] Sorting works
- [ ] Tag filtering works
- [ ] Pagination works

### Organization Pages
- [ ] Navigate to `/organizations`
- [ ] List page shows all organizations
- [ ] Click on any organization
- [ ] Detail page loads (no 404)
- [ ] Organization info displays correctly
- [ ] Related cases/statements show

### Additional Checks
- [ ] Check browser console for any errors
- [ ] Check network tab for failed API calls
- [ ] Verify no RLS errors in Supabase logs
- [ ] Test as both anonymous and authenticated user

## Files to Check

### API Endpoints (May need RLS fixes)
1. [pages/api/people/index.ts](pages/api/people/index.ts) - People list API
2. [pages/api/people/[slug].ts](pages/api/people/[slug].ts) - Person detail API
3. [pages/api/cases/index.ts](pages/api/cases/index.ts) - Cases list API (if exists)
4. [pages/api/organizations/[slug].ts](pages/api/organizations/[slug].ts) - Organization detail API

### Frontend Pages
1. [pages/people/index.tsx](pages/people/index.tsx) - People list page
2. [pages/cases/index.tsx](pages/cases/index.tsx) - Cases list page
3. [pages/organizations/[slug].tsx](pages/organizations/[slug].tsx) - Organization detail (SSG issue)

### RLS Policies to Review
- Person: `select_Person` or `public_read_Person`
- PersonNationality: `select_PersonNationality` or `public_read_PersonNationality`
- Country: `public_read_Country` (should exist)
- Case: `public_read_Case` (should exist)
- Statement: `select_Statement` or `public_read_Statement`
- Organization: `select_Organization` or `public_read_Organization`

## Environment Check

**Verify these environment variables are set**:

```bash
# .env.local
DATABASE_URL=postgresql://...  # Supabase connection string
DIRECT_URL=postgresql://...     # Direct connection (non-pooled)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # Anon key for client-side
```

## Next Steps

1. **Immediate** (Today):
   - Run RLS verification queries in Supabase
   - Fix RLS policies for anonymous users
   - Test people and cases pages
   - Rebuild site or convert organization pages to SSR

2. **Short-term** (This week):
   - Comprehensive RLS policy review for all public tables
   - Add proper error logging to API endpoints
   - Set up monitoring for API failures
   - Document RLS policies for each table

3. **Long-term** (Next sprint):
   - Migrate all public pages from SSG to SSR or ISR
   - Implement proper caching strategy
   - Add health check endpoints
   - Set up automated RLS testing

## Monitoring

**Add these to track issues**:

1. **API Error Logging**:
   ```typescript
   // In API error handlers
   console.error('API Error:', {
     endpoint: req.url,
     method: req.method,
     error: error.message,
     stack: error.stack,
     timestamp: new Date().toISOString()
   })
   ```

2. **Client-Side Error Tracking**:
   ```typescript
   // In pages
   catch (err) {
     console.error('Page Error:', {
       page: 'people',
       error: err.message,
       url: window.location.href
     })
     setError('Failed to load. Please try again.')
   }
   ```

3. **Supabase Logs**:
   - Check: https://supabase.com/dashboard/project/sboopxosgongujqkpbxo/logs/postgres-logs
   - Filter for RLS errors: "permission denied"

## Success Criteria

Site is considered fixed when:

✅ People page loads and displays person cards
✅ Cases page loads and displays case cards
✅ Organization detail pages load without 404
✅ All API endpoints return 200 status
✅ No RLS "permission denied" errors in logs
✅ Anonymous users can view all public data
✅ Authenticated users have proper write access

---

**Document Version**: 1.0
**Last Updated**: 2025-10-11
**Severity**: CRITICAL
**Estimated Fix Time**: 2-4 hours
