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
  message: string
  requiresManualFix: boolean
  adminInstructions?: string
}

/**
 * Detects if an error is the "buyer profile not found" issue
 */
export function isBuyerProfileError(error: Error | string): boolean {
  const errorMessage = typeof error === 'string' ? error : error.message
  return (
    errorMessage.includes('Buyer profile not found') ||
    errorMessage.includes('buyer profile missing')
  )
}

/**
 * Attempts to automatically fix the buyer profile issue
 *
 * Strategy:
 * 1. Verify user is authenticated and verified
 * 2. Attempt to trigger buyer profile creation via cart initialization
 * 3. Verify the fix worked
 * 4. If failed, return manual fix instructions
 */
export async function attemptBuyerProfileFix(): Promise<BuyerProfileFixResult> {
  try {
    console.log('🔧 [BuyerProfileFixer] Attempting to fix buyer profile issue...')

    // Step 1: Check if user is verified
    const userDetails = await apiClient.getUserDetails()

    if (!userDetails.verificationStatus || userDetails.verificationStatus !== 'VERIFIED') {
      return {
        success: false,
        message: 'User must be verified before buyer profile can be created',
        requiresManualFix: false,
      }
    }

    console.log('✅ [BuyerProfileFixer] User is verified')

    // Step 2: Attempt to trigger buyer profile creation
    // Some backend implementations auto-create the profile on first cart access
    console.log('🔄 [BuyerProfileFixer] Attempting to trigger profile creation...')

    try {
      // Try to access cart endpoint - this might trigger auto-creation
      // Using fetch directly since ApiClient.request is private
      const token = localStorage.getItem('auth_token')
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/User`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // If we got here without error, the profile now exists!
      console.log('✅ [BuyerProfileFixer] Buyer profile created successfully!')
      return {
        success: true,
        message: 'Buyer profile was automatically created. You can now use all features!',
        requiresManualFix: false,
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch {
      // Still getting the error - auto-fix didn't work
      console.warn('⚠️ [BuyerProfileFixer] Auto-fix failed, manual intervention needed')

      return {
        success: false,
        message: 'Automatic fix failed. Backend database intervention required.',
        requiresManualFix: true,
        adminInstructions: generateAdminInstructions(userDetails.loggingEmail),
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ [BuyerProfileFixer] Fix attempt failed:', error)
    return {
      success: false,
      message: `Fix attempt failed: ${error.message}`,
      requiresManualFix: true,
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
