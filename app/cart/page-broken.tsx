'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  Shield,
  ArrowRight,
  ShoppingBag,
  Star,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'

export default function CartPage() {
  const {
    items,
    itemCount,
    isEmpty,
    updateQuantity,
    removeFromCart,
    clearCart,
    selectedItems,
    selectedSubtotal,
    selectedSavings,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
  } = useCart()

  const { isVerifiedBuyer } = useAuth()

  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)

  // Apply promo code (mock functionality)
  const applyPromoCode = () => {
    const validPromoCodes: Record<string, number> = {
      expat10: 0.1,
      welcome5: 0.05,
      eastafrica15: 0.15,
      kenya20: 0.2,
    }

    const discount = validPromoCodes[promoCode.toLowerCase()]
    if (discount) {
      setPromoDiscount(selectedSubtotal * discount)
    } else {
      setPromoDiscount(0)
    }
  }

  const finalTotal = selectedSubtotal - promoDiscount

  // Currency formatter for East African currencies
  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`
  }

  // Handle item selection for bulk operations
  const handleItemSelection = (itemId: string, _checked: boolean) => {
    toggleItemSelection(itemId)
  }

  // Select/deselect all items
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      selectAllItems()
    } else {
      deselectAllItems()
    }
  }

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-surface-secondary to-neutral-100">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Modern Empty State Icon */}
            <div className="relative w-40 h-40 mx-auto mb-12">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 rounded-3xl rotate-6 animate-pulse"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-brand-primary to-brand-accent rounded-3xl flex items-center justify-center shadow-futuristic">
                <ShoppingBag className="w-20 h-20 text-white" />
              </div>
            </div>

            {/* Modern Typography */}
            <h1 className="text-6xl font-display font-bold text-neutral-900 mb-6 tracking-tight">
              Your Cart is{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">
                Empty
              </span>
            </h1>
            <p className="text-xl text-neutral-600 mb-16 max-w-2xl mx-auto leading-relaxed">
              Discover amazing products from verified sellers in the global expat community
            </p>

            {/* Modern Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              <Link href="/browse">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-brand-primary to-brand-accent hover:from-brand-primary/90 hover:to-brand-accent/90 text-white font-semibold px-10 py-4 rounded-2xl shadow-futuristic hover:shadow-card-hover transition-all duration-300 transform hover:scale-105 border-0"
                >
                  <ShoppingCart className="mr-3 h-5 w-5" />
                  Start Shopping
                </Button>
              </Link>
              <Link href="/browse?category=featured">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-brand-primary hover:text-brand-primary font-semibold px-10 py-4 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <Star className="mr-3 h-5 w-5" />
                  Browse Featured
                </Button>
              </Link>
            </div>

            {/* Modern Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group p-8 bg-surface-elevated rounded-3xl shadow-card-modern hover:shadow-futuristic transition-all duration-300 border border-neutral-200 hover:border-brand-primary/20">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-brand-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-3 text-neutral-900">
                  Verified Sellers
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  Buy with confidence from verified expat community members
                </p>
              </div>
              <div className="group p-8 bg-surface-elevated rounded-3xl shadow-card-modern hover:shadow-futuristic transition-all duration-300 border border-neutral-200 hover:border-status-success/20">
                <div className="w-16 h-16 bg-gradient-to-br from-status-success/10 to-status-success/5 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-8 h-8 text-status-success" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-3 text-neutral-900">
                  Direct Communication
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  Chat directly with sellers for questions and details
                </p>
              </div>
              <div className="group p-8 bg-surface-elevated rounded-3xl shadow-card-modern hover:shadow-futuristic transition-all duration-300 border border-neutral-200 hover:border-brand-secondary/20">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/5 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-8 h-8 text-brand-secondary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-3 text-neutral-900">
                  Local Pickup
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  Meet locally for safe and convenient transactions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-surface-secondary to-neutral-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Modern Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-accent rounded-2xl flex items-center justify-center shadow-futuristic">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-display font-bold text-neutral-900 tracking-tight">
                  Shopping Cart
                </h1>
                <p className="text-xl text-neutral-600 mt-2">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} ready for checkout
                </p>
              </div>
            </div>
          </div>

          {/* Cart Content */}
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1">
              {/* Cart Actions */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-brand-primary/10 text-brand-primary border-brand-primary/20">
                    {selectedItems.length} of {items.length} selected
                  </Badge>
                </div>
                {items.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearCart()}
                    className="text-status-error hover:text-status-error hover:bg-status-error/5 border-status-error/20 hover:border-status-error/40 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>

              {/* Select All */}
              <div className="bg-surface-elevated rounded-2xl p-6 mb-6 border border-neutral-200 shadow-card-modern">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedItems.length === items.length}
                    onCheckedChange={handleSelectAll}
                    className="data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                  />
                  <span className="font-medium text-neutral-900">
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex flex-col items-end gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-neutral-900">
                    {formatCurrency(item.price)}
                  </div>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <div className="text-sm text-neutral-500 line-through">
                      {formatCurrency(item.originalPrice)}
                    </div>
                  )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 bg-neutral-100 rounded-xl p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="w-8 h-8 p-0 hover:bg-neutral-200"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 p-0 hover:bg-neutral-200"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromCart(item.id)}
                  className="text-status-error hover:text-status-error hover:bg-status-error/5"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>

{/* Modern Checkout Sidebar */}
<div className="lg:w-96">
  <Card className="sticky top-8 shadow-futuristic border border-neutral-200 rounded-3xl overflow-hidden">
    <CardHeader className="bg-gradient-to-r from-brand-primary to-brand-accent text-white p-8">
      <CardTitle className="text-2xl font-display font-bold">Order Summary</CardTitle>
    </CardHeader>
    <CardContent className="p-8 space-y-6">
      {/* Promo Code */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-neutral-700">Promo Code</label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="rounded-xl border-neutral-300 focus:border-brand-primary focus:ring-brand-primary/20"
          />
          <Button
            onClick={applyPromoCode}
            variant="outline"
            className="rounded-xl border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  )
}
