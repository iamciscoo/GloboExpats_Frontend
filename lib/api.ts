/**
 * API Client for GlobalExpat Platform
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

// ============================================================================
// CONFIGURATION & TYPES
// ============================================================================

/** Base API URL from environment or fallback */
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(
  /\/$/,
  ''
)

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
    const { Authorization, ...headersWithoutAuth } = this.headers as any
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
    const url = `${this.baseURL}${endpoint}`

    try {
      const response = await fetch(url, {
        headers: this.headers,
        ...options,
      })

      if (!response.ok) {
        // If unauthorized, attempt a one-time silent token rehydration + retry
        if (response.status === 401 && _retry && typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('expat_auth_token')
            const currentAuth = (this.headers as any).Authorization
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
          } else if (response.status === 500) {
            errorMessage = 'Server error. Please try again later.'
          }
        } catch (jsonError) {
          // If response body is not JSON, use the status code message
          console.warn('Could not parse error response:', jsonError)
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
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
  async getProducts(params?: ProductListParams): Promise<ApiResponse<any>> {
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
    return this.request(`/products${queryString}`)
  }

  /**
   * Fetches a single product by ID
   * @param id - Product identifier
   * @returns Promise resolving to product data
   */
  async getProduct(id: string): Promise<ApiResponse<any>> {
    return this.request(`/products/${id}`)
  }

  /**
   * Creates a new product listing with images
   * @param productData - Product information object
   * @param images - Array of image files
   * @returns Promise resolving to created product with productId and imageIds
   *
   * Backend expects multipart/form-data with:
   * - product: JSON string with product details
   * - images: One or more image files
   */
  async createProduct(
    productData: {
      productName: string
      categoryId: number
      condition: string
      location: string
      productDescription: string
      currency: string
      askingPrice: number
      originalPrice: number
      productWarranty: string
    },
    images: File[]
  ): Promise<{ productId: number; imageIds: number[] }> {
    const formData = new FormData()

    // Add product data as JSON string
    formData.append('product', JSON.stringify(productData))

    // Add images
    images.forEach((image) => {
      formData.append('images', image)
    })

    const response = await fetch(`${this.baseURL}/products/post-product`, {
      method: 'POST',
      headers: {
        Authorization: (this.headers as any)['Authorization'] || '',
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Fetches all available product categories
   * @returns Promise resolving to categories list
   */
  async getCategories(): Promise<Array<{ categoryId: number; categoryName: string }>> {
    const response = await this.request('/products/categories')
    return (response as any).data || response
  }

  /**
   * Fetches all products with pagination
   * @param page - Page number (0-indexed)
   * @returns Promise resolving to paginated products
   */
  async getAllProducts(page: number = 0): Promise<any> {
    return this.request(`/products/get-all-products?page=${page}`)
  }

  /**
   * Fetches top picks (featured products)
   * @param page - Page number (0-indexed)
   * @param size - Number of items per page
   * @returns Promise resolving to paginated top picks
   */
  async getTopPicks(page: number = 0, size: number = 12): Promise<any> {
    return this.request(`/displayItem/top-picks?page=${page}&size=${size}`)
  }

  /**
   * Fetches newest listings
   * @param page - Page number (0-indexed)
   * @param size - Number of items per page
   * @returns Promise resolving to paginated newest listings
   */
  async getNewestListings(page: number = 0, size: number = 12): Promise<any> {
    return this.request(`/displayItem/newest?page=${page}&size=${size}`)
  }

  /**
   * Fetches detailed product information by ID
   * @param productId - Product identifier
   * @returns Promise resolving to detailed product data
   */
  async getProductDetails(productId: number): Promise<any> {
    return this.request(`/displayItem/itemDetails/${productId}`)
  }

  /**
   * Updates an existing product
   * @param id - Product identifier
   * @param productData - Updated product information
   * @returns Promise resolving to updated product
   */
  async updateProduct(id: string, productData: any): Promise<ApiResponse<any>> {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    })
  }

  /**
   * Deletes a product listing
   * @param id - Product identifier
   * @returns Promise resolving to deletion confirmation
   */
  async deleteProduct(id: string): Promise<ApiResponse<any>> {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    })
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
    verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED'
    passportVerificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED'
    addressVerificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED'
    roles: Array<{
      roleId: number
      roleName: string
    }>
  }> {
    const response = await this.request('/userManagement/user-details')
    return response as any
  }

  /**
   * Fetches user profile information
   * @param id - User identifier
   * @returns Promise resolving to user data
   */
  async getUser(id: string): Promise<ApiResponse<any>> {
    return this.request(`/users/${id}`)
  }

  /**
   * Updates user profile information
   * @param id - User identifier
   * @param data - Updated user data
   * @returns Promise resolving to updated user
   */
  async updateUser(id: string, data: Partial<any>): Promise<ApiResponse<any>> {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
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
  async login(email: string, password: string): Promise<ApiResponse<any>> {
    // Backend expects { email, password, username? }, map email accordingly
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  /**
   * Registers a new user account
   * @param userData - User registration data
   * @returns Promise resolving to registration result
   */
  async register(userData: any): Promise<ApiResponse<any>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  /**
   * Sends organization email OTP to user email (requires Authorization header)
   * @param organizationalEmail - Organization email to send OTP to
   */
  async sendEmailOtp(organizationalEmail: string): Promise<ApiResponse<any>> {
    const qs = `?organizationalEmail=${encodeURIComponent(organizationalEmail)}`
    return this.request(`/email/sendOTP${qs}`, { method: 'POST' })
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
  ): Promise<ApiResponse<any>> {
    const qs = `?organizationalEmail=${encodeURIComponent(
      organizationalEmail
    )}&otp=${encodeURIComponent(otp)}&userRoles=${encodeURIComponent(userRoles)}`
    return this.request(`/email/verifyOTP${qs}`, { method: 'POST' })
  }

  /**
   * Initiates password reset process
   * @param email - User email address
   * @returns Promise resolving to reset confirmation
   */
  async resetPassword(email: string): Promise<ApiResponse<any>> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  /**
   * Logs out the current user
   * @returns Promise resolving to logout confirmation
   */
  async logout(): Promise<ApiResponse<any>> {
    return this.request('/auth/logout', {
      method: 'POST',
    })
  }

  /**
   * Exchanges Google OAuth auth code for JWT token
   * @param authCode - Google OAuth authorization code
   * @returns Promise resolving to authentication data
   */
  async exchangeOAuthCode(authCode: string): Promise<ApiResponse<any>> {
    return this.request(`/oauth2/exchange?auth_code=${encodeURIComponent(authCode)}`, {
      method: 'POST',
    })
  }

  // ============================================================================
  // MESSAGING ENDPOINTS
  // ============================================================================

  /**
   * Fetches user's conversation list
   * @returns Promise resolving to conversations
   */
  async getConversations(): Promise<ApiResponse<any>> {
    return this.request('/messages/conversations')
  }

  /**
   * Fetches messages for a specific conversation
   * @param conversationId - Conversation identifier
   * @returns Promise resolving to messages
   */
  async getMessages(conversationId: string): Promise<ApiResponse<any>> {
    return this.request(`/messages/conversations/${conversationId}`)
  }

  /**
   * Sends a message in a conversation
   * @param conversationId - Conversation identifier
   * @param message - Message content
   * @returns Promise resolving to sent message
   */
  async sendMessage(conversationId: string, message: string): Promise<ApiResponse<any>> {
    return this.request(`/messages/conversations/${conversationId}`, {
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
  async createConversation(recipientId: string, initialMessage: string): Promise<ApiResponse<any>> {
    return this.request('/messages/conversations', {
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
  async getOrders(): Promise<ApiResponse<any>> {
    return this.request('/orders')
  }

  /**
   * Creates a new order
   * @param orderData - Order information
   * @returns Promise resolving to created order
   */
  async createOrder(orderData: any): Promise<ApiResponse<any>> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  }

  /**
   * Fetches details for a specific order
   * @param orderId - Order identifier
   * @returns Promise resolving to order details
   */
  async getOrder(orderId: string): Promise<ApiResponse<any>> {
    return this.request(`/orders/${orderId}`)
  }

  /**
   * Updates order status
   * @param orderId - Order identifier
   * @param status - New order status
   * @returns Promise resolving to updated order
   */
  async updateOrderStatus(orderId: string, status: string): Promise<ApiResponse<any>> {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  // ============================================================================
  // CART ENDPOINTS
  // ============================================================================

  /**
   * Adds an item to the user's cart
   * @param productId - Product identifier
   * @param quantity - Quantity to add (default: 1)
   * @returns Promise resolving to cart add result
   */
  async addToCart(productId: number, quantity: number = 1): Promise<ApiResponse<any>> {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    })
  }

  /**
   * Fetches the user's cart contents
   * @returns Promise resolving to cart data with items, totals, etc.
   */
  async getUserCart(): Promise<ApiResponse<any>> {
    return this.request('/cart/User')
  }

  /**
   * Updates an existing cart item
   * @param cartId - Cart item identifier
   * @param productId - Product identifier
   * @param quantity - New quantity
   * @returns Promise resolving to updated cart item
   */
  async updateCartItem(cartId: number, productId: number, quantity: number): Promise<ApiResponse<any>> {
    return this.request(`/cart/item/${cartId}`, {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    })
  }

  /**
   * Removes an item from the cart
   * @param itemId - Cart item identifier or product identifier
   * @returns Promise resolving to removal confirmation
   */
  async removeFromCart(itemId: number): Promise<ApiResponse<any>> {
    return this.request(`/cart/item/${itemId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Clears all items from the user's cart
   * @returns Promise resolving to clear confirmation
   */
  async clearCart(): Promise<ApiResponse<any>> {
    return this.request('/cart/clear', {
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
    create: (data: any, images: File[]) => apiClient.createProduct(data, images),
    update: (id: string, data: any) => apiClient.updateProduct(id, data),
    delete: (id: string) => apiClient.deleteProduct(id),
  },

  /** User management operations */
  users: {
    get: (id: string) => apiClient.getUser(id),
    update: (id: string, data: any) => apiClient.updateUser(id, data),
  },

  /** Authentication operations */
  auth: {
    login: (email: string, password: string) => apiClient.login(email, password),
    register: (userData: any) => apiClient.register(userData),
    resetPassword: (email: string) => apiClient.resetPassword(email),
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
    create: (data: any) => apiClient.createOrder(data),
    updateStatus: (id: string, status: string) => apiClient.updateOrderStatus(id, status),
  },

  /** Cart management operations */
  cart: {
    add: (productId: number, quantity?: number) => apiClient.addToCart(productId, quantity),
    get: () => apiClient.getUserCart(),
    update: (cartId: number, productId: number, quantity: number) => apiClient.updateCartItem(cartId, productId, quantity),
    remove: (itemId: number) => apiClient.removeFromCart(itemId),
    clear: () => apiClient.clearCart(),
  },
}

/** Default export for backward compatibility */
export default apiClient
