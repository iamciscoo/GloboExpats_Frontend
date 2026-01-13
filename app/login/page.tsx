'use client'

/**
 * =============================================================================
 * LOGIN PAGE - ENHANCED WITH SOCIAL AUTHENTICATION
 * =============================================================================
 *
 * Features:
 * - Traditional email/password login
 * - Social authentication options (Google, Facebook, Apple)
 * - Improved visual design with gradient background
 * - Responsive layout with accessibility features
 * - Error handling and loading states
 *
 * Backend Integration:
 * - POST /api/auth/login for traditional login
 * - POST /api/auth/social for social authentication
 * - Expects JWT tokens in response
 */

import type React from 'react'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Eye, EyeOff, Loader2, Shield, UserCheck, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/providers/auth-provider'
import { exchangeAuthCode } from '@/lib/auth-service'
import { useToast } from '@/components/ui/use-toast'

// Separate component that uses useSearchParams
function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoggedIn, isLoading } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [isFormValid, setIsFormValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Google returns 'code' parameter, backend might return 'auth_code'
      const authCode = searchParams.get('code') || searchParams.get('auth_code')
      if (authCode && !isLoggedIn && !isLoading) {
        setSocialLoading('google')
        try {
          console.log('[OAuth] Starting OAuth exchange...')
          // Exchange auth code for token (token is already set in exchangeAuthCode)
          await exchangeAuthCode(authCode)

          // Clean up URL to remove auth code parameter
          const url = new URL(window.location.href)
          url.searchParams.delete('code')
          url.searchParams.delete('auth_code')
          window.history.replaceState({}, '', url.pathname)

          console.log('[OAuth] Token stored, redirecting to home...')

          toast({
            title: 'Authenticated with Google!',
            description: 'Taking you to your home page...',
            variant: 'default',
          })

          // Trigger page reload to force AuthProvider to restore session
          // Reduced timeout for faster experience
          setTimeout(() => {
            console.log('[OAuth] Navigating to home page...')
            window.location.href = '/'
          }, 500)
        } catch (_error) {
          console.error('OAuth callback error:', _error)
          toast({
            title: 'Google Connection Issue',
            description:
              "We couldn't connect with Google right now. Please retry or use email sign in below! 🔐",
            variant: 'warning',
          })
          setSocialLoading(null)
        }
      }
    }

    handleOAuthCallback()
  }, [searchParams, toast, isLoggedIn, isLoading])

  // Add redirect logic for already authenticated users
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.push('/')
    }
  }, [isLoggedIn, isLoading, router])

  // Form validation
  useEffect(() => {
    const emailValid = email.includes('@') && email.includes('.')
    const passwordValid = password.length >= 6
    setIsFormValid(emailValid && passwordValid)

    // Clear field errors when user starts typing
    if (fieldErrors.email && emailValid) {
      setFieldErrors((prev) => ({ ...prev, email: undefined }))
    }
    if (fieldErrors.password && passwordValid) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }))
    }
  }, [email, password, fieldErrors])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    )
  }

  // Show loading state during OAuth processing
  if (socialLoading === 'google') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-brand-primary mb-2">Signing you in...</h2>
          <p className="text-gray-600">Please wait while we complete your Google authentication</p>
        </div>
      </div>
    )
  }

  // Don't render login form if user is already logged in
  if (isLoggedIn) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    // Field validation
    const newFieldErrors: { email?: string; password?: string } = {}

    if (!email) {
      newFieldErrors.email = 'Email is required'
    } else if (!email.includes('@') || !email.includes('.')) {
      newFieldErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newFieldErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newFieldErrors.password = 'Password must be at least 6 characters'
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors)
      return
    }

    setIsSubmitting(true)

    try {
      await login({ email, password })

      toast({
        title: 'Login Successful!',
        description: 'Welcome back! Redirecting...',
        variant: 'default',
      })
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } catch (err) {
      // Provide helpful, user-friendly error messages
      const error = err as Error & { statusCode?: number; isAuthError?: boolean }

      if (error.statusCode === 401 || error.isAuthError) {
        // Authentication failed - likely wrong credentials
        toast({
          title: 'Oops! Unable to Sign In',
          description:
            "Please double-check your credentials and give it another try! New to GloboExpat? Join our community by clicking 'Register Now' below! 🚀",
          variant: 'warning',
        })
      } else if (error.statusCode === 404) {
        // User not found
        toast({
          title: 'Account Not Found',
          description:
            "We couldn't find an account with this email. Ready to join us? Click 'Register Now' below to get started!",
          variant: 'warning',
        })
      } else if (error.statusCode === 500 || error.statusCode === 503) {
        // Server error
        toast({
          title: 'Hold Tight!',
          description:
            'Our servers are taking a quick breather. Please retry in a moment! If the issue continues, our support team is here to help. 💪',
          variant: 'warning',
        })
      } else if (error.message) {
        // Use the specific error message from the server
        toast({
          title: 'Oops! Something Happened',
          description: `${error.message} New here? Join the GloboExpat community by registering!`,
          variant: 'warning',
        })
      } else {
        // Generic fallback
        toast({
          title: "Let's Try Again!",
          description:
            "Please verify your credentials and retry. First time here? Join our amazing community by clicking 'Register Now' below! 🎊",
          variant: 'warning',
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    setSocialLoading('google')
    try {
      // Determine nextPath: use returnUrl from query string if present, else '/'
      const nextPath = searchParams.get('returnUrl') || '/'
      // Use Next.js API proxy route (same-origin, no CORS, no caching issues)
      const res = await fetch(`/api/oauth/google?nextPath=${encodeURIComponent(nextPath)}`, {
        method: 'GET',
        headers: { accept: '*/*' },
      })
      if (!res.ok) throw new Error('Failed to initiate Google login')
      const data = await res.json()
      if (data && data.authUrl) {
        window.location.href = data.authUrl
      } else {
        throw new Error('No authUrl returned from server')
      }
    } catch (err) {
      console.log(err)
      toast({
        title: 'Google Connection Issue',
        description:
          "We couldn't connect with Google right now. Please retry or use email sign in below! 🔐",
        variant: 'warning',
      })
      setSocialLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e40af] via-[#1e3a8a] to-[#1e40af] overflow-y-auto">
      <div className="flex flex-col justify-center min-h-screen p-4 py-12 lg:py-20">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-5 gap-8 items-center">
          {/* Left Panel - Hero Information */}
          <div className="hidden lg:flex lg:col-span-2 flex-col justify-center text-white space-y-8">
            <div>
              <Link href="/" className="inline-block">
                <div className="text-4xl font-bold font-display mb-4">
                  <span className="text-white">Globo</span>
                  <span className="text-brand-secondary">expats</span>
                </div>
              </Link>
              <h1 className="text-3xl font-bold leading-tight mb-4">
                Welcome back to the world&apos;s most trusted expat marketplace
              </h1>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20">
                  <Shield className="w-6 h-6 text-blue-200" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Secure Access</h3>
                  <p className="text-blue-100 text-sm">
                    Your account and data are protected with encryption
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20">
                  <UserCheck className="w-6 h-6 text-green-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Trusted Community</h3>
                  <p className="text-blue-100 text-sm">
                    Connect with verified expats in East Africa
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20">
                  <Clock className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Quick & Easy</h3>
                  <p className="text-blue-100 text-sm">
                    Sign in with Google or your email in seconds
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="lg:col-span-3 flex items-center justify-center w-full">
            <Card className="w-full max-w-xl bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border-0 overflow-hidden text-center">
              <CardHeader className="text-center space-y-2 pb-6 pt-8">
                <div className="lg:hidden mb-4">
                  <Link href="/" className="inline-block">
                    <div className="text-3xl font-bold font-display text-brand-primary">
                      Globo<span className="text-brand-secondary">expats</span>
                    </div>
                  </Link>
                </div>
                <CardTitle className="text-3xl font-bold text-neutral-800">Sign In</CardTitle>
                <CardDescription className="text-neutral-500 font-medium">
                  Enter your email and password to access your account
                </CardDescription>
              </CardHeader>

              <CardContent className="px-6 pb-10 space-y-6 text-left">
                {/* Continue with Google Button */}
                <Button
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting || socialLoading !== null}
                  className="w-full h-14 text-base border-2 border-neutral-300 hover:bg-neutral-50 transition-all duration-300 rounded-full font-semibold group translate-y-0 active:translate-y-px"
                >
                  {socialLoading === 'google' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <svg
                        className="w-5 h-5 transition-transform group-hover:scale-110"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </div>
                  )}
                </Button>

                {/* OR Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-neutral-400 font-bold tracking-widest">
                      or sign in with email
                    </span>
                  </div>
                </div>

                {/* Continue with Email Button - Always Visible */}
                <Button
                  variant="outline"
                  onClick={() => setShowEmailForm(!showEmailForm)}
                  disabled={isSubmitting || socialLoading !== null}
                  className="w-full h-14 text-base border-2 border-neutral-300 hover:bg-neutral-50 transition-all duration-300 rounded-full font-medium translate-y-0 active:translate-y-px"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Mail className="w-5 h-5 text-neutral-600" />
                    <span>Continue with Email</span>
                  </div>
                </Button>

                {/* Email/Password Form - Smooth Accordion */}
                <div
                  className={`overflow-hidden p-1 -m-1 transition-all duration-300 ease-in-out ${
                    showEmailForm ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                  }`}
                >
                  <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-neutral-700 font-semibold px-1">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        className={`h-12 rounded-xl bg-neutral-50 border-neutral-100 focus:bg-white focus:ring-brand-primary/20 focus-visible:ring-offset-0 ring-offset-0 ${
                          fieldErrors.email ? 'border-red-500' : ''
                        }`}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading || socialLoading !== null}
                        required
                      />
                      {fieldErrors.email && (
                        <p className="text-xs text-red-500 mt-1 px-1">{fieldErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-neutral-700 font-semibold px-1">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••••••••••"
                          className={`h-12 rounded-xl pr-10 bg-neutral-50 border-neutral-100 focus:bg-white focus:ring-brand-primary/20 focus-visible:ring-offset-0 ring-offset-0 ${
                            fieldErrors.password ? 'border-red-500' : ''
                          }`}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading || socialLoading !== null}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                          disabled={isLoading || socialLoading !== null}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {fieldErrors.password && (
                        <p className="text-xs text-red-500 mt-1 px-1">{fieldErrors.password}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={!isFormValid || isSubmitting || socialLoading !== null}
                      className={`w-full h-12 rounded-full font-bold text-lg shadow-lg shadow-brand-primary/20 transition-all duration-300 ${
                        isFormValid && !isSubmitting
                          ? 'bg-neutral-800 hover:bg-neutral-900 translate-y-0 hover:-translate-y-0.5 active:translate-y-0'
                          : 'bg-neutral-300 pointer-events-none'
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Signing In...
                        </div>
                      ) : (
                        'Sign In'
                      )}
                    </Button>

                    <div className="text-center pt-2">
                      <Link
                        href="/reset-password"
                        className="text-sm font-bold text-brand-primary hover:underline hover:opacity-80 transition-opacity"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                  </form>
                </div>

                {/* Don't have an account link */}
                <div className="text-center pt-4">
                  <p className="text-neutral-500">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-brand-primary font-bold hover:underline">
                      Sign up
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading fallback for Suspense
function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
    </div>
  )
}

// Main export wrapped in Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  )
}
