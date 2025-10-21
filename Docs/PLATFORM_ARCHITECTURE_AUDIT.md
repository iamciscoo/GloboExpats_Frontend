# Globoexpats Platform - Complete Architecture Audit

**Generated**: 2025-10-21  
**Purpose**: Comprehensive understanding of platform structure for development guidance

---

## Executive Summary

**Globoexpats** is a Next.js 15 + React 19 marketplace platform serving the expat community in East Africa. The platform enables buying/selling of items with focus on Tanzania, Kenya, Uganda, and Rwanda markets. Built with modern technologies, it features JWT authentication, comprehensive API integration, and a robust component architecture.

---

## Technology Stack

### Frontend Architecture
- **Framework**: Next.js 15.2.4 (App Router)
- **React**: v19 with Server/Client Components
- **TypeScript**: Full type safety across codebase
- **Styling**: TailwindCSS 3.4.17 + shadcn/ui components
- **Forms**: react-hook-form + Zod validation
- **State Management**: React Context (Auth, Cart, Currency)
- **Testing**: Vitest + Testing Library
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

### Backend Integration
- **Backend URL**: `http://10.123.22.21:8081`
- **API Version**: `/api/v1/`
- **Documentation**: OpenAPI 3.1 (Swagger UI)
- **Backend Framework**: Spring Boot (Java)
- **Authentication**: JWT Bearer tokens
- **Response Format**: JSON with standardized error handling

### Development Environment
- **Node**: >=20.0.0
- **Package Manager**: pnpm >=8.0.0
- **Hot Reload**: Next.js Fast Refresh + Turbo mode available
- **Environment Variables**: `.env.local` for development

---

## Project Structure

```
ExpatFrontend-main/
├── app/                      # Next.js 15 App Router
│   ├── (routes)/            # Page routes
│   │   ├── about/           # About page
│   │   ├── account/         # User account management
│   │   ├── admin/           # Admin dashboard
│   │   ├── browse/          # Product browsing
│   │   ├── cart/            # Shopping cart
│   │   ├── checkout/        # Checkout flow
│   │   ├── expat/           # Expat dashboard (seller space)
│   │   ├── login/           # Authentication
│   │   ├── messages/        # Messaging system
│   │   ├── product/         # Product details
│   │   ├── sell/            # Sell/list products
│   │   └── ...
│   ├── api/                 # Next.js API routes (proxies)
│   │   ├── analytics/       # Analytics endpoints
│   │   ├── oauth/           # OAuth handlers
│   │   ├── products/        # Product proxy routes
│   │   └── profile/         # Profile update proxy
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
│
├── components/              # React components (101 files)
│   ├── header/              # Header subcomponents
│   │   ├── logo.tsx
│   │   ├── navigation.tsx
│   │   ├── mobile-menu.tsx
│   │   ├── profile-dropdown.tsx
│   │   └── ...
│   ├── ui/                  # shadcn/ui components
│   ├── cart-sidepanel.tsx   # Cart drawer
│   ├── currency-toggle.tsx  # Currency switcher
│   ├── header.tsx           # Main navigation
│   └── search-bar.tsx       # Global search
│
├── hooks/                   # Custom React hooks
│   ├── use-auth.ts          # Authentication state
│   ├── use-cart.ts          # Cart operations
│   ├── use-currency.ts      # Currency management
│   ├── use-notifications.ts # Notification state
│   ├── use-products.ts      # Product data fetching
│   ├── use-search.ts        # Search functionality
│   └── use-verification.ts  # Verification workflows
│
├── providers/               # React Context providers
│   ├── auth-provider.tsx    # Auth state (944 lines)
│   ├── cart-provider.tsx    # Cart state (localStorage sync)
│   └── currency-provider.tsx# Currency conversion
│
├── lib/                     # Core utilities
│   ├── api.ts               # API client (1,128 lines)
│   ├── auth-service.ts      # Auth operations
│   ├── types.ts             # TypeScript types (611 lines)
│   ├── constants.ts         # App constants (349 lines)
│   ├── currency-converter.ts# Currency conversion logic
│   ├── error-handling.ts    # Error utilities
│   ├── storage-utils.ts     # localStorage wrapper
│   └── utils.ts             # General utilities
│
├── public/                  # Static assets
│   └── assets/images/       # Product images, heroes, etc.
│
├── Docs/                    # Documentation (57 files)
│   ├── bugfixes/            # Bug fix documentation
│   ├── features/            # Feature specifications
│   └── architecture/        # Architecture docs
│
└── Configuration Files
    ├── .env.local           # Environment variables
    ├── next.config.mjs      # Next.js configuration
    ├── tailwind.config.ts   # TailwindCSS config
    ├── tsconfig.json        # TypeScript config
    └── package.json         # Dependencies & scripts
```

