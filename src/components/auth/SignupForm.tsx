'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function SignupForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const e: Record<string, string> = {}
    if (username.length < 3) e.username = 'At least 3 characters'
    if (!/^[a-z0-9_]+$/.test(username)) e.username = 'Only lowercase letters, numbers, underscores'
    if (password.length < 6) e.password = 'At least 6 characters'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })

    if (error) {
      setErrors({ form: error.message })
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="username"
        label="Username"
        placeholder="your_handle"
        value={username}
        onChange={e => setUsername(e.target.value.toLowerCase())}
        error={errors.username}
        required
        autoComplete="username"
      />
      <Input
        id="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <Input
        id="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        value={password}
        onChange={e => setPassword(e.target.value)}
        error={errors.password}
        required
        autoComplete="new-password"
      />
      {errors.form && (
        <p className="rounded-lg bg-red-950/50 border border-red-800 px-3 py-2 text-sm text-red-400">
          {errors.form}
        </p>
      )}
      <p className="text-xs text-zinc-500">
        You start with <span className="text-violet-400 font-medium">1,000 credits</span> to bet with.
      </p>
      <Button type="submit" loading={loading} size="lg" className="mt-2">
        Create account
      </Button>
      <p className="text-center text-sm text-zinc-500">
        Have an account?{' '}
        <Link href="/auth/login" className="text-violet-400 hover:text-violet-300">
          Sign in
        </Link>
      </p>
    </form>
  )
}
