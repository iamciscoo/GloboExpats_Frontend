'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Search,
  Filter,
  SlidersHorizontal,
  Grid,
  List,
  Heart,
  Star,
  MapPin,
  Shield,
  Eye,
  ChevronDown,
  X,
  Plus,
  Minus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useSearch, type SearchProduct } from '@/hooks/use-search'
import { useCart } from '@/hooks/use-cart'
import { formatPrice } from '@/lib/utils'

function SearchPageContent() {
  const {
    query,
    filters,
    results,
    totalResults,
    isLoading,
    search,
    updateFilters,
    clearFilters,
    getSuggestions,
    getSearchAnalytics,
  } = useSearch()

  const { addToCart, isInCart } = useCart()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(query)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [priceRange, setPriceRange] = useState([
    filters.priceRange?.min || 0,
    filters.priceRange?.max || 10000,
  ])

  const analytics = getSearchAnalytics()

  const handleSearch = (newQuery: string) => {
    search(newQuery)
    setShowSuggestions(false)
  }

  const handleSearchInput = (value: string) => {
    setSearchInput(value)
    if (value.length >= 2) {
      setSuggestions(getSuggestions(value))
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values)
    updateFilters({
      priceRange: {
        min: values[0],
        max: values[1],
      },
    })
  }

  const handleAddToCart = (product: SearchProduct) => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[0],
      condition: product.condition,
      expatId: product.sellerId,
      expatName: product.sellerName,
      category: product.category,
      location: product.location,
      verified: product.sellerVerified,
    })
  }

  const ProductCard = ({ product }: { product: SearchProduct }) => {
    const isInCartCheck = isInCart(product.id)

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="relative">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden bg-neutral-100">
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {product.isPromoted && (
              <Badge className="absolute top-2 left-2 bg-brand-secondary text-brand-primary">
                Promoted
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>

          {/* Product Info */}
          <CardContent className="p-4">
            <div className="space-y-2">
              <Link href={`/product/${product.id}`}>
                <h3 className="font-semibold text-sm line-clamp-2 hover:text-brand-primary">
                  {product.title}
                </h3>
              </Link>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {product.condition}
                </Badge>
                {product.sellerVerified && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <MapPin className="w-3 h-3" />
                <span>{product.location}</span>
                {product.distance && <span>• {product.distance}km away</span>}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{formatPrice(product.price)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-neutral-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-neutral-500">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span>{product.sellerRating}</span>
                    <span>• {product.views} views</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAddToCart(product)}
                  disabled={isInCartCheck}
                >
                  {isInCartCheck ? 'In Cart' : 'Add to Cart'}
                </Button>
                <Link href={`/product/${product.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    )
  }

  const ProductListItem = ({ product }: { product: SearchProduct }) => {
    const isInCartCheck = isInCart(product.id)

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Product Image */}
            <div className="relative w-24 h-24 flex-shrink-0 bg-neutral-100 rounded-lg overflow-hidden">
              <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
              {product.isPromoted && (
                <Badge className="absolute top-1 left-1 bg-brand-secondary text-brand-primary text-xs">
                  Promoted
                </Badge>
              )}
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-semibold line-clamp-1 hover:text-brand-primary">
                      {product.title}
                    </h3>
                  </Link>

                  <p className="text-sm text-neutral-600 line-clamp-2 mt-1">
                    {product.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">
                      {product.condition}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-neutral-500">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{product.location}</span>
                    </div>
                    {product.sellerVerified && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4 lg:gap-2 lg:text-right flex-shrink-0">
                  <div className="flex flex-col lg:items-end">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xl">{formatPrice(product.price)}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-neutral-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-neutral-500 mb-2">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span>{product.sellerRating}</span>
                      <span>• {product.views} views</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      disabled={isInCartCheck}
                    >
                      {isInCartCheck ? 'In Cart' : 'Add to Cart'}
                    </Button>
                    <Link href={`/product/${product.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const FiltersSidebar = () => (
    <div className="space-y-6">
      {/* Search Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Products:</span>
              <span className="font-medium">{totalResults}</span>
            </div>
            {query && (
              <div className="flex justify-between">
                <span>For:</span>
                <span className="font-medium">"{query}"</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Category</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={filters.category || ''}
            onValueChange={(value) => updateFilters({ category: value || undefined })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="all-categories" />
              <Label htmlFor="all-categories">All Categories</Label>
            </div>
            {analytics.categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <RadioGroupItem value={category} id={category} />
                <Label htmlFor={category}>{category}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Condition Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Condition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {['New', 'Like New', 'Excellent', 'Very Good', 'Good', 'Fair'].map((condition) => (
              <div key={condition} className="flex items-center space-x-2">
                <Checkbox
                  id={condition}
                  checked={filters.condition?.includes(condition) || false}
                  onCheckedChange={(checked) => {
                    const currentConditions = filters.condition || []
                    if (checked) {
                      updateFilters({ condition: [...currentConditions, condition] })
                    } else {
                      updateFilters({ condition: currentConditions.filter((c) => c !== condition) })
                    }
                  }}
                />
                <Label htmlFor={condition}>{condition}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Price Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              max={analytics.priceRange.max}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-sm">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Location</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Enter location..."
            value={filters.location || ''}
            onChange={(e) => updateFilters({ location: e.target.value || undefined })}
          />
        </CardContent>
      </Card>

      {/* Verified Sellers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Seller Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified"
              checked={filters.verified || false}
              onCheckedChange={(checked) => updateFilters({ verified: checked as boolean })}
            />
            <Label htmlFor="verified" className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              Verified sellers only
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Clear Filters */}
      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear All Filters
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-6">
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Enhanced Search Bar */}
            <div className="relative flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <Input
                  placeholder="Search for products..."
                  value={searchInput}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchInput)}
                  className="pl-10 h-12 text-lg"
                />
                {searchInput && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => {
                      setSearchInput('')
                      handleSearch('')
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <Card className="absolute top-full left-0 right-0 mt-1 z-50">
                  <CardContent className="p-2">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start h-8"
                        onClick={() => handleSearch(suggestion)}
                      >
                        <Search className="w-4 h-4 mr-2" />
                        {suggestion}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sort and View Controls */}
            <div className="flex items-center gap-3">
              <Select
                value={filters.sortBy || 'relevance'}
                onValueChange={(value) => updateFilters({ sortBy: value as any })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="distance">Nearest First</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Mobile Filter Toggle */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="py-6">
                    <FiltersSidebar />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.category ||
            filters.condition?.length ||
            filters.verified ||
            filters.location) && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-sm text-neutral-600">Active filters:</span>
              {filters.category && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.category}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0"
                    onClick={() => updateFilters({ category: undefined })}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              )}
              {filters.condition?.map((condition) => (
                <Badge key={condition} variant="secondary" className="flex items-center gap-1">
                  {condition}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0"
                    onClick={() => {
                      const newConditions = filters.condition?.filter((c) => c !== condition)
                      updateFilters({
                        condition: newConditions?.length ? newConditions : undefined,
                      })
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
              {filters.verified && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Verified Only
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0"
                    onClick={() => updateFilters({ verified: false })}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  📍 {filters.location}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0"
                    onClick={() => updateFilters({ location: undefined })}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <FiltersSidebar />
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                  <Search className="w-12 h-12 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">No results found</h3>
                <p className="text-neutral-600 mb-4">Try adjusting your search terms or filters</p>
                <Button onClick={clearFilters}>Clear All Filters</Button>
              </div>
            ) : (
              <>
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold truncate">
                    {totalResults} {totalResults === 1 ? 'result' : 'results'}
                    {query && <span> for "{query}"</span>}
                  </h2>
                </div>

                {/* Products Grid/List */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {results.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.map((product) => (
                      <ProductListItem key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}
