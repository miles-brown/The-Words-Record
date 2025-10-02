# Vercel Deployment - Quick Start

## 🚀 5-Minute Setup

### 1. Update Database Provider for Production

Open `prisma/schema.prisma` and change:

```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 2. Push to GitHub

```bash
git init
git add .
git commit -m "Ready for Vercel deployment"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 3. Deploy to Vercel

1. Go to **https://vercel.com/new**
2. Click **Import Git Repository**
3. Select your GitHub repo
4. Click **Deploy** (Vercel auto-detects Next.js)

### 4. Add PostgreSQL Database

**In your Vercel project dashboard:**

1. Go to **Storage** tab
2. Click **Create Database**
3. Select **Postgres**
4. Choose your region → **Create**
5. Vercel automatically adds `DATABASE_URL` to your environment variables ✅

### 5. Set Additional Environment Variables

Go to **Settings** → **Environment Variables** and add:

```
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX (optional)
```

Select **Production**, **Preview**, and **Development** for each.

### 6. Redeploy

Go to **Deployments** → click the three dots on the latest deployment → **Redeploy**

This ensures the new environment variables are picked up.

### 7. Run Database Migrations

Install Vercel CLI:
```bash
npm i -g vercel
```

Link and migrate:
```bash
vercel link
vercel env pull .env.production
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2-)" npx prisma migrate deploy
```

### 8. Import Your Data

```bash
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2-)" npx tsx scripts/import-markdown.ts data/example-incidents.md
```

## ✅ You're Live!

Your site is now deployed at: **https://your-project.vercel.app**

### Next Steps:
- Add a custom domain in **Settings** → **Domains**
- Set up Google Analytics
- Import your production data
- Test all functionality

---

**For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**
