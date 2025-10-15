# Dashboard "My Listings" - Deep Dive Investigation

**User:** Francis Mwambene  
**Issue:** Still no listings showing after fix  
**Date:** 2025-10-14

---

## Investigation Steps

### 1. Check Browser Console

Open browser DevTools (F12) and look for these logs:

```javascript
🔍 Fetching products for user: ...
📦 Total products fetched: X
🔎 Filtering products for user: { userFullName: "Francis Mwambene", ... }
Product 1: { productName: "...", sellerName: "???" }
```

**Key Question:** What is the `sellerName` value in the products?

### 2. Possible Scenarios

#### Scenario A: No Products in Database

```
📦 Total products fetched: 0
⚠️ No products found in database!
```

**Solution:** Create a test product via `/sell` page

#### Scenario B: Name Mismatch

```
Product 1: { sellerName: "Francis" }     // ❌ Only first name
Your name: "Francis Mwambene"            // Full name
```

**Issue:** Backend only stores first name, not full name

#### Scenario C: Backend Not Setting sellerName

```
Product 1: { sellerId: 123, sellerName: null }  // ❌ No name
```

**Issue:** Backend doesn't populate sellerName field

#### Scenario D: Different User Created Products

```
Product 1: { sellerName: "John Doe" }
Product 2: { sellerName: "Jane Smith" }
Your name: "Francis Mwambene"
```

**Issue:** Products belong to other users

---

## Debug Commands

### Option 1: Run Debug Script

```bash
cd /home/cisco/Documents/ExpatFrontend-main
node scripts/debug-listings.js
```

Enter your JWT token when prompted (from localStorage: `expat_auth_token`)

### Option 2: Manual API Test

```bash
# Get your token
TOKEN="your_jwt_token_here"

# Test 1: Get your user details
curl -X GET "http://10.123.22.21:8081/api/v1/userManagement/user-details" \
  -H "Authorization: Bearer $TOKEN"

# Test 2: Get all products
curl -X GET "http://10.123.22.21:8081/api/v1/products/get-all-products?page=0" \
  -H "Authorization: Bearer $TOKEN"
```

### Option 3: Browser Console Direct Test

Open DevTools Console and paste:

```javascript
// Get token
const token = localStorage.getItem('expat_auth_token')

// Fetch user details
fetch('http://10.123.22.21:8081/api/v1/userManagement/user-details', {
  headers: { Authorization: `Bearer ${token}` },
})
  .then((r) => r.json())
  .then((user) => {
    console.log('User:', user)
    const fullName = `${user.firstName} ${user.lastName}`
    console.log('Full Name:', fullName)

    // Fetch products
    return fetch('http://10.123.22.21:8081/api/v1/products/get-all-products?page=0', {
      headers: { Authorization: `Bearer ${token}` },
    })
  })
  .then((r) => r.json())
  .then((data) => {
    const products = data.data?.content || data.content || []
    console.log('Total Products:', products.length)
    console.log(
      'Products:',
      products.map((p) => ({
        id: p.productId,
        name: p.productName,
        seller: p.sellerName,
        sellerId: p.sellerId,
      }))
    )
  })
```

---

## Expected vs Actual

### What SHOULD Happen

1. User creates product via `/sell`
2. Backend receives:
   - JWT token with user ID
   - Product data (name, price, images, etc.)
3. Backend:
   - Extracts user ID from JWT
   - Creates product with `sellerId` = user's numeric ID
   - **Populates `sellerName` with user's full name from database**
4. Frontend fetches products
5. Matches `product.sellerName` === `user.firstName + user.lastName`

### What MIGHT Be Happening

**Hypothesis 1:** Backend doesn't populate `sellerName`

```json
{
  "productId": 123,
  "sellerId": 456, // ← Set correctly
  "sellerName": null // ← NOT SET! ❌
}
```

**Hypothesis 2:** Backend uses different name format

```json
{
  "sellerName": "Francis"  // Only first name
}
// vs
{
  "sellerName": "francis mwambene"  // lowercase
}
// vs
{
  "sellerName": "Mwambene, Francis"  // Last, First
}
```

**Hypothesis 3:** Products were created before verification

- User created products while not verified
- Backend assigned different user ID
- Now verified user has different ID

---

## Solutions by Scenario

### If sellerName is NULL

**Backend Fix Required:**

```java
// In Product creation endpoint
Product product = new Product();
product.setSellerId(currentUser.getId());
product.setSellerName(currentUser.getFirstName() + " " + currentUser.getLastName()); // ← ADD THIS
```

### If sellerName Format Differs

**Frontend Fix:**

```typescript
// Try multiple matching strategies
const matches =
  product.sellerName === userFullName ||
  product.sellerName === user.firstName ||
  product.sellerName?.toLowerCase() === userFullName.toLowerCase() ||
  product.sellerName === `${user.lastName}, ${user.firstName}`
```

### If Using Numeric sellerId

**Best Solution - Use sellerId instead:**

1. **Get user's numeric ID from backend:**

```typescript
const userDetails = await apiClient.getUserDetails()
const numericUserId = userDetails.userId || userDetails.id // Backend user ID
```

2. **Match by sellerId:**

```typescript
const userListings = allProducts.filter((product) => product.sellerId === numericUserId)
```

---

## Action Items

1. ✅ **Run debug script** to see actual data
2. ⏳ **Check browser console** logs during dashboard load
3. ⏳ **Verify backend** is setting sellerName correctly
4. ⏳ **Check user table** in backend database - what's the actual user ID?
5. ⏳ **Compare** product sellerId with user ID from JWT

---

## If Still Not Working

### Nuclear Option: Backend Endpoint

Request backend team to add:

```
GET /api/v1/products/my-products
Authorization: Bearer {token}

Response:
{
  "content": [ /* only this user's products */ ]
}
```

This eliminates all matching issues - backend does the filtering.

---

## Next Steps

1. Run the debug script: `node scripts/debug-listings.js`
2. Share the output with me
3. Based on output, we'll know exactly what's wrong

**The debug script will tell us:**

- ✅ Your exact user name
- ✅ What products exist
- ✅ What seller names are in those products
- ✅ Whether any matches should happen
