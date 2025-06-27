
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Mail, Lock, User, Building, Loader2, AlertCircle, CheckCircle, Phone, MapPin, Globe, Camera, Upload } from "lucide-react"
import { loginUser, signupAction, LoginCredentials, AuthResult } from "@/lib/actions"
import Link from "next/link"

export function LoginPage() {
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("login")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError("")
    setSuccess("")
    
    const LoginData : LoginCredentials = {
      email: loginData.email,
      password: loginData.password,
    }
    const response: AuthResult = await loginUser(LoginData);
    const { success, error } = response;
    setLoading(false)
    
    if (success) {
      setSuccess("Login successful! Redirecting...")
      window.location.href = "/dashboard"
    } else {
      setError(error || "Login failed")
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('File selected:', file.name, file.type, file.size)

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setProfileImageFile(file)
    const previewUrl = URL.createObjectURL(file)
    setProfileImage(previewUrl)
    setSuccess('Profile image selected successfully!')
  }

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    
    const formData = new FormData(event.currentTarget)
    
    // Add the profile image file to the form data
    if (profileImageFile) {
      formData.set('profileImage', profileImageFile)
    }
    
    try {
      await signupAction(formData)
      setSuccess("Registration successful! Please check your email for verification.")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className={`w-full ${activeTab === 'register' ? 'max-w-4xl' : 'max-w-md'} transition-all duration-300`}>
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl">FundRaise</span>
          </Link>
          <p className="text-gray-600">Welcome back to your fundraising platform</p>
        </div>

        <Card className="rounded-3xl shadow-xl border-0 bg-white/80 backdrop-blur">
          {activeTab === 'register' && (
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">Get Started</CardTitle>
              <CardDescription className="text-gray-600">Sign in to your account or create a new one</CardDescription>
            </CardHeader>
          )}
          <CardContent>
            <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-gray-100 p-1">
                <TabsTrigger value="login" className="rounded-xl">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-xl">
                  Register
                </TabsTrigger>
              </TabsList>

                <TabsContent value="login" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-gray-700 font-medium">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10 rounded-xl border-gray-200 h-12"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-gray-700 font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10 rounded-xl border-gray-200 h-12"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        />
                      </div>
                    </div>
                    {error && (
                      <div className="text-red-500 flex items-center mt-2">
                        <AlertCircle className="mr-2 w-5 h-5" />
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="text-green-500 flex items-center mt-2">
                        <CheckCircle className="mr-2 w-5 h-5" />
                        {success}
                      </div>
                    )}
                    {loading ? (
                      <Button disabled className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl h-12 text-base font-medium flex items-center justify-center">
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                        Processing...
                      </Button>
                    ) : (
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl h-12 text-base font-medium" onClick={handleLogin}>
                        Sign In
                      </Button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="register" className="space-y-4 mt-6">
                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* Profile Picture Upload */}
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div 
                          className={`group w-24 h-24 rounded-full ${profileImage ? 'border-2 border-gray-200' : 'bg-gray-100 border-2 border-dashed border-gray-300'} flex items-center justify-center cursor-pointer hover:opacity-90 transition-all relative overflow-hidden`}
                          onClick={() => document.getElementById('profile-image-upload')?.click()}
                        >
                          {profileImage ? (
                            <>
                              <img 
                                src={profileImage} 
                                alt="Profile" 
                                className="w-full h-full rounded-full object-cover"
                              />
                              {/* Upload overlay */}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full flex items-center justify-center transition-all duration-200">
                                <Upload className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                              </div>
                            </>
                          ) : (
                            <div className="text-center">
                              {uploadingImage ? (
                                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                              ) : (
                                <>
                                  <Camera className="w-8 h-8 text-gray-400 mb-1" />
                                  <p className="text-xs text-gray-500">Add Photo</p>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        <input
                          id="profile-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="space-y-6">
                      {/* Name Row */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-gray-700 font-medium">
                            First Name
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="firstName"
                              name="firstName"
                              type="text"
                              placeholder="First name"
                              className="pl-10 rounded-xl border-gray-200 h-12"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-gray-700 font-medium">
                            Last Name
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="lastName"
                              name="lastName"
                              type="text"
                              placeholder="Last name"
                              className="pl-10 rounded-xl border-gray-200 h-12"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Email and Display Name Row */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-gray-700 font-medium">
                            Email
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="Enter your email"
                              className="pl-10 rounded-xl border-gray-200 h-12"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="Name" className="text-gray-700 font-medium">
                            Display Name
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="Name"
                              name="Name"
                              type="text"
                              placeholder="How you want to be displayed"
                              className="pl-10 rounded-xl border-gray-200 h-12"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Password Row */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-gray-700 font-medium">
                            Password
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="password"
                              name="password"
                              type="password"
                              placeholder="Create a password"
                              className="pl-10 rounded-xl border-gray-200 h-12"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                            Confirm Password
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              placeholder="Confirm your password"
                              className="pl-10 rounded-xl border-gray-200 h-12"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Profile Information */}
                      <div className="border-t pt-6 mt-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Profile Information (Optional)</h4>
                        
                        {/* Contact Information Row */}
                        <div className="space-y-2 mb-6">
                          <Label htmlFor="Phone" className="text-gray-700 font-medium">
                            Phone Number
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="Phone"
                              name="Phone"
                              type="tel"
                              placeholder="Your phone number"
                              className="pl-10 rounded-xl border-gray-200 h-12"
                            />
                          </div>
                        </div>

                        {/* Location Row */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                          <div className="space-y-2">
                            <Label htmlFor="City" className="text-gray-700 font-medium">
                              City
                            </Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="City"
                                name="City"
                                type="text"
                                placeholder="Your city"
                                className="pl-10 rounded-xl border-gray-200 h-12"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="Country" className="text-gray-700 font-medium">
                              Country
                            </Label>
                            <div className="relative">
                              <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="Country"
                                name="Country"
                                type="text"
                                placeholder="Your country"
                                className="pl-10 rounded-xl border-gray-200 h-12"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Address and Bio Row */}
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="Address" className="text-gray-700 font-medium">
                              Address
                            </Label>
                            <div className="relative">
                              <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="Address"
                                name="Address"
                                type="text"
                                placeholder="Your address"
                                className="pl-10 rounded-xl border-gray-200 h-12"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="Bio" className="text-gray-700 font-medium">
                              Bio
                            </Label>
                            <Input
                              id="Bio"
                              name="Bio"
                              type="text"
                              placeholder="Tell us about yourself"
                              className="rounded-xl border-gray-200 h-12"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="text-red-500 flex items-center mt-2">
                        <AlertCircle className="mr-2 w-5 h-5" />
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="text-green-500 flex items-center mt-2">
                        <CheckCircle className="mr-2 w-5 h-5" />
                        {success}
                      </div>
                    )}
                    {loading ? (
                      <Button disabled className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl h-12 text-base font-medium flex items-center justify-center">
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                        Creating Account...
                      </Button>
                    ) : (
                      <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl h-12 text-base font-medium">
                        Create Account
                      </Button>
                    )}
                  </form>
                </TabsContent>
            </Tabs>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}