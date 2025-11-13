import React from 'react'
import Link from 'next/link'
import { Package, LayoutDashboard, Store as StoreIcon } from 'lucide-react'

interface NavigationProps {
  isLoggedIn: boolean
  isAdmin: boolean
  className?: string
}

export const Navigation = React.memo<NavigationProps>(
  ({ isLoggedIn, isAdmin, className = 'hidden md:flex items-center space-x-3 flex-shrink-0' }) => {
    return (
      <nav className={className}>
        <Link
          href="/browse"
          className="text-base font-medium text-neutral-200 hover:text-white hover:bg-white/10 px-4 py-2 rounded-md transition-colors flex items-center gap-2 flex-shrink-0 whitespace-nowrap"
        >
          <StoreIcon className="h-4 w-4" />
          Store
        </Link>

        {isLoggedIn && (
          <Link
            href="/expat/dashboard"
            className="text-base font-medium text-neutral-200 hover:text-white hover:bg-white/10 px-4 py-2 rounded-md transition-colors flex items-center gap-2 flex-shrink-0 whitespace-nowrap"
          >
            <Package className="h-4 w-4" />
            My Space
          </Link>
        )}

        {isAdmin && (
          <Link
            href="/admin/dashboard"
            className="text-base font-medium text-neutral-200 hover:text-white hover:bg-white/10 px-4 py-2 rounded-md transition-colors flex items-center gap-2 flex-shrink-0 whitespace-nowrap"
          >
            <LayoutDashboard className="h-4 w-4" />
            Admin
          </Link>
        )}
      </nav>
    )
  }
)

Navigation.displayName = 'Navigation'
