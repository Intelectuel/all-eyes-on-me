export type Market = {
  id: string
  creator_id: string
  title: string
  description: string | null
  category: string
  resolution_date: string
  resolved: boolean
  resolution: 'YES' | 'NO' | null
  yes_pool: number
  no_pool: number
  created_at: string
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
  created_at: string
}
