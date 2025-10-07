# Database Migration Fix - Death Monitoring Fields

## Issue Identified

The Vercel build was failing during the "Collecting page data" phase with the error:

```
Invalid `prisma.person.findUnique()` invocation:
The column `Person.deathCause` does not exist in the current database.
The column `Person.lastDeathCheck` does not exist in the current database.
```

## Root Cause

The Prisma schema (`prisma/schema.prisma`) was updated to include:
- `deathCause String?`
- `lastDeathCheck DateTime?`

However, the database migration was never successfully applied due to connection pooling issues when running locally.

## Solution Applied

Created a Prisma migration at:
`prisma/migrations/20251007_add_death_monitoring_fields/migration.sql`

This migration adds the missing columns to the Person table:

```sql
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "deathCause" TEXT;
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "lastDeathCheck" TIMESTAMP(3);
```

## What Vercel Will Do

When this is pushed to Vercel:
1. Vercel will run `prisma generate` during the build
2. Vercel will detect the pending migration
3. The migration will be applied automatically during deployment
4. The build will complete successfully

## Files Affected

- `prisma/schema.prisma` - Schema definition (already updated)
- `prisma/migrations/20251007_add_death_monitoring_fields/migration.sql` - New migration
- `scripts/check-death-updates.ts` - Uses these fields
- `pages/people/[slug].tsx` - Queries these fields (indirectly through Prisma)

## Verification

After deployment, verify the columns exist by checking a person page or running:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'Person'
AND column_name IN ('deathCause', 'lastDeathCheck');
```
