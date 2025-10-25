# 🚨 Critical Launch Setup Guide

**Status:** Action Required Before Launch
**Last Updated:** October 25, 2025
**Estimated Time:** 3-4 hours

This document outlines the **absolute critical** tasks that must be completed before launching The Words Record to production.

---

## 1️⃣ Google Analytics 4 Setup (15 minutes)

### Current State
- GTM container is integrated (GTM-KTHWNW45)
- `.env` has placeholder: `G-[your-measurement-id]`
- **Blocking:** No visitor tracking without real ID

### Steps to Fix

1. **Create GA4 Property** (if not done yet)
   - Go to https://analytics.google.com/
   - Click "Admin" → "Create Property"
   - Property name: "The Words Record"
   - Time zone: Your timezone
   - Click "Create" and complete setup wizard

2. **Get Measurement ID**
   - In GA4, go to Admin → Data Streams
   - Click on your web data stream
   - Copy the Measurement ID (format: `G-XXXXXXXXXX`)

3. **Update Environment Variables**

   **Local (.env):**
   ```bash
   NEXT_PUBLIC_GA_ID="G-YOUR-ACTUAL-ID"
   ```

   **Vercel (Production):**
   - Go to https://vercel.com/dashboard
   - Navigate to your project
   - Settings → Environment Variables
   - Find `NEXT_PUBLIC_GA_ID`
   - Update value to your real measurement ID
   - Redeploy

4. **Verify**
   - Visit your site
   - Open Chrome DevTools → Network tab
   - Filter for "google-analytics"
   - Confirm you see gtag requests with your measurement ID

---

## 2️⃣ Vercel Database SSL Configuration (10 minutes)

### Current State
- ✅ Local `.env` has `?sslmode=require` added
- ❌ Vercel production environment NOT updated
- **Blocking:** Security vulnerability in production

### Steps to Fix

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Navigate to "Who-Said-What" or "The-Words-Record" project

2. **Update Environment Variables**
   - Go to: Settings → Environment Variables
   - Find and update these TWO variables:

   **DATABASE_URL:**
   ```
   postgresql://postgres:UXypAyfqxq4mxq1f@db.sboopxosgongujqkpbxo.supabase.co:5432/postgres?sslmode=require
   ```

   **DIRECT_URL:**
   ```
   postgresql://postgres:UXypAyfqxq4mxq1f@db.sboopxosgongujqkpbxo.supabase.co:5432/postgres?sslmode=require
   ```

3. **Redeploy**
   - Click "Deployments" tab
   - Click "..." on latest deployment → "Redeploy"
   - Or push a new commit to trigger auto-deploy

4. **Verify**
   - Go to `/admin/security` on production
   - Click "Run Security Audit"
   - "Database SSL Not Enforced" warning should be gone

---

## 3️⃣ Sentry Error Tracking (1 hour)

### Why Critical
- Production errors will go unnoticed without monitoring
- Need to know immediately if something breaks

### Setup Steps

1. **Create Sentry Account**
   - Go to https://sentry.io/signup/
   - Sign up (free tier is fine)
   - Create new project
   - Select "Next.js" as platform

2. **Get DSN**
   - After creating project, copy the DSN (looks like: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)

3. **Install Sentry**
   ```bash
   npm install --save @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

4. **Configure Environment Variables**

   **Add to .env:**
   ```bash
   NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn-here"
   SENTRY_AUTH_TOKEN="your-auth-token" # From Sentry wizard
   ```

   **Add to Vercel:**
   - Same variables in Vercel dashboard
   - Settings → Environment Variables

5. **Test**
   - Trigger an error intentionally
   - Check Sentry dashboard to confirm error appears

---

## 4️⃣ Transactional Email Service (1-2 hours)

### Why Critical
- Password reset won't work without email
- Contact form submissions will fail

### Option A: Resend (Recommended - Simpler)

1. **Create Account**
   - Go to https://resend.com/signup
   - Verify your email

2. **Get API Key**
   - Dashboard → API Keys → Create
   - Copy the key (starts with `re_`)

3. **Verify Domain**
   - Dashboard → Domains → Add Domain
   - Add DNS records provided by Resend
   - Wait for verification (5-30 minutes)

4. **Configure**

   **Add to .env:**
   ```bash
   RESEND_API_KEY="re_your_key_here"
   EMAIL_FROM="noreply@thewordsrecord.com"
   ```

   **Add to Vercel:**
   - Same variables

5. **Test**
   ```bash
   # Create test script: scripts/test-email.ts
   npm run test-email
   ```

### Option B: SendGrid (Alternative)

1. **Create Account**
   - Go to https://sendgrid.com/
   - Sign up (free tier: 100 emails/day)

2. **Get API Key**
   - Settings → API Keys → Create API Key
   - Copy the key

3. **Verify Sender**
   - Settings → Sender Authentication
   - Verify a single sender email

4. **Configure**

   **Add to .env:**
   ```bash
   SENDGRID_API_KEY="SG.your_key_here"
   EMAIL_FROM="noreply@thewordsrecord.com"
   ```

   **Add to Vercel:**
   - Same variables

---

## 5️⃣ Legal Documents Review (2-3 hours)

### Current State
- Privacy policy exists with template content
- Terms of service exists
- Cookie policy exists
- **Blocking:** Legal liability if not customized

### Steps to Fix

1. **Update Privacy Policy** (`privacy-policy.md`)
   - Replace "The Words Record" with your official entity name
   - Add your actual contact email
   - Add your business address (if required by jurisdiction)
   - Review GDPR/CCPA compliance sections
   - **Recommended:** Have a lawyer review

2. **Update Terms of Service** (`terms-of-service.md`)
   - Add your entity name
   - Add contact information
   - Review liability limitations
   - Add governing law/jurisdiction
   - **Recommended:** Legal review

3. **Update Cookie Policy** (`cookie-policy.md`)
   - List all cookies used by your site
   - Include Google Analytics cookies
   - Include AdSense cookies
   - Add contact information

4. **Key Information Needed:**
   - Official organization/business name
   - Contact email address
   - Physical business address (for GDPR compliance)
   - Jurisdiction/governing law
   - Data Protection Officer contact (if applicable)

---

## 6️⃣ Submit Sitemaps to Search Engines (30 minutes)

### Setup Google Search Console

1. **Go to** https://search.google.com/search-console
2. **Add Property**
   - Enter: `https://thewordsrecord.com`
   - Verify ownership (DNS TXT record or HTML file)

