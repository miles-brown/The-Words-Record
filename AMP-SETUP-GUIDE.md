# AMP Auto Ads Setup Guide

## ✅ Completed Setup

I've added the AMP auto-ads configuration to your site. Here's what was done:

### 1. Updated `_document.tsx`

Added:
- Import for `useAmp` from Next.js
- New `AmpDocument()` component with AMP-specific structure
- AMP auto-ads script in `<Head>` section
- AMP auto-ads component right after `<body>` tag

### 2. AMP Auto Ads Configuration

Your AMP pages now include:

**Step 1 - In `<Head>` section:**
```html
<script
  async
  custom-element="amp-auto-ads"
  src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js"
/>
```

**Step 2 - After `<body>` tag:**
```html
<amp-auto-ads
  type="adsense"
  data-ad-client="ca-pub-5418171625369886"
/>
```

## 🚀 Enabling AMP on Your Pages

To enable AMP on specific pages, you need to export an AMP config. Here are examples:

### Option 1: Hybrid AMP (Recommended)

Serves both regular and AMP versions at different URLs.

**Example for `pages/cases/[slug].js`:**

```javascript
// At the end of the file, add:
export const config = {
  amp: 'hybrid' // Enables both /cases/slug and /cases/slug.amp
}
```

### Option 2: AMP-Only

Makes the entire page AMP-only.

```javascript
export const config = {
  amp: true // Makes /cases/slug AMP-only
}
```

### Example: Enable AMP for Case Pages

Here's how to modify `pages/cases/[slug].tsx`:

```typescript
// ... existing imports and component code ...

export async function getServerSideProps(context) {
  // ... existing code ...
}

// Add this at the end:
export const config = {
  amp: 'hybrid' // Enable AMP with /cases/slug.amp URL
}
```

## 📋 Recommended Pages for AMP

Enable AMP on these content pages for best monetization:

1. ✅ **Case pages** - `pages/cases/[slug].tsx`
2. ✅ **Person pages** - `pages/people/[slug].tsx`
3. ✅ **Organization pages** - `pages/organizations/[slug].tsx`
4. ✅ **Tag pages** - `pages/tags/[slug].tsx`
5. ✅ **Homepage** - `pages/index.js`

### Quick Enable Script

Want to enable AMP on all content pages? Add this to each:

```javascript
export const config = { amp: 'hybrid' }
```

## 🔍 Testing AMP Pages

Once enabled, access AMP versions by adding `.amp` to URLs:

- Regular: `https://thewordsrecord.com/cases/some-case`
- AMP: `https://thewordsrecord.com/cases/some-case.amp`

### Validate AMP

1. Open AMP version in Chrome
2. Add `#development=1` to URL
3. Open DevTools Console
4. Look for "AMP validation successful" message

Or use: https://validator.ampproject.org/

## ⏱️ When Will Ads Appear?

**Important:** It can take up to **1 hour** for ads to appear on AMP pages after:
- First deployment
- Adding new AMP pages
- Making AMP configuration changes

## 🎨 AMP Styling Considerations

AMP has restrictions on CSS and JavaScript. When enabling AMP:

1. **CSS must be inline** - No external stylesheets
2. **No custom JavaScript** - Only AMP components
3. **Images need amp-img** - Use `<amp-img>` instead of `<img>`
4. **No external fonts from Google** - Self-host or use system fonts

### Example AMP-Compatible Component

```typescript
import { useAmp } from 'next/amp'

export default function MyPage({ data }) {
  const isAmp = useAmp()

  return (
    <div>
      {isAmp ? (
        <amp-img
          src="/image.jpg"
          width="800"
          height="600"
          layout="responsive"
        />
      ) : (
        <img src="/image.jpg" alt="Image" />
      )}
    </div>
  )
}

export const config = { amp: 'hybrid' }
```

## 📊 Monitoring AMP Ads

### Google AdSense Dashboard

Check AMP ad performance:
1. Go to: https://adsense.google.com
2. Navigate to: **Reports** → **Sites**
3. Filter by: **AMP pages**
4. View metrics: Impressions, Clicks, Revenue

### Google Search Console

Monitor AMP page indexing:
1. Go to: https://search.google.com/search-console
2. Navigate to: **Experience** → **AMP**
3. View: Valid AMP pages, errors

## 🐛 Troubleshooting

### "No ads showing on AMP pages"

**Checklist:**
- ✅ Wait at least 1 hour after deployment
- ✅ Verify AMP validation passes
- ✅ Check AdSense account is active
- ✅ Ensure page has sufficient content (300+ words recommended)
- ✅ Verify `data-ad-client` matches your AdSense publisher ID

### "AMP validation errors"

Common issues:
- **Custom JavaScript**: Remove or use AMP components
- **External CSS**: Inline all styles
- **Invalid HTML**: Use AMP-specific tags (`<amp-img>`, `<amp-video>`)
- **Missing required tags**: Every AMP page needs `<!doctype html>`, `<html amp>`, specific meta tags

### "Hybrid mode not working"

If `/page.amp` returns 404:
- Ensure `export const config = { amp: 'hybrid' }` is at file level (not inside component)
- Restart dev server: `npm run dev`
- Clear `.next` cache: `rm -rf .next && npm run dev`

## 🚀 Quick Start Commands

### Enable AMP on a single page

```bash
# Edit the page file
nano pages/cases/[slug].tsx

# Add at the end:
export const config = { amp: 'hybrid' }
```

### Test locally

```bash
npm run dev

# Visit:
# http://localhost:3000/cases/some-case.amp
```

### Deploy

```bash
git add pages/_document.tsx
git commit -m "feat: Add AMP auto-ads support"
git push

# Vercel will auto-deploy
```

## 📚 Next Steps

1. ✅ Choose pages to enable AMP (start with case pages)
2. ✅ Add `export const config = { amp: 'hybrid' }` to those pages
3. ✅ Test AMP validation locally
4. ✅ Deploy to production
5. ✅ Wait 1 hour for ads to appear
6. ✅ Monitor AdSense dashboard for AMP revenue

## 🔗 Resources

- Next.js AMP Docs: https://nextjs.org/docs/pages/building-your-application/configuring/amp
- AMP Auto Ads Guide: https://amp.dev/documentation/components/amp-auto-ads/
- AMP Validator: https://validator.ampproject.org/
- AdSense Help: https://support.google.com/adsense/answer/9190028

## 💡 Pro Tips

1. **Start with hybrid mode** - Test AMP without affecting regular pages
2. **Enable on high-traffic pages first** - Focus on pages with most visits
3. **Monitor Core Web Vitals** - AMP should improve page speed scores
4. **Use AMP components** - Leverage `amp-carousel`, `amp-accordion`, etc.
5. **Test mobile first** - AMP is optimized for mobile users

---

**Your AdSense Publisher ID:** `ca-pub-5418171625369886`

**Status:** ✅ AMP auto-ads script configured and ready

**Next action:** Add `export const config = { amp: 'hybrid' }` to content pages
