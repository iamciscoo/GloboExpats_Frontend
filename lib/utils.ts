import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { STATUS_COLORS } from './constants'

/**
 * =============================================================================
 * CACHE MANAGEMENT
 * =============================================================================
 * Centralized memoization system for expensive operations
 */

// Memoization cache with size limits to prevent memory leaks
const CACHE_MAX_SIZE = 1000
const memoCache = new Map<string, unknown>()

/**
 * Adds item to cache with automatic cleanup when size limit is reached
 */
const setCacheItem = (key: string, value: unknown): void => {
  if (memoCache.size >= CACHE_MAX_SIZE) {
    // Remove oldest entries (FIFO)
    const firstKey = memoCache.keys().next().value
    if (firstKey) {
      memoCache.delete(firstKey)
    }
  }
  memoCache.set(key, value)
}

/**
 * =============================================================================
 * STYLING & UI UTILITIES
 * =============================================================================
 */

/**
 * Combines class names using clsx and tailwind-merge for optimal CSS
 * Handles conditional classes and removes conflicting Tailwind utilities
 *
 * @param inputs - Class values to combine
 * @returns Merged class string
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-blue-500', 'bg-gray-100')
 * // Returns: 'px-4 py-2 bg-blue-500' (conflicts resolved)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * =============================================================================
 * TEXT & STRING UTILITIES
 * =============================================================================
 */

/**
 * Extracts initials from a full name with validation and caching
 *
 * @param name - Full name string
 * @returns Initials (max 2 characters) or '?' if invalid
 *
 * @example
 * getInitials('John Doe') // 'JD'
 * getInitials('Sarah') // 'S'
 * getInitials('') // '?'
 */
export function getInitials(name: string): string {
  if (!name || typeof name !== 'string') {
    return '?'
  }

  const cacheKey = `initials-${name}`
  if (memoCache.has(cacheKey)) {
    return memoCache.get(cacheKey) as string
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2) // Only take first two words for initials
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()

  const result = initials || '?'
  setCacheItem(cacheKey, result)
  return result
}

/**
 * Enhanced text truncation with word boundary awareness
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length including suffix
 * @param options - Truncation options
 * @returns Truncated text with suffix
 *
 * @example
 * truncateText('Hello world example', 10) // 'Hello...'
 * truncateText('Hello world', 10, { suffix: '…' }) // 'Hello…'
 */
export function truncateText(
  text: string,
  maxLength: number,
  options?: {
    wordBoundary?: boolean
    suffix?: string
  }
): string {
  if (!text || typeof text !== 'string' || text.length <= maxLength) {
    return text || ''
  }

  const { wordBoundary = true, suffix = '...' } = options || {}
  const targetLength = maxLength - suffix.length

  let truncated = text.substring(0, targetLength)

  // Respect word boundaries for better readability
  if (wordBoundary) {
    const lastSpaceIndex = truncated.lastIndexOf(' ')
    if (lastSpaceIndex > targetLength * 0.5) {
      // Only break at word if reasonable
      truncated = truncated.substring(0, lastSpaceIndex)
    }
  }

  return truncated.trim() + suffix
}

/**
 * Enhanced slug generation with comprehensive sanitization
 *
 * @param text - Text to convert to slug
 * @returns URL-safe slug
 *
 * @example
 * generateSlug('Hello World!') // 'hello-world'
 * generateSlug('Café & Bar') // 'cafe-bar'
 */
export function generateSlug(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  const cacheKey = `slug-${text}`
  if (memoCache.has(cacheKey)) {
    return memoCache.get(cacheKey) as string
  }

  const result = text
    .toLowerCase()
    .trim()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (é → e)
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens

  setCacheItem(cacheKey, result)
  return result
}

/**
 * =============================================================================
 * VALIDATION UTILITIES
 * =============================================================================
 */

