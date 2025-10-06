-- ===============================================
-- AFFILIATION ENHANCEMENT v3.0.1
-- ===============================================

-- Step 1: Create new enum types for Affiliation
CREATE TYPE "RoleCategory" AS ENUM (
  'EXECUTIVE_LEADERSHIP', 'BOARD_MEMBER',
  'EDITORIAL_LEADERSHIP', 'EDITORIAL_STAFF', 'MEDIA_PERSONALITY',
  'ELECTED_OFFICIAL', 'APPOINTED_OFFICIAL', 'POLITICAL_STAFF',
  'ACADEMIC_LEADERSHIP', 'ACADEMIC_FACULTY', 'RESEARCH',
  'LEGAL_LEADERSHIP', 'LEGAL_PRACTITIONER',
  'NGO_LEADERSHIP', 'NGO_STAFF',
  'CONSULTANT', 'EMPLOYEE', 'CONTRACTOR',
  'MEMBER', 'VOLUNTEER', 'HONORARY'
);

CREATE TYPE "AffiliationType" AS ENUM (
  'EMPLOYMENT', 'BOARD_POSITION', 'MEMBERSHIP', 'FELLOWSHIP',
  'CONSULTANCY', 'ADVISORY', 'HONORARY', 'VOLUNTEER',
  'INTERNSHIP', 'POLITICAL_APPOINTMENT', 'ELECTED_POSITION'
);

CREATE TYPE "EmploymentStatus" AS ENUM (
  'FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE',
  'PER_DIEM', 'SEASONAL', 'TEMPORARY'
);

CREATE TYPE "AppointmentType" AS ENUM (
  'ELECTED', 'APPOINTED', 'HIRED',
  'VOLUNTEER_SELECTED', 'NOMINATED', 'HEREDITARY'
);

CREATE TYPE "DepartureReason" AS ENUM (
  'RESIGNED', 'RETIRED', 'CAREER_CHANGE', 'PERSONAL_REASONS',
  'TERMINATED', 'FIRED_FOR_CAUSE', 'LAID_OFF', 'POSITION_ELIMINATED', 'CONTRACT_ENDED',
  'FORCED_RESIGNATION', 'SCANDAL', 'INVESTIGATION', 'POLITICAL_PRESSURE', 'PUBLIC_PRESSURE',
  'DECEASED', 'UNKNOWN', 'NOT_SPECIFIED'
);

-- Step 2: Add new columns to Affiliation
ALTER TABLE "Affiliation"
ADD COLUMN IF NOT EXISTS "roleCategory" "RoleCategory",
ADD COLUMN IF NOT EXISTS "officialTitle" TEXT,
ADD COLUMN IF NOT EXISTS "shortTitle" TEXT,
ADD COLUMN IF NOT EXISTS "previousRole" TEXT,
ADD COLUMN IF NOT EXISTS "isCurrent" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "tenureMonths" INTEGER,
ADD COLUMN IF NOT EXISTS "appointmentType" "AppointmentType",
ADD COLUMN IF NOT EXISTS "termLimit" TEXT,
ADD COLUMN IF NOT EXISTS "affiliationType" "AffiliationType",
ADD COLUMN IF NOT EXISTS "isPrimary" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "employmentStatus" "EmploymentStatus",
ADD COLUMN IF NOT EXISTS "isVolunteer" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "departureReason" "DepartureReason",
ADD COLUMN IF NOT EXISTS "departureNote" TEXT,
ADD COLUMN IF NOT EXISTS "wasTerminated" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "wasResignation" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "departureIncidentId" TEXT,
ADD COLUMN IF NOT EXISTS "hasHiringAuthority" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "hasBudgetAuthority" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "hasPublicProfile" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "hasMediaRole" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "influenceLevel" INTEGER,
ADD COLUMN IF NOT EXISTS "authorityScope" TEXT,
ADD COLUMN IF NOT EXISTS "mediaAppearances" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "speakingEngagements" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "publicStatements" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "isSpokesperson" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "mediaRestrictions" TEXT,
ADD COLUMN IF NOT EXISTS "verificationDate" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "verifiedBy" TEXT,
ADD COLUMN IF NOT EXISTS "verificationSource" TEXT,
ADD COLUMN IF NOT EXISTS "evidenceUrl" TEXT,
ADD COLUMN IF NOT EXISTS "internalNotes" TEXT,
ADD COLUMN IF NOT EXISTS "publicNotes" TEXT,
ADD COLUMN IF NOT EXISTS "isControversial" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "controversyNote" TEXT,
ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
ADD COLUMN IF NOT EXISTS "lastEditedBy" TEXT;

