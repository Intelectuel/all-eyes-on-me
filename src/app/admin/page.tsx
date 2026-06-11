import { createClient } from '@/lib/supabase/server'
import AdminModQueue from './components/AdminModQueue'
import AdminBotRuns from './components/AdminBotRuns'
import AdminTrending from './components/AdminTrending'
import AdminBlacklist from './components/AdminBlacklist'

export const revalidate = 0

export default async function AdminPage() {
  const supabase = createClient()

  const [
    { data: pendingQueue, count: queueCount },
    { data: botRuns },
    { data: trendingMarkets },
    { data: reportedMarkets },
    { data: recentFigures },
  ] = await Promise.all([
    supabase
      .from('moderation_queue')
      .select('*, market:markets(title, virality_score, breaking_news, auto_generated)', { count: 'exact' })
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(20),

    supabase
      .from('bot_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(10),

    supabase
      .from('markets')
      .select('id, title, virality_score, yes_pool, no_pool, created_at, breaking_news, suspended, report_count')
      .eq('auto_generated', true)
      .eq('suspended', false)
      .order('virality_score', { ascending: false })
      .limit(20),

    supabase
      .from('markets')
      .select('id, title, report_count, suspended')
      .gt('report_count', 0)
      .order('report_count', { ascending: false })
      .limit(10),

    supabase
      .from('public_figures')
      .select('id, name, category, virality_score, last_trending_at, trend_count_24h')
      .order('virality_score', { ascending: false })
      .limit(20),
  ])

  // Stats
  const { count: totalMarkets } = await supabase
    .from('markets')
    .select('id', { count: 'exact', head: true })
    .eq('auto_generated', true)

  const { count: totalFigures } = await supabase
    .from('public_figures')
    .select('id', { count: 'exact', head: true })

  const { count: suspendedCount } = await supabase
    .from('markets')
    .select('id', { count: 'exact', head: true })
    .eq('suspended', true)

  const lastRun = botRuns?.[0]

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
        <TriggerBotButton />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Marchés auto-générés" value={totalMarkets ?? 0} color="violet" />
        <StatCard label="Personnalités publiques" value={totalFigures ?? 0} color="blue" />
        <StatCard label="File de modération" value={queueCount ?? 0} color="amber" />
        <StatCard label="Marchés suspendus" value={suspendedCount ?? 0} color="red" />
      </div>

      {/* Last bot run */}
      {lastRun && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-xs text-zinc-500 mb-2">Dernier run du bot</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className={`font-medium ${lastRun.status === 'completed' ? 'text-green-400' : lastRun.status === 'failed' ? 'text-red-400' : 'text-amber-400'}`}>
              {lastRun.status === 'completed' ? '✅' : lastRun.status === 'failed' ? '❌' : '⏳'} {lastRun.status}
            </span>
            <span className="text-zinc-400">{new Date(lastRun.started_at).toLocaleString('fr-FR')}</span>
            <span className="text-zinc-400">{lastRun.sources_checked} sources</span>
            <span className="text-zinc-400">{lastRun.figures_detected} personnalités</span>
            <span className="text-green-400">+{lastRun.markets_published} publiés</span>
            <span className="text-amber-400">{lastRun.markets_queued} en attente</span>
            <span className="text-red-400">{lastRun.markets_rejected} rejetés</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Moderation queue */}
        <AdminModQueue items={pendingQueue ?? []} />

        {/* Trending figures */}
        <AdminTrending figures={recentFigures ?? []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trending markets */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h2 className="font-semibold text-white mb-4">🔥 Top marchés viraux</h2>
          <div className="flex flex-col gap-2">
            {(trendingMarkets ?? []).map(m => (
              <a key={m.id} href={`/markets/${m.id}`} className="flex items-center justify-between gap-2 rounded-lg bg-zinc-800/60 px-3 py-2 hover:bg-zinc-800 transition-colors">
                <span className="text-xs text-zinc-300 line-clamp-1 flex-1">{m.title}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {m.breaking_news && <span className="text-xs text-red-400 font-bold">BREAKING</span>}
                  {m.suspended && <span className="text-xs text-red-500">SUSPENDU</span>}
                  <span className="text-xs font-bold text-violet-400">{m.virality_score}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Reported markets */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h2 className="font-semibold text-white mb-4">⚠️ Marchés signalés</h2>
          <div className="flex flex-col gap-2">
            {(reportedMarkets ?? []).map(m => (
              <div key={m.id} className="flex items-center justify-between gap-2 rounded-lg bg-zinc-800/60 px-3 py-2">
                <a href={`/markets/${m.id}`} className="text-xs text-zinc-300 line-clamp-1 flex-1 hover:text-white">{m.title}</a>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-bold ${m.report_count >= 5 ? 'text-red-400' : 'text-amber-400'}`}>
                    {m.report_count} signalements
                  </span>
                  {m.suspended && <span className="text-xs bg-red-900/60 text-red-300 px-1.5 py-0.5 rounded">SUSPENDU</span>}
                </div>
              </div>
            ))}
            {(reportedMarkets ?? []).length === 0 && (
              <p className="text-xs text-zinc-600">Aucun signalement</p>
            )}
          </div>
        </div>
      </div>

      {/* Bot run history */}
      <AdminBotRuns runs={botRuns ?? []} />

      {/* Blacklist */}
      <AdminBlacklist />
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    violet: 'border-violet-800/60 bg-violet-950/20 text-violet-300',
    blue: 'border-blue-800/60 bg-blue-950/20 text-blue-300',
    amber: 'border-amber-800/60 bg-amber-950/20 text-amber-300',
    red: 'border-red-800/60 bg-red-950/20 text-red-300',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-2xl font-bold">{value.toLocaleString('fr-FR')}</p>
      <p className="text-xs mt-1 opacity-70">{label}</p>
    </div>
  )
}

function TriggerBotButton() {
  return (
    <form action="/api/admin/trigger-bot" method="POST">
      <button
        type="submit"
        className="rounded-lg border border-violet-700 bg-violet-950/60 px-4 py-2 text-sm font-medium text-violet-300 hover:bg-violet-900/60 transition-colors"
      >
        ▶ Lancer le bot
      </button>
    </form>
  )
}
