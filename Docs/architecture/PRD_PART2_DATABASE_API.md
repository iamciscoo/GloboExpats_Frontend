# Technical Product Requirements Document

# Global Expat Belongings Marketplace Platform

## Part 2: Database Schema & API Specifications

**Document Version:** 2.0  
**Last Updated:** December 10, 2025  
**Status:** Backend Implementation Required

---

## 1. Database Schema (PostgreSQL)

### 1.1 Core Tables

#### Table: `users`

```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone_number VARCHAR(20),
    avatar_url VARCHAR(500),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),

    -- Verification system
    is_verified_buyer BOOLEAN DEFAULT false,
    verification_level VARCHAR(20) DEFAULT 'none'
        CHECK (verification_level IN ('none', 'individual', 'expert', 'un_embassy', 'corporate')),
    verification_date TIMESTAMP,

    -- Account status
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,

    -- Profile information
    bio TEXT,
    location VARCHAR(255),
    country VARCHAR(100),
    languages VARCHAR(255)[], -- Array of language codes

    -- Seller information
    seller_rating DECIMAL(3,2) DEFAULT 0.00,
    total_sales INTEGER DEFAULT 0,
    response_time_hours INTEGER,

    -- Authentication
    last_login TIMESTAMP,
    last_otp_sent TIMESTAMP,
    otp_attempts INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    CONSTRAINT valid_rating CHECK (seller_rating >= 0 AND seller_rating <= 5)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_verification_level ON users(verification_level);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

#### Table: `allowed_domains`

```sql
CREATE TABLE allowed_domains (
    domain_id SERIAL PRIMARY KEY,
    domain VARCHAR(255) UNIQUE NOT NULL,
    organization_name VARCHAR(255),
    organization_type VARCHAR(50) CHECK (organization_type IN ('un', 'embassy', 'ngo', 'corporate')),
    verification_level VARCHAR(20) DEFAULT 'expert'
        CHECK (verification_level IN ('expert', 'un_embassy', 'corporate')),
    country VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO allowed_domains (domain, organization_name, organization_type, verification_level) VALUES
('un.org', 'United Nations', 'un', 'un_embassy'),
('undp.org', 'UN Development Programme', 'un', 'un_embassy'),
('unicef.org', 'UNICEF', 'un', 'un_embassy'),
('unesco.org', 'UNESCO', 'un', 'un_embassy');

CREATE INDEX idx_allowed_domains_domain ON allowed_domains(domain);
```

#### Table: `categories`

```sql
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR(50), -- Lucide icon name
    parent_category_id INTEGER REFERENCES categories(category_id),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,

    -- Image requirements for listings
    min_images INTEGER DEFAULT 1,
    max_images INTEGER DEFAULT 10,
    required_image_types VARCHAR(50)[], -- e.g., ['front', 'side', 'back'] for vehicles

    item_count INTEGER DEFAULT 0, -- Denormalized for performance

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample categories (matching frontend constants)
INSERT INTO categories (name, slug, icon_name, required_image_types, min_images) VALUES
('Automotive', 'automotive', 'Car', ARRAY['front', 'side', 'interior'], 3),
('Home & Furniture', 'home-furniture', 'Home', ARRAY['main', 'detail'], 2),
('Electronics & Tech', 'electronics-tech', 'Smartphone', ARRAY['main', 'detail'], 2),
('Games & Toys', 'games-toys', 'Gamepad2', ARRAY['main'], 1),
('Fashion & Style', 'fashion-style', 'Shirt', ARRAY['main', 'detail'], 2),
('Fitness & Sports', 'fitness-sports', 'Dumbbell', ARRAY['main'], 1),
('Books & Media', 'books-media', 'Book', ARRAY['cover'], 1),
('Arts & Crafts', 'arts-crafts', 'Palette', ARRAY['main'], 1);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_category_id);
```

#### Table: `items` (Products)

```sql
CREATE TABLE items (
    item_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(category_id),
    seller_id INTEGER NOT NULL REFERENCES users(user_id),

    -- Pricing
    price DECIMAL(12,2) NOT NULL,
    original_price DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'TZS' CHECK (currency IN ('TZS', 'KES', 'UGX', 'USD', 'EUR', 'GBP')),

    -- Item details
    condition VARCHAR(20) NOT NULL CHECK (condition IN ('new', 'like-new', 'excellent', 'very-good', 'good', 'fair')),
    brand VARCHAR(100),
    model VARCHAR(100),
    year_of_manufacture INTEGER,

    -- Location
    location VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),

    -- Shipping
    shipping_available BOOLEAN DEFAULT false,
    local_pickup BOOLEAN DEFAULT true,

    -- Status management
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'sold', 'archived', 'pending_review')),
    listing_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP,
    sold_date TIMESTAMP,

    -- Engagement metrics
    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    inquiry_count INTEGER DEFAULT 0,

    -- Admin management
    is_featured BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    admin_notification_count INTEGER DEFAULT 0,
    last_admin_notification TIMESTAMP,

    -- SEO
    slug VARCHAR(300) UNIQUE,
    meta_description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_price CHECK (price > 0),
    CONSTRAINT valid_dates CHECK (listing_date <= CURRENT_TIMESTAMP)
);

