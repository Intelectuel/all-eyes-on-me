import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { queueId, marketId, action } = await req.json() as {
    queueId: string
    marketId: string
    action: 'approve' | 'reject'
  }

  if (action === 'reject') {
    await supabaseAdmin
      .from('markets')
      .update({ suspended: true })
      .eq('id', marketId)
  }

  await supabaseAdmin
    .from('moderation_queue')
    .update({
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq('id', queueId)

  return NextResponse.json({ success: true })
}
