import SignupForm from '@/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-sm pt-8">
      <div className="flex flex-col gap-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-white">Join All Eyes On Me</h1>
          <p className="text-sm text-zinc-400">Start betting on yourself. Get 1,000 credits free.</p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
