'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface BlacklistEntry {
  id: string
  term: string
  type: string
  reason: string | null
  created_at: string
}

export default function AdminBlacklist() {
  const [entries, setEntries] = useState<BlacklistEntry[]>([])
  const [term, setTerm] = useState('')
  const [type, setType] = useState('person')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('blacklist')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => setEntries(data ?? []))
  }, [])

  async function addEntry(e: React.FormEvent) {
    e.preventDefault()
    if (!term.trim()) return
    setLoading(true)
    const { data, error } = await supabase
      .from('blacklist')
      .insert({ term: term.trim(), type, reason: reason.trim() || null })
      .select()
      .single()
    if (!error && data) {
      setEntries(prev => [data, ...prev])
      setTerm('')
      setReason('')
    }
    setLoading(false)
  }

  async function removeEntry(id: string) {
    await supabase.from('blacklist').delete().eq('id', id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <h2 className="font-semibold text-white mb-4">🚫 Blacklist</h2>

      <form onSubmit={addEntry} className="flex flex-wrap gap-2 mb-4">
        <input
          value={term}
          onChange={e => setTerm(e.target.value)}
          placeholder="Terme ou nom..."
          className="flex-1 min-w-32 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
        />
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none"
        >
          <option value="person">Personne</option>
          <option value="topic">Sujet</option>
          <option value="keyword">Mot-clé</option>
        </select>
        <input
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Raison (optionnel)"
          className="flex-1 min-w-40 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !term.trim()}
          className="rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          Ajouter
        </button>
      </form>

      <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
        {entries.map(entry => (
          <div key={entry.id} className="flex items-center gap-2 rounded-lg bg-zinc-800/60 px-3 py-2">
            <span className="text-xs font-medium text-zinc-200">{entry.term}</span>
            <span className="text-xs text-zinc-600 bg-zinc-700/60 px-1.5 rounded">{entry.type}</span>
            {entry.reason && <span className="text-xs text-zinc-500 flex-1 truncate">{entry.reason}</span>}
            <span className="flex-1" />
            <button
              onClick={() => removeEntry(entry.id)}
              className="text-zinc-600 hover:text-red-400 text-xs transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-xs text-zinc-600">Blacklist vide</p>
        )}
      </div>
    </div>
  )
}
