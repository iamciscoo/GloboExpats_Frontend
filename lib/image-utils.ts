/**
 * Image Utilities for Backend Integration
 *
 * Centralized image URL handling for the Globoexpats platform.
 * Handles conversion of relative backend image paths to full URLs.
 */

/** Backend base URL for image serving (empty for same-origin requests via Next.js proxy) */
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

/**
 * Converts backend image paths to full URLs
 * @param imageUrl - Relative or absolute image URL
 * @returns Full image URL or placeholder (properly URL encoded)
 */
export const getFullImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '/assets/images/products/placeholder.svg'
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // Already full URL - encode the path part only
    try {
      const url = new URL(imageUrl)
      // Encode the pathname to handle special characters like brackets
      url.pathname = url.pathname
        .split('/')
        .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
        .join('/')
      return url.toString()
    } catch {
      return imageUrl
    }
  }

  // Ensure no double slashes
  const cleanUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
  // Encode the path to handle special characters (brackets, spaces, etc.)
  const encodedPath = cleanUrl
    .split('/')
    .map((segment) => (segment ? encodeURIComponent(segment) : segment))
    .join('/')

  return `${BACKEND_BASE_URL}${encodedPath}`
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
 * @returns Transformed item with full image URLs and seller information
 *
 * IMPORTANT: Backend provides sellerId (user ID) and sellerName separately
 * - sellerId: Unique user ID from database (number)
 * - sellerName: User's display name (string)
 */
export const transformBackendProduct = (rawItem: Record<string, unknown>) => {
  // Handle nested product objects (e.g. from saved products API)
  const item = rawItem.product ? (rawItem.product as Record<string, unknown>) : rawItem

  // Type assertions for nested properties
  const productImages = item.productImages as Array<{ imageUrl: string }> | undefined
  const listedBy = item.listedBy as { name?: string; verified?: boolean } | string | undefined
  const category = item.category as { categoryName?: string } | undefined
  const reviews = item.reviews

  // Log seller information for debugging (verify sellerId is present)
  if (item.sellerId) {
    console.log(
      `👤 Product ${item.productId}: Seller ID=${item.sellerId}, Name="${item.sellerName}"`
    )
  }

  // Ultra-aggressive ID extraction
  const getAnyId = (obj: any): number => {
    if (obj === undefined || obj === null) return 0
    if (typeof obj === 'number') return obj
    if (typeof obj === 'string' && !isNaN(Number(obj))) return Number(obj)
    if (typeof obj !== 'object') return 0

    const keys = [
      'productId',
      'productID',
      'id',
      'product_id',
      'item_id',
      'ID',
      'uid',
      'pk',
      'idProduct',
    ]
    for (const key of keys) {
      const val = obj[key]
      if (
        val !== undefined &&
        val !== null &&
        val !== '' &&
        !isNaN(Number(val)) &&
        Number(val) !== 0
      ) {
        return Number(val)
      }
    }
    return 0
  }

  const rawId = ((): number => {
    // 1. Try common nested structures
    const innerProduct = rawItem.product || rawItem.item || rawItem.data
    const nestedId = getAnyId(innerProduct)
    if (nestedId) return nestedId

    // 2. Try top level
    const topId = getAnyId(rawItem)
    if (topId) return topId

    return 0
  })()

  if (rawId === 0 && process.env.NODE_ENV === 'development') {
    console.warn('[transformBackendProduct] ⚠️ NO ID FOUND. Keys:', Object.keys(rawItem), rawItem)
  }

  const transformed = {
    id: rawId,
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
    // images array should NOT include the first image (which is already in 'image')
    // to prevent duplication when displaying thumbnails
    images: productImages?.slice(1).map((img) => getFullImageUrl(img.imageUrl)) || [],
    description: String(item.productDescription || item.description || ''),
    // Preserve both seller ID and name from backend (Backend assigns from JWT)
    sellerId: (item.sellerId as number) || undefined,
    sellerName: String(
      item.sellerName ||
      (typeof listedBy === 'object' ? listedBy?.name : listedBy) ||
      'Unknown Seller'
    ),
    // listedBy for backward compatibility
    listedBy: String(
      item.sellerName ||
      (typeof listedBy === 'object' ? listedBy?.name : listedBy) ||
      'Unknown Seller'
    ),
    rating: (item.rating as number) || 0, // Default to 0 if no rating
    reviews:
      typeof reviews === 'number'
        ? reviews
        : Array.isArray(reviews)
          ? reviews.length
          : typeof reviews === 'object' && reviews !== null
            ? 1 // If it's a single review object, count as 1
            : 0, // Show 0 reviews if none exist (no fake data)
    location: cleanLocationString(
      String(
        item.productLocation ||
        item.location ||
        (item.productRegion && item.productCountry
          ? `${item.productRegion}, ${item.productCountry}`
          : 'Dar es Salaam, TZ')
      )
    ),
    city: String(item.productRegion || item.city || '').trim(),
    country: String(item.productCountry || item.country || '').trim(),
    street: String(item.productStreet || item.street || '').trim(),
    whatsapp: String(item.productWhatsappNumber || item.whatsappNumber || '').trim(),
    isVerified: Boolean(
      (typeof listedBy === 'object' ? listedBy?.verified : false) || item.isVerified || true
    ),
    category: String(category?.categoryName || item.categoryName || ''),
    condition: String(item.productCondition || item.condition || 'used'),
    // Preserve view count (clickCount from backend) if available
    views: (item.clickCount as number) || 0,
    // Default to 1 if missing or 0 to ensure legacy products are visible
    quantity: typeof item.productQuantity === 'number' ? item.productQuantity : 1,
    createdAt: (item.createdAt || item.datePosted) as string | undefined,
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

/**
 * Extracts both content array and total count from backend paginated API response
 * @param response - Backend API response with pagination metadata
 * @returns Object containing content array and total elements count
 */
export const extractPaginatedResponse = (
  response: unknown
): { content: unknown[]; totalElements: number } => {
  if (!response || typeof response !== 'object') {
    return { content: [], totalElements: 0 }
  }

  const responseData = response as {
    content?: unknown[]
    totalElements?: number
    data?: { content?: unknown[]; totalElements?: number } | { content?: unknown[] } | unknown[]
  }

  // Extract content array
  const content =
    responseData.content ||
    (responseData.data as { content?: unknown[] })?.content ||
    (responseData.data as unknown[]) ||
    []

  // Extract total elements count
  const totalElements =
    responseData.totalElements ||
    (responseData.data as { totalElements?: number })?.totalElements ||
    (Array.isArray(content) ? content.length : 0)

  return { content, totalElements }
}
