# API Integration Troubleshooting Guide

Common issues and solutions when working with the GloboExpat API.

---

## Common Issues & Solutions

### 1. 401 Unauthorized Errors

#### **Symptom**
```
Error: HTTP error! status: 401
Authentication failed. Please check your credentials.
```

#### **Causes**
1. Token expired (2-hour expiry)
2. Token not set in ApiClient
3. Token cleared from localStorage
4. Invalid token format

#### **Solutions**

**A. Check if token is set:**
```typescript
import { getAuthToken } from '@/lib/auth-service'

const token = getAuthToken()
if (!token) {
  console.log('No token found - user needs to login')
  router.push('/login')
}
```

**B. Verify token in localStorage:**
```typescript
// Open browser console
localStorage.getItem('expat_auth_token')
localStorage.getItem('expat_auth_token_expiry')
```

**C. Force token rehydration:**
```typescript
import { apiClient } from '@/lib/api'
import { getAuthToken } from '@/lib/auth-service'

const token = getAuthToken()
if (token) {
  apiClient.setAuthToken(token)
}
```

**D. The ApiClient has automatic retry:**
```typescript
// This is already implemented in /lib/api.ts
// On 401 error, it automatically:
// 1. Checks localStorage for token
// 2. Rehydrates the token
// 3. Retries the request once
```

---

### 2. CORS Errors

#### **Symptom**
```
Access to fetch at 'http://10.123.22.21:8081/api/v1/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

#### **Causes**
1. Backend CORS not configured for your origin
2. Preflight OPTIONS request failing
3. Missing credentials in request

#### **Solutions**

**A. Check environment variables:**
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://10.123.22.21:8081
NEXT_PUBLIC_BACKEND_URL=http://10.123.22.21:8081
```

**B. Use Next.js API routes as proxy:**
```typescript
// For problematic endpoints, create proxy:
// /app/api/products/[id]/route.ts
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const token = request.headers.get('authorization')
  
  const response = await fetch(
    `http://10.123.22.21:8081/api/v1/products/update/${params.id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || ''
      },
      body: JSON.stringify(body)
    }
  )
  
  return response
}
```

**C. Verify backend CORS settings:**
```java
// Backend should have:
@CrossOrigin(origins = {"http://localhost:3000", "http://10.123.22.21:3000"})
// or
@CrossOrigin(origins = "*") // For development only!
```

---

### 3. Image Upload Failures

#### **Symptom**
```
Failed to upload product images
Error: Request failed with status 400
```

#### **Causes**
1. File size exceeds limit (5MB)
2. Invalid file format
3. Missing FormData structure
4. Incorrect Content-Type header

#### **Solutions**

**A. Validate files before upload:**
```typescript
const validateImage = (file: File) => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }
  
  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image must be less than 5MB')
  }
  
  return true
}

// Use in upload handler
files.forEach(file => {
  try {
    validateImage(file)
    validFiles.push(file)
  } catch (error) {
    console.error('Invalid file:', file.name, error.message)
  }
})
```

**B. Correct FormData structure:**
```typescript
const formData = new FormData()

// 1. Add product data as JSON string
formData.append('product', JSON.stringify({
  productName: 'MacBook Pro',
  categoryId: 3,
  askingPrice: 1200
  // ... other fields
}))

// 2. Add images (use 'images' key for multiple files)
imageFiles.forEach(file => {
  formData.append('images', file)
})

// 3. DO NOT set Content-Type header (browser sets it automatically with boundary)
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
    // DO NOT add 'Content-Type': 'multipart/form-data'
  },
  body: formData
})
```

**C. Debug FormData content:**
```typescript
// Log what's being sent
for (let pair of formData.entries()) {
  console.log(pair[0], pair[1])
}
```

---

### 4. Product Category Issues

#### **Symptom**
```
Error: Please select a valid category
Category not found
```

#### **Causes**
1. Using category name instead of categoryId
2. Category list not loaded from backend
3. Hardcoded category IDs that don't match backend

#### **Solutions**

**A. Always fetch categories from backend:**
```typescript
const [categories, setCategories] = useState<Category[]>([])

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const cats = await apiClient.getCategories()
      setCategories(cats)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }
  fetchCategories()
}, [])
```

**B. Map category name to ID:**
```typescript
const selectedCategory = categories.find(
  cat => cat.categoryName.toLowerCase() === formData.category.toLowerCase()
)

if (!selectedCategory) {
  throw new Error('Invalid category selected')
}

const categoryId = selectedCategory.categoryId
```

**C. Backend categories (as of this audit):**
```typescript
// Current categories from backend:
1 - Automotive
2 - Home & Furniture
3 - Electronics & Tech
4 - Games & Toys
5 - Fashion & Style
6 - Fitness & Sports
7 - Books & Media
8 - Arts & Crafts

