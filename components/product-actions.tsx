'use client'

import { useVerification } from '@/hooks/use-verification'
import { VerificationPopup } from '@/components/verification-popup'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { productToCartItem } from '@/lib/cart-utils'
import { useState } from 'react'

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
}: ProductActionsProps) {
  const { checkVerification, isVerificationPopupOpen, currentAction, closeVerificationPopup } =
    useVerification()
  const { addToCart } = useCart()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const sanitizePrice = (p: string | number): number => {
    if (typeof p === 'number') return p
    const numeric = parseFloat(p.replace(/[^0-9.-]+/g, ''))
    return isNaN(numeric) ? 0 : numeric
  }

  const handleAddToCart = async () => {
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

      await addToCart(cartItem)

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

      await addToCart(cartItem)

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
    <div className="space-y-2 sm:space-y-3">
      <Button
        onClick={handleAddToCart}
        disabled={isLoading}
        className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white rounded-full h-11 sm:h-12 text-sm sm:text-base font-medium"
      >
        {isLoading ? 'Adding...' : 'Add to Cart'}
      </Button>
      <Button
        onClick={handleBuy}
        disabled={isLoading}
        variant="secondary"
        className="w-full bg-amber-600 hover:bg-amber-700 text-black rounded-full h-11 sm:h-12 text-sm sm:text-base font-medium"
      >
        {isLoading ? 'Processing...' : 'Buy Now'}
      </Button>
      <VerificationPopup
        isOpen={isVerificationPopupOpen}
        onClose={closeVerificationPopup}
        action={currentAction || 'buy'}
      />
    </div>
  )
}