-- Step 3: Infer roleCategory from existing roles
UPDATE "Affiliation"
SET "roleCategory" = CASE
  WHEN role ILIKE '%CEO%' OR role ILIKE '%President%' OR role ILIKE '%Director%' THEN 'EXECUTIVE_LEADERSHIP'
  WHEN role ILIKE '%Board%' THEN 'BOARD_MEMBER'
  WHEN role ILIKE '%Editor%Chief%' OR role ILIKE '%Editorial Director%' THEN 'EDITORIAL_LEADERSHIP'
  WHEN role ILIKE '%Editor%' OR role ILIKE '%Journalist%' OR role ILIKE '%Reporter%' THEN 'EDITORIAL_STAFF'
  WHEN role ILIKE '%Host%' OR role ILIKE '%Presenter%' THEN 'MEDIA_PERSONALITY'
  WHEN role ILIKE '%MP%' OR role ILIKE '%Senator%' OR role ILIKE '%Mayor%' THEN 'ELECTED_OFFICIAL'
  WHEN role ILIKE '%Minister%' OR role ILIKE '%Ambassador%' THEN 'APPOINTED_OFFICIAL'
  WHEN role ILIKE '%Professor%' OR role ILIKE '%Dean%' THEN 'ACADEMIC_FACULTY'
  WHEN role ILIKE '%Lawyer%' OR role ILIKE '%Attorney%' OR role ILIKE '%Counsel%' THEN 'LEGAL_PRACTITIONER'
  WHEN role ILIKE '%Member%' THEN 'MEMBER'
  WHEN role ILIKE '%Volunteer%' THEN 'VOLUNTEER'
  ELSE 'EMPLOYEE'
END
WHERE "roleCategory" IS NULL;

-- Step 4: Set affiliationType based on roleCategory
UPDATE "Affiliation"
SET "affiliationType" = CASE
  WHEN "roleCategory" IN ('EXECUTIVE_LEADERSHIP', 'EDITORIAL_STAFF', 'EMPLOYEE') THEN 'EMPLOYMENT'
  WHEN "roleCategory" = 'BOARD_MEMBER' THEN 'BOARD_POSITION'
  WHEN "roleCategory" IN ('ELECTED_OFFICIAL', 'APPOINTED_OFFICIAL') THEN 'POLITICAL_APPOINTMENT'
  WHEN "roleCategory" = 'VOLUNTEER' THEN 'VOLUNTEER'
  WHEN "roleCategory" = 'MEMBER' THEN 'MEMBERSHIP'
  ELSE 'EMPLOYMENT'
END
WHERE "affiliationType" IS NULL;

-- ===============================================
-- SOURCE ENHANCEMENT v3.0.1
-- ===============================================

-- Step 1: Create new enum types for Source
CREATE TYPE "SourceType" AS ENUM (
  'NEWS_ARTICLE', 'OPINION_PIECE', 'EDITORIAL', 'PRESS_RELEASE',
  'GOVERNMENT_DOCUMENT', 'ACADEMIC_PAPER', 'SOCIAL_MEDIA_POST',
  'VIDEO', 'AUDIO', 'TRANSCRIPT', 'LEGAL_DOCUMENT',
  'REPORT', 'BOOK', 'WEBSITE', 'INTERVIEW', 'SPEECH',
  'LEAKED_DOCUMENT', 'OTHER'
);

CREATE TYPE "SourceLevel" AS ENUM (
  'PRIMARY', 'SECONDARY', 'TERTIARY', 'ANALYSIS'
);

