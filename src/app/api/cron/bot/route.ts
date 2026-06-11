import { NextRequest, NextResponse } from 'next/server'
import { runBotCycle, runGoogleTrendsOnly } from '@/lib/bot/runner'

export const maxDuration = 300

export async function GET(req: NextRequest) {
  // Vercel envoie automatiquement Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const mode = req.nextUrl.searchParams.get('mode')

  try {
    const stats = mode === 'trends_only'
      ? await runGoogleTrendsOnly()
      : await runBotCycle()

    return NextResponse.json({ success: true, stats })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
