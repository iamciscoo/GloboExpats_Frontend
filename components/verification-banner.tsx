'use client'

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  ShoppingBag,
  Tag,
  MessageCircle,
  ShieldCheck,
  Mail,
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { getUserCapabilities } from '@/lib/verification-utils'
import { usePathname } from 'next/navigation'

/**
 * Displays a persistent banner prompting unverified users to verify their account.
 * Uses centralized verification logic for consistent messaging across the app.
 */
export const VerificationBanner = () => {
  const { isLoggedIn, user } = useAuth()
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)

  if (!isLoggedIn || !user) return null

  // Don't show on verification page itself (redundant)
  if (pathname === '/account/verification') return null

  const capabilities = getUserCapabilities(user)

  // Don't show banner if user is fully verified
  if (capabilities.isFullyVerified) return null

  // Simplified verification message
  const title = 'Email verification required'
  const description = 'Verify with your organization email to unlock the full platform features.'
  const IconComponent = Mail
  const linkText = 'Verify Email Now'
  const linkHref = '/account/verification'

  const features = [
    { icon: ShoppingBag, text: 'Buying: Securely purchase items from other verified expats' },
    { icon: Tag, text: 'Selling: List your products and reach a trusted audience' },
    { icon: MessageCircle, text: 'Messaging: Chat directly with sellers and buyers' },
    { icon: ShieldCheck, text: 'Trust: Get a verified badge on your profile' },
  ]

  return (
    <Alert className="rounded-none border-0 bg-yellow-50 dark:bg-yellow-900/20 relative py-2.5 px-4 md:px-6">
      <div className="flex items-start gap-3">
        <IconComponent className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <AlertTitle className="text-yellow-800 dark:text-yellow-100 font-bold text-sm">
            {title}
          </AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-200 text-sm mt-0.5">
            {description}&nbsp;
            <Link
              href={linkHref}
              className="font-bold text-brand-primary hover:underline underline-offset-2"
            >
              {linkText}
            </Link>
          </AlertDescription>
        </div>

        <div className="shrink-0 self-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-sm font-medium text-yellow-700 hover:text-yellow-900 transition-colors"
          >
            Learn more{' '}
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-yellow-200/50 ml-7">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 bg-white/40 p-2 rounded-lg">
              <div className="bg-yellow-100 p-1 rounded-md">
                <feature.icon className="h-3.5 w-3.5 text-yellow-700" />
              </div>
              <span className="text-xs font-medium text-yellow-800">{feature.text}</span>
              <CheckCircle className="h-3 w-3 text-green-600 ml-auto opacity-70" />
            </div>
          ))}
        </div>
      </div>
    </Alert>
  )
}
