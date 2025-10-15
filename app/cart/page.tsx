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
import { cleanLocationString } from '@/lib/image-utils'

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
      <div className="min-h-screen bg-neutral-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            {/* Clean Empty State Icon */}
            <div className="w-32 h-32 mx-auto mb-8 bg-neutral-100 rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-neutral-400" />
            </div>

            {/* Clean Typography */}
            <h1 className="text-4xl font-semibold text-neutral-900 mb-4">Your Cart is Empty</h1>
            <p className="text-lg text-neutral-600 mb-12 max-w-lg mx-auto">
              Discover amazing products from verified sellers in the global expat community
            </p>

            {/* Clean Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/browse">
                <Button
                  size="lg"
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-3"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Start Shopping
                </Button>
              </Link>
              <Link href="/browse?category=featured">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-neutral-300 text-neutral-700 hover:bg-neutral-50 px-8 py-3"
                >
                  <Star className="mr-2 h-5 w-5" />
                  Browse Featured
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Clean Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-semibold text-neutral-900">Shopping Cart</h1>
              <div className="flex items-center gap-4">
                <Badge className="px-3 py-1 text-sm bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Cart Content */}
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1">
              {/* Cart Actions */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <Badge
                    variant="secondary"
                    className="px-4 py-2 text-sm font-medium bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                  >
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
                    Select All ({selectedItems.length} of {items.length} selected)
                  </span>
                </div>
              </div>

              {/* Cart Items */}
              <div className="space-y-6">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className="shadow-card-modern hover:shadow-futuristic transition-all duration-300 border border-neutral-200 hover:border-brand-primary/20 rounded-2xl overflow-hidden"
                  >
                    <CardContent className="p-8">
                      <div className="flex items-start gap-6">
                        {/* Selection Checkbox */}
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) =>
                            handleItemSelection(item.id, checked as boolean)
                          }
                          className="mt-2 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                        />

                        {/* Product Image */}
                        <div className="relative w-32 h-32 bg-neutral-100 rounded-2xl overflow-hidden flex-shrink-0 shadow-card">
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-display font-semibold text-xl text-neutral-900 line-clamp-2 mb-3">
                                {item.title}
                              </h3>

                              <div className="flex flex-wrap items-center gap-3 mb-4">
                                <Badge
                                  variant="outline"
                                  className="text-sm border-neutral-300 text-neutral-700"
                                >
                                  {item.condition}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-sm border-brand-primary/20 text-brand-primary bg-brand-primary/5"
                                >
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {cleanLocationString(item.location)}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-brand-primary" />
                                  </div>
                                  <span className="text-sm text-neutral-600">Verified Seller</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5"
                                >
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Contact Seller
                                </Button>
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
                                  onClick={() =>
                                    updateQuantity(item.id, Math.max(1, item.quantity - 1))
                                  }
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
            </div>

            {/* Modern Checkout Sidebar */}
            <div className="lg:w-96">
              <Card className="sticky top-8 shadow-futuristic border border-neutral-200 rounded-3xl overflow-hidden">
                <CardHeader className="bg-neutral-50 border-b border-neutral-200 text-neutral-900 p-8">
                  <CardTitle className="text-2xl font-display font-bold">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {/* Promo Code */}
                  <div className="space-y-3">
                    <label htmlFor="promo-code" className="text-sm font-medium text-neutral-700">
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="promo-code"
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

                  <Separator className="bg-neutral-200" />

                  {/* Order Details */}
                  <div className="space-y-4">
                    <div className="flex justify-between text-neutral-600">
                      <span>Subtotal ({selectedItems.length} items)</span>
                      <span>{formatCurrency(selectedSubtotal)}</span>
                    </div>
                    {selectedSavings > 0 && (
                      <div className="flex justify-between text-status-success">
                        <span>Savings</span>
                        <span>-{formatCurrency(selectedSavings)}</span>
                      </div>
                    )}
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-status-success">
                        <span>Promo Discount</span>
                        <span>-{formatCurrency(promoDiscount)}</span>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-neutral-200" />

                  <div className="flex justify-between text-xl font-bold text-neutral-900">
                    <span>Total</span>
                    <span>{formatCurrency(finalTotal)}</span>
                  </div>

                  <Link href="/checkout">
                    <Button
                      size="lg"
                      className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-4 rounded-2xl shadow-futuristic hover:shadow-card-hover transition-all duration-300 transform hover:scale-105 border-0"
                      disabled={selectedItems.length === 0}
                    >
                      <ArrowRight className="mr-2 h-5 w-5" />
                      Proceed to Checkout
                    </Button>
                  </Link>

                  <div className="text-center text-sm text-neutral-500">
                    Secure checkout with buyer protection
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
