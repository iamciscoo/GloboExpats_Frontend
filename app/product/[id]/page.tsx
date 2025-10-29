'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Star,
  MapPin,
  Shield,
  Heart,
  ChevronLeft,
  ChevronRight,
  Truck,
  RotateCcw,
  CreditCard,
  MessageCircle,
  ExternalLink,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ProductActions } from '@/components/product-actions'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { transformBackendProduct } from '@/lib/image-utils'
import type { FeaturedItem } from '@/lib/types'
import PriceDisplay from '@/components/price-display'
import { parseNumericPrice } from '@/lib/utils'
import { handleAuthError } from '@/lib/auth-redirect'
import { toast } from '@/components/ui/use-toast'

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [product, setProduct] = useState<FeaturedItem | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rawProductData, setRawProductData] = useState<any>(null)
  const [similarProducts, setSimilarProducts] = useState<FeaturedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImage, setCurrentImage] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [sellerProfileImage, setSellerProfileImage] = useState<string | null>(null)

  // Transform backend data to FeaturedItem format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformToFeaturedItem = (item: any): FeaturedItem => {
    return transformBackendProduct(item)
  }

  // Fetch product details and similar products
  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)

        console.log('🔥 PRODUCT PAGE: Fetching product for ID:', id)

        // Use the dedicated product details endpoint - this increments view count on backend
        // Add a race condition with timeout to prevent infinite loading
        const fetchPromise = apiClient.getProductDetails(Number(id))
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Request timeout - authentication may be required')),
            15000
          )
        )

        const response = await Promise.race([fetchPromise, timeoutPromise])
        console.log('📦 PRODUCT PAGE: Product details response:', response)
        console.log('📦 PRODUCT PAGE: Response type:', typeof response)

        // Check for null or undefined response
        if (!response) {
          console.error('❌ PRODUCT PAGE: Received null/undefined response')
          throw new Error('Authentication required')
        }

        // Check if response contains HTML (auth redirect page)
        const responseStr = JSON.stringify(response)
        if (
          responseStr.includes('<!DOCTYPE html>') ||
          responseStr.includes('<html') ||
          responseStr.includes('<!doctype') ||
          responseStr.includes('<HTML')
        ) {
          console.log('🔐 PRODUCT PAGE: HTML response detected - authentication required')
          throw new Error('Authentication required')
        }

        // Check if response indicates authentication is needed
        if (typeof response === 'string' && response.toLowerCase().includes('login')) {
          console.log('🔐 PRODUCT PAGE: Login text detected in response - authentication required')
          throw new Error('Authentication required')
        }

        // Extract product data from response
        const respData = response as {
          data?: Record<string, unknown>
        } & Record<string, unknown>

        // Handle different response structures (direct vs wrapped in data)
        let productData = respData as Record<string, unknown>

        // If response is wrapped in 'data' property, unwrap it
        if (respData.data && typeof respData.data === 'object') {
          // Check if data.message contains HTML
          const dataObj = respData.data as Record<string, unknown>
          if (typeof dataObj.message === 'string' && dataObj.message.includes('<!DOCTYPE')) {
            console.log('🔐 PRODUCT PAGE: HTML in data - authentication required')
            throw new Error('Authentication required')
          }
          productData = respData.data as Record<string, unknown>
        }

        console.log('📦 PRODUCT PAGE: Processed product data:', productData)

        if (productData && (productData.productId || productData.id)) {
          console.log('📦 PRODUCT PAGE: Found product with views:', productData.views || 0)
          setRawProductData(productData)
          const transformedProduct = transformToFeaturedItem(productData)
          setProduct(transformedProduct)

          // Set seller profile image from product data
          // NOTE: Backend limitation - profile images are stored with products at creation time
          // This means if a seller updates their profile later, old products still show the old image
          // Backend stores: sellerId, sellerName, profileImageUrl (snapshot at creation)
          // To get current seller image would require: GET /api/v1/users/{sellerId} endpoint (doesn't exist)
          setSellerProfileImage((productData.profileImageUrl as string) || null)

          console.log('👤 Seller info:', {
            sellerId: productData.sellerId,
            sellerName: productData.sellerName,
            profileImageUrl: productData.profileImageUrl || 'Not set',
            note: 'Using stored profile image from product (historical snapshot)',
          })

          // Fetch similar products from all products list
          try {
            const allProductsResponse = await apiClient.getAllProducts(0)
            const allRespData = allProductsResponse as {
              data?: { content?: unknown[] } | unknown[]
              content?: unknown[]
            }

            const allProducts =
              (allRespData.data as { content?: unknown[] })?.content ||
              (allRespData as { content?: unknown[] })?.content ||
              (allRespData.data as unknown[]) ||
              []

            // Get similar products (exclude current product)
            const similar = allProducts
              .filter((item) => {
                const product = item as Record<string, unknown>
                return (
                  (product.productId || product.id) !== Number(id) &&
                  String(product.productId) !== id &&
                  String(product.id) !== id
                )
              })
              .slice(0, 4)
              .map((item) => transformToFeaturedItem(item as Record<string, unknown>))
            setSimilarProducts(similar)
          } catch (similarErr) {
            console.warn('⚠️ Failed to fetch similar products:', similarErr)
            // Continue without similar products
          }
        } else {
          throw new Error('Product not found')
        }
      } catch (err) {
        // Check if this is an authentication error from API client
        const apiError = err as Error & { isAuthError?: boolean; statusCode?: number }
        const errorMessage = err instanceof Error ? err.message : String(err)

        console.log('❌ PRODUCT PAGE: Error caught:', errorMessage)
        console.log('❌ PRODUCT PAGE: Error details:', {
          isAuthError: apiError.isAuthError,
          statusCode: apiError.statusCode,
        })

        // Handle authentication errors - show toast
        if (
          apiError.isAuthError ||
          apiError.statusCode === 401 ||
          apiError.statusCode === 403 ||
          apiError.statusCode === 408 || // Timeout
          errorMessage.includes('Authentication required') ||
          errorMessage.includes('authentication') ||
          errorMessage.includes('timeout') ||
          errorMessage.toLowerCase().includes('login')
        ) {
          // Don't log as error - this is expected flow for unauthenticated users
          console.log('🔐 Auth required, showing toast notification')
          toast({
            title: 'Login Required',
            description:
              'Please login to view product details or create an account to explore our marketplace!',
            variant: 'default',
          })
          setError(null) // Don't show error in UI
          return
        }

        // Log non-auth errors
        console.error('❌ Error fetching product:', err)

        // Handle other authentication errors with toast helper
        if (handleAuthError(err, router, `/product/${id}`)) {
          setError(null) // Don't show error in UI
          return // Toast shown
        }

        setError(err instanceof Error ? err.message : 'Failed to fetch product')
      } finally {
        // Always set loading to false after fetch completes
        setLoading(false)
      }
    }

    fetchProductData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Multiple product images for gallery
  const productImages = product
    ? [product.image, ...(product.images || [])]
    : ['/assets/images/products/placeholder.jpg']

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-brand-primary" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  // If no error but also no product (auth issue), show friendly message
  if (!error && !product && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">
            Please login to view product details or create an account to explore our marketplace!
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button className="bg-brand-primary hover:bg-brand-accent">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">Create Account</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error || 'Product not found'}</p>
          <Button
            onClick={() => router.push('/browse')}
            className="bg-brand-primary text-white hover:bg-brand-primary/90"
          >
            Back to Browse
          </Button>
        </div>
      </div>
    )
  }

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % productImages.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + productImages.length) % productImages.length)
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Image Gallery */}
          <div className="lg:col-span-3">
            <Card className="bg-white shadow-lg rounded-xl sm:rounded-2xl border-0 overflow-hidden">
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Thumbnail Images - Bottom on mobile, Left on desktop with scrolling */}
                  <div className="flex sm:flex-col justify-start gap-3 w-full sm:w-28 flex-shrink-0 order-2 sm:order-1 overflow-x-auto sm:overflow-x-hidden sm:overflow-y-scroll pb-2 sm:pb-0 sm:max-h-[480px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {productImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImage(index)}
                        className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0 bg-gray-100 ${
                          index === currentImage
                            ? 'border-brand-primary shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Image
                          src={image || '/placeholder.svg'}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          sizes="(max-width: 640px) 96px, 112px"
                          className="object-cover"
                          loading={index < 3 ? 'eager' : 'lazy'}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        />
                      </button>
                    ))}
                  </div>

                  {/* Main Image */}
                  <div className="flex-1 relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 min-h-[300px] sm:min-h-[400px] order-1 sm:order-2">
                    <div className="flex items-center justify-center p-4 sm:p-8 h-full">
                      <Image
                        src={productImages[currentImage]}
                        alt={`Product image ${currentImage + 1}`}
                        width={640}
                        height={640}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 640px"
                        className="max-w-full max-h-64 sm:max-h-96 object-contain"
                        priority={currentImage === 0}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        quality={90}
                      />
                    </div>

                    {/* Navigation Arrows - Now visible on mobile too */}
                    {productImages.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg border border-gray-200 transition-all duration-200 hover:scale-105 w-8 h-8 sm:w-10 sm:h-10"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg border border-gray-200 transition-all duration-200 hover:scale-105 w-8 h-8 sm:w-10 sm:h-10"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                        </Button>
                      </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black/70 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                      {currentImage + 1} / {productImages.length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Details Tabs - MOVED UP */}
            <div className="mt-4 sm:mt-6">
              <Card className="bg-white shadow-lg rounded-xl sm:rounded-2xl border-0">
                <CardContent className="p-4 sm:p-6">
                  <Tabs defaultValue="description" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 rounded-lg sm:rounded-xl bg-gray-100 p-1 h-11 sm:h-12 gap-1">
                      <TabsTrigger
                        value="description"
                        className="rounded-md sm:rounded-lg text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm px-2 sm:px-4"
                      >
                        Description
                      </TabsTrigger>
                      <TabsTrigger
                        value="specifications"
                        className="rounded-md sm:rounded-lg text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm px-2 sm:px-4"
                      >
                        <span className="hidden sm:inline">Specifications</span>
                        <span className="inline sm:hidden">Specs</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="reviews"
                        className="rounded-md sm:rounded-lg text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm px-2 sm:px-4"
                      >
                        <span className="hidden sm:inline">Reviews ({product.reviews})</span>
                        <span className="inline sm:hidden">Reviews</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="description" className="mt-4 sm:mt-8">
                      <div className="prose max-w-none text-gray-700">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
                          Product Description
                        </h3>
                        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                          <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {product.description ||
                              rawProductData?.productDescription ||
                              'No description available for this product.'}
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="specifications" className="mt-4 sm:mt-8">
                      <div className="prose max-w-none text-gray-700">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
                          Technical Specifications
                        </h3>
                        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-4">
                              <div className="bg-white rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-800">Condition</span>
                                  <span className="text-gray-600 capitalize">
                                    {rawProductData?.productCondition ||
                                      product?.condition ||
                                      'Not specified'}
                                  </span>
                                </div>
                              </div>
                              <div className="bg-white rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-800">Warranty</span>
                                  <span className="text-gray-600">
                                    {rawProductData?.productWarranty || 'No warranty'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="bg-white rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-800">Category</span>
                                  <span className="text-gray-600">
                                    {rawProductData?.category?.categoryName ||
                                      rawProductData?.categoryName ||
                                      product?.category ||
                                      'Not specified'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="reviews" className="mt-4 sm:mt-8">
                      <div className="space-y-4 sm:space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                            Buyer Reviews ({product.reviews})
                          </h3>
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                            <span className="font-semibold text-lg">{product.rating}</span>
                            <span className="text-gray-500">out of 5</span>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6">
                          <div className="text-center py-8">
                            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 font-medium">No detailed reviews yet</p>
                            <p className="text-sm text-gray-500 mt-2">
                              Be the first to leave a detailed review after purchase
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card className="bg-white shadow-lg rounded-xl sm:rounded-2xl border-0">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 px-3 py-1 font-medium">
                    Featured
                  </Badge>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 leading-tight">
                  {product.title}
                </h1>

                {/* Price */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                  <div className="flex items-baseline gap-2 sm:gap-3 mb-2">
                    <span className="text-2xl sm:text-3xl font-bold">
                      <PriceDisplay
                        price={parseNumericPrice(product.price)}
                        size="xl"
                        weight="bold"
                        variant="secondary"
                        showOriginal
                      />
                    </span>
                    {product.originalPrice && parseNumericPrice(product.originalPrice) > 0 && (
                      <span className="text-lg">
                        <PriceDisplay
                          price={parseNumericPrice(product.originalPrice)}
                          size="md"
                          variant="muted"
                          className="line-through"
                        />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-green-600 font-medium">
                    <TrendingUp className="h-4 w-4" />
                    <span>Great value compared to market price</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  {/* Debug: Log productId */}
                  {(() => {
                    console.log('🔍 Product Page Debug:', {
                      rawProductId: rawProductData?.productId,
                      productId: product.id,
                      urlId: id,
                      rawProductDataKeys: rawProductData ? Object.keys(rawProductData) : [],
                    })
                    return null
                  })()}
                  <ProductActions
                    productId={rawProductData?.productId as number}
                    sellerName={product.listedBy}
                    productTitle={product.title}
                    productPrice={product.price}
                    productImage={product.image}
                    productCondition={(rawProductData?.productCondition as string) || 'new'}
                    productLocation={product.location}
                    verifiedSeller={product.isVerified}
                    currency="TZS"
                  />

                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full border-gray-200 hover:bg-gray-50 transition-all duration-200 h-11 sm:h-12 text-sm sm:text-base"
                      onClick={() => setIsSaved(!isSaved)}
                    >
                      <Heart
                        className={`w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 transition-all duration-200 ${
                          isSaved ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-500'
                        }`}
                      />
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full border-gray-200 hover:bg-gray-50 transition-all duration-200 h-11 sm:h-12 text-sm sm:text-base"
                      asChild
                    >
                      <Link
                        href={`/messages?seller=${encodeURIComponent(product.listedBy)}&product=${encodeURIComponent(product.title)}`}
                      >
                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                        Message
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card className="bg-white shadow-lg rounded-xl sm:rounded-2xl border-0">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-blue-100 shadow-lg flex-shrink-0">
                    <AvatarImage
                      src={sellerProfileImage || '/placeholder.svg'}
                      alt={product.listedBy}
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        ;(e.target as HTMLImageElement).src = '/placeholder.svg'
                      }}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-500 text-white font-semibold">
                      {product.listedBy?.slice(0, 2).toUpperCase() || 'UN'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-800 truncate">
                      {product.listedBy || 'Unknown Seller'}
                    </h3>
                    <div className="flex items-center gap-1 text-xs sm:text-sm mb-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-medium text-gray-700">{product.rating}</span>
                      <span className="text-gray-500">({product.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 truncate">{product.location}</span>
                    </div>
                  </div>
                </div>

                {product.isVerified && (
                  <div className="bg-green-50 rounded-lg p-3 sm:p-3 border border-green-200">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-700">Verified Seller</span>
                    </div>
                    <p className="text-xs sm:text-sm text-green-600 mt-1">
                      This seller has been verified by our security team
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg rounded-xl sm:rounded-2xl border-0">
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-3 sm:mb-4">
                  Purchase Protection
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 sm:gap-3 text-gray-700">
                    <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                      <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium text-sm sm:text-base block">
                        7-day return policy
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">
                        Full refund guarantee
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 text-gray-700">
                    <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium text-sm sm:text-base block">
                        Secure payments
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">
                        Your payment is protected
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 text-gray-700">
                    <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                      <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium text-sm sm:text-base block">Fast shipping</span>
                      <span className="text-xs sm:text-sm text-gray-500">
                        Quick and reliable delivery
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Products */}
        <div className="mt-8 sm:mt-12">
          <div className="flex items-center justify-between mb-4 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">You Might Also Like</h2>
            <Button variant="outline" asChild className="hidden md:flex">
              <Link href="/browse">
                View All
                <ExternalLink className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {similarProducts.map((similarProduct) => (
              <Link
                key={similarProduct.id}
                href={`/product/${similarProduct.id}`}
                className="group block"
              >
                <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-xl sm:rounded-2xl overflow-hidden group-hover:scale-105">
                  <CardContent className="p-3 sm:p-4">
                    <div className="relative mb-3 sm:mb-4 overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-100 to-gray-200">
                      <Image
                        src={similarProduct.image}
                        alt={similarProduct.title}
                        width={200}
                        height={200}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                        className="w-full h-32 sm:h-40 object-contain p-3 sm:p-4 group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      />
                    </div>

                    <h3 className="font-semibold text-gray-800 text-xs sm:text-sm mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors">
                      <span className="block truncate">{similarProduct.title}</span>
                    </h3>

                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-baseline gap-1.5 sm:gap-2">
                        <span className="font-bold text-sm sm:text-lg">
                          <PriceDisplay
                            price={parseNumericPrice(similarProduct.price)}
                            size="lg"
                            weight="bold"
                            variant="secondary"
                          />
                        </span>
                        {similarProduct.originalPrice &&
                          parseNumericPrice(similarProduct.originalPrice) > 0 && (
                            <span className="text-[10px] sm:text-xs">
                              <PriceDisplay
                                price={parseNumericPrice(similarProduct.originalPrice)}
                                size="sm"
                                variant="muted"
                                className="line-through"
                              />
                            </span>
                          )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 fill-amber-400" />
                          <span className="text-xs sm:text-sm text-gray-600 font-medium">
                            {similarProduct.rating}
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-400">
                            ({similarProduct.reviews})
                          </span>
                        </div>

                        {similarProduct.isVerified && (
                          <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                        )}
                      </div>

                      <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-gray-500">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{similarProduct.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