---

## Backend API Architecture

### Authentication Module (`/api/v1/auth/`, `/api/v1/oauth2/`)

**Standard Authentication**:
- `POST /api/v1/auth/login` - Email/password authentication
- `POST /api/v1/auth/register` - New user registration
- `POST /api/v1/auth/logout` - Session termination
- `POST /api/v1/auth/reset-password` - Password recovery

**OAuth Integration**:
- `POST /api/v1/oauth2/exchange` - Google OAuth code exchange

**Email Verification**:
- `POST /api/v1/email/sendOTP` - Send organization email OTP
- `POST /api/v1/email/verifyOTP` - Verify OTP and assign roles

### User Management (`/api/v1/userManagement/`, `/api/v1/users/`)

**Profile Operations**:
- `GET /api/v1/userManagement/user-details` - Get current user profile
- `PUT /api/v1/users/{id}` - Update user profile
- `POST /api/v1/userManagement/change-password` - Password management

**Verification System**:
- `POST /api/v1/userManagement/upload-verification-doc` - Document upload
- `GET /api/v1/userManagement/verification/{type}` - Check verification status
- `DELETE /api/v1/userManagement/delete-verification-doc/{url}` - Remove document

### Product Module (`/api/v1/products/`, `/api/v1/displayItem/`)

**Core Product Operations**:
- `POST /api/v1/products/post-product` - Create product (multipart/form-data)
- `PATCH /api/v1/products/update/{productId}` - Update product
- `DELETE /api/v1/products/delete/{productId}` - Delete product
- `DELETE /api/v1/products/delete-image/{imageId}` - Remove image
- `GET /api/v1/products/categories` - Get all categories
- `GET /api/v1/products/get-all-products` - Paginated products list

**Display & Discovery**:
- `GET /api/v1/displayItem/top-picks` - Featured products
- `GET /api/v1/displayItem/newest` - Recent listings
- `GET /api/v1/displayItem/itemDetails/{productId}` - Product details
- `POST /api/v1/displayItem/filter` - Advanced filtering

**Product Engagement**:
- `POST /api/v1/rate` - Rate a product
- `POST /api/v1/post-review` - Submit review
- `PUT /api/v1/edit-review/{productId}` - Edit review
- `DELETE /api/v1/delete-review/{reviewId}` - Delete review

### Cart Management (`/api/v1/cart/`)

- `POST /api/v1/cart/add` - Add item to cart
- `GET /api/v1/cart/User` - Get user's cart
- `PUT /api/v1/cart/item/{cartId}` - Update cart item
- `DELETE /api/v1/cart/item/{itemId}` - Remove cart item
- `DELETE /api/v1/cart/clear` - Clear entire cart

**Note**: Frontend uses client-side cart with localStorage for better UX

### Order Management (`/api/v1/orders/`)

- `POST /api/v1/orders` - Create order from cart
- `GET /api/v1/orders` - Get order history
- `GET /api/v1/orders/{id}` - Get order details
- `PATCH /api/v1/orders/{id}/status` - Update order status

### Messaging System (`/api/v1/messages/`)

