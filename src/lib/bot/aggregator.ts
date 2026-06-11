import { RawMention, SourceResult } from './types'

export interface AggregatedFigure {
  name: string
  normalizedName: string
  mentions: RawMention[]
  sources: Set<string>
  sourceTypes: Set<string>
  firstSeen: Date
  lastSeen: Date
  contexts: string[]
  urls: string[]
  isBreaking: boolean
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove accents
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function areSimilar(a: string, b: string): boolean {
  if (a === b) return true
  if (Math.abs(a.length - b.length) > 5) return false

  // Check if one contains the other (e.g. "Macron" vs "Emmanuel Macron")
  if (a.includes(b) || b.includes(a)) return true

  // Levenshtein distance for short names
  if (a.length <= 15 && b.length <= 15) {
    const distance = levenshtein(a, b)
    return distance <= 2
  }

  return false
}

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[a.length][b.length]
}

// Words to exclude — generic terms, not person names
const STOPWORDS = new Set([
  'france', 'paris', 'europe', 'monde', 'monde', 'twitter', 'google', 'youtube',
  'netflix', 'spotify', 'apple', 'samsung', 'amazon', 'facebook', 'instagram',
  'tiktok', 'premier', 'league', 'champions', 'ligue', 'coupe', 'world', 'cup',
  'breaking', 'news', 'live', 'direct', 'video', 'photo', 'watch', 'latest',
  'trending', 'viral', 'follow', 'subscribe',
])

function isLikelyPerson(name: string): boolean {
  const lower = normalizeName(name)
  if (STOPWORDS.has(lower)) return false

  const words = name.trim().split(/\s+/)
  // Must be 1-4 words, each starting with capital
  if (words.length > 4 || words.length < 1) return false
  if (words.some(w => w.length < 2)) return false

  // Reject if it's a sentence fragment (too long, has common words)
  if (name.length > 50) return false

  return true
}

export function aggregateMentions(results: SourceResult[]): Map<string, AggregatedFigure> {
  const figureMap = new Map<string, AggregatedFigure>()
  const normalizedIndex = new Map<string, string>() // normalized -> canonical name

  for (const result of results) {
    if (!result.success) continue

    for (const mention of result.mentions) {
      const raw = mention.name.trim()
      if (!isLikelyPerson(raw)) continue

      const normalized = normalizeName(raw)
      if (normalized.length < 3) continue

      // Find existing similar entry
      let canonicalKey: string | undefined

      for (const existing of Array.from(normalizedIndex.keys())) {
        if (areSimilar(normalized, existing)) {
          canonicalKey = normalizedIndex.get(existing)!
          break
        }
      }

      if (!canonicalKey) {
        // New figure — prefer longer name as canonical
        canonicalKey = normalized
        normalizedIndex.set(normalized, canonicalKey)

        figureMap.set(canonicalKey, {
          name: raw,
          normalizedName: normalized,
          mentions: [],
          sources: new Set(),
          sourceTypes: new Set(),
          firstSeen: mention.detectedAt,
          lastSeen: mention.detectedAt,
          contexts: [],
          urls: [],
          isBreaking: false,
        })
      } else {
        // Update canonical name to longer version
        const existing = figureMap.get(canonicalKey)!
        if (raw.length > existing.name.length) {
          existing.name = raw
        }
      }

      const figure = figureMap.get(canonicalKey)!
      figure.mentions.push(mention)
      figure.sources.add(mention.platform)
      figure.sourceTypes.add(mention.sourceType)

      if (mention.detectedAt < figure.firstSeen) figure.firstSeen = mention.detectedAt
      if (mention.detectedAt > figure.lastSeen) figure.lastSeen = mention.detectedAt
      if (mention.context && !figure.contexts.includes(mention.context)) {
        figure.contexts.push(mention.context)
      }
      if (mention.url && !figure.urls.includes(mention.url)) {
        figure.urls.push(mention.url)
      }
      if (mention.isBreaking) figure.isBreaking = true
    }
  }

  // Filter to figures mentioned in at least 2 different sources
  for (const [key, figure] of Array.from(figureMap.entries())) {
    if (figure.mentions.length < 2 && figure.sources.size < 2) {
      figureMap.delete(key)
    }
  }

  return figureMap
}

// Track mention velocity: compare last 2h vs previous 2h
export function calculateVelocity(mentions: RawMention[]): number {
  const now = Date.now()
  const twoHoursAgo = now - 2 * 60 * 60 * 1000
  const fourHoursAgo = now - 4 * 60 * 60 * 1000

  const recent = mentions.filter(m => m.detectedAt.getTime() > twoHoursAgo).length
  const previous = mentions.filter(m =>
    m.detectedAt.getTime() > fourHoursAgo && m.detectedAt.getTime() <= twoHoursAgo
  ).length

  if (previous === 0) return recent > 0 ? 1.0 : 0
  return (recent - previous) / previous
}
