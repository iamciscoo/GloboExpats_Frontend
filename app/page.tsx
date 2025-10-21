/**
 * =============================================================================
 * HOMEPAGE - MAIN LANDING PAGE
 * =============================================================================
 *
 * The main landing page for the Globoexpats Marketplace. This page serves as the
 * primary entry point for users and showcases the platform's key features and
 * offerings in a visually appealing and user-friendly layout.
 *
 * Page Architecture:
 * The homepage follows a strategic layout hierarchy prioritizing user engagement
 * and conversion, with listings as the main focus while providing supporting
 * elements that build trust and encourage exploration.
 *
 * Layout Priority (Top to Bottom):
 * 1. Featured Listings - Primary focus showcasing quality products
 * 2. Community Highlights - Engaging expat community introduction
 * 3. Hero Carousel - Visual category showcase and inspiration
 *
 * Connected Components:
 * - components/hero-carousel.tsx - Category showcase with rotating images
 * - components/featured-listings.tsx - Primary product display grid
 * - components/category-sidebar.tsx - Product category navigation
 * - components/mobile-sidebar-toggle.tsx - Mobile navigation toggle
 *
 * State Management:
 * - No direct state management - relies on child components
 * - Category filtering handled by CategorySidebar
 * - Product data fetched by FeaturedListings component
 *
 * Backend Integration Points:
 * - GET /api/products/featured - Featured products for listings
 * - GET /api/categories - Product categories for sidebar
 * - GET /api/stats - Platform statistics for trust indicators
 *
 * SEO and Performance:
 * - Server-side rendered for optimal SEO
 * - Optimized images with Next.js Image component
 * - Strategic component lazy loading
 * - Semantic HTML structure for accessibility
 *
 * User Experience Features:
 * - Responsive design adapts to all screen sizes
 * - Progressive enhancement for JavaScript-disabled users
 * - Clear visual hierarchy guides user attention
 * - Multiple engagement points encourage exploration
 * - Trust-building elements reduce conversion friction
 */
import dynamic from 'next/dynamic'
import CategorySidebar from '@/components/category-sidebar'
import MobileSidebarToggle from '@/components/mobile-sidebar-toggle'

// Lazy load heavy components for better initial page load
// Note: In App Router, all components SSR by default. Dynamic imports still provide code splitting benefits.
const HeroCarousel = dynamic(() => import('@/components/hero-carousel'), {
  loading: () => (
    <div className="w-full h-[400px] bg-gradient-to-r from-blue-100 to-cyan-100 animate-pulse rounded-xl" />
  ),
})

const NewListingsSlider = dynamic(() => import('@/components/sections/new-listings-slider'), {
  loading: () => <div className="w-full h-64 bg-gray-100 animate-pulse rounded-xl" />,
})

const TopPicksSlider = dynamic(() => import('@/components/sections/top-picks-slider'), {
  loading: () => <div className="w-full h-64 bg-gray-100 animate-pulse rounded-xl" />,
})

const FeaturedGrid = dynamic(() => import('@/components/sections/featured-grid'), {
  loading: () => <div className="w-full h-96 bg-gray-100 animate-pulse rounded-xl" />,
})

import type { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo-config'

// Homepage SEO metadata
export const metadata: Metadata = generatePageMetadata({
  title: 'Globoexpats - Expat Marketplace in Tanzania | Buy & Sell in Dar es Salaam',
  description:
    'Globoexpats is the trusted marketplace for expats in Tanzania. Buy and sell quality items in Dar es Salaam, Arusha, and across East Africa. Connect with verified sellers and join the expat community.',
  keywords: [
    'expat marketplace tanzania',
    'buy sell dar es salaam',
    'expat community tanzania',
    'second hand items tanzania',
    'verified sellers dar es salaam',
    'expat shopping arusha',
    'tanzania online marketplace',
  ],
  path: '/',
  type: 'website',
})

/**
 * =============================================================================
 * HOMEPAGE COMPONENT
 * =============================================================================
 *
 * Main homepage component that orchestrates the layout and content flow.
 * Uses a mobile-first responsive design with strategic content placement
 * to maximize user engagement and platform adoption.
 *
 * Design Philosophy:
 * - Mobile-first responsive design
 * - Content hierarchy optimized for conversion
 * - Trust-building elements strategically placed
 * - Clear calls-to-action at decision points
 * - Engaging visuals without overwhelming content
 *
 * Performance Considerations:
 * - Server-side rendering for fast initial load
 * - Component-level code splitting
 * - Optimized image loading with proper sizing
 * - Minimal JavaScript for core functionality
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
      {/* 
        =======================================================================
        MOBILE NAVIGATION TOGGLE
        =======================================================================
        Provides quick access to category navigation on mobile devices.
        Positioned at the top for immediate visibility and accessibility.
        
        Connected Component: components/mobile-sidebar-toggle.tsx
        Functionality: Toggles CategorySidebar visibility on mobile/tablet
      */}
      <MobileSidebarToggle />

      <div className="flex relative z-10">
        {/* 
          ===================================================================
          DESKTOP CATEGORY SIDEBAR
          ===================================================================
          Desktop-only category navigation sidebar. Provides persistent access
          to product categories and filtering options for large screens.
          
          Connected Component: components/category-sidebar.tsx
          Data Source: lib/constants.ts - CATEGORIES
          Functionality: Category filtering and navigation
          Responsive: Hidden on mobile (lg:block)
        */}
        <div className="hidden lg:block flex-shrink-0">
          <CategorySidebar />
        </div>

        {/* 
          ===================================================================
          MAIN CONTENT AREA
          ===================================================================
          Primary content container housing all main homepage sections.
          Uses flexbox layout for responsive design and proper content flow.
        */}
        <main className="flex-1 relative min-w-0 px-4 lg:px-6 xl:px-8 pt-2 lg:pt-0">
          {/* 
            =================================================================
            FEATURED LISTINGS SECTION - PRIMARY CONVERSION POINT
            =================================================================
            Showcasing quality products from verified sellers. This is the
            main conversion point where users discover and engage with
            marketplace offerings.
            
            Connected Component: components/featured-listings.tsx
            Data Source: Backend API /api/products/featured
            Features: Product cards, seller verification, pricing, images
            User Actions: View details, add to cart, contact seller
          */}
          {/* New Listings - Horizontal slider */}
          <NewListingsSlider />

          {/* Top Picks - Engagement driven slider */}
          <TopPicksSlider />

          {/* Featured - 3 columns x up to 4 rows */}
          <FeaturedGrid />

          {/* 
            =================================================================
            HERO CAROUSEL SECTION - MOVED BACK TO BOTTOM
            =================================================================
            Visual category showcase with rotating images. Positioned at
            the bottom to provide inspiration and category exploration
            after users have seen products and trust indicators.
            
            Connected Component: components/hero-carousel.tsx
            Data Source: lib/constants.ts - CAROUSEL_ITEMS
            Features: Auto-rotation, category navigation, responsive images
            Purpose: Visual inspiration and category discovery
          */}
          <HeroCarousel />
        </main>
      </div>
    </div>
  )
}
