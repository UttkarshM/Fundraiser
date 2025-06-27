'use server'

import { createServerSupabaseClient } from "@/lib/supabase-server"
import { AuthResult } from "./auth"

export interface CreateDonationData {
  campaign_id: string
  amount: number
  message?: string
  is_anonymous?: boolean
  payment_method?: string
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
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to make a donation'
      }
    }

    // Validate required fields
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
      .from('campaigns')
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
    if (campaign.creator_id === user.id) {
      return {
        success: false,
        error: 'You cannot donate to your own campaign'
      }
    }

    // Create donation record
    const { data, error } = await supabase
      .from('donations')
      .insert({
        ...donationData,
        donor_id: user.id,
        payment_status: 'pending',
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
        campaigns:campaign_id (
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

export async function getDonationsByCampaign(campaignId: string, includePrivate: boolean = false): Promise<AuthResult> {
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

    // If not including private donations, filter out anonymous ones for public view
    if (!includePrivate) {
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

    // For public view, remove donor info for anonymous donations
    if (!includePrivate) {
      const processedData = data?.map(donation => {
        if (donation.is_anonymous) {
          return {
            ...donation,
            user_profiles: null
          }
        }
        return donation
      })
      
      return {
        success: true,
        data: processedData || []
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
        campaigns:campaign_id (
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

export async function refundDonation(donationId: string, reason?: string): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to process refunds'
      }
    }

    // Get donation details
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .select(`
        *,
        campaigns:campaign_id (
          creator_id
        )
      `)
      .eq('id', donationId)
      .single()

    if (donationError || !donation) {
      return {
        success: false,
        error: 'Donation not found'
      }
    }

    // Check if user has permission to refund (campaign creator only)
    if (donation.campaigns?.creator_id !== user.id) {
      return {
        success: false,
        error: 'Only campaign creators can process refunds'
      }
    }

    // Check if donation can be refunded
    if (donation.payment_status !== 'completed') {
      return {
        success: false,
        error: 'Only completed donations can be refunded'
      }
    }

    // Update donation status to refunded
    const { data, error } = await supabase
      .from('donations')
      .update({ 
        payment_status: 'refunded'
        // Note: In a real implementation, you'd also process the actual refund through your payment provider
      })
      .eq('id', donationId)
      .select()
      .single()

    if (error) {
      console.error('Refund donation error:', error)
      return {
        success: false,
        error: 'Failed to process refund. Please try again.'
      }
    }

    return {
      success: true,
      data: {
        ...data,
        message: 'Refund processed successfully'
      }
    }
  } catch (error) {
    console.error('Refund donation error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while processing the refund'
    }
  }
}

