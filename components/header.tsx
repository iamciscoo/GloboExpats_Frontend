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

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronDown,
  Menu,
  Package,
  Shield,
  LogIn,
  UserPlus,
  MessageCircle,
  User,
  Bell,
  Search,
  ShoppingCart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { useCurrency } from '@/hooks/use-currency'
import { useCart } from '@/hooks/use-cart'
import { getInitials } from '@/lib/utils'
import SearchBar from '@/components/search-bar'
import { CATEGORIES } from '@/lib/constants'
import { useRenderTracker } from '@/hooks/use-performance'
import { AuthButtons } from '@/components/header/auth-buttons'
import { NotificationBadge } from '@/components/header/notification-badge'
import { ProfileDropdown } from '@/components/header/profile-dropdown'
import { Logo } from '@/components/header/logo'
import { Navigation } from '@/components/header/navigation'
import { MobileMenu } from '@/components/header/mobile-menu'
import { useNotifications } from '@/hooks/use-notifications'

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
  <header className="bg-brand-primary text-neutral-100 shadow-md sticky top-0 z-50">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        {/* Logo skeleton - represents brand logo area */}
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold font-display text-white">
            Global<span className="text-brand-secondary">Expat</span>
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
  user: any
  isVerifiedBuyer: boolean
  isAdmin: boolean
  handleLogout: () => void
  cartItemCount: number
}>(({ user, isVerifiedBuyer, isAdmin, handleLogout, cartItemCount }) => {
  const { notificationCounts, messageCounts } = useNotifications()

  return (
    <div className="flex items-center gap-2" role="navigation" aria-label="User navigation">
      {/* Shopping Cart - Always visible for easy access */}
      <NotificationBadge
        href="/cart"
        icon={ShoppingCart}
        count={cartItemCount}
        ariaLabel={`View shopping cart (${cartItemCount} items)`}
        testId="cart-button"
        className="hover:bg-brand-primary/80 transition-colors"
      />

      {/* Notifications - Real-time updates from backend - HIDDEN ON MOBILE */}
      <div className="hidden md:block">
        <NotificationBadge
          href="/notifications"
          icon={Bell}
          count={notificationCounts.unread}
          ariaLabel={`View notifications (${notificationCounts.unread} unread)`}
          testId="notifications-button"
          className="hover:bg-brand-primary/80 transition-colors"
        />
      </div>

      {/* Messages - Real-time messaging system - HIDDEN ON MOBILE */}
      <div className="hidden md:block">
        <NotificationBadge
          href="/messages"
          icon={MessageCircle}
          count={messageCounts.unread}
          ariaLabel={`View messages (${messageCounts.unread} unread)`}
          testId="messages-button"
          className="hover:bg-brand-primary/80 transition-colors"
        />
      </div>

      {/* User Profile Dropdown - Account management and settings - HIDDEN ON MOBILE */}
      <div className="hidden md:block">
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
  <div className="flex items-center gap-2">
    {/* Guest cart access - Allow guests to view cart items */}
    <NotificationBadge
      href="/cart"
      icon={ShoppingCart}
      count={cartItemCount}
      ariaLabel={`View shopping cart (${cartItemCount} items)`}
      testId="guest-cart-button"
      className="hover:bg-brand-primary/80 transition-colors"
    />

    {/* Authentication buttons - Only show if not on auth pages */}
    {!isAuthPage && <AuthButtons />}
  </div>
))

GuestNavigation.displayName = 'GuestNavigation'

/**
 * =============================================================================
 * CURRENCY SELECTOR COMPONENT
 * =============================================================================
 *
 * Desktop currency selector for international users.
 * Shows flag and currency code with dropdown selection.
 *
 * @param currency - Current selected currency
 * @param currencies - Available currencies
 * @param setCurrency - Function to change currency
 */
const CurrencySelector = React.memo<{
  currency: string
  currencies: readonly any[]
  setCurrency: (currency: string) => void
}>(({ currency, currencies, setCurrency }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="sm"
        className="text-sm font-medium text-white bg-transparent hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20 h-8 px-3"
        aria-label="Select currency"
      >
        {currencies.find((c) => c.code === currency)?.flag} {currency}
        <ChevronDown className="ml-1 h-3 w-3" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="bg-white border border-slate-200 shadow-lg">
      {currencies.map((curr) => (
        <DropdownMenuItem
          key={curr.code}
          onClick={() => setCurrency(curr.code)}
          className="text-slate-900 hover:bg-slate-100 hover:text-slate-900 cursor-pointer focus:bg-slate-100 focus:text-slate-900"
          aria-label={`Switch to ${curr.code} currency`}
        >
          <span aria-hidden="true">{curr.flag}</span> {curr.code}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
))

CurrencySelector.displayName = 'CurrencySelector'

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

  // Application state hooks
  const { currency, setCurrency, currencies } = useCurrency()
  const { itemCount: cartItemCount, isLoading: cartLoading } = useCart()

  // Component internal state
  const [isMounted, setIsMounted] = useState(false)

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
      className="bg-brand-primary text-neutral-100 shadow-md sticky top-0 z-50"
      role="banner"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 
            =================================================================
            LOGO SECTION
            =================================================================
            Brand logo with link to homepage. Always visible and positioned
            on the left side for consistent navigation expectations.
          */}
          <Logo />

          {/* 
            =================================================================
            SEARCH SECTION
            =================================================================
            Global search functionality. Conditionally displayed based on
            current route. Hidden on auth pages and browse pages where
            search is either not needed or has dedicated space.
          */}
          {routeConfig.showSearch && (
            <div className="hidden md:flex flex-1 max-w-lg mx-4 lg:mx-8">
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
            <div className="hidden lg:flex items-center space-x-4">
              <Navigation isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
              <div className="h-4 w-px bg-white/20"></div>
              <CurrencySelector
                currency={currency}
                currencies={currencies}
                setCurrency={setCurrency}
              />
            </div>
          )}

          {/* Currency selector for medium screens without full navigation */}
          {!routeConfig.showFullNavigation && (
            <div className="hidden md:block lg:hidden">
              <CurrencySelector
                currency={currency}
                currencies={currencies}
                setCurrency={setCurrency}
              />
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
          <div className="flex items-center space-x-2 sm:space-x-3">
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
              currency={currency}
              currencies={currencies}
              setCurrency={setCurrency}
              handleLogout={logout}
            />
          </div>
        </div>
      </div>
    </div>
    </header>
  )
})

// Set display name for debugging and React DevTools
Header.displayName = 'Header'

export default Header
