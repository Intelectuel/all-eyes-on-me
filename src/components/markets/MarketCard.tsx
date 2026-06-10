import Link from 'next/link'
import { Market } from '@/types'
import { getProbability, formatDate, daysUntil } from '@/lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  career: 'bg-blue-950/60 text-blue-300 border-blue-800',
  health: 'bg-green-950/60 text-green-300 border-green-800',
  education: 'bg-yellow-950/60 text-yellow-300 border-yellow-800',
  finance: 'bg-emerald-950/60 text-emerald-300 border-emerald-800',
  relationships: 'bg-pink-950/60 text-pink-300 border-pink-800',
  creative: 'bg-orange-950/60 text-orange-300 border-orange-800',
  travel: 'bg-cyan-950/60 text-cyan-300 border-cyan-800',
  personal: 'bg-violet-950/60 text-violet-300 border-violet-800',
}

export default function MarketCard({ market }: { market: Market }) {
  const prob = getProbability(market.yes_pool, market.no_pool)
  const total = market.yes_pool + market.no_pool
  const days = daysUntil(market.resolution_date)
  const catStyle = CATEGORY_COLORS[market.category] ?? CATEGORY_COLORS.personal

  return (
    <Link
      href={`/markets/${market.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition-all hover:border-zinc-600 hover:bg-zinc-900"
    >
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

      <p className="text-sm font-medium text-zinc-100 leading-snug group-hover:text-white line-clamp-2">
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
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all"
            style={{ width: `${prob}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>{total.toLocaleString()} credits wagered</span>
        <span>{market.resolved ? `Resolved ${formatDate(market.resolution_date)}` : `${days}d left`}</span>
      </div>

      {market.creator && (
        <p className="text-xs text-zinc-600">by @{market.creator.username}</p>
      )}
    </Link>
  )
}
