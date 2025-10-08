import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Finding all invalid person and statement entries...\n')

  // 1. Find all "Various" entries with their statements
  console.log('=== VARIOUS/GROUP ENTRIES ===\n')

  const variousEntries = await prisma.person.findMany({
    where: {
      OR: [
        { name: { startsWith: 'Various' } },
        { name: { contains: 'users' } },
        { name: { contains: 'community' } },
        { name: { contains: 'activists' } },
        { name: { contains: 'supporters' } },
        { name: { contains: 'commentators' } },
        { name: { contains: 'figures' } },
        { name: { contains: 'intellectuals' } }
      ]
    },
    include: {
      statements: {
        select: {
          id: true,
          content: true,
          statementType: true,
          case: {
            select: {
              id: true,
              title: true
            }
          }
        }
      },
      _count: {
        select: {
          cases: true,
          statements: true
        }
      }
    }
  })

  console.log(`Found ${variousEntries.length} group/various entries:\n`)

  const removalList = []

  for (const entry of variousEntries) {
    console.log(`📌 "${entry.name}"`)
    console.log(`   ID: ${entry.id}`)
    console.log(`   Incidents: ${entry._count.cases}, Statements: ${entry._count.statements}`)

    if (entry.statements.length > 0) {
      console.log(`   Statements to reassign or remove:`)
      for (const stmt of entry.statements) {
        console.log(`     - Statement ${stmt.id}: "${stmt.content.substring(0, 100)}..."`)
        console.log(`       From case: ${stmt.case?.title || 'No incident linked'}`)
      }
    }

    removalList.push({
      type: 'person',
      id: entry.id,
      name: entry.name,
      hasStatements: entry._count.statements > 0,
      hasIncidents: entry._count.cases > 0,
      statementIds: entry.statements.map(s => s.id)
    })

    console.log()
  }

  // 2. Find placeholder/test entries
  console.log('=== PLACEHOLDER/TEST ENTRIES ===\n')

  const placeholderEntries = await prisma.person.findMany({
    where: {
      OR: [
        { name: { contains: 'Test' } },
        { name: { contains: 'test' } },
        { name: { contains: 'Unknown' } },
        { name: { contains: 'Anonymous' } },
        { name: { contains: 'N/A' } },
        { name: { equals: '' } }
      ]
    },
    include: {
      _count: {
        select: {
          cases: true,
          statements: true
        }
      }
    }
  })

  if (placeholderEntries.length > 0) {
    console.log(`Found ${placeholderEntries.length} placeholder/test entries:\n`)
    for (const entry of placeholderEntries) {
      console.log(`📌 "${entry.name || '[EMPTY NAME]'}"`)
      console.log(`   ID: ${entry.id}`)
      console.log(`   Incidents: ${entry._count.cases}, Statements: ${entry._count.statements}`)

      removalList.push({
        type: 'person',
        id: entry.id,
        name: entry.name,
        hasStatements: entry._count.statements > 0,
        hasIncidents: entry._count.cases > 0
      })
    }
  }

  // 3. Find duplicate entries
  console.log('\n=== POTENTIAL DUPLICATES ===\n')

  const allPeople = await prisma.person.findMany({
    select: { id: true, name: true, firstName: true, lastName: true }
  })

  const duplicates: { [key: string]: any[] } = {}

  for (const person of allPeople) {
    const normalizedName = person.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!duplicates[normalizedName]) {
      duplicates[normalizedName] = []
    }
    duplicates[normalizedName].push(person)
  }

  const duplicateGroups = Object.values(duplicates).filter(group => group.length > 1)

  if (duplicateGroups.length > 0) {
    console.log(`Found ${duplicateGroups.length} potential duplicate groups:\n`)
    for (const group of duplicateGroups.slice(0, 10)) { // Show first 10
      console.log(`Potential duplicates:`)
      for (const person of group) {
        console.log(`  - "${person.name}" (ID: ${person.id})`)
      }
      console.log()
    }
  }

  // 4. Find entries with suspicious patterns
  console.log('=== SUSPICIOUS PATTERNS ===\n')

  const suspiciousEntries = await prisma.person.findMany({
    where: {
      OR: [
        { name: { contains: '&' } }, // Multiple people joined with &
        { name: { contains: ' and ' } }, // Multiple people joined with "and"
        { name: { contains: 'Hip-hop' } },
        { name: { contains: 'Twitter' } },
        { name: { contains: 'social media' } },
        { name: { contains: 'online' } },
        { name: { contains: 'industry' } },
        { name: { contains: 'Members of' } },
        { name: { contains: 'Staff' } },
        { name: { contains: 'Team' } }
      ]
    },
    include: {
      _count: {
        select: {
          cases: true,
          statements: true
        }
      }
    }
  })

  if (suspiciousEntries.length > 0) {
    console.log(`Found ${suspiciousEntries.length} entries with suspicious patterns:\n`)
    for (const entry of suspiciousEntries) {
      console.log(`📌 "${entry.name}"`)
      console.log(`   ID: ${entry.id}`)
      console.log(`   Incidents: ${entry._count.cases}, Statements: ${entry._count.statements}`)

      removalList.push({
        type: 'person',
        id: entry.id,
        name: entry.name,
        hasStatements: entry._count.statements > 0,
        hasIncidents: entry._count.cases > 0
      })
    }
  }

  // 5. Generate removal summary
  console.log('\n' + '='.repeat(60))
  console.log('=== REMOVAL RECOMMENDATIONS ===\n')

  const safeToDelete = removalList.filter(item => !item.hasStatements && !item.hasIncidents)
  const needsReview = removalList.filter(item => item.hasStatements || item.hasIncidents)

  console.log(`SAFE TO DELETE (no relations): ${safeToDelete.length} entries`)
  safeToDelete.forEach(item => {
    console.log(`  ✅ ${item.name} (ID: ${item.id})`)
  })

  console.log(`\nNEEDS MANUAL REVIEW (has statements/incidents): ${needsReview.length} entries`)
  needsReview.forEach(item => {
    console.log(`  ⚠️  ${item.name} (ID: ${item.id})`)
    if (item.statementIds?.length) {
      console.log(`     Statement IDs to reassign: ${item.statementIds.join(', ')}`)
    }
  })

  // 6. Check for orphaned statements
  console.log('\n=== CHECKING FOR ORPHANED STATEMENTS ===\n')

  const statementsWithoutValidPerson = await prisma.statement.findMany({
    where: {
      person: {
        OR: [
          { name: { startsWith: 'Various' } },
          { name: { contains: 'users' } },
          { name: { contains: 'Unknown' } }
        ]
      }
    },
    select: {
      id: true,
      content: true,
      person: {
        select: {
          name: true
        }
      },
      case: {
        select: {
          title: true
        }
      }
    }
  })

  if (statementsWithoutValidPerson.length > 0) {
    console.log(`Found ${statementsWithoutValidPerson.length} statements linked to invalid persons:\n`)
    for (const stmt of statementsWithoutValidPerson.slice(0, 20)) { // Show first 20
      console.log(`Statement ${stmt.id}:`)
      console.log(`  Person: "${stmt.person?.name || 'Unknown'}"`)
      console.log(`  Content: "${stmt.content.substring(0, 100)}..."`)
      console.log(`  Incident: ${stmt.case?.title || 'None'}`)
      console.log()
    }
  }

  // Generate SQL for safe deletions
  console.log('\n=== SQL TO DELETE SAFE ENTRIES ===\n')
  if (safeToDelete.length > 0) {
    const ids = safeToDelete.map(item => `'${item.id}'`).join(', ')
    console.log(`DELETE FROM "Person" WHERE id IN (${ids});`)
  }
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })