# Header Layering Fix - Ensuring Header Always Stays on Top

## Issue Summary

The Globoexpat header was being covered by Sheet components (cart panel, mobile menu, search) when they opened. This created a poor user experience where navigation became inaccessible and the branding was hidden.

## Root Cause

Both the header and Sheet components were using the same z-index (`z-50`), causing them to stack unpredictably. Additionally, Sheet overlays and content were covering the full viewport including the header area.

## Solution

### 1. Increased Header Z-Index
**File**: `/components/header.tsx`

```tsx
// Before
className="... sticky top-0 z-50"

// After
className="... sticky top-0 z-[60]"
```

**Changes**:
- Header now uses `z-[60]` instead of `z-50`
- Applied to both `Header` component and `HeaderSkeleton`
- Ensures header is always above all Sheet components (which use `z-50`)

### 2. Positioned Sheet Content Below Header
Applied to all Sheet components to start 64px below the top (header height):

#### A. Cart Side Panel
**File**: `/components/cart-sidepanel.tsx`

```tsx
<SheetContent
  side="right"
  className="w-[75%] sm:w-[380px] max-w-[380px] flex flex-col p-0 top-[64px] h-[calc(100vh-64px)]"
  aria-label="Shopping cart panel"
>
```

#### B. Mobile Search
**File**: `/components/header/mobile-menu.tsx`

```tsx
<SheetContent
  side="top"
  className="h-auto bg-brand-primary border-b-0 p-4 pb-6 top-[64px]"
  aria-describedby="search-description"
>
```

#### C. Mobile Navigation Menu
**File**: `/components/header/mobile-menu.tsx`

```tsx
<SheetContent
  side="right"
  className="bg-brand-primary text-neutral-100 w-64 sm:w-72 top-[64px] h-[calc(100vh-64px)]"
  aria-describedby="menu-description"
>
```

#### D. Category Sidebar
**File**: `/components/mobile-sidebar-toggle.tsx`

```tsx
<SheetContent 
  side="left" 
  className="w-[280px] sm:w-80 p-0 flex flex-col top-[64px] h-[calc(100vh-64px)]"
>
```

## Key CSS Properties Used

### `top-[64px]`
- Positions Sheet content to start 64px from the top
- 64px = height of header (`h-16` = 4rem = 64px)
- Ensures content doesn't overlap the header

### `h-[calc(100vh-64px)]`
- Sets height to full viewport minus header height
- Prevents Sheet content from extending below viewport
- Ensures proper scrolling within the Sheet

### `z-[60]`
- Custom z-index above the default `z-50` used by Sheet components
- Ensures header always renders on top
- Uses bracket notation for arbitrary values in Tailwind

## Layout Structure

```
┌─────────────────────────────────┐
│  Header (z-[60], h-16/64px)     │ ← Always on top
├─────────────────────────────────┤
│                                 │
│  Sheet Overlay (z-50)           │ ← Starts at 64px
│                                 │
│  Sheet Content (z-50)           │ ← Positioned with top-[64px]
│  - Height: calc(100vh - 64px)   │ ← Never extends below viewport
│                                 │
└─────────────────────────────────┘
```

## Benefits

### ✅ User Experience
- Header remains visible and accessible at all times
- Users can always close sheets or navigate away
- Brand consistency maintained

### ✅ Mobile First
- Search functionality no longer covered on mobile
- Navigation menu properly positioned
- Cart panel doesn't hide header actions

### ✅ Accessibility
- Navigation always accessible
- Keyboard users can always reach header controls
- Screen readers can always access header elements

### ✅ Responsive Design
- Works consistently across all viewport sizes
- Proper spacing on mobile and desktop
- No content cutoff or overflow issues

## Testing Checklist

- [x] Cart side panel opens below header on mobile
- [x] Cart side panel opens below header on desktop
- [x] Mobile search opens below header
- [x] Mobile navigation menu opens below header
- [x] Category sidebar opens below header
- [x] Header remains clickable when sheets are open
- [x] No z-index conflicts or stacking issues
- [x] Overlays don't cover the header
- [x] Sheet content scrolls properly within its container

## Related Files

- `/components/header.tsx` - Header z-index increased
- `/components/cart-sidepanel.tsx` - Cart panel positioning
- `/components/header/mobile-menu.tsx` - Search and nav menu positioning
- `/components/mobile-sidebar-toggle.tsx` - Category sidebar positioning
- `/components/ui/sheet.tsx` - Base Sheet component (unchanged)

## Notes

- The header height is fixed at 64px (`h-16` in Tailwind)
- If header height changes, update all `top-[64px]` and `calc(100vh-64px)` values
- The overlay in `sheet.tsx` was kept at default (full viewport) to maintain proper backdrop behavior
- Individual Sheet instances control their own positioning via className overrides

---

**Fixed Date**: 2025-10-15  
**Issue Type**: UI/UX - Layout & Layering  
**Severity**: High (affects mobile navigation and accessibility)  
**Status**: ✅ Resolved
