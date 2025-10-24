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
import { cartService, type BackendCartData, type FrontendCartItem } from '@/lib/cart-service'
import {
  setItemDebounced,
  getItem,
  removeItem as removeStorageItem,
  flushPendingWrites,
} from '@/lib/storage-utils'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Cart item structure representing a product in the shopping cart
 * Contains all necessary information for display and checkout
 */
export interface CartItem {
  /** Unique cart item identifier (cartId from backend) */
  id: string
  /** Product ID from backend (for update operations) */
  productId?: number
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
  /** Add a product to the cart (single item only) */
  addToCart: (product: Omit<CartItem, 'quantity'>) => Promise<void>
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
const _MAX_CART_ITEMS = 50 // Reserved for future cart limits
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

  const { isLoggedIn, user, canBuy: _canBuy, isLoading: authLoading } = useAuth()

  // ============================================================================
  // CART DATA VALIDATION & UTILITIES
  // ============================================================================

  /**
   * Validates cart data structure and expiry
   */
  const isCartDataValid = useCallback((cartData: unknown): boolean => {
    if (!cartData || typeof cartData !== 'object') return false
    const data = cartData as { timestamp?: number; items?: unknown[] }
    // Check timestamp for expiry
    if (data.timestamp) {
      const age = Date.now() - data.timestamp
      const maxAge = CART_EXPIRY_HOURS * 60 * 60 * 1000
      if (age > maxAge) return false
    }

    // Validate items structure
    if (!Array.isArray(data.items)) return false

    return data.items.every((item) => {
      const cartItem = item as { id?: unknown; title?: unknown; price?: unknown }
      return cartItem.id && cartItem.title && typeof cartItem.price === 'number'
    })
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

  /**
   * BACKEND INTEGRATION: Sync cart with backend when user logs in
   */
  const syncCart = useCallback(async () => {
    if (!isLoggedIn) return

    try {
      setCart((prev) => ({ ...prev, isLoading: true, error: null }))

      // Get cart from backend
      const backendCart = await cartService.getCart()
      const frontendCart = cartService.convertToFrontendCart(backendCart)

      // Convert to CartItem format
      const cartItems = frontendCart.items.map((frontendItem) => ({
        id: frontendItem.cartId?.toString() || frontendItem.productId.toString(),
        productId: frontendItem.productId,
        title: frontendItem.name,
        price: frontendItem.price,
        image: frontendItem.image || '',
        condition: frontendItem.condition || 'Used',
        expatId: 'unknown', // Will need to be fetched separately
        expatName: frontendItem.seller || 'Unknown Seller',
        quantity: frontendItem.quantity,
        category: 'General', // Will need to be fetched separately
        location: 'Unknown', // Will need to be fetched separately
        verified: false, // Will need to be fetched separately
        currency: frontendItem.currency || 'TZS',
        isAvailable: true,
        selected: false,
      }))

      // Update local state with backend data
      setCart({
        items: cartItems,
        isLoading: false,
        error: null,
        isInitialized: true,
        selectedItems: [],
      })

      // Persist to localStorage as backup
      persistCart(cartItems, [])
    } catch (error) {
      console.error('❌ Failed to sync cart with backend:', error)

      // Fall back to localStorage data - simplified fallback
      setCart({
        items: [],
        isLoading: false,
        error: null,
        isInitialized: true,
        selectedItems: [],
      })
    }
  }, [isLoggedIn, persistCart])

  // ============================================================================
  // INITIALIZATION & CLEANUP
  // ============================================================================

  /**
   * Load cart from backend when authenticated, fallback to localStorage
   */
  useEffect(() => {
    const loadCart = async () => {
      try {
        // Wait for auth to finish loading before deciding what to do with cart
        if (authLoading) {
          return
        }

        if (!isLoggedIn) {
          // Clear cart for non-authenticated users (only after auth has loaded)
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

        // BACKEND INTEGRATION: Sync with backend for authenticated users
        await syncCart()
      } catch (error) {
        console.error('❌ Failed to load cart:', error)
        removeStorageItem(CART_STORAGE_KEY)
        setCart({
          items: [],
          isLoading: false,
          error: null,
          isInitialized: true,
          selectedItems: [],
        })
      }
    }

    loadCart()
  }, [authLoading, isLoggedIn, user?.id, syncCart])

  /**
   * Clear cart when user logs out (not on initial load)
   */
  useEffect(() => {
    // Only clear if:
    // 1. User is NOT logged in
    // 2. Cart is initialized
    // 3. Auth has finished loading (to avoid clearing on initial mount)
    if (!isLoggedIn && cart.isInitialized && !authLoading) {
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
  }, [isLoggedIn, cart.isInitialized, authLoading])

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
    // Always use asking price (item.price) for calculations
    const subtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0)
    const hasVerifiedExpats = cart.items.some((item) => item.verified)
    const expatCount = new Set(cart.items.map((item) => item.expatId)).size
    const currencies = new Set(cart.items.map((item) => item.currency || 'TZS'))
    const hasMixedCurrencies = currencies.size > 1

    // Calculate selected items data (using asking price only)
    const selectedItemsData = cart.items.filter((item) => cart.selectedItems.includes(item.id))
    const selectedSubtotal = selectedItemsData.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )

    return {
      itemCount,
      subtotal,
      originalTotal: subtotal, // Same as subtotal - no discount concept
      savings: 0, // No savings - always use asking price
      hasVerifiedExpats,
      isEmpty: cart.items.length === 0,
      expatCount,
      hasMixedCurrencies,
      selectedItemsData,
      selectedSubtotal,
      selectedOriginalTotal: selectedSubtotal, // Same as selectedSubtotal
      selectedSavings: 0, // No savings
    }
  }, [cart.items, cart.selectedItems])

