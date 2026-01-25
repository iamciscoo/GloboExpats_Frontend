/**
 * =============================================================================
 * ENHANCED LOCATION SELECT COMPONENT
 * =============================================================================
 *
 * Two-step location selector: Country -> City with "Other" option for custom input.
 * Provides a more intuitive user experience for location selection.
 *
 * Usage:
 * ```tsx
 * <EnhancedLocationSelect
 *   value={location}
 *   onChange={setLocation}
 *   placeholder="Select your location"
 * />
 * ```
 */

'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EXPAT_LOCATIONS } from '@/lib/constants'
import { CountryFlag } from '@/components/country-flag'
import { cn } from '@/lib/utils'

interface EnhancedLocationSelectProps {
  /** Current selected value (location label or custom text) */
  value: string

  /** Change handler - receives the final location value */
  onValueChange: (value: string) => void

  /** Placeholder text for country select */
  placeholder?: string

  /** Additional CSS class for the container */
  className?: string

  /** Disable the selects */
  disabled?: boolean

  /** Show labels above each select */
  showLabels?: boolean
}

// Country data with country codes for SVG flags
const COUNTRIES = [
  { code: 'TZ', name: 'Tanzania' },
  { code: 'KE', name: 'Kenya' },
  { code: 'UG', name: 'Uganda' },
  { code: 'RW', name: 'Rwanda' },
] as const

/**
 * Get country code for a country name
 */
function getCountryCodeForName(countryName: string): string | undefined {
  const country = COUNTRIES.find((c) => c.name.toLowerCase() === countryName.toLowerCase())
  return country?.code
}

/**
 * Get cities for a given country
 */
function getCitiesForCountry(countryName: string) {
  return EXPAT_LOCATIONS.filter((loc) => loc.country?.toLowerCase() === countryName.toLowerCase())
}

/**
 * Parse an existing location value to extract country and city
 */
function parseLocationValue(value: string): { country: string; city: string; isCustom: boolean } {
  if (!value) {
    return { country: '', city: '', isCustom: false }
  }

  // Try to find a matching location (by label or value)
  const matchedLocation = EXPAT_LOCATIONS.find((loc) => loc.label === value || loc.value === value)

  if (matchedLocation) {
    return {
      country: matchedLocation.country || '',
      city: matchedLocation.label,
      isCustom: false,
    }
  }

  // If no match, it's a custom location
  return { country: '', city: '', isCustom: true }
}

/**
 * EnhancedLocationSelect Component
 */
