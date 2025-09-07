# Next.js Platform Architecture Documentation

## Table of Contents
1. [Platform Overview](#platform-overview)
2. [Project Structure](#project-structure)
3. [Data Flow Architecture](#data-flow-architecture)
4. [Component Relationships](#component-relationships)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Redundancies & Issues](#redundancies--issues)
8. [Recommendations](#recommendations)

## Platform Overview

The **GlobalExpat Marketplace** is a Next.js 15 application built for the expat community in East Africa. It uses the App Router architecture with TypeScript, Tailwind CSS, and Radix UI components.

### Key Technologies
- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Radix UI primitives
- **State Management**: React Context API
- **Testing**: Vitest with Testing Library
- **Build Tool**: Webpack with custom optimizations

## Project Structure

### Root Level Organization

#### Project Structure (❌ = Remove, ⚠️ = Critical for stability)
```
/
├── [ ] app/                    # Next.js App Router pages ⚠️ CRITICAL
├── [ ] components/             # Reusable UI components ⚠️ CRITICAL
├── [ ] hooks/                  # Custom React hooks
├── [ ] lib/                    # Utilities and configurations ⚠️ CRITICAL
├── [ ] providers/              # React Context providers ⚠️ CRITICAL
├── [ ] public/                 # Static assets
├── [ ] scripts/                # Build and utility scripts
└── [ ] styles/                 # Global styles
```

#### Hooks Directory (❌ = Remove, ⚠️ = Critical for stability)
```
hooks/
├── [ ] use-auth.ts             ⚠️ CRITICAL
├── [ ] use-cart.ts             ⚠️ CRITICAL
├── [ ] use-currency.ts
├── [ ] use-notifications.ts
├── [ ] use-performance.ts
├── [ ] use-products.ts
├── [ ] use-search.ts
├── [ ] use-user-profile.ts
└── [ ] use-verification.ts
```

#### Providers Directory (❌ = Remove, ⚠️ = Critical for stability)
```
providers/
├── [ ] auth-provider.tsx       ⚠️ CRITICAL
└── [ ] cart-provider.tsx       ⚠️ CRITICAL
```

#### Lib Directory (❌ = Remove, ⚠️ = Critical for stability)
```
lib/
├── [ ] api.ts                  ⚠️ CRITICAL
├── [ ] constants.ts            # Contains mock data - can be trimmed
├── [ ] error-handling.ts
├── [ ] seller-data.ts
├── [ ] types.ts                ⚠️ CRITICAL
├── [ ] utils.ts                ⚠️ CRITICAL
└── [ ] verification-utils.ts
```

#### Scripts Directory (❌ = Remove)
```
scripts/
├── [X] optimize-images.js
├── [X] rename-images.js
└── [X] update-constants.js
```

#### Public Assets (❌ = Remove)
```
public/
├── [ ] Home bottom hero/
├── [ ] images/                 # Large image collection - can be trimmed
│   ├── [ ] optimized/          # Optimized images
│   └── [52+ image files]       # Individual product images
├── [ ] videos/
└── [ ] mock-users.json         # Mock data file
```

### App Directory Structure (Next.js 15 App Router)

#### Core Pages (❌ = Remove, ⚠️ = Critical for stability)
```
app/
├── [ ] layout.tsx              # Root layout with providers ⚠️ CRITICAL
├── [ ] page.tsx                # Homepage ⚠️ CRITICAL
├── [ ] globals.css             # Global styles ⚠️ CRITICAL
├── [ ] about/                  # Static pages
├── [ ] account/                # User account management
│   ├── [ ] addresses/          # Address management
│   ├── [ ] orders/             # Order history
│   └── [ ] payment-methods/    # Payment settings
├── [ ] admin/                  # user dashboard
│   └── [ ] dashboard/          # user main dashboard
├── [ ] browse/                 # Product browsing
│   ├── [ ] loading.tsx         # Browse loading state
│   └── [ ] page.tsx            # Browse main page
├── [ ] cart/                   # Shopping cart
├── [ ] checkout/               # Purchase flow
├── [ ] help/                   # Support pages
├── [ ] login/                  # Authentication ⚠️ CRITICAL
├── [ ] messages/               # Communication system
├── [ ] notifications/          # User notifications
├── [ ] product/                # Product details
├── [ ] register/               # User registration ⚠️ CRITICAL
├── [ ] search/                 # Search functionality
└── [ ] sell/                   # Item listing
```

### Component Architecture

#### Components (❌ = Remove, ⚠️ = Critical for stability)
```
components/
├── ui/                         # Base UI components (shadcn/ui) ⚠️ CRITICAL
│   ├── [ ] accordion.tsx
│   ├── [ ] alert-dialog.tsx
│   ├── [ ] alert.tsx
│   ├── [ ] aspect-ratio.tsx
│   ├── [ ] avatar.tsx
│   ├── [ ] badge.tsx
│   ├── [ ] breadcrumb.tsx
│   ├── [ ] button.tsx          ⚠️ CRITICAL
│   ├── [ ] calendar.tsx
│   ├── [ ] card.tsx            ⚠️ CRITICAL
│   ├── [ ] carousel.tsx
│   ├── [ ] chart.tsx
│   ├── [ ] checkbox.tsx
│   ├── [ ] collapsible.tsx
│   ├── [ ] command.tsx
│   ├── [ ] context-menu.tsx
│   ├── [ ] dialog.tsx
│   ├── [ ] drawer.tsx
│   ├── [ ] dropdown-menu.tsx
│   ├── [ ] form.tsx
│   ├── [ ] hover-card.tsx
│   ├── [ ] input-otp.tsx
│   ├── [ ] input.tsx           ⚠️ CRITICAL
│   ├── [ ] label.tsx
│   ├── [ ] menubar.tsx
│   ├── [ ] navigation-menu.tsx
│   ├── [ ] pagination.tsx
│   ├── [ ] popover.tsx
│   ├── [ ] product-card.tsx    ⚠️ CRITICAL
│   ├── [ ] progress.tsx
│   ├── [ ] radio-group.tsx
│   ├── [ ] resizable.tsx
│   ├── [ ] scroll-area.tsx
│   ├── [ ] select.tsx
│   ├── [ ] separator.tsx
│   ├── [ ] sheet.tsx
│   ├── [ ] sidebar.tsx
│   ├── [ ] skeleton.tsx
│   ├── [ ] slider.tsx
│   ├── [ ] sonner.tsx
│   ├── [ ] status-badge.tsx
│   ├── [ ] switch.tsx
│   ├── [ ] table.tsx
│   ├── [ ] tabs.tsx
│   ├── [ ] textarea.tsx
│   ├── [ ] toast.tsx
│   ├── [ ] toaster.tsx
│   ├── [ ] toggle-group.tsx
│   ├── [ ] toggle.tsx
│   ├── [ ] tooltip.tsx
│   ├── [ ] use-mobile.tsx
│   └── [ ] use-toast.ts
├── common/                     # Shared components
│   ├── [ ] error-display.tsx
│   ├── [ ] lazy-components.tsx
│   └── [ ] loading-skeleton.tsx
├── header/                     # Header sub-components ⚠️ CRITICAL
│   ├── [ ] auth-buttons.tsx    ⚠️ CRITICAL
│   ├── [ ] logo.tsx            ⚠️ CRITICAL
│   ├── [ ] mobile-menu.tsx
│   ├── [ ] navigation.tsx      ⚠️ CRITICAL
│   ├── [ ] notification-badge.tsx
│   └── [ ] profile-dropdown.tsx
├── account/                    # Account-specific components
├── messages/                   # Messaging components
│   ├── [ ] ChatWindow.tsx
│   └── [ ] ConversationsList.tsx
├── [ ] breadcrumb.tsx          # Navigation breadcrumb
├── [ ] category-grid.tsx       # Category display grid
├── [ ] category-sidebar.tsx    # Product category navigation
├── [ ] error-boundary.tsx      ⚠️ CRITICAL
├── [ ] featured-listings.tsx   ⚠️ CRITICAL
├── [ ] footer.tsx
├── [ ] guest-welcome.tsx       # Welcome message for guests
├── [ ] header.tsx              ⚠️ CRITICAL
├── [ ] hero-carousel.tsx
├── [ ] message-dialog.tsx      # Message dialog component
├── [ ] messages-client.tsx     # Client-side messaging
├── [ ] mobile-sidebar-toggle.tsx
├── [ ] product-actions.tsx     # Product action buttons
├── [ ] route-guard.tsx         # Route protection
├── [ ] search-bar.tsx
├── [ ] theme-provider.tsx      # Theme context provider
├── [ ] trust-indicators.tsx    # Trust/security indicators
├── [ ] verification-banner.tsx
└── [ ] verification-popup.tsx  # Verification popup dialog
```

## Data Flow Architecture

### 1. Authentication Flow
```
User Action → AuthProvider → useAuth Hook → Components
                ↓
          localStorage persistence
                ↓
          Session validation
                ↓
          Backend API sync (TODO)
```

**Key Files:**
- `providers/auth-provider.tsx` - Central auth state
- `hooks/use-auth.ts` - Auth hook interface
- `app/layout.tsx` - Provider wrapper

### 2. Shopping Cart Flow
```
User Action → CartProvider → useCart Hook → Components
                ↓
          localStorage persistence
                ↓
          Cart calculations
                ↓
          Backend sync (TODO)
```

**Key Files:**
- `providers/cart-provider.tsx` - Cart state management
- `hooks/use-cart.ts` - Cart hook interface

### 3. Product Data Flow
```
Static Data (constants.ts) → Components → UI Display
                ↓
          Future: API endpoints
                ↓
          Dynamic product loading
```

**Key Files:**
- `lib/constants.ts` - Mock product data
- `lib/api.ts` - API client (prepared for backend)
- `components/featured-listings.tsx` - Product display

### 4. Navigation Flow
```
User Interaction → Next.js Router → Page Components
                ↓
          Header navigation updates
                ↓
          Breadcrumb updates
                ↓
          State preservation
```

## Component Relationships

### Core Layout Components
```
RootLayout (app/layout.tsx)
├── AuthProvider
│   └── CartProvider
│       └── ErrorBoundary
│           ├── Header
│           ├── VerificationBanner
│           ├── Breadcrumb
│           ├── Main Content (children)
│           ├── Footer
│           └── Toaster
```

### Header Component Hierarchy
```
Header (components/header.tsx)
├── Logo
├── SearchBar (conditional)
├── Navigation (desktop)
├── CurrencySelector
├── UserNavigation (authenticated)
│   ├── NotificationBadge (cart)
│   ├── NotificationBadge (notifications)
│   ├── NotificationBadge (messages)
│   └── ProfileDropdown
├── GuestNavigation (unauthenticated)
│   ├── NotificationBadge (cart)
│   └── AuthButtons
└── MobileMenu
```

### Product Display Hierarchy
```
HomePage (app/page.tsx)
├── MobileSidebarToggle
├── CategorySidebar (desktop)
└── FeaturedListings
    └── ProductCard (multiple)
        ├── Image
        ├── Title
        ├── Price
        ├── Rating
        ├── Location
        └── ViewButton
```

## State Management

### 1. Authentication State (AuthProvider)
```typescript
interface AuthState {
  isLoggedIn: boolean
  user: User | null
  isLoading: boolean
  error: string | null
  verificationStatus: VerificationStatus | null
}
```

**Computed Properties:**
- `canBuy` - Organization email verified
- `canSell` - Full verification required
- `canContact` - Organization email verified
- `isVerifiedBuyer` - Basic verification status
- `isFullyVerified` - Complete verification status
- `isAdmin` - Admin role check

### 2. Cart State (CartProvider)
```typescript
interface CartState {
  items: CartItem[]
  isLoading: boolean
  error: string | null
  isInitialized: boolean
  selectedItems: string[]
}
```

**Computed Properties:**
- `itemCount` - Total items in cart
- `subtotal` - Total price
- `savings` - Discount amount
- `hasVerifiedExpats` - Trust indicator
- `isEmpty` - Cart status

### 3. Global State Flow
```
App Initialization
├── AuthProvider loads user session
├── CartProvider loads cart items
├── Currency preferences loaded
└── Component tree renders with state
```

## API Integration

### Current State (Mock Data)
The application currently uses static mock data from `lib/constants.ts` for development and demonstration purposes.

### Prepared API Client (`lib/api.ts`)
```typescript
class ApiClient {
  // Product endpoints
  getProducts(params?: ProductListParams)
  getProduct(id: string)
  createProduct(productData: any)
  updateProduct(id: string, productData: any)
  deleteProduct(id: string)

  // User endpoints
  getUser(id: string)
  updateUser(id: string, data: Partial<any>)

  // Authentication endpoints
  login(email: string, password: string)
  register(userData: any)
  resetPassword(email: string)
  logout()

  // Messaging endpoints
  getConversations()
  getMessages(conversationId: string)
  sendMessage(conversationId: string, message: string)
  createConversation(recipientId: string, initialMessage: string)

  // Order endpoints
  getOrders()
  createOrder(orderData: any)
  getOrder(orderId: string)
  updateOrderStatus(orderId: string, status: string)
}
```

### Backend Integration Points
**Environment Variables:**
- `BACKEND_URL` - Backend server URL
- `NEXT_PUBLIC_API_URL` - Public API endpoint
- `NEXT_PUBLIC_WS_URL` - WebSocket URL for real-time features

**API Proxy Configuration (next.config.mjs):**
```javascript
async rewrites() {
  return [
    {
      source: '/api/backend/:path*',
      destination: `${process.env.BACKEND_URL}/api/:path*`,
    }
  ]
}
```

## Redundancies & Issues

### 🔴 Critical Issues

#### 1. Duplicate Type Definitions
**Location:** `lib/types.ts`
- `ExpatInfo` interface defined twice (lines 157-164 and 504-514)
- Different properties in each definition
- **Impact:** Type confusion, potential runtime errors
- **Fix:** Consolidate into single comprehensive interface

#### 2. Inconsistent Verification Logic
**Locations:** 
- `providers/auth-provider.tsx` (lines 144-153)
- `hooks/use-auth.ts` (lines 113-132)
- `lib/types.ts` (lines 47-71)

**Issues:**
- `canList` vs `canSell` property naming inconsistency
- Different verification status checking methods
- **Impact:** Confusing permission system
- **Fix:** Standardize on single verification interface

#### 3. Mock Data in Production Code
**Location:** `lib/constants.ts` (lines 333-922)
- 42 hardcoded featured items
- Static product data mixed with configuration
- **Impact:** Large bundle size, maintenance overhead
- **Fix:** Move to separate mock data files, exclude from production builds

### 🟡 Moderate Issues

#### 4. Incomplete TODO Implementations
**Found 89 TODO comments across the codebase:**
- Authentication API calls not implemented
- Cart synchronization with backend missing
- Real-time features placeholder code
- **Impact:** Features appear complete but lack backend integration
- **Fix:** Implement or remove TODO items

#### 5. Component Complexity
**Location:** `components/header.tsx` (492 lines)
- Single file handles multiple responsibilities
- Complex conditional rendering logic
- **Impact:** Difficult to maintain and test
- **Fix:** Split into smaller, focused components

#### 6. Hook Redundancy
**Locations:**
- `hooks/use-auth.ts` - Exports `useAuth` function
- `providers/auth-provider.tsx` - Also exports `useAuth` function
- **Impact:** Potential import confusion
- **Fix:** Single source of truth for hooks

### 🟢 Minor Issues

#### 7. Unused Dependencies
**Location:** `package.json`
- Some Radix UI components may be unused
- Development dependencies in production bundle
- **Impact:** Larger bundle size
- **Fix:** Audit and remove unused dependencies

#### 8. Image Optimization Issues
**Location:** `components/ui/product-card.tsx`
- Hardcoded image dimensions
- Generic blur placeholder for all images
- **Impact:** Poor loading experience
- **Fix:** Dynamic image sizing, proper placeholders

## Component Removal Guide

### 🚨 CRITICAL - DO NOT REMOVE (Platform will break)
These components are essential for basic platform functionality:

**Core Infrastructure:**
- `app/layout.tsx` - Root layout, removing breaks entire app
- `app/page.tsx` - Homepage, main entry point
- `app/globals.css` - Global styles, removing breaks styling
- `providers/auth-provider.tsx` - Authentication system
- `providers/cart-provider.tsx` - Shopping cart functionality
- `hooks/use-auth.ts` - Authentication hook
- `hooks/use-cart.ts` - Cart hook
- `lib/api.ts` - API client for backend communication
- `lib/types.ts` - TypeScript definitions
- `lib/utils.ts` - Utility functions

**Essential Components:**
- `components/header.tsx` - Main navigation
- `components/error-boundary.tsx` - Error handling
- `components/featured-listings.tsx` - Product display
- `components/ui/button.tsx` - Used everywhere
- `components/ui/card.tsx` - Product cards
- `components/ui/input.tsx` - Forms
- `components/ui/product-card.tsx` - Product display

### ⚠️ MODERATE IMPACT - Remove with caution
These can be removed but may affect user experience:

**Authentication Pages:**
- `app/login/` - Can remove if using external auth
- `app/register/` - Can remove if using external auth

**Feature Pages:**
- `app/admin/` - Remove if no admin features needed
- `app/messages/` - Remove if no messaging system
- `app/notifications/` - Remove if no notification system
- `app/help/` - Remove if no support system

**Optional Components:**
- `components/hero-carousel.tsx` - Visual enhancement only
- `components/search-bar.tsx` - If search not needed
- `components/footer.tsx` - Informational only

### ✅ SAFE TO REMOVE - Low/No impact
These can be safely removed without breaking core functionality:

**Development Tools:**
- `scripts/optimize-images.js`
- `scripts/rename-images.js`
- `scripts/update-constants.js`

**Optional Features:**
- `app/about/` - Static content
- `components/verification-banner.tsx` - Feature enhancement
- `components/breadcrumb.tsx` - Navigation aid
- `hooks/use-performance.ts` - Development tool
- `hooks/use-window-size.ts` - UI enhancement

**Assets:**
- Most images in `public/images/` (keep essential ones)
- `public/videos/` - If not using videos
- `public/mock-users.json` - Development data

**UI Components (if not used):**
- `components/ui/accordion.tsx`
- `components/ui/alert-dialog.tsx`
- `components/ui/checkbox.tsx`
- `components/ui/popover.tsx`
- `components/ui/sheet.tsx`
- `components/ui/tabs.tsx`

### 📋 Removal Checklist

Before removing any component:

1. **Check Dependencies**: Search codebase for imports
2. **Test Core Flows**: Ensure login, browsing, cart still work
3. **Update Types**: Remove unused type definitions
4. **Clean Imports**: Remove unused import statements
5. **Update Navigation**: Remove links to deleted pages
6. **Test Build**: Ensure application still builds successfully

### 🔧 Safe Removal Process

1. **Mark components** with ❌ in checkboxes above
2. **Start with SAFE TO REMOVE** items first
3. **Test after each removal** to ensure stability
4. **Keep backups** of removed files until testing complete
5. **Update documentation** after successful removals

## Recommendations

### 🚀 Immediate Actions (High Priority)

#### 1. Fix Type System Issues
```typescript
// Consolidate ExpatInfo interface
export interface ExpatInfo {
  id: string
  name: string
  avatar?: string
  verified: boolean
  rating?: number
  reviewCount?: number
  location?: string
  responseTime?: string
  profileSlug?: string
}

// Standardize verification interface
export interface VerificationStatus {
  isFullyVerified: boolean
  isIdentityVerified: boolean
  isOrganizationEmailVerified: boolean
  canBuy: boolean
  canSell: boolean  // Remove canList
  canContact: boolean
  currentStep: 'identity' | 'organization' | 'complete' | null
  pendingActions: string[]
}
```

#### 2. Implement Data Layer Separation
```
lib/
├── api/
│   ├── client.ts           # API client
│   ├── endpoints/          # Endpoint definitions
│   └── types.ts           # API-specific types
├── data/
│   ├── mock/              # Mock data (dev only)
│   └── constants.ts       # App constants only
└── utils/
    ├── auth.ts            # Auth utilities
    └── validation.ts      # Form validation
```

#### 3. Component Architecture Improvements
```
components/
├── ui/                    # Base components
├── layout/               # Layout components
│   ├── Header/
│   │   ├── index.tsx
│   │   ├── UserNavigation.tsx
│   │   ├── GuestNavigation.tsx
│   │   └── MobileMenu.tsx
│   └── Footer/
├── features/             # Feature-specific
│   ├── auth/
│   ├── cart/
│   ├── products/
│   └── messaging/
└── common/               # Shared components
```

### 🔧 Medium Priority Improvements

#### 4. Performance Optimizations
- Implement proper image optimization with Next.js Image
- Add bundle analysis and code splitting
- Implement lazy loading for non-critical components
- Add service worker for offline functionality

#### 5. Testing Infrastructure
- Add component testing for critical paths
- Implement E2E testing for user flows
- Add visual regression testing
- Mock API responses for consistent testing

#### 6. Developer Experience
- Add Storybook for component documentation
- Implement proper TypeScript strict mode
- Add pre-commit hooks for code quality
- Create component templates and generators

### 🎯 Long-term Strategic Improvements

#### 7. Backend Integration
- Implement real API endpoints
- Add authentication middleware
- Implement real-time features with WebSockets
- Add proper error handling and retry logic

#### 8. Scalability Preparations
- Implement proper state management (Zustand/Redux)
- Add internationalization (i18n)
- Implement proper caching strategies
- Add monitoring and analytics

#### 9. Security Enhancements
- Implement proper CSRF protection
- Add rate limiting
- Implement proper session management
- Add security headers and CSP

## Conclusion

The Next.js platform demonstrates solid architectural foundations with modern React patterns and Next.js 15 features. However, several critical issues need immediate attention:

1. **Type system inconsistencies** that could cause runtime errors
2. **Mock data mixed with production code** affecting bundle size
3. **Incomplete backend integration** with numerous TODO items
4. **Component complexity** that impacts maintainability

Addressing these issues will significantly improve code quality, maintainability, and developer experience while preparing the platform for production deployment.

The recommended approach is to tackle high-priority issues first, focusing on type safety and data layer separation, followed by component architecture improvements and performance optimizations.
