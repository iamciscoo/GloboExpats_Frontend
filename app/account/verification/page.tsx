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

export default function VerificationPage() {
  const {
    user,
    requestOrganizationEmailOtp,
    verifyOrganizationEmail,
    completeVerificationForTesting,
    verificationStatus,
    isLoading,
  } = useAuth()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [organizationEmail, setOrganizationEmail] = useState(
    user?.organizationEmail || user?.email || ''
  )
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')

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
    try {
      await verifyOrganizationEmail(organizationEmail, otp, 'SELLER')
      setError('')
      setOtpSent(false)
      setOtp('')
    } catch (error) {
      setError('Invalid OTP. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCompleteVerificationForTesting = async () => {
    setIsSubmitting(true)
    try {
      await completeVerificationForTesting()
      setError('')
    } catch (error) {
      setError('Failed to complete verification. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isFullyVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <Card className="shadow-xl border-2 border-green-200">
            <CardContent className="pt-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  🎉 Account Fully Verified!
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  All platform features are now unlocked and ready to use.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                  <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                    <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-green-800">Buy Items</h3>
                    <p className="text-sm text-green-600">Shop from verified sellers</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                    <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-blue-800">Sell Items</h3>
                    <p className="text-sm text-blue-600">List your products</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                    <CheckCircle2 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-purple-800">Full Access</h3>
                    <p className="text-sm text-purple-600">All features available</p>
                  </div>
                </div>

                <Button
                  onClick={() => (window.location.href = '/browse')}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 rounded-xl"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="shadow-xl border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 border-b-2 border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">
                {isSocialUser ? 'Complete Your Verification' : 'Account Verification'}
              </CardTitle>
            </div>
            <p className="text-gray-600 text-lg">
              {isSocialUser
                ? `Your account is connected. Complete verification to unlock all platform features.`
                : 'Complete your verification to unlock all platform features and start buying/selling.'}
            </p>
          </CardHeader>
          <CardContent className="p-8">
            {/* Development Testing Section */}
            <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-amber-900 text-lg mb-2">🧪 Development Testing</h3>
                  <p className="text-amber-800 mb-4">
                    For testing purposes, you can instantly complete verification. In production,
                    this would require document review.
                  </p>
                  <Button
                    onClick={handleCompleteVerificationForTesting}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  >
                    {isSubmitting ? 'Completing...' : '⚡ Complete Verification (Testing)'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Verification Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-xl border-2 ${isOrganizationEmailVerified ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Mail
                      className={`w-6 h-6 ${isOrganizationEmailVerified ? 'text-green-600' : 'text-yellow-600'}`}
                    />
                    <h4
                      className={`font-semibold ${isOrganizationEmailVerified ? 'text-green-800' : 'text-yellow-800'}`}
                    >
                      Organization Email
                    </h4>
                    {isOrganizationEmailVerified && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <p
                    className={`text-sm ${isOrganizationEmailVerified ? 'text-green-600' : 'text-yellow-600'}`}
                  >
                    {isOrganizationEmailVerified ? 'Verified ✓' : 'Pending verification'}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-xl border-2 ${isFullyVerified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Shield
                      className={`w-6 h-6 ${isFullyVerified ? 'text-green-600' : 'text-gray-600'}`}
                    />
                    <h4
                      className={`font-semibold ${isFullyVerified ? 'text-green-800' : 'text-gray-800'}`}
                    >
                      Identity Verification
                    </h4>
                    {isFullyVerified && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                  </div>
                  <p className={`text-sm ${isFullyVerified ? 'text-green-600' : 'text-gray-600'}`}>
                    {isFullyVerified ? 'Verified ✓' : 'Not started'}
                  </p>
                </div>
              </div>
            </div>

            {/* Organization Email Verification Section */}
            {!isOrganizationEmailVerified && (
              <div className="space-y-6 p-6 border-2 border-blue-200 rounded-2xl bg-blue-50">
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-blue-900">
                    Organization Email Verification
                  </h3>
                  <Badge className="bg-blue-500 text-white">Required</Badge>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Organization Email Address</Label>
                    <div className="flex gap-3">
                      <Input
                        type="email"
                        placeholder="name@organization.com"
                        value={organizationEmail}
                        onChange={(e) => setOrganizationEmail(e.target.value)}
                        disabled={otpSent || isSubmitting}
                        className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
                      />
                      <Button
                        type="button"
                        variant={otpSent ? 'outline' : 'default'}
                        onClick={handleSendOTP}
                        disabled={isSubmitting || !organizationEmail}
                        className="h-12 px-6"
                      >
                        {otpSent ? 'Resend OTP' : 'Send OTP'}
                      </Button>
                    </div>
                    <p className="text-sm text-blue-700">
                      📧 Use your work email from your organization, embassy, NGO, or company.
                    </p>
                  </div>

                  {otpSent && (
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Enter OTP</Label>
                      <div className="flex gap-3">
                        <Input
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          disabled={isSubmitting}
                          maxLength={6}
                          className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
                        />
                        <Button
                          type="button"
                          onClick={handleVerifyOTP}
                          disabled={isSubmitting || !otp}
                          className="h-12 px-6 bg-green-500 hover:bg-green-600"
                        >
                          {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            )}

            {/* What You Get Section */}
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border-2 border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                🚀 What You Get After Verification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Globe className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-green-800">Buy Items</h4>
                  <p className="text-sm text-green-600">Shop from verified expat sellers</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-blue-800">Sell Items</h4>
                  <p className="text-sm text-blue-600">List your products for sale</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-purple-800">Community</h4>
                  <p className="text-sm text-purple-600">Full platform access</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
