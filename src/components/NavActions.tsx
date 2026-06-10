'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { formatCredits } from '@/lib/utils'
import Button from './ui/Button'

type Profile = { username: string; credits: number } | null

export default function NavActions({
  user,
  profile,
}: {
  user: User | null
  profile: Profile
}) {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/login">
          <Button variant="ghost" size="sm">Sign in</Button>
        </Link>
        <Link href="/auth/signup">
          <Button size="sm">Sign up</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/dashboard" className="flex items-center gap-2 text-sm">
        <span className="hidden sm:block text-zinc-400">@{profile?.username}</span>
        <span className="rounded-md bg-violet-950/60 border border-violet-800 px-2 py-0.5 text-xs font-medium text-violet-300">
          {formatCredits(profile?.credits ?? 0)} cr
        </span>
      </Link>
      <Button variant="ghost" size="sm" onClick={signOut}>
        Sign out
      </Button>
    </div>
  )
}
