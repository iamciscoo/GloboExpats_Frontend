# GloboExpat API Quick Reference

**Backend Base URL:** `http://10.123.22.21:8081`  
**API Version:** `/api/v1/`  
**Authentication:** Bearer token (JWT)

---

## Quick Start

```typescript
import { apiClient } from '@/lib/api'

// All requests automatically include auth token if user is logged in
const products = await apiClient.getProducts()
const user = await apiClient.getUserDetails()
```

---

## Authentication

### Register New User
```typescript
POST /api/v1/auth/register

// Request Body
{
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePass123!",
  "emailAddress": "john.doe@example.com",
  "agreeToTerms": true,
  "agreeToPrivacyPolicy": true
}

// Response: 201 Created
"Registration successful"

// Frontend Usage
await apiClient.register(userData)
```

### Login
```typescript
POST /api/v1/auth/login

// Request Body
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}

// Response: 200 OK
{
  "email": "john.doe@example.com",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "role": "USER"
}

// Frontend Usage
await apiClient.login(email, password)
```

### Google OAuth
```typescript
// Step 1: Redirect to Google
GET /api/v1/oauth2/login/google
// User will be redirected to Google for authentication

// Step 2: Exchange auth code for token
POST /api/v1/oauth2/exchange?auth_code={code}

// Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@gmail.com",
  "profileImageUrl": "https://..."
}

// Frontend Usage
await apiClient.exchangeOAuthCode(authCode)
```

### Logout
```typescript
POST /api/v1/auth/logout
Authorization: Bearer {token}

// Response: 200 OK
"Logged out successfully"

// Frontend Usage
await apiClient.logout()
```

---

## User Management

### Get Current User Details
```typescript
GET /api/v1/userManagement/user-details
Authorization: Bearer {token}

// Response: 200 OK
{
  "firstName": "John",
  "lastName": "Doe",
  "loggingEmail": "john.doe@example.com",
  "organizationalEmail": "john.doe@company.com",
  "position": "Software Engineer",
  "aboutMe": "Expat software engineer...",
  "phoneNumber": "+255123456789",
  "organization": "Tech Company",
  "location": "Dar es Salaam, TZ",
  "verificationStatus": "VERIFIED",
  "passportVerificationStatus": "VERIFIED",
  "addressVerificationStatus": "VERIFIED",
  "roles": [
    {
      "roleId": 1,
      "roleName": "USER"
    }
  ]
}

// Frontend Usage
const user = await apiClient.getUserDetails()
```

### Update User Profile
```typescript
PUT /api/v1/userManagement/update-user
Authorization: Bearer {token}

// Request Body
{
  "firstName": "John",
  "lastName": "Doe",
  "position": "Senior Engineer",
  "aboutMe": "Updated bio...",
  "phoneNumber": "+255987654321",
  "location": "Nairobi, KE"
}

// Response: 200 OK
{ "message": "Profile updated successfully" }

// Frontend Usage
await apiClient.updateUser(userId, updates)
```

### Change Password
```typescript
POST /api/v1/userManagement/change-password
Authorization: Bearer {token}

// Request Body
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}

// Response: 200 OK
"Password changed successfully"
```

---

## Email Verification (OTP)

### Send OTP
```typescript
POST /api/v1/email/sendOTP?organizationalEmail={email}
Authorization: Bearer {token}

// Example
POST /api/v1/email/sendOTP?organizationalEmail=john.doe@company.com

// Response: 200 OK
"OTP sent successfully"

// Frontend Usage
await apiClient.sendEmailOtp('john.doe@company.com')
```

### Verify OTP
```typescript
POST /api/v1/email/verifyOTP?organizationalEmail={email}&otp={code}&userRoles={role}
Authorization: Bearer {token}

// Example
POST /api/v1/email/verifyOTP?organizationalEmail=john.doe@company.com&otp=123456&userRoles=SELLER

// Response: 200 OK
"Email verified successfully"

// Frontend Usage
await apiClient.verifyEmailOtp('john.doe@company.com', '123456', 'SELLER')
```

---

## Products

