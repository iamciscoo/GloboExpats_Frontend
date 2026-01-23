import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/reset-password',
  '/privacy',
  '/terms',
  '/faq',
  '/help',
  '/contact',
  '/browse',
  '/about',
  '/statistics', // Matomo analytics - completely independent
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check if route is public or matches public patterns
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith('/product/') // Allow product detail pages
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get('expat_auth_token')?.value
  // Log to verify if middleware sees the cookie
  console.log('[MIDDLEWARE] Cookie token:', token ? 'EXISTS' : 'undefined')
  if (!token || token.length < 10) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
