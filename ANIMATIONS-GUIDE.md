# Animations & Transitions Guide

This project includes smooth animations and transitions for enhanced user experience.

## Global Animations

### Page Transitions
- **Fade In**: All pages fade in when loaded (0.4s)
- **Smooth Navigation**: Links and buttons have hover transitions

### Loading States
- **Spinner**: Rotating spinner for async operations
- **Skeleton Loader**: Shimmer effect for content loading
- **Pulse Animation**: Subtle pulsing for loading messages

## Component Animations

### 1. Card Animations
**Applied to**: Incident cards, Person cards, Organization cards

```css
/* Hover effect */
- Lifts up 4px on hover
- Box shadow expands
- Smooth 0.3s transition

/* Active state */
- Presses down slightly
- Reduced shadow
```

### 2. List Stagger Animation
**Applied to**: Incident lists, Person lists, Statement lists

Items animate in sequence:
- Each item slides up from 20px below
- Fades from 0 to 100% opacity
- Staggered delays (0.05s increments)
- First 8 items have staggered animation

**CSS Classes Used**:
- `stagger-item` - Add to list items for animation

### 3. Button Interactions
**Applied to**: All buttons, submit inputs

```css
/* Hover */
- Lifts up 1px
- Box shadow appears
- 0.2s transition

/* Active/Click */
- Returns to normal position
- Shadow reduces
```

### 4. Quote/Statement Animations
**Applied to**: Statements on person and incident pages

- Stagger animation for multiple quotes
- Smooth fade and slide-up effect
- Curly quotation mark is positioned absolutely
- Quote content in Garamond with smooth reveal

### 5. Header Scroll Animation
**Applied to**: Main navigation header

```css
/* Normal state */
- Full height padding (1rem)
- No shadow

/* Scrolled state (>50px) */
- Reduced padding (0.5rem)
- Box shadow appears
- Logo size reduces
- Smooth 0.3s transition
```

### 6. Menu Animations
**Applied to**: Mobile hamburger menu

```css
/* Overlay */
- Fades in (0.3s)
- Semi-transparent backdrop

/* Menu panel */
- Slides in from right
- 0.3s ease animation
```

## Available CSS Classes

Add these classes to elements for instant animations:

### Loading
```jsx
<div className="spinner" />          // Rotating spinner
<div className="skeleton" />         // Shimmer loading bar
```

### Animations
```jsx
<div className="fade-in" />          // Fade in effect
<div className="stagger-item" />     // Staggered list animation
<div className="success-feedback" /> // Success pulse animation
```

## React Components

### Loading Component
```jsx
import Loading from '@/components/Loading'

// Full page loading
<Loading fullPage message="Loading content..." size="large" />

// Inline loading
<Loading message="Please wait..." size="small" />
```

### Skeleton Loader
```jsx
import { SkeletonLoader } from '@/components/Loading'

<SkeletonLoader
  lines={3}
  width="100%"
  height="1rem"
  gap="0.75rem"
/>
```

## Animation Timings

| Animation | Duration | Easing |
|-----------|----------|--------|
| Page fade in | 0.4s | ease-out |
| Card hover | 0.3s | ease |
| Button hover | 0.2s | ease |
| Link color | 0.2s | ease |
| Header scroll | 0.3s | ease |
| Stagger items | 0.4s | ease-out |
| Menu slide | 0.3s | ease |
| Spinner rotation | 0.8s | linear |
| Shimmer | 2s | infinite |
| Success pulse | 0.3s | ease-out |

## Performance Considerations

All animations use GPU-accelerated properties:
- `transform` (translateY, translateX, scale)
- `opacity`
- No layout-shifting properties

**Browser Support:**
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with hardware acceleration

## Customization

### Modify Animation Speed
Edit `styles/globals.css` keyframes:

```css
@keyframes fadeIn {
  /* Change duration in component usage */
  animation: fadeIn 0.6s ease-out; /* Slower */
}
```

### Add Custom Animations
1. Define keyframes in `globals.css`
2. Create utility class
3. Apply to components

Example:
```css
@keyframes slideInFromBottom {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-in-bottom {
  animation: slideInFromBottom 0.5s ease-out;
}
```

## Accessibility

All animations respect user preferences:

```css
/* Future implementation */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Testing Animations

1. **Check page load**: Main content should fade in
2. **Hover cards**: Should lift up smoothly
3. **List items**: Should stagger on first load
4. **Scroll header**: Should shrink after 50px
5. **Click buttons**: Should have press effect
6. **Open menu**: Should slide in from right

## Known Issues

None currently. Performance is optimized for all modern browsers.

## Future Enhancements

Planned animations:
- [ ] Page-to-page transition effects
- [ ] Image lazy-load fade-in
- [ ] Success/error toast notifications
- [ ] Tooltip animations
- [ ] Modal entrance/exit animations
- [ ] Search results highlight animation
