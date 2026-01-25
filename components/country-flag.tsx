'use client'

import { TZ, KE, UG, RW, US, EU, JP, KR, CN, BI, GB } from 'country-flag-icons/react/3x2'

// Map of country codes to flag components
const flagComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  TZ: TZ,
  KE: KE,
  UG: UG,
  RW: RW,
  BI: BI,
  US: US,
  EU: EU,
  JP: JP,
  KR: KR,
  CN: CN,
  GB: GB,
}

interface CountryFlagProps {
  countryCode: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * SVG-based country flag component that renders consistently across all browsers
 * Uses country-flag-icons package for reliable cross-platform display
 */
export function CountryFlag({ countryCode, className = '', size = 'md' }: CountryFlagProps) {
  // Increased sizes for better visibility on product cards
  const sizeClasses = {
    sm: 'w-5 h-4',
    md: 'w-6 h-5',
    lg: 'w-8 h-6',
  }

  const FlagComponent = flagComponents[countryCode.toUpperCase()]

  if (!FlagComponent) {
    // Fallback to emoji if country not found
    return <span className={className}>🏳️</span>
  }

  return (
    <FlagComponent
      className={`inline-block rounded-sm shadow-sm ${sizeClasses[size]} ${className}`}
    />
  )
}

// Helper function to get flag for location label - supports city names and country patterns
export function getCountryCodeFromLabel(label: string): string | null {
  const lowerLabel = label.toLowerCase()

  // Tanzania cities and patterns
  if (
    lowerLabel.includes('tz') ||
    lowerLabel.includes('tanzania') ||
    lowerLabel.includes('dar es salaam') ||
    lowerLabel.includes('arusha') ||
    lowerLabel.includes('mwanza') ||
    lowerLabel.includes('dodoma') ||
    lowerLabel.includes('zanzibar') ||
    lowerLabel.includes('mbeya') ||
    lowerLabel.includes('morogoro') ||
    lowerLabel.includes('tanga')
  )
    return 'TZ'

  // Kenya cities and patterns
  if (
    lowerLabel.includes('ke') ||
    lowerLabel.includes('kenya') ||
    lowerLabel.includes('nairobi') ||
    lowerLabel.includes('mombasa') ||
    lowerLabel.includes('kisumu') ||
    lowerLabel.includes('nakuru') ||
    lowerLabel.includes('eldoret')
  )
    return 'KE'

  // Uganda cities and patterns
  if (
    lowerLabel.includes('ug') ||
    lowerLabel.includes('uganda') ||
    lowerLabel.includes('kampala') ||
    lowerLabel.includes('entebbe') ||
    lowerLabel.includes('jinja') ||
    lowerLabel.includes('gulu')
  )
    return 'UG'

  // Rwanda cities and patterns
  if (
    lowerLabel.includes('rw') ||
    lowerLabel.includes('rwanda') ||
    lowerLabel.includes('kigali') ||
    lowerLabel.includes('butare') ||
    lowerLabel.includes('gisenyi')
  )
    return 'RW'

  // Burundi cities and patterns
  if (
    lowerLabel.includes('bi') ||
    lowerLabel.includes('burundi') ||
    lowerLabel.includes('bujumbura') ||
    lowerLabel.includes('gitega')
  )
    return 'BI'

  // USA
  if (
    lowerLabel.includes('usa') ||
    lowerLabel.includes('united states') ||
    lowerLabel.includes(' us')
  )
    return 'US'

  // UK
  if (
    lowerLabel.includes('uk') ||
    lowerLabel.includes('united kingdom') ||
    lowerLabel.includes(' bg') ||
    lowerLabel.includes('britain')
  )
    return 'GB'

  return null
}
