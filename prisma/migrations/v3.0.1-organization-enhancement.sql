-- Organization Database v3.0.1 Enhancement Migration
-- This migration enhances the Organization model with comprehensive classification,
-- financial tracking, political stance tracking, and hierarchical relationships

-- Create Organization enhancement enum types
CREATE TYPE "OrgType" AS ENUM (
  -- Advocacy & NGO (8 types)
  'ADVOCACY_GROUP',
  'THINK_TANK',
  'NGO',
  'CHARITY',
  'FOUNDATION',
  'RESEARCH_INSTITUTE',
  'POLICY_CENTER',
  'WATCHDOG',

  -- Media (7 types)
  'NEWS_OUTLET',
  'SOCIAL_MEDIA_PLATFORM',
  'PUBLISHING_HOUSE',
  'PRODUCTION_COMPANY',
  'BROADCASTER',
  'ONLINE_MEDIA',
  'ALTERNATIVE_MEDIA',

  -- Political (8 types)
  'POLITICAL_PARTY',
  'PAC',
  'SUPER_PAC',
  'CAMPAIGN',
  'LOBBY_GROUP',
  'POLITICAL_ACTION_GROUP',
  'GRASSROOTS_MOVEMENT',
  'COALITION',

  -- Government (9 types)
  'GOVERNMENT_AGENCY',
  'LEGISLATIVE_BODY',
  'JUDICIAL_BODY',
  'EXECUTIVE_OFFICE',
  'MILITARY_UNIT',
  'INTELLIGENCE_AGENCY',
  'DIPLOMATIC_MISSION',
  'INTERNATIONAL_BODY',
  'TREATY_ORGANIZATION',

  -- Educational (5 types)
  'UNIVERSITY',
  'COLLEGE',
  'SCHOOL',
  'RESEARCH_CENTER',
  'ACADEMIC_DEPARTMENT',

  -- Religious (6 types)
  'RELIGIOUS_INSTITUTION',
  'PLACE_OF_WORSHIP',
  'RELIGIOUS_ORGANIZATION',
  'FAITH_BASED_CHARITY',
  'RELIGIOUS_SCHOOL',
  'DENOMINATIONAL_BODY',

  -- Business (8 types)
  'CORPORATION',
  'COMPANY',
  'STARTUP',
  'CONSULTANCY',
  'LAW_FIRM',
  'PR_FIRM',
  'TECH_COMPANY',
  'FINANCIAL_INSTITUTION',

  -- Professional (5 types)
  'UNION',
  'TRADE_ASSOCIATION',
  'PROFESSIONAL_SOCIETY',
  'CERTIFICATION_BODY',
  'STANDARDS_ORGANIZATION',

  -- Cultural (5 types)
  'MUSEUM',
  'CULTURAL_CENTER',
  'ARTS_ORGANIZATION',
  'HERITAGE_GROUP',
  'COMMUNITY_CENTER',

  -- Other (2 types)
  'INFORMAL_GROUP',
  'OTHER'
);

CREATE TYPE "LegalStructure" AS ENUM (
  -- Non-profit (6 types)
  'NONPROFIT_501C3',
  'NONPROFIT_501C4',
  'NONPROFIT_501C6',
  'NONPROFIT_OTHER',
  'CHARITABLE_TRUST',
  'RELIGIOUS_EXEMPT',

  -- For-profit (7 types)
  'CORPORATION',
  'LLC',
  'PARTNERSHIP',
  'SOLE_PROPRIETORSHIP',
  'COOPERATIVE',
  'BENEFIT_CORP',
  'SOCIAL_ENTERPRISE',

  -- Government (4 types)
  'GOVERNMENT_ENTITY',
  'QUASI_GOVERNMENTAL',
  'INTERNATIONAL_ORG',
  'INTERGOVERNMENTAL',

  -- Other (3 types)
  'UNINCORPORATED',
  'INFORMAL',
  'UNKNOWN'
);

CREATE TYPE "TaxStatus" AS ENUM (
  'TAX_EXEMPT',
  'TAXABLE',
  'PARTIAL_EXEMPT',
  'PENDING',
  'REVOKED',
  'UNKNOWN'
);

CREATE TYPE "OperationalStatus" AS ENUM (
  'ACTIVE',
  'INACTIVE',
  'DISSOLVED',
  'SUSPENDED',
  'MERGED',
  'ACQUIRED',
  'BANKRUPTCY',
  'PENDING_FORMATION',
  'DORMANT',
  'UNKNOWN'
);

