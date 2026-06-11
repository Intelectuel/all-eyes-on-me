import { SourceResult, RawMention } from '../types'

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

let spotifyToken: { access_token: string; expires_at: number } | null = null

async function getSpotifyToken(): Promise<string | null> {
  if (!CLIENT_ID || !CLIENT_SECRET) return null

  if (spotifyToken && Date.now() < spotifyToken.expires_at) {
    return spotifyToken.access_token
  }

  const creds = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Spotify auth ${res.status}`)

  const data = await res.json() as { access_token: string; expires_in: number }
  spotifyToken = {
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in - 60) * 1000,
  }
  return spotifyToken.access_token
}

interface SpotifyTrack {
  track: {
    name: string
    artists: Array<{ name: string }>
    popularity: number
    external_urls: { spotify: string }
  }
}

async function fetchPlaylistTracks(playlistId: string, token: string, label: string): Promise<RawMention[]> {
  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50&fields=items(track(name,artists,popularity,external_urls))`,
    {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000),
    }
  )
  if (!res.ok) throw new Error(`Spotify playlist ${res.status}`)

  const data = await res.json() as { items: SpotifyTrack[] }
  const mentions: RawMention[] = []

  for (const item of data.items || []) {
    if (!item.track) continue
    const { name, artists, popularity, external_urls } = item.track

    for (const artist of artists) {
      mentions.push({
        name: artist.name,
        context: `Top Spotify track: "${name}" by ${artist.name} (popularity ${popularity}/100)`,
        url: external_urls.spotify,
        platform: label,
        sourceType: 'music',
        detectedAt: new Date(),
        isBreaking: false,
      })
    }
  }

  return mentions
}

// Spotify Global Top 50: 37i9dQZEVXbMDoHDwVN2tF
// Spotify France Top 50: 37i9dQZEVXbIPWwFssbupI
const PLAYLISTS = [
  { id: '37i9dQZEVXbMDoHDwVN2tF', label: 'spotify_global' },
  { id: '37i9dQZEVXbIPWwFssbupI', label: 'spotify_france' },
  { id: '37i9dQZEVXbIQZn4I0Vle8v', label: 'spotify_viral_global' },
]

export async function fetchSpotify(): Promise<SourceResult[]> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return [{
      source: 'spotify',
      sourceType: 'music',
      success: false,
      mentions: [],
      error: 'SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET not configured',
      fetchedAt: new Date(),
    }]
  }

  try {
    const token = await getSpotifyToken()
    if (!token) throw new Error('Failed to get Spotify token')

    const results = await Promise.allSettled(
      PLAYLISTS.map(({ id, label }) => fetchPlaylistTracks(id, token, label))
    )

    return PLAYLISTS.map(({ label }, i) => {
      const result = results[i]
      if (result.status === 'fulfilled') {
        return {
          source: label,
          sourceType: 'music' as const,
          success: true,
          mentions: result.value,
          fetchedAt: new Date(),
        }
      }
      return {
        source: label,
        sourceType: 'music' as const,
        success: false,
        mentions: [],
        error: result.reason?.message,
        fetchedAt: new Date(),
      }
    })
  } catch (err) {
    return [{
      source: 'spotify',
      sourceType: 'music',
      success: false,
      mentions: [],
      error: String(err),
      fetchedAt: new Date(),
    }]
  }
}
