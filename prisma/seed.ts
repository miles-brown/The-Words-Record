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
      profession: 'ARTIST',
      nationality: 'UK',
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
      profession: 'POLITICIAN',
      nationality: 'ISRAEL',
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
      profession: 'POLITICIAN',
      nationality: 'ISRAEL',
      bio: 'Israeli UN ambassador.',
    },
  })

  // Create the case
  const caseItem = await prisma.case.upsert({
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
      caseDate: new Date('2022-01-03'),
      status: 'DOCUMENTED',
      severity: 'MEDIUM',
      people: {
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
      medium: 'INSTAGRAM',
      isVerified: true,
      personId: emmaWatson.id,
      caseId: caseItem.id,
    },
  })

  // Create Danny Danon's response (as a Statement with RESPONSE type)
  await prisma.statement.create({
    data: {
      content: '10 points from Gryffindor for being an antisemite.',
      context: 'Response to Emma Watson\'s Instagram post; sparked framing of Watson\'s post as a scandal in major media outlets.',
      statementDate: new Date('2022-01-03'),
      statementType: 'RESPONSE',
      responseType: 'CRITICISM',
      medium: 'TWITTER_X',
      personId: dannyDanon.id,
      caseId: caseItem.id,
      respondsToId: watsonStatement.id,
    },
  })

  // Create Gilad Erdan's response (as a Statement with RESPONSE type)
  await prisma.statement.create({
    data: {
      content: 'Fiction may work in Harry Potter but it does not work in reality. If it did, magic could eliminate the evils of Hamas…',
      context: 'Response to Emma Watson\'s Instagram post; Israeli UN ambassador\'s response amplified the controversy in international media.',
      statementDate: new Date('2022-01-03'),
      statementType: 'RESPONSE',
      responseType: 'CRITICISM',
      medium: 'TWITTER_X',
      personId: giladErdan.id,
      caseId: caseItem.id,
      respondsToId: watsonStatement.id,
    },
  })

  // Create sources
  await prisma.source.create({
    data: {
      title: 'The Guardian: Emma Watson pro-Palestinian post sparks antisemitism row',
      publication: 'The Guardian',
      publishDate: new Date('2022-01-03'),
      credibility: 'HIGH',
      caseId: caseItem.id,
    },
  })

  await prisma.source.create({
    data: {
      title: 'The Independent: Emma Watson faces backlash … accused of antisemitism',
      publication: 'The Independent',
      publishDate: new Date('2022-01-03'),
      credibility: 'HIGH',
      caseId: caseItem.id,
    },
  })

  // Create tags
  const antisemitismTag = await prisma.tag.upsert({
    where: { slug: 'antisemitism-accusations' },
    update: {},
    create: {
      slug: 'antisemitism-accusations',
      name: 'Antisemitism Accusations',
      description: 'Cases involving accusations of antisemitism',
    },
  })

  const palestineTag = await prisma.tag.upsert({
    where: { slug: 'palestine-solidarity' },
    update: {},
    create: {
      slug: 'palestine-solidarity',
      name: 'Palestine Solidarity',
      description: 'Cases related to expressions of solidarity with Palestine',
    },
  })

  const socialMediaTag = await prisma.tag.upsert({
    where: { slug: 'social-media' },
    update: {},
    create: {
      slug: 'social-media',
      name: 'Social Media',
      description: 'Cases originating on social media platforms',
    },
  })

  // Connect tags to case
  await prisma.case.update({
    where: { id: caseItem.id },
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
  console.log('- 3 people (Emma Watson, Danny Danon, Gilad Erdan)')
  console.log('- 1 case')
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
