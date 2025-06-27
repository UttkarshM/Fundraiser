"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  LogOut, 
  Settings, 
  Shield, 
  Bell, 
  Lock,
  Heart,
  BarChart3,
  PlusCircle,
  DollarSign,
  TrendingUp,
  Camera,
  Loader2,
  CheckCircle,
  AlertCircle,
  Edit
} from "lucide-react"
import Link from "next/link"
import { logoutAction, getCurrentUser, updateProfile } from "@/lib/actions/auth"
import { getUserProfile, updateUserProfile, uploadAvatar } from "@/lib/actions/users"
import { createClient } from "@/lib/supabase"

const sidebarItems = [
  {title: "Dashboard", icon: BarChart3, href: "/dashboard"},
  { title: "Campaigns", icon: BarChart3, href: "/causes" },
  { title: "Create Campaign", icon: PlusCircle, href: "/create-campaign" },
  { title: "Donations", icon: DollarSign, href: "/donations" },
  { title: "Sentiment", icon: TrendingUp, href: "/sentiment" },
  { title: "Settings", icon: Settings, href: "/settings", active: true },
]

function AppSidebar() {
  return (
    <Sidebar className="border-r-0 bg-white/50 backdrop-blur">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-4 mb-6 text-lg font-semibold text-gray-900 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3">
              <Heart className="w-5 h-5 text-white" />
            </div>
            FundRaise
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2 mt-4">
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={`rounded-xl ${item.active ? 'bg-blue-100 text-blue-700' : ''}`}>
                    <Link href={item.href} className="flex items-center space-x-3 px-4 py-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const userResult = await getCurrentUser()
      if (userResult.success) {
        setUser(userResult.data.user)
      }

      const profileResult = await getUserProfile()
      if (profileResult.success) {
        setProfile(profileResult.data)
        if (profileResult.data.avatar_url) {
          setProfileImage(profileResult.data.avatar_url)
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    setError("")
    
    try {
      // Use client-side logout
      const supabase = createClient()
      await supabase.auth.signOut()
      
      // Force redirect to login page
      window.location.href = '/login'
    } catch (error) {
      setError(error instanceof Error ? error.message : "Logout failed")
      setLoggingOut(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB')
      return
    }

    setUploadingImage(true)
    setError("")

    try {
      const result = await uploadAvatar(file)
      if (result.success) {
        setProfileImage(result.data.publicUrl)
        setProfile({ ...profile, avatar_url: result.data.publicUrl })
        setSuccess('Profile image updated successfully!')
      } else {
        setError(result.error || 'Failed to upload image')
      }
    } catch (error) {
      setError('An error occurred while uploading the image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleProfileUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    const formData = new FormData(event.currentTarget)
    
    try {
      const updateData = {
        full_name: formData.get('fullName') as string,
        bio: formData.get('bio') as string,
        phone: formData.get('phone') as string,
        address: formData.get('address') as string,
        city: formData.get('city') as string,
        country: formData.get('country') as string,
      }

      const result = await updateUserProfile(updateData)
      if (result.success) {
        setProfile({ ...profile, ...updateData })
        setSuccess('Profile updated successfully!')
      } else {
        setError(result.error || 'Failed to update profile')
      }
    } catch (error) {
      setError('An error occurred while updating the profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="p-10">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-6">
              <SidebarTrigger />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-600">Manage your account preferences and profile</p>
              </div>
            </div>
            <Button 
              onClick={handleLogout}
              disabled={loggingOut}
              variant="outline"
              className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
            >
              {loggingOut ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="text-red-500 flex items-center mb-6 p-4 bg-red-50 rounded-xl">
              <AlertCircle className="mr-2 w-5 h-5" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="text-green-500 flex items-center mb-6 p-4 bg-green-50 rounded-xl">
              <CheckCircle className="mr-2 w-5 h-5" />
              {success}
            </div>
          )}

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-white shadow-lg p-1">
              <TabsTrigger value="profile" className="rounded-xl">
                Profile
              </TabsTrigger>
              <TabsTrigger value="account" className="rounded-xl">
                Account
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-xl">
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-xl">
                Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="rounded-3xl shadow-lg border-0 bg-white">
                <CardHeader className="pb-6 pt-8 px-8">
                  <CardTitle className="text-xl font-semibold text-gray-900">Profile Information</CardTitle>
                  <CardDescription className="text-gray-600">
                    Update your personal information and profile picture
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    {/* Profile Picture Section */}
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <Avatar className="w-24 h-24">
                          <AvatarImage src={profileImage || ""} alt="Profile" />
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xl">
                            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <button
                          type="button"
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                          className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                          disabled={uploadingImage}
                        >
                          {uploadingImage ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4" />
                          )}
                        </button>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
                        <p className="text-sm text-gray-500">Upload a new profile picture (max 2MB)</p>
                        {profile?.is_verified && (
                          <Badge className="mt-2 bg-green-100 text-green-800">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-gray-700 font-medium">
                          Full Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="fullName"
                            name="fullName"
                            type="text"
                            placeholder="Your full name"
                            className="pl-10 rounded-xl border-gray-200 h-12"
                            defaultValue={profile?.full_name || ""}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 font-medium">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="Your email"
                            className="pl-10 rounded-xl border-gray-200 h-12 bg-gray-50"
                            value={user?.email || ""}
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-gray-700 font-medium">
                        Bio
                      </Label>
                      <Input
                        id="bio"
                        name="bio"
                        type="text"
                        placeholder="Tell us about yourself"
                        className="rounded-xl border-gray-200 h-12"
                        defaultValue={profile?.bio || ""}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-700 font-medium">
                          Phone Number
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="Your phone number"
                            className="pl-10 rounded-xl border-gray-200 h-12"
                            defaultValue={profile?.phone || ""}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-gray-700 font-medium">
                          City
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="city"
                            name="city"
                            type="text"
                            placeholder="Your city"
                            className="pl-10 rounded-xl border-gray-200 h-12"
                            defaultValue={profile?.city || ""}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-gray-700 font-medium">
                          Country
                        </Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="country"
                            name="country"
                            type="text"
                            placeholder="Your country"
                            className="pl-10 rounded-xl border-gray-200 h-12"
                            defaultValue={profile?.country || ""}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-gray-700 font-medium">
                          Address
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="address"
                            name="address"
                            type="text"
                            placeholder="Your address"
                            className="pl-10 rounded-xl border-gray-200 h-12"
                            defaultValue={profile?.address || ""}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-8 py-3"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Edit className="w-4 h-4 mr-2" />
                            Update Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <Card className="rounded-3xl shadow-lg border-0 bg-white">
                <CardHeader className="pb-6 pt-8 px-8">
                  <CardTitle className="text-xl font-semibold text-gray-900">Account Settings</CardTitle>
                  <CardDescription className="text-gray-600">
                    Manage your account preferences and settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-900">Account Status</h3>
                        <p className="text-sm text-gray-500">Your account is active and in good standing</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-900">Email Verification</h3>
                        <p className="text-sm text-gray-500">Your email address has been verified</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="rounded-3xl shadow-lg border-0 bg-white">
                <CardHeader className="pb-6 pt-8 px-8">
                  <CardTitle className="text-xl font-semibold text-gray-900">Security Settings</CardTitle>
                  <CardDescription className="text-gray-600">
                    Manage your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Lock className="w-5 h-5 text-gray-400" />
                        <div>
                          <h3 className="font-medium text-gray-900">Password</h3>
                          <p className="text-sm text-gray-500">Last updated 30 days ago</p>
                        </div>
                      </div>
                      <Button variant="outline" className="rounded-xl">
                        Change Password
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="rounded-3xl shadow-lg border-0 bg-white">
                <CardHeader className="pb-6 pt-8 px-8">
                  <CardTitle className="text-xl font-semibold text-gray-900">Notification Preferences</CardTitle>
                  <CardDescription className="text-gray-600">
                    Choose how you want to be notified about campaign updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Bell className="w-5 h-5 text-gray-400" />
                        <div>
                          <h3 className="font-medium text-gray-900">Email Notifications</h3>
                          <p className="text-sm text-gray-500">Receive updates about your campaigns via email</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

