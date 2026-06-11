const CATEGORY_LABELS: Record<string, string> = {
  youtuber: '📺 YouTube',
  tiktoker: '🎵 TikTok',
  instagrammer: '📸 Instagram',
  streamer: '🎮 Twitch',
  musician_pop: '🎤 Pop',
  musician_rap: '🎤 Rap',
  football_player: '⚽ Football',
  basketball_player: '🏀 Basketball',
  tennis_player: '🎾 Tennis',
  f1_driver: '🏎️ F1',
  actor: '🎬 Acteur',
  tv_personality: '📺 TV',
  politician: '🏛️ Politique',
  entrepreneur: '💼 Business',
  comedian: '😂 Humour',
  athlete: '🏃 Athlète',
  reality_tv: '📺 Téléréalité',
}

interface Figure {
  id: string
  name: string
  category: string
  virality_score: number
  last_trending_at: string
  trend_count_24h: number
}

export default function AdminTrending({ figures }: { figures: Figure[] }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <h2 className="font-semibold text-white mb-4">👁️ Personnalités en tendance</h2>
      <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto">
        {figures.map(f => (
          <div key={f.id} className="flex items-center gap-3 rounded-lg bg-zinc-800/60 px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-100 truncate">{f.name}</p>
              <p className="text-xs text-zinc-500">{CATEGORY_LABELS[f.category] ?? f.category}</p>
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <span className={`text-xs font-bold ${
                f.virality_score >= 90 ? 'text-red-400'
                  : f.virality_score >= 70 ? 'text-orange-400'
                  : 'text-violet-400'
              }`}>
                {f.virality_score >= 90 ? '🚨 ' : f.virality_score >= 70 ? '🔥 ' : ''}{f.virality_score}
              </span>
              <span className="text-xs text-zinc-600">{f.trend_count_24h}x/24h</span>
            </div>
          </div>
        ))}
        {figures.length === 0 && (
          <p className="text-xs text-zinc-600">Aucune personnalité détectée</p>
        )}
      </div>
    </div>
  )
}
