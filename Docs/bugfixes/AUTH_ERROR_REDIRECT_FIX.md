# Authentication Error Redirect Fix

**Date**: 2025-10-21  
**Issue**: Product pages throwing "Product not found" errors instead of redirecting unauthenticated users to login  
**Status**: ✅ Fixed

---

## Problem Description

When unauthenticated users tried to access product pages, the application would show "Product not found" errors instead of properly redirecting to the login page. This was caused by:

1. API calls failing with 401/403 authentication errors
2. Error handlers not checking for authentication-related errors
3. Generic error messages displayed instead of proper auth flow

**Error Symptoms**:
- "Error: Product not found" shown on product pages
- Console errors about failed API calls
- No redirect to login page
- Poor user experience for logged-out users

---

## Root Cause Analysis

The issue occurred in multiple locations where API calls were made without checking if errors were authentication-related:

1. **Product Page** (`app/product/[id]/page.tsx`):
   - `apiClient.getProductDetails()` would fail with 401 if auth required
   - Error handler caught error but didn't check `isAuthError` flag
   - Displayed "Product not found" instead of redirecting

2. **Browse Page** (`app/browse/page.tsx`):
   - Similar issue with product listing API calls
   - No auth error detection in error handler

3. **General Pattern**:
   - API client marks errors with `isAuthError` flag
   - Individual pages weren't checking this flag
   - No centralized auth error handling

---

## Solution Implemented

### 1. Created Centralized Auth Error Utilities

**New File**: `lib/auth-redirect.ts`

```typescript
// Key utilities:
- isAuthenticationError(error) - Detects auth errors
- handleAuthError(error, router, returnPath) - Redirects to login
- getErrorMessage(error) - User-friendly error messages
- handleApiError(error, options) - Comprehensive error handler
```

**Features**:
- Consistent auth error detection across app
- Automatic redirect to login with return URL
- User-friendly error messages
- Reusable, type-safe utilities

### 2. Updated Product Page

**File**: `app/product/[id]/page.tsx`

**Changes**:
```typescript
import { handleAuthError } from '@/lib/auth-redirect'

// In error handler:
if (handleAuthError(err, router, `/product/${id}`)) {
  return // User being redirected to login
}
```

**Behavior**:
- ✅ Detects 401/403 errors from API
- ✅ Redirects to `/login?returnUrl=/product/{id}`
- ✅ User returns to product page after login
- ✅ Non-auth errors show proper error messages

### 3. Updated Browse Page

**File**: `app/browse/page.tsx`

**Changes**:
```typescript
const error = err as Error & { isAuthError?: boolean; statusCode?: number }
if (error.isAuthError || error.statusCode === 401) {
  // For public browse page, show message instead of forcing login
  setError('Some features require authentication. Please log in to see all products.')
}
```

**Rationale**:
- Browse page is public (in `PUBLIC_ROUTES`)
- Shouldn't force login for anonymous browsing
- Shows helpful message if auth needed for full features

---

## Testing & Verification

### Test Cases

**1. Unauthenticated User - Product Page**
- ✅ Access `/product/8` without login
- ✅ If backend requires auth: redirect to `/login?returnUrl=/product/8`
- ✅ After login: return to `/product/8`
- ✅ If backend allows public: show product normally

**2. Authenticated User - Product Page**
- ✅ Access product page with valid JWT
- ✅ Product loads successfully
- ✅ No authentication errors

**3. Browse Page - Unauthenticated**
- ✅ Can browse products without login
- ✅ If API requires auth: shows friendly message
- ✅ Doesn't force login for public browsing

**4. Token Expiry**
- ✅ JWT expires during session
- ✅ Next API call triggers auth error
- ✅ User redirected to login
- ✅ Return URL preserved

---

## API Client Error Handling

The `ApiClient` class already marks errors with metadata:

```typescript
const apiError = new Error(errorMessage) as Error & {
  isVerificationError?: boolean
  statusCode?: number
  isAuthError?: boolean
}
apiError.isAuthError = response.status === 401 || response.status === 403
```

**New utilities leverage this metadata**:
- Pages no longer need to manually check status codes
- Consistent error handling across app
- Easy to extend for other error types

---

## Migration Guide

### For Existing Pages with API Calls

**Before**:
```typescript
try {
  const data = await apiClient.getData()
} catch (err) {
  setError(err.message)
}
```

**After (Simple)**:
```typescript
import { handleAuthError } from '@/lib/auth-redirect'

try {
  const data = await apiClient.getData()
} catch (err) {
  if (handleAuthError(err, router, '/current-path')) {
    return
  }
  setError(err.message)
}
```

**After (Advanced)**:
```typescript
import { handleApiError } from '@/lib/auth-redirect'

try {
  const data = await apiClient.getData()
} catch (err) {
  const message = handleApiError(err, {
    router,
    returnPath: '/current-path',
    onError: (msg) => toast.error(msg)
  })
  if (message) setError(message)
}
```

---

## Related Files Modified

1. ✅ `lib/auth-redirect.ts` - New utility file
2. ✅ `app/product/[id]/page.tsx` - Auth error handling
3. ✅ `app/browse/page.tsx` - Auth error handling
4. ✅ `Docs/bugfixes/AUTH_ERROR_REDIRECT_FIX.md` - This documentation

---

## Future Improvements

### Short-term
- [ ] Add auth error handling to remaining pages that make API calls
- [ ] Add toast notifications for auth errors
- [ ] Create error boundary for auth errors

### Medium-term
- [ ] Implement refresh token flow (automatic token renewal)
- [ ] Add session expiry warnings before logout
- [ ] Centralized error handling HOC/middleware

### Long-term
- [ ] Offline support with service workers
- [ ] Optimistic UI updates with error rollback
- [ ] Real-time session sync across tabs

---

## Best Practices

1. **Always check for auth errors** in catch blocks
2. **Use utility functions** instead of manual checks
3. **Preserve return URLs** for better UX
4. **Differentiate public vs. private pages** in error handling
5. **Log auth redirects** for debugging (development only)

---

## References

- [Auth Provider Documentation](../features/AUTHENTICATION.md)
- [API Client Documentation](../architecture/API_CLIENT.md)
- [Middleware Configuration](../../middleware.ts)
- [Route Guard Implementation](../../components/route-guard.tsx)

---

**Verified by**: Platform audit and testing  
**Impact**: Critical - Fixes user experience for unauthenticated access  
**Breaking Changes**: None - backward compatible
