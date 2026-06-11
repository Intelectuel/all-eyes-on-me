import Link from 'next/link'
import { Market, Profile } from '@/types'
import { getProbability, formatDate, daysUntil } from '@/lib/utils'
import ReportButton from './ReportButton'

const CATEGORY_COLORS: Record<string, string> = {
  career: 'bg-blue-950/60 text-blue-300 border-blue-800',
  health: 'bg-green-950/60 text-green-300 border-green-800',
  education: 'bg-yellow-950/60 text-yellow-300 border-yellow-800',
  finance: 'bg-emerald-950/60 text-emerald-300 border-emerald-800',
  relationships: 'bg-pink-950/60 text-pink-300 border-pink-800',
  creative: 'bg-orange-950/60 text-orange-300 border-orange-800',
  travel: 'bg-cyan-950/60 text-cyan-300 border-cyan-800',
  personal: 'bg-violet-950/60 text-violet-300 border-violet-800',
  sports: 'bg-lime-950/60 text-lime-300 border-lime-800',
  entertainment: 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-800',
  politics: 'bg-red-950/60 text-red-300 border-red-800',
}

export default function MarketCard({ market }: { market: Market }) {
  const prob = getProbability(market.yes_pool, market.no_pool)
  const total = market.yes_pool + market.no_pool
  const days = daysUntil(market.resolution_date)
  const catStyle = CATEGORY_COLORS[market.category] ?? CATEGORY_COLORS.personal
  const isViral = (market.virality_score ?? 0) >= 55
  const isBreaking = market.breaking_news

  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition-all hover:border-zinc-600 hover:bg-zinc-900">
      {/* Viral / Breaking badges */}
      {(isViral || isBreaking) && (
        <div className="absolute top-3 right-3 flex gap-1.5 z-10">
          {isBreaking && (
            <span className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-red-950 border border-red-700 text-red-300 animate-pulse">
              BREAKING
            </span>
          )}
          {isViral && !isBreaking && (
            <span className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-orange-950/80 border border-orange-700 text-orange-300">
              🔥 {market.virality_score}
            </span>
          )}
        </div>
      )}

      <Link href={`/markets/${market.id}`} className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <span className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium ${catStyle}`}>
            {market.category}
          </span>
          {market.resolved && (
            <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${
              market.resolution === 'YES'
                ? 'border-green-700 bg-green-950/60 text-green-300'
                : 'border-red-700 bg-red-950/60 text-red-300'
            }`}>
              {market.resolution}
            </span>
          )}
        </div>

        <p className={`text-sm font-medium leading-snug group-hover:text-white line-clamp-2 ${
          isBreaking ? 'text-white' : 'text-zinc-100'
        } ${isViral || isBreaking ? 'pr-16' : ''}`}>
          {market.title}
        </p>

        {/* Probability bar */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>YES {prob}%</span>
            <span>NO {100 - prob}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className={`h-full rounded-full transition-all ${
                isBreaking
                  ? 'bg-gradient-to-r from-red-500 to-orange-400'
                  : isViral
                  ? 'bg-gradient-to-r from-orange-500 to-violet-400'
                  : 'bg-gradient-to-r from-violet-500 to-violet-400'
              }`}
              style={{ width: `${prob}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>{total.toLocaleString()} crédits misés</span>
          <span>{market.resolved ? `Résolu ${formatDate(market.resolution_date)}` : `${days}j restants`}</span>
        </div>
      </Link>

      {/* Footer: creator + report */}
      <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60">
        {market.creator ? (
          <div className="flex items-center gap-2">
            {(market.creator as Profile).avatar_url && (
              <img
                src={(market.creator as Profile).avatar_url!}
                alt={(market.creator as Profile).username}
                className="h-5 w-5 rounded-full object-cover"
              />
            )}
            <span className="text-xs text-zinc-500">
              {market.auto_generated ? '🔥 ' : '@'}{market.creator.username}
              {(market.creator as Profile).is_verified && (
                <span className="ml-1 text-violet-400">✓</span>
              )}
            </span>
          </div>
        ) : (
          <span />
        )}
        <ReportButton marketId={market.id} />
      </div>
    </div>
  )
}
