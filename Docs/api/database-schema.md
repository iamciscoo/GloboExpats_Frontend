# Database Schema Documentation

**GlobalExpat Marketplace Backend Database Design**

## Overview

This document outlines the complete database schema for the GlobalExpat Marketplace platform. The schema is designed to support a verified marketplace for expat professionals with comprehensive user verification, product listings, messaging, and transaction management.

## Core Database Tables

### 1. Users Table

**Primary user account and authentication data**

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  organization_email VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  role ENUM('user', 'admin', 'moderator') DEFAULT 'user',
  signup_method ENUM('email', 'google', 'facebook', 'apple') DEFAULT 'email',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  INDEX idx_email (email),
  INDEX idx_organization_email (organization_email),
  INDEX idx_role (role),
  INDEX idx_created_at (created_at)
);
```

### 2. User Verification Table

**Comprehensive verification tracking for user capabilities**

```sql
CREATE TABLE user_verification (
  user_id VARCHAR(36) PRIMARY KEY,
  is_fully_verified BOOLEAN DEFAULT FALSE,
  is_identity_verified BOOLEAN DEFAULT FALSE,
  is_organization_email_verified BOOLEAN DEFAULT FALSE,
  can_buy BOOLEAN DEFAULT FALSE,
  can_sell BOOLEAN DEFAULT FALSE,
  can_contact BOOLEAN DEFAULT FALSE,
  current_step ENUM('identity', 'organization', 'complete') NULL,
  pending_actions JSON, -- Array of actions: ['upload_documents', 'verify_email', 'admin_review']
  verification_documents JSON, -- Uploaded document references
  verification_notes TEXT,
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_verification_status (is_fully_verified, can_buy, can_sell)
);
```

### 3. User Preferences Table

**User personalization and settings**

```sql
CREATE TABLE user_preferences (
  user_id VARCHAR(36) PRIMARY KEY,
  currency VARCHAR(3) DEFAULT 'TZS',
  language VARCHAR(5) DEFAULT 'en',
  theme ENUM('light', 'dark', 'system') DEFAULT 'system',
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 4. Categories Table

**Product categories and hierarchical organization**

```sql
CREATE TABLE categories (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50), -- Lucide icon name
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_slug (slug),
  INDEX idx_active_sort (is_active, sort_order)
);
```

### 5. Products/Listings Table

**Main product listings in the marketplace**

```sql
CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  seller_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id VARCHAR(36) NOT NULL,
  condition_value ENUM('new', 'like-new', 'excellent', 'very-good', 'good', 'fair') NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  original_price DECIMAL(12,2),
  currency VARCHAR(3) NOT NULL,
  location VARCHAR(100) NOT NULL,
  status ENUM('active', 'sold', 'pending', 'draft', 'expired') DEFAULT 'draft',
  is_premium BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  inquiry_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  sold_at TIMESTAMP NULL,

  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  INDEX idx_seller (seller_id),
  INDEX idx_category (category_id),
  INDEX idx_status (status),
  INDEX idx_location (location),
  INDEX idx_price (price),
  INDEX idx_created_at (created_at),
  INDEX idx_search (title, description),
  FULLTEXT INDEX ft_search (title, description)
);
```

### 6. Product Images Table

**Image storage for product listings**

```sql
CREATE TABLE product_images (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  product_id VARCHAR(36) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_main_image BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  alt_text VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id),
  INDEX idx_main_image (product_id, is_main_image),
  INDEX idx_sort (product_id, sort_order)
);
```

### 7. Seller Profiles Table

**Enhanced seller information and reputation**

```sql
CREATE TABLE seller_profiles (
  user_id VARCHAR(36) PRIMARY KEY,
  business_type ENUM('individual', 'company', 'organization') DEFAULT 'individual',
  company_name VARCHAR(255),
  vat_number VARCHAR(50),
  business_license VARCHAR(100),
  bio TEXT,
  website VARCHAR(500),
  specialties JSON, -- Array of specialty areas
  languages JSON, -- Array of supported languages
  response_time VARCHAR(50), -- e.g., "within 2 hours"
  location VARCHAR(100),
  total_listings INT DEFAULT 0,
  completed_sales INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INT DEFAULT 0,
  member_since DATE,
  last_active TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_rating (rating),
  INDEX idx_location (location),
  INDEX idx_last_active (last_active)
);
```

### 8. Conversations Table

**Messaging system between users**

```sql
CREATE TABLE conversations (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  participant1_id VARCHAR(36) NOT NULL,
  participant2_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36), -- Optional reference to discussed product
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (participant1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (participant2_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  UNIQUE KEY unique_conversation (participant1_id, participant2_id, product_id),
  INDEX idx_participants (participant1_id, participant2_id),
  INDEX idx_product (product_id),
  INDEX idx_updated_at (updated_at)
);
```

### 9. Messages Table

**Individual messages within conversations**

```sql
CREATE TABLE messages (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  conversation_id VARCHAR(36) NOT NULL,
  sender_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_conversation (conversation_id),
  INDEX idx_sender (sender_id),
  INDEX idx_read_status (conversation_id, is_read),
  INDEX idx_created_at (created_at)
);
```

### 10. Orders Table

**Transaction and order management**

```sql
CREATE TABLE orders (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  buyer_id VARCHAR(36) NOT NULL,
  seller_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  shipping_address JSON,
  tracking_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,

  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_buyer (buyer_id),
  INDEX idx_seller (seller_id),
  INDEX idx_product (product_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

### 11. Reviews Table

**User reviews and ratings system**

```sql
CREATE TABLE reviews (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_id VARCHAR(36) NOT NULL,
  reviewer_id VARCHAR(36) NOT NULL,
  reviewed_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (reviewer_id) REFERENCES users(id),
  FOREIGN KEY (reviewed_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  UNIQUE KEY unique_review (order_id, reviewer_id),
  INDEX idx_reviewed_user (reviewed_id),
  INDEX idx_product (product_id),
  INDEX idx_rating (rating),
  INDEX idx_created_at (created_at)
);
```

### 12. Notifications Table

**System notifications for users**

```sql
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  type ENUM('message', 'order', 'review', 'payment', 'system') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(500),
  metadata JSON, -- Additional notification-specific data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_unread (user_id, is_read),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
);
```

### 13. Wishlist Table

**User wishlist/favorites functionality**

```sql
CREATE TABLE wishlist (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_wishlist_item (user_id, product_id),
  INDEX idx_user (user_id),
  INDEX idx_product (product_id)
);
```

### 14. Shopping Cart Table

**Persistent shopping cart for users**

```sql
CREATE TABLE shopping_cart (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cart_item (user_id, product_id),
  INDEX idx_user (user_id)
);
```

### 15. Search History Table

**User search analytics and suggestions**

```sql
CREATE TABLE search_history (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36),
  search_query VARCHAR(500) NOT NULL,
  search_filters JSON, -- Store filter options used
  results_count INT DEFAULT 0,
  clicked_product_id VARCHAR(36),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (clicked_product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_query (search_query),
  INDEX idx_created_at (created_at),
  FULLTEXT INDEX ft_search_query (search_query)
);
```

### 16. System Settings Table

**Application configuration and feature flags**

```sql
CREATE TABLE system_settings (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSON NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE, -- Whether setting can be read by frontend
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_key (setting_key),
  INDEX idx_public (is_public)
);
```

## API Endpoints Required

### Authentication & Users

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh session token
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/verify-organization-email` - Organization email verification
- `POST /api/auth/reset-password` - Password reset request
- `GET /api/users/me` - Current user profile
- `PATCH /api/users/me` - Update user profile
- `GET /api/users/{id}` - Public user profile

### Products & Listings

- `GET /api/products` - List products with filtering/search
- `GET /api/products/featured` - Featured products for homepage
- `GET /api/products/{id}` - Single product details
- `POST /api/products` - Create new listing
- `PATCH /api/products/{id}` - Update listing
- `DELETE /api/products/{id}` - Delete listing
- `POST /api/products/{id}/images` - Upload product images
- `DELETE /api/products/{id}/images/{imageId}` - Delete product image

### Categories & Search

- `GET /api/categories` - List all categories
- `GET /api/search` - Product search with filters
- `GET /api/search/suggestions` - Search autocomplete

### Messaging

- `GET /api/conversations` - User's conversations
- `GET /api/conversations/{id}/messages` - Messages in conversation
- `POST /api/conversations` - Start new conversation
- `POST /api/conversations/{id}/messages` - Send message
- `PATCH /api/messages/{id}/read` - Mark message as read

### Orders & Reviews

- `GET /api/orders` - User's orders
- `POST /api/orders` - Create new order
- `PATCH /api/orders/{id}` - Update order status
- `GET /api/reviews` - Product/seller reviews
- `POST /api/reviews` - Create review
- `PATCH /api/reviews/{id}` - Update review

### Wishlist & Cart

- `GET /api/wishlist` - User's wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/{productId}` - Remove from wishlist
- `GET /api/cart` - User's cart
- `POST /api/cart` - Add to cart
- `PATCH /api/cart/{productId}` - Update cart quantity
- `DELETE /api/cart/{productId}` - Remove from cart

### Notifications

- `GET /api/notifications` - User notifications
- `PATCH /api/notifications/{id}/read` - Mark notification as read
- `POST /api/notifications/mark-all-read` - Mark all as read

### Admin

- `GET /api/admin/users` - Admin user management
- `PATCH /api/admin/users/{id}/verification` - Update verification status
- `GET /api/admin/products` - Admin product management
- `GET /api/admin/reports` - Platform analytics

## Data Validation Rules

### User Registration

- Email must be valid format and unique
- Password minimum 8 characters with mixed case, numbers, symbols
- Organization email must be from verified domain list
- Name must be 2-100 characters

### Product Listings

- Title: 5-255 characters, required
- Description: 10-5000 characters, required
- Price: Must be positive number, max 2 decimal places
- Images: At least 1 main image required, max 10 total
- Category: Must exist in categories table
- Location: Must be from approved locations list

### Verification Requirements

- Identity verification: Government ID upload
- Organization email: Must match company domain
- Full verification required for selling privileges

## Indexes and Performance

### Critical Indexes

- Products: status, category, location, price range
- Users: email, verification status
- Messages: conversation + timestamp for pagination
- Search: Full-text indexes on product title/description
- Notifications: user + read status for quick unread counts

### Caching Strategy

- Product listings: Cache for 5-15 minutes
- User profiles: Cache for 1 hour
- Categories: Cache for 24 hours
- Search results: Cache for 2-5 minutes
- Conversation lists: Cache for 2 minutes

## File Storage

### Image Storage Requirements

- Product images: WebP format, multiple sizes (thumbnail, medium, large)
- User avatars: 200x200px max
- Verification documents: Secure encrypted storage
- CDN integration for global delivery

### File Naming Convention

```
/products/{product-id}/{image-id}-{size}.webp
/avatars/{user-id}.webp
/verification/{user-id}/{document-type}-{timestamp}.pdf
```

## Security Considerations

### Data Protection

- All passwords hashed with bcrypt (min 12 rounds)
- Sensitive verification documents encrypted at rest
- PII data anonymization for deleted accounts
- GDPR compliance for data export/deletion

### Rate Limiting

- API endpoints: 100 requests/minute per user
- Search: 50 requests/minute per IP
- File uploads: 10 uploads/minute per user
- Message sending: 20 messages/minute per user

### Authentication

- JWT tokens with 1-hour expiration
- Refresh tokens with 30-day expiration
- Session invalidation on logout
- Multi-factor authentication for high-value transactions

This schema provides a solid foundation for the GlobalExpat marketplace platform with room for future expansion and optimization.
