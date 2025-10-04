import prisma from '../lib/prisma'
import fs from 'fs'
import path from 'path'

// Map of image filenames to person names
const imageNameMappings: { [key: string]: string } = {
  'baba-wawa': 'Barbara Walters',
  'jon-oliver': 'John Oliver',
  'joy-behar': 'Joy Behar',
  'ken-livingstone': 'Ken Livingstone',
  'kier-starmer': 'Keir Starmer',
  'lula-de-silva': 'Luiz Inácio Lula da Silva',
  'marco-rubio': 'Marco Rubio',
  'marjorie-taylor-green': 'Marjorie Taylor Greene',
  'mehdi-hasan': 'Mehdi Hasan',
  'michel-temer': 'Michel Temer',
  'nigel-farage': 'Nigel Farage',
  'norman-finklestein': 'Norman Finkelstein',
  'peter-mandelson': 'Peter Mandelson',
  'piers-morgan': 'Piers Morgan',
  'russel-brand': 'Russell Brand',
  'stephen-colbert': 'Stephen Colbert',
  'theresa-may': 'Theresa May',
  'trevor-noah': 'Trevor Noah',
  'tucker-carlson': 'Tucker Carlson',
  'whoopi-goldberg': 'Whoopi Goldberg',
  'yasser-arafat': 'Yasser Arafat',
}

async function syncPersonImages() {
  console.log('🖼️  Starting image sync...\n')

  const imagesDir = path.join(process.cwd(), 'public/images/persons')
  const imageFiles = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'))

  console.log(`📁 Found ${imageFiles.length} images in directory\n`)

  let updated = 0
  let notFound = 0
  const missingPersons: string[] = []

  for (const imageFile of imageFiles) {
    const fileName = imageFile.replace(/\.(png|jpg|jpeg)$/, '')
    const personName = imageNameMappings[fileName]

    if (!personName) {
      // Try to find by slug match
      const slug = fileName
      const person = await prisma.person.findUnique({
        where: { slug }
      })

      if (person) {
        if (!person.imageUrl || person.imageUrl !== `/images/persons/${imageFile}`) {
          await prisma.person.update({
            where: { id: person.id },
            data: { imageUrl: `/images/persons/${imageFile}` }
          })
          console.log(`  ✅ ${person.name}: Added image (slug match)`)
          updated++
        }
      } else {
        notFound++
        // Skip very common image names that are likely mistakes
        if (!['placeholder', 'default', 'avatar'].includes(fileName)) {
          console.log(`  ⚠️  No mapping found for: ${imageFile}`)
        }
      }
      continue
    }

    // Try to find person by name
    const person = await prisma.person.findFirst({
      where: {
        name: {
          equals: personName
        }
      }
    })

    if (person) {
      if (!person.imageUrl || person.imageUrl !== `/images/persons/${imageFile}`) {
        await prisma.person.update({
          where: { id: person.id },
          data: { imageUrl: `/images/persons/${imageFile}` }
        })
        console.log(`  ✅ ${personName}: Image updated`)
        updated++
      } else {
        console.log(`  ℹ️  ${personName}: Image already set`)
      }
    } else {
      notFound++
      missingPersons.push(personName)
      console.log(`  ❌ ${personName}: Person not found in database`)
    }
  }

  console.log('\n📊 Summary:')
  console.log(`   Images updated: ${updated}`)
  console.log(`   Images not matched: ${notFound}`)

  if (missingPersons.length > 0) {
    console.log('\n👤 Missing persons (need to be created):')
    missingPersons.forEach(name => console.log(`   - ${name}`))
  }
}

syncPersonImages()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
