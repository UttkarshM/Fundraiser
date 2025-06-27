'use server'

import { createServerSupabaseClient } from "../supabase-server"
import { redirect } from 'next/navigation'
import { UserProfile } from './types'

export interface AuthResult {
  success: boolean
  error?: string
  data?: any
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
  confirmPassword?: string
  firstName?: string
  lastName?: string
}

export interface ResetPasswordData {
  email: string
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    if (!credentials.email || !credentials.password) {
      return {
        success: false,
        error: 'Email and password are required'
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(credentials.email)) {
      return {
        success: false,
        error: 'Please enter a valid email address'
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })

    if (error) {
      let errorMessage = 'Login failed. Please try again.'
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.'
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please try again later.'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before logging in.'
      }

      return {
        success: false,
        error: errorMessage
      }
    }

    return {
      success: true,
      data: {
        user: data.user,
        session: data.session
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

export async function signupUser(credentials: SignupCredentials): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    if (!credentials.email || !credentials.password) {
      return {
        success: false,
        error: 'Email and password are required'
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(credentials.email)) {
      return {
        success: false,
        error: 'Please enter a valid email address'
      }
    }

    if (credentials.password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters long'
      }
    }

    if (credentials.confirmPassword && credentials.password !== credentials.confirmPassword) {
      return {
        success: false,
        error: 'Passwords do not match'
      }
    }

    // Prepare user metadata
    const metadata: any = {}
    if (credentials.firstName) metadata.first_name = credentials.firstName
    if (credentials.lastName) metadata.last_name = credentials.lastName

    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: metadata
      }
    })

    if (error) {
      let errorMessage = 'Signup failed. Please try again.'
      
      if (error.message.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please try logging in instead.'
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = 'Password is too weak. Please choose a stronger password.'
      }

      return {
        success: false,
        error: errorMessage
      }
    }

    return {
      success: true,
      data: {
        user: data.user,
        session: data.session,
        message: data.user?.email_confirmed_at 
          ? 'Account created successfully!' 
          : 'Account created! Please check your email to confirm your account.'
      }
    }
  } catch (error) {
    console.error('Signup error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

export async function logoutUser(): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return {
        success: false,
        error: 'Failed to logout. Please try again.'
      }
    }

    return {
      success: true,
      data: {
        message: 'Logged out successfully'
      }
    }
  } catch (error) {
    console.error('Logout error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during logout.'
    }
  }
}

export async function getUserSession(): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()

    // Use getUser to ensure the user is authenticated with Supabase Auth server
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return {
        success: false,
        error: 'Failed to retrieve user session'
      }
    }

    if (!user) {
      return {
        success: false,
        error: 'No active session found'
      }
    }

    return {
      success: true,
      data: {
        user: user
      }
    }
  }
  catch (error) {
    console.error('Get user session error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while retrieving the session.'
    }
  }
}

export async function resetPassword(data: ResetPasswordData): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Validate input
    if (!data.email) {
      return {
        success: false,
        error: 'Email is required'
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return {
        success: false,
        error: 'Please enter a valid email address'
      }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })

    if (error) {
      return {
        success: false,
        error: 'Failed to send reset email. Please try again.'
      }
    }

    return {
      success: true,
      data: {
        message: 'Password reset email sent! Please check your inbox.'
      }
    }
  } catch (error) {
    console.error('Password reset error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

export async function updatePassword(newPassword: string): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Validate password strength
    if (newPassword.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters long'
      }
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      return {
        success: false,
        error: 'Failed to update password. Please try again.'
      }
    }

    return {
      success: true,
      data: {
        message: 'Password updated successfully'
      }
    }
  } catch (error) {
    console.error('Password update error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

export async function getCurrentUser(): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return {
        success: false,
        error: 'Failed to get user information'
      }
    }

    return {
      success: true,
      data: {
        user: user
      }
    }
  } catch (error) {
    console.error('Get current user error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred'
    }
  }
}

