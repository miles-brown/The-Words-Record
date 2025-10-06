const { PrismaClient: SqliteClient } = require('@prisma/client');
const { PrismaClient: PostgresClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create SQLite client with old database
const sqliteDb = new sqlite3.Database(path.join(__dirname, 'prisma/dev.db'));

// Create PostgreSQL client
const postgresClient = new PostgresClient();

// Mapping functions for enums
function mapProfession(prof) {
  if (!prof) return 'OTHER';
  const normalized = prof.toUpperCase();
  if (normalized.includes('MP') || normalized.includes('MINISTER') || normalized.includes('SENATOR')) return 'POLITICIAN';
  if (normalized.includes('JOURNALIST') || normalized.includes('REPORTER')) return 'JOURNALIST';
  if (normalized.includes('ACADEMIC') || normalized.includes('PROFESSOR')) return 'ACADEMIC';
  if (normalized.includes('ACTIVIST')) return 'ACTIVIST';
  if (normalized.includes('BUSINESS') || normalized.includes('CEO') || normalized.includes('EXECUTIVE')) return 'BUSINESS';
  if (normalized.includes('CELEBRITY') || normalized.includes('ACTOR') || normalized.includes('ACTRESS')) return 'CELEBRITY';
  if (normalized.includes('RELIGIOUS') || normalized.includes('RABBI') || normalized.includes('IMAM')) return 'RELIGIOUS';
  if (normalized.includes('MILITARY') || normalized.includes('GENERAL') || normalized.includes('COLONEL')) return 'MILITARY';
  if (normalized.includes('LEGAL') || normalized.includes('LAWYER') || normalized.includes('ATTORNEY')) return 'LEGAL';
  if (normalized.includes('MEDICAL') || normalized.includes('DOCTOR') || normalized.includes('PHYSICIAN')) return 'MEDICAL';
  if (normalized.includes('ARTIST') || normalized.includes('MUSICIAN') || normalized.includes('PAINTER')) return 'ARTIST';
  if (normalized.includes('ATHLETE') || normalized.includes('SPORTS')) return 'ATHLETE';
  return 'OTHER';
}

function mapNationality(nat) {
  if (!nat) return 'OTHER';
  const normalized = nat.toUpperCase();
  if (normalized.includes('US') || normalized.includes('AMERICA')) return 'US';
  if (normalized.includes('UK') || normalized.includes('BRITISH') || normalized.includes('ENGLAND')) return 'UK';
  if (normalized.includes('ISRAEL')) return 'ISRAEL';
  if (normalized.includes('PALESTIN')) return 'PALESTINE';
  if (normalized.includes('FRANCE') || normalized.includes('FRENCH')) return 'FRANCE';
  if (normalized.includes('GERMANY') || normalized.includes('GERMAN')) return 'GERMANY';
  if (normalized.includes('CANADA') || normalized.includes('CANADIAN')) return 'CANADA';
  if (normalized.includes('AUSTRALIA') || normalized.includes('AUSTRALIAN')) return 'AUSTRALIA';
  return 'OTHER';
}

function mapOrganizationType(type) {
  if (!type) return 'OTHER';
  const normalized = type.toUpperCase();
  if (normalized.includes('MEDIA')) return 'MEDIA_OUTLET';
  if (normalized.includes('POLITICAL') || normalized.includes('PARTY')) return 'POLITICAL_PARTY';
  if (normalized.includes('NGO')) return 'NGO';
  if (normalized.includes('CORPORATION') || normalized.includes('COMPANY')) return 'CORPORATION';
  if (normalized.includes('UNIVERSITY') || normalized.includes('COLLEGE')) return 'UNIVERSITY';
  if (normalized.includes('THINK TANK')) return 'THINK_TANK';
  if (normalized.includes('GOVERNMENT')) return 'GOVERNMENT_AGENCY';
  if (normalized.includes('RELIGIOUS')) return 'RELIGIOUS_ORGANIZATION';
  if (normalized.includes('ADVOCACY')) return 'ADVOCACY_GROUP';
  return 'OTHER';
}

function mapResponseType(type) {
  if (!type) return 'OTHER';
  const normalized = type.toUpperCase();

  // Direct mappings
  if (normalized === 'CRITICISM') return 'CRITICISM';
  if (normalized === 'SUPPORT') return 'SUPPORT';
  if (normalized === 'APOLOGY') return 'APOLOGY_RESPONSE';
  if (normalized === 'CLARIFICATION') return 'CLARIFICATION_CHALLENGE';

  // Complex mappings
  if (normalized.includes('MIXED')) return 'MIXED_RESPONSE';
  if (normalized.includes('DISCIPLINARY')) return 'DISCIPLINARY_ACTION';
  if (normalized.includes('PROFESSIONAL')) return 'PROFESSIONAL_CONSEQUENCE';
  if (normalized.includes('INSTITUTIONAL')) return 'INSTITUTIONAL_RESPONSE';
  if (normalized.includes('CLARIFICATION') || normalized.includes('CHALLENGE')) return 'CLARIFICATION_CHALLENGE';
  if (normalized.includes('CRITICISM')) return 'CRITICISM';
  if (normalized.includes('SUPPORT')) return 'SUPPORT';

  return 'OTHER';
}

function parseAkaNames(akaNames) {
  if (!akaNames) return [];
  if (typeof akaNames === 'string') {
    return akaNames.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }
  return [];
}

async function getFromSqlite(query) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(query, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function migrate() {
  console.log('Starting migration from SQLite to PostgreSQL...\n');

  try {
    // 1. Migrate Tags
    console.log('1. Migrating Tags...');
    const tags = await getFromSqlite('SELECT * FROM Tag');
    for (const tag of tags) {
      await postgresClient.tag.create({
        data: {
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          description: tag.description,
          createdAt: tag.createdAt ? new Date(tag.createdAt) : new Date(),
          updatedAt: tag.updatedAt ? new Date(tag.updatedAt) : new Date()
        }
      });
    }
    console.log(`  ✓ Migrated ${tags.length} tags\n`);

    // 2. Migrate Persons
    console.log('2. Migrating Persons...');
    const persons = await getFromSqlite('SELECT * FROM Person');
    for (const person of persons) {
      await postgresClient.person.create({
        data: {
          id: person.id,
          slug: person.slug,
          name: person.name,
          bio: person.bio,
          imageUrl: person.imageUrl,
          profession: mapProfession(person.profession),
          professionDetail: person.profession,
          nationality: mapNationality(person.nationality),
          nationalityDetail: person.nationality,
          birthDate: person.birthDate ? new Date(person.birthDate) : null,
          deathDate: person.deathDate ? new Date(person.deathDate) : null,
          akaNames: parseAkaNames(person.akaNames),
          background: person.background,
          racialGroup: person.racialGroup,
          religion: person.religion,
          bestKnownFor: person.bestKnownFor,
          birthPlace: person.birthPlace,
          politicalBeliefs: person.politicalBeliefs,
          politicalParty: person.politicalParty,
          residence: person.residence,
          roleDescription: person.roleDescription,
          yearsActive: person.yearsActive,
          deathPlace: person.deathPlace,
          religionDenomination: person.religionDenomination,
          createdAt: person.createdAt ? new Date(person.createdAt) : new Date(),
          updatedAt: person.updatedAt ? new Date(person.updatedAt) : new Date()
        }
      });
    }
    console.log(`  ✓ Migrated ${persons.length} persons\n`);

    // 3. Migrate Organizations
    console.log('3. Migrating Organizations...');
    const orgs = await getFromSqlite('SELECT * FROM Organization');
    for (const org of orgs) {
      await postgresClient.organization.create({
        data: {
          id: org.id,
          slug: org.slug,
          name: org.name,
          type: mapOrganizationType(org.type),
          description: org.description,
          website: org.website,
          founded: org.founded ? new Date(org.founded) : null,
          headquarters: org.headquarters,
          operatingCountries: [],
          createdAt: org.createdAt ? new Date(org.createdAt) : new Date(),
          updatedAt: org.updatedAt ? new Date(org.updatedAt) : new Date()
        }
      });
    }
    console.log(`  ✓ Migrated ${orgs.length} organizations\n`);

    // 4. Migrate Incidents
    console.log('4. Migrating Incidents...');
    const incidents = await getFromSqlite('SELECT * FROM Incident');
    for (const incident of incidents) {
      await postgresClient.incident.create({
        data: {
          id: incident.id,
          slug: incident.slug,
          title: incident.title,
          summary: incident.summary,
          description: incident.description,
          incidentDate: new Date(incident.incidentDate),
          publicationDate: incident.publicationDate ? new Date(incident.publicationDate) : new Date(),
          status: incident.status === 'documented' ? 'DOCUMENTED' : 'DOCUMENTED',
          severity: incident.severity ?
            (incident.severity.toUpperCase() === 'LOW' ? 'LOW' :
             incident.severity.toUpperCase() === 'MEDIUM' ? 'MEDIUM' :
             incident.severity.toUpperCase() === 'HIGH' ? 'HIGH' :
             incident.severity.toUpperCase() === 'CRITICAL' ? 'CRITICAL' : null) : null,
          locationDetail: incident.location,
          mediaFraming: incident.mediaFraming,
          triggeringEvent: incident.triggeringEvent,
          outcome: incident.outcome,
          createdAt: incident.createdAt ? new Date(incident.createdAt) : new Date(),
          updatedAt: incident.updatedAt ? new Date(incident.updatedAt) : new Date()
        }
      });
    }
    console.log(`  ✓ Migrated ${incidents.length} incidents\n`);

    // 5. Migrate Statements
    console.log('5. Migrating Statements...');
    const statements = await getFromSqlite('SELECT * FROM Statement');
    for (const statement of statements) {
      await postgresClient.statement.create({
        data: {
          id: statement.id,
          content: statement.content,
          context: statement.context,
          statementType: 'ORIGINAL',
          statementDate: new Date(statement.statementDate),
          medium: statement.medium,
          isVerified: statement.isVerified === 1,
          lostEmployment: statement.lostEmployment === 1,
          lostContracts: statement.lostContracts === 1,
          paintedNegatively: statement.paintedNegatively === 1,
          repercussionDetails: statement.repercussionDetails,
          personId: statement.personId,
          incidentId: statement.incidentId,
          createdAt: statement.createdAt ? new Date(statement.createdAt) : new Date(),
          updatedAt: statement.updatedAt ? new Date(statement.updatedAt) : new Date()
        }
      });
    }
    console.log(`  ✓ Migrated ${statements.length} statements\n`);

    // 6. Merge Responses into Statements
    console.log('6. Merging Responses into Statements...');
    const responses = await getFromSqlite('SELECT * FROM Response');
    for (const response of responses) {
      await postgresClient.statement.create({
        data: {
          id: response.id,
          content: response.content,
          statementType: 'RESPONSE',
          responseType: mapResponseType(response.type),
          statementDate: new Date(response.responseDate),
          responseImpact: response.impact,
          personId: response.personId,
          organizationId: response.organizationId,
          respondsToId: response.statementId,
          incidentId: response.incidentId,
          createdAt: response.createdAt ? new Date(response.createdAt) : new Date(),
          updatedAt: response.updatedAt ? new Date(response.updatedAt) : new Date()
        }
      });
    }
    console.log(`  ✓ Merged ${responses.length} responses into statements\n`);

    // 7. Migrate Affiliations
    console.log('7. Migrating Affiliations...');
    const affiliations = await getFromSqlite('SELECT * FROM Affiliation');
    for (const aff of affiliations) {
      await postgresClient.affiliation.create({
        data: {
          id: aff.id,
          role: aff.role,
          startDate: aff.startDate ? new Date(aff.startDate) : null,
          endDate: aff.endDate ? new Date(aff.endDate) : null,
          isActive: aff.isActive === 1,
          description: aff.description,
          responsibilities: [],
          personId: aff.personId,
          organizationId: aff.organizationId,
          createdAt: aff.createdAt ? new Date(aff.createdAt) : new Date(),
          updatedAt: aff.updatedAt ? new Date(aff.updatedAt) : new Date()
        }
      });
    }
    console.log(`  ✓ Migrated ${affiliations.length} affiliations\n`);

    // 8. Migrate junction tables
    console.log('8. Migrating junction tables...');

    // PersonIncidents
    const personIncidents = await getFromSqlite('SELECT * FROM _PersonIncidents');
    for (const pi of personIncidents) {
      await postgresClient.$executeRaw`
        INSERT INTO "_PersonIncidents" ("A", "B") VALUES (${pi.A}, ${pi.B})
      `;
    }
    console.log(`  ✓ Migrated ${personIncidents.length} person-incident relations`);

    // OrganizationIncidents
    const orgIncidents = await getFromSqlite('SELECT * FROM _OrganizationIncidents');
    for (const oi of orgIncidents) {
      await postgresClient.$executeRaw`
        INSERT INTO "_OrganizationIncidents" ("A", "B") VALUES (${oi.A}, ${oi.B})
      `;
    }
    console.log(`  ✓ Migrated ${orgIncidents.length} organization-incident relations`);

    // IncidentTags
    const incidentTags = await getFromSqlite('SELECT * FROM _IncidentTags');
    for (const it of incidentTags) {
      await postgresClient.$executeRaw`
        INSERT INTO "_IncidentTags" ("A", "B") VALUES (${it.A}, ${it.B})
      `;
    }
    console.log(`  ✓ Migrated ${incidentTags.length} incident-tag relations\n`);

    console.log('✅ Migration completed successfully!');

    // Run validation queries
    console.log('\nRunning validation queries...');
    const counts = await postgresClient.$queryRaw`
      SELECT 'Person' as table_name, COUNT(*) as count FROM "Person"
      UNION ALL
      SELECT 'Organization', COUNT(*) FROM "Organization"
      UNION ALL
      SELECT 'Incident', COUNT(*) FROM "Incident"
      UNION ALL
      SELECT 'Statement (Original)', COUNT(*) FROM "Statement" WHERE "statementType" = 'ORIGINAL'
      UNION ALL
      SELECT 'Statement (Response)', COUNT(*) FROM "Statement" WHERE "statementType" = 'RESPONSE'
      UNION ALL
      SELECT 'Tag', COUNT(*) FROM "Tag"
      UNION ALL
      SELECT 'Affiliation', COUNT(*) FROM "Affiliation"
    `;

    console.log('\nRecord counts in PostgreSQL:');
    counts.forEach(row => {
      console.log(`  ${row.table_name}: ${row.count}`);
    });

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await postgresClient.$disconnect();
    sqliteDb.close();
  }
}

migrate();