'use client'

/**
 * =============================================================================
 * AuthProvider - Centralized Authentication State Management
 * =============================================================================
 *
 * This provider manages all authentication-related state for the Expat Marketplace.
 * It handles user sessions, verification statuses, and provides a unified interface
 * for authentication operations throughout the application.
 *
 * Key Features:
 * - User session persistence with localStorage
 * - Comprehensive verification status tracking
 * - Organization email verification workflow
 * - Admin and buyer permission management
 * - Auto-session restoration on app load
 * - Type-safe authentication guards
 *
 * Backend Integration Points:
 * - POST /api/auth/login - User authentication
 * - POST /api/auth/logout - Session termination
 * - PUT /api/auth/user - User profile updates
 * - POST /api/auth/verify-org-email - Organization email verification
 * - GET /api/auth/me - Session validation
 *
 * Connected Components:
 * - hooks/use-auth.ts - Hook for consuming auth context
 * - components/header.tsx - User navigation and status
 * - components/verification-banner.tsx - Verification prompts
 * - app/login/page.tsx - Authentication UI
 * - app/register/page.tsx - User registration
 *
 * Usage Example:
 * ```tsx
 * // Wrap your app
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 *
 * // Use in components
 * const { user, isLoggedIn, login, logout, verificationStatus } = useAuth()
 * ```
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { User, VerificationStatus } from '@/lib/types'
import { apiClient } from '@/lib/api'
import {
  loginUser,
  registerUser,
  sendOrgEmailOtp,
  verifyOrgEmailOtp,
  // setAuthToken, // Not used in provider
  clearAuthToken,
  getAuthToken,
  initializeAuthFromStorage,
  initializeAutoLogout,
} from '@/lib/auth-service'
import {
  setItemDebounced,
  getItem,
  removeItem as removeStorageItem,
  setItemImmediate,
  flushPendingWrites,
} from '@/lib/storage-utils'

/**
 * =============================================================================
 * TYPE DEFINITIONS
 * =============================================================================
 */

/**
 * Complete authentication state interface
 * Consolidates all auth-related state in one place
 */
interface AuthState {
  /** Whether user is currently logged in */
  isLoggedIn: boolean

  /** Current user data, null if not logged in */
  user: User | null

  /** Loading state during session check/auth operations */
  isLoading: boolean

  /** Error message if any auth operation fails */
  error: string | null

  /** Detailed verification status for current user */
  verificationStatus: VerificationStatus | null
}

/**
 * Complete authentication context interface
 * Includes state, actions, and computed properties
 */
interface AuthContextType extends AuthState {
  // Authentication Actions
  /** Authenticate user and create session */
  login: (userData: Partial<User> & { password?: string }) => Promise<void>

  /** Register a new user */
  register: (payload: {
    firstName: string
    lastName: string
    password: string
    emailAddress: string
    agreeToTerms: boolean
    agreeToPrivacyPolicy: boolean
  }) => Promise<void>

  /** End user session and clear all data */
  logout: () => Promise<void>

  /** Update current user profile data */
  updateUser: (userData: Partial<User>) => void

  /** Request OTP to organization email */
  requestOrganizationEmailOtp: (organizationalEmail: string) => Promise<void>

  /** Verify organization email address via OTP */
  verifyOrganizationEmail: (
    organizationalEmail: string,
    otp: string,
    userRoles?: 'SELLER' | 'USER' | string
  ) => Promise<void>

  /** Refresh user session from backend */
  refreshSession: () => Promise<void>

  /** Complete verification for testing purposes (development only) */
  completeVerificationForTesting: (email?: string) => Promise<void>

  // Computed Properties (derived from verification status)
  /** Whether user can make purchases */
  canBuy: boolean

  /** Whether user can sell items */
  canSell: boolean

  /** Whether user can contact sellers */
  canContact: boolean

  /** Whether user has basic verification (organization email) */
  isVerifiedBuyer: boolean

  /** Whether user has complete verification (identity + org email) */
  isFullyVerified: boolean

  /** Whether user has admin privileges */
  isAdmin: boolean

  /** Current verification step user should complete */
  currentVerificationStep: string | null
}

/**
 * =============================================================================
 * CONTEXT CREATION
 * =============================================================================
 */

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * =============================================================================
 * CONSTANTS & CONFIGURATION
 * =============================================================================
 */

