/**
 * =============================================================================
 * PermissionGate - Authorization Control Component
 * =============================================================================
 *
 * Centralized authorization component that controls access to features
 * based on user permissions and verification status.
 */

'use client'

import React from 'react'
import { useAuth } from '@/hooks/use-auth'
import { PermissionErrorDisplay } from './error-display'
import { Button } from '@/components/ui/button'
import { Shield, Lock, Mail, IdCard } from 'lucide-react'
import Link from 'next/link'

/**
 * Permission types for different features
 */
export type Permission =
  | 'buy' // Can purchase items (requires org email verification)
  | 'sell' // Can sell items (requires full verification)
  | 'contact' // Can contact sellers (requires org email verification)
  | 'admin' // Admin access
  | 'verified' // Basic verification required
  | 'authenticated' // Just need to be logged in

/**
 * Props for PermissionGate component
 */
interface PermissionGateProps {
  /** Required permission to access the content */
  permission: Permission
  /** Content to render if permission is granted */
  children: React.ReactNode
  /** Custom fallback component if permission denied */
  fallback?: React.ReactNode
  /** Whether to show upgrade prompts instead of errors */
  showUpgrade?: boolean
  /** Custom error message */
  errorMessage?: string
  /** Redirect URL after verification */
  redirectTo?: string
  /** Additional className for styling */
  className?: string
}

/**
 * Get user-friendly permission descriptions
 */
function getPermissionDescription(permission: Permission): {
  title: string
  description: string
  action: string
  icon: React.ElementType
} {
  switch (permission) {
    case 'buy':
      return {
        title: 'Organization Email Required',
        description: 'To make purchases, you need to verify your organization email address.',
        action: 'Verify Email',
        icon: Mail,
      }
    case 'sell':
      return {
        title: 'Full Verification Required',
        description:
          'To sell items, you need to complete identity verification and organization email verification.',
        action: 'Complete Verification',
        icon: IdCard,
      }
    case 'contact':
      return {
        title: 'Organization Email Required',
        description: 'To contact sellers, you need to verify your organization email address.',
        action: 'Verify Email',
        icon: Mail,
      }
    case 'admin':
      return {
        title: 'Admin Access Required',
        description: 'This feature is only available to administrators.',
        action: 'Contact Support',
        icon: Shield,
      }
    case 'verified':
      return {
        title: 'Account Verification Required',
        description: 'You need to verify your account to access this feature.',
        action: 'Start Verification',
        icon: Shield,
      }
    case 'authenticated':
      return {
        title: 'Login Required',
        description: 'You need to be logged in to access this feature.',
        action: 'Login',
        icon: Lock,
      }
    default:
      return {
        title: 'Permission Required',
        description: 'You need additional permissions to access this feature.',
        action: 'Learn More',
        icon: Lock,
      }
  }
}

/**
 * Get verification link based on permission
 */
function getVerificationLink(permission: Permission, redirectTo?: string): string {
  const baseUrl = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''

  switch (permission) {
    case 'buy':
    case 'contact':
      return `/account/verification${baseUrl}`
    case 'sell':
      return `/account/verification${baseUrl}`
    case 'admin':
      return '/contact'
    case 'verified':
      return `/account/verification${baseUrl}`
    case 'authenticated':
      return `/login${baseUrl}`
    default:
      return '/account'
  }
}

/**
 * Check if user has required permission
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasPermission(permission: Permission, authState: any): boolean {
  const { isLoggedIn, user, canBuy, canSell, canContact, isAdmin } = authState

  switch (permission) {
    case 'authenticated':
      return isLoggedIn && !!user
    case 'buy':
      return isLoggedIn && canBuy
    case 'sell':
      return isLoggedIn && canSell
    case 'contact':
      return isLoggedIn && canContact
    case 'admin':
      return isLoggedIn && isAdmin
    case 'verified':
      return isLoggedIn && user?.verificationStatus?.isOrganizationEmailVerified
    default:
      return false
  }
}

/**
 * Upgrade prompt component for when users need verification
 */
function UpgradePrompt({
  permission,
  redirectTo,
  className,
}: {
  permission: Permission
  redirectTo?: string
  className?: string
}) {
  const { title, description, action, icon: Icon } = getPermissionDescription(permission)
  const link = getVerificationLink(permission, redirectTo)

  return (
    <div
      className={`bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 text-center ${className}`}
    >
      <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-blue-900 mb-2">{title}</h3>
      <p className="text-blue-700 mb-4">{description}</p>
      <Link href={link}>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">{action}</Button>
      </Link>
    </div>
  )
}

/**
 * Main PermissionGate component
 */
export function PermissionGate({
  permission,
  children,
  fallback,
  showUpgrade = false,
  errorMessage,
  redirectTo,
  className,
}: PermissionGateProps) {
  const authState = useAuth()
  const hasRequiredPermission = hasPermission(permission, authState)

  // If user has permission, render children
  if (hasRequiredPermission) {
    return <>{children}</>
  }

  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>
  }

  // If showing upgrade prompts (better UX)
  if (showUpgrade) {
    return <UpgradePrompt permission={permission} redirectTo={redirectTo} className={className} />
  }

  // Default error display
  const { description } = getPermissionDescription(permission)

  return <PermissionErrorDisplay message={errorMessage || description} className={className} />
}

/**
 * Hook for checking permissions programmatically
 */
export function usePermission(permission: Permission): {
  hasPermission: boolean
  checkPermission: () => boolean
  getUpgradeInfo: () => ReturnType<typeof getPermissionDescription>
} {
  const authState = useAuth()
  const userHasPermission = hasPermission(permission, authState)

  return {
    hasPermission: userHasPermission,
    checkPermission: () => hasPermission(permission, authState),
    getUpgradeInfo: () => getPermissionDescription(permission),
  }
}

/**
 * Higher-order component for protecting routes
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: Permission,
  options: {
    showUpgrade?: boolean
    redirectTo?: string
    fallback?: React.ComponentType
  } = {}
) {
  const ProtectedComponent = (props: P) => {
    return (
      <PermissionGate
        permission={requiredPermission}
        showUpgrade={options.showUpgrade}
        redirectTo={options.redirectTo}
        fallback={options.fallback ? <options.fallback /> : undefined}
      >
        <Component {...props} />
      </PermissionGate>
    )
  }

  ProtectedComponent.displayName = `withPermission(${Component.displayName || Component.name})`
  return ProtectedComponent
}

/**
 * Specific permission gates for common use cases
 */
export const BuyerGate = ({ children, ...props }: Omit<PermissionGateProps, 'permission'>) => (
  <PermissionGate permission="buy" {...props}>
    {children}
  </PermissionGate>
)

export const SellerGate = ({ children, ...props }: Omit<PermissionGateProps, 'permission'>) => (
  <PermissionGate permission="sell" {...props}>
    {children}
  </PermissionGate>
)

export const ContactGate = ({ children, ...props }: Omit<PermissionGateProps, 'permission'>) => (
  <PermissionGate permission="contact" {...props}>
    {children}
  </PermissionGate>
)

export const AdminGate = ({ children, ...props }: Omit<PermissionGateProps, 'permission'>) => (
  <PermissionGate permission="admin" {...props}>
    {children}
  </PermissionGate>
)

export const AuthGate = ({ children, ...props }: Omit<PermissionGateProps, 'permission'>) => (
  <PermissionGate permission="authenticated" {...props}>
    {children}
  </PermissionGate>
)
