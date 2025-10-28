export const runtime = 'nodejs'

// Server-side backend URL (NOT the public one - this runs server-side in Next.js)
// Use process.env.BACKEND_URL for server-side calls to avoid CORS
const BACKEND_URL = process.env.BACKEND_URL || 'http://10.123.22.21:8081'

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => null)
    if (process.env.NODE_ENV === 'development') {
      console.log('[analytics:event]', payload)
    }

    // Track product views in backend if it's a product_click event
    if (payload?.type === 'product_click' && payload?.productId) {
      try {
        // POST to backend to track view count
        // This increments the view_count field in the database
        const backendResponse = await fetch(
          `${BACKEND_URL}/api/v1/products/${payload.productId}/view`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            // Send just an empty body or the full payload if backend needs it
            body: JSON.stringify({ timestamp: payload.ts }),
          }
        )

        if (!backendResponse.ok && process.env.NODE_ENV === 'development') {
          console.warn(
            `[analytics:event] Backend view tracking failed (${backendResponse.status}) - endpoint may not exist yet`
          )
        }
      } catch (backendError) {
        // Silently fail - don't block the response
        if (process.env.NODE_ENV === 'development') {
          console.warn('[analytics:event] Backend call failed:', backendError)
        }
      }
    }

    return new Response(null, { status: 204 })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_e) {
    return new Response(null, { status: 204 })
  }
}
