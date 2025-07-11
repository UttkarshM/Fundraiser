'use server'

import { createServerSupabaseClient } from "@/lib/supabase-server"
import { AuthResult } from "./auth"

export interface CreateCampaignData {
  title: string
  goal: number
  description: string
  image_url?: string
  category?: string
  end_date?: string
}

export interface UpdateCampaignData {
  title?: string
  goal?: number
  description?: string
  image_url?: string
  category?: string
  status?: 'active' | 'paused' | 'completed' | 'cancelled'
  end_date?: string
}

export interface CampaignTable {
  id: string;
  title: string;
  description: string;
  goal: number;
  current_amount: number;
  image_url: string | null;
  category: string | null;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  featured: boolean;
  creator_id: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface FileWithPath {
  file: File
  path?: string
}

export async function createCampaign(campaignData: CreateCampaignData): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to create a campaign'
      }
    }

    // Validate required fields
    if (!campaignData.title || !campaignData.description || !campaignData.goal) {
      return {
        success: false,
        error: 'Title, description, and goal are required'
      }
    }

    if (campaignData.goal <= 0) {
      return {
        success: false,
        error: 'Goal must be greater than 0'
      }
    }

    // Create campaign
    const { data, error } = await supabase
      .from('campaigns_table')
      .insert({
        ...campaignData,
        creator_id: user.id,
        current_amount: 0,
        status: 'active',
        featured: false
      })
      .select()
      .single()

    if (error) {
      console.error('Campaign creation error:', error)
      return {
        success: false,
        error: 'Failed to create campaign. Please try again.'
      }
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Campaign creation error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

export async function getUserCampaigns(): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to view your campaigns'
      }
    }

    const { data, error } = await supabase
      .from('campaigns_table')
      .select(`
        *,
        user_profiles:creator_id (
          full_name,
          avatar_url
        )
      `)
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get user campaigns error:', error)
      return {
        success: false,
        error: 'Failed to fetch your campaigns'
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
      error: 'An unexpected error occurred while fetching your campaigns'
    }
  }
}

export async function getCampaigns(filters?: {
  category?: string
  status?: string
  featured?: boolean
  creator_id?: string
  limit?: number
  offset?: number
}): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    let query = supabase
      .from('campaigns_table')
      .select(`
        *,
        user_profiles:creator_id (
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.featured !== undefined) {
      query = query.eq('featured', filters.featured)
    }
    if (filters?.creator_id) {
      query = query.eq('creator_id', filters.creator_id)
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Get campaigns error:', error)
      return {
        success: false,
        error: 'Failed to fetch campaigns'
      }
    }
    if (!data || data.length === 0) {
      return {
        success: true,
        data: []
      }
    }
    return {
      success: true,
      data: data || []
    }
  } catch (error) {
    console.error('Get campaigns error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while fetching campaigns'
    }
  }
}

export async function getCampaignById(id: string): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('campaigns_table')
      .select(`
        *,
        user_profiles:creator_id (
          full_name,
          avatar_url,
          bio
        ),
        donations:donations!campaign_id (
          id,
          amount,
          message,
          is_anonymous,
          created_at,
          user_profiles:donor_id (
            full_name,
            avatar_url
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Get campaign error:', error)
      return {
        success: false,
        error: 'Campaign not found'
      }
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Get campaign error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while fetching the campaign'
    }
  }
}

export async function updateCampaign(id: string, updateData: UpdateCampaignData): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to update a campaign'
      }
    }

    // Check if user owns the campaign
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns_table')
      .select('creator_id')
      .eq('id', id)
      .single()

    if (fetchError || !campaign) {
      return {
        success: false,
        error: 'Campaign not found'
      }
    }

    if (campaign.creator_id !== user.id) {
      return {
        success: false,
        error: 'You can only update your own campaigns'
      }
    }

    // Validate goal if provided
    if (updateData.goal !== undefined && updateData.goal <= 0) {
      return {
        success: false,
        error: 'Goal must be greater than 0'
      }
    }

    const { data, error } = await supabase
      .from('campaigns_table')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Campaign update error:', error)
      return {
        success: false,
        error: 'Failed to update campaign. Please try again.'
      }
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Campaign update error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

