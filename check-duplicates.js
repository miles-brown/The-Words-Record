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
    // Check for duplicate names
    const duplicates = await prisma.$queryRaw`
      SELECT name, COUNT(*) as count
      FROM "HistoricalNationality"
      GROUP BY name
      HAVING COUNT(*) > 1;
    `;

    if (duplicates.length > 0) {
      console.log('⚠️  Found duplicate names:');
      console.table(duplicates);
    } else {
      console.log('✓ No duplicate names found');
    }

    // Check countrycode column lengths
    const longCodes = await prisma.$queryRaw`
      SELECT countrycode, LENGTH(countrycode) as length
      FROM "HistoricalNationalityToCountry"
      WHERE countrycode IS NOT NULL AND LENGTH(countrycode) > 2;
    `;

    if (longCodes.length > 0) {
      console.log('\n⚠️  Found country codes longer than 2 characters:');
      console.table(longCodes);
    } else {
      console.log('✓ All country codes are 2 characters or less');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
