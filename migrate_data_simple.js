const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper to run SQLite queries
function runSqliteQuery(query) {
  // Use JSON output mode for proper escaping
  const result = execSync(`sqlite3 -json prisma/dev.db "${query}"`, { encoding: 'utf8' });
  return JSON.parse(result);
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

function escape(str) {
  if (!str) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

function escapeDate(date) {
  if (date === null || date === undefined || date === '') return 'NULL';

  // If it's already a number, use it directly
  let timestamp;
  if (typeof date === 'number') {
    timestamp = date;
  } else {
    // Convert to string and check if it's a timestamp
    const dateStr = String(date);
    if (/^-?\d{10,13}$/.test(dateStr)) {
      timestamp = Number(date);
    } else {
      // Assume it's a date string
      return escape(date);
    }
  }

  // If it's in milliseconds (> 10 billion), use directly; otherwise multiply by 1000
  const d = Math.abs(timestamp) > 9999999999 ? new Date(timestamp) : new Date(timestamp * 1000);

  // Check if date is valid
  if (isNaN(d.getTime())) {
    return 'NULL';
  }

  // Check for reasonable date range (1900-2100)
  const year = d.getFullYear();
  if (year < 1900 || year > 2100) {
    return 'NULL';
  }

  return "'" + d.toISOString() + "'";
}

function escapeArray(arr) {
  if (!arr || arr.length === 0) return 'ARRAY[]::text[]';
  return `ARRAY[${arr.map(s => escape(s)).join(',')}]`;
}

console.log('Generating migration SQL...\n');

let sql = `-- JasPIZ v3.0.1 Data Migration
-- Generated: ${new Date().toISOString()}

-- No transaction wrapper to allow partial success
`;

// 1. Tags
console.log('Processing Tags...');
const tags = runSqliteQuery("SELECT id, name, slug, description, createdAt FROM Tag");
tags.forEach(row => {
  sql += `INSERT INTO "Tag" (id, name, slug, description, "createdAt", "updatedAt") VALUES (${escape(row.id)}, ${escape(row.name)}, ${escape(row.slug)}, ${escape(row.description)}, ${escapeDate(row.createdAt) || 'NOW()'}, ${escapeDate(row.createdAt) || 'NOW()'});\n`;
});

// 2. Persons
console.log('Processing Persons...');
const persons = runSqliteQuery("SELECT id, slug, name, bio, imageUrl, profession, nationality, birthDate, deathDate, akaNames, background, racialGroup, religion, bestKnownFor, birthPlace, politicalBeliefs, politicalParty, residence, roleDescription, yearsActive, deathPlace, religionDenomination, createdAt, updatedAt FROM Person");
persons.forEach(row => {
  const [id, slug, name, bio, imageUrl, profession, nationality, birthDate, deathDate, akaNames, background, racialGroup, religion, bestKnownFor, birthPlace, politicalBeliefs, politicalParty, residence, roleDescription, yearsActive, deathPlace, religionDenomination, createdAt, updatedAt] = row;

  const akaArray = akaNames ? akaNames.split(',').map(s => s.trim()).filter(s => s) : [];

  sql += `INSERT INTO "Person" (
    id, slug, name, bio, "imageUrl",
    profession, "professionDetail", nationality, "nationalityDetail",
    "birthDate", "deathDate", "akaNames",
    background, "racialGroup", religion, "bestKnownFor",
    "birthPlace", "politicalBeliefs", "politicalParty", residence,
    "roleDescription", "yearsActive", "deathPlace", "religionDenomination",
    "createdAt", "updatedAt"
  ) VALUES (
    ${escape(id)}, ${escape(slug)}, ${escape(name)}, ${escape(bio)}, ${escape(imageUrl)},
    '${mapProfession(profession)}', ${escape(profession)}, '${mapNationality(nationality)}', ${escape(nationality)},
    ${escapeDate(birthDate)}, ${escapeDate(deathDate)}, ${escapeArray(akaArray)},
    ${escape(background)}, ${escape(racialGroup)}, ${escape(religion)}, ${escape(bestKnownFor)},
    ${escape(birthPlace)}, ${escape(politicalBeliefs)}, ${escape(politicalParty)}, ${escape(residence)},
    ${escape(roleDescription)}, ${escape(yearsActive)}, ${escape(deathPlace)}, ${escape(religionDenomination)},
    ${escapeDate(createdAt) || 'NOW()'}, ${escapeDate(updatedAt) || 'NOW()'}
  );\n`;
});

// 3. Organizations
console.log('Processing Organizations...');
const orgs = runSqliteQuery("SELECT id, slug, name, type, description, website, founded, headquarters, createdAt, updatedAt FROM Organization");
orgs.forEach(row => {
  const [id, slug, name, type, description, website, founded, headquarters, createdAt, updatedAt] = row;

  sql += `INSERT INTO "Organization" (
    id, slug, name, type, description, website,
    founded, headquarters, "operatingCountries",
    "createdAt", "updatedAt"
  ) VALUES (
    ${escape(id)}, ${escape(slug)}, ${escape(name)}, '${mapOrganizationType(type)}',
    ${escape(description)}, ${escape(website)},
    ${escapeDate(founded)}, ${escape(headquarters)}, ARRAY[]::text[],
    ${escapeDate(createdAt) || 'NOW()'}, ${escapeDate(updatedAt) || 'NOW()'}
  );\n`;
});

// 4. Incidents
console.log('Processing Incidents...');
const incidents = runSqliteQuery("SELECT id, slug, title, summary, description, incidentDate, publicationDate, status, severity, location, mediaFraming, triggeringEvent, outcome, createdAt, updatedAt FROM Incident");
let incidentCount = 0;
incidents.forEach((row, index) => {
  const [id, slug, title, summary, description, incidentDate, publicationDate, status, severity, location, mediaFraming, triggeringEvent, outcome, createdAt, updatedAt] = row;

  // Debug first incident
  if (index === 0) {
    console.log('  Row length:', row.length);
    console.log('  First 3 fields:', row[0], row[1], row[2]);
    console.log('  Field 5 (incidentDate):', row[5]);
  }

  const severityEnum = severity ?
    (severity.toUpperCase() === 'LOW' ? "'LOW'" :
     severity.toUpperCase() === 'MEDIUM' ? "'MEDIUM'" :
     severity.toUpperCase() === 'HIGH' ? "'HIGH'" :
     severity.toUpperCase() === 'CRITICAL' ? "'CRITICAL'" : 'NULL') : 'NULL';

  // Use a fallback date if incidentDate is invalid
  const dateValue = escapeDate(incidentDate) || escapeDate(publicationDate) || escapeDate(createdAt) || 'NOW()';

  sql += `INSERT INTO "Incident" (
    id, slug, title, summary, description,
    "incidentDate", "publicationDate", status, severity,
    "locationDetail", "mediaFraming", "triggeringEvent", outcome,
    "createdAt", "updatedAt"
  ) VALUES (
    ${escape(id)}, ${escape(slug)}, ${escape(title)}, ${escape(summary)}, ${escape(description)},
    ${dateValue}, ${escapeDate(publicationDate) || 'NOW()'}, 'DOCUMENTED', ${severityEnum}::\"IncidentSeverity\",
    ${escape(location)}, ${escape(mediaFraming)}, ${escape(triggeringEvent)}, ${escape(outcome)},
    ${escapeDate(createdAt) || 'NOW()'}, ${escapeDate(updatedAt) || 'NOW()'}
  );\n`;
  incidentCount++;
});
console.log(`  ✓ Processed ${incidentCount} incidents`);

// 5. Statements (original)
console.log('Processing Statements...');
const statements = runSqliteQuery("SELECT id, content, context, statementDate, medium, isVerified, lostEmployment, lostContracts, paintedNegatively, repercussionDetails, personId, incidentId, createdAt, updatedAt FROM Statement");
statements.forEach(row => {
  const [id, content, context, statementDate, medium, isVerified, lostEmployment, lostContracts, paintedNegatively, repercussionDetails, personId, incidentId, createdAt, updatedAt] = row;

  // Skip statements without incident
  if (!incidentId) {
    console.log(`  ⚠ Skipping statement without incident`);
    return;
  }

  sql += `INSERT INTO "Statement" (
    id, content, context, "statementType", "statementDate",
    medium, "isVerified", "lostEmployment", "lostContracts",
    "paintedNegatively", "repercussionDetails",
    "personId", "incidentId",
    "createdAt", "updatedAt"
  ) VALUES (
    ${escape(id)}, ${escape(content)}, ${escape(context)}, 'ORIGINAL', ${escapeDate(statementDate)},
    ${escape(medium)}, ${isVerified === '1' ? 'true' : 'false'}, ${lostEmployment === '1' ? 'true' : 'false'}, ${lostContracts === '1' ? 'true' : 'false'},
    ${paintedNegatively === '1' ? 'true' : 'false'}, ${escape(repercussionDetails)},
    ${personId ? escape(personId) : 'NULL'}, ${escape(incidentId)},
    ${escapeDate(createdAt) || 'NOW()'}, ${escapeDate(updatedAt) || 'NOW()'}
  );\n`;
});

// 6. Responses (merge into Statements)
console.log('Processing Responses...');
const responses = runSqliteQuery("SELECT id, content, responseDate, type, impact, statementId, personId, organizationId, incidentId, createdAt, updatedAt FROM Response");
responses.forEach(row => {
  const [id, content, responseDate, type, impact, statementId, personId, organizationId, incidentId, createdAt, updatedAt] = row;

  // Skip responses without incident
  if (!incidentId) {
    console.log(`  ⚠ Skipping response without incident`);
    return;
  }

  sql += `INSERT INTO "Statement" (
    id, content, "statementType", "responseType", "statementDate",
    "responseImpact", "respondsToId",
    "personId", "organizationId", "incidentId",
    "createdAt", "updatedAt"
  ) VALUES (
    ${escape('resp_' + id)}, ${escape(content)}, 'RESPONSE', '${mapResponseType(type)}', ${escapeDate(responseDate)},
    ${escape(impact)}, ${statementId ? escape(statementId) : 'NULL'},
    ${personId ? escape(personId) : 'NULL'}, ${organizationId ? escape(organizationId) : 'NULL'}, ${escape(incidentId)},
    ${escapeDate(createdAt) || 'NOW()'}, ${escapeDate(updatedAt) || 'NOW()'}
  );\n`;
});

// 7. Affiliations
console.log('Processing Affiliations...');
const affiliations = runSqliteQuery("SELECT id, role, startDate, endDate, isActive, description, personId, organizationId, createdAt, updatedAt FROM Affiliation");
affiliations.forEach(row => {
  const [id, role, startDate, endDate, isActive, description, personId, organizationId, createdAt, updatedAt] = row;

  sql += `INSERT INTO "Affiliation" (
    id, role, "startDate", "endDate", "isActive",
    description, responsibilities,
    "personId", "organizationId",
    "createdAt", "updatedAt"
  ) VALUES (
    ${escape(id)}, ${escape(role)}, ${escapeDate(startDate)}, ${escapeDate(endDate)}, ${isActive === '1' ? 'true' : 'false'},
    ${escape(description)}, ARRAY[]::text[],
    ${escape(personId)}, ${escape(organizationId)},
    ${escapeDate(createdAt) || 'NOW()'}, ${escapeDate(updatedAt) || 'NOW()'}
  );\n`;
});

// 8. Junction tables
console.log('Processing junction tables...');

// PersonIncidents
const personIncidents = runSqliteQuery("SELECT A, B FROM _PersonIncidents");
personIncidents.forEach(row => {
  const [A, B] = row;
  sql += `INSERT INTO "_PersonIncidents" ("A", "B") VALUES (${escape(A)}, ${escape(B)});\n`;
});

// OrganizationIncidents
const orgIncidents = runSqliteQuery("SELECT A, B FROM _OrganizationIncidents");
orgIncidents.forEach(row => {
  const [A, B] = row;
  sql += `INSERT INTO "_OrganizationIncidents" ("A", "B") VALUES (${escape(A)}, ${escape(B)});\n`;
});

// IncidentTags
const incidentTags = runSqliteQuery("SELECT A, B FROM _IncidentTags");
incidentTags.forEach(row => {
  const [A, B] = row;
  sql += `INSERT INTO "_IncidentTags" ("A", "B") VALUES (${escape(A)}, ${escape(B)});\n`;
});

sql += `
-- Validation queries
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
SELECT 'Affiliation', COUNT(*) FROM "Affiliation";
`;

// Write to file
fs.writeFileSync('migration_v3.sql', sql);
console.log('\n✅ Migration SQL generated: migration_v3.sql');
console.log('Run this command to import the data:');
console.log('psql jaspiz_v3 < migration_v3.sql');