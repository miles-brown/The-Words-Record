-- =====================================================
-- COMPREHENSIVE LEGACY DATA MIGRATION SCRIPT
-- =====================================================
-- This script:
-- 1. Ensures all Person legacy nationality data is in PersonNationality
-- 2. Drops the affiliation_backfill_audit table (audit data only)
-- 3. Keeps HistoricalNationality tables as reference data
-- 4. Drops Person legacy nationality columns
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: VERIFY EXISTING PersonNationality DATA
-- =====================================================
DO $$
DECLARE
    person_count INTEGER;
    nationality_count INTEGER;
BEGIN
    SELECT COUNT(DISTINCT id) INTO person_count
    FROM "Person"
    WHERE ("nationalityArray" IS NOT NULL AND array_length("nationalityArray", 1) > 0)
       OR "primaryNationality" IS NOT NULL;

    SELECT COUNT(DISTINCT "personId") INTO nationality_count
    FROM "PersonNationality";

    RAISE NOTICE 'Persons with legacy nationality data: %', person_count;
    RAISE NOTICE 'Persons with PersonNationality records: %', nationality_count;
END $$;

-- =====================================================
-- STEP 2: MIGRATE ANY REMAINING PERSON LEGACY DATA
-- =====================================================
-- This should already be done, but let's be safe and check

-- Insert from nationalityArray if not already in PersonNationality
INSERT INTO "PersonNationality" (
    id,
    "personId",
    "countryCode",
    type,
    "isPrimary",
    "displayOrder",
    confidence,
    note,
    "createdAt",
    "updatedAt"
)
SELECT
    gen_random_uuid()::text,
    p.id,
    CASE
        WHEN nat = 'PALESTINE' THEN 'PS'
        WHEN nat = 'USA' THEN 'US'
        WHEN nat = 'UK' THEN 'GB'
        WHEN nat = 'CANADA' THEN 'CA'
        WHEN nat = 'AUSTRALIA' THEN 'AU'
        WHEN nat = 'ISRAEL' THEN 'IL'
        WHEN nat = 'FRANCE' THEN 'FR'
        WHEN nat = 'GERMANY' THEN 'DE'
        WHEN nat = 'RUSSIA' THEN 'RU'
        WHEN nat = 'CHINA' THEN 'CN'
        WHEN nat = 'INDIA' THEN 'IN'
        WHEN nat = 'BRAZIL' THEN 'BR'
        WHEN nat = 'MEXICO' THEN 'MX'
        WHEN nat = 'JAPAN' THEN 'JP'
        WHEN nat = 'SOUTH_KOREA' THEN 'KR'
        WHEN nat = 'SAUDI_ARABIA' THEN 'SA'
        WHEN nat = 'IRAN' THEN 'IR'
        WHEN nat = 'EGYPT' THEN 'EG'
        WHEN nat = 'TURKEY' THEN 'TR'
        WHEN nat = 'SOUTH_AFRICA' THEN 'ZA'
        WHEN nat = 'NIGERIA' THEN 'NG'
        ELSE NULL
    END,
    'CITIZENSHIP',
    (nat = p."primaryNationality"),
    idx - 1,
    70,
    'Migrated from legacy nationalityArray field',
    NOW(),
    NOW()
