import { createClient } from '@/lib/supabase/server'
import TriggerBotButton from './components/TriggerBotButton'

export const revalidate = 0

export default async function AdminPage() {
  const supabase = createClient()

  const [
    { data: lastRun },
    { data: recentMarkets },
  ] = await Promise.all([
    supabase
      .from('bot_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('markets')
      .select('id, title, category, created_at, auto_generated, virality_score, breaking_news, yes_pool, no_pool, creator:profiles(username)')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Admin</h1>
      </div>

      {/* Bot status + trigger */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-white">Bot status</p>
            {lastRun ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
                <span className={
                  lastRun.status === 'completed' ? 'text-green-400 font-medium'
                  : lastRun.status === 'failed' ? 'text-red-400 font-medium'
                  : 'text-amber-400 font-medium'
                }>
                  {lastRun.status === 'completed' ? '● Completed'
                    : lastRun.status === 'failed' ? '● Failed'
                    : '● Running'}
                </span>
                <span>
                  {new Date(lastRun.started_at).toLocaleString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
                <span>{lastRun.sources_checked} sources checked</span>
                <span>{lastRun.figures_detected} figures detected</span>
              </div>
            ) : (
              <p className="text-xs text-zinc-500">No runs yet</p>
            )}
          </div>
          <TriggerBotButton />
        </div>

        {lastRun && (
          <div className="grid grid-cols-3 gap-3 pt-1 border-t border-zinc-800">
            <div className="text-center">
              <p className="text-lg font-bold text-green-400">{lastRun.markets_published}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Published</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-400">{lastRun.markets_queued}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Queued</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-400">{lastRun.markets_rejected}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Rejected</p>
            </div>
          </div>
        )}
      </div>

      {/* Last 10 markets */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Last 10 markets created</h2>
        <div className="flex flex-col divide-y divide-zinc-800">
          {(recentMarkets ?? []).map(m => {
            const total = m.yes_pool + m.no_pool
            const yesProb = total > 0 ? Math.round((m.yes_pool / total) * 100) : 50
            return (
              <div key={m.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <a
                    href={`/markets/${m.id}`}
                    className="text-sm text-zinc-200 hover:text-white line-clamp-1 transition-colors"
                  >
                    {m.title}
                  </a>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-zinc-500">
                      {new Date(m.created_at).toLocaleString('fr-FR', {
                        day: '2-digit', month: '2-digit',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    <span className="text-[10px] text-zinc-600">·</span>
                    <span className="text-[10px] text-zinc-500">
                      {m.auto_generated
                        ? '🤖 bot'
                        : `@${(m.creator as unknown as { username: string } | null)?.username ?? '?'}`}
                    </span>
                    <span className="text-[10px] text-zinc-600">·</span>
                    <span className="text-[10px] text-zinc-500">{m.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {m.breaking_news && (
                    <span className="text-[10px] font-bold text-red-400">BREAKING</span>
                  )}
                  {m.auto_generated && (m.virality_score ?? 0) > 0 && (
                    <span className="text-[10px] font-bold text-orange-400">
                      🔥 {m.virality_score}
                    </span>
                  )}
                  <span className="text-xs text-zinc-400 w-10 text-right">{yesProb}%</span>
                </div>
              </div>
            )
          })}
          {(recentMarkets ?? []).length === 0 && (
            <p className="text-xs text-zinc-600 py-2">No markets yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
