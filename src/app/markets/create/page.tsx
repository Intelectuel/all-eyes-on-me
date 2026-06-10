import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CreateMarketForm from '@/components/markets/CreateMarketForm'

export default async function CreateMarketPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex flex-col gap-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-white">Create a market</h1>
          <p className="text-sm text-zinc-400">
            Ask a yes/no question about one of your life goals. Others will bet on the outcome.
          </p>
        </div>
        <CreateMarketForm userId={user.id} />
      </div>
    </div>
  )
}
