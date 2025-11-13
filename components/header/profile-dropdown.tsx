'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronDown, Shield, User, Bell, Settings, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import type { User as UserType } from '@/lib/types'

interface ProfileDropdownProps {
  user: UserType
  isVerifiedBuyer: boolean
  isAdmin: boolean
  onLogout: () => void
}

export const ProfileDropdown = React.memo<ProfileDropdownProps>(
  ({ user, isVerifiedBuyer, isAdmin, onLogout }) => {
    const userInitials = React.useMemo(() => getInitials(user.name), [user.name])

    return (
      <DropdownMenu>
        <div className="flex items-center">
          {/* Clickable profile link */}
          <Link href="/account" className="flex items-center gap-2 mr-2">
            <Avatar className="h-8 w-8 hover:ring-2 hover:ring-white/30 transition-all">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-brand-secondary text-brand-primary text-xs font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex items-center gap-2">
              <span className="font-medium hover:text-brand-secondary transition-colors">
                {user.name}
              </span>
              {isVerifiedBuyer && (
                <Badge className="bg-status-success text-white text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </Link>

          {/* Dropdown trigger */}
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-100 hover:bg-white/10 hover:text-white rounded-full"
              aria-label="Open user menu"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm font-medium">
            <Link
              href="/account"
              className="flex items-center gap-2 hover:bg-neutral-100 rounded-md p-2 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-brand-secondary text-brand-primary text-xs font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold hover:text-brand-primary transition-colors">
                  {user.name}
                </span>
                <span className="text-xs text-neutral-500">{user.email}</span>
                {isVerifiedBuyer && <span className="text-xs text-green-600">Verified Member</span>}
              </div>
            </Link>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            asChild
            className="cursor-pointer hover:bg-neutral-100 focus:bg-neutral-100"
          >
            <Link href="/account">
              <User className="w-4 h-4 mr-2" />
              My Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="cursor-pointer hover:bg-neutral-100 focus:bg-neutral-100"
          >
            <Link href="/account/verification">
              <Shield className="w-4 h-4 mr-2" />
              Verification
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="cursor-pointer hover:bg-neutral-100 focus:bg-neutral-100"
          >
            <Link href="/account/settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="cursor-pointer hover:bg-neutral-100 focus:bg-neutral-100"
          >
            <Link href="/notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {isAdmin && (
            <>
              <DropdownMenuItem
                asChild
                className="cursor-pointer hover:bg-neutral-100 focus:bg-neutral-100"
              >
                <Link href="/admin/dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onClick={onLogout}
            className="text-status-error focus:text-status-error focus:bg-red-50 cursor-pointer hover:bg-red-100/50"
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)

ProfileDropdown.displayName = 'ProfileDropdown'
