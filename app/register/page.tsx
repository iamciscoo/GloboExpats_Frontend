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
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertCircle,
  CheckCircle2,
  Globe,
  Users,
  Shield,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { validateEmail } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const { login, isLoggedIn, isLoading: authLoading } = useAuth()
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
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
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
    const newStrength = calculatePasswordStrength(formData.password)
    setPasswordStrength(newStrength)

    const isValid =
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.personalEmail.includes('@') &&
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword &&
      formData.acceptTerms &&
      formData.acceptPrivacy

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

  const handleSocialRegister = async (provider: 'google' | 'facebook' | 'apple') => {
    setError(null)
    setSocialLoading(provider)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      await login({
        name: `${provider} User`,
        email: `user@${provider}.com`,
        isVerified: false, // Requires organization email verification
      })

      setSuccess(`${provider} registration successful! Redirecting...`)
      setTimeout(() => {
        router.push('/account/verification')
      }, 1000)
    } catch (error) {
      setError(`${provider} registration failed. Please try again.`)
    } finally {
      setSocialLoading(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const { firstName, lastName, personalEmail, password, confirmPassword, organizationEmail } =
      formData

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
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.personalEmail,
        organizationEmail: formData.organizationEmail,
        isVerified: false,
        isOrganizationEmailVerified: false,
      }

      await login(userData)
      setSuccess('Account created successfully! Redirecting...')

      setTimeout(() => {
        router.push('/account/verification')
      }, 1500)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary via-blue-800 to-cyan-600">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-5 gap-6 lg:gap-10">
          {/* Left Panel - Hero Information */}
          <div className="hidden lg:flex lg:col-span-2 flex-col justify-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="mb-8">
                <div className="text-4xl font-bold font-display mb-4">
                  Global<span className="text-brand-secondary">Expat</span>
                </div>
                <p className="text-xl text-blue-100 leading-relaxed mb-6">
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
                    <p className="text-blue-100 text-sm">Connect with verified expats worldwide</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Verified Expats</h3>
                    <p className="text-blue-100 text-sm">
                      All expats are identity and organization verified
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Professional Network</h3>
                    <p className="text-blue-100 text-sm">
                      Connect and trade within your professional expat community
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/20">
                <div className="text-center">
                  <h4 className="text-lg font-semibold mb-3 text-brand-secondary">Be a Member</h4>
                  <p className="text-sm text-blue-200">
                    Join our growing community of verified expat professionals and help shape the
                    future of our marketplace
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Registration Form */}
          <div className="lg:col-span-3 flex items-center justify-center">
            <Card className="w-full max-w-xl bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl border border-white/20">
              <CardHeader className="text-center pb-4 pt-6">
                <div className="lg:hidden mb-4">
                  <div className="text-3xl font-bold font-display text-brand-primary">
                    Global<span className="text-brand-secondary">Expat</span>
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold text-neutral-800 mb-2">
                  Create Your Account
                </CardTitle>
                <p className="text-neutral-600 text-base">
                  Join our global community of professionals
                </p>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                {error && (
                  <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <AlertDescription className="text-red-700 font-medium">
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
                <div className="space-y-4 mb-6">
                  <p className="text-center text-neutral-600 font-medium">
                    Quick registration with
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => handleSocialRegister('google')}
                      disabled={isLoading || socialLoading !== null}
                      className="h-12 border-2 hover:bg-neutral-50 transition-all duration-200"
                    >
                      {socialLoading === 'google' ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <div className="flex items-center gap-3">
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

                    <Button
                      variant="outline"
                      onClick={() => handleSocialRegister('facebook')}
                      disabled={isLoading || socialLoading !== null}
                      className="h-12 border-2 hover:bg-neutral-50 transition-all duration-200"
                    >
                      {socialLoading === 'facebook' ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          <span className="font-medium">Facebook</span>
                        </div>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleSocialRegister('apple')}
                      disabled={isLoading || socialLoading !== null}
                      className="h-12 border-2 hover:bg-neutral-50 transition-all duration-200"
                    >
                      {socialLoading === 'apple' ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5" fill="#000000" viewBox="0 0 24 24">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                          </svg>
                          <span className="font-medium">Apple</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-sm uppercase">
                    <span className="bg-white px-4 text-neutral-500 font-medium">
                      Or register with email
                    </span>
                  </div>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-neutral-700 font-medium">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="Enter your first name"
                        className="h-12 border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        disabled={isLoading || socialLoading !== null}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-neutral-700 font-medium">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Enter your last name"
                        className="h-12 border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        disabled={isLoading || socialLoading !== null}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="personalEmail" className="text-neutral-700 font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="personalEmail"
                      type="email"
                      placeholder="your.email@example.com"
                      className={`h-12 border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50 ${
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

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-neutral-700 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a secure password"
                        className="h-12 pr-12 border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        disabled={isLoading || socialLoading !== null}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Progress value={passwordStrength} className="flex-1 h-2" />
                          <span className="text-sm font-medium text-neutral-600">
                            {passwordStrength < 50
                              ? 'Weak'
                              : passwordStrength < 75
                                ? 'Good'
                                : 'Strong'}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-green-600' : 'text-neutral-400'}`}
                            >
                              {formData.password.length >= 8 ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                              <span>At least 8 characters</span>
                            </div>
                            <div
                              className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-neutral-400'}`}
                            >
                              {/[A-Z]/.test(formData.password) ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                              <span>Uppercase letter</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-neutral-700 font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        className={`h-12 pr-12 border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50 ${
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

                  <div className="space-y-4 pt-4 border-t border-neutral-200/80">
                    <div className="space-y-3">
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
                        <Label htmlFor="terms" className="text-sm text-neutral-700 leading-tight">
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
                        <Label htmlFor="privacy" className="text-sm text-neutral-700 leading-tight">
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
                      className={`w-full h-12 text-base font-bold transition-all duration-200 ${
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
                          <Badge variant="outline" className="text-sm text-neutral-500">
                            Complete all required fields and accept terms
                          </Badge>
                        </div>
                      )}
                  </div>
                </form>

                <div className="text-center pt-6 border-t border-neutral-200/80">
                  <p className="text-sm text-neutral-600">
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
