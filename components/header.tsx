'use client'

/**
 * =============================================================================
 * HEADER COMPONENT - MAIN NAVIGATION
 * =============================================================================
 *
 * The primary navigation header for the Expat Marketplace application. This component
 * serves as the main entry point for user interactions and provides access to all
 * major application features through a responsive design.
 *
 * Key Features:
 * - Responsive design (mobile/desktop navigation)
 * - Dynamic user authentication state handling
 * - Real-time shopping cart integration
 * - Live notification and message counts
 * - Global search functionality
 * - Admin navigation for privileged users
 * - Currency selection for international users
 * - Performance optimizations with memoization
 *
 * Connected Components & Systems:
 * - providers/auth-provider.tsx - Authentication state and user data
 * - providers/cart-provider.tsx - Shopping cart state and item count
 * - hooks/use-notifications.ts - Real-time notification counts
 * - hooks/use-currency.ts - Currency preferences
 * - components/search-bar.tsx - Global product search
 * - components/header/* - Modular header sub-components
 *
 * Backend Integration Points:
 * - GET /api/auth/me - Current user session validation
 * - GET /api/cart - Shopping cart synchronization
 * - GET /api/notifications/count - Unread notification count
 * - GET /api/messages/count - Unread message count
 * - GET /api/search/suggestions - Search autocomplete
 *
 * Performance Features:
 * - Memoized components prevent unnecessary re-renders
 * - Conditional rendering reduces DOM complexity
 * - Loading skeletons improve perceived performance
 * - Route-based visibility optimization
 *
 * Usage:
 * This component is automatically included in the root layout and doesn't
 * need to be manually imported in pages. It adapts its content based on:
 * - User authentication status
 * - Current route/page
 * - User permissions (admin, verified, etc.)
 * - Device size (responsive behavior)
 */

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Bell, ShoppingCart, Search, User, Shield, Settings, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useCart } from '@/hooks/use-cart'
import SearchBar from '@/components/search-bar'
import { useRenderTracker } from '@/hooks/use-performance'
import { AuthButtons } from '@/components/header/auth-buttons'
import { NotificationBadge } from '@/components/header/notification-badge'
import { ProfileDropdown } from '@/components/header/profile-dropdown'
import { Logo } from '@/components/header/logo'
import { Navigation } from '@/components/header/navigation'
import { MobileMenu } from '@/components/header/mobile-menu'
import { useNotifications } from '@/hooks/use-notifications'
import { CartSidePanelTrigger } from '@/components/cart-sidepanel'
import { CurrencyToggle } from '@/components/currency-toggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { useTutorial } from '@/providers/tutorial-provider'

/**
 * =============================================================================
 * LOADING SKELETON COMPONENT
 * =============================================================================
 *
 * Displays a skeleton loader while the header is mounting or loading data.
 * This improves perceived performance by showing the layout structure immediately
 * and prevents layout shift when the actual content loads.
 *
 * Design matches the actual header layout for seamless transition.
 */
const HeaderSkeleton = React.memo(() => (
  <header className="bg-brand-primary text-neutral-100 shadow-md sticky top-0 z-[60]">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        {/* Logo skeleton - represents brand logo area */}
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold font-display text-white">
            Globo<span className="text-brand-secondary">expat</span>
          </div>
        </div>

        {/* Search skeleton - represents search bar area on desktop */}
        <div className="h-10 w-1/2 bg-brand-primary/50 animate-pulse rounded-md hidden md:block"></div>

        {/* Action buttons skeleton - represents user actions area */}
        <div className="h-10 w-48 bg-brand-primary/50 animate-pulse rounded-md"></div>
      </div>
    </div>
  </header>
))

HeaderSkeleton.displayName = 'HeaderSkeleton'

/**
 * =============================================================================
 * USER NAVIGATION COMPONENT
 * =============================================================================
 *
 * Handles navigation and actions for authenticated users. This component
 * displays user-specific actions like cart, notifications, messages, and
 * profile dropdown. It uses real-time data from various hooks to show
 * accurate counts and status information.
 *
 * Features:
 * - Real-time cart item count display
 * - Live notification badge with unread count
 * - Message notification with unread count
 * - User profile dropdown with account actions
 * - Responsive design for mobile/desktop
 *
 * @param user - Current user object from auth context
 * @param isVerifiedBuyer - Whether user has verified buyer status
 * @param isAdmin - Whether user has admin privileges
 * @param handleLogout - Function to log out the user
 * @param cartItemCount - Number of items in shopping cart
 */
