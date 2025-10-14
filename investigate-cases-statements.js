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
    console.log('INVESTIGATING CASES vs STATEMENTS ISSUE');
    console.log('═══════════════════════════════════════════════════\n');

    // Check Case table
    console.log('📊 CASE TABLE ANALYSIS\n');

    const caseCount = await prisma.case.count();
    console.log(`Total Cases: ${caseCount}\n`);

    const caseSample = await prisma.case.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        caseDate: true,
        status: true,
        originatingStatementId: true,
        createdAt: true,
      }
    });

    console.log('Recent Cases (first 5):');
    console.table(caseSample.map(c => ({
      slug: c.slug,
      title: c.title.substring(0, 50) + '...',
      hasOriginatingStatement: c.originatingStatementId ? 'YES' : 'NO',
      status: c.status,
      date: c.caseDate.toISOString().split('T')[0]
    })));

    // Check Statement table
    console.log('\n📊 STATEMENT TABLE ANALYSIS\n');

    const statementCount = await prisma.statement.count();
    console.log(`Total Statements: ${statementCount}\n`);

    const statementTypes = await prisma.statement.groupBy({
      by: ['statementType'],
      _count: true
    });

    console.log('Statements by Type:');
    console.table(statementTypes.map(s => ({
      type: s.statementType,
      count: s._count
    })));

    const statementsWithCases = await prisma.statement.count({
      where: { caseId: { not: null } }
    });

    const statementsWithoutCases = await prisma.statement.count({
      where: { caseId: null }
    });

    console.log('\nStatements linked to Cases:');
    console.log(`  - WITH caseId: ${statementsWithCases}`);
    console.log(`  - WITHOUT caseId: ${statementsWithoutCases}\n`);

    // Check if any statements were promoted to cases
    const promotedCases = await prisma.case.count({
      where: { originatingStatementId: { not: null } }
    });

    console.log(`Cases created from statements (promoted): ${promotedCases}\n`);

    // Sample statements
    const statementSample = await prisma.statement.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        statementType: true,
        statementDate: true,
        caseId: true,
        personId: true,
        organizationId: true,
        createdAt: true,
      }
    });

    console.log('Recent Statements (first 5):');
    console.table(statementSample.map(s => ({
      content: s.content.substring(0, 60) + '...',
      type: s.statementType,
      hasCaseId: s.caseId ? 'YES' : 'NO',
      hasPerson: s.personId ? 'YES' : 'NO',
      hasOrg: s.organizationId ? 'YES' : 'NO',
      date: s.statementDate.toISOString().split('T')[0]
    })));

    // Check for data confusion
    console.log('\n⚠️  POTENTIAL ISSUES:\n');

    // Check if cases have statement-like data
    const casesWithLongSummaries = await prisma.case.count({
      where: {
        summary: {
          // If summary is very long, might actually be a statement
          not: null
        }
      }
    });

    console.log(`Cases with summaries: ${casesWithLongSummaries}`);

    // Check routing files
    console.log('\n📁 CHECKING ROUTING SETUP...\n');

    console.log('Expected routes:');
    console.log('  - /cases/[slug] → Case pages');
    console.log('  - /statements/[id] → Statement pages (if exists)');
    console.log('  - Individual statements should be viewable on person/org pages\n');

    console.log('═══════════════════════════════════════════════════');
    console.log('SUMMARY');
    console.log('═══════════════════════════════════════════════════');
    console.log(`Total Cases: ${caseCount}`);
    console.log(`Total Statements: ${statementCount}`);
    console.log(`Statements linked to Cases: ${statementsWithCases}`);
    console.log(`Standalone Statements: ${statementsWithoutCases}`);
    console.log(`Cases promoted from Statements: ${promotedCases}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
