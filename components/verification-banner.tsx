'use client'

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Mail, X } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { getUserCapabilities } from '@/lib/verification-utils'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

/**
 * Displays a dismiss-able banner prompting unverified users to verify their account.
 * Uses centralized verification logic for consistent messaging across the app.
 */
export const VerificationBanner = () => {
  const { isLoggedIn, user } = useAuth()
  const pathname = usePathname()
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if banner was dismissed in this session
    const dismissed = sessionStorage.getItem('verification_banner_dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }
  }, [])

  // Auto-dismiss banner when user becomes verified
  useEffect(() => {
    if (user) {
      const capabilities = getUserCapabilities(user)
      if (
        capabilities.isFullyVerified ||
        user.verificationStatus?.isOrganizationEmailVerified ||
        user.backendVerificationStatus === 'VERIFIED'
      ) {
        console.log('🎉 User verified, dismissing banner')
        setIsDismissed(true)
        // Clear the session storage since user is now verified
        sessionStorage.removeItem('verification_banner_dismissed')
      }
    }
  }, [user, user?.verificationStatus, user?.backendVerificationStatus])

  if (!isLoggedIn || !user) return null

  // Don't show on verification page itself (redundant)
  if (pathname === '/account/verification') return null

  // Don't show if dismissed this session
  if (isDismissed) return null

  const capabilities = getUserCapabilities(user)

  // Don't show banner if user is fully verified
  if (capabilities.isFullyVerified) return null

  // Simplified verification message
  const title = 'Email verification required'
  const description =
    'Verify with your work email to unlock all platform features including buying, selling, and messaging.'
  const IconComponent = Mail
  const linkText = 'Verify Email'
  const linkHref = '/account/verification'

  const handleDismiss = () => {
    sessionStorage.setItem('verification_banner_dismissed', 'true')
    setIsDismissed(true)
  }

  return (
    <Alert className="rounded-none border-0 bg-yellow-50 dark:bg-yellow-900/20 relative">
      <IconComponent className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-100 pr-8">{title}</AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-200">
        {description}&nbsp;
        <Link
          href={linkHref}
          className="underline underline-offset-4 font-medium hover:text-yellow-900 dark:hover:text-yellow-50"
        >
          {linkText}
        </Link>
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="absolute right-2 top-2 h-6 w-6 p-0 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-100"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  )
}
