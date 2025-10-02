# Vercel Deployment Guide

This guide will walk you through deploying "Who Said What" to Vercel with a PostgreSQL database.

## Prerequisites

- GitHub account
- Vercel account (free): https://vercel.com/signup
- Your project pushed to GitHub

## Step 1: Push to GitHub

If you haven't already, initialize git and push your project:

```bash
git init
git add .
git commit -m "Initial commit - ready for deployment"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## Step 2: Import Project to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Vercel will auto-detect Next.js settings ✅

## Step 3: Set Up Vercel Postgres Database

### Option A: Vercel Postgres (Recommended)

1. In your Vercel project dashboard, go to the **Storage** tab
2. Click **Create Database**
3. Select **Postgres**
4. Choose your region (closest to your users)
5. Click **Create**
6. Copy the `DATABASE_URL` - Vercel will add it automatically to your environment variables

### Option B: External Database (Supabase, Railway, PlanetScale)

If using an external database:
1. Create a PostgreSQL database on your chosen platform
2. Get the connection string (DATABASE_URL)
3. Add it to Vercel environment variables (see Step 4)

## Step 4: Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add these variables for **Production**, **Preview**, and **Development**:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX (optional - your Google Analytics ID)
```

**Note:** If using Vercel Postgres, the `DATABASE_URL` is automatically added.

## Step 5: Update Prisma Schema for Production

Your `prisma/schema.prisma` is already configured for both SQLite (dev) and PostgreSQL (production):

```prisma
datasource db {
  provider = "sqlite"  // Change to "postgresql" for production
  url      = env("DATABASE_URL")
}
```

**For Vercel deployment**, update it to:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Commit this change:
```bash
git add prisma/schema.prisma
git commit -m "Update database provider for production"
git push
```

## Step 6: Run Database Migrations

After your first deployment, you need to set up the database schema:

### Method 1: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Link your project:
```bash
vercel link
```

3. Pull environment variables:
```bash
vercel env pull .env.production
```

4. Run migration:
```bash
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2-)" npx prisma migrate deploy
```

### Method 2: Using Vercel Dashboard

1. Go to your project → **Settings** → **Functions**
2. Add a one-time serverless function or use the Vercel CLI as shown above

## Step 7: Import Your Data

Once the database is set up, import your content:

```bash
# Using the production database URL
DATABASE_URL="your-production-url" npx tsx scripts/import-markdown.ts data/example-incidents.md
```

Or create an admin page to import via the UI.

## Step 8: Deploy

Push any changes to trigger automatic deployment:

```bash
git add .
git commit -m "Ready for production"
git push
```

Vercel will automatically:
- Install dependencies
- Run `prisma generate` (via postinstall script)
- Build your Next.js app
- Deploy to production

## Step 9: Set Up Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_SITE_URL` to your custom domain

## Post-Deployment Checklist

- ✅ Database is connected and migrations are complete
- ✅ Environment variables are set
- ✅ Site URL is updated
- ✅ Data is imported
- ✅ Google Analytics is configured (optional)
- ✅ Test all pages and functionality
- ✅ Check search functionality
- ✅ Verify image uploads work (if implemented)

## Updating the Database Schema

When you add new fields or models:

1. Update `prisma/schema.prisma`
2. Create migration locally:
```bash
npx prisma migrate dev --name description_of_change
```
3. Commit and push changes
4. Deploy migration to production:
```bash
vercel env pull .env.production
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2-)" npx prisma migrate deploy
```

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify `postinstall` script runs `prisma generate`

### Database Connection Issues
- Verify `DATABASE_URL` format is correct
- Check database is accessible from Vercel's region
- Ensure SSL is enabled if required: `?sslmode=require`

### Missing Data
- Run import script with production DATABASE_URL
- Check database using Prisma Studio:
```bash
DATABASE_URL="your-production-url" npx prisma studio
```

## Automatic Deployments

Every push to `main` triggers a production deployment. For preview deployments, push to other branches.

## Support

- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs

## Quick Reference Commands

```bash
# Link to Vercel project
vercel link

# Pull production environment variables
vercel env pull .env.production

# Deploy migrations to production
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2-)" npx prisma migrate deploy

# Import data to production
DATABASE_URL="your-url" npx tsx scripts/import-markdown.ts data/incidents.md

# Open Prisma Studio for production DB
DATABASE_URL="your-url" npx prisma studio
```