export function EnhancedLocationSelect({
  value,
  onValueChange,
  placeholder = 'Select country',
  className,
  disabled = false,
  showLabels = true,
}: EnhancedLocationSelectProps) {
  // Parse the initial value
  const parsed = useMemo(() => parseLocationValue(value), [value])

  const [selectedCountry, setSelectedCountry] = useState<string>(parsed.country)
  const [selectedCity, setSelectedCity] = useState<string>(parsed.city)
  const [showOtherInput, setShowOtherInput] = useState<boolean>(parsed.isCustom)
  const [customCountry, setCustomCountry] = useState<string>('')
  const [customCity, setCustomCity] = useState<string>('')

  // Get cities for selected country
  const availableCities = useMemo(() => {
    if (!selectedCountry) return []
    return getCitiesForCountry(selectedCountry)
  }, [selectedCountry])

  // Sync state when value prop changes externally
  useEffect(() => {
    const newParsed = parseLocationValue(value)
    if (newParsed.isCustom) {
      setShowOtherInput(true)
      // Try to parse custom value as "City, Country"
      if (value.includes(',')) {
        const parts = value.split(',').map((p) => p.trim())
        setCustomCity(parts[0] || '')
        setCustomCountry(parts.slice(1).join(', ') || '')
      } else {
        setCustomCity(value)
        setCustomCountry('')
      }
      setSelectedCountry('')
      setSelectedCity('')
    } else if (newParsed.country) {
      setSelectedCountry(newParsed.country)
      setSelectedCity(newParsed.city)
      setShowOtherInput(false)
      setCustomCountry('')
      setCustomCity('')
    }
  }, [value])

  // Handle country selection
  const handleCountryChange = (countryName: string) => {
    if (countryName === 'other') {
      setShowOtherInput(true)
      setSelectedCountry('')
      setSelectedCity('')
      onValueChange('')
      return
    }

    setShowOtherInput(false)
    setCustomCountry('')
    setCustomCity('')
    setSelectedCountry(countryName)
    setSelectedCity('')
    // Don't update parent yet - wait for city selection
  }

  // Handle city selection
  const handleCityChange = (cityLabel: string) => {
    console.log('[EnhancedLocationSelect] handleCityChange called with:', cityLabel)
    if (cityLabel === 'other') {
      setShowOtherInput(true)
      setSelectedCity('')
      // Pre-fill the custom country from the selected country
      setCustomCountry(selectedCountry)
      onValueChange('')
      return
    }

    setSelectedCity(cityLabel)
    console.log('[EnhancedLocationSelect] Calling onValueChange with:', cityLabel)
    onValueChange(cityLabel)
  }

  // Handle custom location input change
  const updateCustomLocation = (city: string, country: string) => {
    setCustomCity(city)
    setCustomCountry(country)
    // Format as "City, Country" if both are provided
    if (city.trim() && country.trim()) {
      onValueChange(`${city.trim()}, ${country.trim()}`)
    } else if (city.trim()) {
      onValueChange(city.trim())
    } else {
      onValueChange('')
    }
  }

  // Reset to select mode
  const handleBackToSelect = () => {
    setShowOtherInput(false)
    setCustomCountry('')
    setCustomCity('')
    setSelectedCountry('')
    setSelectedCity('')
    onValueChange('')
  }

  return (
    <div className={cn('space-y-3', className)}>
      {showOtherInput ? (
        /* Custom Location Input - Separate Country and City */
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Custom Country Input */}
            <div className="space-y-2">
              {showLabels && (
                <Label className="text-sm font-medium text-neutral-700">Country</Label>
              )}
              <Input
                placeholder="e.g., Afghanistan, UAE, UK, Singapore"
                value={customCountry}
                onChange={(e) => updateCustomLocation(customCity, e.target.value)}
                className="h-12 sm:h-14 border-2 border-[#E2E8F0] rounded-xl focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 bg-white"
                disabled={disabled}
              />
            </div>

            {/* Custom City Input */}
            <div className="space-y-2">
              {showLabels && <Label className="text-sm font-medium text-neutral-700">City</Label>}
              <Input
                placeholder="e.g., Dubai, London, Nairobi"
                value={customCity}
                onChange={(e) => updateCustomLocation(e.target.value, customCountry)}
                className="h-12 sm:h-14 border-2 border-[#E2E8F0] rounded-xl focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 bg-white"
                disabled={disabled}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-500">
              Enter your country and city if not in the list
            </p>
            <button
              type="button"
              onClick={handleBackToSelect}
              className="text-sm font-medium text-[#1E3A8A] hover:text-[#1E3A8A]/80 transition-colors"
              disabled={disabled}
            >
              ← Select from list
            </button>
          </div>
        </div>
      ) : (
        /* Country and City Selection */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Country Select */}
          <div className="space-y-2">
            {showLabels && <Label className="text-sm font-medium text-neutral-700">Country</Label>}
            <Select value={selectedCountry} onValueChange={handleCountryChange} disabled={disabled}>
              <SelectTrigger className="h-12 sm:h-14 border-2 border-[#E2E8F0] rounded-xl focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 bg-white">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.name}>
                    <span className="flex items-center gap-2">
                      <CountryFlag countryCode={country.code} size="md" />
                      <span>{country.name}</span>
                    </span>
                  </SelectItem>
                ))}
                <SelectItem value="other" className="border-t mt-1 pt-1">
                  <span className="flex items-center gap-2 text-[#1E3A8A]">
                    <span className="text-lg">🌍</span>
                    <span>Other location...</span>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* City Select */}
          <div className="space-y-2">
            {showLabels && <Label className="text-sm font-medium text-neutral-700">City</Label>}
            <Select
              value={selectedCity}
              onValueChange={handleCityChange}
              disabled={disabled || !selectedCountry}
            >
              <SelectTrigger
                className={cn(
                  'h-12 sm:h-14 border-2 border-[#E2E8F0] rounded-xl focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 bg-white',
                  !selectedCountry && 'opacity-60 cursor-not-allowed'
                )}
              >
                <SelectValue
                  placeholder={
                    selectedCountry ? 'Select city' : '← Choose country first, then city'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableCities.map((city) => {
                  // Extract just the city name from the label (remove country code suffix)
                  const cityName = city.label.replace(/,\s*[A-Z]{2}$/, '')
                  const countryCode = city.countryCode || getCountryCodeForName(city.country || '')
                  return (
                    <SelectItem key={city.value} value={city.label}>
                      <span className="flex items-center gap-2">
                        {countryCode && <CountryFlag countryCode={countryCode} size="sm" />}
                        <span>{cityName}</span>
                      </span>
                    </SelectItem>
                  )
                })}
                {selectedCountry && (
                  <SelectItem value="other" className="border-t mt-1 pt-1">
                    <span className="flex items-center gap-2 text-[#1E3A8A]">
                      <span className="text-lg">✏️</span>
                      <span>Other city...</span>
                    </span>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedLocationSelect
