import type React from 'react'
import type { Metadata, Viewport } from 'next'
import { Inter, Lexend } from 'next/font/google'
import './globals.css'
import { LayoutContent } from '@/components/layout-content'
import ErrorBoundary from '@/components/error-boundary'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/providers/auth-provider'
import { CartProvider } from '@/providers/cart-provider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Globoexpat - Marketplace for Expats',
  description:
    'Connect with verified sellers worldwide. Buy and sell quality items in the global expat community.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1e40af',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${inter.variable} ${lexend.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-background">
        <AuthProvider>
          <CartProvider>
            <ErrorBoundary level="page" name="Application">
              <LayoutContent>{children}</LayoutContent>
              <Toaster />
            </ErrorBoundary>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
