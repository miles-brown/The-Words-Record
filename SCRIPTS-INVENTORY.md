# Scripts Inventory - Complete Overview

## Total Scripts: 16

All scripts are located in the `/scripts` directory.

---

## 📊 Categories

### 🤖 Automation Scripts (3)
Scripts that run automatically to maintain data quality and promote content.

### 📥 Data Import Scripts (3)
Scripts for importing data from various sources into the database.

### 👤 Admin Management Scripts (5)
Scripts for managing admin users, passwords, and authentication.

### 🔧 Utility & Maintenance Scripts (3)
Scripts for fixing issues, debugging, and validation.

### 🗄️ Database Migration Scripts (2)
Scripts for migrating data structures and legacy data.

---

## 🤖 Automation Scripts

### 1. **check-death-updates.ts**
**Purpose**: Automatically checks for deceased people in the database using Claude API

**What it does**:
- Searches for death information for people based on age-based schedules:
  - **80+ years**: Check every 2 weeks
  - **60-79 years**: Check every 4 weeks
  - **<60 years**: Check every 8 months
- Uses Claude API to search obituaries, news articles, and official death records
- Updates Person records with death date, place, and cause
- Creates Source records for death information citations
- Tracks last check date to avoid unnecessary API calls

**Run with**:
```bash
npm run automation:death-check              # Scheduled checks
npm run automation:death-check-force        # Force check all
npm run automation:death-check-80           # Check 80+ only
npx tsx scripts/check-death-updates.ts      # Direct execution
```

**Status**: ✅ Updated for current schema

---

### 2. **auto-promote-statements.js**
**Purpose**: Automatically promotes statements to cases when they have significant engagement

**What it does**:
- Finds all statements with more than 2 responses
- Checks if they're already promoted to real cases
- Promotes qualifying statements to full case status
- Sets the original statement as the principal/originating statement
- Calculates qualification scores (0-100) based on response count:
  - 3-5 responses: 40-60 points
  - 6-10 responses: 61-80 points
  - 11+ responses: 81-100 points
- Updates case visibility to PUBLIC and status to DOCUMENTED
- Records promotion metadata (date, reason, score)

**Run with**:
```bash
npm run automation:auto-promote             # Run promotion
node scripts/auto-promote-statements.js     # Direct execution
```

**Status**: ✅ Updated for current schema

---

### 3. **analyze-statement-responses.js**
**Purpose**: Analyzes statement response distribution and provides insights

**What it does**:
- Fetches all statements with response counts
- Groups statements by response count
- Calculates statistics:
  - Total statements and responses
  - Average responses per statement
  - Statements with any responses
  - Statements qualifying for auto-promotion (>2 responses)
- Shows top 20 statements by response count
- Provides insights on promotion thresholds
- Generates distribution charts and recommendations

**Run with**:
```bash
npm run automation:analyze-responses        # Run analysis
node scripts/analyze-statement-responses.js # Direct execution
```

**Status**: ✅ Compatible with current schema

---

## 📥 Data Import Scripts

### 4. **import-csv.ts**
**Purpose**: Import people and cases from CSV files

**What it does**:
- Reads CSV files with structured data
- Auto-detects record type (Person or Case)
- Imports people with profession, nationality, bio, etc.
- Imports cases with title, summary, date, location
- Creates database records with proper slugs
- Handles duplicates and validation

**Run with**:
```bash
npx tsx scripts/import-csv.ts path/to/file.csv
```

**Status**: ✅ Available for data import

---

### 5. **import-markdown.ts**
**Purpose**: Import cases from structured Markdown files

**What it does**:
- Parses Markdown files with case data
- Extracts structured fields:
  - Name, profession, date
  - Exact wording of statement
  - Context and platform
  - Media coverage
  - Categories and responses
  - Citations
- Creates Person and Case records
- Links statements to people and cases
- Creates Source records from citations

**Run with**:
```bash
npx tsx scripts/import-markdown.ts path/to/file.md
```

**Status**: ✅ Available for markdown import

---

### 6. **validate-apps-module.ts**
**Purpose**: Validates the Apps module components and database

