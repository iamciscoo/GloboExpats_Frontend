'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the checkout content with SSR disabled
// This prevents build errors related to browser-specific APIs (window, localStorage, etc.)
// and avoids edge runtime conflicts during static generation
const CheckoutContent = dynamic(() => import('./checkout-content'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center bg-white p-12 rounded-3xl shadow-futuristic border border-neutral-200">
        <div className="w-20 h-20 border-6 border-neutral-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Checkout</h2>
        <p className="text-gray-600 text-lg">Please wait...</p>
      </div>
    </div>
  ),
})

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center bg-white p-12 rounded-3xl shadow-futuristic border border-neutral-200">
          <div className="w-20 h-20 border-6 border-neutral-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Checkout</h2>
          <p className="text-gray-600 text-lg">Please wait...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
