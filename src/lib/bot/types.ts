export type PersonCategory =
  | 'youtuber'
  | 'tiktoker'
  | 'instagrammer'
  | 'streamer'
  | 'snapchat_creator'
  | 'podcaster'
  | 'musician_pop'
  | 'musician_rap'
  | 'musician_rnb'
  | 'musician_rock'
  | 'musician_electronic'
  | 'musician_classical'
  | 'musician_world'
  | 'football_player'
  | 'basketball_player'
  | 'tennis_player'
  | 'f1_driver'
  | 'rugby_player'
  | 'mma_fighter'
  | 'cyclist'
  | 'athlete'
  | 'actor'
  | 'tv_personality'
  | 'reality_tv'
  | 'model'
  | 'politician'
  | 'entrepreneur'
  | 'comedian'
  | 'chef'
  | 'artist'
  | 'writer'
  | 'scientist'
  | 'activist'
  | 'religious'
  | 'journalist'
  | 'gamer'
  | 'other'

export interface RawMention {
  name: string
  context: string
  url?: string
  platform: string
  sourceType: SourceType
  detectedAt: Date
  isBreaking?: boolean
}

export type SourceType =
  | 'social_media'
  | 'news'
  | 'music'
  | 'sports'
  | 'politics'
  | 'video'
  | 'trends'

export interface SourceResult {
  source: string
  sourceType: SourceType
  success: boolean
  mentions: RawMention[]
  error?: string
  fetchedAt: Date
}

export interface PublicFigure {
  id?: string
  name: string
  full_name?: string
  slug: string
  category: PersonCategory
  nationality?: string
  country?: string
  social_handles: Record<string, string>
  follower_estimates: Record<string, number>
  profile_image_url?: string
  wikipedia_url?: string
}

export interface TrendingFigure {
  figure: PublicFigure
  mentions: RawMention[]
  viralityScore: number
  viralityBreakdown: ViralityBreakdown
  isBreaking: boolean
}

export interface ViralityBreakdown {
  sourcesCount: number       // max 30
  velocity: number           // max 25
  crossPlatform: number      // max 20
  controversy: number        // max 15
  breakingBonus: number      // max 10
  total: number              // sum, max 100
}

export interface SafetyResult {
  safe: boolean
  confidence: number
  blockedReasons: string[]
  routing: 'publish' | 'queue' | 'reject'
}

export interface GeneratedMarket {
  title: string
  description: string
  category: string
  resolution_date: string
  resolution_criteria: string
  why_viral_now: string
  predicted_engagement_score: number
}

export interface BotRunStats {
  sourcesChecked: number
  figuresDetected: number
  marketsGenerated: number
  marketsPublished: number
  marketsQueued: number
  marketsRejected: number
  errors: string[]
}
