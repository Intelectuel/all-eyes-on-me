import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Admin — All Eyes On Me' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  console.log('[admin] getUser:', user?.id ?? 'null', 'error:', userError?.message ?? 'none')

  if (!user) redirect('/auth/login')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  console.log('[admin] profile:', JSON.stringify(profile), 'error:', profileError?.message ?? 'none')

  if (!profile?.is_admin) redirect('/')

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="border-b border-zinc-800 bg-zinc-900/60 px-6 py-3 flex items-center gap-3">
        <span className="text-violet-400 font-bold text-sm">⚡ ADMIN</span>
        <span className="text-zinc-600">|</span>
        <span className="text-zinc-400 text-sm">All Eyes On Me</span>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
