# Technical Product Requirements Document

# Global Expat Belongings Marketplace Platform

## Part 1: Overview, Architecture & Current Implementation

**Document Version:** 2.0  
**Last Updated:** December 10, 2025  
**Platform Status:** Frontend Implemented, Backend Integration Required

---

## Executive Summary

This document provides comprehensive technical specifications for the **Global Expat Marketplace Platform**, a web-based marketplace designed to facilitate the sale of belongings within the international expat community, with initial focus on UN organizations and embassy staff globally.

### Current Implementation Status

**✅ Completed (Frontend)**

- Modern Next.js 15 + React 19 + TypeScript architecture
- 30+ pages with full routing system
- 56+ UI components with accessibility features
- Responsive mobile-first design
- Authentication UI flow (OTP-based)
- Product listing and browsing interfaces
- Shopping cart system
- Messaging interface
- Admin dashboard UI
- Multi-currency support UI (TZS, KES, UGX, USD)

**🔄 In Progress**

- Backend API integration
- Database implementation
- Email service integration
- Image storage service
- Real-time notifications

**❌ Not Started**

- Payment gateway integration (future enhancement)
- Advanced search filters
- Social media integration
- Analytics dashboard

---

## 1. Introduction

### 1.1 Platform Overview

The **Global Expat Marketplace** is a premium marketplace platform designed specifically for the international expat community. Originally conceived for UN and embassy staff in Tanzania, the platform has evolved to serve expats globally across multiple regions:

**Primary Markets:**

- **Africa**: Tanzania, Kenya, Uganda, Rwanda, South Africa, Nigeria
- **Asia**: Dubai, Singapore, Hong Kong, Bangkok
- **Europe**: London, Berlin, Amsterdam, Zurich
- **Americas**: New York, Toronto, São Paulo, Mexico City
- **Oceania**: Sydney, Auckland

### 1.2 Evolution from Original Concept

**Original Vision (May 2024):**

- Email-based verification for UN/Embassy staff
- Tanzania-focused marketplace
- Basic item listings
- Admin-managed platform

**Current Vision (December 2025):**

- Global expat community platform
- Multi-region support with localization
- Premium marketplace experience
- Advanced verification system (Individual, Expert, UN/Embassy, Corporate)
- Comprehensive e-commerce features
- Mobile-optimized PWA
- Multi-currency and multi-language support

### 1.3 Key Features

#### Implemented Features (Frontend)

**User Experience**

- ✅ OTP-based authentication (UI complete)
- ✅ Guest browsing capabilities
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Dark mode support preparation
- ✅ Accessibility compliance (WCAG 2.1)

**Product Management**

- ✅ Category-based browsing (8 main categories)
- ✅ Product listing creation interface
- ✅ Image upload interface with validation
- ✅ Product search and filtering UI
- ✅ Featured listings showcase
- ✅ Product detail pages

**Commerce Features**

- ✅ Shopping cart management
- ✅ Wishlist/favorites
- ✅ Checkout flow UI
- ✅ Order tracking interface
- ✅ Multi-currency display

**Communication**

- ✅ Messaging interface (buyer-seller)
- ✅ Notification center UI
- ✅ Contact seller forms

**Administration**

- ✅ Admin dashboard UI
- ✅ Listing management interface
- ✅ User management UI
- ✅ Analytics display components

#### Required Backend Implementation

**Critical Path Items**

- ❌ PostgreSQL database setup
- ❌ Spring Boot REST API
- ❌ OTP email service integration
- ❌ Image storage service (AWS S3/equivalent)
- ❌ JWT authentication
- ❌ Real-time messaging backend
- ❌ Admin notification system
- ❌ Product search indexing

---

## 2. System Architecture

### 2.1 Current Tech Stack

#### Frontend (Implemented)

