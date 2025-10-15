# Backend API Reference Guide

**Backend URL:** http://10.123.22.21:8081  
**API Base Path:** /api/v1/  
**Documentation:** http://10.123.22.21:8081/swagger-ui/index.html#/  
**Authentication:** Bearer Token (JWT)

---

## Quick Reference: All API Endpoints

### Legend

- ✅ **Integrated** - Implemented in frontend `/lib/api.ts`
- ⚠️ **Partial** - Partially implemented or limited use
- ❌ **Missing** - Backend exists but no frontend integration
- 🔴 **Critical** - High priority for implementation

---

## 1. Products Controller

_APIs for retrieving and filtering product listings_

### Review & Rating (❌ Missing - 🔴 Critical)

```http
PUT /api/v1/edit-review/{productId}
Summary: Update or create a product review
Auth: Required
Body: {
  "rating": number (1-5),
  "title": string,
  "comment": string
}
Response: ReviewDTO
Status: ❌ Not Implemented
Priority: 🔴 HIGH
```

```http
POST /api/v1/rate
Summary: Rate a product
Auth: Required
Body: {
  "productId": number,
  "rating": number (1-5)
}
Response: Success message
Status: ❌ Not Implemented
Priority: 🔴 HIGH
```

```http
POST /api/v1/post-review
Summary: Post a product review
Auth: Required
Body: PostReviewDTO {
  "productId": number,
  "rating": number,
  "title": string,
  "comment": string
}
Response: ReviewDTO
Status: ❌ Not Implemented
Priority: 🔴 HIGH
```

### Product Management

```http
POST /api/v1/products/post-product
Summary: Create a new product listing
Auth: Required
Content-Type: multipart/form-data
Body: {
  "product": JSON string {
    "productName": string,
    "categoryId": number,
    "condition": string,
    "location": string,
    "productDescription": string,
    "currency": string,
    "askingPrice": number,
    "originalPrice": number,
    "productWarranty": string
  },
  "images": File[] (max 5)
}
Response: {
  "productId": number,
  "imageIds": number[]
}
Status: ✅ Implemented in api.ts:285
Frontend: /app/sell/page.tsx
```

```http
PATCH /api/v1/products/update/{productId}
Summary: Update an existing product
Auth: Required
Body: Partial product data
Response: Updated product
Status: ⚠️ Partial (method exists but limited use)
Location: api.ts:389
```

```http
PATCH /api/v1/products/update-images
Summary: Update multiple product images
Auth: Required
Content-Type: multipart/form-data
Body: {
  "productId": number,
  "images": File[]
}
Response: ImageUpdateResponse
Status: ❌ Not Implemented
Priority: 🟡 MEDIUM
```

### Product Retrieval

```http
GET /api/v1/products/get-all-products?page={n}
Summary: Get all products with pagination, sorted by creation date
Auth: Optional
Query Params:
  - page: number (default 0)
  - size: number (default 10)
Response: PageProductResponseDTO {
  "content": ProductResponseDTO[],
  "totalElements": number,
  "totalPages": number,
  "number": number,
  "size": number
}
Status: ✅ Implemented in api.ts:350
Frontend: /app/browse/page.tsx
```

```http
GET /api/v1/products/categories
Summary: Get all product categories
Auth: Optional
Response: CategoriesDTO[] {
  "categoryId": number,
  "categoryName": string
}
Status: ✅ Implemented in api.ts:340
Frontend: /app/sell/page.tsx, /app/browse/page.tsx
```

### Display Items

```http
GET /api/v1/displayItem/top-picks?page={n}&size={n}
Summary: Get featured/top pick products
Auth: Optional
Query Params:
  - page: number (default 0)
  - size: number (default 12)
Response: Page<DisplayItemsDTO>
Status: ✅ Implemented in api.ts:360
Frontend: /app/page.tsx (home)
```

```http
GET /api/v1/displayItem/newest?page={n}&size={n}
Summary: Get newest product listings
Auth: Optional
Query Params:
  - page: number (default 0)
  - size: number (default 12)
Response: Page<DisplayItemsDTO>
Status: ✅ Implemented in api.ts:370
Frontend: /app/page.tsx (home)
```

