import { apiClient } from './api'

// Simple token storage helpers
const TOKEN_KEY = 'expat_auth_token'

export function setAuthToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {}
  apiClient.setAuthToken(token)
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {}
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
  const responseData = (res as any)?.data || res
  const token = responseData?.token


  // ...existing code...
  if (token) {
    setAuthToken(token)
    // Also set token as a cookie (expires in 7 days, secure, sameSite=lax)
    if (typeof document !== 'undefined') {
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax; Secure`;
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

export async function verifyOrgEmailOtp(
  organizationalEmail: string,
  otp: string,
  userRoles: 'SELLER' | 'USER' | string
) {
  return apiClient.verifyEmailOtp(organizationalEmail, otp, userRoles)
}
