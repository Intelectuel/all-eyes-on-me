import { SourceResult, RawMention } from '../types'

const API_KEY = process.env.YOUTUBE_API_KEY

interface YTVideo {
  snippet: {
    title: string
    channelTitle: string
    description: string
    publishedAt: string
    channelId: string
  }
  id: { videoId?: string; kind: string } | string
}

async function fetchTrendingVideos(regionCode: string, label: string): Promise<RawMention[]> {
  if (!API_KEY) return []

  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=${regionCode}&maxResults=50&videoCategoryId=0&key=${API_KEY}`
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`)

  const data = await res.json() as { items: Array<{ snippet: YTVideo['snippet']; id: string }> }
  const mentions: RawMention[] = []

  for (const item of data.items || []) {
    const { title, channelTitle, publishedAt } = item.snippet
    const publishedDate = new Date(publishedAt)
    const isRecent = (Date.now() - publishedDate.getTime()) < 2 * 60 * 60 * 1000

    // The channel itself is a trending person/entity
    mentions.push({
      name: channelTitle,
      context: `Trending YouTube video: "${title}"`,
      url: `https://youtube.com/watch?v=${item.id}`,
      platform: label,
      sourceType: 'video',
      detectedAt: publishedDate,
      isBreaking: isRecent,
    })
  }

  return mentions
}


export async function fetchYouTube(): Promise<SourceResult[]> {
  if (!API_KEY) {
    return [{
      source: 'youtube',
      sourceType: 'video',
      success: false,
      mentions: [],
      error: 'YOUTUBE_API_KEY not configured',
      fetchedAt: new Date(),
    }]
  }

  try {
    const [frMentions, usMentions] = await Promise.all([
      fetchTrendingVideos('FR', 'youtube_fr'),
      fetchTrendingVideos('US', 'youtube_us'),
    ])

    return [
      {
        source: 'youtube_fr',
        sourceType: 'video',
        success: true,
        mentions: frMentions,
        fetchedAt: new Date(),
      },
      {
        source: 'youtube_us',
        sourceType: 'video',
        success: true,
        mentions: usMentions,
        fetchedAt: new Date(),
      },
    ]
  } catch (err) {
    return [{
      source: 'youtube',
      sourceType: 'video',
      success: false,
      mentions: [],
      error: String(err),
      fetchedAt: new Date(),
    }]
  }
}
