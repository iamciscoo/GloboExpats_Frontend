'use client'

import { useVerification } from '@/hooks/use-verification'
import { VerificationPopup } from '@/components/verification-popup'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { productToCartItem } from '@/lib/cart-utils'
import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

interface ProductActionsProps {
  productId?: number
  sellerName?: string
  productTitle?: string
  productPrice?: string | number
  productImage?: string
  productCondition?: string
  productLocation?: string
  verifiedSeller?: boolean
  currency?: string
  category?: string
  expatId?: string
  maxQuantity?: number
}

export function ProductActions({
  productId,
  sellerName = 'Seller',
  productTitle = 'item',
  productPrice = 0,
  productImage = '/placeholder.svg',
  productCondition = 'new',
  productLocation = '',
  verifiedSeller = true,
  currency = 'TZS',
  category = 'general',
  expatId = 'unknown',
  maxQuantity,
}: ProductActionsProps) {
  const { checkVerification, isVerificationPopupOpen, currentAction, closeVerificationPopup } =
    useVerification()
  const { addToCart } = useCart()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)

  // Determine availability
  const isOutOfStock = maxQuantity !== undefined && maxQuantity <= 0

  const incrementQuantity = () => {
    // Limit to max quantity if available, otherwise default to 10
    const limit = maxQuantity !== undefined ? Math.min(maxQuantity, 10) : 10
    if (quantity < limit) setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1)
  }

  // Check if current user is the seller using multiple strategies
  const userFullName = user ? `${user.firstName} ${user.lastName}`.trim() : ''
  const isOwnProductByName =
    user && sellerName && userFullName.toLowerCase() === sellerName.toLowerCase()
  const isOwnProduct = isOwnProductByName

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 ProductActions Self-purchase check:', {
      userFullName: userFullName,
      sellerName: sellerName,
      isOwnProductByName: isOwnProductByName,
      isOwnProduct: isOwnProduct,
      willBlock: isOwnProduct ? 'YES - BLOCKING PURCHASE' : 'NO - allowing purchase',
      maxQuantity,
      isOutOfStock,
    })
  }

  const sanitizePrice = (p: string | number): number => {
    if (typeof p === 'number') return p
    const numeric = parseFloat(p.replace(/[^0-9.-]+/g, ''))
    return isNaN(numeric) ? 0 : numeric
  }

  const handleAddToCart = async () => {
    // Check if user is trying to buy their own item
    if (isOwnProduct) {
      toast({
        title: '🚫 Cannot Purchase Your Own Item',
        description:
          'You cannot add your own listed items to the cart. Please browse other products from the community!',
        variant: 'default',
      })
      return
    }

    if (isOutOfStock) {
      toast({
        title: 'Out of Stock',
        description: 'This item is currently out of stock.',
        variant: 'destructive',
      })
      return
    }

    if (!checkVerification('buy')) return

    // Validate productId before proceeding
    if (!productId || typeof productId !== 'number' || productId <= 0) {
      console.error('❌ Invalid productId:', productId)
      toast({
        title: 'Error',
        description: 'Invalid product ID. Please refresh the page and try again.',
        variant: 'destructive',
      })
      return
    }

    console.log('🛒 Adding to cart - ProductId:', productId, 'Type:', typeof productId)

    setIsLoading(true)
    try {
      const cartItem = productToCartItem({
        id: productId,
        title: productTitle,
        price: sanitizePrice(productPrice),
        image: productImage,
        condition: productCondition,
        expatId: expatId,
        expatName: sellerName,
        category: category,
        location: productLocation,
        verified: verifiedSeller,
        currency: currency,
      })

      await addToCart(cartItem, quantity)

      toast({
        title: 'Added to cart',
        description: `${productTitle} has been added to your cart`,
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuy = async () => {
    // Check if user is trying to buy their own item
    if (isOwnProduct) {
      toast({
        title: '🚫 Cannot Purchase Your Own Item',
        description:
          'You cannot buy your own listed items. Please browse other products from the community!',
        variant: 'default',
      })
      return
    }

    if (isOutOfStock) {
      toast({
        title: 'Out of Stock',
        description: 'This item is currently out of stock.',
        variant: 'destructive',
      })
      return
    }

    if (!checkVerification('buy')) return

    // Validate productId before proceeding
    if (!productId || typeof productId !== 'number' || productId <= 0) {
      console.error('❌ Invalid productId:', productId)
      toast({
        title: 'Error',
        description: 'Invalid product ID. Please refresh the page and try again.',
        variant: 'destructive',
      })
      return
    }

    console.log('🛒 Buy Now - ProductId:', productId, 'Type:', typeof productId)

    setIsLoading(true)
    try {
      const cartItem = productToCartItem({
        id: productId,
        title: productTitle,
        price: sanitizePrice(productPrice),
        image: productImage,
        condition: productCondition,
        expatId: expatId,
        expatName: sellerName,
        category: category,
        location: productLocation,
        verified: verifiedSeller,
        currency: currency,
      })

      await addToCart(cartItem, quantity)

      toast({
        title: 'Proceeding to checkout',
        description: `${productTitle} has been added to your cart`,
      })
      router.push('/checkout')
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Removed Contact Seller in favor of dedicated Message button on product page

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Quantity</span>
        <div className="flex items-center border border-gray-300 rounded-lg">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-l-lg rounded-r-none hover:bg-gray-100"
            onClick={decrementQuantity}
            disabled={quantity <= 1 || isLoading || isOutOfStock}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="w-12 text-center text-sm font-semibold">
            {isOutOfStock ? 0 : quantity}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-r-lg rounded-l-none hover:bg-gray-100"
            onClick={incrementQuantity}
            disabled={
              quantity >= (maxQuantity !== undefined ? Math.min(maxQuantity, 10) : 10) ||
              isLoading ||
              isOutOfStock
            }
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-2 sm:space-y-3">
        <Button
          onClick={handleAddToCart}
          disabled={isLoading || isOutOfStock}
          className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white rounded-full h-11 sm:h-12 text-sm sm:text-base font-medium disabled:bg-neutral-300"
        >
          {isLoading ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
        <Button
          onClick={handleBuy}
          disabled={isLoading || isOutOfStock}
          variant="secondary"
          className="w-full bg-amber-600 hover:bg-amber-700 text-black rounded-full h-11 sm:h-12 text-sm sm:text-base font-medium disabled:bg-neutral-300 disabled:text-neutral-500"
        >
          {isLoading ? 'Processing...' : isOutOfStock ? 'Out of Stock' : 'Buy Now'}
        </Button>
        <VerificationPopup
          isOpen={isVerificationPopupOpen}
          onClose={closeVerificationPopup}
          action={currentAction || 'buy'}
        />
      </div>
    </div>
  )
}
