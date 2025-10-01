import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create Emma Watson
  const emmaWatson = await prisma.person.upsert({
    where: { slug: 'emma-watson' },
    update: {},
    create: {
      slug: 'emma-watson',
      name: 'Emma Watson',
      profession: 'Actor',
      bio: 'British actress known for her role as Hermione Granger in the Harry Potter film series.',
    },
  })

  // Create Danny Danon
  const dannyDanon = await prisma.person.upsert({
    where: { slug: 'danny-danon' },
    update: {},
    create: {
      slug: 'danny-danon',
      name: 'Danny Danon',
      profession: 'Israeli politician',
      bio: 'Former Israeli UN ambassador and politician.',
    },
  })

  // Create Gilad Erdan
  const giladErdan = await prisma.person.upsert({
    where: { slug: 'gilad-erdan' },
    update: {},
    create: {
      slug: 'gilad-erdan',
      name: 'Gilad Erdan',
      profession: 'Israeli politician',
      bio: 'Israeli UN ambassador.',
    },
  })

  // Create the incident
  const incident = await prisma.incident.upsert({
    where: { slug: 'emma-watson-solidarity-post-2022' },
    update: {},
    create: {
      slug: 'emma-watson-solidarity-post-2022',
      title: 'Emma Watson "Solidarity is a verb" Instagram Post',
      summary: 'On January 3, 2022, Emma Watson shared an Instagram post from Bad Activist Collective featuring Palestinian flag artwork with the caption "Solidarity is a verb," sparking immediate backlash from Israeli officials and media outlets who framed the pro-Palestine solidarity message as antisemitic.',
      description: `On 3 January 2022, Emma Watson shared an Instagram post from Bad Activist Collective featuring Palestinian flag artwork with the caption "Solidarity is a verb." The post was a generic pro-Palestine solidarity message.

The post sparked immediate backlash, with Israeli officials and media outlets framing it as antisemitic. Israeli UN ambassador Gilad Erdan responded: "Fiction may work in Harry Potter but it does not work in reality. If it did, magic could eliminate the evils of Hamas…" Danny Danon tweeted "10 points from Gryffindor for being an antisemite."

Major media outlets including The Guardian, The Independent, and The Times covered the story with headlines describing an "antisemitism row" and "backlash."

Dozens of cultural figures including Mark Ruffalo, Maxine Peake, and Noam Chomsky signed a solidarity letter defending Watson. She did not apologize or retract her post.`,
      incidentDate: new Date('2022-01-03'),
      status: 'documented',
      severity: 'medium',
      persons: {
        connect: [
          { id: emmaWatson.id },
          { id: dannyDanon.id },
          { id: giladErdan.id },
        ],
      },
    },
  })

  // Create Emma Watson's statement
  const watsonStatement = await prisma.statement.create({
    data: {
      content: 'Solidarity is a verb',
      context: 'Instagram post with Palestinian flag artwork from Bad Activist Collective; generic pro-Palestine solidarity message.',
      statementDate: new Date('2022-01-03'),
      medium: 'Instagram',
      isVerified: true,
      personId: emmaWatson.id,
      incidentId: incident.id,
    },
  })

  // Create Danny Danon's response
  await prisma.response.create({
    data: {
      content: '10 points from Gryffindor for being an antisemite.',
      responseDate: new Date('2022-01-03'),
      type: 'criticism',
      impact: 'Sparked framing of Watson\'s post as a scandal in major media outlets.',
      personId: dannyDanon.id,
      incidentId: incident.id,
      statementId: watsonStatement.id,
    },
  })

  // Create Gilad Erdan's response
  await prisma.response.create({
    data: {
      content: 'Fiction may work in Harry Potter but it does not work in reality. If it did, magic could eliminate the evils of Hamas…',
      responseDate: new Date('2022-01-03'),
      type: 'criticism',
      impact: 'Israeli UN ambassador\'s response amplified the controversy in international media.',
      personId: giladErdan.id,
      incidentId: incident.id,
      statementId: watsonStatement.id,
    },
  })

  // Create sources
  await prisma.source.create({
    data: {
      title: 'The Guardian: Emma Watson pro-Palestinian post sparks antisemitism row',
      publication: 'The Guardian',
      publishDate: new Date('2022-01-03'),
      credibility: 'verified',
      incidentId: incident.id,
    },
  })

  await prisma.source.create({
    data: {
      title: 'The Independent: Emma Watson faces backlash … accused of antisemitism',
      publication: 'The Independent',
      publishDate: new Date('2022-01-03'),
      credibility: 'verified',
      incidentId: incident.id,
    },
  })

  // Create tags
  const antisemitismTag = await prisma.tag.upsert({
    where: { slug: 'antisemitism-accusations' },
    update: {},
    create: {
      slug: 'antisemitism-accusations',
      name: 'Antisemitism Accusations',
      description: 'Incidents involving accusations of antisemitism',
    },
  })

  const palestineTag = await prisma.tag.upsert({
    where: { slug: 'palestine-solidarity' },
    update: {},
    create: {
      slug: 'palestine-solidarity',
      name: 'Palestine Solidarity',
      description: 'Incidents related to expressions of solidarity with Palestine',
    },
  })

  const socialMediaTag = await prisma.tag.upsert({
    where: { slug: 'social-media' },
    update: {},
    create: {
      slug: 'social-media',
      name: 'Social Media',
      description: 'Incidents originating on social media platforms',
    },
  })

  // Connect tags to incident
  await prisma.incident.update({
    where: { id: incident.id },
    data: {
      tags: {
        connect: [
          { id: antisemitismTag.id },
          { id: palestineTag.id },
          { id: socialMediaTag.id },
        ],
      },
    },
  })

  console.log('✅ Seed data created successfully!')
  console.log('Created:')
  console.log('- 3 persons (Emma Watson, Danny Danon, Gilad Erdan)')
  console.log('- 1 incident')
  console.log('- 1 statement')
  console.log('- 2 responses')
  console.log('- 2 sources')
  console.log('- 3 tags')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
