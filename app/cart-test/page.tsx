/**
 * Cart Testing Page
 *
 * This page allows testing of the cart API integration
 */

import { CartExample } from '@/components/cart-example'

export default function CartTestPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Cart API Testing</h1>
        <p className="text-muted-foreground mt-2">
          Test the cart functionality with backend integration
        </p>
      </div>

      <CartExample />

      <div className="mt-8 p-6 border rounded-lg bg-muted/50">
        <h3 className="text-lg font-semibold mb-4">API Endpoints Implemented</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Add to Cart</h4>
            <code className="block bg-background p-2 rounded text-xs">
              POST /api/v1/cart/add
              <br />
              {`{ "productId": 11, "quantity": 1 }`}
            </code>
          </div>

          <div>
            <h4 className="font-medium mb-2">Get User Cart</h4>
            <code className="block bg-background p-2 rounded text-xs">GET /api/v1/cart/User</code>
          </div>

          <div>
            <h4 className="font-medium mb-2">Update Cart Item</h4>
            <code className="block bg-background p-2 rounded text-xs">
              PUT /api/v1/cart/item/{`{cartId}`}
              <br />
              {`{ "productId": 11, "quantity": 2 }`}
            </code>
          </div>

          <div>
            <h4 className="font-medium mb-2">Remove from Cart</h4>
            <code className="block bg-background p-2 rounded text-xs">
              DELETE /api/v1/cart/item/{`{itemId}`}
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
