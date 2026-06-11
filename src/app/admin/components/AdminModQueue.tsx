'use client'

import { useState } from 'react'

interface QueueItem {
  id: string
  market_id: string
  reason: string
  confidence_score: number
  generated_data: { figure_name?: string; virality_score?: number; why_viral?: string }
  created_at: string
  market?: { title: string; virality_score: number; breaking_news: boolean } | null
}

export default function AdminModQueue({ items }: { items: QueueItem[] }) {
  const [queue, setQueue] = useState(items)
  const [loading, setLoading] = useState<string | null>(null)

  async function handle(id: string, marketId: string, action: 'approve' | 'reject') {
    setLoading(id)
    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueId: id, marketId, action }),
      })
      if (res.ok) {
        setQueue(q => q.filter(item => item.id !== id))
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
        ✋ File de modération
        {queue.length > 0 && (
          <span className="rounded-full bg-amber-900/60 border border-amber-700 text-amber-300 text-xs px-2 py-0.5">
            {queue.length}
          </span>
        )}
      </h2>

      {queue.length === 0 ? (
        <p className="text-xs text-zinc-600">File vide ✓</p>
      ) : (
        <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto">
          {queue.map(item => (
            <div key={item.id} className="rounded-lg border border-zinc-700 bg-zinc-800/60 p-3 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-100 line-clamp-2">
                    {item.market?.title ?? 'Marché inconnu'}
                  </p>
                  {item.generated_data?.figure_name && (
                    <p className="text-xs text-violet-400 mt-0.5">{item.generated_data.figure_name}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs text-zinc-500">conf. {item.confidence_score}%</span>
                  {item.market?.breaking_news && (
                    <span className="text-xs text-red-400 font-bold">BREAKING</span>
                  )}
                </div>
              </div>

              <p className="text-xs text-zinc-500">{item.reason}</p>

              {item.generated_data?.why_viral && (
                <p className="text-xs text-zinc-400 italic">{item.generated_data.why_viral}</p>
              )}

              <div className="flex gap-2 pt-1">
                <a
                  href={`/markets/${item.market_id}`}
                  target="_blank"
                  className="text-xs text-zinc-500 hover:text-zinc-300 underline"
                >
                  Voir le marché
                </a>
                <span className="flex-1" />
                <button
                  onClick={() => handle(item.id, item.market_id, 'reject')}
                  disabled={loading === item.id}
                  className="rounded px-2 py-1 text-xs font-medium bg-red-950/60 border border-red-800 text-red-300 hover:bg-red-900/60 disabled:opacity-50 transition-colors"
                >
                  Rejeter
                </button>
                <button
                  onClick={() => handle(item.id, item.market_id, 'approve')}
                  disabled={loading === item.id}
                  className="rounded px-2 py-1 text-xs font-medium bg-green-950/60 border border-green-800 text-green-300 hover:bg-green-900/60 disabled:opacity-50 transition-colors"
                >
                  Approuver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
