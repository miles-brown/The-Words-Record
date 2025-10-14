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
    console.log('CALCULATING CASE QUALIFICATION SCORES');
    console.log('═══════════════════════════════════════════════════\n');

    const casesWithStatements = await prisma.case.findMany({
      where: { isRealIncident: false },
      include: {
        statements: true,
        repercussions: true
      }
    });

    console.log(`Processing ${casesWithStatements.length} statement pages...\n`);

    let updates = 0;
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

      // Has public reaction based on statement types
      const hasPublicReaction = responseCount > 2;

      // Update the case
      await prisma.case.update({
        where: { id: caseRecord.id },
        data: {
          qualificationScore: score,
          responseCount: responseCount,
          hasPublicReaction: hasPublicReaction,
          hasRepercussion: caseRecord.repercussions?.length > 0
        }
      });

      updates++;

      if (updates % 50 === 0) {
        console.log(`  Processed ${updates}/${casesWithStatements.length}...`);
      }
    }

    console.log(`\n✓ Updated ${updates} cases\n`);

    // Show distribution
    console.log('SCORE DISTRIBUTION:\n');
    const scoreDistribution = await prisma.$queryRaw`
      SELECT
        CASE
          WHEN "qualificationScore" >= 75 THEN '🔥 Auto-promote (>=75)'
          WHEN "qualificationScore" >= 60 THEN '⭐ Review suggested (60-74)'
          WHEN "qualificationScore" >= 30 THEN '📋 Moderate (30-59)'
          ELSE '📄 Low (<30)'
        END as category,
        COUNT(*) as count,
        ROUND(AVG("qualificationScore")) as avg_score
      FROM "Case"
      WHERE "isRealIncident" = false
      GROUP BY category
      ORDER BY MIN("qualificationScore") DESC;
    `;

    console.table(scoreDistribution);

    // Show top candidates
    const topCandidates = await prisma.case.findMany({
      where: {
        isRealIncident: false,
        qualificationScore: { gte: 60 }
      },
      orderBy: { qualificationScore: 'desc' },
      take: 10,
      select: {
        slug: true,
        title: true,
        qualificationScore: true,
        responseCount: true,
        hasPublicReaction: true,
        hasRepercussion: true,
        _count: {
          select: { statements: true, repercussions: true }
        }
      }
    });

    if (topCandidates.length > 0) {
      console.log('\n\n🎯 TOP CANDIDATES FOR CASE PROMOTION:\n');
      topCandidates.forEach((candidate, index) => {
        console.log(`${index + 1}. ${candidate.title.substring(0, 70)}...`);
        console.log(`   📊 Score: ${candidate.qualificationScore} pts`);
        console.log(`   💬 ${candidate._count.statements} statements (${candidate.responseCount} responses)`);
        if (candidate.hasRepercussion) console.log(`   ⚠️  ${candidate._count.repercussions} repercussions`);
        if (candidate.hasPublicReaction) console.log(`   🔥 Public reaction detected`);
        console.log(`   🔗 /statements/${candidate.slug}\n`);
      });

      console.log(`\n✨ ${topCandidates.length} candidates ready for promotion to full cases!`);
    } else {
      console.log('\nNo candidates found with score >= 60');
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ SCORING COMPLETE');
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
