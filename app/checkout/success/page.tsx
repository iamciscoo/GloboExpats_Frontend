'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import {
  CheckCircle2,
  Package,
  Calendar,
  MapPin,
  ArrowRight,
  Home,
  Copy,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/hooks/use-cart'

interface OrderData {
  id: string
  status: string
  date: string
  estimatedDelivery: string
  total: number
  currency: string
  paymentMethod: string
  items: Array<{
    id: string
    title: string
    price: number
    quantity: number
    image: string
    seller: string
    sellerVerified: boolean
  }>
  shippingAddress: {
    name: string
    address: string
    city: string
    country: string
    state?: string
    zip?: string
  }
  shippingMethod?: string
  expectedContactTime?: string
  notifications?: {
    sellerNotified: boolean
    sellerNotifiedAt: string
    buyerNotified: boolean
    teamNotified: boolean
  }
  sellerDetails?: {
    name: string
    email?: string
    phone?: string
    verified?: boolean
    notified?: boolean
    message?: string
  }
  sellers?: Array<{
    name: string
    email: string
    phone: string
    address?: string
    orderId?: string
  }>
}

function CheckoutSuccessContent() {
  const { clearCart } = useCart()
  const searchParams = useSearchParams()
  const [copied, setCopied] = useState(false)
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Try to get order data from URL params or localStorage
    const orderId = searchParams.get('orderId')

    if (orderId) {
      try {
        // Get order data from localStorage
        const storedOrder = localStorage.getItem(`order_${orderId}`)

        if (storedOrder) {
          const parsedOrder = JSON.parse(storedOrder)
          setOrderData(parsedOrder)

          // Clear cart after successfully loading order data
          const shouldClearCart = localStorage.getItem('clearCartAfterOrder')
          if (shouldClearCart === 'true') {
            clearCart()
            localStorage.removeItem('clearCartAfterOrder')
            console.log('✅ Cart cleared after successful order')
          }
        } else {
          // Try to get from lastOrderId as fallback
          const lastOrderId = localStorage.getItem('lastOrderId')
          if (lastOrderId === orderId) {
            const lastOrder = localStorage.getItem(`order_${lastOrderId}`)
            if (lastOrder) {
              setOrderData(JSON.parse(lastOrder))
              // Clear cart for fallback case too
              const shouldClearCart = localStorage.getItem('clearCartAfterOrder')
              if (shouldClearCart === 'true') {
                clearCart()
                localStorage.removeItem('clearCartAfterOrder')
              }
            } else {
              setError('Order data not found. It may have expired.')
            }
          } else {
            setError('Order not found. Please check your order history.')
          }
        }
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to load order from storage:', err)
        setError('Failed to load order details')
        setIsLoading(false)
      }
    } else {
      setError('No order information found')
      setIsLoading(false)
    }
  }, [searchParams, clearCart])

  const copyOrderNumber = () => {
    if (orderData?.id) {
      navigator.clipboard.writeText(orderData.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-800 mb-2">Order Not Found</h1>
            <p className="text-lg text-neutral-600 mb-8">
              {error || "We couldn't find the order details you're looking for."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/expat/dashboard?tab=orders">
                  <Package className="w-5 h-5 mr-2" />
                  View All Orders
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/">
                  <Home className="w-5 h-5 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps - Step 4 Highlighted */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-6 sm:mb-8">
              <h1 className="text-lg sm:text-2xl font-semibold text-neutral-900">Checkout</h1>
            </div>

            {/* Progress Steps */}
            <div className="flex items-start justify-center">
              {[
                { number: 1, label: 'Shipping' },
                { number: 2, label: 'Payment' },
                { number: 3, label: 'Review' },
                { number: 4, label: 'Complete' },
              ].map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    {/* Circle */}
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-medium transition-all text-sm sm:text-base ${
                        step.number <= 4
                          ? 'bg-brand-primary text-white'
                          : 'bg-neutral-200 text-neutral-500'
                      }`}
                    >
                      {step.number}
                    </div>
                    {/* Label */}
                    <span
                      className={`mt-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                        4 >= step.number ? 'text-brand-primary' : 'text-neutral-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {/* Connecting Line */}
                  {index < 3 && (
                    <div
                      className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 mb-6 ${
                        step.number < 4 ? 'bg-brand-primary' : 'bg-neutral-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Success Header - Compact */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Order Confirmed!</h1>
            <p className="text-sm text-neutral-600">
              Order #{orderData.id.split('-')[1]} • {orderData.shippingAddress.city}
            </p>
          </div>

          {/* Next Steps - Priority (shown first) */}
          <Card className="mb-6 border border-neutral-200">
            <CardHeader className="bg-neutral-50 border-b border-neutral-200 py-4">
              <CardTitle className="text-lg sm:text-xl font-semibold text-neutral-900">
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {orderData.shippingMethod === 'delivery' ? (
                <div className="rounded-lg border-2 border-neutral-200 border-l-4 border-l-blue-600 bg-white p-4 shadow-sm">
                  <p className="text-sm sm:text-base font-medium text-neutral-900">
                    Order created. Seller notified. Our team will handle payment and delivery
                    arrangements.
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                    Expected contact: {orderData.expectedContactTime || 'within 24 hours'}. Keep
                    your phone accessible.
                  </p>
                </div>
              ) : (
                <>
                  <div className="rounded-lg border-2 border-neutral-200 border-l-4 border-l-blue-600 bg-white p-4 shadow-sm">
                    <p className="text-sm sm:text-base font-medium text-neutral-900">
                      Order created. Seller notified. Contact the seller to arrange meeting and
                      payment.
                    </p>
                  </div>
                  {/* Multi-seller display */}
                  {orderData.sellers && orderData.sellers.length > 0 && (
                    <div className="space-y-4">
                      {orderData.sellers.map((seller, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border-2 border-neutral-200 border-l-4 border-l-blue-600 bg-white p-4 shadow-sm"
                        >
                          <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                            Seller Contact Information{' '}
                            {orderData.sellers!.length > 1 ? `#${idx + 1}` : ''}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                            <div>
                              <div className="text-[11px] font-semibold text-neutral-500 uppercase mb-1 tracking-wide">
                                Name
                              </div>
                              <div className="font-semibold text-neutral-900">{seller.name}</div>
                            </div>
                            {seller.email && (
                              <div>
                                <div className="text-[11px] font-semibold text-neutral-500 uppercase mb-1 tracking-wide">
                                  Email
                                </div>
                                <div className="text-sm font-medium text-blue-600 break-all">
                                  {seller.email}
                                </div>
                              </div>
                            )}
                            {seller.phone && (
                              <div>
                                <div className="text-[11px] font-semibold text-neutral-500 uppercase mb-1 tracking-wide">
                                  Phone
                                </div>
                                <div className="text-sm font-semibold text-green-700">
                                  {seller.phone}
                                </div>
                              </div>
                            )}
                          </div>
                          {seller.address && seller.address !== 'Not Listed' && (
                            <div className="mt-3 pt-2 border-t border-neutral-100">
                              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                                Meeting Location:
                              </span>{' '}
                              <span className="text-sm text-neutral-800">{seller.address}</span>
                            </div>
                          )}
                        </div>
                      ))}
                      <p className="text-xs text-neutral-600 mt-2 italic">
                        Tip: Contact each seller to arrange convenient meeting times and locations.
                      </p>
                    </div>
                  )}

                  {/* Fallback to single sellerDetails if no sellers array */}
                  {!orderData.sellers && orderData.sellerDetails && (
                    <div className="rounded-lg border-2 border-neutral-200 border-l-4 border-l-blue-600 bg-white p-4 shadow-sm">
                      <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                        Seller Contact Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <div className="text-[11px] font-semibold text-neutral-500 uppercase mb-1 tracking-wide">
                            Name
                          </div>
                          <div className="font-semibold text-neutral-900">
                            {orderData.sellerDetails.name}
                          </div>
                        </div>
                        {orderData.sellerDetails.email && (
                          <div>
                            <div className="text-[11px] font-semibold text-neutral-500 uppercase mb-1 tracking-wide">
                              Email
                            </div>
                            <a
                              href={`mailto:${orderData.sellerDetails.email}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 underline break-all"
                            >
                              {orderData.sellerDetails.email}
                            </a>
                          </div>
                        )}
                        {orderData.sellerDetails.phone && (
                          <div>
                            <div className="text-[11px] font-semibold text-neutral-500 uppercase mb-1 tracking-wide">
                              Phone
                            </div>
                            <a
                              href={`tel:${orderData.sellerDetails.phone}`}
                              className="text-sm font-semibold text-green-700 hover:text-green-900"
                            >
                              {orderData.sellerDetails.phone}
                            </a>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 mt-3 italic">
                        Tip: Call or email the seller to arrange a convenient meeting time and
                        location.
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Order Details Card */}
          <Card className="mb-8 border border-neutral-200">
            <CardHeader className="bg-neutral-50 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Package className="w-6 h-6 text-green-600" />
                    Order Details
                  </CardTitle>
                  <div className="space-y-3 mt-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-neutral-600 font-medium">Order Number:</span>
                      <code className="bg-white px-3 py-2 rounded-lg border-2 font-mono text-base font-bold text-green-700">
                        {orderData.id}
                      </code>
                      <Button variant="ghost" size="sm" onClick={copyOrderNumber} className="h-8">
                        {copied ? '✓ Copied!' : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-neutral-600">Need help or have a dispute?</span>
                      <Link
                        href="/contact"
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800 underline"
                      >
                        Contact Support
                      </Link>
                    </div>
                  </div>
                </div>
                <Badge className="bg-green-500 text-white text-sm px-3 py-1">
                  {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-sm text-neutral-600">Order Date</p>
                    <p className="font-medium">{new Date(orderData.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-sm text-neutral-600">Estimated Delivery</p>
                    <p className="font-medium">{orderData.estimatedDelivery}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-sm text-neutral-600">Shipping To</p>
                    <p className="font-medium">{orderData.shippingAddress.city}</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Order Items (compact, scrollable) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Items Ordered</h3>
                  <span className="text-xs text-neutral-500">{orderData.items.length} items</span>
                </div>
                <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                  {orderData.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg"
                    >
                      <div className="w-16 h-16 bg-neutral-200 rounded-lg flex-shrink-0 relative">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium line-clamp-1">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-neutral-600">Sold by: {item.seller}</p>
                          {item.sellerVerified && (
                            <Badge className="bg-green-100 text-green-800 text-xs">Verified</Badge>
                          )}
                        </div>
                        <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-base">
                          {orderData.currency} {item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Order Total */}
              <div className="bg-neutral-50 rounded-lg p-5 border border-neutral-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-base font-semibold text-neutral-700">Total Bill</span>
                  <span className="text-2xl font-bold text-neutral-900">
                    {orderData.currency} {orderData.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-600">Payment Method:</span>
                  <span className="font-medium text-neutral-800">{orderData.paymentMethod}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking removed - not supported on platform */}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/">
              <Button variant="outline" size="lg" className="min-w-[160px]">
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" className="bg-brand-primary hover:bg-blue-700 min-w-[160px]">
                Continue Shopping
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Additional Information */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <div>
                  <h4 className="font-medium mb-2">Customer Support</h4>
                  <p className="text-sm text-neutral-600 mb-3">Get help with your order</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Order History</h4>
                  <p className="text-sm text-neutral-600 mb-3">View all your past orders</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/expat/dashboard?tab=orders">View Orders</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
        <p className="text-neutral-600">Loading checkout success...</p>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
