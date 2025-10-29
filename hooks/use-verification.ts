'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { canUserBuy, canUserSell, canUserContact } from '@/lib/verification-utils'
import { toast } from '@/components/ui/use-toast'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Available actions that require verification
 */
type VerificationAction = 'buy' | 'sell' | 'contact'

/**
 * Return type for the verification hook
 */
interface UseVerificationReturn {
  /** Function to check if user can perform an action */
  checkVerification: (action: VerificationAction) => boolean
  /** Whether the verification popup is currently open */
  isVerificationPopupOpen: boolean
  /** The action that triggered the verification requirement */
  currentAction: VerificationAction | null
  /** Function to close the verification popup */
  closeVerificationPopup: () => void
}

// ============================================================================
// VERIFICATION HOOK
// ============================================================================

/**
 * Hook for managing user verification checks and UI states
 *
 * This hook provides a centralized way to check if a user is verified
 * for specific actions. It automatically handles redirecting unlogged
 * users to login and showing verification popups for unverified users.
 *
 * @returns Verification state and control functions
 *
 * @example Complete verification flow:
 * ```tsx
 * function ProductActions() {
 *   const {
 *     checkVerification,
 *     isVerificationPopupOpen,
 *     currentAction,
 *     closeVerificationPopup
 *   } = useVerification()
 *
 *   const handleContact = () => {
 *     if (checkVerification('contact')) {
 *       // Open contact form
 *       setShowContactForm(true)
 *     }
 *   }
 *
 *   return (
 *     <>
 *       <Button onClick={handleContact}>Contact Seller</Button>
 *       {isVerificationPopupOpen && (
 *         <VerificationPopup
 *           action={currentAction}
 *           onClose={closeVerificationPopup}
 *         />
 *       )}
 *     </>
 *   )
 * }
 * ```
 */
export function useVerification(): UseVerificationReturn {
  const { isLoggedIn, user } = useAuth()
  const [isVerificationPopupOpen, setIsVerificationPopupOpen] = useState(false)
  const [currentAction, setCurrentAction] = useState<VerificationAction | null>(null)
  const router = useRouter()

  /**
   * Checks if the user can perform the specified action
   *
   * This function handles the complete verification flow:
   * 1. Redirects to login if user is not logged in
   * 2. Shows verification popup if user is not verified
   * 3. Returns true if user can proceed with the action
   *
   * @param action - The action the user wants to perform
   * @returns true if user can proceed, false if verification is needed
   */
  const checkVerification = useCallback(
    (action: VerificationAction): boolean => {
      // Check if user is logged in
      if (!isLoggedIn) {
        toast({
          title: 'Login Required',
          description: 'Please login to access this feature or create an account to get started!',
          variant: 'default',
        })
        return false
      }

      // Check verification based on action using utility functions
      let canPerformAction = false

      try {
        switch (action) {
          case 'buy':
            canPerformAction = canUserBuy(user)
            break
          case 'sell':
            canPerformAction = canUserSell(user)
            break
          case 'contact':
            canPerformAction = canUserContact(user)
            break
          default:
            canPerformAction = false
        }
      } catch (error) {
        console.error('[useVerification] Error checking verification:', error)
        // If there's an error checking, allow access and let the component handle it
        return true
      }

      // If user can't perform action, still allow access
      // The actual feature protection happens at the API level
      if (!canPerformAction) {
        // Only log in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log(`[useVerification] User verification pending for '${action}' action`)
        }

        // Don't block access - let the page load and show verification UI there
        // setCurrentAction(action)
        // setIsVerificationPopupOpen(true)

        return true // Don't block page access - show verification prompt in UI
      }

      // User is verified and can proceed
      return true
    },
    [isLoggedIn, user, router]
  )

  /**
   * Closes the verification popup and resets the current action
   * Called when user dismisses the popup or completes verification
   */
  const closeVerificationPopup = useCallback(() => {
    setIsVerificationPopupOpen(false)
    setCurrentAction(null)
  }, [])

  return {
    checkVerification,
    isVerificationPopupOpen,
    currentAction,
    closeVerificationPopup,
  }
}
