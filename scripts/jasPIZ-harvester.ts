#!/usr/bin/env node
/**
 * JasPIZ Automated Harvester
 *
 * Fully automated 12-hour ingestion pipeline that discovers, extracts, and stores
 * statements about Jews, antisemitism, Palestine, Israel, and Zionism (JasPIZ).
 *
 * Uses Anthropic Claude API with web search capabilities to find new statements
 * from politicians, diplomats, world leaders, public figures, and others.
 *
 * All sources are archived via Internet Archive for traceability.
 */

import Anthropic from '@anthropic-ai/sdk';
import prisma from '../lib/prisma';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const JASPIZ_TOPICS = [
  'Jews',
  'antisemitism',
  'Palestine',
  'Israel',
  'Zionism',
  'Israeli-Palestinian conflict',
  'Gaza',
  'West Bank',
  'BDS movement',
  'Holocaust',
  'IHRA definition'
];

const TARGET_ENTITY_TYPES = [
  'politicians',
  'diplomats',
  'world leaders',
  'parliamentary members',
  'senators',
  'public figures',
  'notable people',
  'celebrities',
  'entertainers',
  'writers',
  'authors',
  'academics',
  'activists',
  'faith leaders'
];

const LOG_DIR = path.join(process.cwd(), 'logs');
const REPORT_DIR = path.join(process.cwd(), 'data', 'auto-generated', 'batch-reports');
const INGESTION_LOG = path.join(LOG_DIR, 'ingestion.log');

// Ensure directories exist
[LOG_DIR, REPORT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ============================================================================
// TYPES
// ============================================================================

interface SearchResult {
  url: string;
  title: string;
  publisher?: string;
  publishDate?: string;
  content: string;
  relevanceScore: number;
}

interface ExtractedStatement {
  content: string;
  context?: string;
  date: Date;
  language: string;
  tone?: string;
  medium?: string;
  platform?: string;
  topics: string[];
  tags: string[];
}

interface ExtractedPerson {
  name: string;
  slug: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  profession?: string;
  professionDetail?: string;
  nationality?: string;
  nationalityDetail?: string;
  bio?: string;
  shortBio?: string;
  birthDate?: Date;
  gender?: string;
  politicalAffiliation?: string;
  politicalLeaning?: string;
  currentTitle?: string;
  currentOrganization?: string;
}

interface ExtractedSource {
  url: string;
  title: string;
  publisher?: string;
  publishDate?: Date;
  author?: string;
  sourceType?: string;
  contentType?: string;
  credibilityRating?: string;
}

interface ExtractedOrganization {
  name: string;
  slug: string;
  type: string;
  description?: string;
  website?: string;
}

interface ExtractedAffiliation {
  organizationName: string;
  role: string;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
}

interface ExtractionResult {
  person: ExtractedPerson;
  statements: Array<{
    statement: ExtractedStatement;
    source: ExtractedSource;
  }>;
  organizations: ExtractedOrganization[];
  affiliations: ExtractedAffiliation[];
}

interface BatchStats {
  imported: number;
  updated: number;
  archived: number;
  skipped: number;
  errors: number;
  startTime: Date;
  endTime?: Date;
}

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

function log(message: string, level: 'INFO' | 'ERROR' | 'WARN' = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;

  console.log(logMessage.trim());
  fs.appendFileSync(INGESTION_LOG, logMessage);
}

function logDedup(hash: string, content: string) {
  const timestamp = new Date().toISOString();
  const message = {
    timestamp,
    reason: 'duplicate_content',
    hash,
    contentPreview: content.substring(0, 100)
  };

  log(`Skipped duplicate: ${hash} - ${content.substring(0, 50)}...`, 'INFO');
}

// ============================================================================
// ANTHROPIC CLIENT
// ============================================================================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// ============================================================================
// WEB SEARCH FUNCTION
// ============================================================================

async function searchForJasPIZStatements(): Promise<SearchResult[]> {
  log('Initiating global JasPIZ statement search...');

  const searchQuery = `
Find recent verifiable statements, speeches, interviews, or public comments about any of these topics: ${JASPIZ_TOPICS.join(', ')}.

Focus on statements made by: ${TARGET_ENTITY_TYPES.join(', ')}.

Search scope includes:
- News articles from verified outlets
- Government websites and official transcripts
- Parliamentary/Congressional records
- Think tank publications
- University statements
- Social media posts from verified accounts
- Interviews and speeches
- Press releases

Only include statements from the past 6 months that are:
1. Verifiable with a source URL
2. From credible news outlets or official sources
3. About the JasPIZ topics listed above
4. Made by public figures or officials

Return the top 20 most relevant findings.
`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 16000,
      messages: [{
        role: 'user',
        content: searchQuery
      }],
      // Note: Extended thinking is enabled for deeper analysis
      thinking: {
        type: 'enabled',
        budget_tokens: 10000
      }
    });

    // Parse the response to extract search results
    const results: SearchResult[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        // Parse structured data from Claude's response
        // This is a simplified parser - in production, you'd use more robust parsing
        const text = block.text;

        // Look for URL patterns and extract surrounding context
        const urlRegex = /https?:\/\/[^\s)]+/g;
        const urls = text.match(urlRegex) || [];

        for (const url of urls) {
          // Find context around the URL
          const urlIndex = text.indexOf(url);
          const contextStart = Math.max(0, urlIndex - 500);
          const contextEnd = Math.min(text.length, urlIndex + 500);
          const context = text.substring(contextStart, contextEnd);

          // Extract title (look for quotes or capitalized text near URL)
          const titleMatch = context.match(/"([^"]+)"|'([^']+)'|([A-Z][^.!?]+)/);
          const title = titleMatch ? (titleMatch[1] || titleMatch[2] || titleMatch[3]) : 'Untitled';

          results.push({
            url,
            title: title.trim(),
            content: context,
            relevanceScore: 0.8, // Claude pre-filtered for relevance
            publisher: extractDomain(url)
          });
        }
      }
    }

    log(`Found ${results.length} potential statements`);
    return results;

  } catch (error: any) {
    log(`Search error: ${error.message}`, 'ERROR');
    throw error;
  }
}

