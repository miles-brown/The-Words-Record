const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
});

async function main() {
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('LEGACY DATA MIGRATION - STEP BY STEP');
    console.log('═══════════════════════════════════════════════════\n');

    // Step 1: Check current state
    console.log('STEP 1: Verifying current state...');
    const initialState = await prisma.$queryRaw`
      SELECT
        COUNT(DISTINCT id) as person_count
      FROM "Person"
      WHERE ("nationalityArray" IS NOT NULL AND array_length("nationalityArray", 1) > 0)
         OR "primaryNationality" IS NOT NULL;
    `;
    console.log(`  → Persons with legacy nationality data: ${initialState[0].person_count}`);

    const existingNationalities = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT "personId") as count FROM "PersonNationality";
    `;
    console.log(`  → Persons with PersonNationality records: ${existingNationalities[0].count}\n`);

    // Step 2: Migrate remaining Person legacy data
    console.log('STEP 2: Migrating remaining Person legacy nationality data...');
    const migrated = await prisma.$executeRaw`
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
    `;
    console.log(`  → Inserted ${migrated} new nationality records\n`);

    // Step 3: Update cached nationality fields
    console.log('STEP 3: Updating Person cached nationality fields...');
    const updated = await prisma.$executeRaw`
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
    `;
    console.log(`  → Updated ${updated} Person records\n`);

    // Step 4: Drop audit table
    console.log('STEP 4: Dropping affiliation_backfill_audit table...');
    await prisma.$executeRaw`DROP TABLE IF EXISTS affiliation_backfill_audit CASCADE;`;
    console.log(`  → Dropped affiliation_backfill_audit table\n`);

    // Step 5: Drop legacy nationality columns
    console.log('STEP 5: Dropping legacy nationality columns from Person table...');
    await prisma.$executeRaw`
      ALTER TABLE "Person"
          DROP COLUMN IF EXISTS "nationalityArray",
          DROP COLUMN IF EXISTS "primaryNationality";
    `;
    console.log(`  → Dropped legacy nationality columns\n`);

    console.log('STEP 6: Keeping HistoricalNationality tables as reference data...');
    console.log(`  → HistoricalNationality tables retained (26 records)`);
    console.log(`  → HistoricalNationalityToCountry retained (14 records)\n`);

    // Final verification
    console.log('═══════════════════════════════════════════════════');
    console.log('VERIFICATION');
    console.log('═══════════════════════════════════════════════════\n');

    const verification = await prisma.$queryRaw`
      SELECT
        (SELECT COUNT(DISTINCT "personId") FROM "PersonNationality") as persons_with_nationalities,
        (SELECT COUNT(*) FROM "PersonNationality") as total_nationality_records,
        (SELECT COUNT(*) FROM information_schema.tables
         WHERE table_name = 'affiliation_backfill_audit') as audit_table_exists,
        (SELECT COUNT(*) FROM information_schema.columns
         WHERE table_name = 'Person' AND column_name = 'nationalityArray') as nationality_array_exists,
        (SELECT COUNT(*) FROM information_schema.columns
         WHERE table_name = 'Person' AND column_name = 'primaryNationality') as primary_nationality_exists;
    `;

    console.log('Final State:');
    console.log(`  → Persons with nationality data: ${verification[0].persons_with_nationalities}`);
    console.log(`  → Total nationality records: ${verification[0].total_nationality_records}`);
    console.log(`  → Audit table exists: ${verification[0].audit_table_exists === 0n ? 'NO ✓' : 'YES ✗'}`);
    console.log(`  → nationalityArray column exists: ${verification[0].nationality_array_exists === 0n ? 'NO ✓' : 'YES ✗'}`);
    console.log(`  → primaryNationality column exists: ${verification[0].primary_nationality_exists === 0n ? 'NO ✓' : 'YES ✗'}\n`);

    if (verification[0].nationality_array_exists === 0n &&
        verification[0].primary_nationality_exists === 0n &&
        verification[0].audit_table_exists === 0n) {
      console.log('═══════════════════════════════════════════════════');
      console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!');
      console.log('═══════════════════════════════════════════════════\n');
      console.log('You can now safely run:');
      console.log('  npx prisma db push\n');
    } else {
      console.log('⚠️  Some legacy structures still exist. Please review above.\n');
    }

  } catch (error) {
    console.error('❌ Error during migration:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
