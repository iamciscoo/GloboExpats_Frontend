'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { CATEGORIES, ITEM_CONDITIONS, EXPAT_LOCATIONS } from '@/lib/constants'
import { debounce, generateSlug } from '@/lib/utils'
import { ProductCard } from '@/components/ui/product-card'
import { apiClient } from '@/lib/api'
import { transformBackendProduct, extractContentFromResponse } from '@/lib/image-utils'
import type { FeaturedItem } from '@/lib/types'
import {
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  X,
  Clock,
  Star,
  Shield,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ChevronDown,
  Loader2,
} from 'lucide-react'

const categories = CATEGORIES.map((c) => ({
  name: c.name,
  count: parseInt(c.count.replace(/\D/g, '')),
  slug: c.slug,
}))

interface FilterState {
  selectedCategory: string
  priceRange: [number, number]
  condition: string
  expatType: string
  timePosted: string
  location: string
}

interface FilterProps {
  filters: FilterState
  setFilters: (filters: FilterState) => void
  clearAllFilters: () => void
}

const FilterContentEl = ({ filters, setFilters, clearAllFilters }: FilterProps) => {
  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters({
      ...filters,
      [key]: value,
    })
  }

  const hasActiveFilters =
    filters.selectedCategory ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 10000000 ||
    filters.condition ||
    filters.expatType ||
    filters.timePosted ||
    filters.location

  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600" />
          Filters
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          onClick={clearAllFilters}
          disabled={!hasActiveFilters}
        >
          <X className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      </div>

      {/* Categories - Primary Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-gray-700">Categories</Label>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {categories.map((category) => (
            <div
              key={category.name}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Checkbox
                id={`filter-${category.slug}`}
                checked={filters.selectedCategory === category.slug}
                onCheckedChange={(checked) =>
                  updateFilter('selectedCategory', checked ? category.slug : '')
                }
              />
              <Label
                htmlFor={`filter-${category.slug}`}
                className="text-sm text-gray-600 flex-1 cursor-pointer hover:text-gray-800 transition-colors"
              >
                {category.name}
                <span className="text-gray-400 ml-1">({category.count.toLocaleString()})</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range - Primary Filter */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold text-gray-700">Price Range (TZS)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.priceRange[0]}
            onChange={(e) =>
              updateFilter('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])
            }
            className="text-sm h-9"
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.priceRange[1]}
            onChange={(e) =>
              updateFilter('priceRange', [
                filters.priceRange[0],
                parseInt(e.target.value) || 10000000,
              ])
            }
            className="text-sm h-9"
          />
        </div>
      </div>

      <Separator />

      {/* Advanced Filters Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full"
      >
        {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        <ChevronDown
          className={`h-4 w-4 ml-2 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
        />
      </Button>

      {/* Advanced Filters - Hidden by default */}
      {showAdvanced && (
        <>
          <Separator />

          {/* New Listings Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              Posted Time
            </Label>
            <RadioGroup
              value={filters.timePosted}
              onValueChange={(value) => updateFilter('timePosted', value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                <RadioGroupItem value="" id="time-all" />
                <Label
                  htmlFor="time-all"
                  className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
                >
                  Any time
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                <RadioGroupItem value="24h" id="time-24h" />
                <Label
                  htmlFor="time-24h"
                  className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
                >
                  Last 24 hours{' '}
                  <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-700">
                    New
                  </Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                <RadioGroupItem value="7d" id="time-7d" />
                <Label
                  htmlFor="time-7d"
                  className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
                >
                  Last week
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                <RadioGroupItem value="30d" id="time-30d" />
                <Label
                  htmlFor="time-30d"
                  className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
                >
                  Last month
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Condition */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Condition</Label>
            <RadioGroup
              value={filters.condition}
              onValueChange={(value) => updateFilter('condition', value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                <RadioGroupItem value="" id="condition-all" />
                <Label
                  htmlFor="condition-all"
                  className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
                >
                  Any condition
                </Label>
              </div>
              {ITEM_CONDITIONS.slice(0, 4).map((condition) => (
                <div
                  key={condition.value}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <RadioGroupItem value={condition.value} id={`condition-${condition.value}`} />
                  <Label
                    htmlFor={`condition-${condition.value}`}
                    className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
                  >
                    {condition.label}
                    <span className="text-gray-400 ml-1 text-xs">({condition.description})</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Seller Type */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              Expat Type
            </Label>
            <RadioGroup
              value={filters.expatType}
              onValueChange={(value) => updateFilter('expatType', value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                <RadioGroupItem value="" id="expat-all" />
                <Label
                  htmlFor="expat-all"
                  className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
                >
                  All expats
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                <RadioGroupItem value="verified" id="expat-verified" />
                <Label
                  htmlFor="expat-verified"
                  className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors flex items-center gap-2"
                >
                  Verified expats only
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    <Shield className="h-3 w-3 mr-1" />
                    Trusted
                  </Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                <RadioGroupItem value="premium" id="expat-premium" />
                <Label
                  htmlFor="expat-premium"
                  className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors flex items-center gap-2"
                >
                  Premium expats only
                  <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                    <Star className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Location</Label>
            <Select
              value={filters.location || 'all'}
              onValueChange={(value) => updateFilter('location', value === 'all' ? '' : value)}
            >
              <SelectTrigger className="text-gray-600 h-10">
                <SelectValue placeholder="Any location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any location</SelectItem>
                {EXPAT_LOCATIONS.map((location) => (
                  <SelectItem key={location.value} value={location.value}>
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  )
}

export default function BrowsePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialQuery = searchParams.get('q') || ''
  const initialCategory = searchParams.get('category') || ''
  const initialPage = parseInt(searchParams.get('page') || '1')

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [searchInput, setSearchInput] = useState(initialQuery)
  const [sortBy, setSortBy] = useState('relevance')
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage] = useState(12) // Fixed items per page
  const isApplyingUrlParams = useRef(false)

  // Backend data state
  const [products, setProducts] = useState<FeaturedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debounce updates to the actual search query to reduce re-renders and URL churn
  const debouncedUpdateQuery = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value)
      }, 300),
    []
  )

  const [filters, setFilters] = useState<FilterState>({
    selectedCategory: initialCategory,
    priceRange: [0, 10000000],
    condition: '',
    expatType: '',
    timePosted: '',
    location: '',
  })

  // Transform backend ListingItem to FeaturedItem format
  const transformToFeaturedItem = (item: any): FeaturedItem => {
    console.log('🔄 BROWSE: Transforming item:', item)
    const transformed = transformBackendProduct(item)
    console.log('✅ BROWSE: Transformed to:', transformed)
    return transformed
  }

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('🔥 BROWSE PAGE: Fetching ALL products from backend - NO DUMMY DATA!')
        const response = await apiClient.getAllProducts(0)
        // Use centralized content extraction
        const productsData = extractContentFromResponse(response)
        console.log('🚀 BROWSE PAGE: Backend response:', response)
        console.log('📦 BROWSE PAGE: Products count:', productsData.length)
        setProducts(productsData.map(transformToFeaturedItem))
        console.log(
          '✅ BROWSE PAGE: Successfully loaded',
          productsData.length,
          'products from backend'
        )
      } catch (err) {
        console.error('🚨 BROWSE PAGE: Error fetching products:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch products')
        // NO FALLBACK TO DUMMY DATA - IF BACKEND FAILS, SHOW ERROR
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Sync state FROM URL (supports back/forward navigation & direct linking)
  useEffect(() => {
    isApplyingUrlParams.current = true
    const q = searchParams.get('q') || ''
    const cat = searchParams.get('category') || ''
    const page = parseInt(searchParams.get('page') || '1')

    if (q !== searchQuery) {
      setSearchQuery(q)
      setSearchInput(q)
    }
    if (cat !== filters.selectedCategory) {
      setFilters((prev) => ({ ...prev, selectedCategory: cat }))
    }
    if (Number.isFinite(page) && page !== currentPage) {
      setCurrentPage(page)
    }

    const t = setTimeout(() => {
      isApplyingUrlParams.current = false
    }, 0)

    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const clearAllFilters = () => {
    setFilters({
      selectedCategory: '',
      priceRange: [0, 10000000],
      condition: '',
      expatType: '',
      timePosted: '',
      location: '',
    })
  }

  // Keep URL in sync when user types in search field
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    // query
    if (searchQuery) params.set('q', searchQuery)
    else params.delete('q')

    // category
    if (filters.selectedCategory) params.set('category', filters.selectedCategory)
    else params.delete('category')

    // page
    if (currentPage > 1) params.set('page', currentPage.toString())
    else params.delete('page')

    const qs = params.toString()
    router.replace(qs ? `/browse?${qs}` : '/browse')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filters.selectedCategory, currentPage])

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase())
    // Note: FeaturedItem doesn't have categorySlug, so we'll skip category filtering for now
    // This could be enhanced by adding categorySlug to the FeaturedItem type or using a different approach
    const matchesCategory = !filters.selectedCategory // Skip category filtering until we have proper category data

    // Convert price string to number for comparison
    const priceNumber = parseInt(product.price.replace(/[^\d]/g, ''))
    const matchesPrice =
      priceNumber >= filters.priceRange[0] && priceNumber <= filters.priceRange[1]

    const matchesExpatType =
      !filters.expatType ||
      (filters.expatType === 'verified' && product.isVerified) ||
      (filters.expatType === 'premium' && product.isPremium)

    const matchesLocation =
      !filters.location || generateSlug(product.location).includes(filters.location)

    return matchesSearch && matchesCategory && matchesPrice && matchesExpatType && matchesLocation
  })

  // Sorted products (client-side) to keep pagination, filtering and sorting in sync
  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts]
    const toNumber = (priceStr: string) => parseInt(priceStr?.replace(/[^\d]/g, '')) || 0
    switch (sortBy) {
      case 'price-asc':
        arr.sort((a, b) => toNumber(a.price) - toNumber(b.price))
        break
      case 'price-desc':
        arr.sort((a, b) => toNumber(b.price) - toNumber(a.price))
        break
      case 'rating-desc':
        arr.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'date-desc':
        arr.sort(
          (a: any, b: any) =>
            (new Date(b.createdAt || 0).getTime() || (b as any).id || 0) -
            (new Date(a.createdAt || 0).getTime() || (a as any).id || 0)
        )
        break
      default:
        // relevance (backend order)
        break
    }
    return arr
  }, [filteredProducts, sortBy])

  // Pagination calculations
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = sortedProducts.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    if (isApplyingUrlParams.current) return
    setCurrentPage(1)
  }, [filters, searchQuery])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      // Scroll to top of results
      window.scrollTo({ top: 200, behavior: 'smooth' })
    }
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push('ellipsis')
        pageNumbers.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1)
        pageNumbers.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        pageNumbers.push(1)
        pageNumbers.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push('ellipsis')
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm sticky top-16 z-30 border-b border-gray-200">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-auto md:flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search for cars, electronics, furniture..."
                  className="pl-10 w-full h-11 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value)
                    debouncedUpdateQuery(e.target.value)
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between w-full md:w-auto gap-4">
              {/* Mobile Filter Trigger */}
              <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden flex-1 border-gray-300">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                    {(filters.selectedCategory ||
                      filters.condition ||
                      filters.expatType ||
                      filters.timePosted ||
                      filters.location) && (
                      <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-700">
                        Active
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <FilterContentEl
                    filters={filters}
                    setFilters={setFilters}
                    clearAllFilters={clearAllFilters}
                  />
                </SheetContent>
              </Sheet>

              {/* Sort By Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48 flex-1 border-gray-300">
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
              <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                      : 'hover:bg-gray-200 text-gray-600'
                  }
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  className={
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                      : 'hover:bg-gray-200 text-gray-600'
                  }
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden md:block w-72 lg:w-80 flex-shrink-0">
            <div className="sticky top-32">
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <FilterContentEl
                    filters={filters}
                    setFilters={setFilters}
                    clearAllFilters={clearAllFilters}
                  />
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Product Grid / List */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of{' '}
                  {filteredProducts.length} results
                </h2>
                {totalPages > 1 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Page {currentPage} of {totalPages}
                  </p>
                )}
                {filters.timePosted === '24h' && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Showing newest listings from last 24 hours
                  </p>
                )}
              </div>
            </div>

            {/* Loading state */}
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-brand-primary" />
                  <p className="text-gray-600">Loading products...</p>
                </div>
              </div>
            ) : error ? (
              /* Error state */
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                  <p className="text-red-600 mb-4">Error loading products: {error}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-brand-primary text-white hover:bg-brand-primary/90"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6'
                      : 'space-y-6'
                  }
                >
                  {currentProducts.map((product: FeaturedItem) => (
                    <ProductCard key={product.id} product={product} viewMode={viewMode} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 border-t border-gray-200 pt-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Page Info */}
                      <div className="text-sm text-gray-600">
                        Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(endIndex, filteredProducts.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredProducts.length}</span> results
                      </div>

                      {/* Pagination Controls */}
                      <div className="flex items-center space-x-2">
                        {/* Previous Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="flex items-center gap-1 border-gray-300 hover:bg-gray-50"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>

                        {/* Page Numbers */}
                        <div className="flex items-center space-x-1">
                          {getPageNumbers().map((pageNum, index) =>
                            pageNum === 'ellipsis' ? (
                              <div key={`ellipsis-${index}`} className="px-2">
                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                              </div>
                            ) : (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => goToPage(pageNum as number)}
                                className={
                                  currentPage === pageNum
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600'
                                    : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                                }
                              >
                                {pageNum}
                              </Button>
                            )
                          )}
                        </div>

                        {/* Next Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="flex items-center gap-1 border-gray-300 hover:bg-gray-50"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Mobile Pagination - Simplified */}
                    <div className="sm:hidden mt-4 flex justify-center items-center space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Prev
                      </Button>

                      <span className="text-sm text-gray-600 font-medium">
                        {currentPage} / {totalPages}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="mb-4">
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-700">No products found</h3>
                <p className="text-gray-500 mt-2 mb-6">
                  Try adjusting your search or filters to see more results.
                </p>
                <Button onClick={clearAllFilters} variant="outline" className="border-gray-300">
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
