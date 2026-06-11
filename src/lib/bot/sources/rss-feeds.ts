import { SourceResult, RawMention, SourceType } from '../types'

interface FeedConfig {
  url: string
  source: string
  label: string
  type: SourceType
}

const NEWS_FEEDS: FeedConfig[] = [
  // French national news
  { url: 'https://www.bfmtv.com/rss/news-24-7/', source: 'bfmtv', label: 'BFM TV', type: 'news' },
  { url: 'https://www.lemonde.fr/rss/une.xml', source: 'lemonde', label: 'Le Monde', type: 'news' },
  { url: 'https://www.lefigaro.fr/rss/figaro_actualites.xml', source: 'lefigaro', label: 'Le Figaro', type: 'news' },
  { url: 'https://www.liberation.fr/arc/outboundfeeds/rss/?outputType=xml', source: 'liberation', label: 'Libération', type: 'news' },
  { url: 'https://www.20minutes.fr/feeds/rss/une', source: '20minutes', label: '20 Minutes', type: 'news' },
  { url: 'https://www.leparisien.fr/arc/outboundfeeds/rss/', source: 'leparisien', label: 'Le Parisien', type: 'news' },
  { url: 'https://www.francetvinfo.fr/titres.rss', source: 'franceinfo', label: 'France Info', type: 'news' },
  { url: 'https://www.rmc.fr/export/rss.xml', source: 'rmc', label: 'RMC', type: 'news' },
  { url: 'https://www.actu.fr/feed', source: 'actufr', label: 'Actu.fr', type: 'news' },
  // Sports
  { url: 'https://www.lequipe.fr/rss/actu_rss.xml', source: 'lequipe', label: "L'Equipe", type: 'sports' },
  { url: 'https://rmcsport.bfmtv.com/rss/football/', source: 'rmcsport', label: 'RMC Sport', type: 'sports' },
  // International
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'bbc', label: 'BBC News', type: 'news' },
  { url: 'https://rss.cnn.com/rss/edition.rss', source: 'cnn', label: 'CNN', type: 'news' },
  // Entertainment
  { url: 'https://www.allocine.fr/rss/feed.xml', source: 'allocine', label: 'AlloCiné', type: 'music' },
  // Music/Charts — RSS
  { url: 'https://www.chartsinfrance.net/feed/', source: 'chartsinfrance', label: 'Charts France', type: 'music' },
]

function extractPersonNames(text: string): string[] {
  // Simple heuristic: extract capitalized consecutive words (likely proper nouns)
  const matches = text.match(/[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç'-]+(?:\s+[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç'-]+)+/g)
  return matches ? Array.from(new Set(matches)) : []
}

function parseRSSItems(xml: string, config: FeedConfig): RawMention[] {
  const mentions: RawMention[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1]
    const titleMatch = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)
    const descMatch = item.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/)
    const linkMatch = item.match(/<link>([^<\s]+)<\/link>/)
    const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/)

    if (!titleMatch?.[1]) continue

    const title = titleMatch[1].replace(/<[^>]+>/g, '').trim()
    const desc = (descMatch?.[1] || '').replace(/<[^>]+>/g, '').trim()
    const fullText = `${title} ${desc}`

    // Check if article is recent (within last 2 hours)
    const pubDate = dateMatch?.[1] ? new Date(dateMatch[1]) : new Date()
    const isBreaking = (Date.now() - pubDate.getTime()) < 2 * 60 * 60 * 1000

    // Extract potential person names from headline
    const names = extractPersonNames(title)

    if (names.length > 0) {
      for (const name of names.slice(0, 3)) {
        mentions.push({
          name,
          context: title,
          url: linkMatch?.[1],
          platform: config.source,
          sourceType: config.type,
          detectedAt: pubDate,
          isBreaking: isBreaking && (Date.now() - pubDate.getTime()) < 30 * 60 * 1000,
        })
      }
    } else {
      // Store the headline itself as a potential trending topic
      mentions.push({
        name: title.substring(0, 80),
        context: fullText.substring(0, 200),
        url: linkMatch?.[1],
        platform: config.source,
        sourceType: config.type,
        detectedAt: pubDate,
        isBreaking: isBreaking && (Date.now() - pubDate.getTime()) < 30 * 60 * 1000,
      })
    }
  }

  return mentions
}

export async function fetchNewsFeeds(): Promise<SourceResult[]> {
  return Promise.all(
    NEWS_FEEDS.map(async (config) => {
      try {
        const res = await fetch(config.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
            'Accept': 'application/rss+xml, application/xml, text/xml',
          },
          signal: AbortSignal.timeout(10000),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const xml = await res.text()
        return {
          source: config.source,
          sourceType: config.type,
          success: true,
          mentions: parseRSSItems(xml, config),
          fetchedAt: new Date(),
        }
      } catch (err) {
        return {
          source: config.source,
          sourceType: config.type,
          success: false,
          mentions: [],
          error: String(err),
          fetchedAt: new Date(),
        }
      }
    })
  )
}
