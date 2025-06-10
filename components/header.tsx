"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, Package, Shield, LogIn, UserPlus, MessageCircle, User, Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { useCurrency } from "@/hooks/use-currency"
import { getInitials } from "@/lib/utils"
import SearchBar from "@/components/search-bar"
import { CATEGORIES } from "@/lib/constants"

export default function Header() {
  const { isLoggedIn, user, isVerifiedBuyer, isAdmin, handleLogin, handleLogout } = useAuth()
  const { currency, setCurrency, currencies } = useCurrency()
  const [isMounted, setIsMounted] = useState(false)
  
  const pathname = usePathname()
  const isAuthPage = pathname === "/login" || pathname === "/register"

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const renderAuthButtons = () => {
    if (isAuthPage) return null

    return (
      <div className="flex items-center gap-2">
        <Link href="/register" className="hidden lg:block">
          <Button
            variant="outline"
            className="border-neutral-400 text-neutral-100 bg-brand-primary hover:bg-neutral-100 hover:text-brand-primary transition-all duration-300"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Join as Expert
          </Button>
        </Link>
        <Link href="/login">
          <Button className="bg-brand-secondary hover:bg-amber-500 text-brand-primary font-semibold transition-all duration-300 transform hover:scale-105">
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Button>
        </Link>
      </div>
    )
  }

  const renderProfileDropdown = () => (
    <>
      {/* Notifications */}
      <Link href="/notifications" className="hidden md:block">
        <Button
          variant="ghost"
          size="icon"
          className="text-neutral-200 hover:bg-white/10 hover:text-white relative rounded-full"
        >
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 bg-status-error text-white text-xs px-1 min-w-[16px] h-4">
            5
          </Badge>
        </Button>
      </Link>

      {/* Messages */}
      <Link href="/messages" className="hidden md:block">
        <Button
          variant="ghost"
          size="icon"
          className="text-neutral-200 hover:bg-white/10 hover:text-white relative rounded-full"
        >
          <MessageCircle className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 bg-status-error text-white text-xs px-1 min-w-[16px] h-4">
            3
          </Badge>
        </Button>
      </Link>

      {/* Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="text-neutral-100 hover:bg-white/10 hover:text-white flex items-center gap-2 p-1 rounded-full md:rounded-lg md:p-2"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="bg-brand-secondary text-brand-primary text-xs font-bold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex items-center gap-2">
              <span className="font-medium">{user.name}</span>
              {isVerifiedBuyer && (
                <Badge className="bg-status-success text-white text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <ChevronDown className="h-4 w-4 hidden md:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm font-medium">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="bg-brand-secondary text-brand-primary text-xs font-bold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold">{user.name}</span>
                <span className="text-xs text-neutral-500">{user.email}</span>
              </div>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="cursor-pointer hover:bg-neutral-100 focus:bg-neutral-100">
            <Link href="/seller/settings">
              <User className="w-4 h-4 mr-2" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer hover:bg-neutral-100 focus:bg-neutral-100">
            <Link href="/seller/dashboard">
              <Package className="w-4 h-4 mr-2" />
              My Listings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer hover:bg-neutral-100 focus:bg-neutral-100">
            <Link href="/messages">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {isAdmin && (
            <>
              <DropdownMenuItem className="cursor-pointer hover:bg-neutral-100 focus:bg-neutral-100">
                <Shield className="w-4 h-4 mr-2" />
                Admin Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={handleLogout} className="text-status-error focus:text-status-error focus:bg-red-50 cursor-pointer hover:bg-red-100/50">
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
  
  if (!isMounted) {
    return (
       <header className="bg-brand-primary text-neutral-100 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
             {/* Placeholder for logo */}
            <div className="flex items-center space-x-2">
               <div className="text-2xl font-bold font-display text-white">
                Global<span className="text-brand-secondary">Expat</span>
              </div>
            </div>
             {/* Placeholder for nav */}
            <div className="h-10 w-1/2 bg-brand-primary/50 animate-pulse rounded-md"></div>
             {/* Placeholder for buttons */}
            <div className="h-10 w-48 bg-brand-primary/50 animate-pulse rounded-md"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-brand-primary text-neutral-100 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold font-display text-white">
              Global<span className="text-brand-secondary">Expat</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4 lg:mx-8">
            <SearchBar />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/browse" className="text-sm font-medium text-neutral-200 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-colors">
              Browse
            </Link>
            {isLoggedIn && (
              <Link
                href="/seller/dashboard"
                className="text-sm font-medium text-neutral-200 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-colors flex items-center gap-1"
              >
                <Package className="h-4 w-4" />
                Seller Hub
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

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Search Toggle */}
            {!isLoggedIn && (
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-neutral-200 hover:text-white">
                      <Search className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="top" className="h-24 bg-brand-primary border-b-0">
                    <div className="pt-4 px-4">
                      <SearchBar />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            )}

            {/* Currency Selector */}
            <div className="hidden sm:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-sm font-medium text-neutral-200 hover:bg-ghost-hover hover:text-ghost-hover-foreground"
                  >
                    {currencies.find((c) => c.code === currency)?.flag} {currency} <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {currencies.map((curr) => (
                    <DropdownMenuItem key={curr.code} onClick={() => setCurrency(curr.code)}>
                      {curr.flag} {curr.code}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Profile/Login */}
            {isLoggedIn ? renderProfileDropdown() : renderAuthButtons()}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-neutral-200 hover:text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-brand-primary text-neutral-100 w-64 sm:w-72">
                <div className="flex flex-col h-full p-4 space-y-6">
                  <div className="border-b border-neutral-700 pb-4">
                    <h3 className="font-display text-lg font-semibold">Menu</h3>
                  </div>

                  <nav className="flex flex-col space-y-4 text-sm">
                    <Link href="/browse" className="text-neutral-200 hover:text-white transition-colors flex items-center gap-2 py-2">
                      <Search className="h-4 w-4" /> Browse
                    </Link>
                    
                    {isLoggedIn ? (
                      <>
                        <Link
                          href="/seller/dashboard"
                          className="text-neutral-200 hover:text-white transition-colors flex items-center gap-2 py-2"
                        >
                          <Package className="h-4 w-4" />
                          Seller Hub
                        </Link>
                        <Link href="/notifications" className="text-neutral-200 hover:text-white transition-colors flex items-center gap-2 py-2">
                          <Bell className="h-4 w-4" />
                          Notifications
                        </Link>
                        <Link href="/messages" className="text-neutral-200 hover:text-white transition-colors flex items-center gap-2 py-2">
                          <MessageCircle className="h-4 w-4" />
                          Messages
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
                    <div className="sm:hidden">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button variant="outline" className="w-full justify-between border-neutral-400 text-neutral-100 hover:bg-neutral-700 hover:text-white">
                            <span>{currencies.find((c) => c.code === currency)?.flag} {currency}</span>
                            <ChevronDown className="ml-1 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                          {currencies.map((curr) => (
                            <DropdownMenuItem key={curr.code} onClick={() => setCurrency(curr.code)}>
                              {curr.flag} {curr.code}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {isLoggedIn ? (
                       <Button onClick={handleLogout} variant="outline" className="w-full border-status-error/50 text-status-error hover:bg-status-error hover:text-white">
                         Logout
                       </Button>
                    ) : (
                      !isAuthPage && (
                        <>
                          <Link href="/login" className="block">
                            <Button className="w-full bg-brand-secondary hover:bg-amber-500 text-brand-primary font-semibold">
                              <LogIn className="mr-2 h-4 w-4" />
                              Login
                            </Button>
                          </Link>
                          <Link href="/register" className="block lg:hidden">
                            <Button
                              variant="outline"
                              className="w-full border-neutral-400 text-neutral-100 hover:bg-neutral-100 hover:text-brand-primary"
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              Join as Expert
                            </Button>
                          </Link>
                        </>
                      )
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
