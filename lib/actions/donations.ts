'use server'

import { createServerSupabaseClient } from "@/lib/supabase-server"
import { AuthResult } from "./auth"
import { updateCampaignWithTotalDonations } from "./campaigns"

export interface CreateDonationData {
  campaign_id: string
  amount: number
  message?: string
  is_anonymous?: boolean
  payment_method?: string
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
}

export interface Donation {
  id: string
  campaign_id: string
  donor_id: string
  amount: number
  message?: string
  is_anonymous: boolean
  payment_method?: string
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  transaction_id?: string
  created_at: string
}

export async function createDonation(donationData: CreateDonationData): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to make a donation'
      }
    }

    if (!donationData.campaign_id || !donationData.amount) {
      return {
        success: false,
        error: 'Campaign ID and amount are required'
      }
    }

    if (donationData.amount <= 0) {
      return {
        success: false,
        error: 'Donation amount must be greater than 0'
      }
    }

    // Check if campaign exists and is active
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns_table')
      .select('id, status, creator_id')
      .eq('id', donationData.campaign_id)
      .single()

    if (campaignError || !campaign) {
      return {
        success: false,
        error: 'Campaign not found'
      }
    }

    if (campaign.status !== 'active') {
      return {
        success: false,
        error: 'This campaign is no longer accepting donations'
      }
    }

    // Don't allow users to donate to their own campaigns
    // if (campaign.creator_id === user.id) {
    //   return {
    //     success: false,
    //     error: 'You cannot donate to your own campaign'
    //   }
    // }

    // Create donation record
    const { data, error } = await supabase
      .from('donations')
      .insert({
        ...donationData,
        donor_id: user.id,
        payment_status: donationData.payment_status || 'completed', // Use provided status or default to completed
        is_anonymous: donationData.is_anonymous || false
      })
      .select()
      .single()

    if (error) {
      console.error('Donation creation error:', error)
      return {
        success: false,
        error: 'Failed to create donation. Please try again.'
      }
    }

    // Update campaign's current amount based on total donations
    const updateResult = await updateCampaignWithTotalDonations(donationData.campaign_id)
    if (!updateResult.success) {
      console.error('Failed to update campaign amount:', updateResult.error)
      return {
        success: false,
        error: 'Donation created but failed to update campaign amount'
      }
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Donation creation error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

export async function updateDonationStatus(
  donationId: string, 
  status: 'completed' | 'failed' | 'refunded',
  transactionId?: string
): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const updateData: any = { payment_status: status }
    if (transactionId) {
      updateData.transaction_id = transactionId
    }

    const { data, error } = await supabase
      .from('donations')
      .update(updateData)
      .eq('id', donationId)
      .select()
      .single()

    if (error) {
      console.error('Donation status update error:', error)
      return {
        success: false,
        error: 'Failed to update donation status'
      }
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Donation status update error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while updating donation status'
    }
  }
}

export async function getDonationsByUser(userId?: string): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    let targetUserId = userId
    
    // If no userId provided, get current user
    if (!targetUserId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return {
          success: false,
          error: 'You must be logged in to view donations'
        }
      }
      
      targetUserId = user.id
    }

    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        campaigns_table:campaign_id (
          id,
          title,
          image_url,
          creator_id,
          user_profiles:creator_id (
            full_name
          )
        )
      `)
      .eq('donor_id', targetUserId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get user donations error:', error)
      return {
        success: false,
        error: 'Failed to fetch donations'
      }
    }

    return {
      success: true,
      data: data || []
    }
  } catch (error) {
    console.error('Get user donations error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while fetching donations'
    }
  }
}

export async function getDonationsByCampaign(campaignId: string, includeAnonymous: boolean = false): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    let query = supabase
      .from('donations')
      .select(`
        *,
        user_profiles:donor_id (
          full_name,
          avatar_url
        )
      `)
      .eq('campaign_id', campaignId)
      .eq('payment_status', 'completed')
      .order('created_at', { ascending: false })

    // If not including anonymous donations, filter them out
    if (!includeAnonymous) {
      query = query.eq('is_anonymous', false)
    }

    const { data, error } = await query

    if (error) {
      console.error('Get campaign donations error:', error)
      return {
        success: false,
        error: 'Failed to fetch campaign donations'
      }
    }

    return {
      success: true,
      data: data || []
    }
  } catch (error) {
    console.error('Get campaign donations error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while fetching campaign donations'
    }
  }
}

export async function getDonationById(donationId: string): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to view donation details'
      }
    }

    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        campaigns_table:campaign_id (
          id,
          title,
          creator_id,
          user_profiles:creator_id (
            full_name
          )
        )
      `)
      .eq('id', donationId)
      .single()

    if (error) {
      console.error('Get donation error:', error)
      return {
        success: false,
        error: 'Donation not found'
      }
    }

    // Check if user has permission to view this donation
    // User can view if they are the donor or the campaign creator
    const canView = data.donor_id === user.id || 
                   (data.campaigns && data.campaigns.creator_id === user.id)

    if (!canView) {
      return {
        success: false,
        error: 'You do not have permission to view this donation'
      }
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Get donation error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while fetching the donation'
    }
  }
}

export async function getDonationStats(campaignId?: string): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    let query = supabase
      .from('donations')
      .select('amount, created_at, campaign_id')
      .eq('payment_status', 'completed')

    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Get donation stats error:', error)
      return {
        success: false,
        error: 'Failed to fetch donation statistics'
      }
    }

    // Calculate statistics
    const totalAmount = data?.reduce((sum, donation) => sum + donation.amount, 0) || 0
    const donationCount = data?.length || 0
    const averageAmount = donationCount > 0 ? totalAmount / donationCount : 0

    // Get donations by month for the last 12 months
    const now = new Date()
    const monthlyData = []
    
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      
      const monthDonations = data?.filter(donation => {
        const donationDate = new Date(donation.created_at)
        return donationDate >= month && donationDate < nextMonth
      }) || []
      
      monthlyData.push({
        month: month.toISOString().slice(0, 7), // YYYY-MM format
        amount: monthDonations.reduce((sum, donation) => sum + donation.amount, 0),
        count: monthDonations.length
      })
    }

    return {
      success: true,
      data: {
        totalAmount,
        donationCount,
        averageAmount,
        monthlyData
      }
    }
  } catch (error) {
    console.error('Get donation stats error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while fetching donation statistics'
    }
  }
}
