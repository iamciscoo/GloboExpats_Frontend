'use client'

import { useVerification } from '@/hooks/use-verification'
import { VerificationPopup } from '@/components/verification-popup'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

interface ProductActionsProps {
  sellerName?: string
  productTitle?: string
  productPrice?: string | number
  productImage?: string
  productCondition?: string
  productLocation?: string
  verifiedSeller?: boolean
}

export function ProductActions({
  sellerName = 'Seller',
  productTitle = 'item',
  productPrice = 0,
  productImage = '/placeholder.svg',
  productCondition = 'new',
  productLocation = '',
  verifiedSeller = true,
}: ProductActionsProps) {
  const { checkVerification, isVerificationPopupOpen, currentAction, closeVerificationPopup } =
    useVerification()
  const { addToCart } = useCart()
  const router = useRouter()
  const { toast } = useToast()

  const sanitizePrice = (p: string | number): number => {
    if (typeof p === 'number') return p
    const numeric = parseFloat(p.replace(/[^0-9.-]+/g, ''))
    return isNaN(numeric) ? 0 : numeric
  }

  const handleAddToCart = () => {
    if (!checkVerification('buy')) return

    const newItem = {
      id: `cart-${Date.now()}`,
      title: productTitle,
      price: sanitizePrice(productPrice),
      originalPrice: undefined as any,
      image: productImage,
      condition: productCondition,
      expatId: '',
      expatName: sellerName,
      category: '',
      location: productLocation,
      verified: verifiedSeller,
    }
    addToCart(newItem, 1)
    toast({
      title: 'Added to cart',
      description: `${productTitle} has been added to your cart`,
    })
  }

  const handleBuy = () => {
    if (checkVerification('buy')) {
      const newItem = {
        id: `buy-${Date.now()}`,
        title: productTitle,
        price: sanitizePrice(productPrice),
        originalPrice: undefined as any,
        image: productImage,
        condition: productCondition,
        expatId: '',
        expatName: sellerName,
        category: '',
        location: productLocation,
        verified: verifiedSeller,
      }
      addToCart(newItem, 1)
      // also write immediately to localStorage so the checkout page sees it on first load
      try {
        const existing = JSON.parse(localStorage.getItem('expat-cart') || '{}')
        const items = existing.items || []
        localStorage.setItem('expat-cart', JSON.stringify({ items: [...items, newItem] }))
      } catch (error) {
        console.error('Failed to save to localStorage:', error)
      }

      toast({
        title: 'Proceeding to checkout',
        description: `${productTitle} has been added to your cart`,
      })
      router.push('/checkout')
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
        className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white"
      >
        Add to Cart
      </Button>
      <Button
        onClick={handleBuy}
        variant="secondary"
        className="w-full bg-amber-600 hover:bg-amber-700 text-black"
      >
        Buy Now
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