FROM "Person" p
CROSS JOIN LATERAL unnest(p."nationalityArray") WITH ORDINALITY AS t(nat, idx)
WHERE nat NOT IN ('OTHER', 'UNKNOWN')
  AND CASE
        WHEN nat = 'PALESTINE' THEN 'PS'
        WHEN nat = 'USA' THEN 'US'
        WHEN nat = 'UK' THEN 'GB'
        WHEN nat = 'CANADA' THEN 'CA'
        WHEN nat = 'AUSTRALIA' THEN 'AU'
        WHEN nat = 'ISRAEL' THEN 'IL'
        WHEN nat = 'FRANCE' THEN 'FR'
        WHEN nat = 'GERMANY' THEN 'DE'
        WHEN nat = 'RUSSIA' THEN 'RU'
        WHEN nat = 'CHINA' THEN 'CN'
        WHEN nat = 'INDIA' THEN 'IN'
        WHEN nat = 'BRAZIL' THEN 'BR'
        WHEN nat = 'MEXICO' THEN 'MX'
        WHEN nat = 'JAPAN' THEN 'JP'
        WHEN nat = 'SOUTH_KOREA' THEN 'KR'
        WHEN nat = 'SAUDI_ARABIA' THEN 'SA'
        WHEN nat = 'IRAN' THEN 'IR'
        WHEN nat = 'EGYPT' THEN 'EG'
        WHEN nat = 'TURKEY' THEN 'TR'
        WHEN nat = 'SOUTH_AFRICA' THEN 'ZA'
        WHEN nat = 'NIGERIA' THEN 'NG'
        ELSE NULL
      END IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM "PersonNationality" pn
      WHERE pn."personId" = p.id
        AND pn."countryCode" = CASE
            WHEN nat = 'PALESTINE' THEN 'PS'
            WHEN nat = 'USA' THEN 'US'
            WHEN nat = 'UK' THEN 'GB'
            WHEN nat = 'CANADA' THEN 'CA'
            WHEN nat = 'AUSTRALIA' THEN 'AU'
            WHEN nat = 'ISRAEL' THEN 'IL'
            WHEN nat = 'FRANCE' THEN 'FR'
            WHEN nat = 'GERMANY' THEN 'DE'
            WHEN nat = 'RUSSIA' THEN 'RU'
            WHEN nat = 'CHINA' THEN 'CN'
            WHEN nat = 'INDIA' THEN 'IN'
            WHEN nat = 'BRAZIL' THEN 'BR'
            WHEN nat = 'MEXICO' THEN 'MX'
            WHEN nat = 'JAPAN' THEN 'JP'
            WHEN nat = 'SOUTH_KOREA' THEN 'KR'
            WHEN nat = 'SAUDI_ARABIA' THEN 'SA'
            WHEN nat = 'IRAN' THEN 'IR'
            WHEN nat = 'EGYPT' THEN 'EG'
            WHEN nat = 'TURKEY' THEN 'TR'
            WHEN nat = 'SOUTH_AFRICA' THEN 'ZA'
            WHEN nat = 'NIGERIA' THEN 'NG'
            ELSE NULL
        END
  );

-- =====================================================
-- STEP 3: UPDATE PERSON CACHED NATIONALITY FIELDS
-- =====================================================
-- Update cached nationality codes from PersonNationality
UPDATE "Person" p
SET
    "nationality_primary_code" = (
        SELECT "countryCode"
        FROM "PersonNationality"
        WHERE "personId" = p.id AND "isPrimary" = true
        LIMIT 1
    ),
    "nationality_codes_cached" = (
        SELECT array_agg("countryCode" ORDER BY "displayOrder", "createdAt")
        FROM "PersonNationality"
        WHERE "personId" = p.id
    )
WHERE EXISTS (
    SELECT 1 FROM "PersonNationality" WHERE "personId" = p.id
);

-- =====================================================
-- STEP 4: DROP AUDIT TABLE (SAFE TO DROP)
-- =====================================================
DROP TABLE IF EXISTS affiliation_backfill_audit CASCADE;

RAISE NOTICE 'Dropped affiliation_backfill_audit table';

-- =====================================================
-- STEP 5: DROP PERSON LEGACY NATIONALITY COLUMNS
-- =====================================================
-- These columns are now fully replaced by PersonNationality table

ALTER TABLE "Person"
    DROP COLUMN IF EXISTS "nationalityArray",
    DROP COLUMN IF EXISTS "primaryNationality";

RAISE NOTICE 'Dropped legacy nationality columns from Person table';

-- =====================================================
-- STEP 6: KEEP HISTORICAL NATIONALITY TABLES
-- =====================================================
-- HistoricalNationality and HistoricalNationalityToCountry tables
-- contain reference data for historical states/nationalities.
-- These should be kept as they may be useful for future migrations
-- or for handling historical nationality data.
--
-- If you want to drop them, uncomment the following lines:
--
-- DROP TABLE IF EXISTS "HistoricalNationalityToCountry" CASCADE;
-- DROP TABLE IF EXISTS "HistoricalNationality" CASCADE;
-- RAISE NOTICE 'Dropped HistoricalNationality tables';

RAISE NOTICE '✓ HistoricalNationality tables retained as reference data';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
DO $$
DECLARE
    persons_with_nationalities INTEGER;
    total_nationalities INTEGER;
BEGIN
    SELECT COUNT(DISTINCT "personId") INTO persons_with_nationalities
    FROM "PersonNationality";

    SELECT COUNT(*) INTO total_nationalities
    FROM "PersonNationality";

    RAISE NOTICE '═══════════════════════════════════════════════════';
    RAISE NOTICE 'MIGRATION COMPLETE';
    RAISE NOTICE '═══════════════════════════════════════════════════';
    RAISE NOTICE 'Persons with nationality data: %', persons_with_nationalities;
    RAISE NOTICE 'Total nationality records: %', total_nationalities;
    RAISE NOTICE '✓ Legacy columns dropped from Person table';
    RAISE NOTICE '✓ affiliation_backfill_audit table dropped';
    RAISE NOTICE '✓ HistoricalNationality tables retained';
    RAISE NOTICE '═══════════════════════════════════════════════════';
END $$;

COMMIT;