const UserNavigation = React.memo<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any
  isVerifiedBuyer: boolean
  isAdmin: boolean
  handleLogout: () => void
  cartItemCount: number
}>(({ user, isVerifiedBuyer, isAdmin, handleLogout, cartItemCount }) => {
  const { notificationCounts } = useNotifications()
  const { startTutorial } = useTutorial()
  const userInitials = React.useMemo(() => getInitials(user?.name || 'U'), [user?.name])

  return (
    <div className="flex items-center gap-2" role="navigation" aria-label="User navigation">
      {/* Shopping Cart - Quick access side panel with keyboard shortcut (Ctrl/Cmd+K) */}
      <CartSidePanelTrigger
        className="relative p-2 rounded-md text-white hover:bg-brand-primary/80 transition-colors"
        data-tutorial="cart"
      >
        <ShoppingCart className="h-5 w-5" />
        {cartItemCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center justify-center">
            {cartItemCount > 9 ? '9+' : cartItemCount}
          </span>
        )}
      </CartSidePanelTrigger>

      {/* Mobile Account Dropdown - Between cart and menu */}
      <div className="lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative p-2 rounded-md text-white hover:bg-brand-primary/80 transition-colors h-auto"
              aria-label="Open account menu"
              data-tutorial="mobile-account-menu"
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            {/* User Info Header */}
            <div className="px-3 py-2.5 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-brand-secondary text-brand-primary text-sm font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-neutral-900 truncate">{user?.name}</p>
                  <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                  {isVerifiedBuyer && (
                    <p className="text-xs text-green-600 font-medium mt-0.5">Verified Member</p>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/account" className="flex items-center gap-2 px-3 py-2">
                  <User className="w-4 h-4" />
                  <span>My Account</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/account/verification" className="flex items-center gap-2 px-3 py-2">
                  <Shield className="w-4 h-4" />
                  <span>Verification</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/account/settings" className="flex items-center gap-2 px-3 py-2">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/notifications" className="flex items-center gap-2 px-3 py-2">
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </Link>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator />

            {/* Tutorial Link */}
            <div className="py-1">
              <DropdownMenuItem
                onClick={() => setTimeout(() => startTutorial(), 100)}
                className="cursor-pointer px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Platform Tutorial</span>
                </div>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator />

            {/* Logout */}
            <div className="py-1">
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer px-3 py-2 font-medium"
              >
                Logout
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Notifications - Real-time updates from backend - HIDDEN ON MOBILE */}
      <div className="hidden md:block" data-tutorial="notifications">
        <NotificationBadge
          href="/notifications"
          icon={Bell}
          count={notificationCounts.unread}
          ariaLabel={`View notifications (${notificationCounts.unread} unread)`}
          testId="notifications-button"
          className="hover:bg-brand-primary/80 transition-colors"
        />
      </div>

      {/* User Profile Dropdown - Account management and settings - HIDDEN ON MOBILE */}
      <div className="hidden md:block" data-tutorial="profile-dropdown">
        <ProfileDropdown
          user={user}
          isVerifiedBuyer={isVerifiedBuyer}
          isAdmin={isAdmin}
          onLogout={handleLogout}
        />
      </div>
    </div>
  )
})

UserNavigation.displayName = 'UserNavigation'

/**
 * =============================================================================
 * GUEST NAVIGATION COMPONENT
 * =============================================================================
 *
 * Handles navigation for non-authenticated users. Shows essential actions
 * like cart access and authentication buttons while maintaining a clean
 * interface that encourages user registration.
 *
 * @param cartItemCount - Number of items in cart (persisted for guests)
 * @param isAuthPage - Whether currently on login/register page
 */
