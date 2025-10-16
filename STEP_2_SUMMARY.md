# Step 2: Front-End Visibility Mapping - Summary

**Generated:** 2025-10-16
**Schema Version:** 3.0.1

---

## 📊 EXECUTIVE SUMMARY

### Coverage Statistics
```
Total Database Fields:        182 fields
Fields Displayed:              52 fields (28.57%)
Fields Not Displayed:         130 fields (71.43%)
Legacy Fields Still in Use:     4 fields
Obsolete/Orphaned Fields:       0 fields
```

### Components Analyzed
1. `/pages/people/[slug].tsx` - Person detail page (22 direct fields + 4 relations)
2. `/components/PersonCardEnhanced.tsx` - Person card component (38 direct fields + 1 relation)

---

## ✅ FIELDS CURRENTLY DISPLAYED (52)

### Basic Information (10 fields)
- `name`, `imageUrl`, `bestKnownFor`, `akaNames` ⚠️ legacy
- `bio`, `background`, `shortBio`
- `aliases`, `namePrefix`, `nameSuffix`

### Demographics (5 fields)
- `birthDate` ⚠️ legacy, `birthPlace`
- `deathDate` ⚠️ legacy, `deathPlace`, `isDeceased`

### Professional (7 fields)
- `profession` ⚠️ legacy, `primaryProfession`, `industry`
- `currentTitle`, `currentOrganization`
- `roleDescription`, `yearsActive`

### Political (6 fields)
- `politicalParty`, `politicalBeliefs`
- `politicalAffiliation`, `politicalLeaning`
- `isPolitician`, `isActivist`

### Social Media (7 fields)
- `hasTwitter`, `twitterHandle`, `twitterFollowers`
- `hasLinkedIn`
- `hasInstagram`, `instagramFollowers`
- `totalSocialReach`

### Influence & Public Profile (3 fields)
- `influenceLevel`, `influenceScore`
- `publicFigure`

### Controversy & Reputation (5 fields)
- `hasControversies`, `controversyScore`
- `reputationStatus`
- `hasBeenCancelled`, `cancelledDate`

### Statistics (4 fields)
- `statementCount`, `responseCount`
- `supportGiven`, `criticismsMade`

### Other (5 fields)
- `residence` (location)
- `racialGroup`, `nationalities` (relational)
- `religion`
- `isVerified`, `isPEP`, `isHighProfile`

### Relational Data (4 relations)
- ✅ `nationalities` → `PersonNationality[]` with `Country`
- ✅ `affiliations` → `Affiliation[]` with `Organization`
- ✅ `cases` → `Case[]` with tags, counts, statements
- ✅ `statements` → `Statement[]` with case, sources, responses

---

## ❌ HIGH-PRIORITY MISSING FIELDS (12)

These fields exist in the database, contain valuable information, but are NOT displayed:

### External Verification
- 🔗 `wikipediaUrl` - Wikipedia page for verification
- 🔗 `officialWebsite` - Official personal/professional website

### Structured Data Arrays
- 📋 `notableFor[]` - Array of notable achievements (more structured than `bestKnownFor`)
- 🏛️ `knownPositions[]` - Specific political positions/stances
- 📣 `advocacy[]` - Advocacy causes and issues

### Demographics
- 🎂 `age` - Calculated age (useful context)

### Activity Tracking
- 📅 `lastActivityDate` - Most recent activity/statement date

### Legal Status
- ⚖️ `hasLegalIssues` - Currently has legal issues
- 🔍 `underInvestigation` - Under investigation
- 🚫 `hasSanctions` - Has sanctions imposed

### Relational Data
- 📰 `journalistProfile` - Journalist-specific data (beat, outlet, articles)
- ⚠️ `repercussions[]` - Consequences this person has faced

---

## 📁 MISSING FIELD CATEGORIES

### Education (4 fields) - 0% displayed
- `educationLevel`, `degrees[]`, `universities[]`, `academicTitles[]`

