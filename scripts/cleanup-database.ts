import { prisma } from '../lib/prisma'

// Nationality mappings to standardize
const nationalityMappings: { [key: string]: string } = {
  // United States variations
  'United States (naturalized)': 'United States',
  'American': 'United States',
  'USA': 'United States',
  'US': 'United States',

  // United Kingdom variations
  'British': 'United Kingdom',
  'British (Scottish)': 'United Kingdom',
  'British (Welsh)': 'United Kingdom',
  'British (English)': 'United Kingdom',
  'British (Northern Irish)': 'United Kingdom',
  'English': 'United Kingdom',
  'Scottish': 'United Kingdom',
  'Welsh': 'United Kingdom',
  'UK': 'United Kingdom',

  // Other common variations
  'French': 'France',
  'German': 'Germany',
  'Spanish': 'Spain',
  'Italian': 'Italy',
  'Canadian': 'Canada',
  'Australian': 'Australia',
  'Brazilian': 'Brazil',
  'Indian': 'India',
  'Chinese': 'China',
  'Japanese': 'Japan',
  'Russian': 'Russia',
  'Mexican': 'Mexico',
  'Argentine': 'Argentina',
  'Argentinian': 'Argentina',
  'Dutch': 'Netherlands',
  'Belgian': 'Belgium',
  'Swedish': 'Sweden',
  'Norwegian': 'Norway',
  'Danish': 'Denmark',
  'Finnish': 'Finland',
  'Irish': 'Ireland',
  'Israeli': 'Israel',
  'Palestinian': 'Palestine',
  'Egyptian': 'Egypt',
  'South African': 'South Africa',
  'New Zealander': 'New Zealand',
  'Pakistani': 'Pakistan',
  'Turkish': 'Turkey',
  'Greek': 'Greece',
  'Polish': 'Poland',
  'Portuguese': 'Portugal',
  'Swiss': 'Switzerland',
  'Austrian': 'Austria',
  'Czech': 'Czech Republic',
  'Hungarian': 'Hungary',
  'Romanian': 'Romania',
  'Ukrainian': 'Ukraine',
  'Lebanese': 'Lebanon',
  'Syrian': 'Syria',
  'Jordanian': 'Jordan',
  'Saudi': 'Saudi Arabia',
  'Emirati': 'United Arab Emirates',
  'Kuwaiti': 'Kuwait',
  'Iranian': 'Iran',
  'Iraqi': 'Iraq',
  'Moroccan': 'Morocco',
  'Algerian': 'Algeria',
  'Tunisian': 'Tunisia',
  'Libyan': 'Libya',
  'Kenyan': 'Kenya',
  'Nigerian': 'Nigeria',
  'Ghanaian': 'Ghana',
}

// Profession mappings to standardize
const professionMappings: { [key: string]: string } = {
  // Politicians
  'Member of Parliament': 'Politician',
  'MP': 'Politician',
  'Senator': 'Politician',
  'Congressman': 'Politician',
  'Congresswoman': 'Politician',
  'Mayor': 'Politician',
  'Mayor of London': 'Politician',
  'Prime Minister': 'Politician',
  'President': 'Politician',
  'Minister': 'Politician',
  'Cabinet Minister': 'Politician',
  'Political Leader': 'Politician',
  'Member of the European Parliament': 'Politician',
  'MEP': 'Politician',
  'Councillor': 'Politician',
  'Council Member': 'Politician',
  'Political Advisor': 'Politician',
  'Political Strategist': 'Politician',

  // Journalists & Broadcasters
  'TV Presenter': 'Broadcaster',
  'Television Presenter': 'Broadcaster',
  'Radio Presenter': 'Broadcaster',
  'News Presenter': 'Broadcaster',
  'Television Host': 'Broadcaster',
  'Radio Host': 'Broadcaster',
  'News Anchor': 'Journalist',
  'Reporter': 'Journalist',
  'Correspondent': 'Journalist',
  'Columnist': 'Journalist',
  'Political Journalist': 'Journalist',
  'Investigative Journalist': 'Journalist',
  'Sports Journalist': 'Journalist',
  'Editor': 'Journalist',
  'News Editor': 'Journalist',
  'Political Editor': 'Journalist',

  // Actors & Entertainers
  'Film Actor': 'Actor',
  'Television Actor': 'Actor',
  'Stage Actor': 'Actor',
  'Theatre Actor': 'Actor',
  'Musical Theatre Actor': 'Actor',
  'Voice Actor': 'Actor',
  'Comedian': 'Comedian',
  'Stand-up Comedian': 'Comedian',

  // Musicians
  'Singer-Songwriter': 'Singer',
  'Pop Singer': 'Singer',
  'Rock Singer': 'Singer',
  'Jazz Singer': 'Singer',
  'Opera Singer': 'Singer',
  'Rapper': 'Singer',
  'Hip-Hop Artist': 'Singer',
  'Musician': 'Musician',
  'Composer': 'Musician',
  'Music Producer': 'Musician',
  'DJ': 'Musician',
  'Songwriter': 'Musician',

  // Directors & Filmmakers
  'Film Director': 'Director',
  'Theatre Director': 'Director',
  'Television Director': 'Director',
  'Documentary Filmmaker': 'Director',
  'Filmmaker': 'Director',
  'Screenwriter': 'Writer',
  'Film Producer': 'Producer',
  'Television Producer': 'Producer',

  // Writers & Authors
  'Novelist': 'Author',
  'Poet': 'Author',
  'Playwright': 'Author',
  'Children\'s Author': 'Author',
  'Non-fiction Writer': 'Author',
  'Essayist': 'Author',

  // Academic & Intellectual
  'University Professor': 'Academic',
  'Professor': 'Academic',
  'Lecturer': 'Academic',
  'Scholar': 'Academic',
  'Researcher': 'Academic',
  'Philosopher': 'Academic',
  'Historian': 'Academic',
  'Political Scientist': 'Academic',
  'Sociologist': 'Academic',
  'Economist': 'Academic',

  // Activists & Campaigners
  'Human Rights Activist': 'Activist',
  'Political Activist': 'Activist',
  'Environmental Activist': 'Activist',
  'Social Activist': 'Activist',
  'Civil Rights Activist': 'Activist',
  'Anti-war Activist': 'Activist',
  'Peace Activist': 'Activist',
  'Human Rights Campaigner': 'Campaigner',
  'Political Campaigner': 'Campaigner',

  // Business & Entrepreneurs
  'Entrepreneur': 'Businessman',
  'Business Executive': 'Businessman',
  'CEO': 'Businessman',
  'Businesswoman': 'Businessman',
  'Businessperson': 'Businessman',
  'Tech Entrepreneur': 'Businessman',

  // Social Media & Influencers
  'Social Media Influencer': 'Influencer',
  'YouTuber': 'Influencer',
  'Content Creator': 'Influencer',
  'Instagram Influencer': 'Influencer',
  'TikTok Influencer': 'Influencer',
  'Internet Personality': 'Influencer',
  'Media Personality': 'Broadcaster',
  'Television Personality': 'Broadcaster',

  // Other standardizations
  'Public Figure': 'Public Figure', // Keep as-is but rare
  'Model': 'Model',
  'Fashion Model': 'Model',
  'Supermodel': 'Model',
  'Sports Commentator': 'Broadcaster',
  'Pundit': 'Journalist',
  'Political Commentator': 'Journalist',
  'Social Commentator': 'Journalist',
  'Charity Founder': 'Philanthropist',
  'Humanitarian': 'Philanthropist',
  'Religious Leader': 'Religious Leader',
  'Rabbi': 'Religious Leader',
  'Imam': 'Religious Leader',
  'Priest': 'Religious Leader',
  'Bishop': 'Religious Leader',
  'Lawyer': 'Lawyer',
  'Attorney': 'Lawyer',
  'Barrister': 'Lawyer',
  'Solicitor': 'Lawyer',
  'QC': 'Lawyer',
}

