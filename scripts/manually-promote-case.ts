/**
 * Manually Promote a Case
 *
 * Use this to promote specific cases without needing engagement metrics
 * Good for testing or when you want to enrich a specific case
 *
 * Usage:
 *   npx ts-node scripts/manually-promote-case.ts <case-slug>
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function manuallyPromoteCase(slug: string) {
  console.log(`🔍 Looking up case: ${slug}\n`)

  const caseRecord = await prisma.case.findUnique({
    where: { slug },
    include: {
      statements: {
        take: 1,
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  if (!caseRecord) {
    console.error(`❌ Case not found: ${slug}`)
    process.exit(1)
  }

  if (caseRecord.isRealIncident) {
    console.log(`ℹ️  Case is already promoted (isRealIncident = true)`)
    console.log(`   You can now enrich it with:\n`)
    console.log(`   npx ts-node scripts/research-and-enrich-case.ts ${slug}`)
    console.log(`   npx ts-node scripts/research-and-enrich-case.ts --web-search ${slug}`)
    return
  }

  console.log(`📋 Case Information:`)
  console.log(`   Title: ${caseRecord.title}`)
  console.log(`   Current status: Statement-only page`)
  console.log(`   Statements: ${caseRecord.statements.length}`)
  console.log(``)

  // Get the originating statement
  const originatingStatement = caseRecord.statements[0]

  if (!originatingStatement) {
    console.error(`❌ No statements found for this case`)
    process.exit(1)
  }

  console.log(`🚀 Promoting case to full case status...\n`)

  await prisma.case.update({
    where: { id: caseRecord.id },
    data: {
      isRealIncident: true,
      wasAutoImported: false,
      wasManuallyPromoted: true,
      promotedAt: new Date(),
      promotedBy: 'MANUAL_PROMOTION_SCRIPT',
      promotionReason: 'Manually promoted for enrichment',
      originatingStatementId: originatingStatement.id,
      qualificationScore: 50, // Default score for manual promotion
      visibility: 'PUBLIC',
      status: 'DOCUMENTED'
    }
  })

  console.log(`✅ Case promoted successfully!`)
  console.log(``)
  console.log(`🎯 Next Steps:`)
  console.log(``)
  console.log(`1. Enrich without web search (faster):`)
  console.log(`   npx ts-node scripts/research-and-enrich-case.ts ${slug}`)
  console.log(``)
  console.log(`2. Enrich with web search (more comprehensive):`)
  console.log(`   npx ts-node scripts/research-and-enrich-case.ts --web-search ${slug}`)
  console.log(``)
  console.log(`3. Or use the admin UI:`)
  console.log(`   Go to /admin/cases/<id> and click "✨ AI Enrich"`)
}

async function main() {
  const slug = process.argv[2]

  if (!slug) {
    console.log(`
Usage:
  npx ts-node scripts/manually-promote-case.ts <case-slug>

Example:
  npx ts-node scripts/manually-promote-case.ts jeremy-corbyn-facebook-post-and-public-statement-statement-30-october-2020

Available cases (first 10):`)

    const cases = await prisma.case.findMany({
      where: { isRealIncident: false },
      select: { slug: true, title: true },
      take: 10
    })

    cases.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.slug}`)
      console.log(`     ${c.title}`)
    })

    console.log(`\nRun with a slug to promote that case.`)
    process.exit(0)
  }

  try {
    await manuallyPromoteCase(slug)
    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    console.error(`\n❌ Error:`, error instanceof Error ? error.message : error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

main()
