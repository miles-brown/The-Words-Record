# How to Run SQL Migration in Supabase Dashboard

## 🎯 Quick Overview
You need to run SQL commands in Supabase to create the `Country` and `PersonNationality` tables for the nationality system. This guide shows you exactly how to do it.

---

## 📋 Step-by-Step Instructions

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Log in with your credentials
3. You'll see a list of your projects

### Step 2: Select Your Project
1. Find your "Who Said What" project (or whatever you named it)
2. Click on the project to open it
3. You'll be taken to the project dashboard

### Step 3: Navigate to SQL Editor
**Option A: Via Sidebar**
1. Look at the left sidebar
2. Find the section labeled "SQL Editor" or just "SQL"
3. Click on it

**Option B: Direct URL**
- Go to: `https://supabase.com/dashboard/project/YOUR-PROJECT-ID/sql/new`
- Replace `YOUR-PROJECT-ID` with your actual project ID

### Step 4: Open a New Query
1. In the SQL Editor, you'll see a button "New query" or "+"
2. Click it to create a new SQL query
3. You'll see a blank text editor

### Step 5: Copy the Migration SQL
Open this file on your computer: `docs/NATIONALITY-DEPLOYMENT.md`

Or copy this SQL directly:

```sql
-- ============================================
-- NATIONALITY SYSTEM DATABASE MIGRATION
-- ============================================
-- This creates the Country and PersonNationality tables
-- Run this in Supabase SQL Editor

-- Step 1: Create enums for nationality types
CREATE TYPE "NationalityType" AS ENUM (
  'CITIZENSHIP',
  'ETHNIC_ORIGIN',
  'CULTURAL_IDENTITY',
  'RESIDENCY_STATUS',
  'HISTORICAL_STATE'
);

CREATE TYPE "AcquisitionMethod" AS ENUM (
  'BY_BIRTH',
  'BY_DESCENT',
  'NATURALISATION',
  'MARRIAGE',
  'OTHER',
  'UNKNOWN'
);

-- Step 2: Add cache fields to Person table
ALTER TABLE "Person"
  ADD COLUMN "nationality_primary_code" VARCHAR(2),
  ADD COLUMN "nationality_codes_cached" TEXT[] DEFAULT '{}';

-- Step 3: Create Country lookup table
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

-- Create indexes for Country
CREATE INDEX "Country_active_idx" ON "Country"("active");
CREATE INDEX "Country_name_en_idx" ON "Country"("name_en");

-- Step 4: Create PersonNationality junction table
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

-- Create indexes for PersonNationality
CREATE INDEX "PersonNationality_personId_idx" ON "PersonNationality"("personId");
CREATE INDEX "PersonNationality_countryCode_idx" ON "PersonNationality"("countryCode");
CREATE INDEX "PersonNationality_isPrimary_idx" ON "PersonNationality"("isPrimary");
CREATE INDEX "PersonNationality_type_idx" ON "PersonNationality"("type");
CREATE INDEX "PersonNationality_endDate_idx" ON "PersonNationality"("endDate");
CREATE UNIQUE INDEX "PersonNationality_personId_countryCode_type_startDate_endDate_key"
  ON "PersonNationality"("personId", "countryCode", "type", "startDate", "endDate");

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Run the seed script: npx tsx prisma/seed-countries.ts
-- 2. Run the migration script: npx tsx scripts/migrate-legacy-nationalities.ts
```

### Step 6: Paste the SQL
1. Select all the SQL above (Cmd+A / Ctrl+A)
2. Copy it (Cmd+C / Ctrl+C)
3. Go back to Supabase SQL Editor
4. Paste into the text editor (Cmd+V / Ctrl+V)

### Step 7: Run the SQL
1. You'll see a "Run" button (usually in the bottom-right or top-right)
2. Click "Run" or press Cmd+Enter / Ctrl+Enter
3. Wait for the query to execute (should take 2-5 seconds)

### Step 8: Verify Success
After running, you should see:

**✅ Success Message:**
```
Success. No rows returned
```
or
```
Query executed successfully
```

**What Just Happened:**
- Created 2 new enums: `NationalityType`, `AcquisitionMethod`
- Added 2 cache fields to `Person` table
- Created `Country` table (empty for now)
- Created `PersonNationality` table (empty for now)
- Created all necessary indexes

### Step 9: Verify Tables Were Created
1. In the left sidebar, click "Table Editor" or "Database"
2. You should now see:
   - `Country` (new table)
   - `PersonNationality` (new table)
   - `Person` (existing table, now with new columns)

---

## 🔍 Troubleshooting

### Error: "type already exists"
**Problem:** The enums `NationalityType` or `AcquisitionMethod` already exist.

**Solution:** Run this first to drop them, then run the migration again:
```sql
DROP TYPE IF EXISTS "NationalityType" CASCADE;
DROP TYPE IF EXISTS "AcquisitionMethod" CASCADE;
```

### Error: "column already exists"
**Problem:** The cache fields already exist on the Person table.

**Solution:** Skip the ALTER TABLE step or run:
```sql
ALTER TABLE "Person"
  DROP COLUMN IF EXISTS "nationality_primary_code",
  DROP COLUMN IF EXISTS "nationality_codes_cached";
```
Then run the migration again.

### Error: "relation already exists"
**Problem:** The tables `Country` or `PersonNationality` already exist.

**Solution:** Drop them first (⚠️ THIS WILL DELETE DATA):
```sql
DROP TABLE IF EXISTS "PersonNationality" CASCADE;
DROP TABLE IF EXISTS "Country" CASCADE;
```
Then run the migration again.

### Error: "permission denied"
**Problem:** You don't have permission to create tables.

**Solution:**
1. Make sure you're logged in as the project owner
2. Check you selected the correct project
3. Try using the "postgres" role if available

---

## ✅ Next Steps After SQL Migration

Once the SQL migration is complete, you need to:

### 1. Seed Country Data (Populate Country table)

**Option A: Via Vercel CLI (if you have it installed)**
```bash
vercel env pull .env.local
npx tsx prisma/seed-countries.ts
```

**Option B: Create a temporary API endpoint**

Create `pages/api/admin/seed-countries.ts`:
```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { execSync } from 'child_process'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Add authentication here!
  const { authToken } = req.body
  if (authToken !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const output = execSync('npx tsx prisma/seed-countries.ts', {
      encoding: 'utf-8',
      cwd: process.cwd()
    })
    res.status(200).json({ success: true, output })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
```

Then visit: `https://your-app.vercel.app/api/admin/seed-countries` with a POST request.

**Option C: Manual SQL Insert (Last Resort)**

Run the seed script locally and export the INSERT statements:
```bash
# This won't work if DB is remote, but generates SQL you can copy
npx tsx prisma/seed-countries.ts --dry-run
```

### 2. Migrate Legacy Data

Same options as above, but for `scripts/migrate-legacy-nationalities.ts`

### 3. Verify Data

Run these queries in Supabase SQL Editor:

```sql
-- Check Country table
SELECT COUNT(*) FROM "Country";
-- Should return ~120

-- Check PersonNationality table
SELECT COUNT(*) FROM "PersonNationality";
-- Should return number of nationalities

-- Check a sample
SELECT
  p.name,
  c.flag_emoji,
  c.name_en,
  pn.type,
  pn."isPrimary"
FROM "PersonNationality" pn
JOIN "Person" p ON p.id = pn."personId"
JOIN "Country" c ON c.code = pn."countryCode"
LIMIT 5;
```

---

## 🎯 Quick Reference

| Step | Action | Where | Time |
|------|--------|-------|------|
| 1 | Open Supabase Dashboard | [supabase.com/dashboard](https://supabase.com/dashboard) | 30s |
| 2 | Navigate to SQL Editor | Left sidebar → "SQL Editor" | 10s |
| 3 | Create new query | Click "New query" button | 5s |
| 4 | Copy migration SQL | From this guide or NATIONALITY-DEPLOYMENT.md | 10s |
| 5 | Paste and run | Paste SQL, click "Run" | 5s |
| 6 | Wait for completion | Watch for success message | 2-5s |
| 7 | Verify tables | Check Table Editor | 30s |
| **Total** | | | **~2 minutes** |

---

## 📞 Support

If you encounter issues:
1. Check the error message carefully
2. Review the Troubleshooting section above
3. Check Supabase logs (Dashboard → Logs)
4. Verify you're in the correct project
5. Make sure you have admin/owner permissions

---

## 🎉 Success!

Once you see the success message and verify the tables exist, you're done with the database migration!

**Next:** Seed the data and test the application.

See **[NATIONALITY-DEPLOYMENT.md](./NATIONALITY-DEPLOYMENT.md)** for complete deployment guide.