### Create Product
```typescript
POST /api/v1/products/post-product
Authorization: Bearer {token}
Content-Type: multipart/form-data

// Form Data
product: {
  "productName": "MacBook Pro 2021",
  "categoryId": 3,
  "condition": "NEW",
  "location": "Dar es Salaam, TZ",
  "productDescription": "Excellent condition MacBook Pro...",
  "currency": "USD",
  "askingPrice": 1200,
  "originalPrice": 2000,
  "productWarranty": "1 year manufacturer warranty"
}
images: [file1.jpg, file2.jpg, file3.jpg]

// Response: 200 OK
{
  "productId": 123,
  "imageIds": [456, 457, 458]
}

// Frontend Usage
await apiClient.createProduct(productData, imageFiles)
```

### Get All Products (Paginated)
```typescript
GET /api/v1/products/get-all-products?page={n}&size={m}

// Example
GET /api/v1/products/get-all-products?page=0&size=20

// Response: 200 OK
{
  "content": [
    {
      "productId": 123,
      "productName": "MacBook Pro 2021",
      "categoryId": 3,
      "categoryName": "Electronics & Tech",
      "condition": "NEW",
      "location": "Dar es Salaam, TZ",
      "productDescription": "...",
      "currency": "USD",
      "askingPrice": 1200,
      "originalPrice": 2000,
      "seller": {
        "sellerId": 1,
        "firstName": "John",
        "lastName": "Doe"
      },
      "images": [
        {
          "imageId": 456,
          "imageUrl": "https://..."
        }
      ],
      "createdAt": "2025-10-15T12:00:00"
    }
  ],
  "totalElements": 150,
  "totalPages": 8,
  "number": 0,
  "size": 20
}

// Frontend Usage
await apiClient.getAllProducts(pageNumber)
```

### Get Product Details
```typescript
GET /api/v1/displayItem/itemDetails/{productId}

// Example
GET /api/v1/displayItem/itemDetails/123

// Response: 200 OK
{
  "productId": 123,
  "productName": "MacBook Pro 2021",
  "categoryId": 3,
  "categoryName": "Electronics & Tech",
  "condition": "NEW",
  "location": "Dar es Salaam, TZ",
  "productDescription": "Detailed description...",
  "currency": "USD",
  "askingPrice": 1200,
  "originalPrice": 2000,
  "productWarranty": "1 year manufacturer warranty",
  "seller": {
    "sellerId": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+255123456789",
    "location": "Dar es Salaam, TZ"
  },
  "images": [
    {
      "imageId": 456,
      "imageUrl": "https://...",
      "isMain": true
    }
  ],
  "reviews": [
    {
      "reviewId": 1,
      "rating": 5,
      "comment": "Excellent product!",
      "reviewerName": "Jane Smith"
    }
  ],
  "averageRating": 4.8,
  "totalReviews": 15,
  "createdAt": "2025-10-15T12:00:00"
}

// Frontend Usage
await apiClient.getProductDetails(productId)
```

### Update Product
```typescript
PATCH /api/v1/products/update/{productId}
Authorization: Bearer {token}
Content-Type: multipart/form-data (if images) or application/json

// Request Body (JSON for text updates)
{
  "productName": "Updated MacBook Pro 2021",
  "askingPrice": 1100,
  "productDescription": "Updated description..."
}

// OR with images (FormData)
product: { "productName": "...", "askingPrice": 1100 }
images: [newImage1.jpg, newImage2.jpg]

// Query params for image deletion
?imageIds=456&imageIds=457

// Response: 200 OK
{ "message": "Product updated successfully" }

// Frontend Usage
await apiClient.updateProduct(productId, updates, newImages, imageIdsToRemove)
```

### Delete Product
```typescript
DELETE /api/v1/products/delete/{productId}
Authorization: Bearer {token}

// Response: 200 OK
"Product deleted successfully"

// Frontend Usage
await apiClient.deleteProduct(productId)
```

