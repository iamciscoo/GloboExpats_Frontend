/**
 * =============================================================================
 * LOCATION SELECT COMPONENT
 * =============================================================================
 *
 * Select component for countries and cities with emoji flag support
 * and automatic text fallback.
 *
 * Usage:
 * ```tsx
 * <LocationSelect
 *   locations={EXPAT_LOCATIONS}
 *   value={location}
 *   onChange={setLocation}
 *   placeholder="Select your location"
 * />
 * ```
 */

'use client'

import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FlagDisplay } from '@/components/ui/flag-display'
import type { Location } from '@/lib/types'

interface LocationSelectProps {
  /** Array of location options */
  locations: readonly Location[]

  /** Current selected value */
  value: string

  /** Change handler */
  onValueChange: (value: string) => void

  /** Placeholder text */
  placeholder?: string

  /** Additional CSS class */
  className?: string

  /** Disable the select */
  disabled?: boolean
}

/**
 * Extract emoji and text from location label
 * E.g., "🇹🇿 Dar es Salaam, TZ" => { emoji: "🇹🇿", text: "Dar es Salaam, TZ", fallback: "TZ" }
 */
function parseLocationLabel(label: string): {
  emoji: string
  text: string
  fallback: string
} {
  // Match emoji at the start of the string
  const emojiMatch = label.match(/^([\u{1F1E6}-\u{1F1FF}]{2})\s*/u)

  if (emojiMatch) {
    const emoji = emojiMatch[1]
    const text = label.slice(emojiMatch[0].length)

    // Extract country code fallback (e.g., "TZ" from "Dar es Salaam, TZ")
    const fallbackMatch = text.match(/,\s*([A-Z]{2})$/)
    const fallback = fallbackMatch ? fallbackMatch[1] : ''

    return { emoji, text, fallback }
  }

  // No emoji found, return as-is
  return { emoji: '', text: label, fallback: '' }
}

/**
 * LocationSelect Component
 */
export function LocationSelect({
  locations,
  value,
  onValueChange,
  placeholder = 'Select location',
  className,
  disabled = false,
}: LocationSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {value &&
            (() => {
              const location = locations.find((loc) => loc.label === value)
              if (!location) return value

              const parsed = parseLocationLabel(location.label)

              return (
                <span className="flex items-center gap-2">
                  {parsed.emoji && (
                    <FlagDisplay
                      emoji={parsed.emoji}
                      fallback={
                        parsed.fallback ||
                        (location.country || '').slice(0, 2).toUpperCase() ||
                        'XX'
                      }
                      countryName={location.country || 'Unknown'}
                      variant="minimal"
                    />
                  )}
                  <span>{parsed.text}</span>
                </span>
              )
            })()}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        {locations.map((loc) => {
          const parsed = parseLocationLabel(loc.label)

          return (
            <SelectItem key={loc.value} value={loc.label}>
              <span className="flex items-center gap-2">
                {parsed.emoji && (
                  <FlagDisplay
                    emoji={parsed.emoji}
                    fallback={
                      parsed.fallback || (loc.country || '').slice(0, 2).toUpperCase() || 'XX'
                    }
                    countryName={loc.country || 'Unknown'}
                    variant="dropdown"
                  />
                )}
                <span>{parsed.text}</span>
              </span>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

export default LocationSelect
