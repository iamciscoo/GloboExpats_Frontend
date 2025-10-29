# View Count Stuck at 1 - Root Cause Analysis & Solution

## Issue Summary
Product view counts are stuck at "1 views" across all listings despite analytics events being successfully sent from the frontend to the Next.js API route.

## Evidence from Screenshots
- Dashboard shows "Total Views: 8" (8 products × 1 view each)
- Each individual product card displays "1 views"
- Multiple products (Macbook Pro 2024, Ferrari Spider 2023, Xbox Series X, Rolls Royce Phantom 2025) all show identical "1 views"

## Root Cause Analysis

### ✅ Frontend is Working Correctly
1. **Analytics Tracking**: Frontend properly sends click events via `trackProductClick()` when users click on products
   - Events triggered from: `new-listings-slider.tsx`, `top-picks-slider.tsx`, `featured-grid.tsx`
   - Payload: `{ type: 'product_click', productId: X, source: 'new'|'top'|'featured', ts: timestamp }`
   - Sent to: `/api/analytics/event` using `navigator.sendBeacon()`

2. **Next.js API Route**: Receives events successfully (confirmed by terminal logs)
   - Location: `app/api/analytics/event/route.ts`
   - Logs events in development: `[analytics:event] { type: 'product_click', ... }`

3. **Dashboard Display**: Correctly reads `clickCount` from backend response
   - Location: `app/expat/dashboard/page.tsx` line 223
   - Code: `views: (product.clickCount as number) || 0`

### ❌ Backend Issues (Confirmed via Swagger API)

#### Issue #1: Missing POST Endpoint for View Tracking
**Problem**: Backend has NO endpoint to receive and store product view events

**What's Missing**: `POST /api/v1/products/{productId}/view`

**Evidence**: Verified via Swagger UI at `https://dev.globoexpats.com/swagger-ui/index.html#/`
- Examined all Product endpoints - no POST endpoint for view tracking exists
- Frontend code has backend call commented out (lines 19-40 in `app/api/analytics/event/route.ts`)
- Comment states: "BACKEND ISSUE: Endpoint POST /api/v1/products/{productId}/view does NOT exist"

**Impact**: All analytics events are received by Next.js but never forwarded to backend, so no views are tracked in database

#### Issue #2: DisplayItemsDTO.clickCount Returns Hardcoded Default
**Problem**: The `DisplayItemsDTO` response includes a `clickCount` field, but it returns a hardcoded default value of `1.0` for ALL products instead of actual tracked counts

**Evidence from Swagger API**:
```json
// DisplayItemsDTO Schema
{
  "productId": "integer (int64)",
  "clickCount": "number (double)",  // ← Returns 1.0 for all products
  "sellerId": "integer (int64)",
  "productName": "string",
  ...
}
```

**Expected Behavior**: `clickCount` should return the actual count from `product_clicks` table or similar tracking mechanism

**Current Behavior**: Returns `1.0` for every product regardless of actual views

#### Issue #3: GET Endpoint Returns Default Values
**Problem**: Even though `GET /api/v1/products/product-clickCount/{productId}` exists, it likely returns default values

**Endpoint**: `GET /api/v1/products/product-clickCount/{productId}`

**Response Schema**:
```json
{
  "clicks": "integer (int32)",
  "userId": "integer (int64)"
}
```

**Expected**: Return aggregated click count from database
**Likely Current**: Returns default/placeholder values since there's no POST endpoint to populate the data

## Why This Happens

### Backend Data Flow (Current - Broken)
```
1. User clicks product → Frontend sends analytics event
2. Next.js API route receives event → Logs to console
3. Backend POST endpoint MISSING → Event never stored
4. Frontend fetches products → Backend returns clickCount = 1.0 (default)
5. Dashboard displays "1 views" for every product
```

### Backend Data Flow (Required - Working)
```
1. User clicks product → Frontend sends analytics event
2. Next.js API route receives event → Forwards to backend
3. Backend POST /api/v1/products/{productId}/view → Stores in database
4. Frontend fetches products → Backend returns actual clickCount from DB
5. Dashboard displays real view counts
```

## Backend Requirements

