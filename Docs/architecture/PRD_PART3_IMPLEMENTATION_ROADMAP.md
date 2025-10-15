# Technical Product Requirements Document

# Global Expat Belongings Marketplace Platform

## Part 3: Gap Analysis & Implementation Roadmap

**Document Version:** 2.0  
**Last Updated:** December 10, 2025  
**Status:** Implementation Planning

---

## 1. Gap Analysis

### 1.1 Current vs. Required Features

#### ✅ COMPLETED (Frontend)

**User Interface (100%)**

- [x] All 30 pages implemented
- [x] 56+ reusable components
- [x] Responsive mobile design
- [x] Accessibility features
- [x] Form validation (client-side)
- [x] Error handling UI
- [x] Loading states
- [x] Empty states

**Authentication UI (100%)**

- [x] Login page with OTP input
- [x] Registration flow
- [x] Password reset interface
- [x] Auth context provider
- [x] Protected route guards

**Product Features UI (100%)**

- [x] Product listing creation form
- [x] Image upload interface
- [x] Product browsing grid
- [x] Product detail pages
- [x] Category navigation
- [x] Search interface
- [x] Filtering UI

**Commerce UI (100%)**

- [x] Shopping cart
- [x] Checkout flow
- [x] Order history display
- [x] Wishlist management

**Communication UI (100%)**

- [x] Messaging interface
- [x] Notification center
- [x] Contact forms

**Admin UI (100%)**

- [x] Dashboard layout
- [x] User management interface
- [x] Listing management
- [x] Analytics display

#### ❌ NOT IMPLEMENTED (Backend)

**Core Backend (0%)**

- [ ] Spring Boot application setup
- [ ] PostgreSQL database deployment
- [ ] Database schema implementation
- [ ] JPA entity models
- [ ] Repository layer
- [ ] Service layer business logic
- [ ] REST controllers
- [ ] Error handling framework

**Authentication & Authorization (0%)**

- [ ] OTP generation service
- [ ] Email service integration (SendGrid/SES)
- [ ] JWT token generation/validation
- [ ] Spring Security configuration
- [ ] Role-based access control
- [ ] Email domain verification

**File Management (0%)**

- [ ] AWS S3 integration (or Cloudinary)
- [ ] Image upload service
- [ ] Image optimization/resizing
- [ ] File validation
- [ ] CDN configuration

**Business Logic (0%)**

- [ ] Item CRUD operations
- [ ] Messaging system backend
- [ ] Notification generation
- [ ] Admin monitoring logic
- [ ] Search indexing
- [ ] Email notification templates

**Integration & Services (0%)**

- [ ] Redis caching (optional)
- [ ] Email service
- [ ] Cloud storage
- [ ] Monitoring/logging
- [ ] Analytics tracking

### 1.2 Feature Comparison Matrix

| Feature                | Original PRD        | Current Implementation | Gap                        | Priority |
| ---------------------- | ------------------- | ---------------------- | -------------------------- | -------- |
| **OTP Login**          | Required            | Frontend only          | Backend needed             | P0       |
| **Email Verification** | Domain-based        | UI ready               | Backend logic needed       | P0       |
| **Item Listings**      | Basic CRUD          | Full UI                | API needed                 | P0       |
| **Image Upload**       | Category-specific   | UI ready               | S3 integration needed      | P0       |
| **Buyer Restrictions** | Verified only       | UI logic present       | Backend enforcement needed | P0       |
| **Admin Monitoring**   | 2-week check        | UI complete            | Background job needed      | P1       |
| **Notifications**      | Email alerts        | UI complete            | Email service needed       | P1       |
| **Messaging**          | Buyer-seller        | Full interface         | Real-time backend needed   | P1       |
| **Search**             | Basic               | UI complete            | Search index needed        | P1       |
| **Multi-currency**     | Not in original     | UI implemented         | Conversion API needed      | P2       |
| **Reviews**            | Not in original     | Not implemented        | Full feature needed        | P2       |
| **Wishlist**           | Not in original     | UI implemented         | Backend needed             | P2       |
| **Analytics**          | Not in original     | UI ready               | Backend tracking needed    | P2       |
| **Payment**            | Explicitly excluded | Not implemented        | Future scope               | P3       |
| **Social Login**       | Not in original     | Not implemented        | Future scope               | P3       |