- `GET /api/v1/messages/conversations` - List conversations
- `GET /api/v1/messages/conversations/{id}` - Get messages
- `POST /api/v1/messages/conversations/{id}` - Send message
- `POST /api/v1/messages/conversations` - Create conversation

---

## Frontend-Backend Integration

### API Client Architecture (`lib/api.ts`)

**Key Features**:
- Singleton `ApiClient` class for all HTTP requests
- Automatic JWT token management (localStorage + headers)
- Token rehydration on 401 errors (retry logic)
- Support for both JSON and multipart/form-data
- Comprehensive error handling with user-friendly messages
- CORS handling via Next.js API proxy routes

**Request Flow**:
```
Component → Hook → ApiClient → Next.js API Proxy (if CORS) → Backend
                                     ↓
                            localStorage (token persistence)
```

**Token Management**:
1. Token stored in `localStorage` as `expat_auth_token`
2. Auto-loaded on ApiClient construction
3. Included in `Authorization: Bearer {token}` header
4. Auto-retry on 401 with token rehydration

### Authentication Flow

**Standard Login**:
```
1. User enters email/password
2. POST /api/v1/auth/login
3. Backend returns JWT + user data
4. Token saved to localStorage
5. ApiClient.setAuthToken(token)
6. User state updated in AuthProvider
7. Redirect to dashboard
```

**Google OAuth**:
```
1. User clicks "Sign in with Google"
2. Google OAuth flow (redirects)
3. Auth code returned to callback
4. POST /api/v1/oauth2/exchange with code
5. Backend validates & returns JWT
6. Token saved, user logged in
```

**Organization Email Verification**:
```
1. User enters organizational email
2. POST /api/v1/email/sendOTP
3. OTP sent to email
4. User enters OTP
5. POST /api/v1/email/verifyOTP
6. Backend assigns SELLER/USER role
7. Verification status updated
```

### State Management Architecture

**AuthProvider** (`providers/auth-provider.tsx`):
- Manages user session and authentication state
- Provides: `isLoggedIn`, `user`, `verificationStatus`
- Actions: `login()`, `logout()`, `register()`, `updateUser()`
- Auto-session restoration from localStorage
- Session expiry handling (2-hour timeout)

**CartProvider** (`providers/cart-provider.tsx`):
- Client-side cart using localStorage
- Provides: `items`, `itemCount`, `totalPrice`
- Actions: `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`
- Persists cart across sessions

**CurrencyProvider** (`providers/currency-provider.tsx`):
- Currency selection and conversion
- Exchange rate management
- Provides: `currency`, `setCurrency()`, `convert()`

---

## Key Application Features

### 1. User Authentication & Verification

**Verification Levels**:
- **Email Verification**: Required for basic access
- **Organization Email**: Required for buying (OTP-based)
- **Identity Verification**: Required for selling (document upload)
- **Address Verification**: Optional enhanced verification

**Verification Status Interface**:
```typescript
interface VerificationStatus {
  isFullyVerified: boolean
  isIdentityVerified: boolean
  isOrganizationEmailVerified: boolean
  canBuy: boolean
  canList: boolean
  canContact: boolean
  currentStep: 'identity' | 'organization' | 'complete' | null
  pendingActions: ('upload_documents' | 'verify_email' | 'admin_review')[]
}
```

### 2. Product Management

**Product Listing Flow**:
1. Navigate to `/sell`
2. Multi-step form with validation
3. Upload images (max 5MB, 10 images)
4. Select category and condition
5. Set price and location
6. Backend creates with `sellerId` from JWT

**Product Details**:
- Images with carousel
- Seller information
- Reviews and ratings
- Click tracking
- Related products

### 3. Shopping Cart & Checkout

**Cart System**:
- Client-side persistence (localStorage)
- Real-time quantity updates
- Price calculations with currency conversion
- Side panel drawer for quick access
- Keyboard shortcut (Ctrl/Cmd+K)

