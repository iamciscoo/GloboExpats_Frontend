/**
 * Cart Utility Functions
 * 
 * Helper functions for cart operations and data transformations
 */

import type { CartItem } from '@/providers/cart-provider'
import type { BackendCartItem, BackendCartResponse } from '@/lib/types'

/**
 * Convert a product to cart item format
 * @param product - Product data from API or component
 * @param quantity - Initial quantity (default: 1)
 * @returns CartItem formatted for the cart provider
 */
export function productToCartItem(
  product: {
    id: number | string
    title: string
    price: number
    image?: string
    category?: string
    location?: string
    currency?: string
    expatId?: string
    expatName?: string
    verified?: boolean
    condition?: string
  },
  quantity: number = 1
): Omit<CartItem, 'quantity'> {
  return {
    id: product.id.toString(),
    title: product.title,
    price: product.price,
    originalPrice: product.price,
    image: product.image || '/placeholder.svg',
    condition: (product.condition as any) || 'used',
    expatId: product.expatId || 'unknown',
    expatName: product.expatName || 'Unknown Seller',
    category: product.category || 'general',
    location: product.location || 'Unknown',
    verified: product.verified || false,
    currency: product.currency || 'TZS',
    isAvailable: true,
    selected: false,
  }
}

/**
 * Convert backend cart response to frontend cart items
 * @param backendCart - Cart response from backend API
 * @returns Array of CartItem objects
 */
export function backendCartToFrontendItems(backendCart: BackendCartResponse): CartItem[] {
  return backendCart.items.map((backendItem: BackendCartItem) => ({
    id: backendItem.productId.toString(),
    title: backendItem.productName,
    price: backendItem.price,
    originalPrice: backendItem.price,
    image: '/placeholder.svg', // Will need product API integration for images
    condition: 'used', // Default condition
    expatId: 'unknown', // Will need product API integration
    expatName: 'Unknown Seller', // Will need product API integration
    quantity: backendItem.quantity,
    category: 'general', // Default category
    location: 'Unknown', // Will need product API integration
    verified: false, // Default verification
    currency: backendItem.currency,
    isAvailable: true,
    selected: false,
  }))
}

/**
 * Format currency amount with proper localization
 * @param amount - Numerical amount
 * @param currency - Currency code (e.g., 'TZS', 'USD')
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'TZS',
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch (error) {
    // Fallback for unsupported currencies
    return `${new Intl.NumberFormat(locale).format(amount)} ${currency}`
  }
}

/**
 * Calculate cart totals and summary
 * @param items - Array of cart items
 * @returns Cart summary with totals and counts
 */
export function calculateCartSummary(items: CartItem[]) {
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0)
  const originalTotal = items.reduce((total, item) => total + ((item.originalPrice || item.price) * item.quantity), 0)
  const savings = originalTotal - subtotal
  const currencies = [...new Set(items.map(item => item.currency || 'TZS'))]
  const hasMixedCurrencies = currencies.length > 1
  
  return {
    itemCount,
    subtotal,
    originalTotal,
    savings,
    currencies,
    hasMixedCurrencies,
    isEmpty: items.length === 0,
    primaryCurrency: currencies[0] || 'TZS'
  }
}

/**
 * Validate cart item data
 * @param item - Cart item to validate
 * @returns True if valid, false otherwise
 */
export function validateCartItem(item: any): item is CartItem {
  return (
    item &&
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.price === 'number' &&
    typeof item.quantity === 'number' &&
    item.quantity > 0
  )
}

/**
 * Group cart items by expat/seller
 * @param items - Array of cart items
 * @returns Object with expatId as key and items array as value
 */
export function groupCartItemsByExpat(items: CartItem[]): Record<string, CartItem[]> {
  return items.reduce((groups, item) => {
    const expatId = item.expatId
    if (!groups[expatId]) {
      groups[expatId] = []
    }
    groups[expatId].push(item)
    return groups
  }, {} as Record<string, CartItem[]>)
}

/**
 * Get cart storage key for specific user
 * @param userId - User identifier
 * @returns Storage key string
 */
export function getCartStorageKey(userId?: string): string {
  return userId ? `expatCartItems_${userId}` : 'expatCartItems'
}