# Listing & Edit Functionality Comprehensive Audit Report
**Date**: January 2025  
**Platform**: ExpatFrontend Marketplace  
**Backend**: https://dev.globoexpats.com/swagger-ui/index.html

## Executive Summary

After comprehensive audit of the listing creation and editing functionality, the platform demonstrates **robust architecture with sophisticated error handling**. However, several critical issues have been identified that could affect some users, particularly those attempting to:
1. Upload many images (>10)
2. Edit listings with image reordering
3. Work with large file sizes near limits
4. Experience network instability

## 🔍 System Architecture Overview

### Backend API Endpoints

#### Product Creation
- **Endpoint**: `POST /api/v1/products/post-product`
- **Format**: `multipart/form-data`
- **Required Fields**:
  - `product` (JSON string): Product metadata
  - `images` (File array): Product images
- **Backend Limits**: 
  - Image limit appears to be 30 images (from Swagger: "max 10, JPEG/PNG" but frontend supports 30)
  - File format: JPEG/PNG
  - Backend extracts `sellerId` from JWT token

#### Product Update
- **Endpoint**: `PATCH /api/v1/products/update/{productId}`
- **Format**: `multipart/form-data`
- **Query Params**: `imageIds` (array of IDs to remove)
- **Fields**:
  - `product` (JSON string, required): Updated product data
  - `images` (File array, optional): New images to add

### Frontend Implementation Stack

**Component Flow**:
```
Sell Page (/app/sell/page.tsx)
  ↓
API Client (/lib/api.ts)
  ↓
Next.js Proxy (/app/api/products/[id]/route.ts) [for updates only]
  ↓
Backend API (https://dev.globoexpats.com)
```

## 🐛 Critical Issues Identified

### 1. **Image Batch Upload Logic Complexity** (HIGH SEVERITY)

**Location**: `/app/sell/page.tsx` lines 403-446

**Issue**: The sell page implements a complex batching system for >10 images:
- First batch: 5 images (creates product)
- Subsequent batches: 5 images each (updates product)

**Code**:
```typescript
if (reorderedImages.length > 10) {
  // First, create product with first batch of images
  const firstBatch = reorderedImages.slice(0, 5)
  result = await apiClient.createProduct(productData, firstBatch)
  
  // Then add remaining images in batches
  const remainingImages = reorderedImages.slice(5)
  for (let i = 0; i < remainingImages.length; i += batchSize) {
    const batch = remainingImages.slice(i, i + batchSize)
    await apiClient.updateProduct(result.productId.toString(), {}, batch)
  }
}
```

**Problems**:
1. **Race Condition**: If first batch succeeds but subsequent batches fail, product is created with incomplete images
2. **No Rollback**: Failed batches leave product in inconsistent state
3. **Error Recovery**: Users lose progress if any batch fails
4. **ProductID Dependency**: Requires productId from first request for subsequent requests

**Impact**: Users uploading 11-30 images may experience:
- Partial uploads (product created but missing images)
- Confusing error messages
- Data inconsistency

**Recommendation**:
```typescript
// RECOMMENDED: Add transaction-like behavior
try {
  // Upload all batches
  const allResults = await uploadInBatches(images)
  
  // Verify all succeeded
  if (allResults.some(r => !r.success)) {
    // Rollback: Delete the created product
    await apiClient.deleteProduct(result.productId.toString())
    throw new Error('Some images failed to upload. Please try again.')
  }
} catch (error) {
  // Cleanup on failure
  if (result?.productId) {
    await apiClient.deleteProduct(result.productId.toString())
  }
  throw error
}
```

### 2. **Edit Page Image Reordering Complexity** (HIGH SEVERITY)

**Location**: `/app/edit-listing/[id]/page.tsx` lines 448-508

**Issue**: When user changes image order (sets new main image), the system:
1. Downloads ALL existing images from backend
2. Re-uploads them in new order
3. Deletes ALL original images

**Code**:
```typescript
if (orderChanged && currentImages.length > 0) {
  // Download all current images
  const reorderedFiles = await Promise.all(
    activeImages.map(async (img, index) => {
      return await downloadImageAsFile(img.imageUrl, `reordered-image-${index}.jpg`)
    })
  )
  
  // Add new images at the end
  imagesToUpload = [...reorderedFiles, ...newImages]
  
  // Delete ALL current images
  imageIdsToDelete = currentImages.map((img) => img.imageId)
}
```

