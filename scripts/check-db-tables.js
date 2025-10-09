const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTables() {
  try {
    // Check if Incident table exists
    const incidentCheck = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'Incident'
      ) as "incidentExists";
    `);

    // Check if Case table exists
    const caseCheck = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'Case'
      ) as "caseExists";
    `);

    // Check if Case.visibility column exists
    const visibilityCheck = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'Case'
        AND column_name = 'visibility'
      ) as "visibilityExists";
    `);

    console.log('\n=== DATABASE STATUS ===');
    console.log('Incident table exists:', incidentCheck[0].incidentExists);
    console.log('Case table exists:', caseCheck[0].caseExists);
    console.log('Case.visibility column exists:', visibilityCheck[0].visibilityExists);
    console.log('\n=== REQUIRED MIGRATIONS ===');

    if (incidentCheck[0].incidentExists && !caseCheck[0].caseExists) {
      console.log('❌ Need to run: rename_incident_to_case_safe.sql');
    } else if (caseCheck[0].caseExists && !visibilityCheck[0].visibilityExists) {
      console.log('❌ Need to add visibility column');
    } else if (caseCheck[0].caseExists && visibilityCheck[0].visibilityExists) {
      console.log('✅ Database schema is up to date!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
