# Testing Guide - Platform Optimizations
**Version**: 1.0  
**Date**: 2025-10-21

---

## 🎯 Quick Testing Commands

### 1. Verify Optimizations Applied
```bash
# Run automated verification
bash scripts/verify-optimizations.sh
```

### 2. TypeScript Validation
```bash
# Check for type errors
npm run type-check

# Expected output: No errors
```

### 3. Linting Check
```bash
# Check code quality
npm run lint

# Expected output: No errors or warnings
```

### 4. Development Build
```bash
# Start dev server
npm run dev

# Expected: Server starts on http://localhost:3000
# Visit and test basic functionality
```

### 5. Production Build
```bash
# Clean previous builds
npm run clean

# Build for production
npm run build

# Expected: Build completes without errors
```

### 6. Bundle Analysis
```bash
# Analyze bundle sizes
npm run build:analyze

# Opens browser with bundle visualization
# Compare sizes before/after optimization
```

---

## 📋 Manual Testing Checklist

### Core Functionality Tests

#### Homepage
- [ ] Page loads without errors
- [ ] Hero carousel displays and rotates
- [ ] Product listings show correctly
- [ ] Images load with blur placeholder effect
- [ ] Lazy loading components appear smoothly
- [ ] Mobile sidebar toggle works
- [ ] Category sidebar functions
- [ ] No console errors

#### Product Pages
- [ ] Product details display correctly
- [ ] Product images load and can navigate
- [ ] Seller information shows
- [ ] "Add to Cart" button works
- [ ] Similar products section loads
- [ ] Price displays in correct currency
- [ ] Auth redirect works for unauthenticated users
- [ ] No layout shifts during load

#### Browse/Search
- [ ] Products grid displays
- [ ] Filters work correctly
- [ ] Search functionality works
- [ ] Pagination functions
- [ ] Category filtering works
- [ ] Price range filter works
- [ ] Responsive on mobile

#### Authentication
- [ ] Login page loads
- [ ] Registration page loads
- [ ] Form validation works
- [ ] Error messages display
- [ ] Success redirects work
- [ ] Logo displays correctly ("Globoexpats")

#### Cart & Checkout
- [ ] Cart page displays items
- [ ] Quantity updates work
- [ ] Remove item functions
- [ ] Checkout flow works
- [ ] Price calculations correct
- [ ] Success page displays

#### User Account
- [ ] Account dashboard loads
- [ ] Orders page displays
- [ ] Wishlist works
- [ ] Settings page functions
- [ ] Profile updates work
- [ ] Verification status shows

---

## 🖼️ Image Optimization Tests

### Visual Tests
1. **Hero Images**
   - [ ] Load progressively with blur
   - [ ] Display in WebP/AVIF format (check DevTools)
   - [ ] Responsive sizes load correctly
   - [ ] No broken images

2. **Product Images**
   - [ ] Lazy load below the fold
   - [ ] Blur placeholders show during load
   - [ ] Error fallback works (test with invalid URL)
   - [ ] Gallery navigation smooth

3. **Avatar Images**
   - [ ] Circular crop correct
   - [ ] Load quickly
   - [ ] Fallback to initials when missing

### Performance Tests
```bash
# Check image optimization in production build
npm run build
npm start

# Use Chrome DevTools:
# 1. Open Network tab
# 2. Filter by "Img"
# 3. Check image sizes and formats
# 4. Verify WebP/AVIF delivery
```

---

## ⚡ Performance Testing

### Lighthouse Audit
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit for:
   - Performance
   - Accessibility
   - Best Practices
   - SEO

**Target Scores**:
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >90

### Web Vitals
Monitor these metrics:
- **LCP** (Largest Contentful Paint): <2.5s
- **FID** (First Input Delay): <100ms
- **CLS** (Cumulative Layout Shift): <0.1

### Bundle Size Analysis
```bash
npm run build:analyze

# Check these metrics:
# - Total bundle size: <1.5MB
# - Vendor chunk: <700KB
# - Page chunks: <200KB each
# - No unnecessarily large dependencies
```

