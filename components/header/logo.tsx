import React from 'react'
import Link from 'next/link'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'text-xl sm:text-2xl',
  md: 'text-2xl',
  lg: 'text-3xl',
}

export const Logo = React.memo<LogoProps>(({ className, size = 'md' }) => {
  return (
    <Link href="/" className={`flex items-center space-x-2 ${className || ''}`}>
      <div className={`${sizeClasses[size]} font-bold font-display text-white`}>
        Globo<span className="text-brand-secondary">expats</span>
      </div>
    </Link>
  )
})

Logo.displayName = 'Logo'
