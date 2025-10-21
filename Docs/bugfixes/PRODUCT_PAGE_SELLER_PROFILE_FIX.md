# Product Page Seller Profile Image Fix

**Date**: 2025-10-21  
**Status**: Fixed (Frontend Workaround)  
**Backend Action Required**: Yes

---

## Issues Found

### 1. Seller Profile Images Not Loading

**Problem**: Product pages were attempting to fetch seller profile images but failing silently.

**Root Cause**: 
- Frontend code attempted to call `GET /api/v1/users/{sellerId}` endpoint
- **This endpoint does not exist in the backend** (verified via Swagger UI)
- Backend only has `/api/v1/userManagement/user-details` which returns the **current authenticated user's** details, not any user by ID

**Swagger API Verification**:
```
Available Endpoint:
GET /api/v1/userManagement/user-details
- Returns: Current user's details (requires authentication)
- Response includes: profileImageUrl, userId, firstName, etc.

Missing Endpoint:
GET /api/v1/users/{id}
- Does NOT exist in backend
- Frontend assumed this existed and tried to call it
```

### 2. Product Details Response Structure Issues

**Problem**: "Product not found" errors on deployed version (worked locally).

**Root Cause**:
- Inconsistent response wrapping between environments
- Local: Direct product object
- Production: Product wrapped in `data` property

**Fix**: Enhanced response handling to support both structures:
```typescript
// Handle both direct and wrapped responses
let productData = respData as Record<string, unknown>

if (respData.data && typeof respData.data === 'object') {
  productData = respData.data as Record<string, unknown>
}
```

---

## Frontend Changes Made

### File: `/app/product/[id]/page.tsx`

1. **Removed seller profile image fetch attempt**:
   - Removed `sellerProfileImage` state
   - Removed API call to non-existent `/api/v1/users/{id}` endpoint
   - Avatar now falls back to initials (colored circles with seller's name initials)

2. **Enhanced product data extraction**:
   - Handles both direct and `data`-wrapped responses
   - Added comprehensive logging for debugging
   - More robust null checks

3. **Added clear documentation**:
   - Documented the missing backend endpoint
   - Added TODO comments for future implementation

---

## Backend API Gaps Identified

### Critical: Missing User Profile Endpoint

The backend needs **ONE** of these solutions:

#### Option 1: Add User Profile Endpoint (Recommended)
```java
/**
 * Get public user profile by ID
 * This should return ONLY public information (no private data like email)
 */
@GetMapping("/api/v1/users/{userId}")
public ResponseEntity<PublicUserProfileDTO> getUserProfile(@PathVariable Long userId) {
    // Return public profile info including profileImageUrl
}
```

**PublicUserProfileDTO should include**:
- `userId` (Long)
- `firstName` (String)
- `lastName` (String)  
- `profileImageUrl` (String) ← **Most important for product pages**
- `location` (String)
- `verificationStatus` (enum)
- Optional: `aboutMe`, `memberSince`, `rating`, `totalProducts`

**Security**: This endpoint should NOT require authentication and should NOT return sensitive data like:
- Email addresses
- Phone numbers
- Organizational details
- Private addresses

---

#### Option 2: Include Seller Profile Image in Product Response

Modify `/api/v1/displayItem/itemDetails/{productId}` response:

**Current response**:
```json
{
  "productId": 123,
  "sellerId": 456,
  "sellerName": "John Doe",
  // ... other fields
}
```

**Enhanced response**:
```json
{
  "productId": 123,
  "sellerId": 456,
  "sellerName": "John Doe",
  "sellerProfileImageUrl": "https://...",  ← ADD THIS
  "sellerLocation": "Dar es Salaam",      ← Optional but useful
  "sellerVerified": true,                 ← Already exists
  // ... other fields
}
```

---

## Current User Experience

### Before Fix:
- ❌ Console errors from failed API calls
- ❌ Profile image state stuck in loading
- ❌ Product page crashes in production with "Product not found"

### After Fix:
- ✅ Product pages load successfully
- ✅ Seller info displays with initials fallback
- ✅ No console errors
- ✅ Works in both local and production environments
- ⚠️ Seller profile pictures not displayed (backend limitation)

---

## Visual Impact

**Seller Card - Current State**:
```
┌──────────────────────────────┐
│  [FJ]  Francis Jacob         │  ← Initials in colored circle
│   ⭐ 0 (0 reviews)           │
│   📍 dar-es-salaam           │
│   ✅ Verified Seller         │
└──────────────────────────────┘
```

**Seller Card - After Backend Fix**:
```
┌──────────────────────────────┐
│  [📷]  Francis Jacob         │  ← Actual profile picture
│   ⭐ 0 (0 reviews)           │
│   📍 dar-es-salaam           │
│   ✅ Verified Seller         │
└──────────────────────────────┘
```

---

## Testing Recommendations

### For Backend Team:

1. **Implement Option 1 or 2 above**
2. **Test the endpoint**:
   ```bash
   # Test public user profile endpoint
   curl -X GET "http://10.123.22.21:8081/api/v1/users/123"
   
   # Should return public profile including profileImageUrl
   ```

3. **Verify product details include seller image**:
   ```bash
   curl -X GET "http://10.123.22.21:8081/api/v1/displayItem/itemDetails/8"
   
   # Check if sellerProfileImageUrl is present
   ```

### For Frontend Team:

Once backend implements the fix:

1. **If Option 1 (User endpoint)**:
   - Uncomment the seller profile fetch code
   - Test with various sellers
   - Verify images load correctly

2. **If Option 2 (Product response)**:
   - Update `transformBackendProduct()` in `/lib/image-utils.ts`
   - Add `sellerProfileImageUrl` to product transformation
   - Pass to Avatar component

---

## Related Files

- **Fixed**: `/app/product/[id]/page.tsx`
- **Dependencies**: `/lib/api.ts`, `/lib/image-utils.ts`
- **Backend**: `/api/v1/users/` (missing), `/api/v1/displayItem/itemDetails/` (exists)

---

## Priority

**High** - Seller profile pictures improve trust and user experience on product pages.

## Estimated Backend Effort

- **Option 1**: 2-4 hours (new endpoint + DTOs)
- **Option 2**: 1-2 hours (modify existing endpoint)

**Recommendation**: Implement Option 1 (dedicated user endpoint) as it's more flexible for future features like seller profiles page, messaging, etc.
