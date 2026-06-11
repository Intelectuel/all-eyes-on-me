import { SourceResult, RawMention } from '../types'

const SUBREDDITS = [
  { sub: 'france', label: 'reddit_france' },
  { sub: 'AskFrance', label: 'reddit_askfrance' },
  { sub: 'leagueoflegends', label: 'reddit_lol' },
  { sub: 'soccer', label: 'reddit_soccer' },
  { sub: 'entertainment', label: 'reddit_entertainment' },
  { sub: 'music', label: 'reddit_music' },
]

interface RedditPost {
  data: {
    title: string
    url: string
    score: number
    num_comments: number
    created_utc: number
    upvote_ratio: number
  }
}

function extractNames(title: string): string[] {
  const matches = title.match(/[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç'-]+(?:\s+[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç'-]+)+/g)
  return matches ? Array.from(new Set(matches)) : []
}

async function fetchSubreddit(sub: string, label: string): Promise<RawMention[]> {
  const url = `https://www.reddit.com/r/${sub}/hot.json?limit=25`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'AllEyesOnMeBot/1.0' },
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Reddit ${res.status}`)

  const json = await res.json() as { data: { children: RedditPost[] } }
  const mentions: RawMention[] = []

  for (const post of json.data.children || []) {
    const { title, url: postUrl, score, created_utc } = post.data
    const createdAt = new Date(created_utc * 1000)
    const isRecent = (Date.now() - createdAt.getTime()) < 2 * 60 * 60 * 1000

    const names = extractNames(title)
    if (names.length > 0) {
      for (const name of names.slice(0, 2)) {
        mentions.push({
          name,
          context: `r/${sub}: "${title}" (${score.toLocaleString()} upvotes)`,
          url: postUrl,
          platform: label,
          sourceType: 'social_media',
          detectedAt: createdAt,
          isBreaking: isRecent && score > 500,
        })
      }
    }
  }

  return mentions
}

export async function fetchReddit(): Promise<SourceResult[]> {
  return Promise.all(
    SUBREDDITS.map(async ({ sub, label }) => {
      try {
        const mentions = await fetchSubreddit(sub, label)
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
