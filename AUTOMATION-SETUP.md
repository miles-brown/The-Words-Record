# Automation Setup - Quick Start Guide

## What's Been Completed ✅

1. ✅ **Updated all automation scripts** to work with current database schema
2. ✅ **Created API endpoint** for cron job execution ([/pages/api/cron/automation.ts](pages/api/cron/automation.ts))
3. ✅ **Added npm scripts** for easy local testing
4. ✅ **Configured Vercel cron jobs** in [vercel.json](vercel.json)
5. ✅ **Created comprehensive hosting guide** ([AUTOMATION-HOSTING-GUIDE.md](AUTOMATION-HOSTING-GUIDE.md))

## Scripts Overview

### 1. Death Information Monitor ([scripts/check-death-updates.ts](scripts/check-death-updates.ts))
- Checks for recently deceased people in the database
- Age-based scheduling:
  - **80+ years**: Check every 2 weeks
  - **60-79 years**: Check every 4 weeks
  - **<60 years**: Check every 8 months
- Uses Claude API to search for death information
- Automatically updates Person records and creates Source records

### 2. Auto-Promotion ([scripts/auto-promote-statements.js](scripts/auto-promote-statements.js))
- Automatically promotes statements to cases when they have >2 responses
- Calculates qualification scores (0-100)
- Sets proper case status and visibility
- Tracks promotion metadata

### 3. Response Analysis ([scripts/analyze-statement-responses.js](scripts/analyze-statement-responses.js))
- Analyzes statement response distribution
- Provides insights on qualification thresholds
- Useful for monitoring system health

## Quick Setup (5 Minutes)

### Step 1: Generate CRON_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output (e.g., `a1b2c3d4...`)

### Step 2: Add to Vercel Environment Variables

**Option A: Via Vercel CLI**
```bash
vercel env add CRON_SECRET production
# Paste the secret when prompted
```

**Option B: Via Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add new variable:
   - **Name**: `CRON_SECRET`
   - **Value**: (paste your generated secret)
   - **Environment**: Production, Preview, Development

### Step 3: Deploy

```bash
git add .
git commit -m "feat: Add automated cron jobs for maintenance tasks"
git push
```

### Step 4: Verify

1. Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
2. You should see:
   - ✅ `/api/cron/automation?task=all` - Daily at 2:00 AM UTC
   - ✅ `/api/cron/automation?task=auto-promote` - Daily at 2:00 PM UTC

## Testing Locally

### Test individual scripts:

```bash
# Death check (scheduled)
npm run automation:death-check

# Death check (force all)
npm run automation:death-check-force

# Death check (80+ only)
npm run automation:death-check-80

# Auto-promotion
npm run automation:auto-promote

# Response analysis
npm run automation:analyze-responses

# Run all
npm run automation:all
```

### Test the API endpoint:

```bash
# Set your secret
export CRON_SECRET="your-secret-here"

# Test locally (with dev server running)
curl -X GET \
  -H "Authorization: Bearer $CRON_SECRET" \
  "http://localhost:3000/api/cron/automation?task=all"

# Test on production
curl -X GET \
  -H "Authorization: Bearer $CRON_SECRET" \
  "https://who-said-what.vercel.app/api/cron/automation?task=all"
```

Expected response:
```json
{
  "task": "all",
  "timestamp": "2025-01-23T...",
  "success": true,
  "data": {
    "deathCheck": {
      "checked": 5,
      "deceased": 0,
      "totalPeople": 150
    },
    "autoPromotion": {
      "totalStatements": 500,
      "qualified": 3,
      "promoted": 3,
      "promotedCases": ["case-slug-1", "case-slug-2", "case-slug-3"]
    }
  }
}
```

## Schedule Configuration

Current schedule (defined in [vercel.json](vercel.json)):

```json
"crons": [
  {
    "path": "/api/cron/automation?task=all",
    "schedule": "0 2 * * *"  // Daily at 2:00 AM UTC
  },
  {
    "path": "/api/cron/automation?task=auto-promote",
    "schedule": "0 14 * * *"  // Daily at 2:00 PM UTC
  }
]
```