**Priority Legend:**

- **P0**: Critical - Blocks MVP launch
- **P1**: High - Needed for full functionality
- **P2**: Medium - Enhances user experience
- **P3**: Low - Future enhancements

---

## 2. Implementation Roadmap

### 2.1 Phase 1: Backend Foundation (Weeks 1-3)

#### Week 1: Project Setup & Database

**Deliverables:**

- [ ] Spring Boot project initialization
  - Maven/Gradle setup
  - Project structure
  - Configuration management (application.yml)
  - Environment profiles (dev, staging, prod)
- [ ] PostgreSQL database setup
  - Local development database
  - RDS/managed database for production
  - Connection pooling configuration
- [ ] Database schema implementation
  - Execute SQL scripts from Part 2
  - Verify all tables, indexes, triggers
  - Seed initial data (categories, allowed domains)
- [ ] JPA Entity models
  - User, AllowedDomain, Category, Item, Image
  - Message, Notification, AdminAction entities
  - Relationships and cascade operations

**Acceptance Criteria:**

- Database accessible and schema complete
- All entities mapped correctly
- Application connects to database successfully
- Basic CRUD operations work in tests

#### Week 2: Authentication & Security

**Deliverables:**

- [ ] Spring Security configuration
  - JWT token configuration
  - CORS setup
  - Security filter chain
- [ ] Authentication service
  - OTP generation logic
  - Email service integration (SendGrid)
  - OTP validation
  - User creation/login logic
- [ ] JWT service
  - Token generation
  - Token validation
  - Refresh token mechanism (optional)
- [ ] Email templates
  - OTP email template
  - Welcome email
  - Notification email templates
- [ ] Authorization logic
  - Role-based access control
  - Email domain verification
  - Buyer verification checks

**Acceptance Criteria:**

- User can request OTP via email
- OTP validation works correctly
- JWT tokens issued on successful login
- Protected endpoints enforce authentication
- Email domain verification working

#### Week 3: Core API Endpoints

**Deliverables:**

- [ ] User management APIs
  - GET /api/auth/me
  - PUT /api/users/profile
- [ ] Category APIs
  - GET /api/categories
- [ ] Item management APIs (basic)
  - GET /api/items (with pagination)
  - GET /api/items/{id}
  - POST /api/items (without images)
  - PUT /api/items/{id}
  - DELETE /api/items/{id}
- [ ] Service layer business logic
  - Validation services
  - Business rule enforcement
  - Error handling

**Acceptance Criteria:**

- All core APIs functional
- Proper error responses
- Validation working
- Integration with frontend successful

### 2.2 Phase 2: File Upload & Complete Item Management (Weeks 4-5)

#### Week 4: Image Upload Service

**Deliverables:**

- [ ] AWS S3 setup
  - S3 bucket creation
  - IAM user/role configuration
  - Bucket policies and CORS
- [ ] File upload service
  - Multipart file handling
  - Image validation (format, size)
  - S3 upload implementation
  - Generate signed URLs
- [ ] Image processing
  - Thumbnail generation
  - Image optimization
  - Format conversion (WebP)
- [ ] Image management APIs
  - POST /api/items/{id}/images
  - DELETE /api/items/{id}/images/{imageId}
  - PUT /api/items/{id}/images/reorder

**Acceptance Criteria:**

- Users can upload multiple images
- Images stored in S3
- Thumbnails generated automatically
- Category-specific image validation works
- Images displayed correctly on frontend

#### Week 5: Advanced Item Features

**Deliverables:**

- [ ] Search functionality
  - Full-text search on title/description
  - PostgreSQL full-text search or Elasticsearch
  - Search API implementation
- [ ] Filtering and sorting
  - Price range filters
  - Location filters
  - Category filters
  - Multiple sort options
- [ ] Item statistics
  - View counting
  - Favorite counting
  - Analytics tracking
- [ ] Featured/Premium items
  - Marking items as featured
  - Premium listing logic

**Acceptance Criteria:**

