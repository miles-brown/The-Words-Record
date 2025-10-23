# Automation Scripts Hosting & Scheduling Guide

## Overview

This guide covers cost-effective options for hosting and regularly running automation scripts for The Words Record project. The scripts handle:

1. **Death Information Updates** - Checks for deceased people based on age-based schedules
2. **Auto-Promotion** - Promotes statements to cases when they have >2 responses
3. **Response Analysis** - Analyzes statement response distributions

## Updated Scripts

### ✅ Scripts Updated for Current Schema

All automation scripts have been updated to work with the current database schema:

- **check-death-updates.ts** - Updated with proper source verification fields and dual birthDate support
- **auto-promote-statements.js** - Updated with visibility and status fields for cases
- **analyze-statement-responses.js** - Already compatible

### NPM Scripts Available

```bash
# Death check automation
npm run automation:death-check          # Run scheduled death checks
npm run automation:death-check-force    # Force check all people
npm run automation:death-check-80       # Check only 80+ age group

# Statement promotion
npm run automation:auto-promote         # Auto-promote qualifying statements

# Analysis
npm run automation:analyze-responses    # Analyze response distribution

# Run all automations
npm run automation:all                  # Run death check + auto-promote
```

## Hosting Options (Ranked by Cost)

### 🟢 Option 1: Vercel Cron Jobs (FREE - RECOMMENDED)

**Cost**: FREE on Hobby plan, included in Pro plan
**Setup Time**: 5 minutes
**Reliability**: ⭐⭐⭐⭐⭐

Since you're already deployed on Vercel, this is the best option.

#### Setup Steps:

1. **Add vercel.json configuration**:

```json
{
  "crons": [
    {
      "path": "/api/cron/automation?task=all",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/automation?task=death-check",
      "schedule": "0 14 * * *"
    }
  ]
}
```

Schedule formats:
- `0 2 * * *` - Every day at 2:00 AM UTC
- `0 14 * * *` - Every day at 2:00 PM UTC
- `0 */12 * * *` - Every 12 hours
- `0 0 * * 0` - Every Sunday at midnight

2. **Add CRON_SECRET to environment variables**:

```bash
# Generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to Vercel:
vercel env add CRON_SECRET
# Paste the generated secret
```

3. **Deploy**:

```bash
git add .
git commit -m "feat: Add automated cron jobs for maintenance tasks"
git push
```

4. **Verify in Vercel Dashboard**:
- Go to Project Settings → Cron Jobs
- You should see your scheduled jobs listed
- View logs to confirm they're running

**Pros**:
- ✅ Free (no additional cost)
- ✅ Already integrated with your hosting
- ✅ Built-in logging and monitoring
- ✅ No additional infrastructure to manage
- ✅ Automatic scaling

**Cons**:
- ⚠️ 10-second execution timeout on Hobby plan (60s on Pro)
- ⚠️ Limited to specific cron schedules

**Workaround for Timeout**: The API endpoint processes only 20 people per run to stay within the timeout limit. Schedule it to run more frequently.

---

### 🟢 Option 2: GitHub Actions (FREE)

**Cost**: FREE (2,000 minutes/month on free plan)
**Setup Time**: 10 minutes
**Reliability**: ⭐⭐⭐⭐

Use GitHub Actions to trigger your Vercel API endpoint.

#### Setup Steps:

1. **Create workflow file** `.github/workflows/automation.yml`:

```yaml
name: Run Automation Scripts

on:
  schedule:
    # Run death checks at 2 AM UTC daily
    - cron: '0 2 * * *'
    # Run auto-promotion at 2 PM UTC daily
    - cron: '0 14 * * *'
  workflow_dispatch: # Allow manual triggering

jobs:
  run-automation:
    runs-on: ubuntu-latest
    steps:
      - name: Run Death Check
        if: github.event.schedule == '0 2 * * *' || github.event_name == 'workflow_dispatch'
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            "${{ secrets.VERCEL_URL }}/api/cron/automation?task=death-check"

      - name: Run Auto-Promotion
        if: github.event.schedule == '0 14 * * *' || github.event_name == 'workflow_dispatch'
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            "${{ secrets.VERCEL_URL }}/api/cron/automation?task=auto-promote"
```

