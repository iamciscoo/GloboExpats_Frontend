'use client'

/** Lightweight analytics helpers using fetch with credentials to ensure auth tokens are sent */
export type AnalyticsEvent = {
  type: 'product_click'
  productId: number
  source: 'new' | 'top' | 'featured'
  ts: number
}

const ANALYTICS_ENDPOINT = '/api/analytics/event'

export function trackProductClick(productId: number, source: AnalyticsEvent['source']) {
  const payload: AnalyticsEvent = { type: 'product_click', productId, source, ts: Date.now() }
  try {
    // Use fetch instead of sendBeacon to ensure cookies/credentials are included
    // sendBeacon doesn't send cookies, which breaks auth token forwarding
    fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include', // CRITICAL: Include cookies with request
      keepalive: true, // Keep connection alive even if page unloads
    }).catch((err) => {
      // Swallow errors to avoid impacting UX
      if (process.env.NODE_ENV === 'development') {
        console.debug('[analytics] fetch failed:', err)
      }
    })
  } catch (e) {
    // Swallow errors to avoid impacting UX
    if (process.env.NODE_ENV === 'development') console.debug('[analytics] failed', e)
  }
}
