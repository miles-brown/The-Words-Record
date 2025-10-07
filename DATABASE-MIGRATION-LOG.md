# Database Migration Log

## Migration: Death Monitoring Fields (2025-10-07)

### Applied Changes
**Date**: October 7, 2025
**Database**: Supabase PostgreSQL (aws-1-eu-west-1)
**Method**: Direct SQL execution via psql

### SQL Executed
```sql
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "deathCause" TEXT;
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "lastDeathCheck" TIMESTAMP(3);
```

### Verification
```bash
# Verified columns exist:
psql -c "SELECT column_name FROM information_schema.columns
         WHERE table_name = 'Person'
         AND column_name IN ('deathCause', 'lastDeathCheck');"

# Result:
#   column_name
# ----------------
#  lastDeathCheck
#  deathCause
# (2 rows)
```

### Prisma Schema Status
- Schema file already contained fields (lines 155-156 in `prisma/schema.prisma`)
- Migration file existed: `prisma/migrations/20251007_add_death_monitoring_fields/migration.sql`
- **Issue**: Migration was never applied to production Supabase database
- **Resolution**: Applied manually using direct psql connection (port 5432, not pooler)

### Related Systems
- **Prisma Client**: Regenerated after migration (`npx prisma generate`)
- **Next.js Build Cache**: Cleared (`.next` directory removed)
- **JasPIZ Harvester**: Now has access to `deathCause` field for death monitoring automation

---

## Database Schema Audit (2025-10-07)

### Person Table Column Count
**Total Columns**: 159
**v3.0.1 Migration Status**: ✅ Successfully applied

### Key v3.0.1 Fields Confirmed in Database
- **Name Fields**: fullName, firstName, middleName, lastName, namePrefix, nameSuffix
- **Alternate Names**: aliases, hebrewName, arabicName, nativeName, akaNames
- **Demographics**: gender (ENUM), age, dateOfBirth
- **Nationality**: nationalityArray, primaryNationality, nationality2, nationality3
- **Profession**: professionArray, primaryProfession, professionDetails, industry, specialization
- **Education**: educationLevel, degrees, universities, academicTitles
- **Employment**: yearsExperience, employer, jobTitle, currentPosition
- **Political**: politicalAffiliation, politicalLeaning, politicalParty, politicalBeliefs
- **Religion**: religion, religionDenomination
- **Verification**: verificationLevel, personVerificationLevel, verifiedAt, verifiedBy
- **Activity Tracking**: statementCount, incidentCount, lastActiveDate, firstActivityDate
- **Controversy**: hasControversies, controversyScore, reputationStatus, hasBeenCancelled
- **Legal**: hasLegalIssues, hasCriminalRecord, underInvestigation, hasSanctions
- **Social Metrics**: criticismsMade, criticismsReceived, supportGiven, supportReceived
- **Death Monitoring**: isDeceased, deceasedDate, deathPlace, **deathCause**, **lastDeathCheck**

### Migration History
1. **v3 Initial Schema** (20251006000042_init_v3_schema)
2. **v3.0.1 Person Enhancement** (v3.0.1-person-enhancement.sql) - ✅ Applied
3. **v3.0.1 Incident Enhancement** (v3.0.1-incident-enhancement.sql) - ✅ Applied
4. **v3.0.1 Organization Enhancement** (v3.0.1-organization-enhancement.sql) - ✅ Applied
5. **Death Monitoring Fields** (20251007_add_death_monitoring_fields) - ✅ Applied manually

### Known Issues
- **UI Display Gap**: Person profile page ([pages/people/[slug].tsx](pages/people/[slug].tsx)) only displays ~20 of 159 available fields
- **Missing UI Fields**: Most v3.0.1 fields are in database but not rendered in frontend
- **Relationship Labels**: Family relationship logic (father/son, mother/daughter) not yet implemented in UI

---

## Action Items

### Completed ✅
- [x] Add `deathCause` and `lastDeathCheck` columns to Person table
- [x] Verify all v3.0.1 migrations applied successfully
- [x] Regenerate Prisma Client with new schema
- [x] Clear Next.js build cache

### Pending ⚠️
- [ ] Expand Person profile UI to display selected v3.0.1 fields
- [ ] Implement relationship label logic (gender-based automatic labeling)
- [ ] Fix Statements page "Failed to load incidents" error
- [ ] Restore Organizations logo placeholder functionality
- [ ] Integrate `deathCause` into death monitoring automation script

---

## Technical Notes

### Why Migration Failed Initially
- **Connection Pooling**: Prisma migrate uses prepared statements that conflict with Supabase's PgBouncer pooler
- **Error**: `ERROR: prepared statement "s1" already exists`
- **Solution**: Use direct database connection (port 5432) instead of pooler (port 6543)

### Proper Migration Workflow for Supabase
```bash
# Option A: Direct SQL (recommended for production)
psql "postgresql://user:pass@host:5432/db" -c "ALTER TABLE..."

# Option B: Prisma db push (non-pooled connection)
# Set in .env:
# DATABASE_URL="postgresql://user:pass@host:5432/db"
npx prisma db push

# NOT recommended:
# npx prisma migrate dev  # Fails with pooler
```

### Vercel Deployment Considerations
- Database must be accessible during build (for static page generation)
- Missing columns cause build failures for pages that query those fields
- Always verify schema/database sync before pushing to production