/**
 * Enhanced email validation with comprehensive regex
 * Follows RFC 5322 specification for email validation
 *
 * @param email - Email address to validate
 * @returns True if email is valid
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  // Comprehensive email regex following RFC 5322
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  return emailRegex.test(email.trim())
}

/**
 * Enhanced phone validation with international support
 * Supports various international phone number formats
 *
 * @param phone - Phone number to validate
 * @returns True if phone number is valid
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false
  }

  // Remove all whitespace for validation
  const cleanPhone = phone.replace(/\s/g, '')

  // Flexible regex supporting international formats (+, (), -, spaces)
  const phoneRegex = /^[+]?[(]?[\d\s\-()]{7,}$/

  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 7 && cleanPhone.length <= 20
}

/**
 * =============================================================================
 * FORMATTING UTILITIES
 * =============================================================================
 */

/**
 * Formats price with proper currency handling and localization
 *
 * @param price - Price as string or number
 * @param currency - Currency code (default: TZS)
 * @param options - Formatting options
 * @returns Formatted price string
 *
 * @example
 * formatPrice(1234.56, 'USD') // '1,234.56 USD'
 * formatPrice('1234', 'TZS', { locale: 'sw-TZ' }) // '1,234 TZS'
 */
export function formatPrice(
  price: string | number,
  currency = 'TZS',
  options?: {
    locale?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  }
): string {
  if (price === null || price === undefined) {
    return `0 ${currency}`
  }

  const numericPrice = typeof price === 'string' ? parseFloat(price) : price

  if (isNaN(numericPrice)) {
    return `0 ${currency}`
  }

  const cacheKey = `price-${numericPrice}-${currency}-${JSON.stringify(options)}`
  if (memoCache.has(cacheKey)) {
    return memoCache.get(cacheKey) as string
  }

  try {
    const formatter = new Intl.NumberFormat(options?.locale || 'en-US', {
      minimumFractionDigits: options?.minimumFractionDigits ?? 0,
      maximumFractionDigits: options?.maximumFractionDigits ?? 2,
    })

    const result = `${formatter.format(numericPrice)} ${currency}`
    setCacheItem(cacheKey, result)
    return result
  } catch {
    // Fallback for unsupported locales
    const result = `${numericPrice.toLocaleString()} ${currency}`
    setCacheItem(cacheKey, result)
    return result
  }
}

/**
 * Formats date with validation and locale support
 *
 * @param dateString - Date string or Date object
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string | Date,
  options?: {
    locale?: string
    dateStyle?: 'full' | 'long' | 'medium' | 'short'
    timeStyle?: 'full' | 'long' | 'medium' | 'short'
  }
): string {
  if (!dateString) {
    return 'Invalid date'
  }

  const cacheKey = `date-${dateString}-${JSON.stringify(options)}`
  if (memoCache.has(cacheKey)) {
    return memoCache.get(cacheKey) as string
  }

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString

    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }

    const formatter = new Intl.DateTimeFormat(options?.locale || 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    })

    const result = formatter.format(date)
    setCacheItem(cacheKey, result)
    return result
  } catch {
    return 'Invalid date'
  }
}

/**
 * Enhanced time ago formatting with precise intervals
 *
 * @param dateString - Date string or Date object
 * @returns Human-readable time difference
 *
 * @example
 * formatTimeAgo(new Date(Date.now() - 60000)) // '1m ago'
 * formatTimeAgo('2024-01-01') // '3mo ago'
 */
export function formatTimeAgo(dateString: string | Date): string {
  if (!dateString) {
    return 'Unknown'
  }

  const cacheKey = `timeago-${dateString}`
  if (memoCache.has(cacheKey)) {
    return memoCache.get(cacheKey) as string
  }

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    const now = new Date()

    if (isNaN(date.getTime())) {
      return 'Unknown'
    }

    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    // Handle future dates
    if (diffInSeconds < 0) return 'In the future'

    // Time intervals with appropriate units
    if (diffInSeconds < 30) return 'Just now'
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`

    const result = `${Math.floor(diffInSeconds / 31536000)}y ago`
    setCacheItem(cacheKey, result)
    return result
  } catch {
    return 'Unknown'
  }
}

/**
 * Format file size in human-readable format
 *
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 *
 * @example
 * formatFileSize(1024) // '1 KB'
 * formatFileSize(1048576) // '1 MB'
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * =============================================================================
 * BUSINESS LOGIC UTILITIES
 * =============================================================================
 */

/**
 * Gets status color configuration with fallback
 *
 * @param status - Status string
 * @returns CSS color classes for the status
 */
export function getStatusColor(status: string): string {
  if (!status || typeof status !== 'string') {
    return STATUS_COLORS.draft
  }

  const statusKey = status.toLowerCase() as keyof typeof STATUS_COLORS
  return STATUS_COLORS[statusKey] || STATUS_COLORS.draft
}

/**
 * Calculates engagement rate with validation
 *
 * @param views - Total views count
 * @param interactions - Total interactions count
 * @returns Engagement rate as percentage (0-100)
 */
export function calculateEngagementRate(views: number, interactions: number): number {
  if (!Number.isFinite(views) || !Number.isFinite(interactions) || views <= 0) {
    return 0
  }

  return Math.round((interactions / views) * 100)
}

/**
 * =============================================================================
 * PERFORMANCE UTILITIES
 * =============================================================================
 */

/**
 * Enhanced debounce with proper TypeScript generics
 * Delays function execution until after delay period of inactivity
 *
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | undefined

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Enhanced throttle function
 * Ensures function is called at most once per delay period
 *
 * @param func - Function to throttle
 * @param delay - Minimum delay between calls in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: never[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

/**
 * =============================================================================
 * DATA MANIPULATION UTILITIES
 * =============================================================================
 */

/**
 * Enhanced product filtering with type safety and comprehensive search
 *
 * @param products - Array of products to filter
 * @param searchQuery - Search query string
 * @param filters - Additional filter criteria
 * @returns Filtered products array
 */
export function filterProducts<T extends Record<string, unknown>>(
  products: T[],
  searchQuery: string,
  filters?: {
    category?: string
    status?: string
    [key: string]: unknown
  }
): T[] {
  if (!Array.isArray(products)) {
    return []
  }

  const query = searchQuery.toLowerCase().trim()

  return products.filter((product) => {
    // Search in multiple searchable fields
    const searchableFields = [
      product.title,
      product.description,
      product.category,
      product.location,
    ].filter(Boolean)

    const matchesSearch =
      !query || searchableFields.some((field) => String(field).toLowerCase().includes(query))

    // Apply additional filters
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value && value !== 'all') {
          const productValue = product[key]
          if (typeof productValue === 'string' && typeof value === 'string') {
            if (productValue.toLowerCase() !== value.toLowerCase()) {
              return false
            }
          } else if (productValue !== value) {
            return false
          }
        }
      }
    }

    return matchesSearch
  })
}

/**
 * Safe JSON parse with error handling and fallback
 *
 * @param jsonString - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T = unknown>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString)
  } catch {
    return fallback
  }
}

/**
 * Deep clone utility for complex objects
 * Handles dates, arrays, and nested objects properly
 *
 * @param obj - Object to clone
 * @returns Deep cloned object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as T
  }

  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  return obj
}

/**
 * =============================================================================
 * CACHE MANAGEMENT UTILITIES
 * =============================================================================
 */

/**
 * Utility to clear memoization cache
 * Useful for memory management and testing
 */
export function clearMemoCache(): void {
  memoCache.clear()
}

/**
 * Get cache size for debugging and monitoring
 *
 * @returns Current cache size
 */
export function getMemoSacheSize(): number {
  return memoCache.size
}

/**
 * Get cache statistics for performance monitoring
 *
 * @returns Cache statistics object
 */
export function getCacheStats() {
  return {
    size: memoCache.size,
    maxSize: CACHE_MAX_SIZE,
    utilizationPercentage: Math.round((memoCache.size / CACHE_MAX_SIZE) * 100),
  }
}