3. **Submit Sitemaps**
   - Go to Sitemaps section
   - Add these sitemap URLs:
     - `https://thewordsrecord.com/api/sitemap.xml`
     - `https://thewordsrecord.com/api/sitemap-static.xml`
     - `https://thewordsrecord.com/api/sitemap-cases.xml`
     - `https://thewordsrecord.com/api/sitemap-people.xml`

### Setup Bing Webmaster Tools

1. **Go to** https://www.bing.com/webmasters
2. **Add Site**
   - Enter: `https://thewordsrecord.com`
   - Verify ownership

3. **Submit Sitemaps**
   - Same sitemap URLs as Google

---

## 7️⃣ Production Smoke Test (2 hours)

### Test Checklist

**Public Pages:**
- [ ] Homepage loads correctly
- [ ] Cases index page shows cases
- [ ] Individual case page works
- [ ] People index page shows people
- [ ] Individual person page works
- [ ] Statements index page works
- [ ] Search functionality works
- [ ] All navigation links work
- [ ] Footer links work

**Authentication:**
- [ ] Admin login page accessible
- [ ] Can log in with correct credentials
- [ ] Cannot access admin with wrong credentials
- [ ] JWT token stored in cookie
- [ ] Logout works
- [ ] Cannot access /admin after logout

**Admin Functions:**
- [ ] Dashboard loads
- [ ] Can view statements list
- [ ] Can create new statement
- [ ] Can edit existing statement
- [ ] Can delete statement
- [ ] Can view cases list
- [ ] Security audit runs successfully

**Error Handling:**
- [ ] 404 page shows for non-existent URLs
- [ ] 500 page shows if error occurs
- [ ] No console errors on any page

**Mobile:**
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Hamburger menu works
- [ ] All pages responsive

**Performance:**
- [ ] Run Lighthouse audit
- [ ] Performance score > 80
- [ ] Accessibility score > 90
- [ ] SEO score > 90

---

## 8️⃣ Database Backup Test (1 hour)

### Verify Supabase Backups

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Database → Backups

2. **Configure Daily Backups**
   - Enable automatic daily backups
   - Set backup time (e.g., 2 AM UTC)
   - Configure retention period (7 days minimum)

3. **Test Restore Procedure**
   - Create test database
   - Restore latest backup to test database
   - Verify data integrity
   - Document restore steps in DISASTER-RECOVERY.md

---

## ✅ Completion Checklist

Mark items as done:

- [ ] Google Analytics ID configured (local + Vercel)
- [ ] Vercel DATABASE_URL has `?sslmode=require`
- [ ] Vercel DIRECT_URL has `?sslmode=require`
- [ ] Sentry configured and tested
- [ ] Email service configured and tested
- [ ] Privacy Policy reviewed and customized
- [ ] Terms of Service reviewed and customized
- [ ] Cookie Policy reviewed and customized
- [ ] Sitemaps submitted to Google Search Console
- [ ] Sitemaps submitted to Bing Webmaster Tools
- [ ] Full production smoke test passed
- [ ] Database backup/restore tested
- [ ] Lighthouse scores acceptable
- [ ] No console errors in production

---

## 🆘 If You Get Stuck

**Documentation:**
- Next.js Docs: https://nextjs.org/docs
- Vercel Docs: https://vercel.com/docs
- Sentry Next.js Guide: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Resend Docs: https://resend.com/docs

**Support:**
- Check existing documentation in repo
- Review error messages carefully
- Test in local development first
- Ask for help if needed

---

**Once all items are checked, you're ready to launch! 🚀**