export async function deleteCampaign(id: string): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to delete a campaign'
      }
    }

    // Check if user owns the campaign
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns_table')
      .select('creator_id, current_amount')
      .eq('id', id)
      .single()

    if (fetchError || !campaign) {
      return {
        success: false,
        error: 'Campaign not found'
      }
    }

    if (campaign.creator_id !== user.id) {
      return {
        success: false,
        error: 'You can only delete your own campaigns'
      }
    }

    // Don't allow deletion if campaign has received donations
    if (campaign.current_amount > 0) {
      return {
        success: false,
        error: 'Cannot delete a campaign that has received donations. You can pause it instead.'
      }
    }

    const { error } = await supabase
      .from('campaigns_table')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Campaign deletion error:', error)
      return {
        success: false,
        error: 'Failed to delete campaign. Please try again.'
      }
    }

    return {
      success: true,
      data: { message: 'Campaign deleted successfully' }
    }
  } catch (error) {
    console.error('Campaign deletion error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

export async function uploadCampaignImage(file: File, path?: string): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to upload images'
      }
    }

    // Validate file
    if (!file) {
      return {
        success: false,
        error: 'No file provided'
      }
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: 'File size must be less than 5MB'
      }
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'File must be an image'
      }
    }

    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = path || `campaign-${user.id}-${timestamp}.${fileExtension}`
    const uploadPath = `uploads/${fileName}`

    const { data, error } = await supabase.storage
      .from('campaign-images')
      .upload(uploadPath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (error) {
      console.error('Image upload error:', error)
      return {
        success: false,
        error: 'Failed to upload image. Please try again.'
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('campaign-images')
      .getPublicUrl(data.path)

    return {
      success: true,
      data: {
        path: data.path,
        publicUrl: urlData.publicUrl
      }
    }
  } catch (error) {
    console.error('Image upload error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while uploading the image'
    }
  }
}

export async function searchCampaigns(query: string, filters?: {
  category?: string
  limit?: number
}): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    let searchQuery = supabase
      .from('campaigns_table')
      .select(`
        *,
        user_profiles:creator_id (
          full_name,
          avatar_url
        )
      `)
      .eq('status', 'active')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (filters?.category) {
      searchQuery = searchQuery.eq('category', filters.category)
    }
    
    if (filters?.limit) {
      searchQuery = searchQuery.limit(filters.limit)
    }

    const { data, error } = await searchQuery

    if (error) {
      console.error('Search campaigns error:', error)
      return {
        success: false,
        error: 'Failed to search campaigns'
      }
    }

    return {
      success: true,
      data: data || []
    }
  } catch (error) {
    console.error('Search campaigns error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while searching campaigns'
    }
  }
}

export async function updateCampaignCurrentAmount(campaignId: string, newAmount: number): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('campaigns_table')
      .update({ current_amount: newAmount })
      .eq('id', campaignId)
      .select()
      .single()

    if (error) {
      console.error('Update campaign current amount error:', error)
      return {
        success: false,
        error: 'Failed to update campaign amount'
      }
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Update campaign current amount error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while updating campaign amount'
    }
  }
}

export async function updateCampaignWithTotalDonations(campaignId: string): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()

    // Calculate total donations amount
    const { data: donations, error: donationsError } = await supabase
      .from('donations')
      .select('amount')
      .eq('campaign_id', campaignId)
      .eq('payment_status', 'completed')

    if (donationsError) {
      return {
        success: false,
        error: 'Failed to fetch donations'
      }
    }

    const totalDonationsAmount = donations.reduce((sum, donation) => sum + donation.amount, 0)

    // Update the campaign with the new total amount
    const { data, error } = await supabase
      .from('campaigns_table')
      .update({ current_amount: totalDonationsAmount })
      .eq('id', campaignId)
      .select()
      .single()

    if (error) {
      console.error('Update campaign current amount error:', error)
      return {
        success: false,
        error: 'Failed to update campaign amount'
      }
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Update campaign with total donations error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while updating campaign amount'
    }
  }
}

export async function addDonationToCampaign(campaignId: string, donationAmount: number): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // First get the current amount
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns_table')
      .select('current_amount')
      .eq('id', campaignId)
      .single()

    if (fetchError || !campaign) {
      return {
        success: false,
        error: 'Campaign not found'
      }
    }

    const newCurrentAmount = campaign.current_amount + donationAmount

    const { data, error } = await supabase
      .from('campaigns_table')
      .update({ current_amount: newCurrentAmount })
      .eq('id', campaignId)
      .select()
      .single()

    if (error) {
      console.error('Add donation to campaign error:', error)
      return {
        success: false,
        error: 'Failed to update campaign amount'
      }
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Add donation to campaign error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while updating campaign amount'
    }
  }
}

export async function syncAllCampaignAmounts(): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns_table')
      .select('id')

    if (campaignsError) {
      return {
        success: false,
        error: 'Failed to fetch campaigns'
      }
    }

    let updatedCount = 0
    const errors = []

    // Update each campaign
    for (const campaign of campaigns) {
      const result = await updateCampaignWithTotalDonations(campaign.id)
      if (result.success) {
        updatedCount++
      } else {
        errors.push(`Campaign ${campaign.id}: ${result.error}`)
      }
    }

    return {
      success: true,
      data: {
        message: `Updated ${updatedCount} campaigns`,
        errors: errors.length > 0 ? errors : undefined
      }
    }
  } catch (error) {
    console.error('Sync all campaign amounts error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while syncing campaign amounts'
    }
  }
}

export async function getCampaignRevenue(campaignId: string): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('donations')
      .select('amount')
      .eq('campaign_id', campaignId)

    if (error) {
      console.error('Get campaign revenue error:', error)
      return {
        success: false,
        error: 'Failed to fetch campaign revenue'
      }
    }

    const totalRevenue = data.reduce((sum, donation) => sum + donation.amount, 0)

    return {
      success: true,
      data: { totalRevenue }
    }
  } catch (error) {
    console.error('Get campaign revenue error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while fetching campaign revenue'
    }
  }
}
