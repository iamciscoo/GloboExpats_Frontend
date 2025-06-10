"use client"

import { useState } from "react"
import { Search, Filter, Grid, List, Star, MapPin, Shield, Crown, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { featuredItems as products } from "@/lib/constants"

const categories = [
  { name: "Automotive", count: 2847, image: "/placeholder.svg?height=100&width=100" },
  { name: "Home & Furniture", count: 5234, image: "/placeholder.svg?height=100&width=100" },
  { name: "Electronics & Tech", count: 8921, image: "/placeholder.svg?height=100&width=100" },
  { name: "Games & Toys", count: 1456, image: "/placeholder.svg?height=100&width=100" },
  { name: "Fashion & Style", count: 3678, image: "/placeholder.svg?height=100&width=100" },
  { name: "Fitness & Sports", count: 987, image: "/placeholder.svg?height=100&width=100" },
  { name: "Books & Media", count: 2134, image: "/placeholder.svg?height=100&width=100" },
  { name: "Arts & Crafts", count: 756, image: "/placeholder.svg?height=100&width=100" },
]

export default function BrowsePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("relevance")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </h3>
        <Button variant="ghost" className="text-sm text-brand-primary hover:text-brand-primary">
          Clear All
        </Button>
      </div>

      {/* Categories */}
      <div>
        <Label className="text-sm font-medium text-neutral-700 mb-3 block">Categories</Label>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {categories.map((category) => (
            <div key={category.name} className="flex items-center space-x-2">
              <Checkbox
                id={`filter-${category.name}`}
                checked={selectedCategory === category.name}
                onCheckedChange={(checked) => setSelectedCategory(checked ? category.name : "")}
              />
              <Label
                htmlFor={`filter-${category.name}`}
                className="text-sm text-neutral-600 flex-1 cursor-pointer"
              >
                {category.name} <span className="text-neutral-500">({category.count})</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <Label className="text-sm font-medium text-neutral-700 mb-3 block">Location</Label>
        <Select>
          <SelectTrigger className="text-neutral-600">
            <SelectValue placeholder="Any location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dar">Dar es Salaam, TZ</SelectItem>
            <SelectItem value="arusha">Arusha, TZ</SelectItem>
            <SelectItem value="nairobi">Nairobi, KE</SelectItem>
            <SelectItem value="kampala">Kampala, UG</SelectItem>
            <SelectItem value="zanzibar">Zanzibar, TZ</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const ProductCard = ({ product, viewMode }: { product: typeof products[0]; viewMode: "grid" | "list" }) => {
    if (viewMode === "list") {
      return (
        <Card className="w-full overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col sm:flex-row">
          <div className="w-full sm:w-1/3 h-48 sm:h-auto bg-neutral-100 flex items-center justify-center">
            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
          </div>
          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-lg text-neutral-800 mb-2">{product.title}</h3>
              <div className="flex items-center gap-4 text-sm text-neutral-600 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-neutral-500" />
                  <span>{product.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                {product.isVerified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified Seller
                  </Badge>
                )}
                {product.isPremium && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                    <Crown className="w-3 h-3 mr-1" />
                    {product.premiumLabel || 'Premium'}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-brand-primary">{product.price}</div>
              <Button size="sm" className="bg-brand-secondary hover:bg-amber-500 text-brand-primary font-semibold">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="w-full overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 group">
        <div className="relative">
          <div className="w-full h-48 bg-neutral-100">
            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
          </div>
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isVerified && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            {product.isPremium && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                <Crown className="w-3 h-3 mr-1" />
                {product.premiumLabel || 'Premium'}
              </Badge>
            )}
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-neutral-800 truncate mb-2">{product.title}</h3>
          <div className="flex items-center text-sm text-neutral-600 mb-2">
            <MapPin className="w-4 h-4 mr-1 text-neutral-500" />
            <span>{product.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-brand-primary">{product.price}</div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-amber-500" />
              <span>
                {product.rating} ({product.reviews})
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <header className="bg-white shadow-sm sticky top-16 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-auto md:flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input
                  placeholder="Search for cars, electronics, furniture..."
                  className="pl-10 w-full h-11 bg-neutral-100 border-transparent focus:bg-white focus:border-brand-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between w-full md:w-auto gap-4">
              {/* Mobile Filter Trigger */}
              <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden flex-1">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <FilterContent />
                </SheetContent>
              </Sheet>

              {/* Sort By Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48 flex-1">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Sort by: Relevance</SelectItem>
                  <SelectItem value="price-asc">Sort by: Price (Low to High)</SelectItem>
                  <SelectItem value="price-desc">Sort by: Price (High to Low)</SelectItem>
                  <SelectItem value="date-desc">Sort by: Newest</SelectItem>
                  <SelectItem value="rating-desc">Sort by: Highest Rating</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="hidden md:flex items-center bg-neutral-100 rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                >
                  <Grid className="h-5 w-5" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                >
                  <List className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden md:block w-72 lg:w-80 flex-shrink-0">
            <div className="sticky top-32">
              <FilterContent />
            </div>
          </aside>

          {/* Product Grid / List */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-800">
                Showing {filteredProducts.length} results
              </h2>
            </div>

            {filteredProducts.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-6"
                }
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-2xl font-semibold text-neutral-700">No products found</h3>
                <p className="text-neutral-500 mt-2">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