### Cron Schedule Format

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * *
```

### Common Schedules

```bash
0 2 * * *      # Daily at 2:00 AM UTC
0 */12 * * *   # Every 12 hours
0 0 * * 0      # Every Sunday at midnight
0 0 1 * *      # First day of every month
*/30 * * * *   # Every 30 minutes
```

## Monitoring

### View Logs

**Vercel Dashboard**:
1. Go to your project
2. Click "Deployments" → Select your deployment
3. Click "Functions" tab
4. Find `/api/cron/automation`
5. View execution logs

**Vercel CLI**:
```bash
vercel logs https://who-said-what.vercel.app
```

### Check Last Execution

The API endpoint logs show:
- Timestamp of execution
- Number of people checked
- Number of statements promoted
- Any errors encountered

## Troubleshooting

### Cron jobs not running?

1. **Check environment variables**:
   ```bash
   vercel env ls
   ```
   Ensure `CRON_SECRET` is set.

2. **Check cron configuration**:
   - Verify [vercel.json](vercel.json) has correct paths
   - Check schedule format is valid

3. **Check function logs**:
   - Look for authorization errors
   - Look for database connection errors

### API returning 401 Unauthorized?

- Verify `CRON_SECRET` matches between Vercel and your test request
- Check the Authorization header format: `Bearer YOUR_SECRET`

### Functions timing out?

- The death check processes 20 people per run by default
- Vercel Hobby plan has 10-second timeout
- Consider upgrading to Pro plan (60-second timeout) or:
  - Reduce batch size in the API endpoint
  - Run more frequently with smaller batches

### Database connection issues?

- Verify `DATABASE_URL` and `DIRECT_URL` are set in Vercel
- Check database connection limits
- Ensure Prisma client is properly initialized

## Cost Breakdown

### Current Setup (FREE)

- **Vercel Hosting**: FREE (Hobby plan)
- **Vercel Cron Jobs**: FREE (included)
- **Database**: Depends on your plan
- **Claude API**: Pay-per-use (only for death checks)

### Estimated Claude API Costs

Death checks use Claude API:
- **Model**: claude-sonnet-4 (~$3 per million input tokens, $15 per million output tokens)
- **Per check**: ~500 input tokens + ~300 output tokens = ~$0.006
- **80+ age group** (14-day interval): ~2 checks/month = $0.012/person/month
- **60-79 age group** (28-day interval): ~1 check/month = $0.006/person/month
- **<60 age group** (8-month interval): ~$0.001/person/month

**Example**: 100 people (30 aged 80+, 40 aged 60-79, 30 aged <60)
- Monthly cost: (30 × $0.012) + (40 × $0.006) + (30 × $0.001) = $0.63/month

Very affordable! 🎉

## Next Steps

1. ✅ **Deploy** - Push the changes to trigger deployment
2. ✅ **Add CRON_SECRET** - Follow Step 2 above
3. ✅ **Verify** - Check Vercel dashboard for cron jobs
4. ✅ **Monitor** - Check logs after first execution
5. ⚠️ **Optional**: Set up GitHub Actions backup (see [AUTOMATION-HOSTING-GUIDE.md](AUTOMATION-HOSTING-GUIDE.md))

## Additional Resources

- **Comprehensive Hosting Guide**: [AUTOMATION-HOSTING-GUIDE.md](AUTOMATION-HOSTING-GUIDE.md)
- **Vercel Cron Documentation**: https://vercel.com/docs/cron-jobs
- **Script Files**:
  - [scripts/check-death-updates.ts](scripts/check-death-updates.ts)
  - [scripts/auto-promote-statements.js](scripts/auto-promote-statements.js)
  - [scripts/analyze-statement-responses.js](scripts/analyze-statement-responses.js)
- **API Endpoint**: [pages/api/cron/automation.ts](pages/api/cron/automation.ts)

## Support

If you encounter issues:

1. Check the logs in Vercel Dashboard
2. Test the endpoint manually with curl
3. Review error messages in the console
4. Verify all environment variables are set correctly
5. Check database connection and Prisma client status

The automation system is now production-ready! 🚀
