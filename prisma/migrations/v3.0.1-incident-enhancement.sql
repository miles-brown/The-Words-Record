-- ===============================================
-- INCIDENT ENHANCEMENT v3.0.1
-- ===============================================

-- Step 1: Create Event table for legacy support
CREATE TABLE IF NOT EXISTS "Event" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "startDate" TIMESTAMPTZ,
  "endDate" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS idx_event_slug ON "Event"("slug");

-- Step 2: Add new columns to Incident
ALTER TABLE "Incident"
-- Content enhancements
ADD COLUMN IF NOT EXISTS "subtitle" TEXT,
ADD COLUMN IF NOT EXISTS "contentLanguage" TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS "translationAvailable" BOOLEAN DEFAULT false,

-- Temporal enhancements
ADD COLUMN IF NOT EXISTS "incidentEndDate" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "timeOfDay" TEXT,
ADD COLUMN IF NOT EXISTS "timezone" TEXT,
ADD COLUMN IF NOT EXISTS "duration" TEXT,

-- Classification
ADD COLUMN IF NOT EXISTS "incidentType" "IncidentType",
ADD COLUMN IF NOT EXISTS "incidentCategory" "IncidentCategory",
ADD COLUMN IF NOT EXISTS "verificationLevel" "VerificationLevel" DEFAULT 'UNVERIFIED',

-- Severity (update existing)
ADD COLUMN IF NOT EXISTS "severityScore" FLOAT,
ADD COLUMN IF NOT EXISTS "impactScope" "ImpactScope" DEFAULT 'LOCAL',
ADD COLUMN IF NOT EXISTS "affectedCount" INTEGER,

-- Impact flags
ADD COLUMN IF NOT EXISTS "hasEmploymentImpact" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "hasLegalImpact" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "hasReputationalImpact" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "hasPlatformImpact" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "hasFinancialImpact" BOOLEAN DEFAULT false,

-- Enhanced location
ADD COLUMN IF NOT EXISTS "locationName" TEXT,
ADD COLUMN IF NOT EXISTS "locationType" "LocationType",
ADD COLUMN IF NOT EXISTS "locationAddress" TEXT,
ADD COLUMN IF NOT EXISTS "locationCoordinates" TEXT,
ADD COLUMN IF NOT EXISTS "isOnline" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "isInPerson" BOOLEAN DEFAULT true,

-- Topics and Events
ADD COLUMN IF NOT EXISTS "primaryTopicId" TEXT,
ADD COLUMN IF NOT EXISTS "parentEventId" TEXT,

-- Trigger
ADD COLUMN IF NOT EXISTS "triggerType" "TriggerType",
ADD COLUMN IF NOT EXISTS "triggeringStatementId" TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS "contextualBackground" TEXT,

-- Resolution
ADD COLUMN IF NOT EXISTS "outcomeDate" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "resolutionStatus" "ResolutionStatus" DEFAULT 'ONGOING',

-- Repercussions
ADD COLUMN IF NOT EXISTS "hasRepercussions" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "repercussionCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "primaryRepercussionType" "RepercussionType",
ADD COLUMN IF NOT EXISTS "repercussionSeverity" "RepercussionSeverity",

-- Participants
ADD COLUMN IF NOT EXISTS "primaryPersonId" TEXT,
ADD COLUMN IF NOT EXISTS "primaryOrgId" TEXT,
ADD COLUMN IF NOT EXISTS "statementCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "responseCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "supportCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "criticismCount" INTEGER DEFAULT 0,

-- Sources
ADD COLUMN IF NOT EXISTS "primarySourceId" TEXT,
ADD COLUMN IF NOT EXISTS "sourceCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "hasVideo" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "hasAudio" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "hasDocuments" BOOLEAN DEFAULT false,

-- Media coverage
ADD COLUMN IF NOT EXISTS "mediaOutletCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "articleCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "wasFrontPage" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "wasInternationalNews" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "firstReportedDate" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "peakCoverageDate" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "coverageDuration" TEXT,

-- Social media
ADD COLUMN IF NOT EXISTS "wentViral" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "viralPlatform" TEXT,
ADD COLUMN IF NOT EXISTS "estimatedReach" INTEGER,
ADD COLUMN IF NOT EXISTS "hashtagsUsed" TEXT[],

-- Controversy
ADD COLUMN IF NOT EXISTS "isControversial" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "isDisputed" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "disputeNotes" TEXT,
ADD COLUMN IF NOT EXISTS "narrativeDisputes" TEXT[],
ADD COLUMN IF NOT EXISTS "primaryNarrative" TEXT,
ADD COLUMN IF NOT EXISTS "counterNarrative" TEXT,

-- Flags
ADD COLUMN IF NOT EXISTS "contentWarning" TEXT,
ADD COLUMN IF NOT EXISTS "isSensitive" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "isGraphic" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "requiresContext" BOOLEAN DEFAULT false,

