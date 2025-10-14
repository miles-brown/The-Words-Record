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
    console.log('Checking HistoricalNationality table...\n');
    const historicalNationality = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'HistoricalNationality'
      ORDER BY ordinal_position;
    `;
    console.log('HistoricalNationality schema:');
    console.table(historicalNationality);

    const histCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "HistoricalNationality";
    `;
    console.log('\nHistoricalNationality row count:', histCount[0].count);

    console.log('\n\nChecking HistoricalNationalityToCountry table...\n');
    const historicalNationalityToCountry = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'HistoricalNationalityToCountry'
      ORDER BY ordinal_position;
    `;
    console.log('HistoricalNationalityToCountry schema:');
    console.table(historicalNationalityToCountry);

    const histToCountryCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "HistoricalNationalityToCountry";
    `;
    console.log('\nHistoricalNationalityToCountry row count:', histToCountryCount[0].count);

    console.log('\n\nChecking affiliation_backfill_audit table...\n');
    const affiliationAudit = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'affiliation_backfill_audit'
      ORDER BY ordinal_position;
    `;
    console.log('affiliation_backfill_audit schema:');
    console.table(affiliationAudit);

    const auditCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM affiliation_backfill_audit;
    `;
    console.log('\naffiliation_backfill_audit row count:', auditCount[0].count);

    // Check sample data from HistoricalNationality
    console.log('\n\nSample data from HistoricalNationality (first 5 rows):');
    const histSample = await prisma.$queryRaw`
      SELECT * FROM "HistoricalNationality" LIMIT 5;
    `;
    console.table(histSample);

    // Check sample data from HistoricalNationalityToCountry
    console.log('\n\nSample data from HistoricalNationalityToCountry (first 5 rows):');
    const histToCountrySample = await prisma.$queryRaw`
      SELECT * FROM "HistoricalNationalityToCountry" LIMIT 5;
    `;
    console.table(histToCountrySample);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
