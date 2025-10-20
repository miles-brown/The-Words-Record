# 🚀 Pre-Launch Task List - The Words Record
**Target Launch:** Monday | **100 Critical Tasks** | **Last Updated:** October 17, 2025

---

## How to Use This List

Each category has **5 specific, actionable tasks** (one per priority level):
- 🔴 **CRITICAL** - Blocking launch, must be done
- 🟠 **URGENT** - Essential for basic functionality
- 🟡 **SERIOUS** - Professional launch requirement
- 🟢 **IMPORTANT** - Quality improvement
- 🔵 **WORTHWHILE** - Nice-to-have enhancement

**Format:** `[Priority] Task Description (Time) - Specific steps to complete`

---

## 1️⃣ BACKEND & DATABASE

### 🔴 CRITICAL: Run and verify production database migration
**Time:** 2 hours | **Owner:** Backend Dev
```bash
# Steps:
1. Create staging database copy: `npm run db:push` on staging
2. Test all Prisma queries return data without errors
3. Verify all foreign keys: SELECT * FROM information_schema.table_constraints
4. Run migration on production: `npm run db:push` with DATABASE_URL
5. Smoke test: Create 1 test case, person, statement, verify relationships work
```

### 🟠 URGENT: Create critical database indexes for query performance
**Time:** 2 hours | **Owner:** Backend Dev
```sql
-- Add these indexes to Prisma schema, then migrate:
@@index([statementDate, isVerified])  // On Statement model
@@index([slug, isActive])              // On Case model
@@index([name, isVerified])            // On Person model
@@index([createdAt, caseId])           // On Statement model for timeline queries
@@index([searchVector])                // Full-text search if using pg_trgm
```

### 🟡 SERIOUS: Implement API response caching for public endpoints
**Time:** 2 hours | **Owner:** Backend Dev
```typescript
// Add to pages/api/cases/index.ts and similar:
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
  // ... rest of handler
}
// Test: Open DevTools Network tab, refresh twice, verify 2nd request shows "from disk cache"
```

### 🟢 IMPORTANT: Set up automated daily database backups
**Time:** 1 hour | **Owner:** DevOps
```bash
# Supabase automatic backups:
1. Go to Supabase Dashboard → Settings → Database → Backup Settings
2. Enable Point-in-Time Recovery (PITR) - keeps 7 days of backups
3. Set daily backup schedule at 2 AM UTC
4. Test restore: Create test backup, restore to new database, verify data
5. Document restore procedure in DISASTER-RECOVERY.md
```

### 🔵 WORTHWHILE: Add database health monitoring dashboard
**Time:** 2 hours | **Owner:** DevOps
```typescript
// Create pages/api/admin/db-health.ts:
export default async function handler(req, res) {
  const health = await prisma.$queryRaw`
    SELECT count(*) as active_connections FROM pg_stat_activity;
  `
  return res.json({
    status: 'healthy',
    connections: health[0].active_connections,
    timestamp: new Date()
  })
}
```

---

## 2️⃣ AUTHENTICATION & SECURITY

### 🔴 CRITICAL: Test complete admin login flow end-to-end
**Time:** 1 hour | **Owner:** QA/Dev
```
Test Checklist:
□ Navigate to /admin → redirects to /admin/login
□ Enter correct credentials → logs in, redirects to /admin dashboard
□ JWT token stored in httpOnly cookie (check DevTools → Application → Cookies)
□ Token expires after 7 days (check cookie expiration)
□ After logout → cannot access /admin routes, redirects to login
□ Invalid credentials → shows error message, does NOT crash
□ SQL injection attempt in password field → safely rejected
```

### 🟠 URGENT: Implement account lockout after 5 failed login attempts
**Time:** 2 hours | **Owner:** Backend Dev
```typescript
// Update pages/api/auth/login.ts:
// 1. After failed login: increment user.loginAttempts
// 2. If loginAttempts >= 5: set user.lockedUntil = now + 15 minutes
// 3. Check lockedUntil before allowing login attempt
// 4. After successful login: reset loginAttempts to 0
// 5. Test: Try 5 wrong passwords, verify 6th attempt shows "Account locked" error
```

### 🟡 SERIOUS: Add CSRF protection to all forms
**Time:** 2 hours | **Owner:** Backend Dev
```typescript
// Install: npm install csrf
// Create lib/csrf.ts:
import csrf from 'csrf';
const tokens = new csrf();
export const generateCsrfToken = () => tokens.create(process.env.CSRF_SECRET);
export const verifyCsrfToken = (token) => tokens.verify(process.env.CSRF_SECRET, token);

// Add to every form POST handler:
if (!verifyCsrfToken(req.body._csrf)) return res.status(403).json({ error: 'Invalid CSRF token' });

// Add to every form in UI:
<input type="hidden" name="_csrf" value={csrfToken} />
```

### 🟢 IMPORTANT: Implement password reset flow via email
**Time:** 3 hours | **Owner:** Full-stack Dev
```typescript
// 1. Create pages/api/auth/forgot-password.ts (generates reset token, sends email)
// 2. Create pages/api/auth/reset-password.ts (validates token, updates password)
// 3. Create pages/auth/reset-password.tsx (form to enter new password)
// 4. Set up SendGrid or Resend for email delivery
// 5. Test: Request reset → receive email → click link → set new password → login works
```

### 🔵 WORTHWHILE: Add two-factor authentication (2FA) option
**Time:** 4 hours | **Owner:** Backend Dev
```bash
# Install: npm install speakeasy qrcode
# 1. Add mfaSecret, mfaEnabled fields to User model (already exists)
# 2. Create /api/auth/mfa/enable (generates QR code)
# 3. Create /api/auth/mfa/verify (validates TOTP token)
# 4. Update login flow to prompt for 2FA code if mfaEnabled=true
# 5. Test with Google Authenticator app
```

---

## 3️⃣ FRONTEND PAGES - PUBLIC

### 🔴 CRITICAL: Test homepage (/) renders correctly with real data
**Time:** 1 hour | **Owner:** Frontend Dev
```
Test Checklist:
□ Homepage loads in < 3 seconds
□ Featured cases section shows 6 recent cases with images
□ Hero section displays correct headline and call-to-action
□ "Latest Statements" section shows 10 most recent statements
□ Search bar works (type query → press Enter → redirects to /search?q=...)
□ Navigation links all work (Cases, People, Organizations, etc.)
□ Footer displays correct copyright year, links to Privacy/Terms
□ Mobile view (< 768px): hamburger menu works, layout doesn't break
```

### 🟠 URGENT: Implement pagination on /cases, /people, /statements pages
**Time:** 3 hours | **Owner:** Full-stack Dev
```typescript
// Update pages/api/cases/index.ts:
const page = parseInt(req.query.page as string) || 1;
const limit = 20;
const skip = (page - 1) * limit;
const [cases, total] = await Promise.all([
  prisma.case.findMany({ take: limit, skip }),
  prisma.case.count()
]);
return res.json({ cases, total, page, totalPages: Math.ceil(total / limit) });

// Update pages/cases/index.tsx:
// Add pagination component: <Pagination currentPage={page} totalPages={totalPages} />
// Test: Navigate through pages, verify data changes, URL updates to ?page=2
```

### 🟡 SERIOUS: Add filtering and sorting to /people page
**Time:** 3 hours | **Owner:** Full-stack Dev
```typescript
// Add filter UI:
- Dropdown: Sort by (Name A-Z, Most Statements, Recently Updated)
- Checkboxes: Filter by Organization Type (Individual, Corporation, Government, etc.)
- Search input: Filter by name

// Update pages/api/people/index.ts:
const { sort, orgType, search } = req.query;
const where = {
  ...(orgType && { organization: { type: orgType } }),
  ...(search && { name: { contains: search, mode: 'insensitive' } })
};
const orderBy = sort === 'statements' ? { statementCount: 'desc' } : { name: 'asc' };
```

### 🟢 IMPORTANT: Create custom 404 page with helpful navigation
**Time:** 1 hour | **Owner:** Frontend Dev
```tsx
// Update pages/404.tsx:
<div className="error-page">
  <h1>404 - Page Not Found</h1>
  <p>The page you're looking for doesn't exist or has been moved.</p>
  <SearchBar placeholder="Search for cases, people, or statements..." />
  <div className="helpful-links">
    <Link href="/cases">Browse Cases</Link>
    <Link href="/people">Browse People</Link>
    <Link href="/">Go Home</Link>
  </div>
</div>
// Test: Navigate to /nonexistent-page, verify custom 404 appears, links work
```

### 🔵 WORTHWHILE: Add "Related Cases" section to case detail pages
**Time:** 2 hours | **Owner:** Full-stack Dev
```typescript
// Update pages/api/cases/[slug].ts:
// Find related cases by shared tags, people, or organizations:
const relatedCases = await prisma.case.findMany({
  where: {
    OR: [
      { tags: { hasSome: currentCase.tags } },
      { statements: { some: { personId: { in: currentCase.people.map(p => p.id) } } } }
    ],
    NOT: { id: currentCase.id }
  },
  take: 4
});
// Display in sidebar on case detail page
```

---

## 4️⃣ FRONTEND PAGES - ADMIN

### 🔴 CRITICAL: Test all CRUD operations in admin panel
**Time:** 2 hours | **Owner:** QA
```
For each entity (Cases, People, Organizations, Statements, Sources):
□ Create new item → saves to database, redirects to list view
□ Edit existing item → changes save, updated timestamp changes
□ Delete item → confirmation dialog appears, item removed from list
□ Bulk delete (if implemented) → multiple items deleted at once
□ Form validation works (required fields, email format, URL format, etc.)
□ Error handling: Submit invalid data → friendly error message, no crash
□ Loading states: Click save → button shows spinner, disables during save
```

### 🟠 URGENT: Add real-time search to admin tables
**Time:** 2 hours | **Owner:** Frontend Dev
```typescript
// Add to pages/admin/statements.tsx, cases.tsx, people.tsx:
const [searchQuery, setSearchQuery] = useState('');
const [debouncedQuery] = useDebounce(searchQuery, 300);

useEffect(() => {
  fetch(`/api/admin/statements?search=${debouncedQuery}`)
    .then(res => res.json())
    .then(data => setStatements(data));
}, [debouncedQuery]);

// UI: <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
// Test: Type in search box → results update as you type (after 300ms debounce)
```

### 🟡 SERIOUS: Implement bulk actions (delete, export, update status)
**Time:** 3 hours | **Owner:** Full-stack Dev
```typescript
// 1. Add checkboxes to admin tables
// 2. Track selected items: const [selected, setSelected] = useState<string[]>([]);
// 3. Add bulk action bar: {selected.length > 0 && <BulkActionBar count={selected.length} />}
// 4. Implement actions:
//    - Bulk delete: DELETE /api/admin/bulk/delete with body: { ids: selected }
//    - Bulk export: GET /api/admin/bulk/export?ids=id1,id2,id3 → downloads CSV
//    - Bulk status: PATCH /api/admin/bulk/update with body: { ids: selected, isVerified: true }
// Test: Select 5 items → click Delete → confirm → 5 items deleted
```

### 🟢 IMPORTANT: Add activity/audit log to admin dashboard
**Time:** 2 hours | **Owner:** Full-stack Dev
```typescript
// Update admin dashboard to show recent actions:
const recentActions = await prisma.auditLog.findMany({
  take: 10,
  orderBy: { createdAt: 'desc' },
  include: { user: true }
});

// Display: "John Doe created Case: Climate Summit" (5 minutes ago)
// Show: user avatar, action type, entity name, timestamp
// Link to entity: Click log entry → navigate to entity detail page
```

### 🔵 WORTHWHILE: Add drag-and-drop image upload for cases/people
**Time:** 3 hours | **Owner:** Full-stack Dev
```typescript
// Install: npm install react-dropzone
// Create component: <ImageUpload onUpload={(url) => setFormData({...formData, imageUrl: url})} />
// Backend: pages/api/admin/media/upload.ts (already exists)
// Support: JPG, PNG, WebP, max 5MB
// Show preview after upload
// Test: Drag image onto dropzone → uploads → preview appears → saves with form
```

---

## 5️⃣ LEGAL & COMPLIANCE

### 🔴 CRITICAL: Update Privacy Policy with actual company details
**Time:** 2 hours | **Owner:** Legal/Content
```
Update pages/privacy.tsx with:
□ Replace [YOUR COMPANY] with actual company name
□ Replace [YOUR EMAIL] with actual contact email
□ Add data controller information (your name/company, address)
□ Specify data retention periods (e.g., "User data kept for 7 years")
□ List all cookies used (Google Analytics, AdSense, etc.)
□ Add GDPR rights section (access, deletion, portability)
□ Add CCPA compliance section (Do Not Sell My Info)
□ Include last updated date at top
□ Have legal professional review (IMPORTANT!)
```

### 🟠 URGENT: Update Terms of Service with liability disclaimers
**Time:** 2 hours | **Owner:** Legal/Content
```
Update pages/terms.tsx with:
□ Replace [YOUR COMPANY] with actual company name
□ Add disclaimer: "Information provided for research purposes only, not legal advice"
□ Add disclaimer: "We do not guarantee accuracy of user-submitted content"
□ Add DMCA takedown policy (how to report copyright violations)
□ Add dispute resolution clause (arbitration, governing law)
□ Add user conduct rules (no harassment, no illegal content, etc.)
□ Add termination policy (we can suspend accounts for violations)
□ Include last updated date at top
```

### 🟡 SERIOUS: Implement "Delete My Account" feature (GDPR Right to Erasure)
**Time:** 3 hours | **Owner:** Full-stack Dev
```typescript
// Create pages/api/auth/delete-account.ts:
export default async function handler(req, res) {
  // 1. Verify user is authenticated
  // 2. Anonymize user data (replace email with "deleted-user-12345@example.com")
  // 3. Delete sessions, API keys
  // 4. Keep audit logs but anonymize user info
  // 5. Send confirmation email: "Your account has been deleted"
  // 6. Log deletion in audit trail
}

// Add to settings page:
// <button className="danger">Delete My Account</button> with confirmation dialog
```

### 🟢 IMPORTANT: Create Cookie Policy page with detailed cookie list
**Time:** 1.5 hours | **Owner:** Content
```
Update pages/cookies.tsx with table:
| Cookie Name | Purpose | Duration | Third Party |
|-------------|---------|----------|-------------|
| session_token | User authentication | 7 days | No |
| _ga | Google Analytics tracking | 2 years | Yes (Google) |
| consent | Cookie consent preference | 1 year | No |
| __Secure-PPID | Google AdSense ads | 2 years | Yes (Google) |

Include:
- How to disable cookies in browser settings
- Impact of disabling cookies (site may not work properly)
- Links to third-party privacy policies (Google, etc.)
```

### 🔵 WORTHWHILE: Add data export feature (GDPR Right to Portability)
**Time:** 2 hours | **Owner:** Backend Dev
```typescript
// Create pages/api/auth/export-data.ts:
export default async function handler(req, res) {
  const user = await getAuthenticatedUser(req);
  const userData = {
    profile: await prisma.user.findUnique({ where: { id: user.id } }),
    createdContent: await prisma.statement.findMany({ where: { createdBy: user.id } }),
    editHistory: await prisma.auditLog.findMany({ where: { userId: user.id } })
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="my-data.json"');
  return res.json(userData);
}
// Add button to settings page: "Download My Data"
```

---

## 6️⃣ SEO & META TAGS

### 🔴 CRITICAL: Add meta tags to all public pages (title, description, OG tags)
**Time:** 2 hours | **Owner:** Frontend Dev
```tsx
// Update pages/cases/[slug].tsx (and all other pages):
import Head from 'next/head';

<Head>
  <title>{case.title} - The Words Record</title>
  <meta name="description" content={case.summary || case.description.slice(0, 155)} />
  <meta property="og:title" content={case.title} />
  <meta property="og:description" content={case.summary} />
  <meta property="og:image" content={case.imageUrl || '/images/default-case.jpg'} />
  <meta property="og:type" content="article" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="canonical" href={`https://thewordsrecord.com/cases/${case.slug}`} />
</Head>

// Test: Share link on Twitter/Facebook → preview shows correct title, description, image
```

### 🟠 URGENT: Generate and submit XML sitemaps to Google Search Console
**Time:** 1.5 hours | **Owner:** DevOps
```bash
# 1. Verify sitemaps work (already implemented):
curl https://thewordsrecord.com/api/sitemap.xml | head -20
curl https://thewordsrecord.com/api/sitemap-cases.xml | head -20

# 2. Add sitemaps to robots.txt:
echo "Sitemap: https://thewordsrecord.com/api/sitemap.xml" >> public/robots.txt

# 3. Submit to Google Search Console:
- Go to https://search.google.com/search-console
- Add property: thewordsrecord.com
- Verify ownership (DNS TXT record or HTML file upload)
- Submit sitemap: Sitemaps → Add new sitemap → /api/sitemap.xml

# 4. Submit to Bing Webmaster Tools:
- Go to https://www.bing.com/webmasters
- Add site → Verify ownership → Submit sitemap
```

### 🟡 SERIOUS: Add structured data (Schema.org JSON-LD) to pages
**Time:** 3 hours | **Owner:** Frontend Dev
```tsx
// Add to pages/cases/[slug].tsx:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": case.title,
      "description": case.summary,
      "author": {
        "@type": "Organization",
        "name": "The Words Record"
      },
      "datePublished": case.createdAt,
      "dateModified": case.updatedAt,
      "image": case.imageUrl
    })
  }}
/>

// Similarly add Person schema to /people/[slug], Organization schema to /organizations/[slug]
// Test: Use Google Rich Results Test tool → paste URL → verify schema is valid
```

### 🟢 IMPORTANT: Optimize all images for web (WebP, lazy loading)
**Time:** 2 hours | **Owner:** Frontend Dev
```tsx
// Replace all <img> tags with Next.js Image component:
import Image from 'next/image';

<Image
  src={case.imageUrl}
  alt={case.title}
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
  blurDataURL="/images/placeholder.jpg"
/>

// Run script to convert existing images to WebP:
npm install sharp
node scripts/convert-images-to-webp.js

// Test: Check Network tab → images load as WebP, lazy load below fold
```

### 🔵 WORTHWHILE: Set up Google Search Console performance monitoring
**Time:** 1 hour | **Owner:** Marketing
```
After submitting sitemap:
1. Wait 48-72 hours for Google to crawl site
2. Check Coverage report → verify no errors
3. Set up email alerts for indexing errors
4. Monitor Performance report → track impressions, clicks, CTR
5. Identify top performing pages and optimize similar content
6. Fix any mobile usability issues flagged
```

---

## 7️⃣ ANALYTICS & TRACKING

### 🔴 CRITICAL: Connect Google Analytics 4 to GTM container
**Time:** 1 hour | **Owner:** Marketing/Dev
```bash
# 1. Create GA4 property:
- Go to https://analytics.google.com
- Create new GA4 property: "The Words Record"
- Copy Measurement ID (format: G-XXXXXXXXXX)

# 2. Add to GTM container (GTM-KTHWNW45):
- Go to https://tagmanager.google.com
- Tags → New → Google Analytics: GA4 Configuration
- Measurement ID: G-XXXXXXXXXX
- Trigger: All Pages
- Save and Publish

# 3. Test:
- Open site in incognito mode
- Open Google Analytics Real-Time report
- Navigate through pages → verify Real-Time users increases
```

### 🟠 URGENT: Set up conversion tracking (contact form, donations)
**Time:** 2 hours | **Owner:** Marketing/Dev
```javascript
// Add to GTM:
// 1. Create trigger: "Contact Form Submitted" (DOM Element visible: .success-message)
// 2. Create tag: GA4 Event
//    - Event Name: contact_form_submission
//    - Event Parameters: { form_type: 'contact', page_location: {{Page URL}} }
// 3. Create trigger: "Donation Completed" (Custom Event: donation_complete)
// 4. Create tag: GA4 Event
//    - Event Name: donation
//    - Event Parameters: { value: {{Donation Amount}}, currency: 'USD' }

// In code, fire events:
window.dataLayer.push({ event: 'donation_complete', donation_amount: 50 });
```

### 🟡 SERIOUS: Set up custom events for key user actions
**Time:** 2 hours | **Owner:** Dev
```typescript
// Use GTM helper from utils/gtm.ts:
import { pushToDataLayer } from '@/utils/gtm';

// Track statement views:
pushToDataLayer('view_statement', {
  statement_id: statement.id,
  case_slug: statement.case.slug
});

// Track searches:
pushToDataLayer('search', {
  search_term: query,
  results_count: results.length
});

// Track filters:
pushToDataLayer('filter_applied', {
  filter_type: 'organization_type',
  filter_value: 'corporate'
});

// Test in GTM Preview Mode: perform actions → verify events appear in debugger
```

### 🟢 IMPORTANT: Enable enhanced measurement in GA4
**Time:** 0.5 hours | **Owner:** Marketing
```
In Google Analytics 4:
1. Admin → Data Streams → Web Stream
2. Click "Enhanced measurement" toggle (ON)
3. Enable all options:
   ☑ Page views
   ☑ Scrolls (90% depth)
   ☑ Outbound clicks
   ☑ Site search (set query parameter: q)
   ☑ Video engagement
   ☑ File downloads (PDF, CSV)
4. Save changes
5. Test: Scroll to bottom of page → check GA4 Real-Time → verify scroll event fires
```

### 🔵 WORTHWHILE: Set up custom dashboard in GA4
**Time:** 1 hour | **Owner:** Marketing
```
Create custom dashboard with cards:
1. Real-time users
2. Top 10 pages by views (last 7 days)
3. Conversions by event name
4. User demographics (country, device)
5. Engagement rate by page
6. Average session duration
7. Bounce rate by landing page

Share dashboard with stakeholders via email
```

---

## 8️⃣ GOOGLE ADSENSE & MONETIZATION

### 🔴 CRITICAL: Verify AdSense code loads without errors
**Time:** 1 hour | **Owner:** Dev
```bash
# Check pages/_document.tsx line 66-70:
# Verify AdSense script is present:
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5418171625369886"
  crossOrigin="anonymous"
/>

# Test in browser:
1. Open homepage in incognito mode
2. Open DevTools → Network tab → Filter: "adsbygoogle"
3. Verify script loads (status 200)
4. Console: verify no "AdSense error" messages
5. Check Elements tab: verify ad slots are inserted (may be empty during testing)
```

### 🟠 URGENT: Place ad units in strategic locations
**Time:** 2 hours | **Owner:** Frontend Dev
```tsx
// Create components/AdUnit.tsx:
export default function AdUnit({ slot, format = 'auto' }) {
  useEffect(() => {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  return (
    <ins className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-5418171625369886"
      data-ad-slot={slot}
      data-ad-format={format}
    />
  );
}

// Place ads:
// 1. Homepage: Below hero section, between case cards
// 2. Case pages: Sidebar (300x250), after first paragraph (in-article)
// 3. List pages: Between every 5 results
// 4. Mobile: Sticky bottom banner (320x50)

// Test: Wait 24-48 hours for ads to appear (they won't show immediately)
```

### 🟡 SERIOUS: Verify ads.txt file is accessible
**Time:** 0.5 hours | **Owner:** DevOps
```bash
# Test ads.txt is publicly accessible:
curl https://thewordsrecord.com/ads.txt

# Should return:
google.com, pub-5418171625369886, DIRECT, f08c47fec0942fa0

# If not accessible:
1. Ensure public/ads.txt exists (it does)
2. Verify Vercel serves files from /public at root
3. Test in browser: https://thewordsrecord.com/ads.txt
4. Submit to AdSense: Sites → Add ads.txt file → Check

# Wait 24-48 hours for Google to crawl and verify
```

### 🟢 IMPORTANT: Configure ad blocking detection (optional)
**Time:** 2 hours | **Owner:** Dev
```typescript
// Create utils/detectAdBlock.ts:
export async function detectAdBlock() {
  try {
    await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
      method: 'HEAD',
      mode: 'no-cors'
    });
    return false; // Ads not blocked
  } catch {
    return true; // Ads blocked
  }
}

// Use in pages:
const [adBlockDetected, setAdBlockDetected] = useState(false);
useEffect(() => {
  detectAdBlock().then(setAdBlockDetected);
}, []);

// Show message: {adBlockDetected && <AdBlockMessage />}
// Message: "Please consider disabling your ad blocker to support our journalism"
```

### 🔵 WORTHWHILE: Set up donation page with payment processor
**Time:** 4 hours | **Owner:** Full-stack Dev
```bash
# Install Stripe (or PayPal):
npm install @stripe/stripe-js stripe

# Create pages/api/donate/create-checkout.ts:
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price_data: { currency: 'usd', product_data: { name: 'Donation' }, unit_amount: req.body.amount * 100 } }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/donate/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/donate`,
  });
  res.json({ sessionId: session.id });
}

# Update pages/donate.tsx with Stripe Checkout button
```

---

## 9️⃣ PERFORMANCE & OPTIMIZATION

### 🔴 CRITICAL: Run Lighthouse audit, score > 90 on all metrics
**Time:** 2 hours | **Owner:** Frontend Dev
```bash
# Run Lighthouse in Chrome DevTools:
1. Open https://thewordsrecord.com in incognito mode
2. DevTools → Lighthouse tab → Analyze page load
3. Target scores: Performance 90+, Accessibility 90+, Best Practices 95+, SEO 95+

# Common issues and fixes:
- Low Performance: Optimize images (WebP, lazy load), remove unused JS
- Low Accessibility: Add alt text, ARIA labels, color contrast
- Low SEO: Add meta descriptions, canonical URLs

# Test on mobile:
4. DevTools → Device toolbar → iPhone 12 Pro → Run Lighthouse again
5. Fix mobile-specific issues (large images, unoptimized fonts)

# Run production test:
npm run build && npm run start
# Then run Lighthouse on localhost:3000
```

### 🟠 URGENT: Enable Next.js Image Optimization for all images
**Time:** 2 hours | **Owner:** Frontend Dev
```tsx
// Replace ALL <img> tags with Next.js Image:
❌ <img src={person.avatar} alt={person.name} />
✅ <Image src={person.avatar} alt={person.name} width={200} height={200} />

// For external images (e.g., from URLs), add to next.config.js:
module.exports = {
  images: {
    domains: ['example.com', 'cdn.example.com'],
    formats: ['image/webp', 'image/avif']
  }
}

// Test:
1. Check Network tab → images should load as WebP
2. Verify image sizes are appropriate (not loading 4K image for 200px thumbnail)
3. Check lazy loading: images below fold shouldn't load until scrolled
```

### 🟡 SERIOUS: Implement code splitting and dynamic imports
**Time:** 2 hours | **Owner:** Frontend Dev
```typescript
// Replace large imports with dynamic imports:
❌ import HeavyComponent from '@/components/HeavyComponent';
✅ const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false // If component doesn't need SSR
});

// Use for:
- Admin dashboard charts (recharts library is large)
- Rich text editors (if implemented)
- Heavy analytics components

// Test: Check Network tab → verify HeavyComponent.js loads only when component renders
// Bundle size should decrease: npm run build → check .next/build-manifest.json
```

### 🟢 IMPORTANT: Add loading skeletons to improve perceived performance
**Time:** 2 hours | **Owner:** Frontend Dev
```tsx
// Create components/Skeleton.tsx:
export function CaseSkeleton() {
  return (
    <div className="case-card skeleton">
      <div className="skeleton-image" />
      <div className="skeleton-title" />
      <div className="skeleton-text" />
    </div>
  );
}

// Use while loading:
{loading ? (
  <div className="grid">
    {[...Array(6)].map((_, i) => <CaseSkeleton key={i} />)}
  </div>
) : (
  cases.map(case => <CaseCard case={case} />)
)}

// CSS: Add shimmer animation for skeleton elements
```

### 🔵 WORTHWHILE: Set up Redis caching for API responses
**Time:** 4 hours | **Owner:** Backend Dev
```bash
# Install Redis (Vercel KV or Upstash):
npm install @vercel/kv

# Create lib/cache.ts:
import { kv } from '@vercel/kv';

export async function getCached<T>(key: string, fetcher: () => Promise<T>, ttl = 300): Promise<T> {
  const cached = await kv.get<T>(key);
  if (cached) return cached;

  const fresh = await fetcher();
  await kv.set(key, fresh, { ex: ttl });
  return fresh;
}

# Use in API routes:
const cases = await getCached('cases:page:1', async () => {
  return await prisma.case.findMany({ take: 20 });
}, 300); // Cache for 5 minutes

# Test: Make API call twice → 2nd call should be < 50ms (from cache)
```

---

## 🔟 TESTING & QA

### 🔴 CRITICAL: Perform full smoke test on production environment
**Time:** 2 hours | **Owner:** QA
```
Test on https://thewordsrecord.com (after deployment):

CRITICAL FLOWS:
□ Homepage loads without errors
□ Navigate to /cases → cases display
□ Click a case → case detail page loads with statements
□ Click a person → person profile loads
□ Search for "climate" → results appear
□ Admin login with correct credentials → redirects to dashboard
□ Create a new statement in admin panel → saves successfully
□ Logout → redirects to homepage, cannot access /admin

CROSS-BROWSER:
□ Test on Chrome (desktop + mobile)
□ Test on Safari (desktop + iOS)
□ Test on Firefox

ERROR HANDLING:
□ Navigate to /nonexistent-page → 404 page appears
□ Submit empty form → validation errors appear
□ Disconnect internet → appropriate error message
```

### 🟠 URGENT: Test all forms for validation and error handling
**Time:** 2 hours | **Owner:** QA
```
For each form (contact, search, admin create/edit forms):

VALIDATION TESTS:
□ Submit empty required field → error message appears
□ Submit invalid email → "Invalid email format" error
□ Submit invalid URL → "Invalid URL format" error
□ Submit text in number field → "Must be a number" error
□ Upload oversized file → "File too large" error
□ Upload wrong file type → "Invalid file type" error

ERROR HANDLING:
□ Disconnect internet mid-submission → "Network error" message
□ Simulate server error (modify API to return 500) → "Server error, please try again"
□ Submit duplicate data → "Already exists" error

UX:
□ Error messages appear inline next to field
□ Form doesn't reset on error (user doesn't lose data)
□ Success message appears after successful submission
□ Form disables during submission (prevents double-submit)
```

### 🟡 SERIOUS: Perform accessibility audit with screen reader
**Time:** 2 hours | **Owner:** QA
```
Install NVDA (Windows) or VoiceOver (Mac):

KEYBOARD NAVIGATION:
□ Tab through entire homepage → focus moves logically through all interactive elements
□ Press Enter on links → navigates to correct page
□ Press Space on buttons → activates button
□ Tab into search box → can type and submit with Enter
□ No keyboard traps (can always Tab away from element)

SCREEN READER:
□ Homepage: Screen reader announces page title, main heading
□ Navigate to case card → announces case title, summary
□ Form fields → announces label + field type ("Search, text field")
□ Buttons → announces purpose ("Submit form, button")
□ Images → announces alt text
□ Error messages → announces immediately when they appear

FIX COMMON ISSUES:
- Missing alt text → add descriptive alt to all images
- Missing labels → add <label htmlFor="fieldId"> to inputs
- Poor heading structure → ensure H1 → H2 → H3 hierarchy
```

### 🟢 IMPORTANT: Load test critical pages (100+ concurrent users)
**Time:** 2 hours | **Owner:** DevOps
```bash
# Install k6 load testing tool:
brew install k6  # or download from k6.io

# Create load-test.js:
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,        // 100 virtual users
  duration: '2m',  // for 2 minutes
};

export default function () {
  const res = http.get('https://thewordsrecord.com/cases');
  check(res, { 'status is 200': (r) => r.status === 200 });
  check(res, { 'response time < 2s': (r) => r.timings.duration < 2000 });
  sleep(1);
}

# Run test:
k6 run load-test.js

# Expected results:
- ✓ 95%+ requests succeed (status 200)
- ✓ 95%+ responses under 2 seconds
- ✓ No 5xx server errors
- If fails: Add caching, optimize database queries, enable CDN
```

### 🔵 WORTHWHILE: Set up automated end-to-end tests with Playwright
**Time:** 4 hours | **Owner:** QA/Dev
```bash
# Install Playwright:
npm install -D @playwright/test

# Create tests/e2e/critical-flows.spec.ts:
import { test, expect } from '@playwright/test';

test('user can search and view case', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[name="search"]', 'climate');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/search\?q=climate/);
  await page.click('.case-card:first-child');
  await expect(page).toHaveURL(/\/cases\/[\w-]+/);
  await expect(page.locator('h1')).toBeVisible();
});

# Run tests:
npx playwright test

# Set up in GitHub Actions to run on every PR
```

---

## 1️⃣1️⃣ HOSTING & DEPLOYMENT

### 🔴 CRITICAL: Configure production environment variables in Vercel
**Time:** 1 hour | **Owner:** DevOps
```bash
# Go to Vercel Dashboard → Project → Settings → Environment Variables

# Add these (copy from .env):
DATABASE_URL=postgresql://postgres.PROJECT:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres.PROJECT:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres
JWT_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://thewordsrecord.com
NEXT_PUBLIC_SITE_URL=https://thewordsrecord.com
ANTHROPIC_API_KEY=sk-ant-api03-...
SENDGRID_API_KEY=SG...
STRIPE_SECRET_KEY=sk_live_...

# Environment: Production
# ⚠️ NEVER commit these to git!

# Test: Trigger deployment → check build logs → verify env vars are loaded
```

### 🟠 URGENT: Set up custom domain and SSL certificate
**Time:** 1.5 hours | **Owner:** DevOps
```bash
# 1. Purchase domain (if not done):
- Go to Namecheap, GoDaddy, or Cloudflare
- Buy thewordsrecord.com (or similar)

# 2. Add domain to Vercel:
- Vercel Dashboard → Project → Settings → Domains
- Click "Add" → Enter thewordsrecord.com
- Vercel will provide DNS records:

A     @       76.76.21.21
CNAME www     cname.vercel-dns.com

# 3. Add DNS records in domain registrar:
- Go to domain registrar DNS settings
- Add A record: @ → 76.76.21.21
- Add CNAME: www → cname.vercel-dns.com

# 4. Wait for propagation (10 min - 24 hours)
- Test: dig thewordsrecord.com → should show 76.76.21.21

# 5. Verify SSL:
- Vercel auto-provisions SSL (Let's Encrypt)
- Visit https://thewordsrecord.com → should show 🔒 in browser
```

### 🟡 SERIOUS: Set up staging environment for testing
**Time:** 2 hours | **Owner:** DevOps
```bash
# Create staging branch:
git checkout -b staging
git push origin staging

# In Vercel Dashboard → Project → Settings:
1. Add "staging" branch to deployment branches
2. Create new environment: "Staging"
3. Add staging env vars (use staging database):
   DATABASE_URL=<staging-database-url>
   NEXT_PUBLIC_SITE_URL=https://thewordsrecord-staging.vercel.app

# Workflow:
- Merge features to staging branch → deploys to https://thewordsrecord-staging.vercel.app
- Test on staging
- If pass → merge staging to main → deploys to production

# Test: Push to staging branch → verify auto-deployment
```

### 🟢 IMPORTANT: Enable Vercel Analytics and Speed Insights
**Time:** 0.5 hours | **Owner:** DevOps
```bash
# Already installed (@vercel/analytics, @vercel/speed-insights)

# Verify in pages/_app.tsx:
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </>
  );
}

# Enable in Vercel Dashboard:
- Go to Project → Analytics → Enable
- Go to Project → Speed Insights → Enable

# Test: Deploy → wait 24 hours → check dashboard for metrics
```

### 🔵 WORTHWHILE: Set up preview deployments with Vercel
**Time:** 1 hour | **Owner:** DevOps
```bash
# Already enabled by default in Vercel

# How it works:
1. Create feature branch: git checkout -b feature/new-search
2. Push to GitHub: git push origin feature/new-search
3. Vercel auto-deploys to: thewordsrecord-git-feature-new-search.vercel.app
4. Preview URL posted in GitHub PR
5. Test preview → if good → merge PR → deploys to production

# Configure:
- Vercel Dashboard → Settings → Git → Preview Deployments: ON
- Add preview env vars (use staging database, not production)

# Test: Create PR → verify preview deployment URL appears in PR comments
```

---

## 1️⃣2️⃣ EMAIL & NOTIFICATIONS

### 🔴 CRITICAL: Set up transactional email service (SendGrid/Resend)
**Time:** 2 hours | **Owner:** Backend Dev
```bash
# Option A: SendGrid (free tier: 100 emails/day)
1. Sign up at https://sendgrid.com
2. Create API key (Settings → API Keys → Create)
3. Add to Vercel env vars: SENDGRID_API_KEY=SG.xxx

# Option B: Resend (free tier: 100 emails/day)
npm install resend
1. Sign up at https://resend.com
2. Add to env: RESEND_API_KEY=re_xxx

# Create lib/email.ts:
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
  await resend.emails.send({
    from: 'noreply@thewordsrecord.com',
    to,
    subject,
    html
  });
}

# Verify domain:
- Add DNS records (SPF, DKIM) provided by email service
- Send test email to yourself
```

### 🟠 URGENT: Implement password reset email flow
**Time:** 3 hours | **Owner:** Full-stack Dev
```typescript
// Create pages/api/auth/forgot-password.ts:
export default async function handler(req, res) {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const resetToken = generateSecureToken(); // crypto.randomBytes(32).toString('hex')
  await prisma.userToken.create({
    data: { userId: user.id, token: resetToken, type: 'PASSWORD_RESET', expiresAt: addHours(new Date(), 1) }
  });

  await sendEmail({
    to: email,
    subject: 'Reset your password - The Words Record',
    html: `Click here to reset: <a href="https://thewordsrecord.com/auth/reset-password?token=${resetToken}">Reset Password</a>`
  });

  return res.json({ success: true });
}

// Create pages/auth/reset-password.tsx (form to enter new password)
// Test: Request reset → receive email → click link → set new password → login works
```

### 🟡 SERIOUS: Set up contact form email delivery
**Time:** 1.5 hours | **Owner:** Full-stack Dev
```typescript
// Update pages/api/contact.ts:
export default async function handler(req, res) {
  const { name, email, message } = req.body;

  // Send email to admin:
  await sendEmail({
    to: 'admin@thewordsrecord.com',
    subject: `Contact Form: ${name}`,
    html: `
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `
  });

  // Send confirmation to user:
  await sendEmail({
    to: email,
    subject: 'We received your message - The Words Record',
    html: `<p>Hi ${name},</p><p>Thanks for contacting us. We'll get back to you within 24-48 hours.</p>`
  });

  return res.json({ success: true });
}

// Test: Submit contact form → admin receives email, user receives confirmation
```

### 🟢 IMPORTANT: Create email templates with branding
**Time:** 2 hours | **Owner:** Designer/Dev
```tsx
// Create templates/emails/base.tsx:
export function EmailTemplate({ children, heading }) {
  return (
    <html>
      <head><style>{/* email-safe CSS */}</style></head>
      <body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', padding: '20px' }}>
          <img src="https://thewordsrecord.com/images/logo.png" alt="Logo" style={{ width: '150px' }} />
          <h1 style={{ color: '#2c3e50' }}>{heading}</h1>
          {children}
          <hr style={{ border: '1px solid #eee' }} />
          <p style={{ fontSize: '12px', color: '#999' }}>© 2025 The Words Record. All rights reserved.</p>
        </div>
      </body>
    </html>
  );
}

// Use: <EmailTemplate heading="Password Reset">...</EmailTemplate>
```

### 🔵 WORTHWHILE: Set up error alerting via email
**Time:** 1 hour | **Owner:** DevOps
```typescript
// Create lib/errorAlert.ts:
export async function alertCriticalError(error: Error, context: any) {
  if (process.env.NODE_ENV !== 'production') return;

  await sendEmail({
    to: 'admin@thewordsrecord.com',
    subject: `🚨 Critical Error on ${context.page}`,
    html: `
      <h3>Error Details:</h3>
      <p><strong>Message:</strong> ${error.message}</p>
      <p><strong>Stack:</strong> <pre>${error.stack}</pre></p>
      <p><strong>Context:</strong> ${JSON.stringify(context, null, 2)}</p>
    `
  });
}

// Use in API error handlers:
catch (error) {
  await alertCriticalError(error, { endpoint: '/api/cases', userId: req.user.id });
  return res.status(500).json({ error: 'Internal server error' });
}
```

---

## 1️⃣3️⃣ MONITORING & OBSERVABILITY

### 🔴 CRITICAL: Set up error tracking (Sentry or similar)
**Time:** 2 hours | **Owner:** DevOps
```bash
# Install Sentry:
npm install @sentry/nextjs

# Run setup wizard:
npx @sentry/wizard -i nextjs

# This creates sentry.client.config.js, sentry.server.config.js, sentry.edge.config.js

# Add to Vercel env vars:
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=<from Sentry account settings>

# Configure in sentry.server.config.js:
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,  // 10% of transactions
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Filter out sensitive data
    delete event.request?.cookies;
    return event;
  }
});