```http
GET /api/v1/displayItem/itemDetails/{productId}
Summary: Get detailed product information
Auth: Optional
Path Params:
  - productId: number
Response: ProductResponseDTO {
  "productId": number,
  "productName": string,
  "productDescription": string,
  "price": number,
  "originalPrice": number,
  "images": ProductImageDTO[],
  "category": CategoriesDTO,
  "condition": string,
  "location": string,
  "warranty": string,
  "seller": {...},
  "reviews": ReviewDTO[],
  "averageRating": number,
  "totalReviews": number
}
Status: ✅ Implemented in api.ts:379
Frontend: /app/product/[id]/page.tsx
```

```http
POST /api/v1/displayItem/filter
Summary: Filter products by criteria
Auth: Optional
Body: HomePageFilterDTO {
  "categories": string[],
  "minPrice": number,
  "maxPrice": number,
  "condition": string,
  "location": string,
  "searchQuery": string
}
Response: Page<DisplayItemsDTO>
Status: ⚠️ Limited use
Priority: 🟡 MEDIUM (enhance filtering UI)
```

---

## 2. Authentication Controller

_Endpoints for user authentication and registration_

```http
POST /api/v1/auth/register
Summary: Register new user account
Auth: Not required
Body: RegisterDTO {
  "firstName": string,
  "lastName": string,
  "emailAddress": string,
  "password": string (min 8 chars),
  "agreeToTerms": boolean,
  "agreeToPrivacyPolicy": boolean
}
Response: 201 Created with message
Status: ✅ Implemented in auth-service.ts
Frontend: /app/register/page.tsx
```

```http
POST /api/v1/auth/login
Summary: Authenticate user and get JWT token
Auth: Not required
Body: AuthRequestDTO {
  "email": string,
  "password": string
}
Response: AuthenticationResponse {
  "token": string,
  "email": string,
  "role": string
}
Status: ✅ Implemented in auth-service.ts
Frontend: /app/login/page.tsx
```

```http
POST /api/v1/auth/logout
Summary: End user session
Auth: Required
Response: Success message
Status: ✅ Implemented in api.ts:531
Frontend: auth-provider.tsx
```

```http
POST /api/v1/email/sendOTP?organizationalEmail={email}
Summary: Send OTP to organization email for verification
Auth: Required
Query Params:
  - organizationalEmail: string
Response: Success message with OTP sent confirmation
Status: ✅ Implemented in api.ts:493
Frontend: /app/account/verification/page.tsx
```

```http
POST /api/v1/email/verifyOTP?organizationalEmail={email}&otp={code}&userRoles={role}
Summary: Verify organization email with OTP code
Auth: Required
Query Params:
  - organizationalEmail: string
  - otp: string (6 digits)
  - userRoles: string (SELLER | USER)
Response: Verification confirmation
Status: ✅ Implemented in api.ts:504
Frontend: /app/account/verification/page.tsx
```

---

## 3. OAuth2 Controller

_OAuth2 Authentication Endpoints_

```http
POST /api/v1/oauth2/exchange?auth_code={code}
Summary: Exchange Google OAuth authorization code for JWT
Auth: Not required
Query Params:
  - auth_code: string (from Google OAuth)
Response: AuthenticationResponse {
  "token": string,
  "email": string,
  "role": string
}
Status: ✅ Implemented in api.ts:542
Frontend: /app/login/page.tsx (Google Sign-In)
```

---

## 4. Checkout Controller ❌ CRITICAL GAP

_Operations related to checkout process_

**⚠️ CRITICAL: These endpoints exist in backend but are NOT integrated in frontend**

```http
POST /api/v1/checkout/review-order
Summary: Review order before final purchase
Auth: Required
Body: ReviewOrderDTO {
  "cartItems": Array<{
    "productId": number,
    "quantity": number
  }>,
  "shippingAddress": {...},
  "paymentMethod": string
}
Response: CheckOutResponseDTO {
  "orderId": string,
  "subtotal": number,
  "shippingCost": number,
  "tax": number,
  "total": number,
  "estimatedDelivery": string
}
Status: ❌ Not Implemented
Priority: 🔴 CRITICAL
Action Required: See CRITICAL_IMPLEMENTATION_GUIDE.md
```

```http
POST /api/v1/checkout/buy
Summary: Complete purchase transaction
Auth: Required
Body: BuyDetailsDTO {
  "productId": number,
  "quantity": number,
  "shippingAddress": {...},
  "paymentMethod": string,
  "paymentDetails": {...}
}
Response: {
  "orderId": string,
  "status": string,
  "paymentUrl": string (for mobile money),
  "confirmationNumber": string,
  "totalAmount": number
}
Status: ❌ Not Implemented
Priority: 🔴 CRITICAL
```

