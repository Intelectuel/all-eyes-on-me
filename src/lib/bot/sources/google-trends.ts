import { SourceResult, RawMention } from '../types'

const GOOGLE_TRENDS_URLS = [
  { url: 'https://trends.google.com/trending/rss?geo=FR', label: 'google_trends_fr' },
  { url: 'https://trends.google.com/trending/rss?geo=US', label: 'google_trends_worldwide' },
  { url: 'https://trends.google.com/trending/rss?geo=GB', label: 'google_trends_uk' },
]

function parseRSS(xml: string, source: string): RawMention[] {
  const mentions: RawMention[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1]
    const titleMatch = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)
    const linkMatch = item.match(/<link>([^<]+)<\/link>/)
    const approxMatch = item.match(/<ht:approx_traffic>([^<]+)<\/ht:approx_traffic>/)

    if (titleMatch?.[1]) {
      mentions.push({
        name: titleMatch[1].trim(),
        context: `Trending on Google${approxMatch ? ` (~${approxMatch[1]} searches)` : ''}`,
        url: linkMatch?.[1]?.trim(),
        platform: source,
        sourceType: 'trends',
        detectedAt: new Date(),
        isBreaking: false,
      })
    }
  }
  return mentions
}

export async function fetchGoogleTrends(): Promise<SourceResult[]> {
  return Promise.all(
    GOOGLE_TRENDS_URLS.map(async ({ url, label }) => {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(8000),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const xml = await res.text()
        return {
          source: label,
          sourceType: 'trends' as const,
          success: true,
          mentions: parseRSS(xml, label),
          fetchedAt: new Date(),
        }
      } catch (err) {
        return {
          source: label,
          sourceType: 'trends' as const,
          success: false,
          mentions: [],
          error: String(err),
          fetchedAt: new Date(),
        }
      }
    })
  )
}