**Checkout Flow**:
```
Cart → Review Items → Shipping Info → Payment → Order Confirmation
```

### 4. Messaging System

**Features**:
- Direct messaging between buyers/sellers
- Conversation threads
- Product context in messages
- Unread message counts
- Real-time updates (planned with WebSocket)

### 5. Search & Filtering

**Search Capabilities**:
- Global search bar in header
- Category-based browsing
- Price range filtering
- Condition filtering (New, Like New, Good, Fair)
- Location-based filtering
- Sorting options

**Browse Page** (`/browse`):
- Grid/list view toggle
- Advanced filters sidebar
- Pagination
- Quick view modals

---

## Platform Configuration

### Supported Markets

**Currencies**:
- TZS (Tanzanian Shilling) 🇹🇿 - Primary
- KES (Kenyan Shilling) 🇰🇪
- UGX (Ugandan Shilling) 🇺🇬
- USD (US Dollar) 🇺🇸

**Key Locations**:
- Dar es Salaam, TZ (Primary hub)
- Nairobi, KE
- Arusha, TZ
- Kampala, UG
- Zanzibar, TZ
- Kigali, RW

### Categories

1. **Automotive** - Cars, motorcycles, parts
2. **Home & Furniture** - Furniture, décor, appliances
3. **Electronics & Tech** - Computers, phones, gadgets
4. **Games & Toys** - Video games, board games, toys
5. **Fashion & Style** - Clothing, accessories, jewelry
6. **Fitness & Sports** - Equipment, gear, apparel
7. **Books & Media** - Books, movies, music
8. **Arts & Crafts** - Handmade items, art supplies

---

## Security & Performance

### Security Measures

**Authentication**:
- JWT tokens with expiration
- Secure token storage (localStorage)
- HTTPS for all API calls (production)
- CORS handling via Next.js proxy

**Data Protection**:
- Input validation with Zod schemas
- XSS protection (React escaping)
- CSRF protection (Next.js built-in)
- File upload restrictions (size, type)

### Performance Optimizations

**Frontend**:
- Next.js Image optimization
- Code splitting (automatic)
- Route prefetching
- Memoized components (React.memo)
- Lazy loading for heavy components

**API**:
- Request debouncing (storage writes)
- Pagination for large datasets
- Image compression before upload
- Loading skeletons for better UX

---

## Development Workflow

### Scripts

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run dev:turbo        # Start with Turbo mode

# Production
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:check       # Check without fixing
npm run format           # Format with Prettier
npm run format:check     # Check formatting
npm run type-check       # TypeScript validation

# Testing
npm test                 # Run Vitest tests
npm run test:watch       # Watch mode
npm run test:ui          # Vitest UI

# Utilities
npm run clean            # Remove build artifacts
npm run optimize-images  # Optimize image assets
```

### Environment Variables

```env
# Backend API
BACKEND_URL=http://10.123.22.21:8081
NEXT_PUBLIC_BACKEND_URL=http://10.123.22.21:8081
NEXT_PUBLIC_API_URL=                    # Empty for proxy pattern
NEXT_PUBLIC_WS_URL=ws://10.123.22.21:8081/ws

# Environment
NODE_ENV=development
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_TELEMETRY_DISABLED=1

# Security
ALLOWED_ORIGINS=*
```

---

## API Integration Patterns

### Making API Calls

**Using the API Client**:
```typescript
import { apiClient } from '@/lib/api'

// Get products
const products = await apiClient.getAllProducts(0)

// Get product details
const product = await apiClient.getProductDetails(productId)

// Create product (with auth token)
const result = await apiClient.createProduct(productData, images)

// Filter products
const filtered = await apiClient.filterProducts({
  categoryIds: [1, 2],
  minPrice: 100,
  maxPrice: 5000,
  conditionFilter: 'NEW',
  page: 0,
  size: 12
})
```

**Using React Hooks**:
```typescript
import { useProducts } from '@/hooks/use-products'

