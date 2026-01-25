'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Mail, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// Select imports removed - role selection no longer needed
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
// Badge import removed - not used in this component
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/use-toast'

export default function VerificationPage() {
  const {
    user: _user,
    verifyOrganizationEmail,
    completeVerificationForTesting,
    verificationStatus,
    refreshSession,
  } = useAuth()

  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [organizationEmail, setOrganizationEmail] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Get verification status
  const isOrganizationEmailVerified = verificationStatus?.isOrganizationEmailVerified || false
  const isFullyVerified = verificationStatus?.isFullyVerified || false

  // Auto-redirect when verification status changes to verified
  useEffect(() => {
    if (isOrganizationEmailVerified || isFullyVerified) {
      // Immediate redirect for already verified users
      const timeoutId = setTimeout(() => {
        toast({
          title: 'Already Verified',
          description:
            'Your account is already verified. All features are unlocked. Redirecting you to the homepage...',
          variant: 'default',
        })

        setTimeout(() => {
          router.push('/')
        }, 1000)
      }, 2000) // Reduced wait time for already verified users

      return () => clearTimeout(timeoutId)
    }
  }, [isOrganizationEmailVerified, isFullyVerified, router, toast])

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError('Please enter the OTP')
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await verifyOrganizationEmail(organizationEmail, otp)
      setSuccess('Email verified successfully')
      setOtpSent(false)
      setOtp('')

      toast({
        title: 'Success - Email Verified',
        description:
          'Your work email has been verified successfully. All platform features are now unlocked. Redirecting you to the homepage...',
        variant: 'default',
      })

      // Give backend a moment to update verification status, then refresh session multiple times
      setTimeout(async () => {
        try {
          await refreshSession()
          console.log('✅ First session refresh after verification')

          // Second refresh after another short delay to ensure state is updated
          setTimeout(async () => {
            try {
              await refreshSession()
              console.log('✅ Second session refresh after verification')
            } catch (error) {
              console.error('❌ Failed second refresh:', error)
            }
          }, 500)
        } catch (error) {
          console.error('❌ Failed to refresh session after verification:', error)
        }
      }, 1000)

      // Redirect to homepage after successful verification
      setTimeout(() => {
        router.push('/')
      }, 2500) // Give more time for session refresh
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid OTP. Please try again.'

      setError(errorMessage)
      toast({
        title: 'Verification Failed',
        description: `${errorMessage} Please double-check your code and try again. Need help? Contact our support team.`,
        variant: 'default',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCompleteVerificationForTesting = async () => {
    if (!organizationEmail) {
      setError('Please enter your work email address')
      return
    }

    // Validate email format first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(organizationEmail)) {
      setError('Please enter a valid email address (e.g., name@company.com)')
      toast({
        title: 'Invalid Email Format',
        description: 'Please enter a properly formatted email address with @ and a valid domain.',
        variant: 'default',
      })
      return
    }

    // Block personal email providers - only allow work/organization emails
    const personalEmailProviders = [
      'gmail.com',
      'googlemail.com',
      'yahoo.',
      'hotmail.',
      'icloud.com',
      'outlook.',
      'live.',
      'msn.',
      'tutamail.',
      'tutanota.',
      'tuta.',
      'aol.',
      'protonmail.',
      'mail.com',
      'zoho.',
    ]

    const emailDomain = organizationEmail.toLowerCase().split('@')[1]
    const isPersonalEmail = personalEmailProviders.some(
      (provider) => emailDomain.startsWith(provider) || emailDomain.includes(provider)
    )

    if (isPersonalEmail) {
      const errorMsg =
        'Please use your work or organization email address. Personal email addresses (Gmail, Yahoo, Hotmail, Outlook, etc.) are not accepted for verification.'
      setError(errorMsg)
      toast({
        title: 'Work Email Required',
        description: errorMsg,
        variant: 'default',
      })
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await completeVerificationForTesting(organizationEmail)

      // After OTP is sent, show success message
      setOtpSent(true)
      setSuccess('OTP sent! Check your email.')
      toast({
        title: 'Verification Code Sent',
        description:
          'Great news! We have sent a 6-digit verification code to your work email. Please also check your spam or junk folder if you do not see it within a few minutes.',
        variant: 'default',
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send OTP. Please try again.'

      setError(errorMessage)
      toast({
        title: 'Something Went Wrong',
        description: `${errorMessage} Please try again. If the issue persists, contact our support team.`,
        variant: 'default',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isFullyVerified) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <Card className="border border-[#E2E8F0] bg-white">
            <CardContent className="pt-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#1E3A8A]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-[#1E3A8A]" />
                </div>
                <h2 className="text-2xl font-semibold text-[#0F172A] mb-2">
                  Account Fully Verified
                </h2>
                <p className="text-base text-[#64748B] mb-8">
                  All platform features are now unlocked and ready to use.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                  <div className="bg-[#F8FAFB] p-4 rounded-lg border border-[#E2E8F0]">
                    <CheckCircle2 className="w-6 h-6 text-[#1E3A8A] mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-[#0F172A]">Buy Items</h3>
                    <p className="text-xs text-[#64748B]">Shop from verified sellers</p>
                  </div>
                  <div className="bg-[#F8FAFB] p-4 rounded-lg border border-[#E2E8F0]">
                    <CheckCircle2 className="w-6 h-6 text-[#1E3A8A] mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-[#0F172A]">Sell Items</h3>
                    <p className="text-xs text-[#64748B]">List your products</p>
                  </div>
                  <div className="bg-[#F8FAFB] p-4 rounded-lg border border-[#E2E8F0]">
                    <CheckCircle2 className="w-6 h-6 text-[#1E3A8A] mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-[#0F172A]">Full Access</h3>
                    <p className="text-xs text-[#64748B]">All features available</p>
                  </div>
                </div>

                <Button
                  onClick={() => router.push('/browse')}
                  size="lg"
                  className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white px-8 py-3 rounded-lg"
                >
                  Start Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <Card className="border border-[#E2E8F0] bg-white">
          <CardHeader className="bg-white border-b border-[#E2E8F0] p-6">
            <CardTitle className="text-xl font-semibold text-[#0F172A]">
              Organization Email Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {/* Status Banner */}
            {isOrganizationEmailVerified ? (
              <Alert className="mb-6 bg-[#1E3A8A]/5 border-[#1E3A8A]/20">
                <CheckCircle2 className="h-4 w-4 text-[#1E3A8A]" />
                <AlertDescription className="text-[#0F172A] text-sm">
                  Your email is verified. You can now access all features.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="mb-6 bg-[#F8FAFB] border-[#E2E8F0]">
                <Mail className="h-4 w-4 text-[#64748B]" />
                <AlertDescription className="text-[#64748B] text-sm space-y-2">
                  <p>Please verify with your work email to unlock buying and selling features.</p>
                  <p className="font-bold text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                    Tip: Be sure to check your JUNK or SPAM folder - the verification email might
                    end up there!
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Simple Verification Form */}
            {!isOrganizationEmailVerified && (
              <div className="space-y-6">
                {/* Email Input */}
                <div>
                  <Label htmlFor="organizationEmail" className="text-sm font-medium text-[#0F172A]">
                    Work Email Address
                  </Label>
                  <Input
                    id="organizationEmail"
                    type="email"
                    placeholder="name@yourcompany.com"
                    value={organizationEmail}
                    onChange={(e) => setOrganizationEmail(e.target.value)}
                    disabled={isSubmitting}
                    className={`mt-1 h-11 border focus:border-[#1E3A8A] ${
                      organizationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(organizationEmail)
                        ? 'border-red-300 focus:border-red-500'
                        : organizationEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(organizationEmail)
                          ? 'border-green-300 focus:border-green-500'
                          : 'border-[#E2E8F0]'
                    }`}
                  />
                  {organizationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(organizationEmail) && (
                    <p className="text-xs text-red-500 mt-1">
                      Please enter a valid email address (e.g., name@yourcompany.com)
                    </p>
                  )}
                  {(!organizationEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(organizationEmail)) && (
                    <p className="text-xs text-gray-500 mt-1">
                      Use your company or organization email (not Gmail, Yahoo, Outlook, etc.)
                    </p>
                  )}
                </div>

                {/* Step 1: Send OTP */}
                <div>
                  <Button
                    onClick={handleCompleteVerificationForTesting}
                    disabled={isSubmitting || !organizationEmail}
                    size="lg"
                    className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white h-11 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        Sending
                        <span className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
                        </span>
                      </span>
                    ) : (
                      'Step 1: Send Verification Code'
                    )}
                  </Button>
                  <p className="mt-2 text-xs text-[#64748B]">
                    We&apos;ll send a 6-digit code to your email
                  </p>
                </div>

                {/* Success/Error Messages */}
                {success && (
                  <Alert className="bg-[#1E3A8A]/5 border-[#1E3A8A]/20">
                    <CheckCircle2 className="h-4 w-4 text-[#1E3A8A]" />
                    <AlertDescription className="text-[#0F172A] text-sm">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}
                {error && !success && (
                  <Alert className="bg-blue-50 border-blue-200 text-blue-900">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-900">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Step 2: Enter OTP - Only show after code is sent */}
                {otpSent && (
                  <div>
                    <Label htmlFor="otp" className="text-sm font-medium text-[#0F172A]">
                      Step 2: Enter Verification Code
                    </Label>
                    <div className="mt-2 flex gap-3">
                      <Input
                        id="otp"
                        type="text"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        disabled={isSubmitting}
                        maxLength={6}
                        className="h-11 text-xl tracking-widest text-center font-mono border border-[#E2E8F0] focus:border-[#1E3A8A]"
                      />
                      <Button
                        onClick={handleVerifyOTP}
                        disabled={isSubmitting || otp.length !== 6}
                        size="lg"
                        className="h-11 px-8 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            Verifying
                            <span className="flex gap-1">
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
                            </span>
                          </span>
                        ) : (
                          'Verify'
                        )}
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-[#64748B]">
                      Enter the 6-digit code from your email
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Continue Button After Verification */}
            {isOrganizationEmailVerified && (
              <div className="mt-6 space-y-4">
                <Button
                  onClick={() => router.push('/')}
                  size="lg"
                  className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white h-11"
                >
                  Continue to Home
                </Button>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-3 bg-[#F8FAFB] rounded-lg border border-[#E2E8F0]">
                    <CheckCircle2 className="w-5 h-5 text-[#1E3A8A] mx-auto mb-1" />
                    <p className="font-medium text-[#0F172A]">Buy Items</p>
                  </div>
                  <div className="p-3 bg-[#F8FAFB] rounded-lg border border-[#E2E8F0]">
                    <CheckCircle2 className="w-5 h-5 text-[#1E3A8A] mx-auto mb-1" />
                    <p className="font-medium text-[#0F172A]">Sell Items</p>
                  </div>
                  <div className="p-3 bg-[#F8FAFB] rounded-lg border border-[#E2E8F0]">
                    <CheckCircle2 className="w-5 h-5 text-[#1E3A8A] mx-auto mb-1" />
                    <p className="font-medium text-[#0F172A]">Full Access</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
