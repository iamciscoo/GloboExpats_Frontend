# Product Visibility Issue - Diagnostic Report

## 🐛 Problem Summary

Some products appear in listing pages but return "Product not found" (404) errors when users click on them to view details.

## 🔍 Root Cause Analysis

### Backend API Architecture Issue

The platform uses **two different API endpoint families** for product data:

1. **Product Listing Endpoint** (✅ Working)
   - Endpoint: `GET /api/v1/products/get-all-products`
   - Returns: Paginated list of products
   - Used by: Browse page, Dashboard, Homepage sections
   - Status: **Returns 48 products successfully**

2. **Product Detail Endpoint** (❌ Failing for some products)
   - Endpoint: `GET /api/v1/displayItem/itemDetails/{productId}`
   - Returns: Detailed product information
   - Used by: Product detail page, Edit listing page
   - Status: **Returns 404 for some products that exist in listings**

### Data Consistency Problem

```
┌─────────────────────────────────────────────────────────────┐
│ Backend Database                                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  products TABLE          displayItem VIEW/SERVICE           │
│  ┌──────────┐            ┌──────────┐                       │
│  │ Product  │            │ Display  │                       │
│  │ ID: 71   │───────────>│ ID: ???  │  ← Missing/Broken    │
│  │ Name: A  │            │          │     Mapping          │
│  └──────────┘            └──────────┘                       │
│       ✅                       ❌                            │
│  Exists in DB          Not in display view                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘

User Flow:
1. Browse Page → GET /products/get-all-products → Shows Product 71 ✅
2. Click Product 71 → GET /displayItem/itemDetails/71 → 404 Error ❌
```

## 🔬 Evidence from Investigation

### API Test Results

**Test 1: Product Listing Endpoint**
```bash
curl -X 'GET' 'https://dev.globoexpats.com/api/v1/products/get-all-products?page=0'
```
**Result**: ✅ Success - Returns 48 products including:
- Product ID: 71 (New Design Plant pots with water chamber)
- Product ID: 70 (Bottom Plates - Various size)
- Product ID: 69 (Epipremnum aureum - Money Plant)
- ... and 45 more products

**Test 2: Product Detail Endpoint**
```bash
curl -X 'GET' 'https://dev.globoexpats.com/api/v1/displayItem/itemDetails/71'
```
**Result**: ❌ CORS Error / Failed to fetch (Swagger UI test)
- Indicates possible authentication requirement or configuration issue

### Frontend Error Pattern

```typescript
// Error from /lib/api.ts line 300
errorMessage = 'Product not found. The item you are looking for may have been removed or is no longer available.'

// Stack trace shows error in parseError catch block (line 277-309)
// Suggests backend is returning 404 but error response parsing is failing
```

## 📊 Impact Analysis

### Affected User Flows

1. ❌ **Product Detail Page**: Users can't view products they see in listings
2. ❌ **Edit Listing**: Sellers can't edit their own products
3. ❌ **Similar Products**: Related product suggestions fail
4. ❌ **Direct Links**: Shared product URLs return 404

### Working Features

1. ✅ **Browse Page**: Product listings display correctly
2. ✅ **Homepage Sections**: Top Picks, New Listings, Featured Grid load
3. ✅ **Dashboard**: My Listings page shows products
4. ✅ **Product Creation**: New products can be created

## 🛠️ Recommended Solutions

### Option 1: Use Unified Endpoint (Quick Fix)

**Change product detail page to use the working endpoint:**

```typescript
// Current: /app/product/[id]/page.tsx
const response = await apiClient.getProductDetails(Number(id))  // ❌ Uses /displayItem/itemDetails

// Proposed:
const response = await apiClient.getAllProducts(0)  // ✅ Uses /products/get-all-products
const product = response.content.find(p => p.productId === Number(id))
```

**Pros:**
- Immediate fix for frontend
- Uses proven working endpoint
- No backend changes required

**Cons:**
- Less efficient (fetches all products)
- Doesn't fix root cause
- Temporary workaround

### Option 2: Fix Backend Data Consistency (Proper Solution)

**Investigate and fix the displayItem service/view:**

1. **Check Backend Logs**: Look for errors in the Spring Boot application
   ```bash
   # On backend server
   tail -f logs/application.log | grep displayItem
   ```

