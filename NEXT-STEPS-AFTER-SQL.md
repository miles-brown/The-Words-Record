# ✅ SQL Migration Complete - Next Steps

## 🎯 What You Just Did
You successfully ran the SQL migration in Supabase, which created:
- ✅ Country table (empty)
- ✅ PersonNationality table (empty)
- ✅ Cache fields on Person table
- ✅ NationalityType and AcquisitionMethod enums

---

## 📋 Step 1: Verify Tables Exist

Run this in Supabase SQL Editor:

```sql
SELECT tablename FROM pg_tables
WHERE tablename IN ('Country', 'PersonNationality');
```

**Expected:** 2 rows (Country, PersonNationality)

If you see **0 or 1 rows**, the migration didn't complete. Go back and run the safe SQL again.

---

## 📋 Step 2: Seed Country Data (REQUIRED)

The Country table is **empty**. You need to populate it with 120+ countries.

### Option A: Create API Endpoint (Easiest)

Create this file: `pages/api/admin/seed-countries.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

const COUNTRIES = [
  { code: 'US', name_en: 'United States', iso3: 'USA', m49: 840, flag_emoji: '🇺🇸', active: true },
  { code: 'GB', name_en: 'United Kingdom', iso3: 'GBR', m49: 826, flag_emoji: '🇬🇧', active: true },
  { code: 'FR', name_en: 'France', iso3: 'FRA', m49: 250, flag_emoji: '🇫🇷', active: true },
  { code: 'DE', name_en: 'Germany', iso3: 'DEU', m49: 276, flag_emoji: '🇩🇪', active: true },
  { code: 'CN', name_en: 'China', iso3: 'CHN', m49: 156, flag_emoji: '🇨🇳', active: true },
  { code: 'JP', name_en: 'Japan', iso3: 'JPN', m49: 392, flag_emoji: '🇯🇵', active: true },
  { code: 'IN', name_en: 'India', iso3: 'IND', m49: 356, flag_emoji: '🇮🇳', active: true },
  { code: 'CA', name_en: 'Canada', iso3: 'CAN', m49: 124, flag_emoji: '🇨🇦', active: true },
  { code: 'AU', name_en: 'Australia', iso3: 'AUS', m49: 36, flag_emoji: '🇦🇺', active: true },
  { code: 'BR', name_en: 'Brazil', iso3: 'BRA', m49: 76, flag_emoji: '🇧🇷', active: true },
  { code: 'IT', name_en: 'Italy', iso3: 'ITA', m49: 380, flag_emoji: '🇮🇹', active: true },
  { code: 'ES', name_en: 'Spain', iso3: 'ESP', m49: 724, flag_emoji: '🇪🇸', active: true },
  { code: 'MX', name_en: 'Mexico', iso3: 'MEX', m49: 484, flag_emoji: '🇲🇽', active: true },
  { code: 'RU', name_en: 'Russia', iso3: 'RUS', m49: 643, flag_emoji: '🇷🇺', active: true },
  { code: 'ZA', name_en: 'South Africa', iso3: 'ZAF', m49: 710, flag_emoji: '🇿🇦', active: true },
  { code: 'NL', name_en: 'Netherlands', iso3: 'NLD', m49: 528, flag_emoji: '🇳🇱', active: true },
  { code: 'SE', name_en: 'Sweden', iso3: 'SWE', m49: 752, flag_emoji: '🇸🇪', active: true },
  { code: 'NO', name_en: 'Norway', iso3: 'NOR', m49: 578, flag_emoji: '🇳🇴', active: true },
  { code: 'DK', name_en: 'Denmark', iso3: 'DNK', m49: 208, flag_emoji: '🇩🇰', active: true },
  { code: 'FI', name_en: 'Finland', iso3: 'FIN', m49: 246, flag_emoji: '🇫🇮', active: true },
  { code: 'PL', name_en: 'Poland', iso3: 'POL', m49: 616, flag_emoji: '🇵🇱', active: true },
  { code: 'IE', name_en: 'Ireland', iso3: 'IRL', m49: 372, flag_emoji: '🇮🇪', active: true },
  { code: 'NZ', name_en: 'New Zealand', iso3: 'NZL', m49: 554, flag_emoji: '🇳🇿', active: true },
  { code: 'SG', name_en: 'Singapore', iso3: 'SGP', m49: 702, flag_emoji: '🇸🇬', active: true },
  { code: 'KR', name_en: 'South Korea', iso3: 'KOR', m49: 410, flag_emoji: '🇰🇷', active: true },
  { code: 'AR', name_en: 'Argentina', iso3: 'ARG', m49: 32, flag_emoji: '🇦🇷', active: true },
  { code: 'CL', name_en: 'Chile', iso3: 'CHL', m49: 152, flag_emoji: '🇨🇱', active: true },
  { code: 'CO', name_en: 'Colombia', iso3: 'COL', m49: 170, flag_emoji: '🇨🇴', active: true },
  { code: 'PE', name_en: 'Peru', iso3: 'PER', m49: 604, flag_emoji: '🇵🇪', active: true },
  { code: 'VE', name_en: 'Venezuela', iso3: 'VEN', m49: 862, flag_emoji: '🇻🇪', active: true },
  { code: 'EG', name_en: 'Egypt', iso3: 'EGY', m49: 818, flag_emoji: '🇪🇬', active: true },
  { code: 'IL', name_en: 'Israel', iso3: 'ISR', m49: 376, flag_emoji: '🇮🇱', active: true },
  { code: 'TR', name_en: 'Turkey', iso3: 'TUR', m49: 792, flag_emoji: '🇹🇷', active: true },
  { code: 'SA', name_en: 'Saudi Arabia', iso3: 'SAU', m49: 682, flag_emoji: '🇸🇦', active: true },
  { code: 'AE', name_en: 'United Arab Emirates', iso3: 'ARE', m49: 784, flag_emoji: '🇦🇪', active: true },
  { code: 'NG', name_en: 'Nigeria', iso3: 'NGA', m49: 566, flag_emoji: '🇳🇬', active: true },
  { code: 'KE', name_en: 'Kenya', iso3: 'KEN', m49: 404, flag_emoji: '🇰🇪', active: true },
  { code: 'GH', name_en: 'Ghana', iso3: 'GHA', m49: 288, flag_emoji: '🇬🇭', active: true },
  { code: 'TH', name_en: 'Thailand', iso3: 'THA', m49: 764, flag_emoji: '🇹🇭', active: true },
  { code: 'VN', name_en: 'Vietnam', iso3: 'VNM', m49: 704, flag_emoji: '🇻🇳', active: true },
  { code: 'PH', name_en: 'Philippines', iso3: 'PHL', m49: 608, flag_emoji: '🇵🇭', active: true },
  { code: 'MY', name_en: 'Malaysia', iso3: 'MYS', m49: 458, flag_emoji: '🇲🇾', active: true },
  { code: 'ID', name_en: 'Indonesia', iso3: 'IDN', m49: 360, flag_emoji: '🇮🇩', active: true },
  { code: 'PK', name_en: 'Pakistan', iso3: 'PAK', m49: 586, flag_emoji: '🇵🇰', active: true },
  { code: 'BD', name_en: 'Bangladesh', iso3: 'BGD', m49: 50, flag_emoji: '🇧🇩', active: true },
  { code: 'UA', name_en: 'Ukraine', iso3: 'UKR', m49: 804, flag_emoji: '🇺🇦', active: true },
  { code: 'GR', name_en: 'Greece', iso3: 'GRC', m49: 300, flag_emoji: '🇬🇷', active: true },
  { code: 'PT', name_en: 'Portugal', iso3: 'PRT', m49: 620, flag_emoji: '🇵🇹', active: true },
  { code: 'AT', name_en: 'Austria', iso3: 'AUT', m49: 40, flag_emoji: '🇦🇹', active: true },
  { code: 'CH', name_en: 'Switzerland', iso3: 'CHE', m49: 756, flag_emoji: '🇨🇭', active: true },
  { code: 'BE', name_en: 'Belgium', iso3: 'BEL', m49: 56, flag_emoji: '🇧🇪', active: true },
  { code: 'CZ', name_en: 'Czech Republic', iso3: 'CZE', m49: 203, flag_emoji: '🇨🇿', active: true },
  { code: 'RO', name_en: 'Romania', iso3: 'ROU', m49: 642, flag_emoji: '🇷🇴', active: true },
  { code: 'HU', name_en: 'Hungary', iso3: 'HUN', m49: 348, flag_emoji: '🇭🇺', active: true },
  { code: 'XX', name_en: 'Stateless', iso3: null, m49: null, flag_emoji: '🏴', active: true },
  // Add more countries from prisma/seed-countries.ts - there are 120+ total
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    let created = 0
    let updated = 0

    for (const country of COUNTRIES) {
      const existing = await prisma.country.findUnique({ where: { code: country.code } })

      if (existing) {
        await prisma.country.update({
          where: { code: country.code },
          data: country
        })
        updated++
      } else {
        await prisma.country.create({ data: country })
        created++
      }
    }

    res.status(200).json({
      success: true,
      created,
      updated,
      total: COUNTRIES.length
    })
  } catch (error: any) {
    console.error('Seed error:', error)
    res.status(500).json({ error: error.message })
  }
}
```

**Then:**
1. Commit and push this file
2. Deploy to Vercel
3. Use Postman/Insomnia or curl to POST to: `https://your-app.vercel.app/api/admin/seed-countries`

```bash
curl -X POST https://your-app.vercel.app/api/admin/seed-countries
```

### Option B: Manual SQL Insert (Quick but Limited)

Run this SQL in Supabase for the most common countries:

```sql
INSERT INTO "Country" ("code", "name_en", "iso3", "m49", "flag_emoji", "active", "createdAt", "updatedAt")
VALUES
  ('US', 'United States', 'USA', 840, '🇺🇸', true, NOW(), NOW()),
  ('GB', 'United Kingdom', 'GBR', 826, '🇬🇧', true, NOW(), NOW()),
  ('FR', 'France', 'FRA', 250, '🇫🇷', true, NOW(), NOW()),
  ('DE', 'Germany', 'DEU', 276, '🇩🇪', true, NOW(), NOW()),
  ('CN', 'China', 'CHN', 156, '🇨🇳', true, NOW(), NOW()),
  ('JP', 'Japan', 'JPN', 392, '🇯🇵', true, NOW(), NOW()),
  ('IN', 'India', 'IND', 356, '🇮🇳', true, NOW(), NOW()),
  ('CA', 'Canada', 'CAN', 124, '🇨🇦', true, NOW(), NOW()),
  ('AU', 'Australia', 'AUS', 36, '🇦🇺', true, NOW(), NOW()),
  ('BR', 'Brazil', 'BRA', 76, '🇧🇷', true, NOW(), NOW()),
  ('IT', 'Italy', 'ITA', 380, '🇮🇹', true, NOW(), NOW()),
  ('ES', 'Spain', 'ESP', 724, '🇪🇸', true, NOW(), NOW()),
  ('MX', 'Mexico', 'MEX', 484, '🇲🇽', true, NOW(), NOW()),
  ('RU', 'Russia', 'RUS', 643, '🇷🇺', true, NOW(), NOW()),
  ('XX', 'Stateless', NULL, NULL, '🏴', true, NOW(), NOW())
ON CONFLICT ("code") DO NOTHING;
```

**Note:** This only adds 15 countries. For all 120+, use Option A.

---

## 📋 Step 3: Verify Countries Were Seeded

Run this in Supabase:

```sql
SELECT COUNT(*) FROM "Country";
```

**Expected:**
- Option A: ~120+ countries
- Option B: 15 countries

```sql
SELECT * FROM "Country" WHERE code IN ('US', 'GB', 'FR') ORDER BY code;
```

**Expected:** 3 rows with flags 🇺🇸 🇬🇧 🇫🇷

---

## 📋 Step 4: Migrate Legacy Nationality Data

Similar to seeding, create: `pages/api/admin/migrate-nationalities.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { normalizeCountry, normalizeCountries } from '@/lib/countries'
import { computeCachesForPerson } from '@/lib/nationality-helpers'
import { NationalityType, AcquisitionMethod } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const people = await prisma.person.findMany({
      select: {
        id: true,
        name: true,
        nationality: true,
        nationalityArray: true,
        primaryNationality: true,
        nationalityDetail: true,
      },
    })

    let migrated = 0
    let skipped = 0

    for (const person of people) {
      const nationalityCodes = new Set<string>()
      let primaryCode: string | null = null

      // Collect from all legacy sources
      if (person.primaryNationality) {
        const code = normalizeCountry(person.primaryNationality)
        if (code) {
          nationalityCodes.add(code)
          primaryCode = code
        }
      }
      if (person.nationality) {
        const code = normalizeCountry(person.nationality)
        if (code) {
          nationalityCodes.add(code)
          if (!primaryCode) primaryCode = code
        }
      }
      if (person.nationalityArray && person.nationalityArray.length > 0) {
        const codes = normalizeCountries(person.nationalityArray)
        codes.forEach(c => nationalityCodes.add(c))
        if (!primaryCode && codes.length > 0) primaryCode = codes[0]
      }

      if (nationalityCodes.size === 0) {
        skipped++
        continue
      }

      // Create PersonNationality rows
      let displayOrder = 0
      for (const code of nationalityCodes) {
        const isPrimary = code === primaryCode
        let type: NationalityType = NationalityType.CITIZENSHIP
        let acquisition: AcquisitionMethod | undefined = undefined
        const detail = person.nationalityDetail?.toLowerCase() || ''

        if (detail.includes('ethnic') || detail.includes('heritage')) {
          type = NationalityType.ETHNIC_ORIGIN
        } else if (detail.includes('cultural') || detail.includes('identity')) {
          type = NationalityType.CULTURAL_IDENTITY
        }

        if (detail.includes('birth')) {
          acquisition = AcquisitionMethod.BY_BIRTH
        } else if (detail.includes('descent') || detail.includes('parent')) {
          acquisition = AcquisitionMethod.BY_DESCENT
        }

        await prisma.personNationality.create({
          data: {
            id: uuidv4(),
            personId: person.id,
            countryCode: code,
            type,
            acquisition,
            isPrimary,
            displayOrder: displayOrder++,
            note: person.nationalityDetail || undefined,
            confidence: person.nationalityDetail ? 80 : 60,
          },
        })
      }

      await computeCachesForPerson(person.id)
      migrated++
    }

    res.status(200).json({ success: true, migrated, skipped, total: people.length })
  } catch (error: any) {
    console.error('Migration error:', error)
    res.status(500).json({ error: error.message })
  }
}
```

**Then:**
```bash
curl -X POST https://your-app.vercel.app/api/admin/migrate-nationalities
```

---

## 📋 Step 5: Verify Migration Worked

```sql
SELECT COUNT(*) FROM "PersonNationality";
```

**Expected:** Number of people with nationalities

```sql
SELECT
  p.name,
  c.flag_emoji,
  c.name_en,
  pn.type,
  pn."isPrimary"
FROM "PersonNationality" pn
JOIN "Person" p ON p.id = pn."personId"
JOIN "Country" c ON c.code = pn."countryCode"
WHERE pn."endDate" IS NULL
LIMIT 10;
```

**Expected:** 10 rows with proper flags and names

---

## 📋 Step 6: Deploy & Test

1. Visit your app: `https://your-app.vercel.app/people`
2. Check nationality filter - should show 120+ countries with flags
3. Filter by a country (e.g., 🇺🇸 United States)
4. Verify person cards show proper flags (no 🌍)
5. Click a person - verify nationality displays correctly

---

## ✅ Success Checklist

- [ ] SQL migration completed
- [ ] Country table has 120+ countries
- [ ] PersonNationality table populated with data
- [ ] Cache fields computed on Person table
- [ ] Nationality filter shows countries with flags
- [ ] Person cards display correct flags
- [ ] No "OTHER" text appears
- [ ] No 🌍 globe emoji fallbacks

---

## 🆘 Need Help?

See:
- **[FIX-SQL-ERROR.md](FIX-SQL-ERROR.md)** - SQL troubleshooting
- **[NATIONALITY-DEPLOYMENT.md](docs/NATIONALITY-DEPLOYMENT.md)** - Complete deployment guide
- **[NATIONALITY-SYSTEM-SUMMARY.md](NATIONALITY-SYSTEM-SUMMARY.md)** - Project overview

---

**You're almost there! Just need to seed the data and test!** 🚀
