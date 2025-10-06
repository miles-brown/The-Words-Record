import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing lastName data issues...\n')

  // Find people with problematic lastName values
  const problemPeople = await prisma.person.findMany({
    where: {
      OR: [
        { lastName: { contains: '(' } },
        { lastName: { contains: ')' } },
        { lastName: { equals: '' } }
      ]
    },
    select: {
      id: true,
      name: true,
      firstName: true,
      middleName: true,
      lastName: true
    }
  })

  console.log(`Found ${problemPeople.length} people with lastName issues:\n`)

  for (const person of problemPeople) {
    console.log(`Name: "${person.name}"`)
    console.log(`  Current lastName: "${person.lastName}"`)

    // Parse the correct lastName from the full name
    let fixedLastName = person.lastName

    // First, let's parse from the full name (before any parenthetical content)
    const nameWithoutParenthetical = person.name.split('(')[0].trim()
    const nameParts = nameWithoutParenthetical.split(' ')

    // Get the last part of the name as lastName
    if (nameParts.length > 1) {
      fixedLastName = nameParts[nameParts.length - 1]
    } else {
      fixedLastName = nameParts[0] // Single name case
    }

    console.log(`  Fixed lastName: "${fixedLastName}"`)

    // Update in database
    await prisma.person.update({
      where: { id: person.id },
      data: { lastName: fixedLastName }
    })

    console.log('  ✅ Updated\n')
  }

  console.log('Done! Fixed all lastName issues.')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })