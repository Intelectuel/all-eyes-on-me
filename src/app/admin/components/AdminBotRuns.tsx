interface BotRun {
  id: string
  started_at: string
  completed_at: string | null
  sources_checked: number
  figures_detected: number
  markets_generated: number
  markets_published: number
  markets_queued: number
  markets_rejected: number
  errors: string[]
  status: string
}

export default function AdminBotRuns({ runs }: { runs: BotRun[] }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <h2 className="font-semibold text-white mb-4">🤖 Historique des runs</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-zinc-500 border-b border-zinc-800">
              <th className="text-left py-2 pr-4">Démarré</th>
              <th className="text-left py-2 pr-4">Statut</th>
              <th className="text-right py-2 pr-4">Sources</th>
              <th className="text-right py-2 pr-4">Personnalités</th>
              <th className="text-right py-2 pr-4">Générés</th>
              <th className="text-right py-2 pr-4">Publiés</th>
              <th className="text-right py-2 pr-4">En attente</th>
              <th className="text-right py-2">Rejetés</th>
            </tr>
          </thead>
          <tbody>
            {runs.map(run => (
              <tr key={run.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30">
                <td className="py-2 pr-4 text-zinc-400">
                  {new Date(run.started_at).toLocaleString('fr-FR', {
                    day: '2-digit', month: '2-digit',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </td>
                <td className="py-2 pr-4">
                  <span className={`font-medium ${
                    run.status === 'completed' ? 'text-green-400'
                      : run.status === 'failed' ? 'text-red-400'
                      : 'text-amber-400'
                  }`}>
                    {run.status === 'completed' ? '✅' : run.status === 'failed' ? '❌' : '⏳'} {run.status}
                  </span>
                </td>
                <td className="py-2 pr-4 text-right text-zinc-400">{run.sources_checked}</td>
                <td className="py-2 pr-4 text-right text-zinc-400">{run.figures_detected}</td>
                <td className="py-2 pr-4 text-right text-zinc-400">{run.markets_generated}</td>
                <td className="py-2 pr-4 text-right text-green-400">{run.markets_published}</td>
                <td className="py-2 pr-4 text-right text-amber-400">{run.markets_queued}</td>
                <td className="py-2 text-right text-red-400">{run.markets_rejected}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {runs.length === 0 && (
          <p className="text-xs text-zinc-600 py-4">Aucun run enregistré</p>
        )}
      </div>
    </div>
  )
}
