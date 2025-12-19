/**
 * =============================================================================
 * CURRENCY TYPES & INTERFACES
 * =============================================================================
 *
 * Type definitions for the multi-currency system. Provides type safety
 * for currency operations, conversions, and display formatting.
 *
 * Architecture:
 * - All prices stored in TZS (base currency) in database
 * - Client-side conversion only
 * - Exchange rates cached with timestamps
 * - User preferences persisted in localStorage
 */

/**
 * Supported currency codes
 */
export type CurrencyCode = 'TZS' | 'USD' | 'KES' | 'UGX' | 'EUR' | 'JPY' | 'KRW' | 'CNY'

/**
 * Complete currency information with exchange rate
 */
export interface Currency {
  /** ISO currency code */
  code: CurrencyCode

  /** Currency symbol (e.g., '$', 'TSh') */
  symbol: string

  /** Full currency name */
  name: string

  /** Country/region flag emoji (fallback) */
  flag: string

  /** ISO 3166-1 alpha-2 country code for SVG flag rendering */
  countryCode?: string

  /** Exchange rate relative to base currency (TZS) */
  exchangeRate: number

  /** Number of decimal places to display */
  decimals: number

  /** Symbol position: 'before' or 'after' amount */
  symbolPosition: 'before' | 'after'

  /** Thousands separator (e.g., ',') */
  thousandsSeparator: string

  /** Decimal separator (e.g., '.') */
  decimalSeparator: string
}

/**
 * Exchange rates with timestamp for staleness checking
 */
export interface ExchangeRates {
  /** Timestamp when rates were fetched */
  timestamp: number

  /** Base currency (always TZS) */
  base: CurrencyCode

  /** Exchange rates for all currencies */
  rates: Record<CurrencyCode, number>
}

/**
 * Currency conversion options
 */
export interface ConversionOptions {
  /** Source currency code */
  from: CurrencyCode

  /** Target currency code */
  to: CurrencyCode

  /** Amount to convert */
  amount: number

  /** Whether to round the result */
  round?: boolean
}

/**
 * Price formatting options
 */
export interface FormatOptions {
  /** Currency to format in */
  currency?: CurrencyCode

  /** Show currency symbol */
  showSymbol?: boolean

  /** Show currency code (e.g., 'USD') */
  showCode?: boolean

  /** Use compact notation (e.g., '1.2K') */
  compact?: boolean

  /** Custom decimal places override */
  decimals?: number
}

/**
 * Currency context state
 */
export interface CurrencyContextState {
  /** Currently selected currency */
  selectedCurrency: CurrencyCode

  /** All available currencies */
  currencies: Record<CurrencyCode, Currency>

  /** Current exchange rates */
  exchangeRates: ExchangeRates | null

  /** Whether rates are being fetched */
  isLoading: boolean

  /** Error message if rate fetch fails */
  error: string | null

  /** Last update timestamp */
  lastUpdated: number | null
}

/**
 * Currency context actions
 */
export interface CurrencyContextActions {
  /** Change the selected currency */
  setSelectedCurrency: (currency: CurrencyCode) => void

  /** Convert amount between currencies */
  convertPrice: (amount: number, from?: CurrencyCode, to?: CurrencyCode) => number

  /** Format price with currency symbol */
  formatPrice: (amount: number, options?: FormatOptions) => string

  /** Manually refresh exchange rates */
  refreshRates: () => Promise<void>

  /** Get current exchange rate between currencies */
  getExchangeRate: (from: CurrencyCode, to: CurrencyCode) => number
}

/**
 * Complete currency context value
 */
export type CurrencyContextValue = CurrencyContextState & CurrencyContextActions

/**
 * localStorage keys for persistence
 */
export const CURRENCY_STORAGE_KEYS = {
  SELECTED_CURRENCY: 'expat_selected_currency',
  EXCHANGE_RATES: 'expat_exchange_rates',
  LAST_UPDATE: 'expat_currency_last_update',
} as const

/**
 * Configuration constants
 */
export const CURRENCY_CONFIG = {
  /** Base currency (TZS - Tanzanian Shilling) */
  BASE_CURRENCY: 'TZS' as CurrencyCode,

  /** Database storage currency (TZS - Tanzanian Shilling) */
  DATABASE_CURRENCY: 'TZS' as CurrencyCode,

  /** Exchange rate cache duration (1 hour) */
  RATE_CACHE_DURATION: 60 * 60 * 1000,

  /** Auto-refresh interval (30 minutes) */
  AUTO_REFRESH_INTERVAL: 30 * 60 * 1000,

  /** Default currency for new users (TZS loads first) */
  DEFAULT_CURRENCY: 'TZS' as CurrencyCode,
} as const