### Get Categories
```typescript
GET /api/v1/products/categories

// Response: 200 OK
[
  { "categoryId": 1, "categoryName": "Automotive" },
  { "categoryId": 2, "categoryName": "Home & Furniture" },
  { "categoryId": 3, "categoryName": "Electronics & Tech" },
  { "categoryId": 4, "categoryName": "Games & Toys" },
  { "categoryId": 5, "categoryName": "Fashion & Style" },
  { "categoryId": 6, "categoryName": "Fitness & Sports" },
  { "categoryId": 7, "categoryName": "Books & Media" },
  { "categoryId": 8, "categoryName": "Arts & Crafts" }
]

// Frontend Usage
const categories = await apiClient.getCategories()
```

### Filter Products
```typescript
POST /api/v1/displayItem/filter?{query_params}

// Query Parameters
categoryIds=1&categoryIds=3       // Multiple category IDs
minPrice=100                      // Minimum price
maxPrice=1000                     // Maximum price
conditionFilter=NEW               // NEW, USED, LIKE_NEW
priceSort=ASC                     // ASC or DESC
timeFilter=LAST_7_DAYS            // Date filter
page=0                            // Page number
size=20                           // Page size

// Example
POST /api/v1/displayItem/filter?categoryIds=3&minPrice=500&maxPrice=2000&page=0&size=20

// Response: Same structure as get-all-products

// Frontend Usage
await apiClient.filterProducts({
  categoryIds: [3],
  minPrice: 500,
  maxPrice: 2000,
  page: 0,
  size: 20
})
```

### Get Top Picks (Featured)
```typescript
GET /api/v1/displayItem/top-picks?page={n}&size={m}

// Example
GET /api/v1/displayItem/top-picks?page=0&size=12

// Response: Paginated product list

// Frontend Usage
await apiClient.getTopPicks(0, 12)
```

### Get Newest Listings
```typescript
GET /api/v1/displayItem/newest?page={n}&size={m}

// Example
GET /api/v1/displayItem/newest?page=0&size=12

// Response: Paginated product list

// Frontend Usage
await apiClient.getNewestListings(0, 12)
```

---

## Reviews & Ratings

### Post Review
```typescript
POST /api/v1/post-review
Authorization: Bearer {token}

// Request Body
{
  "productId": 123,
  "rating": 5,
  "comment": "Excellent product! Highly recommended."
}

// Response: 200 OK
"Review posted successfully"
```

### Edit Review
```typescript
PUT /api/v1/edit-review/{productId}
Authorization: Bearer {token}

// Request Body
{
  "rating": 4,
  "comment": "Updated review comment"
}

// Response: 200 OK
"Review updated successfully"
```

### Rate Product
```typescript
POST /api/v1/rate
Authorization: Bearer {token}

// Request Body
{
  "productId": 123,
  "rating": 5
}

// Response: 200 OK
"Product rated successfully"
```

---

## Cart Management

### Add to Cart
```typescript
POST /api/v1/cart/add
Authorization: Bearer {token}

// Request Body
{
  "productId": 123,
  "quantity": 1
}

// Response: 200 OK
{
  "cartItemId": 456,
  "message": "Product added to cart"
}

// Frontend Usage
await apiClient.addToCart(productId, quantity)
```

### Get User Cart
```typescript
GET /api/v1/cart/User
Authorization: Bearer {token}

// Response: 200 OK
{
  "cartId": 789,
  "items": [
    {
      "cartItemId": 456,
      "productId": 123,
      "productName": "MacBook Pro 2021",
      "quantity": 1,
      "price": 1200,
      "currency": "USD",
      "imageUrl": "https://...",
      "seller": {
        "sellerId": 1,
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "subtotal": 1200,
  "totalItems": 1
}

// Frontend Usage
const cart = await apiClient.getUserCart()
```

### Update Cart Item
```typescript
PUT /api/v1/cart/item/{cartItemId}
Authorization: Bearer {token}

// Request Body
{
  "productId": 123,
  "quantity": 2
}

// Response: 200 OK
"Cart updated successfully"

// Frontend Usage
await apiClient.updateCartItem(cartItemId, productId, newQuantity)
```

### Remove from Cart
```typescript
DELETE /api/v1/cart/item/{cartItemId}
Authorization: Bearer {token}

// Response: 200 OK
"Item removed from cart"

// Frontend Usage
await apiClient.removeFromCart(cartItemId)
```

