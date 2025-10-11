# Nationality System Implementation Guide

## Status: Phase 2 Complete - Ready for API/UI Integration

### ✅ What's Been Built

**Committed to GitHub (branch: `phase2-auth-dashboard`):**

1. **Prisma Schema** (commit 7987184)
   - `Country` model with ISO 3166-1 alpha-2 codes
   - `PersonNationality` junction table with governance
   - Cache fields on Person: `nationality_primary_code`, `nationality_codes_cached`
   - Updated enums: `NationalityType`, `AcquisitionMethod`

2. **Seed Script** (`prisma/seed-countries.ts`)
   - 120+ countries with ISO codes, names, flags
   - Idempotent (safe to run multiple times)

3. **Helper Utilities** (`lib/nationality-helpers.ts`)
   - `computeCachesForPerson()` - Syncs cache fields from PersonNationality
   - `validatePersonNationalityRules()` - Enforces governance
   - `upsertPersonNationality()` - Validated create/update
   - `closePersonNationality()` - End-date facts

4. **Migration Script** (`scripts/migrate-legacy-nationalities.ts`)
   - Backfills PersonNationality from legacy fields
   - Infers type/acquisition from `nationalityDetail`
   - Computes caches automatically

5. **Countries Utilities** (`lib/countries.ts` - already exists)
   - 100+ countries with aliases
   - `normalizeCountry()`, `normalizeCountries()`
   - Flag/name lookups

---

## 📋 Remaining Work - API/UI Integration

### Step 1: Create Person Nationality Mapper

**File:** `lib/mappers/person-nationality.ts`

```typescript
import { Person, PersonNationality, Country } from '@prisma/client'
import { flagEmojiFromCode, countryNameFromCode } from '../countries'

export type PersonWithNationalities = Person & {
  nationalities?: (PersonNationality & { country: Country })[]
}

export interface NationalityDTO {
  code: string
  name: string
  flagEmoji: string
  type: string
  acquisition?: string
  isPrimary: boolean
  startDate?: string | null
  endDate?: string | null
  note?: string | null
}

/**
 * Map Person to include normalized nationality data
 */
export function withNormalizedNationality(person: PersonWithNationalities) {
  const nationalityCodes = person.nationality_codes_cached || []
  const primaryCode = person.nationality_primary_code

  const nationalitiesExpanded: NationalityDTO[] = person.nationalities
    ? person.nationalities
        .filter(n => !n.endDate) // Active only
        .map(n => ({
          code: n.countryCode,
          name: n.country.name_en,
          flagEmoji: n.country.flag_emoji || flagEmojiFromCode(n.countryCode as any),
          type: n.type,
          acquisition: n.acquisition || undefined,
          isPrimary: n.isPrimary,
          startDate: n.startDate?.toISOString() || null,
          endDate: n.endDate?.toISOString() || null,
          note: n.note || null,
        }))
    : nationalityCodes.map(code => ({
        code,
        name: countryNameFromCode(code as any),
        flagEmoji: flagEmojiFromCode(code as any),
        type: 'CITIZENSHIP',
        isPrimary: code === primaryCode,
        startDate: null,
        endDate: null,
        note: null,
      }))

  return {
    ...person,
    nationalityCodes,
    nationalityPrimaryCode: primaryCode,
    nationalities: nationalitiesExpanded,
  }
}
```

---

### Step 2: Update People API (List)

**File:** `pages/api/people/index.ts`

**Changes:**

1. **Filter by country code** (not name):
```typescript
// OLD:
if (nationality) {
  where.nationality = { contains: nationality }
}

// NEW:
if (nationality) {
  where.nationalities = {
    some: {
      countryCode: nationality, // ISO code like "US", "GB"
      endDate: null, // Active only
    },
  }
}
```

2. **Include nationalities in query:**
```typescript
const people = await prisma.person.findMany({
  where,
  include: {
    nationalities: {
      where: { endDate: null }, // Active only
      include: { country: true },
      orderBy: [
        { isPrimary: 'desc' },
        { displayOrder: 'asc' },
      ],
    },
    // ... other includes
  },
  // ... rest of query
})
```

3. **Map results:**
```typescript
import { withNormalizedNationality } from '@/lib/mappers/person-nationality'

const mappedPeople = people.map(withNormalizedNationality)

return res.status(200).json({
  people: mappedPeople,
  // ... pagination
})
```

---

### Step 3: Update Person Detail API

**File:** `pages/api/people/[slug].ts`

**Changes:**

1. **Include nationalities:**
```typescript
const person = await prisma.person.findUnique({
  where: { slug },
  include: {
    nationalities: {
      where: { endDate: null },
      include: { country: true },
      orderBy: [
        { isPrimary: 'desc' },
        { displayOrder: 'asc' },
      ],
    },
    // ... other includes
  },
})

if (!person) return res.status(404).json({ error: 'Not found' })

const mapped = withNormalizedNationality(person)
return res.status(200).json(mapped)
```

---

### Step 4: Update Nationality Filter UI

**File:** `pages/people/index.tsx`

**Changes:**

1. **Fetch country options from database:**
```typescript
// In getServerSideProps or client-side effect:
const countries = await prisma.country.findMany({
  where: { active: true },
  orderBy: { name_en: 'asc' },
  select: { code: true, name_en: true, flag_emoji: true },
})
```

2. **Update filter dropdown:**
```tsx
<select
  id="nationality"
  value={filters.nationality}
  onChange={(e) => handleFilterChange('nationality', e.target.value)}
>
  <option value="">All Nationalities</option>
  {countries.map(({ code, name_en, flag_emoji }) => (
    <option key={code} value={code}>
      {flag_emoji} {name_en}
    </option>
  ))}
</select>
```

---

### Step 5: Update PersonCardEnhanced

**File:** `components/PersonCardEnhanced.tsx`

**Changes:**

```tsx
{/* Nationality - use nationalities from API */}
{person.nationalities && person.nationalities.length > 0 && (
  <div className="flex flex-wrap gap-2">
    {person.nationalities.slice(0, 2).map((nat) => (
      <span
        key={nat.code}
        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs flex items-center gap-1"
      >
        <span>{nat.flagEmoji}</span>
        <span>{nat.name}</span>
        {nat.isPrimary && <span className="text-blue-600">★</span>}
      </span>
    ))}
    {person.nationalities.length > 2 && (
      <span className="text-xs text-gray-500">
        +{person.nationalities.length - 2} more
      </span>
    )}
  </div>
)}
```

---

### Step 6: Update Person Profile Quick Facts

**File:** `pages/people/[slug].tsx`

**Changes:**

```tsx
{/* Nationality Quick Facts */}
{person.nationalities && person.nationalities.length > 0 && (
  <div className="info-row">
    <span className="info-label">Nationality:</span>
    <span className="info-value">
      {person.nationalities.map((nat, idx) => (
        <div key={nat.code} className="nationality-item">
          <span>{nat.flagEmoji} {nat.name}</span>
          {nat.isPrimary && <span className="badge">Primary</span>}
          {nat.type !== 'CITIZENSHIP' && (
            <span className="type-badge">{nat.type.replace('_', ' ')}</span>
          )}
          {nat.acquisition && (
            <span className="text-sm text-gray-500">
              ({nat.acquisition.replace('_', ' ').toLowerCase()})
            </span>
          )}
          {nat.startDate && (
            <span className="text-sm text-gray-500">
              since {new Date(nat.startDate).getFullYear()}
            </span>
          )}
        </div>
      ))}
    </span>
  </div>
)}
```

---

## 🚀 Deployment Workflow

### Local Development Setup

```bash
cd Who-Said-What

# 1. Generate Prisma client with new models
npx prisma generate

# 2. Create migration (creates Country and PersonNationality tables)
npx prisma migrate dev --name add_nationality_system

# 3. Seed countries (120+ ISO codes)
npx tsx prisma/seed-countries.ts

# 4. Migrate legacy data to PersonNationality
npx tsx scripts/migrate-legacy-nationalities.ts

# 5. Verify database
npx prisma studio
# Check Country table has ~120 rows
# Check PersonNationality table has migrated data
# Check Person.nationality_primary_code and nationality_codes_cached are populated

# 6. Test build
npm run build

# 7. Test locally
npm run dev
# Visit /people - filter should show country flags
# Visit /people/[slug] - should show nationalities with types
```

### Production Deployment (Vercel)

**WARNING:** This is a **breaking schema change**. Production deployment requires:

1. **Database Backup First**
2. **Deploy during low-traffic window**
3. **Have rollback plan ready**

**Steps:**

```bash
# 1. Commit all API/UI changes (Steps 1-6 above)
git add lib/mappers pages/api pages/people components
git commit -m "feat(nationality): wire PersonNationality through API and UI"

# 2. Push to GitHub
git push origin phase2-auth-dashboard

# 3. In Vercel dashboard:
#    - Ensure DATABASE_URL points to production Supabase
#    - Deploy will fail on first try (tables don't exist yet)

# 4. Run migration against production database:
npx prisma migrate deploy

# 5. Seed production countries:
DATABASE_URL="postgresql://..." npx tsx prisma/seed-countries.ts

# 6. Migrate production data:
DATABASE_URL="postgresql://..." npx tsx scripts/migrate-legacy-nationalities.ts

# 7. Redeploy in Vercel (should succeed now)

# 8. Verify:
#    - /people filter shows countries
#    - Person cards show flags
#    - Profile quick facts show nationalities
```

---

## 🔍 Testing Checklist

- [ ] Filter dropdown shows countries with flags (sorted alphabetically)
- [ ] Filtering by country returns correct people
- [ ] Person cards display up to 2 nationalities with flags
- [ ] Primary nationality marked with star or badge
- [ ] Profile shows all nationalities grouped by type
- [ ] No "Other 🌍" fallbacks (only for truly unknown)
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors
- [ ] No console errors in browser

---

## 📚 Governance Rules (Enforced by Helpers)

1. **At most one primary CITIZENSHIP** per person (active)
2. **No overlapping active facts** (same person, country, type)
3. **Temporal validity**: Use startDate/endDate for historical facts
4. **Cache sync**: Always call `computeCachesForPerson()` after mutations
5. **Source tracking**: Encourage sourceId + confidence for imported data

---

## 🛠️ Maintenance

### Adding New Countries

```typescript
// Add to prisma/seed-countries.ts:
{ code: 'XX', name_en: 'New Country', iso3: 'XXX', m49: 999, flag_emoji: '🏴' }

// Re-run seed:
npx tsx prisma/seed-countries.ts
```

### Fixing Person Nationalities

```typescript
import { upsertPersonNationality, closePersonNationality } from '@/lib/nationality-helpers'

// Close old fact:
await closePersonNationality('person-nationality-id', new Date())

// Add new fact:
await upsertPersonNationality({
  personId: 'person-id',
  countryCode: 'US',
  type: 'CITIZENSHIP',
  acquisition: 'BY_BIRTH',
  isPrimary: true,
})
// Cache automatically updated
```

---

## Next Steps

1. Build API mapper (Step 1)
2. Update API endpoints (Steps 2-3)
3. Update UI components (Steps 4-6)
4. Test locally
5. Deploy to production

**Estimated Time:** 2-3 hours for full implementation + testing
