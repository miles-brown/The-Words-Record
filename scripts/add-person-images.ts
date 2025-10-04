#!/usr/bin/env tsx
/**
 * Add images to existing person profiles and create profiles for people without entries
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Mapping of image filenames to proper names
const imageToNameMap: { [key: string]: string } = {
  'alexandra-ocasio-cortez.png': 'Alexandria Ocasio-Cortez',
  'amy-schumer.png': 'Amy Schumer',
  'barack-obama.png': 'Barack Obama',
  'ben-shapiro.png': 'Ben Shapiro',
  'bernie-sanders.png': 'Bernie Sanders',
  'boris-johnson.png': 'Boris Johnson',
  'candace-owens.png': 'Candace Owens',
  'charlie-kirk.png': 'Charlie Kirk',
  'danny-danon.png': 'Danny Danon',
  'david-lammy.png': 'David Lammy',
  'emma-watson.png': 'Emma Watson',
  'gary-linekar.png': 'Gary Lineker',
  'george-galloway.png': 'George Galloway',
  'george-w-bush.png': 'George W. Bush',
  'gilad-erdan.png': 'Gilad Erdan',
  'jeffrey-epstein.png': 'Jeffrey Epstein',
  'jeremy-corbyn.png': 'Jeremy Corbyn',
  'ken-livingstone.png': 'Ken Livingstone',
  'kier-starmer.png': 'Keir Starmer',
  'lula-de-silva.png': 'Luiz Inácio Lula da Silva',
  'marjorie-taylor-green.png': 'Marjorie Taylor Greene',
  'michel-temer.png': 'Michel Temer',
  'peter-mandelson.png': 'Peter Mandelson'
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function main() {
  console.log('🖼️  Adding person images...\n')

  const imagesDir = path.join(process.cwd(), 'public', 'images', 'persons')
  const imageFiles = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'))

  let updatedCount = 0
  let needCreation: string[] = []

  for (const imageFile of imageFiles) {
    if (imageFile === 'README.md') continue

    const personName = imageToNameMap[imageFile]
    if (!personName) {
      console.log(`⚠️  No name mapping for ${imageFile}, skipping...`)
      continue
    }

    const slug = createSlug(personName)
    const imageUrl = `/images/persons/${imageFile}`

    console.log(`Processing: ${personName} (${slug})`)

    // Try to find person in database
    const person = await prisma.person.findUnique({
      where: { slug }
    })

    if (person) {
      // Update existing person with image
      await prisma.person.update({
        where: { slug },
        data: { imageUrl }
      })
      console.log(`  ✅ Updated image for ${personName}`)
      updatedCount++
    } else {
      // Person doesn't exist, needs to be created
      console.log(`  ❌ Person not found in database: ${personName}`)
      needCreation.push(personName)
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✅ Updated ${updatedCount} existing profiles with images`)

  if (needCreation.length > 0) {
    console.log(`\n📝 Need to create profiles for ${needCreation.length} people:`)
    needCreation.forEach(name => console.log(`   - ${name}`))
    console.log('\nThese profiles will be created using the AI generator...')
  }

  await prisma.$disconnect()

  // Return list of people who need creation
  return needCreation
}

main().then(async (needCreation) => {
  if (needCreation && needCreation.length > 0) {
    console.log('\n🤖 Creating missing person profiles...\n')

    const { execSync } = require('child_process')

    for (const personName of needCreation) {
      try {
        console.log(`\nCreating profile for: ${personName}`)
        console.log('─'.repeat(50))

        execSync(`npx tsx scripts/ai-incident-generator.ts "${personName}" --auto-import`, {
          stdio: 'inherit',
          cwd: process.cwd()
        })

        console.log(`✅ Successfully created profile for ${personName}\n`)

        // Wait 5 seconds between requests
        console.log('⏳ Waiting 5s before next request...\n')
        await new Promise(resolve => setTimeout(resolve, 5000))
      } catch (error) {
        console.error(`❌ Failed to create profile for ${personName}:`, error)
      }
    }

    console.log('\n✨ All done!')
  }
}).catch(console.error)
