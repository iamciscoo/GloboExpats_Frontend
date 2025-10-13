/**
 * Verification Utilities
 *
 * Centralized logic for handling user verification states and requirements.
 * Provides consistent verification checking across the application.
 */

/**
 * Check if a user can perform buy actions
 * Requires organization email verification at minimum
 */
export function canUserBuy(user: any): boolean {
  if (!user) return false

  // Check new verification system first
  if (user.verificationStatus) {
    return user.verificationStatus.canBuy === true
  }

  // Fallback for legacy data
  return user.isOrganizationEmailVerified === true
}

/**
 * Check if a user can perform sell actions
 * Requires email verification
 */
export function canUserSell(user: any): boolean {
  if (!user) return false

  // Check new verification system first
  if (user.verificationStatus) {
    return user.verificationStatus.canSell === true
  }

  // Simplified: Email verification = full access
  return user.isVerified === true || user.isOrganizationEmailVerified === true || 
         user.backendVerificationStatus === 'VERIFIED'
}

/**
 * Check if a user can contact sellers
 * Requires organization email verification
 */
export function canUserContact(user: any): boolean {
  if (!user) return false

  // Check new verification system first
  if (user.verificationStatus) {
    return user.verificationStatus.canContact === true
  }

  // Fallback for legacy data
  return user.isOrganizationEmailVerified === true
}

/**
 * Check if user has admin privileges
 */
export function isUserAdmin(user: any): boolean {
  if (!user) return false
  return user.isAdmin === true || user.role === 'admin'
}

/**
 * Get verification status display message
 */
export function getVerificationStatusMessage(user: any): string {
  if (!user) return 'Please log in to access this feature'

  // Simplified verification check
  const isVerified = user.verificationStatus?.isFullyVerified || 
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
  user: any
): 'login' | 'organization-email' | 'complete' {
  if (!user) return 'login'

  // Simplified: Only email verification needed
  const isVerified = user.verificationStatus?.isFullyVerified || 
                     user.isVerified || 
                     user.backendVerificationStatus === 'VERIFIED'

  return isVerified ? 'complete' : 'organization-email'
}

/**
 * Check what actions a user can perform
 */
export function getUserCapabilities(user: any) {
  const canBuyUser = canUserBuy(user)
  const canSellUser = canUserSell(user)
  const canContactUser = canUserContact(user)
  const isAdmin = isUserAdmin(user)

  // Simplified verification check
  const isFullyVerified = user?.verificationStatus?.isFullyVerified === true ||
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
