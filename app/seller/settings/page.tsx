"use client"

import { useState } from "react"
import { User, Mail, Phone, Bell, Shield, Eye, EyeOff, Save, ArrowLeft, Camera, Edit, Plus, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SellerLayout from "@/components/seller-layout"

export default function SellerSettings() {
  const [activeTab, setActiveTab] = useState("profile")
  const [showPassword, setShowPassword] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Profile data
  const [profileData, setProfileData] = useState({
    firstName: "Tech",
    lastName: "Expat",
    email: "techexpat@example.com",
    phone: "+971 50 123 4567",
    location: "Dubai, UAE",
    bio: "Experienced tech professional selling quality electronics and gadgets. All items are well-maintained and come with original accessories.",
    website: "https://techexpat.com",
    languages: ["English", "Arabic"],
    memberSince: "2023",
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailMessages: true,
    emailOffers: true,
    emailMarketing: false,
    pushMessages: true,
    pushOffers: false,
    smsImportant: true,
    smsMarketing: false,
  })

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    showEmail: false,
    showPhone: true,
    showLastSeen: true,
    allowMessages: true,
    showProfile: true,
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

  const saveChanges = () => {
    // Here you would typically save to your backend
    console.log("Saving changes...")
    setHasChanges(false)
    setIsEditing(false)
  }

  const discardChanges = () => {
    // Reset to original values
    setHasChanges(false)
    setIsEditing(false)
  }

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
          <Alert className="border-amber-200/80 bg-amber-50/80 text-amber-900">
            <AlertDescription>You have unsaved changes. Don't forget to save before navigating away.</AlertDescription>
          </Alert>
        )}

        {/* Mobile Tab Navigation */}
        <div className="md:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profile">Profile</SelectItem>
              <SelectItem value="notifications">Notifications</SelectItem>
              <SelectItem value="privacy">Privacy</SelectItem>
              <SelectItem value="security">Security</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden md:block">
          <TabsList className="grid w-full grid-cols-4 max-w-xl">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" /> Profile
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
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-2 border-white shadow-lg">
                    <AvatarImage src="/images/seller-avatar-2.jpg" />
                    <AvatarFallback className="bg-brand-secondary text-brand-primary text-2xl font-bold">TE</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button size="icon" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full">
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-neutral-800">Profile Picture</h3>
                  <p className="text-sm text-neutral-600">Upload a professional photo to build trust with buyers.</p>
                  {isEditing && (
                    <div className="flex gap-2 mt-2 justify-center sm:justify-start">
                      <Button variant="outline" size="sm">
                        Upload New
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => handleProfileUpdate("firstName", e.target.value)}
                    disabled={!isEditing}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => handleProfileUpdate("lastName", e.target.value)}
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
                      onChange={(e) => handleProfileUpdate("email", e.target.value)}
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
                    onChange={(e) => handleProfileUpdate("phone", e.target.value)}
                    disabled={!isEditing}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => handleProfileUpdate("location", e.target.value)}
                    disabled={!isEditing}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    value={profileData.website}
                    onChange={(e) => handleProfileUpdate("website", e.target.value)}
                    disabled={!isEditing}
                    placeholder="https://your-website.com"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">About Me / Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleProfileUpdate("bio", e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell buyers about yourself and what you sell..."
                />
              </div>
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
                      <p className="text-sm text-neutral-600">Get notified when you receive a new message.</p>
                    </div>
                    <Switch
                      id="emailMessages"
                      checked={notifications.emailMessages}
                      onCheckedChange={(val) => handleNotificationUpdate("emailMessages", val)}
                    />
                  </div>
                   <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="emailOffers">Offers & Updates</Label>
                      <p className="text-sm text-neutral-600">Receive offers on your items and important updates.</p>
                    </div>
                    <Switch
                      id="emailOffers"
                      checked={notifications.emailOffers}
                      onCheckedChange={(val) => handleNotificationUpdate("emailOffers", val)}
                    />
                  </div>
                   <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="emailMarketing">Marketing & Promotions</Label>
                      <p className="text-sm text-neutral-600">Get emails about new features and promotions.</p>
                    </div>
                    <Switch
                      id="emailMarketing"
                      checked={notifications.emailMarketing}
                      onCheckedChange={(val) => handleNotificationUpdate("emailMarketing", val)}
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
                  <p className="text-sm text-neutral-600">Allow other users to see your email address.</p>
                </div>
                <Switch
                  id="showEmail"
                  checked={privacy.showEmail}
                  onCheckedChange={(val) => handlePrivacyUpdate("showEmail", val)}
                />
              </div>
               <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="showPhone">Show phone number on profile</Label>
                  <p className="text-sm text-neutral-600">Allow other users to see your phone number.</p>
                </div>
                <Switch
                  id="showPhone"
                  checked={privacy.showPhone}
                  onCheckedChange={(val) => handlePrivacyUpdate("showPhone", val)}
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
                <Label htmlFor="currentPassword">Change Password</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <Input type="password" placeholder="Current Password" />
                  <Input type={showPassword ? "text" : "password"} placeholder="New Password" />
                </div>
                 <Button variant="outline" className="mt-4">Update Password</Button>
              </div>

               <div className="p-4 border rounded-lg">
                 <Label>Two-Factor Authentication (2FA)</Label>
                 <p className="text-sm text-neutral-600 mt-1 mb-4">Add an extra layer of security to your account.</p>
                 <Button>Enable 2FA</Button>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SellerLayout>
  )
}
