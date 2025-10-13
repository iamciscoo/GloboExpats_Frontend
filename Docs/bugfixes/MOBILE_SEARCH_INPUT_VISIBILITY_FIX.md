# Mobile Search Input Visibility Fix

**Date:** 2025-10-13  
**Component:** Mobile Search Feature  
**Files Modified:**
- `components/search-bar.tsx`
- `components/header/mobile-menu.tsx`

## Problem

When clicking the search icon on mobile devices, the search modal/sheet opened but only showed a search icon button instead of the actual search input field. The SearchBar component was rendering in its collapsed state even when inside the mobile search overlay.

**User Experience:**
- User clicks search icon ✅
- Blue search modal opens ✅
- Only search icon visible (not the input field) ❌
- User couldn't type their search query ❌

## Root Cause

The `SearchBar` component has an internal `isExpanded` state that defaults to `false`. When `isExpanded` is false, it renders only a search icon button (lines 175-179). When the SearchBar was used inside the mobile Sheet component, it would render in this collapsed state, requiring an additional click on the icon to expand it.

**Before:**
```tsx
export default function SearchBar() {
  const [isExpanded, setIsExpanded] = useState(false)  // Always starts collapsed
  // ...
  if (!isExpanded) {
    return <Button>🔍</Button>  // Only shows icon
  }
  return <Input />  // Shows actual search input
}
```

## Solution

Added an `autoExpand` prop to the SearchBar component that controls the initial expanded state. When used in the mobile sheet, we pass `autoExpand={true}` to start the component in its expanded state.

### 1. SearchBar Component Changes (`components/search-bar.tsx`)

**Added interface and prop:**
```tsx
interface SearchBarProps {
  autoExpand?: boolean
}

export default function SearchBar({ autoExpand = false }: SearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(autoExpand)  // Start expanded if prop is true
  // ...
}
```

**Updated click-outside handler:**
```tsx
// Don't attach click-outside handler if auto-expanded (mobile sheet handles closing)
if (autoExpand) return
```

**Updated keyboard shortcuts:**
```tsx
// Don't attach keyboard shortcuts if auto-expanded (mobile sheet handles its own)
if (autoExpand) return
```

### 2. Mobile Menu Changes (`components/header/mobile-menu.tsx`)

**Updated SearchBar usage:**
```tsx
<div className="w-full max-w-md">
  <SearchBar autoExpand />  {/* Added autoExpand prop */}
</div>
```

## Results

✅ **Search input visible immediately:** When mobile search sheet opens, the input field is visible  
✅ **Auto-focus works:** Input is automatically focused when sheet opens  
✅ **No conflicting handlers:** Click-outside and keyboard handlers disabled in mobile context  
✅ **Sheet controls closing:** Mobile sheet's own close button and gestures work properly  
✅ **Desktop unaffected:** Desktop search bar still works with expand/collapse behavior

## Behavior Differences

### Desktop Header Search
- **Default:** Collapsed (shows search icon button)
- **On Click:** Expands to show input field
- **Keyboard Shortcuts:** / or Ctrl+K to open
- **Click Outside:** Closes the search input
- **Escape Key:** Closes the search input

### Mobile Sheet Search
- **Default:** Auto-expanded (shows input field immediately)
- **Auto-Focus:** Input field receives focus automatically
- **Keyboard Shortcuts:** Disabled (sheet handles its own)
- **Click Outside:** Handled by sheet component
- **Close Button:** Sheet's X button closes the overlay

## Testing

1. **Mobile Search:**
   ```
   - Open mobile view (< 1024px width)
   - Click search icon in header
   - ✅ Sheet should open with visible search input
   - ✅ Input should be auto-focused
   - ✅ Start typing immediately
   - ✅ See suggestions dropdown
   - ✅ Click X to close sheet
   ```

2. **Desktop Search:**
   ```
   - Open desktop view (> 1024px width)
   - Search bar should be visible in header
   - ✅ Click search icon to expand
   - ✅ Type to search
   - ✅ Press Escape to collapse
   - ✅ Click outside to collapse
   ```

## Related Files

- `components/search-bar.tsx` - Main search component
- `components/header/mobile-menu.tsx` - Mobile navigation
- `components/ui/sheet.tsx` - Sheet/drawer component
- `components/ui/input.tsx` - Input component
