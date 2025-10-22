# Vercel Build Cache & Performance Help Request

## Summary
Next.js 14 application experiencing build cache issues on Vercel, resulting in 2+ minute build times with cache being consistently skipped.

---

## Problem Statement

### Primary Issue
Build cache is being skipped on every deployment with message:
```
Skipping build cache, deployment was triggered without cache
```

### Impact
- **Build Time**: 2+ minutes (target: <90 seconds)
- **Pages Pre-rendered**: Initially 150+ (optimized to 20)
- **Packages Installed**: 985 packages on every build
- **Cost Impact**: Longer build times = higher usage costs

### Expected Behavior
- Cache should be restored from previous deployments
- Build time should be ~60-90 seconds after cache optimization
- Dependency installation should leverage cache

---

## Environment Details

### Stack
- **Framework**: Next.js 14.2.33 (Pages Router)
- **Hosting**: Vercel (Enhanced Build Machine: 8 cores, 16GB RAM)
- **Package Manager**: npm (package-lock.json committed)
- **Database**: PostgreSQL (Supabase) + Prisma ORM v6.17.1
- **Node Version**: Latest LTS
- **Total Dependencies**: 985 packages

### Rendering Strategy
- ISR (Incremental Static Regeneration) with `fallback: 'blocking'`
- Dynamic routes with getStaticPaths + getStaticProps
- Revalidate times: 60-3600 seconds depending on content type

---

## Build Logs

### Successful Build (Cache Skipped)
```
05:30:07.862 Running build in Portland, USA (West) – pdx1
05:30:07.862 Build machine configuration: 8 cores, 16 GB
05:30:07.871 Cloning github.com/miles-brown/The-Words-Record
05:30:16.447 Cloning completed: 8.576s
05:30:16.586 Restored build cache from previous deployment (DHRefVXNqNA2oVmDAAtKnPq9TADz)
05:30:17.209 Running "vercel build"
05:30:17.858 Running "install" command: `npm install`...
[npm install takes ~30-45 seconds]
05:34:32.675 > prisma generate
05:34:35.843 ✔ Generated Prisma Client
05:34:36.847 ▲ Next.js 14.2.33
05:34:36.847 Linting and checking validity of types...
[Build continues for ~2 minutes total]
```

**Note**: Despite saying "Restored build cache", behavior suggests cache isn't being fully utilized.

---

## Current Configuration

### vercel.json
```json
{
  "buildCommand": "prisma generate && next build",
  "framework": "nextjs",
  "build": {
    "env": {
      "ENABLE_BUILD_CACHE": "1",
      "PRISMA_SKIP_POSTINSTALL_GENERATE": "true",
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  },
  "outputDirectory": ".next"
}
```

### next.config.js (relevant parts)
```javascript
const nextConfig = {
  swcMinify: true,
  productionBrowserSourceMaps: false,
  compress: true,
  experimental: {
    optimizePackageImports: ['recharts', 'react-markdown', 'remark'],
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  }
}
```

### package.json scripts
```json
{
  "build": "next build",
  "vercel-build": "prisma generate && next build",
  "postinstall": "prisma generate"
}
```

### getStaticPaths (optimized)
```typescript
// pages/people/[slug].tsx
export const getStaticPaths: GetStaticPaths = async () => {
  const people = await prisma.person.findMany({
    select: { slug: true, _count: { select: { statements: true } } },
    orderBy: [
      { statements: { _count: 'desc' } },
      { createdAt: 'desc' }
    ],
    take: 5 // Only pre-render top 5
  })

  return {
    paths: people.map(p => ({ params: { slug: p.slug } })),
    fallback: 'blocking'
  }
}
```

**Applied to**: `/people/[slug]`, `/statements/[slug]`, `/tags/[slug]`, `/cases/[slug]`

---

## What I've Already Tried

### ✅ Completed Optimizations
1. **Reduced Pre-rendering**: 150 pages → 20 pages (87% reduction)
   - Changed `take: 50` to `take: 5` in all getStaticPaths
   - Using `fallback: 'blocking'` for on-demand generation

2. **Enhanced vercel.json**:
   - Added `ENABLE_BUILD_CACHE=1`
   - Added `PRISMA_SKIP_POSTINSTALL_GENERATE=true`
   - Specified `outputDirectory: ".next"`

3. **Optimized Build Scripts**:
   - Separated `build` (local) from `vercel-build` (production)
   - Ensured Prisma generates only once per build
   - `postinstall` handles post-npm-install generation

4. **Next.js Config Optimizations**:
   - Enabled `swcMinify` for faster minification
   - Disabled production source maps
   - Added package import optimization
   - Skip type checking in development

5. **Verified Configuration**:
   - Only one lock file (package-lock.json) committed
   - No `.vercel` directory in git
   - Deploying from GitHub (not CLI)
   - Not using `--force` flag

### ❌ Things That Didn't Help
- Setting `ENABLE_BUILD_CACHE` environment variable
- Specifying `outputDirectory` in vercel.json
- Clearing build cache and redeploying
- Different branch deployments

---

## Specific Questions

