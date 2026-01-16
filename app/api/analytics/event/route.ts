export const runtime = 'nodejs'

// Server-side backend URL (NOT the public one - this runs server-side in Next.js)
// Use process.env.BACKEND_URL for server-side calls to avoid CORS
const BACKEND_URL = process.env.BACKEND_URL || 'https://api.globoexpats.com'

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => null)
    if (process.env.NODE_ENV === 'development') {
      console.log('[analytics:event]', payload)
    }

    // Forward product click events to backend for tracking
    // Backend endpoint requires authentication via Bearer token
    if (payload?.type === 'product_click' && payload?.productId) {
      console.log(`[analytics:event] 🔄 Attempting to track view for product ${payload.productId}`)

      try {
        // Get auth token from request cookies or headers
        const authHeader = req.headers.get('authorization')
        const cookieHeader = req.headers.get('cookie')

        // Extract token from cookie if not in Authorization header
        let token = authHeader?.replace('Bearer ', '')
        if (!token && cookieHeader) {
          // Try different cookie formats
          const tokenPatterns = [
            /expat_auth_token=([^;]+)/,
            /authToken=([^;]+)/,
            /auth_token=([^;]+)/,
            /token=([^;]+)/,
          ]

          for (const pattern of tokenPatterns) {
            const match = cookieHeader.match(pattern)
            if (match) {
              token = decodeURIComponent(match[1])
              break
            }
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

        // Try the product click count endpoint (POST to increment, GET to retrieve)
        const backendUrl = `${BACKEND_URL}/api/v1/products/product-clickCount/${payload.productId}`
        console.log(`[analytics:event] 🌐 Calling: ${backendUrl}`)

        const backendResponse = await fetch(backendUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            timestamp: payload.ts,
            source: payload.source,
          }),
          signal: AbortSignal.timeout(3000), // 3 second timeout (reduced)
        })

        const responseText = await backendResponse.text().catch(() => '')

        if (backendResponse.ok) {
          console.log(`[analytics:event] ✅ SUCCESS: Tracked view for product ${payload.productId}`)
        } else if (backendResponse.status === 404) {
          console.warn(
            `[analytics:event] ⚠️ ENDPOINT NOT IMPLEMENTED: Backend click tracking endpoint not available yet`
          )
          console.warn(
            `[analytics:event] ℹ️  Product clicks will be tracked when backend implements POST /api/v1/products/product-clickCount/{productId}`
          )
        } else {
          console.warn(
            `[analytics:event] ⚠️ FAILED: ${backendResponse.status} ${backendResponse.statusText}`
          )
          if (responseText) {
            console.warn(`[analytics:event] Response body:`, responseText.substring(0, 200))
          }
        }
      } catch (backendError) {
        console.error('[analytics:event] ❌ EXCEPTION:', backendError)
        // Check if it's a network error (endpoint doesn't exist)
        if (backendError instanceof Error && backendError.message.includes('fetch')) {
          console.warn('[analytics:event] ℹ️ Backend view tracking endpoint appears to be missing')
        }
        // Don't throw - allow the analytics event to succeed even if backend fails
      }
    }

    return new Response(null, { status: 204 })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_e) {
    return new Response(null, { status: 204 })
  }
}
