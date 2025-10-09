# Content Import Guide

## Quick Start

1. Create your cases in markdown format (see `example-cases.md`)
2. Run the import script
3. Verify the data on your site

## Method 1: Markdown Import (Recommended)

### Format Your Data

Create a `.md` file with cases separated by `##` headings:

```markdown
## Person Name
- **Profession:** Their role
- **Date:** Date of case
- **Exact Wording:** *"The exact quote"*
- **Context:** Background and circumstances
- **Platform:** Where it was said (Instagram, Twitter, Court, etc.)
- **Media Coverage / Framing:** How media reported it
- **Categories:** Category1 / Category2 / Category3
- **Response / Outcome:** How they responded
- **Citations:** Source URLs
```

### Run Import

```bash
npx tsx scripts/import-markdown.ts data/your-file.md
```

### Example

```bash
npx tsx scripts/import-markdown.ts data/example-cases.md
```

## What Gets Created

For each case, the script automatically:

✅ **Creates/Updates Person** with name and profession
✅ **Creates Case** with title, summary, and full description
✅ **Creates Statement** with the exact quote
✅ **Creates Tags** from categories (auto-linked)
✅ **Prevents Duplicates** using unique constraints

## Tips

### Date Formats
Any of these work:
- `3 January 2022`
- `2022-01-03`
- `January 3, 2022`
- `1/3/2022`

### Categories
Separate with `/`:
```
Solidarity / Social Media / Entertainment
```

Creates 3 tags:
- Solidarity
- Social Media
- Entertainment

### Multiple Cases
Add as many as you want in one file:
```markdown
## Person 1
...

## Person 2
...

## Person 3
...
```

## Troubleshooting

### Script Shows Usage Help
```bash
npx tsx scripts/import-markdown.ts
```
You forgot the file path. Add it:
```bash
npx tsx scripts/import-markdown.ts data/cases.md
```

### "File not found"
Check your file path:
```bash
ls data/
```

### Date Parse Warnings
The script will use current date if it can't parse. Format dates clearly:
- ✅ `3 January 2022`
- ❌ `Jan 3rd '22`

### Duplicate Cases
The script uses `upsert` - if a case already exists with the same slug, it updates instead of creating a new one.

## Advanced: CSV Import

For bulk imports, you can also use:
```bash
npx tsx scripts/import-csv.ts data/your-file.csv
```

CSV format is less flexible - markdown is recommended.

## After Import

1. Check your site: http://localhost:3002
2. Browse "What?" to see cases
3. Browse "Who?" to see people
4. Search should now find your new content
5. Tags appear in filters

## Production Import

When you have your production database:
1. Update `DATABASE_URL` in `.env`
2. Run migrations: `npx prisma migrate deploy`
3. Run import: `npx tsx scripts/import-markdown.ts data/production-data.md`