const GuestNavigation = React.memo<{
  cartItemCount: number
  isAuthPage: boolean
}>(({ cartItemCount, isAuthPage }) => (
  <div className="flex items-center gap-1 sm:gap-2">
    {/* Guest cart access - Quick access side panel */}
    <CartSidePanelTrigger className="relative p-2 rounded-md text-white hover:bg-brand-primary/80 transition-colors">
      <ShoppingCart className="h-5 w-5" />
      {cartItemCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center justify-center">
          {cartItemCount > 9 ? '9+' : cartItemCount}
        </span>
      )}
    </CartSidePanelTrigger>

    {/* Authentication buttons - Always show if not on auth pages */}
    {!isAuthPage && <AuthButtons />}
  </div>
))

GuestNavigation.displayName = 'GuestNavigation'

/**
 * =============================================================================
 * CURRENCY SELECTOR COMPONENT (DEPRECATED - Using CurrencyToggle)
 * =============================================================================
 *
 * Removed in favor of the new CurrencyToggle component which provides:
 * - Better UI/UX with exchange rates display
 * - Sample conversion preview
 * - Last update timestamp
 * - Refresh functionality
 * - Better accessibility
 */

/**
 * =============================================================================
 * MAIN HEADER COMPONENT
 * =============================================================================
 *
 * The main header component that orchestrates all header functionality.
 * It adapts its content and behavior based on user authentication status,
 * current route, device size, and user permissions.
 *
 * State Management Integration:
 * - AuthProvider: User authentication and verification status
 * - CartProvider: Shopping cart state and item count
 * - Currency preferences via useCurrency hook
 * - Notifications via useNotifications hook
 *
 * Performance Optimizations:
 * - Memoized components prevent unnecessary re-renders
 * - Conditional rendering reduces DOM complexity
 * - Route-based content optimization
 * - Development performance tracking
 * - SSR-compatible loading states
 *
 * Responsive Design:
 * - Desktop: Full navigation with search bar
 * - Mobile: Hamburger menu with collapsed navigation
 * - Tablet: Hybrid approach with selective hiding
 */
