import { fetchGoogleTrends } from './sources/google-trends'
import { fetchNewsFeeds } from './sources/rss-feeds'
import { fetchYouTube } from './sources/youtube'
import { fetchReddit } from './sources/reddit'
import { fetchTwitter } from './sources/twitter'
import { fetchTwitch } from './sources/twitch'
import { fetchSpotify } from './sources/spotify'
import { aggregateMentions } from './aggregator'
import { rankFigures } from './virality'
import { detectPersonCategory, checkSafety, generateMarket } from './claude-brain'
import {
  getOrCreatePublicFigure,
  checkBlacklist,
  checkDuplicate,
  checkHourlyRateLimit,
  publishMarket,
  recordBotRun,
} from './publisher'
import { supabaseAdmin } from '../supabase/admin'
import { BotRunStats, SourceResult } from './types'

export async function runBotCycle(options?: {
  minViralityScore?: number
  maxMarkets?: number
  immediateAlert?: boolean
}): Promise<BotRunStats> {
  const minScore = options?.minViralityScore ?? 55
  const maxMarkets = options?.maxMarkets ?? 20
  const stats: BotRunStats = {
    sourcesChecked: 0,
    figuresDetected: 0,
    marketsGenerated: 0,
    marketsPublished: 0,
    marketsQueued: 0,
    marketsRejected: 0,
    errors: [],
  }

  // Create bot run record
  const { data: runRecord } = await supabaseAdmin
    .from('bot_runs')
    .insert({ status: 'running' })
    .select('id')
    .single()

  const runId = runRecord?.id

  try {
    console.log('[Bot] Starting full source scan...')

    // Fetch all sources in parallel with per-source timeouts
    const sourceGroups = await Promise.allSettled([
      fetchGoogleTrends(),
      fetchNewsFeeds(),
      fetchYouTube(),
      fetchReddit(),
      fetchTwitter(),
      fetchTwitch(),
      fetchSpotify(),
    ])

    const allResults: SourceResult[] = []
    for (const group of sourceGroups) {
      if (group.status === 'fulfilled') {
        allResults.push(...group.value)
      } else {
        stats.errors.push(String(group.reason))
      }
    }

    const successCount = allResults.filter(r => r.success).length
    stats.sourcesChecked = allResults.length
    console.log(`[Bot] ${successCount}/${allResults.length} sources fetched successfully`)

    // Check hourly rate limit
    const rateLimited = await checkHourlyRateLimit()
    if (rateLimited) {
      console.log('[Bot] Hourly rate limit reached (20 markets/hour), skipping generation')
      if (runId) await recordBotRun(runId, toDbStats(stats))
      return stats
    }

    // Aggregate mentions by person
    const figureMap = aggregateMentions(allResults)
    console.log(`[Bot] ${figureMap.size} unique figures detected`)

    // Rank by virality score
    const ranked = rankFigures(figureMap, minScore)
    stats.figuresDetected = ranked.length
    console.log(`[Bot] ${ranked.length} figures above virality threshold ${minScore}`)

    // Alert for 90+ score
    const ultraViral = ranked.filter(r => r.breakdown.total >= 90)
    if (ultraViral.length > 0) {
      console.log(`[Bot] 🚨 ${ultraViral.length} ULTRA-VIRAL figures (90+ score)`)
      // Notify admin via Supabase realtime (insert to a notifications table or use DB trigger)
    }

    let marketsCreated = 0

    for (const { figure, breakdown } of ranked) {
      if (marketsCreated >= maxMarkets) break

      // Check hourly limit again (may have been reached mid-loop)
      if (await checkHourlyRateLimit()) break

      try {
        // Blacklist check
        const blacklisted = await checkBlacklist(figure.name)
        if (blacklisted) {
          console.log(`[Bot] ${figure.name} is blacklisted, skipping`)
          continue
        }

        // Detect category
        const category = await detectPersonCategory(figure)

        // Get or create public figure in DB
        const figureId = await getOrCreatePublicFigure(figure, category)
        if (!figureId) {
          console.log(`[Bot] ${figure.name} is blacklisted in DB, skipping`)
          continue
        }

        // 48h deduplication check
        const isDuplicate = await checkDuplicate(figureId)
        if (isDuplicate) {
          console.log(`[Bot] ${figure.name} already has a market in last 48h, skipping`)
          continue
        }

        // Safety check
        const safety = await checkSafety(figure, breakdown)
        if (safety.routing === 'reject') {
          console.log(`[Bot] ${figure.name} rejected by safety (${safety.blockedReasons.join(', ')})`)
          stats.marketsRejected++
          continue
        }

        // Generate market
        const market = await generateMarket(figure, breakdown, category)
        if (!market) {
          console.log(`[Bot] Failed to generate market for ${figure.name}`)
          stats.errors.push(`Market generation failed for ${figure.name}`)
          continue
        }
        stats.marketsGenerated++

        // Publish
        const result = await publishMarket(market, figure, figureId, breakdown, safety)
        if (result.published) {
          marketsCreated++
          if (result.queued) {
            stats.marketsQueued++
            console.log(`[Bot] ✋ Queued for review: ${figure.name} (score ${breakdown.total})`)
          } else {
            stats.marketsPublished++
            console.log(`[Bot] ✅ Published: ${figure.name} — "${market.title}" (score ${breakdown.total})`)
          }
        }
      } catch (err) {
        const msg = `Error processing ${figure.name}: ${String(err)}`
        console.error('[Bot]', msg)
        stats.errors.push(msg)
      }
    }

    console.log(`[Bot] Cycle complete: ${stats.marketsPublished} published, ${stats.marketsQueued} queued, ${stats.marketsRejected} rejected`)
  } catch (err) {
    const msg = `Fatal bot error: ${String(err)}`
    console.error('[Bot]', msg)
    stats.errors.push(msg)
    if (runId) {
      await supabaseAdmin.from('bot_runs').update({ status: 'failed', errors: [msg] }).eq('id', runId)
    }
    return stats
  }

  if (runId) await recordBotRun(runId, toDbStats(stats))
  return stats
}

function toDbStats(stats: BotRunStats) {
  return {
    sources_checked: stats.sourcesChecked,
    figures_detected: stats.figuresDetected,
    markets_generated: stats.marketsGenerated,
    markets_published: stats.marketsPublished,
    markets_queued: stats.marketsQueued,
    markets_rejected: stats.marketsRejected,
    errors: stats.errors,
  }
}

export async function runGoogleTrendsOnly(): Promise<BotRunStats> {
  return runBotCycle({ minViralityScore: 60, maxMarkets: 5 })
}
