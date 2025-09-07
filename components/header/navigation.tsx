import React from 'react'
import Link from 'next/link'
import { Package, Shield } from 'lucide-react'

interface NavigationProps {
  isLoggedIn: boolean
  isAdmin: boolean
  className?: string
}

export const Navigation = React.memo<NavigationProps>(
  ({ isLoggedIn, isAdmin, className = 'hidden md:flex items-center space-x-1' }) => {
    return (
      <nav className={className}>
        <Link
          href="/browse"
          className="text-sm font-medium text-neutral-200 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-colors"
        >
          Browse
        </Link>

        {isLoggedIn && (
          <Link
            href="/expat/dashboard"
            className="text-sm font-medium text-neutral-200 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-colors flex items-center gap-1"
          >
            <Package className="h-4 w-4" />
            My Listings
          </Link>
        )}

        {isAdmin && (
          <Link
            href="/admin/dashboard"
            className="text-sm font-medium text-neutral-200 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-colors flex items-center gap-1"
          >
            <Shield className="h-4 w-4" />
            Admin
          </Link>
        )}
      </nav>
    )
  }
)

Navigation.displayName = 'Navigation'