-- Metadata tracking
ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "isPinned" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "editorialNotes" TEXT,
ADD COLUMN IF NOT EXISTS "internalNotes" TEXT,
ADD COLUMN IF NOT EXISTS "qualityScore" FLOAT,
ADD COLUMN IF NOT EXISTS "lastReviewDate" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "reviewedBy" TEXT,
ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
ADD COLUMN IF NOT EXISTS "lastEditedBy" TEXT;

-- Step 3: Add foreign key constraints
ALTER TABLE "Incident"
ADD CONSTRAINT fk_incident_parent_event FOREIGN KEY ("parentEventId")
  REFERENCES "Event"("id") ON DELETE SET NULL,
ADD CONSTRAINT fk_incident_triggering_statement FOREIGN KEY ("triggeringStatementId")
  REFERENCES "Statement"("id") ON DELETE SET NULL;

-- Step 4: Calculate severity scores based on existing severity
UPDATE "Incident"
SET "severityScore" = CASE severity
  WHEN 'CRITICAL' THEN 90
  WHEN 'HIGH' THEN 70
  WHEN 'MEDIUM' THEN 50
  WHEN 'LOW' THEN 30
  WHEN 'MINIMAL' THEN 10
  ELSE 50
END
WHERE "severityScore" IS NULL;

-- Step 5: Infer incident types from existing data
UPDATE "Incident"
SET "incidentType" = CASE
  WHEN title ILIKE '%fired%' OR title ILIKE '%terminated%'
    OR title ILIKE '%dismissed%' THEN 'EMPLOYMENT_ACTION'
  WHEN title ILIKE '%lawsuit%' OR title ILIKE '%sued%'
    OR title ILIKE '%charges%' THEN 'LEGAL_ACTION'
  WHEN title ILIKE '%protest%' OR title ILIKE '%demonstrat%' THEN 'PROTEST_ACTION'
  WHEN title ILIKE '%banned%' OR title ILIKE '%suspended%'
    OR title ILIKE '%deplatform%' THEN 'PLATFORM_ACTION'
  WHEN title ILIKE '%statement%' OR title ILIKE '%comment%'
    OR title ILIKE '%said%' THEN 'STATEMENT_CONTROVERSY'
  WHEN title ILIKE '%boycott%' THEN 'BOYCOTT_CAMPAIGN'
  WHEN title ILIKE '%investigat%' THEN 'INVESTIGATION'
  WHEN title ILIKE '%harass%' OR title ILIKE '%threat%' THEN 'HARASSMENT_CAMPAIGN'
  WHEN title ILIKE '%violence%' OR title ILIKE '%attack%'
    OR title ILIKE '%assault%' THEN 'VIOLENCE_INCIDENT'
  ELSE NULL
END
WHERE "incidentType" IS NULL;

-- Step 6: Infer incident categories
UPDATE "Incident"
SET "incidentCategory" = CASE
  WHEN title ILIKE '%antisemit%' OR description ILIKE '%antisemit%'
    THEN 'ANTISEMITISM_ALLEGATION'
  WHEN title ILIKE '%islamophob%' OR description ILIKE '%islamophob%'
    THEN 'ISLAMOPHOBIA_ALLEGATION'
  WHEN title ILIKE '%free speech%' OR title ILIKE '%freedom of speech%'
    THEN 'FREE_SPEECH'
  WHEN title ILIKE '%academic freedom%' THEN 'ACADEMIC_FREEDOM'
  WHEN title ILIKE '%censor%' THEN 'CENSORSHIP'
  WHEN title ILIKE '%cancel%' THEN 'CANCEL_CULTURE'
  WHEN title ILIKE '%hate speech%' THEN 'HATE_SPEECH'
  WHEN title ILIKE '%discriminat%' THEN 'DISCRIMINATION'
  ELSE NULL
END
WHERE "incidentCategory" IS NULL;

-- Step 7: Parse location information
UPDATE "Incident"
SET
  "locationName" = COALESCE("locationDetail",
    CONCAT_WS(', ', "locationCity", "locationState", "locationCountry")),
  "isOnline" = CASE
    WHEN "locationDetail" ILIKE '%online%'
      OR "locationDetail" ILIKE '%twitter%'
      OR "locationDetail" ILIKE '%social media%' THEN true
    ELSE false
  END,
  "locationType" = CASE
    WHEN "locationDetail" ILIKE '%universit%'
      OR "locationDetail" ILIKE '%campus%' THEN 'UNIVERSITY'
    WHEN "locationDetail" ILIKE '%online%'
      OR "locationDetail" ILIKE '%twitter%' THEN 'ONLINE'
    WHEN "locationDetail" ILIKE '%parliament%'
      OR "locationDetail" ILIKE '%congress%' THEN 'GOVERNMENT_BUILDING'
    WHEN "locationDetail" ILIKE '%workplace%'
      OR "locationDetail" ILIKE '%office%' THEN 'WORKPLACE'
    ELSE NULL
  END::"LocationType"
