'use client'

import { TZ, KE, UG, RW, US, EU, JP, KR, CN } from 'country-flag-icons/react/3x2'

// Map of country codes to flag components
const flagComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  TZ: TZ,
  KE: KE,
  UG: UG,
  RW: RW,
  US: US,
  EU: EU,
  JP: JP,
  KR: KR,
  CN: CN,
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
  const sizeClasses = {
    sm: 'w-4 h-3',
    md: 'w-5 h-4',
    lg: 'w-6 h-4',
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

// Helper function to get flag for location label
export function getCountryCodeFromLabel(label: string): string | null {
  if (label.includes('TZ') || label.includes('Tanzania')) return 'TZ'
  if (label.includes('KE') || label.includes('Kenya')) return 'KE'
  if (label.includes('UG') || label.includes('Uganda')) return 'UG'
  if (label.includes('RW') || label.includes('Rwanda')) return 'RW'
  return null
}
