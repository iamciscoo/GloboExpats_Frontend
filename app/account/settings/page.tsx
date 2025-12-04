'use client'

import { useState, useEffect } from 'react'
import { User as UserIcon, Shield, Eye, EyeOff, Save, Camera, Edit, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { getInitials } from '@/lib/utils'

export default function AccountSettings() {
  useAuth() // Auth context available if needed
  const {
    userProfile: baseProfile,
    isLoading: profileLoading,
    updateProfile,
    error: profileError,
  } = useUserProfile()
  const { toast } = useToast()

  // Type cast to allow placeholder properties until backend implements them
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userProfile = baseProfile as any

  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)

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
        phone: userProfile.phoneNumber || '',
        location: userProfile.location || '',
        bio: userProfile.aboutMe || '',
        website: '', // Not in User type, keeping as empty for now
        organization: userProfile.organization || '',
        position: userProfile.position || '',
      })
    }
  }, [userProfile, profileLoading])

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handleProfileUpdate = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Profile image must be less than 5MB',
        variant: 'destructive',
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      })
      return
    }

    setProfileImageFile(file)
    setHasChanges(true)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const saveChanges = async () => {
    if (!hasChanges) return

    try {
      setIsSubmitting(true)

      // Update profile information - map form data to User type
      // Pass both profile data and optional image file
      await updateProfile(
        {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          name: `${profileData.firstName} ${profileData.lastName}`,
          email: profileData.email,
          phoneNumber: profileData.phone,
          location: profileData.location,
          aboutMe: profileData.bio,
          organization: profileData.organization,
          position: profileData.position,
        },
        profileImageFile || undefined
      )

      // Show success message
      let successMessage = 'Your profile information has been saved successfully.'
      if (profileImageFile) {
        successMessage += ' Profile image updated.'
      }

      toast({
        title: 'Profile updated',
        description: successMessage,
      })

      // Reset image selection
      setProfileImageFile(null)
      setProfileImagePreview(null)
      setHasChanges(false)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast({
        title: 'Error',
        description: `Failed to save profile changes: ${errorMessage}`,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const discardChanges = () => {
    setHasChanges(false)
    setIsEditing(false)
    setProfileImageFile(null)
    setProfileImagePreview(null)

    // Reset profile data to original values
    if (userProfile && !profileLoading) {
      setProfileData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
        phone: userProfile.phoneNumber || '',
        location: userProfile.location || '',
        bio: userProfile.aboutMe || '',
        website: '',
        organization: userProfile.organization || '',
        position: userProfile.position || '',
      })
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all password fields.',
        variant: 'destructive',
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'New password and confirmation do not match.',
        variant: 'destructive',
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive',
      })
      return
    }

    setIsChangingPassword(true)
    try {
      const { api } = await import('@/lib/api')
      await api.profile.changePassword(passwordData.currentPassword, passwordData.newPassword)

      toast({
        title: 'Password Changed Successfully',
        description: 'Your password has been updated.',
        variant: 'default',
      })

      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: unknown) {
      console.error('Password change error:', error)

      let errorTitle = 'Password Change Failed'
      let errorDescription = 'Failed to change password'

      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase()

        // Check for specific backend errors
        if (
          errorMsg.includes('securityuser') ||
          errorMsg.includes('userroles') ||
          errorMsg.includes('cast')
        ) {
          errorTitle = 'Server Configuration Error'
          errorDescription =
            'There is a backend configuration issue. Please contact support or try again later. (Error: Backend class casting issue)'
        } else if (errorMsg.includes('unauthorized') || errorMsg.includes('401')) {
          errorDescription = 'Your current password is incorrect. Please try again.'
        } else if (errorMsg.includes('500')) {
          errorTitle = 'Server Error'
          errorDescription =
            'The server encountered an error. Please try again later or contact support.'
        } else {
          errorDescription = error.message
        }
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: 'destructive',
        duration: 8000, // Show longer for server errors
      })
    } finally {
      setIsChangingPassword(false)
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
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">Settings</h1>
            <p className="text-neutral-600 mt-1">Manage your profile, security and preferences.</p>
          </div>
        </div>

        {hasChanges && (
          <Alert className="border-amber-200/80 bg-amber-50/80 text-amber-900 mb-8">
            <AlertDescription>
              You have unsaved changes. Don&apos;t forget to save before navigating away.
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
              <SelectItem value="security">Security</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden md:block">
          <TabsList className="grid w-full grid-cols-2 max-w-xl mb-8">
            <TabsTrigger value="profile">
              <UserIcon className="w-4 h-4 mr-2" /> Profile
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
                    <AvatarImage src={profileImagePreview || userProfile?.avatar} />
                    <AvatarFallback className="bg-brand-secondary text-brand-primary text-2xl font-bold">
                      {getInitials(userProfile?.name || '')}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <>
                      <input
                        type="file"
                        id="profile-image-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <Button
                        size="icon"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                        onClick={() => document.getElementById('profile-image-upload')?.click()}
                        type="button"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-neutral-800">Profile Picture</h3>
                  <p className="text-sm text-neutral-600">
                    Upload a photo to personalize your account. Max size: 5MB
                  </p>
                  {profileImageFile && (
                    <p className="text-xs text-green-600 mt-1">
                      New image selected: {profileImageFile.name}
                    </p>
                  )}
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
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="+255 xxx xxx xxx"
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
                    <Label htmlFor="position">Position (Optional)</Label>
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
                <Label htmlFor="bio">About Me / Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell others about yourself..."
                />
              </div>

              {/* Action Buttons */}
              {hasChanges && (
                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={discardChanges}>
                    Discard
                  </Button>
                  <Button onClick={saveChanges} disabled={isSubmitting}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}

              {/* Seller Information Section */}
              {userProfile &&
                (userProfile.totalListings > 0 || userProfile.specialties?.length) && (
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
                          {userProfile.specialties?.map((specialty: string) => (
                            <Badge key={specialty} variant="outline">
                              {specialty}
                            </Badge>
                          )) || (
                            <span className="text-sm text-neutral-500">No specialties set</span>
                          )}
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

        {/* Security Settings */}
        <div className={activeTab === 'security' ? 'block' : 'hidden'}>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <p className="text-sm text-neutral-500">Manage your account security settings.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handlePasswordChange}>
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
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        className="h-11"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                        }
                        required
                        minLength={8}
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        Must be at least 8 characters long
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        className="h-11"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        {showPassword ? 'Hide' : 'Show'} passwords
                      </Button>
                    </div>
                    <Button
                      type="submit"
                      className="w-full sm:w-auto"
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
