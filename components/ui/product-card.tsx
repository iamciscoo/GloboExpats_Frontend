'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'
import { Star, MapPin, ArrowRight, Tag, ShoppingCart, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn, parseNumericPrice } from '@/lib/utils'
import type { FeaturedItem } from '@/lib/types'
import PriceDisplay from '@/components/price-display'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/components/ui/use-toast'

interface ProductCardProps {
  product: FeaturedItem
  viewMode?: 'grid' | 'list'
  className?: string
  onViewDetails?: (productId: number) => void
  compact?: boolean // For mobile slider optimization
}

export function ProductCard({
  product,
  viewMode = 'grid',
  className,
  onViewDetails,
  compact = false,
}: ProductCardProps) {
  const router = useRouter()
  const { addToCart } = useCart()
  const { isLoggedIn } = useAuth()

  // Prevent double clicks with debouncing
  const lastClickTime = useRef<number>(0)
  const isProcessing = useRef<boolean>(false)

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
    // Prevent double clicks - debounce within 1 second
    const now = Date.now()
    if (isProcessing.current || now - lastClickTime.current < 1000) {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[ProductCard] Prevented double click for product ${product.id} (${now - lastClickTime.current}ms since last click)`
        )
      }
      return
    }

    // Update tracking state
    lastClickTime.current = now
    isProcessing.current = true

    // Check if user is logged in before navigating
    if (!isLoggedIn) {
      toast({
        title: 'Login Required',
        description:
          'Please login to view product details or create an account to explore our marketplace!',
        variant: 'default',
      })
      isProcessing.current = false // Reset processing state
      return // Don't navigate
    }

    // Track analytics if callback provided
    if (onViewDetails) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[ProductCard] Tracking click for product ${product.id}: "${product.title}"`)
      }
      onViewDetails(product.id)
    }

    // Navigate to product page
    router.push(`/product/${product.id}`)

    // Reset processing state after a short delay
    setTimeout(() => {
      isProcessing.current = false
    }, 1000)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart({
      id: product.id.toString(),
      productId: product.id,
      title: product.title,
      price: parseNumericPrice(product.price),
      originalPrice: product.originalPrice ? parseNumericPrice(product.originalPrice) : undefined,
      image: product.image || '/assets/images/products/placeholder.svg',
      condition: 'used',
      expatId: product.listedBy || 'unknown',
      expatName: product.listedBy || 'Unknown Seller',
      category: product.category || 'Uncategorized',
      location: product.location || 'Unknown',
      verified: false,
    })
  }

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-300 hover:shadow-card-modern hover:-translate-y-1 focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2',
        'bg-surface-primary border border-neutral-200 rounded-xl overflow-hidden h-full flex flex-col m-1',
        compact && 'border-neutral-300',
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
              viewMode === 'list' ? 'w-48 aspect-[4/3] rounded-l-xl' : 'aspect-[4/3] rounded-t-xl'
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
          <div
            className={cn('flex-1 flex flex-col h-full', compact ? 'p-1.5 sm:p-3' : 'p-2 sm:p-3')}
          >
            {/* Title - Fixed height with line clamping */}
            <div className="mb-1.5">
              <h3
                id={`product-title-${product.id}`}
                className={cn(
                  'font-semibold text-neutral-900 line-clamp-2 group-hover:text-brand-primary transition-colors leading-tight',
                  compact
                    ? 'text-xs sm:text-sm min-h-[2rem] sm:min-h-[2rem]'
                    : 'text-sm sm:text-base min-h-[2.5rem]'
                )}
              >
                {product.title}
              </h3>
            </div>

            {/* Price - Fixed height - Auto-converts to selected currency */}
            <div
              className={cn(
                'flex items-center gap-1 sm:gap-1.5',
                compact ? 'mb-1' : 'mb-1.5',
                'min-h-[1.5rem]'
              )}
              aria-label="Product pricing"
            >
              <PriceDisplay
                price={parseNumericPrice(product.price)}
                size="lg"
                weight="bold"
                variant="secondary"
                className={cn(compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg')}
                showOriginal
              />
              {/* Show original price on desktop/large screens even in compact mode */}
              {product.originalPrice && parseNumericPrice(product.originalPrice) > 0 && (
                <PriceDisplay
                  price={parseNumericPrice(product.originalPrice)}
                  size="sm"
                  weight="normal"
                  variant="muted"
                  className={cn('line-through', compact ? 'hidden sm:block text-xs' : 'text-xs')}
                />
              )}
            </div>

            {/* Rating and Views Info - Fixed height */}
            <div
              className={cn(
                'flex items-center justify-between min-h-[1rem]',
                compact ? 'mb-1' : 'mb-1.5'
              )}
            >
              {/* Always show rating with star, even if 0 */}
              <div
                className="flex items-center gap-1 flex-shrink-0"
                aria-label={`Rating ${product.rating || 0} out of 5 stars with ${product.reviews || 0} reviews`}
              >
                <Star
                  className={cn(
                    'fill-yellow-400 text-yellow-400',
                    'flex-shrink-0',
                    compact ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    'font-medium text-neutral-900',
                    compact ? 'text-xs sm:text-sm' : 'text-sm'
                  )}
                >
                  {(product.rating || 0).toFixed(1)}
                </span>
                <span
                  className={cn('text-neutral-500', compact ? 'text-xs sm:text-sm' : 'text-sm')}
                >
                  ({product.reviews || 0})
                </span>
              </div>

              {/* Views Count */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Eye
                  className={cn(
                    'text-neutral-400',
                    compact ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    'text-neutral-500 font-medium',
                    compact ? 'text-xs sm:text-sm' : 'text-sm'
                  )}
                  aria-label={`${product.views || 0} views`}
                >
                  {product.views || 0}
                </span>
              </div>
            </div>

            {/* Seller Info - Only show in non-compact mode */}
            {!compact && (
              <div className="flex justify-start mb-1.5">
                <span
                  className="text-xs text-neutral-600 truncate max-w-[120px] sm:max-w-[150px]"
                  aria-label={`Listed by ${product.listedBy}`}
                >
                  {product.listedBy}
                </span>
              </div>
            )}

            {/* Location - Fixed height */}
            <div
              className={cn('flex items-center gap-1 min-h-[1rem]', compact ? 'mb-1' : 'mb-1.5')}
              aria-label={`Location: ${product.location}`}
            >
              <MapPin
                className={cn(
                  'text-neutral-400 flex-shrink-0',
                  compact ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  'text-neutral-600 truncate',
                  compact ? 'text-xs sm:text-sm' : 'text-sm'
                )}
              >
                {product.location}
              </span>
            </div>

            {/* Category Badge - if available (hidden in compact mode) */}
            {!compact && product.category && (
              <div className="flex items-center gap-1 mb-1.5 min-h-[1rem]">
                <Tag className="w-3 h-3 text-blue-500 flex-shrink-0" aria-hidden="true" />
                <Badge
                  variant="secondary"
                  className="text-[10px] sm:text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-1.5 py-0.5"
                  aria-label={`Category: ${product.category}`}
                >
                  {product.category}
                </Badge>
              </div>
            )}

            {/* Bottom Section - Pushed to bottom */}
            <div className={cn('mt-auto', compact ? 'pt-1' : 'pt-1.5')}>
              <div className={cn('flex items-center', compact ? 'gap-1' : 'gap-2')}>
                <Button
                  className={cn(
                    'flex-1 bg-gradient-to-r from-brand-primary to-brand-accent hover:from-blue-800 hover:to-cyan-600 text-white font-semibold rounded-full shadow-futuristic hover:shadow-xl focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-all duration-300 group/btn',
                    compact
                      ? 'py-2 sm:py-2 text-xs sm:text-sm h-9 sm:h-10'
                      : 'py-2 sm:py-2.5 text-sm sm:text-base h-10 sm:h-11'
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewDetails()
                  }}
                  aria-label={`View details for ${product.title}`}
                >
                  <span
                    className={cn(
                      'flex items-center justify-center',
                      compact ? 'gap-1 sm:gap-1.5' : 'gap-1.5 sm:gap-2'
                    )}
                  >
                    {compact ? 'View' : 'View Product'}
                    <ArrowRight
                      className={cn(
                        'group-hover/btn:translate-x-1 transition-transform duration-200',
                        compact ? 'w-3.5 h-3.5 sm:w-4 sm:h-4' : 'w-4 h-4 sm:w-4.5 sm:h-4.5'
                      )}
                    />
                  </span>
                </Button>
                <button
                  onClick={handleAddToCart}
                  className={cn(
                    'flex-shrink-0 bg-gradient-to-r from-brand-primary to-brand-accent hover:from-blue-800 hover:to-cyan-600 text-white rounded-full shadow-futuristic hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
                    compact
                      ? 'p-2 sm:p-2.5 w-9 h-9 sm:w-10 sm:h-10'
                      : 'p-2.5 sm:p-3 w-10 h-10 sm:w-11 sm:h-11',
                    'flex items-center justify-center'
                  )}
                  aria-label={`Add ${product.title} to cart`}
                >
                  <ShoppingCart
                    className={cn(compact ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-4.5 h-4.5 sm:w-5 sm:h-5')}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