-- Critical indexes for performance
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_seller ON items(seller_id);
CREATE INDEX idx_items_listing_date ON items(listing_date DESC);
CREATE INDEX idx_items_price ON items(price);
CREATE INDEX idx_items_location ON items(country, location);
CREATE INDEX idx_items_featured ON items(is_featured) WHERE is_featured = true;
CREATE INDEX idx_items_overdue ON items(listing_date, status)
    WHERE status = 'active' AND listing_date < (CURRENT_TIMESTAMP - INTERVAL '14 days');
```

#### Table: `images`

```sql
CREATE TABLE images (
    image_id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(item_id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),

    -- Image metadata
    type VARCHAR(50), -- e.g., 'front', 'side', 'main', 'detail'
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,

    -- Storage details
    file_name VARCHAR(255),
    file_size INTEGER, -- in bytes
    width INTEGER,
    height INTEGER,
    format VARCHAR(10), -- jpeg, png, webp

    -- Cloud storage reference
    storage_provider VARCHAR(50) DEFAULT 's3', -- s3, cloudinary
    storage_key VARCHAR(500),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT one_primary_per_item UNIQUE (item_id, is_primary) WHERE is_primary = true
);

CREATE INDEX idx_images_item ON images(item_id);
CREATE INDEX idx_images_primary ON images(item_id, is_primary) WHERE is_primary = true;
```

#### Table: `messages`

```sql
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(user_id),
    receiver_id INTEGER NOT NULL REFERENCES users(user_id),
    item_id INTEGER REFERENCES items(item_id), -- Optional, can be general message

    message_text TEXT NOT NULL,

    -- Conversation threading
    conversation_id VARCHAR(100), -- Generated: "user1_user2_item" or "user1_user2"
    parent_message_id INTEGER REFERENCES messages(message_id),

    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    is_deleted_by_sender BOOLEAN DEFAULT false,
    is_deleted_by_receiver BOOLEAN DEFAULT false,

    -- Attachments (optional)
    attachment_url VARCHAR(500),

    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT no_self_message CHECK (sender_id != receiver_id)
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, timestamp DESC);
CREATE INDEX idx_messages_receiver ON messages(receiver_id, is_read) WHERE is_read = false;
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_item ON messages(item_id);
```

#### Table: `notifications`

```sql
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),

    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'item_update', 'admin_message', 'new_message',
        'item_sold', 'inquiry_received', 'verification_approved',
        'listing_expiring', 'listing_archived'
    )),

    -- Related entities
    item_id INTEGER REFERENCES items(item_id),
    related_user_id INTEGER REFERENCES users(user_id),

    -- Action link
    action_url VARCHAR(500),

    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,

    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, timestamp DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
```

#### Table: `admin_actions`

```sql
CREATE TABLE admin_actions (
    action_id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(user_id),
    item_id INTEGER REFERENCES items(item_id),
    target_user_id INTEGER REFERENCES users(user_id),

    action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
        'send_notification', 'archive_item', 'update_item',
        'verify_user', 'suspend_user', 'feature_item', 'approve_listing'
    )),

    description TEXT,
    metadata JSONB, -- Additional action data

    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_item ON admin_actions(item_id);
CREATE INDEX idx_admin_actions_timestamp ON admin_actions(timestamp DESC);
```

### 1.2 Additional Tables (E-commerce Enhancement)

#### Table: `wishlists`

```sql
CREATE TABLE wishlists (
    wishlist_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    item_id INTEGER NOT NULL REFERENCES items(item_id),

    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (user_id, item_id)
);

CREATE INDEX idx_wishlists_user ON wishlists(user_id);
```

#### Table: `reviews`

```sql
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(item_id),
    reviewer_id INTEGER NOT NULL REFERENCES users(user_id),
    seller_id INTEGER NOT NULL REFERENCES users(user_id),

    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,

    -- Verification
    is_verified_purchase BOOLEAN DEFAULT false,

    -- Status
    is_published BOOLEAN DEFAULT true,
    is_flagged BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (item_id, reviewer_id)
);

