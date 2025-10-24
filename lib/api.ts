/**
 * API Client for Globoexpats Platform
 *
 * Centralized API client for communicating with the backend services.
 * Provides type-safe methods for all API endpoints with proper error handling,
 * authentication, and response processing.
 *
 * @example Basic usage:
 * ```tsx
 * import { api } from '@/lib/api'
 *
 * // Fetch products
 * const products = await api.products.list({ category: 'electronics' })
 *
 * // Get single product
 * const product = await api.products.get('product-id')
 * ```
 */

import { logger } from './logger'

// ============================================================================
// CONFIGURATION & TYPES
// ============================================================================

/** Base API URL from environment or fallback (empty string - endpoints already include /api/v1/) */
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')

/**
 * Standard API response wrapper
 * @template T - The type of the response data
 */
interface ApiResponse<T> {
  /** Response data */
  data: T
  /** Whether the request was successful */
  success: boolean
  /** Optional success/error message */
  message?: string
  /** Array of validation or other errors */
  errors?: string[]
}

/**
 * Product list query parameters
 */
interface ProductListParams {
  /** Filter by category slug */
  category?: string
  /** Page number for pagination */
  page?: number
  /** Number of items per page */
  limit?: number
  /** Search query string */
  search?: string
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

/**
 * Main API client class handling HTTP requests and authentication
 */
class ApiClient {
  private baseURL: string
  private headers: HeadersInit

  constructor() {
    this.baseURL = API_BASE_URL
    this.headers = {
      'Content-Type': 'application/json',
    }
    // Attempt immediate token rehydration on the client (prevents first-request 401 after refresh)
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('expat_auth_token')
        if (stored) {
          this.setAuthToken(stored)
          if (process.env.NODE_ENV === 'development') {
            console.debug('[ApiClient] Rehydrated auth token from localStorage during construction')
          }
        }
      } catch {
        /* ignore */
      }
    }
  }

  /**
   * Sets the authentication token for subsequent requests
   * @param token - JWT token for authentication
   */
  setAuthToken(token: string): void {
    this.headers = {
      ...this.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  /**
   * Removes the authentication token
   */
  clearAuthToken(): void {
    const { ...headersWithoutAuth } = this.headers as Record<string, string>
    this.headers = headersWithoutAuth
  }

  /**
   * Makes an HTTP request to the API
   * @param endpoint - API endpoint path
   * @param options - Fetch options (method, body, etc.)
   * @returns Promise resolving to API response
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    _retry: boolean = true
  ): Promise<ApiResponse<T>> {
    // If endpoint starts with /api/ (Next.js API routes), don't prepend backend URL
    // This allows us to use Next.js proxy routes to avoid CORS issues
    const isNextApiRoute = endpoint.startsWith('/api/') && !endpoint.startsWith('/api/v1/')
    const url = isNextApiRoute ? endpoint : `${this.baseURL}${endpoint}`

    // Log the request for debugging (dev only)
    logger.debug(`[API] ${options.method || 'GET'} ${url}`)

    // For FormData, don't set Content-Type (let browser set it with boundary)
    const isFormData = options.body instanceof FormData
    const headers = isFormData
      ? { Authorization: (this.headers as Record<string, string>).Authorization } // Only include auth header for FormData
      : this.headers

    try {
      // Create an abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch(url, {
        headers,
        ...options,
        signal: controller.signal,
        redirect: 'manual', // Don't follow redirects automatically - we'll detect them
      })

      clearTimeout(timeoutId)

      // Log response details for debugging
      logger.debug(
        `[API] Response: status=${response.status}, type=${response.type}, url=${response.url}`
      )

      // Check if we got a redirect response (302, 301, 303, 307, 308)
      if (
        response.type === 'opaqueredirect' ||
        response.status === 302 ||
        response.status === 301 ||
        response.status === 303 ||
        response.status === 307 ||
        response.status === 308
      ) {
        logger.info(`[API] Detected ${response.status} redirect - likely authentication required`)
        const authError = new Error(
          'Authentication required. Please log in to continue.'
        ) as Error & {
          isAuthError: boolean
          statusCode: number
        }
        authError.isAuthError = true
        authError.statusCode = 401
        throw authError
      }

      if (!response.ok) {
        // If unauthorized, attempt a one-time silent token rehydration + retry
        if (response.status === 401 && _retry && typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('expat_auth_token')
            const currentAuth = (this.headers as Record<string, string>).Authorization
            if (stored && !currentAuth) {
              this.setAuthToken(stored)
              if (process.env.NODE_ENV === 'development') {
                console.debug('[ApiClient] 401 encountered – rehydrated token and retrying request')
              }
              return this.request<T>(endpoint, options, false)
            }
          } catch {
            // ignore and fall through to normal error handling
          }
        }
        // Try to extract error message from response body
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const contentType = response.headers.get('content-type')

          if (contentType && contentType.includes('application/json')) {
            // Try to parse as JSON
            const errorData = await response.json()
            // Check for common error message formats from backend
            if (errorData.message) {
              errorMessage = errorData.message
            } else if (errorData.error) {
              errorMessage = errorData.error
            } else if (errorData.errors && Array.isArray(errorData.errors)) {
              errorMessage = errorData.errors.join(', ')
            }

            // Add context for common status codes
            if (response.status === 409) {
              errorMessage =
                errorData.message ||
                'This email or username is already registered. Please use a different one or try logging in.'
            } else if (response.status === 400) {
              errorMessage =
                errorData.message || 'Invalid request. Please check your input and try again.'
            } else if (response.status === 401) {
              errorMessage =
                errorData.message || 'Authentication failed. Please check your credentials.'
            } else if (response.status === 404) {
              // Handle verification-related 404 errors
              if (
                errorData.message &&
                (errorData.message.includes('Buyer profile not found') ||
                  errorData.message.includes('not verified') ||
                  errorData.message.includes('cannot add items to cart'))
              ) {
                errorMessage =
                  'Account verification required. Please verify your email to access this feature. Go to Account → Verification to complete the process.'
              } else if (errorData.message && errorData.message.includes('No endpoint')) {
                // Backend endpoint not implemented yet - log silently
                console.warn(`[API] Endpoint not implemented: ${url}`)
                errorMessage = errorData.message
              } else {
                errorMessage = errorData.message || 'Resource not found.'
              }
            } else if (response.status === 500) {
              // Only log if there's actual error data
              if (errorData && Object.keys(errorData).length > 0) {
                console.error('[API] Server error 500:', errorData)
              }
              errorMessage =
                errorData.message ||
                "We're experiencing technical difficulties. Please try again in a moment. If the issue persists, please contact our support team."
            }
          } else {
            // Plain text error response
            const textError = await response.text()
            if (textError && textError.trim()) {
              errorMessage = textError

              // Check for verification-related plain text errors
              if (
                errorMessage.includes('Buyer profile not found') ||
                errorMessage.includes('not verified') ||
                errorMessage.includes('cannot add items to cart')
              ) {
                errorMessage =
                  'Account verification required. Please verify your email to access this feature. Go to Account → Verification to complete the process.'
              }
            }
          }
        } catch (parseError) {
          // If response body parsing fails, use the status code message
          console.warn('Could not parse error response:', parseError)
        }

        // Create error object with detailed type info
        const apiError = new Error(errorMessage) as Error & {
          isVerificationError?: boolean
          statusCode?: number
          isAuthError?: boolean
        }
        apiError.statusCode = response.status
        apiError.isAuthError = response.status === 401 || response.status === 403
        apiError.isVerificationError =
          errorMessage.includes('verification required') ||
          errorMessage.includes('Buyer profile not found') ||
          errorMessage.includes('not verified')
        throw apiError
      }

      // Check Content-Type to determine how to parse response
      const contentType = response.headers.get('content-type')

      if (contentType && contentType.includes('application/json')) {
        // Standard JSON response
        const data = await response.json()
        return data
      } else {
        // Plain text response (common for some backend endpoints like register)
        const text = await response.text()

        // Check if response is HTML (likely an auth redirect or error page)
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          // Don't log as error - this is an expected auth flow
          logger.info('[API] HTML response detected - authentication required')
          const htmlError = new Error(
            'Authentication required. Please log in to continue.'
          ) as Error & {
            isAuthError: boolean
            statusCode: number
          }
          htmlError.isAuthError = true
          htmlError.statusCode = 401
          throw htmlError
        }

        // Wrap plain text in API response format
        return {
          success: true,
          message: text,
          data: { message: text },
        } as ApiResponse<T>
      }
    } catch (error: unknown) {
      // Handle fetch abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        logger.error('[API] Request timeout after 30 seconds')
        const timeoutError = new Error(
          'Request timeout. The server took too long to respond.'
        ) as Error & {
          isAuthError: boolean
          statusCode: number
        }
        timeoutError.isAuthError = true // Treat timeout as potential auth issue
        timeoutError.statusCode = 408
        throw timeoutError
      }

      // Don't log verification errors as errors - they're expected for unverified users
      const err = error as { isVerificationError?: boolean }
      if (err.isVerificationError) {
        console.info('ℹ️ Verification required for this action')
      } else {
        console.error('API request failed:', error)
      }
      throw error
    }
  }

  // ============================================================================
  // PRODUCT ENDPOINTS
  // ============================================================================

  /**
   * Fetches a list of products with optional filtering
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to products list
   */
  async getProducts(params?: ProductListParams): Promise<ApiResponse<unknown>> {
    let queryString = ''
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
      queryString = searchParams.toString() ? `?${searchParams.toString()}` : ''
    }
    return this.request(`/api/v1/products${queryString}`)
  }

  /**
   * Fetches a single product by ID
   * @param id - Product identifier
   * @returns Promise resolving to product data
   */
  async getProduct(id: string): Promise<ApiResponse<unknown>> {
    return this.request(`/api/v1/products/${id}`)
  }

  /**
   * Creates a new product listing with images
   * @param productData - Product information object (WITHOUT sellerId - extracted from JWT)
   * @param images - Array of image files
   * @returns Promise resolving to created product with productId and imageIds
   *
   * IMPORTANT: Backend automatically assigns sellerId from the JWT token.
   * The productData should NOT include sellerId - it's extracted from Authorization header.
   *
   * Backend expects multipart/form-data with:
   * - product: JSON string with product details (NO sellerId)
   * - images: One or more image files
   *
   * Backend response includes:
   * - productId: Unique identifier for the created product
   * - sellerId: User ID extracted from JWT (tied to authenticated user)
   * - sellerName: Username from the authenticated user's account
   */
  async createProduct(
    productData: Record<string, unknown>,
    images: File[]
  ): Promise<{ productId: number; imageIds: number[] }> {
    const formData = new FormData()

    // Add product data as JSON string
    // NOTE: Do NOT include sellerId - backend extracts it from JWT token
    formData.append('product', JSON.stringify(productData))

    // Add images
    images.forEach((image) => {
      formData.append('images', image)
    })

    const response = await fetch(`${this.baseURL}/api/v1/products/post-product`, {
      method: 'POST',
      headers: {
        // JWT token contains user ID - backend extracts sellerId from this
        Authorization: (this.headers as Record<string, string>)['Authorization'] || '',
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return response.json()
    } else {
      await response.text()
      // Backend returned plain text, but we need to return expected format
      // Parse product ID from text if possible or return a placeholder
      return {
        productId: 0,
        imageIds: [],
      } as { productId: number; imageIds: number[] }
    }
  }

  /**
   * Fetches all available product categories
   * @returns Promise resolving to categories list
   */
  async getCategories(): Promise<Array<{ categoryId: number; categoryName: string }>> {
    const response = await this.request<unknown>('/api/v1/products/categories')
    const respData = response as
      | { data?: Array<{ categoryId: number; categoryName: string }> }
      | Array<{ categoryId: number; categoryName: string }>
    return (
      (Array.isArray(respData)
        ? respData
        : (respData as { data?: Array<{ categoryId: number; categoryName: string }> }).data) || []
    )
  }

  /**
   * Fetches all products with pagination
   * @param page - Page number (0-indexed)
   * @returns Promise resolving to paginated products
   */
  async getAllProducts(page: number = 0): Promise<unknown> {
    return this.request(`/api/v1/products/get-all-products?page=${page}`)
  }

  /**
   * Fetches top picks (featured products)
   * @param page - Page number (0-indexed)
   * @param size - Number of items per page
   * @returns Promise resolving to paginated top picks
   */
  async getTopPicks(page: number = 0, size: number = 12): Promise<unknown> {
    return this.request(`/api/v1/displayItem/top-picks?page=${page}&size=${size}`)
  }

  /**
   * Fetches newest listings
   * @param page - Page number (0-indexed)
   * @param size - Number of items per page
   * @returns Promise resolving to paginated newest listings
   */
  async getNewestListings(page: number = 0, size: number = 12): Promise<unknown> {
    return this.request(`/api/v1/displayItem/newest?page=${page}&size=${size}`)
  }

  /**
   * Fetches detailed product information by ID
   * @param productId - Product identifier
   * @returns Promise resolving to detailed product data
   */
  async getProductDetails(productId: number): Promise<unknown> {
    return this.request(`/api/v1/displayItem/itemDetails/${productId}`)
  }

  /**
   * Filters products by various criteria
   * @param filterCriteria - Filter options including category IDs, price, condition, etc.
   * @returns Promise resolving to filtered products
   */
  async filterProducts(filterCriteria: {
    categoryIds?: number[]
    minPrice?: number
    maxPrice?: number
    conditionFilter?: string
    priceSort?: string
    timeFilter?: string
    page?: number
    size?: number
    sellerName?: string
  }): Promise<unknown> {
    // Build query parameters
    const params = new URLSearchParams()

    if (filterCriteria.categoryIds && filterCriteria.categoryIds.length > 0) {
      filterCriteria.categoryIds.forEach((id) => params.append('categoryIds', id.toString()))
    }
    if (filterCriteria.minPrice !== undefined) {
      params.append('minPrice', filterCriteria.minPrice.toString())
    }
    if (filterCriteria.maxPrice !== undefined) {
      params.append('maxPrice', filterCriteria.maxPrice.toString())
    }
    if (filterCriteria.conditionFilter) {
      params.append('conditionFilter', filterCriteria.conditionFilter)
    }
    if (filterCriteria.priceSort) {
      params.append('priceSort', filterCriteria.priceSort)
    }
    if (filterCriteria.timeFilter) {
      params.append('timeFilter', filterCriteria.timeFilter)
    }
    if (filterCriteria.page !== undefined) {
      params.append('page', filterCriteria.page.toString())
    }
    if (filterCriteria.size !== undefined) {
      params.append('size', filterCriteria.size.toString())
    }

    const queryString = params.toString()
    const url = queryString
      ? `/api/v1/displayItem/filter?${queryString}`
      : '/api/v1/displayItem/filter'

    return this.request(url, {
      method: 'POST',
    })
  }

  /**
   * Gets current user's own product listings
   * NOTE: Backend doesn't have dedicated endpoint, returns all products for client-side filtering
   * @param userFullName - User's full name (for client-side filtering)
   * @returns Promise resolving to all products (filter client-side by sellerName)
   */
  async getMyProducts(_userFullName: string): Promise<unknown> {
    // Backend filter API doesn't support sellerName filtering
    // Fetch all products and let the caller filter by sellerName client-side
    return this.getAllProducts(0)
  }

  /**
   * Updates an existing product
   * Uses JSON for simple updates, FormData when images are involved
   * @param id - Product identifier
   * @param productData - Updated product information
   * @param images - Optional new images to add
   * @param imageIdsToRemove - Optional image IDs to remove
   * @returns Promise resolving to updated product
   */
  async updateProduct(
    id: string,
    productData: Record<string, unknown>,
    images?: File[],
    imageIdsToRemove?: number[]
  ): Promise<ApiResponse<unknown>> {
    const hasImages = images && images.length > 0
    const hasImageRemoval = imageIdsToRemove && imageIdsToRemove.length > 0

    // If no images involved, use proxy endpoint to avoid CORS issues
    // Backend doesn't have CORS configured for PATCH, so we proxy through Next.js API
    if (!hasImages && !hasImageRemoval) {
      // Use Next.js API route proxy (server-to-server, no CORS)
      const proxyUrl = `/api/products/${id}`

      const response = await fetch(proxyUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: (this.headers as Record<string, string>).Authorization || '',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        let errorData
        try {
          const errorText = await response.text()
          console.error('[ApiClient] Error response text:', errorText)
          errorData = JSON.parse(errorText)
        } catch (parseError) {
          console.error('[ApiClient] Failed to parse error response:', parseError)
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        throw new Error(
          errorData.message || errorData.error || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      return result
    }

    // If images are involved, use multipart/form-data
    // We need to use a proxy here too because of CORS issues with multipart
    const formData = new FormData()
    formData.append('product', JSON.stringify(productData))

    if (hasImages) {
      images.forEach((image) => {
        formData.append('images', image)
      })
    }

    // Build URL with query params for image removal
    let url = `/api/products/${id}`
    if (hasImageRemoval) {
      const params = new URLSearchParams()
      imageIdsToRemove.forEach((id) => params.append('imageIds', id.toString()))
      url += `?${params.toString()}`
    }

    // Use fetch directly for multipart (don't go through this.request which adds JSON headers)
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: (this.headers as Record<string, string>).Authorization || '',
      },
      body: formData,
    })

    if (!response.ok) {
      let errorData
      try {
        const errorText = await response.text()
        console.error('[ApiClient] Multipart error:', errorText)
        errorData = JSON.parse(errorText)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_parseError) {
        console.error('[ApiClient] Failed to parse multipart error')
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      throw new Error(
        errorData.message || errorData.error || `HTTP error! status: ${response.status}`
      )
    }

    return response.json()
  }

  /**
   * Deletes a product by ID
   * @param id - Product identifier
   * @returns Promise resolving to deletion confirmation
   */
  async deleteProduct(id: string): Promise<ApiResponse<unknown>> {
    return this.request(`/api/v1/products/delete/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Gets product details for editing
   * @param id - Product identifier
   * @returns Promise resolving to product details for editing
   */
  async getProductForEdit(id: string): Promise<unknown> {
    return this.request(`/api/v1/displayItem/itemDetails/${id}`)
  }

  /**
   * Gets click count for a product
   * @param productId - Product identifier
   * @returns Promise resolving to click count and userId
   */
  async getProductClickCount(productId: number): Promise<{ clicks: number; userId: number }> {
    const response = await this.request(`/api/v1/products/product-clickCount/${productId}`)
    return response as unknown as { clicks: number; userId: number }
  }

  // ============================================================================
  // USER ENDPOINTS
  // ============================================================================

  /**
   * Fetches current user details using the authorization token
   * @returns Promise resolving to user data
   */
  async getUserDetails(): Promise<{
    firstName: string
    lastName: string
    loggingEmail: string
    organizationalEmail: string
    position: string
    aboutMe: string
    phoneNumber: string
    organization: string
    location: string
    profileImageUrl?: string
    verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED'
    passportVerificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED'
    addressVerificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED'
    roles: Array<{
      roleId: number
      roleName: string
    }>
  }> {
    const response = await this.request('/api/v1/userManagement/user-details')
    return response as unknown as {
      firstName: string
      lastName: string
      loggingEmail: string
      organizationalEmail: string
      position: string
      aboutMe: string
      phoneNumber: string
      organization: string
      location: string
      profileImageUrl?: string
      verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED'
      passportVerificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED'
      addressVerificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED'
      roles: Array<{
        roleId: number
        roleName: string
      }>
    }
  }

  /**
   * Fetches user profile information
   * @param id - User identifier
   * @returns Promise resolving to user data
   */
  async getUser(id: string): Promise<ApiResponse<unknown>> {
    return this.request(`/api/v1/users/${id}`)
  }

  /**
   * Updates user profile information
   * @param id - User identifier
   * @param data - Updated user data
   * @returns Promise resolving to updated user
   */
  async updateUser(
    id: string,
    data: Partial<Record<string, unknown>>
  ): Promise<ApiResponse<unknown>> {
    return this.request(`/api/v1/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  /**
   * Updates current user's profile using editProfile endpoint
   * Uses Next.js API proxy to avoid CORS issues
   * Backend expects multipart/form-data with profileInformationDTO as JSON string
   * @param data - Profile data to update
   * @param profileImage - Optional profile image file
   * @returns Promise resolving to updated profile
   */
  async editProfile(
    data: {
      firstName?: string
      lastName?: string
      email?: string
      phoneNumber?: string
      location?: string
      aboutMe?: string
      organization?: string
      position?: string
    },
    profileImage?: File
  ): Promise<ApiResponse<unknown>> {
    // Backend expects multipart/form-data with profileInformationDTO as a JSON string
    const formData = new FormData()
    formData.append('profileInformationDTO', JSON.stringify(data))

    if (profileImage) {
      formData.append('profileImage', profileImage)
    }

    // Use Next.js API proxy to avoid CORS issues
    return this.request('/api/profile', {
      method: 'PATCH',
      body: formData,
    })
  }

  /**
   * Changes user password
   * @param data - Current and new password
   * @returns Promise resolving to password change confirmation
   */
  async changePassword(data: {
    currentPassword: string
    newPassword: string
  }): Promise<ApiResponse<unknown>> {
    return this.request('/api/v1/userManagement/changePassword', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Uploads verification documents
   * @param files - Document files to upload
   * @returns Promise resolving to upload confirmation
   */
  async uploadVerificationDocuments(files: File[]): Promise<ApiResponse<unknown>> {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    return this.request('/api/v1/verification-documents/', {
      method: 'POST',
      body: formData,
    })
  }

  /**
   * Deletes a verification document
   * @param docUrl - Document URL to delete
   * @returns Promise resolving to deletion confirmation
   */
  async deleteVerificationDocument(docUrl: string): Promise<ApiResponse<unknown>> {
    return this.request(`/api/v1/verification-documents/delete/${encodeURIComponent(docUrl)}`, {
      method: 'DELETE',
    })
  }

  /**
   * Deletes user profile image
   * @returns Promise resolving to deletion confirmation
   */
  async deleteProfileImage(): Promise<ApiResponse<unknown>> {
    return this.request('/api/v1/userManagement/deleteProfileImage', {
      method: 'DELETE',
    })
  }

  // ============================================================================
  // REVIEW & RATING ENDPOINTS
  // ============================================================================

  /**
   * Posts a product review
   * @param data - Review data including productId, rating, and comment
   * @returns Promise resolving to posted review
   */
  async postReview(data: {
    productId: number
    rating: number
    comment: string
  }): Promise<ApiResponse<unknown>> {
    return this.request('/api/v1/post-review', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Edits an existing product review
   * @param productId - Product identifier
   * @param data - Updated review data
   * @returns Promise resolving to updated review
   */
  async editReview(
    productId: number,
    data: { rating: number; comment: string }
  ): Promise<ApiResponse<unknown>> {
    return this.request(`/api/v1/edit-review/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Deletes a review
   * @param reviewId - Review identifier
   * @returns Promise resolving to deletion confirmation
   */
  async deleteReview(reviewId: number): Promise<ApiResponse<unknown>> {
    return this.request(`/api/v1/delete-review/${reviewId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Rates a product
   * @param data - Rating data including productId and rating value
   * @returns Promise resolving to rating confirmation
   */
  async rateProduct(data: { productId: number; rating: number }): Promise<ApiResponse<unknown>> {
    return this.request('/api/v1/rate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // ============================================================================
  // AUTHENTICATION ENDPOINTS
  // ============================================================================

  /**
   * Authenticates user with email and password
   * @param email - User email address
   * @param password - User password
   * @returns Promise resolving to authentication data
   */
  async login(email: string, password: string): Promise<ApiResponse<unknown>> {
    return this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  /**
   * Registers a new user account
   * @param userData - User registration data
   * @returns Promise resolving to registration result
   */
  async register(userData: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  /**
   * Sends organization email OTP to user email (requires Authorization header)
   * @param organizationalEmail - Organization email to send OTP to
   */
  async sendEmailOtp(organizationalEmail: string): Promise<ApiResponse<unknown>> {
    const qs = `?organizationalEmail=${encodeURIComponent(organizationalEmail)}`
    return this.request(`/api/v1/email/sendOTP${qs}`, { method: 'POST' })
  }

  /**
   * Verifies organization email OTP
   * @param organizationalEmail - Organization email used
   * @param otp - One-time password received in email
   * @param userRoles - Role to assign, e.g., 'SELLER' or 'USER'
   */
  async verifyEmailOtp(
    organizationalEmail: string,
    otp: string,
    userRoles: 'SELLER' | 'USER' | string
  ): Promise<ApiResponse<unknown>> {
    const qs = `?organizationalEmail=${encodeURIComponent(
      organizationalEmail
    )}&otp=${encodeURIComponent(otp)}&userRoles=${encodeURIComponent(userRoles)}`
    return this.request(`/api/v1/email/verifyOTP${qs}`, { method: 'POST' })
  }

  /**
   * Step 1: Sends password reset OTP to user's email
   * @param email - User email address
   * @returns Promise resolving to OTP send confirmation
   */
  async sendPasswordResetOtp(email: string): Promise<ApiResponse<unknown>> {
    return this.request(
      `/api/v1/userManagement/reset-passwordEmail?email=${encodeURIComponent(email)}`,
      {
        method: 'POST',
      }
    )
  }

  /**
   * Step 2: Verifies the OTP code sent to user's email
   * @param email - User email address
   * @param otp - One-time password code
   * @returns Promise resolving to OTP verification result
   */
  async verifyPasswordResetOtp(email: string, otp: string): Promise<ApiResponse<unknown>> {
    return this.request(
      `/api/v1/userManagement/verify-otp?loggingEmail=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`,
      {
        method: 'POST',
      }
    )
  }

  /**
   * Step 3: Resets the password with new password
   * @param email - User email address
   * @param newPassword - New password to set
   * @returns Promise resolving to password reset confirmation
   */
  async resetPasswordWithOtp(email: string, newPassword: string): Promise<ApiResponse<unknown>> {
    return this.request('/api/v1/userManagement/new-password', {
      method: 'POST',
      body: JSON.stringify({ loggingEmail: email, newPassword }),
    })
  }

  /**
   * @deprecated Use sendPasswordResetOtp instead
   * Initiates password reset process
   * @param email - User email address
   * @returns Promise resolving to reset confirmation
   */
  async resetPassword(email: string): Promise<ApiResponse<unknown>> {
    return this.sendPasswordResetOtp(email)
  }

  /**
   * Logs out the current user
   * @returns Promise resolving to logout confirmation
   */
  async logout(): Promise<ApiResponse<unknown>> {
    return this.request('/api/v1/auth/logout', {
      method: 'POST',
    })
  }

  /**
   * Exchanges Google OAuth auth code for JWT token
   * Backend expects GET request with 'code' query parameter
   * @param authCode - Google OAuth authorization code
   * @returns Promise resolving to authentication data
   */
  async exchangeOAuthCode(authCode: string): Promise<ApiResponse<unknown>> {
    const params = new URLSearchParams({ code: authCode })
    return this.request(`/api/v1/oauth2/exchange?${params.toString()}`, {
      method: 'GET',
    })
  }

  // ============================================================================
  // MESSAGING ENDPOINTS
  // ============================================================================

  /**
   * Fetches user's conversation list
   * @returns Promise resolving to conversations
   */
  async getConversations(): Promise<ApiResponse<unknown>> {
    return this.request('/api/v1/messages/conversations')
  }

  /**
   * Fetches messages for a specific conversation
   * @param conversationId - Conversation identifier
   * @returns Promise resolving to messages
   */
  async getMessages(conversationId: string): Promise<ApiResponse<unknown>> {
    return this.request(`/api/v1/messages/conversations/${conversationId}`)
  }

  /**
   * Sends a message in a conversation
   * @param conversationId - Conversation identifier
   * @param message - Message content
   * @returns Promise resolving to sent message
   */
  async sendMessage(conversationId: string, message: string): Promise<ApiResponse<unknown>> {
    return this.request(`/api/v1/messages/conversations/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  }

  /**
   * Creates a new conversation
   * @param recipientId - ID of the message recipient
   * @param initialMessage - First message content
   * @returns Promise resolving to new conversation
   */
  async createConversation(
    recipientId: string,
    initialMessage: string
  ): Promise<ApiResponse<unknown>> {
    return this.request('/api/v1/messages/conversations', {
      method: 'POST',
      body: JSON.stringify({ recipientId, message: initialMessage }),
    })
  }

  // ============================================================================
  // ORDER ENDPOINTS
  // ============================================================================

  /**
   * Fetches user's order history
   * @returns Promise resolving to orders list
   */
  async getOrders(): Promise<ApiResponse<unknown>> {
    return this.request('/api/v1/orders')
  }

  /**
   * Creates a new order
   * @param orderData - Order information
   * @returns Promise resolving to created order
   */
  async createOrder(orderData: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.request('/api/v1/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  }

  /**
   * Fetches details for a specific order
   * @param orderId - Order identifier
   * @returns Promise resolving to order details
   */
  async getOrder(orderId: string): Promise<ApiResponse<unknown>> {
    return this.request(`/api/v1/orders/${orderId}`)
  }

  /**
   * Updates order status
   * @param orderId - Order identifier
   * @param status - New order status
   * @returns Promise resolving to updated order
   */
  async updateOrderStatus(orderId: string, status: string): Promise<ApiResponse<unknown>> {
    return this.request(`/api/v1/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  // ============================================================================
  // CHECKOUT ENDPOINTS
  // ============================================================================

  /**
   * Processes checkout with ZenoPay payment gateway
   * @param checkoutData - Checkout information including customer details and payment info
   * @returns Promise resolving to checkout response with payment details
   */
  async zenoPayCheckout(checkoutData: {
    firstName: string
    lastName: string
    emailAddress: string
    phoneNumber: string
    address: string
    city: string
    state: string
    country: string
    zipCode: string
    deliveryInstructions: string
    deliveryMethod: string
    paymentMethod: string
    agreeToTerms: boolean
    totalAmount: number
    currency: string
  }): Promise<ApiResponse<unknown>> {
    return this.request('/api/v1/checkout/zenoPayCheckOut', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    })
  }

  // ============================================================================
  // CART ENDPOINTS - Backend Integration
  // ============================================================================

  /**
   * Adds an item to the user's cart
   * @param productId - Product identifier
   * @param quantity - Number of items to add
   * @returns Promise resolving to cart update confirmation
   */
  async addToCart(productId: number, quantity: number): Promise<ApiResponse<unknown>> {
    console.log(
      '🔑 [API] Adding to cart - Auth token present:',
      !!(this.headers as Record<string, string>).Authorization
    )
    console.log('🔑 [API] Request headers:', this.headers)

    return this.request('/api/v1/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    })
  }

  /**
   * Fetches the user's current cart
   * @returns Promise resolving to cart data with items, totals, and currency
   */
  async getUserCart(): Promise<
    ApiResponse<{
      items: Array<{
        cartId: number
        productId: number
        quantity: number
        productName: string
        price: number
        currency: string
        subtotal: number
      }>
      totalItems: number
      totalPrice: number
      currency: string
    }>
  > {
    return this.request('/api/v1/cart/User')
  }

  /**
   * Updates the quantity of a cart item
   * @param cartItemId - Cart item identifier
   * @param productId - Product identifier
   * @param quantity - New quantity
   * @returns Promise resolving to cart update confirmation
   */
  async updateCartItem(
    cartItemId: number,
    productId: number,
    quantity: number
  ): Promise<ApiResponse<unknown>> {
    return this.request(`/api/v1/cart/item/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    })
  }

  /**
   * Removes an item from the cart
   * @param cartItemId - Cart item identifier
   * @returns Promise resolving to removal confirmation
   */
  async removeFromCart(cartItemId: number): Promise<ApiResponse<unknown>> {
    return this.request(`/api/v1/cart/item/${cartItemId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Clears all items from the user's cart
   * @returns Promise resolving to clear confirmation
   */
  async clearCart(): Promise<ApiResponse<unknown>> {
    return this.request('/api/v1/cart/clear', {
      method: 'DELETE',
    })
  }
}

// ============================================================================
// SINGLETON INSTANCE & EXPORTS
// ============================================================================

/** Singleton API client instance */
export const apiClient = new ApiClient()

/**
 * Organized API methods for easy consumption
 * Groups related endpoints together for better developer experience
 */
export const api = {
  /** Product-related operations */
  products: {
    list: (params?: ProductListParams) => apiClient.getProducts(params),
    get: (id: string) => apiClient.getProduct(id),
    create: (data: Record<string, unknown>, images: File[]) =>
      apiClient.createProduct(data as Record<string, unknown>, images),
    update: (id: string, data: Record<string, unknown>) => apiClient.updateProduct(id, data),
    delete: (id: string) => apiClient.deleteProduct(id),
  },

  /** User management operations */
  users: {
    get: (id: string) => apiClient.getUser(id),
    update: (id: string, data: Partial<Record<string, unknown>>) => apiClient.updateUser(id, data),
  },

  /** Authentication operations */
  auth: {
    login: (email: string, password: string) => apiClient.login(email, password),
    register: (userData: Record<string, unknown>) => apiClient.register(userData),
    resetPassword: (email: string) => apiClient.resetPassword(email),
    sendPasswordResetOtp: (email: string) => apiClient.sendPasswordResetOtp(email),
    verifyPasswordResetOtp: (email: string, otp: string) =>
      apiClient.verifyPasswordResetOtp(email, otp),
    resetPasswordWithOtp: (email: string, newPassword: string) =>
      apiClient.resetPasswordWithOtp(email, newPassword),
    logout: () => apiClient.logout(),
  },

  /** Messaging operations */
  messages: {
    conversations: () => apiClient.getConversations(),
    messages: (id: string) => apiClient.getMessages(id),
    send: (id: string, message: string) => apiClient.sendMessage(id, message),
    create: (recipientId: string, message: string) =>
      apiClient.createConversation(recipientId, message),
  },

  /** Order management operations */
  orders: {
    list: () => apiClient.getOrders(),
    get: (id: string) => apiClient.getOrder(id),
    create: (data: Record<string, unknown>) => apiClient.createOrder(data),
    updateStatus: (id: string, status: string) => apiClient.updateOrderStatus(id, status),
  },

  /** Cart management operations - DEPRECATED: Now client-side only */
  // Cart operations removed - handled via localStorage in CartProvider

  /** Review & Rating operations */
  reviews: {
    post: (data: { productId: number; rating: number; comment: string }) =>
      apiClient.postReview(data),
    edit: (productId: number, data: { rating: number; comment: string }) =>
      apiClient.editReview(productId, data),
    delete: (reviewId: number) => apiClient.deleteReview(reviewId),
    rate: (data: { productId: number; rating: number }) => apiClient.rateProduct(data),
  },

  /** User profile operations */
  profile: {
    get: () => apiClient.getUserDetails(),
    update: (
      data: {
        firstName?: string
        lastName?: string
        email?: string
        phoneNumber?: string
        location?: string
        aboutMe?: string
        organization?: string
        position?: string
      },
      profileImage?: File
    ) => apiClient.editProfile(data, profileImage),
    changePassword: (currentPassword: string, newPassword: string) =>
      apiClient.changePassword({ currentPassword, newPassword }),
    uploadVerificationDocs: (files: File[]) => apiClient.uploadVerificationDocuments(files),
    deleteVerificationDoc: (docUrl: string) => apiClient.deleteVerificationDocument(docUrl),
    deleteProfileImage: () => apiClient.deleteProfileImage(),
  },
}

/** Default export for backward compatibility */
export default apiClient
