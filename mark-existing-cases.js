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
    console.log('MARKING EXISTING CASES AS STATEMENT PAGES');
    console.log('═══════════════════════════════════════════════════\n');

    // Check current state
    const totalCases = await prisma.case.count();
    console.log(`Total cases in database: ${totalCases}\n`);

    const alreadyMarked = await prisma.case.count({
      where: { isRealIncident: false }
    });
    console.log(`Already marked as statement pages: ${alreadyMarked}`);

    const needsMarking = totalCases - alreadyMarked;
    console.log(`Needs marking: ${needsMarking}\n`);

    if (needsMarking === 0) {
      console.log('✓ All cases already properly marked!');
      return;
    }

    console.log('Marking all existing cases as statement pages...\n');

    // Mark all existing cases as statement pages (not real incidents)
    const result = await prisma.case.updateMany({
      where: {
        OR: [
          { isRealIncident: { equals: null } },
          { wasAutoImported: { equals: null } }
        ]
      },
      data: {
        isRealIncident: false,
        wasAutoImported: true,
        qualificationScore: 0
      }
    });

    console.log(`✓ Updated ${result.count} cases\n`);

    // Calculate initial qualification scores
    console.log('Calculating qualification scores...\n');

    const casesWithStatements = await prisma.case.findMany({
      where: { isRealIncident: false },
      include: {
        statements: true,
        repercussions: true
      }
    });

    let scoreUpdates = 0;
    for (const caseRecord of casesWithStatements) {
      // Calculate qualification score
      let score = 0;

      // Statement count (0-30 points)
      const statementCount = caseRecord.statements?.length || 0;
      if (statementCount >= 10) score += 30;
      else if (statementCount >= 5) score += 20;
      else if (statementCount >= 3) score += 10;

      // Response count (0-20 points)
      const responses = caseRecord.statements?.filter(s => s.statementType === 'RESPONSE') || [];
      const responseCount = responses.length;
      if (responseCount >= 10) score += 20;
      else if (responseCount >= 5) score += 15;
      else if (responseCount >= 3) score += 10;

      // Repercussions (0-15 points)
      if (caseRecord.repercussions?.length > 0) score += 15;

      // Update the case with calculated score
      await prisma.case.update({
        where: { id: caseRecord.id },
        data: {
          qualificationScore: score,
          responseCount: responseCount
        }
      });

      scoreUpdates++;
    }

    console.log(`✓ Calculated scores for ${scoreUpdates} cases\n`);

    // Show distribution
    const scoreDistribution = await prisma.$queryRaw`
      SELECT
        CASE
          WHEN "qualificationScore" >= 75 THEN 'Auto-promote (>=75)'
          WHEN "qualificationScore" >= 60 THEN 'Review suggested (60-74)'
          WHEN "qualificationScore" >= 30 THEN 'Moderate (30-59)'
          ELSE 'Low (<30)'
        END as category,
        COUNT(*) as count
      FROM "Case"
      WHERE "isRealIncident" = false
      GROUP BY category
      ORDER BY MIN("qualificationScore") DESC;
    `;

    console.log('Score Distribution:');
    console.table(scoreDistribution);

    // Show top candidates for promotion
    const topCandidates = await prisma.case.findMany({
      where: {
        isRealIncident: false,
        qualificationScore: { gte: 60 }
      },
      orderBy: { qualificationScore: 'desc' },
      take: 5,
      select: {
        id: true,
        slug: true,
        title: true,
        qualificationScore: true,
        responseCount: true,
        _count: {
          select: { statements: true }
        }
      }
    });

    if (topCandidates.length > 0) {
      console.log('\n\n📋 TOP CANDIDATES FOR CASE PROMOTION:\n');
      topCandidates.forEach((candidate, index) => {
        console.log(`${index + 1}. ${candidate.title}`);
        console.log(`   Score: ${candidate.qualificationScore} | Statements: ${candidate._count.statements} | Responses: ${candidate.responseCount}`);
        console.log(`   URL: /statements/${candidate.slug}\n`);
      });
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ COMPLETE');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('Summary:');
    console.log(`  - ${totalCases} total cases`);
    console.log(`  - All marked as statement pages (isRealIncident = false)`);
    console.log(`  - Qualification scores calculated`);
    console.log(`  - ${topCandidates.length} candidates ready for promotion\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