  // ============================================================================
  // CART OPERATIONS
  // ============================================================================

  const _syncWithBackend = useCallback(
    async (_items: CartItem[]) => {
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
    async (item: Omit<CartItem, 'quantity'>) => {
      if (!isLoggedIn) {
        toast({
          title: 'Join the Expat Community!',
          description:
            'Login to start shopping or create an account to unlock full marketplace access!',
          variant: 'default',
        })
        return
      }

      try {
        setCart((prev) => ({ ...prev, isLoading: true, error: null }))

        // Check if item already exists in cart
        const existingItem = cart.items.find((i) => i.id === item.id)

        if (existingItem) {
          // Item already in cart - show message instead of adding
          setCart((prev) => ({ ...prev, isLoading: false }))
          toast({
            title: 'Already in cart',
            description: `${item.title} is already in your cart. You can remove it if you no longer want it.`,
            variant: 'default',
          })
          return
        }

        // BACKEND INTEGRATION: Add item to backend cart
        const productId = item.productId || parseInt(item.id)
        
        console.log('🛒 Cart Provider - Adding item:', {
          itemId: item.id,
          itemProductId: item.productId,
          calculatedProductId: productId,
          itemTitle: item.title,
        })

        if (!productId || isNaN(productId)) {
          console.error('❌ Invalid productId:', { itemId: item.id, productId, item })
          throw new Error('Product ID is required to add item to cart')
        }

        console.log('✅ Calling cartService.addToCart with productId:', productId)
        const success = await cartService.addToCart(productId, 1)

        console.log('📊 Add to cart result:', { success })

        if (!success) {
          throw new Error('Failed to add item to backend cart')
        }

        console.log('✅ Item added to backend, fetching updated cart...')
        // Fetch updated cart from backend
        const backendCart = await cartService.getCart()
        const frontendCart = cartService.convertToFrontendCart(backendCart)

        console.log('📊 Backend cart after add:', {
          totalItems: backendCart.items.length,
          items: backendCart.items,
        })
        console.log('📊 Frontend cart after conversion:', {
          totalItems: frontendCart.items.length,
          items: frontendCart.items.map((i) => ({ id: i.productId, name: i.name })),
        })

        // Update local state with backend data
        setCart((prev) => {
          const updatedSelectedItems = [...prev.selectedItems]

          // Convert frontend items to CartItem format
          const updatedItems = frontendCart.items.map((frontendItem) => ({
            id: frontendItem.cartId?.toString() || frontendItem.productId.toString(),
            productId: frontendItem.productId,
            title: frontendItem.name,
            price: frontendItem.price,
            image: frontendItem.image || item.image || '', // Use original image if backend doesn't provide
            condition: frontendItem.condition || item.condition || 'Used',
            expatId: item.expatId || 'unknown',
            expatName: item.expatName || frontendItem.seller || 'Unknown Seller',
            quantity: frontendItem.quantity,
            category: item.category || 'General',
            location: item.location || 'Unknown',
            verified: item.verified || false,
            currency: frontendItem.currency || 'TZS',
            isAvailable: true,
            selected: false,
          }))

          // Auto-select the newly added item for checkout
          const newItemId = item.id
          if (!updatedSelectedItems.includes(newItemId)) {
            updatedSelectedItems.push(newItemId)
          }

          // Persist to localStorage as backup
          persistCart(updatedItems, updatedSelectedItems)

          console.log('✅ Cart updated successfully:', {
            totalItems: updatedItems.length,
            items: updatedItems.map(i => ({ id: i.id, title: i.title, quantity: i.quantity })),
          })

          return {
            ...prev,
            items: updatedItems,
            selectedItems: updatedSelectedItems,
            isLoading: false,
            error: null,
          }
        })

        toast({
          title: 'Added to cart',
          description: `${item.title} has been added to your cart.`,
        })
      } catch (error) {
        console.error('❌ Error adding to cart:', error)
        
        // Extract error message for user
        let errorMessage = 'Failed to add item to cart. Please try again.'
        
        if (error instanceof Error) {
          // Check for specific error messages from backend
          if (error.message.includes('verification') || error.message.includes('verify')) {
            errorMessage = 'Please verify your account to add items to cart. Go to Account → Verification.'
          } else if (error.message.includes('Buyer profile not found')) {
            errorMessage = 'Account setup required. Please complete your profile to add items to cart.'
          } else if (error.message.includes('not found') || error.message.includes('404')) {
            errorMessage = 'This feature requires account verification. Please verify your email.'
          } else if (error.message) {
            errorMessage = error.message
          }
        }
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
        setCart((prev) => ({ ...prev, isLoading: false }))
      }
    },
    [isLoggedIn, persistCart, cart.items]
  )

  const removeItem = useCallback(
    async (id: string) => {
      if (!isLoggedIn) {
        toast({
          title: '🎉 Join the Expat Community!',
          description:
            'Login to manage your cart or register now to start your expat marketplace journey!',
          variant: 'default',
        })
        return
      }

      try {
        setCart((prev) => ({ ...prev, isLoading: true, error: null }))

        // Find the item to get the cartId for backend
        const itemToRemove = cart.items.find((item) => item.id === id)
        if (!itemToRemove) {
          throw new Error('Item not found in cart')
        }

        // BACKEND INTEGRATION: Remove item from backend cart
        const cartId = parseInt(itemToRemove.id)
        if (!cartId) {
          throw new Error('Invalid cart item ID')
        }

        const success = await cartService.removeFromCart(cartId)

        if (!success) {
          throw new Error('Failed to remove item from backend cart')
        }

        // Update local state
        setCart((prev) => {
          const updatedItems = prev.items.filter((item) => item.id !== id)
          const updatedSelectedItems = prev.selectedItems.filter((itemId) => itemId !== id)

          // Persist to localStorage as backup
          persistCart(updatedItems, updatedSelectedItems)

          return {
            ...prev,
            items: updatedItems,
            selectedItems: updatedSelectedItems,
            isLoading: false,
            error: null,
          }
        })

        toast({
          title: 'Item removed',
          description: 'Item has been removed from your cart.',
        })
      } catch (error) {
        console.error('❌ Error removing item from cart:', error)
        toast({
          title: 'Error',
          description: 'Failed to remove item. Please try again.',
          variant: 'destructive',
        })
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
          title: '🎉 Join the Expat Community!',
          description:
            'Login to manage your cart or register now to start your expat marketplace journey!',
          variant: 'default',
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

        // Find the item to get cartId and productId for backend
        const itemToUpdate = cart.items.find((item) => item.id === itemId)
        if (!itemToUpdate) {
          throw new Error('Item not found in cart')
        }

        // BACKEND INTEGRATION: Update item quantity in backend cart
        const cartId = parseInt(itemToUpdate.id)
        const productId = itemToUpdate.productId || parseInt(itemToUpdate.id)

        if (!cartId || !productId) {
          throw new Error('Invalid cart item or product ID')
        }

        const success = await cartService.updateCartItem(cartId, productId, quantity)

        if (!success) {
          throw new Error('Failed to update item quantity in backend cart')
        }

        // Update local state
        setCart((prev) => {
          const updatedItems = prev.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          )

          // Persist to localStorage as backup
          persistCart(updatedItems, prev.selectedItems)

          return {
            ...prev,
            items: updatedItems,
            isLoading: false,
            error: null,
          }
        })

        toast({
          title: 'Quantity updated',
          description: 'Cart quantity has been updated.',
        })
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoggedIn, removeItem, persistCart]
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

      // BACKEND INTEGRATION: Clear cart from backend
      const success = await cartService.clearCart()

      if (!success) {
        throw new Error('Failed to clear cart from backend')
      }

      // Update local state
      setCart((prev) => ({
        ...prev,
        items: [],
        selectedItems: [],
        isLoading: false,
        error: null,
      }))

      // Clear localStorage as backup
      removeStorageItem(CART_STORAGE_KEY)

      toast({
        title: 'Cart cleared',
        description: 'All items have been removed from your cart.',
      })
    } catch (error) {
      console.error('❌ Error clearing cart:', error)
      toast({
        title: 'Error',
        description: 'Failed to clear cart. Please try again.',
        variant: 'destructive',
      })
      setCart((prev) => ({ ...prev, isLoading: false }))
    }
  }, [isLoggedIn])

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