// Always fetch dynamically - these may change!
```

---

### 5. Email Verification Failures

#### **Symptom**
```
OTP verification failed
Email already verified
Buyer profile not found
```

#### **Causes**
1. Invalid OTP code
2. OTP expired (typically 10-15 minutes)
3. User already verified
4. Missing authentication token

#### **Solutions**

**A. Ensure user is logged in:**
```typescript
const { isLoggedIn } = useAuth()

if (!isLoggedIn) {
  toast.error('Please login first')
  router.push('/login')
  return
}
```

**B. Request OTP with proper format:**
```typescript
// Ensure token is set
const token = getAuthToken()
if (token) {
  apiClient.setAuthToken(token)
}

// Send OTP
await apiClient.sendEmailOtp('john.doe@company.com')
```

**C. Verify with correct parameters:**
```typescript
await apiClient.verifyEmailOtp(
  'john.doe@company.com',  // organizational email
  '123456',                 // 6-digit OTP
  'SELLER'                  // role: 'SELLER' or 'USER'
)
```

**D. Handle verification errors:**
```typescript
try {
  await verifyOrganizationEmail(email, otp, role)
  toast.success('Email verified successfully!')
} catch (error) {
  if (error.message.includes('expired')) {
    toast.error('OTP expired. Please request a new one.')
  } else if (error.message.includes('invalid')) {
    toast.error('Invalid OTP. Please check and try again.')
  } else {
    toast.error('Verification failed. Please try again.')
  }
}
```

---

### 6. Cart & Checkout Issues

#### **Symptom**
```
Account verification required
Buyer profile not found
Cannot add items to cart
```

#### **Causes**
1. User not verified (email verification required)
2. Buyer profile not created
3. Missing authentication

#### **Solutions**

**A. Check verification status:**
```typescript
const { isVerifiedBuyer, canBuy } = useAuth()

if (!canBuy) {
  toast.error('Please verify your email to add items to cart')
  router.push('/account/verification')
  return
}
```

**B. Verify buyer profile exists:**
```typescript
try {
  const user = await apiClient.getUserDetails()
  
  // Check if user has completed verification
  if (user.verificationStatus !== 'VERIFIED') {
    toast.warning('Please complete email verification')
    router.push('/account/verification')
  }
} catch (error) {
  if (error.message.includes('Buyer profile not found')) {
    // Trigger verification flow
    router.push('/account/verification')
  }
}
```

**C. Complete verification flow:**
```typescript
// 1. User logs in
await login(email, password)

// 2. Request OTP
await requestOrganizationEmailOtp(orgEmail)

// 3. Verify OTP
await verifyOrganizationEmail(orgEmail, otp, 'USER')

// 4. Now user can add to cart
await apiClient.addToCart(productId, quantity)
```

---

### 7. Registration Issues

#### **Symptom**
```
User already exists
Email already registered
Invalid email format
Password requirements not met
```

#### **Causes**
1. Email already in system
2. Invalid email format
3. Weak password
4. Terms not accepted

#### **Solutions**

**A. Validate email format:**
```typescript
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

if (!validateEmail(formData.email)) {
  setError('Please enter a valid email address')
  return
}
```

**B. Validate password strength:**
```typescript
const validatePassword = (password: string) => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number'
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special character'
  }
  return null
}

const passwordError = validatePassword(formData.password)
if (passwordError) {
  setError(passwordError)
  return
}
```

**C. Handle "user already exists" error:**
```typescript
try {
  await apiClient.register(userData)
  router.push('/login')
} catch (error) {
  if (error.message.toLowerCase().includes('already exists')) {
    toast.warning('This email is already registered. Please sign in instead.')
    router.push('/login')
  } else {
    toast.error(error.message)
  }
}
```

**D. Ensure terms are accepted:**
```typescript
if (!formData.agreeToTerms || !formData.agreeToPrivacyPolicy) {
  setError('Please accept the Terms of Service and Privacy Policy')
  return
}
```

---

### 8. Token Expiry Issues

#### **Symptom**
```
Session expired
Please login again
Unauthorized access
```

#### **Causes**
1. Token expired (2-hour limit)
2. User inactive for extended period
3. Token manually cleared

#### **Solutions**

**A. Check token expiry:**
```typescript
const isTokenValid = () => {
  const expiryTime = localStorage.getItem('expat_auth_token_expiry')
  if (!expiryTime) return false
  
  const now = Date.now()
  return now < parseInt(expiryTime)
}

