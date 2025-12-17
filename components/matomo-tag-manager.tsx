'use client'

import { useEffect } from 'react'

export function MatomoTagManager() {
  useEffect(() => {
    // Initialize Matomo Tag Manager
    const _mtm = (window._mtm = window._mtm || [])
    _mtm.push({ 'mtm.startTime': new Date().getTime(), event: 'mtm.Start' })

    const d = document
    const g = d.createElement('script')
    const s = d.getElementsByTagName('script')[0]

    g.async = true
    g.src = 'https://matomo.globoexpats.com/js/container_xVOIsphD.js'

    if (s && s.parentNode) {
      s.parentNode.insertBefore(g, s)
    }
  }, [])

  return null
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _mtm?: any[]
  }
}
