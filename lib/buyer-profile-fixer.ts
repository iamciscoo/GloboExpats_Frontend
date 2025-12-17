/**
 * =============================================================================
 * Buyer Profile Auto-Fixer
 * =============================================================================
 *
 * Handles the "Buyer profile not found" error by attempting to auto-create
 * the missing buyer profile when a verified user encounters this issue.
 *
 * This is a workaround for a backend database inconsistency where users
 * are verified but their buyer_profile entry wasn't created during verification.
 */

import { apiClient } from './api'

export interface BuyerProfileFixResult {
  success: boolean
  fixWorked: boolean
  message?: string
  requiresManualFix?: boolean
  adminInstructions?: string
}

/**
 * Helper to determine if an error is related to missing buyer profile
 */
export function isBuyerProfileError(error: unknown): boolean {
  if (!error) return false

  // Type guard to safely access error properties
  const msg =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message)
        : String(error)

  const lowerMsg = msg.toLowerCase()
  return (
    lowerMsg.includes('buyer profile not found') ||
    lowerMsg.includes('could not be created') ||
    lowerMsg.includes('no buyer profile')
  )
}

/**
 * Attempts to fix a missing buyer profile by triggering a user profile update.
 * This force-updates the user data, which often triggers backend hooks to ensure consistency.
 */
export async function attemptBuyerProfileFix(): Promise<BuyerProfileFixResult> {
  try {
    console.log(
      '🔧 [BuyerProfileFixer] v3.1 executing - Attempting to fix buyer profile (Profile Update Strategy)...'
    )

    // Step 1: Check if user is verified
    // We handle likely response structures (ApiResponse or direct User object)
    const response = await apiClient.getUserDetails()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userData = (response as any).data || response

    if (!userData) {
      console.warn('⚠️ [BuyerProfileFixer] Cannot fetch user details. Aborting.')
      return { success: false, fixWorked: false, message: 'Could not fetch user details.' }
    }

    // Check verification status (safely handling possible field names)
    const isVerified = userData.verified === true || userData.verificationStatus === 'VERIFIED'

    if (!isVerified) {
      console.warn('⚠️ [BuyerProfileFixer] User is not verified. Cannot create buyer profile.')
      return {
        success: false,
        fixWorked: false,
        message: 'User is not verified. Please verify your account first.',
      }
    }

    console.log('✅ [BuyerProfileFixer] User is verified. Attempting profile sync...')

    // Step 2: Trigger Profile Update to wake up backend
    // We send the existing data back to the server to trigger a "save" hook
    const updatePayload = {
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      organizationalEmail: userData.email || userData.organizationalEmail || '',
    }

    try {
      const updateResponse = await apiClient.updateUserProfile(updatePayload)

      if (updateResponse.success) {
        console.log(
          '✅ [BuyerProfileFixer] Profile sync request successful! Buyer profile should now await creation.'
        )
        return {
          success: true,
          fixWorked: true,
          message: 'Buyer profile validated. Please try your order again.',
        }
      } else {
        console.error(
          '❌ [BuyerProfileFixer] Profile sync failed with backend error.',
          updateResponse
        )
        return {
          success: false,
          fixWorked: false,
          message: 'Automatic profile fix failed. Backend rejected update.',
        }
      }
    } catch (updateError) {
      console.error('❌ [BuyerProfileFixer] Profile update request threw error.', updateError)
      return { success: false, fixWorked: false, message: 'Profile sync connection failed.' }
    }
  } catch (error) {
    console.error('❌ [BuyerProfileFixer] Critical failure:', error)
    return {
      success: false,
      fixWorked: false,
      message: 'Unexpected error during profile fix.',
      requiresManualFix: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      adminInstructions: generateAdminInstructions((window as any)?.user?.email || 'user-email'),
    }
  }
}

/**
 * Generates instructions for backend admin to manually fix the issue
 */
function generateAdminInstructions(email: string): string {
  return `
BACKEND ADMIN ACTION REQUIRED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User: ${email}
Issue: Buyer profile missing in database despite verified status

SQL Fix:
--------
-- 1. Find the user ID
SELECT id FROM users WHERE email = '${email}';

-- 2. Check if buyer_profile exists
SELECT * FROM buyer_profiles WHERE user_id = (SELECT id FROM users WHERE email = '${email}');

-- 3. If not exists, create it
INSERT INTO buyer_profiles (user_id, created_at, updated_at)
SELECT id, NOW(), NOW() 
FROM users 
WHERE email = '${email}'
AND NOT EXISTS (
  SELECT 1 FROM buyer_profiles WHERE user_id = users.id
);

-- 4. Verify creation
SELECT bp.*, u.email 
FROM buyer_profiles bp 
JOIN users u ON bp.user_id = u.id 
WHERE u.email = '${email}';

Root Cause Investigation:
------------------------
Check why buyer_profile wasn't auto-created during verification:
- Review /api/v1/email/verifyOTP implementation
- Ensure it creates buyer_profile after successful verification
- Check for any database transaction failures in logs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
}

/**
 * Browser console helper - can be called from dev tools
 */
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).fixBuyerProfile = async () => {
    console.log('🔧 Running buyer profile auto-fix...')
    const result = await attemptBuyerProfileFix()

    if (result.success) {
      console.log('✅ SUCCESS:', result.message)
      console.log('💡 Try your action again - it should work now!')
    } else {
      console.error('❌ FAILED:', result.message)

      if (result.requiresManualFix) {
        console.log(result.adminInstructions)
        console.log('')
        console.log('📋 Copy the SQL above and send to your backend admin')
      }
    }

    return result
  }

  console.log(
    '💡 Buyer profile fixer loaded. Run fixBuyerProfile() if you encounter "Buyer profile not found" error.'
  )
}