CREATE INDEX idx_reviews_item ON reviews(item_id);
CREATE INDEX idx_reviews_seller ON reviews(seller_id);
```

#### Table: `search_queries` (Analytics)

```sql
CREATE TABLE search_queries (
    query_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    query_text VARCHAR(500) NOT NULL,
    filters JSONB,
    results_count INTEGER,

    ip_address VARCHAR(45),
    user_agent TEXT,

    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_queries_timestamp ON search_queries(timestamp DESC);
CREATE INDEX idx_search_queries_text ON search_queries USING gin(to_tsvector('english', query_text));
```

### 1.3 Database Functions & Triggers

#### Auto-update timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Auto-update category item counts

```sql
CREATE OR REPLACE FUNCTION update_category_item_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE categories SET item_count = item_count + 1
        WHERE category_id = NEW.category_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE categories SET item_count = item_count - 1
        WHERE category_id = OLD.category_id;
    ELSIF TG_OP = 'UPDATE' AND NEW.category_id != OLD.category_id THEN
        UPDATE categories SET item_count = item_count - 1
        WHERE category_id = OLD.category_id;
        UPDATE categories SET item_count = item_count + 1
        WHERE category_id = NEW.category_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_category_counts AFTER INSERT OR UPDATE OR DELETE ON items
    FOR EACH ROW EXECUTE FUNCTION update_category_item_count();
```

---

## 2. REST API Specifications

### 2.1 Authentication Endpoints

#### POST `/api/auth/login`

**Request:**

```json
{
  "email": "user@undp.org"
}
```

**Response:**

```json
{
  "success": true,
  "message": "OTP sent to email",
  "otpExpiresIn": 300
}
```

#### POST `/api/auth/verify-otp`

**Request:**

```json
{
  "email": "user@undp.org",
  "otp": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "userId": 123,
    "email": "user@undp.org",
    "fullName": "John Doe",
    "role": "user",
    "isVerifiedBuyer": true,
    "verificationLevel": "un_embassy"
  }
}
```

#### POST `/api/auth/logout`

**Headers:** `Authorization: Bearer {token}`

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET `/api/auth/me`

**Headers:** `Authorization: Bearer {token}`

**Response:**

```json
{
  "userId": 123,
  "email": "user@undp.org",
  "fullName": "John Doe",
  "role": "user",
  "isVerifiedBuyer": true,
  "verificationLevel": "un_embassy",
  "sellerRating": 4.8,
  "totalSales": 15
}
```

### 2.2 Item Management Endpoints

#### GET `/api/items`

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `category` (category slug)
- `minPrice`, `maxPrice`
- `location`, `country`
- `condition`
- `status` (default: 'active')
- `sort` (price_asc, price_desc, newest, oldest, rating)
- `search` (text search)

**Response:**

```json
{
  "items": [
    {
      "itemId": 1,
      "title": "MacBook Pro 14\" M2",
      "description": "Excellent condition...",
      "categoryId": 3,
      "categoryName": "Electronics & Tech",
      "price": 3500000,
      "originalPrice": 4200000,
      "currency": "TZS",
      "condition": "excellent",
      "location": "Dar es Salaam, TZ",
      "images": [
        {
          "url": "https://...",
          "thumbnailUrl": "https://...",
          "isPrimary": true
        }
      ],
      "seller": {
        "userId": 45,
        "fullName": "Sarah M.",
        "rating": 4.9,
        "isVerified": true
      },
      "isFeatured": true,
      "isPremium": true,
      "viewCount": 234,
      "favoriteCount": 18,
      "listingDate": "2025-12-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

#### GET `/api/items/{id}`

**Response:** Single item with full details including all images and seller information

#### POST `/api/items`

**Headers:** `Authorization: Bearer {token}`

**Request:**

```json
{
  "title": "MacBook Pro 14\" M2",
  "description": "Excellent condition, barely used...",
  "categoryId": 3,
  "price": 3500000,
  "originalPrice": 4200000,
  "currency": "TZS",
  "condition": "excellent",
  "location": "Dar es Salaam",
  "country": "Tanzania",
  "shippingAvailable": true,
  "images": [
    {
      "url": "https://...",
      "type": "main",
      "displayOrder": 0,
      "isPrimary": true
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "item": {
    /* full item object */
  },
  "message": "Listing created successfully"
}
```

#### PUT `/api/items/{id}`

**Headers:** `Authorization: Bearer {token}`
**Authorization:** Only item owner or admin

**Request:** Same as POST

#### DELETE `/api/items/{id}`

**Headers:** `Authorization: Bearer {token}`
**Authorization:** Only item owner or admin

### 2.3 Category Endpoints

#### GET `/api/categories`

**Response:**

```json
{
  "categories": [
    {
      "categoryId": 1,
      "name": "Automotive",
      "slug": "automotive",
      "iconName": "Car",
      "itemCount": 2847,
      "requiredImageTypes": ["front", "side", "interior"],
      "minImages": 3
    }
  ]
}
```

### 2.4 Messaging Endpoints

#### GET `/api/messages`

**Headers:** `Authorization: Bearer {token}`
**Query Parameters:**

- `conversationId` (optional)
- `itemId` (optional)

**Response:**

```json
{
  "conversations": [
    {
      "conversationId": "45_123_item1",
      "otherUser": {
        "userId": 123,
        "fullName": "John Doe",
        "avatar": "https://..."
      },
      "item": {
        "itemId": 1,
        "title": "MacBook Pro"
      },
      "lastMessage": {
        "messageId": 567,
        "text": "Is it still available?",
        "timestamp": "2025-12-10T15:30:00Z",
        "isRead": false
      },
      "unreadCount": 2
    }
  ]
}
```

#### POST `/api/messages`

**Headers:** `Authorization: Bearer {token}`

**Request:**

```json
{
  "receiverId": 123,
  "itemId": 1,
  "messageText": "Is this item still available?"
}
```

**Response:**

```json
{
  "success": true,
  "message": {
    /* full message object */
  }
}
```

#### PUT `/api/messages/{id}/read`

**Headers:** `Authorization: Bearer {token}`

### 2.5 Notification Endpoints

#### GET `/api/notifications`

**Headers:** `Authorization: Bearer {token}`

**Response:**

```json
{
  "notifications": [
    {
      "notificationId": 1,
      "type": "new_message",
      "message": "You have a new message about MacBook Pro",
      "actionUrl": "/messages?conversation=45_123_item1",
      "isRead": false,
      "timestamp": "2025-12-10T15:30:00Z"
    }
  ],
  "unreadCount": 5
}
```

#### PUT `/api/notifications/{id}/read`

**Headers:** `Authorization: Bearer {token}`

### 2.6 Admin Endpoints

#### GET `/api/admin/items/overdue`

**Headers:** `Authorization: Bearer {token}`
**Authorization:** Admin only

**Response:**

```json
{
  "items": [
    {
      "itemId": 123,
      "title": "Item title",
      "seller": {
        /* seller info */
      },
      "listingDate": "2025-11-01T10:00:00Z",
      "daysOverdue": 25,
      "adminNotificationCount": 2,
      "lastAdminNotification": "2025-12-01T10:00:00Z"
    }
  ]
}
```

#### POST `/api/admin/items/{id}/notify`

**Headers:** `Authorization: Bearer {token}`
**Authorization:** Admin only

**Request:**

```json
{
  "message": "Your listing has been active for over 2 weeks..."
}
```

#### POST `/api/admin/items/{id}/archive`

**Headers:** `Authorization: Bearer {token}`
**Authorization:** Admin only

---

## 3. Authentication & Security

### 3.1 JWT Token Structure

**Payload:**

```json
{
  "userId": 123,
  "email": "user@undp.org",
  "role": "user",
  "isVerifiedBuyer": true,
  "iat": 1702395600,
  "exp": 1702482000
}
```

**Expiration:** 24 hours  
**Refresh:** Implement refresh token mechanism (optional enhancement)

### 3.2 OTP Implementation

- **Generation:** 6-digit numeric code
- **Expiration:** 5 minutes
- **Max Attempts:** 3 per email per hour
- **Storage:** Store hashed OTP in Redis or database temporary table
- **Email Template:** Professional branded email

### 3.3 Authorization Rules

**Public (No Auth Required):**

- Browse items (GET /api/items)
- View item details (GET /api/items/{id})
- View categories (GET /api/categories)

**Authenticated Users:**

- Create listings
- Send messages (if verified buyer)
- Manage own listings
- Access profile

**Verified Buyers Only:**

- Contact sellers via messages
- Add to cart
- Checkout

**Admin Only:**

- View overdue items
- Send admin notifications
- Archive items
- Manage users

---

## 4. Data Validation Rules

### 4.1 Item Listing Validation

**Required Fields:**

- Title: 10-255 characters
- Description: 50-5000 characters
- Category: Must exist in categories table
- Price: > 0, max 999,999,999.99
- Condition: Must be valid enum value
- Location: Required
- Images: Min 1, max 10 (category-specific)

**Image Validation:**

- Format: JPEG, PNG, WebP
- Max size: 5MB per image
- Min dimensions: 800x600px
- Category-specific types must be present

### 4.2 Message Validation

- Text: 1-2000 characters
- Receiver must exist
- If itemId provided, must exist and be active
- Sender cannot be receiver

### 4.3 Email Validation

- Valid email format
- Domain checking against allowed_domains for verification
- Not in blacklist (future enhancement)

---

## Next Steps

Continue to **Part 3** for:

- Gap analysis (what's missing)
- Implementation roadmap
- Testing requirements
- Deployment strategy
- Performance benchmarks
