# Homepage Redesign Implementation Guide

## Overview

This document provides complete instructions for implementing the redesigned homepage for **The Words Record**. The redesign modernizes the layout, improves ad placement, enhances accessibility, and creates a calm, scholarly aesthetic suitable for an archival documentation project.

## Design Principles

- **Aesthetic**: Calm, factual, trustworthy — inspired by archival interfaces
- **Typography**: Cinzel (serif headings) + Inter (sans-serif body)
- **Color Scheme**: Muted earth tones with charcoal-blue accents
- **Layout**: 3-column grid with framed ad placement
- **Mobile**: Clean single-column responsive design

## New Components Created

### 1. AdSlot Component (`components/AdSlot.tsx`)

Flexible, reusable ad component with:
- Multiple position support (sidebar, banner, inline)
- Lazy loading with Intersection Observer
- Mobile-responsive sizing
- ARIA labels for accessibility
- CLS prevention with reserved space

**Usage:**
```tsx
<AdSlot position="left-sidebar" lazy={true} />
```

### 2. Enhanced Layout Component (`components/LayoutRedesigned.tsx`)

Modernized layout wrapper with:
- Fixed header with scroll effects
- Centered site title with logo left, menu right
- Mobile hamburger menu
- Minimal footer with legal links
- Semantic HTML5 structure

### 3. Redesigned Homepage (`pages/index-redesigned.tsx`)

Complete homepage implementation featuring:
- Hero section with founder's statement
- 3-column responsive grid layout
- Sidebar ad slots (desktop only)
- Latest cases grid
- Featured case highlight
- 6-step methodology section
- Newsletter signup form
- Mobile-optimized with inline ads

## Implementation Steps

### Step 1: Install Dependencies

Ensure you have the required fonts loaded:

```html
<!-- Add to Head component or _document.tsx -->
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
```

### Step 2: Configure AdSense

Update the AdSlot component with your actual AdSense slot IDs:

```tsx
// In components/AdSlot.tsx
function getAdSlotId(position: AdPosition): string {
  const slotMap: Record<AdPosition, string> = {
    'top-banner': 'YOUR-ADSENSE-SLOT-ID-1',
    'left-sidebar': 'YOUR-ADSENSE-SLOT-ID-2',
    'right-sidebar': 'YOUR-ADSENSE-SLOT-ID-3',
    'mid-content': 'YOUR-ADSENSE-SLOT-ID-4',
    'footer-banner': 'YOUR-ADSENSE-SLOT-ID-5',
    'mobile-inline': 'YOUR-ADSENSE-SLOT-ID-6'
  }
  return slotMap[position]
}
```

### Step 3: Test the Redesigned Homepage

1. Navigate to `/index-redesigned` to preview the new design
2. Test responsive breakpoints (1400px, 1200px, 1024px, 768px, 480px)
3. Verify ad loading and placement
4. Test newsletter signup functionality
5. Check accessibility with screen readers

### Step 4: Migrate to Production

When ready to go live:

```bash
# Backup current homepage
cp pages/index.tsx pages/index-backup.tsx

# Replace with redesigned version
cp pages/index-redesigned.tsx pages/index.tsx

# Update Layout import in index.tsx
# Change: import Layout from '../components/Layout'
# To: import LayoutRedesigned from '../components/LayoutRedesigned'
```

### Step 5: Newsletter Backend Integration

Connect the newsletter form to your backend:

```tsx
// In pages/index-redesigned.tsx
const handleSubscribe = async (e: React.FormEvent) => {
  e.preventDefault()
  setSubscribeStatus('loading')

  try {
    const response = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })

    if (response.ok) {
      setSubscribeStatus('success')
      setEmail('')
    } else {
      setSubscribeStatus('error')
    }
  } catch (error) {
    setSubscribeStatus('error')
  }
}
```

## Key Features

### Desktop Layout (>1024px)
- 3-column grid: left ad | content | right ad
- Sticky sidebar ads (200px width)
- Max content width: 750px
- Top banner ad (728×90)
- Fixed header with scroll effects

### Mobile Layout (<1024px)
- Single column layout
- No sidebar ads
- 2 inline ads maximum
- Collapsible hamburger menu
- Touch-optimized (44px minimum targets)

### Accessibility (WCAG 2.2 AA)
- Semantic HTML5 structure
- ARIA labels on all interactive elements
- 4.5:1 minimum contrast ratio
- Focus-visible states
- Reduced motion support
- Screen reader optimized

### Performance Optimizations
- Lazy loading for below-fold ads
- Reserved space to prevent CLS
- Optimized font loading
- Responsive images
- Minimal JavaScript

## Color Palette

```css
--bg-primary: #f9f8f6;      /* Main background */
--bg-secondary: #f2f1ef;    /* Section backgrounds */
--text-primary: #2f3538;    /* Main text */
--text-secondary: #5f6f7a;  /* Secondary text */
--accent: #4a5f71;          /* Links and accents */
--border-light: #e8e6e3;    /* Light borders */
--border-dark: #d4d2cf;     /* Dark borders */
```

## Typography

```css
/* Headings */
font-family: 'Cinzel', serif;
font-weight: 400-600;

/* Body Text */
font-family: 'Inter', sans-serif;
font-weight: 300-600;
line-height: 1.75;
```

## Browser Support

- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+
- iOS Safari 14+
- Chrome Android 90+

## Testing Checklist

- [ ] Desktop layout (1600px, 1400px, 1200px)
- [ ] Tablet layout (1024px, 768px)
- [ ] Mobile layout (480px, 375px)
- [ ] Ad loading and display
- [ ] Newsletter form submission
- [ ] Header scroll behavior
- [ ] Mobile menu functionality
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Dark mode support (if enabled)
- [ ] Print stylesheet
- [ ] Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)

## Deployment Notes

1. **Environment Variables**: Ensure `NEXT_PUBLIC_ADSENSE_CLIENT` is set
2. **Static Generation**: Homepage uses `getStaticProps` with 5-minute revalidation
3. **CDN**: Serve static assets through CDN for optimal performance
4. **Monitoring**: Set up Real User Monitoring for Core Web Vitals

## Migration Rollback

If issues arise, rollback to the original design:

```bash
# Restore original homepage
cp pages/index-backup.tsx pages/index.tsx

# Restart application
npm run build && npm run start
```

## Future Enhancements

- [ ] A/B testing for ad placement optimization
- [ ] Advanced newsletter preferences
- [ ] Related cases recommendation engine
- [ ] Progressive Web App features
- [ ] Internationalization (i18n)
- [ ] Advanced search with filters
- [ ] User accounts and bookmarks

## Support

For questions or issues with the implementation:
- Review the code comments in each component
- Check browser console for errors
- Verify AdSense account settings
- Test with AdSense debug mode

---

## Quick Start Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint
```

## File Structure

```
/components
  ├── AdSlot.tsx              # Ad placement component
  ├── LayoutRedesigned.tsx    # Enhanced layout wrapper
  └── Layout.tsx              # Original layout (backup)

/pages
  ├── index-redesigned.tsx    # New homepage design
  ├── index.tsx              # Current homepage
  └── index-backup.tsx       # Backup of original

/styles
  └── globals.css            # Global styles (unchanged)
```

## Performance Metrics Target

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTI** (Time to Interactive): < 3.8s
- **Speed Index**: < 3.4s

---

Last Updated: January 2025
Version: 1.0.0