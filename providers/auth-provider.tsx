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
  setAuthToken,
  clearAuthToken,
  getAuthToken,
  initializeAuthFromStorage,
} from '@/lib/auth-service'

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
  completeVerificationForTesting: () => Promise<void>

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
 */
const createDefaultVerificationStatus = (user?: Partial<User>): VerificationStatus => ({
  isFullyVerified: false,
  isIdentityVerified: false,
  isOrganizationEmailVerified: Boolean(user?.organizationEmail),
  canBuy: Boolean(user?.organizationEmail), // Can buy with org email only
  canList: false, // Requires full verification
  // Back-compat alias; some code references canSell
  canSell: false,
  canContact: Boolean(user?.organizationEmail),
  currentStep: user?.organizationEmail ? 'identity' : 'organization',
  pendingActions: user?.organizationEmail ? ['upload_documents'] : ['verify_email'],
})

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
  const isSessionValid = useCallback((sessionData: any): boolean => {
    if (!sessionData || typeof sessionData !== 'object') return false

    // Check required fields
    if (!sessionData.user?.email || !sessionData.timestamp) return false

    // Check session expiry
    const sessionAge = Date.now() - sessionData.timestamp
    const maxAge = SESSION_EXPIRY_HOURS * 60 * 60 * 1000

    return sessionAge < maxAge
  }, [])

  /**
   * Restores user session from localStorage on app initialization
   */
  const restoreSession = useCallback(async () => {
    try {
      initializeAuthFromStorage()
      const token = getAuthToken()
      const sessionData = localStorage.getItem(SESSION_STORAGE_KEY)

      if (!sessionData) {
        if (token) {
          // Attempt to fetch user to rebuild session
          try {
            const userDetails = await apiClient.getUserDetails()
            const rebuiltUser: User = {
              id: userDetails.loggingEmail,
              firstName: userDetails.firstName,
              lastName: userDetails.lastName,
              name: `${userDetails.firstName} ${userDetails.lastName}`.trim(),
              email: userDetails.loggingEmail,
              loggingEmail: userDetails.loggingEmail,
              organizationEmail: userDetails.organizationalEmail,
              createdAt: new Date(),
              position: userDetails.position,
              aboutMe: userDetails.aboutMe,
              phoneNumber: userDetails.phoneNumber,
              organization: userDetails.organization,
              location: userDetails.location,
              backendVerificationStatus: userDetails.verificationStatus,
              passportVerificationStatus: userDetails.passportVerificationStatus,
              addressVerificationStatus: userDetails.addressVerificationStatus,
              verificationStatus: createDefaultVerificationStatus(userDetails as any),
              role: userDetails.roles?.some((r: any) => r.roleName === 'ADMIN') ? 'admin' : 'user',
              roles: userDetails.roles,
              isVerified: userDetails.verificationStatus === 'VERIFIED',
            } as any
            const verificationStatus = createDefaultVerificationStatus(rebuiltUser)
            setAuthState({
              isLoggedIn: true,
              user: rebuiltUser,
              isLoading: false,
              error: null,
              verificationStatus,
            })
            return
          } catch {
            // token invalid; continue to mark logged out
          }
        }
        setAuthState((prev) => ({ ...prev, isLoading: false }))
        return
      }

      const parsedSession = JSON.parse(sessionData)
      if (!isSessionValid(parsedSession)) {
        localStorage.removeItem(SESSION_STORAGE_KEY)
        setAuthState((prev) => ({ ...prev, isLoading: false }))
        return
      }

      const { user } = parsedSession
      if (token) initializeAuthFromStorage()
      const verificationStatus = createDefaultVerificationStatus(user)
      setAuthState({
        isLoggedIn: true,
        user,
        isLoading: false,
        error: null,
        verificationStatus,
      })
    } catch (error) {
      console.error('Session restoration failed:', error)
      localStorage.removeItem(SESSION_STORAGE_KEY)
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Session restoration failed',
      }))
    }
  }, [isSessionValid])

  /**
   * Persists session data to localStorage
   */
  const persistSession = useCallback((user: User) => {
    try {
      const sessionData = {
        user,
        timestamp: Date.now(),
      }
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData))
    } catch (error) {
      console.error('Failed to persist session:', error)
    }
  }, [])

  // Restore session on mount
  useEffect(() => {
    restoreSession()
  }, [restoreSession])

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

      // Transform backend response to User interface
      const user: User = {
        id: userDetails.loggingEmail, // Use email as ID
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        name: `${userDetails.firstName} ${userDetails.lastName}`.trim(),
        email: userDetails.loggingEmail,
        loggingEmail: userDetails.loggingEmail,
        organizationEmail: userDetails.organizationalEmail,
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
  }, [])

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
          email: userData.email,
          username: userData.name,
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
          persistSession(completeUser)

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
          persistSession(user)

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
      localStorage.removeItem(SESSION_STORAGE_KEY)
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
        await verifyOrgEmailOtp(organizationalEmail, otp, userRoles)

        const updatedUser = { ...authState.user, organizationEmail: organizationalEmail }
        const updatedVerificationStatus: VerificationStatus = {
          ...authState.verificationStatus!,
          isOrganizationEmailVerified: true,
          canBuy: true,
          canContact: true,
          currentStep: 'identity',
          pendingActions: ['upload_documents'],
        }
        updatedUser.verificationStatus = updatedVerificationStatus
        persistSession(updatedUser)
        setAuthState((prev) => ({
          ...prev,
          user: updatedUser,
          verificationStatus: updatedVerificationStatus,
          isLoading: false,
        }))
      } catch (error) {
        setAuthState((prev) => ({ ...prev, isLoading: false, error: 'Verification failed' }))
        throw error
      }
    },
    [authState.user, authState.verificationStatus, persistSession]
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
   * In production, this would be handled by backend after document review
   */
  const completeVerificationForTesting = useCallback(async (): Promise<void> => {
    if (!authState.user) {
      throw new Error('Must be logged in to complete verification')
    }

    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

      // Simulate API processing time
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const updatedUser = {
        ...authState.user,
        organizationEmail: authState.user.organizationEmail || authState.user.email,
      }

      // Update verification status to fully verified
      const updatedVerificationStatus: VerificationStatus = {
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

      updatedUser.verificationStatus = updatedVerificationStatus

      // Persist updated user
      persistSession(updatedUser)

      // Update state
      setAuthState((prev) => ({
        ...prev,
        user: updatedUser,
        verificationStatus: updatedVerificationStatus,
        isLoading: false,
      }))

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
  }, [authState.user, persistSession])

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