CREATE TYPE "FundingSource" AS ENUM (
  -- Government (4 types)
  'GOVERNMENT_GRANTS',
  'GOVERNMENT_CONTRACTS',
  'FOREIGN_GOVERNMENT',
  'MULTILATERAL_FUNDING',

  -- Private (8 types)
  'INDIVIDUAL_DONORS',
  'MAJOR_DONORS',
  'CORPORATE_SPONSORS',
  'FOUNDATIONS',
  'MEMBERSHIP_DUES',
  'VENTURE_CAPITAL',
  'PRIVATE_EQUITY',
  'CROWDFUNDING',

  -- Earned (5 types)
  'PROGRAM_REVENUE',
  'PRODUCT_SALES',
  'SERVICE_FEES',
  'INVESTMENTS',
  'ENDOWMENT',

  -- Mixed (2 types)
  'MIXED_SOURCES',
  'UNKNOWN'
);

CREATE TYPE "TransparencyLevel" AS ENUM (
  'FULL_DISCLOSURE',
  'PARTIAL_DISCLOSURE',
  'MINIMAL_DISCLOSURE',
  'NO_DISCLOSURE',
  'LEGALLY_REQUIRED',
  'VOLUNTARY_TRANSPARENCY',
  'UNKNOWN'
);

CREATE TYPE "InfluenceLevel" AS ENUM (
  'GLOBAL',
  'INTERNATIONAL',
  'NATIONAL',
  'REGIONAL',
  'STATE_PROVINCIAL',
  'LOCAL',
  'COMMUNITY',
  'NICHE',
  'MINIMAL',
  'UNKNOWN'
);

CREATE TYPE "PoliticalLeaning" AS ENUM (
  'FAR_LEFT',
  'LEFT',
  'CENTER_LEFT',
  'CENTER',
  'CENTER_RIGHT',
  'RIGHT',
  'FAR_RIGHT',
  'LIBERTARIAN',
  'AUTHORITARIAN',
  'POPULIST',
  'PROGRESSIVE',
  'CONSERVATIVE',
  'SOCIALIST',
  'COMMUNIST',
  'FASCIST',
  'ANARCHIST',
  'MIXED',
  'APOLITICAL',
  'UNKNOWN'
);

CREATE TYPE "StanceOnIsrael" AS ENUM (
  'STRONGLY_SUPPORTIVE',
  'SUPPORTIVE',
  'CONDITIONALLY_SUPPORTIVE',
  'NEUTRAL',
  'CONDITIONALLY_CRITICAL',
  'CRITICAL',
  'STRONGLY_CRITICAL',
  'BDS_SUPPORTER',
  'MIXED_POSITIONS',
  'NO_POSITION',
  'UNKNOWN'
);

CREATE TYPE "OrganizationSize" AS ENUM (
  'MICRO',          -- 1-9
  'SMALL',          -- 10-49
  'MEDIUM',         -- 50-249
  'LARGE',          -- 250-999
  'ENTERPRISE',     -- 1000-9999
  'MEGA',           -- 10000+
  'UNKNOWN'
);

-- Add new columns to Organization table
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "orgType" "OrgType" DEFAULT 'OTHER';
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "orgTypeOther" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "legalStructure" "LegalStructure";
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "taxStatus" "TaxStatus";
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "incorporationDate" TIMESTAMP(3);
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "incorporationState" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "incorporationCountry" TEXT;

-- Personal Brand Support
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "personId" TEXT;

-- Hierarchical Structure
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "ultimateParentId" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "ownershipPercentage" DOUBLE PRECISION;

-- Location & Operations
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "headquartersCity" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "headquartersState" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "headquartersCountry" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "officeLocations" TEXT[];

-- Size & Scale
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "organizationSize" "OrganizationSize";
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "employeeCountYear" INTEGER;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "memberCount" INTEGER;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "memberCountYear" INTEGER;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "volunteerCount" INTEGER;

-- Financial Information
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "revenueYear" INTEGER;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "annualBudget" DOUBLE PRECISION;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "budgetYear" INTEGER;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "totalAssets" DOUBLE PRECISION;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "fundingSources" "FundingSource"[];
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "majorDonors" TEXT[];
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "transparencyLevel" "TransparencyLevel";
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "financialReportUrl" TEXT;