### Legal (8 fields) - 0% displayed
- `hasLegalIssues`, `legalIssueNotes`, `underInvestigation`, `investigationType`
- `hasSanctions`, `sanctionDetails`, `hasCriminalRecord`, `criminalNotes`

### Contact Information (3 fields) - 0% displayed
- `publicEmail`, `agentEmail`, `pressContact`

### Activity Tracking (4 fields) - 0% displayed
- `firstActivityDate`, `lastActivityDate`, `mostActiveYear`, `lastActiveDate` ⚠️ legacy

### Metadata (8 fields) - 0% displayed
- `createdAt`, `updatedAt`, `createdBy`, `lastEditedBy`
- `dataSource`, `importSource`, `lastReviewDate`, `needsReview`

### Notes (4 fields) - 0% displayed
- `publicNotes`, `internalNotes`, `researchNotes`, `editorialNotes`

### Location Details (6 fields) - 17% displayed (only `residence`)
- `residenceCountry`, `residenceState`, `residenceCity`
- `workCountry`, `workCity`

### Verification Details (9 fields) - 11% displayed (only `isVerified`)
- `verificationLevel`, `personVerificationLevel`, `verificationDate`, `verificationNotes`
- `verifiedAt`, `verifiedBy`, `wikipediaUrl`, `officialWebsite`, `linkedInVerified`

---

## ⚠️ LEGACY FIELDS STILL IN USE

These fields should be migrated to their newer equivalents:

| Legacy Field | New Field | Location | Status |
|--------------|-----------|----------|--------|
| `akaNames` | `aliases` | `/pages/people/[slug].tsx:110` | Both exist, legacy displayed |
| `birthDate` | `dateOfBirth` | `/pages/people/[slug].tsx:117` | Both exist, legacy displayed |
| `deathDate` | `deceasedDate` | `/pages/people/[slug].tsx:128` | Both exist, legacy displayed |
| `profession` | `primaryProfession` | `/pages/people/[slug].tsx:176` | Both exist, both displayed |

---

## 🔄 DERIVED/COMPUTED FIELDS

The front-end computes these display values from database fields:

1. **Age with label** (e.g., "age 65")
   - Sources: `birthDate`, `deathDate`
   - Function: `getAgeString(birthDate, deathDate)`
   - Location: `/pages/people/[slug].tsx:123-134`

2. **Full formatted title** (e.g., "Dr. John Smith Jr.")
   - Sources: `namePrefix`, `name`, `nameSuffix`
   - Function: `formatTitle()`
   - Location: `/components/PersonCardEnhanced.tsx:63-69`

3. **Nationality with flags** (e.g., "🇺🇸 United States ★")
   - Sources: `nationalities.countryCode`, `country.name_en`, `country.flag_emoji`
   - Function: `formatCountryDisplay()`
   - Location: `/pages/people/[slug].tsx:147-157`

4. **Abbreviated follower counts** (e.g., "1.2M")
   - Sources: `twitterFollowers`, `instagramFollowers`, `totalSocialReach`
   - Function: `formatFollowers(count)`
   - Location: `/components/PersonCardEnhanced.tsx:71-76`

5. **Response count per case**
   - Sources: `case.statements[]` filtered by `statementType='RESPONSE'`
   - Computation: Server-side in API
   - Location: `/pages/api/people/[slug].ts:825-840`

---

## 🔌 API DATA FETCHING ANALYSIS

**Endpoint:** `/pages/api/people/[slug].ts`

### Currently Fetched Relations
```typescript
include: {
  nationalities: {
    include: { country: true },
    orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }]
  },
  cases: {
    include: { tags: true, _count: { ... } },
    orderBy: { caseDate: 'desc' }
  },
  statements: {
    include: { case, sources, respondsTo, responses },
    orderBy: { statementDate: 'desc' }
  },
  affiliations: {
    include: { organization: true },
    orderBy: { isActive: 'desc' }
  }
}
```

