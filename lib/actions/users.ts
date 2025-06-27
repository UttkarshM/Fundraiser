'use server'

import { createServerSupabaseClient } from "@/lib/supabase-server"
import { AuthResult } from "./auth"

export interface CreateUserProfileData {
  full_name?: string
  avatar_url?: string
  bio?: string
  phone?: string
  address?: string
  city?: string
  country?: string
}

export interface UpdateUserProfileData {
  full_name?: string
  avatar_url?: string
  bio?: string
  phone?: string
  address?: string
  city?: string
  country?: string
}

export interface UserProfile {
  id: string
  full_name?: string
  avatar_url?: string
  bio?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

export async function createUserProfile(profileData: CreateUserProfileData): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to create a profile'
      }
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      return {
        success: false,
        error: 'Profile already exists. Use update instead.'
      }
    }

    // Create user profile
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        ...profileData,
        is_verified: false
      })
      .select()
      .single()

    if (error) {
      console.error('Profile creation error:', error)
      return {
        success: false,
        error: 'Failed to create profile. Please try again.'
      }
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Profile creation error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

export async function getUserProfile(userId?: string): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    let targetUserId = userId
    
    // If no userId provided, get current user
    if (!targetUserId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return {
          success: false,
          error: 'You must be logged in to view profile'
        }
      }
      
      targetUserId = user.id
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', targetUserId)
      .single()

    if (error) {
      // If profile doesn't exist, create one
      if (error.code === 'PGRST116') {
        const createResult = await createUserProfile({})
        if (createResult.success) {
          return {
            success: true,
            data: createResult.data
          }
        }
      }
      
      console.error('Get profile error:', error)
      return {
        success: false,
        error: 'Profile not found'
      }
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Get profile error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while fetching the profile'
    }
  }
}

export async function updateUserProfile(updateData: UpdateUserProfileData): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to update your profile'
      }
    }

    // Update user profile
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return {
        success: false,
        error: 'Failed to update profile. Please try again.'
      }
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Profile update error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

export async function uploadAvatar(file: File): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to upload an avatar'
      }
    }

    // Validate file
    if (!file) {
      return {
        success: false,
        error: 'No file provided'
      }
    }

    // Check file size (2MB limit for avatars)
    if (file.size > 2 * 1024 * 1024) {
      return {
        success: false,
        error: 'Avatar file size must be less than 2MB'
      }
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Avatar must be an image file'
      }
    }

    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `avatar-${user.id}-${timestamp}.${fileExtension}`
    const uploadPath = `avatars/${fileName}`

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('campaign-images')
      .upload(uploadPath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Avatar upload error:', uploadError)
      return {
        success: false,
        error: 'Failed to upload avatar. Please try again.'
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('campaign-images')
      .getPublicUrl(uploadData.path)

    // Update user profile with new avatar URL
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', user.id)
      .select()
      .single()

    if (profileError) {
      console.error('Profile avatar update error:', profileError)
      return {
        success: false,
        error: 'Failed to update profile with new avatar'
      }
    }

    return {
      success: true,
      data: {
        path: uploadData.path,
        publicUrl: urlData.publicUrl,
        profile: profileData
      }
    }
  } catch (error) {
    console.error('Avatar upload error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while uploading the avatar'
    }
  }
}

export async function getUserCampaigns(userId?: string): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    let targetUserId = userId
    
    // If no userId provided, get current user
    if (!targetUserId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return {
          success: false,
          error: 'You must be logged in to view campaigns'
        }
      }
      
      targetUserId = user.id
    }

    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        user_profiles:creator_id (
          full_name,
          avatar_url
        )
      `)
      .eq('creator_id', targetUserId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get user campaigns error:', error)
      return {
        success: false,
        error: 'Failed to fetch user campaigns'
      }
    }

    return {
      success: true,
      data: data || []
    }
  } catch (error) {
    console.error('Get user campaigns error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while fetching campaigns'
    }
  }
}

export async function getUserDashboardStats(userId?: string): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    let targetUserId = userId
    
    // If no userId provided, get current user
    if (!targetUserId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return {
          success: false,
          error: 'You must be logged in to view dashboard stats'
        }
      }
      
      targetUserId = user.id
    }

    // Get user's campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, goal, current_amount, status')
      .eq('creator_id', targetUserId)

    if (campaignsError) {
      console.error('Get campaigns for stats error:', campaignsError)
      return {
        success: false,
        error: 'Failed to fetch campaign statistics'
      }
    }

    // Get user's donations made
    const { data: donations, error: donationsError } = await supabase
      .from('donations')
      .select('amount, payment_status')
      .eq('donor_id', targetUserId)
      .eq('payment_status', 'completed')

    if (donationsError) {
      console.error('Get donations for stats error:', donationsError)
      return {
        success: false,
        error: 'Failed to fetch donation statistics'
      }
    }

    // Calculate campaign stats
    const totalCampaigns = campaigns?.length || 0
    const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0
    const totalRaised = campaigns?.reduce((sum, c) => sum + (c.current_amount || 0), 0) || 0
    const totalGoal = campaigns?.reduce((sum, c) => sum + (c.goal || 0), 0) || 0

    // Calculate donation stats
    const totalDonated = donations?.reduce((sum, d) => sum + d.amount, 0) || 0
    const donationCount = donations?.length || 0

    return {
      success: true,
      data: {
        campaigns: {
          total: totalCampaigns,
          active: activeCampaigns,
          totalRaised,
          totalGoal,
          successRate: totalGoal > 0 ? (totalRaised / totalGoal) * 100 : 0
        },
        donations: {
          totalDonated,
          donationCount
        }
      }
    }
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while fetching dashboard statistics'
    }
  }
}

export async function verifyUser(userId: string): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get the current user (should be admin)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to verify users'
      }
    }

    // Note: In a real implementation, you'd check if the current user is an admin
    // For now, we'll allow any logged-in user to verify (this should be restricted)

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ is_verified: true })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('User verification error:', error)
      return {
        success: false,
        error: 'Failed to verify user. Please try again.'
      }
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('User verification error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while verifying the user'
    }
  }
}

export async function searchUsers(query: string, limit?: number): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    let searchQuery = supabase
      .from('user_profiles')
      .select('id, full_name, avatar_url, bio, is_verified')
      .or(`full_name.ilike.%${query}%,bio.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (limit) {
      searchQuery = searchQuery.limit(limit)
    }

    const { data, error } = await searchQuery

    if (error) {
      console.error('Search users error:', error)
      return {
        success: false,
        error: 'Failed to search users'
      }
    }

    return {
      success: true,
      data: data || []
    }
  } catch (error) {
    console.error('Search users error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while searching users'
    }
  }
}

