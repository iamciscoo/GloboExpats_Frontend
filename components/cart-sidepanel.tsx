'use client'

/**
 * =============================================================================
 * CART SIDE PANEL - Quick Access Shopping Cart
 * =============================================================================
 *
 * A slide-out shopping cart panel accessible via keyboard shortcut (Ctrl/Cmd+K)
 * or click. Provides quick access to cart items from any page with smooth
 * animations and intuitive UX.
 *
 * Key Features:
 * - Keyboard shortcut (Ctrl/Cmd+K) for quick access
 * - Lazy-loaded cart data for performance
 * - Full accessibility with ARIA roles and keyboard navigation
 * - Smooth transitions and animations
 * - Empty state and item management
 * - Direct checkout and cart view actions
 * - Responsive design for all devices
 *
 * Connected Components:
 * - providers/cart-provider.tsx - Cart state management
 * - hooks/use-cart.ts - Cart operations
 * - components/ui/sheet.tsx - Side panel implementation
 */

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ShoppingCart, Trash2, Plus, Minus, X, ArrowRight } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface CartSidePanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface CartItem {
  id: string
  title: string
  image?: string
  price: number
  quantity: number
  currency?: string
}

/**
 * Cart Item Row Component
 */
const CartItemRow: React.FC<{
  item: CartItem
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}> = ({ item, onUpdateQuantity, onRemove }) => {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return
    setIsUpdating(true)
    try {
      await onUpdateQuantity(item.id, newQuantity)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <li className="flex gap-4 p-4 bg-white border border-neutral-200 rounded-xl">
      {/* Product Image */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100">
        <Image
          src={item.image || '/placeholder.svg'}
          alt={item.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
        <div className="pr-2">
          <h3 className="font-medium text-sm text-neutral-900 line-clamp-2 break-words">
            {item.title}
          </h3>
          <p className="text-sm font-semibold text-neutral-900 mt-1">
            {formatPrice(item.price, item.currency || 'TZS')}
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center border border-neutral-300 rounded-lg">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              className="p-1.5 hover:bg-neutral-100 disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="px-3 text-sm font-medium">{item.quantity}</span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating}
              className="p-1.5 hover:bg-neutral-100"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
            aria-label="Remove item"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  )
}

/**
 * Empty Cart State Component
 */
const EmptyCartState = React.memo<{ onClose: () => void }>(({ onClose }) => (
  <div className="flex flex-col items-center justify-center px-4 text-center">
    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center shadow-sm mb-4">
      <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-400" />
    </div>
    <h3 className="text-neutral-700 text-base sm:text-lg font-semibold">Your cart is empty</h3>
    <p className="text-neutral-400 text-xs sm:text-sm mt-2 mb-6">Add some items to get started!</p>
    <Button onClick={onClose} className="w-full max-w-[200px] bg-neutral-900 hover:bg-neutral-800">
      Continue Shopping
    </Button>
  </div>
))

EmptyCartState.displayName = 'EmptyCartState'

/**
 * Main Cart Side Panel Component
 */
export const CartSidePanel: React.FC<CartSidePanelProps> = ({ open, onOpenChange }) => {
  const {
    items,
    itemCount,
    subtotal,
    isEmpty,
    updateQuantity,
    removeFromCart,
    clearCart,
    isLoading,
  } = useCart()

  const [isClearingCart, setIsClearingCart] = useState(false)

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return
    setIsClearingCart(true)
    try {
      await clearCart()
    } finally {
      setIsClearingCart(false)
    }
  }

  const handleCheckout = () => {
    onOpenChange(false)
    // Navigation handled by Link component
  }

  const handleViewFullCart = () => {
    onOpenChange(false)
    // Navigation handled by Link component
  }

  // Get primary currency from first item
  const currency = items[0]?.currency || 'TZS'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[280px] sm:w-[320px] flex flex-col p-0 !right-0 !left-auto top-[64px] bottom-0 md:top-0 md:bottom-0 md:h-screen"
        aria-label="Shopping cart panel"
        hideOverlay={true}
        hideClose={true}
      >
        {/* Header - Title and Description must be direct children for accessibility */}
        <SheetHeader className="px-4 sm:px-5 pt-5 pb-4 border-b border-neutral-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg sm:text-xl font-semibold text-neutral-900">
                Shopping Cart
              </SheetTitle>
              <SheetDescription className="text-xs sm:text-sm text-neutral-600 mt-1">
                {isEmpty
                  ? 'Your cart is empty'
                  : `${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your cart`}
              </SheetDescription>
            </div>
            <Badge variant="secondary" className="h-7 px-2 text-sm flex-shrink-0">
              {itemCount}
            </Badge>
          </div>
        </SheetHeader>

        {/* Cart Content */}
        {isEmpty ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="-translate-y-24 sm:-translate-y-28 md:-translate-y-32">
              <EmptyCartState onClose={() => onOpenChange(false)} />
            </div>
          </div>
        ) : (
          <>
            {/* Items List */}
            <ScrollArea className="flex-1 px-3 sm:px-4">
              <div role="list" aria-label="Cart items" className="space-y-3 py-4">
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>

              {/* Clear Cart Button */}
              {!isEmpty && (
                <div className="pb-4">
                  <Button
                    variant="outline"
                    size="default"
                    className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 hover:border-red-400"
                    onClick={handleClearCart}
                    disabled={isClearingCart || isLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cart
                  </Button>
                </div>
              )}
            </ScrollArea>

            {/* Footer with Summary and Actions */}
            <div className="border-t border-neutral-200 bg-white px-3 sm:px-4 py-3 sm:py-4 space-y-3">
              {/* Subtotal */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm sm:text-base text-neutral-700">
                    Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                  </span>
                  <span className="font-bold text-base sm:text-lg text-neutral-900 text-right">
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 text-center sm:text-left">
                  Delivery and taxes calculated at checkout
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  asChild
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white h-11 sm:h-12 text-sm sm:text-base font-semibold"
                  onClick={handleCheckout}
                >
                  <Link href="/checkout" className="flex items-center justify-center">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full h-10 sm:h-11 text-sm sm:text-base"
                  onClick={handleViewFullCart}
                >
                  <Link href="/cart" className="flex items-center justify-center">
                    View Full Cart
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full h-10 sm:h-11 text-sm sm:text-base text-neutral-700 hover:text-neutral-900"
                  onClick={() => onOpenChange(false)}
                >
                  Continue Shopping
                </Button>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 pt-1">
                <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                <span className="text-center">Secure checkout guaranteed</span>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

CartSidePanel.displayName = 'CartSidePanel'

/**
 * Cart Side Panel Trigger Component
 * Use this component to trigger the cart panel from anywhere
 */
export const CartSidePanelTrigger: React.FC<{
  children?: React.ReactNode
  className?: string
}> = ({ children, className }) => {
  const [open, setOpen] = useState(false)
  const { itemCount } = useCart()

  // Keyboard shortcut: Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'relative inline-flex items-center justify-center',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'transition-colors',
          className
        )}
        aria-label={`Open shopping cart (${itemCount} items)`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {children || (
          <>
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </>
        )}
      </button>

      <CartSidePanel open={open} onOpenChange={setOpen} />
    </>
  )
}

CartSidePanelTrigger.displayName = 'CartSidePanelTrigger'
