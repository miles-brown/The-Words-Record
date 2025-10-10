# Nationality System Deployment Guide

## Overview
This guide covers deploying the new nationality & citizenship relational system to production.

## Changes Summary
- Added `Country` lookup table with ISO 3166-1 alpha-2 codes
- Added `PersonNationality` junction table for many-to-many relationships
- Added cache fields to `Person` table for query performance
- Updated enums: `NationalityType` and `AcquisitionMethod`
- Updated API endpoints to use relational data
- Updated UI components to display structured nationality data

## Deployment Steps

### Phase 1: Code Deployment ✅ COMPLETED
The code has been pushed to the `phase2-auth-dashboard` branch:
- Commit cbba6b3: API integration
- Commit 5dc5fc0: UI integration

### Phase 2: Database Schema Update

**Option A: Via Supabase Dashboard (Recommended)**

1. Log into Supabase Dashboard
2. Navigate to SQL Editor
3. Run the following SQL:

```sql
-- Step 1: Update enums
CREATE TYPE "NationalityType" AS ENUM ('CITIZENSHIP', 'ETHNIC_ORIGIN', 'CULTURAL_IDENTITY', 'RESIDENCY_STATUS', 'HISTORICAL_STATE');
CREATE TYPE "AcquisitionMethod" AS ENUM ('BY_BIRTH', 'BY_DESCENT', 'NATURALISATION', 'MARRIAGE', 'OTHER', 'UNKNOWN');

-- Step 2: Add cache fields to Person table
ALTER TABLE "Person"
  ADD COLUMN "nationality_primary_code" VARCHAR(2),
  ADD COLUMN "nationality_codes_cached" TEXT[] DEFAULT '{}';

-- Step 3: Create Country table
CREATE TABLE "Country" (
    "code" VARCHAR(2) PRIMARY KEY,
    "name_en" TEXT NOT NULL,
    "iso3" VARCHAR(3),
    "m49" INTEGER,
    "flag_emoji" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX "Country_active_idx" ON "Country"("active");
CREATE INDEX "Country_name_en_idx" ON "Country"("name_en");

-- Step 4: Create PersonNationality table
CREATE TABLE "PersonNationality" (
    "id" TEXT PRIMARY KEY,
    "personId" TEXT NOT NULL,
    "countryCode" VARCHAR(2) NOT NULL,
    "type" "NationalityType" NOT NULL DEFAULT 'CITIZENSHIP',
    "acquisition" "AcquisitionMethod",
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "sourceId" TEXT,
    "confidence" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE,
    FOREIGN KEY ("countryCode") REFERENCES "Country"("code")
);

-- Create indexes
CREATE INDEX "PersonNationality_personId_idx" ON "PersonNationality"("personId");
CREATE INDEX "PersonNationality_countryCode_idx" ON "PersonNationality"("countryCode");
CREATE INDEX "PersonNationality_isPrimary_idx" ON "PersonNationality"("isPrimary");
CREATE INDEX "PersonNationality_type_idx" ON "PersonNationality"("type");
CREATE INDEX "PersonNationality_endDate_idx" ON "PersonNationality"("endDate");
CREATE UNIQUE INDEX "PersonNationality_personId_countryCode_type_startDate_endDate_key"
  ON "PersonNationality"("personId", "countryCode", "type", "startDate", "endDate");
```

**Option B: Via Prisma Push (Alternative)**

If you have direct database access:
```bash
npx prisma db push
```

### Phase 3: Seed Country Data

Run the country seed script via Vercel CLI or SSH:

```bash
npx tsx prisma/seed-countries.ts
```

This will populate the `Country` table with 120+ countries including:
- ISO 3166-1 alpha-2 codes (US, GB, FR, etc.)
- Country names in English
- ISO 3166-1 alpha-3 codes
- UN M.49 numeric codes
- Flag emojis
- Special entries (XX for Stateless, etc.)

### Phase 4: Migrate Legacy Data

Run the legacy nationality migration script:

```bash
npx tsx scripts/migrate-legacy-nationalities.ts
```

This script will:
- Read from legacy fields: `nationality`, `nationalityArray`, `primaryNationality`, `nationalityDetail`
- Normalize to ISO codes using lib/countries.ts
- Create PersonNationality rows with inferred types
- Compute and cache nationality_primary_code and nationality_codes_cached
- Handle duplicate nationalities
- Preserve nationality details in notes

