import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MarketCard from '@/components/markets/MarketCard'
import Button from '@/components/ui/Button'
import { Market } from '@/types'
import { formatCredits } from '@/lib/utils'

export const revalidate = 0

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: markets }, { data: bets }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('markets')
      .select('*, creator:profiles(username)')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('bets')
      .select('*, market:markets(title, resolved, resolution)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">@{profile?.username}</h1>
          <p className="text-zinc-400 text-sm mt-0.5">
            Balance:{' '}
            <span className="text-violet-400 font-semibold">{formatCredits(profile?.credits ?? 0)} credits</span>
          </p>
        </div>
        <Link href="/markets/create">
          <Button>Create market</Button>
        </Link>
      </div>

      {/* My markets */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-white">My markets</h2>
        {markets && markets.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {markets.map(m => (
              <MarketCard key={m.id} market={m as Market} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
            <p className="text-zinc-500 mb-3">You haven&apos;t created any markets yet.</p>
            <Link href="/markets/create">
              <Button variant="secondary">Create your first market</Button>
            </Link>
          </div>
        )}
      </section>

      {/* Recent bets */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-white">Recent bets</h2>
        {bets && bets.length > 0 ? (
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60">
                  <th className="px-4 py-3 text-left font-medium text-zinc-400">Market</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-400">Position</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-400">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bets.map(bet => (
                  <tr key={bet.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-900/40 transition-colors">
                    <td className="px-4 py-3 text-zinc-200 line-clamp-1 max-w-xs">
                      {(bet.market as { title: string })?.title}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                        bet.position === 'YES'
                          ? 'bg-green-950/60 text-green-300'
                          : 'bg-red-950/60 text-red-300'
                      }`}>
                        {bet.position}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-300">
                      {formatCredits(bet.amount)} cr
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
            <p className="text-zinc-500">No bets placed yet. Browse markets to get started.</p>
          </div>
        )}
      </section>
    </div>
  )
}
