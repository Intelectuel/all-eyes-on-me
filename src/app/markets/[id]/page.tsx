import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Market } from '@/types'
import { formatDate, getProbability, formatCredits, daysUntil } from '@/lib/utils'
import BetForm from '@/components/markets/BetForm'

export const revalidate = 0

export default async function MarketPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [{ data: market }, { data: { user } }] = await Promise.all([
    supabase
      .from('markets')
      .select('*, creator:profiles(username, credits)')
      .eq('id', params.id)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!market) notFound()

  let userProfile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()
    userProfile = data
  }

  const m = market as Market
  const prob = getProbability(m.yes_pool, m.no_pool)
  const total = m.yes_pool + m.no_pool
  const days = daysUntil(m.resolution_date)

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <span className="text-xs font-medium text-zinc-500 capitalize">{m.category}</span>
            <h1 className="text-xl font-bold text-white leading-snug">{m.title}</h1>
            {m.description && (
              <p className="text-sm text-zinc-400 mt-1">{m.description}</p>
            )}
          </div>
          {m.resolved && (
            <span className={`shrink-0 rounded-lg border px-3 py-1.5 text-sm font-bold ${
              m.resolution === 'YES'
                ? 'border-green-700 bg-green-950/60 text-green-300'
                : 'border-red-700 bg-red-950/60 text-red-300'
            }`}>
              Resolved: {m.resolution}
            </span>
          )}
        </div>

        {/* Probability */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-violet-400">{prob}%</span>
              <span className="text-sm text-zinc-500">chance YES</span>
            </div>
            <div className="text-right text-sm text-zinc-500">
              <div>{formatCredits(total)} cr total</div>
              <div>{m.resolved ? `Resolved ${formatDate(m.resolution_date)}` : `${days}d remaining`}</div>
            </div>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all"
              style={{ width: `${prob}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <span>YES pool: {formatCredits(m.yes_pool)} cr</span>
            <span>NO pool: {formatCredits(m.no_pool)} cr</span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs text-zinc-500">
          <span>Created by @{(m.creator as { username: string })?.username}</span>
          <span>Resolves {formatDate(m.resolution_date)}</span>
        </div>
      </div>

      {/* Bet form */}
      {!m.resolved && (
        <BetForm
          market={m}
          user={user}
          userCredits={userProfile?.credits ?? 0}
        />
      )}
    </div>
  )
}