const SESSION_STORAGE_KEY = 'expatUserSession'
const SESSION_EXPIRY_HOURS = 24

/**
 * Creates default verification status for new users
 * SIMPLIFIED: Email verification = full access
 */
const createDefaultVerificationStatus = (
  user?: Partial<User> | Record<string, unknown>
): VerificationStatus => {
  // Check if backend says user is verified (any of these conditions)
  const isBackendVerified =
    (user as { isVerified?: boolean })?.isVerified === true ||
    (user as { verificationStatus?: string })?.verificationStatus === 'VERIFIED' ||
    (user as { backendVerificationStatus?: string })?.backendVerificationStatus === 'VERIFIED' ||
    (user as { isOrganizationEmailVerified?: boolean })?.isOrganizationEmailVerified === true

  // Simplified logic: Email verified = all access
  return {
    isFullyVerified: isBackendVerified,
    isIdentityVerified: isBackendVerified,
    isOrganizationEmailVerified: isBackendVerified,
    canBuy: isBackendVerified,
    canList: isBackendVerified,
    canSell: isBackendVerified,
    canContact: isBackendVerified,
    currentStep: isBackendVerified ? null : 'organization',
    pendingActions: isBackendVerified ? [] : ['verify_email'],
  }
}

/**
 * =============================================================================
 * MAIN PROVIDER COMPONENT
 * =============================================================================
 */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize state with proper defaults
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    isLoading: true, // Start with loading true for session restoration
    error: null,
    verificationStatus: null,
  })

  /**
   * =============================================================================
   * SESSION MANAGEMENT
   * =============================================================================
   */

  /**
   * Validates if stored session is still valid
   */
  const isSessionValid = useCallback((sessionData: unknown): boolean => {
    if (!sessionData || typeof sessionData !== 'object') return false
    const session = sessionData as { user?: { email?: string }; timestamp?: number }
    // Check required fields
    if (!session.user?.email || !session.timestamp) return false

    // Check session expiry
    const sessionAge = Date.now() - session.timestamp
    const maxAge = SESSION_EXPIRY_HOURS * 60 * 60 * 1000

    return sessionAge < maxAge
  }, [])

  /**
   * Helper function to normalize image URLs (keep relative for Next.js proxy)
   */
  const normalizeImageUrl = useCallback((imageUrl: string | undefined): string | undefined => {
    if (!imageUrl) return undefined
    if (imageUrl.startsWith('http')) return imageUrl

    // Keep relative URLs as-is so they go through Next.js proxy (avoids CORS)
    // NEXT_PUBLIC_API_URL should be empty - endpoints already include full paths
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || ''
    const cleanUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
    return `${BACKEND_URL}${cleanUrl}`
  }, [])

  /**
   * Restores user session from localStorage on app initialization
   */
  const restoreSession = useCallback(async () => {
    try {
      initializeAuthFromStorage()
      const token = getAuthToken()
      const sessionData = getItem(SESSION_STORAGE_KEY)

      if (!sessionData) {
        if (token) {
          // Attempt to fetch user to rebuild session
          try {
            console.log('[Auth] Attempting to rebuild session from token...')
            const userDetails = await apiClient.getUserDetails()
            console.log('[Auth] User details fetched successfully:', userDetails)

            // Convert relative image URL to absolute URL
            const imageUrl = normalizeImageUrl(userDetails.profileImageUrl)

            const rebuiltUser: User = {
              id: userDetails.loggingEmail,
              firstName: userDetails.firstName,
              lastName: userDetails.lastName,
              name: `${userDetails.firstName} ${userDetails.lastName}`.trim(),
              email: userDetails.loggingEmail,
              loggingEmail: userDetails.loggingEmail,
              organizationEmail: userDetails.organizationalEmail,
              avatar: imageUrl,
              profileImageUrl: imageUrl,
              createdAt: new Date(),
              position: userDetails.position,
              aboutMe: userDetails.aboutMe,
              phoneNumber: userDetails.phoneNumber,
              organization: userDetails.organization,
              location: userDetails.location,
              backendVerificationStatus: userDetails.verificationStatus,
              passportVerificationStatus: userDetails.passportVerificationStatus,
              addressVerificationStatus: userDetails.addressVerificationStatus,
              verificationStatus: createDefaultVerificationStatus(userDetails),
              role: userDetails.roles?.some((r: { roleName?: string }) => r.roleName === 'ADMIN')
                ? 'admin'
                : 'user',
              roles: userDetails.roles,
              isVerified: userDetails.verificationStatus === 'VERIFIED',
            } as User
            const verificationStatus = createDefaultVerificationStatus(rebuiltUser)
            setAuthState({
              isLoggedIn: true,
              user: rebuiltUser,
              isLoading: false,
              error: null,
              verificationStatus,
            })
            console.log('[Auth] Session rebuilt successfully')
            return
          } catch (error) {
            // token invalid or backend error; continue to mark logged out
            console.error('[Auth] Failed to rebuild session:', error)
          }
        }
        setAuthState((prev) => ({ ...prev, isLoading: false }))
        return
      }

      // sessionData is already parsed by getItem
      if (!isSessionValid(sessionData)) {
        removeStorageItem(SESSION_STORAGE_KEY)
        setAuthState((prev) => ({ ...prev, isLoading: false }))
        return
      }

      const { user } = sessionData

      // Normalize image URLs in case they're stored as relative paths
      const normalizedUser = {
        ...user,
        avatar: normalizeImageUrl(user.avatar) || user.avatar,
        profileImageUrl: normalizeImageUrl(user.profileImageUrl) || user.profileImageUrl,
      }

      if (token) initializeAuthFromStorage()
      const verificationStatus = createDefaultVerificationStatus(normalizedUser)
      setAuthState({
        isLoggedIn: true,
        user: normalizedUser,
        isLoading: false,
        error: null,
        verificationStatus,
      })
    } catch (error) {
      console.error('Session restoration failed:', error)
      removeStorageItem(SESSION_STORAGE_KEY)
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        isLoggedIn: false,
        user: null,
        error: 'Session restoration failed',
      }))
    }
  }, [isSessionValid, normalizeImageUrl])

  /**
   * Persists session data to localStorage (immediate for critical operations)
   */
  const persistSession = useCallback((user: User, immediate = false) => {
    try {
      const sessionData = {
        user,
        timestamp: Date.now(),
      }
      // Use immediate write for login/logout, debounced for updates
      if (immediate) {
        setItemImmediate(SESSION_STORAGE_KEY, sessionData)
      } else {
        setItemDebounced(SESSION_STORAGE_KEY, sessionData, 1000)
      }
    } catch (error) {
      console.error('Failed to persist session:', error)
    }
  }, [])

  // Restore session on mount
  useEffect(() => {
    restoreSession()

    // Initialize auto logout timer
    initializeAutoLogout()
  }, [restoreSession])

  // Handle token expiry events
  useEffect(() => {
    const handleTokenExpiry = () => {
      // Clear user state and session data
      setAuthState({
        isLoggedIn: false,
        user: null,
        isLoading: false,
        error: null,
        verificationStatus: null,
      })
      clearAuthToken()
      // Clear session storage
      try {
        sessionStorage.removeItem('expat_user')
        removeStorageItem('expat_user')
      } catch (error) {
        // Silently handle storage errors (e.g., in private browsing mode)
        console.debug('Failed to clear session storage:', error)
      }
    }

    window.addEventListener('authTokenExpired', handleTokenExpiry)

    return () => {
      window.removeEventListener('authTokenExpired', handleTokenExpiry)
    }
  }, [])

  /**
   * =============================================================================
   * AUTHENTICATION ACTIONS
   * =============================================================================
   */

  /**
   * Fetches complete user details from backend after authentication
   */
  const fetchUserDetails = useCallback(async (): Promise<User | null> => {
    try {
      const userDetails = await apiClient.getUserDetails()

      // Convert relative image URL to absolute URL
      const imageUrl = normalizeImageUrl(userDetails.profileImageUrl)

      // Transform backend response to User interface
      const user: User = {
        id: userDetails.loggingEmail, // Use email as ID for compatibility
        userId: userDetails.userId, // Store numeric ID for seller comparison
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        name: `${userDetails.firstName} ${userDetails.lastName}`.trim(),
        email: userDetails.loggingEmail,
        loggingEmail: userDetails.loggingEmail,
        organizationEmail: userDetails.organizationalEmail,
        avatar: imageUrl,
        profileImageUrl: imageUrl,
        createdAt: new Date(), // Backend doesn't provide this, use current date

        // Profile information
        position: userDetails.position,
        aboutMe: userDetails.aboutMe,
        phoneNumber: userDetails.phoneNumber,
        organization: userDetails.organization,
        location: userDetails.location,

        // Backend verification statuses (simple strings)
        backendVerificationStatus: userDetails.verificationStatus,
        passportVerificationStatus: userDetails.passportVerificationStatus,
        addressVerificationStatus: userDetails.addressVerificationStatus,

        // Frontend verification status (for UI logic)
        verificationStatus: {
          isFullyVerified:
            userDetails.verificationStatus === 'VERIFIED' &&
            userDetails.passportVerificationStatus === 'VERIFIED' &&
            userDetails.addressVerificationStatus === 'VERIFIED',
          isIdentityVerified: userDetails.passportVerificationStatus === 'VERIFIED',
          isOrganizationEmailVerified: !!userDetails.organizationalEmail,
          canBuy:
            userDetails.verificationStatus === 'VERIFIED' || !!userDetails.organizationalEmail,
          canList:
            userDetails.verificationStatus === 'VERIFIED' &&
            userDetails.passportVerificationStatus === 'VERIFIED',
          canSell:
            userDetails.verificationStatus === 'VERIFIED' &&
            userDetails.passportVerificationStatus === 'VERIFIED',
          canContact: userDetails.verificationStatus === 'VERIFIED',
          currentStep: userDetails.verificationStatus === 'VERIFIED' ? 'complete' : 'identity',
          pendingActions: userDetails.verificationStatus === 'PENDING' ? ['admin_review'] : [],
        },

        // Roles
        roles: userDetails.roles,
        role: userDetails.roles.some((r) => r.roleName === 'ADMIN') ? 'admin' : 'user',

        // Computed verification flag for compatibility
        isVerified: userDetails.verificationStatus === 'VERIFIED',
      }

      return user
    } catch (error) {
      console.error('Failed to fetch user details:', error)
      return null
    }
  }, [normalizeImageUrl])

  /**
   * Authenticates user and creates session
   * Updates both local state and persistent storage
   */
  const login = useCallback(
    async (userData: Partial<User> & { password?: string }): Promise<void> => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

        // Real backend login - returns { email, token, role }
        const response = await loginUser({
          email: userData.email || '',
          password: userData.password || '',
        })

        // Response format: { email, token, role }
        const email = response.email || userData.email || ''
        const token = response.token
        const role = response.role || 'user'

        // Token is already set by loginUser, but verify it exists
        if (!token) {
          throw new Error('No authentication token received')
        }

        // Fetch complete user details from backend
        const completeUser = await fetchUserDetails()

        if (completeUser) {
          // Use the complete user data from backend
          const verificationStatus = completeUser.verificationStatus
          persistSession(completeUser, true) // Immediate write for login

          setAuthState({
            isLoggedIn: true,
            user: completeUser,
            isLoading: false,
            error: null,
            verificationStatus,
          })

          // ...existing code...
        } else {
          // Fallback to creating user from login response if backend fetch fails
          const user: User = {
            id: userData.id || `user_${Date.now()}`,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            name: userData.name || email?.split('@')[0] || 'User',
            email,
            loggingEmail: email,
            avatar: userData.avatar,
            createdAt: userData.createdAt || new Date(),
            preferences: userData.preferences,
            organizationEmail: userData.organizationEmail,
            signupMethod: userData.signupMethod || 'email',
            role: role as 'user' | 'admin' | 'moderator',
            verificationStatus: createDefaultVerificationStatus(userData),
          }

          const verificationStatus = createDefaultVerificationStatus(user)
          persistSession(user, true) // Immediate write for login

          setAuthState({
            isLoggedIn: true,
            user,
            isLoading: false,
            error: null,
            verificationStatus,
          })

          // ...existing code...
        }
      } catch (error) {
        console.error('Login failed:', error)
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Login failed. Please try again.',
        }))
        throw new Error('Login failed. Please try again.')
      }
    },
    [persistSession, fetchUserDetails]
  )

  /** Register a new user via backend */
  const register = useCallback(
    async (payload: {
      firstName: string
      lastName: string
      password: string
      emailAddress: string
      agreeToTerms: boolean
      agreeToPrivacyPolicy: boolean
    }): Promise<void> => {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))
      try {
        await registerUser(payload)
        // Backend returns 201 and a message. Proceed to login automatically?
        // We'll not auto-login, require explicit login afterwards.
        setAuthState((prev) => ({ ...prev, isLoading: false }))
      } catch (e) {
        setAuthState((prev) => ({ ...prev, isLoading: false, error: 'Registration failed' }))
        throw e
      }
    },
    []
  )

  /**
   * Ends user session and clears all data
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }))

      // Flush any pending writes before clearing
      flushPendingWrites()

      // Clear local state
      setAuthState((prev) => ({
        ...prev,
        isLoggedIn: false,
        user: null,
        verificationStatus: null,
      }))

      // TODO: API call - POST /api/auth/logout to invalidate server session
      // await api.auth.logout()

      // Clear local storage & token
      removeStorageItem(SESSION_STORAGE_KEY)
      clearAuthToken()

      // ...existing code...
    } catch (error) {
      console.error('Logout failed:', error)
      // Continue with local logout even if server call fails
    } finally {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  /**
   * Updates current user profile data
   */
  const updateUser = useCallback(
    (userData: Partial<User>): void => {
      if (!authState.user) {
        console.warn('Cannot update user: no user logged in')
        return
      }

      try {
        const updatedUser = { ...authState.user, ...userData }
        const updatedVerificationStatus = createDefaultVerificationStatus(updatedUser)

        // Persist updated user data
        persistSession(updatedUser)

        // Update state
        setAuthState((prev) => ({
          ...prev,
          user: updatedUser,
          verificationStatus: updatedVerificationStatus,
        }))

        // ...existing code...
      } catch (error) {
        console.error('User update failed:', error)
        setAuthState((prev) => ({
          ...prev,
          error: 'Failed to update profile',
        }))
      }
    },
    [authState.user, persistSession]
  )

  /**
   * Verifies organization email address
   */
  const requestOrganizationEmailOtp = useCallback(
    async (organizationalEmail: string): Promise<void> => {
      if (!authState.user) throw new Error('Must be logged in to request OTP')
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))
      try {
        // Ensure token is set for auth
        const token = getAuthToken()
        if (token) apiClient.setAuthToken(token)
        await sendOrgEmailOtp(organizationalEmail)
      } finally {
        setAuthState((prev) => ({ ...prev, isLoading: false }))
      }
    },
    [authState.user]
  )

  const verifyOrganizationEmail = useCallback(
    async (
      organizationalEmail: string,
      otp: string,
      userRoles: 'SELLER' | 'USER' | string = 'USER'
    ): Promise<void> => {
      if (!authState.user) throw new Error('Must be logged in to verify email')
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))
      try {
        const token = getAuthToken()
        if (token) apiClient.setAuthToken(token)

        // Verify the OTP with backend
        await verifyOrgEmailOtp(organizationalEmail, otp, userRoles)

        // Fetch updated user details from backend to get real verification status
        const updatedUserDetails = await fetchUserDetails()

        if (updatedUserDetails) {
          // Use backend verification status
          const updatedUser = {
            ...authState.user,
            ...updatedUserDetails,
            organizationEmail: organizationalEmail,
          } as User

          // Create verification status based on backend response
          const computedVerificationStatus = createDefaultVerificationStatus(updatedUser)
          updatedUser.verificationStatus = computedVerificationStatus

          persistSession(updatedUser)
          setAuthState((prev) => ({
            ...prev,
            user: updatedUser,
            verificationStatus: computedVerificationStatus,
            isLoading: false,
          }))

          console.log(
            '✅ Verification complete! User is now fully verified:',
            computedVerificationStatus
          )
        } else {
          // Fallback if user details fetch fails
          const updatedUser = {
            ...authState.user,
            organizationEmail: organizationalEmail,
            isVerified: true,
            backendVerificationStatus: 'VERIFIED',
          } as User
          const computedVerificationStatus: VerificationStatus = {
            isFullyVerified: true,
            isIdentityVerified: true,
            isOrganizationEmailVerified: true,
            canBuy: true,
            canList: true,
            canSell: true,
            canContact: true,
            currentStep: null,
            pendingActions: [],
          }
          updatedUser.verificationStatus = computedVerificationStatus
          persistSession(updatedUser)
          setAuthState((prev) => ({
            ...prev,
            user: updatedUser,
            verificationStatus: computedVerificationStatus,
            isLoading: false,
          }))
        }
      } catch (error) {
        setAuthState((prev) => ({ ...prev, isLoading: false, error: 'Verification failed' }))
        throw error
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [authState.user, persistSession, fetchUserDetails]
  )

  /**
   * Refreshes user session from backend
   */
  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      const token = localStorage.getItem(SESSION_STORAGE_KEY)
      if (!token || !authState.isLoggedIn) return

      // ...existing code...

      // Fetch latest user details from backend
      const completeUser = await fetchUserDetails()

      if (completeUser) {
        const verificationStatus = completeUser.verificationStatus
        persistSession(completeUser)

        setAuthState((prev) => ({
          ...prev,
          user: completeUser,
          verificationStatus,
        }))

        // ...existing code...
      } else {
        // ...existing code...
      }
    } catch (error) {
      console.error('Session refresh failed:', error)
      // If refresh fails, user might need to re-login
      await logout()
    }
  }, [logout, fetchUserDetails, authState.isLoggedIn, persistSession])

  /**
   * Complete verification for testing purposes
   * This now actually calls the backend to mark the user as verified
   */
  const completeVerificationForTesting = useCallback(
    async (email?: string): Promise<void> => {
      if (!authState.user) {
        throw new Error('Must be logged in to complete verification')
      }

      if (!email) {
        throw new Error('Email address is required for verification')
      }

      try {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

        // Get current token
        const token = getAuthToken()
        if (token) {
          apiClient.setAuthToken(token)
        }

        // Use the provided email address
        const organizationalEmail = email

        // Step 1: Request OTP from backend
        console.log('🔐 Requesting OTP for:', organizationalEmail)
        await apiClient.sendEmailOtp(organizationalEmail)

        // Step 2: For testing, inform user to check console/email
        console.log('✉️ OTP sent to:', organizationalEmail)
        console.log('📧 Check your email for the OTP code')
        console.log('⚠️ NOTE: Enter the OTP in the field below')
        console.log('   Or check your backend logs for the OTP if in development mode')

        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
        }))

        // Success - OTP sent (no intrusive alert)

        // ...existing code...
      } catch (error) {
        console.error('Verification completion failed:', error)
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Failed to complete verification',
        }))
        throw new Error('Failed to complete verification')
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [authState.user]
  )

  /**
   * =============================================================================
   * COMPUTED PROPERTIES
   * =============================================================================
   */

  // Memoize computed properties for performance
  const computedProperties = useMemo(() => {
    const verificationStatus = authState.verificationStatus

    return {
      canBuy: verificationStatus?.canBuy || false,
      canSell: (verificationStatus?.canSell ?? verificationStatus?.canList) || false,
      canContact: verificationStatus?.canContact || false,
      isVerifiedBuyer: verificationStatus?.isOrganizationEmailVerified || false,
      isFullyVerified: verificationStatus?.isFullyVerified || false,
      isAdmin: authState.user?.role === 'admin',
      currentVerificationStep: verificationStatus?.currentStep || null,
    }
  }, [authState.verificationStatus, authState.user?.role])

  /**
   * =============================================================================
   * CONTEXT VALUE ASSEMBLY
   * =============================================================================
   */

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<AuthContextType>(
    () => ({
      // State
      ...authState,

      // Actions
      login,
      logout,
      updateUser,
      register,
      requestOrganizationEmailOtp,
      verifyOrganizationEmail,
      refreshSession,
      completeVerificationForTesting,

      // Computed Properties
      ...computedProperties,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      authState,
      login,
      logout,
      updateUser,
      verifyOrganizationEmail,
      refreshSession,
      computedProperties,
    ]
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

/**
 * =============================================================================
 * HOOK FOR CONSUMING AUTH CONTEXT
 * =============================================================================
 */

/**
 * Custom hook to access authentication context
 * Provides type-safe access to auth state and actions
 *
 * @returns Complete authentication context
 * @throws Error if used outside AuthProvider
 *
 * Usage:
 * ```tsx
 * const { user, isLoggedIn, login, canBuy } = useAuth()
 *
 * if (isLoggedIn && canBuy) {
 *   // User can make purchases
 * }
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
        'Make sure your component is wrapped with <AuthProvider>.'
    )
  }

  return context
}