### Clear Cart
```typescript
DELETE /api/v1/cart/clear
Authorization: Bearer {token}

// Response: 200 OK
"Cart cleared successfully"

// Frontend Usage
await apiClient.clearCart()
```

---

## Order Management

### Create Order
```typescript
POST /api/v1/order/save
Authorization: Bearer {token}

// Request Body
{
  "items": [
    {
      "productId": 123,
      "quantity": 1,
      "price": 1200
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Dar es Salaam",
    "country": "Tanzania",
    "postalCode": "12345"
  },
  "paymentMethod": "MPESA"
}

// Response: 200 OK
{
  "orderId": 999,
  "orderNumber": "ORD-2025-999",
  "totalAmount": 1200,
  "status": "PENDING"
}

// Frontend Usage
await apiClient.createOrder(orderData)
```

### Review Order Before Checkout
```typescript
GET /api/v1/order/review
Authorization: Bearer {token}

// Response: 200 OK
{
  "items": [...],
  "subtotal": 1200,
  "tax": 120,
  "shippingFee": 50,
  "total": 1370
}
```

### Complete Checkout
```typescript
POST /api/v1/order/checkOut
Authorization: Bearer {token}

// Request Body
{
  "orderId": 999,
  "paymentDetails": {
    "method": "MPESA",
    "phoneNumber": "+255123456789"
  }
}

// Response: 200 OK
{
  "orderId": 999,
  "status": "CONFIRMED",
  "paymentStatus": "COMPLETED",
  "message": "Order placed successfully"
}
```

### Get User Orders
```typescript
GET /api/v1/order/get-orders
Authorization: Bearer {token}

// Response: 200 OK
[
  {
    "orderId": 999,
    "orderNumber": "ORD-2025-999",
    "totalAmount": 1370,
    "status": "CONFIRMED",
    "createdAt": "2025-10-15T12:00:00",
    "items": [...]
  }
]

// Frontend Usage
const orders = await apiClient.getOrders()
```

---

## Messaging

### List Conversations
```typescript
GET /api/v1/messages/conversations
Authorization: Bearer {token}

// Response: 200 OK
[
  {
    "conversationId": 1,
    "participant": {
      "userId": 2,
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "lastMessage": {
      "messageId": 10,
      "content": "Is the MacBook still available?",
      "timestamp": "2025-10-15T11:00:00"
    },
    "unreadCount": 2
  }
]

// Frontend Usage
const conversations = await apiClient.getConversations()
```

### Get Conversation Messages
```typescript
GET /api/v1/messages/conversations/{conversationId}
Authorization: Bearer {token}

// Response: 200 OK
{
  "conversationId": 1,
  "messages": [
    {
      "messageId": 10,
      "senderId": 2,
      "content": "Is the MacBook still available?",
      "timestamp": "2025-10-15T11:00:00",
      "isRead": true
    },
    {
      "messageId": 11,
      "senderId": 1,
      "content": "Yes, it's still available!",
      "timestamp": "2025-10-15T11:05:00",
      "isRead": false
    }
  ]
}

// Frontend Usage
const messages = await apiClient.getMessages(conversationId)
```

### Send Message
```typescript
POST /api/v1/messages/conversations/{conversationId}
Authorization: Bearer {token}

// Request Body
{
  "content": "Is the price negotiable?"
}

// Response: 200 OK
{
  "messageId": 12,
  "content": "Is the price negotiable?",
  "timestamp": "2025-10-15T11:10:00"
}

// Frontend Usage
await apiClient.sendMessage(conversationId, messageContent)
```

### Create Conversation
```typescript
POST /api/v1/messages/conversations
Authorization: Bearer {token}

// Request Body
{
  "recipientId": 2,
  "initialMessage": "Hi, I'm interested in your MacBook Pro listing."
}

// Response: 200 OK
{
  "conversationId": 1,
  "message": "Conversation created successfully"
}

// Frontend Usage
await apiClient.createConversation(recipientId, initialMessage)
```

---

## Error Responses