# Test: Throw error in API route → verify appears in Sentry dashboard
```

### 🟠 URGENT: Set up uptime monitoring (UptimeRobot or Vercel)
**Time:** 1 hour | **Owner:** DevOps
```bash
# Option A: UptimeRobot (free plan: 50 monitors, 5-min checks)
1. Sign up at https://uptimerobot.com
2. Add Monitor → HTTP(s) → https://thewordsrecord.com
3. Check interval: 5 minutes
4. Alert contacts: Add email + SMS (optional)
5. Add more monitors:
   - https://thewordsrecord.com/api/health (if you create health check endpoint)
   - https://thewordsrecord.com/cases
   - https://thewordsrecord.com/admin/login

# Option B: Vercel (built-in, no setup needed)
- Vercel auto-monitors deployments
- Dashboard → Project → Deployments → shows uptime
- Limited compared to dedicated uptime monitoring

# Test: Stop Vercel project → wait 5 min → verify alert email received
```

### 🟡 SERIOUS: Create health check endpoint
**Time:** 1 hour | **Owner:** Backend Dev
```typescript
// Create pages/api/health.ts:
export default async function handler(req, res) {
  try {
    // Check database connection:
    await prisma.$queryRaw`SELECT 1`;

    // Check critical tables have data:
    const casesCount = await prisma.case.count();
    const statementsCount = await prisma.statement.count();

    if (casesCount === 0 || statementsCount === 0) {
      throw new Error('Database appears empty');
    }

    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      casesCount,
      statementsCount
    });
  } catch (error) {
    return res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Test: curl https://thewordsrecord.com/api/health → returns 200 + JSON
// Add to UptimeRobot monitors
```

### 🟢 IMPORTANT: Set up log aggregation and search
**Time:** 2 hours | **Owner:** DevOps
```bash
# Option A: Use Vercel Logs (built-in, basic)
- Vercel Dashboard → Project → Logs
- Shows real-time logs from all deployments
- Limited search, no long-term retention

# Option B: Set up Logtail (free tier: 1GB/month)
npm install @logtail/node @logtail/next

# Add to lib/logger.ts:
import { Logtail } from '@logtail/node';
export const logger = new Logtail(process.env.LOGTAIL_TOKEN);

// Use in code:
logger.info('User logged in', { userId: user.id });
logger.error('Payment failed', { error, orderId });

# Benefits:
- Searchable logs
- Retention (30 days on free tier)
- Alerts on error patterns
- Better than console.log in production
```

### 🔵 WORTHWHILE: Set up performance monitoring (New Relic/Datadog)
**Time:** 4 hours | **Owner:** DevOps
```bash
# Install New Relic (free tier available):
npm install newrelic

# Create newrelic.js in project root:
exports.config = {
  app_name: ['The Words Record'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: { level: 'info' }
};

# Add to next.config.js:
module.exports = {
  experimental: {
    instrumentationHook: true
  }
};

# Create instrumentation.ts:
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('newrelic');
  }
}

# Benefits:
- Track slow API endpoints
- Database query performance
- Real user monitoring (RUM)
- Apdex score (user satisfaction)
```

---

## 1️⃣4️⃣ CONTENT QUALITY & SEEDING

### 🔴 CRITICAL: Seed database with minimum viable content
**Time:** 4 hours | **Owner:** Content Team
```bash
# Minimum for launch:
□ 10 high-quality cases (verified, with sources)
□ 30 people profiles (complete data: name, bio, avatar)
□ 50 statements (attributed, dated, sourced)
□ 20 organizations (with type, description)
□ 50 verified sources (news articles, videos, transcripts)

# Quality checklist per case:
□ Descriptive title (not clickbait)
□ 2-3 paragraph summary
□ Timeline of key events
□ At least 5 related statements
□ Featured image (1200x630px, optimized)
□ All statements have sources
□ Proper categorization/tags

# Use admin panel to create content:
1. Log in to /admin
2. Navigate to Cases → New Case
3. Fill in all fields
4. Add statements to case
5. Verify on public site

# Script to seed (if needed):
npm run db:seed
```

### 🟠 URGENT: Verify all sources are properly cited
**Time:** 2 hours | **Owner:** Content Team
```bash
# Audit checklist:
□ Every statement has a primarySourceId
□ Every source has a working URL (no 404s)
□ Source publication date is filled in
□ Source credibility is rated (HIGH/MEDIUM/LOW)
□ Archive URLs exist for critical sources (use archive.org)

# SQL query to find statements without sources:
SELECT id, content FROM "Statement" WHERE "primarySourceId" IS NULL;

# Fix:
1. For each statement, research original source
2. Add source to database: /admin/sources/new
3. Link source to statement: Edit statement → select source

# Verify:
SELECT COUNT(*) FROM "Statement" WHERE "primarySourceId" IS NULL;
# Should return 0
```

### 🟡 SERIOUS: Proofread all public-facing content
**Time:** 3 hours | **Owner:** Content Team
```
Review these pages for typos, grammar, tone:
□ Homepage hero text
□ About page
□ Privacy Policy (replace [YOUR COMPANY] placeholders)
□ Terms of Service (replace placeholders)
□ Cookie Policy
□ Methodology page
□ All case titles and descriptions
□ All people bios
□ Error messages (404, 500)
□ Button labels, navigation labels
□ Footer text

Tools:
- Grammarly (free version)
- Hemingway Editor (readability)
- Read aloud (catches awkward phrasing)

Tone guidelines:
- Professional, neutral, factual
- No opinion or bias
- Clear and concise
- Accessible to general audience
```

### 🟢 IMPORTANT: Add content warnings where appropriate
**Time:** 1 hour | **Owner:** Content Team
```tsx
// Update Statement model to include contentWarning field (already exists)

// Add warnings for:
□ Violence
□ Hate speech
□ Sexual content
□ Disturbing imagery
□ Strong language

// Display in UI:
{statement.contentWarning && (
  <div className="content-warning">
    ⚠️ Content Warning: {statement.contentWarning}
    <button onClick={() => setShowContent(true)}>Show Content</button>
  </div>
)}

// Test: Add warning to statement → verify appears on public site
```

### 🔵 WORTHWHILE: Create editorial guidelines document
**Time:** 2 hours | **Owner:** Content Team
```markdown
# Editorial Guidelines - The Words Record

## Verification Standards
- All statements must be verified from primary sources
- Prefer video/audio recordings over text transcriptions
- Quotes must be exact, use [sic] for errors in original
- Context is required for statements taken from longer speeches

## Writing Style
- Use Associated Press (AP) style
- Person titles on first mention (e.g., "President John Doe")
- Dates in format: January 15, 2025 (not 1/15/25)
- Attribution: "said" not "claimed" (unless disputed)

## Neutrality
- Present facts without editorializing
- Include multiple perspectives when available
- Avoid loaded language (e.g., "admitted" implies guilt)
- Let statements speak for themselves

## Source Quality
- Tier 1: Primary sources (official statements, press releases)
- Tier 2: Reputable news outlets (AP, Reuters, NYT, BBC)
- Tier 3: Other news outlets (verify independently)
- Avoid: Blogs, opinion pieces, social media (unless primary source)

Save as EDITORIAL_GUIDELINES.md
```

---

## 1️⃣5️⃣ SECURITY HARDENING

### 🔴 CRITICAL: Run security vulnerability scan on dependencies
**Time:** 1 hour | **Owner:** DevOps
```bash
# Run npm audit:
npm audit

# Fix high/critical vulnerabilities:
npm audit fix

# If unfixable vulnerabilities:
npm audit fix --force  # May break things, test thoroughly

# Check for outdated packages:
npm outdated

# Update critical packages:
npm update prisma @prisma/client next react react-dom

# Run build after updates:
npm run build

# If build fails, revert changes:
git checkout package.json package-lock.json
npm install

# Document any unfixed vulnerabilities in SECURITY.md
```

### 🟠 URGENT: Configure secure HTTP headers
**Time:** 1 hour | **Owner:** DevOps
```javascript
// Create next.config.js headers:
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()'
          }
        ]
      }
    ];
  }
};

// Test: curl -I https://thewordsrecord.com | grep -E "(X-Frame|Strict-Transport)"
// Or use https://securityheaders.com
```

### 🟡 SERIOUS: Implement rate limiting on API endpoints
**Time:** 2 hours | **Owner:** Backend Dev
```typescript
// Install: npm install express-rate-limit
// Create lib/rateLimit.ts:
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Stricter limit for auth endpoints
  message: 'Too many login attempts, please try again later.'
});

// Apply to API routes:
// pages/api/auth/login.ts:
export default async function handler(req, res) {
  await authLimiter(req, res);
  // ... rest of handler
}

// Test: Make 6 requests in 1 minute → 6th should return 429 Too Many Requests
```

### 🟢 IMPORTANT: Set up Content Security Policy (CSP)
**Time:** 2 hours | **Owner:** DevOps
```javascript
// Add to next.config.js headers:
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://fundingchoicesmessages.google.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://www.google-analytics.com https://*.supabase.co",
    "frame-src 'self' https://www.google.com https://fundingchoicesmessages.google.com",
    "media-src 'self'"
  ].join('; ')
}

// Test:
1. Deploy with CSP
2. Open DevTools Console
3. Check for CSP violation errors
4. Adjust policy to allow legitimate scripts
5. Use https://csp-evaluator.withgoogle.com to test policy strength
```

### 🔵 WORTHWHILE: Set up automated security scanning (Snyk)
**Time:** 2 hours | **Owner:** DevOps
```bash
# Sign up at https://snyk.io (free for open source)

# Install Snyk CLI:
npm install -g snyk

# Authenticate:
snyk auth

# Scan project:
snyk test

# Monitor project (weekly scans):
snyk monitor

# Integrate with GitHub:
1. Go to Snyk dashboard → Integrations → GitHub
2. Connect repository
3. Snyk will comment on PRs with vulnerability reports

# Add to GitHub Actions (.github/workflows/security.yml):
name: Security Scan
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

---

## 1️⃣6️⃣ BACKUP & DISASTER RECOVERY

### 🔴 CRITICAL: Test database restore procedure
**Time:** 2 hours | **Owner:** DevOps
```bash
# IMPORTANT: Test on staging database, NOT production!

# 1. Create manual backup in Supabase:
- Go to Supabase Dashboard → Database → Backups
- Click "Create Backup" → wait for completion

# 2. Simulate data loss:
- Connect to staging database
- Delete a test case: DELETE FROM "Case" WHERE slug = 'test-case-123';

# 3. Restore from backup:
- Supabase Dashboard → Backups → Select backup → Click "Restore"
- OR download backup SQL file → run: psql $STAGING_DATABASE_URL < backup.sql

# 4. Verify data is restored:
- Check if deleted case is back
- Run queries to verify data integrity
- Test application still works

# 5. Document procedure:
- Create DISASTER_RECOVERY.md with step-by-step instructions
- Include database credentials (encrypted)
- Define RTO (Recovery Time Objective): aim for < 1 hour
- Define RPO (Recovery Point Objective): aim for < 24 hours data loss
```