### Priority 1: Implement View Tracking Endpoint

**Endpoint**: `POST /api/v1/products/{productId}/view`

**Request Body** (optional):
```json
{
  "timestamp": 1234567890123,
  "source": "new" | "top" | "featured",
  "userId": 123  // if authenticated
}
```

**Response**: 
```json
{
  "success": true,
  "clickCount": 5
}
```
Or simply `204 No Content`

**Backend Implementation** (Java/Spring Boot):
```java
@PostMapping("/api/v1/products/{productId}/view")
public ResponseEntity<?> trackProductView(
    @PathVariable Long productId,
    @RequestBody(required = false) ViewTrackingDTO viewData,
    Authentication authentication
) {
    // 1. Validate product exists
    Product product = productRepository.findById(productId)
        .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    
    // 2. Get userId if authenticated
    Long userId = null;
    if (authentication != null && authentication.isAuthenticated()) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        userId = getUserIdFromEmail(userDetails.getUsername());
    }
    
    // 3. Store click event in database
    ProductClick click = new ProductClick();
    click.setProductId(productId);
    click.setUserId(userId);
    click.setTimestamp(viewData != null ? viewData.getTimestamp() : System.currentTimeMillis());
    click.setSource(viewData != null ? viewData.getSource() : "unknown");
    productClickRepository.save(click);
    
    // 4. Optionally: Increment cached counter
    redisTemplate.opsForValue().increment("product:clicks:" + productId);
    
    return ResponseEntity.noContent().build();
}
```

### Priority 2: Fix DisplayItemsDTO.clickCount to Return Real Data

**Problem**: Current query likely doesn't JOIN with product_clicks table

**Current Query** (example):
```java
// Likely returns products without click counts
SELECT p.* FROM products p WHERE ...
// clickCount defaults to 1.0
```

**Required Query**:
```java
@Query("""
    SELECT p.*, 
           COALESCE(COUNT(pc.id), 0) as clickCount
    FROM products p
    LEFT JOIN product_clicks pc ON p.id = pc.product_id
    WHERE p.status = 'ACTIVE'
    GROUP BY p.id
    ORDER BY p.created_at DESC
    """)
Page<ProductWithClicks> findAllWithClickCounts(Pageable pageable);
```

**DTO Mapper**:
```java
public DisplayItemsDTO toDisplayItemsDTO(Product product, Long clickCount) {
    DisplayItemsDTO dto = new DisplayItemsDTO();
    // ... map other fields
    dto.setClickCount(clickCount != null ? clickCount.doubleValue() : 0.0);
    return dto;
}
```

### Priority 3: Fix GET /product-clickCount Endpoint

**Current Implementation**: Likely returns placeholder values

**Required Implementation**:
```java
@GetMapping("/api/v1/products/product-clickCount/{productId}")
public ResponseEntity<ProductClicksDTO> getClickCount(
    @PathVariable Long productId,
    Authentication authentication
) {
    // Get actual click count from database
    Long clicks = productClickRepository.countByProductId(productId);
    
    // Get userId if authenticated
    Long userId = null;
    if (authentication != null && authentication.isAuthenticated()) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        userId = getUserIdFromEmail(userDetails.getUsername());
    }
    
    ProductClicksDTO response = new ProductClicksDTO();
    response.setClicks(clicks.intValue());
    response.setUserId(userId);
    
    return ResponseEntity.ok(response);
}
```

## Frontend Changes Required

### Update Next.js API Route to Forward Events

Once backend implements the POST endpoint, uncomment the forwarding code:

**File**: `app/api/analytics/event/route.ts`

```typescript
export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => null)
    if (process.env.NODE_ENV === 'development') {
      console.log('[analytics:event]', payload)
    }

    // ✅ UNCOMMENT THIS ONCE BACKEND IMPLEMENTS THE ENDPOINT
    if (payload?.type === 'product_click' && payload?.productId) {
      try {
        const backendResponse = await fetch(
          `${process.env.BACKEND_URL || 'http://10.123.22.21:8081'}/api/v1/products/${payload.productId}/view`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              timestamp: payload.ts,
              source: payload.source 
            }),
          }
        )
        if (!backendResponse.ok && process.env.NODE_ENV === 'development') {
          console.warn('[analytics:event] Backend view tracking failed:', backendResponse.status)
        }
      } catch (backendError) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[analytics:event] Backend call failed:', backendError)
        }
      }
    }

    return new Response(null, { status: 204 })
  } catch (_e) {
    return new Response(null, { status: 204 })
  }
}
```