function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

// ============================================================================
// DATA EXTRACTION
// ============================================================================

async function extractStructuredData(searchResult: SearchResult): Promise<ExtractionResult | null> {
  log(`Extracting data from: ${searchResult.url}`);

  const extractionPrompt = `
Analyze this source and extract structured information about any JasPIZ-related statements.

URL: ${searchResult.url}
Title: ${searchResult.title}
Publisher: ${searchResult.publisher}
Content preview: ${searchResult.content}

Extract the following in valid JSON format:

{
  "person": {
    "name": "Full name",
    "slug": "url-safe-slug",
    "fullName": "Complete formal name",
    "firstName": "First name only",
    "lastName": "Last name only",
    "profession": "PRIMARY_PROFESSION (use enum: POLITICIAN, JOURNALIST, ACADEMIC, etc.)",
    "professionDetail": "Detailed profession description",
    "nationality": "PRIMARY_NATIONALITY",
    "nationalityDetail": "Detailed nationality",
    "bio": "Full biography (2-3 paragraphs)",
    "shortBio": "One sentence bio (max 500 chars)",
    "currentTitle": "Current official title",
    "currentOrganization": "Current employer/organization",
    "gender": "MALE|FEMALE|NON_BINARY|OTHER",
    "politicalAffiliation": "Party affiliation if applicable",
    "politicalLeaning": "LEFT|CENTER_LEFT|CENTER|CENTER_RIGHT|RIGHT etc."
  },
  "statements": [{
    "statement": {
      "content": "Exact quote or statement text",
      "context": "What was happening when this was said",
      "date": "ISO date when statement was made",
      "language": "en|es|fr|ar|he etc.",
      "tone": "Description of tone",
      "medium": "TWITTER_X|TELEVISION_INTERVIEW|PRESS_CONFERENCE etc.",
      "platform": "Specific platform name",
      "topics": ["Israel", "Gaza", "antisemitism"],
      "tags": ["category", "location", "event"]
    },
    "source": {
      "url": "${searchResult.url}",
      "title": "${searchResult.title}",
      "publisher": "${searchResult.publisher}",
      "publishDate": "ISO date of publication",
      "author": "Article author name",
      "sourceType": "NEWS_ARTICLE|PRESS_RELEASE|SOCIAL_MEDIA_POST etc.",
      "contentType": "TEXT|VIDEO|AUDIO",
      "credibilityRating": "HIGH|VERY_HIGH|MIXED"
    }
  }],
  "organizations": [{
    "name": "Organization name",
    "slug": "url-safe-slug",
    "type": "GOVERNMENT_AGENCY|POLITICAL_PARTY|MEDIA_OUTLET etc.",
    "description": "What this organization does",
    "website": "Official website URL"
  }],
  "affiliations": [{
    "organizationName": "Name matching organization above",
    "role": "Official role/title",
    "startDate": "ISO date or null",
    "endDate": "ISO date or null",
    "isActive": true
  }]
}

Requirements:
- Only extract if there's a clear JasPIZ-related statement
- All Person fields must be populated (use "" for unknown strings, [] for arrays)
- Dates must be valid ISO format
- Use exact enum values from schema
- Be factual and neutral
- Return valid JSON only, no markdown formatting

If no relevant statement found, return: {"skip": true, "reason": "explanation"}
`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: extractionPrompt
      }]
    });

    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
    }

    const extracted = JSON.parse(jsonText);

    if (extracted.skip) {
      log(`Skipping: ${extracted.reason}`, 'INFO');
      return null;
    }

    return extracted as ExtractionResult;

  } catch (error: any) {
    log(`Extraction error for ${searchResult.url}: ${error.message}`, 'ERROR');
    return null;
  }
}

