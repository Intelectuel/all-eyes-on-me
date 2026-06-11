import { supabaseAdmin } from '../supabase/admin'
import { AggregatedFigure } from './aggregator'
import {
  GeneratedMarket,
  SafetyResult,
  ViralityBreakdown,
  PersonCategory,
} from './types'

const BOT_USER_ID = 'b07b0001-0000-0000-0000-000000000001'
const MAX_MARKETS_PER_HOUR = 20

export async function getOrCreatePublicFigure(
  figure: AggregatedFigure,
  category: PersonCategory
): Promise<string | null> {
  const slug = figure.normalizedName.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  // Check if figure exists
  const { data: existing } = await supabaseAdmin
    .from('public_figures')
    .select('id, blacklisted')
    .eq('slug', slug)
    .maybeSingle()

  if (existing) {
    if (existing.blacklisted) return null

    // Update virality metrics
    await supabaseAdmin
      .from('public_figures')
      .update({
        trend_count_24h: supabaseAdmin.rpc('increment', { x: 1 }) as unknown as number,
        last_trending_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    return existing.id
  }

  // Create new figure
  const { data: created, error } = await supabaseAdmin
    .from('public_figures')
    .insert({
      name: figure.name,
      slug,
      category,
      last_trending_at: new Date().toISOString(),
      trend_count_24h: 1,
      trend_count_7d: 1,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating public figure:', error)
    return null
  }

  return created.id
}

export async function checkBlacklist(name: string): Promise<boolean> {
  const lower = name.toLowerCase()
  const { data } = await supabaseAdmin
    .from('blacklist')
    .select('term')
    .limit(500)

  if (!data) return false
  return data.some(b => lower.includes(b.term.toLowerCase()))
}

export async function checkDuplicate(figureId: string): Promise<boolean> {
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  const { data } = await supabaseAdmin
    .from('markets')
    .select('id')
    .eq('public_figure_id', figureId)
    .gte('created_at', fortyEightHoursAgo)
    .limit(1)

  return (data?.length ?? 0) > 0
}

export async function checkHourlyRateLimit(): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await supabaseAdmin
    .from('markets')
    .select('id', { count: 'exact', head: true })
    .eq('auto_generated', true)
    .gte('created_at', oneHourAgo)

  return (count ?? 0) >= MAX_MARKETS_PER_HOUR
}

export async function publishMarket(
  market: GeneratedMarket,
  figure: AggregatedFigure,
  figureId: string | null,
  breakdown: ViralityBreakdown,
  safety: SafetyResult
): Promise<{ published: boolean; marketId?: string; queued?: boolean }> {
  const marketData = {
    creator_id: BOT_USER_ID,
    title: market.title,
    description: market.description,
    category: market.category,
    resolution_date: market.resolution_date,
    resolution_criteria: market.resolution_criteria,
    resolved: false,
    yes_pool: 100,
    no_pool: 100,
    auto_generated: true,
    virality_score: breakdown.total,
    trending_sources: Array.from(figure.sources),
    breaking_news: figure.isBreaking,
    public_figure_id: figureId,
    report_count: 0,
    suspended: false,
  }

  const { data: inserted, error } = await supabaseAdmin
    .from('markets')
    .insert(marketData)
    .select('id')
    .single()

  if (error) {
    console.error('Error inserting market:', error)
    return { published: false }
  }

  // Store trending events
  await supabaseAdmin.from('trending_events').insert(
    figure.contexts.slice(0, 5).map(context => ({
      figure_id: figureId,
      figure_name: figure.name,
      source: Array.from(figure.sources)[0] || 'unknown',
      source_type: Array.from(figure.sourceTypes)[0] || 'news',
      headline: context.substring(0, 200),
      detected_at: figure.lastSeen.toISOString(),
    }))
  )

  if (safety.routing === 'queue') {
    await supabaseAdmin.from('moderation_queue').insert({
      market_id: inserted.id,
      reason: `Auto-generated market requires human review (confidence: ${safety.confidence}%)`,
      confidence_score: safety.confidence,
      generated_data: {
        figure_name: figure.name,
        virality_score: breakdown.total,
        why_viral: market.why_viral_now,
      },
      status: 'pending',
    })
    return { published: true, marketId: inserted.id, queued: true }
  }

  return { published: true, marketId: inserted.id, queued: false }
}

export async function recordBotRun(
  runId: string,
  stats: {
    sources_checked: number
    figures_detected: number
    markets_generated: number
    markets_published: number
    markets_queued: number
    markets_rejected: number
    errors: string[]
  }
): Promise<void> {
  await supabaseAdmin
    .from('bot_runs')
    .update({
      completed_at: new Date().toISOString(),
      status: 'completed',
      ...stats,
      errors: stats.errors,
    })
    .eq('id', runId)
}
