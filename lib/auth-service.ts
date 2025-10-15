import { apiClient } from './api'

// Simple token storage helpers
const TOKEN_KEY = 'expat_auth_token'
const TOKEN_EXPIRY_KEY = 'expat_auth_token_expiry'
const TOKEN_EXPIRY_HOURS = 2 // Token expires after 2 hours

// Auto logout timer
let logoutTimer: NodeJS.Timeout | null = null

export function setAuthToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    // Set expiry time (2 hours from now)
    const expiryTime = Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())

    // Set up auto logout timer
    setupAutoLogout()
  } catch (error) {
    // Silently handle localStorage errors (e.g., in private browsing mode)
    console.debug('Failed to store auth token:', error)
  }
  apiClient.setAuthToken(token)
}

export function getAuthToken(): string | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY)

    // Check if token has expired
    if (token && expiryTime) {
      const now = Date.now()
      if (now > parseInt(expiryTime)) {
        // Token expired, clear it
        clearAuthToken()
        return null
      }
    }

    return token
  } catch (error) {
    // Silently handle localStorage errors
    console.debug('Failed to retrieve auth token:', error)
    return null
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
  } catch (error) {
    // Silently handle localStorage errors
    console.debug('Failed to clear auth token:', error)
  }

  // Clear the cookie
  if (typeof document !== 'undefined') {
    document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax; Secure`
  }

  // Clear auto logout timer
  if (logoutTimer) {
    clearTimeout(logoutTimer)
    logoutTimer = null
  }

  apiClient.clearAuthToken()
}

/**
 * Initializes API client auth header from persisted token (if present).
 * Safe to call on application start before any protected requests.
 */
export function initializeAuthFromStorage() {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
    if (token) {
      apiClient.setAuthToken(token)
    }
  } catch {
    /* ignore */
  }
}

// Service methods mapping to backend
export async function registerUser(payload: {
  firstName: string
  lastName: string
  password: string
  emailAddress: string
  agreeToTerms: boolean
  agreeToPrivacyPolicy: boolean
}) {
  return apiClient.register(payload)
}

export async function loginUser(payload: { email?: string; password: string; username?: string }) {
  const res = await apiClient.login(payload.email || payload.username || '', payload.password)
  // Backend returns { data: { email, token, role } } or { email, token, role }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const responseData = (res as any)?.data || res
  const token = responseData?.token

  // ...existing code...
  if (token) {
    setAuthToken(token)
    // Also set token as a cookie (expires in 2 hours, secure, sameSite=lax)
    if (typeof document !== 'undefined') {
      const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000).toUTCString()
      document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax; Secure`
      // Log to verify cookie is set
      console.log('[AUTH] Set cookie:', document.cookie)
    }
  } else {
    throw new Error('No token received from server')
  }

  return responseData
}

export async function sendOrgEmailOtp(organizationalEmail: string) {
  return apiClient.sendEmailOtp(organizationalEmail)
}

// Setup auto logout timer
function setupAutoLogout() {
  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY)
  if (expiryTime) {
    const timeUntilExpiry = parseInt(expiryTime) - Date.now()
    if (timeUntilExpiry > 0) {
      logoutTimer = setTimeout(() => {
        clearAuthToken()
        // Trigger logout event for components to react
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('authTokenExpired'))
        }
      }, timeUntilExpiry)
    }
  }
}

// Initialize auto logout on app start
export function initializeAutoLogout() {
  if (typeof window !== 'undefined') {
    const token = getAuthToken() // This will check expiry
    if (token) {
      setupAutoLogout()
    }
  }
}

// Google OAuth functions
export function redirectToGoogleLogin() {
  if (typeof window !== 'undefined') {
    window.location.href = 'https://dev.globoexpats.com/api/v1/oauth2/login/google'
  }
}

export async function exchangeAuthCode(authCode: string) {
  try {
    const response = await apiClient.exchangeOAuthCode(authCode)
    const data = response.data as {
      token?: string
      firstName?: string
      lastName?: string
      email?: string
      profileImageUrl?: string
    }
    const { token, firstName, lastName, email, profileImageUrl } = data

    if (token) {
      setAuthToken(token)
      // Also set token as a cookie (expires in 2 hours)
      if (typeof document !== 'undefined') {
        const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000).toUTCString()
        document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax; Secure`
        console.log('[AUTH] Google OAuth token set in cookie:', document.cookie)
      }
    } else {
      throw new Error('No token received from server')
    }

    return { token, firstName, lastName, email, profileImageUrl }
  } catch (error) {
    console.error('[AUTH] Google OAuth exchange failed:', error)
    throw error
  }
}

export function extractAuthCodeFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.get('auth_code')
  } catch {
    return null
  }
}

export async function verifyOrgEmailOtp(
  organizationalEmail: string,
  otp: string,
  userRoles: 'SELLER' | 'USER' | string
) {
  return apiClient.verifyEmailOtp(organizationalEmail, otp, userRoles)
}