**Problems**:
1. **Bandwidth Intensive**: Downloads then re-uploads same images
2. **Network Dependency**: Requires stable connection for large downloads
3. **File Size Validation**: Downloaded files validated for size (line 466-469)
4. **Total Size Limit**: Can exceed 100MB limit (line 495-501)
5. **Download Failures**: If any image download fails, entire operation fails (line 472-475)

**Impact**:
- Users with slow internet cannot reorder images
- High bandwidth costs for users
- Timeout errors on slow connections (5-minute timeout)
- Complete failure if single image download fails

**Alternative Recommendation**:
```typescript
// RECOMMENDED: Send image order to backend instead of re-uploading
const imageOrder = {
  imageIds: currentImages.map(img => img.imageId),
  mainImageId: currentImages[0].imageId
}

await apiClient.updateProductImageOrder(productId, imageOrder)
```

**Backend Feature Request**: Add endpoint:
```
PATCH /api/v1/products/{id}/image-order
Body: { imageIds: [3, 1, 2], mainImageId: 3 }
```

### 3. **Split Operation Workaround** (MEDIUM SEVERITY)

**Location**: `/app/edit-listing/[id]/page.tsx` lines 514-542

**Issue**: When both updating product data AND managing images, the system splits into 2 requests:

```typescript
if (imagesToUpload.length > 0 && imageIdsToRemove.length > 0) {
  // First: Update product data only
  await apiClient.updateProduct(productId, updateData)
  
  // Then: Handle image operations
  await apiClient.updateProduct(productId, {}, imagesToUpload, imageIdsToRemove)
}
```

**Problems**:
1. **Race Condition**: If first succeeds but second fails, data is inconsistent
2. **No Atomic Transaction**: Two separate database operations
3. **User Confusion**: Success message shown even if images fail
4. **Backend Issue**: Indicates backend cannot handle complex multipart in single request

**Impact**:
- Product updated but images unchanged if second request fails
- Users see success but images missing
- Debugging difficulty (which request failed?)

**Recommendation**:
1. **Frontend**: Add transaction-like error handling
2. **Backend**: Fix multipart handling to support single request

### 4. **Error Handling Edge Cases** (MEDIUM SEVERITY)

**Location**: Multiple files

**Issues Found**:

#### A. Non-JSON Response Handling
`/lib/api.ts` lines 600-609:
```typescript
if (contentType && contentType.includes('application/json')) {
  return await response.json()
} else {
  const textResponse = await response.text()
  // Returns placeholder with productId: 0
  return { productId: 0, imageIds: [] }
}
```

**Problem**: If backend returns 200 with plain text, frontend thinks success but has no product ID.

#### B. Empty Product ID Check
`/app/sell/page.tsx` lines 448-455:
```typescript
if (!result.productId && !(result as any).data?.productId) {
  console.error('❌ CRITICAL: No productId in response!')
  alert('⚠️ Warning: Product creation returned no ID...')
}
```

**Problem**: Uses `alert()` which blocks UI. Should use toast notification.

#### C. Multipart Parsing Error Detection
Multiple locations have string matching for `'Failed to parse multipart servlet request'`

**Problem**: Brittle error detection. If backend error message changes, detection fails.

**Recommendation**: Backend should return structured error codes:
```json
{
  "error": "MULTIPART_PARSE_ERROR",
  "code": "E_MULTIPART_001",
  "message": "Failed to parse multipart request",
  "details": { "reason": "size_exceeded", "limit": "100MB" }
}
```

### 5. **Size Limit Inconsistencies** (LOW SEVERITY)

**Identified Limits**:
- **Frontend Sell Page**: 30 images max (line 335)
- **Frontend Edit Page**: 50 images max (line 252)
- **Backend Swagger**: "max 10, JPEG/PNG"
- **API Client**: No explicit max image count check
- **Individual File**: 10MB max (consistent)
- **Total Upload**: 100MB max (consistent)

**Problems**:
- Inconsistent limits across components
- Users can add 50 images in edit but backend may reject
- Swagger documentation outdated

**Recommendation**: Standardize to 30 images everywhere and update Swagger docs.

### 6. **Currency Conversion Issues** (LOW SEVERITY)

**Location**: Both sell and edit pages

**Issue**: Prices converted to TZS before sending to backend:
```typescript
const askingPriceInTZS = (isNaN(parsedAsking) ? 0 : parsedAsking) / conversionRate
```

**Problems**:
1. **Precision Loss**: Rounding to nearest shilling loses decimal precision
2. **Exchange Rate Updates**: Hardcoded rates in `CURRENCY_CONFIG` become stale
3. **No Validation**: Silent conversion to 0 if parsing fails

