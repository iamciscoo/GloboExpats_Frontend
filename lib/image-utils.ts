/**
 * Image Utilities for Backend Integration
 *
 * Centralized image URL handling for the GlobalExpat platform.
 * Handles conversion of relative backend image paths to full URLs.
 */

/** Backend base URL for image serving */
const BACKEND_BASE_URL = 'http://10.123.22.21:8081/'

/**
 * Converts backend image paths to full URLs
 * @param imageUrl - Relative or absolute image URL
 * @returns Full image URL or placeholder
 */
export const getFullImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '/assets/images/products/placeholder.svg'
  if (imageUrl.startsWith('http')) return imageUrl // Already full URL
  return BACKEND_BASE_URL + imageUrl
}

/**
 * Transforms backend product data to frontend format with proper image URLs
 * @param item - Backend product item
 * @returns Transformed item with full image URLs
 */
export const transformBackendProduct = (item: any) => {
  console.log('🔄 [IMAGE-UTILS] Transforming item:', item)
  console.log('🖼️ [IMAGE-UTILS] Raw images:', item.productImages)

  const transformed = {
    id: item.productId || item.id,
    title: item.productName || item.title,
    price: item.productAskingPrice
      ? `${item.productAskingPrice.toLocaleString()} ${item.productCurrency || 'TZS'}`
      : item.price || '0 TZS',
    originalPrice: item.productOriginalPrice
      ? `${item.productOriginalPrice.toLocaleString()} ${item.productCurrency || 'TZS'}`
      : undefined,
    image: item.productImages?.[0]?.imageUrl
      ? getFullImageUrl(item.productImages[0].imageUrl)
      : '/assets/images/products/placeholder.svg',
    images: item.productImages?.map((img: any) => getFullImageUrl(img.imageUrl)) || [],
    listedBy: item.sellerName || item.listedBy?.name || item.listedBy || 'Unknown Seller',
    rating: item.rating || 4.5,
    reviews: item.reviews || Math.floor(Math.random() * 100) + 10,
    location: item.productLocation || item.location || 'Dar es Salaam, TZ',
    isVerified: item.listedBy?.verified || item.isVerified || true,
    isPremium: item.isPremium || false,
  }

  console.log('✅ [IMAGE-UTILS] Transformed result:', {
    id: transformed.id,
    title: transformed.title,
    image: transformed.image,
    images: transformed.images,
  })

  return transformed
}

/**
 * Extracts content array from backend API response
 * @param response - Backend API response
 * @returns Content array or empty array
 */
export const extractContentFromResponse = (response: any): any[] => {
  return response.content || response.data?.content || response.data || []
}
