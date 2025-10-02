# Organization Logos

## Image Guidelines

- **Format:** PNG (with transparency recommended)
- **Size:** Recommended 400x400px minimum
- **Naming:** Use lowercase with hyphens matching organization's slug
  - Example: `united-nations.png` for organization with slug `united-nations`

## Adding Logos

1. Place PNG files in this directory
2. Update the organization's record in the database with the logo path:
   - Use: `/images/organizations/filename.png`

## Update Database

### Via Prisma Studio (GUI)
```bash
npx prisma studio
```
Then edit the `imageUrl` field for each organization.

### Via Import Script
When creating organizations, include:
```markdown
- **Logo:** /images/organizations/org-name.png
```

### Direct SQL
```sql
UPDATE Organization
SET imageUrl = '/images/organizations/united-nations.png'
WHERE slug = 'united-nations';
```

## Current Logos

(Add your files here - they'll automatically appear in the app)
