import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NavActions from './NavActions'

export default async function Navbar() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, credits')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-white">
            All Eyes <span className="text-violet-400">On Me</span>
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Markets
          </Link>
          {user && (
            <Link
              href="/markets/create"
              className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Create
            </Link>
          )}
        </nav>

        <NavActions user={user} profile={profile} />
      </div>
    </header>
  )
}
