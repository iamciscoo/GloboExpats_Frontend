import { NextRequest, NextResponse } from 'next/server'

// Environment variable should be set in .env.local
const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL || 'https://matomo.globoexpats.com'
const MATOMO_TOKEN = process.env.MATOMO_TOKEN // This is a secret, never expose to frontend
const MATOMO_SITE_ID = process.env.MATOMO_SITE_ID || '1' // Your site ID

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Get parameters from query string
    const method = searchParams.get('method') || 'VisitsSummary.get'
    const period = searchParams.get('period') || 'day'
    const date = searchParams.get('date') || 'today'
    const idSite = searchParams.get('idSite') || MATOMO_SITE_ID

    // Log environment variables for debugging (without exposing token)
    console.log('[MATOMO API] Config:', {
      url: MATOMO_URL,
      hasToken: !!MATOMO_TOKEN,
      siteId: MATOMO_SITE_ID,
    })

    // Build Matomo API URL
    const apiUrl = new URL(`${MATOMO_URL}/index.php`)
    apiUrl.searchParams.append('module', 'API')
    apiUrl.searchParams.append('method', method)
    apiUrl.searchParams.append('idSite', idSite)
    apiUrl.searchParams.append('period', period)
    apiUrl.searchParams.append('date', date)
    apiUrl.searchParams.append('format', 'JSON')

    if (MATOMO_TOKEN) {
      apiUrl.searchParams.append('token_auth', MATOMO_TOKEN)
    } else {
      console.error('[MATOMO API] Warning: No MATOMO_TOKEN set in environment')
    }

    console.log('[MATOMO API] Requesting:', {
      method,
      period,
      date,
      idSite,
      url: apiUrl.toString().replace(/token_auth=[^&]*/g, 'token_auth=***'),
    })

    // Fetch data from Matomo
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const responseText = await response.text()

    if (!response.ok) {
      console.error('[MATOMO API] Error response:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText.substring(0, 500),
      })

      return NextResponse.json(
        {
          error: `Matomo API returned ${response.status}: ${response.statusText}`,
          details: responseText,
        },
        { status: response.status }
      )
    }

    // Try to parse JSON response
    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('[MATOMO API] Failed to parse JSON response:', {
        responseText: responseText.substring(0, 500),
        error: e,
      })
      return NextResponse.json(
        { error: 'Invalid JSON response from Matomo', details: responseText },
        { status: 500 }
      )
    }

    console.log('[MATOMO API] Success:', { method, dataType: typeof data })
    return NextResponse.json(data)
  } catch (error) {
    console.error('[MATOMO API] Catch block error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
