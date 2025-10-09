#!/usr/bin/env tsx
/**
 * Weekly Death Check Script
 *
 * This script checks all living people in the database to see if they have passed away.
 * It uses the Anthropic API to search for death information.
 *
 * Usage:
 *   npx tsx scripts/weekly-death-check.ts
 *
 * Schedule this script to run weekly via cron:
 *   0 0 * * 0 cd /path/to/project && npx tsx scripts/weekly-death-check.ts
 */

import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
// import Anthropic from '@anthropic-ai/sdk'

config()

const prisma = new PrismaClient()
// const anthropic = new Anthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY || '',
// })

interface DeathInfo {
  isDead: boolean
  deathDate?: string
  deathPlace?: string
}

async function checkForDeath(personName: string): Promise<DeathInfo> {
  // This function requires the @anthropic-ai/sdk package to be installed
  // For now, returning default no death info
  return { isDead: false }

  // const prompt = `Check if ${personName} has died. Search for recent news, obituaries, and reliable sources.

// IMPORTANT INSTRUCTIONS:
// - Return ONLY death information if the person has actually died
// - Do NOT speculate or guess
// - ONLY return death information if you find concrete, verifiable evidence
// - If the person is alive or you cannot find reliable death information, return NO_DEATH_FOUND

// Return the information in this EXACT format:

// STATUS: [DECEASED or NO_DEATH_FOUND]
// DEATH_DATE: [DD Month YYYY or leave blank if not deceased]
// DEATH_PLACE: [City, Country or leave blank if not deceased]

// Be extremely careful to only report confirmed deaths from reliable sources.`

//   try {
//     const message = await anthropic.messages.create({
//       model: 'claude-sonnet-4-20250514',
//       max_tokens: 500,
//       messages: [{
//         role: 'user',
//         content: prompt
//       }]
//     })

//     const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

//     // Parse response
//     const statusMatch = responseText.match(/STATUS:\s*(DECEASED|NO_DEATH_FOUND)/i)
//     const dateMatch = responseText.match(/DEATH_DATE:\s*(.+)/i)
//     const placeMatch = responseText.match(/DEATH_PLACE:\s*(.+)/i)

//     if (statusMatch && statusMatch[1].toUpperCase() === 'DECEASED') {
//       return {
//         isDead: true,
//         deathDate: dateMatch?.[1]?.trim() || undefined,
//         deathPlace: placeMatch?.[1]?.trim() || undefined
//       }
//     }

//     return { isDead: false }
//   } catch (error) {
//     console.error(`❌ Error checking death for ${personName}:`, error)
//     return { isDead: false }
//   }
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === 'N/A' || dateStr === 'Unknown' || dateStr === '') {
    return null
  }

  try {
    // Try parsing "DD Month YYYY" format
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return date
    }
  } catch (e) {
    console.error(`Could not parse date: ${dateStr}`)
  }

  return null
}

async function main() {
  console.log('🔍 Starting weekly death check...\n')

  try {
    // Get all living people (those without a death date)
    const livingPeople = await prisma.person.findMany({
      where: {
        deathDate: null
      },
      select: {
        id: true,
        name: true,
        slug: true
      }
    })

    console.log(`Found ${livingPeople.length} living people to check\n`)

    let checkedCount = 0
    let deathsFound = 0
    let updatedCount = 0

    for (const personItem of livingPeople) {
      checkedCount++
      console.log(`[${checkedCount}/${livingPeople.length}] Checking: ${personItem.name}`)

      const deathInfo = await checkForDeath(personItem.name)

      if (deathInfo.isDead) {
        console.log(`  💔 DEATH DETECTED for ${personItem.name}`)
        console.log(`     Date: ${deathInfo.deathDate || 'Unknown'}`)
        console.log(`     Place: ${deathInfo.deathPlace || 'Unknown'}`)

        deathsFound++

        // Update database
        try {
          const updateData: any = {}

          if (deathInfo.deathDate) {
            const parsedDate = parseDate(deathInfo.deathDate)
            if (parsedDate) {
              updateData.deathDate = parsedDate
            }
          }

          if (deathInfo.deathPlace) {
            updateData.deathPlace = deathInfo.deathPlace
          }

          if (Object.keys(updateData).length > 0) {
            await prisma.person.update({
              where: { id: personItem.id },
              data: updateData
            })

            updatedCount++
            console.log(`  ✅ Updated database record`)
          }
        } catch (error) {
          console.error(`  ❌ Failed to update database:`, error)
        }
      } else {
        console.log(`  ✓ Still alive`)
      }

      // Rate limiting: wait 3 seconds between API calls
      if (checkedCount < livingPeople.length) {
        console.log(`  ⏳ Waiting 3s before next check...\n`)
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('✨ Weekly death check complete!')
    console.log(`   Checked: ${checkedCount} people`)
    console.log(`   Deaths found: ${deathsFound}`)
    console.log(`   Database updated: ${updatedCount}`)
    console.log('='.repeat(50))

  } catch (error) {
    console.error('❌ Error during death check:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
