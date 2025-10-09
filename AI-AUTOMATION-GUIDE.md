# AI Automation Guide

## 🤖 Automated Case Research & Import

This system uses AI to automatically research, document, and import cases to your database **without manual work**.

---

## Quick Start (3 Steps)

### 1. Add AI API Key to `.env`

Choose **one** of these AI services:

**Option A: Anthropic Claude (Recommended)**
```bash
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

**Option B: OpenAI GPT-4**
```bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
```

### 2. Run for a Single Person

```bash
npx tsx scripts/ai-case-generator.ts "Elon Musk" --auto-import
```

### 3. Done!

The AI will:
- 🔍 Research recent cases
- 📝 Write a properly formatted markdown file
- 💾 Import directly to your database
- ✅ Make it live on your website immediately

---

## Batch Processing (Multiple People at Once)

### Create a list file

Create `data/people-to-research.txt`:
```
Elon Musk
Taylor Swift
Kanye West
J.K. Rowling
Dave Chappelle
```

### Run batch processing

```bash
npx tsx scripts/batch-ai-generator.ts data/people-to-research.txt --auto-import
```

The script will:
- Process each person one by one
- Wait 5 seconds between API calls (to avoid rate limits)
- Show progress for each person
- Auto-import everything to database

---

## Scheduled Automation (Cron Jobs)

Want cases added automatically every day? Set up a cron job:

### On Mac/Linux

1. Open crontab:
```bash
crontab -e
```

2. Add this line to run daily at 2am:
```bash
0 2 * * * cd /path/to/Who-Said-What && npx tsx scripts/batch-ai-generator.ts data/people-to-research.txt --auto-import >> logs/ai-automation.log 2>&1
```

### On Windows

Use Task Scheduler to run:
```bash
npx tsx scripts/batch-ai-generator.ts data/people-to-research.txt --auto-import
```

---

## Manual Review Workflow

If you want to review before importing:

```bash
# Generate without auto-import
npx tsx scripts/ai-case-generator.ts "Person Name"

# Review the generated file in data/auto-generated/

# Import manually if it looks good
npx tsx scripts/import-markdown.ts data/auto-generated/person-name-2025-01-15.md
```

---

## How It Works

### 1. AI Research Prompt

The AI is instructed to:
- Find verifiable, recent cases
- Use credible sources (major news outlets, court docs)
- Be strictly neutral and factual
- Format in the exact markdown structure needed
- Include proper citations

### 2. Quality Controls

The AI will:
- ✅ Only include verified information
- ✅ Cite credible sources
- ✅ Use direct quotes when available
- ✅ Maintain neutrality
- ❌ Skip if no significant case found
- ❌ Avoid speculation or opinion

### 3. Auto-Import

The system:
- Creates Person records
- Creates Case records
- Creates Statement records
- Auto-generates tags from categories
- Links everything together
- Prevents duplicates with unique constraints

---

## Advanced: Continuous Monitoring

### Option 1: GitHub Actions (Cloud-based)

Create `.github/workflows/ai-research.yml`:
```yaml
name: AI Case Research
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2am
  workflow_dispatch:  # Manual trigger

jobs:
  research:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx tsx scripts/batch-ai-generator.ts data/people-to-research.txt --auto-import
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Option 2: Vercel Cron (Serverless)

If deployed on Vercel, create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/ai-research",
    "schedule": "0 2 * * *"
  }]
}
```

Then create `pages/api/cron/ai-research.ts` that calls the batch generator.

---

## Cost Estimates

### AI API Costs

**Anthropic Claude:**
- ~$0.01-0.03 per case researched
- 100 cases = ~$1-3

**OpenAI GPT-4:**
- ~$0.02-0.05 per case researched
- 100 cases = ~$2-5

### Rate Limits

The batch script automatically waits 5 seconds between requests to avoid:
- API rate limits
- Excessive costs
- Being flagged as spam

---

## Troubleshooting

### "No API key found"
Add `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` to your `.env` file.

### "NO_CASE_FOUND"
The AI couldn't find a significant, verifiable case for that person. This is normal - not everyone has documented controversies.

### Import fails
- Check database connection in `.env`
- Make sure Prisma schema is up to date: `npx prisma generate`

### Rate limit errors
Increase `DELAY_BETWEEN_REQUESTS` in `batch-ai-generator.ts` from 5000 to 10000 (10 seconds).

---

## Best Practices

### 1. Start Small
Test with 1-2 people before running batch jobs:
```bash
npx tsx scripts/ai-case-generator.ts "Test Person" --auto-import
```

### 2. Review First Batch
Don't use `--auto-import` for your first batch. Review the generated markdown files manually to ensure quality.

### 3. Monitor Costs
Check your AI API usage dashboard regularly.

### 4. Update Your List
Keep `people-to-research.txt` updated with people relevant to your site's focus.

### 5. Version Control
Commit auto-generated markdown files to git so you have a record of what was imported.

---

## Example Workflow

### Daily Automated Research

1. **Morning**: AI runs automatically (cron job)
   - Researches 10-20 people from your list
   - Generates markdown files
   - Auto-imports to database

2. **Afternoon**: You review
   - Check `data/auto-generated/` for new files
   - Verify accuracy and neutrality
   - Delete any questionable entries from database if needed

3. **Evening**: Content is live
   - New cases appear on your site
   - Search indexes updated
   - Tags automatically created

### Weekly Batch Update

```bash
# Monday morning: Run batch for the week's targets
npx tsx scripts/batch-ai-generator.ts data/weekly-list.txt --auto-import

# Review and verify throughout the week
# Deploy to production on Friday
```

---

## Files Reference

- `scripts/ai-case-generator.ts` - Single person AI research
- `scripts/batch-ai-generator.ts` - Multi-person batch processing
- `scripts/import-markdown.ts` - Import markdown to database
- `data/auto-generated/` - Where AI-generated files are saved
- `data/example-cases.md` - Manual markdown examples

---

## Getting API Keys

### Anthropic Claude
1. Go to https://console.anthropic.com
2. Sign up / Log in
3. Go to API Keys
4. Create a new key
5. Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-xxxxx`

### OpenAI GPT-4
1. Go to https://platform.openai.com
2. Sign up / Log in
3. Go to API Keys
4. Create a new key
5. Add to `.env`: `OPENAI_API_KEY=sk-xxxxx`

---

## Next Steps

1. ✅ Add API key to `.env`
2. ✅ Test with one person
3. ✅ Create a list of people to research
4. ✅ Run batch processing
5. ✅ Set up cron job for daily automation
6. ✅ Monitor and refine

**Need help?** Check the logs in `data/auto-generated/` to see what the AI generated.
