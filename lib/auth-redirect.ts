/**
 * Authentication Error Handling Utilities
 *
 * Provides consistent auth error detection and redirect logic across the application.
 * Use these utilities in API error handlers to ensure users are redirected to login
 * when they encounter authentication errors.
 */

import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

/**
 * Extended error type with authentication metadata
 */
export interface ApiError extends Error {
  isAuthError?: boolean
  statusCode?: number
  isVerificationError?: boolean
}

/**
 * Checks if an error is an authentication-related error (401 or 403)
 *
 * @param error - The error object to check
 * @returns true if the error is authentication-related
 */
export function isAuthenticationError(error: unknown): boolean {
  if (!error) return false

  const err = error as ApiError
  return Boolean(err.isAuthError || err.statusCode === 401 || err.statusCode === 403)
}

/**
 * Handles authentication errors by redirecting to login page with return URL
 *
 * @param error - The error object to check
 * @param router - Next.js router instance
 * @param returnPath - Path to return to after login (defaults to current path)
 * @returns true if auth error was handled, false otherwise
 *
 * @example
 * ```tsx
 * try {
 *   const data = await apiClient.getProduct(id)
 * } catch (err) {
 *   if (handleAuthError(err, router, `/product/${id}`)) {
 *     return // Error handled, user being redirected
 *   }
 *   // Handle other errors...
 * }
 * ```
 */
export function handleAuthError(
  error: unknown,
  router: AppRouterInstance,
  returnPath?: string
): boolean {
  if (!isAuthenticationError(error)) {
    return false
  }

  // Get the current path from window if returnPath not provided
  const currentPath = returnPath || (typeof window !== 'undefined' ? window.location.pathname : '/')
  const loginUrl = `/login?returnUrl=${encodeURIComponent(currentPath)}`

  console.log('🔐 Auth error detected, redirecting to:', loginUrl)
  router.push(loginUrl)

  return true
}

/**
 * Gets a user-friendly error message from an error object
 * Handles auth errors, verification errors, and generic errors
 *
 * @param error - The error object
 * @param defaultMessage - Fallback message if error doesn't have one
 * @returns User-friendly error message
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage: string = 'An error occurred'
): string {
  if (!error) return defaultMessage

  const err = error as ApiError

  // Auth errors
  if (isAuthenticationError(err)) {
    return 'Please log in to access this feature'
  }

  // Verification errors
  if (err.isVerificationError) {
    return 'Account verification required. Please verify your email to continue.'
  }

  // Generic error message
  return err.message || defaultMessage
}

/**
 * Options for handling API errors
 */
export interface HandleApiErrorOptions {
  /** Router instance for redirects */
  router: AppRouterInstance
  /** Return path after login (defaults to current path) */
  returnPath?: string
  /** Whether to redirect on auth errors (default: true) */
  redirectOnAuth?: boolean
  /** Custom message handler */
  onError?: (message: string) => void
}

/**
 * Comprehensive API error handler that handles auth, verification, and general errors
 *
 * @param error - The error to handle
 * @param options - Handler options
 * @returns Error message (only if not redirected)
 *
 * @example
 * ```tsx
 * try {
 *   await apiClient.deleteProduct(id)
 * } catch (err) {
 *   const message = handleApiError(err, {
 *     router,
 *     returnPath: '/products',
 *     onError: (msg) => toast.error(msg)
 *   })
 *   if (message) setError(message)
 * }
 * ```
 */
export function handleApiError(error: unknown, options: HandleApiErrorOptions): string | null {
  const { router, returnPath, redirectOnAuth = true, onError } = options

  // Handle auth errors with redirect
  if (redirectOnAuth && handleAuthError(error, router, returnPath)) {
    return null // Redirecting, no message needed
  }

  // Get error message
  const message = getErrorMessage(error)

  // Call custom error handler if provided
  if (onError) {
    onError(message)
  }

  return message
}
