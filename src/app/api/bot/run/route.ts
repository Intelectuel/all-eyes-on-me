import { NextRequest, NextResponse } from 'next/server'
import { runBotCycle, runGoogleTrendsOnly } from '@/lib/bot/runner'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-bot-secret') ?? req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.BOT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as {
    mode?: 'full' | 'trends_only'
    minViralityScore?: number
  }

  try {
    const stats = body.mode === 'trends_only'
      ? await runGoogleTrendsOnly()
      : await runBotCycle({ minViralityScore: body.minViralityScore })

    return NextResponse.json({ success: true, stats })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Bot endpoint ready' })
}