const Header = React.memo(() => {
  // Authentication and user state from AuthProvider
  const { isLoggedIn, user, isVerifiedBuyer, isAdmin, logout, isLoading: authLoading } = useAuth()

  // Application state hooks - currency is now managed by CurrencyToggle component
  const { itemCount: cartItemCount } = useCart()

  // Component internal state
  const [isMounted, setIsMounted] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const headerRef = useRef<HTMLElement | null>(null)

  // Current route for conditional rendering
  const pathname = usePathname()

  // Performance tracking in development mode only
  useRenderTracker('Header', process.env.NODE_ENV === 'development')

  /**
   * =============================================================================
   * ROUTE-BASED VISIBILITY LOGIC
   * =============================================================================
   *
   * Memoized route checks for performance optimization. These determine
   * which UI elements to show or hide based on the current page context.
   */
  const routeConfig = useMemo(() => {
    const isAuthPage = pathname === '/login' || pathname === '/register'
    const isBrowsePage = pathname.startsWith('/browse')
    const isAdminPage = pathname.startsWith('/admin')
    const isAccountPage = pathname.startsWith('/account')

    return {
      isAuthPage,
      isBrowsePage,
      isAdminPage,
      isAccountPage,
      showSearch: !isAuthPage && !isBrowsePage, // Hide search on auth and browse pages
      showFullNavigation: !isAuthPage, // Hide full nav only on auth pages
    }
  }, [pathname])

  /**
   * =============================================================================
   * COMPONENT LIFECYCLE MANAGEMENT
   * =============================================================================
   *
   * Handle component mounting for SSR compatibility. This prevents hydration
   * mismatches by showing a skeleton until the component is fully mounted
   * and all client-side state is available.
   */
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Measure header height and expose as CSS variable for dependent components (e.g., cart sidepanel)
  useEffect(() => {
    const updateHeaderHeightVar = () => {
      const h = headerRef.current?.getBoundingClientRect().height ?? 64
      document.documentElement.style.setProperty('--site-header-height', `${Math.round(h)}px`)
    }
    updateHeaderHeightVar()
    window.addEventListener('resize', updateHeaderHeightVar)
    return () => window.removeEventListener('resize', updateHeaderHeightVar)
  }, [isMobileSearchOpen, routeConfig.showSearch])

  // Show skeleton while loading or during SSR
  if (!isMounted || authLoading) {
    return <HeaderSkeleton />
  }

  /**
   * =============================================================================
   * MAIN RENDER
   * =============================================================================
   */
  return (
    <header
      ref={headerRef}
      className="bg-brand-primary text-neutral-100 shadow-md sticky top-0 z-[60]"
      role="banner"
      aria-label="Main navigation"
    >
      <div className="w-full px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 
            =================================================================
            LOGO SECTION
            =================================================================
            Brand logo with link to homepage. Always visible and positioned
            on the left side for consistent navigation expectations.
          */}
          {/* Responsive Logo to avoid pushing actions off-screen on small devices */}
          <div className="flex items-center gap-2" data-tutorial="logo">
            <div className="md:hidden">
              <Logo size="sm" className="whitespace-nowrap" />
            </div>
            <div className="hidden md:block">
              <Logo size="md" />
            </div>

            {/* Mobile Search Icon - positioned right after logo */}
            {!routeConfig.isAuthPage && !routeConfig.isBrowsePage && (
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 h-8 w-8 rounded-full"
                  aria-label="Toggle search"
                  data-tutorial="mobile-search-toggle"
                  onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>

          {/* 
            =================================================================
            SEARCH SECTION
            =================================================================
            Global search functionality. Conditionally displayed based on
            current route. Hidden on auth pages and browse pages where
            search is either not needed or has dedicated space.
          */}
          {routeConfig.showSearch && (
            <div
              className="hidden md:flex flex-1 md:max-w-[260px] lg:max-w-lg md:mx-3 lg:mx-8 transition-all duration-300"
              data-tutorial="search"
            >
              <SearchBar />
            </div>
          )}

          {/* 
            =================================================================
            DESKTOP NAVIGATION & CURRENCY
            =================================================================
            Desktop navigation links and currency selector. Responsive design
            hides this on mobile devices where it's replaced by the
            mobile hamburger menu.
          */}
          {routeConfig.showFullNavigation && (
            <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
              <Navigation isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
              <div className="h-4 w-px bg-white/20"></div>
              <CurrencyToggle showRates />
            </div>
          )}

          {/* Currency selector for medium screens without full navigation */}
          {!routeConfig.showFullNavigation && (
            <div className="hidden md:block lg:hidden">
              <CurrencyToggle variant="compact" />
            </div>
          )}

          {/* 
            =================================================================
            USER ACTIONS SECTION
            =================================================================
            Right-aligned user-specific actions. Content adapts based on
            authentication status, showing different sets of actions for
            logged-in users versus guests.
          */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Authenticated User Actions */}
            {isLoggedIn ? (
              <UserNavigation
                user={user}
                isVerifiedBuyer={isVerifiedBuyer}
                isAdmin={isAdmin}
                handleLogout={logout}
                cartItemCount={cartItemCount}
              />
            ) : (
              /* Guest User Actions */
              <GuestNavigation cartItemCount={cartItemCount} isAuthPage={routeConfig.isAuthPage} />
            )}

            {/* 
            =============================================================
            MOBILE MENU
            =============================================================
            Responsive navigation for mobile devices. Includes all
            navigation items, user actions, and currency selection
            in a slide-out drawer interface.
            Always visible on mobile (< lg breakpoint)
          */}
            <div className="lg:hidden">
              <MobileMenu
                isLoggedIn={isLoggedIn}
                isAdmin={isAdmin}
                isAuthPage={routeConfig.isAuthPage}
                user={user}
                handleLogout={logout}
              />
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - appears below header when toggled */}
        {isMobileSearchOpen && !routeConfig.isAuthPage && !routeConfig.isBrowsePage && (
          <div className="md:hidden border-t border-white/10 bg-brand-primary px-4 py-3">
            <div className="relative">
              <SearchBar autoExpand onClose={() => setIsMobileSearchOpen(false)} />
            </div>
          </div>
        )}
      </div>
    </header>
  )
})

// Set display name for debugging and React DevTools
Header.displayName = 'Header'

export default Header
