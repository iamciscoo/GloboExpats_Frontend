# GloboExpat API Documentation

Welcome to the comprehensive API documentation for the GloboExpat marketplace platform. This directory contains all the information you need to understand, integrate with, and troubleshoot the backend API.

---

## 📚 Documentation Index

### 1. **Platform Audit Report** ([PLATFORM_AUDIT_REPORT.md](./PLATFORM_AUDIT_REPORT.md))
**Comprehensive platform analysis and recommendations**

- Complete backend API structure from Swagger
- Frontend implementation analysis
- Security assessment
- Performance recommendations
- Identified issues and improvements
- Code quality assessment
- Next steps and roadmap

**Best for:** Understanding the overall platform architecture and planning improvements

---

### 2. **API Quick Reference** ([API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md))
**Fast lookup guide for all API endpoints**

- All endpoints with examples
- Request/response formats
- Authentication methods
- Common integration patterns
- cURL examples
- Frontend usage examples

**Best for:** Day-to-day development and quick endpoint lookups

---

### 3. **Integration Troubleshooting** ([INTEGRATION_TROUBLESHOOTING.md](./INTEGRATION_TROUBLESHOOTING.md))
**Solutions to common problems**

- 401 Unauthorized errors
- CORS issues
- Image upload failures
- Email verification problems
- Cart & checkout issues
- Environment configuration
- Debugging tools and techniques

**Best for:** Fixing bugs and resolving integration issues

---

### 4. **Backend Integration Analysis** ([BACKEND_INTEGRATION_ANALYSIS.md](./BACKEND_INTEGRATION_ANALYSIS.md))
**Detailed technical analysis**

- API endpoint mapping
- Data flow diagrams
- Integration patterns
- Best practices
- Security considerations

**Best for:** Deep technical understanding and architecture decisions

---

### 5. **Backend API Reference** ([BACKEND_API_REFERENCE.md](./BACKEND_API_REFERENCE.md))
**Complete API specification**

- All available endpoints
- Request/response schemas
- Authentication requirements
- Error codes and handling

**Best for:** Complete API specification reference

---

## 🚀 Quick Start Guide

### For New Developers

1. **Start with:** [Platform Audit Report](./PLATFORM_AUDIT_REPORT.md)
   - Understand the platform architecture
   - Review technology stack
   - Learn authentication flow

2. **Then read:** [API Quick Reference](./API_QUICK_REFERENCE.md)
   - Familiarize yourself with available endpoints
   - Review common integration patterns
   - Try example requests

3. **Keep handy:** [Integration Troubleshooting](./INTEGRATION_TROUBLESHOOTING.md)
   - Bookmark for when issues arise
   - Reference common solutions
   - Use debugging tools

### For Experienced Developers

- Use [API Quick Reference](./API_QUICK_REFERENCE.md) for endpoint lookups
- Refer to [Integration Troubleshooting](./INTEGRATION_TROUBLESHOOTING.md) when debugging
- Check [Platform Audit Report](./PLATFORM_AUDIT_REPORT.md) for improvement recommendations

---

## 🔑 Key Information

### Backend Details
- **Base URL:** `http://10.123.22.21:8081`
- **API Version:** `/api/v1/`
- **Swagger UI:** http://10.123.22.21:8081/swagger-ui/index.html#/
- **Authentication:** JWT Bearer tokens (2-hour expiry)

### Frontend Tech Stack
- **Framework:** Next.js 15.2.4 with React 19
- **Language:** TypeScript
- **Styling:** TailwindCSS + shadcn/ui
- **State:** React Context API
- **API Client:** Custom fetch-based client (`/lib/api.ts`)

### Environment Configuration
```bash
# Required environment variables
NEXT_PUBLIC_API_URL=http://10.123.22.21:8081
NEXT_PUBLIC_BACKEND_URL=http://10.123.22.21:8081
NODE_ENV=development
```

---

## 📋 Common Tasks

### Register a New User
```typescript
import { apiClient } from '@/lib/api'

await apiClient.register({
  firstName: 'John',
  lastName: 'Doe',
  password: 'SecurePass123!',
  emailAddress: 'john.doe@example.com',
  agreeToTerms: true,
  agreeToPrivacyPolicy: true
})
```

### Authenticate User
```typescript
const response = await apiClient.login(email, password)
const { token, email, role } = response
apiClient.setAuthToken(token)
```

### Create a Product
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

