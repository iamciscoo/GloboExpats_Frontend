/**
 * =============================================================================
 * FLAG DISPLAY COMPONENT
 * =============================================================================
 *
 * Displays country flags using SVG icons from country-flag-icons package
 * for reliable cross-platform rendering.
 *
 * Usage:
 * ```tsx
 * <FlagDisplay emoji="🇹🇿" fallback="TZ" countryName="Tanzania" />
 * ```
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { TZ, KE, UG, RW, US, JP, CN, BI, GB, EU, KR } from 'country-flag-icons/react/3x2'

interface FlagDisplayProps {
  /** Emoji flag (e.g., "🇹🇿") - used as fallback identifier */
  emoji: string

  /** Text fallback / country code or currency code (e.g., "TZ" or "TZS") */
  fallback: string

  /** Country name for accessibility */
  countryName: string

  /** Additional CSS classes */
  className?: string

  /** Variant for different contexts */
  variant?: 'button' | 'dropdown' | 'minimal'
}

/**
 * Mapping of country codes to SVG flag components
 */
const FLAG_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  TZ: TZ,
  KE: KE,
  UG: UG,
  RW: RW,
  BI: BI,
  US: US,
  JP: JP,
  CN: CN,
  GB: GB,
  EU: EU,
  KR: KR,
}

/**
 * Mapping of currency codes to country codes
 */
const CURRENCY_TO_COUNTRY: Record<string, string> = {
  TZS: 'TZ',
  USD: 'US',
  KES: 'KE',
  UGX: 'UG',
  RWF: 'RW',
  EUR: 'EU',
  JPY: 'JP',
  KRW: 'KR',
  CNY: 'CN',
  GBP: 'GB',
  BIF: 'BI',
}

/**
 * Mapping of emoji flags to their country codes
 */
const EMOJI_TO_CODE: Record<string, string> = {
  '🇹🇿': 'TZ',
  '🇺🇸': 'US',
  '🇰🇪': 'KE',
  '🇺🇬': 'UG',
  '🇷🇼': 'RW',
  '🇧🇮': 'BI',
  '🇪🇺': 'EU',
  '🇯🇵': 'JP',
  '🇰🇷': 'KR',
  '🇨🇳': 'CN',
  '🇬🇧': 'GB',
}

/**
 * Get country code from various input formats
 */
function getCountryCode(fallback: string, emoji: string): string {
  // First try direct country code lookup
  const upperFallback = fallback?.toUpperCase() || ''
  if (FLAG_COMPONENTS[upperFallback]) {
    return upperFallback
  }

  // Try currency code to country code mapping
  if (CURRENCY_TO_COUNTRY[upperFallback]) {
    return CURRENCY_TO_COUNTRY[upperFallback]
  }

  // Try emoji lookup
  if (emoji && EMOJI_TO_CODE[emoji]) {
    return EMOJI_TO_CODE[emoji]
  }

  return upperFallback
}

/**
 * FlagDisplay Component
 *
 * Displays SVG flag with text fallback if flag not available
 */
export function FlagDisplay({
  emoji,
  fallback,
  countryName,
  className,
  variant = 'button',
}: FlagDisplayProps) {
  // Get country code from fallback or emoji
  const countryCode = getCountryCode(fallback, emoji)
  const FlagComponent = FLAG_COMPONENTS[countryCode]

  // Variant-specific styles for SVG flags - LARGER SIZES FOR BETTER VISIBILITY
  const svgStyles = {
    button: 'w-7 h-5 rounded-sm shadow-sm',
    dropdown: 'w-10 h-7 rounded-sm shadow-sm',
    minimal: 'w-6 h-4 rounded-sm',
  }

  // Text fallback styles - for currencies without flags
  const textStyles = {
    button:
      'px-2 py-1 bg-gradient-to-br from-slate-100 to-slate-200 rounded text-[11px] font-bold tracking-wide text-slate-700 border border-slate-300',
    dropdown:
      'px-2.5 py-1.5 bg-gradient-to-br from-slate-100 to-slate-200 rounded text-sm font-bold tracking-wide text-slate-700 border border-slate-300 min-w-[40px] text-center',
    minimal:
      'px-1.5 py-0.5 bg-gradient-to-br from-slate-100 to-slate-200 rounded text-[10px] font-bold tracking-wide text-slate-600 border border-slate-300',
  }

  // If we have an SVG flag component, use it
  if (FlagComponent) {
    return (
      <FlagComponent
        className={cn(svgStyles[variant], 'inline-block', className)}
        aria-label={`${countryName} flag`}
      />
    )
  }

  // Render text fallback as styled badge (for currencies like EUR, KRW without SVG flags)
  const displayCode = countryCode || fallback?.toUpperCase().slice(0, 3) || '??'
  return (
    <span className={cn(textStyles[variant], className)} aria-label={`${countryName} flag`}>
      {displayCode}
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
