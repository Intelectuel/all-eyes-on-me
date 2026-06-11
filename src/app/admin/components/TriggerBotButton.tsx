'use client'

import { useState } from 'react'

type State = 'idle' | 'loading' | 'done' | 'error'

export default function TriggerBotButton() {
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<{
    marketsPublished?: number
    marketsQueued?: number
    marketsRejected?: number
  } | null>(null)

  async function trigger() {
    setState('loading')
    setResult(null)
    try {
      const res = await fetch('/api/admin/trigger-bot', { method: 'POST' })
      const data = await res.json() as {
        success?: boolean
        stats?: {
          marketsPublished: number
          marketsQueued: number
          marketsRejected: number
        }
        error?: string
      }
      if (!res.ok || data.error) throw new Error(data.error ?? 'Failed')
      setResult(data.stats ?? null)
      setState('done')
      // Reset after 8 seconds
      setTimeout(() => setState('idle'), 8000)
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 4000)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5 shrink-0">
      <button
        onClick={trigger}
        disabled={state === 'loading'}
        className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
          state === 'loading'
            ? 'border-zinc-700 bg-zinc-800 text-zinc-500 cursor-wait'
            : state === 'done'
            ? 'border-green-700 bg-green-950/60 text-green-300'
            : state === 'error'
            ? 'border-red-700 bg-red-950/60 text-red-300'
            : 'border-violet-700 bg-violet-950/60 text-violet-300 hover:bg-violet-900/60'
        }`}
      >
        {state === 'loading' && (
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-200" />
            Running…
          </span>
        )}
        {state === 'done' && '✓ Done'}
        {state === 'error' && '✕ Error'}
        {state === 'idle' && '▶ Run bot now'}
      </button>

      {state === 'done' && result && (
        <p className="text-[10px] text-zinc-500">
          +{result.marketsPublished ?? 0} published · {result.marketsQueued ?? 0} queued · {result.marketsRejected ?? 0} rejected
        </p>
      )}
    </div>
  )
}
