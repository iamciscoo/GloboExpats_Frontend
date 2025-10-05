'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Star, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { FeaturedItem } from '@/lib/types'

interface ProductCardProps {
  product: FeaturedItem
  viewMode?: 'grid' | 'list'
  className?: string
  onViewDetails?: (productId: number) => void
}

export function ProductCard({
  product,
  viewMode = 'grid',
  className,
  onViewDetails,
}: ProductCardProps) {
  const router = useRouter()


  // Debug: Check if product contains any problematic nested objects

  // Check for problematic review objects in product
  Object.keys(product).forEach((key) => {
    const value = (product as any)[key]
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (value.reviewId || value.reviewerName || value.reviewText || value.formattedCreatedAt) {
        console.error(
          '🚨 [PRODUCT-CARD-DEBUG] Found problematic review object in product key:',
          key,
          'value:',
          value
        )
      }
    }
  })

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product.id)
    } else {
      router.push(`/product/${product.id}`)
    }
  }

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-300 hover:shadow-card-modern hover:-translate-y-1 focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2',
        'bg-surface-primary border-neutral-300 rounded-2xl overflow-hidden h-full flex flex-col',
        className
      )}
      role="article"
      aria-labelledby={`product-title-${product.id}`}
      onClick={handleViewDetails}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleViewDetails()
        }
      }}
      tabIndex={0}
    >
      <CardContent className="p-0 h-full flex flex-col">
        <div className={cn('h-full', viewMode === 'list' ? 'flex' : 'flex flex-col')}>
          {/* Image */}
          <div
            className={cn(
              'relative overflow-hidden flex-shrink-0',
              viewMode === 'list' ? 'w-48' : 'rounded-t-2xl'
            )}
          >
            <Image
              src={product.image || '/assets/images/products/placeholder.svg'}
              alt={`${product.title} product image`}
              width={viewMode === 'list' ? 192 : 300}
              height={viewMode === 'list' ? 192 : 200}
              className={cn(
                'object-cover group-hover:scale-105 transition-transform duration-300',
                viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'
              )}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          </div>

          {/* Content */}
          <div className="p-3 flex-1 flex flex-col h-full">
            {/* Title - Fixed height with line clamping */}
            <div className="mb-1.5">
              <h3
                id={`product-title-${product.id}`}
                className="font-semibold text-neutral-900 line-clamp-2 group-hover:text-brand-primary transition-colors text-sm leading-4 min-h-[2rem]"
              >
                {product.title}
              </h3>
            </div>

            {/* Price - Fixed height */}
            <div
              className="flex items-center gap-2 mb-2 min-h-[1.5rem]"
              aria-label="Product pricing"
            >
              <span
                className="text-lg font-bold text-brand-secondary"
                aria-label={`Current price ${product.price}`}
              >
                {product.price}
              </span>
              {product.originalPrice && (
                <span
                  className="text-sm text-neutral-500 line-through"
                  aria-label={`Original price ${product.originalPrice}`}
                >
                  {product.originalPrice}
                </span>
              )}
            </div>

            {/* Seller Info - Fixed height */}
            <div className="flex items-center justify-between mb-1.5 min-h-[1rem]">
              <div
                className="flex items-center gap-1"
                aria-label={`Rating ${product.rating} out of 5 stars with ${product.reviews} reviews`}
              >
                <Star
                  className="w-4 h-4 fill-brand-secondary text-brand-secondary"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-neutral-500">({product.reviews})</span>
              </div>
              <span
                className="text-sm text-neutral-600 truncate max-w-[120px]"
                aria-label={`Listed by ${product.listedBy}`}
              >
                {product.listedBy}
              </span>
            </div>

            {/* Location - Fixed height */}
            <div
              className="flex items-center gap-1 mb-2 min-h-[1rem]"
              aria-label={`Location: ${product.location}`}
            >
              <MapPin className="w-4 h-4 text-neutral-400" aria-hidden="true" />
              <span className="text-sm text-neutral-600">{product.location}</span>
            </div>

            {/* Bottom Section - Pushed to bottom */}
            <div className="mt-auto">
              <Button
                className="w-full bg-gradient-to-r from-brand-primary to-brand-accent hover:from-blue-800 hover:to-cyan-600 text-white font-semibold py-2 rounded-lg shadow-futuristic hover:shadow-xl focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-all duration-300 group/btn text-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleViewDetails()
                }}
                aria-label={`View details for ${product.title}`}
              >
                <span className="flex items-center justify-center gap-2">
                  View Product
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