if (!isTokenValid()) {
  toast.warning('Session expired. Please login again.')
  router.push('/login')
}
```

**B. Implement auto-refresh (recommended):**
```typescript
// In auth-service.ts - already implemented
// Auto-logout timer triggers after 2 hours
// Listen for expiry event
useEffect(() => {
  const handleExpiry = () => {
    toast.warning('Session expired')
    router.push('/login')
  }
  
  window.addEventListener('authTokenExpired', handleExpiry)
  return () => window.removeEventListener('authTokenExpired', handleExpiry)
}, [])
```

**C. Extend session before expiry:**
```typescript
// Refresh token before expiry (implement if backend supports)
const refreshToken = async () => {
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${oldToken}` }
    })
    const { token } = await response.json()
    setAuthToken(token)
  } catch (error) {
    // Refresh failed - redirect to login
    router.push('/login')
  }
}
```

---

### 9. Environment Configuration Issues

#### **Symptom**
```
Cannot connect to API
Network error
API endpoint not found
```

#### **Causes**
1. Missing environment variables
2. Incorrect API URL
3. Backend not running

#### **Solutions**

**A. Verify environment variables:**
```bash
# Check .env.local exists
cat .env.local

# Should contain:
NEXT_PUBLIC_API_URL=http://10.123.22.21:8081
NEXT_PUBLIC_BACKEND_URL=http://10.123.22.21:8081
```

**B. Test backend connectivity:**
```bash
# Test if backend is accessible
curl http://10.123.22.21:8081/api/v1/products/categories

# Should return category list
```

**C. Restart Next.js after env changes:**
```bash
# Environment variables are loaded at build time
# Must restart dev server after changing .env files
npm run dev
```

**D. Verify API_BASE_URL in code:**
```typescript
// lib/api.ts
console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL)
// Should log: http://10.123.22.21:8081
```

---

### 10. Multipart Form Data Issues

#### **Symptom**
```
Missing form data
Invalid multipart boundary
File upload failed
```

#### **Causes**
1. Incorrect Content-Type header
2. Wrong FormData structure
3. Missing boundary in multipart request

#### **Solutions**

**A. Never set Content-Type for FormData:**
```typescript
// ❌ WRONG
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data', // DON'T DO THIS!
    'Authorization': `Bearer ${token}`
  },
  body: formData
})

// ✅ CORRECT
const response = await fetch(url, {
  method: 'POST',
  headers: {
    // Only include Authorization, browser sets Content-Type automatically
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
```

**B. Check FormData in ApiClient:**
```typescript
// In lib/api.ts - already handled correctly
private async request(endpoint: string, options: RequestInit = {}) {
  const isFormData = options.body instanceof FormData
  
  const headers = isFormData
    ? { Authorization: this.headers.Authorization } // Only auth header
    : this.headers // Full headers including Content-Type
  
  return fetch(url, { headers, ...options })
}
```

---

## Debugging Tools

### 1. Browser DevTools Network Tab

**Check request details:**
```
1. Open DevTools (F12)
2. Navigate to Network tab
3. Perform action that makes API call
4. Click on request to see:
   - Request URL
   - Request headers
   - Request payload
   - Response status
   - Response body
```

### 2. Console Logging

**Add debug logs:**
```typescript
// In api.ts
private async request<T>(endpoint: string, options: RequestInit = {}) {
  console.group('🔵 API Request')
  console.log('Endpoint:', endpoint)
  console.log('Method:', options.method || 'GET')
  console.log('Headers:', headers)
  console.log('Body:', options.body)
  console.groupEnd()
  
  // ... existing code
  
  console.group('🟢 API Response')
  console.log('Status:', response.status)
  console.log('Data:', data)
  console.groupEnd()
}
```

### 3. Test API Directly

**Use cURL to bypass frontend:**
```bash
# Test registration
curl -X POST http://10.123.22.21:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "password": "Test123!",
    "emailAddress": "test@example.com",
    "agreeToTerms": true,
    "agreeToPrivacyPolicy": true
  }'

# Test login
curl -X POST http://10.123.22.21:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### 4. Check localStorage

**Inspect stored data:**
```javascript
// In browser console
console.log('Token:', localStorage.getItem('expat_auth_token'))
console.log('Expiry:', localStorage.getItem('expat_auth_token_expiry'))
console.log('Session:', localStorage.getItem('expatUserSession'))

// Clear if needed
localStorage.clear()
```

---

## Prevention Best Practices

### 1. Always Validate Input
```typescript
// Before API call
if (!data.email || !data.password) {
  throw new Error('Missing required fields')
}
```

### 2. Handle All Error Cases
```typescript
try {
  await apiCall()
} catch (error) {
  if (error.statusCode === 401) {
    // Handle auth error
  } else if (error.statusCode === 400) {
    // Handle validation error
  } else {
    // Handle generic error
  }
}
```

### 3. Show User-Friendly Messages
```typescript
// Don't show technical errors to users
catch (error) {
  console.error('Technical error:', error)
  toast.error('Something went wrong. Please try again.')
}
```

### 4. Test Edge Cases
```typescript
// Test with:
- Empty inputs
- Very long inputs
- Special characters
- Large files
- Slow network
- No network
- Expired tokens
```

---

## Getting Help

### Resources
1. **Swagger UI:** http://10.123.22.21:8081/swagger-ui/index.html#/
2. **Platform Audit:** `/Docs/api/PLATFORM_AUDIT_REPORT.md`
3. **API Reference:** `/Docs/api/API_QUICK_REFERENCE.md`

### Contact
- **Backend Issues:** Check Swagger documentation first
- **Frontend Issues:** Review error logs in browser console
- **Integration Issues:** Check this troubleshooting guide

---

**Last Updated:** 2025-10-15  
**Version:** 1.0