```
Framework:        Next.js 15.2.4 (App Router)
UI Library:       React 19
Language:         TypeScript 5
Styling:          TailwindCSS 3.4.17
Components:       Radix UI (complete suite)
Icons:            Lucide React 0.454.0
Forms:            React Hook Form 7.54.1 + Zod 3.24.1
State:            React Context (Auth, Cart)
Image Handling:   Next.js Image + Sharp
Testing:          Vitest
```

#### Backend (Required)

```
Framework:        Spring Boot 3.x (as per original spec)
Language:         Java 17+
Database:         PostgreSQL 15+
ORM:              Spring Data JPA
Security:         Spring Security + JWT
Email:            SendGrid/AWS SES
Storage:          AWS S3/Cloudinary
Cache:            Redis (optional, for performance)
```

### 2.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT TIER (Implemented)                   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   Next.js Frontend (Port 3000)                            │  │
│  │   - 30+ Pages (SSR/SSG)                                  │  │
│  │   - 56+ UI Components                                    │  │
│  │   - Context Providers (Auth, Cart)                       │  │
│  │   - API Client Layer                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                   APPLICATION TIER (Required)                    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   Spring Boot API (Port 8080)                            │  │
│  │   - REST Controllers                                     │  │
│  │   - Service Layer                                        │  │
│  │   - Security Layer (JWT)                                 │  │
│  │   - Validation Layer                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                     DATA TIER (Required)                         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  PostgreSQL  │  │  Redis Cache │  │   AWS S3     │         │
│  │   (Primary)  │  │  (Optional)  │  │   (Images)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES (Required)                   │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   SendGrid   │  │  Cloudinary  │  │   Stripe     │         │
│  │    (Email)   │  │  (Images)    │  │  (Future)    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Component Architecture

#### Frontend Component Structure (Current)

```
/app                              # Next.js App Router pages
  /                               # Homepage
  /login, /register               # Auth pages
  /browse, /search                # Discovery pages
  /category/[slug]                # Category pages
  /product/[id]                   # Product details
  /cart, /checkout                # Commerce
  /messages, /notifications       # Communication
  /account/*                      # User dashboard
  /sell                           # Seller interface
  /admin/dashboard                # Admin panel

/components                       # Reusable components
  /ui                            # 56+ Base UI components
  /header, /footer               # Layout components
  /featured-listings             # Product displays
  /category-sidebar              # Navigation
  /search-bar                    # Search interface

/lib                              # Utilities & helpers
  /api                           # API client layer
  /constants                     # App constants
  /types                         # TypeScript definitions
  /utils                         # Helper functions

/providers                        # State management
  /auth-provider                 # Authentication context
  /cart-provider                 # Shopping cart context
```

### 2.4 Data Flow Architecture

```
User Action (Frontend)
       ↓
Form Validation (Zod Schema)
       ↓
API Client Request (lib/api)
       ↓
       ↓ [Backend Required]
       ↓
Spring Boot Controller
       ↓
Service Layer (Business Logic)
       ↓
Repository Layer (JPA)
       ↓
PostgreSQL Database
       ↓
Response Transformation
       ↓
JSON Response
       ↓
Frontend State Update
       ↓
UI Re-render (React)
```

---

## 3. Current Frontend Implementation

### 3.1 Routing Structure (Next.js App Router)

**Authentication & User Management**

- `/login` - OTP-based authentication
- `/register` - User registration (auto-create on first login)
- `/reset-password` - Password recovery (future)
- `/account` - User dashboard hub
- `/account/settings` - Profile management
- `/account/verification` - Verification status
- `/account/orders` - Order history
- `/account/addresses` - Saved addresses
- `/account/payment-methods` - Payment preferences
- `/account/wishlist` - Saved items

**Product Discovery**

- `/` - Homepage with featured listings
- `/browse` - All products with filters
- `/search` - Search results
- `/category/[slug]` - Category-specific listings
  - automotive, home-furniture, electronics-tech
  - games-toys, fashion-style, fitness-sports
  - books-media, arts-crafts
- `/product/[id]` - Product detail page

**Commerce Flow**

- `/cart` - Shopping cart
- `/checkout` - Checkout process
- `/checkout/success` - Order confirmation