CREATE TYPE "ContentType" AS ENUM (
  'TEXT', 'VIDEO', 'AUDIO', 'IMAGE', 'DOCUMENT', 'INTERACTIVE', 'DATA'
);

CREATE TYPE "VerificationStatus" AS ENUM (
  'VERIFIED', 'PARTIALLY_VERIFIED', 'UNVERIFIED', 'DISPUTED', 'DEBUNKED'
);

CREATE TYPE "FactCheckStatus" AS ENUM (
  'TRUE', 'MOSTLY_TRUE', 'MIXED', 'MOSTLY_FALSE', 'FALSE', 'UNPROVEN', 'PENDING'
);

CREATE TYPE "ArchiveMethod" AS ENUM (
  'WAYBACK_MACHINE', 'ARCHIVE_TODAY', 'LOCAL_STORAGE',
  'SCREENSHOT', 'PDF_CAPTURE', 'FULL_CAPTURE'
);

CREATE TYPE "BiasRating" AS ENUM (
  'EXTREME_LEFT', 'LEFT', 'LEFT_CENTER', 'CENTER',
  'RIGHT_CENTER', 'RIGHT', 'EXTREME_RIGHT',
  'CONSPIRACY_PSEUDOSCIENCE', 'PRO_SCIENCE', 'SATIRE'
);

-- Step 2: Add new columns to Source
ALTER TABLE "Source"
ADD COLUMN IF NOT EXISTS "publicationSection" TEXT,
ADD COLUMN IF NOT EXISTS "additionalAuthors" TEXT[],
ADD COLUMN IF NOT EXISTS "lastVerifiedDate" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "sourceType" "SourceType" DEFAULT 'NEWS_ARTICLE',
ADD COLUMN IF NOT EXISTS "sourceLevel" "SourceLevel" DEFAULT 'SECONDARY',
ADD COLUMN IF NOT EXISTS "contentType" "ContentType" DEFAULT 'TEXT',
ADD COLUMN IF NOT EXISTS "credibilityScore" FLOAT,
ADD COLUMN IF NOT EXISTS "credibilityLevel" "CredibilityRating" DEFAULT 'UNKNOWN',
ADD COLUMN IF NOT EXISTS "verificationStatus" "VerificationStatus" DEFAULT 'UNVERIFIED',
ADD COLUMN IF NOT EXISTS "verificationDate" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "verifiedBy" TEXT,
ADD COLUMN IF NOT EXISTS "verificationNotes" TEXT,
ADD COLUMN IF NOT EXISTS "factCheckStatus" "FactCheckStatus",
ADD COLUMN IF NOT EXISTS "factCheckUrl" TEXT,
ADD COLUMN IF NOT EXISTS "factCheckBy" TEXT,
ADD COLUMN IF NOT EXISTS "archiveDate" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "archiveMethod" "ArchiveMethod",
ADD COLUMN IF NOT EXISTS "archiveHash" TEXT,
ADD COLUMN IF NOT EXISTS "requiresArchival" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "archivalPriority" INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS "contentSnapshot" TEXT,
ADD COLUMN IF NOT EXISTS "screenshotUrl" TEXT,
ADD COLUMN IF NOT EXISTS "pdfUrl" TEXT,
ADD COLUMN IF NOT EXISTS "hasPaywall" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "isOpinion" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "isEditorial" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "isExclusive" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "hasDate" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "hasSources" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "wordCount" INTEGER,
ADD COLUMN IF NOT EXISTS "biasRating" "BiasRating",
ADD COLUMN IF NOT EXISTS "biasNote" TEXT,
ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "deletionDate" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "deletionReason" TEXT,
ADD COLUMN IF NOT EXISTS "isBroken" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "lastCheckDate" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "checkFailCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "contentWarning" TEXT,
ADD COLUMN IF NOT EXISTS "isGraphic" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "isSensitive" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "citationCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "viewCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "publicNotes" TEXT,
ADD COLUMN IF NOT EXISTS "internalNotes" TEXT,
ADD COLUMN IF NOT EXISTS "topicId" TEXT,
ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
ADD COLUMN IF NOT EXISTS "lastEditedBy" TEXT;

