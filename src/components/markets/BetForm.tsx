'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Market } from '@/types'
import { formatCredits, getProbability } from '@/lib/utils'
import Button from '@/components/ui/Button'

export default function BetForm({
  market,
  user,
  userCredits,
}: {
  market: Market
  user: User | null
  userCredits: number
}) {
  const router = useRouter()
  const [position, setPosition] = useState<'YES' | 'NO' | null>(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!user) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-center flex flex-col gap-3">
        <p className="text-zinc-400">Sign in to place a bet on this market.</p>
        <div className="flex justify-center gap-2">
          <Link href="/auth/login"><Button variant="secondary">Sign in</Button></Link>
          <Link href="/auth/signup"><Button>Sign up free</Button></Link>
        </div>
      </div>
    )
  }

  const amt = parseInt(amount) || 0
  const prob = getProbability(market.yes_pool, market.no_pool)
  const newProb = position === 'YES'
    ? getProbability(market.yes_pool + amt, market.no_pool)
    : position === 'NO'
      ? getProbability(market.yes_pool, market.no_pool + amt)
      : prob

  async function handleBet() {
    if (!position) { setError('Select YES or NO'); return }
    if (amt < 1) { setError('Enter an amount'); return }
    if (amt > userCredits) { setError('Not enough credits'); return }
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.rpc('place_bet', {
      p_market_id: market.id,
      p_position: position,
      p_amount: amt,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.refresh()
    setAmount('')
    setPosition(null)
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white">Place a bet</h2>
        <span className="text-sm text-zinc-400">
          Balance: <span className="text-violet-400 font-medium">{formatCredits(userCredits)} cr</span>
        </span>
      </div>

      {/* YES / NO toggle */}
      <div className="grid grid-cols-2 gap-3">
        {(['YES', 'NO'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPosition(p)}
            className={`rounded-xl border-2 py-4 text-base font-bold transition-all ${
              position === p
                ? p === 'YES'
                  ? 'border-green-500 bg-green-950/40 text-green-300'
                  : 'border-red-500 bg-red-950/40 text-red-300'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            {p}
            <div className="text-xs font-normal mt-0.5 opacity-70">
              {p === 'YES' ? `${prob}% now` : `${100 - prob}% now`}
            </div>
          </button>
        ))}
      </div>

      {/* Amount */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max={userCredits}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Amount in credits"
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <button
            type="button"
            onClick={() => setAmount(String(Math.floor(userCredits / 2)))}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
          >
            Half
          </button>
          <button
            type="button"
            onClick={() => setAmount(String(userCredits))}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
          >
            All in
          </button>
        </div>

        {amt > 0 && position && (
          <p className="text-xs text-zinc-500">
            This would shift the probability to{' '}
            <span className="text-violet-400 font-medium">{newProb}% YES</span>
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-950/50 border border-red-800 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <Button
        onClick={handleBet}
        loading={loading}
        disabled={!position || !amt}
        size="lg"
      >
        Bet {amt > 0 ? formatCredits(amt) + ' cr on ' : ''}{position ?? '...'}
      </Button>
    </div>
  )
}
