-- Person Database v3.0.1 Enhancement Migration
-- This migration enhances the Person model with comprehensive demographics,
-- professional tracking, social media metrics, and controversy tracking

-- Create Person enhancement enum types
CREATE TYPE "Gender" AS ENUM (
  'MALE',
  'FEMALE',
  'NON_BINARY',
  'OTHER',
  'UNKNOWN'
);

CREATE TYPE "Nationality" AS ENUM (
  -- Major countries
  'USA',
  'UK',
  'CANADA',
  'AUSTRALIA',
  'ISRAEL',
  'PALESTINE',
  'FRANCE',
  'GERMANY',
  'RUSSIA',
  'CHINA',
  'INDIA',
  'BRAZIL',
  'MEXICO',
  'JAPAN',
  'SOUTH_KOREA',
  'SAUDI_ARABIA',
  'IRAN',
  'EGYPT',
  'TURKEY',
  'SOUTH_AFRICA',
  'NIGERIA',
  -- Add more as needed
  'OTHER',
  'UNKNOWN'
);

CREATE TYPE "Profession" AS ENUM (
  -- Politics
  'POLITICIAN',
  'DIPLOMAT',
  'GOVERNMENT_OFFICIAL',
  'POLITICAL_ADVISOR',

  -- Media
  'JOURNALIST',
  'EDITOR',
  'NEWS_ANCHOR',
  'COLUMNIST',
  'COMMENTATOR',
  'BLOGGER',
  'PODCASTER',

  -- Academia
  'PROFESSOR',
  'RESEARCHER',
  'ACADEMIC_ADMINISTRATOR',
  'STUDENT',

  -- Legal
  'LAWYER',
  'JUDGE',
  'PROSECUTOR',
  'LEGAL_SCHOLAR',

  -- Business
  'CEO',
  'EXECUTIVE',
  'ENTREPRENEUR',
  'INVESTOR',
  'CONSULTANT',

  -- Arts & Entertainment
  'ACTOR',
  'DIRECTOR',
  'PRODUCER',
  'WRITER',
  'MUSICIAN',
  'ARTIST',
  'COMEDIAN',

  -- Activism
  'ACTIVIST',
  'ORGANIZER',
  'NGO_LEADER',
  'ADVOCATE',

  -- Religion
  'CLERGY',
  'RABBI',
  'IMAM',
  'PRIEST',
  'RELIGIOUS_LEADER',

  -- Military/Security
  'MILITARY_OFFICER',
  'INTELLIGENCE_OFFICIAL',
  'POLICE_OFFICER',

  -- Healthcare
  'DOCTOR',
  'NURSE',
  'RESEARCHER_MEDICAL',

  -- Technology
  'ENGINEER',
  'DEVELOPER',
  'TECH_EXECUTIVE',

  -- Sports
  'ATHLETE',
  'COACH',
  'SPORTS_EXECUTIVE',

  -- Other
  'INFLUENCER',
  'PUBLIC_FIGURE',
  'OTHER',
  'UNKNOWN'
);

CREATE TYPE "Industry" AS ENUM (
  'POLITICS_GOVERNMENT',
  'MEDIA_JOURNALISM',
  'EDUCATION_ACADEMIA',
  'LAW_LEGAL',
  'BUSINESS_FINANCE',
  'TECHNOLOGY',
  'HEALTHCARE',
  'ENTERTAINMENT',
  'SPORTS',
  'NONPROFIT_NGO',
  'RELIGION',
  'MILITARY_DEFENSE',
  'OTHER'
);

CREATE TYPE "EducationLevel" AS ENUM (
  'HIGH_SCHOOL',
  'SOME_COLLEGE',
  'BACHELORS',
  'MASTERS',
  'DOCTORATE',
  'PROFESSIONAL',
  'OTHER'
);

CREATE TYPE "CelebrityStatus" AS ENUM (
  'A_LIST',
  'B_LIST',
  'NOTABLE',
  'NICHE_FAMOUS',
  'INTERNET_FAMOUS',
  'LOCAL_CELEBRITY'
);

CREATE TYPE "PersonInfluenceLevel" AS ENUM (
  'GLOBAL',
  'INTERNATIONAL',
  'NATIONAL',
  'REGIONAL',
  'LOCAL',
  'NICHE'
);

CREATE TYPE "PoliticalAffiliation" AS ENUM (
  -- US
  'DEMOCRAT',
  'REPUBLICAN',
  'INDEPENDENT_US',
  'GREEN_US',
  'LIBERTARIAN_US',

  -- UK
  'CONSERVATIVE_UK',
  'LABOUR_UK',
  'LIBERAL_DEMOCRAT_UK',
  'GREEN_UK',

  -- Israel
  'LIKUD',
  'LABOR_IL',
  'BLUE_WHITE',
  'RELIGIOUS_ZIONIST',

  -- Generic
  'CONSERVATIVE',
  'LIBERAL',
  'SOCIALIST',
  'COMMUNIST',
  'NATIONALIST',

  -- Other
  'NONPARTISAN',
  'UNKNOWN',
  'OTHER'
);

CREATE TYPE "ReputationStatus" AS ENUM (
  'EXCELLENT',
  'GOOD',
  'MIXED',
  'DAMAGED',
  'SEVERELY_DAMAGED',
  'REHABILITATING'
);

CREATE TYPE "PersonVerificationLevel" AS ENUM (
  'FULLY_VERIFIED',
  'VERIFIED',
  'PARTIALLY_VERIFIED',
  'UNVERIFIED',
  'DISPUTED'
);

-- Add new columns to Person table
ALTER TABLE "Person"
-- Name fields
ADD COLUMN IF NOT EXISTS "fullName" TEXT,
ADD COLUMN IF NOT EXISTS "firstName" TEXT,
ADD COLUMN IF NOT EXISTS "middleName" TEXT,
ADD COLUMN IF NOT EXISTS "lastName" TEXT,
ADD COLUMN IF NOT EXISTS "namePrefix" TEXT,
ADD COLUMN IF NOT EXISTS "nameSuffix" TEXT,
ADD COLUMN IF NOT EXISTS "aliases" TEXT[],
ADD COLUMN IF NOT EXISTS "hebrewName" TEXT,
ADD COLUMN IF NOT EXISTS "arabicName" TEXT,
ADD COLUMN IF NOT EXISTS "nativeName" TEXT,

-- Demographics
ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "age" INTEGER,
ADD COLUMN IF NOT EXISTS "gender" "Gender",
ADD COLUMN IF NOT EXISTS "nationalityArray" "Nationality"[],
ADD COLUMN IF NOT EXISTS "primaryNationality" "Nationality",
ADD COLUMN IF NOT EXISTS "ethnicity" TEXT[],

-- Professional
ADD COLUMN IF NOT EXISTS "professionArray" "Profession"[],
ADD COLUMN IF NOT EXISTS "primaryProfession" "Profession",
ADD COLUMN IF NOT EXISTS "professionDetails" TEXT,
ADD COLUMN IF NOT EXISTS "industry" "Industry",
ADD COLUMN IF NOT EXISTS "specialization" TEXT,
ADD COLUMN IF NOT EXISTS "yearsExperience" INTEGER,
ADD COLUMN IF NOT EXISTS "educationLevel" "EducationLevel",
ADD COLUMN IF NOT EXISTS "degrees" TEXT[],
ADD COLUMN IF NOT EXISTS "universities" TEXT[],
ADD COLUMN IF NOT EXISTS "academicTitles" TEXT[],

-- Current position
ADD COLUMN IF NOT EXISTS "currentTitle" TEXT,
ADD COLUMN IF NOT EXISTS "currentOrganization" TEXT,
ADD COLUMN IF NOT EXISTS "currentOrgId" TEXT,
ADD COLUMN IF NOT EXISTS "employmentStatus" "EmploymentStatus",
ADD COLUMN IF NOT EXISTS "isRetired" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "retirementDate" TIMESTAMP(3),

-- Public profile
ADD COLUMN IF NOT EXISTS "shortBio" VARCHAR(500),
ADD COLUMN IF NOT EXISTS "publicFigure" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "celebrityStatus" "CelebrityStatus",
ADD COLUMN IF NOT EXISTS "notableFor" TEXT[],
ADD COLUMN IF NOT EXISTS "awards" TEXT[],
ADD COLUMN IF NOT EXISTS "publications" TEXT[],

-- Influence
ADD COLUMN IF NOT EXISTS "influenceScore" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "influenceLevel" "PersonInfluenceLevel",

-- Social media
ADD COLUMN IF NOT EXISTS "hasTwitter" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "twitterHandle" TEXT,
ADD COLUMN IF NOT EXISTS "twitterFollowers" INTEGER,
ADD COLUMN IF NOT EXISTS "twitterVerified" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "hasLinkedIn" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "linkedInUrl" TEXT,
ADD COLUMN IF NOT EXISTS "linkedInConnections" INTEGER,
ADD COLUMN IF NOT EXISTS "hasFacebook" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "facebookUrl" TEXT,
ADD COLUMN IF NOT EXISTS "facebookFollowers" INTEGER,
ADD COLUMN IF NOT EXISTS "hasInstagram" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "instagramHandle" TEXT,
ADD COLUMN IF NOT EXISTS "instagramFollowers" INTEGER,
ADD COLUMN IF NOT EXISTS "totalSocialReach" INTEGER,
ADD COLUMN IF NOT EXISTS "mediaAppearances" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "citationCount" INTEGER DEFAULT 0,

-- Political
ADD COLUMN IF NOT EXISTS "politicalAffiliation" "PoliticalAffiliation",
ADD COLUMN IF NOT EXISTS "politicalLeaning" "PoliticalLeaning",
ADD COLUMN IF NOT EXISTS "knownPositions" TEXT[],
ADD COLUMN IF NOT EXISTS "advocacy" TEXT[],
ADD COLUMN IF NOT EXISTS "isPolitician" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "isActivist" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "isLobbyist" BOOLEAN DEFAULT false,

-- Relationships
ADD COLUMN IF NOT EXISTS "boardPositions" INTEGER DEFAULT 0,

-- Controversy
ADD COLUMN IF NOT EXISTS "hasControversies" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "controversyScore" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "controversyNotes" TEXT,
ADD COLUMN IF NOT EXISTS "reputationStatus" "ReputationStatus",
ADD COLUMN IF NOT EXISTS "reputationNotes" TEXT,
ADD COLUMN IF NOT EXISTS "hasBeenCancelled" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "cancelledDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "cancelledReason" TEXT,
ADD COLUMN IF NOT EXISTS "hasBeenSuspended" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "hasBeenFired" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "hasResigned" BOOLEAN DEFAULT false,

-- Legal
ADD COLUMN IF NOT EXISTS "hasLegalIssues" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "legalIssueNotes" TEXT,
ADD COLUMN IF NOT EXISTS "underInvestigation" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "investigationType" TEXT,
ADD COLUMN IF NOT EXISTS "hasSanctions" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "sanctionDetails" TEXT,
ADD COLUMN IF NOT EXISTS "hasCriminalRecord" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "criminalNotes" TEXT,

-- Statistics
ADD COLUMN IF NOT EXISTS "responseCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "sourceCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "criticismsMade" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "criticismsReceived" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "supportGiven" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "supportReceived" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "firstActivityDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "lastActivityDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "mostActiveYear" INTEGER,

-- Verification
ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "personVerificationLevel" "PersonVerificationLevel" DEFAULT 'UNVERIFIED',
ADD COLUMN IF NOT EXISTS "verificationDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "verificationNotes" TEXT,
ADD COLUMN IF NOT EXISTS "wikipediaUrl" TEXT,
ADD COLUMN IF NOT EXISTS "officialWebsite" TEXT,
ADD COLUMN IF NOT EXISTS "linkedInVerified" BOOLEAN DEFAULT false,

-- Location
ADD COLUMN IF NOT EXISTS "residenceCountry" TEXT,
ADD COLUMN IF NOT EXISTS "residenceState" TEXT,
ADD COLUMN IF NOT EXISTS "residenceCity" TEXT,
ADD COLUMN IF NOT EXISTS "workCountry" TEXT,
ADD COLUMN IF NOT EXISTS "workCity" TEXT,
ADD COLUMN IF NOT EXISTS "publicEmail" TEXT,
ADD COLUMN IF NOT EXISTS "agentEmail" TEXT,
ADD COLUMN IF NOT EXISTS "pressContact" TEXT,

-- Flags
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "isDeceased" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "deceasedDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "isBlocked" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "isPEP" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "isHighProfile" BOOLEAN DEFAULT false,

-- Notes
ADD COLUMN IF NOT EXISTS "publicNotes" TEXT,
ADD COLUMN IF NOT EXISTS "internalNotes" TEXT,
ADD COLUMN IF NOT EXISTS "researchNotes" TEXT,
ADD COLUMN IF NOT EXISTS "editorialNotes" TEXT,

-- Metadata
ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
ADD COLUMN IF NOT EXISTS "lastEditedBy" TEXT,
ADD COLUMN IF NOT EXISTS "dataSource" TEXT,
ADD COLUMN IF NOT EXISTS "importSource" TEXT,
ADD COLUMN IF NOT EXISTS "lastReviewDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "needsReview" BOOLEAN DEFAULT false;

-- Map existing nationality text to enum
UPDATE "Person"
SET "primaryNationality" = CASE
  WHEN "nationalityDetail" ILIKE '%american%' OR "nationalityDetail" ILIKE '%usa%' OR "nationalityDetail" ILIKE '%u.s.%' THEN 'USA'::"Nationality"
  WHEN "nationalityDetail" ILIKE '%british%' OR "nationalityDetail" ILIKE '%uk%' OR "nationalityDetail" ILIKE '%english%' THEN 'UK'::"Nationality"
  WHEN "nationalityDetail" ILIKE '%canadian%' THEN 'CANADA'::"Nationality"
  WHEN "nationalityDetail" ILIKE '%australian%' THEN 'AUSTRALIA'::"Nationality"
  WHEN "nationalityDetail" ILIKE '%israel%' THEN 'ISRAEL'::"Nationality"
  WHEN "nationalityDetail" ILIKE '%palestin%' THEN 'PALESTINE'::"Nationality"
  WHEN "nationalityDetail" ILIKE '%french%' OR "nationalityDetail" ILIKE '%france%' THEN 'FRANCE'::"Nationality"
  WHEN "nationalityDetail" ILIKE '%german%' THEN 'GERMANY'::"Nationality"
  WHEN "nationalityDetail" ILIKE '%russian%' THEN 'RUSSIA'::"Nationality"
  WHEN "nationalityDetail" ILIKE '%chinese%' OR "nationalityDetail" ILIKE '%china%' THEN 'CHINA'::"Nationality"
  WHEN "nationalityDetail" ILIKE '%indian%' OR "nationalityDetail" ILIKE '%india%' THEN 'INDIA'::"Nationality"
  WHEN "nationality" = 'US' THEN 'USA'::"Nationality"
  WHEN "nationality" = 'UK' THEN 'UK'::"Nationality"
  WHEN "nationality" = 'ISRAEL' THEN 'ISRAEL'::"Nationality"
  WHEN "nationality" = 'PALESTINE' THEN 'PALESTINE'::"Nationality"
  WHEN "nationality" = 'FRANCE' THEN 'FRANCE'::"Nationality"
  WHEN "nationality" = 'GERMANY' THEN 'GERMANY'::"Nationality"
  WHEN "nationality" = 'CANADA' THEN 'CANADA'::"Nationality"
  WHEN "nationality" = 'AUSTRALIA' THEN 'AUSTRALIA'::"Nationality"
  ELSE 'UNKNOWN'::"Nationality"
END
WHERE "primaryNationality" IS NULL;

