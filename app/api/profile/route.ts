import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

const BACKEND_URL = process.env.BACKEND_URL || 'https://api.globoexpats.com'

/**
 * Proxy endpoint for updating user profile
 * This avoids CORS issues when making PATCH requests with multipart/form-data directly from browser
 */
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    // Get auth token from cookies or header
    const cookieStore = await cookies()
    const tokenFromCookie = cookieStore.get('authToken')?.value
    const tokenFromHeader = req.headers.get('authorization')
    const token = tokenFromHeader || (tokenFromCookie ? `Bearer ${tokenFromCookie}` : '')

    if (!token) {
      console.error('[Profile Proxy] No auth token found')
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authentication token provided' },
        { status: 401 }
      )
    }

    console.log('[Profile Proxy] PATCH /api/v1/userManagement/editProfile')
    console.log('[Profile Proxy] Token:', token.substring(0, 20) + '...')

    // Get the FormData from the request
    const formData = await req.formData()

    // Create new FormData to forward to backend
    const backendFormData = new FormData()

    // Copy all form fields
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value)
      if (key === 'profileInformationDTO') {
        console.log('[Profile Proxy] Profile data:', value)
      } else if (key === 'profileImage') {
        console.log(
          '[Profile Proxy] Profile image:',
          value instanceof File ? value.name : 'unknown'
        )
      }
    }

    const url = `${BACKEND_URL}/api/v1/userManagement/editProfile`
    console.log('[Profile Proxy] Calling backend:', url)

    const backendResponse = await fetch(url, {
      method: 'PATCH',
      headers: {
        // Don't set Content-Type - let fetch set it with boundary for multipart/form-data
        Authorization: token,
      },
      body: backendFormData,
    })

    console.log(`[Profile Proxy] Backend response status: ${backendResponse.status}`)

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('[Profile Proxy] Backend error response:', errorText)

      // Try to parse as JSON, fallback to text
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || 'Failed to update profile' }
      }

      return NextResponse.json(
        {
          error: errorData.message || 'Backend error',
          details: errorData,
          status: backendResponse.status,
        },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    console.log('[Profile Proxy] Success response:', data)

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[Profile Proxy] Exception occurred:', error)
    console.error(
      '[Profile Proxy] Error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    )
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error,
      },
      { status: 500 }
    )
  }
}