WHERE "locationName" IS NULL;

-- Step 8: Calculate impact flags based on repercussions
UPDATE "Incident" i
SET
  "hasRepercussions" = EXISTS (
    SELECT 1 FROM "Repercussion" WHERE "incidentId" = i.id
  ),
  "repercussionCount" = (
    SELECT COUNT(*) FROM "Repercussion" WHERE "incidentId" = i.id
  );

-- Step 9: Update counts from relationships
UPDATE "Incident" i
SET
  "statementCount" = (
    SELECT COUNT(*) FROM "Statement" WHERE "incidentId" = i.id
  ),
  "sourceCount" = (
    SELECT COUNT(*) FROM "Source" WHERE "incidentId" = i.id
  ),
  "responseCount" = (
    SELECT COUNT(*) FROM "Statement"
    WHERE "incidentId" = i.id AND "statementType" = 'RESPONSE'
  ),
  "supportCount" = (
    SELECT COUNT(*) FROM "Statement"
    WHERE "incidentId" = i.id
      AND "statementType" = 'RESPONSE'
      AND "responseType" IN ('SUPPORT', 'DEFENSE', 'ENDORSEMENT')
  ),
  "criticismCount" = (
    SELECT COUNT(*) FROM "Statement"
    WHERE "incidentId" = i.id
      AND "statementType" = 'RESPONSE'
      AND "responseType" IN ('CRITICISM', 'CONDEMNATION', 'DENUNCIATION')
  );

-- Step 10: Set impact flags based on repercussion types
UPDATE "Incident" i
SET
  "hasEmploymentImpact" = EXISTS (
    SELECT 1 FROM "Repercussion" r
    WHERE r."incidentId" = i.id
      AND r."repercussionType" IN (
        'TERMINATION', 'SUSPENSION', 'CONTRACT_CANCELLATION',
        'RESIGNATION', 'RESIGNATION_FORCED', 'DEMOTION'
      )
  ),
  "hasLegalImpact" = EXISTS (
    SELECT 1 FROM "Repercussion" r
    WHERE r."incidentId" = i.id
      AND r."repercussionType" IN (
        'LEGAL_ACTION', 'INVESTIGATION', 'ARREST', 'CRIMINAL_CHARGES'
      )
  ),
  "hasReputationalImpact" = EXISTS (
    SELECT 1 FROM "Repercussion" r
    WHERE r."incidentId" = i.id
      AND r."repercussionType" IN (
        'PUBLIC_CRITICISM', 'CONDEMNATION', 'CENSURE', 'SMEAR_CAMPAIGN'
      )
  ),
  "hasPlatformImpact" = EXISTS (
    SELECT 1 FROM "Repercussion" r
    WHERE r."incidentId" = i.id
      AND r."repercussionType" IN (
        'PLATFORM_BAN', 'CONTENT_REMOVAL', 'ACCOUNT_SUSPENSION',
        'DEMONETIZATION', 'DEPLATFORMING'
      )
  ),
  "hasFinancialImpact" = EXISTS (
    SELECT 1 FROM "Repercussion" r
    WHERE r."incidentId" = i.id
      AND r."repercussionType" IN (
        'FINANCIAL_LOSS', 'FUNDING_WITHDRAWN', 'SPONSORSHIP_LOST',
        'DEMONETIZATION', 'CONTRACT_CANCELLATION'
      )
  );

-- Step 11: Identify controversial incidents
UPDATE "Incident"
SET "isControversial" = true
WHERE ("responseCount" > 10 OR "severity" IN ('HIGH', 'CRITICAL'))
  AND "isControversial" = false;

-- Step 12: Add new indexes
CREATE INDEX IF NOT EXISTS idx_incident_type_cat
  ON "Incident"("incidentType", "incidentCategory");
CREATE INDEX IF NOT EXISTS idx_incident_location
  ON "Incident"("locationCountry", "locationCity");
CREATE INDEX IF NOT EXISTS idx_incident_repercussions
  ON "Incident"("hasRepercussions");
CREATE INDEX IF NOT EXISTS idx_incident_controversial
  ON "Incident"("isControversial");
CREATE INDEX IF NOT EXISTS idx_incident_featured
  ON "Incident"("isFeatured");
CREATE INDEX IF NOT EXISTS idx_incident_topic
  ON "Incident"("primaryTopicId");
CREATE INDEX IF NOT EXISTS idx_incident_resolution
  ON "Incident"("resolutionStatus");
CREATE INDEX IF NOT EXISTS idx_incident_impact
  ON "Incident"("hasEmploymentImpact", "hasLegalImpact", "hasReputationalImpact");
CREATE INDEX IF NOT EXISTS idx_incident_date_status
  ON "Incident"("incidentDate", "status");
CREATE INDEX IF NOT EXISTS idx_incident_viral
  ON "Incident"("wentViral", "viralPlatform");