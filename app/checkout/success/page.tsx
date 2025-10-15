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
  MessageCircle,
  Download,
  ArrowRight,
  Home,
  Share2,
  Copy,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth'

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
  }
  tracking?: {
    enabled: boolean
    number?: string
    url?: string
  }
}

function CheckoutSuccessContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [copied, setCopied] = useState(false)
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Try to get order data from URL params or localStorage
    const orderId = searchParams.get('orderId')
    const orderDataParam = searchParams.get('orderData')

    if (orderDataParam) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(orderDataParam))
        setOrderData(parsedData)
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to parse order data:', err)
        setError('Failed to load order details')
        setIsLoading(false)
      }
    } else if (orderId) {
      // Try to get from localStorage as fallback
      try {
        const storedOrder = localStorage.getItem(`order_${orderId}`)
        if (storedOrder) {
          setOrderData(JSON.parse(storedOrder))
        } else {
          // Generate fallback order data with current timestamp
          const fallbackOrder: OrderData = {
            id: orderId,
            status: 'confirmed',
            date: new Date().toISOString(),
            estimatedDelivery: '2-5 business days',
            total: 0, // Will be updated if we have cart data
            currency: 'KES',
            paymentMethod: 'M-Pesa',
            items: [],
            shippingAddress: {
              name: user?.name || 'Customer',
              address: 'Address not available',
              city: 'Nairobi',
              country: 'Kenya',
            },
            tracking: {
              enabled: true,
              number: `TRK${Date.now()}`,
            },
          }
          setOrderData(fallbackOrder)
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
  }, [searchParams, user])

  const copyOrderNumber = () => {
    if (orderData?.id) {
      navigator.clipboard.writeText(orderData.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareOrder = () => {
    if (navigator.share && orderData) {
      navigator.share({
        title: 'Order Confirmation',
        text: `My order ${orderData.id} has been confirmed!`,
        url: window.location.href,
      })
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
                <Link href="/account/orders">
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-neutral-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-neutral-800 mb-4">Order Confirmed! 🎉</h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Thank you for your purchase! Your order has been successfully placed and will be
              processed soon.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
              Order Processing Started
            </div>
          </div>

          {/* Order Details Card */}
          <Card className="mb-8 shadow-xl border-2 border-green-100">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b-2 border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Package className="w-6 h-6 text-green-600" />
                    Order Details
                  </CardTitle>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-sm text-neutral-600 font-medium">Order Number:</span>
                    <code className="bg-white px-3 py-2 rounded-lg border-2 font-mono text-base font-bold text-green-700">
                      {orderData.id}
                    </code>
                    <Button variant="ghost" size="sm" onClick={copyOrderNumber} className="h-8">
                      {copied ? '✓ Copied!' : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <Badge className="bg-green-600 text-white text-lg px-4 py-2">
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

              {/* Order Items */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Items Ordered</h3>
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
                      <p className="font-bold text-lg">AED {item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Order Total */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xl font-semibold text-neutral-800">Total Paid</span>
                  <span className="text-3xl font-bold text-green-700">
                    {orderData.currency} {orderData.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-600">Payment Method:</span>
                  <span className="font-medium text-neutral-800 flex items-center gap-1">
                    <span>📱</span> {orderData.paymentMethod}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="border-2 border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Package className="w-6 h-6" />
                  What&apos;s Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800 mb-1">Seller Confirmation</p>
                    <p className="text-sm text-neutral-600">
                      The seller will confirm your order within 2-4 hours and prepare your item for
                      delivery.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800 mb-1">Order Processing</p>
                    <p className="text-sm text-neutral-600">
                      Your item will be carefully packaged and handed to our trusted delivery
                      partner in your city.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-green-600">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800 mb-1">Delivery</p>
                    <p className="text-sm text-neutral-600">
                      Track your package and receive it within {orderData.estimatedDelivery} across
                      East Africa.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-100">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <MessageCircle className="w-6 h-6" />
                  Stay Connected
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    📱 You'll receive SMS and email updates about your order status at every step of
                    the delivery process.
                  </AlertDescription>
                </Alert>

                {orderData.tracking?.enabled && (
                  <div className="space-y-3">
                    <p className="font-semibold">📦 Track Your Order</p>
                    <div className="flex items-center gap-2 p-3 bg-neutral-50 rounded-lg border">
                      <Package className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm font-mono font-bold">
                        {orderData.tracking.number}
                      </span>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={orderData.tracking.url || '#'} target="_blank">
                        🔍 Track Package
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                )}

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/messages">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    💬 Contact Seller
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/">
              <Button variant="outline" size="lg" className="min-w-[160px]">
                <Home className="w-5 h-5 mr-2" />
                🏠 Back to Home
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" className="bg-brand-primary hover:bg-blue-700 min-w-[160px]">
                🛍️ Continue Shopping
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={shareOrder} className="min-w-[160px]">
              <Share2 className="w-5 h-5 mr-2" />
              📤 Share Order
            </Button>
          </div>

          {/* Additional Information */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <h4 className="font-medium mb-2">Customer Support</h4>
                  <p className="text-sm text-neutral-600 mb-3">Get help with your order</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/support">Contact Support</Link>
                  </Button>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Order History</h4>
                  <p className="text-sm text-neutral-600 mb-3">View all your past orders</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/orders">View Orders</Link>
                  </Button>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Download Invoice</h4>
                  <p className="text-sm text-neutral-600 mb-3">Get your receipt</p>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
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
