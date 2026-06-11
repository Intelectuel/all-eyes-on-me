import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MarketCard from '@/components/markets/MarketCard'
import Button from '@/components/ui/Button'
import { Market } from '@/types'

export const revalidate = 0

const CATEGORIES = ['all', 'career', 'health', 'education', 'finance', 'relationships', 'creative', 'travel', 'personal', 'sports', 'entertainment', 'politics']

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string }
}) {
  const supabase = createClient()
  const category = searchParams.category ?? 'all'
  const q = searchParams.q ?? ''

  // Top 5 viral markets (pinned at top)
  const { data: viralMarkets } = await supabase
    .from('markets')
    .select('*, creator:profiles(username, avatar_url, is_verified)')
    .eq('resolved', false)
    .eq('auto_generated', true)
    .eq('suspended', false)
    .gte('virality_score', 55)
    .order('virality_score', { ascending: false })
    .limit(5)

  // Regular markets
  let query = supabase
    .from('markets')
    .select('*, creator:profiles(username, avatar_url, is_verified)')
    .eq('resolved', false)
    .eq('suspended', false)
    .order('created_at', { ascending: false })
    .limit(48)

  if (category !== 'all') query = query.eq('category', category)
  if (q) query = query.ilike('title', `%${q}%`)

  const { data: markets } = await query

  // Exclude viral markets from main feed to avoid duplicates
  const viralIds = new Set((viralMarkets ?? []).map(m => m.id))
  const regularMarkets = (markets ?? []).filter(m => !viralIds.has(m.id))

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <div className="flex flex-col gap-3 text-center py-8">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          All Eyes On Me
        </h1>
        <p className="text-zinc-400 max-w-xl mx-auto">
          Put your goals on the line. Let the world bet on whether you&apos;ll make it.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link href="/markets/create">
            <Button size="lg">Create a market</Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary">Join for free</Button>
          </Link>
        </div>
      </div>

      {/* Trending section */}
      {viralMarkets && viralMarkets.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-orange-400 font-semibold text-sm">🔥 En tendance maintenant</span>
            <div className="flex-1 h-px bg-orange-900/40" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {viralMarkets.map(m => (
              <MarketCard key={m.id} market={m as Market} />
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <Link
              key={cat}
              href={cat === 'all' ? '/' : `/?category=${cat}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
                category === cat
                  ? 'border-violet-500 bg-violet-950/60 text-violet-300'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        <form method="GET">
          {category !== 'all' && <input type="hidden" name="category" value={category} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search markets..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </form>
      </div>

      {/* Market grid */}
      {regularMarkets.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {regularMarkets.map(m => (
            <MarketCard key={m.id} market={m as Market} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-zinc-500">No markets yet.</p>
          <Link href="/markets/create">
            <Button>Create the first one</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
