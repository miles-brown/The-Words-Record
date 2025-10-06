import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import { parse } from 'csv-parse/sync'

const prisma = new PrismaClient()

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function parseDate(dateStr: string): Date {
  const date = new Date(dateStr)
  if (!isNaN(date.getTime())) {
    return date
  }
  console.warn(`Could not parse date: ${dateStr}, using current date`)
  return new Date()
}

async function importFromCSV(filePath: string) {
  console.log(`Reading CSV file: ${filePath}`)

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  })

  console.log(`Found ${records.length} records to import\n`)

  for (const record of records) {
    try {
      const rec = record as any
      console.log(`\nImporting: ${rec.name || rec.title}`)

      // Check what type of record this is
      if (rec.name && rec.profession) {
        // This is a person record
        await importPerson(rec)
      } else if (rec.title && rec.summary) {
        // This is an incident record
        await importIncident(rec)
      } else {
        console.warn(`Unknown record type, skipping`)
      }
    } catch (error) {
      console.error(`Failed to import record:`, error)
    }
  }

  console.log(`\n✅ Import complete!`)
}

async function importPerson(record: any) {
  const slug = createSlug(record.name)

  const person = await prisma.person.upsert({
    where: { slug },
    update: {
      name: record.name,
      profession: record.profession,
      bio: record.bio || null,
      nationality: record.nationality || null,
      imageUrl: record.imageUrl || null,
    },
    create: {
      slug,
      name: record.name,
      profession: record.profession,
      bio: record.bio || null,
      nationality: record.nationality || null,
      imageUrl: record.imageUrl || null,
    },
  })

  console.log(`✅ Imported person: ${person.name}`)
}

async function importIncident(record: any) {
  const slug = createSlug(record.title)
  const incidentDate = record.date ? parseDate(record.date) : new Date()

  const incident = await prisma.incident.upsert({
    where: { slug },
    update: {
      title: record.title,
      summary: record.summary,
      description: record.description || record.summary,
      incidentDate: incidentDate,
      status: record.status || 'DOCUMENTED',
      locationDetail: record.location || null,
    },
    create: {
      slug,
      title: record.title,
      summary: record.summary,
      description: record.description || record.summary,
      incidentDate: incidentDate,
      status: record.status || 'DOCUMENTED',
      locationDetail: record.location || null,
    },
  })

  // Connect persons if provided (comma-separated slugs)
  if (record.persons) {
    const personSlugs = record.persons.split(',').map((s: string) => s.trim())
    for (const personSlug of personSlugs) {
      const person = await prisma.person.findUnique({ where: { slug: personSlug } })
      if (person) {
        await prisma.incident.update({
          where: { id: incident.id },
          data: {
            persons: {
              connect: { id: person.id }
            }
          }
        })
      }
    }
  }

  // Add tags if provided (comma-separated)
  if (record.tags) {
    const tagNames = record.tags.split(',').map((t: string) => t.trim())
    for (const tagName of tagNames) {
      const tagSlug = createSlug(tagName)
      const tag = await prisma.tag.upsert({
        where: { slug: tagSlug },
        update: {},
        create: {
          slug: tagSlug,
          name: tagName,
        },
      })

      await prisma.incident.update({
        where: { id: incident.id },
        data: {
          tags: {
            connect: { id: tag.id }
          }
        }
      })
    }
  }

  console.log(`✅ Imported incident: ${incident.title}`)
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Usage: npx tsx scripts/import-csv.ts <path-to-csv-file>')
    console.log('\n=== Person CSV Format ===')
    console.log('name,profession,bio,nationality,imageUrl')
    console.log('John Doe,Politician,Bio text here,American,https://...')
    console.log('\n=== Incident CSV Format ===')
    console.log('title,summary,description,date,status,location,persons,tags')
    console.log('Event Title,Summary text,Full description,2022-01-03,documented,London,person-slug,tag1,tag2')
    process.exit(0)
  }

  const filePath = args[0]

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`)
    process.exit(1)
  }

  await importFromCSV(filePath)
}

main()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
