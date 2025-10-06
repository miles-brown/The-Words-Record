import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Analyzing name data issues in the database...\n')

  // 1. Find people with stage names (single names)
  const singleNamePeople = await prisma.person.findMany({
    where: {
      AND: [
        { name: { not: { contains: ' ' } } },
        { name: { not: { contains: '(' } } }
      ]
    },
    select: {
      id: true,
      name: true,
      firstName: true,
      middleName: true,
      lastName: true,
      fullName: true,
      aliases: true,
      akaNames: true
    }
  })

  console.log('=== STAGE NAMES / SINGLE NAME ARTISTS ===')
  console.log(`Found ${singleNamePeople.length} people with single names:\n`)
  singleNamePeople.forEach(p => {
    console.log(`• ${p.name}`)
    console.log(`  firstName: ${p.firstName || 'NULL'}, lastName: ${p.lastName || 'NULL'}`)
    console.log(`  fullName: ${p.fullName || 'NULL'}`)
    console.log(`  aliases: ${p.aliases?.length ? p.aliases.join(', ') : 'none'}`)
    console.log(`  akaNames: ${p.akaNames?.length ? p.akaNames.join(', ') : 'none'}`)
  })

  // 2. Find people with parenthetical content (descriptions/titles)
  const peopleWithParenthetical = await prisma.person.findMany({
    where: { name: { contains: '(' } },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      fullName: true,
      profession: true
    }
  })

  console.log('\n=== PEOPLE WITH PARENTHETICAL CONTENT ===')
  console.log(`Found ${peopleWithParenthetical.length} people with parenthetical content:\n`)
  peopleWithParenthetical.slice(0, 10).forEach(p => {
    const nameBase = p.name.split('(')[0].trim()
    const parenthetical = p.name.match(/\((.*?)\)/)?.[1] || ''
    console.log(`• "${p.name}"`)
    console.log(`  Base name: "${nameBase}"`)
    console.log(`  Parenthetical: "${parenthetical}"`)
    console.log(`  Should probably be moved to profession/description field`)
  })

  // 3. Find "Various" entries (not actual people)
  const variousEntries = await prisma.person.findMany({
    where: { name: { startsWith: 'Various' } },
    select: { id: true, name: true }
  })

  console.log('\n=== INVALID "VARIOUS" ENTRIES ===')
  console.log(`Found ${variousEntries.length} "Various" entries that are not actual people:\n`)
  variousEntries.forEach(v => {
    console.log(`• "${v.name}"`)
  })

  // 4. Check known stage names and their real names
  const knownStageNames = [
    'Rihanna', 'Halsey', 'Bono', 'Lady Gaga', 'Beyoncé',
    'Madonna', 'Macklemore', 'Vaush', 'Anitta', 'Prince',
    'Lorde', 'Drake', 'Lizzo', 'Cher'
  ]

  console.log('\n=== KNOWN STAGE NAME ANALYSIS ===')
  for (const stageName of knownStageNames) {
    const person = await prisma.person.findFirst({
      where: {
        OR: [
          { name: { contains: stageName } },
          { aliases: { has: stageName } },
          { akaNames: { has: stageName } }
        ]
      },
      select: {
        name: true,
        fullName: true,
        firstName: true,
        lastName: true,
        aliases: true,
        akaNames: true
      }
    })

    if (person) {
      console.log(`\n${stageName}:`)
      console.log(`  Display name: "${person.name}"`)
      console.log(`  Full name: ${person.fullName || 'NOT SET'}`)
      console.log(`  First/Last: ${person.firstName || 'NULL'} / ${person.lastName || 'NULL'}`)
      console.log(`  Aliases: ${person.aliases?.length ? person.aliases.join(', ') : 'none'}`)
      console.log(`  AKA Names: ${person.akaNames?.length ? person.akaNames.join(', ') : 'none'}`)
    } else {
      console.log(`\n${stageName}: NOT FOUND IN DATABASE`)
    }
  }

  // 5. Find people with professional titles in their names
  const titlesPattern = ['Dr.', 'Prof.', 'Rep.', 'Sen.', 'Rev.', 'Gen.', 'Col.', 'Amb.']
  const peopleWithTitles = await prisma.person.findMany({
    where: {
      OR: titlesPattern.map(title => ({ name: { contains: title } }))
    },
    select: { name: true, namePrefix: true },
    take: 10
  })

  console.log('\n=== PEOPLE WITH TITLES IN NAME ===')
  console.log(`Sample of people with professional titles in their display name:\n`)
  peopleWithTitles.forEach(p => {
    console.log(`• "${p.name}" (namePrefix: ${p.namePrefix || 'NULL'})`)
  })

  // 6. Statistics
  const stats = {
    total: await prisma.person.count(),
    withFullName: await prisma.person.count({ where: { fullName: { not: null } } }),
    withAliases: await prisma.person.count({ where: { NOT: { aliases: { isEmpty: true } } } }),
    withAkaNames: await prisma.person.count({ where: { NOT: { akaNames: { isEmpty: true } } } })
  }

  console.log('\n=== STATISTICS ===')
  console.log(`Total people: ${stats.total}`)
  console.log(`With fullName set: ${stats.withFullName} (${Math.round(stats.withFullName/stats.total * 100)}%)`)
  console.log(`With aliases: ${stats.withAliases} (${Math.round(stats.withAliases/stats.total * 100)}%)`)
  console.log(`With akaNames: ${stats.withAkaNames} (${Math.round(stats.withAkaNames/stats.total * 100)}%)`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })