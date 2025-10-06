-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "ProfessionType" AS ENUM ('POLITICIAN', 'JOURNALIST', 'ACADEMIC', 'ACTIVIST', 'BUSINESS', 'CELEBRITY', 'RELIGIOUS', 'MILITARY', 'LEGAL', 'MEDICAL', 'ARTIST', 'ATHLETE', 'OTHER');

-- CreateEnum
CREATE TYPE "NationalityType" AS ENUM ('US', 'UK', 'ISRAEL', 'PALESTINE', 'FRANCE', 'GERMANY', 'CANADA', 'AUSTRALIA', 'OTHER');

-- CreateEnum
CREATE TYPE "VerificationLevel" AS ENUM ('UNVERIFIED', 'BASIC', 'VERIFIED', 'TRUSTED');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('MEDIA_OUTLET', 'POLITICAL_PARTY', 'NGO', 'CORPORATION', 'UNIVERSITY', 'THINK_TANK', 'GOVERNMENT_AGENCY', 'RELIGIOUS_ORGANIZATION', 'ADVOCACY_GROUP', 'OTHER');

-- CreateEnum
CREATE TYPE "StatementType" AS ENUM ('ORIGINAL', 'RESPONSE', 'CLARIFICATION', 'RETRACTION', 'APOLOGY');

-- CreateEnum
CREATE TYPE "ResponseType" AS ENUM ('CRITICISM', 'SUPPORT', 'MIXED_RESPONSE', 'CLARIFICATION_CHALLENGE', 'DISCIPLINARY_ACTION', 'PROFESSIONAL_CONSEQUENCE', 'APOLOGY_RESPONSE', 'INSTITUTIONAL_RESPONSE', 'OTHER');

-- CreateEnum
CREATE TYPE "RoleLevel" AS ENUM ('INTERN', 'JUNIOR', 'MID', 'SENIOR', 'EXECUTIVE', 'BOARD', 'HONORARY');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('DOCUMENTED', 'VERIFIED', 'DISPUTED', 'RETRACTED', 'ONGOING');

-- CreateEnum
CREATE TYPE "RepercussionType" AS ENUM ('TERMINATION', 'SUSPENSION', 'RESIGNATION', 'DEMOTION', 'CONTRACT_CANCELLATION', 'BLACKLISTING', 'LAWSUIT', 'ARREST', 'INVESTIGATION', 'CHARGES_FILED', 'COORDINATED_DEFAMATION', 'NARRATIVE_REFRAMING', 'CHARACTER_ASSASSINATION', 'MANUFACTURED_SCANDAL', 'PUBLIC_APOLOGY', 'BOYCOTT', 'HARASSMENT_CAMPAIGN', 'DEATH_THREATS', 'LOSS_OF_PLATFORM', 'ACADEMIC_CENSURE', 'LICENSE_REVOCATION', 'PROFESSIONAL_SHUNNING', 'FUNDING_WITHDRAWAL', 'SPONSOR_LOSS', 'FINE', 'DAMAGES_AWARDED');

-- CreateEnum
CREATE TYPE "MediaBias" AS ENUM ('FAR_LEFT', 'LEFT', 'CENTER_LEFT', 'CENTER', 'CENTER_RIGHT', 'RIGHT', 'FAR_RIGHT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "CredibilityRating" AS ENUM ('VERY_LOW', 'LOW', 'MIXED', 'HIGH', 'VERY_HIGH', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "TagCategory" AS ENUM ('THEME', 'LOCATION', 'ORGANIZATION', 'EVENT', 'CONTROVERSY', 'POLICY', 'OTHER');

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "imageUrl" TEXT,
    "profession" "ProfessionType" NOT NULL DEFAULT 'OTHER',
    "professionDetail" TEXT,
    "nationality" "NationalityType" NOT NULL DEFAULT 'OTHER',
    "nationalityDetail" TEXT,
    "birthDate" TIMESTAMP(3),
    "deathDate" TIMESTAMP(3),
    "akaNames" TEXT[],
    "background" TEXT,
    "racialGroup" TEXT,
    "religion" TEXT,
    "bestKnownFor" TEXT,
    "birthPlace" TEXT,
    "politicalBeliefs" TEXT,
    "politicalParty" TEXT,
    "residence" TEXT,
    "roleDescription" TEXT,
    "yearsActive" TEXT,
    "deathPlace" TEXT,
    "religionDenomination" TEXT,
    "verificationLevel" "VerificationLevel" NOT NULL DEFAULT 'UNVERIFIED',
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "statementCount" INTEGER NOT NULL DEFAULT 0,
    "incidentCount" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "legalName" TEXT,
    "registrationNumber" TEXT,
    "taxId" TEXT,
    "isPersonalBrand" BOOLEAN NOT NULL DEFAULT false,
    "parentOrganizationId" TEXT,
    "founded" TIMESTAMP(3),
    "dissolved" TIMESTAMP(3),
    "headquarters" TEXT,
    "operatingCountries" TEXT[],
    "verificationLevel" "VerificationLevel" NOT NULL DEFAULT 'UNVERIFIED',
    "verifiedAt" TIMESTAMP(3),
    "employeeCount" INTEGER,
    "annualRevenue" DOUBLE PRECISION,
    "statementCount" INTEGER NOT NULL DEFAULT 0,
    "incidentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaOutlet" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "circulationSize" INTEGER,
    "primaryLanguage" TEXT NOT NULL DEFAULT 'en',
    "languages" TEXT[],
    "mediaType" TEXT[],
    "politicalBias" "MediaBias" NOT NULL DEFAULT 'UNKNOWN',
    "credibility" "CredibilityRating" NOT NULL DEFAULT 'UNKNOWN',
    "factCheckRating" TEXT,
    "ownershipType" TEXT,
    "majorShareholders" TEXT[],
    "fundingSources" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaOutlet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Journalist" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "currentOutletId" TEXT,
    "beat" TEXT[],
    "isFreelance" BOOLEAN NOT NULL DEFAULT false,
    "verificationType" TEXT,
    "twitterHandle" TEXT,
    "linkedinProfile" TEXT,
    "personalWebsite" TEXT,
    "articlesCount" INTEGER NOT NULL DEFAULT 0,
    "averageBias" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Journalist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayLabel" TEXT,
    "description" TEXT NOT NULL,
    "topicType" TEXT,
    "searchKeywords" TEXT[],
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "scope" TEXT,
    "location" TEXT,
    "incidentCount" INTEGER NOT NULL DEFAULT 0,
    "participantCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "publicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "IncidentStatus" NOT NULL DEFAULT 'DOCUMENTED',
    "severity" "IncidentSeverity",
    "severityScore" INTEGER,
    "locationCity" TEXT,
    "locationState" TEXT,
    "locationCountry" TEXT,
    "locationDetail" TEXT,
    "mediaFraming" TEXT,
    "triggeringEvent" TEXT,
    "outcome" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Statement" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "context" TEXT,
    "statementType" "StatementType" NOT NULL DEFAULT 'ORIGINAL',
    "responseType" "ResponseType",
    "statementDate" TIMESTAMP(3) NOT NULL,
    "medium" TEXT,
    "mediumUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "lostEmployment" BOOLEAN NOT NULL DEFAULT false,
    "lostContracts" BOOLEAN NOT NULL DEFAULT false,
    "paintedNegatively" BOOLEAN NOT NULL DEFAULT false,
    "repercussionDetails" TEXT,
    "responseImpact" TEXT,
    "personId" TEXT,
    "organizationId" TEXT,
    "respondsToId" TEXT,
    "incidentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Statement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repercussion" (
    "id" TEXT NOT NULL,
    "type" "RepercussionType" NOT NULL,
    "description" TEXT NOT NULL,
    "isTactical" BOOLEAN NOT NULL DEFAULT false,
    "coordinationEvidence" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "duration" INTEGER,
    "severityScore" INTEGER NOT NULL,
    "impactDescription" TEXT,
    "affectedPersonId" TEXT,
    "affectedOrgId" TEXT,
    "initiatingOrgs" TEXT[],
    "initiatingPersons" TEXT[],
    "triggeringStatementId" TEXT,
    "responseStatementId" TEXT,
    "incidentId" TEXT NOT NULL,
    "mediaOutlets" TEXT[],
    "coverageIntensity" TEXT,
    "outcome" TEXT,
    "isOngoing" BOOLEAN NOT NULL DEFAULT false,
    "wasSuccessful" BOOLEAN,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repercussion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "publication" TEXT,
    "publicationSlug" TEXT,
    "mediaOutletId" TEXT,
    "author" TEXT,
    "journalistId" TEXT,
    "publishDate" TIMESTAMP(3),
    "accessDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVerified" TIMESTAMP(3),
    "credibility" "CredibilityRating" NOT NULL DEFAULT 'UNKNOWN',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archiveUrl" TEXT,
    "qualityScore" INTEGER,
    "hasByline" BOOLEAN NOT NULL DEFAULT false,
    "hasMultipleSources" BOOLEAN NOT NULL DEFAULT false,
    "incidentId" TEXT,
    "statementId" TEXT,
    "repercussionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Affiliation" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "roleLevel" "RoleLevel" NOT NULL DEFAULT 'MID',
    "department" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "responsibilities" TEXT[],
    "appearanceType" TEXT,
    "frequency" TEXT,
    "isPaid" BOOLEAN,
    "compensationType" TEXT,
    "personId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Affiliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "TagCategory" NOT NULL DEFAULT 'OTHER',
    "parentTagId" TEXT,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "isControversial" BOOLEAN NOT NULL DEFAULT false,
    "controversyScore" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicIncident" (
    "topicId" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "relevanceScore" INTEGER,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicIncident_pkey" PRIMARY KEY ("topicId","incidentId")
);

-- CreateTable
CREATE TABLE "_PersonGroupStatements" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PersonGroupStatements_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OrganizationGroupStatements" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OrganizationGroupStatements_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_IncidentTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_IncidentTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OrganizationIncidents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OrganizationIncidents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PersonIncidents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PersonIncidents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TopicTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TopicTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Person_slug_key" ON "Person"("slug");

-- CreateIndex
CREATE INDEX "Person_slug_idx" ON "Person"("slug");

-- CreateIndex
CREATE INDEX "Person_verificationLevel_idx" ON "Person"("verificationLevel");

-- CreateIndex
CREATE INDEX "Person_profession_idx" ON "Person"("profession");

-- CreateIndex
CREATE INDEX "Person_nationality_idx" ON "Person"("nationality");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_type_idx" ON "Organization"("type");

-- CreateIndex
CREATE INDEX "Organization_verificationLevel_idx" ON "Organization"("verificationLevel");

-- CreateIndex
CREATE UNIQUE INDEX "MediaOutlet_organizationId_key" ON "MediaOutlet"("organizationId");

-- CreateIndex
CREATE INDEX "MediaOutlet_politicalBias_idx" ON "MediaOutlet"("politicalBias");

-- CreateIndex
CREATE INDEX "MediaOutlet_credibility_idx" ON "MediaOutlet"("credibility");

-- CreateIndex
CREATE UNIQUE INDEX "Journalist_personId_key" ON "Journalist"("personId");

-- CreateIndex
CREATE INDEX "Journalist_currentOutletId_idx" ON "Journalist"("currentOutletId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- CreateIndex
CREATE INDEX "Topic_slug_idx" ON "Topic"("slug");

-- CreateIndex
CREATE INDEX "Topic_isActive_idx" ON "Topic"("isActive");

-- CreateIndex
CREATE INDEX "Topic_priority_idx" ON "Topic"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "Incident_slug_key" ON "Incident"("slug");

-- CreateIndex
CREATE INDEX "Incident_slug_idx" ON "Incident"("slug");

-- CreateIndex
CREATE INDEX "Incident_status_idx" ON "Incident"("status");

-- CreateIndex
CREATE INDEX "Incident_severity_idx" ON "Incident"("severity");

-- CreateIndex
CREATE INDEX "Incident_incidentDate_idx" ON "Incident"("incidentDate");

-- CreateIndex
CREATE INDEX "Statement_statementType_idx" ON "Statement"("statementType");

-- CreateIndex
CREATE INDEX "Statement_personId_idx" ON "Statement"("personId");

-- CreateIndex
CREATE INDEX "Statement_organizationId_idx" ON "Statement"("organizationId");

-- CreateIndex
CREATE INDEX "Statement_incidentId_idx" ON "Statement"("incidentId");

-- CreateIndex
CREATE INDEX "Statement_respondsToId_idx" ON "Statement"("respondsToId");

-- CreateIndex
CREATE UNIQUE INDEX "Statement_personId_incidentId_content_key" ON "Statement"("personId", "incidentId", "content");

-- CreateIndex
CREATE INDEX "Repercussion_type_idx" ON "Repercussion"("type");

-- CreateIndex
CREATE INDEX "Repercussion_isTactical_idx" ON "Repercussion"("isTactical");

-- CreateIndex
CREATE INDEX "Repercussion_affectedPersonId_idx" ON "Repercussion"("affectedPersonId");

-- CreateIndex
CREATE INDEX "Repercussion_affectedOrgId_idx" ON "Repercussion"("affectedOrgId");

-- CreateIndex
CREATE INDEX "Repercussion_incidentId_idx" ON "Repercussion"("incidentId");

-- CreateIndex
CREATE INDEX "Source_credibility_idx" ON "Source"("credibility");

-- CreateIndex
CREATE INDEX "Source_mediaOutletId_idx" ON "Source"("mediaOutletId");

-- CreateIndex
CREATE INDEX "Source_journalistId_idx" ON "Source"("journalistId");

-- CreateIndex
CREATE INDEX "Source_incidentId_idx" ON "Source"("incidentId");

-- CreateIndex
CREATE INDEX "Source_statementId_idx" ON "Source"("statementId");

-- CreateIndex
CREATE INDEX "Affiliation_personId_idx" ON "Affiliation"("personId");

-- CreateIndex
CREATE INDEX "Affiliation_organizationId_idx" ON "Affiliation"("organizationId");

-- CreateIndex
CREATE INDEX "Affiliation_isActive_idx" ON "Affiliation"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Affiliation_personId_organizationId_role_key" ON "Affiliation"("personId", "organizationId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_slug_idx" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_category_idx" ON "Tag"("category");

-- CreateIndex
CREATE INDEX "Tag_usageCount_idx" ON "Tag"("usageCount");

-- CreateIndex
CREATE INDEX "TopicIncident_topicId_idx" ON "TopicIncident"("topicId");

-- CreateIndex
CREATE INDEX "TopicIncident_incidentId_idx" ON "TopicIncident"("incidentId");

-- CreateIndex
CREATE INDEX "_PersonGroupStatements_B_index" ON "_PersonGroupStatements"("B");

-- CreateIndex
CREATE INDEX "_OrganizationGroupStatements_B_index" ON "_OrganizationGroupStatements"("B");

-- CreateIndex
CREATE INDEX "_IncidentTags_B_index" ON "_IncidentTags"("B");

-- CreateIndex
CREATE INDEX "_OrganizationIncidents_B_index" ON "_OrganizationIncidents"("B");

-- CreateIndex
CREATE INDEX "_PersonIncidents_B_index" ON "_PersonIncidents"("B");

-- CreateIndex
CREATE INDEX "_TopicTags_B_index" ON "_TopicTags"("B");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_parentOrganizationId_fkey" FOREIGN KEY ("parentOrganizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaOutlet" ADD CONSTRAINT "MediaOutlet_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journalist" ADD CONSTRAINT "Journalist_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journalist" ADD CONSTRAINT "Journalist_currentOutletId_fkey" FOREIGN KEY ("currentOutletId") REFERENCES "MediaOutlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statement" ADD CONSTRAINT "Statement_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statement" ADD CONSTRAINT "Statement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statement" ADD CONSTRAINT "Statement_respondsToId_fkey" FOREIGN KEY ("respondsToId") REFERENCES "Statement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statement" ADD CONSTRAINT "Statement_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repercussion" ADD CONSTRAINT "Repercussion_affectedPersonId_fkey" FOREIGN KEY ("affectedPersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repercussion" ADD CONSTRAINT "Repercussion_affectedOrgId_fkey" FOREIGN KEY ("affectedOrgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repercussion" ADD CONSTRAINT "Repercussion_triggeringStatementId_fkey" FOREIGN KEY ("triggeringStatementId") REFERENCES "Statement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repercussion" ADD CONSTRAINT "Repercussion_responseStatementId_fkey" FOREIGN KEY ("responseStatementId") REFERENCES "Statement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repercussion" ADD CONSTRAINT "Repercussion_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_mediaOutletId_fkey" FOREIGN KEY ("mediaOutletId") REFERENCES "MediaOutlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_journalistId_fkey" FOREIGN KEY ("journalistId") REFERENCES "Journalist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_statementId_fkey" FOREIGN KEY ("statementId") REFERENCES "Statement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_repercussionId_fkey" FOREIGN KEY ("repercussionId") REFERENCES "Repercussion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affiliation" ADD CONSTRAINT "Affiliation_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affiliation" ADD CONSTRAINT "Affiliation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_parentTagId_fkey" FOREIGN KEY ("parentTagId") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicIncident" ADD CONSTRAINT "TopicIncident_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicIncident" ADD CONSTRAINT "TopicIncident_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PersonGroupStatements" ADD CONSTRAINT "_PersonGroupStatements_A_fkey" FOREIGN KEY ("A") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PersonGroupStatements" ADD CONSTRAINT "_PersonGroupStatements_B_fkey" FOREIGN KEY ("B") REFERENCES "Statement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationGroupStatements" ADD CONSTRAINT "_OrganizationGroupStatements_A_fkey" FOREIGN KEY ("A") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationGroupStatements" ADD CONSTRAINT "_OrganizationGroupStatements_B_fkey" FOREIGN KEY ("B") REFERENCES "Statement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IncidentTags" ADD CONSTRAINT "_IncidentTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IncidentTags" ADD CONSTRAINT "_IncidentTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationIncidents" ADD CONSTRAINT "_OrganizationIncidents_A_fkey" FOREIGN KEY ("A") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationIncidents" ADD CONSTRAINT "_OrganizationIncidents_B_fkey" FOREIGN KEY ("B") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PersonIncidents" ADD CONSTRAINT "_PersonIncidents_A_fkey" FOREIGN KEY ("A") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PersonIncidents" ADD CONSTRAINT "_PersonIncidents_B_fkey" FOREIGN KEY ("B") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TopicTags" ADD CONSTRAINT "_TopicTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TopicTags" ADD CONSTRAINT "_TopicTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
