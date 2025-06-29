// Database Types for Crowdfunding Platform
export interface FileWithPath {
  file: File
  path?: string
}
export interface UserProfile {
  id?: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  created_at?: string;
  updated_at?: string;
}
interface Article {
  Title: string
  Summary: string
  Sentiment: "Positive" | "Neutral" | "Negative"
  url?: string
}

export interface SentimentDistribution {
  Positive: number
  Neutral: number
  Negative: number
}

export interface CoverageDifference {
  Similarities: string
  Differences: string
}

export interface TopicOverlap {
  "Common Topics": string
  [key: string]: string // For unique topics in each article
}

export interface CompanySentimentResult {
  Company: string
  Articles: Article[]
  "Comparative Sentiment Score": {
    "Sentiment Distribution": SentimentDistribution
  }
  "Coverage Differences": CoverageDifference[]
  "Topic Overlap": TopicOverlap
  "Final Sentiment Analysis": string
  "Audio File"?: string
  timestamp: string
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

export interface CampaignDisplayTable {
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
  progress: number;
  days_left: number;
}


export interface Donation {
  id: string;
  campaign_id: string;
  donor_id: string | null;
  amount: number;
  message: string | null;
  is_anonymous: boolean;
  payment_method: string | null;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id: string | null;
  created_at: string;
}

export interface CampaignCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface CampaignUpdate {
  id: string;
  campaign_id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

export interface CampaignComment {
  id: string;
  campaign_id: string;
  user_id: string | null;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

// Extended types 
export interface CampaignWithCreator extends CampaignTable {
  creator: UserProfile;
}

export interface CampaignWithDetails extends CampaignTable {
  creator: UserProfile;
  donations: Donation[];
  updates: CampaignUpdate[];
  comments: CampaignComment[];
  category_details?: CampaignCategory;
}

export interface DonationWithDetails extends Donation {
  campaign: CampaignTable;
  donor?: UserProfile;
}

export interface CommentWithUser extends CampaignComment {
  user?: UserProfile;
  replies?: CommentWithUser[];
}

// Input types for creating/updating records
export interface CreateCampaignInput {
  title: string;
  description: string;
  goal: number;
  image_url?: string;
  category?: string;
  featured?: boolean;
  end_date?: string;
}

export interface UpdateCampaignInput {
  title?: string;
  description?: string;
  goal?: number;
  image_url?: string;
  category?: string;
  status?: 'active' | 'paused' | 'completed' | 'cancelled';
  featured?: boolean;
  end_date?: string;
}

export interface CreateDonationInput {
  campaign_id: string;
  amount: number;
  message?: string;
  is_anonymous?: boolean;
  payment_method?: string;
}

export interface UpdateUserProfileInput {
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface CreateCampaignUpdateInput {
  campaign_id: string;
  title: string;
  content: string;
  image_url?: string;
}

export interface CreateCommentInput {
  campaign_id: string;
  content: string;
  parent_id?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface CampaignFilters {
  category?: string;
  status?: 'active' | 'paused' | 'completed' | 'cancelled';
  featured?: boolean;
  creator_id?: string;
  search?: string;
  min_goal?: number;
  max_goal?: number;
  sort_by?: 'created_at' | 'goal' | 'current_amount' | 'end_date';
  sort_order?: 'asc' | 'desc';
}

export interface DonationFilters {
  campaign_id?: string;
  donor_id?: string;
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
  min_amount?: number;
  max_amount?: number;
  date_from?: string;
  date_to?: string;
}