"use client"

import { useState } from "react"
import { Filter, Grid, List, Star, MapPin, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const products = [
  {
    id: 1,
    title: "iPhone 15 Pro Max 256GB",
    price: "$1,199",
    originalPrice: "$1,299",
    image: "/placeholder.svg?height=300&width=300",
    seller: "TechExpat Dubai",
    rating: 4.9,
    reviews: 87,
    location: "Dubai, UAE",
    verified: true,
    premium: true,
    condition: "Like New",
  },
  {
    id: 2,
    title: 'MacBook Air M2 13"',
    price: "$999",
    originalPrice: "$1,199",
    image: "/placeholder.svg?height=300&width=300",
    seller: "AppleStore SG",
    rating: 4.8,
    reviews: 156,
    location: "Singapore",
    verified: true,
    premium: false,
    condition: "Excellent",
  },
  // Add more products...
]

export default function CategoryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [priceRange, setPriceRange] = useState([0, 5000])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200 py-4">
        <div className="container mx-auto px-4">
          <nav className="text-sm text-slate-600">
            <span>Home</span> <span className="mx-2">{">"}</span>
            <span className="text-cyan-600">Electronics</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Electronics for Expats</h1>
          <p className="text-slate-600">2,847 items available</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="h-5 w-5 text-slate-600" />
                  <h3 className="font-semibold text-slate-900">Filters</h3>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-slate-700 mb-3 block">Price Range</Label>
                  <Slider value={priceRange} onValueChange={setPriceRange} max={5000} step={50} className="mb-2" />
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                {/* Condition */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-slate-700 mb-3 block">Condition</Label>
                  <div className="space-y-2">
                    {["New", "Like New", "Excellent", "Good", "Fair"].map((condition) => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox id={condition} />
                        <Label htmlFor={condition} className="text-sm text-slate-600">
                          {condition}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-slate-700 mb-3 block">Location</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dubai">Dubai, UAE</SelectItem>
                      <SelectItem value="singapore">Singapore</SelectItem>
                      <SelectItem value="london">London, UK</SelectItem>
                      <SelectItem value="toronto">Toronto, CA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Seller Type */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-slate-700 mb-3 block">Seller Type</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="verified" />
                      <Label htmlFor="verified" className="text-sm text-slate-600">
                        Verified Only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="premium" />
                      <Label htmlFor="premium" className="text-sm text-slate-600">
                        Premium Sellers
                      </Label>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and View Controls */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <Select defaultValue="relevance">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Most Relevant</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            <div
              className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
            >
              {products.map((product) => (
                <Card
                  key={product.id}
                  className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    product.premium
                      ? "border-2 border-amber-400 bg-gradient-to-br from-white to-amber-50"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <CardContent className="p-0">
                    <div className={`${viewMode === "list" ? "flex" : ""}`}>
                      {/* Image */}
                      <div
                        className={`relative overflow-hidden ${viewMode === "list" ? "w-48 flex-shrink-0" : "rounded-t-lg"}`}
                      >
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.title}
                          className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                            viewMode === "list" ? "w-full h-full" : "w-full h-48"
                          }`}
                        />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {product.premium && <Badge className="bg-amber-500 text-black font-semibold">Premium</Badge>}
                          {product.verified && (
                            <Badge className="bg-green-500 text-white">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1">
                        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-900 transition-colors">
                          {product.title}
                        </h3>

                        <div className="text-sm text-slate-600 mb-2">Condition: {product.condition}</div>

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl font-bold text-amber-600">{product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-slate-500 line-through">{product.originalPrice}</span>
                          )}
                        </div>

                        {/* Seller Info */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium">{product.rating}</span>
                            <span className="text-sm text-slate-500">({product.reviews})</span>
                          </div>
                          <span className="text-sm text-slate-600">{product.seller}</span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1 mb-4">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{product.location}</span>
                        </div>

                        {/* Action Button */}
                        <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white">Contact Seller</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12">
              <div className="flex items-center gap-2">
                <Button variant="outline" disabled>
                  Previous
                </Button>
                <Button className="bg-blue-900 text-white">1</Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <Button variant="outline">Next</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
