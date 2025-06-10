import HeroCarousel from "@/components/hero-carousel"
import FeaturedListings from "@/components/featured-listings"
import TrustIndicators from "@/components/trust-indicators"
import CategorySidebar from "@/components/category-sidebar"
import MobileSidebarToggle from "@/components/mobile-sidebar-toggle"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Sidebar Toggle */}
      <MobileSidebarToggle />
      
      <div className="flex">
        {/* Desktop Sidebar with Categories */}
        <div className="hidden lg:block">
          <CategorySidebar />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 relative">
          {/* Featured Listings - First Section */}
          <FeaturedListings />

          {/* Trust Indicators */}
          <TrustIndicators />

          {/* Hero Carousel - Before Footer */}
          <HeroCarousel />
        </main>
      </div>
    </div>
  )
}