---

## 🔍 Regression Testing

### Check for Breaking Changes

#### 1. API Integration
```bash
# Verify all API calls work
# Test in browser console:

// Should return user details
await fetch('/api/v1/userManagement/user-details', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
}).then(r => r.json())

// Should return products
await fetch('/api/v1/displayItem/top-picks?page=0&size=12')
  .then(r => r.json())
```

#### 2. State Management
- [ ] Auth context works
- [ ] Cart context updates
- [ ] Currency context functions
- [ ] No context errors in console

#### 3. Routing
- [ ] All routes accessible
- [ ] Dynamic routes work ([id], [slug])
- [ ] Redirects function correctly
- [ ] 404 page displays for invalid routes

---

## 🚨 Error Scenarios

### Test Error Handling

#### 1. Network Errors
- [ ] Offline behavior (disconnect network)
- [ ] Slow network (throttle to 3G)
- [ ] API timeout handling
- [ ] Retry logic works

#### 2. Auth Errors
- [ ] Expired token handling
- [ ] Invalid token handling
- [ ] Unauthenticated redirects
- [ ] Permission denied messages

#### 3. Form Errors
- [ ] Validation messages show
- [ ] Server errors display
- [ ] Duplicate submission prevented
- [ ] File upload errors handled

---

## 📱 Mobile Testing

### Responsive Design
Test on these viewports:
- [ ] iPhone SE (375px)
- [ ] iPhone 12 Pro (390px)
- [ ] iPad (768px)
- [ ] Desktop (1920px)

### Touch Interactions
- [ ] Buttons tap correctly
- [ ] Swipe gestures work
- [ ] Modals dismiss properly
- [ ] Dropdowns function
- [ ] Forms are usable

---

## 🌐 Browser Testing

Test in these browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## ⚙️ Environment Testing

### Development
```bash
NODE_ENV=development npm run dev
# Test hot reload
# Test error overlays
# Test console warnings
```

### Production
```bash
npm run build
npm start
# Test optimized builds
# Test caching
# Test performance
```

---

## 📊 Monitoring & Logging

### Console Checks
No errors should appear in console for:
- [ ] Homepage load
- [ ] Navigation
- [ ] Form submissions
- [ ] API calls
- [ ] Image loads

### Network Checks
- [ ] No failed requests (except expected auth errors)
- [ ] Proper cache headers
- [ ] Compression enabled (check Content-Encoding)
- [ ] Reasonable request counts per page

---

## ✅ Sign-Off Checklist

Before deploying to production:
- [ ] All automated tests pass
- [ ] Manual testing completed
- [ ] Performance targets met
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Cross-browser tested
- [ ] Image optimization verified
- [ ] Lazy loading works
- [ ] Bundle size reduced
- [ ] Documentation updated

---

## 🐛 Issue Reporting

If you find issues:

1. **Document the issue**
   - What page/component
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/device details
   - Screenshots if applicable

2. **Check console for errors**
   - Copy full error stack trace
   - Note any network failures
   - Check for warnings

3. **Rollback if critical**
   ```bash
   git log --oneline  # Find pre-optimization commit
   git checkout <commit-hash>
   npm install
   npm run dev
   ```

---

## 📞 Support

For optimization-related questions:
- Check `Docs/optimization/AUDIT_FINDINGS.md`
- Check `Docs/optimization/OPTIMIZATION_SUMMARY.md`
- Review git commit history for changes

---

## 🎉 Success Criteria

Optimization is successful if:
1. ✅ All tests pass
2. ✅ Bundle size reduced by >50%
3. ✅ Page load time improved by >40%
4. ✅ No functionality broken
5. ✅ User experience enhanced
6. ✅ Lighthouse score >90

---

**Last Updated**: 2025-10-21  
**Tested By**: [Your Name]  
**Status**: [ ] Pass [ ] Fail [ ] In Progress
