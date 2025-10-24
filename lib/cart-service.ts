/**
 * =============================================================================
 * CART SERVICE - Backend Integration for Cart Management
 * =============================================================================
 *
 * Handles cart operations with the backend API while maintaining compatibility
 * with the existing cart hook interface. Provides seamless migration from
 * localStorage to backend cart management.
 *
 * Backend Endpoints:
 * - POST /api/v1/cart/add - Add item to cart
 * - GET /api/v1/cart/User - Get user's cart
 * - PUT /api/v1/cart/item/{id} - Update cart item
 * - DELETE /api/v1/cart/item/{id} - Remove cart item
 * - DELETE /api/v1/cart/clear - Clear all cart items
 *
 * Usage:
 * ```tsx
 * import { cartService } from '@/lib/cart-service'
 *
 * // Add item to cart
 * await cartService.addToCart(productId, quantity)
 *
 * // Get cart data
 * const cart = await cartService.getCart()
 * ```
 */

import { apiClient } from './api'
import { logger } from './logger'

/**
 * Cart item interface matching backend response
 */
export interface BackendCartItem {
  cartId: number
  productId: number
  quantity: number
  productName: string
  price: number
  currency: string
  subtotal: number
}

/**
 * Cart data interface matching backend response
 */
export interface BackendCartData {
  items: BackendCartItem[]
  totalItems: number
  totalPrice: number
  currency: string
}

/**
 * Frontend cart item interface (for compatibility with existing hooks)
 */
export interface FrontendCartItem {
  productId: number
  name: string
  price: number
  quantity: number
  image: string
  seller: string
  condition: string
  cartId?: number
  currency?: string
  subtotal?: number
}

/**
 * Cart service class providing backend integration
 */
class CartService {
  /**
   * Adds an item to the user's cart
   * @param productId - Product identifier
   * @param quantity - Number of items to add
   * @returns Promise resolving to success status
   */
  async addToCart(productId: number, quantity: number): Promise<boolean> {
    try {
      logger.debug('[CART] Adding item to cart', { productId, quantity })

      const response = await apiClient.addToCart(productId, quantity)
      const success = response?.success !== false // Assume success unless explicitly false

      logger.debug('[CART] Add to cart response', { success, response })
      return success
    } catch (error) {
      logger.error('[CART] Failed to add item to cart', error)
      throw new Error('Failed to add item to cart. Please try again.')
    }
  }

  /**
   * Fetches the user's cart from backend
   * @returns Promise resolving to cart data
   */
  async getCart(): Promise<BackendCartData> {
    try {
      logger.debug('[CART] Fetching user cart')

      const response = await apiClient.getUserCart()

      // ApiResponse wraps the data in a 'data' property
      const cartData: BackendCartData = response.data

      logger.debug('[CART] Cart data received', {
        itemCount: cartData?.items?.length || 0,
        totalPrice: cartData?.totalPrice || 0,
      })

      // Ensure we return proper structure even if backend response is incomplete
      return {
        items: cartData?.items || [],
        totalItems: cartData?.totalItems || 0,
        totalPrice: cartData?.totalPrice || 0,
        currency: cartData?.currency || 'TZS',
      }
    } catch (error) {
      logger.error('[CART] Failed to fetch cart', error)

      // Return empty cart on error rather than throwing
      // This ensures the UI remains functional
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0,
        currency: 'TZS',
      }
    }
  }

  /**
   * Updates the quantity of a cart item
   * @param cartItemId - Cart item identifier
   * @param productId - Product identifier
   * @param quantity - New quantity
   * @returns Promise resolving to success status
   */
  async updateCartItem(cartItemId: number, productId: number, quantity: number): Promise<boolean> {
    try {
      logger.debug('[CART] Updating cart item', { cartItemId, productId, quantity })

      const response = await apiClient.updateCartItem(cartItemId, productId, quantity)
      const success = response?.success !== false

      logger.debug('[CART] Update cart item response', { success })
      return success
    } catch (error) {
      logger.error('[CART] Failed to update cart item', error)
      throw new Error('Failed to update cart item. Please try again.')
    }
  }

  /**
   * Removes an item from the cart
   * @param cartItemId - Cart item identifier
   * @returns Promise resolving to success status
   */
  async removeFromCart(cartItemId: number): Promise<boolean> {
    try {
      logger.debug('[CART] Removing item from cart', { cartItemId })

      const response = await apiClient.removeFromCart(cartItemId)
      const success = response?.success !== false

      logger.debug('[CART] Remove from cart response', { success })
      return success
    } catch (error) {
      logger.error('[CART] Failed to remove item from cart', error)
      throw new Error('Failed to remove item from cart. Please try again.')
    }
  }

  /**
   * Clears all items from the cart
   * @returns Promise resolving to success status
   */
  async clearCart(): Promise<boolean> {
    try {
      logger.debug('[CART] Clearing all cart items')

      const response = await apiClient.clearCart()
      const success = response?.success !== false

      logger.debug('[CART] Clear cart response', { success })
      return success
    } catch (error) {
      logger.error('[CART] Failed to clear cart', error)
      throw new Error('Failed to clear cart. Please try again.')
    }
  }

  /**
   * Converts backend cart item to frontend format for compatibility
   * @param backendItem - Backend cart item
   * @returns Frontend-compatible cart item
   */
  convertToFrontendItem(backendItem: BackendCartItem): FrontendCartItem {
    return {
      productId: backendItem.productId,
      name: backendItem.productName,
      price: backendItem.price,
      quantity: backendItem.quantity,
      cartId: backendItem.cartId,
      currency: backendItem.currency,
      subtotal: backendItem.subtotal,
      // Default values for fields not provided by backend
      image: '', // Will need to be fetched separately or added to backend response
      seller: 'Unknown', // Will need to be fetched separately or added to backend response
      condition: 'Unknown', // Will need to be fetched separately or added to backend response
    }
  }

  /**
   * Converts backend cart data to frontend format for compatibility
   * @param backendCart - Backend cart data
   * @returns Frontend-compatible cart data
   */
  convertToFrontendCart(backendCart: BackendCartData): {
    items: FrontendCartItem[]
    subtotal: number
    currency: string
    totalItems: number
  } {
    return {
      items: backendCart.items.map((item) => this.convertToFrontendItem(item)),
      subtotal: backendCart.totalPrice,
      currency: backendCart.currency,
      totalItems: backendCart.totalItems,
    }
  }

  /**
   * Migrates localStorage cart data to backend (one-time operation)
   * @param localStorageItems - Items from localStorage
   * @returns Promise resolving to migration success status
   */
  async migrateLocalStorageCart(localStorageItems: FrontendCartItem[]): Promise<boolean> {
    try {
      logger.debug('[CART] Migrating localStorage cart to backend', {
        itemCount: localStorageItems.length,
      })

      const migrationPromises = localStorageItems.map((item) =>
        this.addToCart(item.productId, item.quantity)
      )

      const results = await Promise.allSettled(migrationPromises)
      const successCount = results.filter(
        (result) => result.status === 'fulfilled' && result.value === true
      ).length

      const migrationSuccess = successCount === localStorageItems.length

      logger.debug('[CART] Migration completed', {
        total: localStorageItems.length,
        successful: successCount,
        success: migrationSuccess,
      })

      return migrationSuccess
    } catch (error) {
      logger.error('[CART] Migration failed', error)
      return false
    }
  }
}

// Export singleton instance
export const cartService = new CartService()