**What it does**:
- Validates database connection
- Checks for Apps-related tables (Integration, Webhook, Script, etc.)
- Tests query performance
- Validates file structure
- Checks API endpoints exist
- Validates component files
- Tests API route functionality
- Generates comprehensive validation report

**Run with**:
```bash
npx ts-node scripts/validate-apps-module.ts
```

**Status**: ✅ Validation tool

---

## 👤 Admin Management Scripts

### 7. **create-admin-user.ts**
**Purpose**: Create new admin user accounts

**What it does**:
- Prompts for admin credentials (username, email, password)
- Or accepts credentials via environment variables
- Hashes passwords securely with bcrypt
- Creates User record with ADMIN role
- Sets up initial user preferences
- Validates email format and username uniqueness

**Run with**:
```bash
npx tsx scripts/create-admin-user.ts
# Or with environment variables:
ADMIN_USERNAME=admin ADMIN_PASSWORD=secret npx tsx scripts/create-admin-user.ts
```

**Status**: ✅ Active

---

### 8. **create-admin-user.js**
**Purpose**: JavaScript version of admin user creation (legacy)

**What it does**: Same as create-admin-user.ts but in JavaScript

**Run with**:
```bash
node scripts/create-admin-user.js
```

**Status**: ⚠️ Legacy (use .ts version)

---

### 9. **check-admin.ts**
**Purpose**: Check if admin users exist in the database

**What it does**:
- Queries database for admin users
- Lists all admin accounts
- Shows user details (username, email, role, active status)
- Identifies if admin setup is needed

**Run with**:
```bash
npm run check-admin
npx tsx scripts/check-admin.ts
```

**Status**: ✅ Active

---

### 10. **reset-admin-password.ts**
**Purpose**: Reset password for existing admin user

**What it does**:
- Finds admin user by username or email
- Prompts for new password
- Hashes new password securely
- Updates user record
- Resets login attempts counter
- Unlocks account if locked

**Run with**:
```bash
npm run reset-admin-password
npx tsx scripts/reset-admin-password.ts
```

**Status**: ✅ Active

---

### 11. **set-admin-password.ts**
**Purpose**: Set password for admin user via environment variable

**What it does**:
- Reads ADMIN_PASSWORD from environment
- Finds admin user
- Updates password hash
- Useful for automated deployments

**Run with**:
```bash
ADMIN_PASSWORD=newpass npx tsx scripts/set-admin-password.ts
```

**Status**: ✅ Active

---

### 12. **reset-login-attempts.ts**
**Purpose**: Reset failed login attempts for locked accounts

**What it does**:
- Finds users with failed login attempts
- Resets loginAttempts counter to 0
- Clears lockedUntil timestamp
- Re-enables account access

**Run with**:
```bash
npx tsx scripts/reset-login-attempts.ts
```

**Status**: ✅ Active

---

### 13. **test-login.ts**
**Purpose**: Test admin login functionality

**What it does**:
- Tests login endpoint with credentials
- Verifies authentication flow
- Checks session creation
- Validates cookie handling
- Useful for debugging auth issues

**Run with**:
```bash
npx tsx scripts/test-login.ts
```

**Status**: ✅ Testing tool

---

## 🔧 Utility & Maintenance Scripts

### 14. **fix-fetch-credentials.js**
**Purpose**: Adds missing `credentials: 'include'` to fetch calls

**What it does**:
- Scans admin pages and components
- Finds fetch calls to `/api/` endpoints
- Adds `credentials: 'include'` for cookie-based auth
- Fixes authentication issues in admin panel
- Rewrites files with proper fetch configuration

**Run with**:
```bash
node scripts/fix-fetch-credentials.js
```

**Status**: ✅ Maintenance tool

---

### 15. **vercel-build-debug.js**
**Purpose**: Diagnose Vercel build cache issues

**What it does**:
- Checks package manager consistency
- Detects multiple lock files
- Validates Next.js configuration
- Checks for dynamic imports
- Identifies cache-busting issues
- Provides recommendations for build optimization
- Generates diagnostic report

**Run with**:
```bash
npm run cache:verify
node scripts/vercel-build-debug.js
```

