'use client'

import React from 'react'
import Link from 'next/link'
import {
  Menu,
  Package,
  Shield,
  Bell,
  MessageCircle,
  ChevronDown,
  ShoppingCart,
  User as UserIcon,
  Settings,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { User, Currency } from '@/lib/types'
import { useCart } from '@/hooks/use-cart'

interface MobileMenuProps {
  isLoggedIn: boolean
  isAdmin: boolean
  isAuthPage: boolean
  user: User | null
  currency: string
  currencies: readonly Currency[]
  setCurrency: (currency: string) => void
  handleLogout: () => void
}

// Cart menu item component
const CartMenuItem = React.memo(() => {
  const { itemCount } = useCart()

  return (
    <Link
      href="/cart"
      className="text-neutral-200 hover:text-white transition-colors flex items-center gap-2 py-2"
    >
      <div className="relative">
        <ShoppingCart className="h-4 w-4" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-brand-secondary text-brand-primary text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </div>
      Shopping Cart {itemCount > 0 && `(${itemCount})`}
    </Link>
  )
})

CartMenuItem.displayName = 'CartMenuItem'

export const MobileMenu = React.memo<MobileMenuProps>(
  ({
    isLoggedIn,
    isAdmin,
    isAuthPage: _isAuthPage,
    user: _user,
    currency,
    currencies,
    setCurrency,
    handleLogout,
  }) => {
    return (
      <div className="flex items-center gap-1">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-200 hover:text-white h-8 w-8"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="bg-brand-primary text-neutral-100 w-64 sm:w-72 top-[64px] h-[calc(100vh-64px)] md:top-0 md:h-screen"
            aria-describedby="menu-description"
            hideOverlay={true}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>Access navigation options and settings</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col h-full p-4 space-y-6">
              <div className="border-b border-neutral-700 pb-4">
                <h3 className="font-display text-lg font-semibold">Menu</h3>
              </div>

              <nav className="flex flex-col space-y-4 text-sm">
                <Link
                  href="/browse"
                  className="text-neutral-200 hover:text-white transition-colors flex items-center gap-2 py-2"
                >
                  <Search className="h-4 w-4" /> Browse
                </Link>

                <CartMenuItem />

                {isLoggedIn ? (
                  <>
                    <Link
                      href="/expat/dashboard"
                      className="text-neutral-200 hover:text-white transition-colors flex items-center gap-2 py-2"
                    >
                      <Package className="h-4 w-4" />
                      My Listings
                    </Link>
                    <Link
                      href="/notifications"
                      className="text-neutral-200 hover:text-white transition-colors flex items-center gap-2 py-2"
                    >
                      <Bell className="h-4 w-4" />
                      Notifications
                    </Link>
                    <Link
                      href="/messages"
                      className="text-neutral-200 hover:text-white transition-colors flex items-center gap-2 py-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Messages
                    </Link>
                    <Link
                      href="/account"
                      className="text-neutral-200 hover:text-white transition-colors flex items-center gap-2 py-2"
                    >
                      <UserIcon className="h-4 w-4" />
                      My Account
                    </Link>
                    <Link
                      href="/account/verification"
                      className="text-neutral-200 hover:text-white transition-colors flex items-center gap-2 py-2"
                    >
                      <Shield className="h-4 w-4" />
                      Verification
                    </Link>
                    <Link
                      href="/account/settings"
                      className="text-neutral-200 hover:text-white transition-colors flex items-center gap-2 py-2"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        className="text-neutral-200 hover:text-white transition-colors flex items-center gap-2 py-2"
                      >
                        <Shield className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    )}
                  </>
                ) : null}
              </nav>

              <div className="mt-auto pt-6 border-t border-neutral-700 space-y-3">
                {/* Mobile Currency Selector */}
                <div className="space-y-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between rounded-full border-2 border-white/60 text-white bg-transparent hover:bg-white hover:text-slate-900 hover:border-white px-4 py-2 h-auto"
                        aria-label="Select currency"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-xs font-medium uppercase tracking-wide">
                            CURRENCY:
                          </span>
                          {currencies.find((c) => c.code === currency)?.flag} {currency}
                        </span>
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56 bg-white border border-slate-200 shadow-lg rounded-lg z-[100]"
                      align="center"
                      side="top"
                      sideOffset={8}
                    >
                      {currencies.map((curr) => (
                        <DropdownMenuItem
                          key={curr.code}
                          onClick={() => setCurrency(curr.code)}
                          className="text-slate-900 hover:bg-slate-100 hover:text-slate-900 cursor-pointer focus:bg-slate-100 focus:text-slate-900 flex items-center gap-2 px-3 py-2"
                          aria-label={`Switch to ${curr.code} currency`}
                        >
                          <span aria-hidden="true" className="text-base">
                            {curr.flag}
                          </span>
                          <span className="font-medium">{curr.code}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {isLoggedIn && (
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full border-2 border-red-400 text-red-400 bg-transparent hover:bg-red-500 hover:text-white hover:border-red-500"
                  >
                    Logout
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    )
  }
)

MobileMenu.displayName = 'MobileMenu'
