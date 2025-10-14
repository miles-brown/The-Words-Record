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
    // Check if there's a link from Person to HistoricalNationality
    console.log('Checking for foreign key references...\n');

    const foreignKeys = await prisma.$queryRaw`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND (tc.table_name IN ('HistoricalNationality', 'HistoricalNationalityToCountry')
          OR ccu.table_name IN ('HistoricalNationality', 'HistoricalNationalityToCountry'));
    `;
    console.log('Foreign key relationships:');
    console.table(foreignKeys);

    // Check Person table for any historical nationality references
    console.log('\n\nChecking Person table columns for historical nationality references...\n');
    const personColumns = await prisma.$queryRaw`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'Person'
        AND column_name ILIKE '%historical%'
      ORDER BY column_name;
    `;
    console.log('Person columns with "historical" in name:');
    console.table(personColumns);

    // Check if there are any Person records with data in old nationality fields
    console.log('\n\nChecking Person records with legacy nationality data...\n');
    const legacyNationalityData = await prisma.$queryRaw`
      SELECT
        COUNT(*) FILTER (WHERE "nationalityArray" IS NOT NULL AND array_length("nationalityArray", 1) > 0) as with_nationality_array,
        COUNT(*) FILTER (WHERE "primaryNationality" IS NOT NULL) as with_primary_nationality
      FROM "Person";
    `;
    console.log('Person records with legacy nationality data:');
    console.table(legacyNationalityData);

    // Sample of Person records with legacy nationality data
    console.log('\n\nSample Person records with legacy nationality data (first 5):');
    const samplePersons = await prisma.$queryRaw`
      SELECT id, name, "nationalityArray", "primaryNationality"
      FROM "Person"
      WHERE ("nationalityArray" IS NOT NULL AND array_length("nationalityArray", 1) > 0)
         OR "primaryNationality" IS NOT NULL
      LIMIT 5;
    `;
    console.table(samplePersons);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