- Search returns relevant results
- All filters work correctly
- Sorting functions properly
- Statistics update in real-time

### 2.3 Phase 3: Communication & Notifications (Weeks 6-7)

#### Week 6: Messaging System

**Deliverables:**

- [ ] Message APIs
  - POST /api/messages
  - GET /api/messages (conversations)
  - GET /api/messages/{conversationId}
  - PUT /api/messages/{id}/read
- [ ] Conversation management
  - Conversation ID generation
  - Thread grouping
  - Unread count tracking
- [ ] Real-time messaging (optional)
  - WebSocket setup (Spring WebSocket)
  - Real-time message delivery
  - Online status indicators
- [ ] Message notifications
  - Email notification on new message
  - In-app notification creation

**Acceptance Criteria:**

- Users can send/receive messages
- Conversations properly threaded
- Unread counts accurate
- Email notifications sent
- Real-time updates working (if implemented)

#### Week 7: Notification System

**Deliverables:**

- [ ] Notification service
  - Notification creation logic
  - Notification types handling
  - Batch notification sending
- [ ] Notification APIs
  - GET /api/notifications
  - PUT /api/notifications/{id}/read
  - PUT /api/notifications/mark-all-read
- [ ] Email notification service
  - Template rendering
  - Scheduled email sending
  - Email delivery tracking
- [ ] Push notification setup (optional)
  - Firebase Cloud Messaging
  - Browser push notifications

**Acceptance Criteria:**

- All notification types working
- Email notifications sent correctly
- Notification center displays properly
- Mark as read functionality works

### 2.4 Phase 4: Admin Features & Background Jobs (Weeks 8-9)

#### Week 8: Admin Panel Backend

**Deliverables:**

- [ ] Admin dashboard APIs
  - GET /api/admin/stats
  - GET /api/admin/users
  - GET /api/admin/items/overdue
- [ ] Admin actions
  - POST /api/admin/items/{id}/notify
  - POST /api/admin/items/{id}/archive
  - PUT /api/admin/users/{id}/verify
  - PUT /api/admin/users/{id}/suspend
- [ ] Admin notification tracking
  - Track notification count per item
  - Enforce 3-notification limit
  - Archive logic after 3 notifications
- [ ] User management
  - User approval/suspension
  - Verification level assignment

**Acceptance Criteria:**

- Admin can view all statistics
- Overdue items identified correctly
- Notification sending works
- Archiving functionality works
- User management operational

#### Week 9: Background Jobs & Automation

**Deliverables:**

- [ ] Scheduled job setup
  - Spring @Scheduled configuration
  - Cron job definitions
- [ ] Overdue listing monitoring
  - Daily scan for listings > 14 days
  - Automatic notification sending
  - Auto-archive after 3 notifications + grace period
- [ ] Email digest jobs
  - Daily/weekly listing digests
  - New listings in followed categories
- [ ] Database maintenance jobs
  - Clean up expired sessions
  - Archive old messages
  - Update statistics

**Acceptance Criteria:**

- Scheduled jobs run on time
- Overdue monitoring works automatically
- Email digests sent correctly
- Database maintenance runs smoothly

### 2.5 Phase 5: Testing & Optimization (Weeks 10-11)

#### Week 10: Testing

**Deliverables:**

- [ ] Unit tests
  - Service layer tests
  - Repository tests
  - Utility function tests
- [ ] Integration tests
  - API endpoint tests
  - Database integration tests
  - External service mocks
- [ ] End-to-end tests
  - User journey tests
  - Critical path testing
- [ ] Security testing
  - Authentication tests
  - Authorization tests
  - SQL injection prevention
  - XSS prevention

**Test Coverage Target:** Minimum 70%

**Acceptance Criteria:**

- All critical paths covered
- Security vulnerabilities addressed
- Integration tests passing
- E2E tests passing

#### Week 11: Performance Optimization

**Deliverables:**

- [ ] Database optimization
  - Query optimization
  - Index review and optimization
  - Connection pool tuning
- [ ] API performance
  - Response time optimization
  - Caching implementation (Redis)
  - Pagination optimization