### 🟠 URGENT: Set up automated daily database backups
**Time:** 1 hour | **Owner:** DevOps
```bash
# Supabase automatic backups (already included):
- Daily backups for 7 days (free tier)
- Point-in-Time Recovery for 7 days (paid tier, $25/mo)

# Verify backup schedule:
1. Supabase Dashboard → Database → Backups
2. Confirm "Automatic daily backups" is enabled
3. Set backup time to low-traffic hours (e.g., 3 AM UTC)

# Optional: Download weekly backups for off-site storage:
# Create cron job or GitHub Action to download backups to S3:
# (This requires paid Supabase plan for backup download API)

# Verify backups are working:
- Check backup list daily for first week
- Should see new backup each day
```

### 🟡 SERIOUS: Set up off-site backup storage (S3)
**Time:** 2 hours | **Owner:** DevOps
```bash
# Install AWS CLI:
brew install awscli
aws configure  # Enter AWS credentials

# Create S3 bucket:
aws s3 mb s3://thewordsrecord-backups
aws s3api put-bucket-versioning --bucket thewordsrecord-backups --versioning-configuration Status=Enabled

# Create backup script (scripts/backup-db.sh):
#!/bin/bash
DATE=$(date +%Y-%m-%d)
BACKUP_FILE="backup-$DATE.sql"

# Dump database:
pg_dump $DATABASE_URL > $BACKUP_FILE

# Compress:
gzip $BACKUP_FILE

# Upload to S3:
aws s3 cp $BACKUP_FILE.gz s3://thewordsrecord-backups/

# Clean up local file:
rm $BACKUP_FILE.gz

echo "Backup completed: $BACKUP_FILE.gz"

# Schedule with cron (runs daily at 2 AM):
0 2 * * * /path/to/backup-db.sh

# Test: Run script manually → verify file appears in S3
```

### 🟢 IMPORTANT: Create disaster recovery runbook
**Time:** 2 hours | **Owner:** DevOps
```markdown
# Create DISASTER_RECOVERY.md:

# Disaster Recovery Runbook - The Words Record

## Scenarios

### 1. Database Corruption/Loss
**Detection:**
- Sentry alerts with database errors
- UptimeRobot reports site down
- Users report "500 Server Error"

**Recovery Steps:**
1. Identify scope of corruption (run: SELECT COUNT(*) FROM "Case")
2. Take immediate snapshot of current state (even if corrupted)
3. Restore from most recent backup (see Backup Restore Procedure)
4. Verify data integrity with checksums
5. Test critical paths (login, view case, search)
6. Communicate with users (status page update)
7. Post-mortem: Document incident, improve monitoring

**Estimated Recovery Time:** 1-2 hours

### 2. Vercel Deployment Failure
**Detection:** Build fails, site shows old version

**Recovery Steps:**
1. Check build logs in Vercel dashboard
2. If code issue: Rollback to previous deployment (Vercel → Deployments → Previous → Promote)
3. If env var issue: Verify all env vars are set
4. If database issue: Check Supabase status page
5. Test deployment in staging first

**Estimated Recovery Time:** 15-30 minutes

### 3. Security Breach
**Detection:** Suspicious activity in audit logs, Sentry alerts

**Recovery Steps:**
1. IMMEDIATELY: Rotate all secrets (JWT_SECRET, DATABASE_URL, API keys)
2. Lock all user accounts (set isActive=false for all users)
3. Audit logs: Find entry point, scope of breach
4. Restore from clean backup (before breach occurred)
5. Notify affected users within 72 hours (GDPR requirement)
6. Report to authorities if required
7. Post-mortem: Security audit, penetration testing

**Estimated Recovery Time:** 4-8 hours

## Emergency Contacts
- Lead Developer: [name] - [phone] - [email]
- DevOps: [name] - [phone] - [email]
- Supabase Support: support@supabase.com
- Vercel Support: support@vercel.com
```

### 🔵 WORTHWHILE: Set up automated backup testing
**Time:** 3 hours | **Owner:** DevOps
```bash
# Create script that automatically tests backups monthly:
# scripts/test-backup-restore.sh

#!/bin/bash
# 1. Download latest backup from S3
# 2. Create temporary test database
# 3. Restore backup to test database
# 4. Run smoke tests (count records, verify schema)
# 5. If tests pass: Send success notification
# 6. If tests fail: ALERT immediately (backup may be corrupted)
# 7. Clean up test database

# Schedule with cron (runs 1st of each month):
0 0 1 * * /path/to/test-backup-restore.sh

# This ensures you can actually restore backups when needed!
```

---

## 1️⃣7️⃣ DOCUMENTATION

### 🔴 CRITICAL: Update README.md with setup instructions
**Time:** 1.5 hours | **Owner:** Lead Dev
```markdown
# Update README.md:

# The Words Record

Public documentation platform for statements and responses.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or Supabase account)
- npm or yarn

### Installation

1. Clone repository:
\`\`\`bash
git clone https://github.com/yourusername/the-words-record.git
cd the-words-record
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env with your database credentials
\`\`\`

4. Run database migrations:
\`\`\`bash
npm run db:push
\`\`\`

5. Seed admin user:
\`\`\`bash
npm run db:seed-admin
# Default credentials: admin@example.com / password123
# ⚠️ CHANGE IMMEDIATELY IN PRODUCTION
\`\`\`

6. Start development server:
\`\`\`bash
npm run dev
\`\`\`

7. Open http://localhost:3000

## 📚 Documentation
- [Deployment Guide](DEPLOYMENT.md)
- [API Documentation](API.md)
- [Editorial Guidelines](EDITORIAL_GUIDELINES.md)
- [Security Policy](SECURITY.md)

## 🤝 Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 License
See [LICENSE](LICENSE)
```

### 🟠 URGENT: Create DEPLOYMENT.md with production checklist
**Time:** 2 hours | **Owner:** DevOps
```markdown
# Create DEPLOYMENT.md (extract key sections from PRE-LAUNCH-CHECKLIST.md):

# Deployment Guide - The Words Record

## Pre-Deployment Checklist

### Environment Setup
- [ ] Production database created in Supabase
- [ ] Domain purchased and DNS configured
- [ ] SSL certificate active (Vercel auto)
- [ ] All environment variables set in Vercel
- [ ] Staging environment tested

### Security
- [ ] All secrets rotated (JWT_SECRET, etc.)
- [ ] HTTPS enforced
- [ ] Rate limiting enabled
- [ ] Security headers configured

### Content
- [ ] Minimum 10 cases seeded
- [ ] All statements have sources
- [ ] Legal pages updated (Privacy, Terms)

### Monitoring
- [ ] Sentry error tracking active
- [ ] Uptime monitoring set up
- [ ] Google Analytics connected

## Deployment Steps

1. Final test on staging:
\`\`\`bash
git push origin staging
# Test https://thewordsrecord-staging.vercel.app
\`\`\`

2. Merge to main:
\`\`\`bash
git checkout main
git merge staging
git push origin main
\`\`\`

3. Verify production deployment:
- Vercel auto-deploys on push to main
- Monitor build logs
- Test https://thewordsrecord.com

4. Post-deployment checks:
- [ ] Homepage loads
- [ ] Admin login works
- [ ] Search works
- [ ] No console errors
- [ ] SSL certificate valid

## Rollback Procedure

If deployment fails:
\`\`\`bash
# In Vercel dashboard:
Deployments → Previous → Promote to Production
\`\`\`

Or revert commit:
\`\`\`bash
git revert HEAD
git push origin main
\`\`\`
```

### 🟡 SERIOUS: Create API documentation
**Time:** 3 hours | **Owner:** Backend Dev
```markdown
# Create API.md:

# API Documentation - The Words Record

Base URL: `https://thewordsrecord.com/api`

## Authentication

Most API endpoints are public (read-only). Admin endpoints require JWT authentication.

### Get Auth Token
\`\`\`bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your-password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "email": "...", "role": "ADMIN" }
}
\`\`\`

Use token in subsequent requests:
\`\`\`
Authorization: Bearer <token>
\`\`\`

## Public Endpoints

### Get Cases
\`\`\`bash
GET /api/cases?page=1&limit=20

Response:
{
  "cases": [...],
  "total": 100,
  "page": 1,
  "totalPages": 5
}
\`\`\`

### Get Case by Slug
\`\`\`bash
GET /api/cases/climate-summit-2024

Response:
{
  "id": "...",
  "title": "Climate Summit 2024",
  "slug": "climate-summit-2024",
  "statements": [...],
  "people": [...],
  ...
}
\`\`\`

### Search
\`\`\`bash
GET /api/search?q=climate&type=cases

Response:
{
  "results": [...],
  "total": 42,
  "query": "climate"
}
\`\`\`

## Admin Endpoints

### Create Statement
\`\`\`bash
POST /api/admin/statements
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Statement text here...",
  "personId": "...",
  "caseId": "...",
  "statementDate": "2025-01-15T10:00:00Z",
  "primarySourceId": "..."
}

Response:
{
  "id": "...",
  "content": "...",
  ...
}
\`\`\`

## Rate Limits
- Public endpoints: 100 requests per 15 minutes per IP
- Auth endpoints: 5 requests per 15 minutes per IP

## Error Responses
\`\`\`json
{
  "error": "Error message here",
  "statusCode": 400
}
\`\`\`

Common status codes:
- 400: Bad Request (validation error)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 429: Too Many Requests (rate limit exceeded)
- 500: Internal Server Error
```

### 🟢 IMPORTANT: Create CONTRIBUTING.md for future developers
**Time:** 1.5 hours | **Owner:** Lead Dev
```markdown
# Contributing to The Words Record

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Code Style

- Use TypeScript for all new code
- Follow Prettier formatting (run `npm run format`)
- Use ESLint rules (run `npm run lint`)
- Write meaningful commit messages (see GIT-COMMIT-BEST-PRACTICES.md)

## Testing

Before submitting PR:
- [ ] All tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Manual testing on localhost:3000

## Pull Request Process

1. Update README.md if adding new features
2. Add tests for new functionality
3. Ensure CI/CD passes (GitHub Actions)
4. Request review from maintainers
5. Address review comments
6. Squash commits before merge (if requested)

## Content Guidelines

See [EDITORIAL_GUIDELINES.md](EDITORIAL_GUIDELINES.md)

## Code of Conduct

- Be respectful and professional
- Focus on constructive feedback
- No harassment or discrimination
- Report issues to admin@thewordsrecord.com

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
```

