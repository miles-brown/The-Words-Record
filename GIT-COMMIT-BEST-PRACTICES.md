# Git Commit & Deployment Best Practices

## 🎯 Core Principle

**Commit early, commit often, push regularly**

Every 2-3 minor actions → Commit
Every large/risky change → Commit + Verify deployment

---

## 📋 Commit Frequency Rules

### Rule 1: After 2-3 Minor Actions
Commit when you've completed 2-3 of these:
- Fixed a single bug
- Added a small feature
- Updated documentation
- Modified configuration
- Refactored a function

**Example Workflow**:
```bash
# Action 1: Fix TypeScript error
# Action 2: Update documentation
# Action 3: Add type declaration

git add .
git commit -m "fix: Resolve TypeScript errors and add type declarations"
git push origin main
```

### Rule 2: After Every Large Change
Immediately commit after:
- Adding a new major feature
- Refactoring significant code
- Database schema changes
- New API integrations
- Build configuration changes

**Example**:
```bash
# Just added JasPIZ harvester (large feature)
git add scripts/jasPIZ-harvester.ts JASPIZ-HARVESTER-GUIDE.md
git commit -m "feat: Add JasPIZ automated harvester"
git push origin main

# Wait for deployment to succeed before continuing
```

### Rule 3: After Every Risky Commit
Always verify deployment after:
- TypeScript type changes
- Prisma schema modifications
- Dependency updates (package.json)
- Build script changes
- Environment variable changes
- AMP/PWA configuration changes

**Verification Steps**:
```bash
# 1. Commit the risky change
git commit -m "feat: Update Prisma schema with new fields"
git push origin main

# 2. Wait and verify deployment
sleep 60
curl -s "https://api.github.com/repos/USER/REPO/commits/HEAD/check-runs" | \
  python3 -c "import sys, json; ..."

# 3. If success, continue. If failed, fix immediately.
```

---

## 🏗️ Commit Message Format

Use Conventional Commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: Add death monitoring system` |
| `fix` | Bug fix | `fix: Resolve TypeScript build errors` |
| `docs` | Documentation only | `docs: Add deployment audit` |
| `style` | Code formatting (no logic change) | `style: Format with Prettier` |
| `refactor` | Code restructuring | `refactor: Extract citation logic` |
| `perf` | Performance improvement | `perf: Optimize database queries` |
| `test` | Add/update tests | `test: Add verification tests` |
| `build` | Build system changes | `build: Update Next.js config` |
| `ci` | CI/CD changes | `ci: Add Vercel deployment checks` |
| `chore` | Maintenance tasks | `chore: Update dependencies` |

### Good Commit Message Examples

**Minimal (for tiny changes)**:
```
fix: Correct typo in README
```

**Standard (for normal changes)**:
```
feat: Enable AMP auto-ads on content pages

- Added AMP config to people, incidents, cases, tag pages
- Created TypeScript declarations for AMP components
- Configured Google AdSense integration
```

**Detailed (for large/risky changes)**:
```
feat: Add comprehensive verification and death monitoring systems

Verification System:
- Batch statement verification with Harvard citations
- Claude API integration for source verification
- Confidence scoring and credibility ratings
- Graceful handling of archive failures

Death Monitoring System:
- Automated death information checking
- Priority-based schedule (age-dependent)
- Search for death date, place, and cause
- Source record creation for obituaries

Database Schema:
- Add deathCause field to Person model
- Add lastDeathCheck field to Person model
- Generate updated Prisma client

All scripts include rate limiting and error handling.

🤖 Generated with Claude Code
https://claude.com/claude-code

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 🔄 Safe Deployment Workflow

### Standard Flow (Non-Risky Changes)

```bash
# 1. Make changes
# (edit files)

# 2. Test locally (optional for small changes)
npm run dev

# 3. Stage changes
git add .

# 4. Commit with clear message
git commit -m "feat: Add new feature"

# 5. Push to trigger Vercel deployment
git push origin main

# 6. Continue working (deployment happens automatically)
```

### Safe Flow (Risky Changes)

```bash
# 1. Make risky changes
# (edit Prisma schema, TypeScript configs, etc.)

# 2. Test locally (REQUIRED)
npx tsc --noEmit
npx prisma validate
npm run build  # If it compiles locally, good sign

# 3. Commit with detailed message
git add .
git commit -m "feat: Major schema update with new fields

- Added internalNotes to Person model
- Added deathCause and lastDeathCheck fields
- Updated Prisma client
- All scripts updated to use new fields
"

# 4. Push
git push origin main

# 5. WAIT and verify deployment
sleep 60

# 6. Check deployment status
curl -s "https://api.github.com/repos/miles-brown/Who-Said-What/commits/HEAD/check-runs" | \
  python3 -c "import sys, json; data = json.load(sys.stdin); runs = data.get('check_runs', []); print('\\n'.join([f\"{r['name']}: {r['conclusion'] or r['status']}\" for r in runs]))"

# 7. If SUCCESS, continue. If FAILURE, fix immediately:
git revert HEAD  # Revert if critical
# OR
# Fix the issue and commit again
```

---

## ⚠️ When NOT to Commit

