import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Starting removal of invalid entries...\n')

  // List of invalid person IDs and their associated statement IDs
  const invalidEntries = [
    {
      personId: 'cmgbdtp20000lrowu1dnfbwx7',
      name: 'Various social media users and pro-Israel advocates',
      statementIds: ['resp_cmgbdtp21000nrowuzjhd91f7']
    },
    {
      personId: 'cmgbdy90v000lroagdbjhchs5',
      name: 'Various pro-Israel social media users',
      statementIds: ['resp_cmgbdy90w000nroagi5m29gsu']
    },
    {
      personId: 'cmgbdy90w000oroagwhu9n8uh',
      name: 'Palestinian solidarity activists',
      statementIds: ['resp_cmgbdy90x000qroag3x1snprv']
    },
    {
      personId: 'cmgbf543y000lroz9p82owgro',
      name: 'Hip-hop community and fans on social media',
      statementIds: ['resp_cmgbf543z000nroz9qvo7wqcm']
    },
    {
      personId: 'cmgbcyejq000irozmc35hz1ds',
      name: 'Various Twitter Users',
      statementIds: ['resp_cmgbd2qp0000krohxtne1237l', 'resp_cmgbcyejr000krozm0amtr3z6']
    },
    {
      personId: 'cmgbdhb8p000lros69jqyk1kx',
      name: 'Various pro-Palestinian activists and supporters',
      statementIds: ['resp_cmgbdhb8p000nros6d0xigm83']
    },
    {
      personId: 'cmgbebbz6000iro99y2xv11li',
      name: 'Various pro-Israel social media users and commentators',
      statementIds: ['resp_cmgbebbz7000kro991fpi7wrc']
    },
    {
      personId: 'cmgbeohzz000lrodm9d2jdqvy',
      name: 'Various pro-Palestine activists and intellectuals',
      statementIds: ['resp_cmgbeoi01000nrodm3sw3lucm']
    },
    {
      personId: 'cmgbff578000lroqqtx7lu3vp',
      name: 'Various Hollywood industry figures',
      statementIds: ['resp_cmgbff579000nroqqgzfww52u']
    },
    {
      personId: 'cmgbd27q1000iroferkbe66fn',
      name: 'Various Twitter users and online political commentators',
      statementIds: ['resp_cmgbd27q2000krofexxv9elgf']
    }
  ]

  let statementsDeleted = 0
  let peopleDeleted = 0
  let errors = []

  console.log('=== STEP 1: DELETING STATEMENTS ===\n')

  for (const entry of invalidEntries) {
    for (const statementId of entry.statementIds) {
      try {
        const statement = await prisma.statement.findUnique({
          where: { id: statementId },
          select: {
            id: true,
            content: true,
            person: { select: { name: true } }
          }
        })

        if (statement) {
          await prisma.statement.delete({
            where: { id: statementId }
          })
          console.log(`✅ Deleted statement ${statementId}`)
          console.log(`   From: "${statement.person?.name || 'Unknown'}"`)
          console.log(`   Content: "${statement.content.substring(0, 60)}..."\n`)
          statementsDeleted++
        } else {
          console.log(`⚠️  Statement ${statementId} not found (may have been deleted already)\n`)
        }
      } catch (error) {
        console.error(`❌ Error deleting statement ${statementId}:`, error)
        errors.push(`Statement ${statementId}: ${error}`)
      }
    }
  }

  console.log('=== STEP 2: DELETING INVALID PERSON ENTRIES ===\n')

  for (const entry of invalidEntries) {
    try {
      const person = await prisma.person.findUnique({
        where: { id: entry.personId },
        include: {
          _count: {
            select: {
              statements: true,
              cases: true
            }
          }
        }
      })

      if (person) {
        // Double-check no remaining relations
        if (person._count.statements > 0) {
          console.log(`⚠️  Cannot delete "${entry.name}" - still has ${person._count.statements} statements`)
          continue
        }

        if (person._count.cases > 0) {
          console.log(`⚠️  Cannot delete "${entry.name}" - still has ${person._count.cases} incidents`)
          continue
        }

        await prisma.person.delete({
          where: { id: entry.personId }
        })
        console.log(`✅ Deleted person: "${entry.name}"`)
        console.log(`   ID: ${entry.personId}\n`)
        peopleDeleted++
      } else {
        console.log(`⚠️  Person "${entry.name}" not found (may have been deleted already)\n`)
      }
    } catch (error) {
      console.error(`❌ Error deleting person ${entry.name}:`, error)
      errors.push(`Person ${entry.name}: ${error}`)
    }
  }

  // Handle duplicates
  console.log('=== STEP 3: MERGING DUPLICATE ENTRIES ===\n')

  const duplicates = [
    { name: 'Hasan Piker', ids: ['cmgbd1oqm000irod700hx0mx4', 'cmgbcxw8a0000rox52va1eab9'] },
    { name: 'Destiny', ids: ['cmgbd1oqi000frod7j7qfds8a', 'cmgbd27pb0000rofesowkx4ot'] },
    { name: 'Roger Waters', ids: ['cmgbefcuy000orojnhw9yixzj', 'cmgbdvzoc0000ro4qlhjongjg'] }
  ]

  for (const dup of duplicates) {
    const [primaryId, secondaryId] = dup.ids

    try {
      // Get both persons
      const primary = await prisma.person.findUnique({
        where: { id: primaryId },
        include: { _count: { select: { statements: true, cases: true } } }
      })

      const secondary = await prisma.person.findUnique({
        where: { id: secondaryId },
        include: { _count: { select: { statements: true, cases: true } } }
      })

      if (primary && secondary) {
        console.log(`Merging duplicate: ${dup.name}`)
        console.log(`  Primary (${primaryId}): ${primary._count.statements} statements, ${primary._count.cases} incidents`)
        console.log(`  Secondary (${secondaryId}): ${secondary._count.statements} statements, ${secondary._count.cases} incidents`)

        // Update all statements from secondary to primary
        await prisma.statement.updateMany({
          where: { personId: secondaryId },
          data: { personId: primaryId }
        })

        // Update case relations (many-to-many)
        const secondaryCases = await prisma.case.findMany({
          where: { people: { some: { id: secondaryId } } },
          select: { id: true }
        })

        for (const caseItem of secondaryCases) {
          await prisma.case.update({
            where: { id: caseItem.id },
            data: {
              people: {
                disconnect: { id: secondaryId },
                connect: { id: primaryId }
              }
            }
          })
        }

        // Delete the secondary person
        await prisma.person.delete({
          where: { id: secondaryId }
        })

        console.log(`  ✅ Merged and deleted secondary entry\n`)
        peopleDeleted++
      }
    } catch (error) {
      console.error(`❌ Error merging ${dup.name}:`, error)
      errors.push(`Merge ${dup.name}: ${error}`)
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('=== REMOVAL SUMMARY ===\n')
  console.log(`✅ Statements deleted: ${statementsDeleted}`)
  console.log(`✅ Invalid people deleted: ${peopleDeleted}`)

  if (errors.length > 0) {
    console.log(`\n❌ Errors encountered: ${errors.length}`)
    errors.forEach(err => console.log(`  - ${err}`))
  }

  // Verify cleanup
  console.log('\n=== VERIFICATION ===\n')

  const remainingVarious = await prisma.person.count({
    where: { name: { contains: 'Various' } }
  })

  const remainingGroupTerms = await prisma.person.count({
    where: {
      OR: [
        { name: { contains: 'users' } },
        { name: { contains: 'community' } },
        { name: { contains: 'activists' } },
        { name: { contains: 'supporters' } },
        { name: { contains: 'commentators' } },
        { name: { contains: 'figures' } }
      ]
    }
  })

  console.log(`Remaining "Various" entries: ${remainingVarious}`)
  console.log(`Remaining group-like entries: ${remainingGroupTerms}`)

  if (remainingVarious === 0 && remainingGroupTerms === 0) {
    console.log('\n✨ All invalid entries successfully removed!')
  } else {
    console.log('\n⚠️  Some invalid entries may still remain. Run find-invalid-entries.ts to check.')
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })