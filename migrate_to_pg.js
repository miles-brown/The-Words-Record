const { execSync } = require('child_process');
const fs = require('fs');

// Helper to run SQLite queries with JSON output
function runSqliteQuery(query) {
  const result = execSync(`sqlite3 -json prisma/dev.db "${query}"`, { encoding: 'utf8' });
  return JSON.parse(result || '[]');
}

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
  const normalized = type.toUpperCase().replace(/[\/\-]/g, ' ');
  if (normalized === 'CRITICISM') return 'CRITICISM';
  if (normalized === 'SUPPORT') return 'SUPPORT';
  if (normalized === 'APOLOGY') return 'APOLOGY_RESPONSE';
  if (normalized === 'CLARIFICATION') return 'CLARIFICATION_CHALLENGE';
  if (normalized.includes('MIXED')) return 'MIXED_RESPONSE';
  if (normalized.includes('DISCIPLINARY')) return 'DISCIPLINARY_ACTION';
  if (normalized.includes('PROFESSIONAL')) return 'PROFESSIONAL_CONSEQUENCE';
  if (normalized.includes('INSTITUTIONAL')) return 'INSTITUTIONAL_RESPONSE';
  if (normalized.includes('CLARIFICATION') || normalized.includes('CHALLENGE')) return 'CLARIFICATION_CHALLENGE';
  if (normalized.includes('CRITICISM')) return 'CRITICISM';
  if (normalized.includes('SUPPORT')) return 'SUPPORT';
  return 'OTHER';
}

function escape(str) {
  if (!str) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

function escapeDate(date) {
  if (date === null || date === undefined || date === '') return 'NULL';

  let timestamp;
  if (typeof date === 'number') {
    timestamp = date;
  } else {
    const dateStr = String(date);
    if (/^-?\d{10,13}$/.test(dateStr)) {
      timestamp = Number(date);
    } else {
      return escape(date);
    }
  }

  const d = Math.abs(timestamp) > 9999999999 ? new Date(timestamp) : new Date(timestamp * 1000);
  if (isNaN(d.getTime())) return 'NULL';

  const year = d.getFullYear();
  if (year < 1900 || year > 2100) return 'NULL';

  return "'" + d.toISOString() + "'";
}

function escapeArray(arr) {
  if (!arr || arr.length === 0) return 'ARRAY[]::text[]';
  if (typeof arr === 'string') {
    const items = arr.split(',').map(s => s.trim()).filter(s => s);
    if (items.length === 0) return 'ARRAY[]::text[]';
    return `ARRAY[${items.map(s => escape(s)).join(',')}]`;
  }
  return `ARRAY[${arr.map(s => escape(s)).join(',')}]`;
}

console.log('Starting JasPIZ v3.0.1 PostgreSQL Migration...\n');

let sql = `-- JasPIZ v3.0.1 Data Migration
-- Generated: ${new Date().toISOString()}

`;

try {
  // 1. Tags
  console.log('1. Migrating Tags...');
  const tags = runSqliteQuery("SELECT * FROM Tag");
  tags.forEach(row => {
    sql += `INSERT INTO "Tag" (id, name, slug, description, "createdAt", "updatedAt") VALUES (${escape(row.id)}, ${escape(row.name)}, ${escape(row.slug)}, ${escape(row.description)}, ${escapeDate(row.createdAt) || 'NOW()'}, ${escapeDate(row.createdAt) || 'NOW()'});\n`;
  });
  console.log(`  ✓ ${tags.length} tags`);

  // 2. People
  console.log('2. Migrating People...');
  const people = runSqliteQuery("SELECT * FROM People");
  people.forEach(row => {
    sql += `INSERT INTO "People" (
      id, slug, name, bio, "imageUrl",
      profession, "professionDetail", nationality, "nationalityDetail",
      "birthDate", "deathDate", "akaNames",
      background, "racialGroup", religion, "bestKnownFor",
      "birthPlace", "politicalBeliefs", "politicalParty", residence,
      "roleDescription", "yearsActive", "deathPlace", "religionDenomination",
      "createdAt", "updatedAt"
    ) VALUES (
      ${escape(row.id)}, ${escape(row.slug)}, ${escape(row.name)}, ${escape(row.bio)}, ${escape(row.imageUrl)},
      '${mapProfession(row.profession)}', ${escape(row.profession)}, '${mapNationality(row.nationality)}', ${escape(row.nationality)},
      ${escapeDate(row.birthDate)}, ${escapeDate(row.deathDate)}, ${escapeArray(row.akaNames)},
      ${escape(row.background)}, ${escape(row.racialGroup)}, ${escape(row.religion)}, ${escape(row.bestKnownFor)},
      ${escape(row.birthPlace)}, ${escape(row.politicalBeliefs)}, ${escape(row.politicalParty)}, ${escape(row.residence)},
      ${escape(row.roleDescription)}, ${escape(row.yearsActive)}, ${escape(row.deathPlace)}, ${escape(row.religionDenomination)},
      ${escapeDate(row.createdAt) || 'NOW()'}, ${escapeDate(row.updatedAt) || 'NOW()'}
    );\n`;
  });
  console.log(`  ✓ ${people.length} people`);

  // 3. Organizations
  console.log('3. Migrating Organizations...');
  const orgs = runSqliteQuery("SELECT * FROM Organization");
  orgs.forEach(row => {
    sql += `INSERT INTO "Organization" (
      id, slug, name, type, description, website,
      founded, headquarters, "operatingCountries",
      "createdAt", "updatedAt"
    ) VALUES (
      ${escape(row.id)}, ${escape(row.slug)}, ${escape(row.name)}, '${mapOrganizationType(row.type)}',
      ${escape(row.description)}, ${escape(row.website)},
      ${escapeDate(row.founded)}, ${escape(row.headquarters)}, ARRAY[]::text[],
      ${escapeDate(row.createdAt) || 'NOW()'}, ${escapeDate(row.updatedAt) || 'NOW()'}
    );\n`;
  });
  console.log(`  ✓ ${orgs.length} organizations`);

  // 4. Cases
  console.log('4. Migrating Cases...');
  const cases = runSqliteQuery("SELECT * FROM Case");
  cases.forEach(row => {
    const severityEnum = row.severity ?
      (row.severity.toUpperCase() === 'LOW' ? "'LOW'" :
       row.severity.toUpperCase() === 'MEDIUM' ? "'MEDIUM'" :
       row.severity.toUpperCase() === 'HIGH' ? "'HIGH'" :
       row.severity.toUpperCase() === 'CRITICAL' ? "'CRITICAL'" : 'NULL') : 'NULL';

    const dateValue = escapeDate(row.caseDate) || escapeDate(row.publicationDate) || escapeDate(row.createdAt) || 'NOW()';

    sql += `INSERT INTO "Case" (
      id, slug, title, summary, description,
      "caseDate", "publicationDate", status, severity,
      "locationDetail", "mediaFraming", "triggeringEvent", outcome,
      "createdAt", "updatedAt"
    ) VALUES (
      ${escape(row.id)}, ${escape(row.slug)}, ${escape(row.title)}, ${escape(row.summary)}, ${escape(row.description)},
      ${dateValue}, ${escapeDate(row.publicationDate) || 'NOW()'}, 'DOCUMENTED', ${severityEnum}::"CaseSeverity",
      ${escape(row.location)}, ${escape(row.mediaFraming)}, ${escape(row.triggeringEvent)}, ${escape(row.outcome)},
      ${escapeDate(row.createdAt) || 'NOW()'}, ${escapeDate(row.updatedAt) || 'NOW()'}
    );\n`;
  });
  console.log(`  ✓ ${cases.length} cases`);

  // 5. Statements
  console.log('5. Migrating Statements...');
  const statements = runSqliteQuery("SELECT * FROM Statement");
  let statementCount = 0;
  statements.forEach(row => {
    if (!row.caseId) return; // Skip statements without case

    sql += `INSERT INTO "Statement" (
      id, content, context, "statementType", "statementDate",
      medium, "isVerified", "lostEmployment", "lostContracts",
      "paintedNegatively", "repercussionDetails",
      "peopleId", "caseId",
      "createdAt", "updatedAt"
    ) VALUES (
      ${escape(row.id)}, ${escape(row.content)}, ${escape(row.context)}, 'ORIGINAL', ${escapeDate(row.statementDate)},
      ${escape(row.medium)}, ${row.isVerified ? 'true' : 'false'}, ${row.lostEmployment ? 'true' : 'false'}, ${row.lostContracts ? 'true' : 'false'},
      ${row.paintedNegatively ? 'true' : 'false'}, ${escape(row.repercussionDetails)},
      ${row.peopleId ? escape(row.peopleId) : 'NULL'}, ${escape(row.caseId)},
      ${escapeDate(row.createdAt) || 'NOW()'}, ${escapeDate(row.updatedAt) || 'NOW()'}
    );\n`;
    statementCount++;
  });
  console.log(`  ✓ ${statementCount} statements`);

  // 6. Responses (merge into Statements)
  console.log('6. Merging Responses into Statements...');
  const responses = runSqliteQuery("SELECT * FROM Response");
  let responseCount = 0;
  responses.forEach(row => {
    if (!row.caseId) return; // Skip responses without case

    sql += `INSERT INTO "Statement" (
      id, content, "statementType", "responseType", "statementDate",
      "responseImpact", "respondsToId",
      "peopleId", "organizationId", "caseId",
      "createdAt", "updatedAt"
    ) VALUES (
      ${escape('resp_' + row.id)}, ${escape(row.content)}, 'RESPONSE', '${mapResponseType(row.type)}', ${escapeDate(row.responseDate)},
      ${escape(row.impact)}, ${row.statementId ? escape(row.statementId) : 'NULL'},
      ${row.peopleId ? escape(row.peopleId) : 'NULL'}, ${row.organizationId ? escape(row.organizationId) : 'NULL'}, ${escape(row.caseId)},
      ${escapeDate(row.createdAt) || 'NOW()'}, ${escapeDate(row.updatedAt) || 'NOW()'}
    );\n`;
    responseCount++;
  });
  console.log(`  ✓ ${responseCount} responses`);

  // 7. Affiliations
  console.log('7. Migrating Affiliations...');
  const affiliations = runSqliteQuery("SELECT * FROM Affiliation");
  affiliations.forEach(row => {
    sql += `INSERT INTO "Affiliation" (
      id, role, "startDate", "endDate", "isActive",
      description, responsibilities,
      "peopleId", "organizationId",
      "createdAt", "updatedAt"
    ) VALUES (
      ${escape(row.id)}, ${escape(row.role)}, ${escapeDate(row.startDate)}, ${escapeDate(row.endDate)}, ${row.isActive ? 'true' : 'false'},
      ${escape(row.description)}, ARRAY[]::text[],
      ${escape(row.peopleId)}, ${escape(row.organizationId)},
      ${escapeDate(row.createdAt) || 'NOW()'}, ${escapeDate(row.updatedAt) || 'NOW()'}
    );\n`;
  });
  console.log(`  ✓ ${affiliations.length} affiliations`);

  // 8. Junction tables
  console.log('8. Migrating junction tables...');

  // PeopleCases
  const peopleCases = runSqliteQuery("SELECT * FROM _PeopleCases");
  peopleCases.forEach(row => {
    sql += `INSERT INTO "_PeopleCases" ("A", "B") VALUES (${escape(row.A)}, ${escape(row.B)});\n`;
  });
  console.log(`  ✓ ${peopleCases.length} people-case relations`);

  // OrganizationCases
  const organizationCases = runSqliteQuery("SELECT * FROM _OrganizationCases");
  organizationCases.forEach(row => {
    sql += `INSERT INTO "_OrganizationCases" ("A", "B") VALUES (${escape(row.A)}, ${escape(row.B)});\n`;
  });
  console.log(`  ✓ ${organizationCases.length} organization-case relations`);

  // CaseTags
  const caseTags = runSqliteQuery("SELECT * FROM _CaseTags");
  caseTags.forEach(row => {
    sql += `INSERT INTO "_CaseTags" ("A", "B") VALUES (${escape(row.A)}, ${escape(row.B)});\n`;
  });
  console.log(`  ✓ ${caseTags.length} case-tag relations`);

  // Add validation queries
  sql += `
-- Validation queries
SELECT 'People' as table_name, COUNT(*) as count FROM "People"
UNION ALL
SELECT 'Organization', COUNT(*) FROM "Organization"
UNION ALL
SELECT 'Case', COUNT(*) FROM "Case"
UNION ALL
SELECT 'Statement (Original)', COUNT(*) FROM "Statement" WHERE "statementType" = 'ORIGINAL'
UNION ALL
SELECT 'Statement (Response)', COUNT(*) FROM "Statement" WHERE "statementType" = 'RESPONSE'
UNION ALL
SELECT 'Tag', COUNT(*) FROM "Tag"
UNION ALL
SELECT 'Affiliation', COUNT(*) FROM "Affiliation";
`;

  // Write to file
  fs.writeFileSync('migration_pg.sql', sql);
  console.log('\n✅ Migration SQL generated: migration_pg.sql');
  console.log('Run: psql jaspiz_v3 < migration_pg.sql');

} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}