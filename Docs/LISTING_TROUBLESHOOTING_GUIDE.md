# Listing & Edit Troubleshooting Guide

## Quick Reference for Common Issues

### 🚨 Issue: "Failed to create product with X images"

**Symptoms**: Error when uploading more than 10 images

**Root Cause**: Batch upload logic fails if any batch after the first one fails

**Immediate Solution**:
1. Try uploading in smaller batches (≤10 images at a time)
2. Create listing with first 5-10 images
3. Edit listing to add remaining images in groups of 5

**Code Location**: `/app/sell/page.tsx` lines 403-446

**Status**: Known issue - rollback logic needed

---

### 🚨 Issue: "Product created but some images missing"

**Symptoms**: Product appears in dashboard but has fewer images than uploaded

**Root Cause**: Batch upload partially succeeds - first batch creates product, subsequent batches fail

**Immediate Solution**:
1. Edit the listing
2. Add missing images (they're still in your browser if you haven't refreshed)
3. Save changes

**Prevention**:
- Use fewer images (≤10) in single upload
- Compress images before uploading
- Ensure stable internet connection

**Code Location**: `/app/sell/page.tsx` lines 413-435

**Status**: Critical - needs transaction/rollback logic

---

### 🚨 Issue: "Cannot reorder images - operation times out"

**Symptoms**: Changing main image or reordering fails with timeout error

**Root Cause**: System downloads ALL images then re-uploads them. On slow connections or many images, this times out.

**Immediate Solution**:
1. Don't change image order if you have many images
2. Use strong internet connection
3. Try removing some images first, then reorder

**Workaround**:
1. Note current image order
2. Delete all images from listing
3. Re-upload in desired order

**Code Location**: `/app/edit-listing/[id]/page.tsx` lines 448-508

**Status**: Known issue - needs backend image order endpoint

---

### 🚨 Issue: "Failed to parse multipart servlet request"

**Symptoms**: Upload fails with this error message

**Common Causes**:
1. Too many images in single request
2. Total file size too large (>100MB)
3. Individual file too large (>10MB)
4. Corrupted image file
5. Network interruption during upload

**Solutions**:

**For New Listings**:
```bash
1. Check total file size:
   - Individual: Max 10MB per image
   - Total: Max 100MB all images combined
   
2. Reduce if needed:
   - Compress images
   - Upload fewer images at once
   - Use image optimization tools
```

**For Editing**:
```bash
1. Split operations:
   - Update product info first (Save)
   - Then add/remove images separately (Save again)
   
2. Avoid complex operations:
   - Don't update data + add images + remove images in one save
   - Do one operation at a time
```

**Code Location**: 
- API Client: `/lib/api.ts` lines 567-588
- Proxy: `/app/api/products/[id]/route.ts` lines 281-299

---

### 🚨 Issue: "Request timeout after 5 minutes"

**Symptoms**: Upload starts but never completes, shows timeout error after 5 minutes

**Root Cause**: 
- Very slow internet connection
- Too many/large images
- Server processing time exceeds timeout

**Solutions**:
1. **Reduce image sizes**:
   ```bash
   - Use online compression tools
   - Target 1MB per image
   - Use JPG instead of PNG for photos
   ```

2. **Upload fewer images**:
   ```bash
   - Start with 5 images
   - Add more later via edit
   ```

3. **Check internet speed**:
   ```bash
   - Minimum recommended: 5 Mbps upload
   - Test: speedtest.net
   ```

**Code Location**: Timeout set at `/lib/api.ts` lines 526-532

---

### 🚨 Issue: "Product updated but image changes failed"

**Symptoms**: Success message shown but images weren't added/removed

**Root Cause**: Split operation - product data update succeeded, image operation failed