function ProductList() {
  const { products, loading, error, refetch } = useProducts({
    category: 'electronics',
    page: 0
  })
  
  if (loading) return <Skeleton />
  if (error) return <Error message={error} />
  
  return <ProductGrid products={products} />
}
```

### Error Handling

**API Client Error Processing**:
- Extracts error messages from responses
- Provides user-friendly error messages
- Handles verification errors gracefully
- Logs errors for debugging (development only)

**Error Types**:
```typescript
{
  statusCode: 401,
  isAuthError: true,
  isVerificationError: false,
  message: "Authentication failed. Please check your credentials."
}
```

---

## Current Implementation Status

### ✅ Complete Features
- User authentication and session management
- Organization email verification (OTP)
- Product listing and management
- Category browsing
- Image upload with preview
- Shopping cart (client-side)
- Product search and filtering
- User profiles and settings
- Review and rating system
- Messaging system (basic)
- Order management
- Currency conversion
- Responsive design (mobile/desktop)

### 🔄 In Progress
- Payment gateway integration (Stripe/PayPal)
- Advanced search with Elasticsearch
- Real-time messaging (WebSocket)
- Push notifications
- Admin dashboard enhancements
- Analytics and reporting

### 📋 Planned Features
- Favorites/Wishlist functionality
- Product recommendations
- Multi-language support (i18n)
- Advanced analytics
- Seller verification badges
- Bulk product operations
- Export/Import functionality

---

## Known Issues & Limitations

### Backend Limitations
- No dedicated search endpoint (relies on filtering)
- CORS issues with PATCH requests (using Next.js proxy)
- No WebSocket support yet (messaging is polling-based)
- Limited analytics endpoints
- No bulk operations for products

### Frontend Limitations
- Cart is client-side only (no backend sync until checkout)
- No offline support
- Limited PWA features
- Search could be more performant with dedicated backend

### Performance Considerations
- Image optimization could be improved
- Bundle size could be reduced with better code splitting
- API response caching not implemented yet

---

## Architecture Strengths

1. **Clean Separation of Concerns**: Clear boundaries between UI, state, and data layers
2. **Type Safety**: Comprehensive TypeScript coverage
3. **Reusable Components**: Well-structured component library with shadcn/ui
4. **Modern React Patterns**: Hooks, Context, Server/Client components
5. **Developer Experience**: Excellent tooling, documentation, and error handling
6. **Scalable Structure**: Modular architecture ready for growth

---

## Recommendations for Development

### Best Practices

1. **Always use hooks for data fetching**: `useProducts`, `useAuth`, etc.
2. **Leverage TypeScript**: Use defined types from `lib/types.ts`
3. **Follow component patterns**: Use shadcn/ui components as base
4. **Handle errors gracefully**: Use error boundaries and fallbacks
5. **Test new features**: Add tests to Vitest suite
6. **Document changes**: Update Docs/ folder for major changes

### Before Making Changes

1. **Read related documentation** in `Docs/` folder
2. **Check existing implementations** to avoid duplication
3. **Understand the data flow**: Component → Hook → API → Backend
4. **Test in development** before deploying
5. **Follow coding patterns** from user rules and memories

### Common Patterns

**Adding a new API endpoint**:
1. Add method to `ApiClient` class in `lib/api.ts`
2. Create hook in `hooks/` if needed
3. Update TypeScript types in `lib/types.ts`
4. Use in components via hook

**Creating a new page**:
1. Add route in `app/` directory
2. Create page component with proper layout
3. Add navigation link if needed
4. Implement loading and error states

---

## Conclusion

The Globoexpats platform is a well-architected, modern web application built with industry best practices. The codebase demonstrates strong patterns in state management, API integration, and component design. The platform is production-ready with room for enhancement in areas like real-time features, advanced search, and analytics.

The architecture provides a solid foundation for future growth while maintaining code quality and developer experience.

---

**For Future Development**: Always refer to this document and the memories provided for context when making changes to the platform. Maintain the existing patterns and architecture for consistency.
