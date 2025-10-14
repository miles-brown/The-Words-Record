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
    console.log('DATA INTEGRITY VERIFICATION');
    console.log('After Nationality Migration');
    console.log('═══════════════════════════════════════════════════\n');

    let issues = [];

    // 1. Check PersonNationality data
    console.log('1️⃣  CHECKING PERSONNATIONALITY DATA...\n');

    const personsWithNationality = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT "personId") as count
      FROM "PersonNationality";
    `;
    console.log(`✓ Persons with nationality records: ${personsWithNationality[0].count}`);

    const totalNationalityRecords = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "PersonNationality";
    `;
    console.log(`✓ Total nationality records: ${totalNationalityRecords[0].count}`);

    // Check for invalid country codes
    const invalidCountryCodes = await prisma.$queryRaw`
      SELECT DISTINCT pn."countryCode"
      FROM "PersonNationality" pn
      LEFT JOIN "Country" c ON pn."countryCode" = c.code
      WHERE c.code IS NULL;
    `;

    if (invalidCountryCodes.length > 0) {
      console.log(`⚠️  Found ${invalidCountryCodes.length} invalid country codes:`);
      console.table(invalidCountryCodes);
      issues.push(`${invalidCountryCodes.length} PersonNationality records with invalid country codes`);
    } else {
      console.log('✓ All country codes are valid');
    }

    // Check for orphaned nationality records
    const orphanedNationalities = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "PersonNationality" pn
      LEFT JOIN "Person" p ON pn."personId" = p.id
      WHERE p.id IS NULL;
    `;

    if (orphanedNationalities[0].count > 0) {
      console.log(`⚠️  Found ${orphanedNationalities[0].count} orphaned nationality records`);
      issues.push(`${orphanedNationalities[0].count} orphaned PersonNationality records`);
    } else {
      console.log('✓ No orphaned nationality records');
    }

    // 2. Check Person cached fields
    console.log('\n2️⃣  CHECKING PERSON CACHED NATIONALITY FIELDS...\n');

    const personsMissingCache = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "Person" p
      WHERE EXISTS (
        SELECT 1 FROM "PersonNationality" pn WHERE pn."personId" = p.id
      )
      AND ("nationality_primary_code" IS NULL OR "nationality_codes_cached" IS NULL);
    `;

    if (personsMissingCache[0].count > 0) {
      console.log(`⚠️  ${personsMissingCache[0].count} persons with nationalities but missing cache`);
      issues.push(`${personsMissingCache[0].count} persons missing nationality cache`);
    } else {
      console.log('✓ All persons with nationalities have cached fields');
    }

    const personsWithCache = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "Person"
      WHERE "nationality_primary_code" IS NOT NULL;
    `;
    console.log(`✓ Persons with cached primary nationality: ${personsWithCache[0].count}`);

    // 3. Check for legacy fields (should be gone)
    console.log('\n3️⃣  CHECKING FOR LEGACY NATIONALITY FIELDS...\n');

    const legacyColumns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Person'
        AND column_name IN ('nationalityArray', 'primaryNationality');
    `;

    if (legacyColumns.length > 0) {
      console.log('⚠️  Legacy columns still exist:');
      console.table(legacyColumns);
      issues.push(`Legacy nationality columns still in Person table`);
    } else {
      console.log('✓ Legacy nationality columns removed');
    }

    // 4. Check Historical tables
    console.log('\n4️⃣  CHECKING HISTORICAL NATIONALITY TABLES...\n');

    const historicalCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "HistoricalNationality";
    `;
    console.log(`✓ HistoricalNationality records: ${historicalCount[0].count}`);

    const historicalMappings = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "HistoricalNationalityToCountry";
    `;
    console.log(`✓ HistoricalNationalityToCountry mappings: ${historicalMappings[0].count}`);

    // 5. General data integrity checks
    console.log('\n5️⃣  GENERAL DATA INTEGRITY CHECKS...\n');

    // Check for duplicate primary nationalities
    const duplicatePrimary = await prisma.$queryRaw`
      SELECT "personId", COUNT(*) as count
      FROM "PersonNationality"
      WHERE "isPrimary" = true AND "endDate" IS NULL
      GROUP BY "personId"
      HAVING COUNT(*) > 1;
    `;

    if (duplicatePrimary.length > 0) {
      console.log(`⚠️  ${duplicatePrimary.length} persons with multiple primary nationalities:`);
      console.table(duplicatePrimary.slice(0, 5));
      issues.push(`${duplicatePrimary.length} persons with multiple primary nationalities`);
    } else {
      console.log('✓ No persons with multiple primary nationalities');
    }

    // Check total record counts
    const counts = await prisma.$queryRaw`
      SELECT
        (SELECT COUNT(*) FROM "Person") as people,
        (SELECT COUNT(*) FROM "Organization") as orgs,
        (SELECT COUNT(*) FROM "Statement") as statements,
        (SELECT COUNT(*) FROM "Case") as cases,
        (SELECT COUNT(*) FROM "Source") as sources,
        (SELECT COUNT(*) FROM "Country") as countries;
    `;

    console.log('\n📊 TOTAL RECORD COUNTS:\n');
    console.table([{
      People: counts[0].people.toString(),
      Organizations: counts[0].orgs.toString(),
      Statements: counts[0].statements.toString(),
      Cases: counts[0].cases.toString(),
      Sources: counts[0].sources.toString(),
      Countries: counts[0].countries.toString()
    }]);

    // Summary
    console.log('\n═══════════════════════════════════════════════════');
    console.log('SUMMARY');
    console.log('═══════════════════════════════════════════════════\n');

    if (issues.length === 0) {
      console.log('✅ NO ISSUES FOUND - Data integrity is good!\n');
      console.log('Nationality migration completed successfully:');
      console.log(`  - ${personsWithNationality[0].count} persons have nationality data`);
      console.log(`  - ${totalNationalityRecords[0].count} total nationality records`);
      console.log(`  - ${historicalCount[0].count} historical nationalities preserved`);
      console.log('  - Legacy fields removed');
      console.log('  - All foreign keys valid');
      console.log('  - Cached fields populated\n');
    } else {
      console.log(`⚠️  FOUND ${issues.length} ISSUE(S):\n`);
      issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
      console.log();
    }

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
