'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  ShoppingCart,
  Trash2,
  MessageCircle,
  Shield,
  ArrowRight,
  ShoppingBag,
  Star,
  MapPin,
  Minus,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { useCart } from '@/hooks/use-cart'
import { cleanLocationString } from '@/lib/image-utils'
import PriceDisplay from '@/components/price-display'

export default function CartPage() {
  const {
    items,
    itemCount,
    isEmpty,
    removeFromCart,
    clearCart,
    selectedItems,
    selectedSubtotal,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    updateQuantity,
  } = useCart()

  // Final total is simply the selected subtotal (using asking price only)
  const finalTotal = selectedSubtotal

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
    <div className="min-h-screen bg-neutral-50 pt-16 md:pt-20">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-4 md:py-6 pb-20 sm:pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Clean Header */}
          <div className="mb-2.5 sm:mb-3 md:mb-4">
            <div className="flex items-center justify-between">
              <h1 className="text-base sm:text-lg md:text-xl font-semibold text-neutral-900">
                Shopping Cart
              </h1>
              <Badge className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </Badge>
            </div>
          </div>

          {/* Cart Content */}
          <div className="flex flex-col lg:flex-row gap-2.5 sm:gap-3 lg:gap-6">
            <div className="flex-1">
              {/* Cart Actions */}
              <div className="flex items-center justify-between mb-2 sm:mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedItems.length === items.length}
                    onCheckedChange={handleSelectAll}
                    className="data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                  />
                  <span className="text-xs sm:text-sm font-medium text-neutral-700">
                    Select All ({selectedItems.length} of {items.length})
                  </span>
                </div>
                {items.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearCart()}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 text-xs sm:text-sm h-8"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Clear All</span>
                    <span className="sm:hidden">Clear</span>
                  </Button>
                )}
              </div>

              {/* Cart Items */}
              <div className="space-y-2 sm:space-y-2.5 lg:space-y-3">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className="shadow-sm border border-neutral-200 rounded-lg overflow-hidden"
                  >
                    <CardContent className="p-2 sm:p-2.5 md:p-4 lg:p-6">
                      {/* Mobile Layout (< md) */}
                      <div className="md:hidden">
                        {/* Top Row: Checkbox, Image, Title & Price */}
                        <div className="flex items-start gap-2">
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={(checked) =>
                              handleItemSelection(item.id, checked as boolean)
                            }
                            className="mt-0.5 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                          />

                          <div className="relative w-16 h-16 bg-neutral-100 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-xs leading-tight text-neutral-900 line-clamp-2 mb-1">
                              {item.title}
                            </h3>
                            <div className="text-sm font-bold text-neutral-900 mb-1">
                              <PriceDisplay
                                price={item.price}
                                size="sm"
                                weight="bold"
                                showOriginal
                              />
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                              <Badge
                                variant="outline"
                                className="text-[9px] border-neutral-300 text-neutral-600 px-1 py-0 h-4"
                              >
                                {item.condition}
                              </Badge>
                              {item.verified && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] border-green-200 text-green-700 bg-green-50 px-1 py-0 h-4"
                                >
                                  <Shield className="w-2 h-2 mr-0.5" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Second Row: Location & Contact */}
                        <div className="mt-1.5 flex items-center justify-between pl-[30px]">
                          <div className="flex items-center text-[10px] text-neutral-600">
                            <MapPin className="w-2.5 h-2.5 mr-0.5" />
                            {cleanLocationString(item.location)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-brand-primary hover:bg-brand-primary/5 px-1.5 h-6 text-[10px]"
                          >
                            <MessageCircle className="w-2.5 h-2.5 mr-0.5" />
                            Contact
                          </Button>
                        </div>

                        {/* Third Row: Remove Button */}
                        <div className="mt-1.5 flex items-center justify-end pl-[30px]">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-1.5 text-[10px]"
                          >
                            <Trash2 className="w-3 h-3 mr-0.5" />
                            Remove
                          </Button>
                        </div>

                        {/* Quantity Control (Mobile) */}
                        <div className="mt-2 pl-[30px] flex items-center gap-2">
                          <div className="flex items-center border border-neutral-200 rounded-md bg-white">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-none"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-xs font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-none"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= 10}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Tablet & Desktop Layout (>= md) */}
                      <div className="hidden md:flex items-start gap-3 lg:gap-6">
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) =>
                            handleItemSelection(item.id, checked as boolean)
                          }
                          className="mt-2 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                        />

                        <div className="relative w-20 h-20 lg:w-24 lg:h-24 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base lg:text-lg text-neutral-900 line-clamp-2 mb-2">
                                {item.title}
                              </h3>

                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs border-neutral-300 text-neutral-600"
                                >
                                  {item.condition}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-xs border-neutral-300 text-neutral-600"
                                >
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {cleanLocationString(item.location)}
                                </Badge>
                                {item.verified && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-green-200 text-green-700 bg-green-50"
                                  >
                                    <Shield className="w-3 h-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-brand-primary hover:bg-brand-primary/5 px-0 text-sm h-auto py-1"
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Contact Seller
                              </Button>
                            </div>

                            <div className="flex flex-col items-end gap-3">
                              <div className="text-lg lg:text-xl font-bold text-neutral-900">
                                <PriceDisplay
                                  price={item.price * item.quantity}
                                  size="lg"
                                  weight="bold"
                                  showOriginal
                                />
                                {item.quantity > 1 && (
                                  <div className="text-xs font-normal text-neutral-500 text-right mt-1">
                                    <PriceDisplay price={item.price} size="sm" /> each
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center border border-neutral-200 rounded-md bg-white">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-none"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-10 text-center text-sm font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-none"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= 10}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm h-auto py-1 px-2"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
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

            {/* Checkout Sidebar */}
            <div className="lg:w-80">
              <Card className="sticky top-16 sm:top-20 shadow-sm border border-neutral-200 rounded-lg overflow-hidden">
                <CardHeader className="bg-neutral-50 border-b border-neutral-200 p-3 sm:p-4">
                  <CardTitle className="text-base sm:text-lg font-semibold text-neutral-900">
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                  {/* Order Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-600">
                        Subtotal ({selectedItems.length})
                      </span>
                      <span className="text-sm font-semibold text-neutral-900">
                        <PriceDisplay price={selectedSubtotal} size="sm" />
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-600">Delivery</span>
                      <span className="text-xs text-neutral-600">At checkout</span>
                    </div>
                  </div>

                  <Separator className="bg-neutral-200" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base font-semibold text-neutral-900">
                      Total
                    </span>
                    <span className="text-base sm:text-lg font-bold text-neutral-900">
                      <PriceDisplay price={finalTotal} size="lg" weight="bold" />
                    </span>
                  </div>

                  <Link href="/checkout">
                    <Button
                      size="lg"
                      className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 rounded-lg text-sm"
                      disabled={selectedItems.length === 0}
                    >
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>

                  <p className="text-center text-[10px] text-neutral-500">
                    Secure checkout with buyer protection
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