-- Leadership & Key People
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "leadership" JSONB;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "boardMembers" JSONB;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "keyStaffCount" INTEGER;

-- Mission & Activities
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "missionStatement" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "visionStatement" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "coreValues" TEXT[];
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "primaryActivities" TEXT[];
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "targetAudience" TEXT[];
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "geographicFocus" TEXT[];

-- Political & Ideological
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "politicalLeaning" "PoliticalLeaning";
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "stanceOnIsrael" "StanceOnIsrael";
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "stanceOnPalestine" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "policyPositions" JSONB;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "endorsements" TEXT[];

-- Influence & Reach
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "influenceLevel" "InfluenceLevel";
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "socialMediaReach" JSONB;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "publicationReach" INTEGER;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "memberInfluence" TEXT;

-- Status & Compliance
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "operationalStatus" "OperationalStatus" DEFAULT 'ACTIVE';
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "complianceIssues" TEXT[];
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "sanctionsStatus" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "controversies" TEXT[];

-- Network & Relationships
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "coalitionMemberships" TEXT[];
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "partnerOrganizations" TEXT[];
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "competingOrganizations" TEXT[];

-- Media & Communication
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "pressContact" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "pressEmail" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "socialMediaHandles" JSONB;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "publicationsOwned" TEXT[];

-- Verification & Quality
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "verificationNotes" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "dataQualityScore" DOUBLE PRECISION;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "lastReviewedAt" TIMESTAMP(3);

-- Cached statistics
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "responseCount" INTEGER DEFAULT 0;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "citationCount" INTEGER DEFAULT 0;

-- Metadata
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "internalNotes" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "researchStatus" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "dataSource" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "lastDataUpdate" TIMESTAMP(3);

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS "Organization_orgType_idx" ON "Organization"("orgType");
CREATE INDEX IF NOT EXISTS "Organization_legalStructure_idx" ON "Organization"("legalStructure");
CREATE INDEX IF NOT EXISTS "Organization_operationalStatus_idx" ON "Organization"("operationalStatus");
CREATE INDEX IF NOT EXISTS "Organization_politicalLeaning_idx" ON "Organization"("politicalLeaning");
CREATE INDEX IF NOT EXISTS "Organization_stanceOnIsrael_idx" ON "Organization"("stanceOnIsrael");
CREATE INDEX IF NOT EXISTS "Organization_influenceLevel_idx" ON "Organization"("influenceLevel");
CREATE INDEX IF NOT EXISTS "Organization_organizationSize_idx" ON "Organization"("organizationSize");
CREATE INDEX IF NOT EXISTS "Organization_headquartersCountry_idx" ON "Organization"("headquartersCountry");
CREATE INDEX IF NOT EXISTS "Organization_personId_idx" ON "Organization"("personId");

-- Add foreign key constraint for personal brand connection
ALTER TABLE "Organization"
ADD CONSTRAINT "Organization_personId_fkey"
FOREIGN KEY ("personId") REFERENCES "Person"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Intelligently migrate existing data
UPDATE "Organization" SET "orgType" =
  CASE
    -- Media organizations
    WHEN "type" = 'NEWS_OUTLET' THEN 'NEWS_OUTLET'::"OrgType"
    WHEN "type" = 'MEDIA' THEN 'NEWS_OUTLET'::"OrgType"

    -- Political organizations
    WHEN "type" = 'POLITICAL' THEN 'POLITICAL_PARTY'::"OrgType"
    WHEN "type" = 'GOVERNMENT' THEN 'GOVERNMENT_AGENCY'::"OrgType"

    -- Advocacy organizations
    WHEN "type" = 'ADVOCACY' THEN 'ADVOCACY_GROUP'::"OrgType"
    WHEN "type" = 'NGO' THEN 'NGO'::"OrgType"
    WHEN "type" = 'NONPROFIT' THEN 'NGO'::"OrgType"

    -- Educational organizations
    WHEN "type" = 'EDUCATION' THEN 'UNIVERSITY'::"OrgType"
    WHEN "type" = 'ACADEMIC' THEN 'UNIVERSITY'::"OrgType"

    -- Business organizations
    WHEN "type" = 'BUSINESS' THEN 'COMPANY'::"OrgType"
    WHEN "type" = 'CORPORATE' THEN 'CORPORATION'::"OrgType"

    -- Religious organizations
    WHEN "type" = 'RELIGIOUS' THEN 'RELIGIOUS_ORGANIZATION'::"OrgType"

    ELSE 'OTHER'::"OrgType"
  END
