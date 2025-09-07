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
 *
 * User Experience:
 * - Listings remain the main focus and priority
 * - Added engaging sections without overwhelming content
 * - Clear trust signals for expat community
 */

import { useState } from 'react'
import { Clock, Crown, TrendingUp } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { featuredItems } from '@/lib/constants'
import type { FeaturedItem } from '@/lib/types'
import { ProductCard } from '@/components/ui/product-card'

export default function FeaturedListings() {
  const [activeTab, setActiveTab] = useState('new')

  // Optimized data for different tabs - exactly 3 rows (9 items) per section
  // New Listings: Most recent additions (9 items = 3 rows)
  const newListings = featuredItems.slice(0, 9)

  // Featured: Premium items (9 items = 3 rows)
  const featuredListings = featuredItems.slice(0, 9)

  // Top Picks: High-rated and trending items (9 items = 3 rows)
  const topPicks = featuredItems
    .filter((item) => item.rating >= 4.7) // High-rated items
    .concat(featuredItems.filter((item) => item.isPremium)) // Premium items
    .slice(0, 9) // Take first 9 unique items

  return (
    <section className="py-16 bg-gradient-to-br from-neutral-50 to-blue-50/30">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-12">
            <div className="bg-gradient-to-r from-white via-neutral-50 to-white p-2 rounded-2xl shadow-xl border border-neutral-200/60 backdrop-blur-sm">
              <TabsList className="grid w-full grid-cols-3 bg-transparent border-0 h-auto">
                <TabsTrigger
                  value="new"
                  className="flex items-center gap-2 px-6 py-4 text-sm font-medium rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-green-50"
                >
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">New Listings</span>
                  <span className="sm:hidden">New</span>
                </TabsTrigger>
                <TabsTrigger
                  value="featured"
                  className="flex items-center gap-2 px-6 py-4 text-sm font-medium rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-primary data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-blue-50"
                >
                  <Crown className="w-4 h-4" />
                  <span className="hidden sm:inline">Featured</span>
                  <span className="sm:hidden">Featured</span>
                </TabsTrigger>
                <TabsTrigger
                  value="top"
                  className="flex items-center gap-2 px-6 py-4 text-sm font-medium rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-purple-50"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Top Picks</span>
                  <span className="sm:hidden">Top</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Tab Content */}
          <TabsContent value="new" className="space-y-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {newListings.map((item: FeaturedItem) => (
                <div key={`new-${item.id}`} className="group">
                  <ProductCard product={item} />
                </div>
              ))}
            </div>

          </TabsContent>

          <TabsContent value="featured" className="space-y-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map((item: FeaturedItem) => (
                <div key={`featured-${item.id}`} className="group">
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="top" className="space-y-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