### NOT Currently Fetched (but should be)
- `journalistProfile` - Journalist-specific data
- `repercussions` - Consequences faced
- `StatementAuthor` - Multi-author statements
- `groupStatements` - Group/joint statements

### Field Availability
✅ **All 182 direct fields** are implicitly included (Prisma returns all scalar fields by default)
❌ **4 relational fields** are not fetched and therefore cannot be displayed

---

## 📝 TYPE DEFINITION ISSUES

**File:** `/types/index.ts`
**Interface:** `PersonWithRelations`

### Currently Defined
```typescript
interface PersonWithRelations extends Person {
  nationalities?: PersonNationalityWithCountry[];
  cases?: CaseWithRelations[]
  statements?: StatementWithRelations[]
  _count?: { cases, statements, responses }
}
```

### Missing from Type Definition
- `affiliations` - Used in code but not typed! ⚠️
- `journalistProfile` - Not typed, not fetched
- `repercussions` - Not typed, not fetched
- `StatementAuthor` - Not typed, not fetched
- `groupStatements` - Not typed, not fetched

**Action Required:** Update type definition to match actual usage and planned usage.

---

## 🎯 RECOMMENDATIONS

### Immediate (Step 3 Prerequisites)
1. ✅ Update `PersonWithRelations` type to include all relations
2. ✅ Migrate UI from legacy fields to new fields
3. ✅ Add missing relations to API fetch (`journalistProfile`, `repercussions`)
4. ✅ Display external verification links (`wikipediaUrl`, `officialWebsite`)

### Short-term (Admin Dashboard)
1. Create admin forms for all 182 fields (prioritize high-value missing fields)
2. Organize fields into logical groups/tabs
3. Implement validation based on field types and enums
4. Add field-level help text for complex fields

### Medium-term (Front-end Enhancement)
1. Add education section to person detail page
2. Display `notableFor[]` array as structured achievements
3. Create political positions section using `knownPositions[]` and `advocacy[]`
4. Add legal status indicators
5. Show activity timeline using date fields
6. Create journalist profile section for journalists

### Long-term (Advanced Features)
1. Build comprehensive person timeline visualization
2. Create network graph of affiliations and connections
3. Add repercussions timeline
4. Implement data completeness indicators
5. Build automated data enrichment workflows

---

## 📂 OUTPUT FILES GENERATED

1. ✅ `PERSON_SCHEMA_AUDIT.json` - Complete database schema (Step 1)
2. ✅ `PERSON_FIELD_VISIBILITY_MAPPING.json` - Detailed visibility analysis
3. ✅ `people-field-comparison.json` - Programmatic comparison (this step)
4. ✅ `STEP_2_SUMMARY.md` - Human-readable summary (this file)

---

## 🚀 NEXT STEPS

### Step 3: Build Admin Dashboard Forms
- Use field mapping to create comprehensive edit forms
- Group fields by category (basic info, professional, political, etc.)
- Implement validation for enums, required fields, data types
- Create tabbed interface for 182 fields
- Prioritize high-value missing fields

### Step 4: Missing Field Detection
- Identify which high-priority fields are NULL/empty
- Calculate completeness scores per person
- Flag persons with incomplete critical data
- Prioritize data collection efforts

### Step 5: Data Synchronization Validation
- Test that admin edits to all 182 fields sync correctly
- Verify front-end updates when new fields are displayed
- Ensure API responses include necessary field data
- Validate cache field updates (nationality_primary_code, etc.)

---

## 📊 COMPLETION STATUS

**Step 1:** ✅ Complete - Database schema fully audited (182 fields)
**Step 2:** ✅ Complete - Front-end visibility fully mapped (52/182 displayed)
**Step 3:** ⏳ Pending - Admin dashboard forms
**Step 4:** ⏳ Pending - Missing field detection
**Step 5:** ⏳ Pending - Data synchronization validation

---

**End of Step 2 Summary**
