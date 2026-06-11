import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { marketId, reason } = await req.json() as { marketId: string; reason: string }
  if (!marketId || !reason) {
    return NextResponse.json({ error: 'Missing marketId or reason' }, { status: 400 })
  }

  const { error } = await supabase
    .from('reports')
    .insert({ market_id: marketId, user_id: user.id, reason })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already reported' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