**Communication**

- `/messages` - Buyer-seller messaging
- `/notifications` - Activity notifications

**Seller Features**

- `/sell` - Create new listing
- `/profiles` - Seller profiles

**Admin Panel**

- `/admin/dashboard` - Admin overview

**Support & Legal**

- `/about` - Platform information
- `/contact` - Contact form
- `/help` - Help center
- `/faq` - Frequently asked questions
- `/privacy` - Privacy policy
- `/terms` - Terms of service

### 3.2 Component Library (56+ Components)

**Layout & Navigation**

- Header, Footer, Breadcrumb
- Sidebar, Navigation Menu
- Mobile Sidebar Toggle

**Forms & Inputs**

- Input, Textarea, Select, Checkbox, Radio, Switch
- Form, Label, Input OTP
- Calendar, Date Picker
- Slider, Progress

**Data Display**

- Card (with Header, Content, Footer variants)
- Badge, Status Badge
- Avatar, Tooltip
- Table, Pagination
- Product Card (specialized)

**Feedback & Overlays**

- Dialog, Alert Dialog, Sheet, Drawer
- Toast, Sonner, Alert
- Skeleton (loading states)
- Popover, Hover Card, Context Menu

**Interactive**

- Button (6 variants)
- Dropdown Menu, Command, Menubar
- Accordion, Collapsible, Tabs, Toggle
- Carousel, Scroll Area
- Resizable Panels

### 3.3 State Management

**Authentication Context (AuthProvider)**

```typescript
interface AuthContext {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string) => Promise<void>
  logout: () => void
  verifyOTP: (code: string) => Promise<void>
}
```

**Cart Context (CartProvider)**

```typescript
interface CartContext {
  items: CartItem[]
  itemCount: number
  total: number
  addItem: (item: Product) => void
  removeItem: (itemId: number) => void
  updateQuantity: (itemId: number, quantity: number) => void
  clearCart: () => void
}
```

### 3.4 Design System Implementation

**Color Palette (Current)**

```css
/* Brand Colors */
--brand-primary: #1e40af; /* Blue-800 */
--brand-secondary: #f59e0b; /* Amber-500 */
--brand-accent: #06b6d4; /* Cyan-500 */

/* Status Colors */
--status-success: #10b981; /* Emerald-500 */
--status-error: #ef4444; /* Red-500 */
--status-warning: #f97316; /* Orange-500 */

/* Recommended Update (See Platform Analysis) */
--deep-tanzanite-blue: #1e3a8a;
--kilimanjaro-gold: #f59e0b;
--futuristic-cyan: #06b6d4;
```

**Typography System**

```css
/* Current */
font-family-sans: Inter, sans-serif;
font-family-display: Lexend, sans-serif;

/* Recommended Luxury Stack */
font-family-sans: 'Proxima Nova', 'Avenir Next', 'SF Pro Display', Inter;
font-family-display: 'Space Grotesk', Outfit, Inter;
```

**Spacing Scale**

- Base: 8px units
- Component: 16px, 24px, 32px, 48px
- Section: 64px, 80px, 96px

**Responsive Breakpoints**

```typescript
sm: '640px'   // Mobile landscape
md: '768px'   // Tablet
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop
2xl: '1400px' // Extra large
```

---

## 4. User Workflows (Current Implementation)

### 4.1 Authentication Flow (Frontend Complete)

```
User visits site
      ↓
Browse as guest (optional)
      ↓
Click "Login/Register"
      ↓
Enter email address
      ↓
[Backend Required: Generate & Send OTP]
      ↓
Enter OTP code
      ↓
[Backend Required: Verify OTP]
      ↓
[Backend Required: Check if user exists]
      ↓
If new: Create user account
      ↓
[Backend Required: Check email domain]
      ↓
Set verification status
      ↓
[Backend Required: Generate JWT token]
      ↓
Store authentication state
      ↓
Redirect to homepage/dashboard
```

### 4.2 Item Listing Flow (Frontend Complete)

```
Authenticated user clicks "Sell"
      ↓
Fill listing form:
  - Title (required)
  - Description (required)
  - Category (required)
  - Condition (required)
  - Price (required)
  - Location (required)
  - Images (category-specific requirements)
      ↓
Frontend validation (Zod schema)
      ↓
[Backend Required: Upload images to S3]
      ↓
[Backend Required: Create listing in database]
      ↓
[Backend Required: Return listing ID]
      ↓
Show success message
      ↓
Redirect to listing page
```

### 4.3 Buying Flow (Frontend Complete)

```
User browses/searches products
      ↓
View product details
      ↓
Click "Add to Cart" or "Contact Seller"
      ↓
If not logged in: Redirect to login
      ↓
[Backend Required: Check buyer verification]
      ↓
If verified:
  - Add to cart OR
  - Open message dialog
      ↓
Complete checkout OR
Send message to seller
      ↓
[Backend Required: Process transaction/message]
      ↓
Show confirmation
```

### 4.4 Admin Monitoring Flow (UI Complete)

```
Admin logs in
      ↓
Access admin dashboard
      ↓
View metrics:
  - Active listings
  - Overdue listings (>2 weeks)
  - User statistics
  - Recent activities
      ↓
[Backend Required: Query overdue items]
      ↓
Review overdue listings
      ↓
Send notification (up to 3)
      ↓
[Backend Required: Track notification count]
      ↓
If no response after 3 notifications:
  Archive listing
      ↓
[Backend Required: Update item status]
```

---

## 5. Integration Points

### 5.1 Frontend API Client Structure

**Current Implementation (lib/api.ts)**

```typescript
class APIClient {
  // Authentication
  async login(email: string): Promise<void>
  async verifyOTP(code: string): Promise<AuthResponse>
  async logout(): Promise<void>

  // Products
  async getProducts(filters?: ProductFilters): Promise<Product[]>
  async getProduct(id: number): Promise<Product>
  async createProduct(data: ProductData): Promise<Product>
  async updateProduct(id: number, data: ProductData): Promise<Product>
  async deleteProduct(id: number): Promise<void>

  // Categories
  async getCategories(): Promise<Category[]>

  // Cart
  async getCart(): Promise<Cart>
  async addToCart(itemId: number): Promise<Cart>
  async updateCartItem(itemId: number, quantity: number): Promise<Cart>

  // Messages
  async getMessages(): Promise<Message[]>
  async sendMessage(data: MessageData): Promise<Message>

  // Notifications
  async getNotifications(): Promise<Notification[]>
  async markNotificationRead(id: number): Promise<void>
}
```

### 5.2 Expected Backend API Endpoints

**See Part 2 for complete API specifications**

---

## 6. Performance & Optimization

### 6.1 Current Optimizations (Frontend)

**Build-Time Optimizations**

- Server-side rendering (SSR) for SEO
- Static generation (SSG) for static pages
- Automatic code splitting per route
- Tree shaking and dead code elimination
- Image optimization with Next.js Image

**Runtime Optimizations**

- React 19 concurrent features
- Component memoization with React.memo
- Virtual scrolling for long lists (planned)
- Lazy loading for images and components
- Font optimization with variable fonts

**Bundle Analysis**

```bash
npm run build:analyze  # Bundle size analysis
```

### 6.2 Required Backend Optimizations

**Database**

- Indexing on frequently queried columns
- Query optimization with JPA
- Connection pooling
- Pagination for large datasets

**Caching**

- Redis for session storage (optional)
- API response caching
- Static asset CDN

**Performance Targets**

- API response time: < 200ms (p95)
- Page load time: < 2s (First Contentful Paint)
- Time to Interactive: < 3s

---

## Next Steps

Continue to **Part 2** for:

- Complete database schema
- API endpoint specifications
- Authentication & authorization details
- Data validation rules

Then review **Part 3** for:

- Gap analysis
- Implementation roadmap
- Testing requirements
- Deployment strategy
