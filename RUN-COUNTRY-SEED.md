# 🌍 Run Country Seed Script

## ✅ You Have Two Options

### Option 1: Run Locally (If you have DB connection)

If your `.env` file has the correct `DATABASE_URL`:

```bash
cd /Users/milesbrown/Documents/Who-Said-What/Who-Said-What
npx tsx prisma/seed-countries.ts
```

**Expected output:**
```
Seeding countries...
✅ Created United States
✅ Created United Kingdom
✅ Created France
...
✅ Seeded 120+ countries
```

---

### Option 2: Convert to SQL INSERT (Recommended for Supabase)

Since you're running SQL directly in Supabase, I can generate the INSERT SQL from the TypeScript file.

**Here's the INSERT SQL for all 120+ countries:**

```sql
INSERT INTO "Country" ("code", "name_en", "iso3", "m49", "flag_emoji", "active", "createdAt", "updatedAt")
VALUES
  -- North America
  ('US', 'United States', 'USA', 840, '🇺🇸', true, NOW(), NOW()),
  ('CA', 'Canada', 'CAN', 124, '🇨🇦', true, NOW(), NOW()),
  ('MX', 'Mexico', 'MEX', 484, '🇲🇽', true, NOW(), NOW()),

  -- Western Europe
  ('GB', 'United Kingdom', 'GBR', 826, '🇬🇧', true, NOW(), NOW()),
  ('FR', 'France', 'FRA', 250, '🇫🇷', true, NOW(), NOW()),
  ('DE', 'Germany', 'DEU', 276, '🇩🇪', true, NOW(), NOW()),
  ('IT', 'Italy', 'ITA', 380, '🇮🇹', true, NOW(), NOW()),
  ('ES', 'Spain', 'ESP', 724, '🇪🇸', true, NOW(), NOW()),
  ('PT', 'Portugal', 'PRT', 620, '🇵🇹', true, NOW(), NOW()),
  ('NL', 'Netherlands', 'NLD', 528, '🇳🇱', true, NOW(), NOW()),
  ('BE', 'Belgium', 'BEL', 56, '🇧🇪', true, NOW(), NOW()),
  ('AT', 'Austria', 'AUT', 40, '🇦🇹', true, NOW(), NOW()),
  ('CH', 'Switzerland', 'CHE', 756, '🇨🇭', true, NOW(), NOW()),
  ('IE', 'Ireland', 'IRL', 372, '🇮🇪', true, NOW(), NOW()),

  -- Northern Europe
  ('SE', 'Sweden', 'SWE', 752, '🇸🇪', true, NOW(), NOW()),
  ('NO', 'Norway', 'NOR', 578, '🇳🇴', true, NOW(), NOW()),
  ('DK', 'Denmark', 'DNK', 208, '🇩🇰', true, NOW(), NOW()),
  ('FI', 'Finland', 'FIN', 246, '🇫🇮', true, NOW(), NOW()),
  ('IS', 'Iceland', 'ISL', 352, '🇮🇸', true, NOW(), NOW()),

  -- Eastern Europe
  ('PL', 'Poland', 'POL', 616, '🇵🇱', true, NOW(), NOW()),
  ('CZ', 'Czech Republic', 'CZE', 203, '🇨🇿', true, NOW(), NOW()),
  ('HU', 'Hungary', 'HUN', 348, '🇭🇺', true, NOW(), NOW()),
  ('RO', 'Romania', 'ROU', 642, '🇷🇴', true, NOW(), NOW()),
  ('BG', 'Bulgaria', 'BGR', 100, '🇧🇬', true, NOW(), NOW()),
  ('SK', 'Slovakia', 'SVK', 703, '🇸🇰', true, NOW(), NOW()),
  ('HR', 'Croatia', 'HRV', 191, '🇭🇷', true, NOW(), NOW()),
  ('SI', 'Slovenia', 'SVN', 705, '🇸🇮', true, NOW(), NOW()),
  ('LT', 'Lithuania', 'LTU', 440, '🇱🇹', true, NOW(), NOW()),
  ('LV', 'Latvia', 'LVA', 428, '🇱🇻', true, NOW(), NOW()),
  ('EE', 'Estonia', 'EST', 233, '🇪🇪', true, NOW(), NOW()),
  ('RU', 'Russia', 'RUS', 643, '🇷🇺', true, NOW(), NOW()),
  ('UA', 'Ukraine', 'UKR', 804, '🇺🇦', true, NOW(), NOW()),

  -- Southern Europe
  ('GR', 'Greece', 'GRC', 300, '🇬🇷', true, NOW(), NOW()),
  ('TR', 'Turkey', 'TUR', 792, '🇹🇷', true, NOW(), NOW()),
  ('CY', 'Cyprus', 'CYP', 196, '🇨🇾', true, NOW(), NOW()),
  ('MT', 'Malta', 'MLT', 470, '🇲🇹', true, NOW(), NOW()),

  -- Middle East
  ('IL', 'Israel', 'ISR', 376, '🇮🇱', true, NOW(), NOW()),
  ('SA', 'Saudi Arabia', 'SAU', 682, '🇸🇦', true, NOW(), NOW()),
  ('AE', 'United Arab Emirates', 'ARE', 784, '🇦🇪', true, NOW(), NOW()),
  ('QA', 'Qatar', 'QAT', 634, '🇶🇦', true, NOW(), NOW()),
  ('KW', 'Kuwait', 'KWT', 414, '🇰🇼', true, NOW(), NOW()),
  ('BH', 'Bahrain', 'BHR', 48, '🇧🇭', true, NOW(), NOW()),
  ('OM', 'Oman', 'OMN', 512, '🇴🇲', true, NOW(), NOW()),
  ('JO', 'Jordan', 'JOR', 400, '🇯🇴', true, NOW(), NOW()),
  ('LB', 'Lebanon', 'LBN', 422, '🇱🇧', true, NOW(), NOW()),
  ('IQ', 'Iraq', 'IRQ', 368, '🇮🇶', true, NOW(), NOW()),
  ('IR', 'Iran', 'IRN', 364, '🇮🇷', true, NOW(), NOW()),
  ('SY', 'Syria', 'SYR', 760, '🇸🇾', true, NOW(), NOW()),
  ('YE', 'Yemen', 'YEM', 887, '🇾🇪', true, NOW(), NOW()),
  ('PS', 'Palestine', 'PSE', 275, '🇵🇸', true, NOW(), NOW()),

  -- Asia Pacific
  ('CN', 'China', 'CHN', 156, '🇨🇳', true, NOW(), NOW()),
  ('JP', 'Japan', 'JPN', 392, '🇯🇵', true, NOW(), NOW()),
  ('KR', 'South Korea', 'KOR', 410, '🇰🇷', true, NOW(), NOW()),
  ('IN', 'India', 'IND', 356, '🇮🇳', true, NOW(), NOW()),
  ('PK', 'Pakistan', 'PAK', 586, '🇵🇰', true, NOW(), NOW()),
  ('BD', 'Bangladesh', 'BGD', 50, '🇧🇩', true, NOW(), NOW()),
  ('LK', 'Sri Lanka', 'LKA', 144, '🇱🇰', true, NOW(), NOW()),
  ('NP', 'Nepal', 'NPL', 524, '🇳🇵', true, NOW(), NOW()),
  ('MM', 'Myanmar', 'MMR', 104, '🇲🇲', true, NOW(), NOW()),
  ('TH', 'Thailand', 'THA', 764, '🇹🇭', true, NOW(), NOW()),
  ('VN', 'Vietnam', 'VNM', 704, '🇻🇳', true, NOW(), NOW()),
  ('PH', 'Philippines', 'PHL', 608, '🇵🇭', true, NOW(), NOW()),
  ('ID', 'Indonesia', 'IDN', 360, '🇮🇩', true, NOW(), NOW()),
  ('MY', 'Malaysia', 'MYS', 458, '🇲🇾', true, NOW(), NOW()),
  ('SG', 'Singapore', 'SGP', 702, '🇸🇬', true, NOW(), NOW()),
  ('KH', 'Cambodia', 'KHM', 116, '🇰🇭', true, NOW(), NOW()),
  ('LA', 'Laos', 'LAO', 418, '🇱🇦', true, NOW(), NOW()),
  ('BN', 'Brunei', 'BRN', 96, '🇧🇳', true, NOW(), NOW()),
  ('MN', 'Mongolia', 'MNG', 496, '🇲🇳', true, NOW(), NOW()),
  ('KP', 'North Korea', 'PRK', 408, '🇰🇵', true, NOW(), NOW()),
  ('TW', 'Taiwan', 'TWN', 158, '🇹🇼', true, NOW(), NOW()),
  ('HK', 'Hong Kong', 'HKG', 344, '🇭🇰', true, NOW(), NOW()),
  ('MO', 'Macau', 'MAC', 446, '🇲🇴', true, NOW(), NOW()),

  -- Oceania
  ('AU', 'Australia', 'AUS', 36, '🇦🇺', true, NOW(), NOW()),
  ('NZ', 'New Zealand', 'NZL', 554, '🇳🇿', true, NOW(), NOW()),
  ('PG', 'Papua New Guinea', 'PNG', 598, '🇵🇬', true, NOW(), NOW()),
  ('FJ', 'Fiji', 'FJI', 242, '🇫🇯', true, NOW(), NOW()),

  -- Africa
  ('ZA', 'South Africa', 'ZAF', 710, '🇿🇦', true, NOW(), NOW()),
  ('EG', 'Egypt', 'EGY', 818, '🇪🇬', true, NOW(), NOW()),
  ('NG', 'Nigeria', 'NGA', 566, '🇳🇬', true, NOW(), NOW()),
  ('KE', 'Kenya', 'KEN', 404, '🇰🇪', true, NOW(), NOW()),
  ('GH', 'Ghana', 'GHA', 288, '🇬🇭', true, NOW(), NOW()),
  ('ET', 'Ethiopia', 'ETH', 231, '🇪🇹', true, NOW(), NOW()),
  ('TZ', 'Tanzania', 'TZA', 834, '🇹🇿', true, NOW(), NOW()),
  ('UG', 'Uganda', 'UGA', 800, '🇺🇬', true, NOW(), NOW()),
  ('DZ', 'Algeria', 'DZA', 12, '🇩🇿', true, NOW(), NOW()),
  ('MA', 'Morocco', 'MAR', 504, '🇲🇦', true, NOW(), NOW()),
  ('TN', 'Tunisia', 'TUN', 788, '🇹🇳', true, NOW(), NOW()),
  ('LY', 'Libya', 'LBY', 434, '🇱🇾', true, NOW(), NOW()),
  ('SD', 'Sudan', 'SDN', 729, '🇸🇩', true, NOW(), NOW()),
  ('SN', 'Senegal', 'SEN', 686, '🇸🇳', true, NOW(), NOW()),
  ('CI', 'Ivory Coast', 'CIV', 384, '🇨🇮', true, NOW(), NOW()),
  ('CM', 'Cameroon', 'CMR', 120, '🇨🇲', true, NOW(), NOW()),
  ('ZW', 'Zimbabwe', 'ZWE', 716, '🇿🇼', true, NOW(), NOW()),
  ('AO', 'Angola', 'AGO', 24, '🇦🇴', true, NOW(), NOW()),
  ('MZ', 'Mozambique', 'MOZ', 508, '🇲🇿', true, NOW(), NOW()),
  ('RW', 'Rwanda', 'RWA', 646, '🇷🇼', true, NOW(), NOW()),

  -- South America
  ('BR', 'Brazil', 'BRA', 76, '🇧🇷', true, NOW(), NOW()),
  ('AR', 'Argentina', 'ARG', 32, '🇦🇷', true, NOW(), NOW()),
  ('CL', 'Chile', 'CHL', 152, '🇨🇱', true, NOW(), NOW()),
  ('CO', 'Colombia', 'COL', 170, '🇨🇴', true, NOW(), NOW()),
  ('PE', 'Peru', 'PER', 604, '🇵🇪', true, NOW(), NOW()),
  ('VE', 'Venezuela', 'VEN', 862, '🇻🇪', true, NOW(), NOW()),
  ('EC', 'Ecuador', 'ECU', 218, '🇪🇨', true, NOW(), NOW()),
  ('BO', 'Bolivia', 'BOL', 68, '🇧🇴', true, NOW(), NOW()),
  ('PY', 'Paraguay', 'PRY', 600, '🇵🇾', true, NOW(), NOW()),
  ('UY', 'Uruguay', 'URY', 858, '🇺🇾', true, NOW(), NOW()),
  ('GY', 'Guyana', 'GUY', 328, '🇬🇾', true, NOW(), NOW()),
  ('SR', 'Suriname', 'SUR', 740, '🇸🇷', true, NOW(), NOW()),

  -- Central America & Caribbean
  ('CR', 'Costa Rica', 'CRI', 188, '🇨🇷', true, NOW(), NOW()),
  ('PA', 'Panama', 'PAN', 591, '🇵🇦', true, NOW(), NOW()),
  ('GT', 'Guatemala', 'GTM', 320, '🇬🇹', true, NOW(), NOW()),
  ('HN', 'Honduras', 'HND', 340, '🇭🇳', true, NOW(), NOW()),
  ('SV', 'El Salvador', 'SLV', 222, '🇸🇻', true, NOW(), NOW()),
  ('NI', 'Nicaragua', 'NIC', 558, '🇳🇮', true, NOW(), NOW()),
  ('BZ', 'Belize', 'BLZ', 84, '🇧🇿', true, NOW(), NOW()),
  ('CU', 'Cuba', 'CUB', 192, '🇨🇺', true, NOW(), NOW()),
  ('JM', 'Jamaica', 'JAM', 388, '🇯🇲', true, NOW(), NOW()),
  ('HT', 'Haiti', 'HTI', 332, '🇭🇹', true, NOW(), NOW()),
  ('DO', 'Dominican Republic', 'DOM', 214, '🇩🇴', true, NOW(), NOW()),
  ('TT', 'Trinidad and Tobago', 'TTO', 780, '🇹🇹', true, NOW(), NOW()),

  -- Special / Other
  ('XX', 'Stateless', NULL, NULL, '🏴', true, NOW(), NOW()),
  ('XK', 'Kosovo', 'XKX', NULL, '🇽🇰', true, NOW(), NOW())

ON CONFLICT ("code") DO NOTHING;
```

---

## ✅ How to Run Option 2

1. **Copy the SQL above** (all the INSERT statement)
2. **Open Supabase SQL Editor**
3. **Paste and click "Run"**
4. **Wait 2-3 seconds**

**Expected result:**
```
INSERT 0 120
```

This means 120 countries were inserted (or 0 if they already exist due to `ON CONFLICT DO NOTHING`).

---

## 🔍 Verify It Worked

Run this in Supabase:

```sql
SELECT COUNT(*) FROM "Country";
```

**Expected:** ~120 rows

```sql
SELECT * FROM "Country" WHERE code IN ('US', 'GB', 'FR', 'DE', 'CN') ORDER BY code;
```

**Expected:** 5 rows with proper flags 🇨🇳 🇩🇪 🇫🇷 🇬🇧 🇺🇸

---

## ✅ Next Steps After Seeding

Once countries are seeded:
1. See **[NEXT-STEPS-AFTER-SQL.md](NEXT-STEPS-AFTER-SQL.md)** Step 4
2. Migrate legacy nationality data
3. Test the application

---

**Recommended: Use Option 2 (SQL INSERT) since you're already working in Supabase SQL Editor!** 🚀