### 🔵 WORTHWHILE: Create video walkthrough for users
**Time:** 4 hours | **Owner:** Product/Marketing
```
Record screen capture video (10-15 minutes):

1. Intro (1 min)
   - What is The Words Record?
   - Purpose and mission

2. Browsing Content (3 min)
   - Homepage overview
   - Browsing cases
   - Viewing statements
   - Exploring people/organizations

3. Using Search (2 min)
   - How to search
   - Using filters
   - Interpreting results

4. Understanding Sources (2 min)
   - How we verify information
   - Clicking through to sources
   - Trust indicators

5. Mobile Experience (2 min)
   - Show responsive design
   - Navigation on mobile

6. Outro (1 min)
   - How to get involved
   - Contact information

Tools:
- Loom (free for up to 5 min videos)
- OBS Studio (free, no time limit)
- ScreenFlow (Mac, paid)

Post to:
- YouTube (embed on About page)
- Social media
- Email newsletter
```

---

## 1️⃣8️⃣ SOCIAL PROOF & LAUNCH PREP

### 🔴 CRITICAL: Write launch announcement blog post
**Time:** 3 hours | **Owner:** Content/Marketing
```markdown
# Create on homepage or /blog/launch-announcement:

# Introducing The Words Record: Documentation for the Digital Age

**Published:** [Launch Date]

We're excited to announce the launch of The Words Record, a public platform dedicated to documenting statements, responses, and the accountability that follows.

## What We Do

In an era of information overload, The Words Record provides:

- **Verified Documentation:** Every statement is sourced and dated
- **Context:** Full background on cases, people, and organizations
- **Accountability:** Track what was said and what happened next
- **Transparency:** Open methodology, clear standards

## Why Now?

Public figures make statements every day. Some are kept, some are walked back, and some are forgotten entirely. We believe that preserving these records—with full context and sourcing—serves the public interest.

## What's Inside (as of launch)

- [XX] documented cases
- [XX] verified statements
- [XX] people and organizations tracked
- [XX] source citations

## Our Commitment

- **Accuracy:** We verify from primary sources
- **Neutrality:** We present facts without editorializing
- **Transparency:** Our methodology is public
- **Privacy:** We comply with GDPR, CCPA, and best practices

## Get Involved

- Browse our cases: [Link]
- Learn our methodology: [Link]
- Contact us: [Link]
- Follow us: [Social media links]

## What's Next

This is just the beginning. In the coming months, we plan to:
- Add [XX more cases]
- Launch API for researchers
- Implement advanced filtering
- Expand international coverage

Thank you for joining us on this journey.

—The Words Record Team
```

### 🟠 URGENT: Prepare social media launch posts
**Time:** 2 hours | **Owner:** Marketing
```
Create posts for launch day (schedule via Buffer/Hootsuite):

## Twitter/X (Thread):
1/ 🚀 Introducing The Words Record – a new platform for documenting public statements and accountability.

2/ Every statement is verified, sourced, and contextualized. No opinions, just facts.

3/ Launch includes [XX] cases, [XX] statements, and [XX] people tracked.

4/ Why? Because what people say matters. And the record should be accessible to everyone.

5/ Check it out: https://thewordsrecord.com

## LinkedIn (Professional):
Excited to announce the launch of The Words Record, a platform dedicated to documenting verified public statements.

In a world where information moves fast, we believe in slowing down to get the facts right. Every statement on our platform is:
✅ Verified from primary sources
✅ Fully contextualized
✅ Dated and attributed

This is for researchers, journalists, historians, and citizens who value accuracy and accountability.

Visit: https://thewordsrecord.com

[Image: Screenshot of homepage]

## Facebook:
📢 Big news! We're launching The Words Record – a free platform for tracking public statements and responses.

Whether you're a researcher, journalist, or just curious citizen, you'll find verified documentation of what was said, when, and what happened next.

Check it out: https://thewordsrecord.com

## Instagram (Visual):
[Image: Branded graphic with logo and tagline]
Caption: The record matters. Introducing The Words Record – documentation for the digital age. Link in bio.

#Accountability #Journalism #Research #Documentation
```

### 🟡 SERIOUS: Submit to startup directories
**Time:** 2 hours | **Owner:** Marketing
```
Submit to these directories on launch day:

HIGH PRIORITY:
□ Product Hunt (https://www.producthunt.com/posts/create)
  - Requires: Logo, screenshots, tagline, description
  - Best practice: Launch on Tuesday-Thursday
  - Engage with comments throughout the day

□ Hacker News Show HN (https://news.ycombinator.com/submit)
  - Title: "Show HN: The Words Record – Documentation of Public Statements"
  - URL: https://thewordsrecord.com
  - Best practice: Launch in morning (8-10 AM PST)

MEDIUM PRIORITY:
□ BetaList (https://betalist.com/submit)
□ Indie Hackers (https://www.indiehackers.com/products/new)
□ AlternativeTo (https://alternativeto.net/software/add/)

OPTIONAL:
□ Reddit (r/SideProject, r/InternetIsBeautiful)
  - Be prepared to engage with comments
  - Don't be overly promotional

Prepare materials:
- Logo (512x512px PNG)
- Screenshots (1280x720px)
- Tagline: "Verified documentation of public statements"
- Description: 300-word summary of platform
```

### 🟢 IMPORTANT: Set up Google Search Console and submit sitemap
**Time:** 1.5 hours | **Owner:** SEO/DevOps
```bash
# Already covered in SEO section, but critical for launch:

1. Verify ownership in Google Search Console:
   - Method A: HTML file upload (google-verification.html in /public)
   - Method B: DNS TXT record (recommended)

2. Submit all sitemaps:
   - https://thewordsrecord.com/api/sitemap.xml
   - https://thewordsrecord.com/api/sitemap-cases.xml
   - https://thewordsrecord.com/api/sitemap-people.xml
   - https://thewordsrecord.com/api/sitemap-organizations.xml

3. Request immediate indexing for key pages:
   - Homepage
   - Top 5 cases
   - About page

4. Monitor Coverage report daily for first week:
   - Check for indexing errors
   - Fix any "Excluded" pages

5. Submit to Bing Webmaster Tools (often forgotten):
   - https://www.bing.com/webmasters
   - Same process as Google
```

### 🔵 WORTHWHILE: Reach out to relevant journalists/bloggers
**Time:** 4 hours | **Owner:** PR/Marketing
```
Create outreach list (20-30 contacts):

TARGET PROFILES:
- Tech journalists (TechCrunch, The Verge, Ars Technica)
- Media critics and press freedom advocates
- Fact-checking organizations (Snopes, PolitiFact)
- Academic researchers in media/journalism
- Podcast hosts covering tech/media

EMAIL TEMPLATE:
---
Subject: New platform for documenting public statements

Hi [Name],

I wanted to share a project we just launched that might interest you: The Words Record (https://thewordsrecord.com).

It's a public platform for documenting verified statements from public figures, with full sourcing and context. Think of it as an accountability archive.

What makes it different:
- Every statement verified from primary sources
- No editorializing – just facts and context
- Free and open to the public
- Already [XX] cases documented

Would you be interested in checking it out? Happy to provide more details or arrange a demo.

Best,
[Your name]
---

FOLLOW-UP:
- Send emails over 2-3 days (not all at once)
- Personalize each email (reference their work)
- Be prepared for questions
- Don't be pushy if no response
```

---

## 1️⃣9️⃣ PERFORMANCE OPTIMIZATION

### 🔴 CRITICAL: Compress and optimize all images
**Time:** 2 hours | **Owner:** Frontend Dev
```bash
# Install image optimization tools:
npm install sharp

# Create script to compress images:
# scripts/optimize-images.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '../public/images');

fs.readdirSync(imagesDir).forEach(file => {
  if (file.match(/\.(jpg|jpeg|png)$/)) {
    const inputPath = path.join(imagesDir, file);
    const outputPath = path.join(imagesDir, file.replace(/\.(jpg|jpeg|png)$/, '.webp'));

    sharp(inputPath)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath)
      .then(() => console.log(`Optimized: ${file}`));
  }
});

# Run script:
node scripts/optimize-images.js

# Update image references in components to use WebP:
# Before: <img src="/images/photo.jpg" />
# After: <Image src="/images/photo.webp" alt="..." width={800} height={600} />

# Test: Check Network tab → images should be smaller, load faster
```

### 🟠 URGENT: Enable Vercel compression and caching
**Time:** 1 hour | **Owner:** DevOps
```javascript
// Update next.config.js:
module.exports = {
  compress: true, // Enable gzip compression

  // Set cache headers:
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year cache for images
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year cache for static files
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300', // 1 min cache, 5 min stale
          },
        ],
      },
    ];
  },
};

// Test: Check response headers in DevTools Network tab
// Static files should have long cache times
// API responses should have short cache times
```

### 🟡 SERIOUS: Optimize database queries (add indexes, reduce N+1)
**Time:** 3 hours | **Owner:** Backend Dev
```bash
# Identify slow queries:
# 1. Enable Supabase query logging:
#    Supabase Dashboard → Database → Query Performance
#    Note queries taking > 1 second

# 2. Common slow queries to fix:

# BAD: N+1 query (fetches statements one by one)
const cases = await prisma.case.findMany();
for (const case of cases) {
  const statements = await prisma.statement.findMany({ where: { caseId: case.id } });
}

# GOOD: Single query with include
const cases = await prisma.case.findMany({
  include: { statements: true }
});

# 3. Add missing indexes (check with EXPLAIN ANALYZE):
# In Prisma schema:
model Statement {
  // ... fields ...
  @@index([caseId, statementDate]) // Composite index for timeline queries
  @@index([personId, isVerified])   // For verified statements by person
}

# 4. Run migration:
npx prisma migrate dev --name add_performance_indexes

# 5. Test: Run slow queries again → should be < 100ms now
# Use: console.time('query'); await query; console.timeEnd('query');
```

