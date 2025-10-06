import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Updating all person image URLs from /images/persons/ to /images/people/...\n')

  // Get all people with image URLs containing /images/persons/
  const peopleToUpdate = await prisma.person.findMany({
    where: {
      imageUrl: {
        contains: '/images/persons/'
      }
    }
  })

  console.log(`Found ${peopleToUpdate.length} people with old image paths to update.\n`)

  let updatedCount = 0
  for (const person of peopleToUpdate) {
    const newImageUrl = person.imageUrl?.replace('/images/persons/', '/images/people/')

    if (newImageUrl) {
      await prisma.person.update({
        where: { id: person.id },
        data: { imageUrl: newImageUrl }
      })
      console.log(`✅ Updated ${person.name}: ${person.imageUrl} → ${newImageUrl}`)
      updatedCount++
    }
  }

  console.log(`\n✨ Successfully updated ${updatedCount} image URLs`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })