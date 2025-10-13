/**
 * =============================================================================
 * CartProvider - Shopping Cart State Management
 * =============================================================================
 *
 * Centralized shopping cart provider for the Expat Marketplace. This provider
 * manages cart state with persistent storage, verification checks, and comprehensive
 * cart operations. It integrates with the authentication system to ensure only
 * verified users can make purchases.
 *
 * Key Features:
 * - Persistent cart storage with localStorage
 * - User verification checks before purchases
 * - Real-time cart calculations (totals, savings, etc.)
 * - Automatic cart clearing on logout
 * - Optimized re-renders through memoization
 * - Comprehensive error handling and user feedback
 *
 * Connected Components:
 * - providers/auth-provider.tsx - User authentication and permissions
 * - hooks/use-cart.ts - Hook for consuming cart context
 * - hooks/use-verification.ts - Verification status checking
 * - components/header.tsx - Cart count display
 * - components/product-actions.tsx - Add to cart buttons
 * - app/cart/page.tsx - Cart management interface
 * - app/checkout/page.tsx - Purchase flow
 *
 * Backend Integration Points:
 * - POST /api/cart - Sync cart with backend
 * - PUT /api/cart/items - Update cart items
 * - DELETE /api/cart/items/:id - Remove cart items
 * - GET /api/cart - Fetch user's cart
 *
 * Usage Example:
 * ```tsx
 * // Wrap your app with the provider
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <CartProvider>
 *         <YourApp />
 *       </CartProvider>
 *     </AuthProvider>
 *   )
 * }
 *
 * // Use the cart in components
 * function ProductCard({ product }) {
 *   const { addToCart, isInCart, itemCount } = useCart()
 *
 *   const handleAddToCart = () => {
 *     addToCart({
 *       id: product.id,
 *       title: product.title,
 *       price: product.price,
 *       image: product.image,
 *       // ... other required fields
 *     })
 *   }
 * }
 * ```
 */

'use client'

import { createContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react'
import { toast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/lib/api'
import { backendCartToFrontendItems } from '@/lib/cart-utils'
import type { BackendCartResponse, BackendCartItem } from '@/lib/types'
import { setItemDebounced, getItem, removeItem as removeStorageItem, flushPendingWrites } from '@/lib/storage-utils'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Cart item structure representing a product in the shopping cart
 * Contains all necessary information for display and checkout
 */
export interface CartItem {
  /** Unique product identifier */
  id: string
  /** Product title/name for display */
  title: string
  /** Current selling price in local currency */
  price: number
  /** Original price before discount (optional) */
  originalPrice?: number
  /** Primary product image URL */
  image: string
  /** Additional product images */
  images?: string[]
  /** Product condition (new, used, etc.) */
  condition: string
  /** Expat's unique identifier */
  expatId: string
  /** Expat's display name */
  expatName: string
  /** Quantity of this item in cart */
  quantity: number
  /** Product category for organization */
  category: string
  /** Expat's location */
  location: string
  /** Whether the expat is verified */
  verified: boolean
  /** Currency code (TZS, USD, etc.) */
  currency?: string
  /** Item availability status */
  isAvailable?: boolean
  /** Whether item is selected for checkout */
  selected?: boolean
}

/**
 * Internal cart state structure
 * Manages loading states and error handling
 */
interface CartState {
  /** Array of items currently in the cart */
  items: CartItem[]
  /** Loading state for cart operations */
  isLoading: boolean
  /** Error message if any cart operation fails */
  error: string | null
  /** Whether cart data has been loaded from storage */
  isInitialized: boolean
  /** Array of selected item IDs for checkout */
  selectedItems: string[]
}

/**
 * Complete cart context interface exposed to consumers
 * Includes state, actions, and computed properties
 */
interface CartContextType extends CartState {
  // Computed Properties
  /** Total number of items in cart (sum of all quantities) */
  itemCount: number
  /** Total price of all items in cart */
  subtotal: number
  /** Total original price (before discounts) */
  originalTotal: number
  /** Total savings from discounts */
  savings: number
  /** Whether cart contains items from verified expats */
  hasVerifiedExpats: boolean
  /** Whether the cart is empty */
  isEmpty: boolean
  /** Unique expat count in cart */
  expatCount: number
  /** Whether cart has mixed currencies */
  hasMixedCurrencies: boolean
  /** Selected items data for checkout */
  selectedItemsData: CartItem[]
  /** Subtotal for selected items only */
  selectedSubtotal: number
  /** Original total for selected items */
  selectedOriginalTotal: number
  /** Savings for selected items */
  selectedSavings: number

  // Cart Operations
  /** Add a product to the cart with optional quantity */
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => Promise<void>
  /** Remove an item completely from the cart */
  removeFromCart: (itemId: string) => Promise<void>
  /** Update quantity of an existing cart item */
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  /** Clear all items from the cart */
  clearCart: () => Promise<void>
  /** Sync cart with backend */
  syncCart: () => Promise<void>
  /** Contact expat for a specific item */
  contactExpat: (itemId: string) => void
  /** Toggle item selection for checkout */
  toggleItemSelection: (itemId: string) => void
  /** Select all items */
  selectAllItems: () => void
  /** Deselect all items */
  deselectAllItems: () => void

  // Utility Functions
  /** Check if a product is already in the cart */
  isInCart: (itemId: string) => boolean
  /** Get quantity of a specific item in cart */
  getItemQuantity: (itemId: string) => number
  /** Get cart item by ID */
  getCartItem: (itemId: string) => CartItem | undefined
  /** Validate cart item availability */
  validateCartItems: () => Promise<void>
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

/**
 * Cart context for sharing cart state across the application
 */
export const CartContext = createContext<CartContextType | undefined>(undefined)

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const CART_STORAGE_KEY = 'expatCartItems'
const CART_EXPIRY_HOURS = 168 // 7 days
const MAX_CART_ITEMS = 50
const MAX_ITEM_QUANTITY = 10

// ============================================================================
// CART PROVIDER COMPONENT
// ============================================================================

/**
 * Shopping cart provider component
 *
 * Manages cart state with automatic persistence to localStorage, verification
 * checks for purchases, and comprehensive cart operations. Provides optimized
 * re-renders through memoization and handles all cart-related business logic.
 *
 * @param children - Child components that will have access to cart context
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>({
    items: [],
    isLoading: true,
    error: null,
    isInitialized: false,
    selectedItems: [],
  })

  const { isLoggedIn, user, canBuy } = useAuth()

  // ============================================================================
  // CART DATA VALIDATION & UTILITIES
  // ============================================================================

  /**
   * Validates cart data structure and expiry
   */
  const isCartDataValid = useCallback((cartData: any): boolean => {
    if (!cartData || typeof cartData !== 'object') return false

    // Check timestamp for expiry
    if (cartData.timestamp) {
      const age = Date.now() - cartData.timestamp
      const maxAge = CART_EXPIRY_HOURS * 60 * 60 * 1000
      if (age > maxAge) return false
    }

    // Validate items structure
    if (!Array.isArray(cartData.items)) return false

    return cartData.items.every(
      (item: any) => item.id && item.title && typeof item.price === 'number'
    )
  }, [])

  /**
   * Persists cart items to localStorage with timestamp (debounced)
   */
  const persistCart = useCallback(
    (items: CartItem[], selectedItems: string[] = []) => {
      if (!isLoggedIn) return // Don't persist if user not logged in

      try {
        const cartData = {
          items,
          selectedItems,
          timestamp: Date.now(),
          userId: user?.id, // Associate cart with user
        }
        // Use debounced storage to prevent aggressive writes
        setItemDebounced(CART_STORAGE_KEY, cartData, 500)
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error)
        setCart((prev) => ({
          ...prev,
          error: 'Failed to save cart. Changes may not persist.',
        }))
      }
    },
    [isLoggedIn, user?.id]
  )

  // ============================================================================
  // INITIALIZATION & CLEANUP
  // ============================================================================

  /**
   * Load cart from localStorage on mount and when user changes
   */
  useEffect(() => {
    const loadCart = async () => {
      try {
        setCart((prev) => ({ ...prev, isLoading: true, error: null }))

        if (!isLoggedIn) {
          // Clear cart for non-authenticated users
          setCart({
            items: [],
            isLoading: false,
            error: null,
            isInitialized: true,
            selectedItems: [],
          })
          removeStorageItem(CART_STORAGE_KEY)
          return
        }

        // Load from backend first for authenticated users
        try {
          const response = await apiClient.getUserCart()

          if (response.success || response.data) {
            const backendCart: BackendCartResponse = response.data || response
            const frontendItems = backendCartToFrontendItems(backendCart)

            setCart((prev) => ({
              ...prev,
              items: frontendItems,
              isLoading: false,
              error: null,
              isInitialized: true,
            }))

            // Persist to localStorage
            persistCart(frontendItems, [])
          } else {
            throw new Error(response.message || 'Failed to load cart')
          }
        } catch (backendError) {
          console.warn('Failed to load from backend, falling back to localStorage:', backendError)

          // Fallback to localStorage if backend fails
          const cartData = getItem(CART_STORAGE_KEY)

          if (!cartData) {
            setCart((prev) => ({
              ...prev,
              items: [],
              isLoading: false,
              isInitialized: true,
              selectedItems: [],
            }))
            return
          }

          // Validate cart data and user association
          if (!isCartDataValid(cartData) || cartData.userId !== user?.id) {
            removeStorageItem(CART_STORAGE_KEY)
            setCart((prev) => ({
              ...prev,
              items: [],
              isLoading: false,
              isInitialized: true,
              selectedItems: [],
            }))
            return
          }

          setCart({
            items: cartData.items || [],
            isLoading: false,
            error: null,
            isInitialized: true,
            selectedItems: cartData.selectedItems || [],
          })
        }
      } catch (error) {
        console.error('Failed to load cart:', error)
        removeStorageItem(CART_STORAGE_KEY)
        setCart({
          items: [],
          isLoading: false,
          error: 'Failed to load cart',
          isInitialized: true,
          selectedItems: [],
        })
      }
    }

    loadCart()
  }, [isLoggedIn, user?.id])

  /**
   * Clear cart when user logs out
   */
  useEffect(() => {
    if (!isLoggedIn && cart.isInitialized) {
      // Flush any pending writes before clearing
      flushPendingWrites()
      
      setCart((prev) => ({
        ...prev,
        items: [],
        error: null,
        selectedItems: [],
      }))
      removeStorageItem(CART_STORAGE_KEY)
    }
  }, [isLoggedIn, cart.isInitialized])

  /**
   * Flush pending writes on unmount
   */
  useEffect(() => {
    return () => {
      flushPendingWrites()
    }
  }, [])

  // ============================================================================
  // CART CALCULATIONS & SUMMARY
  // ============================================================================

  /**
   * Memoized cart summary calculations
   * Computes totals, savings, and other derived state efficiently
   */
  const cartSummary = useMemo(() => {
    const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0)
    const subtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0)
    const originalTotal = cart.items.reduce(
      (total, item) => total + (item.originalPrice || item.price) * item.quantity,
      0
    )
    const savings = originalTotal - subtotal
    const hasVerifiedExpats = cart.items.some((item) => item.verified)
    const expatCount = new Set(cart.items.map((item) => item.expatId)).size
    const currencies = new Set(cart.items.map((item) => item.currency || 'TZS'))
    const hasMixedCurrencies = currencies.size > 1

    // Calculate selected items data
    const selectedItemsData = cart.items.filter((item) => cart.selectedItems.includes(item.id))
    const selectedSubtotal = selectedItemsData.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
    const selectedOriginalTotal = selectedItemsData.reduce(
      (total, item) => total + (item.originalPrice || item.price) * item.quantity,
      0
    )
    const selectedSavings = selectedOriginalTotal - selectedSubtotal

    return {
      itemCount,
      subtotal,
      originalTotal,
      savings,
      hasVerifiedExpats,
      isEmpty: cart.items.length === 0,
      expatCount,
      hasMixedCurrencies,
      selectedItemsData,
      selectedSubtotal,
      selectedOriginalTotal,
      selectedSavings,
    }
  }, [cart.items, cart.selectedItems])

  // ============================================================================
  // CART OPERATIONS
  // ============================================================================

  const syncWithBackend = useCallback(
    async (items: CartItem[]) => {
      if (!isLoggedIn) return

      try {
        // TODO: API call - POST /api/cart/sync { items }
        // await api.cart.sync(items)
        // ...existing code...
      } catch (error) {
        console.error('Failed to sync cart with backend:', error)
        // Don't throw error to avoid disrupting user experience
      }
    },
    [isLoggedIn]
  )

  const addItem = useCallback(
    async (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
      if (!isLoggedIn) {
        toast({
          title: 'Login required',
          description: 'Please login to add items to your cart.',
          variant: 'destructive',
        })
        return
      }

      try {
        setCart((prev) => ({ ...prev, isLoading: true, error: null }))

        // Convert item.id (string) to productId (number) for backend
        const productId = parseInt(item.id, 10)
        if (isNaN(productId)) {
          throw new Error('Invalid product ID')
        }

        // Call backend API to add to cart
        const response = await apiClient.addToCart(productId, quantity)

        if (response.success || response.data) {
          // Refresh cart from backend to get updated state
          const cartResponse = await apiClient.getUserCart()
          if (cartResponse.success || cartResponse.data) {
            const backendCart: BackendCartResponse = cartResponse.data || cartResponse
            const frontendItems = backendCartToFrontendItems(backendCart)

            setCart((prev) => {
              persistCart(frontendItems, prev.selectedItems)
              return {
                ...prev,
                items: frontendItems,
                isLoading: false,
                error: null,
              }
            })
          }

          toast({
            title: 'Added to cart',
            description: `${item.title} has been added to your cart.`,
          })
        } else {
          throw new Error(response.message || 'Failed to add item to cart')
        }
      } catch (error) {
        console.error('Failed to add item to cart:', error)
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to add item to cart. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setCart((prev) => ({ ...prev, isLoading: false }))
      }
    },
    [isLoggedIn, persistCart]
  )

  const removeItem = useCallback(
    async (id: string) => {
      if (!isLoggedIn) {
        toast({
          title: 'Login required',
          description: 'Please login to modify your cart.',
          variant: 'destructive',
        })
        return
      }

      try {
        setCart((prev) => ({ ...prev, isLoading: true, error: null }))

        // Convert id (string) to itemId (number) for backend
        const itemId = parseInt(id, 10)
        if (isNaN(itemId)) {
          throw new Error('Invalid item ID')
        }

        // Call backend API to remove from cart
        const response = await apiClient.removeFromCart(itemId)

        if (response.success || response.data !== undefined) {
          // Refresh cart from backend to get updated state
          const cartResponse = await apiClient.getUserCart()
          if (cartResponse.success || cartResponse.data) {
            const backendCart: BackendCartResponse = cartResponse.data || cartResponse
            const frontendItems = backendCartToFrontendItems(backendCart)

            setCart((prev) => {
              persistCart(frontendItems, prev.selectedItems)
              return {
                ...prev,
                items: frontendItems,
                isLoading: false,
                error: null,
              }
            })
          }

          toast({
            title: 'Item removed',
            description: 'Item has been removed from your cart.',
          })
        } else {
          throw new Error(response.message || 'Failed to remove item from cart')
        }
      } catch (error) {
        console.error('Failed to remove item from cart:', error)
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to remove item. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setCart((prev) => ({ ...prev, isLoading: false }))
      }
    },
    [isLoggedIn, persistCart]
  )

  /**
   * Update quantity of an existing cart item
   */
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (!isLoggedIn) {
        toast({
          title: 'Login required',
          description: 'Please login to modify your cart.',
          variant: 'destructive',
        })
        return
      }

      try {
        if (quantity <= 0) {
          await removeItem(itemId)
          return
        }

        if (quantity > MAX_ITEM_QUANTITY) {
          toast({
            title: 'Quantity Limit',
            description: `Maximum ${MAX_ITEM_QUANTITY} units per item.`,
            variant: 'destructive',
          })
          return
        }

        setCart((prev) => ({ ...prev, isLoading: true, error: null }))

        // Find the cart item to get cartId and productId
        const cartItem = cart.items.find((item) => item.id === itemId)
        if (!cartItem) {
          throw new Error('Item not found in cart')
        }

        // Convert IDs to numbers for backend
        const cartId = parseInt(cartItem.id, 10) // Assuming cartId matches item id
        const productId = parseInt(cartItem.id, 10)

        if (isNaN(cartId) || isNaN(productId)) {
          throw new Error('Invalid item or product ID')
        }

        // Call backend API to update cart item
        const response = await apiClient.updateCartItem(cartId, productId, quantity)

        if (response.success || response.data) {
          // Refresh cart from backend to get updated state
          const cartResponse = await apiClient.getUserCart()
          if (cartResponse.success || cartResponse.data) {
            const backendCart: BackendCartResponse = cartResponse.data || cartResponse
            const frontendItems = backendCartToFrontendItems(backendCart)

            setCart((prev) => {
              persistCart(frontendItems, prev.selectedItems)
              return {
                ...prev,
                items: frontendItems,
                isLoading: false,
                error: null,
              }
            })
          }
        } else {
          throw new Error(response.message || 'Failed to update quantity')
        }
      } catch (error) {
        console.error('Failed to update quantity:', error)
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to update quantity. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setCart((prev) => ({ ...prev, isLoading: false }))
      }
    },
    [isLoggedIn, cart.items, removeItem, persistCart]
  )

  /**
   * Clear all items from the cart
   */
  const clearCart = useCallback(async () => {
    if (!isLoggedIn) {
      toast({
        title: 'Login required',
        description: 'Please login to modify your cart.',
        variant: 'destructive',
      })
      return
    }

    try {
      setCart((prev) => ({ ...prev, isLoading: true, error: null }))

      // Call backend API to clear cart
      const response = await apiClient.clearCart()

      if (response.success || response.data !== undefined) {
        // Update local state
        setCart((prev) => ({ ...prev, items: [], selectedItems: [], error: null }))
        removeStorageItem(CART_STORAGE_KEY)

        toast({
          title: 'Cart cleared',
          description: 'All items have been removed from your cart.',
        })
      } else {
        throw new Error(response.message || 'Failed to clear cart')
      }
    } catch (error) {
      console.error('Failed to clear cart:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to clear cart. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setCart((prev) => ({ ...prev, isLoading: false }))
    }
  }, [isLoggedIn])

  /**
   * Sync cart with backend
   */
  const syncCart = useCallback(async () => {
    if (!isLoggedIn) return

    try {
      const response = await apiClient.getUserCart()
      if (response.success || response.data) {
        const backendCart: BackendCartResponse = response.data || response
        const frontendItems = backendCartToFrontendItems(backendCart)

        setCart((prev) => {
          persistCart(frontendItems, prev.selectedItems)
          return {
            ...prev,
            items: frontendItems,
            error: null,
          }
        })
      }
    } catch (error) {
      console.error('Failed to sync cart:', error)
      toast({
        title: 'Sync Error',
        description: 'Failed to sync cart with server. Some changes may not be saved.',
        variant: 'destructive',
      })
    }
  }, [isLoggedIn, persistCart])

  /**
   * Validate cart items availability
   */
  const validateCartItems = useCallback(async () => {
    try {
      // TODO: Check item availability with backend
      // const unavailableItems = await api.cart.validateItems(cart.items)
      // if (unavailableItems.length > 0) {
      //   // Remove unavailable items and notify user
      // }
      // ...existing code...
    } catch (error) {
      console.error('Failed to validate cart items:', error)
    }
  }, [])

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Check if a product is already in the cart
   */
  const isInCart = useCallback(
    (itemId: string) => cart.items.some((item) => item.id === itemId),
    [cart.items]
  )

  /**
   * Get the quantity of a specific item in the cart
   */
  const getItemQuantity = useCallback(
    (itemId: string) => cart.items.find((item) => item.id === itemId)?.quantity || 0,
    [cart.items]
  )

  /**
   * Get cart item by ID
   */
  const getCartItem = useCallback(
    (itemId: string) => cart.items.find((item) => item.id === itemId),
    [cart.items]
  )

  // ============================================================================
  // SELECTION FUNCTIONS
  // ============================================================================

  /**
   * Toggle item selection for checkout
   */
  const toggleItemSelection = useCallback((itemId: string) => {
    setCart((prev) => ({
      ...prev,
      selectedItems: prev.selectedItems.includes(itemId)
        ? prev.selectedItems.filter((id) => id !== itemId)
        : [...prev.selectedItems, itemId],
    }))
  }, [])

  /**
   * Select all items for checkout
   */
  const selectAllItems = useCallback(() => {
    setCart((prev) => ({
      ...prev,
      selectedItems: prev.items.map((item) => item.id),
    }))
  }, [])

  /**
   * Deselect all items
   */
  const deselectAllItems = useCallback(() => {
    setCart((prev) => ({
      ...prev,
      selectedItems: [],
    }))
  }, [])

  /**
   * Contact expat for a specific item
   */
  const contactExpat = useCallback(
    (itemId: string) => {
      const item = cart.items.find((i) => i.id === itemId)
      if (!item) {
        toast({
          title: 'Item not found',
          description: 'Unable to find the item to contact expat.',
          variant: 'destructive',
        })
        return
      }

      // Navigate to messages with expat and product information
      const encodedExpat = encodeURIComponent(item.expatName)
      const encodedProduct = encodeURIComponent(item.title)
      window.location.href = `/messages?expat=${encodedExpat}&product=${encodedProduct}`
    },
    [cart.items]
  )

  // ============================================================================
  // CONTEXT VALUE MEMOIZATION
  // ============================================================================

  /**
   * Memoized context value to prevent unnecessary re-renders
   */
  const value = useMemo<CartContextType>(
    () => ({
      // State
      ...cart,

      // Computed Properties
      ...cartSummary,

      // Actions
      addToCart: addItem,
      removeFromCart: removeItem,
      updateQuantity,
      clearCart,
      syncCart,

      // Utilities
      isInCart,
      getItemQuantity,
      getCartItem,
      validateCartItems,

      // Selection Functions
      toggleItemSelection,
      selectAllItems,
      deselectAllItems,
      contactExpat,
    }),
    [
      cart,
      cartSummary,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      syncCart,
      isInCart,
      getItemQuantity,
      getCartItem,
      validateCartItems,
      toggleItemSelection,
      selectAllItems,
      deselectAllItems,
      contactExpat,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