// Standard professions list (for reference)
const standardProfessions = [
  'Politician',
  'Journalist',
  'Broadcaster',
  'Actor',
  'Singer',
  'Musician',
  'Director',
  'Producer',
  'Author',
  'Writer',
  'Academic',
  'Activist',
  'Campaigner',
  'Businessman',
  'Influencer',
  'Podcaster',
  'Comedian',
  'Model',
  'Philanthropist',
  'Religious Leader',
  'Lawyer',
  'Public Figure',
]

function standardizeNationality(nationality: string | null): string | null {
  if (!nationality) return null

  // Handle dual citizenship (comma-separated)
  if (nationality.includes(',')) {
    const countries = nationality.split(',').map(c => c.trim())
    const standardized = countries.map(country => {
      return nationalityMappings[country] || country
    })
    return standardized.join(', ')
  }

  return nationalityMappings[nationality] || nationality
}

function standardizeProfession(profession: string | null): string | null {
  if (!profession) return null

  // Handle multiple professions (comma-separated)
  if (profession.includes(',')) {
    const professions = profession.split(',').map(p => p.trim())
    const standardized = professions.map(prof => {
      return professionMappings[prof] || prof
    })
    // Remove duplicates
    return [...new Set(standardized)].join(', ')
  }

  return professionMappings[profession] || profession
}

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...\n')

  // Get all people
  const people = await prisma.person.findMany({
    select: {
      id: true,
      name: true,
      nationality: true,
      profession: true,
    }
  })

  console.log(`📊 Found ${people.length} people to check\n`)

  let nationalityUpdates = 0
  let professionUpdates = 0

  for (const person of people) {
    const updates: any = {}

    // Check nationality
    if (person.nationality) {
      const standardized = standardizeNationality(person.nationality)
      if (standardized !== person.nationality) {
        updates.nationality = standardized
        nationalityUpdates++
        console.log(`  🌍 ${person.name}:`)
        console.log(`     Old: ${person.nationality}`)
        console.log(`     New: ${standardized}`)
      }
    }

    // Check profession
    if (person.profession) {
      const standardized = standardizeProfession(person.profession)
      if (standardized !== person.profession) {
        updates.profession = standardized
        professionUpdates++
        console.log(`  💼 ${person.name}:`)
        console.log(`     Old: ${person.profession}`)
        console.log(`     New: ${standardized}`)
      }
    }

    // Update if needed
    if (Object.keys(updates).length > 0) {
      await prisma.person.update({
        where: { id: person.id },
        data: updates
      })
    }
  }

  console.log('\n✅ Cleanup complete!')
  console.log(`   Nationality updates: ${nationalityUpdates}`)
  console.log(`   Profession updates: ${professionUpdates}`)
  console.log(`   Total updates: ${nationalityUpdates + professionUpdates}`)
}

cleanupDatabase()
  .catch((error) => {
    console.error('❌ Error during cleanup:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
