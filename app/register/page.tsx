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
import {
  AlertCircle,
  CheckCircle2,
  Globe,
  UserCheck,
  Briefcase,
  Eye,
  EyeOff,
  X,
  Loader2,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
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
    phoneNumber: '',
    organizationEmail: '',
    acceptTerms: false,
    acceptPrivacy: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)

  // Add redirect logic for already authenticated users
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      router.push('/')
    }
  }, [isLoggedIn, authLoading, router])

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    if (/[^A-Za-z0-9]/.test(password)) strength += 25
    return strength
  }

  // Form validation
  useEffect(() => {
    // Calculate password strength but don't store it (not shown in UI)
    const _newStrength = calculatePasswordStrength(formData.password)

    const isValid =
      formData.firstName.trim().length > 0 &&
      formData.lastName.trim().length > 0 &&
      formData.personalEmail.includes('@') &&
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword &&
      formData.acceptTerms === true &&
      formData.acceptPrivacy === true

    setIsFormValid(isValid)
  }, [formData, formData.acceptTerms, formData.acceptPrivacy])

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
      // Use Next.js API proxy route (same-origin, no CORS, no caching issues)
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
    setSuccess(null)

    const {
      firstName,
      lastName,
      personalEmail,
      password,
      confirmPassword,
      phoneNumber,
      organizationEmail,
    } = formData

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

    if (organizationEmail && !validateEmail(organizationEmail)) {
      setError('Please enter a valid organization email address.')
      return
    }

    setIsLoading(true)

    try {
      // Call backend register
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        emailAddress: formData.personalEmail,
        agreeToTerms: formData.acceptTerms,
        agreeToPrivacyPolicy: formData.acceptPrivacy,
      })

      // Auto-login after successful registration
      await login({
        email: formData.personalEmail,
        password: formData.password,
      })

      // If phone number was provided, update user profile
      if (phoneNumber && phoneNumber.trim()) {
        try {
          const token = localStorage.getItem('authToken')
          if (token) {
            const formDataToSend = new FormData()
            const userDto = {
              phoneNumber: phoneNumber.trim(),
            }
            formDataToSend.append('userDto', JSON.stringify(userDto))

            await fetch('https://dev.globoexpats.com/api/v1/userManagement/editProfile', {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formDataToSend,
            })
          }
        } catch (phoneError) {
          console.error('Failed to update phone number:', phoneError)
          // Don't block registration flow if phone update fails
        }
      }

      // Success toast
      toast({
        title: '🎉 Welcome to GloboExpat!',
        description: 'Account created successfully! Redirecting you...',
        variant: 'default',
      })

      // Redirect to home
      setTimeout(() => {
        router.push('/')
      }, 1200)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'

      // Handle "User already exists" error with enthusiastic toast
      if (errorMessage.toLowerCase().includes('already exists')) {
        toast({
          title: '👋 Hey There, Familiar Face!',
          description:
            "Looks like you're already part of our awesome community! Let's get you signed in instead. Click 'Sign In' below to access your account! 🚀",
          variant: 'warning',
        })
        setError('This email is already registered. Please sign in instead.')
      } else if (errorMessage.toLowerCase().includes('invalid email')) {
        toast({
          title: '📧 Email Check Required',
          description:
            "Please double-check your email address and try again! Make sure it's a valid format. 😊",
          variant: 'warning',
        })
        setError(errorMessage)
      } else if (errorMessage.toLowerCase().includes('password')) {
        toast({
          title: '🔐 Password Needs a Boost',
          description:
            'Your password needs to be stronger! Try adding uppercase letters, numbers, and special characters. 💪',
          variant: 'warning',
        })
        setError(errorMessage)
      } else {
        // Generic error with enthusiastic message
        toast({
          title: '😅 Oops! Something Went Wrong',
          description: `An error occurred: ${errorMessage}. Please try again! If the issue persists, our support team is ready to help! 🙌`,
          variant: 'warning',
        })
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary via-blue-800 to-cyan-600 overflow-y-auto">
      <div className="flex items-center justify-center p-4 py-8 min-h-screen">
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Left Panel - Hero Information */}
          <div className="hidden lg:flex lg:col-span-2 flex-col justify-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="mb-8">
                <Link href="/" className="inline-block">
                  <div className="text-4xl font-bold font-display mb-4 hover:opacity-80 transition-opacity cursor-pointer">
                    Globo<span className="text-brand-secondary">expats</span>
                  </div>
                </Link>
                <p className="text-xl text-white leading-relaxed mb-6">
                  Join the world's most trusted expat marketplace community
                </p>
              </div>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-brand-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Global Community</h3>
                    <p className="text-white text-sm">Connect with verified expats worldwide</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Verified Expats</h3>
                    <p className="text-white text-sm">
                      All expats are identity and organization verified
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Professional Network</h3>
                    <p className="text-white text-sm">
                      Connect and trade within your professional expat community
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/20">
                <div className="text-center">
                  <h4 className="text-2xl font-semibold mb-3 text-brand-secondary">Be a Member</h4>
                  <p className="text-sm text-white">
                    Join our growing community of verified expat professionals and help shape the
                    future of our marketplace
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Registration Form */}
          <div className="lg:col-span-3 flex items-center justify-center">
            <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl border border-white/20">
              <CardHeader className="text-center pb-1 pt-2">
                <Link href="/" className="inline-block mx-auto mb-1">
                  <div className="text-xl font-bold font-display text-brand-primary hover:opacity-80 transition-opacity cursor-pointer">
                    Globo<span className="text-brand-secondary">expats</span>
                  </div>
                </Link>
                <CardTitle className="text-lg font-bold text-neutral-800 mb-0.5">
                  Create Your Account
                </CardTitle>
                <p className="text-neutral-600 text-xs">
                  Join our global community of professionals
                </p>
              </CardHeader>

              <CardContent className="px-6 pb-3 pt-2">
                {error && (
                  <Alert className="mb-3 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700 text-sm font-medium">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-green-50/80 text-green-900 border-green-200/80 py-2">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <AlertDescription className="text-xs">{success}</AlertDescription>
                  </Alert>
                )}

                {/* Social Authentication Buttons */}
                <div className="space-y-1.5 mb-2">
                  <p className="text-center text-neutral-600 font-medium text-xs">
                    Quick registration with
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleGoogleRegister}
                    disabled={isLoading || socialLoading !== null}
                    className="w-full h-9 border-2 hover:bg-neutral-50 transition-all duration-200 rounded-full"
                  >
                    {socialLoading === 'google' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        {/* Google Icon */}
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

                <div className="relative mb-2">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-sm uppercase">
                    <span className="bg-white px-3 text-neutral-500 font-medium text-xs">
                      Or register with email
                    </span>
                  </div>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="firstName" className="text-neutral-700 font-medium text-xs">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="Enter your first name"
                        autoComplete="given-name"
                        className="h-10 border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        disabled={isLoading || socialLoading !== null}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="lastName" className="text-neutral-700 font-medium text-xs">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Enter your last name"
                        autoComplete="family-name"
                        className="h-10 border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        disabled={isLoading || socialLoading !== null}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="personalEmail" className="text-neutral-700 font-medium text-xs">
                      Email Address
                    </Label>
                    <Input
                      id="personalEmail"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      autoComplete="email"
                      className={`h-9 border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50 text-sm ${
                        formData.personalEmail && !validateEmail(formData.personalEmail)
                          ? 'border-red-300 focus:border-red-500'
                          : formData.personalEmail && validateEmail(formData.personalEmail)
                            ? 'border-green-300 focus:border-green-500'
                            : ''
                      }`}
                      value={formData.personalEmail}
                      onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                      disabled={isLoading || socialLoading !== null}
                      required
                    />
                    {formData.personalEmail && !validateEmail(formData.personalEmail) && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <X className="h-4 w-4" />
                        Please enter a valid email address
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="phoneNumber" className="text-neutral-700 font-medium text-xs">
                      WhatsApp Number{' '}
                      <span className="text-neutral-400 text-[10px]">(Optional)</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      name="phone"
                      type="tel"
                      placeholder="+255 712 345 678"
                      autoComplete="tel"
                      className="h-8 border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50 text-sm"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      disabled={isLoading || socialLoading !== null}
                    />
                    <p className="text-[10px] text-neutral-500">
                      💬 We'll use this for order updates and communication (include country code)
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-neutral-700 font-medium text-xs">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a secure password"
                        autoComplete="new-password"
                        className="h-8 pr-10 border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50 text-sm"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        disabled={isLoading || socialLoading !== null}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-neutral-700 font-medium text-xs"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        className={`h-9 pr-10 border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50 text-sm ${
                          formData.confirmPassword && formData.password !== formData.confirmPassword
                            ? 'border-red-300 focus:border-red-500'
                            : formData.confirmPassword &&
                                formData.password === formData.confirmPassword
                              ? 'border-green-300 focus:border-green-500'
                              : ''
                        }`}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        disabled={isLoading || socialLoading !== null}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <X className="h-4 w-4" />
                        Passwords do not match
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-neutral-200/80">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="terms"
                          checked={formData.acceptTerms}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, acceptTerms: checked === true })
                          }
                          disabled={isLoading || socialLoading !== null}
                          required
                        />
                        <Label htmlFor="terms" className="text-xs text-neutral-700 leading-tight">
                          I agree to the{' '}
                          <Link
                            href="/terms"
                            className="text-brand-primary hover:text-brand-secondary hover:underline"
                          >
                            Terms of Service
                          </Link>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="privacy"
                          checked={formData.acceptPrivacy}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, acceptPrivacy: checked === true })
                          }
                          disabled={isLoading || socialLoading !== null}
                          required
                        />
                        <Label htmlFor="privacy" className="text-xs text-neutral-700 leading-tight">
                          I agree to the{' '}
                          <Link
                            href="/privacy"
                            className="text-brand-primary hover:text-brand-secondary hover:underline"
                          >
                            Privacy Policy
                          </Link>
                        </Label>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className={`w-full h-9 text-sm font-bold transition-all duration-200 ${
                        isFormValid && !isLoading
                          ? 'bg-brand-primary hover:bg-brand-primary/90 transform hover:scale-105'
                          : 'bg-neutral-400'
                      }`}
                      disabled={!isFormValid || isLoading || socialLoading !== null}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Creating Account...
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </Button>

                    {/* Form validation status */}
                    {!isFormValid &&
                      (formData.firstName || formData.lastName || formData.personalEmail) && (
                        <div className="text-center">
                          <Badge variant="outline" className="text-xs text-neutral-500">
                            Complete all required fields and accept terms
                          </Badge>
                        </div>
                      )}
                  </div>
                </form>

                <div className="text-center pt-2 border-t border-neutral-200/80">
                  <p className="text-xs text-neutral-600">
                    Already have an account?{' '}
                    <Link
                      href="/login"
                      className="font-semibold text-brand-primary hover:text-brand-secondary hover:underline"
                    >
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
