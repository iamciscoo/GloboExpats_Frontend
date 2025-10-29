/**
 * Authentication Error Handling Utilities
 *
 * Provides consistent auth error detection and toast notification logic across the application.
 * Use these utilities in API error handlers to show friendly toast messages
 * when users encounter authentication errors.
 */

import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { toast } from '@/components/ui/use-toast'

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
 * Handles authentication errors by showing a toast notification to login
 *
 * @param error - The error object to check
 * @param router - Next.js router instance (kept for compatibility, not used)
 * @param returnPath - Path context (kept for compatibility, not used)
 * @returns true if auth error was handled, false otherwise
 *
 * @example
 * ```tsx
 * try {
 *   const data = await apiClient.getProduct(id)
 * } catch (err) {
 *   if (handleAuthError(err, router, `/product/${id}`)) {
 *     return // Error handled, toast shown
 *   }
 *   // Handle other errors...
 * }
 * ```
 */
export function handleAuthError(
  error: unknown,
  _router: AppRouterInstance,
  _returnPath?: string
): boolean {
  if (!isAuthenticationError(error)) {
    return false
  }

  console.log('🔐 Auth error detected, showing login toast')

  toast({
    title: 'Login Required',
    description:
      'Please login to access this content or create an account to join our expat community!',
    variant: 'default',
  })

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
  /** Router instance (kept for compatibility) */
  router: AppRouterInstance
  /** Return path (kept for compatibility) */
  returnPath?: string
  /** Whether to show toast on auth errors (default: true) */
  redirectOnAuth?: boolean
  /** Custom message handler */
  onError?: (message: string) => void
}

/**
 * Comprehensive API error handler that handles auth, verification, and general errors
 *
 * @param error - The error to handle
 * @param options - Handler options
 * @returns Error message (only if not handled by auth toast)
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

  // Handle auth errors with toast notification
  if (redirectOnAuth && handleAuthError(error, router, returnPath)) {
    return null // Toast shown, no message needed
  }

  // Get error message
  const message = getErrorMessage(error)

  // Call custom error handler if provided
  if (onError) {
    onError(message)
  }

  return message
}