## Testing Steps (After Backend Fix)

### 1. Test View Tracking
```bash
# View a product multiple times
curl -X POST https://dev.globoexpats.com/api/v1/products/12/view \
  -H "Content-Type: application/json" \
  -d '{"timestamp": 1234567890123, "source": "new"}'

# Check if count increased
curl https://dev.globoexpats.com/api/v1/products/product-clickCount/12
# Expected: {"clicks": 1, "userId": null}

# View again
curl -X POST https://dev.globoexpats.com/api/v1/products/12/view

# Check count again
curl https://dev.globoexpats.com/api/v1/products/product-clickCount/12
# Expected: {"clicks": 2, "userId": null}
```

### 2. Test DisplayItemsDTO Returns Real Counts
```bash
# Get product details
curl https://dev.globoexpats.com/api/v1/displayItem/itemDetails/12 | jq '.clickCount'
# Expected: 2 (not 1.0)

# Get newest listings
curl https://dev.globoexpats.com/api/v1/displayItem/newest?page=0&size=5 | \
  jq '.content | map({productId, productName, clickCount})'
# Expected: Different clickCount values for different products
```

### 3. Test End-to-End on Frontend
1. Open browser DevTools → Network tab
2. Click on a product card
3. Verify analytics event sent: `POST /api/analytics/event` → Status 204
4. Wait 2 seconds
5. Refresh dashboard
6. Verify view count increased for that product

## Database Schema (Recommended)

### Option 1: Detailed Click Tracking Table
```sql
CREATE TABLE product_clicks (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    clicked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(50),  -- 'new', 'top', 'featured', 'search', etc.
    ip_address VARCHAR(45),  -- Optional: for analytics
    user_agent TEXT,  -- Optional: for analytics
    
    INDEX idx_product_clicks_product_id (product_id),
    INDEX idx_product_clicks_user_id (user_id),
    INDEX idx_product_clicks_clicked_at (clicked_at)
);
```

**Pros**: 
- Detailed analytics (timestamp, user, source)
- Can query unique viewers vs total clicks
- Can analyze click patterns over time

**Cons**: 
- More storage required
- Slightly more complex queries

### Option 2: Simple Counter Column
```sql
ALTER TABLE products 
ADD COLUMN view_count INT DEFAULT 0;
```

**Pros**: 
- Simple implementation
- Fast queries

**Cons**: 
- No detailed analytics
- Can't distinguish unique vs repeat viewers
- Lost historical data

**Recommendation**: Use Option 1 (detailed tracking) for better analytics and future features

## Summary

**Root Cause**: Backend missing view tracking infrastructure
- No POST endpoint to receive view events
- DisplayItemsDTO.clickCount returns hardcoded 1.0
- No database storage of click events

**Impact**: All products show "1 views" regardless of actual traffic

**Solution**: Backend team must implement:
1. `POST /api/v1/products/{productId}/view` endpoint
2. Fix DisplayItemsDTO query to return actual click counts
3. Update GET endpoint to return real data from database

**Frontend Status**: ✅ Ready - Just needs backend endpoints to exist

**Estimated Backend Effort**: 4-6 hours
- 2 hours: Implement POST endpoint + database model
- 2 hours: Fix DisplayItemsDTO query
- 1 hour: Update GET endpoint
- 1 hour: Testing and documentation

## References
- Swagger API: https://dev.globoexpats.com/swagger-ui/index.html#/
- Frontend Analytics: `lib/analytics.ts`
- Next.js API Route: `app/api/analytics/event/route.ts`
- Dashboard: `app/expat/dashboard/page.tsx` (lines 218-225)
- Related Docs: `Docs/BACKEND_API_INVESTIGATION.md`, `Docs/PERFORMANCE_AND_CLICKCOUNT_FIX.md`
