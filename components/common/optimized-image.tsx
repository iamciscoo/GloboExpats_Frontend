/**
 * Optimized Image Component
 *
 * A wrapper around Next.js Image with automatic optimization features:
 * - Lazy loading by default
 * - Blur placeholder for better UX
 * - Automatic error handling
 * - Priority loading for above-the-fold images
 */

'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends Omit<ImageProps, 'placeholder' | 'onError'> {
  /** Whether this image is above the fold (disables lazy loading) */
  priority?: boolean
  /** Fallback image URL if main image fails to load */
  fallbackSrc?: string
  /** Additional className for the container */
  containerClassName?: string
}

/**
 * Optimized image component with automatic lazy loading and blur placeholders
 *
 * @example
 * ```tsx
 * <OptimizedImage
 *   src="/product-image.jpg"
 *   alt="Product name"
 *   width={400}
 *   height={300}
 *   priority={false}
 * />
 * ```
 */
export function OptimizedImage({
  src,
  alt,
  className,
  containerClassName,
  priority = false,
  fallbackSrc = '/placeholder.svg',
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      <Image
        src={imgSrc}
        alt={alt}
        className={cn(
          'transition-all duration-300',
          isLoading ? 'scale-105 blur-sm' : 'scale-100 blur-0',
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImgSrc(fallbackSrc)
          setIsLoading(false)
        }}
        loading={priority ? 'eager' : 'lazy'}
        priority={priority}
        {...props}
      />

      {isLoading && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"
          aria-hidden="true"
        />
      )}
    </div>
  )
}

/**
 * Product image component with standard sizing and optimizations
 */
export function ProductImage({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string
  alt: string
  className?: string
  priority?: boolean
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={400}
      height={300}
      className={cn('object-cover', className)}
      priority={priority}
    />
  )
}

/**
 * Avatar image component with standard sizing
 */
export function AvatarImage({
  src,
  alt,
  size = 40,
  className,
}: {
  src: string
  alt: string
  size?: number
  className?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full object-cover', className)}
      priority={false}
    />
  )
}
