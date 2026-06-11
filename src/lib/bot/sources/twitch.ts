import { SourceResult, RawMention } from '../types'

const CLIENT_ID = process.env.TWITCH_CLIENT_ID
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET

interface TwitchStream {
  user_name: string
  user_login: string
  game_name: string
  title: string
  viewer_count: number
  started_at: string
  language: string
}

let twitchToken: { access_token: string; expires_at: number } | null = null

async function getTwitchToken(): Promise<string | null> {
  if (!CLIENT_ID || !CLIENT_SECRET) return null

  if (twitchToken && Date.now() < twitchToken.expires_at) {
    return twitchToken.access_token
  }

  const res = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`, {
    method: 'POST',
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Twitch auth ${res.status}`)

  const data = await res.json() as { access_token: string; expires_in: number }
  twitchToken = {
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in - 60) * 1000,
  }
  return twitchToken.access_token
}

export async function fetchTwitch(): Promise<SourceResult[]> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return [{
      source: 'twitch',
      sourceType: 'video',
      success: false,
      mentions: [],
      error: 'TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET not configured',
      fetchedAt: new Date(),
    }]
  }

  try {
    const token = await getTwitchToken()
    if (!token) throw new Error('Failed to get Twitch token')

    const res = await fetch('https://api.twitch.tv/helix/streams?first=50&language=fr&language=en', {
      headers: {
        'Client-Id': CLIENT_ID,
        'Authorization': `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) throw new Error(`Twitch streams API ${res.status}`)

    const data = await res.json() as { data: TwitchStream[] }
    const mentions: RawMention[] = data.data
      .filter(s => s.viewer_count > 5000)
      .map(s => ({
        name: s.user_name,
        context: `Live on Twitch: "${s.title}" playing ${s.game_name} (${s.viewer_count.toLocaleString()} viewers)`,
        url: `https://twitch.tv/${s.user_login}`,
        platform: 'twitch',
        sourceType: 'video' as const,
        detectedAt: new Date(s.started_at),
        isBreaking: false,
      }))

    return [{
      source: 'twitch',
      sourceType: 'video',
      success: true,
      mentions,
      fetchedAt: new Date(),
    }]
  } catch (err) {
    return [{
      source: 'twitch',
      sourceType: 'video',
      success: false,
      mentions: [],
      error: String(err),
      fetchedAt: new Date(),
    }]
  }
}
