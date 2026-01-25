'use client'

/**
 * =============================================================================
 * FEATURED LISTINGS - ENHANCED WITH TABS AND ENGAGEMENT
 * =============================================================================
 *
 * Features:
 * - Tabbed interface (Featured, New Listings, Top Picks)
 * - Verified seller badges and trust indicators
 * - Interactive product cards with hover effects
 * - Priority focus on listings as requested
 * - Mobile-responsive grid layout
 * - Real-time backend data integration
 *
 * User Experience:
 * - Listings remain the main focus and priority
 * - Added engaging sections without overwhelming content
 * - Clear trust signals for expat community
 * - Live data from backend API
 */

import { useState, useEffect } from 'react'
import { Clock, Crown, TrendingUp, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiClient } from '@/lib/api'
import type { FeaturedItem } from '@/lib/types'
import { transformBackendProduct, extractContentFromResponse } from '@/lib/image-utils'
import { ProductCard } from '@/components/ui/product-card'

export default function FeaturedListings() {
  const [activeTab, setActiveTab] = useState('new')
  const [newListings, setNewListings] = useState<FeaturedItem[]>([])
  const [featuredListings, setFeaturedListings] = useState<FeaturedItem[]>([])
  const [topPicks, setTopPicks] = useState<FeaturedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Transform backend ListingItem to FeaturedItem format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformToFeaturedItem = (item: any): FeaturedItem => {
    // ...existing code...
    const transformed = transformBackendProduct(item)
    // ...existing code...
    return transformed
  }

  // Fetch data from backend APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch data for all tabs in parallel
        const [newResponse, topResponse, allResponse] = await Promise.all([
          apiClient.getNewestListings(0, 9),
          apiClient.getTopPicks(0, 9),
          apiClient.getAllProductsComplete(10), // Fetch up to 10 pages (100 products)
        ])

        // Process newest listings - use centralized content extraction
        const newest = extractContentFromResponse(newResponse)
        setNewListings(newest.slice(0, 9).map(transformToFeaturedItem))

        // Process top picks - use centralized content extraction
        const top = extractContentFromResponse(topResponse)
        setTopPicks(top.slice(0, 9).map(transformToFeaturedItem))

        // Process featured listings - directly access content from complete response
        const all = allResponse.content

        // Debug: Check for problematic objects in product data
        all.forEach((product, index) => {
          if (typeof product === 'object' && product !== null) {
            Object.keys(product).forEach((key) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const value = (product as any)[key]
              if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                if (
                  value.reviewId ||
                  value.reviewerName ||
                  value.reviewText ||
                  value.formattedCreatedAt
                ) {
                  console.warn(
                    '🚨 [FEATURED-DEBUG] Found potential problematic review object in product',
                    index,
                    'key:',
                    key,
                    'value:',
                    value
                  )
                }
              }
            })
          }
        })

        setFeaturedListings(all.slice(0, 9).map(transformToFeaturedItem))
      } catch (err) {
        console.error('Error fetching listings:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch listings')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Loading state
  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-neutral-50 to-blue-50/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-brand-primary" />
              <p className="text-gray-600">Loading featured listings...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-neutral-50 to-blue-50/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading listings: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-neutral-50 to-blue-50/30">
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-6 sm:mb-8 lg:mb-12">
            <div className="bg-gradient-to-r from-white via-neutral-50 to-white p-1 sm:p-2 rounded-xl sm:rounded-2xl shadow-xl border border-neutral-200/60 backdrop-blur-sm w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-3 bg-transparent border-0 h-auto">
                <TabsTrigger
                  value="new"
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-green-50"
                >
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">New Arrivals</span>
                  <span className="sm:hidden">New</span>
                </TabsTrigger>
                <TabsTrigger
                  value="featured"
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-primary data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-blue-50"
                >
                  <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Featured</span>
                </TabsTrigger>
                <TabsTrigger
                  value="top"
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-purple-50"
                >
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Top Picks</span>
                  <span className="sm:hidden">Top</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Tab Content */}
          <TabsContent value="new" className="space-y-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {newListings.map((item: FeaturedItem) => (
                <div key={`new-${item.id}`} className="group">
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="featured" className="space-y-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {featuredListings.map((item: FeaturedItem) => (
                <div key={`featured-${item.id}`} className="group">
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="top" className="space-y-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {topPicks.map((item: FeaturedItem) => (
                <div key={`top-${item.id}`} className="group">
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
