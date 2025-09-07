'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Star,
  MapPin,
  Shield,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Truck,
  RotateCcw,
  CreditCard,
  MessageCircle,
  ExternalLink,
  Eye,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ProductActions } from '@/components/product-actions'
import { useParams, useRouter } from 'next/navigation'
import { featuredItems } from '@/lib/constants'
import { getSellerInfo } from '@/lib/seller-data'

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const product = featuredItems.find((item) => item.id === Number(id)) || featuredItems[0]
  const sellerName = product.seller

  // Get dynamic seller information
  const sellerInfo = getSellerInfo(sellerName)

  // Multiple product images for gallery
  const productImages = [
    product.image,
    '/images/macbook-pro.jpg',
    '/images/iphone-15-pro.jpg',
    '/images/canon-camera.jpg',
    '/images/ipad-pro.jpg',
  ]
  const [currentImage, setCurrentImage] = useState(0)
  const [isSaved, setIsSaved] = useState(false)

  const similarProducts = featuredItems.filter((item) => item.id !== product.id).slice(0, 4)

  if (!product) {
    router.push('/browse')
    return null
  }

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % productImages.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + productImages.length) % productImages.length)
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.title,
          text: 'Check out this amazing product!',
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
      }
    } catch (error) {
      console.log('Error sharing:', error)
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="container mx-auto px-4 pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Image Gallery */}
          <div className="lg:col-span-3">
            <Card className="bg-white shadow-lg rounded-2xl border-0 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Thumbnail Images - Left Side */}
                  <div className="flex flex-col gap-3 w-20 flex-shrink-0">
                    {productImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImage(index)}
                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                          index === currentImage
                            ? 'border-blue-500 scale-105 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:scale-102'
                        }`}
                      >
                        <Image
                          src={image || '/placeholder.svg'}
                          alt={`Thumbnail ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>

                  {/* Main Image */}
                  <div className="flex-1 relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 min-h-[400px]">
                    <div className="flex items-center justify-center p-8 h-full">
                      <Image
                        src={productImages[currentImage]}
                        alt={`Product image ${currentImage + 1}`}
                        width={640}
                        height={640}
                        className="max-w-full max-h-96 object-contain"
                        priority={currentImage === 0}
                      />
                    </div>

                    {/* Navigation Arrows */}
                    {productImages.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg border border-gray-200 transition-all duration-200 hover:scale-105"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-5 w-5 text-gray-700" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg border border-gray-200 transition-all duration-200 hover:scale-105"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-5 w-5 text-gray-700" />
                        </Button>
                      </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      {currentImage + 1} / {productImages.length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Details Tabs - MOVED UP */}
            <div className="mt-6">
              <Card className="bg-white shadow-lg rounded-2xl border-0">
                <CardContent className="p-6">
                  <Tabs defaultValue="description" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 rounded-xl bg-gray-100 p-1 h-12">
                      <TabsTrigger
                        value="description"
                        className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        Description
                      </TabsTrigger>
                      <TabsTrigger
                        value="specifications"
                        className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        Specifications
                      </TabsTrigger>
                      <TabsTrigger
                        value="reviews"
                        className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        Reviews ({product.reviews})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="description" className="mt-8">
                      <div className="prose max-w-none text-gray-700">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                          Product Description
                        </h3>
                        <div className="bg-gray-50 rounded-xl p-6">
                          <p className="text-gray-600 leading-relaxed">
                            This premium product offers exceptional quality and performance. Perfect
                            for professionals and enthusiasts alike, it combines cutting-edge
                            technology with reliable build quality. Each item is carefully inspected
                            to ensure it meets our high standards.
                          </p>
                          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg p-4">
                              <h4 className="font-semibold text-gray-800 mb-2">Condition</h4>
                              <p className="text-sm text-gray-600">
                                Like new - minimal signs of use
                              </p>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                              <h4 className="font-semibold text-gray-800 mb-2">Warranty</h4>
                              <p className="text-sm text-gray-600">
                                6 months seller warranty included
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="specifications" className="mt-8">
                      <div className="prose max-w-none text-gray-700">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6">
                          Technical Specifications
                        </h3>
                        <div className="bg-gray-50 rounded-xl p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="bg-white rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-800">Condition</span>
                                  <span className="text-gray-600">Excellent</span>
                                </div>
                              </div>
                              <div className="bg-white rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-800">Age</span>
                                  <span className="text-gray-600">Less than 1 year</span>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="bg-white rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-800">Original Box</span>
                                  <span className="text-gray-600">Yes</span>
                                </div>
                              </div>
                              <div className="bg-white rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-800">Accessories</span>
                                  <span className="text-gray-600">Complete</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="reviews" className="mt-8">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-gray-800">
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
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white shadow-lg rounded-2xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 px-3 py-1 font-medium">
                    Featured
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full border-gray-200 hover:bg-gray-50"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full border-gray-200 hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 leading-tight">
                  {product.title}
                </h1>

                {/* Price */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-6">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-3xl font-bold text-blue-600">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-lg text-gray-400 line-through">
                        {product.originalPrice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <TrendingUp className="h-4 w-4" />
                    <span>Great value compared to market price</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 mb-6">
                  <ProductActions
                    sellerName={sellerName}
                    productTitle={product.title}
                    productPrice={product.price}
                    productImage={product.image}
                    productCondition={'new'}
                    productLocation={product.location}
                    verifiedSeller={product.isVerified}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full border-gray-200 hover:bg-gray-50 transition-all duration-200"
                      onClick={() => setIsSaved(!isSaved)}
                    >
                      <Heart
                        className={`w-5 h-5 mr-2 transition-all duration-200 ${
                          isSaved ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-500'
                        }`}
                      />
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full border-gray-200 hover:bg-gray-50 transition-all duration-200"
                      asChild
                    >
                      <Link
                        href={`/messages?seller=${encodeURIComponent(sellerName)}&product=${encodeURIComponent(product.title)}`}
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Message
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card className="bg-white shadow-lg rounded-2xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16 border-2 border-blue-100 shadow-lg">
                    <AvatarImage src={sellerInfo?.avatar || '/placeholder.svg'} alt={sellerName} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-500 text-white font-semibold">
                      {sellerName?.slice(0, 2) || 'UN'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-800 truncate">
                      {sellerName || 'Unknown Seller'}
                    </h3>
                    <div className="flex items-center gap-1 text-sm mb-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-medium text-gray-700">
                        {sellerInfo?.rating || product.rating}
                      </span>
                      <span className="text-gray-500">
                        ({sellerInfo?.reviewCount || product.reviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 truncate">
                        {sellerInfo?.location || product.location}
                      </span>
                    </div>
                    {sellerInfo?.responseTime && (
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Responds {sellerInfo.responseTime}</span>
                      </div>
                    )}
                  </div>
                </div>

                {product.isVerified && (
                  <div className="bg-green-50 rounded-lg p-3 mb-4 border border-green-200">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-700">Verified Seller</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      This seller has been verified by our security team
                    </p>
                  </div>
                )}

                <Link
                  href={
                    sellerInfo?.profileSlug
                      ? `/expat/profile/${sellerInfo.profileSlug}`
                      : `/expat/profile/1`
                  }
                >
                  <Button
                    variant="outline"
                    className="w-full border-gray-200 hover:bg-gray-50 transition-all duration-200"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg rounded-2xl border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Purchase Protection</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                      <RotateCcw className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium block">7-day return policy</span>
                      <span className="text-sm text-gray-500">Full refund guarantee</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium block">Secure payments</span>
                      <span className="text-sm text-gray-500">Your payment is protected</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                      <Truck className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium block">Fast shipping</span>
                      <span className="text-sm text-gray-500">Quick and reliable delivery</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Products */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">You Might Also Like</h2>
            <Button variant="outline" asChild className="hidden md:flex">
              <Link href="/browse">
                View All
                <ExternalLink className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {similarProducts.map((similarProduct) => (
              <Link
                key={similarProduct.id}
                href={`/product/${similarProduct.id}`}
                className="group block"
              >
                <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-2xl overflow-hidden group-hover:scale-105">
                  <CardContent className="p-4">
                    <div className="relative mb-4 overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200">
                      <Image
                        src={similarProduct.image}
                        alt={similarProduct.title}
                        width={200}
                        height={200}
                        className="w-full h-40 object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                      />
                      {similarProduct.isPremium && (
                        <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 text-xs">
                          Premium
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-gray-800 text-sm mb-3 group-hover:text-blue-600 transition-colors">
                      <span className="block truncate">{similarProduct.title}</span>
                    </h3>

                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-blue-600 text-lg">
                          {similarProduct.price}
                        </span>
                        {similarProduct.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            {similarProduct.originalPrice}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="text-sm text-gray-600 font-medium">
                            {similarProduct.rating}
                          </span>
                          <span className="text-xs text-gray-400">({similarProduct.reviews})</span>
                        </div>

                        {similarProduct.isVerified && <Shield className="w-4 h-4 text-green-500" />}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
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
