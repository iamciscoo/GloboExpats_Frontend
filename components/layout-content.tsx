'use client'

import type React from 'react'
import { usePathname } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import Breadcrumb from '@/components/breadcrumb'
import ErrorBoundary from '@/components/error-boundary'
import { VerificationBanner } from '@/components/verification-banner'

interface LayoutContentProps {
  children: React.ReactNode
}

export function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname()

  // Hide header, footer, breadcrumb, and verification banner on auth pages
  const isAuthPage = pathname === '/login' || pathname === '/register'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ErrorBoundary level="component" name="Header">
        <Header />
      </ErrorBoundary>

      {/* Show warning to unverified accounts */}
      <VerificationBanner />

      <ErrorBoundary level="component" name="Breadcrumb">
        <Breadcrumb />
      </ErrorBoundary>

      <main className="flex-1">
        <ErrorBoundary level="page" name="Main Content">
          {children}
        </ErrorBoundary>
      </main>

      <ErrorBoundary level="component" name="Footer">
        <Footer />
      </ErrorBoundary>
    </div>
  )
}
