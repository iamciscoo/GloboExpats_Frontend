/**
 * =============================================================================
 * CURRENCY TOGGLE COMPONENT
 * =============================================================================
 *
 * Interactive currency selector with dropdown menu.
 * Shows current currency, exchange rates, and last update time.
 *
 * Features:
 * - Dropdown menu for currency selection
 * - Display current exchange rate vs base currency
 * - Show sample conversion (e.g., 1000 TZS = X USD)
 * - Last updated timestamp
 * - Loading state during rate updates
 * - Refresh button for manual updates
 * - Mobile-responsive design
 *
 * Usage:
 * ```tsx
 * <CurrencyToggle />
 * <CurrencyToggle variant="compact" />
 * <CurrencyToggle showRates showSample />
 * ```
 */

'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, RefreshCw, Check, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCurrency } from '@/providers/currency-provider'
import type { CurrencyCode } from '@/lib/currency-types'
import { CURRENCY_CONFIG } from '@/lib/currency-types'
import { cn } from '@/lib/utils'
import { FlagDisplay } from '@/components/ui/flag-display'

/**
 * Currency Toggle Props
 */
export interface CurrencyToggleProps {
  /** Display variant */
  variant?: 'default' | 'compact' | 'minimal'

  /** Show exchange rates in dropdown */
  showRates?: boolean

  /** Show sample conversion (unused but kept for future feature) */
  _showSample?: boolean

  /** Sample amount for conversion example (unused but kept for future feature) */
  _sampleAmount?: number

  /** Custom CSS classes */
  className?: string

  /** Button size */
  size?: 'sm' | 'lg'

  /** Show refresh button */
  showRefresh?: boolean
}

/**
 * Format timestamp to relative time
 */
function formatRelativeTime(timestamp: number | null): string {
  if (!timestamp) return 'Never'

  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

/**
 * CurrencyToggle Component
 *
 * Dropdown menu for selecting currency with detailed information.
 */
export function CurrencyToggle({
  variant = 'default',
  showRates = true,
  _showSample = false,
  _sampleAmount = 1000,
  className,
  size = 'sm',
  showRefresh = false,
}: CurrencyToggleProps) {
  const {
    selectedCurrency,
    currencies,
    setSelectedCurrency,
    refreshRates,
    getExchangeRate,
    isLoading,
    lastUpdated,
  } = useCurrency()

  const [isMounted, setIsMounted] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle refresh click
  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRefreshing(true)
    try {
      await refreshRates()
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!isMounted) {
    return null
  }

  const currentCurrency = currencies[selectedCurrency]

  // Map emoji flags to text codes for fallback
  const flagToText: Record<string, string> = {
    '🇹🇿': 'TZ',
    '🇺🇸': 'US',
    '🇰🇪': 'KE',
    '🇺🇬': 'UG',
  }

  // Button size classes
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    lg: 'h-10 px-4 text-base',
  }

  return (
    <div
      className={cn('inline-flex items-center gap-2', className)}
      data-tutorial="currency-selector"
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size={size}
            className={cn(
              'font-medium',
              variant === 'compact' && 'px-2',
              variant === 'minimal' && 'h-auto p-1',
              'text-white bg-transparent hover:bg-white/10 hover:text-white',
              'border border-transparent hover:border-white/20',
              sizeClasses[size]
            )}
            aria-label="Select currency"
          >
            <FlagDisplay
              emoji={currentCurrency.flag}
              fallback={flagToText[currentCurrency.flag] || selectedCurrency}
              countryName={currentCurrency.name}
              variant="button"
              className="mr-1.5"
            />
            {variant !== 'minimal' && <span className="font-semibold">{selectedCurrency}</span>}
            <ChevronDown className="ml-1 h-3 w-3 opacity-70" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-80 bg-white border border-slate-200 shadow-xl z-[100]"
        >
          <DropdownMenuLabel className="flex items-center justify-between">
            <span className="text-slate-700">Select Currency</span>
            {showRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-6 px-2 text-xs"
              >
                <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
              </Button>
            )}
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Currency options - TZS first, USD second, CNY third, then East African, then others */}
          {Object.values(currencies)
            .sort((a, b) => {
              // Define custom order: TZS first, then USD, then CNY, then regional, then international
              const order: Record<string, number> = {
                TZS: 0, // Base currency first
                USD: 1, // US Dollar second
                CNY: 2, // Chinese Yuan third
                KES: 3, // East African currencies
                UGX: 4,
                EUR: 5, // International currencies
                JPY: 6,
                KRW: 7,
              }
              const orderA = order[a.code] ?? 99
              const orderB = order[b.code] ?? 99
              return orderA - orderB
            })
            .map((currency) => {
              const isSelected = currency.code === selectedCurrency
              const rate = getExchangeRate(CURRENCY_CONFIG.BASE_CURRENCY, currency.code)
              // Calculate how much 1 unit of this currency equals in TZS
              const oneUnitInTZS = currency.code === CURRENCY_CONFIG.BASE_CURRENCY ? 1 : 1 / rate

              return (
                <DropdownMenuItem
                  key={currency.code}
                  onClick={() => setSelectedCurrency(currency.code as CurrencyCode)}
                  className={cn(
                    'cursor-pointer px-3 py-2.5',
                    'text-slate-900 hover:bg-slate-100',
                    'focus:bg-slate-100 focus:text-slate-900',
                    isSelected && 'bg-slate-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <FlagDisplay
                      emoji={currency.flag}
                      fallback={flagToText[currency.flag] || currency.code}
                      countryName={currency.name}
                      variant="dropdown"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{currency.code}</span>
                        {isSelected && <Check className="h-3 w-3 text-green-600" />}
                      </div>
                      <span className="text-xs text-slate-500">{currency.name}</span>
                      {showRates && currency.code !== CURRENCY_CONFIG.DATABASE_CURRENCY && (
                        <span className="text-xs text-slate-400 mt-0.5">
                          Rate: 1 {currency.code} ={' '}
                          {oneUnitInTZS >= 1
                            ? Math.round(oneUnitInTZS).toLocaleString('en-US')
                            : oneUnitInTZS.toFixed(2)}{' '}
                          {CURRENCY_CONFIG.DATABASE_CURRENCY}
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              )
            })}

          {/* Last updated info */}
          {lastUpdated && (
            <>
              <DropdownMenuSeparator />
              <div className="px-3 py-2 text-xs text-slate-500 flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Updated {formatRelativeTime(lastUpdated)}</span>
                {isLoading && (
                  <span className="ml-auto">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  </span>
                )}
              </div>
            </>
          )}

          {/* Disclaimer */}
          <DropdownMenuSeparator />
          <div className="px-3 py-2 text-[11px] text-slate-500 leading-tight">
            Prices update automatically. Exchange rates are indicative. TZS is base currency for
            purchase.
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/**
 * Compact variant - for mobile or tight spaces
 */
export function CurrencyToggleCompact(props: Omit<CurrencyToggleProps, 'variant'>) {
  return <CurrencyToggle {...props} variant="compact" />
}

/**
 * Minimal variant - just flag and dropdown
 */
export function CurrencyToggleMinimal(props: Omit<CurrencyToggleProps, 'variant'>) {
  return <CurrencyToggle {...props} variant="minimal" />
}

/**
 * Export default
 */
export default CurrencyToggle