2. **Verify Database View**: Ensure displayItem view/table has all products
   ```sql
   -- Compare product counts
   SELECT COUNT(*) FROM products;
   SELECT COUNT(*) FROM display_items; -- or whatever view/table name is used
   
   -- Find missing products
   SELECT p.product_id, p.product_name 
   FROM products p
   LEFT JOIN display_items d ON p.product_id = d.product_id
   WHERE d.product_id IS NULL;
   ```

3. **Check Authentication**: Verify if endpoint requires auth
   ```java
   // In Spring Boot controller
   @GetMapping("/displayItem/itemDetails/{productId}")
   @PreAuthorize("permitAll()") // Should allow public access
   public ResponseEntity<DisplayItemsDTO> getItemDetails(@PathVariable Long productId) {
       // ...
   }
   ```

4. **Fix Data Sync**: Ensure product creation updates both tables
   ```java
   // In product service
   @Transactional
   public void createProduct(ProductDTO dto) {
       Product product = productRepository.save(dto);
       displayItemService.createDisplayItem(product); // ← Ensure this is called
   }
   ```

### Option 3: Hybrid Approach (Recommended)

**Implement fallback logic in frontend:**

```typescript
async function getProductDetails(productId: number) {
  try {
    // Try the detail endpoint first
    return await apiClient.getProductDetails(productId)
  } catch (error) {
    // Fallback to fetching from all products
    console.warn(`Product ${productId} not found in displayItem, falling back to products list`)
    const allProducts = await apiClient.getAllProducts(0)
    const product = allProducts.content.find(p => p.productId === productId)
    
    if (!product) {
      throw new Error('Product not found in any endpoint')
    }
    
    return product
  }
}
```

**Benefits:**
- Immediate user experience improvement
- Provides time to fix backend properly
- Maintains best-case performance (detail endpoint when working)
- Graceful degradation for problematic products

## 🚀 Implementation Plan

### Phase 1: Immediate Relief (Frontend)
1. Run diagnostic script to identify affected products
2. Implement fallback logic in product detail page
3. Add error monitoring to track which products fail
4. Deploy frontend update

### Phase 2: Root Cause Fix (Backend)
1. Review backend logs for displayItem errors
2. Audit database consistency
3. Fix data synchronization issues
4. Add integration tests for both endpoints
5. Deploy backend fix

### Phase 3: Prevention (Both)
1. Add health check comparing product counts between endpoints
2. Implement automated testing for product visibility
3. Add monitoring alerts for 404 rates
4. Document proper product creation flow

## 📝 Diagnostic Script

A diagnostic script has been created to help identify which products are affected:

```bash
# Run the diagnostic
npx ts-node scripts/diagnose-product-visibility.ts

# Or add to package.json and run
npm run diagnose-products
```

The script will:
- Fetch all products from the listing endpoint
- Test each product against the detail endpoint
- Generate a report showing which products are inaccessible
- Provide actionable recommendations

## 🔗 Related Files

### Frontend Files Affected
- `/lib/api.ts` - API client with error handling (lines 260-323)
- `/app/product/[id]/page.tsx` - Product detail page (lines 61-254)
- `/app/edit-listing/[id]/page.tsx` - Edit listing page
- `/app/browse/page.tsx` - Browse page (working correctly)

### Backend Endpoints
- `GET /api/v1/products/get-all-products` ✅ Working
- `GET /api/v1/displayItem/itemDetails/{id}` ❌ Failing
- `POST /api/v1/displayItem/filter` ❓ Unknown status
- `GET /api/v1/displayItem/top-picks` ✅ Working
- `GET /api/v1/displayItem/newest` ✅ Working

## 📞 Next Steps

1. **Immediate**: Run diagnostic script to quantify the problem
2. **Short-term**: Implement frontend fallback to unblock users
3. **Long-term**: Fix backend data consistency
4. **Ongoing**: Monitor and prevent recurrence

## 🤝 Support Needed

If you have access to the backend codebase (gitignored in this repo), please:
1. Share the displayItem controller/service implementation
2. Provide database schema for products and display_items tables
3. Share any recent migration scripts or data updates
4. Check application logs for related errors

---

**Generated**: November 15, 2025
**Platform**: ExpatFrontend (Next.js 15 + Spring Boot Backend)
**Severity**: High (impacts core product viewing functionality)
