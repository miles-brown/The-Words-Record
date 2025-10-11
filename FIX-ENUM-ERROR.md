# ✅ FIXED: "invalid input value for enum NationalityType: CITIZENSHIP"

## 🔴 The Problem
You got this error:
```
ERROR: invalid input value for enum "NationalityType": "CITIZENSHIP"
```

**What this means:** The enum `NationalityType` exists in your database, but it has **different values** than what our SQL expects. Someone probably created it earlier with wrong values.

---

## ✅ The Solution (Simple & Safe)

### Step 1: Drop and Recreate the Enums

The enums aren't being used by any tables yet, so it's safe to drop and recreate them with the correct values.

**Copy this SQL and run it in Supabase:**

```sql
-- Drop existing enums (they're not being used yet, so this is safe)
DROP TYPE IF EXISTS "NationalityType" CASCADE;
DROP TYPE IF EXISTS "AcquisitionMethod" CASCADE;

-- Create enums with correct values
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

-- Add cache fields (skip if they exist)
DO $$ BEGIN
    ALTER TABLE "Person"
      ADD COLUMN "nationality_primary_code" VARCHAR(2);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Person"
      ADD COLUMN "nationality_codes_cached" TEXT[] DEFAULT '{}';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Create Country table (skip if exists)
CREATE TABLE IF NOT EXISTS "Country" (
    "code" VARCHAR(2) PRIMARY KEY,
    "name_en" TEXT NOT NULL,
    "iso3" VARCHAR(3),
    "m49" INTEGER,
    "flag_emoji" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Country_active_idx" ON "Country"("active");
CREATE INDEX IF NOT EXISTS "Country_name_en_idx" ON "Country"("name_en");

-- Create PersonNationality table (skip if exists)
CREATE TABLE IF NOT EXISTS "PersonNationality" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints (skip if exist)
DO $$ BEGIN
    ALTER TABLE "PersonNationality"
      ADD CONSTRAINT "PersonNationality_personId_fkey"
      FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "PersonNationality"
      ADD CONSTRAINT "PersonNationality_countryCode_fkey"
      FOREIGN KEY ("countryCode") REFERENCES "Country"("code");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes on PersonNationality
CREATE INDEX IF NOT EXISTS "PersonNationality_personId_idx" ON "PersonNationality"("personId");
CREATE INDEX IF NOT EXISTS "PersonNationality_countryCode_idx" ON "PersonNationality"("countryCode");
CREATE INDEX IF NOT EXISTS "PersonNationality_isPrimary_idx" ON "PersonNationality"("isPrimary");
CREATE INDEX IF NOT EXISTS "PersonNationality_type_idx" ON "PersonNationality"("type");
CREATE INDEX IF NOT EXISTS "PersonNationality_endDate_idx" ON "PersonNationality"("endDate");
CREATE UNIQUE INDEX IF NOT EXISTS "PersonNationality_personId_countryCode_type_startDate_endDate_key"
  ON "PersonNationality"("personId", "countryCode", "type", "startDate", "endDate");
```

---

### Step 2: Verify It Worked

Run this in Supabase:

```sql
-- Should show 2 tables
SELECT tablename FROM pg_tables
WHERE tablename IN ('Country', 'PersonNationality');

-- Should show correct enum values
SELECT enumlabel
FROM pg_enum
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
WHERE typname = 'NationalityType'
ORDER BY enumsortorder;
```

**Expected Results:**
- 2 tables: `Country`, `PersonNationality`
- 5 enum values: CITIZENSHIP, ETHNIC_ORIGIN, CULTURAL_IDENTITY, RESIDENCY_STATUS, HISTORICAL_STATE

---

## 🔍 Why This Happened

Someone (maybe during testing) ran SQL that created `NationalityType` enum with different values. When you tried to create the `PersonNationality` table with `DEFAULT 'CITIZENSHIP'`, PostgreSQL said "I don't know what CITIZENSHIP is" because the enum had different values.

**The fix:** Drop the old enum and recreate it with the correct values.

**Why it's safe:** No tables are using these enums yet, so dropping them won't lose any data.

---

## 📋 Optional: Inspect What's Currently There

If you're curious what values are currently in the enums, run this BEFORE the fix:

```sql
-- See what enum values currently exist
SELECT
    t.typname AS enum_name,
    e.enumlabel AS enum_value,
    e.enumsortorder AS sort_order
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('NationalityType', 'AcquisitionMethod')
ORDER BY t.typname, e.enumsortorder;
```

This will show you what's wrong. Then run the fix SQL above.

---

## ✅ After This Works

Once the SQL runs successfully:
1. See **[NEXT-STEPS-AFTER-SQL.md](NEXT-STEPS-AFTER-SQL.md)** for seeding countries
2. Migrate legacy nationality data
3. Test the application

---

## 🆘 If You Still Get Errors

Share:
1. The exact error message
2. Results from the verification queries
3. Results from the optional inspection query

I'll help you debug it!

---

**Bottom Line:** The enum had wrong values. Drop it, recreate it with the right values, and you're good to go! 🚀