### 🟢 IMPORTANT: Implement server-side caching for expensive operations
**Time:** 2 hours | **Owner:** Backend Dev
```typescript
// Create lib/serverCache.ts:
const cache = new Map<string, { data: any; expiry: number }>();

export function cached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);

  if (cached && cached.expiry > Date.now()) {
    return Promise.resolve(cached.data);
  }

  return fetcher().then(data => {
    cache.set(key, { data, expiry: Date.now() + ttlSeconds * 1000 });
    return data;
  });
}

// Use in API routes:
export default async function handler(req, res) {
  const stats = await cached('dashboard-stats', 300, async () => {
    return {
      totalCases: await prisma.case.count(),
      totalStatements: await prisma.statement.count(),
      totalPeople: await prisma.person.count()
    };
  });

  return res.json(stats);
}

// Benefits:
// - First request: Takes ~500ms (3 database queries)
// - Subsequent requests (5 min): Takes ~5ms (from cache)
// - Reduces database load
```

### 🔵 WORTHWHILE: Set up CDN for static assets
**Time:** 2 hours | **Owner:** DevOps
```bash
# Vercel already uses global CDN, but you can optimize further:

# Option A: Use Cloudflare as proxy (free):
1. Sign up at https://www.cloudflare.com
2. Add your domain
3. Update nameservers at domain registrar
4. Enable Cloudflare proxy (orange cloud icon)
5. Configure Page Rules:
   - Cache Level: Standard
   - Browser Cache TTL: 4 hours
   - Edge Cache TTL: 1 month

# Option B: Use Vercel's Image Optimization (already enabled):
# Ensures images are:
- Automatically resized for device
- Converted to WebP/AVIF
- Served from nearest edge location
- Lazy loaded by default

# Test CDN:
curl -I https://thewordsrecord.com/images/logo.png | grep -i cf-cache-status
# Should return: cf-cache-status: HIT (on 2nd request)

# Test global CDN:
# Use https://www.webpagetest.org
# Run tests from multiple locations (US, Europe, Asia)
# TTFB should be < 200ms globally
```

---

## 2️⃣0️⃣ FINAL LAUNCH DAY CHECKLIST

### 🔴 CRITICAL: Pre-launch smoke test (2 hours before launch)
**Time:** 1 hour | **Owner:** QA + DevOps
```bash
# PRODUCTION SMOKE TEST CHECKLIST

## Infrastructure
□ DNS resolves: dig thewordsrecord.com → correct IP
□ SSL certificate valid: https://thewordsrecord.com shows 🔒
□ No deployment errors in Vercel logs
□ Database connection working (check /api/health endpoint)
□ All environment variables set correctly

## Critical User Flows (test in incognito mode)
□ Homepage loads in < 3 seconds
□ Can navigate to /cases → loads case list
□ Can click a case → loads case detail page
□ Can search → returns results
□ Can navigate to /people → loads people list
□ Can click person → loads profile
□ 404 page works (visit /nonexistent-url)
□ Legal pages load (Privacy, Terms, Cookies)

## Admin Flows
□ Can login at /admin/login
□ Dashboard loads with stats
□ Can create new statement
□ Can edit existing case
□ Can delete test item
□ Audit log records action

## Analytics & Monitoring
□ GTM fires (check Network tab for gtm.js)
□ Google Analytics receives events (Real-Time report)
□ Sentry is recording events
□ UptimeRobot shows "Up"

## External Services
□ AdSense ads.txt accessible
□ Robots.txt accessible
□ Sitemap.xml accessible
□ Contact form sends email

## Performance
□ Lighthouse score > 90 (run in incognito)
□ No console errors on any page
□ Images load as WebP
□ Page transitions smooth

## Security
□ HTTPS enforced (http:// redirects to https://)
□ Security headers present (check securityheaders.com)
□ Admin routes require authentication
□ Rate limiting works (test with 6 rapid requests)

❌ If ANY item fails → DO NOT LAUNCH
✅ If ALL items pass → Proceed with launch
```

### 🟠 URGENT: Launch announcement across all channels
**Time:** 1 hour | **Owner:** Marketing
```bash
# LAUNCH DAY SEQUENCE (coordinate timing):

## T-0 (Launch Time: 9:00 AM PST recommended)
□ Publish launch blog post on website
□ Tweet launch announcement (thread prepared earlier)
□ Post on LinkedIn
□ Post on Facebook
□ Post on Instagram

## T+15 minutes
□ Submit to Product Hunt
□ Submit to Hacker News (Show HN)

## T+30 minutes
□ Send email to preview list (if you have one)
□ Post in relevant Slack/Discord communities

## T+1 hour
□ Monitor social media for responses
□ Respond to comments on Product Hunt/HN
□ Answer any questions promptly

## T+2 hours
□ Check analytics (Real-Time users in GA4)
□ Monitor error rates in Sentry
□ Check server load in Vercel dashboard

## T+4 hours
□ Submit to more directories (BetaList, etc.)
□ Share on Reddit (carefully, avoid spam rules)

## T+8 hours
□ Send personalized emails to journalists (prepared earlier)
□ Post update with early metrics ("50 people tried it in first hour!")

## End of Day
□ Review analytics (pageviews, unique visitors, bounce rate)
□ Check for any critical errors in Sentry
□ Verify backups ran successfully
□ Document any issues for post-mortem
```

### 🟡 SERIOUS: Monitor metrics during first 24 hours
**Time:** Ongoing | **Owner:** DevOps + Marketing
```bash
# METRICS TO WATCH (check every 2 hours on launch day):

## Traffic Metrics (Google Analytics)
□ Real-Time users (target: 20+ concurrent users)
□ Pageviews (target: 500+ in first 24h)
□ Bounce rate (< 70% is good)
□ Average session duration (> 2 minutes is good)
□ Top landing pages (should be homepage, then cases)

## Performance Metrics (Vercel)
□ Response time (< 500ms average)
□ Error rate (< 1%)
□ Build status (should stay green)
□ Bandwidth usage (watch for DDoS or scraping)

## Error Tracking (Sentry)
□ New errors introduced (investigate immediately)
□ Error rate (< 0.1% of requests)
□ Slow transactions (flag anything > 5 seconds)

## Database (Supabase)
□ Active connections (< 80% of limit)
□ Slow queries (flag anything > 1 second)
□ Database size growth (normal growth expected)

## Uptime (UptimeRobot)
□ Should remain 100% up
□ If down → investigate immediately
□ Check response time trends

## Social Media
□ Product Hunt ranking (try to stay in top 10)
□ Hacker News ranking (try to stay on front page)
□ Twitter engagement (retweets, replies)
□ Mention tracking (Google Alerts, Brand24)

## User Feedback Channels
□ Check contact form submissions
□ Monitor support email
□ Respond to social media comments
□ Note common questions (add to FAQ)

# ALERT THRESHOLDS (immediate action required):
- ⚠️ Error rate > 5%
- ⚠️ Site down for > 5 minutes
- ⚠️ Database connections > 90%
- ⚠️ Security alert from Sentry
- ⚠️ Negative feedback about data accuracy
```

### 🟢 IMPORTANT: Post-launch review meeting (end of Day 1)
**Time:** 1.5 hours | **Owner:** Leadership Team
```markdown
# POST-LAUNCH REVIEW AGENDA

## Metrics Review (30 min)
□ Traffic: Total visitors, sources, top pages
□ Performance: Average load time, error rate
□ Conversion: How many searched, viewed cases, contacted
□ Social: Product Hunt votes, HN points, social shares

## Issues Encountered (30 min)
□ Technical issues and resolutions
□ User feedback (positive and negative)
□ Unexpected behavior or edge cases
□ What went wrong that we didn't anticipate?

## Wins (15 min)
□ What went better than expected?
□ Positive feedback highlights
□ Smooth deployments or processes

## Immediate Action Items (15 min)
□ Critical bugs to fix tonight
□ Content that needs updating
□ Monitoring to improve
□ Quick wins for tomorrow

## Next 48 Hours Plan
□ Who's monitoring what?
□ When's the next check-in?
□ What metrics are we targeting?

# Document everything in LAUNCH_RETROSPECTIVE.md
```

### 🔵 WORTHWHILE: Create "First 100 Users" milestone celebration
**Time:** 1 hour | **Owner:** Marketing
```
When you hit 100 unique visitors:

1. Screenshot milestone from Google Analytics
2. Create thank you post:
   - "🎉 100 people have visited The Words Record in the first [X] hours!"
   - Share interesting early stats
   - Thank early adopters
   - Tease what's coming next

3. Post on social media
4. Optional: Small giveaway or contest
   - "First 100 users who tweet about us get [something small]"
   - Stickers, t-shirts (if you have them)

5. Add to About page:
   - "Launched on [date]"
   - "Reached 100 users in [X] hours"
   - Shows momentum to later visitors

6. Document in company timeline/history
```

---

# 🎯 PRIORITIZED 7-DAY SPRINT PLAN

Based on the 100 tasks above, here's what to focus on each day:

## **Day 1-2 (Critical Backend & Security)**
Focus: Get core infrastructure solid
- Backend tasks (1️⃣): Database migration, API testing
- Security tasks (2️⃣): Login flow, security headers, vulnerability scan
- **Hours needed:** 25-30

## **Day 3-4 (Critical Pages & Content)**
Focus: Public-facing functionality
- Frontend tasks (3️⃣, 4️⃣): Test all pages, add real content
- Legal tasks (5️⃣): Update Privacy/Terms, test forms
- **Hours needed:** 20-25

## **Day 5 (Deployment & Monitoring)**
Focus: Production readiness
- Hosting tasks (8️⃣): Vercel setup, domain, SSL
- Monitoring tasks (10️⃣): Sentry, uptime monitoring
- Testing tasks (11️⃣): Full smoke test
- **Hours needed:** 15-20

## **Day 6 (SEO & Analytics)**
Focus: Discoverability
- SEO tasks (6️⃣): Meta tags, sitemaps, submit to Google
- Analytics tasks (7️⃣): Connect GA4, set up events
- Performance tasks (19): Lighthouse audit, optimize
- **Hours needed:** 10-15

## **Day 7 (Final Checks & Launch)**
Focus: Polish and go-live
- Final checks (20): Pre-launch smoke test
- Documentation (17): Update README, create guides
- Launch tasks (18): Prepare announcements, submit to directories
- **Hours needed:** 8-10

**Total: 78-100 hours over 7 days = 11-14 hours per day (realistic with 1-2 people)**

---

**END OF LAUNCH TASK LIST**

Would you like me to expand any specific category, or create a more detailed daily schedule?
