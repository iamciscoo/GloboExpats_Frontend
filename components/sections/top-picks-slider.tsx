'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import SectionHeader from '@/components/sections/section-header'
import { apiClient } from '@/lib/api'
import { extractContentFromResponse, transformBackendProduct } from '@/lib/image-utils'
import type { FeaturedItem } from '@/lib/types'
import { ProductCard } from '@/components/ui/product-card'
import { trackProductClick } from '@/lib/analytics'

export default function TopPicksSlider() {
  const [items, setItems] = useState<FeaturedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await apiClient.getTopPicks(0, 30) // Fetch more to have better selection
        const content = extractContentFromResponse(res)

        // Fetch click counts for all products and sort by views
        // NOTE: In production, product-clickCount endpoint requires authentication
        // We'll try to fetch, but fallback gracefully if unauthenticated
        const productsWithViews = await Promise.all(
          content.map(async (it) => {
            const product = it as Record<string, unknown>
            const productId = product.productId as number

            try {
              const clickData = await apiClient.getProductClickCount(productId)
              return {
                ...product,
                views: clickData.clicks || 0,
              }
            } catch {
              // If click count fetch fails (e.g., 302 redirect, auth required), use 0
              // This allows logged-out users to see Trending Now section
              console.log(
                `⚠️ Could not fetch click count for product ${productId} (auth may be required), using 0`
              )
              return {
                ...product,
                views: 0,
              }
            }
          })
        )

        // Sort by views (highest to lowest) and limit to 8 items
        const sortedProducts = productsWithViews
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 8)
          .map((it) => transformBackendProduct(it as Record<string, unknown>))

        setItems(sortedProducts)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load top picks')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const scrollByAmount = (dir: 'left' | 'right') => {
    const el = scrollerRef.current
    if (!el) return
    const amount = el.clientWidth * 0.9
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <section className="py-6 sm:py-8 lg:py-10">
      <div className="mx-4 sm:mx-6 lg:mx-0 lg:pl-6 lg:pr-8">
        <SectionHeader title="Trending Now" subtitle="Most popular items right now" />

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="relative">
            <button
              aria-label="Scroll left"
              onClick={() => scrollByAmount('left')}
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-card hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={scrollerRef}
              className="flex gap-2 sm:gap-4 lg:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth px-2 sm:px-3 lg:px-1 py-2 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {items.map((item) => (
                <div
                  key={`top-${item.id}`}
                  className="snap-start shrink-0 w-[calc(50%-0.5rem)] sm:w-[45%] md:w-[32%] lg:w-[23%]"
                >
                  <ProductCard
                    product={item}
                    onViewDetails={(id) => trackProductClick(id, 'top')}
                    compact
                  />
                </div>
              ))}
            </div>

            <button
              aria-label="Scroll right"
              onClick={() => scrollByAmount('right')}
              className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-card hover:bg-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
