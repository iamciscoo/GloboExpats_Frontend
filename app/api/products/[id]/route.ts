import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

const BACKEND_URL = process.env.BACKEND_URL || 'https://api.globoexpats.com'

// Helper function to create a clean FormData for backend
function createCleanFormData(originalFormData: FormData): FormData {
  const cleanFormData = new FormData()

  for (const [key, value] of originalFormData.entries()) {
    if (key === 'product') {
      // Ensure product data is clean JSON string
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value)
          const cleanJsonString = JSON.stringify(parsed) // Re-stringify to ensure clean format
          cleanFormData.append(key, cleanJsonString)
        } catch (e) {
          console.error('[Proxy] Invalid product JSON, using original:', e)
          cleanFormData.append(key, value)
        }
      } else {
        cleanFormData.append(key, value)
      }
    } else if (key === 'images' && value instanceof File) {
      // Ensure file has proper metadata
      const file = value as File
      if (file.size > 0 && file.name && file.type) {
        cleanFormData.append(key, file, file.name) // Explicitly set filename
      } else {
        console.warn(
          `[Proxy] Skipping invalid file: ${file.name || 'unnamed'}, size: ${file.size}, type: ${file.type}`
        )
      }
    } else {
      // Other fields (like imageIds)
      cleanFormData.append(key, value)
    }
  }

  return cleanFormData
}

