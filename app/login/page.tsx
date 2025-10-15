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
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
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
  const [rememberMe, setRememberMe] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [isFormValid, setIsFormValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const authCode = searchParams.get('auth_code')
      if (authCode) {
        setSocialLoading('google')
        try {
          const userData = await exchangeAuthCode(authCode)
          toast({
            title: 'Login Successful!',
            description: 'Welcome back! Redirecting to your dashboard...',
            variant: 'default',
          })

          // Update auth context with user data
          await login({
            firstName: userData.firstName,
            lastName: userData.lastName,
            name: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            avatar: userData.profileImageUrl,
          })

          // Clean up URL and redirect
          setTimeout(() => {
            router.replace('/')
          }, 1000)
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
  }, [searchParams, login, router, toast])

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
      await login({ name: email.split('@')[0], email, password })

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
        localStorage.setItem('savedEmail', email)
      } else {
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('savedEmail')
      }

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
          description: `${error.message} Please retry! New here? Join the GloboExpat community by registering!`,
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
      // Redirect to Google OAuth
      window.location.href = 'https://dev.globoexpats.com/api/v1/oauth2/login/google'
    } catch {
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
    <div className="min-h-screen max-h-screen bg-gradient-to-br from-brand-primary via-blue-800 to-cyan-600 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl border border-white/20 my-4">
        <CardHeader className="text-center pb-4 pt-6">
          <Link href="/" className="inline-block mx-auto mb-3">
            <div className="text-2xl lg:text-3xl font-bold font-display text-brand-primary">
              Globo<span className="text-brand-secondary">Expat</span>
            </div>
          </Link>
          <CardTitle className="text-xl lg:text-2xl font-bold text-neutral-800">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-neutral-600 text-sm">
            Sign in to access your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-6 space-y-4">
          {/* Social Authentication Options */}
          <div className="space-y-2">
            <p className="text-center text-neutral-600 font-medium">Quick sign in with</p>
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isSubmitting || socialLoading !== null}
              className="w-full h-12 border-2 hover:bg-neutral-50 transition-all duration-200 rounded-full"
            >
              {socialLoading === 'google' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  <span className="font-medium">Google</span>
                </div>
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-white px-4 text-neutral-500 font-medium">
                Or sign in with email
              </span>
            </div>
          </div>

          {/* Traditional Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-700 font-medium text-sm">
                Personal Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.personal@email.com"
                  className={`pl-10 h-10 text-sm border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50 ${
                    fieldErrors.email ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || socialLoading !== null}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-700 font-medium text-sm">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`pl-10 pr-10 h-10 text-sm border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50 ${
                    fieldErrors.password ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || socialLoading !== null}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  disabled={isLoading || socialLoading !== null}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading || socialLoading !== null}
                />
                <Label htmlFor="remember" className="text-xs text-neutral-600 cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Link
                href="/reset-password"
                className="text-xs font-medium text-brand-primary hover:text-brand-secondary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className={`w-full h-11 text-sm font-bold transition-all duration-200 ${
                isFormValid && !isLoading
                  ? 'bg-brand-primary hover:bg-brand-primary/90 transform hover:scale-105'
                  : 'bg-neutral-400'
              }`}
              disabled={!isFormValid || isSubmitting || socialLoading !== null}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging In...
                </div>
              ) : (
                'Log In'
              )}
            </Button>

            {/* Form validation status */}
            {!isFormValid && (email || password) && (
              <div className="text-center">
                <Badge variant="outline" className="text-xs text-neutral-500">
                  Please complete all fields correctly
                </Badge>
              </div>
            )}
          </form>

          {/* Registration Link */}
          <div className="text-center pt-3 border-t border-neutral-200/80">
            <p className="text-xs text-neutral-600">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-brand-primary hover:text-brand-secondary hover:underline"
              >
                Register Now
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
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
