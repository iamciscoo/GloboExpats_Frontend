'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'
import { Star, MapPin, ArrowRight, Tag, ShoppingCart, Eye, Trash2, Calendar, Edit, MoreHorizontal, Heart } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn, parseNumericPrice } from '@/lib/utils'
import type { FeaturedItem } from '@/lib/types'
import PriceDisplay from '@/components/price-display'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/components/ui/use-toast'
import { CountryFlag, getCountryCodeFromLabel } from '@/components/country-flag'

interface ProductCardProps {
  product: FeaturedItem
  viewMode?: 'grid' | 'list'
  className?: string
  onViewDetails?: (productId: number) => void
  onUnsave?: (productId: number) => void
  onEdit?: (productId: number) => void
  onDelete?: (productId: number) => void
  compact?: boolean // For mobile slider optimization
  showDate?: boolean
  status?: string
  showViewButton?: boolean
  showCartButton?: boolean
}

export function ProductCard({
  product,
  viewMode = 'grid',
  className,
  onViewDetails,
  onUnsave,
  onEdit,
  onDelete,
  compact = false,
  showDate = false,
  status,
  showViewButton = true,
  showCartButton = true,
}: ProductCardProps) {
  const router = useRouter()
  const { addToCart } = useCart()
  const { isLoggedIn, user } = useAuth()

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

    // Check if current user is the seller by comparing names
    const userFullName = user ? `${user.firstName} ${user.lastName}`.trim() : ''
    const sellerDisplayName = product.sellerName || product.listedBy || ''
    const isOwnProduct =
      user && sellerDisplayName && userFullName.toLowerCase() === sellerDisplayName.toLowerCase()

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 ProductCard Self-purchase check:', {
        userFullName: userFullName,
        sellerDisplayName: sellerDisplayName,
        isOwnProduct: isOwnProduct,
        willBlock: isOwnProduct ? 'YES - BLOCKING' : 'NO - allowing',
        productId: product.id,
        productTitle: product.title,
      })
    }

    if (isOwnProduct) {
      toast({
        title: '🚫 Cannot Purchase Your Own Item',
        description:
          'You cannot add your own listed items to the cart. Please browse other products from the community!',
        variant: 'default',
      })
      return
    }

    addToCart({
      id: product.id.toString(),
      productId: product.id,
      title: product.title,
      price: parseNumericPrice(product.price),
      originalPrice: product.originalPrice ? parseNumericPrice(product.originalPrice) : undefined,
      image: product.image || '/assets/images/products/placeholder.svg',
      condition: 'used',
      expatId: product.sellerId ? String(product.sellerId) : 'unknown',
      expatName: product.sellerName || product.listedBy || 'Unknown Seller',
      category: product.category || 'Uncategorized',
      location: product.location || 'Unknown',
      verified: false,
    })
  }

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-300 hover:shadow-card-modern hover:-translate-y-1 focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2',
        'bg-surface-primary border border-neutral-200 rounded-xl overflow-hidden h-full flex flex-col',
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
          {/* Image - preserves original proportions */}
          <div
            className={cn(
              'relative overflow-hidden flex-shrink-0 bg-neutral-100 w-full',
              viewMode === 'list' ? 'w-48 aspect-[4/3] rounded-l-xl' : 'aspect-[4/3] rounded-t-xl'
            )}
          >
            <Image
              src={product.image || '/assets/images/products/placeholder.svg'}
              alt={`${product.title} product image`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-1"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
            {/* Status Badge */}
            {status && (
              <Badge
                className={cn(
                  'absolute top-2 left-2 z-10 font-bold px-3 py-1 border-2 border-white/20',
                  status.toLowerCase() === 'sold'
                    ? 'bg-neutral-800 text-white'
                    : 'bg-emerald-500 text-white'
                )}
              >
                {status.toUpperCase()}
              </Badge>
            )}
            {onUnsave && product.id > 0 && (
              <div className="absolute top-2 right-2 z-30">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md border border-neutral-100 transition-all duration-200 group/heart"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm('Are you sure you want to remove this item from your saved products?')) {
                      onUnsave(product.id)
                    }
                  }}
                  title="Unsave: Remove from your list"
                >
                  <Heart className="h-4.5 w-4.5 text-red-500 fill-red-500 group-hover:heart:scale-110 transition-transform" />
                </Button>
              </div>
            )}
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
              {/* Views Count */}
              {product.views !== undefined && product.views > 0 && (
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
                    aria-label={`${product.views} views`}
                  >
                    {product.views}
                  </span>
                </div>
              )}
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

            {/* Location - Fixed height with Country Flag */}
            <div
              className={cn('flex items-center gap-1.5 min-h-[1rem]', compact ? 'mb-1' : 'mb-1.5')}
              aria-label={`Location: ${product.location}`}
            >
              {/* Country flag based on location */}
              {(() => {
                const countryCode = getCountryCodeFromLabel(product.location || '')
                return countryCode ? (
                  <CountryFlag
                    countryCode={countryCode}
                    size={compact ? 'sm' : 'md'}
                    className="flex-shrink-0"
                  />
                ) : (
                  <MapPin
                    className={cn(
                      'text-neutral-400 flex-shrink-0',
                      compact ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'
                    )}
                    aria-hidden="true"
                  />
                )
              })()}
              <span
                className={cn(
                  'text-neutral-600 truncate',
                  compact ? 'text-xs sm:text-sm' : 'text-sm'
                )}
              >
                {product.location}
              </span>
            </div>

            {/* Date Added - New Field */}
            {(showDate || product.createdAt) && (
              <div className={cn('flex items-center gap-1.5 min-h-[1rem]', compact ? 'mb-1' : 'mb-1.5')}>
                <Calendar
                  className={cn(
                    'text-neutral-400 flex-shrink-0',
                    compact ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'
                  )}
                />
                <span className={cn('text-neutral-500 text-[10px] sm:text-xs')}>
                  {product.createdAt ? new Date(product.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : 'Recent'}
                </span>
              </div>
            )}

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
            {(showViewButton || showCartButton || onEdit || onDelete) && (
              <div className={cn('mt-auto', compact ? 'pt-1' : 'pt-1.5')}>
                <div className={cn('flex items-center', compact ? 'gap-1' : 'gap-2')}>
                  {showViewButton && (
                    <Button
                      className={cn(
                        'flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-futuristic hover:shadow-xl focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-all duration-300 group/btn',
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
                  )}
                  {showCartButton && (
                    <button
                      onClick={handleAddToCart}
                      className={cn(
                        'flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-futuristic hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
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
                  )}

                  {/* Management Actions (Dropdown) */}
                  {(onEdit || onDelete) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={cn(
                            'flex-shrink-0 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-full shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
                            compact
                              ? 'p-2 sm:p-2.5 w-9 h-9 sm:w-10 sm:h-10'
                              : 'p-2.5 sm:p-3 w-10 h-10 sm:w-11 sm:h-11',
                            'flex items-center justify-center'
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className={cn(compact ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-4.5 h-4.5 sm:w-5 sm:h-5')} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEdit && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(product.id); }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Listing
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Listing
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
