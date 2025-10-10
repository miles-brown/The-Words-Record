# Simple SQL Migration - Run Step by Step

If the full migration fails, run these commands **one at a time** in Supabase SQL Editor.

## 🔍 Common Errors & Solutions

### Before You Start - Check What Exists

Run this first to see what's already in your database:

```sql
-- Check if enums exist
SELECT typname FROM pg_type WHERE typname IN ('NationalityType', 'AcquisitionMethod');

-- Check if columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'Person'
AND column_name IN ('nationality_primary_code', 'nationality_codes_cached');

-- Check if tables exist
SELECT tablename FROM pg_tables
WHERE tablename IN ('Country', 'PersonNationality');
```

---

## ✅ Step-by-Step Migration (Run Each Separately)

### Step 1: Create NationalityType Enum
```sql
CREATE TYPE "NationalityType" AS ENUM (
  'CITIZENSHIP',
  'ETHNIC_ORIGIN',
  'CULTURAL_IDENTITY',
  'RESIDENCY_STATUS',
  'HISTORICAL_STATE'
);
```

**Expected:** Success message
**If error "type already exists":** Skip this step, it's already created

---

### Step 2: Create AcquisitionMethod Enum
```sql
CREATE TYPE "AcquisitionMethod" AS ENUM (
  'BY_BIRTH',
  'BY_DESCENT',
  'NATURALISATION',
  'MARRIAGE',
  'OTHER',
  'UNKNOWN'
);
```

**Expected:** Success message
**If error "type already exists":** Skip this step, it's already created

---

### Step 3: Add Cache Field 1
```sql
ALTER TABLE "Person"
  ADD COLUMN "nationality_primary_code" VARCHAR(2);
```

**Expected:** Success message
**If error "column already exists":** Skip this step, it's already created

---

### Step 4: Add Cache Field 2
```sql
ALTER TABLE "Person"
  ADD COLUMN "nationality_codes_cached" TEXT[] DEFAULT '{}';
```

**Expected:** Success message
**If error "column already exists":** Skip this step, it's already created

---

### Step 5: Create Country Table
```sql
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
```

**Expected:** Success message
**If error "relation already exists":** Skip this step, table already created

---

### Step 6: Create Country Indexes
```sql
CREATE INDEX "Country_active_idx" ON "Country"("active");
CREATE INDEX "Country_name_en_idx" ON "Country"("name_en");
```

**Expected:** Success message
**If error "relation already exists":** Skip this step, indexes already created

---

### Step 7: Create PersonNationality Table
```sql
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Expected:** Success message
**If error "relation already exists":** Skip this step, table already created

---

### Step 8: Add Foreign Key to Person
```sql
ALTER TABLE "PersonNationality"
  ADD CONSTRAINT "PersonNationality_personId_fkey"
  FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE;
```

**Expected:** Success message
**If error "constraint already exists":** Skip this step

---

### Step 9: Add Foreign Key to Country
```sql
ALTER TABLE "PersonNationality"
  ADD CONSTRAINT "PersonNationality_countryCode_fkey"
  FOREIGN KEY ("countryCode") REFERENCES "Country"("code");
```

**Expected:** Success message
**If error "constraint already exists":** Skip this step

---

### Step 10: Create PersonNationality Indexes
```sql
CREATE INDEX "PersonNationality_personId_idx" ON "PersonNationality"("personId");
CREATE INDEX "PersonNationality_countryCode_idx" ON "PersonNationality"("countryCode");
CREATE INDEX "PersonNationality_isPrimary_idx" ON "PersonNationality"("isPrimary");
CREATE INDEX "PersonNationality_type_idx" ON "PersonNationality"("type");
CREATE INDEX "PersonNationality_endDate_idx" ON "PersonNationality"("endDate");
```

**Expected:** Success message
**If error "relation already exists":** Skip this step

---

### Step 11: Create Unique Index
```sql
CREATE UNIQUE INDEX "PersonNationality_personId_countryCode_type_startDate_endDate_key"
  ON "PersonNationality"("personId", "countryCode", "type", "startDate", "endDate");
```

**Expected:** Success message
**If error "relation already exists":** Skip this step

---

## ✅ Verify Everything Was Created

Run this to check all tables and columns exist:

```sql
-- Should show Country and PersonNationality
SELECT tablename FROM pg_tables
WHERE tablename IN ('Country', 'PersonNationality');

-- Should show 2 rows (both cache fields)
SELECT column_name FROM information_schema.columns
WHERE table_name = 'Person'
AND column_name IN ('nationality_primary_code', 'nationality_codes_cached');

-- Should show both enums
SELECT typname FROM pg_type
WHERE typname IN ('NationalityType', 'AcquisitionMethod');
```

**Expected Results:**
- 2 tables found
- 2 columns found
- 2 enums found

---

## 🔴 If You Get Specific Errors

### Error: "relation 'Person' does not exist"
**Problem:** Your Person table has a different name or is in a different schema.

**Solution:** Check your table name:
```sql
SELECT tablename FROM pg_tables WHERE tablename LIKE '%erson%';
```

Then replace `"Person"` with the correct name (might be `person` lowercase).

---

### Error: "permission denied"
**Problem:** You don't have permission to create tables.

**Solution:**
1. Make sure you're logged in as the project owner
2. Try switching to the postgres role in the SQL Editor dropdown
3. Check project permissions in Settings

---

### Error: "syntax error at or near..."
**Problem:** SQL syntax issue (maybe quote marks).

**Solution:** Make sure you're copying the exact SQL from above. Some systems change quote marks when copying.

---

### Error: "type modifier is not allowed for type"
**Problem:** TIMESTAMP(3) not supported.

**Solution:** Use this instead:
```sql
-- Replace TIMESTAMP(3) with TIMESTAMPTZ
"createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
```

---

## 🆘 Still Having Issues?

### Option 1: Tell me the exact error
Copy the exact error message from Supabase and share it. I can help fix it.

### Option 2: Check your schema
Your database might use a different table name. Run this:
```sql
-- See all your tables
SELECT schemaname, tablename FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY tablename;
```

### Option 3: Use Prisma Push (Alternative)
If you have local access to the database:
```bash
npx prisma db push --skip-generate
```

This will automatically create the tables from your schema.prisma file.

---

## 📝 What to Share If You Need Help

1. **Exact error message** from Supabase
2. **Which step** failed (Step 1, 2, 3, etc.)
3. **Results** from the "Check What Exists" query at the top
4. **Table name** - Is it `Person` or `person`?

---

## ✅ Once Complete

After all steps succeed, continue with:
1. Seed countries: `npx tsx prisma/seed-countries.ts`
2. Migrate data: `npx tsx scripts/migrate-legacy-nationalities.ts`
3. Deploy to Vercel

See [NATIONALITY-DEPLOYMENT.md](./NATIONALITY-DEPLOYMENT.md) for next steps.