- [ ] Image optimization
  - CDN setup (CloudFront)
  - Lazy loading verification
  - Format optimization
- [ ] Monitoring setup
  - Application monitoring (Spring Actuator)
  - Database monitoring
  - Error tracking (Sentry)

**Performance Targets:**

- API response time: < 200ms (p95)
- Page load time: < 2s
- Database query time: < 50ms (average)

### 2.6 Phase 6: Deployment & Launch (Weeks 12-13)

#### Week 12: Deployment Setup

**Deliverables:**

- [ ] Production environment setup
  - AWS EC2/ECS for backend
  - RDS for PostgreSQL
  - S3 for images
  - CloudFront CDN
- [ ] CI/CD pipeline
  - GitHub Actions or Jenkins
  - Automated testing
  - Automated deployment
- [ ] Environment configuration
  - Production credentials
  - Environment variables
  - Security groups
- [ ] SSL certificates
  - HTTPS setup
  - Certificate management
- [ ] Backup strategy
  - Database backups
  - Image backups
  - Disaster recovery plan

**Acceptance Criteria:**

- All environments deployed
- CI/CD pipeline working
- HTTPS enabled
- Backups scheduled

#### Week 13: Launch Preparation

**Deliverables:**

- [ ] Pre-launch testing
  - Full system testing in production
  - Load testing
  - Security audit
- [ ] Documentation
  - API documentation (Swagger)
  - User documentation
  - Admin documentation
  - Developer documentation
- [ ] Monitoring & alerts
  - Uptime monitoring
  - Error rate alerts
  - Performance alerts
- [ ] Launch checklist
  - All features verified
  - Security review complete
  - Performance benchmarks met
  - Documentation complete

**Go/No-Go Criteria:**

- All P0 features working
- Security review passed
- Performance targets met
- Monitoring in place

---

## 3. Technical Implementation Details

### 3.1 Spring Boot Project Structure

```
expat-marketplace-backend/
├── src/main/java/com/expat/marketplace/
│   ├── ExpatMarketplaceApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── WebConfig.java
│   │   ├── AwsConfig.java
│   │   └── EmailConfig.java
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── ItemController.java
│   │   ├── CategoryController.java
│   │   ├── MessageController.java
│   │   ├── NotificationController.java
│   │   └── AdminController.java
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── OtpService.java
│   │   ├── EmailService.java
│   │   ├── ItemService.java
│   │   ├── ImageService.java
│   │   ├── MessageService.java
│   │   ├── NotificationService.java
│   │   └── AdminService.java
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── AllowedDomainRepository.java
│   │   ├── ItemRepository.java
│   │   ├── CategoryRepository.java
│   │   ├── ImageRepository.java
│   │   ├── MessageRepository.java
│   │   └── NotificationRepository.java
│   ├── model/
│   │   ├── entity/
│   │   │   ├── User.java
│   │   │   ├── Item.java
│   │   │   ├── Category.java
│   │   │   ├── Image.java
│   │   │   ├── Message.java
│   │   │   └── Notification.java
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   └── response/
│   │   └── enums/
│   ├── security/
│   │   ├── JwtTokenProvider.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── UserPrincipal.java
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   ├── ResourceNotFoundException.java
│   │   └── UnauthorizedException.java
│   └── util/
│       ├── ValidationUtil.java
│       └── DateUtil.java
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-prod.yml
│   ├── db/migration/ (Flyway)
│   │   ├── V1__create_schema.sql
│   │   └── V2__seed_data.sql
│   └── templates/ (Email templates)
└── src/test/java/
    └── com/expat/marketplace/
```

### 3.2 Key Configuration Files

**application.yml (example)**

```yaml
spring:
  application:
    name: expat-marketplace
  datasource:
    url: jdbc:postgresql://localhost:5432/expat_db
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 50MB

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000 # 24 hours

aws:
  s3:
    bucket: expat-marketplace-images
    region: us-east-1
    access-key: ${AWS_ACCESS_KEY}
    secret-key: ${AWS_SECRET_KEY}

email:
  provider: sendgrid
  api-key: ${SENDGRID_API_KEY}
  from: noreply@expatmarketplace.com

app:
  otp:
    length: 6
    expiration: 300 # 5 minutes
    max-attempts: 3
```

