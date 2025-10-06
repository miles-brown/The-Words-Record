# Person Profile Images

## Image Guidelines

- **Format:** PNG (with transparency for circular display)
- **Size:** Recommended 500x500px minimum for best quality
- **Naming:** Use lowercase with hyphens matching person's slug
  - Example: `emma-watson.png` for person with slug `emma-watson`

## Adding Images

1. Place PNG files in this directory
2. Update the person's record in the database with the image path:
   - Use: `/images/persons/filename.png`

## Update Database

### Option 1: Via Prisma Studio (GUI)
```bash
npx prisma studio
```
Then edit the `imageUrl` field for each person.

### Option 2: Via Import Script
Add to your markdown file:
```markdown
## Person Name
- **Image:** /images/persons/person-name.png
- **Profession:** Their role
...
```

### Option 3: Direct SQL
```sql
UPDATE Person
SET imageUrl = '/images/persons/emma-watson.png'
WHERE slug = 'emma-watson';
```

## Current Images

(Add your files here - they'll automatically appear in the app)
