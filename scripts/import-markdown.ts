import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

// Load environment variables
config()

const prisma = new PrismaClient()

interface IncidentData {
  name: string
  profession: string
  date: string
  exactWording: string
  context: string
  platform: string
  mediaCoverage: string
  categories: string
  response: string
  citations: string
}

function parseMarkdownIncidents(markdown: string): IncidentData[] {
  const incidents: IncidentData[] = []

  // Split by ## to get individual incidents
  const sections = markdown.split(/^##\s+/m).filter(s => s.trim())

  for (const section of sections) {
    const lines = section.split('\n')
    const name = lines[0].trim()

    const incident: Partial<IncidentData> = { name }

    for (const line of lines) {
      const professionMatch = line.match(/\*\*Profession:\*\*\s*(.+)/)
      const dateMatch = line.match(/\*\*Date:\*\*\s*(.+)/)
      const wordingMatch = line.match(/\*\*Exact Wording:\*\*\s*(.+)/)
      const contextMatch = line.match(/\*\*Context:\*\*\s*(.+)/)
      const platformMatch = line.match(/\*\*Platform:\*\*\s*(.+)/)
      const coverageMatch = line.match(/\*\*Media Coverage.*:\*\*\s*(.+)/)
      const categoriesMatch = line.match(/\*\*Categories:\*\*\s*(.+)/)
      const responseMatch = line.match(/\*\*Response.*:\*\*\s*(.+)/)
      const citationsMatch = line.match(/\*\*Citations:\*\*\s*(.+)/)

      if (professionMatch) incident.profession = professionMatch[1].trim()
      if (dateMatch) incident.date = dateMatch[1].trim()
      if (wordingMatch) incident.exactWording = wordingMatch[1].trim()
      if (contextMatch) incident.context = contextMatch[1].trim()
      if (platformMatch) incident.platform = platformMatch[1].trim()
      if (coverageMatch) incident.mediaCoverage = coverageMatch[1].trim()
      if (categoriesMatch) incident.categories = categoriesMatch[1].trim()
      if (responseMatch) incident.response = responseMatch[1].trim()
      if (citationsMatch) incident.citations = citationsMatch[1].trim()
    }

    if (incident.name && incident.date) {
      incidents.push(incident as IncidentData)
    }
  }

  return incidents
}

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function parseDate(dateStr: string): Date {
  // Try to parse dates like "3 January 2022"
  const date = new Date(dateStr)
  if (!isNaN(date.getTime())) {
    return date
  }

  // Fallback to current date if parsing fails
  console.warn(`Could not parse date: ${dateStr}, using current date`)
  return new Date()
}

async function importIncident(incident: IncidentData) {
  console.log(`\nImporting: ${incident.name}`)

  // Create or get person
  const personSlug = createSlug(incident.name)
  const person = await prisma.person.upsert({
    where: { slug: personSlug },
    update: {},
    create: {
      slug: personSlug,
      name: incident.name,
      profession: incident.profession,
    },
  })

  // Parse the exact wording to get the statement and create incident title
  const statementMatch = incident.exactWording.match(/\*"(.+?)"\*/)
  const statement = statementMatch ? statementMatch[1] : incident.exactWording

  // Create incident title
  const incidentDate = parseDate(incident.date)
  const incidentTitle = `${incident.name} "${statement}" ${incident.platform} Post`
  const incidentSlug = createSlug(incidentTitle)

  // Create summary from context and media coverage
  const summary = `${incident.context} ${incident.mediaCoverage}`.trim()

  // Create full description
  const description = `
${incident.context}

Platform: ${incident.platform}

Media Coverage:
${incident.mediaCoverage}

Categories: ${incident.categories}

Response/Outcome:
${incident.response}
  `.trim()

  // Create or update incident
  const incidentRecord = await prisma.incident.upsert({
    where: { slug: incidentSlug },
    update: {
      title: incidentTitle,
      summary: summary,
      description: description,
    },
    create: {
      slug: incidentSlug,
      title: incidentTitle,
      summary: summary,
      description: description,
      incidentDate: incidentDate,
      status: 'documented',
      persons: {
        connect: { id: person.id }
      }
    },
  })

  // Create statement
  await prisma.statement.upsert({
    where: {
      personId_incidentId_content: {
        personId: person.id,
        incidentId: incidentRecord.id,
        content: statement
      }
    },
    update: {},
    create: {
      content: statement,
      context: incident.context,
      statementDate: incidentDate,
      medium: incident.platform,
      isVerified: true,
      personId: person.id,
      incidentId: incidentRecord.id,
    },
  })

  // Parse and create tags from categories
  const categories = incident.categories.split('/').map(c => c.trim())
  for (const category of categories) {
    const tagSlug = createSlug(category)
    const tag = await prisma.tag.upsert({
      where: { slug: tagSlug },
      update: {},
      create: {
        slug: tagSlug,
        name: category,
      },
    })

    // Connect tag to incident
    await prisma.incident.update({
      where: { id: incidentRecord.id },
      data: {
        tags: {
          connect: { id: tag.id }
        }
      }
    })
  }

  console.log(`✅ Successfully imported: ${incident.name}`)
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Usage: npx tsx scripts/import-markdown.ts <path-to-markdown-file>')
    console.log('\nExample markdown format:')
    console.log('## Emma Watson')
    console.log('- **Profession:** Actor')
    console.log('- **Date:** 3 January 2022')
    console.log('- **Exact Wording:** *"Solidarity is a verb"*')
    console.log('- **Context:** Shared post from Bad Activist Collective')
    console.log('- **Platform:** Instagram')
    console.log('- **Media Coverage / Framing:** The Guardian headline: "Emma Watson pro-Palestinian post sparks antisemitism row."')
    console.log('- **Categories:** Solidarity reframed as antisemitism')
    console.log('- **Response / Outcome:** No apology or retraction')
    console.log('- **Citations:** [URLs]')
    process.exit(0)
  }

  const filePath = args[0]

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`)
    process.exit(1)
  }

  console.log(`Reading markdown file: ${filePath}`)
  const markdown = fs.readFileSync(filePath, 'utf-8')

  const incidents = parseMarkdownIncidents(markdown)
  console.log(`Found ${incidents.length} incidents to import\n`)

  for (const incident of incidents) {
    try {
      await importIncident(incident)
    } catch (error) {
      console.error(`Failed to import ${incident.name}:`, error)
    }
  }

  console.log(`\n✅ Import complete! Imported ${incidents.length} incidents`)
}

main()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