### 3.3 Development Environment Setup

**Prerequisites:**

- Java 17+
- PostgreSQL 15+
- Maven 3.8+
- AWS account (for S3)
- SendGrid account (for emails)

**Local Development:**

```bash
# Clone repository
git clone https://github.com/org/expat-marketplace-backend.git
cd expat-marketplace-backend

# Set environment variables
cp .env.example .env
# Edit .env with your credentials

# Start PostgreSQL
docker-compose up -d postgres

# Run migrations
mvn flyway:migrate

# Start application
mvn spring-boot:run

# Backend runs on http://localhost:8080
```

**Frontend Connection:**
Update `/home/cisco/Documents/ExpatFrontend-main/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## 4. Testing Strategy

### 4.1 Test Pyramid

```
        /\
       /  \  E2E Tests (10%)
      /----\
     /      \ Integration Tests (30%)
    /--------\
   /          \ Unit Tests (60%)
  /____________\
```

### 4.2 Testing Checklist

**Unit Tests (60% of tests)**

- [ ] Service layer methods
- [ ] Utility functions
- [ ] Validation logic
- [ ] Business rules

**Integration Tests (30% of tests)**

- [ ] API endpoints
- [ ] Database operations
- [ ] External service integration
- [ ] Authentication flow

**E2E Tests (10% of tests)**

- [ ] User registration → OTP → Login
- [ ] Create listing → Upload images → Publish
- [ ] Browse → View item → Contact seller
- [ ] Admin: Monitor → Notify → Archive

### 4.3 Performance Testing

**Load Testing Scenarios:**

- 100 concurrent users browsing
- 50 concurrent image uploads
- 200 concurrent searches

**Tools:**

- JMeter for load testing
- Gatling for performance testing
- Spring Boot Actuator for metrics

---

## 5. Deployment Architecture

### 5.1 Production Infrastructure

```
┌─────────────────────────────────────────────────────────┐
│                     Route 53 (DNS)                      │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              CloudFront (CDN) + SSL                     │
└─────────────────────────────────────────────────────────┘
         ↓                              ↓
┌──────────────────┐          ┌──────────────────┐
│   Frontend (S3)  │          │  Backend (ECS)   │
│   Static Assets  │          │  Spring Boot App │
└──────────────────┘          └──────────────────┘
                                       ↓
                    ┌──────────────────────────────┐
                    │                              │
           ┌────────┴────────┐          ┌─────────┴─────────┐
           │  RDS PostgreSQL │          │  S3 (Images)      │
           │   Multi-AZ      │          │  + CloudFront     │
           └─────────────────┘          └───────────────────┘
