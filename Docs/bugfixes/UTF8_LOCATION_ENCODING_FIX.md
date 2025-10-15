# UTF-8 Location Encoding Issue Fix

## Issue Description

Product cards and pages were displaying garbled UTF-8 characters before location names, such as:

- `Ã•Â•Ã'Â•Ã'ÂºÃ•Â°Ã'â€¹Ã•Â°; Zanzibar, TZ`
- `Ã•Â•Ã'Â•Ã'ÂºÃ•Â°; Dar es Salaam, TZ`

This was caused by double-encoded UTF-8 data coming from the backend, where non-ASCII characters were being incorrectly encoded.

## Root Cause

The backend was returning location strings with malformed UTF-8 encoding, likely from:

1. Double encoding of UTF-8 characters
2. Character set mismatch in database or API response
3. Location data containing special characters that weren't properly handled

## Solution Implemented

### 1. Created Location Cleaning Utility (`lib/image-utils.ts`)

Added `cleanLocationString()` function that:

- Detects semicolon-separated garbled prefixes and extracts the actual location
- Removes common garbled UTF-8 patterns using regex
- Handles edge cases with proper fallbacks

```typescript
export const cleanLocationString = (location: string): string => {
  if (!location) return ''

  // Pattern: Garbled UTF-8 characters are often followed by a semicolon
  if (location.includes(';')) {
    const parts = location.split(';')
    const cleaned = parts[parts.length - 1].trim()
    if (cleaned) return cleaned
  }

  // Remove common garbled UTF-8 prefixes
  const garbledPatterns = [/^[Ã\u00C0-\u00FF][•\u0080-\u00FF]+[;:\s]/, /^[\u00C0-\u00FF]{2,}/]

  let cleaned = location
  for (const pattern of garbledPatterns) {
    cleaned = cleaned.replace(pattern, '')
  }

  return cleaned.trim()
}
```

### 2. Applied Cleaning in Data Transformation Layer

Updated `transformBackendProduct()` in `lib/image-utils.ts`:

```typescript
location: cleanLocationString(item.productLocation || item.location || 'Dar es Salaam, TZ'),
```

This ensures all product data goes through the cleaning process automatically.

### 3. Applied Cleaning in Component Displays

Updated components that display location directly:

- `app/expat/dashboard/page.tsx` - Dashboard product listings
- `app/cart/page.tsx` - Shopping cart items

## Files Modified

1. **lib/image-utils.ts**
   - Added `cleanLocationString()` utility function
   - Applied cleaning in `transformBackendProduct()`

2. **app/expat/dashboard/page.tsx**
   - Imported `cleanLocationString`
   - Applied to location display in listings

3. **app/cart/page.tsx**
   - Imported `cleanLocationString`
   - Applied to location badge in cart items

## Testing Checklist

- [ ] Product cards on homepage display clean locations
- [ ] Product detail pages show clean locations
- [ ] Dashboard listings show clean locations
- [ ] Cart items display clean locations
- [ ] Browse/search results show clean locations
- [ ] No JavaScript errors in console
- [ ] Location fallback works when data is missing

## Prevention

To prevent this issue in the future:

1. **Backend Fix (Recommended)**:
   - Fix UTF-8 encoding in the database
   - Ensure API responses use `Content-Type: application/json; charset=utf-8`
   - Validate location data on product creation

2. **Frontend Resilience**:
   - Keep the `cleanLocationString()` function as a safety layer
   - Add data validation in form submissions
   - Monitor for new encoding issues in error logs

## Related Issues

- Character encoding in other text fields (descriptions, titles) should be monitored
- Similar issues may exist in seller names or other user-generated content

## Notes

The fix handles the symptom (garbled display) but the root cause should be addressed in the backend to prevent malformed data from entering the system in the first place.
