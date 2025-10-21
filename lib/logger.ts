/**
 * Production-safe logging utility
 * Only logs in development, suppresses in production
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  /**
   * Development-only info logging
   * Automatically suppressed in production
   */
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },

  /**
   * Development-only debug logging
   * Automatically suppressed in production
   */
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  },

  /**
   * Warning logging (works in all environments)
   * Use for issues that should be monitored
   */
  warn: (...args: unknown[]) => {
    console.warn(...args)
  },

  /**
   * Error logging (works in all environments)
   * Use for actual errors that need attention
   */
  error: (...args: unknown[]) => {
    console.error(...args)
  },
}