const result = await apiClient.createProduct(productData, imageFiles)
```

### Add to Cart
```typescript
await apiClient.addToCart(productId, quantity)
const cart = await apiClient.getUserCart()
```

---

## 🔍 Finding What You Need

### "How do I...?"

**...register a user?**
→ [API Quick Reference - Authentication](./API_QUICK_REFERENCE.md#authentication)

**...upload product images?**
→ [API Quick Reference - Products](./API_QUICK_REFERENCE.md#products)

**...handle 401 errors?**
→ [Integration Troubleshooting - 401 Errors](./INTEGRATION_TROUBLESHOOTING.md#1-401-unauthorized-errors)

**...verify email addresses?**
→ [API Quick Reference - Email Verification](./API_QUICK_REFERENCE.md#email-verification-otp)

**...understand the architecture?**
→ [Platform Audit Report - Architecture](./PLATFORM_AUDIT_REPORT.md#2-frontend-implementation-analysis)

**...implement cart functionality?**
→ [API Quick Reference - Cart Management](./API_QUICK_REFERENCE.md#cart-management)

**...fix CORS issues?**
→ [Integration Troubleshooting - CORS](./INTEGRATION_TROUBLESHOOTING.md#2-cors-errors)

---

## 🎯 Platform Features

### ✅ Fully Implemented
- User authentication (email/password + Google OAuth)
- Product CRUD operations with image upload
- Category management
- Cart and checkout flow
- Order management
- Messaging system
- Email verification (OTP-based)
- Reviews and ratings

### 🔄 In Progress
- Payment integration (M-Pesa, card payments)
- Advanced search and filtering
- Real-time notifications
- Analytics and reporting

### 📝 Planned
- Mobile app (React Native)
- Advanced admin dashboard
- Seller analytics
- Recommendation engine

---

## 🛠️ Development Workflow

### 1. Setup
```bash
# Clone repository
git clone <repository-url>
cd ExpatFrontend-main

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev
```

### 2. Development
```bash
# Run in dev mode with hot reload
npm run dev

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm run test
```

### 3. Production Build
```bash
# Build for production
npm run build

# Start production server
npm run start
```

---

## 🐛 Debugging

### Enable Debug Mode
```typescript
// In browser console
localStorage.setItem('debug', 'true')

// Or set environment variable
NODE_ENV=development
```

### Common Debug Commands
```javascript
// Check authentication
localStorage.getItem('expat_auth_token')
localStorage.getItem('expat_auth_token_expiry')

// Check session
localStorage.getItem('expatUserSession')

// Clear all data
localStorage.clear()
sessionStorage.clear()
```

### Network Debugging
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Perform action
5. Inspect request/response

---

## 📊 API Integration Status

| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| Registration | ✅ | ✅ | Complete |
| Login | ✅ | ✅ | Complete |
| Google OAuth | ✅ | ✅ | Complete |
| Email Verification | ✅ | ✅ | Complete |
| Product Creation | ✅ | ✅ | Complete |
| Product Listing | ✅ | ✅ | Complete |
| Image Upload | ✅ | ✅ | Complete |
| Cart Operations | ✅ | ✅ | Complete |
| Checkout | ✅ | ⚠️ | Payment pending |
| Orders | ✅ | ✅ | Complete |
| Messaging | ✅ | ✅ | Complete |
| Reviews | ✅ | ✅ | Complete |
| Search/Filter | ✅ | ✅ | Complete |

---

## 🔒 Security

### Authentication
- JWT tokens with 2-hour expiry
- Secure token storage (localStorage + httpOnly cookies)
- Automatic token refresh on 401
- Session restoration on page reload

### Best Practices
- Always validate input client-side
- Use HTTPS in production
- Never expose sensitive data in console logs
- Implement CSRF protection
- Use environment variables for secrets
- Regular security audits

---

## 📈 Performance

### Current Optimizations
- Image lazy loading with Next.js Image
- API response caching
- Debounced localStorage writes
- Pagination for large datasets
- Code splitting and lazy loading

### Recommended Improvements
- Implement request caching
- Add optimistic UI updates
- Use service workers for offline support
- Optimize bundle size
- Add skeleton loaders

---

## 🤝 Contributing

### Code Standards
- Use TypeScript for all new code
- Follow existing code style (ESLint + Prettier)
- Write meaningful commit messages
- Add tests for new features
- Update documentation

### Before Submitting PR
1. Run linting: `npm run lint`
2. Run type check: `npm run type-check`
3. Test locally: `npm run dev`
4. Build successfully: `npm run build`
5. Update documentation if needed

---

## 📞 Support

### Issues & Questions
1. Check [Integration Troubleshooting](./INTEGRATION_TROUBLESHOOTING.md)
2. Review [Platform Audit Report](./PLATFORM_AUDIT_REPORT.md)
3. Consult [Swagger UI](http://10.123.22.21:8081/swagger-ui/index.html#/)
4. Contact development team

### Useful Resources
- **Swagger Documentation:** http://10.123.22.21:8081/swagger-ui/index.html#/
- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **TailwindCSS:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com

---

## 📝 Changelog

### 2025-10-15 - v1.0
- ✅ Initial comprehensive audit completed
- ✅ Created complete API documentation
- ✅ Added troubleshooting guide
- ✅ Documented all endpoints
- ✅ Analyzed frontend integration
- ✅ Provided improvement recommendations

---

## 🎓 Learning Resources

### For Backend Development
- Spring Boot Documentation
- REST API Best Practices
- JWT Authentication
- Microservices Architecture

### For Frontend Development
- Next.js 15 Features
- React 19 Server Components
- TypeScript Advanced Types
- TailwindCSS Patterns

---

## 🔮 Future Enhancements

### Short-term (1-2 months)
- [ ] Implement refresh tokens
- [ ] Add comprehensive tests
- [ ] Improve error tracking
- [ ] Optimize performance

### Long-term (3-6 months)
- [ ] Mobile app development
- [ ] GraphQL migration
- [ ] Real-time features (WebSocket)
- [ ] Advanced analytics

---

## 📄 License

[Add your license information here]

---

## 👥 Team

[Add your team information here]

---

**Last Updated:** 2025-10-15  
**Documentation Version:** 1.0  
**Platform Version:** Next.js 15.2.4, React 19

---

**Made with ❤️ for the GloboExpat community**
