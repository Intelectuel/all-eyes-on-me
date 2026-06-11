'use client'

import { useState } from 'react'

const REPORT_REASONS = [
  'Contenu inapproprié',
  'Informations incorrectes',
  'Sujet sensible',
  'Personne mineure',
  'Vie privée',
  'Autre',
]

export default function ReportButton({ marketId }: { marketId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function report(reason: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/markets/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketId, reason }),
      })
      if (res.ok || res.status === 409) {
        setDone(true)
        setOpen(false)
      }
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return <span className="text-[10px] text-zinc-600">Signalé</span>
  }

  return (
    <div className="relative">
      <button
        onClick={e => { e.preventDefault(); setOpen(!open) }}
        className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
      >
        Signaler
      </button>
      {open && (
        <div className="absolute bottom-full right-0 mb-1 z-20 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl p-2 min-w-40">
          <p className="text-[10px] text-zinc-500 mb-1.5 px-1">Raison du signalement</p>
          {REPORT_REASONS.map(reason => (
            <button
              key={reason}
              onClick={() => report(reason)}
              disabled={loading}
              className="w-full text-left text-xs text-zinc-300 px-2 py-1.5 rounded hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {reason}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
