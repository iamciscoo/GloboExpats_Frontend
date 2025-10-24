# 🛒 Cart Debugging Guide - Step by Step

## The Problem

- ✅ Toast shows "Added to cart"
- ❌ Cart icon count doesn't increment
- ❌ Cart sidebar shows empty
- ❌ Cart page shows empty

## Root Cause Analysis

This happens when:

1. **Backend API call fails** (but error is caught silently)
2. **User not authenticated** (token missing)
3. **Account not verified** (backend rejects cart operations)
4. **Response data mismatch** (backend returns unexpected format)

## Step-by-Step Debugging

### Step 1: Open Browser DevTools

1. Press `F12` or `Ctrl+Shift+I`
2. Go to **Console** tab
3. Clear console (`Ctrl+L`)

### Step 2: Try Adding Item to Cart

Click "Add to Cart" on any product

### Step 3: Check Console Logs

You should see these logs in order:

#### ✅ Expected Success Flow:

```
🛒 Adding to cart - ProductId: 123
🛒 Cart Provider - Adding item: { itemId: "123", productId: 123, ... }
✅ Calling cartService.addToCart with productId: 123
📦 [CART-SERVICE] Adding to cart: { productId: 123, quantity: 1 }
🔑 [API] Adding to cart - Auth token present: true
🔑 [API] Request headers: { Authorization: "Bearer ..." }
[API] POST http://localhost:8080/api/v1/cart/add
📦 [CART-SERVICE] Add to cart response: { success: true, data: {...} }
📊 Add to cart result: { success: true }
✅ Item added to backend, fetching updated cart...
📦 [CART-SERVICE] Fetching cart from backend...
[API] GET http://localhost:8080/api/v1/cart/User
📦 [CART-SERVICE] Get cart response: { success: true, data: { items: [...] } }
📦 [CART-SERVICE] Processed cart data: { itemCount: 1, items: [...] }
📊 Backend cart after add: { totalItems: 1, items: [...] }
📊 Frontend cart after conversion: { totalItems: 1, items: [...] }
✅ Cart updated successfully: { totalItems: 1, items: [...] }
```

#### ❌ Common Error Patterns:

**Pattern 1: Not Authenticated**

```
🛒 Adding to cart - ProductId: 123
🔑 [API] Adding to cart - Auth token present: false
[API] Response: status=401
❌ [CART-SERVICE] Exception adding to cart: Error: Authentication required
❌ Error adding to cart: Error: Please verify your account...
```

**Pattern 2: Account Not Verified**

```
🔑 [API] Adding to cart - Auth token present: true
[API] Response: status=404
[API] Buyer profile not found or account not verified
❌ [CART-SERVICE] Exception adding to cart: Error: Account verification required
❌ Error adding to cart: Error: Please verify your account...
```

**Pattern 3: Backend Error**

```
🔑 [API] Adding to cart - Auth token present: true
[API] Response: status=500
❌ [CART-SERVICE] Exception adding to cart: Error: Internal server error
```

**Pattern 4: Silent Success (Fake Success)**

```
✅ Calling cartService.addToCart with productId: 123
📊 Add to cart result: { success: true }
✅ Item added to backend, fetching updated cart...
📦 [CART-SERVICE] Processed cart data: { itemCount: 0, items: [] }
📊 Backend cart after add: { totalItems: 0, items: [] }  ← PROBLEM HERE!
```

### Step 4: Check Network Tab

1. Go to **Network** tab in DevTools
2. Filter by **Fetch/XHR**
3. Look for these requests:

#### Request 1: Add to Cart

```
POST http://localhost:8080/api/v1/cart/add
Status: 200 (should be successful)

Request Payload:
{
  "productId": 123,
  "quantity": 1
}

Response:
{
  "success": true,
  "data": { ... }
}
```

#### Request 2: Get Cart

```
GET http://localhost:8080/api/v1/cart/User
Status: 200

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "cartId": 1,
        "productId": 123,
        "quantity": 1,
        "productName": "...",
        "price": 1000,
        "currency": "TZS",
        "subtotal": 1000
      }
    ],
    "totalItems": 1,
    "totalPrice": 1000,
    "currency": "TZS"
  }
}
```

### Step 5: Identify the Issue

| What You See                 | Problem                     | Solution                      |
| ---------------------------- | --------------------------- | ----------------------------- |
| `Auth token present: false`  | Not logged in               | Log in first                  |
| Status 401                   | Not authenticated           | Check login status, re-login  |
| Status 404 + "Buyer profile" | Account not verified        | Go to Account → Verification  |
| Status 404 + "No endpoint"   | Backend API not implemented | Backend needs cart endpoints  |
| Status 500                   | Backend error               | Check backend logs            |
| Success but cart still empty | Response format issue       | Check response data structure |
| No network request at all    | Frontend error              | Check console for JS errors   |

## Common Solutions

### Solution 1: User Not Logged In

```
1. Go to /login
2. Log in with your credentials
3. Try adding to cart again
```

### Solution 2: Account Not Verified

```
1. Go to /account/verification
2. Verify your email address
3. Complete buyer profile
4. Try adding to cart again
```

### Solution 3: Backend Not Running

```
1. Check if backend is running on http://localhost:8080
2. Check .env.local file: NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
3. Start backend server
4. Try adding to cart again
```

### Solution 4: CORS Issue

```
Look for errors like:
"Access to fetch at 'http://localhost:8080/api/v1/cart/add'
from origin 'http://localhost:3000' has been blocked by CORS policy"

Solution: Backend needs to allow CORS from http://localhost:3000
```

### Solution 5: Wrong Response Format

Check if backend returns:

```json
{
  "success": true,
  "data": {
    "items": [...],
    "totalItems": 1,
    "totalPrice": 1000,
    "currency": "TZS"
  }
}
```

NOT:

```json
{
  "items": [...],  ← Missing "data" wrapper
  "totalItems": 1
}
```

## What To Report

When reporting the issue, include:

1. **Console Logs**: Copy all logs from console
2. **Network Requests**: Screenshot of Network tab showing:
   - Request URL
   - Status code
   - Request payload
   - Response data
3. **User State**:
   - Are you logged in?
   - Is your account verified?
   - What's your user role?
4. **Error Messages**: Any toast messages shown

## Next Steps

1. Follow steps 1-4 above
2. Identify which pattern matches your logs
3. Apply the appropriate solution
4. If still not working, share the console logs and network details

The extensive logging I added will tell us exactly where the flow breaks!