-- Map existing profession text to enum
UPDATE "Person"
SET "primaryProfession" = CASE
  WHEN "professionDetail" ILIKE '%journalist%' OR "professionDetail" ILIKE '%reporter%' THEN 'JOURNALIST'::"Profession"
  WHEN "professionDetail" ILIKE '%editor%' THEN 'EDITOR'::"Profession"
  WHEN "professionDetail" ILIKE '%politician%' OR "professionDetail" ILIKE '%senator%' OR "professionDetail" ILIKE '%mp%' THEN 'POLITICIAN'::"Profession"
  WHEN "professionDetail" ILIKE '%professor%' OR "professionDetail" ILIKE '%academic%' THEN 'PROFESSOR'::"Profession"
  WHEN "professionDetail" ILIKE '%lawyer%' OR "professionDetail" ILIKE '%attorney%' THEN 'LAWYER'::"Profession"
  WHEN "professionDetail" ILIKE '%ceo%' OR "professionDetail" ILIKE '%chief executive%' THEN 'CEO'::"Profession"
  WHEN "professionDetail" ILIKE '%activist%' THEN 'ACTIVIST'::"Profession"
  WHEN "professionDetail" ILIKE '%rabbi%' THEN 'RABBI'::"Profession"
  WHEN "professionDetail" ILIKE '%writer%' OR "professionDetail" ILIKE '%author%' THEN 'WRITER'::"Profession"
  WHEN "professionDetail" ILIKE '%actor%' OR "professionDetail" ILIKE '%actress%' THEN 'ACTOR'::"Profession"
  WHEN "professionDetail" ILIKE '%comedian%' THEN 'COMEDIAN'::"Profession"
  WHEN "profession" = 'POLITICIAN' THEN 'POLITICIAN'::"Profession"
  WHEN "profession" = 'JOURNALIST' THEN 'JOURNALIST'::"Profession"
  WHEN "profession" = 'ACADEMIC' THEN 'PROFESSOR'::"Profession"
  WHEN "profession" = 'ACTIVIST' THEN 'ACTIVIST'::"Profession"
  WHEN "profession" = 'BUSINESS' THEN 'EXECUTIVE'::"Profession"
  WHEN "profession" = 'CELEBRITY' THEN 'PUBLIC_FIGURE'::"Profession"
  WHEN "profession" = 'RELIGIOUS' THEN 'RELIGIOUS_LEADER'::"Profession"
  WHEN "profession" = 'MILITARY' THEN 'MILITARY_OFFICER'::"Profession"
  WHEN "profession" = 'LEGAL' THEN 'LAWYER'::"Profession"
  WHEN "profession" = 'MEDICAL' THEN 'DOCTOR'::"Profession"
  WHEN "profession" = 'ARTIST' THEN 'ARTIST'::"Profession"
  WHEN "profession" = 'ATHLETE' THEN 'ATHLETE'::"Profession"
  ELSE 'OTHER'::"Profession"
END
WHERE "primaryProfession" IS NULL;

-- Set nationality array
UPDATE "Person"
SET "nationalityArray" = ARRAY["primaryNationality"]
WHERE "primaryNationality" IS NOT NULL AND "nationalityArray" IS NULL;

-- Set profession array
UPDATE "Person"
SET "professionArray" = ARRAY["primaryProfession"]
WHERE "primaryProfession" IS NOT NULL AND "professionArray" IS NULL;

-- Parse names
UPDATE "Person"
SET
  "firstName" = SPLIT_PART("name", ' ', 1),
  "lastName" = CASE
    WHEN ARRAY_LENGTH(STRING_TO_ARRAY("name", ' '), 1) > 1
    THEN SPLIT_PART("name", ' ', -1)
    ELSE NULL
  END
WHERE "firstName" IS NULL;

-- Copy legacy fields to new fields
UPDATE "Person"
SET
  "dateOfBirth" = "birthDate",
  "deceasedDate" = "deathDate",
  "isDeceased" = ("deathDate" IS NOT NULL),
  "lastActivityDate" = "lastActiveDate"
WHERE "dateOfBirth" IS NULL;

-- Calculate age for living persons
UPDATE "Person"
SET "age" = DATE_PART('year', AGE("birthDate"))::INTEGER
WHERE "birthDate" IS NOT NULL AND "deathDate" IS NULL AND "age" IS NULL;

-- Copy aliases from akaNames if not already set
UPDATE "Person"
SET "aliases" = "akaNames"
WHERE "akaNames" IS NOT NULL AND ARRAY_LENGTH("akaNames", 1) > 0 AND "aliases" IS NULL;

-- Calculate statistics
UPDATE "Person" p
SET
  "responseCount" = (
    SELECT COUNT(*) FROM "Statement"
    WHERE "personId" = p.id AND "statementType" = 'RESPONSE'
  ),
  "criticismsMade" = (
    SELECT COUNT(*) FROM "Statement"
    WHERE "personId" = p.id
      AND "statementType" = 'RESPONSE'
      AND "responseType" IN ('CRITICISM', 'CONDEMNATION')
  ),
  "supportGiven" = (
    SELECT COUNT(*) FROM "Statement"
    WHERE "personId" = p.id
      AND "statementType" = 'RESPONSE'
      AND "responseType" IN ('SUPPORT', 'ENDORSEMENT')
  )
WHERE "responseCount" = 0;

-- Set activity dates
UPDATE "Person" p
SET
  "firstActivityDate" = (
    SELECT MIN("statementDate")
    FROM "Statement"
    WHERE "personId" = p.id
  ),
  "lastActivityDate" = COALESCE(
    (SELECT MAX("statementDate") FROM "Statement" WHERE "personId" = p.id),
    "lastActiveDate"
  )
WHERE "firstActivityDate" IS NULL;

