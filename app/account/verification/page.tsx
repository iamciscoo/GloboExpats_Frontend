'use client'

import { useState } from 'react'
import { Shield, Upload, CheckCircle2, Mail, Globe, Users, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { validateEmail } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

export default function VerificationPage() {
  const {
    user,
    requestOrganizationEmailOtp,
    verifyOrganizationEmail,
    completeVerificationForTesting,
    verificationStatus,
    isLoading,
  } = useAuth()

  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [organizationEmail, setOrganizationEmail] = useState(
    user?.organizationEmail || user?.email || ''
  )
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Get verification status
  const isOrganizationEmailVerified = verificationStatus?.isOrganizationEmailVerified || false
  const isFullyVerified = verificationStatus?.isFullyVerified || false
  const currentStep = verificationStatus?.currentStep

  // Check if user signed up via social authentication
  const isSocialUser =
    user?.signupMethod === 'google' ||
    user?.signupMethod === 'facebook' ||
    user?.signupMethod === 'apple'

  const handleSendOTP = async () => {
    if (!validateEmail(organizationEmail)) {
      setError('Please enter a valid organization email address')
      return
    }

    setIsSubmitting(true)
    try {
      await requestOrganizationEmailOtp(organizationEmail)
      setOtpSent(true)
      setError('')
    } catch (error) {
      setError('Failed to send OTP. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError('Please enter the OTP')
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await verifyOrganizationEmail(organizationEmail, otp, 'SELLER')
      setSuccess('✅ Email verified successfully!')
      setOtpSent(false)
      setOtp('')
      toast({
        title: 'Success!',
        description: 'Your email has been verified.',
      })
    } catch (error) {
      setError('❌ Invalid OTP. Please try again.')
      toast({
        title: 'Verification Failed',
        description: 'Invalid OTP code. Please check and try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCompleteVerificationForTesting = async () => {
    setIsSubmitting(true)
    setError('')
    setSuccess('')
    try {
      // Set the organization email to current user email if not set
      if (!organizationEmail && user?.email) {
        setOrganizationEmail(user.email)
      }
      
      await completeVerificationForTesting()
      
      // After OTP is sent, show success message
      setOtpSent(true)
      setSuccess('✅ OTP sent! Check your email or backend logs.')
      toast({
        title: 'OTP Sent!',
        description: 'Check your email for the verification code.',
      })
    } catch (error) {
      setError('❌ Failed to send OTP. Please try again.')
      toast({
        title: 'Error',
        description: 'Failed to send OTP. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isFullyVerified) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <Card className="shadow-lg border-2 border-green-300 bg-white">
            <CardContent className="pt-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-[#0F172A] mb-3">
                  🎉 Account Fully Verified!
                </h2>
                <p className="text-xl text-[#475569] mb-8">
                  All platform features are now unlocked and ready to use.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                  <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                    <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-[#0F172A]">Buy Items</h3>
                    <p className="text-sm text-[#475569]">Shop from verified sellers</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                    <CheckCircle2 className="w-8 h-8 text-blue-700 mx-auto mb-2" />
                    <h3 className="font-semibold text-[#0F172A]">Sell Items</h3>
                    <p className="text-sm text-[#475569]">List your products</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                    <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-[#0F172A]">Full Access</h3>
                    <p className="text-sm text-[#475569]">All features available</p>
                  </div>
                </div>

                <Button
                  onClick={() => (window.location.href = '/browse')}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg shadow-md"
                >
                  Start Shopping 🛍️
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
        <Card className="shadow-lg border-2 border-gray-200 bg-white">
          <CardHeader className="bg-white border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-6 h-6 text-blue-700" />
              </div>
              <CardTitle className="text-2xl text-gray-900">
                Email Verification
              </CardTitle>
            </div>
            <p className="text-gray-600">
              Verify your email to unlock all platform features
            </p>
          </CardHeader>
          <CardContent className="p-8">
            {/* Status Banner */}
            {isOrganizationEmailVerified ? (
              <Alert className="mb-6 bg-green-50 border-green-300">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-700 font-medium">
                  ✅ Your email is verified! You can now access all features.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="mb-6 bg-blue-50 border-blue-300">
                <Mail className="h-5 w-5 text-blue-700" />
                <AlertDescription className="text-blue-700">
                  Please verify your email to unlock buying and selling features
                </AlertDescription>
              </Alert>
            )}

            {/* Simple Verification Form */}
            {!isOrganizationEmailVerified && (
              <div className="space-y-6">
                {/* Email Display */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Your Email</Label>
                  <div className="mt-1 p-3 bg-gray-50 border border-gray-300 rounded-md">
                    <p className="text-base font-medium text-gray-900">{user?.email}</p>
                  </div>
                </div>

                {/* Step 1: Send OTP */}
                <div>
                  <Button
                    onClick={handleCompleteVerificationForTesting}
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
                  >
                    {isSubmitting ? 'Sending...' : 'Step 1: Send Verification Code'}
                  </Button>
                  <p className="mt-2 text-sm text-gray-600">
                    We'll send a 6-digit code to your email
                  </p>
                </div>

                {/* Success/Error Messages */}
                {success && (
                  <Alert className="bg-green-50 border-green-300">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">{success}</AlertDescription>
                  </Alert>
                )}
                {error && !success && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Step 2: Enter OTP */}
                <div>
                  <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
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
                      className="h-12 text-2xl tracking-widest text-center font-mono border-2 border-gray-300 focus:border-blue-600"
                    />
                    <Button
                      onClick={handleVerifyOTP}
                      disabled={isSubmitting || otp.length !== 6}
                      size="lg"
                      className="h-12 px-8 bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                    >
                      {isSubmitting ? 'Verifying...' : 'Verify'}
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Enter the 6-digit code from your email (or check backend logs if testing)
                  </p>
                </div>
              </div>
            )}

            {/* Continue Button After Verification */}
            {isOrganizationEmailVerified && (
              <div className="mt-6 space-y-4">
                <Button
                  onClick={() => (window.location.href = '/')}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
                >
                  Continue to Home
                </Button>
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-1" />
                    <p className="font-medium">Buy Items</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Upload className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <p className="font-medium">Sell Items</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Users className="w-6 h-6 text-green-600 mx-auto mb-1" />
                    <p className="font-medium">Full Access</p>
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
