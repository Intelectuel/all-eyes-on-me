export type Market = {
  id: string
  creator_id: string
  title: string
  description: string | null
  category: string
  resolution_date: string
  resolution_criteria?: string | null
  resolved: boolean
  resolution: 'YES' | 'NO' | null
  yes_pool: number
  no_pool: number
  created_at: string
  // Bot / virality fields
  virality_score?: number
  auto_generated?: boolean
  trending_sources?: string[]
  breaking_news?: boolean
  report_count?: number
  suspended?: boolean
  public_figure_id?: string | null
  creator?: Profile
}

export type Bet = {
  id: string
  user_id: string
  market_id: string
  position: 'YES' | 'NO'
  amount: number
  created_at: string
}

export type Profile = {
  id: string
  username: string
  credits: number
  bio: string | null
  avatar_url: string | null
  follower_count: number
  is_verified: boolean
  is_admin?: boolean
  created_at: string
}

export type PublicFigure = {
  id: string
  name: string
  full_name: string | null
  slug: string
  category: string
  nationality: string | null
  country: string | null
  social_handles: Record<string, string>
  follower_estimates: Record<string, number>
  profile_image_url: string | null
  wikipedia_url: string | null
  virality_score: number
  last_trending_at: string | null
  trend_count_24h: number
  trend_count_7d: number
  blacklisted: boolean
  created_at: string
}

export type Report = {
  id: string
  market_id: string
  user_id: string
  reason: string
  details?: string
  created_at: string
}
