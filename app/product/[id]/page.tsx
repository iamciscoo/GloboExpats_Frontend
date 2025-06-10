"use client"

import { useState } from "react"
import {
  Star,
  MapPin,
  Shield,
  Heart,
  Share2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Truck,
  RotateCcw,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Breadcrumb from "@/components/breadcrumb"

const productImages = [
  "/images/iphone-15-pro.jpg",
  "/images/iphone-15-pro-2.webp",
  "/images/iphone-15-pro-3.webp",
  "/images/iphone-15-pro-4.webp",
]

const similarProducts = [
  {
    id: 1,
    title: "iPhone 14 Pro Max",
    price: "$999",
    image: "/images/iphone-15-pro.jpg",
    rating: 4.8,
  },
  {
    id: 2,
    title: "Samsung Galaxy S24",
    price: "$899",
    image: "/images/iphone-15-pro.jpg",
    rating: 4.7,
  },
  {
    id: 3,
    title: "Google Pixel 8 Pro",
    price: "$799",
    image: "/images/iphone-15-pro.jpg",
    rating: 4.6,
  },
  {
    id: 4,
    title: "OnePlus 12",
    price: "$699",
    image: "/images/iphone-15-pro.jpg",
    rating: 4.5,
  },
]

export default function ProductPage() {
  const [currentImage, setCurrentImage] = useState(0)
  const [isSaved, setIsSaved] = useState(false)

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % productImages.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + productImages.length) % productImages.length)
  }

  return (
    <div className="bg-neutral-50">
      <div className="container mx-auto px-4 py-6">
        <Breadcrumb />
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-3">
            <Card className="bg-white shadow-sm rounded-xl">
              <CardContent className="p-4 sm:p-6">
                {/* Main Image */}
                <div className="relative mb-4 overflow-hidden rounded-lg">
                  <div className="flex transition-transform duration-300" style={{ transform: `translateX(-${currentImage * 100}%)` }}>
                    {productImages.map((image, index) => (
                       <img
                        key={index}
                        src={image}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-64 sm:h-96 object-contain flex-shrink-0"
                      />
                    ))}
                  </div>

                  {/* Navigation Arrows */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white backdrop-blur-sm rounded-full"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white backdrop-blur-sm rounded-full"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>

                   {/* Image Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {productImages.map((_, index) => (
                       <button
                        key={index}
                        onClick={() => setCurrentImage(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImage ? "bg-brand-primary w-4" : "bg-neutral-400"
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Thumbnail Images */}
                <div className="hidden sm:flex gap-2 overflow-x-auto">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImage
                          ? "border-brand-primary scale-105"
                          : "border-transparent hover:border-neutral-300"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white shadow-sm rounded-xl">
              <CardContent className="p-6">
                <Badge className="bg-amber-100 text-amber-800 mb-2">Premium Listing</Badge>
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-4">
                  iPhone 15 Pro Max 256GB - Natural Titanium
                </h1>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-bold text-brand-primary">$1,199</span>
                  <span className="text-xl text-neutral-400 line-through">$1,299</span>
                  <Badge variant="outline" className="text-status-success border-status-success/50">Save $100</Badge>
                </div>

                {/* Condition */}
                <div className="mb-6">
                  <span className="text-sm text-neutral-600">Condition: </span>
                  <span className="font-semibold text-neutral-800">Like New</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mb-6">
                  <Button size="lg" className="w-full bg-brand-primary hover:bg-blue-700 text-white font-semibold py-3">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Contact Seller
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="lg" className="w-full" onClick={() => setIsSaved(!isSaved)}>
                      <Heart className={`w-5 h-5 mr-2 transition-colors ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                      {isSaved ? "Saved" : "Save"}
                    </Button>
                    <Button variant="outline" size="lg" className="w-full">
                      <Share2 className="w-5 h-5 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card className="bg-white shadow-sm rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16 border-2 border-white shadow-md">
                    <AvatarImage src="/images/seller-avatar-1.jpg" alt="TechExpat Dubai" />
                    <AvatarFallback>TE</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-800">TechExpat Dubai</h3>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-medium text-neutral-700">4.9</span>
                      <span className="text-neutral-500">(127 reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-neutral-600 space-y-2">
                   <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-neutral-500" />
                    <span>Dubai, UAE • Member since 2022</span>
                  </div>
                   <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-status-success" />
                    <span className="font-medium text-status-success">Verified Seller</span>
                  </div>
                </div>
                 <Button variant="outline" className="w-full mt-4">View Profile</Button>
              </CardContent>
            </Card>

             {/* Trust Indicators */}
            <Card className="bg-white shadow-sm rounded-xl">
              <CardContent className="p-6 space-y-3">
                 <div className="flex items-center gap-3 text-neutral-700">
                  <Truck className="w-5 h-5 text-brand-primary" />
                  <span className="font-medium">Free shipping available</span>
                </div>
                 <div className="flex items-center gap-3 text-neutral-700">
                  <RotateCcw className="w-5 h-5 text-brand-primary" />
                  <span className="font-medium">7-day return policy</span>
                </div>
                 <div className="flex items-center gap-3 text-neutral-700">
                  <CreditCard className="w-5 h-5 text-brand-primary" />
                  <span className="font-medium">Secure payment protection</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-8">
          <Card className="bg-white shadow-sm rounded-xl">
            <CardContent className="p-4 sm:p-6">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 rounded-lg bg-neutral-100 p-1">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="specifications">Specifications</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="mt-6">
                  <div className="prose max-w-none text-neutral-700">
                    <h3 className="text-xl font-semibold text-neutral-800 mb-4">Product Description</h3>
                    <p>
                      This iPhone 15 Pro Max is in excellent condition, barely used for 2 months. I'm relocating from
                      Dubai and need to sell quickly. The phone comes with original box, charger, and a premium case.
                    </p>
                    <p>
                      Features the powerful A17 Pro chip, Pro camera system with 5x Telephoto, and the new Action
                      Button. Perfect for expats who need a reliable, high-performance device.
                    </p>
                    <h4 className="font-semibold text-neutral-800 mb-2 mt-4">What's Included:</h4>
                    <ul>
                      <li>iPhone 15 Pro Max (256GB, Natural Titanium)</li>
                      <li>Original Box and Manuals</li>
                      <li>USB-C to Lightning cable</li>
                      <li>Premium leather case (worth $60)</li>
                      <li>Screen protector already applied</li>
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="specifications" className="mt-6">
                  <div className="prose max-w-none text-neutral-700">
                    <h3 className="text-xl font-semibold text-neutral-800 mb-4">Technical Specifications</h3>
                    <table className="w-full">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 font-medium">Display</td>
                          <td className="py-2">6.7-inch Super Retina XDR display with ProMotion</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 font-medium">Chip</td>
                          <td className="py-2">A17 Pro chip</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 font-medium">Camera</td>
                          <td className="py-2">48MP Main, 12MP Ultra Wide, 12MP 5x Telephoto</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 font-medium">Storage</td>
                          <td className="py-2">256GB</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium">Color</td>
                          <td className="py-2">Natural Titanium</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="mt-6">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-neutral-800 mb-4">Buyer Reviews (3)</h3>

                    {/* Review 1 */}
                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarImage src="/placeholder-user.jpg" alt="Reviewer 1" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">John D.</h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-neutral-600 mb-2">"Excellent seller, product was as described. Smooth transaction."</p>
                        <span className="text-xs text-neutral-500">2 days ago</span>
                      </div>
                    </div>

                    {/* Review 2 */}
                    <div className="flex gap-4">
                      <Avatar>
                         <AvatarImage src="/placeholder-user.jpg" alt="Reviewer 2" />
                        <AvatarFallback>SM</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">Sarah M.</h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-neutral-600 mb-2">
                          "Great communication and fast shipping. Highly recommend."
                        </p>
                        <span className="text-xs text-neutral-500">1 week ago</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Similar Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarProducts.map((product) => (
              <Card key={product.id} className="bg-white shadow-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <img src={product.image} alt={product.title} className="w-full h-32 object-cover rounded-lg mb-4" />
                  <h3 className="font-semibold text-neutral-800 text-sm mb-2">{product.title}</h3>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-brand-primary">{product.price}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm text-neutral-600">{product.rating}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
