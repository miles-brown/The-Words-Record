import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

// Load environment variables
config()

const prisma = new PrismaClient()

interface PersonData {
  name: string
  akaNames?: string
  profession?: string
  roleDescription?: string
  yearsActive?: string
  bestKnownFor?: string
  nationality?: string
  racialGroup?: string
  religion?: string
  birthDate?: string
  birthPlace?: string
  deathDate?: string
  deathPlace?: string
  residence?: string
  politicalParty?: string
  politicalBeliefs?: string
  bio?: string
  affiliatedOrgs?: string
}

interface RepercussionsData {
  lostEmployment: boolean
  lostContracts: boolean
  paintedNegatively: boolean
  details?: string
}

interface ResponseData {
  responderName: string
  responderType: 'Person' | 'Organization'
  responseDate: string
  responseContent: string
  responseType: string
  platform: string
  impact?: string
}

interface IncidentData {
  person: PersonData
  date: string
  exactWording: string
  context: string
  platform: string
  mediaCoverage: string
  categories: string
  response: string
  repercussions?: RepercussionsData
  responses?: ResponseData[]
  citations: string
}

function parseMarkdownIncidents(markdown: string): IncidentData[] {
  const incidents: IncidentData[] = []

  // Split by ## to get individual incidents
  const sections = markdown.split(/^##\s+/m).filter(s => s.trim())

  for (const section of sections) {
    const lines = section.split('\n')
    const name = lines[0].trim()

    const person: PersonData = { name }
    const incident: any = { person }

    // Track if we're in PERSON INFORMATION or STATEMENT/INCIDENT INFORMATION section
    let inPersonSection = false
    let inStatementSection = false

    for (const line of lines) {
      // Section markers
      if (line.includes('### PERSON INFORMATION')) {
        inPersonSection = true
        inStatementSection = false
        continue
      }
      if (line.includes('### STATEMENT/INCIDENT INFORMATION')) {
        inPersonSection = false
        inStatementSection = true
        continue
      }

      // Person Information Fields
      if (inPersonSection || !inStatementSection) {
        const akaMatch = line.match(/\*\*AKA Names:\*\*\s*(.+)/)
        const professionMatch = line.match(/\*\*Profession:\*\*\s*(.+)/)
        const roleDescMatch = line.match(/\*\*Role Description:\*\*\s*(.+)/)
        const yearsActiveMatch = line.match(/\*\*Years Active:\*\*\s*(.+)/)
        const bestKnownMatch = line.match(/\*\*Best Known For:\*\*\s*(.+)/)
        const nationalityMatch = line.match(/\*\*Nationality:\*\*\s*(.+)/)
        const racialMatch = line.match(/\*\*Racial\/Ethnic Group:\*\*\s*(.+)/)
        const religionMatch = line.match(/\*\*Religion:\*\*\s*(.+)/)
        const birthDateMatch = line.match(/\*\*Birth Date:\*\*\s*(.+)/)
        const birthPlaceMatch = line.match(/\*\*Birth Place:\*\*\s*(.+)/)
        const deathDateMatch = line.match(/\*\*Death Date:\*\*\s*(.+)/)
        const deathPlaceMatch = line.match(/\*\*Death Place:\*\*\s*(.+)/)
        const residenceMatch = line.match(/\*\*Residence:\*\*\s*(.+)/)
        const partyMatch = line.match(/\*\*Political Party:\*\*\s*(.+)/)
        const beliefsMatch = line.match(/\*\*Political Beliefs:\*\*\s*(.+)/)
        const bioMatch = line.match(/\*\*Biography:\*\*\s*(.+)/)
        const affilMatch = line.match(/\*\*Affiliated Organizations:\*\*\s*(.+)/)

        if (akaMatch) person.akaNames = akaMatch[1].trim()
        if (professionMatch) person.profession = professionMatch[1].trim()
        if (roleDescMatch) person.roleDescription = roleDescMatch[1].trim()
        if (yearsActiveMatch) person.yearsActive = yearsActiveMatch[1].trim()
        if (bestKnownMatch) person.bestKnownFor = bestKnownMatch[1].trim()
        if (nationalityMatch) person.nationality = nationalityMatch[1].trim()
        if (racialMatch) person.racialGroup = racialMatch[1].trim()
        if (religionMatch) person.religion = religionMatch[1].trim()
        if (birthDateMatch) person.birthDate = birthDateMatch[1].trim()
        if (birthPlaceMatch) person.birthPlace = birthPlaceMatch[1].trim()
        if (deathDateMatch) person.deathDate = deathDateMatch[1].trim()
        if (deathPlaceMatch) person.deathPlace = deathPlaceMatch[1].trim()
        if (residenceMatch) person.residence = residenceMatch[1].trim()
        if (partyMatch) person.politicalParty = partyMatch[1].trim()
        if (beliefsMatch) person.politicalBeliefs = beliefsMatch[1].trim()
        if (bioMatch) person.bio = bioMatch[1].trim()
        if (affilMatch) person.affiliatedOrgs = affilMatch[1].trim()
      }

      // Statement/Incident Information Fields
      const dateMatch = line.match(/\*\*Date:\*\*\s*(.+)/)
      const wordingMatch = line.match(/\*\*Exact Wording:\*\*\s*(.+)/)
      const contextMatch = line.match(/\*\*Context:\*\*\s*(.+)/)
      const platformMatch = line.match(/\*\*Platform:\*\*\s*(.+)/)
      const coverageMatch = line.match(/\*\*Media Coverage.*:\*\*\s*(.+)/)
      const categoriesMatch = line.match(/\*\*Categories:\*\*\s*(.+)/)
      const responseMatch = line.match(/\*\*Response.*:\*\*\s*(.+)/)

      // Repercussions parsing
      const lostEmployMatch = line.match(/Lost Employment:\s*(YES|NO)/i)
      const lostContractsMatch = line.match(/Lost Contracts:\s*(YES|NO)/i)
      const paintedNegMatch = line.match(/Painted Negatively:\s*(YES|NO)/i)
      const repercDetailsMatch = line.match(/Details:\s*(.+)/)

      const citationsMatch = line.match(/\*\*Citations:\*\*\s*(.+)/)

      if (dateMatch) incident.date = dateMatch[1].trim()
      if (wordingMatch) incident.exactWording = wordingMatch[1].trim()
      if (contextMatch) incident.context = contextMatch[1].trim()
      if (platformMatch) incident.platform = platformMatch[1].trim()
      if (coverageMatch) incident.mediaCoverage = coverageMatch[1].trim()
      if (categoriesMatch) incident.categories = categoriesMatch[1].trim()
      if (responseMatch) incident.response = responseMatch[1].trim()

      // Parse repercussions
      if (lostEmployMatch || lostContractsMatch || paintedNegMatch || repercDetailsMatch) {
        if (!incident.repercussions) {
          incident.repercussions = {
            lostEmployment: false,
            lostContracts: false,
            paintedNegatively: false
          }
        }
        if (lostEmployMatch) incident.repercussions.lostEmployment = lostEmployMatch[1].toUpperCase() === 'YES'
        if (lostContractsMatch) incident.repercussions.lostContracts = lostContractsMatch[1].toUpperCase() === 'YES'
        if (paintedNegMatch) incident.repercussions.paintedNegatively = paintedNegMatch[1].toUpperCase() === 'YES'
        if (repercDetailsMatch) incident.repercussions.details = repercDetailsMatch[1].trim()
      }

      if (citationsMatch) incident.citations = citationsMatch[1].trim()
    }

    // Parse responses section
    const responsesSection = section.match(/### RESPONSES TO THE STATEMENT[\s\S]*/)
    if (responsesSection) {
      const responseBlocks = responsesSection[0].match(/---RESPONSE---[\s\S]*?---END RESPONSE---/g)
      if (responseBlocks) {
        incident.responses = []
        for (const block of responseBlocks) {
          const responderNameMatch = block.match(/\*\*Responder Name:\*\*\s*(.+)/)
          const responderTypeMatch = block.match(/\*\*Responder Type:\*\*\s*(Person|Organization)/)
          const responseDateMatch = block.match(/\*\*Response Date:\*\*\s*(.+)/)
          const responseContentMatch = block.match(/\*\*Response Content:\*\*\s*(.+)/)
          const responseTypeMatch = block.match(/\*\*Response Type:\*\*\s*(.+)/)
          const platformMatch = block.match(/\*\*Platform:\*\*\s*(.+)/)
          const impactMatch = block.match(/\*\*Impact:\*\*\s*(.+)/)

          if (responderNameMatch && responderTypeMatch && responseDateMatch && responseContentMatch) {
            incident.responses.push({
              responderName: responderNameMatch[1].trim(),
              responderType: responderTypeMatch[1].trim() as 'Person' | 'Organization',
              responseDate: responseDateMatch[1].trim(),
              responseContent: responseContentMatch[1].trim(),
              responseType: responseTypeMatch ? responseTypeMatch[1].trim() : 'OTHER',
              platform: platformMatch ? platformMatch[1].trim() : 'Unknown',
              impact: impactMatch ? impactMatch[1].trim() : undefined
            })
          }
        }
      }
    }

    // Only add if we have minimum required fields
    if (incident.person.name && incident.date) {
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

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === 'N/A' || dateStr === 'Unknown') {
    return null
  }

  // Try to parse dates like "3 January 2022" or "January 3, 2022"
  const date = new Date(dateStr)
  if (!isNaN(date.getTime())) {
    return date
  }

  console.warn(`Could not parse date: ${dateStr}`)
  return null
}

async function importIncident(incident: IncidentData) {
  console.log(`\nImporting: ${incident.person.name}`)

  // Create or update person with all fields
  const personSlug = createSlug(incident.person.name)

  const personData: any = {
    slug: personSlug,
    name: incident.person.name,
  }

  // Add all optional person fields if they exist
  if (incident.person.akaNames) personData.akaNames = incident.person.akaNames
  if (incident.person.profession) personData.profession = incident.person.profession
  if (incident.person.roleDescription) personData.roleDescription = incident.person.roleDescription
  if (incident.person.yearsActive) personData.yearsActive = incident.person.yearsActive
  if (incident.person.bestKnownFor) personData.bestKnownFor = incident.person.bestKnownFor
  if (incident.person.nationality) personData.nationality = incident.person.nationality
  if (incident.person.racialGroup) personData.racialGroup = incident.person.racialGroup
  if (incident.person.religion) personData.religion = incident.person.religion
  if (incident.person.birthPlace) personData.birthPlace = incident.person.birthPlace
  if (incident.person.residence) personData.residence = incident.person.residence
  if (incident.person.politicalParty) personData.politicalParty = incident.person.politicalParty
  if (incident.person.politicalBeliefs) personData.politicalBeliefs = incident.person.politicalBeliefs
  if (incident.person.bio) personData.bio = incident.person.bio

  // Parse birth date if available
  if (incident.person.birthDate) {
    const birthDate = parseDate(incident.person.birthDate)
    if (birthDate) personData.birthDate = birthDate
  }

  // Parse death date if available
  if (incident.person.deathDate) {
    const deathDate = parseDate(incident.person.deathDate)
    if (deathDate) personData.deathDate = deathDate
  }

  // Add death place if available
  if (incident.person.deathPlace) personData.deathPlace = incident.person.deathPlace

  const person = await prisma.person.upsert({
    where: { slug: personSlug },
    update: personData,
    create: personData,
  })

  // Handle affiliated organizations via Affiliation model
  if (incident.person.affiliatedOrgs) {
    const orgs = incident.person.affiliatedOrgs.split(',').map(o => o.trim())
    for (const orgEntry of orgs) {
      if (!orgEntry || orgEntry === 'N/A' || orgEntry === 'None') continue

      // Parse "Organization Name (Role)" format
      let orgName = orgEntry
      let role = 'Member'  // Default role

      const roleMatch = orgEntry.match(/^(.+?)\s*\((.+?)\)$/)
      if (roleMatch) {
        orgName = roleMatch[1].trim()
        role = roleMatch[2].trim()
      }

      const orgSlug = createSlug(orgName)

      // Create or get organization
      const org = await prisma.organization.upsert({
        where: { slug: orgSlug },
        update: {},
        create: {
          slug: orgSlug,
          name: orgName,
          type: 'OTHER',  // Default type
        },
      })

      // Create affiliation if it doesn't exist
      try {
        await prisma.affiliation.create({
          data: {
            personId: person.id,
            organizationId: org.id,
            role: role,
            isActive: true,
          },
        })
      } catch (e) {
        // Affiliation may already exist, ignore duplicate errors
      }
    }
  }

  // Parse the exact wording to get the statement
  const statementMatch = incident.exactWording?.match(/\*"(.+?)"\*/)
  const statement = statementMatch ? statementMatch[1] : (incident.exactWording || 'Statement content not available')

  // Create incident title
  const incidentDate = parseDate(incident.date) || new Date()
  const incidentTitle = `${incident.person.name} - ${incident.platform} Statement (${incident.date})`
  const incidentSlug = createSlug(incidentTitle)

  // Create summary from context
  const summary = incident.context?.substring(0, 500) || 'Statement details'

  // Create full description
  const description = `
${incident.context || ''}

Platform: ${incident.platform || 'Unknown'}

Media Coverage:
${incident.mediaCoverage || 'No media coverage information available'}

Response/Outcome:
${incident.response || 'No response information available'}
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
      status: 'DOCUMENTED',
      persons: {
        connect: { id: person.id }
      }
    },
  })

  // Create statement with repercussions
  const statementData: any = {
    content: statement,
    context: incident.context,
    statementDate: incidentDate,
    medium: incident.platform,
    isVerified: true,
    personId: person.id,
    incidentId: incidentRecord.id,
  }

  // Add repercussions if present
  if (incident.repercussions) {
    statementData.lostEmployment = incident.repercussions.lostEmployment
    statementData.lostContracts = incident.repercussions.lostContracts
    statementData.paintedNegatively = incident.repercussions.paintedNegatively
    if (incident.repercussions.details) {
      statementData.repercussionDetails = incident.repercussions.details
    }
  }

  await prisma.statement.upsert({
    where: {
      personId_incidentId_content: {
        personId: person.id,
        incidentId: incidentRecord.id,
        content: statement
      }
    },
    update: statementData,
    create: statementData,
  })

  // Parse and create tags from categories
  if (incident.categories) {
    const categories = incident.categories.split('/').map(c => c.trim())
    for (const category of categories) {
      if (!category) continue

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
  }

  // Import responses if they exist
  if (incident.responses && incident.responses.length > 0) {
    console.log(`  📥 Importing ${incident.responses.length} response(s)...`)

    for (const responseData of incident.responses) {
      // Create or get responder (person or organization)
      let responderId: string | null = null
      let responderOrgId: string | null = null

      if (responseData.responderType === 'Person') {
        const responderSlug = createSlug(responseData.responderName)
        const responder = await prisma.person.upsert({
          where: { slug: responderSlug },
          update: {},
          create: {
            slug: responderSlug,
            name: responseData.responderName,
          },
        })
        responderId = responder.id
      } else {
        const responderSlug = createSlug(responseData.responderName)
        const responder = await prisma.organization.upsert({
          where: { slug: responderSlug },
          update: {},
          create: {
            slug: responderSlug,
            name: responseData.responderName,
            type: 'OTHER',
          },
        })
        responderOrgId = responder.id
      }

      // Parse response date
      const responseDate = parseDate(responseData.responseDate) || new Date()

      // Create response (as a Statement with RESPONSE type)
      try {
        await prisma.statement.create({
          data: {
            content: responseData.responseContent,
            context: responseData.impact,
            statementDate: responseDate,
            statementType: 'RESPONSE',
            responseType: (responseData.responseType?.toUpperCase() || 'CRITICISM') as any,
            incidentId: incidentRecord.id,
            personId: responderId,
            organizationId: responderOrgId,
          },
        })
        console.log(`    ✓ Response from ${responseData.responderName}`)
      } catch (e) {
        console.log(`    ⚠ Could not import response from ${responseData.responderName}:`, (e as any).message)
      }
    }
  }

  console.log(`✅ Successfully imported: ${incident.person.name}`)
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Usage: npx tsx scripts/import-markdown-enhanced.ts <path-to-markdown-file>')
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
      console.error(`Failed to import ${incident.person.name}:`, error)
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
