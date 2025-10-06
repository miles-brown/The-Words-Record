import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking name field population in database...\n')

  // Get sample of people with their name fields
  const people = await prisma.person.findMany({
    select: {
      id: true,
      name: true,
      firstName: true,
      middleName: true,
      lastName: true,
      namePrefix: true,
      nameSuffix: true
    },
    take: 10
  })

  console.log('Sample of 10 people:\n')
  people.forEach(person => {
    console.log(`Name: "${person.name}"`)
    console.log(`  firstName: ${person.firstName || 'NULL'}`)
    console.log(`  middleName: ${person.middleName || 'NULL'}`)
    console.log(`  lastName: ${person.lastName || 'NULL'}`)
    console.log(`  prefix: ${person.namePrefix || 'NULL'}`)
    console.log(`  suffix: ${person.nameSuffix || 'NULL'}`)
    console.log('---')
  })

  // Count how many have lastName populated
  const totalCount = await prisma.person.count()
  const withLastName = await prisma.person.count({
    where: { lastName: { not: null } }
  })
  const withFirstName = await prisma.person.count({
    where: { firstName: { not: null } }
  })

  console.log('\nDatabase Statistics:')
  console.log(`Total people: ${totalCount}`)
  console.log(`With firstName populated: ${withFirstName} (${Math.round(withFirstName/totalCount * 100)}%)`)
  console.log(`With lastName populated: ${withLastName} (${Math.round(withLastName/totalCount * 100)}%)`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })