'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import SectionHeader from '@/components/sections/section-header'
import { apiClient } from '@/lib/api'
import { extractContentFromResponse, transformBackendProduct } from '@/lib/image-utils'
import type { FeaturedItem } from '@/lib/types'
import { ProductCard } from '@/components/ui/product-card'
import { trackProductClick } from '@/lib/analytics'
import { ErrorState } from '@/components/ui/error-state'

export default function TopPicksSlider() {
  const [items, setItems] = useState<FeaturedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  // Scroll to start when items are loaded
  useEffect(() => {
    if (items.length > 0 && scrollerRef.current) {
      scrollerRef.current.scrollLeft = 0
    }
  }, [items])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await apiClient.getTopPicks(0, 30) // Fetch more to have better selection
      const content = extractContentFromResponse(res)

      if (process.env.NODE_ENV === 'development') {
        console.log(`[TopPicks] Fetched ${content.length} products`)
      }

      // Show products immediately with default counts to prevent blocking
      const initialProducts = content
        .slice(0, 8)
        .map((it) => {
          const product = it as Record<string, unknown>
          const transformed = transformBackendProduct(product)
          return {
            ...transformed,
            views: 0, // Initialize to 0 to prevent flashing "1" from backend list API
          }
        })
        .filter((item) => item.quantity > 0)

      setItems(initialProducts)
      setLoading(false)

      // Fetch real click counts in background
      if (process.env.NODE_ENV === 'development') {
        console.log(`[TopPicks] Updating click counts in background...`)
      }

      Promise.all(
        content.map(async (it) => {
          const product = it as Record<string, unknown>
          const productId = product.productId as number

          try {
            const clickData = await apiClient.getProductClickCount(productId)
            return {
              ...product,
              views: clickData.clicks || 0,
            } as Record<string, unknown> & { views: number }
          } catch {
            return {
              ...product,
              views: (product.clickCount as number) || 0,
            } as Record<string, unknown> & { views: number }
          }
        })
      ).then((productsWithRealViews) => {
        // Sort by REAL view counts (highest to lowest)
        const sortedProducts = productsWithRealViews
          .sort((a, b) => {
            const aViews = a.views || 0
            const bViews = b.views || 0

            if (bViews !== aViews) {
              return bViews - aViews
            }
            const aProductId = (a.productId as number) || 0
            const bProductId = (b.productId as number) || 0
            return aProductId - bProductId
          })
          .slice(0, 8)
          .map((it) => {
            const transformed = transformBackendProduct(it as Record<string, unknown>)
            return {
              ...transformed,
              views: it.views || 0,
            }
          })
          .filter((item) => item.quantity > 0)

        if (process.env.NODE_ENV === 'development') {
          console.log(`[TopPicks] Final sorted products:`, sortedProducts.length)
        }

        setItems(sortedProducts)
      })
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load top picks'))
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only load once on mount

  const scrollByAmount = (dir: 'left' | 'right') => {
    const el = scrollerRef.current
    if (!el) return
    const amount = el.clientWidth * 0.9
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <section className="py-3 sm:py-4 lg:py-5">
      <div className="mx-4 sm:mx-6 lg:mx-0">
        <SectionHeader title="Trending Now" subtitle="Most popular items right now" />

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
          </div>
        ) : error ? (
          <ErrorState
            type={
              (error as Error & { isGatewayError?: boolean }).isGatewayError ? 'gateway' : 'server'
            }
            message={error.message}
            onRetry={loadData}
            compact
          />
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