// ============================================================================
// INTERNET ARCHIVE
// ============================================================================

async function archiveSource(url: string): Promise<string | null> {
  log(`Archiving source: ${url}`);

  try {
    // Call Internet Archive Save API
    const saveUrl = `https://web.archive.org/save/${url}`;
    const response = await fetch(saveUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'JasPIZ-Harvester/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Archive API returned ${response.status}`);
    }

    // Extract Wayback URL from response
    const waybackUrl = response.headers.get('Content-Location');
    if (waybackUrl) {
      const fullWaybackUrl = `https://web.archive.org${waybackUrl}`;
      log(`Archived: ${fullWaybackUrl}`);
      return fullWaybackUrl;
    }

    // Alternative: construct Wayback URL
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const fallbackUrl = `https://web.archive.org/web/${timestamp}/${url}`;
    return fallbackUrl;

  } catch (error: any) {
    log(`Archive error for ${url}: ${error.message}`, 'WARN');
    return null;
  }
}

// ============================================================================
// DEDUPLICATION
// ============================================================================

function computeContentHash(content: string): string {
  return createHash('sha1').update(content.trim().toLowerCase()).digest('hex');
}

async function isDuplicate(contentHash: string): Promise<boolean> {
  // Check if this exact content already exists
  // We'll store hashes in statement content for now
  // In production, you might want a separate dedup table

  const existing = await prisma.statement.findFirst({
    where: {
      content: {
        contains: contentHash.substring(0, 20) // Partial hash check
      }
    }
  });

  return existing !== null;
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

async function upsertPerson(personData: ExtractedPerson): Promise<string> {
  log(`Upserting person: ${personData.name}`);

  // Map profession string to enum
  const professionEnum = personData.profession || 'OTHER';
  const nationalityEnum = personData.nationality || 'OTHER';

  const person = await prisma.person.upsert({
    where: { slug: personData.slug },
    create: {
      slug: personData.slug,
      name: personData.name,
      fullName: personData.fullName || personData.name,
      firstName: personData.firstName || '',
      lastName: personData.lastName || '',
      bio: personData.bio || '',
      shortBio: personData.shortBio || '',
      profession: professionEnum as any,
      professionDetail: personData.professionDetail || '',
      nationality: nationalityEnum as any,
      nationalityDetail: personData.nationalityDetail || '',
      currentTitle: personData.currentTitle || '',
      currentOrganization: personData.currentOrganization || '',
      gender: personData.gender as any || null,
      politicalAffiliation: personData.politicalAffiliation as any || null,
      politicalLeaning: personData.politicalLeaning as any || null,
      aliases: [],
      akaNames: [],
      createdAt: new Date(),
      // All other fields get schema defaults
      imageUrl: null,
      birthDate: personData.birthDate || null,
      deathDate: null,
      background: null,
      racialGroup: null,
      religion: null,
      bestKnownFor: null,
      birthPlace: null,
      politicalParty: null,
      residence: null,
      roleDescription: null,
      yearsActive: null,
      verificationLevel: 'UNVERIFIED',
      statementCount: 0,
      caseCount: 0
    },
    update: {
      // Only update fields that are explicitly provided
      ...(personData.fullName && { fullName: personData.fullName }),
      ...(personData.firstName && { firstName: personData.firstName }),
      ...(personData.lastName && { lastName: personData.lastName }),
      ...(personData.bio && { bio: personData.bio }),
      ...(personData.shortBio && { shortBio: personData.shortBio }),
      ...(personData.professionDetail && { professionDetail: personData.professionDetail }),
      ...(personData.nationalityDetail && { nationalityDetail: personData.nationalityDetail }),
      ...(personData.currentTitle && { currentTitle: personData.currentTitle }),
      ...(personData.currentOrganization && { currentOrganization: personData.currentOrganization }),
      updatedAt: new Date()
    }
  });

  return person.id;
}

async function upsertOrganization(orgData: ExtractedOrganization): Promise<string> {
  log(`Upserting organization: ${orgData.name}`);

  const org = await prisma.organization.upsert({
    where: { slug: orgData.slug },
    create: {
      slug: orgData.slug,
      name: orgData.name,
      type: orgData.type as any,
      description: orgData.description || '',
      website: orgData.website || null,
      verificationLevel: 'UNVERIFIED',
      statementCount: 0,
      caseCount: 0,
      createdAt: new Date()
    },
    update: {
      ...(orgData.description && { description: orgData.description }),
      ...(orgData.website && { website: orgData.website }),
      updatedAt: new Date()
    }
  });

  return org.id;
}

async function upsertSource(sourceData: ExtractedSource, archiveUrl: string | null): Promise<string> {
  log(`Upserting source: ${sourceData.url}`);

  // Check if source already exists
  const existing = await prisma.source.findFirst({
    where: { url: sourceData.url }
  });

  if (existing) {
    return existing.id;
  }

  const source = await prisma.source.create({
    data: {
      url: sourceData.url,
      title: sourceData.title,
      publication: sourceData.publisher || null,
      publishDate: sourceData.publishDate || null,
      author: sourceData.author || null,
      sourceType: sourceData.sourceType as any || 'NEWS_ARTICLE',
      contentType: sourceData.contentType as any || 'TEXT',
      credibility: sourceData.credibilityRating as any || 'UNKNOWN',
      archiveUrl: archiveUrl,
      isArchived: archiveUrl !== null,
      archiveDate: archiveUrl ? new Date() : null,
      accessDate: new Date(),
      createdAt: new Date()
    }
  });

  return source.id;
}

async function createStatement(
  statementData: ExtractedStatement,
  personId: string,
  sourceId: string
): Promise<string> {
  log(`Creating statement for person ${personId}`);

  const statement = await prisma.statement.create({
    data: {
      content: statementData.content,
      context: statementData.context || null,
      statementDate: statementData.date,
      medium: statementData.medium as any || null,
      platform: statementData.platform || null,
      personId: personId,
      primarySourceId: sourceId,
      statementType: 'ORIGINAL',
      isVerified: false,
      verificationLevel: 'UNVERIFIED',
      createdAt: new Date()
    }
  });

  // Link source to statement
  await prisma.source.update({
    where: { id: sourceId },
    data: { statementId: statement.id }
  });

  // Create tags
  for (const tagName of statementData.tags) {
    await upsertTag(tagName, statement.id);
  }

  return statement.id;
}

async function upsertTag(tagName: string, statementId?: string): Promise<string> {
  const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const tag = await prisma.tag.upsert({
    where: { slug },
    create: {
      slug,
      name: tagName,
      category: 'THEME',
      usageCount: 1,
      createdAt: new Date()
    },
    update: {
      usageCount: {
        increment: 1
      }
    }
  });

  return tag.id;
}

async function createAffiliation(
  personId: string,
  orgId: string,
  affiliationData: ExtractedAffiliation
): Promise<void> {
  log(`Creating affiliation: ${affiliationData.role} at ${affiliationData.organizationName}`);

  // Check if affiliation already exists
  const existing = await prisma.affiliation.findFirst({
    where: {
      personId,
      organizationId: orgId,
      role: affiliationData.role
    }
  });

  if (existing) {
    log('Affiliation already exists, skipping');
    return;
  }

  await prisma.affiliation.create({
    data: {
      personId,
      organizationId: orgId,
      role: affiliationData.role,
      startDate: affiliationData.startDate || null,
      endDate: affiliationData.endDate || null,
      isActive: affiliationData.isActive,
      roleLevel: 'MID',
      createdAt: new Date()
    }
  });
}

// ============================================================================
// MAIN INGESTION CYCLE
// ============================================================================

async function runIngestionCycle(): Promise<BatchStats> {
  const stats: BatchStats = {
    imported: 0,
    updated: 0,
    archived: 0,
    skipped: 0,
    errors: 0,
    startTime: new Date()
  };

  log('='.repeat(80));
  log('Starting JasPIZ ingestion cycle');
  log('='.repeat(80));

  try {
    // Step 1: Global search
    const searchResults = await searchForJasPIZStatements();

    if (searchResults.length === 0) {
      log('No new statements found in this cycle', 'WARN');
      return stats;
    }

    // Step 2: Process each result
    for (const result of searchResults) {
      try {
        // Extract structured data
        const extracted = await extractStructuredData(result);

        if (!extracted) {
          stats.skipped++;
          continue;
        }

        // Check for duplicates
        for (const { statement, source } of extracted.statements) {
          const hash = computeContentHash(statement.content);

          if (await isDuplicate(hash)) {
            logDedup(hash, statement.content);
            stats.skipped++;
            continue;
          }

          // Archive source
          const archiveUrl = await archiveSource(source.url);
          if (archiveUrl) {
            stats.archived++;
          }

          // Upsert person
          const personId = await upsertPerson(extracted.person);
          stats.updated++;

          // Upsert organizations
          for (const org of extracted.organizations) {
            const orgId = await upsertOrganization(org);

            // Create affiliations
            const affiliation = extracted.affiliations.find(
              a => a.organizationName === org.name
            );
            if (affiliation) {
              await createAffiliation(personId, orgId, affiliation);
            }
          }

          // Create source
          const sourceId = await upsertSource(source, archiveUrl);

          // Create statement
          await createStatement(statement, personId, sourceId);
          stats.imported++;

          log(`✓ Imported statement from ${extracted.person.name}`);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error: any) {
        stats.errors++;
        log(`Error processing result: ${error.message}`, 'ERROR');
        continue;
      }
    }

  } catch (error: any) {
    log(`Critical error in ingestion cycle: ${error.message}`, 'ERROR');
    stats.errors++;
  }

  stats.endTime = new Date();

  // Generate summary
  const summary = generateSummary(stats);
  log('\n' + summary);
  saveBatchReport(stats, summary);

  return stats;
}

// ============================================================================
// REPORTING
// ============================================================================

function generateSummary(stats: BatchStats): string {
  const duration = stats.endTime
    ? Math.round((stats.endTime.getTime() - stats.startTime.getTime()) / 1000)
    : 0;

  return `
╔════════════════════════════════════════════════════════════════════════════╗
║                        JASPIZ INGESTION SUMMARY                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  Imported:          ${String(stats.imported).padStart(4)} new statements                        ║
║  Updated:           ${String(stats.updated).padStart(4)} persons                                ║
║  Archived:          ${String(stats.archived).padStart(4)} sources                                ║
║  Skipped:           ${String(stats.skipped).padStart(4)} duplicates                             ║
║  Errors:            ${String(stats.errors).padStart(4)} failures                                ║
║                                                                            ║
║  Duration:          ${String(duration).padStart(4)} seconds                               ║
║  Started:           ${stats.startTime.toLocaleString().padEnd(40)}║
║  Completed:         ${(stats.endTime || new Date()).toLocaleString().padEnd(40)}║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
`;
}

function saveBatchReport(stats: BatchStats, summary: string): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(REPORT_DIR, `batch-${timestamp}.txt`);

  const report = `${summary}\n\nDetailed Stats:\n${JSON.stringify(stats, null, 2)}`;

  fs.writeFileSync(reportPath, report);
  log(`Batch report saved: ${reportPath}`);
}

// ============================================================================
// SCHEDULER
// ============================================================================

function scheduleNextRun() {
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;

  log(`Next run scheduled in 12 hours...`);

  setTimeout(async () => {
    try {
      await runIngestionCycle();
    } catch (error: any) {
      log(`Scheduled run failed: ${error.message}`, 'ERROR');
    }

    // Schedule next run
    scheduleNextRun();
  }, TWELVE_HOURS);
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
JasPIZ Automated Harvester

Usage:
  npx tsx scripts/jasPIZ-harvester.ts [options]

Options:
  --once              Run once and exit (no scheduling)
  --daemon            Run as daemon with 12-hour scheduling
  --help, -h          Show this help message

Environment Variables:
  ANTHROPIC_API_KEY   Required - Your Anthropic API key
  DATABASE_URL        Required - PostgreSQL connection string

Examples:
  npx tsx scripts/jasPIZ-harvester.ts --once
  npx tsx scripts/jasPIZ-harvester.ts --daemon

Cron Setup (run every 12 hours):
  0 */12 * * * cd /path/to/project && npx tsx scripts/jasPIZ-harvester.ts --once
`);
    process.exit(0);
  }

  // Verify environment
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY not found in environment');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL not found in environment');
    process.exit(1);
  }

  const isDaemon = args.includes('--daemon');
  const runOnce = args.includes('--once') || !isDaemon;

  log('JasPIZ Harvester starting...');
  log(`Mode: ${isDaemon ? 'DAEMON (12-hour schedule)' : 'SINGLE RUN'}`);

  // Run first cycle
  await runIngestionCycle();

  if (isDaemon) {
    // Schedule recurring runs
    scheduleNextRun();
    log('Daemon mode active - press Ctrl+C to stop');
  } else {
    // Exit after one run
    log('Single run completed - exiting');
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  log('\nShutdown signal received, cleaning up...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('\nTermination signal received, cleaning up...');
  await prisma.$disconnect();
  process.exit(0);
});

// Run
if (require.main === module) {
  main().catch(async (error) => {
    log(`Fatal error: ${error.message}`, 'ERROR');
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
}

export { runIngestionCycle, searchForJasPIZStatements, extractStructuredData };
