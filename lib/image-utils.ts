/**
 * Image Utilities for Backend Integration
 *
 * Centralized image URL handling for the Globoexpat platform.
 * Handles conversion of relative backend image paths to full URLs.
 */

/** Backend base URL for image serving */
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.123.22.21:8081'

/**
 * Converts backend image paths to full URLs
 * @param imageUrl - Relative or absolute image URL
 * @returns Full image URL or placeholder
 */
export const getFullImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '/assets/images/products/placeholder.svg'
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl // Already full URL

  // Ensure no double slashes
  const cleanUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
  return `${BACKEND_BASE_URL}${cleanUrl}`
}

/**
 * Cleans malformed UTF-8 encoded location strings from backend
 * Removes garbled character sequences that appear before actual location data
 * @param location - Raw location string from backend
 * @returns Cleaned location string
 */
export const cleanLocationString = (location: string): string => {
  if (!location) return ''

  // Pattern: Garbled UTF-8 characters are often followed by a semicolon before the real location
  // e.g., "Ã•Â•Ã'Â•Ã'ÂºÃ•Â°; Zanzibar, TZ" should become "Zanzibar, TZ"
  if (location.includes(';')) {
    const parts = location.split(';')
    // Take the last part (actual location) and trim whitespace
    const cleaned = parts[parts.length - 1].trim()
    if (cleaned) return cleaned
  }

  // Remove common garbled UTF-8 prefixes that don't have semicolon
  // These patterns indicate double-encoded UTF-8
  const garbledPatterns = [
    /^[Ã\u00C0-\u00FF][•\u0080-\u00FF]+[;:\s]/, // Matches sequences like "Ã•Â•" at start
    /^[\u00C0-\u00FF]{2,}/, // Multiple consecutive high-byte characters
  ]

  let cleaned = location
  for (const pattern of garbledPatterns) {
    cleaned = cleaned.replace(pattern, '')
  }

  return cleaned.trim()
}

/**
 * Transforms backend product data to frontend format with proper image URLs
 * @param item - Backend product item
 * @returns Transformed item with full image URLs
 */
export const transformBackendProduct = (item: Record<string, unknown>) => {
  // ...existing code...

  // Type assertions for nested properties
  const productImages = item.productImages as Array<{ imageUrl: string }> | undefined
  const listedBy = item.listedBy as { name?: string; verified?: boolean } | string | undefined
  const category = item.category as { categoryName?: string } | undefined
  const reviews = item.reviews

  const transformed = {
    id: (item.productId as number) || (item.id as number) || 0,
    title: String(item.productName || item.title || 'Unknown'),
    price:
      typeof item.productAskingPrice === 'number'
        ? `${item.productAskingPrice.toLocaleString()} ${item.productCurrency || 'TZS'}`
        : String(item.price || '0 TZS'),
    originalPrice:
      typeof item.productOriginalPrice === 'number'
        ? `${item.productOriginalPrice.toLocaleString()} ${item.productCurrency || 'TZS'}`
        : undefined,
    image: productImages?.[0]?.imageUrl
      ? getFullImageUrl(productImages[0].imageUrl)
      : '/assets/images/products/placeholder.svg',
    images: productImages?.map((img) => getFullImageUrl(img.imageUrl)) || [],
    listedBy: String(
      item.sellerName ||
        (typeof listedBy === 'object' ? listedBy?.name : listedBy) ||
        'Unknown Seller'
    ),
    rating: (item.rating as number) || 4.5,
    reviews:
      typeof reviews === 'number'
        ? reviews
        : Array.isArray(reviews)
          ? reviews.length
          : typeof reviews === 'object' && reviews !== null
            ? 1 // If it's a single review object, count as 1
            : Math.floor(Math.random() * 100) + 10, // Fallback for no reviews
    location: cleanLocationString(
      String(item.productLocation || item.location || 'Dar es Salaam, TZ')
    ),
    isVerified: Boolean(
      (typeof listedBy === 'object' ? listedBy?.verified : false) || item.isVerified || true
    ),
    isPremium: Boolean(item.isPremium || false),
    category: String(category?.categoryName || item.categoryName || ''),
    condition: String(item.productCondition || item.condition || 'used'),
  }

  return transformed
}

/**
 * Extracts content array from backend API response
 * @param response - Backend API response
 * @returns Content array or empty array
 */
export const extractContentFromResponse = (response: unknown): unknown[] => {
  if (!response || typeof response !== 'object') return []

  const responseData = response as {
    content?: unknown[]
    data?: { content?: unknown[] } | unknown[]
  }
  return (
    responseData.content ||
    (responseData.data as { content?: unknown[] })?.content ||
    (responseData.data as unknown[]) ||
    []
  )
}