**Status**: ✅ Debugging tool

---

## 🗄️ Database Migration Scripts

### 16. **migrate-legacy-nationalities.ts**
**Purpose**: Migrate old nationality fields to new relational model

**What it does**:
- Reads legacy nationality fields from Person table:
  - `nationality` (single string)
  - `nationalityArray` (array of strings)
  - `primaryNationality` (primary country)
  - `nationalityDetail` (text description)
- Normalizes country names to ISO codes
- Creates PersonNationality relationship records
- Sets nationality types (BIRTH, CITIZENSHIP, RESIDENCE, HERITAGE)
- Updates cache fields (`nationality_primary_code`, `nationality_codes_cached`)
- Handles corrupted data gracefully

**Run with**:
```bash
npx tsx scripts/migrate-legacy-nationalities.ts
```

**Status**: ✅ One-time migration (already completed if needed)

---

## 📋 Quick Reference

### NPM Scripts Available

```bash
# Automation
npm run automation:death-check           # Check for death updates (scheduled)
npm run automation:death-check-force     # Force check all people
npm run automation:death-check-80        # Check 80+ age group only
npm run automation:auto-promote          # Auto-promote statements to cases
npm run automation:analyze-responses     # Analyze response distribution
npm run automation:all                   # Run death check + auto-promote

# Admin Management
npm run check-admin                      # Check if admin users exist
npm run reset-admin-password             # Reset admin password

# Database
npm run db:generate                      # Generate Prisma client
npm run db:push                          # Push schema to database
npm run db:studio                        # Open Prisma Studio
npm run db:seed-admin                    # Seed admin user

# Build & Debug
npm run cache:verify                     # Verify build cache
```

---

## 🎯 Recommended Usage

### Daily Automation (via Cron)
- **automation:death-check** - Runs daily at 2 AM UTC
- **automation:auto-promote** - Runs daily at 2 PM UTC

### One-Time Setup
- **create-admin-user.ts** - Create first admin account
- **migrate-legacy-nationalities.ts** - Migrate old nationality data (if needed)

### As Needed
- **import-csv.ts** - Import bulk data from CSV
- **import-markdown.ts** - Import cases from markdown
- **check-admin.ts** - Verify admin accounts
- **reset-admin-password.ts** - Reset forgotten passwords

### Debugging
- **test-login.ts** - Test authentication
- **fix-fetch-credentials.js** - Fix API auth issues
- **vercel-build-debug.js** - Diagnose build problems
- **validate-apps-module.ts** - Validate Apps module

### Analysis
- **analyze-statement-responses.js** - Understand engagement patterns

---

## 🔐 Environment Variables Required

Different scripts require different environment variables:

```bash
# Required for most scripts
DATABASE_URL=postgresql://...           # Database connection
DIRECT_URL=postgresql://...            # Direct database URL

# For automation scripts
ANTHROPIC_API_KEY=sk-...               # Claude API (death checks)
CRON_SECRET=...                        # Cron job authentication

# For admin scripts (optional)
ADMIN_USERNAME=admin                   # Default admin username
ADMIN_PASSWORD=secret                  # Default admin password
ADMIN_EMAIL=admin@example.com          # Admin email
```

---

## 📊 Script Categories Summary

| Category | Count | Purpose |
|----------|-------|---------|
| 🤖 Automation | 3 | Maintain data quality automatically |
| 📥 Data Import | 3 | Import data from external sources |
| 👤 Admin Management | 7 | Manage admin users and auth |
| 🔧 Utility | 3 | Fix issues and debug |
| 🗄️ Migration | 2 | Migrate database structures |

**Total**: 16 scripts

---

## 🚀 Next Steps

1. ✅ **Set up automation** - Follow [AUTOMATION-SETUP.md](AUTOMATION-SETUP.md)
2. ✅ **Create admin user** - Run `create-admin-user.ts`
3. ✅ **Test locally** - Run scripts to verify they work
4. ✅ **Deploy to production** - Enable Vercel cron jobs
5. ✅ **Monitor execution** - Check logs regularly

All scripts are production-ready and updated for the current database schema! 🎉