2. **Add GitHub Secrets**:
   - Go to Repository Settings → Secrets and variables → Actions
   - Add `CRON_SECRET` (same as Vercel)
   - Add `VERCEL_URL` (your production URL: https://who-said-what.vercel.app)

3. **Commit and push**:

```bash
git add .github/workflows/automation.yml
git commit -m "feat: Add GitHub Actions automation workflow"
git push
```

**Pros**:
- ✅ Free
- ✅ Flexible scheduling
- ✅ Can run longer tasks (up to 6 hours)
- ✅ Good logging
- ✅ Manual trigger option

**Cons**:
- ⚠️ Requires GitHub repository
- ⚠️ Slight delay in execution (up to a few minutes)

---

### 🟡 Option 3: External Cron Services

**Cost**: FREE tiers available
**Setup Time**: 5 minutes
**Reliability**: ⭐⭐⭐⭐

Use external services to ping your API endpoint.

#### Recommended Services:

**A. cron-job.org** (FREE)
- Free tier: Unlimited jobs, 1-minute minimum interval
- Setup: Create account, add cronjob with URL + auth header

**B. EasyCron** (FREE)
- Free tier: 100 executions/day
- Setup: Add URL with custom header support

**C. UptimeRobot** (FREE)
- Free tier: 50 monitors
- Can be used for simple GET requests
- Note: Doesn't support custom headers easily

#### Setup Example (cron-job.org):

1. Sign up at https://cron-job.org
2. Create new cronjob:
   - **URL**: `https://who-said-what.vercel.app/api/cron/automation?task=all`
   - **Schedule**: Daily at 2:00 AM
   - **Request Headers**:
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```
3. Save and enable

**Pros**:
- ✅ Free tiers available
- ✅ Easy setup
- ✅ Reliable execution
- ✅ Email notifications on failure

**Cons**:
- ⚠️ External dependency
- ⚠️ Limited free tier features
- ⚠️ Need to manage additional service

---

### 🟡 Option 4: Cloudflare Workers (FREE)

**Cost**: FREE (100,000 requests/day)
**Setup Time**: 15 minutes
**Reliability**: ⭐⭐⭐⭐⭐

Use Cloudflare Workers with Cron Triggers.

#### Setup Steps:

1. **Install Wrangler**:
```bash
npm install -g wrangler
wrangler login
```

2. **Create worker** `workers/automation.js`:

```javascript
export default {
  async scheduled(event, env, ctx) {
    const hour = new Date().getUTCHours()
    const task = hour === 2 ? 'death-check' : 'auto-promote'

    const response = await fetch(
      `${env.VERCEL_URL}/api/cron/automation?task=${task}`,
      {
        headers: {
          'Authorization': `Bearer ${env.CRON_SECRET}`
        }
      }
    )

    console.log('Automation result:', await response.json())
  }
}
```

3. **Configure** `wrangler.toml`:

```toml
name = "words-record-automation"
main = "workers/automation.js"
compatibility_date = "2024-01-01"

[triggers]
crons = ["0 2 * * *", "0 14 * * *"]

[vars]
VERCEL_URL = "https://who-said-what.vercel.app"
```

4. **Deploy**:
```bash
wrangler secret put CRON_SECRET
wrangler deploy
```

**Pros**:
- ✅ Free
- ✅ Extremely reliable
- ✅ Fast execution
- ✅ Global network

**Cons**:
- ⚠️ Requires Cloudflare account
- ⚠️ More complex setup

---

### 🔴 Option 5: Railway.app / Render.com

**Cost**: ~$5-10/month
**Setup Time**: 20 minutes
**Reliability**: ⭐⭐⭐⭐

Deploy a small Node.js service with node-cron.

**Only consider if**: You need more control or longer execution times.

---

## Recommended Architecture

### Best Setup (FREE):

**Vercel Cron Jobs (Primary)** + **GitHub Actions (Backup)**

1. Use Vercel Cron for primary automation
2. Use GitHub Actions as backup/failover
3. Both point to the same API endpoint

This provides:
- Zero cost
- High reliability (redundancy)
- Easy monitoring
- No external dependencies

### Implementation Priority:

1. ✅ **Immediate**: Deploy the `/api/cron/automation.ts` endpoint
2. ✅ **Week 1**: Set up Vercel Cron Jobs
3. ✅ **Week 2**: Add GitHub Actions as backup
4. ⚠️ **Optional**: Add monitoring/alerting (see below)

---

## Monitoring & Alerting

### Option 1: Built-in Vercel Logs
- View logs in Vercel dashboard
- Filter by function name

### Option 2: BetterStack (FREE)
- Free tier: 100,000 logs/month
- Set up alerts for failures
- https://betterstack.com

### Option 3: Sentry (FREE)
- Free tier: 5,000 errors/month
- Add to API endpoint for error tracking
- https://sentry.io

---

## Environment Variables Needed

Add these to your Vercel project:

```bash
# Required for cron authentication
CRON_SECRET=<your-secure-random-string>

# Already set (for Claude API in death checks)
ANTHROPIC_API_KEY=<your-api-key>

# Already set (database)
DATABASE_URL=<your-database-url>
DIRECT_URL=<your-direct-database-url>
```

---

## Testing

### Test the API endpoint manually:

```bash
# Set your secret
export CRON_SECRET="your-secret-here"

# Test death check
curl -X GET \
  -H "Authorization: Bearer $CRON_SECRET" \
  "https://who-said-what.vercel.app/api/cron/automation?task=death-check"

# Test auto-promotion
curl -X GET \
  -H "Authorization: Bearer $CRON_SECRET" \
  "https://who-said-what.vercel.app/api/cron/automation?task=auto-promote"

# Test all
curl -X GET \
  -H "Authorization: Bearer $CRON_SECRET" \
  "https://who-said-what.vercel.app/api/cron/automation?task=all"
```

---

## Cost Comparison Summary

| Option | Monthly Cost | Setup Time | Reliability | Best For |
|--------|-------------|------------|-------------|----------|
| Vercel Cron | FREE | 5 min | ⭐⭐⭐⭐⭐ | Current setup |
| GitHub Actions | FREE | 10 min | ⭐⭐⭐⭐ | Backup |
| cron-job.org | FREE | 5 min | ⭐⭐⭐⭐ | Simple backup |
| Cloudflare Workers | FREE | 15 min | ⭐⭐⭐⭐⭐ | Advanced users |
| Railway/Render | $5-10 | 20 min | ⭐⭐⭐⭐ | Heavy workloads |

---

## Next Steps

1. **Deploy the cron API endpoint** (already created at `/pages/api/cron/automation.ts`)
2. **Generate CRON_SECRET** and add to Vercel environment variables
3. **Create vercel.json** with cron configuration
4. **Deploy and test**
5. **Monitor logs** to ensure it's working
6. **Optional**: Set up GitHub Actions as backup

---

## Maintenance Schedule

The scripts will run on these schedules:

### Death Information Checks
- **Age 80+**: Every 2 weeks
- **Age 60-79**: Every 4 weeks
- **Age <60**: Every 8 months

The script automatically tracks last check dates and only processes people due for checking.

### Auto-Promotion
- **Run**: Daily (or on-demand)
- **Action**: Promotes statements with >2 responses to full cases

### Recommended Cron Schedule
```
0 2 * * *   - Run all automations at 2 AM UTC daily
0 14 * * *  - Run auto-promotion again at 2 PM UTC (optional)
```

This ensures regular maintenance without overwhelming the system or API costs.