**Don't commit**:
- Build artifacts (`.next/`, `node_modules/`)
- Environment files (`.env`, `.env.local`)
- IDE files (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`)
- Temporary files (`*.log`, `*.tmp`)
- Duplicate files (`file 2.tsx`)

**Ensure `.gitignore` includes**:
```gitignore
# Build
.next/
out/
build/
dist/

# Dependencies
node_modules/

# Environment
.env
.env.local
.env*.local

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Temp
*.tmp
tsconfig.tsbuildinfo
```

---

## 📊 Deployment Verification

### Quick Check (1 minute)

```bash
# Wait for build to start
sleep 15

# Check if deployment started
curl -s "https://api.github.com/repos/miles-brown/Who-Said-What/commits/HEAD/check-runs" | \
  python3 -c "import sys, json; data = json.load(sys.stdin); runs = data.get('check_runs', []); print('Status:', runs[0]['status'] if runs else 'Not started')"
```

### Full Verification (2-3 minutes)

```bash
# Wait for build to complete
sleep 120

# Check final status
curl -s "https://api.github.com/repos/miles-brown/Who-Said-What/commits/HEAD/check-runs" | \
  python3 -c "import sys, json; data = json.load(sys.stdin); runs = data.get('check_runs', []); print('\\n'.join([f\"{r['name']}: {r['conclusion']}\" for r in runs]))"

# Expected output:
# build: success
# deploy: success
# report-build-status: success
```

### Manual Check

Visit Vercel dashboard:
- https://vercel.com/dashboard
- Check latest deployment status
- View build logs if failed

---

## 🚨 Handling Failed Deployments

### Step 1: Identify the Error

```bash
# Get the commit SHA that failed
FAILED_SHA=$(git rev-parse HEAD)

# View error in GitHub Actions
# Visit: https://github.com/USER/REPO/actions
```

### Step 2: Quick Fix or Revert

**Option A: Quick Fix** (if you know the issue)
```bash
# Fix the error
# (edit files)

git add .
git commit -m "fix: Resolve deployment error from previous commit"
git push origin main
```

**Option B: Revert** (if unsure or critical)
```bash
# Revert the failed commit
git revert HEAD
git push origin main

# Now fix properly and recommit
```

### Step 3: Verify Fix Deployed

```bash
# Wait and check
sleep 60
curl -s "https://api.github.com/repos/miles-brown/Who-Said-What/commits/HEAD/check-runs" | \
  python3 -c "import sys, json; data = json.load(sys.stdin); runs = data.get('check_runs', []); print('Fixed:', all(r['conclusion'] == 'success' for r in runs))"
```

---

## 📝 Commit Checklist

Before every commit:

**Pre-Commit**:
- [ ] Code compiles locally (`npx tsc --noEmit`)
- [ ] No sensitive data (API keys, passwords)
- [ ] `.gitignore` updated if needed
- [ ] Commit message is clear and follows format
- [ ] Changes are atomic (one logical change)

**For Large/Risky Commits**:
- [ ] Local build passes (`npm run build`)
- [ ] Prisma schema validated (`npx prisma validate`)
- [ ] Tests pass (if applicable)
- [ ] Documentation updated
- [ ] Breaking changes documented

**Post-Commit**:
- [ ] Push to remote
- [ ] Verify deployment starts
- [ ] Check deployment succeeds (for risky changes)
- [ ] Monitor for errors (first 5 minutes)

---

## 🎓 Best Practices Summary

### ✅ DO

1. **Commit frequently** - Every 2-3 small changes
2. **Write clear messages** - Use conventional commits format
3. **Test risky changes** - Run `npm run build` locally first
4. **Verify deployments** - Check Vercel after risky commits
5. **Keep commits atomic** - One logical change per commit
6. **Use branches** - For experimental features
7. **Document changes** - Update docs in same commit

### ❌ DON'T

1. **Don't commit build artifacts** - Keep `.gitignore` updated
2. **Don't push untested risky changes** - Test locally first
3. **Don't batch unrelated changes** - Keep commits focused
4. **Don't ignore deployment failures** - Fix immediately
5. **Don't commit secrets** - Use environment variables
6. **Don't use vague messages** - "Fix stuff" is bad
7. **Don't force push to main** - Preserve history

---

## 📅 Daily Workflow Example

**Morning**:
```bash
# Pull latest changes
git pull origin main

# Start work
# (make 2-3 small changes)

# Commit
git add .
git commit -m "feat: Add small feature X"
git push origin main
```

**Midday**:
```bash
# Made a risky schema change
npx prisma validate
npx tsc --noEmit
npm run build  # Test locally

git add .
git commit -m "feat: Update schema with new fields"
git push origin main

# WAIT for deployment
sleep 120

# Verify
curl ... # Check deployment status
```

**Afternoon**:
```bash
# More small changes
# (fix 2 bugs)

git add .
git commit -m "fix: Resolve bugs in X and Y"
git push origin main
```

**End of Day**:
```bash
# Review what was deployed
git log --oneline --since="1 day ago"

# Check all deployments succeeded
# Visit: https://vercel.com/dashboard
```

---

## 🔧 Automation Helpers

### Git Alias for Quick Commits

Add to `~/.gitconfig`:
```ini
[alias]
    # Quick commit and push
    qcp = "!f() { git add . && git commit -m \"$1\" && git push origin main; }; f"

    # Commit with conventional format
    feat = "!f() { git add . && git commit -m \"feat: $1\"; }; f"
    fix = "!f() { git add . && git commit -m \"fix: $1\"; }; f"
    docs = "!f() { git add . && git commit -m \"docs: $1\"; }; f"
```

Usage:
```bash
git feat "Add new feature"
git fix "Resolve bug"
git docs "Update README"
```

### Pre-Commit Hook

Create `.husky/pre-commit`:
```bash
#!/bin/sh
npx tsc --noEmit || exit 1
```

This prevents commits with TypeScript errors.

---

## 📚 Further Reading

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2)
- [Vercel Deployment Docs](https://vercel.com/docs/deployments)
- [Semantic Versioning](https://semver.org/)

---

**Last Updated**: October 7, 2025
**Maintained By**: The Words Record Team
**Status**: Living Document (update as practices evolve)
