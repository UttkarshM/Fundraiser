'use server'

import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

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
    const supabase = createClient()
    
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
    const supabase = createClient()
    
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
    const supabase = createClient()
    
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

export async function resetPassword(data: ResetPasswordData): Promise<AuthResult> {
  try {
    const supabase = createClient()
    
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
    const supabase = createClient()
    
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
    const supabase = createClient()
    
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
    const supabase = createClient()
    
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

  const result = await loginUser(credentials)
  
  if (result.success) {
    redirect('/dashboard') // Redirect to dashboard on successful login
  } else {
    throw new Error(result.error || 'Login failed')
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

  const result = await signupUser(credentials)
  
  if (result.success) {
    redirect('/auth/verify-email') // Redirect to email verification page
  } else {
    throw new Error(result.error || 'Signup failed')
  }
}

export async function logoutAction() {
  const result = await logoutUser()
  
  if (result.success) {
    redirect('/auth/login')
  } else {
    throw new Error(result.error || 'Logout failed')
  }
}

