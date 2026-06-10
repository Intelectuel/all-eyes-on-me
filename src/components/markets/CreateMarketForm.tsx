'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'

const CATEGORIES = [
  { value: 'career', label: 'Career' },
  { value: 'health', label: 'Health & Fitness' },
  { value: 'education', label: 'Education' },
  { value: 'finance', label: 'Finance' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'creative', label: 'Creative' },
  { value: 'travel', label: 'Travel' },
  { value: 'personal', label: 'Personal' },
]

export default function CreateMarketForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'personal',
    resolution_date: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (form.title.length > 200) e.title = 'Max 200 characters'
    if (!form.resolution_date) e.resolution_date = 'Resolution date is required'
    if (form.resolution_date && new Date(form.resolution_date) <= new Date())
      e.resolution_date = 'Must be a future date'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('markets')
      .insert({
        creator_id: userId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        resolution_date: form.resolution_date,
      })
      .select('id')
      .single()

    if (error) {
      setErrors({ form: error.message })
      setLoading(false)
      return
    }

    router.push(`/markets/${data.id}`)
  }

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Input
        id="title"
        label="Market question"
        placeholder="Will I get promoted to senior engineer by end of year?"
        value={form.title}
        onChange={e => set('title', e.target.value)}
        error={errors.title}
        required
      />

      <Textarea
        id="description"
        label="Description (optional)"
        placeholder="Add context, resolution criteria, or anything that helps others understand your goal..."
        value={form.description}
        onChange={e => set('description', e.target.value)}
        rows={3}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-300">Category</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => set('category', cat.value)}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                form.category === cat.value
                  ? 'border-violet-500 bg-violet-950/50 text-violet-300'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <Input
        id="resolution_date"
        type="date"
        label="Resolution date"
        value={form.resolution_date}
        onChange={e => set('resolution_date', e.target.value)}
        error={errors.resolution_date}
        min={minDateStr}
        required
      />

      {errors.form && (
        <p className="rounded-lg bg-red-950/50 border border-red-800 px-3 py-2 text-sm text-red-400">
          {errors.form}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          Create market
        </Button>
      </div>
    </form>
  )
}
