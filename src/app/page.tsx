import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MarketCard from '@/components/markets/MarketCard'
import Button from '@/components/ui/Button'
import { Market } from '@/types'

export const revalidate = 0

const CATEGORIES = ['all', 'career', 'health', 'education', 'finance', 'relationships', 'creative', 'travel', 'personal']

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string }
}) {
  const supabase = createClient()
  const category = searchParams.category ?? 'all'
  const q = searchParams.q ?? ''

  let query = supabase
    .from('markets')
    .select('*, creator:profiles(username)')
    .eq('resolved', false)
    .order('created_at', { ascending: false })
    .limit(48)

  if (category !== 'all') query = query.eq('category', category)
  if (q) query = query.ilike('title', `%${q}%`)

  const { data: markets } = await query

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
      {markets && markets.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {markets.map(m => (
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