```http
POST /api/v1/checkout/confirm
Summary: Confirm order after payment
Auth: Required
Body: {
  "orderId": string
}
Response: OrderSummaryDTO
Status: ❌ Not Implemented
Priority: 🔴 CRITICAL
```

---

## 5. User Management Controller

_Endpoints for user management_

```http
GET /api/v1/userManagement/user-details
Summary: Get current authenticated user's details
Auth: Required
Response: GetUserDetailsDTO {
  "firstName": string,
  "lastName": string,
  "loggingEmail": string,
  "organizationalEmail": string,
  "position": string,
  "aboutMe": string,
  "phoneNumber": string,
  "organization": string,
  "location": string,
  "verificationStatus": "VERIFIED" | "PENDING" | "REJECTED",
  "passportVerificationStatus": "VERIFIED" | "PENDING" | "REJECTED",
  "addressVerificationStatus": "VERIFIED" | "PENDING" | "REJECTED",
  "roles": Role[]
}
Status: ✅ Implemented in api.ts:415
Frontend: auth-provider.tsx, /app/account/page.tsx
```

```http
PUT /api/v1/userManagement/profile
Summary: Update user profile information
Auth: Required
Body: ProfileInformationDTO {
  "firstName": string,
  "lastName": string,
  "phoneNumber": string,
  "organization": string,
  "position": string,
  "location": string,
  "aboutMe": string
}
Response: Updated user details
Status: ⚠️ Partial implementation
Location: api.ts:452 (generic update method exists)
Priority: 🟡 MEDIUM (create dedicated profile update)
```

```http
POST /api/v1/userManagement/verification-documents
Summary: Upload verification documents (passport, address proof)
Auth: Required
Content-Type: multipart/form-data
Body: {
  "documentType": "PASSPORT" | "ADDRESS_PROOF",
  "file": File
}
Response: Upload confirmation
Status: ❌ Not Implemented
Priority: 🟡 MEDIUM
```

```http
GET /api/v1/userManagement/verification-status
Summary: Get detailed verification status
Auth: Required
Response: {
  "overallStatus": string,
  "passportStatus": string,
  "addressStatus": string,
  "emailStatus": string,
  "pendingActions": string[]
}
Status: ❌ Not Implemented (status is part of user-details)
Priority: 🟢 LOW
```

```http
DELETE /api/v1/userManagement/delete-verification/{verificationDocUrl}
Summary: Delete uploaded verification document
Auth: Required
Path Params:
  - verificationDocUrl: string (encoded URL)
Response: Deletion confirmation
Status: ❌ Not Implemented
Priority: 🟢 LOW
```

---

## 6. Cart Management (✅ Fully Integrated)

```http
POST /api/v1/cart/add
Summary: Add item to shopping cart
Auth: Required
Body: AddToCartRequestDTO {
  "productId": number,
  "quantity": number
}
Response: Cart item added confirmation
Status: ✅ Implemented in api.ts:651
Frontend: cart-provider.tsx
```

```http
GET /api/v1/cart/User
Summary: Get current user's cart
Auth: Required
Response: CartDTO {
  "cartId": number,
  "userId": number,
  "items": CartItemDTO[],
  "subtotal": number,
  "totalItems": number
}
Status: ✅ Implemented in api.ts:662
Frontend: cart-provider.tsx, /app/cart/page.tsx
```

```http
PUT /api/v1/cart/item/{cartId}
Summary: Update cart item quantity
Auth: Required
Path Params:
  - cartId: number
Body: {
  "productId": number,
  "quantity": number
}
Response: Updated cart item
Status: ✅ Implemented in api.ts:673
Frontend: cart-provider.tsx
```

```http
DELETE /api/v1/cart/item/{itemId}
Summary: Remove item from cart
Auth: Required
Path Params:
  - itemId: number
Response: Deletion confirmation
Status: ✅ Implemented in api.ts:689
Frontend: cart-provider.tsx
```

```http
DELETE /api/v1/cart/clear
Summary: Clear all items from cart
Auth: Required
Response: Cart cleared confirmation
Status: ✅ Implemented in api.ts:699
Frontend: cart-provider.tsx
```

---

## 7. Orders Management