### Q1: Cache Behavior
Why does Vercel say "Restored build cache" but still installs all 985 packages fresh? Is there a way to verify the cache is actually being used for `node_modules`?

### Q2: Branch-Specific Caching
I understand Vercel now uses per-branch caching. Does this mean:
- First push to a new branch = no cache?
- Should inherit from main/production branch cache?
- How many pushes until branch cache is "warm"?

### Q3: Prisma + Vercel Best Practices
Current setup:
```json
"postinstall": "prisma generate",
"vercel-build": "prisma generate && next build"
```

Is this causing issues? Should I:
- A) Remove `postinstall` entirely? ❓
- B) Skip Prisma in `vercel-build` and rely on `postinstall`? ❓
- C) Current setup is correct? ✓

### Q4: Build Command vs vercel-build Script
Vercel documentation suggests using `vercel-build` script in package.json, but also allows `buildCommand` in vercel.json.

Which takes precedence? Should I:
- Remove `buildCommand` from vercel.json and rely on `vercel-build` script?
- Keep both for redundancy?

### Q5: npm ci vs npm install
Should I use `npm ci` instead of `npm install` for Vercel builds?
```json
"installCommand": "npm ci"
```

Would this improve cache utilization?

---

## Additional Context

### Repository
- GitHub: github.com/miles-brown/The-Words-Record
- Deploying from: `main` branch
- Commit frequency: 5-10 per day
- Team size: Solo developer

### Performance Impact
- Development velocity slowed by 2-minute build times
- Want to ship features faster
- Budget-conscious (Vercel Pro plan)

### What Good Looks Like
Reference projects with similar stack that achieve <90 second builds:
- _(Looking for examples!)_

---

## Request for Help

### Primary Goal
**Get build cache consistently working** so:
1. `node_modules` aren't fully reinstalled every time
2. `.next/cache` is properly restored
3. Build time drops to <90 seconds

### Secondary Goals
- Understand Vercel's caching behavior better
- Best practices for Prisma + Next.js + Vercel
- Any other optimizations I'm missing

### What Would Be Most Helpful
1. **Diagnosis**: Is my configuration correct? What am I missing?
2. **Examples**: Links to similar projects with good build times
3. **Debugging**: How to verify cache is actually being used?
4. **Vercel Settings**: Are there dashboard settings I should check?

---

## References

### Documentation I've Read
- [Vercel Build Cache](https://vercel.com/docs/deployments/troubleshoot-a-build#build-cache)
- [Next.js ISR](https://nextjs.org/docs/pages/building-your-application/data-fetching/incremental-static-regeneration)
- [Optimizing getStaticPaths](https://nextjs.org/docs/pages/api-reference/functions/get-static-paths)
- [Prisma + Vercel Guide](https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/vercel-caching-issue)

### Community Posts I've Found
- [How to reduce build time on Vercel](https://vercel.com/guides/how-do-i-reduce-my-build-time-with-next-js-on-vercel)
- [Build cache discussions](https://github.com/vercel/community/discussions/457)
- Multiple StackOverflow threads on cache skipping

---

## For Vercel Support

**If escalating to Vercel Support, include**:
- Project ID: [Available in dashboard]
- Deployment ID: [From specific build]
- Build logs: [Full logs attached]
- GitHub repo: github.com/miles-brown/The-Words-Record

---

## Where to Post This

### Recommended Channels

1. **Vercel Discord** (Best for quick help)
   - Server: https://vercel.com/discord
   - Channel: `#help-nextjs` or `#help-build-and-deployment`
   - Format: Shorten to 2000 characters, link to full document

2. **GitHub Discussions**
   - [Next.js Discussions](https://github.com/vercel/next.js/discussions)
   - Category: "Help"
   - Tags: build-optimization, vercel, prisma, ISR

3. **Stack Overflow**
   - Tags: `next.js`, `vercel`, `build-optimization`, `prisma`
   - Title: "Vercel build cache skipped on every deployment despite configuration"

4. **Reddit**
   - r/nextjs or r/webdev
   - Title: "Need help optimizing Next.js 14 build times on Vercel (2+ mins with cache issues)"

### Discord Message Template (2000 char limit)
```
🚨 Build Cache Help Needed

Stack: Next.js 14.2.33 + Prisma + Vercel
Problem: Cache skipped every build → 2+ min build times

What I've tried:
✅ Reduced pre-rendering (150→20 pages)
✅ Added ENABLE_BUILD_CACHE=1
✅ Optimized build scripts
✅ swcMinify, no source maps
❌ Still seeing "cache skipped"

Config highlights:
• vercel.json: buildCommand + ENABLE_BUILD_CACHE
• Only package-lock.json (committed)
• vercel-build: "prisma generate && next build"
• postinstall: "prisma generate"

Questions:
1. Why does "Restored cache" still install 985 packages?
2. Is Prisma setup causing issues?
3. Should I use npm ci instead?

Full details: [link to this doc or GitHub gist]
Repo: github.com/miles-brown/The-Words-Record

Any help appreciated! 🙏
```

---

**Last Updated**: 2025-10-22
**Status**: Seeking community input
**Follow-up**: Will update this document with solutions found