**Recommendation**:
- Store original currency and price
- Let backend handle conversion
- Validate price before conversion

## ✅ What's Working Well

### 1. **Comprehensive Validation**
- File type checking (must be image/*)
- File size validation (10MB per file)
- Total size validation (100MB total)
- Empty file detection
- Filename sanitization

### 2. **Error Recovery**
- Retry logic for 401 errors
- Detailed error logging
- User-friendly error messages
- Multiple fallback strategies

### 3. **Next.js Proxy Pattern**
- Successfully avoids CORS issues
- Proper token forwarding
- FormData cleaning and validation
- Comprehensive logging

### 4. **Security**
- JWT token from HTTP-only cookie
- Backend extracts sellerId from token (not from request)
- Proper authorization checks
- File type validation

## 🔧 Recommended Fixes (Priority Order)

### Priority 1: Critical (Affects Data Integrity)

#### Fix 1.1: Add Batch Upload Rollback
**File**: `/app/sell/page.tsx`
**Lines**: 403-446

```typescript
// Add rollback capability
const uploadWithRollback = async () => {
  let createdProductId: number | null = null
  
  try {
    if (reorderedImages.length > 10) {
      // First batch
      const firstBatch = reorderedImages.slice(0, 5)
      const result = await apiClient.createProduct(productData, firstBatch)
      createdProductId = result.productId
      
      // Remaining batches
      const remainingImages = reorderedImages.slice(5)
      const batchPromises: Promise<void>[] = []
      
      for (let i = 0; i < remainingImages.length; i += 5) {
        const batch = remainingImages.slice(i, i + 5)
        batchPromises.push(
          apiClient.updateProduct(result.productId.toString(), {}, batch)
            .catch(err => {
              console.error(`Batch ${i/5 + 1} failed:`, err)
              throw err // Re-throw to trigger rollback
            })
        )
      }
      
      await Promise.all(batchPromises)
      return result
      
    } else {
      return await apiClient.createProduct(productData, reorderedImages)
    }
  } catch (error) {
    // Rollback: Delete partially created product
    if (createdProductId) {
      console.warn('Rolling back product creation:', createdProductId)
      try {
        await apiClient.deleteProduct(createdProductId.toString())
      } catch (deleteError) {
        console.error('Rollback failed:', deleteError)
      }
    }
    throw error
  }
}

const result = await uploadWithRollback()
```

#### Fix 1.2: Add Transaction-like Edit Operation
**File**: `/app/edit-listing/[id]/page.tsx`
**Lines**: 514-542

```typescript
// Wrap in transaction-like error handling
const updateWithVerification = async () => {
  let dataUpdated = false
  let imagesUpdated = false
  
  try {
    if (imagesToUpload.length > 0 && imageIdsToRemove.length > 0) {
      // Step 1: Update data
      await apiClient.updateProduct(productId, updateData)
      dataUpdated = true
      console.log('✅ Product data updated')
      
      // Step 2: Update images
      await apiClient.updateProduct(productId, {}, imagesToUpload, imageIdsToRemove)
      imagesUpdated = true
      console.log('✅ Images updated')
      
    } else {
      await apiClient.updateProduct(
        productId,
        updateData,
        imagesToUpload.length > 0 ? imagesToUpload : undefined,
        imageIdsToRemove.length > 0 ? imageIdsToRemove : undefined
      )
      dataUpdated = true
      imagesUpdated = true
    }
    
    return { success: true }
    
  } catch (error) {
    // Determine what succeeded
    if (dataUpdated && !imagesUpdated) {
      throw new Error(
        'Product information was updated, but image changes failed. ' +
        'Please try editing the images again separately.'
      )
    }
    throw error
  }
}

await updateWithVerification()
```

### Priority 2: High (User Experience)

#### Fix 2.1: Replace Image Re-upload with Order Update
**File**: `/app/edit-listing/[id]/page.tsx`
**Lines**: 438-508

```typescript
// Check if ONLY order changed (no new images, no removals)
const onlyOrderChanged = 
  orderChanged && 
  newImages.length === 0 && 
  imagesToRemove.length === 0

if (onlyOrderChanged) {
  // Simple order update - no file operations needed
  console.log('🔄 Only image order changed - updating order only')
  
  const imageOrder = currentImages.map((img, index) => ({
    imageId: img.imageId,
    position: index
  }))
  
  await apiClient.updateProductImageOrder(productId, {
    images: imageOrder,
    mainImageId: currentImages[0].imageId
  })
  
} else if (orderChanged && (newImages.length > 0 || imagesToRemove.length > 0)) {
  // Complex operation - keep existing download/re-upload logic
  // But add better error handling...
}
```

**Note**: Requires new backend endpoint:
```
PATCH /api/v1/products/{id}/image-order
Body: {
  "images": [
    { "imageId": 123, "position": 0 },
    { "imageId": 124, "position": 1 }
  ],
  "mainImageId": 123
}
```

#### Fix 2.2: Improve Error Messages
**File**: `/app/sell/page.tsx`
**Lines**: 448-455

```typescript
// Replace alert() with toast
if (!result.productId && !(result as any).data?.productId) {
  console.error('❌ CRITICAL: No productId in response!')
  
  // Log full response for debugging
  console.error('❌ Full response:', JSON.stringify(result, null, 2))
  
  // Show user-friendly toast instead of alert
  toast({
    title: '⚠️ Listing May Need Review',
    description: 'Your listing was submitted but confirmation was not received. Please check "My Listings" to verify.',
    variant: 'destructive',
    duration: 10000, // 10 seconds
  })
  
  // Still redirect but with warning
  await new Promise((resolve) => setTimeout(resolve, 3000))
  window.location.href = '/expat/dashboard?tab=listings&warning=check-status'
  return
}
```

### Priority 3: Medium (Code Quality)

#### Fix 3.1: Standardize Image Limits
**Files**: Multiple

Create constants file:
```typescript
// /lib/product-limits.ts
export const PRODUCT_LIMITS = {
  MAX_IMAGES: 30, // Standardized across all components
  MAX_IMAGE_SIZE_MB: 10,
  MAX_TOTAL_SIZE_MB: 100,
  MAX_DESCRIPTION_LENGTH: 10000,
  MAX_TITLE_LENGTH: 255,
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  BATCH_SIZE: 5, // For chunked uploads
  TIMEOUT_MS: 5 * 60 * 1000, // 5 minutes
} as const

export const ERROR_MESSAGES = {
  MAX_IMAGES_EXCEEDED: `Maximum ${PRODUCT_LIMITS.MAX_IMAGES} images allowed`,
  FILE_TOO_LARGE: `File exceeds ${PRODUCT_LIMITS.MAX_IMAGE_SIZE_MB}MB limit`,
  TOTAL_SIZE_EXCEEDED: `Total upload size exceeds ${PRODUCT_LIMITS.MAX_TOTAL_SIZE_MB}MB`,
  INVALID_FILE_TYPE: 'Only JPEG, PNG, and WebP images are supported',
  UPLOAD_TIMEOUT: 'Upload timed out. Please try with fewer or smaller images.',
} as const
```

Update all components to use these constants.

#### Fix 3.2: Add Structured Error Codes
**File**: `/lib/api.ts`

```typescript
// Error classification
export enum ProductErrorCode {
  MULTIPART_PARSE_ERROR = 'E_MULTIPART_001',
  SIZE_LIMIT_EXCEEDED = 'E_SIZE_001',
  FILE_TYPE_INVALID = 'E_FILE_001',
  NETWORK_ERROR = 'E_NETWORK_001',
  AUTH_ERROR = 'E_AUTH_001',
  VALIDATION_ERROR = 'E_VALIDATION_001',
  UNKNOWN_ERROR = 'E_UNKNOWN_001',
}

export class ProductError extends Error {
  constructor(
    public code: ProductErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ProductError'
  }
}

// Usage
if (errorText.includes('Failed to parse multipart')) {
  throw new ProductError(
    ProductErrorCode.MULTIPART_PARSE_ERROR,
    'Failed to process upload. Please try with fewer images.',
    { originalError: errorText, imageCount: images.length }
  )
}
```

## 📊 Performance Optimization Recommendations

### 1. **Image Compression**
Add client-side image compression before upload:

```typescript
import imageCompression from 'browser-image-compression'

async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1, // Target 1MB per image
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    preserveExif: false,
  }
  
  try {
    const compressedFile = await imageCompression(file, options)
    console.log(`Compressed ${file.name}: ${file.size} -> ${compressedFile.size}`)
    return compressedFile
  } catch (error) {
    console.warn('Compression failed, using original:', error)
    return file
  }
}

// Use in upload flow
const compressedImages = await Promise.all(
  formData.images.map(img => compressImage(img))
)
```

### 2. **Progress Tracking**
Add upload progress indicators:

```typescript
const [uploadProgress, setUploadProgress] = useState<{
  current: number
  total: number
  percentage: number
}>({ current: 0, total: 0, percentage: 0 })

// During batch upload
for (let i = 0; i < remainingImages.length; i += batchSize) {
  setUploadProgress({
    current: i + batchSize,
    total: remainingImages.length,
    percentage: ((i + batchSize) / remainingImages.length) * 100
  })
  
  await apiClient.updateProduct(...)
}
```

### 3. **Parallel Uploads**
For batch uploads, consider parallel execution with concurrency limit:

```typescript
import pLimit from 'p-limit'

const limit = pLimit(3) // Max 3 concurrent uploads

const batchPromises = batches.map((batch, index) =>
  limit(() => apiClient.updateProduct(productId, {}, batch))
)

await Promise.all(batchPromises)
```

## 🧪 Testing Recommendations

### Unit Tests Needed

1. **Image Validation**
   - Test file size limits
   - Test file type validation
   - Test empty file detection
   - Test total size calculation

2. **Batch Upload Logic**
   - Test single batch (≤10 images)
   - Test multiple batches (>10 images)
   - Test batch failure scenarios
   - Test rollback logic

3. **Error Handling**
   - Test multipart parsing errors
   - Test network failures
   - Test timeout scenarios
   - Test authentication errors

### Integration Tests Needed

1. **End-to-End Product Creation**
   - Create with 1 image
   - Create with 10 images
   - Create with 30 images
   - Test with large files

2. **End-to-End Product Editing**
   - Update data only
   - Update images only
   - Update both data and images
   - Reorder images
   - Add and remove images simultaneously

### Load Tests Needed

1. **Concurrent Uploads**
   - Multiple users uploading simultaneously
   - Backend capacity testing
   - Database lock testing

2. **Large File Handling**
   - Multiple 10MB files
   - Total payload near 100MB
   - Network timeout scenarios

## 📝 Documentation Improvements Needed

### 1. **Update Swagger Documentation**
- Correct max image limit to 30
- Document actual response formats
- Add error code documentation
- Document query parameter usage

### 2. **Frontend Documentation**
- Document batch upload logic
- Explain proxy pattern usage
- Add troubleshooting guide
- Document error recovery procedures

### 3. **User Help Documentation**
- Image upload guidelines
- File size optimization tips
- Troubleshooting common errors
- Best practices for listings

## 🔐 Security Audit

### Findings: ✅ Generally Secure

1. **Token Handling**: ✅ Proper HTTP-only cookies
2. **Authorization**: ✅ Backend extracts sellerId from JWT
3. **File Validation**: ✅ Type and size checks
4. **Input Sanitization**: ✅ Filename cleaning, JSON validation
5. **CORS**: ✅ Proper proxy pattern

### Minor Recommendations:

1. **Add Rate Limiting**: Prevent abuse of upload endpoints
2. **Add File Content Validation**: Check image headers, not just MIME type
3. **Add Virus Scanning**: For production deployments
4. **Log Suspicious Activity**: Multiple failed uploads, unusual file sizes

## 📋 Summary & Action Plan

### Immediate Actions (Week 1)
1. ✅ Document all findings (this document)
2. ⚠️ Add rollback logic to batch uploads
3. ⚠️ Improve error messages (replace alerts)
4. ⚠️ Standardize image limits to 30

### Short-term Actions (Week 2-4)
1. ⚠️ Implement transaction-like edit operations
2. ⚠️ Add upload progress indicators
3. ⚠️ Add image compression
4. ⚠️ Create comprehensive test suite

### Medium-term Actions (Month 2-3)
1. 🔄 Request backend image order endpoint
2. 🔄 Implement structured error codes
3. 🔄 Add performance monitoring
4. 🔄 Update Swagger documentation

### Long-term Actions (Quarter 2)
1. 🔄 Implement CDN for image serving
2. 🔄 Add image optimization pipeline
3. 🔄 Implement background job system for large uploads
4. 🔄 Add comprehensive analytics

## 🎯 Conclusion

The listing and editing functionality is **fundamentally sound** with sophisticated error handling and validation. The identified issues primarily affect edge cases:

**High Risk Scenarios**:
- Users uploading 11-30 images
- Users reordering images in edits
- Users with slow/unstable internet
- Concurrent operations during network issues

**Recommendation**: Implement Priority 1 fixes immediately to address data integrity concerns, then progressively add Priority 2 and 3 improvements to enhance user experience and code quality.

The system works well for the majority of users (1-10 images, stable internet, simple edits), but needs hardening for edge cases and production-scale usage.

---

**Audit Completed By**: AI Assistant  
**Date**: January 2025  
**Status**: Complete - Awaiting Review
