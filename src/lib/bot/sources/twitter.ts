import { SourceResult, RawMention } from '../types'

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN

interface TwitterTrend {
  name: string
  url: string
  tweet_volume: number | null
}

// WOEID 1 = worldwide, 23424819 = France
const LOCATIONS = [
  { woeid: 1, label: 'twitter_worldwide' },
  { woeid: 23424819, label: 'twitter_france' },
]

async function fetchTrends(woeid: number, label: string): Promise<RawMention[]> {
  if (!BEARER_TOKEN) return []

  // Twitter v1.1 trends/place endpoint
  const url = `https://api.twitter.com/1.1/trends/place.json?id=${woeid}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`Twitter API ${res.status}`)

  const data = await res.json() as Array<{ trends: TwitterTrend[] }>
  const trends = data[0]?.trends || []

  return trends
    .filter(t => !t.name.startsWith('#') || t.tweet_volume)
    .slice(0, 30)
    .map(t => ({
      name: t.name.replace(/^#/, ''),
      context: `Trending on Twitter${t.tweet_volume ? ` (${t.tweet_volume.toLocaleString()} tweets)` : ''}`,
      url: t.url,
      platform: label,
      sourceType: 'social_media' as const,
      detectedAt: new Date(),
      isBreaking: false,
    }))
}

export async function fetchTwitter(): Promise<SourceResult[]> {
  if (!BEARER_TOKEN) {
    return LOCATIONS.map(({ label }) => ({
      source: label,
      sourceType: 'social_media' as const,
      success: false,
      mentions: [],
      error: 'TWITTER_BEARER_TOKEN not configured',
      fetchedAt: new Date(),
    }))
  }

  return Promise.all(
    LOCATIONS.map(async ({ woeid, label }) => {
      try {
        const mentions = await fetchTrends(woeid, label)
        return {
          source: label,
          sourceType: 'social_media' as const,
          success: true,
          mentions,
          fetchedAt: new Date(),
        }
      } catch (err) {
        return {
          source: label,
          sourceType: 'social_media' as const,
          success: false,
          mentions: [],
          error: String(err),
          fetchedAt: new Date(),
        }
      }
    })
  )
}
