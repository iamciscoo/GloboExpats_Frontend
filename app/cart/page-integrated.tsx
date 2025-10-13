/**
 * Integrated Cart Page
 * 
 * Complete cart management interface with backend API integration
 */

'use client'

import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency } from '@/lib/cart-utils'

export default function IntegratedCartPage() {
  const {
    items,
    itemCount,
    subtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    isLoading,
    isEmpty,
    currency = 'TZS'
  } = useCart()
  
  const { isLoggedIn, user } = useAuth()

  const handleQuantityUpdate = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(itemId)
      return
    }

    await updateQuantity(itemId, newQuantity)
  }

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId)
  }

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart()
    }
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="container mx-auto py-16 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Login Required</h1>
        <p className="text-muted-foreground mb-6">
          Please login to view and manage your cart.
        </p>
        <Link href="/login">
          <Button>Login to Continue</Button>
        </Link>
      </div>
    )
  }

  // Empty cart state
  if (isEmpty && !isLoading) {
    return (
      <div className="container mx-auto py-16 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">
          Start shopping to add items to your cart.
        </p>
        <Link href="/browse">
          <Button>
            Browse Products
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-16">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          
          {!isEmpty && (
            <Button variant="outline" onClick={handleClearCart} disabled={isLoading}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cart
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={item.image || '/placeholder.svg'}
                        alt={item.title}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg leading-tight mb-1">
                        {item.title}
                      </h3>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {item.condition}
                        </Badge>
                        {item.verified && (
                          <Badge variant="default" className="text-xs">
                            Verified Seller
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Seller: {item.expatName}</span>
                        <span>•</span>
                        <span>{item.location}</span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        {/* Price */}
                        <div>
                          <span className="text-lg font-bold">
                            {formatCurrency(item.price, item.currency)}
                          </span>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <span className="ml-2 text-sm text-muted-foreground line-through">
                              {formatCurrency(item.originalPrice, item.currency)}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                            disabled={isLoading || item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          
                          <span className="px-3 py-1 bg-muted rounded text-sm font-medium">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                            disabled={isLoading}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="mt-2 text-right">
                        <span className="text-sm text-muted-foreground">Subtotal: </span>
                        <span className="font-semibold">
                          {formatCurrency(item.price * item.quantity, item.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Items ({itemCount})</span>
                  <span>{formatCurrency(subtotal, currency)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(subtotal, currency)}</span>
                </div>

                <div className="space-y-2 pt-4">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <Link href="/browse">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>

                {/* Additional Info */}
                <div className="pt-4 text-xs text-muted-foreground space-y-1">
                  <p>• Free shipping on all orders</p>
                  <p>• Secure payment processing</p>
                  <p>• 30-day return policy</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
````

<function_calls>
<invoke name="replace_string_in_file">
<parameter name="filePath">d:\2025 projects\React\ExpatFrontend-main\components\cart-example.tsx