/**
 * =============================================================================
 * CURRENCY CONVERTER SINGLETON
 * =============================================================================
 *
 * Singleton utility class for currency conversion and formatting.
 * Provides core currency operations with caching and persistence.
 *
 * Features:
 * - Singleton pattern ensures single instance
 * - localStorage persistence for rates and preferences
 * - Automatic staleness detection
 * - Type-safe currency operations
 * - SSR-compatible (checks for window)
 *
 * Usage:
 * ```tsx
 * const converter = CurrencyConverter.getInstance()
 * const usdAmount = converter.convert(1000, 'TZS', 'USD')
 * const formatted = converter.format(1000, 'TZS')
 * ```
 */

import type { Currency, CurrencyCode, ExchangeRates, FormatOptions } from './currency-types'
import { CURRENCY_CONFIG, CURRENCY_STORAGE_KEYS } from './currency-types'

/**
 * Currency definitions with exchange rates and formatting rules
 * Base currency: TZS (Tanzanian Shilling)
 * Database storage: TZS (Tanzanian Shilling)
 *
 * Exchange rates are relative to 1 TZS (approximate market rates):
 * - 1 TZS = 1 TZS (base)
 * - 1 TZS = 0.0004 USD (2,500 TZS = 1 USD)
 * - 1 TZS = 0.0525 KES (19 TZS = 1 KES)
 * - 1 TZS = 1.48 UGX (0.68 TZS = 1 UGX)
 *
 * Note: Rates are indicative and subject to change
 */
export const CURRENCIES: Record<CurrencyCode, Currency> = {
  TZS: {
    code: 'TZS',
    symbol: 'TSh',
    name: 'Tanzanian Shilling',
    flag: '🇹🇿', // Fallback emoji
    countryCode: 'TZ', // For SVG flag rendering
    exchangeRate: 1, // Base currency
    decimals: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸', // Fallback emoji
    countryCode: 'US', // For SVG flag rendering
    exchangeRate: 0.0004, // 1 TZS = 0.0004 USD (2,500 TZS = 1 USD)
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  KES: {
    code: 'KES',
    symbol: 'KSh',
    name: 'Kenyan Shilling',
    flag: '🇰🇪', // Fallback emoji
    countryCode: 'KE', // For SVG flag rendering
    exchangeRate: 0.0525, // 1 TZS = 0.0525 KES (19 TZS ≈ 1 KES)
    decimals: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  UGX: {
    code: 'UGX',
    symbol: 'USh',
    name: 'Ugandan Shilling',
    flag: '🇺🇬', // Fallback emoji
    countryCode: 'UG', // For SVG flag rendering
    exchangeRate: 1.48, // 1 TZS = 1.48 UGX (0.68 TZS ≈ 1 UGX)
    decimals: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺', // Fallback emoji
    countryCode: 'EU', // For SVG flag rendering
    exchangeRate: 0.00037, // 1 TZS ≈ 0.00037 EUR (2,700 TZS ≈ 1 EUR)
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: '.',
    decimalSeparator: ',',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    flag: '🇯🇵', // Fallback emoji
    countryCode: 'JP', // For SVG flag rendering
    exchangeRate: 0.058, // 1 TZS ≈ 0.058 JPY (17.2 TZS ≈ 1 JPY)
    decimals: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  KRW: {
    code: 'KRW',
    symbol: '₩',
    name: 'Korean Won',
    flag: '🇰🇷', // Fallback emoji
    countryCode: 'KR', // For SVG flag rendering
    exchangeRate: 0.54, // 1 TZS ≈ 0.54 KRW (1.85 TZS ≈ 1 KRW)
    decimals: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    flag: '🇨🇳', // Fallback emoji
    countryCode: 'CN', // For SVG flag rendering
    exchangeRate: 0.0028, // 1 TZS ≈ 0.0028 CNY (357 TZS ≈ 1 CNY)
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
}

/**
 * CurrencyConverter - Singleton utility for currency operations
 */
export class CurrencyConverter {
  private static instance: CurrencyConverter | null = null
  private selectedCurrency: CurrencyCode = CURRENCY_CONFIG.DEFAULT_CURRENCY
  private exchangeRates: ExchangeRates | null = null

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Initialize from localStorage if available (SSR-safe)
    if (typeof window !== 'undefined') {
      this.loadFromStorage()
    }
  }

  /**
   * Get singleton instance
   * @returns CurrencyConverter instance
   */
  public static getInstance(): CurrencyConverter {
    if (!CurrencyConverter.instance) {
      CurrencyConverter.instance = new CurrencyConverter()
    }
    return CurrencyConverter.instance
  }

  /**
   * Load currency preferences and rates from localStorage
   * @private
   */
  private loadFromStorage(): void {
    try {
      // Load selected currency
      const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEYS.SELECTED_CURRENCY)
      if (savedCurrency && this.isValidCurrency(savedCurrency)) {
        this.selectedCurrency = savedCurrency as CurrencyCode
      }

      // Load exchange rates
      const savedRates = localStorage.getItem(CURRENCY_STORAGE_KEYS.EXCHANGE_RATES)
      if (savedRates) {
        const rates = JSON.parse(savedRates) as ExchangeRates

        // Check if rates are stale
        const now = Date.now()
        const age = now - rates.timestamp

        if (age < CURRENCY_CONFIG.RATE_CACHE_DURATION) {
          this.exchangeRates = rates
        } else {
          // Rates are stale, clear them
          localStorage.removeItem(CURRENCY_STORAGE_KEYS.EXCHANGE_RATES)
        }
      }
    } catch (error) {
      console.warn('[CurrencyConverter] Failed to load from storage:', error)
    }
  }

  /**
   * Save currency preferences to localStorage
   * @private
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(CURRENCY_STORAGE_KEYS.SELECTED_CURRENCY, this.selectedCurrency)

      if (this.exchangeRates) {
        localStorage.setItem(
          CURRENCY_STORAGE_KEYS.EXCHANGE_RATES,
          JSON.stringify(this.exchangeRates)
        )
      }
    } catch (error) {
      console.warn('[CurrencyConverter] Failed to save to storage:', error)
    }
  }

  /**
   * Check if currency code is valid
   * @param code - Currency code to validate
   */
  private isValidCurrency(code: string): code is CurrencyCode {
    return code in CURRENCIES
  }

  /**
   * Get currently selected currency
   */
  public getSelectedCurrency(): CurrencyCode {
    return this.selectedCurrency
  }

  /**
   * Set selected currency
   * @param currency - Currency code to select
   */
  public setSelectedCurrency(currency: CurrencyCode): void {
    if (!this.isValidCurrency(currency)) {
      console.warn(`[CurrencyConverter] Invalid currency: ${currency}`)
      return
    }

    this.selectedCurrency = currency
    this.saveToStorage()

    // Dispatch custom event for cross-component sync
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('currencyChanged', {
          detail: { currency },
        })
      )
    }
  }

  /**
   * Get all available currencies
   */
  public getCurrencies(): Record<CurrencyCode, Currency> {
    return CURRENCIES
  }

  /**
   * Get specific currency details
   * @param code - Currency code
   */
  public getCurrency(code: CurrencyCode): Currency {
    return CURRENCIES[code]
  }

  /**
   * Convert amount between currencies
   * @param amount - Amount to convert
   * @param from - Source currency (defaults to DATABASE_CURRENCY TZS)
   * @param to - Target currency (defaults to selected currency)
   * @returns Converted amount
   *
   * Note: Database stores prices in TZS (base currency).
   * Conversion: TZS (base) -> Target Currency
   */
  public convert(
    amount: number,
    from: CurrencyCode = CURRENCY_CONFIG.DATABASE_CURRENCY,
    to: CurrencyCode = this.selectedCurrency
  ): number {
    if (from === to) return amount

    const fromCurrency = CURRENCIES[from]
    const toCurrency = CURRENCIES[to]

    if (!fromCurrency || !toCurrency) {
      console.warn('[CurrencyConverter] Invalid currency in conversion')
      return amount
    }

    // Convert from source to base (TZS), then base to target
    const inBase =
      from === CURRENCY_CONFIG.BASE_CURRENCY ? amount : amount / fromCurrency.exchangeRate

    const converted =
      to === CURRENCY_CONFIG.BASE_CURRENCY ? inBase : inBase * toCurrency.exchangeRate

    return converted
  }

  /**
   * Format amount with currency symbol and proper decimals
   * @param amount - Amount to format (from database, stored in TZS)
   * @param options - Formatting options
   * @returns Formatted price string
   */
  public format(amount: number, options: FormatOptions = {}): string {
    const {
      currency = this.selectedCurrency,
      showSymbol = true,
      showCode = false,
      compact = false,
      decimals,
    } = options

    const curr = CURRENCIES[currency]
    if (!curr) {
      console.warn('[CurrencyConverter] Invalid currency for formatting')
      return amount.toString()
    }

    // Convert from database currency (TZS) to target currency
    const converted = this.convert(amount, CURRENCY_CONFIG.DATABASE_CURRENCY, currency)

    // Determine decimal places
    const decimalPlaces = decimals !== undefined ? decimals : curr.decimals

    // Format with proper decimals and separators
    let formatted: string

    if (compact && Math.abs(converted) >= 1000) {
      // Compact notation (1.2K, 1.5M)
      formatted = this.formatCompact(converted)
    } else {
      // Standard formatting
      formatted = converted.toLocaleString('en-US', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      })
    }

    // Apply currency-specific separators
    formatted = formatted.replace(/,/g, curr.thousandsSeparator)
    if (curr.decimalSeparator !== '.') {
      formatted = formatted.replace(/\./g, curr.decimalSeparator)
    }

    // Add symbol and/or code
    let result = formatted

    if (showSymbol) {
      result =
        curr.symbolPosition === 'before'
          ? `${curr.symbol} ${formatted}`
          : `${formatted} ${curr.symbol}`
    }

    if (showCode) {
      result = `${result} ${currency}`
    }

    return result
  }

  /**
   * Format number in compact notation (K, M, B)
   * @param num - Number to format
   * @private
   */
  private formatCompact(num: number): string {
    const absNum = Math.abs(num)
    const sign = num < 0 ? '-' : ''

    if (absNum >= 1e9) {
      return sign + (absNum / 1e9).toFixed(1) + 'B'
    } else if (absNum >= 1e6) {
      return sign + (absNum / 1e6).toFixed(1) + 'M'
    } else if (absNum >= 1e3) {
      return sign + (absNum / 1e3).toFixed(1) + 'K'
    }

    return num.toString()
  }

  /**
   * Get exchange rate between two currencies
   * @param from - Source currency
   * @param to - Target currency
   */
  public getExchangeRate(from: CurrencyCode, to: CurrencyCode): number {
    if (from === to) return 1

    const fromCurrency = CURRENCIES[from]
    const toCurrency = CURRENCIES[to]

    if (!fromCurrency || !toCurrency) {
      return 1
    }

    // Rate from source to base, then base to target
    const toBase = 1 / fromCurrency.exchangeRate
    const fromBase = toCurrency.exchangeRate

    return toBase * fromBase
  }

  /**
   * Update exchange rates (for API integration)
   * @param rates - New exchange rates
   */
  public updateExchangeRates(rates: Record<CurrencyCode, number>): void {
    this.exchangeRates = {
      timestamp: Date.now(),
      base: CURRENCY_CONFIG.BASE_CURRENCY,
      rates,
    }

    // Update currency objects with new rates
    Object.entries(rates).forEach(([code, rate]) => {
      if (this.isValidCurrency(code)) {
        CURRENCIES[code].exchangeRate = rate
      }
    })

    this.saveToStorage()
  }

  /**
   * Check if exchange rates are stale
   */
  public areRatesStale(): boolean {
    if (!this.exchangeRates) return true

    const age = Date.now() - this.exchangeRates.timestamp
    return age > CURRENCY_CONFIG.RATE_CACHE_DURATION
  }

  /**
   * Get last update timestamp
   */
  public getLastUpdate(): number | null {
    return this.exchangeRates?.timestamp ?? null
  }

  /**
   * Clear all cached data (useful for testing/debugging)
   */
  public clearCache(): void {
    this.exchangeRates = null

    if (typeof window !== 'undefined') {
      localStorage.removeItem(CURRENCY_STORAGE_KEYS.EXCHANGE_RATES)
      localStorage.removeItem(CURRENCY_STORAGE_KEYS.LAST_UPDATE)
    }
  }
}

// Export singleton instance for convenience
export const currencyConverter = CurrencyConverter.getInstance()
