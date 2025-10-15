# Dashboard "My Listings" Bug Fix

**Issue:** Users cannot see their own products in the dashboard  
**Affected Page:** `/app/expat/dashboard/page.tsx`  
**Priority:** 🔴 CRITICAL  
**Date:** 2025-10-14

---

## Problem Summary

The dashboard's "My Listings" tab shows no products even after users create listings. The page fetches all products from the backend but fails to correctly filter them for the current user.

### Root Cause

**Multiple ID mismatches between authentication system and product data:**

1. **Backend Product Structure** (from Swagger API):
   - Products have a `sellerId` field (integer/int64)
   - Products also have `sellerName` field (string)
2. **Frontend Auth System**:
   - User object has `id` as string (email-based)
   - User object has `email` and `loggingEmail` fields
3. **Dashboard Filtering Logic** (lines 150-178):
   ```typescript
   const userListings = allProducts.filter((product: any) => {
     return (
       product.userId === userId || // ❌ No userId field
       product.sellerId === userId || // ❌ sellerId is number, userId is string
       product.createdById === userId || // ❌ No createdById field
       product.sellerEmail === userEmail || // ❌ No sellerEmail field
       product.userEmail === userEmail || // ❌ No userEmail field
       product.createdBy === userEmail // ❌ No createdBy field
     )
   })
   ```

### The Real Issue

**Backend does NOT provide a dedicated endpoint to get user's own products.** The frontend must:

1. Fetch ALL products (inefficient for large datasets)
2. Filter client-side by matching against user data

**BUT:** The backend `sellerId` is a numeric ID, while the frontend auth system uses email-based string IDs. There's no mapping between them!

---

## Immediate Solutions

### Solution 1: Use Backend Filter API (RECOMMENDED)

The backend has a filter endpoint that may support filtering by seller. Let's use it:

```typescript
// In /app/expat/dashboard/page.tsx
// Replace lines 95-123 with:

try {
  console.log('🎯 Fetching user products via filter API...')

  // Try filtering by current user (if backend supports it)
  // First, get user details to see if there's a sellerId
  const userDetails = await apiClient.getUserDetails()
  console.log('User details:', userDetails)

  // Use filter API with seller email or name
  const filterResponse = await fetch(`${API_BASE_URL}/api/v1/displayItem/filter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      sellerName: user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`.trim()
        : user?.name || '',
      // Add other filter criteria as needed
    })
  })

  if (filterResponse.ok) {
    const filtered = await filterResponse.json()
    allProducts = filtered.data?.content || filtered.data || []
    console.log('✅ Filtered products:', allProducts.length)
  } else {
    // Fallback to fetching all products
    console.warn('Filter API failed, falling back to get-all-products')
    // ... existing fetch all logic
  }
}
```

### Solution 2: Match by Seller Name (QUICK FIX)

Since `ProductResponseDTO` has `sellerName` field, match against that:

```typescript
// In /app/expat/dashboard/page.tsx
// Replace lines 150-178 with:

const userFullName =
  user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}`.trim() : user?.name || ''

const userListings = allProducts.filter((product: any) => {
  // Match by seller name (case-insensitive)
  const sellerNameMatch =
    product.sellerName && product.sellerName.toLowerCase() === userFullName.toLowerCase()

  // Log for debugging
  if (allProducts.indexOf(product) < 5) {
    console.log(`Product ${allProducts.indexOf(product) + 1}:`, {
      productName: product.productName,
      sellerName: product.sellerName,
      userFullName,
      matches: sellerNameMatch,
    })
  }

  return sellerNameMatch
})
```

### Solution 3: Request Backend Enhancement (LONG-TERM)

**Ask backend team to add endpoint:**

```
GET /api/v1/products/my-products
GET /api/v1/products/seller/{sellerId}
```

This would:

- Return only products created by authenticated user
- Avoid fetching all products (performance issue)
- Remove need for client-side filtering

---

## Implementation

### Step 1: Update Dashboard Page

<function_calls>
<invoke name="Edit">
<parameter name="file_path">/home/cisco/Documents/ExpatFrontend-main/app/expat/dashboard/page.tsx
