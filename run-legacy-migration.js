const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

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
    console.log('LEGACY DATA MIGRATION');
    console.log('═══════════════════════════════════════════════════\n');

    // Read the SQL migration script
    const sqlPath = path.join(__dirname, 'migrate-all-legacy-data.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing migration script...\n');

    // Execute the migration
    await prisma.$executeRawUnsafe(sql);

    console.log('\n✓ Migration completed successfully!\n');

    // Verify the results
    console.log('Verifying migration results...\n');

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

    console.log('Verification Results:');
    console.table(verification);

    if (verification[0].nationality_array_exists === 0n &&
        verification[0].primary_nationality_exists === 0n &&
        verification[0].audit_table_exists === 0n) {
      console.log('\n✅ All legacy data successfully migrated and cleaned up!');
      console.log('✅ You can now safely run: npx prisma db push\n');
    } else {
      console.log('\n⚠️  Some legacy structures still exist. Please review the verification results above.\n');
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