### Standard Error Format
```json
{
  "message": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal Server Error

### Frontend Error Handling
```typescript
try {
  await apiClient.someMethod()
} catch (error) {
  if (error.statusCode === 401) {
    // Redirect to login
  } else if (error.isVerificationError) {
    // Show verification prompt
  } else {
    // Show generic error message
  }
}
```

---

## Frontend Integration Examples

### Complete Registration Flow
```typescript
// 1. Register user
try {
  await apiClient.register({
    firstName: 'John',
    lastName: 'Doe',
    password: 'SecurePass123!',
    emailAddress: 'john.doe@example.com',
    agreeToTerms: true,
    agreeToPrivacyPolicy: true
  })
  
  // 2. Redirect to login
  router.push('/login')
} catch (error) {
  console.error('Registration failed:', error)
}
```

### Complete Login & Fetch User
```typescript
// 1. Login
const response = await apiClient.login(email, password)
const token = response.token

// 2. Set token
apiClient.setAuthToken(token)

// 3. Fetch user details
const user = await apiClient.getUserDetails()

// 4. Update UI state
setUser(user)
```

### Create Product with Images
```typescript
const productData = {
  productName: 'MacBook Pro 2021',
  categoryId: 3,
  condition: 'NEW',
  location: 'Dar es Salaam, TZ',
  productDescription: 'Excellent condition...',
  currency: 'USD',
  askingPrice: 1200,
  originalPrice: 2000,
  productWarranty: '1 year warranty'
}

const imageFiles = [file1, file2, file3] // From <input type="file">

try {
  const result = await apiClient.createProduct(productData, imageFiles)
  console.log('Product created:', result.productId)
  router.push(`/products/${result.productId}`)
} catch (error) {
  console.error('Failed to create product:', error)
}
```

### Complete Checkout Flow
```typescript
// 1. Get cart
const cart = await apiClient.getUserCart()

// 2. Review order
const orderReview = await apiClient.reviewOrder()

// 3. Create order
const order = await apiClient.createOrder({
  items: cart.items,
  shippingAddress: userAddress,
  paymentMethod: 'MPESA'
})

// 4. Complete checkout
await apiClient.checkOut({
  orderId: order.orderId,
  paymentDetails: {
    method: 'MPESA',
    phoneNumber: '+255123456789'
  }
})

// 5. Clear cart
await apiClient.clearCart()

// 6. Show success
router.push(`/orders/${order.orderId}`)
```

---

## Best Practices

### 1. Always Handle Errors
```typescript
try {
  const data = await apiClient.someMethod()
  // Success handling
} catch (error) {
  // Error handling
  console.error('Operation failed:', error)
  showErrorToast(error.message)
}
```

### 2. Show Loading States
```typescript
const [isLoading, setIsLoading] = useState(false)

const handleSubmit = async () => {
  setIsLoading(true)
  try {
    await apiClient.someMethod()
  } finally {
    setIsLoading(false)
  }
}
```

### 3. Validate Before Sending
```typescript
if (!email || !password) {
  setError('Please fill in all fields')
  return
}

if (password.length < 8) {
  setError('Password must be at least 8 characters')
  return
}

await apiClient.login(email, password)
```

### 4. Use TypeScript Types
```typescript
interface Product {
  productId: number
  productName: string
  categoryId: number
  // ... other fields
}

const product: Product = await apiClient.getProduct(id)
```

---

## Testing API Endpoints

### Using cURL
```bash
# Register
curl -X POST http://10.123.22.21:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "password": "SecurePass123!",
    "emailAddress": "john.doe@example.com",
    "agreeToTerms": true,
    "agreeToPrivacyPolicy": true
  }'

# Login
curl -X POST http://10.123.22.21:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'

# Get products (with auth)
curl -X GET http://10.123.22.21:8081/api/v1/products/get-all-products?page=0 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Additional Resources

- **Swagger UI:** http://10.123.22.21:8081/swagger-ui/index.html#/
- **Platform Audit Report:** `/Docs/api/PLATFORM_AUDIT_REPORT.md`
- **Backend Integration:** `/Docs/api/BACKEND_INTEGRATION_ANALYSIS.md`

---

**Last Updated:** 2025-10-15  
**Version:** 1.0  
**Maintainer:** Development Team