```

### 5.2 Deployment Checklist

**Infrastructure:**

- [ ] VPC setup with public/private subnets
- [ ] Security groups configured
- [ ] RDS PostgreSQL (Multi-AZ)
- [ ] ECS cluster with auto-scaling
- [ ] S3 buckets for images and frontend
- [ ] CloudFront distribution
- [ ] Route 53 DNS configuration
- [ ] SSL certificates (ACM)

**Application:**

- [ ] Docker image built and pushed
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Seed data loaded
- [ ] Health checks configured
- [ ] Logging configured (CloudWatch)

**Security:**

- [ ] Secrets stored in AWS Secrets Manager
- [ ] IAM roles configured
- [ ] Security groups locked down
- [ ] WAF rules configured
- [ ] Backup strategy implemented

---

## 6. Post-Launch Roadmap (Future Enhancements)

### Phase 7: Enhanced Features (3-6 months)

**Advanced Search & Discovery**

- Elasticsearch integration
- AI-powered recommendations
- Saved searches and alerts
- Similar items suggestions

**Payment Integration**

- Stripe integration
- Escrow service
- Multi-currency payments
- Invoice generation

**Social Features**

- User profiles and ratings
- Social media sharing
- Referral program
- Community forums

**Mobile App**

- React Native app
- Push notifications
- Offline support
- Camera integration

**Analytics & Insights**

- Seller analytics dashboard
- Pricing recommendations
- Market trends
- User behavior tracking

### Phase 8: Global Expansion (6-12 months)

**Internationalization**

- Multi-language support
- Regional customization
- Local payment methods
- Currency conversion

**Advanced Verification**

- Document verification
- Video verification
- Background checks
- Business verification

**Marketplace Expansion**

- B2B marketplace
- Auction functionality
- Service marketplace
- Rental marketplace

---

## 7. Success Metrics & KPIs

### 7.1 Technical Metrics

**Performance:**

- API response time < 200ms (p95)
- Page load time < 2s
- Uptime > 99.9%
- Error rate < 0.1%

**Quality:**

- Test coverage > 70%
- Zero critical security vulnerabilities
- Code review approval rate > 95%

### 7.2 Business Metrics

**User Engagement:**

- Daily active users (DAU)
- Monthly active users (MAU)
- Session duration
- Pages per session

**Marketplace Health:**

- Active listings count
- Listing-to-sale conversion rate
- Average time to sale
- Seller response time

**Growth:**

- New user registrations per week
- Repeat user rate
- Seller retention rate
- User satisfaction score

---

## 8. Risk Mitigation

### 8.1 Technical Risks

| Risk                        | Impact   | Probability | Mitigation                                              |
| --------------------------- | -------- | ----------- | ------------------------------------------------------- |
| Database performance issues | High     | Medium      | Implement caching, optimize queries, use read replicas  |
| S3 costs exceed budget      | Medium   | Medium      | Implement image compression, lifecycle policies         |
| Email delivery failures     | High     | Low         | Use reliable provider (SendGrid), implement retry logic |
| Security breach             | Critical | Low         | Regular security audits, penetration testing            |
| Scaling issues              | High     | Medium      | Use auto-scaling, load testing, performance monitoring  |

### 8.2 Contingency Plans

**Database Failure:**

- Automated backups every 6 hours
- Multi-AZ deployment for high availability
- Point-in-time recovery enabled
- Disaster recovery plan tested quarterly

**Application Failure:**

- Health checks with automatic restart
- Multi-instance deployment
- Circuit breakers for external services
- Graceful degradation

**Third-Party Service Outage:**

- Fallback email provider configured
- Local image storage backup
- Queueing for retry mechanisms

---

## 9. Conclusion

### 9.1 Implementation Summary

**Total Estimated Duration:** 13 weeks (3.25 months)

**Critical Path:**

1. Backend foundation (3 weeks)
2. Image upload & item management (2 weeks)
3. Communication systems (2 weeks)
4. Admin & automation (2 weeks)
5. Testing & optimization (2 weeks)
6. Deployment & launch (2 weeks)

### 9.2 Resource Requirements

**Development Team:**

- 2 Backend developers (Spring Boot, PostgreSQL)
- 1 Frontend developer (integration support)
- 1 DevOps engineer (deployment, CI/CD)
- 1 QA engineer (testing)
- 1 Product manager (coordination)

**Infrastructure Costs (Monthly Estimates):**

- AWS EC2/ECS: $200-500
- RDS PostgreSQL: $100-300
- S3 + CloudFront: $50-150
- SendGrid: $15-50
- Domain + SSL: $20
- **Total: $385-1,020/month**

### 9.3 Go-Live Readiness Criteria

**Must Have (P0):**

- ✅ All authentication flows working
- ✅ Item CRUD operations complete
- ✅ Image upload functional
- ✅ Basic messaging system
- ✅ Admin monitoring operational
- ✅ Security review passed
- ✅ Performance targets met

**Should Have (P1):**

- Email notifications working
- Search functionality complete
- All frontend pages integrated
- Admin automation running

**Nice to Have (P2):**

- Real-time messaging
- Advanced analytics
- Push notifications

---

## Appendices

### A. API Documentation

See Swagger documentation at `/api/docs` (to be generated)

### B. Database ER Diagram

See `/docs/database-schema.png` (to be created)

### C. Deployment Guide

See `/docs/deployment-guide.md` (to be created)

### D. Testing Guide

See `/docs/testing-guide.md` (to be created)

---

**Document End**

For questions or clarifications, contact the development team.
