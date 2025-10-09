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

interface CaseData {
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

function parseMarkdownCases(markdown: string): CaseData[] {
  const cases: CaseData[] = []

  // Split by ## to get individual cases
  const sections = markdown.split(/^##\s+/m).filter(s => s.trim())

  for (const section of sections) {
    const lines = section.split('\n')
    const name = lines[0].trim()

    const person: PersonData = { name }
    const caseData: any = { person }

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

      if (dateMatch) caseData.date = dateMatch[1].trim()
      if (wordingMatch) caseData.exactWording = wordingMatch[1].trim()
      if (contextMatch) caseData.context = contextMatch[1].trim()
      if (platformMatch) caseData.platform = platformMatch[1].trim()
      if (coverageMatch) caseData.mediaCoverage = coverageMatch[1].trim()
      if (categoriesMatch) caseData.categories = categoriesMatch[1].trim()
      if (responseMatch) caseData.response = responseMatch[1].trim()

      // Parse repercussions
      if (lostEmployMatch || lostContractsMatch || paintedNegMatch || repercDetailsMatch) {
        if (!caseData.repercussions) {
          caseData.repercussions = {
            lostEmployment: false,
            lostContracts: false,
            paintedNegatively: false
          }
        }
        if (lostEmployMatch) caseData.repercussions.lostEmployment = lostEmployMatch[1].toUpperCase() === 'YES'
        if (lostContractsMatch) caseData.repercussions.lostContracts = lostContractsMatch[1].toUpperCase() === 'YES'
        if (paintedNegMatch) caseData.repercussions.paintedNegatively = paintedNegMatch[1].toUpperCase() === 'YES'
        if (repercDetailsMatch) caseData.repercussions.details = repercDetailsMatch[1].trim()
      }

      if (citationsMatch) caseData.citations = citationsMatch[1].trim()
    }

    // Parse responses section
    const responsesSection = section.match(/### RESPONSES TO THE STATEMENT[\s\S]*/)
    if (responsesSection) {
      const responseBlocks = responsesSection[0].match(/---RESPONSE---[\s\S]*?---END RESPONSE---/g)
      if (responseBlocks) {
        caseData.responses = []
        for (const block of responseBlocks) {
          const responderNameMatch = block.match(/\*\*Responder Name:\*\*\s*(.+)/)
          const responderTypeMatch = block.match(/\*\*Responder Type:\*\*\s*(Person|Organization)/)
          const responseDateMatch = block.match(/\*\*Response Date:\*\*\s*(.+)/)
          const responseContentMatch = block.match(/\*\*Response Content:\*\*\s*(.+)/)
          const responseTypeMatch = block.match(/\*\*Response Type:\*\*\s*(.+)/)
          const platformMatch = block.match(/\*\*Platform:\*\*\s*(.+)/)
          const impactMatch = block.match(/\*\*Impact:\*\*\s*(.+)/)

          if (responderNameMatch && responderTypeMatch && responseDateMatch && responseContentMatch) {
            caseData.responses.push({
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
    if (caseData.person.name && caseData.date) {
      cases.push(caseData as CaseData)
    }
  }

  return cases
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

async function importCase(caseData: CaseData) {
  console.log(`\nImporting: ${caseData.person.name}`)

  // Create or update person with all fields
  const personSlug = createSlug(caseData.person.name)

  const personData: any = {
    slug: personSlug,
    name: caseData.person.name,
  }

  // Add all optional person fields if they exist
  if (caseData.person.akaNames) personData.akaNames = caseData.person.akaNames
  if (caseData.person.profession) personData.profession = caseData.person.profession
  if (caseData.person.roleDescription) personData.roleDescription = caseData.person.roleDescription
  if (caseData.person.yearsActive) personData.yearsActive = caseData.person.yearsActive
  if (caseData.person.bestKnownFor) personData.bestKnownFor = caseData.person.bestKnownFor
  if (caseData.person.nationality) personData.nationality = caseData.person.nationality
  if (caseData.person.racialGroup) personData.racialGroup = caseData.person.racialGroup
  if (caseData.person.religion) personData.religion = caseData.person.religion
  if (caseData.person.birthPlace) personData.birthPlace = caseData.person.birthPlace
  if (caseData.person.residence) personData.residence = caseData.person.residence
  if (caseData.person.politicalParty) personData.politicalParty = caseData.person.politicalParty
  if (caseData.person.politicalBeliefs) personData.politicalBeliefs = caseData.person.politicalBeliefs
  if (caseData.person.bio) personData.bio = caseData.person.bio

  // Parse birth date if available
  if (caseData.person.birthDate) {
    const birthDate = parseDate(caseData.person.birthDate)
    if (birthDate) personData.birthDate = birthDate
  }

  // Parse death date if available
  if (caseData.person.deathDate) {
    const deathDate = parseDate(caseData.person.deathDate)
    if (deathDate) personData.deathDate = deathDate
  }

  // Add death place if available
  if (caseData.person.deathPlace) personData.deathPlace = caseData.person.deathPlace

  const person = await prisma.person.upsert({
    where: { slug: personSlug },
    update: personData,
    create: personData,
  })

  // Handle affiliated organizations via Affiliation model
  if (caseData.person.affiliatedOrgs) {
    const orgs = caseData.person.affiliatedOrgs.split(',').map(o => o.trim())
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
  const statementMatch = caseData.exactWording?.match(/\*"(.+?)"\*/)
  const statement = statementMatch ? statementMatch[1] : (caseData.exactWording || 'Statement content not available')

  // Create case title
  const caseDate = parseDate(caseData.date) || new Date()
  const caseTitle = `${caseData.person.name} - ${caseData.platform} Statement (${caseData.date})`
  const caseSlug = createSlug(caseTitle)

  // Create summary from context
  const summary = caseData.context?.substring(0, 500) || 'Statement details'

  // Create full description
  const description = `
${caseData.context || ''}

Platform: ${caseData.platform || 'Unknown'}

Media Coverage:
${caseData.mediaCoverage || 'No media coverage information available'}

Response/Outcome:
${caseData.response || 'No response information available'}
  `.trim()

  // Create or update case
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

  // Create statement with repercussions
  const statementData: any = {
    content: statement,
    context: caseData.context,
    statementDate: caseDate,
    medium: caseData.platform,
    isVerified: true,
    personId: person.id,
    caseId: caseRecord.id,
  }

  // Add repercussions if present
  if (caseData.repercussions) {
    statementData.lostEmployment = caseData.repercussions.lostEmployment
    statementData.lostContracts = caseData.repercussions.lostContracts
    statementData.paintedNegatively = caseData.repercussions.paintedNegatively
    if (caseData.repercussions.details) {
      statementData.repercussionDetails = caseData.repercussions.details
    }
  }

  await prisma.statement.upsert({
    where: {
      personId_caseId_content: {
        personId: person.id,
        caseId: caseRecord.id,
        content: statement
      }
    },
    update: statementData,
    create: statementData,
  })

  // Parse and create tags from categories
  if (caseData.categories) {
    const categories = caseData.categories.split('/').map(c => c.trim())
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

      // Connect tag to case
      await prisma.case.update({
        where: { id: caseRecord.id },
        data: {
          tags: {
            connect: { id: tag.id }
          }
        }
      })
    }
  }

  // Import responses if they exist
  if (caseData.responses && caseData.responses.length > 0) {
    console.log(`  📥 Importing ${caseData.responses.length} response(s)...`)

    for (const responseData of caseData.responses) {
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
            caseId: caseRecord.id,
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

  console.log(`✅ Successfully imported: ${caseData.person.name}`)
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

  const cases = parseMarkdownCases(markdown)
  console.log(`Found ${cases.length} cases to import\n`)

  for (const caseData of cases) {
    try {
      await importCase(caseData)
    } catch (error) {
      console.error(`Failed to import ${caseData.person.name}:`, error)
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
