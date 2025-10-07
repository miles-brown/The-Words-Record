# Technical Feasibility Assessment Protocol

## Purpose
Before implementing any requested feature or change, Claude Code must perform a systematic technical feasibility assessment to ensure compatibility with the existing infrastructure stack.

## Your Infrastructure Stack

### 🗄️ Database Layer
- **PostgreSQL** (hosted on Supabase)
  - Connection pooling via Supabase Pooler
  - Schema managed by Prisma
  - Migration limitations: Connection pooler can cause prepared statement conflicts
  - **Key Constraint**: Cannot run `prisma migrate dev` directly - requires manual SQL execution or `prisma db push`

### 🔧 ORM & Schema Management
- **Prisma** (v6.16.2)
  - Schema location: `prisma/schema.prisma`
  - Client generation: `prisma generate`
  - Migration strategy: Manual SQL execution for production
  - **Key Constraint**: Schema changes require both Prisma schema update AND database migration

### 🏗️ Application Framework
- **Next.js** (v14.2.32)
  - Static site generation (SSG) with `getStaticProps`
  - Pages Router (not App Router)
  - TypeScript strict mode
  - **Key Constraint**: Static builds fail if database queries during build can't complete

### 🚀 Deployment Pipeline
- **GitHub** → **Vercel**
  - Automatic deployments on push to `main`
  - Build command: `prisma generate && next build`
  - Environment: Node.js with limited build timeout
  - **Key Constraint**: Build must complete within timeout, database must be accessible during build

### ☁️ External Services
- **Supabase**: PostgreSQL hosting
- **Cloudflare**: DNS/CDN (passive - no build impact)
- **Google Services**: Analytics, AdSense, Funding Choices CMP
- **Anthropic API**: For JasPIZ harvester automation

---

## Pre-Implementation Checklist

Before accepting any task, Claude Code MUST verify:

### ✅ 1. Database Compatibility
- [ ] Does the change require database schema modifications?
- [ ] If yes, can it be applied via `ADD COLUMN IF NOT EXISTS` (safe)?
- [ ] Will existing data remain compatible?
- [ ] Is the production database accessible during deployment?

**If any answer is uncertain, WARN USER about potential deployment failures.**

### ✅ 2. Prisma Schema Impact
- [ ] Does the change require modifying `prisma/schema.prisma`?
- [ ] Will Prisma Client generation succeed?
- [ ] Are there any circular dependencies or relation conflicts?
- [ ] Will the generated types match the actual database schema?

**If schema/database mismatch exists, MUST be resolved before deployment.**

### ✅ 3. Next.js Build Compatibility
- [ ] Will the change work with static site generation?
- [ ] Are any new dependencies compatible with Vercel build environment?
- [ ] Will database queries during build succeed (or gracefully fail)?
- [ ] Are any external APIs required during build time vs. runtime?

**If build-time database access is required, ensure error handling for missing data.**

### ✅ 4. Third-Party Integrations
- [ ] Does the change involve Google services? (Check for AMP/CSP conflicts)
- [ ] Does it require new API keys or environment variables?
- [ ] Are there CORS, CSP, or security header implications?
- [ ] Will it work within Vercel's serverless function limits?

**If adding new scripts/iframes, verify Next.js compatibility and CSP rules.**

### ✅ 5. Git/Vercel Workflow
- [ ] Can the change be deployed incrementally?
- [ ] Does it require environment variable updates in Vercel?
- [ ] Will rollback be possible if deployment fails?
- [ ] Are there any migration lock files that need updating?

**If atomic deployment isn't possible, create a phased rollout plan.**

---

## Response Framework

When a user requests a feature, Claude Code should respond with:

### 📝 Example Response Template

```markdown
## Feasibility Assessment: [Feature Name]

### ✅ What Will Work
- [List compatible aspects]

### ⚠️ Potential Issues
- [Database schema sync required]
- [Build timeout risk due to X]
- [Manual Supabase SQL execution needed]

### 🔧 Technical Requirements
1. Schema changes: [Yes/No + details]
2. Database migration: [Required/Not Required]
3. Vercel env vars: [Any new vars needed]
4. External APIs: [Any new integrations]

### 📋 Implementation Plan
**Phase 1**: [Safe preparatory changes]
**Phase 2**: [Core implementation]
**Phase 3**: [Verification and rollout]

### ⚠️ Risks
- **High**: [Critical failure points]
- **Medium**: [Recoverable issues]
- **Low**: [Minor inconveniences]

### ❓ Questions for User
- [Any ambiguities that need clarification]
- [Preferred approach for X vs Y]

**Proceed with implementation? [Yes/No/Modify]**
```

---

## Known Failure Patterns (Learn from History)

### 🚫 AMP HTML Integration Attempt
**What Happened**: Added AMP hybrid mode to Next.js pages
**Why It Failed**:
- AMP HTML validator rejected standard JavaScript
- Custom CSS properties incompatible with AMP
- Google scripts (AdSense, Analytics) violated AMP rules
- 484 lines of validation errors

**Lesson**: Always check Next.js compatibility with restrictive HTML standards (AMP, Strict CSP, etc.)

