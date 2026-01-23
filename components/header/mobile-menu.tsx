'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Menu,
  Package,
  Shield,
  Bell,
  MessageCircle,
  ShoppingCart,
  User as UserIcon,
  Settings,
  Store as StoreIcon,
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
import type { User } from '@/lib/types'
import { useCart } from '@/hooks/use-cart'
import { CurrencyToggle } from '@/components/currency-toggle'

interface MobileMenuProps {
  isLoggedIn: boolean
  isAdmin: boolean
  isAuthPage: boolean
  user: User | null
  handleLogout: () => void
}

export const MobileMenu = React.memo<MobileMenuProps>(
  ({ isLoggedIn, isAdmin, isAuthPage: _isAuthPage, user: _user, handleLogout: _handleLogout }) => {
    const [isOpen, setIsOpen] = useState(false)
    const { itemCount } = useCart()

    const handleLinkClick = () => {
      setIsOpen(false)
    }

    return (
      <div className="flex items-center gap-1">
        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-200 hover:text-white hover:bg-transparent h-8 w-8 bg-transparent"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="bg-brand-primary text-neutral-100 w-64 sm:w-72 top-[64px] h-[calc(100vh-64px)] md:top-0 md:h-screen"
            aria-describedby="menu-description"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>Access navigation options and settings</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col h-full">
              <div className="border-b border-neutral-700 px-4 py-3">
                <h3 className="font-display text-base font-semibold">Menu</h3>
              </div>

              <div className="flex-1 overflow-y-auto">
                <nav className="flex flex-col px-4 py-3 text-sm space-y-1.5">
                  <Link
                    href="/browse"
                    onClick={handleLinkClick}
                    className="text-neutral-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3 py-2.5 px-2 rounded-md"
                  >
                    <StoreIcon className="h-4 w-4" /> Market Place
                  </Link>
                  <Link
                    href="/cart"
                    onClick={handleLinkClick}
                    className="text-neutral-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3 py-2.5 px-2 rounded-md"
                  >
                    <div className="relative">
                      <ShoppingCart className="h-4 w-4" />
                      {itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-brand-secondary text-brand-primary text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                          {itemCount > 9 ? '9+' : itemCount}
                        </span>
                      )}
                    </div>
                    Shopping Cart
                  </Link>

                  {isLoggedIn ? (
                    <>
                      <Link
                        href="/expat/dashboard"
                        onClick={handleLinkClick}
                        className="text-neutral-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3 py-2.5 px-2 rounded-md"
                      >
                        <Package className="h-4 w-4" />
                        My Space
                      </Link>
                      <Link
                        href="/notifications"
                        onClick={handleLinkClick}
                        className="text-neutral-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3 py-2.5 px-2 rounded-md"
                      >
                        <Bell className="h-4 w-4" />
                        Notifications
                      </Link>
                      <Link
                        href="/messages"
                        onClick={handleLinkClick}
                        className="text-neutral-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3 py-2.5 px-2 rounded-md"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Messages
                      </Link>
                      <Link
                        href="/account"
                        onClick={handleLinkClick}
                        className="text-neutral-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3 py-2.5 px-2 rounded-md"
                      >
                        <UserIcon className="h-4 w-4" />
                        My Account
                      </Link>
                      <Link
                        href="/account/verification"
                        onClick={handleLinkClick}
                        className="text-neutral-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3 py-2.5 px-2 rounded-md"
                      >
                        <Shield className="h-4 w-4" />
                        Verification
                      </Link>
                      <Link
                        href="/account/settings"
                        onClick={handleLinkClick}
                        className="text-neutral-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3 py-2.5 px-2 rounded-md"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin/dashboard"
                          onClick={handleLinkClick}
                          className="text-neutral-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3 py-2.5 px-2 rounded-md"
                        >
                          <Shield className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}
                    </>
                  ) : null}
                </nav>

                {/* Mobile Currency Selector - placed right after menu list */}
                <div className="px-4 py-4 border-t border-neutral-700">
                  <div className="space-y-3">
                    <div className="text-xs font-medium uppercase tracking-wide text-white/70">
                      CURRENCY:
                    </div>
                    <CurrencyToggle variant="default" showRates size="lg" className="w-full" />
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    )
  }
)

MobileMenu.displayName = 'MobileMenu'
