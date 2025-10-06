import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Count records
    const [personCount, orgCount, incidentCount] = await Promise.all([
      prisma.person.count(),
      prisma.organization.count(),
      prisma.incident.count()
    ])

    console.log('Database Status:')
    console.log(`- Persons: ${personCount}`)
    console.log(`- Organizations: ${orgCount}`)
    console.log(`- Incidents: ${incidentCount}`)

    // Get sample organization
    if (orgCount > 0) {
      const org = await prisma.organization.findFirst()
      console.log('\nSample Organization:')
      console.log(JSON.stringify(org, null, 2))
    }

    // Get sample person
    if (personCount > 0) {
      const person = await prisma.person.findFirst()
      console.log('\nSample Person:')
      console.log(JSON.stringify(person, null, 2))
    }
  } catch (error) {
    console.error('Database check failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()