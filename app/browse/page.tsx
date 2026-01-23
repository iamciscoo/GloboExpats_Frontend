'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { CATEGORIES, ITEM_CONDITIONS, EXPAT_LOCATIONS } from '@/lib/constants'
import { debounce, generateSlug } from '@/lib/utils'
import { ProductCard } from '@/components/ui/product-card'
import { CountryFlag } from '@/components/country-flag'
import { apiClient } from '@/lib/api'
import { transformBackendProduct } from '@/lib/image-utils'
import type { FeaturedItem } from '@/lib/types'
import {
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  X,
  MoreHorizontal,
  Loader2,
  ArrowUp,
} from 'lucide-react'
import { SheetTitle } from '@/components/ui/sheet'

// Calculate real category counts from products
const getCategoryCounts = (products: FeaturedItem[]) => {
  const counts: Record<string, number> = {}
  products.forEach((product) => {
    if (product.category) {
      const slug = generateSlug(product.category)
      counts[slug] = (counts[slug] || 0) + 1
    }
  })
  return counts
}

interface FilterState {
  selectedCategory: string
  priceRange: [number, number]
  priceFilterEnabled: boolean
  condition: string
  expatType: string
  location: string
  country: string
  customCountry: string
  customCity: string
}

interface FilterProps {
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
  clearAllFilters: () => void
  categoryCounts: Record<string, number>
  onFilterChange?: () => void // Add callback for when filters change
}

const FilterContentEl = ({
  filters,
  setFilters,
  clearAllFilters,
  categoryCounts,
  onFilterChange,
}: FilterProps) => {
  const formatWithCommas = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^\d]/g, '')
    if (!numericValue) return ''
    // Add commas
    return parseInt(numericValue, 10).toLocaleString('en-US')
  }

  const parseFormattedNumber = (value: string) => {
    return value.replace(/[^\d]/g, '')
  }

  const updateFilter = useCallback(
    (key: keyof FilterState, value: string | number | string[] | [number, number] | boolean) => {
      const newFilters = {
        ...filters,
        [key]: value,
      }

      // If clearing country, also clear location
      if (key === 'country' && (value === '' || value === 'all')) {
        newFilters.location = ''
        newFilters.customCountry = ''
        newFilters.customCity = ''
      }

      setFilters(newFilters)
      // Notify parent when filter changes (for auto-close on mobile)
      if (onFilterChange) {
        setTimeout(onFilterChange, 100) // Small delay to ensure state updates
      }
    },
    [filters, setFilters, onFilterChange]
  )

  const hasActiveFilters =
    filters.selectedCategory ||
    filters.priceFilterEnabled ||
    filters.condition ||
    filters.location ||
    filters.country ||
    filters.customCountry ||
    filters.customCity

  // Local state for price inputs to allow smooth editing
  // Initialize with formatted values
  const [minPriceInput, setMinPriceInput] = useState(
    filters.priceRange[0] === 0 ? '' : filters.priceRange[0].toLocaleString('en-US')
  )
  const [maxPriceInput, setMaxPriceInput] = useState(
    filters.priceRange[1] === 10000000 ? '' : filters.priceRange[1].toLocaleString('en-US')
  )

  // Debounced price update function
  const debouncedPriceUpdate = useMemo(
    () =>
      debounce((minValue: string, maxValue: string) => {
        const numMin = minValue === '' ? 0 : parseInt(parseFormattedNumber(minValue), 10)
        const numMax = maxValue === '' ? 10000000 : parseInt(parseFormattedNumber(maxValue), 10)
        const validMin = isNaN(numMin) ? 0 : Math.max(0, numMin)
        const validMax = isNaN(numMax) ? 10000000 : Math.max(0, numMax)
        updateFilter('priceRange', [validMin, validMax])
      }, 500),
    [updateFilter]
  )

  // Sync with external filter changes
  useEffect(() => {
    setMinPriceInput(
      filters.priceRange[0] === 0 ? '' : filters.priceRange[0].toLocaleString('en-US')
    )
    setMaxPriceInput(
      filters.priceRange[1] === 10000000 ? '' : filters.priceRange[1].toLocaleString('en-US')
    )
  }, [filters.priceRange])

  // Get unique countries
  // Get unique countries with their codes
  const countries = useMemo(() => {
    const countryMap = new Map<string, string>()
    EXPAT_LOCATIONS.forEach((loc) => {
      if (loc.country && loc.countryCode) {
        countryMap.set(loc.country, loc.countryCode)
      }
    })
    return Array.from(countryMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [])

  // Filter cities based on selected country
  const filteredLocations = filters.country
    ? EXPAT_LOCATIONS.filter((loc) => loc.country === filters.country)
    : EXPAT_LOCATIONS

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

      {/* Price Range - Moved to top for better visibility */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-gray-700">Price Range (TZS)</Label>
          <div className="flex items-center space-x-2">
            <Label htmlFor="price-filter-toggle" className="text-xs text-gray-500">
              Enable
            </Label>
            <Switch
              id="price-filter-toggle"
              checked={filters.priceFilterEnabled}
              onCheckedChange={(checked) => updateFilter('priceFilterEnabled', checked)}
            />
          </div>
        </div>
        <div
          className={`grid grid-cols-2 gap-2 ${!filters.priceFilterEnabled ? 'opacity-50' : ''}`}
        >
          <div className="relative">
            <Input
              type="text"
              placeholder="Min (0)"
              value={minPriceInput}
              onChange={(e) => {
                const formatted = formatWithCommas(e.target.value)
                setMinPriceInput(formatted)
                debouncedPriceUpdate(formatted, maxPriceInput)
              }}
              className="text-sm h-9 pr-3"
            />
          </div>
          <div className="relative">
            <Input
              type="text"
              placeholder="Max (10B)"
              value={maxPriceInput}
              onChange={(e) => {
                const formatted = formatWithCommas(e.target.value)
                setMaxPriceInput(formatted)
                debouncedPriceUpdate(minPriceInput, formatted)
              }}
              className="text-sm h-9 pr-3"
            />
          </div>
        </div>
      </div>

      <Separator />

      <Separator />

      {/* Categories - Collapsible */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="categories" className="border-none">
          <AccordionTrigger className="text-sm font-semibold text-gray-700 py-2 hover:no-underline">
            Categories
            {filters.selectedCategory && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {CATEGORIES.find((c) => c.slug === filters.selectedCategory)?.name ||
                  filters.selectedCategory}
              </Badge>
            )}
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-1">
            <div className="space-y-1 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
              {CATEGORIES.map((category) => {
                const count = categoryCounts[category.slug] || 0
                const isChecked = filters.selectedCategory === category.slug
                return (
                  <div
                    key={category.name}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer group"
                    role="button"
                    tabIndex={0}
                    onClick={() => updateFilter('selectedCategory', isChecked ? '' : category.slug)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        updateFilter('selectedCategory', isChecked ? '' : category.slug)
                      }
                    }}
                  >
                    <Checkbox
                      id={`filter-${category.slug}`}
                      checked={isChecked}
                      className="h-4 w-4 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label
                      htmlFor={`filter-${category.slug}`}
                      className="text-sm text-gray-600 flex-1 cursor-pointer group-hover:text-gray-900 transition-colors flex items-center justify-between"
                    >
                      <span>{category.name}</span>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                        {count.toLocaleString()}
                      </span>
                    </Label>
                  </div>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      {/* Location - Collapsible */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="location" className="border-none">
          <AccordionTrigger className="text-sm font-semibold text-gray-700 py-2 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <span>Location</span>
              <div className="flex items-center gap-2">
                {(filters.country || filters.customCountry) && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                    {filters.country === 'other' ? filters.customCountry : filters.country}
                  </Badge>
                )}
                {(filters.country ||
                  filters.location ||
                  filters.customCountry ||
                  filters.customCity) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-gray-400 hover:text-red-500 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      updateFilter('country', '')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    title="Clear location"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-1">
            {filters.country === 'other' ? (
              <div className="space-y-2">
                <Input
                  placeholder="Enter country..."
                  value={filters.customCountry}
                  onChange={(e) => {
                    updateFilter('customCountry', e.target.value)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="h-9 text-sm"
                />
                <Input
                  placeholder="Enter city..."
                  value={filters.customCity}
                  onChange={(e) => {
                    updateFilter('customCity', e.target.value)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="h-9 text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-600 p-0 h-auto"
                  onClick={() => {
                    setFilters({
                      ...filters,
                      country: '',
                      location: '',
                      customCountry: '',
                      customCity: '',
                    })
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  ← Back to list
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Select
                  value={filters.country || 'all'}
                  onValueChange={(value) => {
                    if (value === 'other') {
                      setFilters({
                        ...filters,
                        country: 'other',
                        location: '',
                      })
                    } else {
                      setFilters({
                        ...filters,
                        country: value === 'all' ? '' : value,
                        location: '',
                      })
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                    if (onFilterChange) {
                      setTimeout(onFilterChange, 100)
                    }
                  }}
                >
                  <SelectTrigger className="text-gray-600 h-9 text-sm border-gray-200 focus:ring-1 focus:ring-blue-500 rounded-md">
                    <SelectValue placeholder="Any country" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]" position="popper" side="bottom" align="start">
                    <SelectItem value="all">Any country</SelectItem>
                    {countries.map(([countryName, countryCode]) => (
                      <SelectItem key={countryName} value={countryName}>
                        <div className="flex items-center gap-2">
                          <CountryFlag countryCode={countryCode} size="sm" />
                          <span>{countryName}</span>
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="other" className="border-t mt-1 pt-1 text-blue-600">
                      Other...
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.location || 'all'}
                  onValueChange={(value) => {
                    updateFilter('location', value === 'all' ? '' : value)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={!filters.country}
                >
                  <SelectTrigger
                    className={`h-9 text-sm border-gray-200 focus:ring-1 focus:ring-blue-500 rounded-md ${!filters.country ? 'opacity-50' : 'text-gray-600'}`}
                  >
                    <SelectValue
                      placeholder={filters.country ? 'Any city' : 'Select country first'}
                    />
                  </SelectTrigger>
                  <SelectContent
                    className="z-[100]"
                    position="popper"
                    side="bottom"
                    align="start"
                    sideOffset={4}
                  >
                    <SelectItem value="all">Any city</SelectItem>
                    {filteredLocations.map((location) => (
                      <SelectItem key={location.value} value={location.value}>
                        <span className="flex items-center gap-2">
                          {location.countryCode && (
                            <CountryFlag countryCode={location.countryCode} size="sm" />
                          )}
                          {location.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      {/* Condition - Collapsible */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="condition" className="border-none">
          <AccordionTrigger className="text-sm font-semibold text-gray-700 py-2 hover:no-underline">
            Condition{' '}
            {filters.condition && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {filters.condition}
              </Badge>
            )}
          </AccordionTrigger>
          <AccordionContent>
            <RadioGroup
              value={filters.condition}
              onValueChange={(value) => updateFilter('condition', value)}
              className="space-y-1 pt-1"
            >
              <div
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => updateFilter('condition', '')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    updateFilter('condition', '')
                  }
                }}
              >
                <RadioGroupItem value="" id="condition-all" className="pointer-events-none" />
                <Label
                  htmlFor="condition-all"
                  className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors flex-1 pointer-events-none"
                >
                  Any condition
                </Label>
              </div>
              {ITEM_CONDITIONS.slice(0, 4).map((condition) => (
                <div
                  key={condition.value}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => updateFilter('condition', condition.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      updateFilter('condition', condition.value)
                    }
                  }}
                >
                  <RadioGroupItem
                    value={condition.value}
                    id={`condition-${condition.value}`}
                    className="pointer-events-none"
                  />
                  <Label
                    htmlFor={`condition-${condition.value}`}
                    className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors flex-1 pointer-events-none"
                  >
                    {condition.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default function BrowsePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialQuery = searchParams.get('q') || ''
  const _initialCategory = searchParams.get('category') || ''
  const initialPage = parseInt(searchParams.get('page') || '1')

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [searchInput, setSearchInput] = useState(initialQuery)
  const [sortBy, setSortBy] = useState('relevance')
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [activePage, setActivePage] = useState(initialPage)
  const [itemsPerPage] = useState(20) // 5 rows × 4 columns = 20 items per page
  const [showScrollTop, setShowScrollTop] = useState(false)
  const isApplyingUrlParams = useRef(false)
  const [isAutoLoading, setIsAutoLoading] = useState(false)

  // Ref for the bottom intersection observer (infinite scroll)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Ref for tracking which page is currently in view
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({})

  // Track scroll position for floating "Back to Top" button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-scroll to top on filter/search change
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Scroll to top on initial page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    window.scrollTo(0, 0) // Fallback for older browsers
  }, [])

  // Backend data state
  const [products, setProducts] = useState<FeaturedItem[]>([])
  const [_totalProductsCount, setTotalProductsCount] = useState(0) // Total count from backend
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})

  // Debounce updates to the actual search query to reduce re-renders and URL churn
  const debouncedUpdateQuery = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value)
      }, 300),
    []
  )

  const initialFilters: FilterState = {
    selectedCategory: '',
    priceRange: [0, 10000000],
    priceFilterEnabled: false,
    condition: '',
    expatType: '',
    location: '',
    country: '',
    customCountry: '',
    customCity: '',
  }

  const [filters, setFilters] = useState<FilterState>(initialFilters)

  // Transform backend ListingItem to FeaturedItem format
  const transformToFeaturedItem = (item: Record<string, unknown>): FeaturedItem => {
    return transformBackendProduct(item)
  }

  // Ref to prevent double-fetching in React Strict Mode
  const hasFetchedProducts = useRef(false)

  // Fetch products from backend (client-side filtering only)
  useEffect(() => {
    // Guard against double-fetch in Strict Mode
    if (hasFetchedProducts.current) return
    hasFetchedProducts.current = true

    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch ALL products from backend with pagination metadata
        // Backend limits to 10 products per page, so we fetch all pages
        // and handle filtering client-side. totalElements gives us the total count for display
        const response = await apiClient.getAllProductsComplete(20) // Fetch up to 20 pages (200 products)
        const { content: productsData, totalElements } = response
        const transformedProducts = productsData
          .map((item) => transformToFeaturedItem(item as Record<string, unknown>))
          .filter((item) => (item.quantity ?? 0) > 0) // Exclude out-of-stock items

        // Randomize products for initial display using Fisher-Yates shuffle
        const shuffled = [...transformedProducts]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }

        setProducts(shuffled)
        setTotalProductsCount(totalElements) // Store backend total count
        setCategoryCounts(getCategoryCounts(transformedProducts))

        // Debug: Log all unique categories found in products
        if (process.env.NODE_ENV === 'development') {
          const uniqueCategories = [
            ...new Set(transformedProducts.map((p) => p.category).filter(Boolean)),
          ]
          console.log('All available categories:', uniqueCategories)
          console.log('Category counts:', getCategoryCounts(transformedProducts))
        }
      } catch (err) {
        // Check if this is an authentication error
        const error = err as Error & { isAuthError?: boolean; statusCode?: number }
        if (error.isAuthError || error.statusCode === 401) {
          // For public browse page, just show a message - don't force login
          setError('Some features require authentication. Please log in to see all products.')
        } else {
          setError(err instanceof Error ? err.message : 'Failed to fetch products')
        }
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
    if (Number.isFinite(page)) {
      if (page > currentPage) {
        setCurrentPage(page)
      }
      setActivePage(page)
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
      priceFilterEnabled: false,
      condition: '',
      expatType: '',
      location: '',
      country: '',
      customCountry: '',
      customCity: '',
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

    // page reflects the active visible page
    if (activePage > 1) params.set('page', activePage.toString())
    else params.delete('page')

    const qs = params.toString()
    router.replace(qs ? `/browse?${qs}` : '/browse', { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filters.selectedCategory, activePage])

  const filteredProducts = products.filter((product) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      product.title.toLowerCase().includes(searchLower) ||
      (product.description?.toLowerCase() || '').includes(searchLower)

    // Category filtering - match against both slug and category name
    let matchesCategory = !filters.selectedCategory
    if (filters.selectedCategory && product.category) {
      const selectedCat = filters.selectedCategory.toLowerCase().replace(/-/g, ' ')
      const productCat = product.category.toLowerCase().replace(/&/g, 'and')
      const productCatSlug = generateSlug(product.category)

      // Debug logging (remove in production)
      if (filters.selectedCategory === 'vehicles') {
        console.log('Vehicle Debug:', {
          selectedCategory: filters.selectedCategory,
          selectedCat,
          productCategory: product.category,
          productCat,
          productCatSlug,
          title: product.title,
        })
      }

      // Try exact match first (both ways: slug-to-slug and name-to-name)
      const exactSlugMatch = productCatSlug === filters.selectedCategory
      const exactNameMatch = productCat === selectedCat
      const partialMatch = productCat.includes(selectedCat) || selectedCat.includes(productCat)

      // Handle specific mappings for better category matching
      const electronicsMatch =
        selectedCat === 'electronics' &&
        (productCat.includes('electronic') ||
          productCat.includes('gadget') ||
          productCat.includes('tech'))
      const furnitureMatch =
        selectedCat === 'furniture' &&
        (productCat.includes('furniture') ||
          productCat.includes('chair') ||
          productCat.includes('table') ||
          productCat.includes('sofa'))
      const clothingMatch =
        selectedCat === 'clothing' &&
        (productCat.includes('clothing') ||
          productCat.includes('fashion') ||
          productCat.includes('apparel') ||
          productCat.includes('wear'))
      const vehiclesMatch =
        (selectedCat === 'vehicles' || filters.selectedCategory === 'vehicles') &&
        (productCat.includes('vehicle') ||
          productCat.includes('car') ||
          productCat.includes('auto') ||
          productCat.includes('motorcycle') ||
          productCat.includes('bike') ||
          productCat.includes('truck') ||
          productCat.includes('scooter') ||
          productCat.includes('transport') ||
          productCat.includes('automotive') ||
          productCatSlug === 'vehicles' ||
          productCat === 'vehicles' ||
          product.category === 'Vehicles')
      const realEstateMatch =
        selectedCat === 'real estate' &&
        (productCat.includes('real') ||
          productCat.includes('estate') ||
          productCat.includes('property') ||
          productCat.includes('house') ||
          productCat.includes('apartment') ||
          productCat.includes('land'))
      const booksMediaMatch =
        selectedCat === 'books media' &&
        (productCat.includes('book') ||
          productCat.includes('media') ||
          productCat.includes('dvd') ||
          productCat.includes('cd') ||
          productCat.includes('magazine'))
      const sportsOutdoorsMatch =
        selectedCat === 'sports outdoors' &&
        (productCat.includes('sport') ||
          productCat.includes('outdoor') ||
          productCat.includes('fitness') ||
          productCat.includes('exercise') ||
          productCat.includes('camping'))
      const homeAppliancesMatch =
        selectedCat === 'home appliances' &&
        (productCat.includes('appliance') ||
          productCat.includes('kitchen') ||
          productCat.includes('home') ||
          productCat.includes('refrigerator') ||
          productCat.includes('washing'))
      const beautyHealthMatch =
        selectedCat === 'beauty health' &&
        (productCat.includes('beauty') ||
          productCat.includes('health') ||
          productCat.includes('cosmetic') ||
          productCat.includes('skincare') ||
          productCat.includes('makeup'))
      const gardenOutdoorsMatch =
        selectedCat === 'garden outdoors' &&
        (productCat.includes('garden') ||
          productCat.includes('outdoor') ||
          productCat.includes('patio') ||
          productCat.includes('plant') ||
          productCat.includes('tool'))
      const artCraftsMatch =
        selectedCat === 'art crafts' &&
        (productCat.includes('art') ||
          productCat.includes('craft') ||
          productCat.includes('paint') ||
          productCat.includes('draw'))

      matchesCategory =
        exactSlugMatch ||
        exactNameMatch ||
        partialMatch ||
        electronicsMatch ||
        furnitureMatch ||
        clothingMatch ||
        vehiclesMatch ||
        realEstateMatch ||
        booksMediaMatch ||
        sportsOutdoorsMatch ||
        homeAppliancesMatch ||
        beautyHealthMatch ||
        gardenOutdoorsMatch ||
        artCraftsMatch

      // Debug logging for matching result
      if (filters.selectedCategory === 'vehicles') {
        console.log('Detailed Vehicle Debug:', {
          exactSlugMatch,
          exactNameMatch,
          partialMatch,
          vehiclesMatch,
          finalResult: matchesCategory,
        })
      }
    }

    // Convert price string to number for comparison
    const priceNumber = parseInt(product.price.replace(/[^\d]/g, '')) || 0
    const matchesPrice =
      !filters.priceFilterEnabled ||
      (priceNumber >= filters.priceRange[0] && priceNumber <= filters.priceRange[1])

    // Debug price filtering for vehicles
    if (filters.selectedCategory === 'vehicles' && matchesCategory) {
      console.log('Price Debug:', {
        title: product.title,
        originalPrice: product.price,
        priceNumber,
        priceRange: filters.priceRange,
        matchesPrice,
      })
    }

    const matchesExpatType = true // Always true since we removed expatType filter

    // Condition filtering using product.condition field
    const matchesCondition =
      !filters.condition || product.condition?.toLowerCase() === filters.condition.toLowerCase()

    // Location filtering
    const matchesLocation =
      filters.country === 'other'
        ? !filters.customCity ||
          product.location?.toLowerCase().includes(filters.customCity.toLowerCase())
        : !filters.location ||
          product.location?.toLowerCase().includes(filters.location.toLowerCase()) ||
          generateSlug(product.location).includes(filters.location)

    // Country filtering
    let matchesCountry = true
    if (filters.country === 'other') {
      matchesCountry =
        !filters.customCountry ||
        product.location?.toLowerCase().includes(filters.customCountry.toLowerCase())
    } else if (filters.country) {
      // Find all valid city slugs for this country
      const countryCitySlugs = EXPAT_LOCATIONS.filter((l) => l.country === filters.country).map(
        (l) => l.value
      )
      // Also get city names (from label, extract just the city name)
      const countryCityNames = EXPAT_LOCATIONS.filter((l) => l.country === filters.country).map(
        (l) =>
          l.label
            .replace(/^[^ ]+ /, '')
            .split(',')[0]
            .toLowerCase() // e.g., "🇹🇿 Dar es Salaam, TZ" -> "dar es salaam"
      )

      const productLocation = product.location?.toLowerCase() || ''
      const productSlug = generateSlug(product.location)
      const countryLower = filters.country.toLowerCase()

      // Check multiple matching strategies:
      // 1. Product location contains country name
      // 2. Product slug matches a city slug
      // 3. Product location contains a city name
      matchesCountry =
        productLocation.includes(countryLower) ||
        countryCitySlugs.some((citySlug) => productSlug.includes(citySlug)) ||
        countryCityNames.some((cityName) => productLocation.includes(cityName))
    }

    // Debug all filter conditions for vehicles
    if (filters.selectedCategory === 'vehicles' && matchesCategory) {
      console.log('All Vehicle Filter Debug:', {
        title: product.title,
        matchesSearch,
        matchesCategory,
        matchesPrice,
        matchesExpatType,
        matchesCondition,
        matchesLocation,
        finalResult:
          matchesSearch &&
          matchesCategory &&
          matchesPrice &&
          matchesExpatType &&
          matchesCondition &&
          matchesLocation &&
          matchesCountry,
      })
    }

    return (
      matchesSearch &&
      matchesCategory &&
      matchesPrice &&
      matchesExpatType &&
      matchesCondition &&
      matchesLocation &&
      matchesCountry
    )
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
        arr.sort((a, b) => {
          const aItem = a as { createdAt?: string; id?: number }
          const bItem = b as { createdAt?: string; id?: number }
          return (
            (new Date(bItem.createdAt || 0).getTime() || bItem.id || 0) -
            (new Date(aItem.createdAt || 0).getTime() || aItem.id || 0)
          )
        })
        break
      default:
        // relevance (backend order)
        break
    }
    return arr
  }, [filteredProducts, sortBy])

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)

  // For infinite scroll, we show all products up to the current page
  const displayedProducts = useMemo(() => {
    return sortedProducts.slice(0, currentPage * itemsPerPage)
  }, [sortedProducts, currentPage, itemsPerPage])

  // Group products by page for marker rendering with unique keys
  const productsByPage = useMemo(() => {
    const pages = []
    // Range: from 1 to current loaded page or at least 1
    const lastPage = Math.max(currentPage, 1)
    for (let i = 1; i <= lastPage; i++) {
      const pageStartIndex = (i - 1) * itemsPerPage
      const pageEndIndex = i * itemsPerPage
      const pageItems = sortedProducts.slice(pageStartIndex, pageEndIndex)
      if (pageItems.length > 0) {
        pages.push({ pageNumber: i, items: pageItems })
      }
    }
    return pages
  }, [sortedProducts, currentPage, itemsPerPage])

  // Extract all currently displayed product IDs for view count tracking
  const currentProductIds = useMemo(
    () => displayedProducts.map((p) => p.id).join(','),
    [displayedProducts]
  )

  // Fetch click counts for currently visible products in background
  // Track which products we've already fetched to avoid re-fetching
  const fetchedClickCountsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (displayedProducts.length === 0) return

    // Filter out products we've already fetched
    const productsToFetch = displayedProducts.filter(
      (p) => !fetchedClickCountsRef.current.has(String(p.id))
    )

    if (productsToFetch.length === 0) return

    // Mark these as being fetched
    productsToFetch.forEach((p) => fetchedClickCountsRef.current.add(String(p.id)))

    // Fetch click counts for visible products and update them
    Promise.all(
      productsToFetch.map(async (product) => {
        try {
          const clickData = await apiClient.getProductClickCount(Number(product.id))
          return { id: product.id, views: clickData.clicks || 0 }
        } catch {
          return { id: product.id, views: product.views || 0 }
        }
      })
    ).then((clickCounts) => {
      // Update products with real click counts
      setProducts((prevProducts) => {
        const updated = prevProducts.map((product) => {
          const clickCount = clickCounts.find((cc) => cc.id === product.id)
          if (clickCount) {
            return { ...product, views: clickCount.views }
          }
          return product
        })
        return updated
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProductIds]) // Only re-run when visible product IDs change

  // Infinite Scroll Trigger
  useEffect(() => {
    if (loading || currentPage >= totalPages) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isAutoLoading) {
          setIsAutoLoading(true)
          setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          setTimeout(() => setIsAutoLoading(false), 500)
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    if (bottomRef.current) {
      observer.observe(bottomRef.current)
    }

    return () => observer.disconnect()
  }, [loading, currentPage, totalPages, isAutoLoading])

  // Page Tracking Observer (Updates activePage as you scroll)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNum = parseInt(entry.target.getAttribute('data-page') || '1')
            if (pageNum !== activePage && !isApplyingUrlParams.current) {
              setActivePage(pageNum)
            }
          }
        })
      },
      { threshold: 0.3, rootMargin: '-10% 0px -80% 0px' }
    )

    Object.values(pageRefs.current).forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [productsByPage, activePage])

  // Reset to page 1 when filters change
  useEffect(() => {
    if (isApplyingUrlParams.current) return
    setCurrentPage(1)
    setActivePage(1)
    scrollToTop()
  }, [filters, searchQuery, scrollToTop])

  const _goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      if (page > currentPage) {
        setCurrentPage(page)
      }
      setActivePage(page)

      // If already loaded, scroll to it
      if (pageRefs.current[page]) {
        pageRefs.current[page]?.scrollIntoView({ behavior: 'smooth' })
      } else {
        // If not loaded, it will be loaded because currentPage changed
        // But we need to wait for render to scroll
        setTimeout(() => {
          pageRefs.current[page]?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
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
      <header className="bg-white shadow-sm md:sticky md:top-16 z-30 border-b border-gray-200">
        <div className="container mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="w-full md:w-auto md:flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  className="pl-9 sm:pl-10 w-full h-10 sm:h-11 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm sm:text-base"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value)
                    debouncedUpdateQuery(e.target.value)
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between w-full md:w-auto gap-2 sm:gap-4">
              {/* Mobile Filter Trigger */}
              <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="md:hidden flex-1 border-gray-300 h-10 text-sm"
                  >
                    <SlidersHorizontal className="mr-1.5 h-4 w-4" />
                    Filters
                    {(filters.selectedCategory ||
                      filters.priceFilterEnabled ||
                      filters.condition ||
                      filters.location) && (
                      <Badge
                        variant="secondary"
                        className="ml-1.5 text-xs bg-blue-100 text-blue-700 px-1.5 py-0"
                      >
                        •
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[85%] sm:w-80 overflow-y-auto [&>button]:hidden"
                  hideOverlay={true}
                >
                  <SheetTitle className="sr-only">Filter Products</SheetTitle>
                  <div className="py-4">
                    <FilterContentEl
                      filters={filters}
                      setFilters={setFilters}
                      clearAllFilters={clearAllFilters}
                      categoryCounts={categoryCounts}
                      onFilterChange={() => setIsFiltersOpen(false)}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort By Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48 flex-1 border-gray-300 h-10 text-sm">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="date-desc">Newest</SelectItem>
                  <SelectItem value="rating-desc">Highest Rating</SelectItem>
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

      <main className="container mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex gap-4 sm:gap-8">
          {/* Desktop Filters */}
          <aside className="hidden md:block w-72 lg:w-80 flex-shrink-0">
            <div className="sticky top-32">
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <FilterContentEl
                    filters={filters}
                    setFilters={setFilters}
                    clearAllFilters={clearAllFilters}
                    categoryCounts={categoryCounts}
                  />
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Product Grid / List */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-sm sm:text-lg font-medium text-gray-500">
                  Showing{' '}
                  <span className="text-gray-900 font-semibold">{displayedProducts.length}</span> of{' '}
                  <span className="text-gray-900 font-semibold">{sortedProducts.length}</span>{' '}
                  results
                </h2>
                {totalPages > 1 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Currently at Page {activePage} of {totalPages}
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
                <div className="space-y-12">
                  {productsByPage.map((group) => (
                    <div
                      key={`page-block-${group.pageNumber}`}
                      data-page={group.pageNumber}
                      ref={(el) => {
                        pageRefs.current[group.pageNumber] = el
                      }}
                      className="scroll-mt-40"
                    >
                      {group.pageNumber > 1 && (
                        <div className="flex items-center gap-4 mb-8">
                          <div className="h-px bg-gray-200 flex-1"></div>
                          <Badge variant="outline" className="text-gray-400 font-medium px-4 py-1">
                            Page {group.pageNumber}
                          </Badge>
                          <div className="h-px bg-gray-200 flex-1"></div>
                        </div>
                      )}
                      <div
                        className={
                          viewMode === 'grid'
                            ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 p-1'
                            : 'space-y-4'
                        }
                      >
                        {group.items.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            viewMode={viewMode}
                            compact={viewMode === 'grid'}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Infinite Scroll Trigger / Loading Indicator */}
                {currentPage < totalPages && (
                  <div ref={bottomRef} className="py-12 flex justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <p className="text-sm text-gray-500 animate-pulse">
                        Loading more products...
                      </p>
                    </div>
                  </div>
                )}

                {/* End of list message */}
                {currentPage === totalPages && totalPages > 1 && (
                  <div className="py-12 text-center">
                    <div className="h-px bg-gray-200 w-24 mx-auto mb-6"></div>
                    <p className="text-gray-400 text-sm italic font-medium">
                      You've reached the end of the market for now.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={scrollToTop}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      <ArrowUp className="h-4 w-4 mr-2" />
                      Back to Top
                    </Button>
                  </div>
                )}

                {/* Footer Navigation / Page Shortcuts */}
                {totalPages > 1 && (
                  <div className="mt-8 border-t border-gray-200 pt-8 pb-12">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="text-sm text-gray-500">Quick Navigation</div>

                      <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 px-4 scrollbar-hide">
                        {getPageNumbers().map((pageNum, index) =>
                          pageNum === 'ellipsis' ? (
                            <div key={`ellipsis-${index}`} className="px-1">
                              <MoreHorizontal className="h-4 w-4 text-gray-300" />
                            </div>
                          ) : (
                            <Button
                              key={pageNum}
                              variant={activePage === pageNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                if ((pageNum as number) > currentPage) {
                                  // If jumping forward beyond loaded, we need to load it
                                  setCurrentPage(pageNum as number)
                                  setActivePage(pageNum as number)
                                  setTimeout(() => {
                                    pageRefs.current[pageNum as number]?.scrollIntoView({
                                      behavior: 'smooth',
                                    })
                                  }, 100)
                                } else {
                                  // Scroll to page
                                  pageRefs.current[pageNum as number]?.scrollIntoView({
                                    behavior: 'smooth',
                                  })
                                }
                              }}
                              className={`min-w-[40px] h-10 ${
                                activePage === pageNum
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                              }`}
                            >
                              {pageNum}
                            </Button>
                          )
                        )}
                      </div>
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

      {/* Floating Back to Top Button */}
      <Button
        onClick={scrollToTop}
        className={`fixed bottom-24 right-6 z-50 rounded-full h-10 px-4 shadow-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all duration-500 flex items-center justify-center gap-2 shadow-blue-500/40 border-2 border-white/20 ${
          showScrollTop
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-10 scale-90 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <ArrowUp className="h-4 w-4" />
        <span className="font-semibold text-xs whitespace-nowrap">Back to top</span>
      </Button>
    </div>
  )
}
