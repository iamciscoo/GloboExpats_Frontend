# Cart API Integration Documentation

This document describes the implementation of cart functionality with backend API integration for the Expat Marketplace.

## Overview

The cart system provides complete shopping cart functionality with the following features:

- Add items to cart
- Get user's cart contents
- Update item quantities
- Remove items from cart
- Clear entire cart
- Persistent cart storage with localStorage fallback
- Authentication-based cart management

## API Endpoints Implemented

### 1. Add to Cart

```bash
curl -X 'POST' \
  'http://10.123.22.21:8081/api/v1/cart/add' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "productId": 11,
    "quantity": 1
  }'
```

### 2. Get User Cart

```bash
curl -X 'GET' \
  'http://10.123.22.21:8081/api/v1/cart/User' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer {token}'
```

**Response Example:**

```json
{
  "items": [
    {
      "cartId": 1,
      "productId": 11,
      "quantity": 1,
      "productName": "Macbook 2020 air",
      "price": 2355555,
      "currency": "TZS",
      "subtotal": 2355555
    }
  ],
  "totalItems": 1,
  "totalPrice": 2355555,
  "currency": "TZS"
}
```

### 3. Update Cart Item

```bash
curl -X 'PUT' \
  'http://10.123.22.21:8081/api/v1/cart/item/1' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "productId": 11,
    "quantity": 12
  }'
```

### 4. Remove Item from Cart

```bash
curl -X 'DELETE' \
  'http://10.123.22.21:8081/api/v1/cart/item/11' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer {token}'
```

## Frontend Implementation

### API Client (`lib/api.ts`)

The API client has been extended with cart-specific methods:

```typescript
// Cart operations
cart: {
  add: (productId: number, quantity?: number) => apiClient.addToCart(productId, quantity),
  get: () => apiClient.getUserCart(),
  update: (cartId: number, productId: number, quantity: number) => apiClient.updateCartItem(cartId, productId, quantity),
  remove: (itemId: number) => apiClient.removeFromCart(itemId),
  clear: () => apiClient.clearCart(),
}
```

### Cart Provider (`providers/cart-provider.tsx`)

The cart provider has been updated to integrate with the backend API:

- **Authentication Required**: All cart operations require user authentication
- **Backend Sync**: Cart state is synchronized with the backend API
- **Error Handling**: Comprehensive error handling with user-friendly toast notifications
- **Loading States**: Proper loading indicators during API operations
- **Fallback Storage**: localStorage fallback when backend is unavailable

### Key Features

1. **Automatic Cart Loading**: Cart is loaded from backend when user logs in
2. **Real-time Updates**: Cart state updates immediately after successful API calls
3. **Error Recovery**: Graceful error handling with user notifications
4. **Type Safety**: Full TypeScript support with proper type definitions

### Usage Example

```tsx
import { useCart } from '@/hooks/use-cart'

function ProductCard({ product }) {
  const { addToCart, isLoading } = useCart()

  const handleAddToCart = async () => {
    const cartItem = {
      id: product.id.toString(),
      title: product.title,
      price: product.price,
      image: product.image,
      condition: 'used',
      expatId: product.expatId,
      expatName: product.expatName,
      category: product.category,
      location: product.location,
      verified: product.verified,
      currency: product.currency,
    }

    await addToCart(cartItem, 1)
  }

  return (
    <button onClick={handleAddToCart} disabled={isLoading}>
      Add to Cart
    </button>
  )
}
```

## Types (`lib/types.ts`)

New types have been added to support the backend cart structure:

```typescript
// Backend cart item response
interface BackendCartItem {
  cartId: number
  productId: number
  quantity: number
  productName: string
  price: number
  currency: string
  subtotal: number
}

// Complete cart response
interface BackendCartResponse {
  items: BackendCartItem[]
  totalItems: number
  totalPrice: number
  currency: string
}
```

## Testing

A test page has been created at `/cart-test` to demonstrate and test the cart functionality:

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/cart-test`
3. Login with valid credentials
4. Test add to cart, update quantity, and remove operations

## Configuration

The cart system uses these configuration constants:

```typescript
const CART_STORAGE_KEY = 'expatCartItems'
const CART_EXPIRY_HOURS = 168 // 7 days
const MAX_CART_ITEMS = 50
const MAX_ITEM_QUANTITY = 10
```

## Error Handling

The implementation includes comprehensive error handling:

- **Authentication Errors**: Users are prompted to login
- **Network Errors**: Graceful fallback with error messages
- **Validation Errors**: Input validation with user feedback
- **Server Errors**: Proper error reporting with retry options

## Security

- All cart operations require valid JWT authentication
- Cart data is associated with the authenticated user
- Input validation on both client and server side
- Secure token handling through Authorization headers

## Future Enhancements

Potential improvements for the cart system:

1. **Product Details Integration**: Fetch complete product information including images and seller details
2. **Cart Synchronization**: Real-time cart sync across multiple browser sessions
3. **Cart Persistence**: Enhanced cart persistence with expiration policies
4. **Bulk Operations**: Add support for bulk add/remove operations
5. **Cart Analytics**: Track cart abandonment and conversion metrics
