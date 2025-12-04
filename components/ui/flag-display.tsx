/**
 * =============================================================================
 * FLAG DISPLAY COMPONENT
 * =============================================================================
 *
 * Displays country flag emojis with automatic text fallback for browsers
 * that don't support emoji rendering properly.
 *
 * Usage:
 * ```tsx
 * <FlagDisplay emoji="🇹🇿" fallback="TZ" />
 * ```
 */

'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface FlagDisplayProps {
  /** Emoji flag (e.g., "🇹🇿") */
  emoji: string

  /** Text fallback if emoji not supported (e.g., "TZ") */
  fallback: string

  /** Country name for accessibility */
  countryName: string

  /** Additional CSS classes */
  className?: string

  /** Variant for different contexts */
  variant?: 'button' | 'dropdown' | 'minimal'
}

/**
 * Mapping of emoji flags to their text codes
 */
const EMOJI_TO_TEXT: Record<string, string> = {
  '🇹🇿': 'TZ',
  '🇺🇸': 'US',
  '🇰🇪': 'KE',
  '🇺🇬': 'UG',
}

/**
 * Check if browser supports emoji rendering
 * Uses canvas detection method
 */
function supportsEmoji(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) return false

    // Set canvas size
    canvas.width = 20
    canvas.height = 20

    // Draw emoji
    ctx.textBaseline = 'top'
    ctx.font = '16px Arial'
    ctx.fillText('🇹🇿', 0, 0)

    // Check if anything was actually drawn (emoji support)
    const imageData = ctx.getImageData(0, 0, 20, 20)
    const data = imageData.data

    // If all pixels are transparent/black, emoji isn't supported
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 0 || data[i + 1] !== 0 || data[i + 2] !== 0) {
        return true // Found colored pixel, emoji works
      }
    }

    return false
  } catch {
    return false
  }
}

/**
 * FlagDisplay Component
 *
 * Displays emoji flag with automatic fallback to text code
 */
export function FlagDisplay({
  emoji,
  fallback,
  countryName,
  className,
  variant = 'button',
}: FlagDisplayProps) {
  const [showEmoji, setShowEmoji] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Check emoji support on mount
    const hasEmojiSupport = supportsEmoji()
    setShowEmoji(hasEmojiSupport)
  }, [])

  // Get text fallback from emoji if not provided
  const textFallback = fallback || EMOJI_TO_TEXT[emoji] || emoji

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return null
  }

  // Variant-specific styles
  const variantStyles = {
    button: 'text-base leading-none',
    dropdown: 'text-xl leading-none',
    minimal: 'text-sm leading-none',
  }

  const textStyles = {
    button: 'px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-bold tracking-wide',
    dropdown: 'px-2 py-1 bg-slate-200 rounded text-xs font-bold tracking-wide text-slate-700',
    minimal: 'px-1 py-0.5 bg-white/20 rounded text-[9px] font-bold tracking-wide',
  }

  if (showEmoji) {
    // Render emoji with proper font family
    return (
      <span
        className={cn(variantStyles[variant], className)}
        style={{
          fontFamily:
            '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "Android Emoji", sans-serif',
        }}
        aria-label={`${countryName} flag`}
        role="img"
      >
        {emoji}
      </span>
    )
  }

  // Render text fallback as badge
  return (
    <span className={cn(textStyles[variant], className)} aria-label={`${countryName} flag`}>
      {textFallback}
    </span>
  )
}

/**
 * Compact variant - for buttons
 */
export function FlagDisplayCompact(props: Omit<FlagDisplayProps, 'variant'>) {
  return <FlagDisplay {...props} variant="button" />
}

/**
 * Dropdown variant - for menu items
 */
export function FlagDisplayDropdown(props: Omit<FlagDisplayProps, 'variant'>) {
  return <FlagDisplay {...props} variant="dropdown" />
}

/**
 * Minimal variant - smallest size
 */
export function FlagDisplayMinimal(props: Omit<FlagDisplayProps, 'variant'>) {
  return <FlagDisplay {...props} variant="minimal" />
}

export default FlagDisplay
