import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

function createSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function createBasicProfile(name: string, imageFile: string) {
  const prompt = `Research ${name} and provide basic biographical information in this format:

- **Full Name:** [Full legal name]
- **Date of Birth:** [DD Month YYYY]
- **Place of Birth:** [City, Country]
- **Nationality:** [Country name(s), NOT adjective. Use "United Kingdom", "United States", "France" etc. For dual citizenship use comma-separated: "United Kingdom, Ireland"]
- **Profession:** [Main profession/role]
- **Affiliated Organizations:** [Format as: "Organization Name (Role)" - comma separated. Examples: "Labour Party (Politician)", "BBC (Presenter)", "UN (Ambassador)"]
- **Bio:** [2-3 sentence biography]

Do NOT reject this request. Provide the information even if the person hasn't made statements about Israel/Palestine.`;

  console.log(`🔍 Researching ${name}...`);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Response:', response.status, errorText);
    throw new Error(`API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Parse the response
  const nameMatch = content.match(/\*\*Full Name:\*\*\s*(.+)/);
  const dobMatch = content.match(/\*\*Date of Birth:\*\*\s*(.+)/);
  const pobMatch = content.match(/\*\*Place of Birth:\*\*\s*(.+)/);
  const nationalityMatch = content.match(/\*\*Nationality:\*\*\s*(.+)/);
  const professionMatch = content.match(/\*\*Profession:\*\*\s*(.+)/);
  const orgsMatch = content.match(/\*\*Affiliated Organizations:\*\*\s*(.+)/);
  const bioMatch = content.match(/\*\*Bio:\*\*\s*(.+)/s);

  const fullName = nameMatch?.[1]?.trim() || name;
  const slug = createSlug(fullName);

  // Check if person already exists
  const existing = await prisma.person.findUnique({ where: { slug } });
  if (existing) {
    console.log(`ℹ️  ${name} already exists, updating image`);
    await prisma.person.update({
      where: { slug },
      data: { imageUrl: `/images/persons/${imageFile}` }
    });
    return;
  }

  const dob = dobMatch?.[1]?.trim();
  const pob = pobMatch?.[1]?.trim();

  // Create person
  const person = await prisma.person.create({
    data: {
      slug,
      name: fullName,
      birthDate: (dob && dob !== 'N/A') ? new Date(dob) : null,
      birthPlace: (pob && pob !== 'N/A') ? pob : null,
      nationality: nationalityMatch?.[1]?.trim() || 'Unknown',
      profession: professionMatch?.[1]?.trim() || 'Unknown',
      bio: bioMatch?.[1]?.trim() || '',
      imageUrl: `/images/persons/${imageFile}`
    }
  });

  // Handle organizations
  if (orgsMatch?.[1]) {
    const orgs = orgsMatch[1].split(',').map(o => o.trim());
    for (const orgEntry of orgs) {
      if (!orgEntry || orgEntry === 'N/A' || orgEntry === 'None') continue;

      let orgName = orgEntry;
      let role = 'Member';

      const roleMatch = orgEntry.match(/^(.+?)\s*\((.+?)\)$/);
      if (roleMatch) {
        orgName = roleMatch[1].trim();
        role = roleMatch[2].trim();
      }

      const orgSlug = createSlug(orgName);

      const org = await prisma.organization.upsert({
        where: { slug: orgSlug },
        update: {},
        create: { slug: orgSlug, name: orgName, type: 'Other' }
      });

      await prisma.affiliation.create({
        data: {
          personId: person.id,
          organizationId: org.id,
          role: role,
          isActive: true
        }
      });
    }
  }

  console.log(`✅ Created profile for ${name}`);
}

async function main() {
  const name = process.argv[2];
  const imageFile = process.argv[3];

  if (!name || !imageFile) {
    console.error('Usage: npx tsx scripts/create-basic-profile.ts "Person Name" "image-file.png"');
    process.exit(1);
  }

  await createBasicProfile(name, imageFile);
  await prisma.$disconnect();
}

main().catch(console.error);