**Expected Output:**
```
Processing 150 people...
✅ Migrated John Smith (2 nationalities)
✅ Migrated Jane Doe (1 nationality)
...
Migration complete!
```

### Phase 5: Verification

1. **Check Country Table:**
```sql
SELECT COUNT(*) FROM "Country";
-- Should return ~120+ countries

SELECT * FROM "Country" WHERE code IN ('US', 'GB', 'FR', 'DE', 'CN');
-- Should show proper names and flags
```

2. **Check PersonNationality Table:**
```sql
SELECT COUNT(*) FROM "PersonNationality";
-- Should match number of people with nationalities

SELECT
  p.name,
  c.flag_emoji,
  c.name_en,
  pn.type,
  pn."isPrimary"
FROM "PersonNationality" pn
JOIN "Person" p ON p.id = pn."personId"
JOIN "Country" c ON c.code = pn."countryCode"
WHERE pn."endDate" IS NULL
LIMIT 10;
```

3. **Check Cache Fields:**
```sql
SELECT
  name,
  nationality_primary_code,
  nationality_codes_cached
FROM "Person"
WHERE nationality_primary_code IS NOT NULL
LIMIT 10;
```

### Phase 6: Test in Production

1. Visit the people page: `/people`
2. Verify nationality filter shows country flags
3. Select a nationality filter (e.g., "🇺🇸 United States")
4. Verify filtering works correctly
5. Check person cards display nationality flags properly
6. Visit a person detail page
7. Verify nationalities show with flags and names

### Phase 7: Monitor

After deployment:
- Check Vercel logs for any errors
- Monitor Supabase logs for query performance
- Verify no "OTHER / 🌍" displays appear
- Confirm all nationalities show proper flags

## Rollback Plan

If issues occur:

1. **Quick Fix - Revert Code:**
```bash
git revert 5dc5fc0 cbba6b3
git push origin phase2-auth-dashboard
```

2. **Database Rollback (if needed):**
```sql
-- Drop new tables (data will be lost)
DROP TABLE "PersonNationality";
DROP TABLE "Country";

-- Remove cache fields
ALTER TABLE "Person"
  DROP COLUMN "nationality_primary_code",
  DROP COLUMN "nationality_codes_cached";

-- Drop enums
DROP TYPE "NationalityType";
DROP TYPE "AcquisitionMethod";
```

## Files Modified

### Schema & Database
- `prisma/schema.prisma` - Added models and enums
- `prisma/seed-countries.ts` - Country seed script
- `scripts/migrate-legacy-nationalities.ts` - Data migration script

### Core Infrastructure
- `lib/nationality-helpers.ts` - Cache computation & validation
- `lib/mappers/person-nationality.ts` - DTO mapper for API responses

### API Endpoints
- `pages/api/people/index.ts` - List endpoint with nationality filter
- `pages/api/people/[slug].ts` - Detail endpoint with nationality data

### UI Components
- `pages/people/index.tsx` - People list with nationality display
- `components/PersonCardEnhanced.tsx` - Person card with nationality badges

### Documentation
- `docs/nationality-implementation-guide.md` - Full implementation guide
- `docs/NATIONALITY-DEPLOYMENT.md` - This deployment guide

## Support

For issues or questions:
1. Check Vercel deployment logs
2. Check Supabase database logs
3. Review implementation guide: `docs/nationality-implementation-guide.md`
4. Test locally with cache fields populated

## Post-Deployment Tasks

After successful deployment:

1. **Archive Legacy Fields (Optional):**
   - Keep `nationality`, `nationalityArray`, `primaryNationality` for reference
   - Consider marking as deprecated in schema comments
   - Plan removal for future version

2. **Performance Monitoring:**
   - Monitor query performance on Person table
   - Check if cache fields are being used effectively
   - Verify indexes are working as expected

3. **Data Quality:**
   - Review any people with missing nationalities
   - Check for any incorrect country code mappings
   - Update confidence scores as data is verified

## Success Criteria

Deployment is successful when:
- ✅ No build/deployment errors
- ✅ People page loads without errors
- ✅ Nationality filter shows ~120+ countries with flags
- ✅ Filtering by nationality works correctly
- ✅ Person cards show proper nationality flags (no globe emojis)
- ✅ Person detail pages show nationality information
- ✅ No "OTHER" or "🌍" fallbacks visible
- ✅ All database queries complete within acceptable time (<500ms)
