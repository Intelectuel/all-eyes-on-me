import { NextRequest, NextResponse } from 'next/server'
import { runBotCycle } from '@/lib/bot/runner'

export const maxDuration = 300

// Triggered when a virality score 90+ is detected
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-bot-secret')
  if (secret !== process.env.BOT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const stats = await runBotCycle({
      minViralityScore: 90,
      maxMarkets: 3,
      immediateAlert: true,
    })
    return NextResponse.json({ success: true, stats })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
