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

    setIsLoading(true)
    try {
      const cartItem = productToCartItem({
        id: productId || Date.now(),
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

      await addToCart(cartItem, 1)

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

    setIsLoading(true)
    try {
      const cartItem = productToCartItem({
        id: productId || Date.now(),
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

      await addToCart(cartItem, 1)

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

  const handleContact = () => {
    if (checkVerification('contact')) {
      const encodedSeller = encodeURIComponent(sellerName)
      const encodedProduct = encodeURIComponent(productTitle)
      router.push(`/messages?seller=${encodedSeller}&product=${encodedProduct}`)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleAddToCart}
        disabled={isLoading}
        className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white rounded-full"
      >
        {isLoading ? 'Adding...' : 'Add to Cart'}
      </Button>
      <Button
        onClick={handleBuy}
        disabled={isLoading}
        variant="secondary"
        className="w-full bg-amber-600 hover:bg-amber-700 text-black rounded-full"
      >
        {isLoading ? 'Processing...' : 'Buy Now'}
      </Button>
      <Button onClick={handleContact} variant="outline" className="w-full">
        Contact Seller
      </Button>

      <VerificationPopup
        isOpen={isVerificationPopupOpen}
        onClose={closeVerificationPopup}
        action={currentAction || 'buy'}
      />
    </div>
  )
}
