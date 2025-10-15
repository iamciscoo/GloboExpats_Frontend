/**
 * Verification Utilities
 *
 * Centralized logic for handling user verification states and requirements.
 * Provides consistent verification checking across the application.
 */

import type { User } from './types'

/**
 * Check if a user can perform buy actions
 * Requires backend verification (email verified)
 *
 * NOTE: Does NOT check buyer_profile existence - that's a backend database issue
 */
export function canUserBuy(user: User | null | undefined): boolean {
  if (!user) return false

  // PRIMARY: Check backend verification status
  if (user.backendVerificationStatus === 'VERIFIED') return true

  // SECONDARY: Check roles (SELLER role includes buyer permissions)
  if (user.roles?.some((r) => r.roleName === 'SELLER' || r.roleName === 'ADMIN')) return true

  // TERTIARY: Check legacy flags
  if (user.isVerified === true) return true

  // FALLBACK: Check verification status object (may be stale)
  if (user.verificationStatus?.canBuy === true) return true

  return false
}

/**
 * Check if a user can perform sell actions
 * Requires backend verification (email verified)
 *
 * NOTE: Does NOT check buyer_profile existence - that's a backend database issue
 */
export function canUserSell(user: User | null | undefined): boolean {
  if (!user) return false

  // PRIMARY: Check backend verification status
  if (user.backendVerificationStatus === 'VERIFIED') return true

  // SECONDARY: Check roles (SELLER role required)
  if (user.roles?.some((r) => r.roleName === 'SELLER' || r.roleName === 'ADMIN')) return true

  // TERTIARY: Check legacy flags
  if (user.isVerified === true) return true

  // FALLBACK: Check verification status object (may be stale)
  if (user.verificationStatus?.canSell === true) return true

  return false
}

/**
 * Check if a user can contact sellers
 * Requires backend verification (email verified)
 */
export function canUserContact(user: User | null | undefined): boolean {
  if (!user) return false

  // PRIMARY: Check backend verification status
  if (user.backendVerificationStatus === 'VERIFIED') return true

  // SECONDARY: Check roles
  if (
    user.roles?.some(
      (r) => r.roleName === 'SELLER' || r.roleName === 'USER' || r.roleName === 'ADMIN'
    )
  )
    return true

  // TERTIARY: Check legacy flags
  if (user.isVerified === true) return true

  // FALLBACK: Check verification status object (may be stale)
  if (user.verificationStatus?.canContact === true) return true

  return false
}

/**
 * Check if user has admin privileges
 */
export function isUserAdmin(user: User | null | undefined): boolean {
  if (!user) return false
  return user.role === 'admin'
}

/**
 * Get verification status display message
 */
export function getVerificationStatusMessage(user: User | null | undefined): string {
  if (!user) return 'Please log in to access this feature'

  // Simplified verification check
  const isVerified =
    user.verificationStatus?.isFullyVerified ||
    user.isVerified ||
    user.backendVerificationStatus === 'VERIFIED'

  if (isVerified) {
    return 'Account fully verified - access to all features'
  }

  return 'Please verify your email to access all features'
}

/**
 * Get next verification step for user
 */
export function getNextVerificationStep(
  user: User | null | undefined
): 'login' | 'organization-email' | 'complete' {
  if (!user) return 'login'

  // Simplified: Only email verification needed
  const isVerified =
    user.verificationStatus?.isFullyVerified ||
    user.isVerified ||
    user.backendVerificationStatus === 'VERIFIED'

  return isVerified ? 'complete' : 'organization-email'
}

/**
 * Check what actions a user can perform
 */
export function getUserCapabilities(user: User | null | undefined) {
  const canBuyUser = canUserBuy(user)
  const canSellUser = canUserSell(user)
  const canContactUser = canUserContact(user)
  const isAdmin = isUserAdmin(user)

  // Simplified verification check
  const isFullyVerified =
    user?.verificationStatus?.isFullyVerified === true ||
    user?.isVerified === true ||
    user?.backendVerificationStatus === 'VERIFIED'

  return {
    canBuy: canBuyUser,
    canSell: canSellUser,
    canContact: canContactUser,
    isAdmin,
    isFullyVerified,
    nextStep: getNextVerificationStep(user),
    statusMessage: getVerificationStatusMessage(user),
  }
}
