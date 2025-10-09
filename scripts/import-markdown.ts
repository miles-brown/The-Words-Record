import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

// Load environment variables
config()

const prisma = new PrismaClient()

interface CaseData {
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

function parseMarkdownCases(markdown: string): CaseData[] {
  const incidents: CaseData[] = []

  // Split by ## to get individual incidents
  const sections = markdown.split(/^##\s+/m).filter(s => s.trim())

  for (const section of sections) {
    const lines = section.split('\n')
    const name = lines[0].trim()

    const caseData: Partial<CaseData> = { name }

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

      if (professionMatch) caseData.profession = professionMatch[1].trim()
      if (dateMatch) caseData.date = dateMatch[1].trim()
      if (wordingMatch) caseData.exactWording = wordingMatch[1].trim()
      if (contextMatch) caseData.context = contextMatch[1].trim()
      if (platformMatch) caseData.platform = platformMatch[1].trim()
      if (coverageMatch) caseData.mediaCoverage = coverageMatch[1].trim()
      if (categoriesMatch) caseData.categories = categoriesMatch[1].trim()
      if (responseMatch) caseData.response = responseMatch[1].trim()
      if (citationsMatch) caseData.citations = citationsMatch[1].trim()
    }

    if (caseData.name && caseData.date) {
      incidents.push(caseData as CaseData)
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

async function importCase(caseData: CaseData) {
  console.log(`\nImporting: ${caseData.name}`)

  // Create or get person
  const personSlug = createSlug(caseData.name)
  const person = await prisma.person.upsert({
    where: { slug: personSlug },
    update: {},
    create: {
      slug: personSlug,
      name: caseData.name,
      profession: 'OTHER' as const,
    },
  })

  // Parse the exact wording to get the statement and create incident title
  const statementMatch = caseData.exactWording.match(/\*"(.+?)"\*/)
  const statement = statementMatch ? statementMatch[1] : caseData.exactWording

  // Create incident title
  const caseDate = parseDate(caseData.date)
  const caseTitle = `${caseData.name} "${statement}" ${caseData.platform} Post`
  const caseSlug = createSlug(caseTitle)

  // Create summary from context and media coverage
  const summary = `${caseData.context} ${caseData.mediaCoverage}`.trim()

  // Create full description
  const description = `
${caseData.context}

Platform: ${caseData.platform}

Media Coverage:
${caseData.mediaCoverage}

Categories: ${caseData.categories}

Response/Outcome:
${caseData.response}
  `.trim()

  // Create or update incident
  const caseRecord = await prisma.case.upsert({
    where: { slug: caseSlug },
    update: {
      title: caseTitle,
      summary: summary,
      description: description,
    },
    create: {
      slug: caseSlug,
      title: caseTitle,
      summary: summary,
      description: description,
      caseDate: caseDate,
      status: 'DOCUMENTED',
      people: {
        connect: { id: person.id }
      }
    },
  })

  // Create statement
  await prisma.statement.upsert({
    where: {
      personId_caseId_content: {
        personId: person.id,
        caseId: caseRecord.id,
        content: statement
      }
    },
    update: {},
    create: {
      content: statement,
      context: caseData.context,
      statementDate: caseDate,
      medium: caseData.platform as any, // Platform string needs mapping to Medium enum
      isVerified: true,
      personId: person.id,
      caseId: caseRecord.id,
    },
  })

  // Parse and create tags from categories
  const categories = caseData.categories.split('/').map(c => c.trim())
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
    await prisma.case.update({
      where: { id: caseRecord.id },
      data: {
        tags: {
          connect: { id: tag.id }
        }
      }
    })
  }

  console.log(`✅ Successfully imported: ${caseData.name}`)
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

  const cases = parseMarkdownCases(markdown)
  console.log(`Found ${cases.length} cases to import\n`)

  for (const caseData of cases) {
    try {
      await importCase(caseData)
    } catch (error) {
      console.error(`Failed to import ${caseData.name}:`, error)
    }
  }

  console.log(`\n✅ Import complete! Imported ${cases.length} cases`)
}

main()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