**Immediate Solution**:
1. Edit listing again
2. Try image operations only (don't change product data)
3. Save

**Code Location**: `/app/edit-listing/[id]/page.tsx` lines 517-531

**Status**: Known issue - needs atomic transaction

---

### 🚨 Issue: Image size validation errors

**Current Limits**:
- **Per Image**: 10MB maximum
- **Total Upload**: 100MB maximum
- **Image Count**: 
  - Sell page: 30 images max
  - Edit page: 50 images max (but backend may reject >30)
- **File Types**: JPG, PNG, WebP

**How to Check Image Size**:

**On Windows**:
```bash
Right-click image → Properties → Details
Look at "Size" field
```

**On Mac**:
```bash
Right-click image → Get Info
Look at "Size" field
```

**On Linux**:
```bash
ls -lh image.jpg
# Shows size in human-readable format
```

**How to Compress Images**:

1. **Online Tools** (Free):
   - tinypng.com - Best for PNG
   - compressjpeg.com - Best for JPG
   - squoosh.app - Google's tool

2. **Desktop Software**:
   - IrfanView (Windows)
   - Preview (Mac) - Export with reduced quality
   - GIMP (All platforms) - Export as JPG quality 85%

3. **Batch Processing**:
   ```bash
   # ImageMagick (if installed)
   mogrify -resize 1920x1080 -quality 85 *.jpg
   ```

---

### 🚨 Issue: "Maximum X images allowed" error

**Symptoms**: Can't add more images to listing

**Cause**: Image limit reached

**Current Limits**:
- Sell page: 30 images
- Edit page: 50 images
- Backend: May vary (check with support)

**Solution**:
1. Remove some existing images
2. Choose best quality images
3. Create multiple listings if needed

**Code Location**:
- Sell page: `/app/sell/page.tsx` line 335
- Edit page: `/app/edit-listing/[id]/page.tsx` line 252

---

### 🚨 Issue: Currency conversion problems

**Symptoms**: 
- Price shows as 0
- Wrong price displayed
- Price rounded unexpectedly

**Root Cause**: Prices converted to TZS before sending to backend, then rounded

**Current Behavior**:
```typescript
// Example: User enters 100 USD
const enteredPrice = 100
const currency = 'USD'
const conversionRate = 2500 // 1 USD = 2500 TZS

// Converted to TZS
const priceInTZS = enteredPrice / conversionRate
// Result: 0.04 TZS (rounded to 0)

// Should be:
const priceInTZS = enteredPrice * conversionRate
// Result: 250,000 TZS
```

**Workaround**: Always enter prices in TZS for now

**Status**: Bug - currency conversion logic needs review

**Code Location**: 
- Sell: `/app/sell/page.tsx` lines 356-367
- Edit: `/app/edit-listing/[id]/page.tsx` lines 388-397

---

## 🔧 Developer Troubleshooting

### Enable Debug Logging

**Browser Console**:
```javascript
// Open browser DevTools (F12)
// Look for these log prefixes:
// [ApiClient] - API operations
// [Proxy] - Next.js proxy operations
// [Sell] - Sell page operations
// 📤 📸 📊 - API client operations
```

**Check Network Tab**:
```bash
1. Open DevTools → Network tab
2. Try upload operation
3. Look for requests to:
   - /api/products/[id] (proxy)
   - /api/v1/products/post-product (backend)
   - /api/v1/products/update/[id] (backend)
   
4. Check request payload size
5. Check response status and body
```

### Common Error Patterns

**401 Unauthorized**:
```bash
Cause: Auth token expired or invalid
Solution: Log out and log back in
Location: Token refresh at /lib/api.ts lines 141-160
```

**413 Payload Too Large**:
```bash
Cause: Total request >100MB
Solution: Reduce image sizes or count
Validation: /lib/api.ts lines 507-512
```

**500 Internal Server Error**:
```bash
Cause: Backend processing error
Check: Browser console for details
Check: Backend logs if accessible
```

**502 Bad Gateway**:
```bash
Cause: Proxy can't reach backend
Check: BACKEND_URL environment variable
Check: Network connectivity
Location: /app/api/products/[id]/route.ts line 6
```

**504 Gateway Timeout**:
```bash
Cause: Backend didn't respond in 5 minutes
Solution: Reduce upload size
Location: Timeout set at multiple locations
```

### Debugging Steps

1. **Check Browser Console**:
   ```bash
   Look for error messages starting with:
   - ❌ (errors)
   - ⚠️ (warnings)
   - 📊 (size info)
   - 🔑 (auth info)
   ```

2. **Check Network Tab**:
   ```bash
   - Look at request/response sizes
   - Check status codes
   - Inspect response bodies
   - Look for failed requests
   ```

3. **Reproduce with Minimal Data**:
   ```bash
   - Try with 1 image only
   - Try with smallest file size
   - Try without description changes
   - Isolate the failing operation
   ```

4. **Check Environment**:
   ```bash
   - Verify NEXT_PUBLIC_API_URL is correct
   - Check if backend is accessible
   - Test auth token validity
   - Verify user permissions
   ```

### Testing Endpoints Manually

**Using Browser Fetch**:
```javascript
// Test backend connectivity
fetch('https://dev.globoexpats.com/api/v1/products/categories')
  .then(r => r.json())
  .then(data => console.log('Categories:', data))
  .catch(err => console.error('Error:', err))

// Test auth
fetch('https://dev.globoexpats.com/api/v1/userManagement/user-details', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
})
  .then(r => r.json())
  .then(data => console.log('User:', data))
  .catch(err => console.error('Error:', err))
```

**Using cURL**:
```bash
# Test categories endpoint
curl https://dev.globoexpats.com/api/v1/products/categories

# Test auth
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://dev.globoexpats.com/api/v1/userManagement/user-details

# Test product creation (complex)
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "product={\"productName\":\"Test\",\"categoryId\":1,\"condition\":\"NEW\",\"location\":\"Dar es Salaam\",\"productDescription\":\"Test\",\"currency\":\"TZS\",\"askingPrice\":10000,\"productWarranty\":\"No warranty\"}" \
  -F "images=@/path/to/image.jpg" \
  https://dev.globoexpats.com/api/v1/products/post-product
```

---

## 📞 When to Contact Support

Contact support if:

1. **Data Loss**: Product created but data is incorrect
2. **Persistent Errors**: Same error after trying all solutions
3. **Account Issues**: Can't access listing features
4. **Suspected Bug**: Behavior doesn't match documentation
5. **Production Issues**: Affecting business operations

**What to Include**:
```bash
1. Error message (exact text)
2. Steps to reproduce
3. Browser console logs
4. Network tab screenshot
5. Product ID (if applicable)
6. Time of occurrence
7. Browser and OS version
```

---

## 🔄 Workaround Summary Table

| Issue | Quick Fix | Better Solution |
|-------|-----------|----------------|
| Too many images fail | Upload in batches | Wait for rollback logic fix |
| Reorder timeout | Use good internet | Wait for backend order endpoint |
| Multipart error | Reduce file sizes | Compress images first |
| Timeout error | Upload fewer images | Use image optimization |
| Split operation fail | Edit again separately | Wait for atomic transaction |
| Image missing | Edit and re-add | Check upload completion |
| Wrong price | Enter in TZS | Wait for currency fix |
| Size limit | Compress images | Use online tools |

---

**Last Updated**: January 2025  
**Status**: Active troubleshooting guide
**Related**: LISTING_FUNCTIONALITY_AUDIT.md
