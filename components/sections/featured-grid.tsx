'use client'

import React, { useEffect, useState } from 'react'
import SectionHeader from '@/components/sections/section-header'
import { apiClient } from '@/lib/api'
import { extractContentFromResponse, transformBackendProduct } from '@/lib/image-utils'
import type { FeaturedItem } from '@/lib/types'
import { ProductCard } from '@/components/ui/product-card'
import { trackProductClick } from '@/lib/analytics'
import { Loader2 } from 'lucide-react'

export default function FeaturedGrid() {
  const [items, setItems] = useState<FeaturedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all three sections in parallel to determine which products to exclude
        const [allProductsRes, newListingsRes, topPicksRes] = await Promise.all([
          apiClient.getAllProductsComplete(10), // Fetch up to 10 pages (100 products)
          apiClient.getNewestListings(0, 20),
          apiClient.getTopPicks(0, 30),
        ])

        const allProducts = allProductsRes.content
        const newListingsContent = extractContentFromResponse(newListingsRes)
        const topPicksContent = extractContentFromResponse(topPicksRes)

        // Get IDs of products already shown in New Listings and Top Picks
        const excludedIds = new Set([
          ...newListingsContent.map((p) => (p as Record<string, unknown>).productId),
          ...topPicksContent.map((p) => (p as Record<string, unknown>).productId),
        ])

        if (process.env.NODE_ENV === 'development') {
          console.log(
            `[FeaturedGrid] Fetched ${allProducts.length} products, excluding ${excludedIds.size} from other sections`
          )
        }

        // Filter out products that appear in New Listings or Top Picks
        const uniqueProducts = allProducts.filter((item) => {
          const product = item as Record<string, unknown>
          return !excludedIds.has(product.productId)
        })

        // Randomize the unique products using Fisher-Yates shuffle
        const shuffled = [...uniqueProducts]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }

        // Transform products immediately with default click counts
        // This prevents flickering by showing products right away
        const initialProducts = shuffled.slice(0, 25).map((it) => {
          const product = it as Record<string, unknown>
          const transformed = transformBackendProduct(product)
          return {
            ...transformed,
            views: (product.clickCount as number) || 0,
          }
        })

        // Show products immediately
        setItems(initialProducts)
        setLoading(false)

        // Fetch real click counts in background (non-blocking)
        // This happens after products are displayed to prevent loading delays
        if (process.env.NODE_ENV === 'development') {
          console.log(`[FeaturedGrid] Updating click counts in background...`)
        }

        Promise.all(
          initialProducts.map(async (item, index) => {
            try {
              const clickData = await apiClient.getProductClickCount(Number(item.id))
              return { index, views: clickData.clicks || 0 }
            } catch {
              return { index, views: item.views }
            }
          })
        ).then((results) => {
          // Update products with real click counts
          setItems((prevItems) => {
            const updated = [...prevItems]
            results.forEach(({ index, views }) => {
              if (updated[index]) {
                updated[index] = { ...updated[index], views }
              }
            })
            return updated
          })
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load featured products')
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <section className="py-4 sm:py-6 lg:py-8">
      <div className="mx-4 sm:mx-6 lg:mx-0 lg:pr-8">
        <SectionHeader title="Featured Collection" subtitle="Handpicked items for you" />
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 p-1">
              {items.map((item) => (
                <div key={`featured-${item.id}`}>
                  <ProductCard
                    product={item}
                    onViewDetails={(id) => trackProductClick(id, 'featured')}
                    compact
                  />
                </div>
              ))}
            </div>

            {/* Divider Line */}
            <div className="mt-8 sm:mt-10">
              <hr className="border-t border-gray-200" />
            </div>
          </>
        )}
      </div>
    </section>
  )
}
