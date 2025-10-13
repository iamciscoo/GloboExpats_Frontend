/**
 * Example Cart Usage Component
 *
 * This component demonstrates how to use the cart functionality
 * with the backend API integration.
 */

'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react'
import { productToCartItem, formatCurrency } from '@/lib/cart-utils'

interface Product {
  id: number
  title: string
  price: number
  image: string
  currency: string
}

export function CartExample() {
  const { addToCart, removeFromCart, updateQuantity, cart, isLoading } = useCart()
  const { isLoggedIn } = useAuth()
  const [exampleProduct] = useState<Product>({
    id: 11,
    title: 'Macbook 2020 air',
    price: 2355555,
    image: '/placeholder.svg',
    currency: 'TZS',
  })

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast({
        title: 'Login Required',
        description: 'Please login to add items to your cart.',
        variant: 'destructive',
      })
      return
    }

    // Convert to CartItem format using utility function
    const cartItem = productToCartItem({
      id: exampleProduct.id,
      title: exampleProduct.title,
      price: exampleProduct.price,
      image: exampleProduct.image,
      currency: exampleProduct.currency,
      expatId: 'example-expat',
      expatName: 'John Doe',
      category: 'electronics',
      location: 'Dar es Salaam',
      verified: true,
      condition: 'used',
    })

    await addToCart(cartItem, 1)
  }

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    await updateQuantity(itemId, newQuantity)
  }

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId)
  }

  if (!isLoggedIn) {
    return (
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Cart Example</h3>
        <p className="text-muted-foreground">Please login to test cart functionality.</p>
      </div>
    )
  }

  return (
    <div className="p-6 border rounded-lg space-y-6">
      <h3 className="text-lg font-semibold">Cart Integration Example</h3>

      {/* Example Product */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center space-x-4">
          <img
            src={exampleProduct.image}
            alt={exampleProduct.title}
            className="w-16 h-16 object-cover rounded"
          />
          <div>
            <h4 className="font-medium">{exampleProduct.title}</h4>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(exampleProduct.price, exampleProduct.currency)}
            </p>
          </div>
        </div>
        <Button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add to Cart</span>
        </Button>
      </div>

      {/* Current Cart Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Current Cart</h4>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <ShoppingCart className="w-4 h-4" />
            <span>{cart.itemCount} items</span>
          </Badge>
        </div>

        {cart.items.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Your cart is empty</p>
        ) : (
          <div className="space-y-2">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image || '/placeholder.svg'}
                    alt={item.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <h5 className="font-medium text-sm">{item.title}</h5>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.price, item.currency)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    disabled={isLoading || item.quantity <= 1}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>

                  <span className="px-3 py-1 bg-muted rounded text-sm">{item.quantity}</span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
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
            ))}

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="font-bold">
                  {formatCurrency(cart.subtotal, cart.items[0]?.currency || 'TZS')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Updating cart...</p>
        </div>
      )}
    </div>
  )
}
