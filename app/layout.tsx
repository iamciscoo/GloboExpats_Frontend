import type React from 'react'
import type { Metadata, Viewport } from 'next'
import { Inter, Lexend } from 'next/font/google'
import './globals.css'
import { LayoutContent } from '@/components/layout-content'
import ErrorBoundary from '@/components/error-boundary'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/providers/auth-provider'
import { CartProvider } from '@/providers/cart-provider'
import { CurrencyProvider } from '@/providers/currency-provider'
import { seoConfig } from '@/lib/seo-config'

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
  metadataBase: new URL('https://www.globoexpats.com'),
  title: {
    default: seoConfig.defaultTitle,
    template: '%s | Globoexpats Tanzania',
  },
  description: seoConfig.defaultDescription,
  keywords: [...seoConfig.keywords.primary, ...seoConfig.keywords.secondary],
  authors: [{ name: 'Globoexpats Team' }],
  creator: 'Globoexpats',
  publisher: 'Globoexpats',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: seoConfig.siteUrl,
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    siteName: seoConfig.siteName,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Globoexpats - Expat Marketplace in Tanzania',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: seoConfig.social.twitter,
    creator: seoConfig.social.twitter,
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: seoConfig.siteUrl,
  },
  verification: {
    google: 'verification_token_here',
    yandex: 'verification_token_here',
  },
  category: 'shopping',
  other: {
    'geo.region': 'TZ',
    'geo.placename': 'Dar es Salaam, Tanzania',
    'geo.position': '-6.7924;39.2083',
    ICBM: '-6.7924, 39.2083',
  },
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(seoConfig.organization),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(seoConfig.website),
          }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen bg-background">
        <CurrencyProvider enableAutoRefresh>
          <AuthProvider>
            <CartProvider>
              <ErrorBoundary level="page" name="Application">
                <LayoutContent>{children}</LayoutContent>
                <Toaster />
              </ErrorBoundary>
            </CartProvider>
          </AuthProvider>
        </CurrencyProvider>
      </body>
    </html>
  )
}
