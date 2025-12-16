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

interface MobileCheckoutBuyDetails {
  firstName: string
  lastName: string
  emailAddress: string
  phoneNumber: string
  address: string
  city: string
  state?: string
  country: string
  zipCode?: string
  deliveryInstructions?: string
  deliveryMethod: string
  paymentMethod: string
  agreeToTerms: boolean
  totalAmount: number
  currency: string
}

interface MobileCheckoutItem {
  productId: number
  quantity: number
}

/** Payload for initiating the mobile checkout flow */
interface MobileCheckoutPayload {
  buyDetails: MobileCheckoutBuyDetails
  items: MobileCheckoutItem[]
}

/** Response returned by the mobile checkout endpoint */
interface MobileCheckoutResponse {
  orderId?: string
  checkoutRequestId?: string
  transactionId?: string
  status?: string
  message?: string
  reference?: string
}

/** Response returned by the meet-seller checkout endpoint */
interface MeetSellerCheckoutResponse {
  orderId?: string
  transactionId?: string
  status?: string
  message?: string
  sellers?: Array<{
    sellerName: string
    sellerEmail: string
    sellerPhoneNumber: string
    sellerAddress: string
    orderId: string
    orderDate: string
  }>
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

              // Check for specific database constraint violations
              if (
                errorData.message &&
                errorData.message.includes('duplicate key value violates unique constraint')
              ) {
                if (errorData.message.includes('organizational_email')) {
                  errorMessage =
                    'This email address is already being used by another user for verification. Please use a different email address.'
                } else {
                  errorMessage =
                    'This information is already in use. Please try with different details.'
                }
              } else {
                errorMessage =
                  errorData.message ||
                  "We're experiencing technical difficulties. Please try again in a moment. If the issue persists, please contact our support team."
              }
            } else if (
              response.status === 502 ||
              response.status === 503 ||
              response.status === 504
            ) {
              // Gateway/Service errors - backend is down or unreachable
              console.warn(`[API] Gateway error ${response.status}:`, url)
              errorMessage =
                'Our servers are temporarily unavailable. This is usually due to maintenance or high traffic. Please try again in a few moments.'
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
          // If response body parsing fails, use the status code message with more context
          console.warn('Could not parse error response:', parseError)

          // Try to get raw text if available
          let rawText = ''
          try {
            rawText = await response.clone().text()
          } catch {
            // If that fails too, continue with status-based messages
          }

          // Check for specific database constraint violations in raw text
          if (rawText && rawText.includes('duplicate key value violates unique constraint')) {
            if (rawText.includes('organizational_email')) {
              errorMessage =
                'This email address is already being used by another user for verification. Please use a different email address.'
            } else {
              errorMessage =
                'This information is already in use. Please try with different details.'
            }
          } else if (response.status === 404) {
            errorMessage =
              'Product not found. The item you are looking for may have been removed or is no longer available.'
          } else if (response.status === 500) {
            errorMessage =
              "We're experiencing technical difficulties. Please try again in a moment. If the issue persists, please contact our support team."
          } else if (
            response.status === 502 ||
            response.status === 503 ||
            response.status === 504
          ) {
            errorMessage =
              'Our servers are temporarily unavailable. This is usually due to maintenance or high traffic. Please try again in a few moments.'
          } else if (response.status === 401 || response.status === 403) {
            errorMessage = 'Authentication required. Please log in to access this content.'
          } else {
            errorMessage = `Server error (${response.status}). Please try again later.`
          }
        }

        // Create error object with detailed type info
        const apiError = new Error(errorMessage) as Error & {
          isVerificationError?: boolean
          statusCode?: number
          isAuthError?: boolean
          isGatewayError?: boolean
        }
        apiError.statusCode = response.status
        apiError.isAuthError = response.status === 401 || response.status === 403
        apiError.isGatewayError =
          response.status === 502 || response.status === 503 || response.status === 504
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
      // Also suppress 404 errors for click count endpoint - they're expected for products without data
      const err = error as { isVerificationError?: boolean; statusCode?: number }
      const isClickCount404 = url.includes('product-clickCount') && err.statusCode === 404

      if (err.isVerificationError) {
        console.info('ℹ️ Verification required for this action')
      } else if (isClickCount404) {
        // Silently suppress 404 errors for click counts - they're expected
        // The getProductClickCount method will handle this gracefully
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
    try {
      console.log('📤 Creating product with data:', productData)
      console.log('📸 Number of images:', images.length)

      // For multiple images, try chunked approach if needed
      if (images.length > 10) {
        console.warn(
          `[ApiClient] Many images (${images.length}) - consider chunked upload if errors occur`
        )
      }

      const formData = new FormData()

      // Add product data as JSON string
      // NOTE: Do NOT include sellerId - backend extracts it from JWT token
      const productJsonString = JSON.stringify(productData)

      // Validate product JSON size
      const productJsonSize = new Blob([productJsonString]).size
      if (productJsonSize > 50 * 1024) {
        // 50KB limit for JSON
        throw new Error(
          `Product data too large: ${(productJsonSize / 1024).toFixed(1)}KB. Please reduce description length.`
        )
      }

      formData.append('product', productJsonString)

      // Add images with enhanced validation and metadata
      images.forEach((image, index) => {
        console.log(`📷 Image ${index + 1}:`, image.name, `(${(image.size / 1024).toFixed(2)} KB)`)

        // Validate each image thoroughly
        if (!image.name || image.name.trim() === '') {
          throw new Error(`Image ${index + 1} has no filename`)
        }

        if (image.size === 0) {
          throw new Error(`Image ${index + 1} (${image.name}) is empty`)
        }

        if (image.size > 10 * 1024 * 1024) {
          // 10MB limit
          throw new Error(`Image ${index + 1} (${image.name}) exceeds 10MB limit`)
        }

        if (!image.type.startsWith('image/')) {
          throw new Error(`File ${index + 1} (${image.name}) is not a valid image`)
        }

        // Clean filename to prevent multipart parsing issues
        const cleanFilename = image.name.replace(/[^\w\-_.]/g, '_')

        // Append with explicit filename to ensure proper multipart parsing
        formData.append('images', image, cleanFilename)
      })

      // Log total request size for debugging
      let totalSize = new Blob([JSON.stringify(productData)]).size
      images.forEach((img) => (totalSize += img.size))
      console.log(`📊 Total request size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`)

      if (totalSize > 100 * 1024 * 1024) {
        // 100MB limit
        throw new Error(
          `Total request size (${(totalSize / 1024 / 1024).toFixed(2)}MB) exceeds 100MB limit`
        )
      }

      // Get auth token
      const authToken = (this.headers as Record<string, string>)['Authorization'] || ''
      if (!authToken) {
        console.error('❌ No authorization token found!')
        throw new Error('Authentication required. Please log in and try again.')
      }

      console.log('🔑 Auth token:', authToken.substring(0, 20) + '...')
      console.log('🌐 Posting to:', `${this.baseURL}/api/v1/products/post-product`)

      // Add timeout for large uploads
      const controller = new AbortController()
      const timeoutId = setTimeout(
        () => {
          console.error('[ApiClient] Request timeout after 5 minutes')
          controller.abort()
        },
        5 * 60 * 1000
      ) // 5 minutes timeout

      let response: Response
      try {
        response = await fetch(`${this.baseURL}/api/v1/products/post-product`, {
          method: 'POST',
          headers: {
            // JWT token contains user ID - backend extracts sellerId from this
            Authorization: authToken,
            // Don't set Content-Type - let browser set it with boundary
          },
          body: formData,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
      } catch (fetchError) {
        clearTimeout(timeoutId)

        if (controller.signal.aborted) {
          throw new Error(
            'Upload timeout: Request took too long. Please try with fewer or smaller images.'
          )
        }

        console.error('[ApiClient] Network error during createProduct:', fetchError)
        throw fetchError
      }

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Backend error response:', errorText)
        // Enhanced error handling for multipart issues
        if (errorText.includes('Failed to parse multipart servlet request')) {
          console.error('[ApiClient] Multipart parsing failed during createProduct')
          console.error('[ApiClient] This could be due to:')
          console.error('  1. Too many images in single request')
          console.error('  2. Individual file size issues')
          console.error('  3. Total request size exceeding backend limits')
          console.error('  4. Servlet configuration issues')
          console.error(
            `[ApiClient] Current request: ${images.length} images, ~${(totalSize / 1024 / 1024).toFixed(2)}MB`
          )

          // Suggest specific solutions
          if (images.length > 5) {
            throw new Error(
              `Failed to create product with ${images.length} images. Try uploading fewer images at once (max 5) or use smaller file sizes.`
            )
          } else {
            throw new Error(
              `Failed to create product due to multipart parsing error. Please check file sizes and formats.`
            )
          }
        }

        throw new Error(
          `Failed to create product: ${response.status} - ${errorText || 'Server error'}`
        )
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json()
        console.log('✅ Product created successfully:', result)
        return result
      } else {
        const textResponse = await response.text()
        console.log('⚠️ Non-JSON response:', textResponse)
        // Backend returned plain text, but we need to return expected format
        // Parse product ID from text if possible or return a placeholder
        return {
          productId: 0,
          imageIds: [],
        } as { productId: number; imageIds: number[] }
      }
    } catch (error) {
      console.error('❌ Error in createProduct:', error)

      // Check for network errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(
          'Network error: Unable to connect to server. Please check your internet connection and try again.'
        )
      }

      // Re-throw with more context
      throw error
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
   * @param size - DEPRECATED: Backend doesn't support size parameter, always returns 10 items per page
   * @returns Promise resolving to paginated products
   */
  async getAllProducts(page: number = 0, _size?: number): Promise<unknown> {
    // NOTE: Backend doesn't support size parameter - fixed at 10 items per page
    return this.request(`/api/v1/products/get-all-products?page=${page}`)
  }

  /**
   * Fetches ALL products by making multiple page requests
   * Backend limits to 10 products per page, so this fetches all pages
   * @param maxPages - Maximum number of pages to fetch (default: 20, max 200 products)
   * @returns Promise resolving to combined products from all pages with total count
   */
  async getAllProductsComplete(maxPages: number = 20): Promise<{
    content: unknown[]
    totalElements: number
    totalPages: number
  }> {
    const allProducts: unknown[] = []
    let totalElements = 0
    let totalPages = 0

    // Fetch first page to get total count
    const firstPageResponse = await this.getAllProducts(0)
    const firstPageData = firstPageResponse as {
      content?: unknown[]
      totalElements?: number
      totalPages?: number
      data?: { content?: unknown[]; totalElements?: number; totalPages?: number }
    }

    // Extract first page data
    const firstContent =
      firstPageData.content || (firstPageData.data as { content?: unknown[] })?.content || []

    totalElements =
      firstPageData.totalElements ||
      (firstPageData.data as { totalElements?: number })?.totalElements ||
      0

    totalPages =
      firstPageData.totalPages || (firstPageData.data as { totalPages?: number })?.totalPages || 0

    allProducts.push(...firstContent)

    // Fetch remaining pages if needed
    const pagesToFetch = Math.min(totalPages - 1, maxPages - 1)

    if (pagesToFetch > 0) {
      const pagePromises = []
      for (let page = 1; page <= pagesToFetch; page++) {
        pagePromises.push(this.getAllProducts(page))
      }

      const responses = await Promise.all(pagePromises)

      for (const response of responses) {
        const pageData = response as {
          content?: unknown[]
          data?: { content?: unknown[] }
        }
        const content =
          pageData.content || (pageData.data as { content?: unknown[] })?.content || []
        allProducts.push(...content)
      }
    }

    return {
      content: allProducts,
      totalElements,
      totalPages,
    }
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
   *
   * FALLBACK STRATEGY: If the displayItem endpoint returns 404, this method will
   * automatically fall back to fetching from the products list endpoint.
   * This works around backend data consistency issues where products exist in the
   * main products table but not in the displayItem view.
   */
  async getProductDetails(productId: number): Promise<unknown> {
    try {
      // Try the dedicated detail endpoint first (best case - includes reviews, ratings, etc.)
      return await this.request(`/api/v1/displayItem/itemDetails/${productId}`, {
        cache: 'no-store',
      })
    } catch (error) {
      // Check if this is a 404 error
      const apiError = error as Error & { statusCode?: number }

      if (apiError.statusCode === 404) {
        // Product not found in displayItem view - try fallback to products list
        console.warn(
          `[API Fallback] Product ${productId} not found in displayItem endpoint, trying products list...`
        )

        try {
          // Fetch from the working products endpoint (all pages)
          const allProductsResponse = await this.getAllProductsComplete(10)

          // Extract products array from complete response
          const products = allProductsResponse.content

          // Find the specific product
          const product = products.find((item) => {
            const prod = item as Record<string, unknown>
            return Number(prod.productId) === productId || Number(prod.id) === productId
          })

          if (!product) {
            // Product doesn't exist in either endpoint - throw original error
            console.warn(`[API Fallback] Product ${productId} not found in products list either`)
            throw error // Re-throw original 404 error
          }

          console.log(
            `✅ [API Fallback] Successfully retrieved product ${productId} from products list`
          )

          // Return the found product (may have less detail than displayItem endpoint)
          // Frontend transformation will handle converting this to the expected format
          return product
        } catch (fallbackError) {
          // Fallback also failed - throw original error
          console.error(
            `[API Fallback] Failed to retrieve product ${productId} from fallback:`,
            fallbackError
          )
          throw error // Re-throw original error
        }
      }

      // Not a 404 error - throw original error (auth error, network error, etc.)
      throw error
    }
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
    return this.getAllProductsComplete(20) // Fetch up to 20 pages (200 products)
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

    // Validate and log the product data
    const productJsonString = JSON.stringify(productData)
    const productJsonSize = new Blob([productJsonString]).size

    console.log('[ApiClient] Product JSON size:', productJsonSize, 'bytes')
    console.log('[ApiClient] Product data keys:', Object.keys(productData))

    // Check for potential issues with product data
    if (productJsonSize > 50 * 1024) {
      // 50KB limit for JSON
      console.error('[ApiClient] Product JSON is too large:', productJsonSize, 'bytes')
      throw new Error(
        `Product data too large: ${(productJsonSize / 1024).toFixed(1)}KB. Please reduce description length.`
      )
    }

    // Validate JSON string doesn't contain problematic characters
    if (productJsonString.includes('\0') || productJsonString.includes('\uFEFF')) {
      console.error('[ApiClient] Product JSON contains invalid characters')
      throw new Error('Product data contains invalid characters. Please check your input.')
    }

    console.log('[ApiClient] Adding product JSON to FormData...')
    formData.append('product', productJsonString)

    if (hasImages) {
      const totalImageSize = images.reduce((sum, img) => sum + img.size, 0)
      console.log(`[ApiClient] Appending ${images.length} images to FormData`)
      console.log(
        `[ApiClient] Total image size: ${totalImageSize} bytes (${(totalImageSize / 1024 / 1024).toFixed(2)}MB)`
      )

      // Validate each image before adding to FormData
      images.forEach((image, index) => {
        console.log(
          `[ApiClient] Image ${index}: ${image.name}, size: ${image.size} bytes, type: ${image.type}`
        )

        // Check for corrupted or invalid files
        if (!image.name || image.name.trim() === '') {
          throw new Error(`Image ${index} has no filename`)
        }

        if (image.size === 0) {
          throw new Error(`Image ${index} (${image.name}) is empty`)
        }

        if (!image.type.startsWith('image/')) {
          throw new Error(`File ${index} (${image.name}) is not a valid image`)
        }

        // Check for extremely long filenames that might cause issues
        if (image.name.length > 255) {
          console.warn(
            `[ApiClient] Image ${index} has very long filename: ${image.name.length} chars`
          )
        }

        // Clean filename to prevent multipart parsing issues
        const cleanFilename = image.name.replace(/[^\w\-_.]/g, '_')

        // Append with explicit filename to ensure proper multipart parsing
        formData.append('images', image, cleanFilename)
      })

      // Estimate total request size
      const estimatedTotalSize = productJsonSize + totalImageSize + images.length * 200 // +200 bytes overhead per image
      console.log(
        `[ApiClient] Estimated total request size: ${estimatedTotalSize} bytes (${(estimatedTotalSize / 1024 / 1024).toFixed(2)}MB)`
      )

      if (estimatedTotalSize > 100 * 1024 * 1024) {
        console.error(
          `[ApiClient] Request size (${(estimatedTotalSize / 1024 / 1024).toFixed(2)}MB) exceeds 100MB limit!`
        )
        throw new Error(
          `Request too large: ${(estimatedTotalSize / 1024 / 1024).toFixed(2)}MB exceeds server limit. Please reduce image sizes.`
        )
      }
    }

    // Build URL with query params for image removal
    let url = `/api/products/${id}`
    if (hasImageRemoval) {
      const params = new URLSearchParams()
      imageIdsToRemove.forEach((id) => params.append('imageIds', id.toString()))
      url += `?${params.toString()}`
    }

    // Use fetch directly for multipart (don't go through this.request which adds JSON headers)
    console.log(`[ApiClient] Sending multipart request to: ${url}`)
    console.log(`[ApiClient] Request headers:`, {
      Authorization: !!(this.headers as Record<string, string>).Authorization,
    })

    // Add timeout for large uploads
    const controller = new AbortController()
    const timeoutId = setTimeout(
      () => {
        console.error('[ApiClient] Request timeout after 5 minutes')
        controller.abort()
      },
      5 * 60 * 1000
    ) // 5 minutes timeout

    let response: Response
    try {
      response = await fetch(url, {
        method: 'PATCH',
        headers: {
          Authorization: (this.headers as Record<string, string>).Authorization || '',
          // Don't set Content-Type - let browser set it with boundary for multipart
        },
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      console.log(`[ApiClient] Response status: ${response.status}`)
      console.log(`[ApiClient] Response headers:`, Object.fromEntries(response.headers.entries()))
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (controller.signal.aborted) {
        throw new Error(
          'Upload timeout: Request took too long. Please try with fewer or smaller images.'
        )
      }

      console.error('[ApiClient] Fetch error:', fetchError)
      throw fetchError
    }

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
   * Gets click count for a product from dedicated tracking endpoint
   * @param productId - Product identifier
   * @returns Promise resolving to click count and userId
   *
   * NOTE: This endpoint returns actual click tracking data from product_clicks table
   * (unlike DisplayItemsDTO.clickCount which shows default value 1.0)
   */
  async getProductClickCount(productId: number): Promise<{ clicks: number; userId: number }> {
    try {
      const response = await this.request(`/api/v1/products/product-clickCount/${productId}`)
      const clickData = response as unknown as { clicks: number; userId: number }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] Click count for product ${productId}:`, clickData.clicks)
      }

      return clickData
    } catch (error) {
      // Gracefully handle ALL errors (404, auth, network, etc.) by returning 0 clicks
      // This ensures products still display even if click count endpoint fails
      const apiError = error as Error & { statusCode?: number; isAuthError?: boolean }

      // Only log non-404 errors in development (404 is expected for new products)
      if (process.env.NODE_ENV === 'development' && apiError.statusCode !== 404) {
        if (apiError.isAuthError) {
          console.warn(
            `[API] Auth error fetching click count for product ${productId}, returning 0`
          )
        } else {
          console.warn(
            `[API] Error fetching click count for product ${productId}:`,
            apiError.message,
            ', returning 0'
          )
        }
      }
      // 404 errors are silently ignored - they're expected for products without click data

      // Always return 0 clicks on any error - don't block product display
      return { clicks: 0, userId: 0 }
    }
  }

  // ============================================================================
  // USER ENDPOINTS
  // ============================================================================

  /**
   * Fetches current user details using the authorization token
   * @returns Promise resolving to user data
   */
  async getUserDetails(): Promise<{
    userId?: number
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

    // Debug: Log the full response to see if userId is present
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 getUserDetails API response:', response)
    }

    return response as unknown as {
      userId?: number
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
   * Fetches public seller profile by seller ID (user ID)
   * Returns public profile information excluding sensitive data like email/phone
   * @param sellerId - Seller's user ID
   * @returns Promise resolving to seller profile data
   */
  async getSellerProfile(sellerId: number): Promise<{
    userId: number
    firstName: string
    lastName: string
    position?: string
    aboutMe?: string
    organization?: string
    location?: string
    profileImageUrl?: string
    verificationStatus?: 'VERIFIED' | 'PENDING' | 'REJECTED'
  }> {
    // Try multiple possible endpoint variations
    const endpointsToTry = [
      `/api/v1/userManagement/user-details?userId=${sellerId}`,
      `/api/v1/userManagement/users/${sellerId}`,
      `/api/v1/userManagement/public-profile/${sellerId}`,
      `/api/v1/users/${sellerId}/profile`,
      `/api/v1/users/${sellerId}`,
    ]

    let lastError: Error | null = null

    for (const endpoint of endpointsToTry) {
      try {
        console.log(`🔍 Trying endpoint: ${endpoint}`)
        const response = await this.request(endpoint)
        console.log(`✅ Success with endpoint: ${endpoint}`, response)
        return response as unknown as {
          userId: number
          firstName: string
          lastName: string
          position?: string
          aboutMe?: string
          organization?: string
          location?: string
          profileImageUrl?: string
          verificationStatus?: 'VERIFIED' | 'PENDING' | 'REJECTED'
        }
      } catch (error) {
        console.log(`❌ Failed endpoint: ${endpoint}`)
        lastError = error as Error
        // Continue to next endpoint
      }
    }

    // If all endpoints fail, throw the last error
    console.warn('⚠️ All endpoints failed for fetching seller profile')
    throw lastError || new Error('Could not fetch seller profile from any endpoint')
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

  // ============================================================================
  // USER MANAGEMENT ENDPOINTS
  // ============================================================================

  /**
   * Updates user profile information
   * @param data - User profile data to update
   * @returns Promise resolving to update confirmation
   */
  async updateUserProfile(data: {
    firstName: string
    lastName: string
    organizationalEmail: string
  }): Promise<ApiResponse<unknown>> {
    const formData = new FormData()
    if (data.firstName) formData.append('firstName', data.firstName)
    if (data.lastName) formData.append('lastName', data.lastName)
    if (data.organizationalEmail) formData.append('organizationalEmail', data.organizationalEmail)

    return this.request('/api/v1/userManagement/editProfile', {
      method: 'PATCH',
      body: formData,
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
    return this.request('/api/v1/email/verifyOTP', {
      method: 'POST',
      body: JSON.stringify({
        organizationalEmail,
        otp,
        userRoles,
      }),
    })
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

  /** Initiates the mobile money checkout flow */
  async initiateMobileCheckout(
    payload: MobileCheckoutPayload
  ): Promise<ApiResponse<MobileCheckoutResponse>> {
    return this.request('/api/v1/checkout/zenoMobilePayCheckOut', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  /** Initiates the meet-seller checkout flow (Arrange with Seller) */
  async initiateMeetSellerCheckout(
    payload: MobileCheckoutPayload
  ): Promise<ApiResponse<MeetSellerCheckoutResponse>> {
    return this.request('/api/v1/checkout/meet-seller', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  // ============================================================================
  // CART ENDPOINTS - DEPRECATED (Client-Side Cart Only)
  // ============================================================================
  // All cart operations are now handled client-side via localStorage
  // Cart data is sent to backend only during checkout via POST /api/v1/orders
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

  /** Order management operations */
  orders: {
    list: () => apiClient.getOrders(),
    get: (id: string) => apiClient.getOrder(id),
    create: (data: Record<string, unknown>) => apiClient.createOrder(data),
    updateStatus: (id: string, status: string) => apiClient.updateOrderStatus(id, status),
  },

  /** Checkout flows */
  checkout: {
    mobilePay: (data: MobileCheckoutPayload) => apiClient.initiateMobileCheckout(data),
    meetSeller: (data: MobileCheckoutPayload) => apiClient.initiateMeetSellerCheckout(data),
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

export type { MobileCheckoutPayload, MobileCheckoutResponse, MeetSellerCheckoutResponse }

/** Default export for backward compatibility */
export default apiClient
