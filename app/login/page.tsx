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
import { Mail, Lock, AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/providers/auth-provider'
import { exchangeAuthCode, extractAuthCodeFromUrl } from '@/lib/auth-service'

// Separate component that uses useSearchParams
function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoggedIn, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
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
          setSuccess('Google login successful! Redirecting...')

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
        } catch (error) {
          console.error('OAuth callback error:', error)
          setError('Google login failed. Please try again.')
          setSocialLoading(null)
        }
      }
    }

    handleOAuthCallback()
  }, [searchParams, login, router])

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
    setError(null)
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
      // TODO: Replace with actual API call to backend
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password, rememberMe })
      // })

      await login({ name: email.split('@')[0], email, password })

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
        localStorage.setItem('savedEmail', email)
      } else {
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('savedEmail')
      }

      setSuccess('Login successful! Redirecting...')
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } catch (error) {
      setError('Login failed. Please check your credentials and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setError(null)
    setSocialLoading(provider)

    try {
      if (provider === 'google') {
        // Redirect to Google OAuth
        window.location.href = 'http://10.123.22.21:8081/api/v1/oauth2/login/google'
        return
      }

      // TODO: Implement Facebook and Apple authentication

      // For development, simulate successful login
      await new Promise((resolve) => setTimeout(resolve, 1500))

      await login({
        name: `${provider} User`,
        email: `user@${provider}.com`,
        isVerified: false, // Requires organization email verification
        // socialProvider: provider, // TODO: Add this to User type if needed
      })

      setSuccess(`${provider} login successful! Redirecting...`)
      setTimeout(() => {
        router.push('/')
      }, 1000)

      // In production, this would be:
      // window.location.href = `/api/auth/${provider}`
    } catch (error) {
      setError(`${provider} login failed. Please try again.`)
    } finally {
      setSocialLoading(null)
    }
  }

  return (
    <div className="min-h-screen max-h-screen bg-gradient-to-br from-brand-primary via-blue-800 to-cyan-600 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl border border-white/20 my-4">
        <CardHeader className="text-center pb-4 pt-6">
          <Link href="/" className="inline-block mx-auto mb-3">
            <div className="text-2xl lg:text-3xl font-bold font-display text-brand-primary">
              Global<span className="text-brand-secondary">Expat</span>
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
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50/80 text-green-900 border-green-200/80 py-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm">{success}</AlertDescription>
            </Alert>
          )}

          {/* Social Authentication Options */}
          <div className="space-y-3">
            <p className="text-xs text-center text-neutral-600 font-medium">Continue with</p>

            <div className="grid grid-cols-1 gap-2">
              {/* Google Login */}
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('google')}
                disabled={isSubmitting || socialLoading !== null}
                className="h-10 border-neutral-300 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center justify-center gap-3">
                  {socialLoading === 'google' ? (
                    <div className="w-4 h-4 border-2 border-neutral-300 border-t-blue-600 rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  )}
                  <span className="font-medium text-neutral-700 text-sm">
                    {socialLoading === 'google' ? 'Connecting...' : 'Google'}
                  </span>
                </div>
              </Button>

              {/* Facebook Login */}
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('facebook')}
                disabled={isLoading || socialLoading !== null}
                className="h-10 border-neutral-300 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center justify-center gap-3">
                  {socialLoading === 'facebook' ? (
                    <div className="w-4 h-4 border-2 border-neutral-300 border-t-blue-600 rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                  <span className="font-medium text-neutral-700 text-sm">
                    {socialLoading === 'facebook' ? 'Connecting...' : 'Facebook'}
                  </span>
                </div>
              </Button>

              {/* Apple Login */}
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('apple')}
                disabled={isLoading || socialLoading !== null}
                className="h-10 border-neutral-300 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center justify-center gap-3">
                  {socialLoading === 'apple' ? (
                    <div className="w-4 h-4 border-2 border-neutral-300 border-t-blue-600 rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="#000000" viewBox="0 0 24 24">
                      <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                    </svg>
                  )}
                  <span className="font-medium text-neutral-700 text-sm">
                    {socialLoading === 'apple' ? 'Connecting...' : 'Apple'}
                  </span>
                </div>
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-neutral-500 font-medium">
                Or continue with email
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