export async function updateProfile(profileData: {
  firstName?: string
  lastName?: string
  email?: string
}): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const updates: any = {}
    
    if (profileData.email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(profileData.email)) {
        return {
          success: false,
          error: 'Please enter a valid email address'
        }
      }
      updates.email = profileData.email
    }

    if (profileData.firstName || profileData.lastName) {
      updates.data = {}
      if (profileData.firstName) updates.data.first_name = profileData.firstName
      if (profileData.lastName) updates.data.last_name = profileData.lastName
    }

    const { error } = await supabase.auth.updateUser(updates)

    if (error) {
      let errorMessage = 'Failed to update profile. Please try again.'
      
      if (error.message.includes('User already registered')) {
        errorMessage = 'This email is already in use by another account.'
      }

      return {
        success: false,
        error: errorMessage
      }
    }

    return {
      success: true,
      data: {
        message: 'Profile updated successfully'
      }
    }
  } catch (error) {
    console.error('Profile update error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

export async function loginAction(formData: FormData) {
  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  }

  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password
  })
  
  if (!error) {
    redirect('/dashboard') // Redirect to dashboard on successful login
  } else {
    throw new Error(error.message || 'Login failed')
  }
}

export async function signupAction(formData: FormData) {
  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string
  }

  // Step 1: Create the account first
  const result = await signupUser(credentials)
  
  if (!result.success) {
    throw new Error(result.error || 'Signup failed')
  }

  // Step 2: Upload profile image if provided (now user is logged in)
  let avatarUrl = null
  const profileImageFile = formData.get('profileImage') as File
  if (profileImageFile && profileImageFile.size > 0) {
    const imageResult = await uploadProfileImages(profileImageFile)
    if (imageResult.success) {
      avatarUrl = imageResult.data.url
    }
  }

  // Step 3: Create user profile with all details including avatar
  const profileFormData = new FormData()
  profileFormData.set('Name', formData.get('Name') as string)
  profileFormData.set('Bio', formData.get('Bio') as string)
  profileFormData.set('Phone', formData.get('Phone') as string)
  profileFormData.set('Address', formData.get('Address') as string)
  profileFormData.set('City', formData.get('City') as string)
  profileFormData.set('Country', formData.get('Country') as string)
  if (avatarUrl) {
    profileFormData.set('Avatar', avatarUrl)
  }

  await insertUserProfile(profileFormData)
  redirect('/dashboard') // Redirect to dashboard after signup and profile creation
}
export async function logoutAction() {
  const supabase = await createServerSupabaseClient()
  
  // Clear the session
  await supabase.auth.signOut()
  
  // Redirect to login page
  redirect('/login')
}


export async function uploadProfileImages(file: File): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user to extract email for folder naming
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user || !user.email) {
      return {
        success: false,
        error: 'You must be logged in to upload a profile image'
      }
    }

    // Validate file
    if (!file) {
      return {
        success: false,
        error: 'No file provided'
      }
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Profile image must be an image file'
      }
    }
    
    const userEmail = user.email.replace(/[^a-zA-Z0-9]/g, '_') // Replace special chars with underscores
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `profile-images/${userEmail}/${fileName}`

    const { error } = await supabase.storage
      .from('campaign-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Profile image upload error:', error)
      return {
        success: false,
        error: 'Failed to upload image. Please try again.'
      }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('campaign-images')
      .getPublicUrl(filePath)

    return {
      success: true,
      data: {
        url: publicUrl,
        path: filePath,
        userEmail: user.email
      }
    }
  } catch (error) {
    console.error('Image upload error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during image upload.'
    }
  }
}

export async function getPublicImageUrl(filePath: string): Promise<string> {
  const supabase = await createServerSupabaseClient()
  
  const { data: { publicUrl } } = supabase.storage
    .from('campaign-images')
    .getPublicUrl(filePath)
  
  return publicUrl
}

export async function insertUserProfile(formData: FormData): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user to include user ID in profile
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to create a profile'
      }
    }

    const profileData = {
      id: user.id, // Include user ID
      full_name: formData.get('Name') as string,
      avatar_url: formData.get('Avatar') as string,
      bio: formData.get('Bio') as string,
      phone: formData.get('Phone') as string,
      address: formData.get('Address') as string,
      city: formData.get('City') as string,
      country: formData.get('Country') as string
    }
  
    const { data, error } = await supabase.from('user_profiles').insert([profileData]).select().single()

    if (error) {
      console.error('Profile creation error:', error)
      return {
        success: false,
        error: error.message || 'Failed to create user profile'
      }
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Insert profile error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while creating the profile'
    }
  }
}