-- ===============================================
-- TAG ENHANCEMENT v3.0.1
-- ===============================================

-- Step 1: Create new enum types for Tag
CREATE TYPE "TagStatus" AS ENUM (
  'PENDING', 'APPROVED', 'REJECTED', 'DEPRECATED', 'ARCHIVED'
);

CREATE TYPE "AliasType" AS ENUM (
  'SYNONYM', 'ABBREVIATION', 'TRANSLATION',
  'HISTORICAL', 'COLLOQUIAL', 'MISSPELLING'
);

-- Step 2: Add new columns to Tag
ALTER TABLE "Tag"
ADD COLUMN IF NOT EXISTS "subcategory" TEXT,
ADD COLUMN IF NOT EXISTS "usageGuidelines" TEXT,
ADD COLUMN IF NOT EXISTS "backgroundColor" TEXT,
ADD COLUMN IF NOT EXISTS "controversyNote" TEXT,
ADD COLUMN IF NOT EXISTS "disputedBy" TEXT[],
ADD COLUMN IF NOT EXISTS "preferredBy" TEXT[],
ADD COLUMN IF NOT EXISTS "neutralAlternative" TEXT,
ADD COLUMN IF NOT EXISTS "status" "TagStatus" DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
ADD COLUMN IF NOT EXISTS "approvedBy" TEXT,
ADD COLUMN IF NOT EXISTS "approvedDate" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT,
ADD COLUMN IF NOT EXISTS "requiresApproval" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "restrictedTo" TEXT[],
ADD COLUMN IF NOT EXISTS "incidentCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "statementCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "personCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "orgCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "lastUsedAt" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "deprecatedAt" TIMESTAMPTZ;

-- Step 3: Create TagAlias table
CREATE TABLE IF NOT EXISTS "TagAlias" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "tagId" TEXT NOT NULL,
  "alias" TEXT NOT NULL UNIQUE,
  "aliasType" "AliasType" NOT NULL,
  "language" TEXT DEFAULT 'en',
  "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE
);

-- Step 4: Create AffiliationSources junction table
CREATE TABLE IF NOT EXISTS "AffiliationSources" (
  "affiliationId" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  PRIMARY KEY ("affiliationId", "sourceId"),
  FOREIGN KEY ("affiliationId") REFERENCES "Affiliation"("id") ON DELETE CASCADE,
  FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE
);

-- Step 5: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliation_person_current ON "Affiliation"("personId", "isCurrent");
CREATE INDEX IF NOT EXISTS idx_affiliation_org_active ON "Affiliation"("organizationId", "isActive");
CREATE INDEX IF NOT EXISTS idx_affiliation_role ON "Affiliation"("roleCategory", "roleLevel");
CREATE INDEX IF NOT EXISTS idx_affiliation_dates ON "Affiliation"("startDate", "endDate");
CREATE INDEX IF NOT EXISTS idx_affiliation_verified ON "Affiliation"("isVerified");
CREATE INDEX IF NOT EXISTS idx_affiliation_departure ON "Affiliation"("departureReason");

CREATE INDEX IF NOT EXISTS idx_source_type ON "Source"("sourceType", "sourceLevel");
CREATE INDEX IF NOT EXISTS idx_source_verification ON "Source"("verificationStatus");
CREATE INDEX IF NOT EXISTS idx_source_publish_date ON "Source"("publishDate");
CREATE INDEX IF NOT EXISTS idx_source_credibility ON "Source"("credibilityLevel");
CREATE INDEX IF NOT EXISTS idx_source_archived ON "Source"("isArchived");

CREATE INDEX IF NOT EXISTS idx_tag_status ON "Tag"("category", "status");
CREATE INDEX IF NOT EXISTS idx_tag_controversial ON "Tag"("isControversial");
CREATE INDEX IF NOT EXISTS idx_tag_usage ON "Tag"("usageCount");
CREATE INDEX IF NOT EXISTS idx_tagalias_alias ON "TagAlias"("alias");
CREATE INDEX IF NOT EXISTS idx_tagalias_tag ON "TagAlias"("tagId");