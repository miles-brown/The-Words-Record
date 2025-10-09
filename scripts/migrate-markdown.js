const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createPersonIfNotExists(name) {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  
  let person = await prisma.person.findUnique({
    where: { slug }
  })

  if (!person) {
    console.log(`Creating person: ${name}`)
    person = await prisma.person.create({
      data: {
        name,
        slug,
        bio: `Profile for ${name} - information will be updated as more data becomes available.`
      }
    })
  }

  return person.id
}

async function createTagIfNotExists(tagName) {
  const slug = tagName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  
  let tag = await prisma.tag.findUnique({
    where: { slug }
  })

  if (!tag) {
    console.log(`Creating tag: ${tagName}`)
    tag = await prisma.tag.create({
      data: {
        name: tagName,
        slug,
        description: `Tag for ${tagName}`
      }
    })
  }

  return tag.id
}

async function migrateMarkdownCase(caseData) {
  try {
    console.log(`Migrating case: ${caseData.title}`)

    // Create or get person
    const personId = await createPersonIfNotExists(caseData.person)

    // Create or get tags
    const tagIds = await Promise.all(
      caseData.tags.map(tag => createTagIfNotExists(tag))
    )

    // Check if incident already exists
    const existingIncident = await prisma.incident.findUnique({
      where: { slug: caseData.slug }
    })

    if (existingIncident) {
      console.log(`Incident ${caseData.slug} already exists, skipping...`)
      return
    }

    // Create incident
    const incident = await prisma.incident.create({
      data: {
        title: caseData.title,
        slug: caseData.slug,
        summary: caseData.summary || caseData.excerpt,
        description: caseData.content,
        caseDate: new Date(caseData.incident_date),
        publicationDate: new Date(caseData.date),
        status: caseData.status || 'documented',
        persons: {
          connect: [{ id: personId }]
        },
        tags: {
          connect: tagIds.map(id => ({ id }))
        }
      }
    })

    // Create sources
    if (caseData.sources && caseData.sources.length > 0) {
      await Promise.all(
        caseData.sources.map(async (sourceTitle) => {
          return prisma.source.create({
            data: {
              title: sourceTitle,
              caseId: incident.id,
              credibility: 'verified'
            }
          })
        })
      )
    }

    console.log(`✅ Successfully migrated: ${caseData.title}`)

  } catch (error) {
    console.error(`❌ Error migrating ${caseData.title}:`, error)
  }
}

async function loadMarkdownCases() {
  const casesDirectory = path.join(process.cwd(), 'content/cases')
  
  if (!fs.existsSync(casesDirectory)) {
    console.log('No cases directory found, creating sample data...')
    return [{
      slug: 'sample-incident-2025',
      title: 'Sample Public Statement Analysis',
      person: 'John Sample',
      incident_date: '2025-01-15',
      date: '2025-01-20',
      tags: ['public statements', 'media coverage', 'analysis'],
      status: 'documented',
      excerpt: 'A comprehensive analysis of a public statement and subsequent responses from various stakeholders.',
      summary: 'This incident involves a public statement made in January 2025 and the various responses it generated from media outlets, advocacy groups, and other public figures.',
      sources: [
        'Major News Network - January 15, 2025',
        'Industry Publication - January 16, 2025',
        'Official Press Release - January 17, 2025'
      ],
      content: `# Sample Public Statement Analysis

## Background

This is a sample incident created to demonstrate the database migration system. In a real scenario, this would contain detailed analysis of actual public statements and responses.

## The Statement

On January 15, 2025, John Sample made a public statement during a televised interview that generated significant discussion across various platforms.

## Key Points

- The statement addressed industry practices
- It sparked debate among stakeholders
- Multiple organizations issued responses
- Media coverage was extensive

## Timeline

- **January 15**: Initial statement made
- **January 16**: First wave of responses
- **January 17**: Official organizational responses
- **January 18**: Follow-up clarifications

## Analysis

This incident demonstrates the complex dynamics of public discourse in the modern media landscape, where statements can rapidly generate multi-faceted responses from various stakeholders.

## Conclusion

The incident serves as a case study for understanding how public statements evolve into broader conversations involving multiple parties and perspectives.`
    }]
  }

  const fileNames = fs.readdirSync(casesDirectory)
    .filter(name => name.endsWith('.md'))

  const cases = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '')
    const fullPath = path.join(casesDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      slug,
      title: data.title || 'Untitled',
      person: data.person || 'Unknown',
      incident_date: data.incident_date || data.date || new Date().toISOString(),
      date: data.date || new Date().toISOString(),
      tags: data.tags || [],
      status: data.status || 'documented',
      excerpt: data.excerpt || content.slice(0, 150) + '...',
      summary: data.summary || data.excerpt || content.slice(0, 300) + '...',
      sources: data.sources || [],
      content
    }
  })

  return cases
}

async function main() {
  try {
    console.log('🚀 Starting markdown migration...')

    // Load existing markdown cases
    const cases = await loadMarkdownCases()
    console.log(`Found ${cases.length} cases to migrate`)

    // Migrate each case
    for (const caseData of cases) {
      await migrateMarkdownCase(caseData)
    }

    console.log('✅ Migration completed successfully!')

    // Display summary
    const summary = await prisma.$transaction([
      prisma.person.count(),
      prisma.incident.count(),
      prisma.tag.count(),
      prisma.source.count()
    ])

    console.log('\n📊 Database Summary:')
    console.log(`- Persons: ${summary[0]}`)
    console.log(`- Incidents: ${summary[1]}`)
    console.log(`- Tags: ${summary[2]}`)
    console.log(`- Sources: ${summary[3]}`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}