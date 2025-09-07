'use client'
import Link from 'next/link'
import { Home, Search, ArrowLeft, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-[150px] md:text-[200px] font-bold text-neutral-200 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="w-24 h-24 md:w-32 md:h-32 text-neutral-400" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
          Oops! Page not found
        </h1>
        <p className="text-lg text-neutral-600 mb-8 max-w-lg mx-auto">
          We couldn't find the page you're looking for. It might have been moved, deleted, or maybe
          it never existed in the first place.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto">
              <Home className="mr-2 h-4 w-4" />
              Go to Homepage
            </Button>
          </Link>
          <Link href="/browse">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Browse Products
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="border-t pt-8">
          <p className="text-sm text-neutral-600 mb-4">Here are some helpful links:</p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/help" className="text-brand-primary hover:underline">
              Help Center
            </Link>
            <span className="text-neutral-400">•</span>
            <Link href="/contact" className="text-brand-primary hover:underline">
              Contact Support
            </Link>
            <span className="text-neutral-400">•</span>
            <Link href="/register" className="text-brand-primary hover:underline">
              Become a Seller
            </Link>
            <span className="text-neutral-400">•</span>
            <Link href="/about" className="text-brand-primary hover:underline">
              About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
