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

    // Forward product click events to backend for tracking
    // Backend endpoint requires authentication via Bearer token
    if (payload?.type === 'product_click' && payload?.productId) {
      console.log(`[analytics:event] 🔄 Forwarding to backend: product ${payload.productId}`)

      try {
        // Get auth token from request cookies or headers
        const authHeader = req.headers.get('authorization')
        const cookieHeader = req.headers.get('cookie')

        // Extract token from cookie if not in Authorization header
        let token = authHeader?.replace('Bearer ', '')
        if (!token && cookieHeader) {
          const authTokenMatch = cookieHeader.match(/authToken=([^;]+)/)
          if (authTokenMatch) {
            token = authTokenMatch[1]
          }
        }

        console.log(`[analytics:event] 🔑 Auth token: ${token ? 'FOUND' : 'NOT FOUND'}`)

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }

        // Add auth header if token is available (for authenticated tracking)
        // Backend still accepts anonymous tracking without token
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const backendUrl = `${BACKEND_URL}/api/v1/products/${payload.productId}/view`
        console.log(`[analytics:event] 🌐 Calling: ${backendUrl}`)

        const backendResponse = await fetch(backendUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            timestamp: payload.ts,
            source: payload.source,
          }),
        })

        const responseText = await backendResponse.text().catch(() => '')

        if (backendResponse.ok) {
          console.log(`[analytics:event] ✅ SUCCESS: Tracked view for product ${payload.productId}`)
        } else {
          console.warn(
            `[analytics:event] ⚠️  FAILED: ${backendResponse.status} ${backendResponse.statusText}`
          )
          if (responseText) {
            console.warn(`[analytics:event] Response body:`, responseText.substring(0, 200))
          }
        }
      } catch (backendError) {
        console.error('[analytics:event] ❌ EXCEPTION:', backendError)
        // Don't throw - allow the analytics event to succeed even if backend fails
      }
    }

    return new Response(null, { status: 204 })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_e) {
    return new Response(null, { status: 204 })
  }
}
