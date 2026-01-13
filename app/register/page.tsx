'use client'

/**
 * =============================================================================
 * REGISTRATION PAGE - ENHANCED WITH VISUAL APPEAL
 * =============================================================================
 *
 * Features:
 * - Appealing visual design with hero imagery
 * - Two-column layout with information panel
 * - Social registration options
 * - Progressive form with clear organization
 * - Professional expat community focus
 *
 * Backend Integration:
 * - POST /api/auth/register for account creation
 * - Email verification flow
 * - Organization verification process
 */

import type React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertCircle, Globe, UserCheck, Briefcase, Eye, EyeOff, Loader2, Mail } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { validateEmail } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

export default function RegisterPage() {
  const router = useRouter()
  const { register, login, isLoggedIn, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    personalEmail: '',
    password: '',
    confirmPassword: '',
    organizationEmail: '',
    acceptTerms: false,
    acceptPrivacy: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)

  const [showEmailForm, setShowEmailForm] = useState(false)

  // Add redirect logic for already authenticated users
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      router.push('/')
    }
  }, [isLoggedIn, authLoading, router])

  // Form validation
  useEffect(() => {
    const isValid =
      formData.firstName.trim().length > 0 &&
      formData.lastName.trim().length > 0 &&
      formData.personalEmail.includes('@') &&
      formData.password.length >= 8 &&
      formData.password === formData.confirmPassword &&
      formData.acceptTerms === true &&
      formData.acceptPrivacy === true

    setIsFormValid(isValid)
  }, [formData])

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    )
  }

  // Don't render register form if user is already logged in
  if (isLoggedIn) {
    return null
  }

  const handleGoogleRegister = async () => {
    setError(null)
    setSocialLoading('google')

    try {
      const res = await fetch('/api/oauth/google?nextPath=/', {
        method: 'GET',
        headers: { accept: '*/*' },
      })
      if (!res.ok) throw new Error('Failed to initiate Google registration')
      const data = await res.json()
      if (data && data.authUrl) {
        window.location.href = data.authUrl
      } else {
        throw new Error('No authUrl returned from server')
      }
    } catch {
      setError('Google registration failed. Please try again.')
      setSocialLoading(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { firstName, lastName, personalEmail, password, confirmPassword } = formData

    if (!firstName || !lastName || !personalEmail || !password || !confirmPassword) {
      setError('Please fill in all required fields.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!validateEmail(personalEmail)) {
      setError('Please enter a valid personal email address.')
      return
    }

    setIsLoading(true)

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        emailAddress: formData.personalEmail,
        agreeToTerms: formData.acceptTerms,
        agreeToPrivacyPolicy: formData.acceptPrivacy,
      })

      await login({
        email: formData.personalEmail,
        password: formData.password,
      })

      toast({
        title: 'Welcome to GloboExpat!',
        description: 'Your account has been created successfully! Redirecting you now...',
        variant: 'default',
      })

      setTimeout(() => {
        router.push('/')
      }, 1200)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      setError(errorMessage)
      toast({
        title: 'Registration Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
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
                Join the world&apos;s most trusted expat marketplace community
              </h1>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20">
                  <Globe className="w-6 h-6 text-blue-200" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Global Community</h3>
                  <p className="text-blue-100 text-sm">Connect with verified expats worldwide</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20">
                  <UserCheck className="w-6 h-6 text-green-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Verified Expats</h3>
                  <p className="text-blue-100 text-sm">
                    All expats are identity and organization verified
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20">
                  <Briefcase className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Professional Network</h3>
                  <p className="text-blue-100 text-sm">
                    Connect and trade within your professional community
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Registration Form */}
          <div className="lg:col-span-3 flex items-center justify-center w-full">
            <Card className="w-full max-w-xl bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border-0 overflow-hidden">
              <CardHeader className="text-center space-y-1 pb-3 pt-5">
                <div className="lg:hidden mb-4">
                  <Link href="/" className="inline-block">
                    <div className="text-3xl font-bold font-display text-brand-primary">
                      Globo<span className="text-brand-secondary">expats</span>
                    </div>
                  </Link>
                </div>
                <CardTitle className="text-2xl font-bold text-neutral-800">
                  Create Your Account
                </CardTitle>
                <p className="text-neutral-500 font-medium text-sm">
                  Join our global community of professionals
                </p>
              </CardHeader>

              <CardContent className="px-6 pb-6 space-y-3">
                {error && (
                  <Alert variant="destructive" className="rounded-xl border-red-100 bg-red-50/50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Google Sign Up */}
                <Button
                  variant="outline"
                  onClick={handleGoogleRegister}
                  disabled={isLoading || socialLoading !== null}
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
                      <span>Sign up with Google</span>
                    </div>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-neutral-400 font-bold tracking-widest">
                      or register with email
                    </span>
                  </div>
                </div>

                {/* Email Registration Button - Always Visible */}
                <Button
                  variant="outline"
                  onClick={() => setShowEmailForm(!showEmailForm)}
                  disabled={isLoading || socialLoading !== null}
                  className="w-full h-14 text-base border-2 border-neutral-300 hover:bg-neutral-50 transition-all duration-300 rounded-full font-medium translate-y-0 active:translate-y-px"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Mail className="w-5 h-5 text-neutral-600" />
                    <span>Register with Email</span>
                  </div>
                </Button>

                {/* Collapsible Form */}
                <div
                  className={`overflow-hidden p-1 -m-1 transition-all duration-300 ease-in-out ${showEmailForm ? 'max-h-[800px] opacity-100 pt-2 pb-2' : 'max-h-0 opacity-0'}`}
                >
                  <form onSubmit={handleSubmit} className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-neutral-700 font-semibold px-1">First Name</Label>
                        <Input
                          placeholder="Your first name"
                          className="h-10 rounded-xl bg-neutral-50 border-neutral-100 focus:bg-white focus:ring-brand-primary/20 focus-visible:ring-offset-0 ring-offset-0"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-neutral-700 font-semibold px-1">Last Name</Label>
                        <Input
                          placeholder="Your last name"
                          className="h-10 rounded-xl bg-neutral-50 border-neutral-100 focus:bg-white focus:ring-brand-primary/20 focus-visible:ring-offset-0 ring-offset-0"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-neutral-700 font-semibold px-1">Email Address</Label>
                      <Input
                        type="email"
                        placeholder="e.g. your.name@example.com"
                        className="h-10 rounded-xl bg-neutral-50 border-neutral-100 focus:bg-white focus:ring-brand-primary/20 focus-visible:ring-offset-0 ring-offset-0"
                        value={formData.personalEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, personalEmail: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-neutral-700 font-semibold px-1">Password</Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Min 8 chars"
                            className={`h-10 rounded-xl pr-10 bg-neutral-50 border-neutral-100 focus:bg-white focus:ring-brand-primary/20 focus-visible:ring-offset-0 ring-offset-0 ${formData.password && formData.password.length < 8 ? 'border-red-500' : ''}`}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {formData.password && formData.password.length < 8 && (
                          <p className="text-[10px] text-red-500 mt-1 px-1">
                            Password must be at least 8 characters
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-neutral-700 font-semibold px-1">Confirm</Label>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Repeat"
                            className={`h-10 rounded-xl pr-10 bg-neutral-50 border-neutral-100 focus:bg-white focus:ring-brand-primary/20 focus-visible:ring-offset-0 ring-offset-0 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500' : ''}`}
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              setFormData({ ...formData, confirmPassword: e.target.value })
                            }
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {formData.confirmPassword &&
                          formData.password !== formData.confirmPassword && (
                            <p className="text-[10px] text-red-500 mt-1 px-1">
                              Passwords do not match
                            </p>
                          )}
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="terms"
                          className="mt-1"
                          checked={formData.acceptTerms}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, acceptTerms: !!checked })
                          }
                        />
                        <Label htmlFor="terms" className="text-sm text-neutral-600 leading-tight">
                          I agree to the{' '}
                          <Link
                            href="/terms"
                            className="text-brand-primary font-bold hover:underline"
                          >
                            Terms of Service
                          </Link>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="privacy"
                          className="mt-1"
                          checked={formData.acceptPrivacy}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, acceptPrivacy: !!checked })
                          }
                        />
                        <Label htmlFor="privacy" className="text-sm text-neutral-600 leading-tight">
                          I agree to the{' '}
                          <Link
                            href="/privacy"
                            className="text-brand-primary font-bold hover:underline"
                          >
                            Privacy Policy
                          </Link>
                        </Label>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={!isFormValid || isLoading}
                      className={`w-full h-12 rounded-full font-bold text-lg shadow-lg shadow-brand-primary/20 transition-all duration-300 ${
                        isFormValid && !isLoading
                          ? 'bg-neutral-800 hover:bg-neutral-900 translate-y-0 hover:-translate-y-0.5 active:translate-y-0'
                          : 'bg-neutral-300 pointer-events-none'
                      }`}
                    >
                      {isLoading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                    </Button>
                  </form>
                </div>

                <div className="text-center pt-2">
                  <p className="text-neutral-500 text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="text-brand-primary font-bold hover:underline">
                      Sign In
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
