/**
 * =============================================================================
 * CURRENCY CONTEXT PROVIDER
 * =============================================================================
 *
 * React Context provider for global currency state management.
 * Integrates with CurrencyConverter singleton for operations.
 *
 * Features:
 * - Global currency selection state
 * - Auto-refresh exchange rates
 * - Cross-tab synchronization
 * - SSR-safe implementation
 * - localStorage persistence
 * - Custom hook for easy access
 *
 * Usage:
 * ```tsx
 * // Wrap app in provider (in layout.tsx):
 * <CurrencyProvider>
 *   <App />
 * </CurrencyProvider>
 *
 * // Use in components:
 * const { selectedCurrency, formatPrice, convertPrice } = useCurrency()
 * const price = formatPrice(1000) // "TSh 1,000" or "$0.40" based on selection
 * ```
 */

'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react'
import type { CurrencyCode, CurrencyContextValue, FormatOptions } from '@/lib/currency-types'
import { CURRENCY_CONFIG } from '@/lib/currency-types'
import { CurrencyConverter, CURRENCIES } from '@/lib/currency-converter'

/**
 * Currency Context
 */
const CurrencyContext = createContext<CurrencyContextValue | null>(null)

/**
 * Currency Provider Props
 */
interface CurrencyProviderProps {
  children: React.ReactNode
  /** Initial currency (defaults to TZS) */
  initialCurrency?: CurrencyCode
  /** Enable auto-refresh of rates */
  enableAutoRefresh?: boolean
}

/**
 * Currency Provider Component
 *
 * Manages global currency state and provides conversion/formatting utilities.
 * Handles cross-tab synchronization and periodic rate updates.
 */
export function CurrencyProvider({
  children,
  initialCurrency,
  enableAutoRefresh = true,
}: CurrencyProviderProps) {
  const converterRef = useRef<CurrencyConverter>(CurrencyConverter.getInstance())
  const converter = converterRef.current

  // State
  const [selectedCurrency, setSelectedCurrencyState] = useState<CurrencyCode>(
    () => initialCurrency || converter.getSelectedCurrency()
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(() => converter.getLastUpdate())
  const [isMounted, setIsMounted] = useState(false)

  /**
   * Change selected currency
   */
  const setSelectedCurrency = useCallback(
    (currency: CurrencyCode) => {
      converter.setSelectedCurrency(currency)
      setSelectedCurrencyState(currency)
      setError(null)
    },
    [converter]
  )

  /**
   * Convert price between currencies
   * Default: from database currency (TZS) to selected currency
   */
  const convertPrice = useCallback(
    (
      amount: number,
      from: CurrencyCode = CURRENCY_CONFIG.BASE_CURRENCY,
      to: CurrencyCode = selectedCurrency
    ): number => {
      try {
        return converter.convert(amount, from, to)
      } catch (err) {
        console.error('[CurrencyProvider] Conversion error:', err)
        return amount
      }
    },
    [converter, selectedCurrency]
  )

  /**
   * Format price with currency symbol
   */
  const formatPrice = useCallback(
    (amount: number, options?: FormatOptions): string => {
      try {
        return converter.format(amount, {
          currency: selectedCurrency,
          ...options,
        })
      } catch (err) {
        console.error('[CurrencyProvider] Formatting error:', err)
        return amount.toString()
      }
    },
    [converter, selectedCurrency]
  )

  /**
   * Get exchange rate between currencies
   */
  const getExchangeRate = useCallback(
    (from: CurrencyCode, to: CurrencyCode): number => {
      try {
        return converter.getExchangeRate(from, to)
      } catch (err) {
        console.error('[CurrencyProvider] Rate fetch error:', err)
        return 1
      }
    },
    [converter]
  )

  /**
   * Refresh exchange rates (placeholder for API integration)
   * Currently uses static rates, but structure is ready for API
   */
  const refreshRates = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API call when backend supports it
      // Example: const response = await fetch('https://api.exchangerate-api.com/v4/latest/TZS')
      // const data = await response.json()
      // converter.updateExchangeRates(data.rates)

      // For now, use static rates (they're already in the converter)
      // Just update the timestamp to show rates were "refreshed"
      const currentRates: Record<CurrencyCode, number> = {
        TZS: CURRENCIES.TZS.exchangeRate,
        USD: CURRENCIES.USD.exchangeRate,
        KES: CURRENCIES.KES.exchangeRate,
        UGX: CURRENCIES.UGX.exchangeRate,
        EUR: CURRENCIES.EUR.exchangeRate,
        JPY: CURRENCIES.JPY.exchangeRate,
        KRW: CURRENCIES.KRW.exchangeRate,
        CNY: CURRENCIES.CNY.exchangeRate,
      }

      converter.updateExchangeRates(currentRates)
      setLastUpdated(Date.now())

      if (process.env.NODE_ENV === 'development') {
        console.log('[CurrencyProvider] Exchange rates refreshed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh rates'
      setError(errorMessage)
      console.error('[CurrencyProvider] Rate refresh failed:', err)
    } finally {
      setIsLoading(false)
    }
  }, [converter])

  /**
   * Handle cross-tab currency changes
   */
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleCurrencyChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ currency: CurrencyCode }>
      if (customEvent.detail?.currency) {
        setSelectedCurrencyState(customEvent.detail.currency)
      }
    }

    window.addEventListener('currencyChanged', handleCurrencyChange)

    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange)
    }
  }, [])

  /**
   * Handle storage changes from other tabs
   */
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'expat_selected_currency' && event.newValue) {
        const newCurrency = event.newValue as CurrencyCode
        if (newCurrency !== selectedCurrency) {
          setSelectedCurrencyState(newCurrency)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [selectedCurrency])

  /**
   * Auto-refresh exchange rates periodically
   */
  useEffect(() => {
    if (!enableAutoRefresh || typeof window === 'undefined') return

    // Check if rates are stale on mount
    if (converter.areRatesStale()) {
      refreshRates()
    }

    // Set up periodic refresh
    const intervalId = setInterval(() => {
      if (converter.areRatesStale()) {
        refreshRates()
      }
    }, CURRENCY_CONFIG.AUTO_REFRESH_INTERVAL)

    return () => {
      clearInterval(intervalId)
    }
  }, [enableAutoRefresh, converter, refreshRates])

  /**
   * Handle component mounting for SSR safety
   */
  useEffect(() => {
    setIsMounted(true)
  }, [])

  /**
   * Memoized context value
   */
  const value = useMemo<CurrencyContextValue>(
    () => ({
      // State
      selectedCurrency,
      currencies: CURRENCIES,
      exchangeRates: null, // Can be populated when API is integrated
      isLoading,
      error,
      lastUpdated,

      // Actions
      setSelectedCurrency,
      convertPrice,
      formatPrice,
      refreshRates,
      getExchangeRate,
    }),
    [
      selectedCurrency,
      isLoading,
      error,
      lastUpdated,
      setSelectedCurrency,
      convertPrice,
      formatPrice,
      refreshRates,
      getExchangeRate,
    ]
  )

  // Don't render children until mounted (prevents SSR hydration issues)
  if (!isMounted) {
    return <>{children}</>
  }

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

/**
 * Custom hook to use currency context
 *
 * @throws Error if used outside CurrencyProvider
 *
 * @example
 * ```tsx
 * const { formatPrice, selectedCurrency, setSelectedCurrency } = useCurrency()
 *
 * // Format a price
 * const price = formatPrice(1000) // "TSh 1,000"
 *
 * // Change currency
 * setSelectedCurrency('USD')
 *
 * // Convert between currencies
 * const usdAmount = convertPrice(1000, 'TZS', 'USD')
 * ```
 */
export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext)

  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }

  return context
}

/**
 * Export CurrencyContext for advanced use cases
 */
export { CurrencyContext }
