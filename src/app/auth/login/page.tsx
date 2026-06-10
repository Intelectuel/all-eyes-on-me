import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm pt-8">
      <div className="flex flex-col gap-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-white">Sign in to All Eyes On Me</h1>
          <p className="text-sm text-zinc-400">Welcome back. All eyes are on you.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