```http
GET /api/v1/orders
Summary: Get user's order history
Auth: Required
Response: OrderSummaryDTO[]
Status: ✅ Implemented in api.ts:603
Frontend: /app/account/orders/page.tsx (if exists)
Priority: 🟡 Verify frontend implementation
```

```http
POST /api/v1/orders
Summary: Create new order
Auth: Required
Body: Order creation data
Response: Created order
Status: ✅ Implemented in api.ts:612
Priority: ⚠️ May need update to use checkout flow
```

```http
GET /api/v1/orders/{orderId}
Summary: Get specific order details
Auth: Required
Path Params:
  - orderId: string
Response: Detailed order information
Status: ✅ Implemented in api.ts:624
Frontend: /app/checkout/success/page.tsx
```

```http
PATCH /api/v1/orders/{orderId}/status
Summary: Update order status
Auth: Required (Admin/Seller)
Path Params:
  - orderId: string
Body: {
  "status": string
}
Response: Updated order
Status: ✅ Implemented in api.ts:634
Frontend: Admin/Seller dashboard (if exists)
```

---

## 8. Messaging System

```http
GET /api/v1/messages/conversations
Summary: Get user's conversation list
Auth: Required
Response: Conversation[]
Status: ✅ Implemented in api.ts:556
Frontend: /app/messages/page.tsx
```

```http
GET /api/v1/messages/conversations/{conversationId}
Summary: Get messages in a conversation
Auth: Required
Path Params:
  - conversationId: string
Response: Message[]
Status: ✅ Implemented in api.ts:565
Frontend: /app/messages/[id]/page.tsx
```

```http
POST /api/v1/messages/conversations/{conversationId}
Summary: Send message in conversation
Auth: Required
Path Params:
  - conversationId: string
Body: {
  "message": string
}
Response: Sent message
Status: ✅ Implemented in api.ts:575
Frontend: /app/messages/[id]/page.tsx
```

```http
POST /api/v1/messages/conversations
Summary: Create new conversation
Auth: Required
Body: {
  "recipientId": string,
  "initialMessage": string
}
Response: New conversation
Status: ✅ Implemented in api.ts:588
Frontend: Product pages (Contact Seller)
```

---

## Implementation Priority Matrix

### 🔴 CRITICAL (Implement Immediately)

1. **Checkout API Integration** - Complete purchase flow broken
2. **Product Reviews/Ratings** - Core marketplace feature missing

### 🟡 MEDIUM (Next Sprint)

3. **Product Image Updates** - Seller experience enhancement
4. **Verification Documents Upload** - Complete verification flow
5. **Enhanced Product Filtering** - Improve search experience
6. **Profile Update Dedicated Endpoint** - Better UX

### 🟢 LOW (Future Enhancement)

7. **Verification Status Endpoint** - Redundant with user-details
8. **Delete Verification Document** - Admin feature
9. **Advanced Messaging Features** - WebSocket, notifications

---

## Error Codes Reference

Common HTTP status codes from backend:

- **200 OK** - Success
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid input data
- **401 Unauthorized** - Missing or invalid auth token
- **404 Not Found** - Resource not found or user not verified
- **409 Conflict** - Duplicate resource (e.g., email already exists)
- **500 Internal Server Error** - Server-side error

---

## Testing Endpoints

### Using curl

```bash
# Set your token
TOKEN="your_jwt_token_here"

# Test product listing
curl -X GET "http://10.123.22.21:8081/api/v1/products/get-all-products?page=0" \
  -H "Content-Type: application/json"

# Test authenticated endpoint
curl -X GET "http://10.123.22.21:8081/api/v1/userManagement/user-details" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Test cart add
curl -X POST "http://10.123.22.21:8081/api/v1/cart/add" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 1}'
```

### Using Swagger UI

Navigate to: http://10.123.22.21:8081/swagger-ui/index.html#/

1. Click "Authorize" button
2. Enter: `Bearer your_token_here`
3. Click "Authorize"
4. Test endpoints directly in browser

---

## Additional Resources

- **Full Platform Audit**: See `/Docs/PLATFORM_AUDIT_2025.md`
- **Checkout Implementation Guide**: See `/Docs/CRITICAL_IMPLEMENTATION_GUIDE.md`
- **Frontend API Client**: `/lib/api.ts`
- **Backend Swagger**: http://10.123.22.21:8081/swagger-ui/index.html#/

---

**Last Updated:** 2025-10-14  
**Maintainer:** Development Team  
**Next Review:** After major backend changes