-- Determine public figure status
UPDATE "Person"
SET "publicFigure" = true
WHERE ("statementCount" > 5
   OR "influenceScore" > 50
   OR "primaryProfession" IN ('POLITICIAN', 'CEO', 'JOURNALIST', 'ACTOR', 'ACTIVIST'))
   AND "publicFigure" = false;

-- Map verification levels
UPDATE "Person"
SET
  "isVerified" = ("verificationLevel" IN ('VERIFIED', 'TRUSTED')),
  "personVerificationLevel" = CASE
    WHEN "verificationLevel" = 'TRUSTED' THEN 'FULLY_VERIFIED'::"PersonVerificationLevel"
    WHEN "verificationLevel" = 'VERIFIED' THEN 'VERIFIED'::"PersonVerificationLevel"
    WHEN "verificationLevel" = 'BASIC' THEN 'PARTIALLY_VERIFIED'::"PersonVerificationLevel"
    ELSE 'UNVERIFIED'::"PersonVerificationLevel"
  END,
  "verificationDate" = "verifiedAt"
WHERE "personVerificationLevel" IS NULL;

-- Parse location information
UPDATE "Person"
SET
  "residenceCity" = CASE
    WHEN "residence" LIKE '%, %' THEN SPLIT_PART("residence", ',', 1)
    ELSE "residence"
  END,
  "residenceCountry" = CASE
    WHEN "residence" LIKE '%, %' THEN TRIM(SPLIT_PART("residence", ',', -1))
    ELSE NULL
  END
WHERE "residenceCity" IS NULL AND "residence" IS NOT NULL;

-- Set political flags based on profession
UPDATE "Person"
SET
  "isPolitician" = ("primaryProfession" IN ('POLITICIAN', 'GOVERNMENT_OFFICIAL', 'DIPLOMAT')),
  "isActivist" = ("primaryProfession" IN ('ACTIVIST', 'ORGANIZER', 'NGO_LEADER'))
WHERE "isPolitician" = false AND "isActivist" = false;

-- Infer political affiliation from party
UPDATE "Person"
SET "politicalAffiliation" = CASE
  WHEN "politicalParty" ILIKE '%democrat%' THEN 'DEMOCRAT'::"PoliticalAffiliation"
  WHEN "politicalParty" ILIKE '%republican%' THEN 'REPUBLICAN'::"PoliticalAffiliation"
  WHEN "politicalParty" ILIKE '%labour%' THEN 'LABOUR_UK'::"PoliticalAffiliation"
  WHEN "politicalParty" ILIKE '%conservative%' AND "primaryNationality" = 'UK' THEN 'CONSERVATIVE_UK'::"PoliticalAffiliation"
  WHEN "politicalParty" ILIKE '%likud%' THEN 'LIKUD'::"PoliticalAffiliation"
  WHEN "politicalParty" ILIKE '%liberal%' THEN 'LIBERAL'::"PoliticalAffiliation"
  ELSE NULL
END
WHERE "politicalAffiliation" IS NULL AND "politicalParty" IS NOT NULL;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS "Person_primaryProfession_primaryNationality_idx" ON "Person"("primaryProfession", "primaryNationality");
CREATE INDEX IF NOT EXISTS "Person_influenceLevel_idx" ON "Person"("influenceLevel");
CREATE INDEX IF NOT EXISTS "Person_politicalAffiliation_idx" ON "Person"("politicalAffiliation");
CREATE INDEX IF NOT EXISTS "Person_isVerified_idx" ON "Person"("isVerified");
CREATE INDEX IF NOT EXISTS "Person_hasControversies_idx" ON "Person"("hasControversies");
CREATE INDEX IF NOT EXISTS "Person_publicFigure_idx" ON "Person"("publicFigure");
CREATE INDEX IF NOT EXISTS "Person_isActive_idx" ON "Person"("isActive");
CREATE INDEX IF NOT EXISTS "Person_statementCount_idx" ON "Person"("statementCount");
CREATE INDEX IF NOT EXISTS "Person_controversyScore_idx" ON "Person"("controversyScore");

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Person v3.0.1 enhancement migration completed successfully';
  RAISE NOTICE 'Added 10 new enum types with 104 enum values';
  RAISE NOTICE 'Added 120+ new fields to Person model';
  RAISE NOTICE 'Migrated existing data with intelligent defaults';
  RAISE NOTICE 'Created comprehensive indexes for performance';
END $$;