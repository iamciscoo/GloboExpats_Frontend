'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  User,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Save,
  Camera,
  Edit,
  Upload,
  ChevronRight,
  Building,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import { useUserProfile } from '@/hooks/use-user-profile'
import { useToast } from '@/components/ui/use-toast'
import { EXPAT_LOCATIONS } from '@/lib/constants'

export default function AccountSettings() {
  const { user, isVerifiedBuyer } = useAuth()
  const { userProfile, isLoading: profileLoading, updateBasicInfo, updateSellerInfo, error: profileError } = useUserProfile()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Profile data - now using dynamic data from useUserProfile
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    website: '',
    organization: '',
    position: '',
  })

  // Initialize profile data from userProfile
  useEffect(() => {
    if (userProfile && !profileLoading) {
      setProfileData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        bio: userProfile.bio || '',
        website: userProfile.website || '',
        organization: userProfile.organization || '',
        position: userProfile.position || '',
      })
    }
  }, [userProfile, profileLoading])

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailMessages: true,
    emailOffers: true,
    emailMarketing: false,
  })

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    showEmail: false,
    showPhone: true,
    allowMessages: true,
  })

  const handleProfileUpdate = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleNotificationUpdate = (field: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handlePrivacyUpdate = (field: string, value: boolean) => {
    setPrivacy((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const saveChanges = async () => {
    if (!hasChanges) return
    
    try {
      setIsSubmitting(true)
      
      // Update basic profile information
      await updateBasicInfo(profileData)
      
      // Show success message
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been saved successfully.',
      })
      
      setHasChanges(false)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to save profile changes. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const discardChanges = () => {
    setHasChanges(false)
    setIsEditing(false)
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('Verification submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while profile loads
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Show error state if profile failed to load
  if (profileError) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">Error Loading Profile</h2>
          <p className="text-neutral-600 mb-4">{profileError}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">Account Settings</h1>
            <p className="text-neutral-600 mt-1">Manage your account preferences and settings.</p>
          </div>
          {hasChanges && (
            <div className="flex gap-2 self-end sm:self-center">
              <Button variant="outline" onClick={discardChanges}>
                Discard
              </Button>
              <Button onClick={saveChanges}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {hasChanges && (
          <Alert className="border-amber-200/80 bg-amber-50/80 text-amber-900 mb-8">
            <AlertDescription>
              You have unsaved changes. Don't forget to save before navigating away.
            </AlertDescription>
          </Alert>
        )}

        <div className="md:hidden mb-6">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profile">Profile</SelectItem>
              <SelectItem value="verification">Verification</SelectItem>
              <SelectItem value="notifications">Notifications</SelectItem>
              <SelectItem value="privacy">Privacy</SelectItem>
              <SelectItem value="security">Security</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden md:block">
          <TabsList className="grid w-full grid-cols-5 max-w-xl mb-8">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" /> Profile
            </TabsTrigger>
            <TabsTrigger value="verification">
              <Shield className="w-4 h-4 mr-2" /> Verification
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="w-4 h-4 mr-2" /> Privacy
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" /> Security
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Profile Settings */}
        <div className={activeTab === 'profile' ? 'block' : 'hidden'}>
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-2 border-white shadow-lg">
                    <AvatarImage src={userProfile?.avatar || '/images/seller-avatar-2.jpg'} />
                    <AvatarFallback className="bg-brand-secondary text-brand-primary text-2xl font-bold">
                      {userProfile?.fullName?.slice(0, 2).toUpperCase() || 'TE'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="icon"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-neutral-800">Profile Picture</h3>
                  <p className="text-sm text-neutral-600">
                    Upload a photo to personalize your account.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => handleProfileUpdate('firstName', e.target.value)}
                    disabled={!isEditing}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => handleProfileUpdate('lastName', e.target.value)}
                    disabled={!isEditing}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileUpdate('email', e.target.value)}
                      disabled={!isEditing}
                      className="h-11"
                    />
                    <Badge className="bg-green-100 text-green-800 py-1 px-2">Verified</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                    disabled={!isEditing}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={profileData.location}
                    onValueChange={(value) => handleProfileUpdate('location', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select your location" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPAT_LOCATIONS.map((location) => (
                        <SelectItem key={location.value} value={location.value}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    value={profileData.website}
                    onChange={(e) => handleProfileUpdate('website', e.target.value)}
                    disabled={!isEditing}
                    placeholder="https://your-website.com"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Organization Details Section */}
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-neutral-500" />
                  <div>
                    <h3 className="font-medium text-neutral-800">Organization Details</h3>
                    <p className="text-sm text-neutral-600">Add your workplace information</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      value={profileData.organization}
                      onChange={(e) => handleProfileUpdate('organization', e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g., United Nations"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={profileData.position}
                      onChange={(e) => handleProfileUpdate('position', e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g., Program Officer"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">About Me / Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell others about yourself..."
                />
              </div>

              {/* Seller Information Section */}
              {userProfile && (userProfile.totalListings > 0 || userProfile.specialties?.length) && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-800">Seller Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Business Type</Label>
                        <Select 
                          value={userProfile.businessInfo?.type || 'individual'} 
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                            <SelectItem value="organization">Organization</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Response Time</Label>
                        <Input
                          value={userProfile.responseTime || ''}
                          disabled={!isEditing}
                          placeholder="e.g., < 1 hour"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Specialties</Label>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.specialties?.map((specialty) => (
                          <Badge key={specialty} variant="outline">
                            {specialty}
                          </Badge>
                        )) || <span className="text-sm text-neutral-500">No specialties set</span>}
                      </div>
                      {isEditing && (
                        <p className="text-xs text-neutral-500">
                          Contact support to update your specialties
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-neutral-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-xl font-bold text-brand-primary">
                          {userProfile.rating?.toFixed(1) || '0.0'}
                        </div>
                        <div className="text-xs text-neutral-600">Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">
                          {userProfile.reviewCount || 0}
                        </div>
                        <div className="text-xs text-neutral-600">Reviews</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">
                          {userProfile.totalListings || 0}
                        </div>
                        <div className="text-xs text-neutral-600">Listings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-600">
                          {userProfile.completedSales || 0}
                        </div>
                        <div className="text-xs text-neutral-600">Sales</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Verification Tab */}
        <div className={activeTab === 'verification' ? 'block' : 'hidden'}>
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Expat Verification</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      userProfile?.verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {userProfile?.verified ? 'Verified' : 'Unverified'}
                  </Badge>
                  {userProfile?.verificationBadges && (
                    <span className="text-sm text-neutral-600">
                      {Object.values(userProfile.verificationBadges).filter(Boolean).length}/
                      {Object.keys(userProfile.verificationBadges).length} badges
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-neutral-600">
                Complete your verification to unlock all platform features and build trust with
                other users.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerificationSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Passport or Residence Permit</Label>
                    <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-brand-primary transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                      <p className="text-sm text-neutral-600">Upload document</p>
                      <p className="text-xs text-neutral-500">PDF, JPG, PNG up to 5MB</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Proof of Address</Label>
                    <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-brand-primary transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                      <p className="text-sm text-neutral-600">Upload document</p>
                      <p className="text-xs text-neutral-500">PDF, JPG, PNG up to 5MB</p>
                    </div>
                  </div>
                </div>
                <Alert className="bg-blue-50 text-blue-900 border-blue-200">
                  <AlertDescription>
                    After document submission, we'll review your information and update your verification status.
                  </AlertDescription>
                </Alert>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Settings */}
        <div className={activeTab === 'notifications' ? 'block' : 'hidden'}>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <p className="text-sm text-neutral-500">Choose how we communicate with you.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-neutral-800 mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="emailMessages">New Messages</Label>
                      <p className="text-sm text-neutral-600">
                        Get notified when you receive a new message.
                      </p>
                    </div>
                    <Switch
                      id="emailMessages"
                      checked={notifications.emailMessages}
                      onCheckedChange={(val) => handleNotificationUpdate('emailMessages', val)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="emailOffers">Offers & Updates</Label>
                      <p className="text-sm text-neutral-600">
                        Receive offers on items and important updates.
                      </p>
                    </div>
                    <Switch
                      id="emailOffers"
                      checked={notifications.emailOffers}
                      onCheckedChange={(val) => handleNotificationUpdate('emailOffers', val)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="emailMarketing">Marketing & Promotions</Label>
                      <p className="text-sm text-neutral-600">
                        Get emails about new features and promotions.
                      </p>
                    </div>
                    <Switch
                      id="emailMarketing"
                      checked={notifications.emailMarketing}
                      onCheckedChange={(val) => handleNotificationUpdate('emailMarketing', val)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Settings */}
        <div className={activeTab === 'privacy' ? 'block' : 'hidden'}>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <p className="text-sm text-neutral-500">Control how your information is displayed.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="showEmail">Show email on profile</Label>
                  <p className="text-sm text-neutral-600">
                    Allow other users to see your email address.
                  </p>
                </div>
                <Switch
                  id="showEmail"
                  checked={privacy.showEmail}
                  onCheckedChange={(val) => handlePrivacyUpdate('showEmail', val)}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="showPhone">Show phone number on profile</Label>
                  <p className="text-sm text-neutral-600">
                    Allow other users to see your phone number.
                  </p>
                </div>
                <Switch
                  id="showPhone"
                  checked={privacy.showPhone}
                  onCheckedChange={(val) => handlePrivacyUpdate('showPhone', val)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Settings */}
        <div className={activeTab === 'security' ? 'block' : 'hidden'}>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <p className="text-sm text-neutral-500">Manage your account security settings.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-neutral-800 mb-2">Change Password</h3>
                <p className="text-sm text-neutral-600 mb-4">
                  Update your password to keep your account secure.
                </p>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      className="h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      className="h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      className="h-11"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showPassword ? 'Hide' : 'Show'} passwords
                    </Button>
                  </div>
                  <Button className="w-full sm:w-auto">Update Password</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
