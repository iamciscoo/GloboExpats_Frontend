import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const BACKEND_URL = process.env.BACKEND_URL || 'http://10.123.22.21:8081'

/**
 * Proxy endpoint for Google OAuth initiation
 * This proxies requests to the backend OAuth endpoint to avoid CORS and caching issues
 *
 * Flow:
 * 1. Frontend calls: GET /api/oauth/google?nextPath=/
 * 2. This proxies to: GET http://10.123.22.21:8081/api/v1/oauth2/login/google?nextPath=/
 * 3. Backend returns: { authUrl: "https://accounts.google.com/o/oauth2/..." }
 * 4. Frontend redirects browser to authUrl
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Get nextPath from query params
    const searchParams = req.nextUrl.searchParams
    const nextPath = searchParams.get('nextPath') || '/'

    const url = `${BACKEND_URL}/api/v1/oauth2/login/google?nextPath=${encodeURIComponent(nextPath)}`
    console.log('[OAuth Proxy] Calling backend:', url)

    const backendResponse = await fetch(url, {
      method: 'GET',
      headers: {
        accept: '*/*',
      },
    })

    console.log(`[OAuth Proxy] Backend response status: ${backendResponse.status}`)

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('[OAuth Proxy] Backend error response:', errorText)

      return NextResponse.json(
        {
          error: 'Failed to initiate Google OAuth',
          message: errorText || 'Backend error',
          status: backendResponse.status,
        },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    console.log('[OAuth Proxy] Success - Auth URL received')

    // Return the auth URL to the frontend
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[OAuth Proxy] Exception occurred:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
