'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Star, MapPin, ArrowRight, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
              'relative overflow-hidden flex-shrink-0 bg-white',
              viewMode === 'list'
                ? 'w-48 aspect-square rounded-l-2xl'
                : 'aspect-square rounded-t-2xl'
            )}
          >
            <Image
              src={product.image || '/assets/images/products/placeholder.svg'}
              alt={`${product.title} product image`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                'object-contain transition-transform duration-300',
                viewMode === 'list' ? '' : 'group-hover:scale-[1.02]'
              )}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 flex-1 flex flex-col h-full">
            {/* Title - Fixed height with line clamping */}
            <div className="mb-2">
              <h3
                id={`product-title-${product.id}`}
                className="font-semibold text-neutral-900 line-clamp-2 group-hover:text-brand-primary transition-colors text-sm sm:text-base leading-tight min-h-[2.5rem]"
              >
                {product.title}
              </h3>
            </div>

            {/* Price - Fixed height */}
            <div
              className="flex items-center gap-1.5 sm:gap-2 mb-2 min-h-[1.75rem]"
              aria-label="Product pricing"
            >
              <span
                className="text-base sm:text-lg font-bold text-brand-secondary"
                aria-label={`Current price ${product.price}`}
              >
                {product.price}
              </span>
              {product.originalPrice && (
                <span
                  className="text-xs sm:text-sm text-neutral-500 line-through"
                  aria-label={`Original price ${product.originalPrice}`}
                >
                  {product.originalPrice}
                </span>
              )}
            </div>

            {/* Seller Info - Fixed height */}
            <div className="flex items-center justify-between mb-2 min-h-[1.25rem]">
              <div
                className="flex items-center gap-1 flex-shrink-0"
                aria-label={`Rating ${product.rating} out of 5 stars with ${product.reviews} reviews`}
              >
                <Star
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-brand-secondary text-brand-secondary flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="text-xs sm:text-sm font-medium">{product.rating}</span>
                <span className="text-xs sm:text-sm text-neutral-500">({product.reviews})</span>
              </div>
              <span
                className="text-xs sm:text-sm text-neutral-600 truncate max-w-[100px] sm:max-w-[120px] ml-1"
                aria-label={`Listed by ${product.listedBy}`}
              >
                {product.listedBy}
              </span>
            </div>

            {/* Location - Fixed height */}
            <div
              className="flex items-center gap-1 mb-2 min-h-[1.25rem]"
              aria-label={`Location: ${product.location}`}
            >
              <MapPin
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400 flex-shrink-0"
                aria-hidden="true"
              />
              <span className="text-xs sm:text-sm text-neutral-600 truncate">
                {product.location}
              </span>
            </div>

            {/* Category Badge - if available */}
            {product.category && (
              <div className="flex items-center gap-1 mb-2 min-h-[1.25rem]">
                <Tag className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" aria-hidden="true" />
                <Badge
                  variant="secondary"
                  className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100"
                  aria-label={`Category: ${product.category}`}
                >
                  {product.category}
                </Badge>
              </div>
            )}

            {/* Bottom Section - Pushed to bottom */}
            <div className="mt-auto pt-2">
              <Button
                className="w-full bg-gradient-to-r from-brand-primary to-brand-accent hover:from-blue-800 hover:to-cyan-600 text-white font-semibold py-1.5 sm:py-2 rounded-full shadow-futuristic hover:shadow-xl focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-all duration-300 group/btn text-xs sm:text-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleViewDetails()
                }}
                aria-label={`View details for ${product.title}`}
              >
                <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                  View Product
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
