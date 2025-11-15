'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * ScrollToTop Component
 *
 * Automatically scrolls to the top of the page whenever the route changes.
 * This ensures a consistent user experience across all pages, especially on mobile devices.
 */
export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Scroll to top instantly when route changes
    window.scrollTo({ top: 0, behavior: 'instant' })
    // Fallback for older browsers
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