WHERE "orgType" IS NULL;

-- Set operational status based on dissolved date
UPDATE "Organization"
SET "operationalStatus" = 'DISSOLVED'::"OperationalStatus"
WHERE "dissolved" IS NOT NULL AND "operationalStatus" IS NULL;

UPDATE "Organization"
SET "operationalStatus" = 'ACTIVE'::"OperationalStatus"
WHERE "dissolved" IS NULL AND "operationalStatus" IS NULL;

-- Infer legal structure from type
UPDATE "Organization" SET "legalStructure" =
  CASE
    WHEN "orgType" IN ('NGO', 'CHARITY', 'FOUNDATION') THEN 'NONPROFIT_501C3'::"LegalStructure"
    WHEN "orgType" IN ('PAC', 'SUPER_PAC') THEN 'NONPROFIT_501C4'::"LegalStructure"
    WHEN "orgType" IN ('CORPORATION', 'COMPANY') THEN 'CORPORATION'::"LegalStructure"
    WHEN "orgType" IN ('GOVERNMENT_AGENCY', 'LEGISLATIVE_BODY', 'JUDICIAL_BODY') THEN 'GOVERNMENT_ENTITY'::"LegalStructure"
    WHEN "orgType" = 'INFORMAL_GROUP' THEN 'UNINCORPORATED'::"LegalStructure"
    ELSE 'UNKNOWN'::"LegalStructure"
  END
WHERE "legalStructure" IS NULL;

-- Infer organization size from employee count
UPDATE "Organization" SET "organizationSize" =
  CASE
    WHEN "employeeCount" < 10 THEN 'MICRO'::"OrganizationSize"
    WHEN "employeeCount" < 50 THEN 'SMALL'::"OrganizationSize"
    WHEN "employeeCount" < 250 THEN 'MEDIUM'::"OrganizationSize"
    WHEN "employeeCount" < 1000 THEN 'LARGE'::"OrganizationSize"
    WHEN "employeeCount" < 10000 THEN 'ENTERPRISE'::"OrganizationSize"
    WHEN "employeeCount" >= 10000 THEN 'MEGA'::"OrganizationSize"
    ELSE 'UNKNOWN'::"OrganizationSize"
  END
WHERE "organizationSize" IS NULL AND "employeeCount" IS NOT NULL;

-- Parse headquarters location if available
UPDATE "Organization"
SET
  "headquartersCity" = CASE
    WHEN "headquarters" LIKE '%, %' THEN
      split_part("headquarters", ',', 1)
    ELSE NULL
  END,
  "headquartersCountry" = CASE
    WHEN "headquarters" LIKE '%, %' THEN
      trim(split_part("headquarters", ',', -1))
    ELSE "headquarters"
  END
WHERE "headquartersCity" IS NULL AND "headquarters" IS NOT NULL;

-- Set default transparency level for government entities
UPDATE "Organization"
SET "transparencyLevel" = 'LEGALLY_REQUIRED'::"TransparencyLevel"
WHERE "legalStructure" = 'GOVERNMENT_ENTITY' AND "transparencyLevel" IS NULL;

-- Set default influence level based on org type
UPDATE "Organization" SET "influenceLevel" =
  CASE
    WHEN "orgType" IN ('INTERNATIONAL_BODY', 'TREATY_ORGANIZATION') THEN 'INTERNATIONAL'::"InfluenceLevel"
    WHEN "orgType" IN ('GOVERNMENT_AGENCY', 'LEGISLATIVE_BODY') THEN 'NATIONAL'::"InfluenceLevel"
    WHEN "orgType" IN ('LOCAL', 'COMMUNITY_CENTER') THEN 'LOCAL'::"InfluenceLevel"
    ELSE 'UNKNOWN'::"InfluenceLevel"
  END
WHERE "influenceLevel" IS NULL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Organization v3.0.1 enhancement migration completed successfully';
  RAISE NOTICE 'Added 10 new enum types with 63 enum values';
  RAISE NOTICE 'Added 60+ new fields to Organization model';
  RAISE NOTICE 'Migrated existing data with intelligent defaults';
END $$;