### 🚫 Prisma Migration on Supabase Pooler
**What Happened**: Ran `prisma migrate dev` against Supabase pooler
**Why It Failed**:
- Connection pooler doesn't support prepared statements for migrations
- `ERROR: prepared statement "s1" already exists`

**Lesson**: Use `prisma db push` or manual SQL for Supabase production migrations

### 🚫 Schema/Database Mismatch (deathCause)
**What Happened**: Added `deathCause` to schema but didn't apply migration
**Why It Failed**:
- Prisma Client expects column to exist
- Build-time static page generation queries missing column
- Fatal error: `The column Person.deathCause does not exist`

**Lesson**: Schema changes MUST be synchronized with database before deployment

---

## Decision Criteria

### ✅ Proceed Immediately When:
- Change is code-only (no database/schema changes)
- Standard Next.js/React patterns being used
- No new external dependencies
- Fully reversible via git revert

### ⚠️ Warn User When:
- Database schema changes required
- New third-party scripts/integrations
- Potential build timeout risk
- Complex multi-step migration needed

### 🛑 Refuse/Propose Alternative When:
- Known incompatibility with infrastructure
- Would require destructive database changes
- Contradicts Next.js/Vercel limitations
- No safe rollback path exists

---

## Ongoing Monitoring

After each deployment, Claude Code should:
1. Verify Vercel build succeeded
2. Check for new runtime errors in logs
3. Validate database schema matches Prisma schema
4. Confirm all environment variables are set

If any checks fail, immediately:
1. Notify user
2. Propose rollback OR hotfix
3. Document failure in `DEPLOYMENT-ISSUES.md`

---

## Infrastructure Stack Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      USER REQUEST                        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              FEASIBILITY ASSESSMENT                      │
│  - Database Impact?                                      │
│  - Prisma Schema Impact?                                 │
│  - Build Compatibility?                                  │
│  - Third-Party Integration?                              │
└──────────────────┬──────────────────────────────────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
       ▼                       ▼
   [PROCEED]              [WARN/REFUSE]
       │                       │
       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│ CODE CHANGES    │    │ PROPOSE ALT.     │
│ - TypeScript    │    │ - Safer approach │
│ - React/Next.js │    │ - Phased rollout │
└────────┬────────┘    └──────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              GIT COMMIT & PUSH                           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│                  VERCEL BUILD                            │
│  1. prisma generate ──→ Prisma Client generation        │
│  2. next build      ──→ Static page generation          │
│     │                                                    │
│     ├─→ Database Queries (via Supabase)                 │
│     └─→ TypeScript Compilation                          │
└──────────────────┬──────────────────────────────────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
       ▼                       ▼
   [SUCCESS]              [FAILURE]
       │                       │
       ▼                       ▼
┌─────────────┐        ┌──────────────┐
│ DEPLOYED ✅ │        │ ROLLBACK OR  │
└─────────────┘        │ HOTFIX 🔧    │
                       └──────────────┘
```

---

## Examples of Proper Assessment

### ✅ Example 1: Add Social Media Field

**Request**: "Add Twitter handle field to Person model"

**Assessment**:
- **Database**: New optional column (safe with `ADD COLUMN IF NOT EXISTS`)
- **Prisma**: Add `twitterHandle String?` to schema
- **Build**: No impact (optional field)
- **Third-Party**: None

**Verdict**: ✅ **PROCEED** with caution - requires database migration

**Plan**:
1. Update schema
2. Create migration SQL
3. Apply to Supabase manually
4. Test locally
5. Commit and deploy

---

### ⚠️ Example 2: Integrate Stripe Payments

**Request**: "Add Stripe subscription payments"

**Assessment**:
- **Database**: New `Subscription` table needed
- **Prisma**: Complex relations with `Person` model
- **Build**: No impact (runtime feature)
- **Third-Party**: Stripe API, webhooks, requires HTTPS

**Verdict**: ⚠️ **WARN USER** - complex multi-phase implementation

**Concerns**:
- Vercel serverless function limits for webhooks
- PCI compliance requirements
- Database schema changes
- Stripe API key management

**Recommendation**: Break into phases:
1. Schema design approval
2. Database migration
3. Stripe integration (dev environment)
4. Webhook handling
5. Production rollout

---

### 🛑 Example 3: Server-Side Rendering for All Pages

**Request**: "Convert all pages to SSR for real-time data"

**Assessment**:
- **Database**: No changes needed
- **Prisma**: No changes needed
- **Build**: **FUNDAMENTAL ARCHITECTURE CHANGE**
- **Third-Party**: No impact

**Verdict**: 🛑 **REFUSE** - conflicts with current static site architecture

**Why It Won't Work**:
- Current build generates 1,674 static pages
- Vercel plan likely optimized for static hosting
- Database connection pool would be overwhelmed
- Loses caching benefits

**Alternative**: Use Incremental Static Regeneration (ISR) with `revalidate` option

---

## Conclusion

This protocol ensures:
- ✅ No "surprise" deployment failures
- ✅ User understands risks before implementation
- ✅ Proper consideration of all infrastructure layers
- ✅ Incremental, safe rollout strategies
- ✅ Clear communication about limitations

**Remember**: It's better to warn the user upfront than to commit broken code to production.