/**
 * Proxy endpoint for updating products
 * This avoids CORS issues when making PATCH requests directly from browser
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Await the params in Next.js 15
    const params = await context.params
    const productId = params.id

    // Get auth token from cookies or header
    const cookieStore = await cookies()
    const tokenFromCookie = cookieStore.get('authToken')?.value
    const tokenFromHeader = req.headers.get('authorization')
    const token = tokenFromHeader || (tokenFromCookie ? `Bearer ${tokenFromCookie}` : '')

    if (!token) {
      console.error('[Proxy] No auth token found')
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authentication token provided' },
        { status: 401 }
      )
    }

    console.log(`[Proxy] PATCH /api/products/${productId}`)
    console.log('[Proxy] Token:', token.substring(0, 20) + '...')

    // Check content type to determine if it's JSON or multipart
    const contentType = req.headers.get('content-type') || ''
    const isMultipart = contentType.includes('multipart/form-data')

    let backendFormData: FormData

    if (isMultipart) {
      // Request already has FormData with images
      console.log('[Proxy] Received multipart/form-data request')
      const formData = await req.formData()

      // Create clean FormData for backend
      console.log('[Proxy] Creating clean FormData for backend...')
      backendFormData = createCleanFormData(formData)

      // Validate the clean FormData (DO NOT APPEND - createCleanFormData already did that)
      let productData = null
      let imageCount = 0

      for (const [key, value] of formData.entries()) {
        if (key === 'product') {
          productData = value
          console.log(
            '[Proxy] Product data size:',
            typeof value === 'string' ? value.length : 'not string',
            'bytes'
          )

          // Validate product JSON
          if (typeof value === 'string') {
            try {
              const parsed = JSON.parse(value)
              console.log('[Proxy] Product data keys:', Object.keys(parsed))

              // Check for extremely large descriptions that might cause issues
              if (parsed.productDescription && parsed.productDescription.length > 10000) {
                console.warn(
                  '[Proxy] Very long product description:',
                  parsed.productDescription.length,
                  'chars'
                )
              }
            } catch (e) {
              console.error('[Proxy] Invalid product JSON:', e)
              return NextResponse.json(
                { error: 'Invalid product data', message: 'Product data is not valid JSON' },
                { status: 400 }
              )
            }
          }
          // NOTE: Do NOT append here - createCleanFormData already added this
        } else if (key === 'images') {
          imageCount++
          if (value instanceof File) {
            console.log(
              `[Proxy] Image ${imageCount}: ${value.name}, size: ${value.size} bytes, type: ${value.type}`
            )

            // Validate image file
            if (value.size === 0) {
              console.error(`[Proxy] Empty file detected: ${value.name}`)
              return NextResponse.json(
                { error: 'Invalid file', message: `File ${value.name} is empty` },
                { status: 400 }
              )
            }

            if (value.size > 10 * 1024 * 1024) {
              // 10MB limit
              console.error(`[Proxy] File too large: ${value.name} (${value.size} bytes)`)
              return NextResponse.json(
                { error: 'File too large', message: `File ${value.name} exceeds 10MB limit` },
                { status: 400 }
              )
            }

            if (!value.type.startsWith('image/')) {
              console.error(`[Proxy] Invalid file type: ${value.name} (${value.type})`)
              return NextResponse.json(
                { error: 'Invalid file type', message: `File ${value.name} is not an image` },
                { status: 400 }
              )
            }
          } else {
            console.log(`[Proxy] Image ${imageCount}: non-file value`, typeof value)
          }
          // NOTE: Do NOT append here - createCleanFormData already added this
        } else {
          // Other form fields (like imageIds for removal)
          console.log(`[Proxy] Other field: ${key} = ${value}`)
          // NOTE: Do NOT append here - createCleanFormData already added this
        }
      }

      console.log(`[Proxy] Total images: ${imageCount}`)
      console.log(`[Proxy] Has product data: ${!!productData}`)

      // Estimate total size
      let totalSize = 0
      for (const [_key, value] of formData.entries()) {
        if (value instanceof File) {
          totalSize += value.size
        } else if (typeof value === 'string') {
          totalSize += new Blob([value]).size
        }
      }
      console.log(
        `[Proxy] Estimated total size: ${totalSize} bytes (${(totalSize / 1024 / 1024).toFixed(2)}MB)`
      )

      if (totalSize > 100 * 1024 * 1024) {
        // 100MB limit
        console.error(`[Proxy] Request too large: ${totalSize} bytes`)
        return NextResponse.json(
          {
            error: 'Request too large',
            message: `Total request size (${(totalSize / 1024 / 1024).toFixed(2)}MB) exceeds 100MB limit`,
          },
          { status: 413 }
        )
      }
    } else {
      // JSON request - convert to multipart
      const body = await req.json()
      console.log('[Proxy] Request body:', JSON.stringify(body, null, 2))

      backendFormData = new FormData()
      backendFormData.append('product', JSON.stringify(body))
    }

    // Build backend URL with query params (for image removal)
    const url = new URL(`${BACKEND_URL}/api/v1/products/update/${productId}`)
    const searchParams = req.nextUrl.searchParams
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value)
    })

    console.log('[Proxy] Calling backend:', url.toString())
    console.log('[Proxy] Sending as multipart/form-data')

    // Add timeout for backend requests
    const controller = new AbortController()
    const timeoutId = setTimeout(
      () => {
        console.error('[Proxy] Backend request timeout after 5 minutes')
        controller.abort()
      },
      5 * 60 * 1000
    ) // 5 minutes timeout

    let backendResponse: Response
    try {
      backendResponse = await fetch(url.toString(), {
        method: 'PATCH',
        headers: {
          // Don't set Content-Type - let fetch set it with boundary
          Authorization: token,
          // Add some headers that might help with multipart parsing
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: backendFormData,
        signal: controller.signal,
        // Add keepalive for large uploads
        keepalive: false,
      })

      clearTimeout(timeoutId)
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (controller.signal.aborted) {
        console.error('[Proxy] Request aborted due to timeout')
        return NextResponse.json(
          { error: 'Request timeout', message: 'Backend request timed out after 5 minutes' },
          { status: 504 }
        )
      }

      console.error('[Proxy] Network error calling backend:', fetchError)
      return NextResponse.json(
        {
          error: 'Network error',
          message: 'Failed to connect to backend server',
          details: fetchError instanceof Error ? fetchError.message : 'Unknown network error',
        },
        { status: 502 }
      )
    }

    console.log(`[Proxy] Backend response status: ${backendResponse.status}`)

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('[Proxy] Backend error response:', errorText)

      // Try to parse as JSON, fallback to text
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || 'Failed to update product' }
      }

      // If it's a multipart parsing error and we have images, suggest trying without images
      if (errorText.includes('Failed to parse multipart servlet request')) {
        console.error('[Proxy] Multipart parsing failed on backend - this could be due to:')
        console.error('  1. Backend multipart size limits')
        console.error('  2. Corrupted file data during transmission')
        console.error('  3. Backend servlet configuration issues')
        console.error('  4. Network issues during large file upload')

        // Count images in the form data
        let imageCount = 0
        for (const [key] of backendFormData.entries()) {
          if (key === 'images') imageCount++
        }

        if (imageCount > 0) {
          console.error(`[Proxy] Request contained ${imageCount} images`)
          console.error(
            '[Proxy] Consider trying the split operation approach (text update first, then images)'
          )
        }
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
    console.log('[Proxy] Success response:', data)

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[Proxy] Exception occurred:', error)
    console.error('[Proxy] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
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
