import React from 'react'
import Link from 'next/link'
import { LogIn, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const AuthButtons = React.memo(() => (
  <div className="flex items-center gap-1 sm:gap-2">
    {/* Mobile: Orange Login icon only */}
    <Link href="/login" className="md:hidden">
      <Button
        variant="ghost"
        size="sm"
        className="text-brand-secondary hover:bg-brand-secondary/10 hover:text-amber-500 h-8 w-8 p-0"
      >
        <LogIn className="w-5 h-5" />
      </Button>
    </Link>

    {/* Desktop: Both Login and Register buttons */}
    <div className="hidden md:flex items-center gap-2">
      <Link href="/login">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20 h-8 px-3"
        >
          <LogIn className="w-4 h-4 mr-1" />
          <span>Login</span>
        </Button>
      </Link>
      <Link href="/register">
        <Button
          size="sm"
          className="bg-brand-secondary hover:bg-amber-500 text-slate-900 font-semibold h-8 px-3"
        >
          <UserPlus className="w-4 h-4 mr-1" />
          <span>Join</span>
        </Button>
      </Link>
    </div>
  </div>
))

AuthButtons.displayName = 'AuthButtons'
