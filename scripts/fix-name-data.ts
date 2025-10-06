import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing name data issues...\n')

  // 1. Fix stage names - set proper firstName and lastName from aliases
  console.log('=== FIXING STAGE NAMES ===\n')

  const stageNameFixes = [
    { stage: 'Rihanna', real: 'Robyn Rihanna Fenty', first: 'Robyn', middle: 'Rihanna', last: 'Fenty' },
    { stage: 'Halsey', real: 'Ashley Nicolette Frangipane', first: 'Ashley', middle: 'Nicolette', last: 'Frangipane' },
    { stage: 'Madonna', real: 'Madonna Louise Ciccone', first: 'Madonna', middle: 'Louise', last: 'Ciccone' },
    { stage: 'Macklemore', real: 'Benjamin Hammond Haggerty', first: 'Benjamin', middle: 'Hammond', last: 'Haggerty' },
    { stage: 'Vaush', real: 'Ian Kochinski', first: 'Ian', middle: null, last: 'Kochinski' },
    { stage: 'Lorde', real: 'Ella Marija Lani Yelich-O\'Connor', first: 'Ella', middle: 'Marija Lani', last: 'Yelich-O\'Connor' },
    { stage: 'Lowkey', real: 'Kareem Dennis', first: 'Kareem', middle: null, last: 'Dennis' },
    { stage: 'Akala', real: 'Kingslee James McLean Daley', first: 'Kingslee', middle: 'James McLean', last: 'Daley' },
    { stage: 'M.I.A.', real: 'Mathangi Arulpragasam', first: 'Mathangi', middle: null, last: 'Arulpragasam' },
    { stage: 'Cher', real: 'Cherilyn Sarkisian', first: 'Cherilyn', middle: null, last: 'Sarkisian' },
    { stage: 'Lady Gaga', real: 'Stefani Joanne Angelina Germanotta', first: 'Stefani', middle: 'Joanne Angelina', last: 'Germanotta' }
  ]

  for (const fix of stageNameFixes) {
    const person = await prisma.person.findFirst({
      where: { name: fix.stage }
    })

    if (person) {
      await prisma.person.update({
        where: { id: person.id },
        data: {
          fullName: fix.real,
          firstName: fix.first,
          middleName: fix.middle,
          lastName: fix.last,
          // Keep the stage name as the display name
          name: fix.stage
        }
      })
      console.log(`✅ Fixed ${fix.stage}: Set real name "${fix.real}" in separate fields`)
    }
  }

  // 2. Clean up parenthetical content in names
  console.log('\n=== CLEANING PARENTHETICAL CONTENT ===\n')

  const peopleWithParens = await prisma.person.findMany({
    where: { name: { contains: '(' } }
  })

  for (const person of peopleWithParens) {
    const nameBase = person.name.split('(')[0].trim()
    const parenthetical = person.name.match(/\((.*?)\)/)?.[1] || ''

    // Parse the clean name parts
    const nameParts = nameBase.split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : null
    const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : null

    // Determine what the parenthetical content represents
    let updates: any = {
      name: nameBase,  // Clean display name without parenthetical
      firstName,
      middleName,
      lastName
    }

    // Special handling for specific cases
    if (nameBase === 'Destiny') {
      // "Destiny (Steven Bonnell)" - Destiny is stage name, parenthetical is real name
      updates.fullName = parenthetical
      updates.firstName = 'Steven'
      updates.lastName = 'Bonnell'
      updates.aliases = ['Destiny']
      updates.akaNames = ['Destiny']
      updates.name = 'Destiny'  // Keep stage name as display
    } else if (parenthetical.includes('News') || parenthetical.includes('Minister') ||
               parenthetical.includes('Commissioner') || parenthetical.includes('President')) {
      // Professional title/position - add to profession detail
      updates.professionDetail = parenthetical
    } else if (parenthetical === 'Pink Floyd') {
      // Band name - add to aliases
      updates.aliases = ['Pink Floyd bassist']
    } else if (parenthetical === 'HasanAbi') {
      // Online handle - add to aliases
      updates.aliases = ['HasanAbi']
      updates.akaNames = ['HasanAbi']
    }

    await prisma.person.update({
      where: { id: person.id },
      data: updates
    })

    console.log(`✅ Cleaned "${person.name}" → "${nameBase}"`)
    if (parenthetical && updates.professionDetail) {
      console.log(`   Moved "${parenthetical}" to professionDetail field`)
    }
  }

  // 3. Delete invalid "Various" entries
  console.log('\n=== REMOVING INVALID ENTRIES ===\n')

  const variousEntries = await prisma.person.findMany({
    where: { name: { startsWith: 'Various' } }
  })

  for (const entry of variousEntries) {
    // First check if they have any relations
    const hasRelations = await prisma.person.findFirst({
      where: { id: entry.id },
      include: {
        _count: {
          select: {
            incidents: true,
            statements: true
          }
        }
      }
    })

    if (hasRelations && (hasRelations._count.incidents > 0 || hasRelations._count.statements > 0)) {
      console.log(`⚠️  Cannot delete "${entry.name}" - has ${hasRelations._count.incidents} incidents and ${hasRelations._count.statements} statements`)
    } else {
      await prisma.person.delete({
        where: { id: entry.id }
      })
      console.log(`✅ Deleted invalid entry: "${entry.name}"`)
    }
  }

  // 4. Fix single-name people who aren't stage names
  console.log('\n=== FIXING SINGLE NAME ENTRIES ===\n')

  // For "Destiny" entries that we haven't fixed yet
  const destinyEntries = await prisma.person.findMany({
    where: {
      name: { contains: 'Destiny' },
      firstName: 'Destiny'
    }
  })

  for (const entry of destinyEntries) {
    await prisma.person.update({
      where: { id: entry.id },
      data: {
        firstName: 'Steven',
        lastName: 'Bonnell',
        fullName: 'Steven Bonnell II',
        aliases: ['Destiny'],
        akaNames: ['Destiny']
      }
    })
    console.log(`✅ Fixed Destiny entry: Set real name "Steven Bonnell"`)
  }

  console.log('\n✨ Name data cleanup complete!')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })