import Anthropic from '@anthropic-ai/sdk'
import { AggregatedFigure } from './aggregator'
import { ViralityBreakdown, GeneratedMarket, SafetyResult, PersonCategory } from './types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SAFETY_HARD_BLOCKS = [
  'death', 'suicide', 'physical harm', 'violence',
  'health condition', 'medical', 'mental illness', 'mental health',
  'minor', 'under 18', 'child', 'underage',
  'criminal investigation', 'active trial',
  'sexual content', 'sexuality',
  'private family', 'kidnapping', 'disappearance',
  'natural disaster', 'tragedy',
  'terrorist', 'terrorism',
]

export async function detectPersonCategory(
  figure: AggregatedFigure
): Promise<PersonCategory> {
  const contexts = figure.contexts.slice(0, 5).join('; ')
  const sources = Array.from(figure.sourceTypes).join(', ')

  const prompt = `You are a person categorization AI. Based on the following information, determine the category for this public figure.

Name: ${figure.name}
Sources where trending: ${sources}
Context snippets: ${contexts}

Choose ONE category from this list:
youtuber, tiktoker, instagrammer, streamer, snapchat_creator, podcaster,
musician_pop, musician_rap, musician_rnb, musician_rock, musician_electronic, musician_classical, musician_world,
football_player, basketball_player, tennis_player, f1_driver, rugby_player, mma_fighter, cyclist, athlete,
actor, tv_personality, reality_tv, model, politician, entrepreneur, comedian, chef, artist, writer, scientist, activist, journalist, gamer, other

Respond with ONLY the category string, nothing else.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 20,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : 'other'
    return (text as PersonCategory) || 'other'
  } catch (err) {
    console.error('[Bot] detectPersonCategory error:', String(err))
    return 'other'
  }
}

export async function checkSafety(
  figure: AggregatedFigure,
  breakdown: ViralityBreakdown
): Promise<SafetyResult> {
  const contexts = figure.contexts.slice(0, 8).join('\n')

  // Quick hard-block check on raw text
  const allText = (figure.name + ' ' + contexts).toLowerCase()
  for (const block of SAFETY_HARD_BLOCKS) {
    if (allText.includes(block)) {
      return {
        safe: false,
        confidence: 95,
        blockedReasons: [`Contains hard-blocked term: "${block}"`],
        routing: 'reject',
      }
    }
  }

  const prompt = `You are a safety moderator for "All Eyes On Me", a prediction market platform about public figures.

Your job is to assess whether a prediction market about this person is safe to publish.

HARD BLOCK rules (confidence = 100, reject immediately):
- Death, suicide, physical harm, or violence
- Health conditions, medical diagnosis, or mental illness
- Anyone under 18 years old
- Active criminal investigations or ongoing trials
- Sexual content of any kind
- Private family members who are not public figures
- Kidnappings or disappearances
- Unverified breaking news less than 30 minutes old
- Natural disasters and tragedies
- Terrorist attacks

Person: ${figure.name}
Trending contexts:
${contexts}
Virality breakdown: ${JSON.stringify(breakdown)}

Respond in valid JSON only:
{
  "safe": boolean,
  "confidence": 0-100,
  "blocked_reasons": string[],
  "notes": string
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in safety response')

    const result = JSON.parse(jsonMatch[0]) as {
      safe: boolean
      confidence: number
      blocked_reasons: string[]
    }

    let routing: SafetyResult['routing']
    if (!result.safe) {
      routing = 'reject'
    } else if (result.confidence >= 85) {
      routing = 'publish'
    } else if (result.confidence >= 60) {
      routing = 'queue'
    } else {
      routing = 'reject'
    }

    return {
      safe: result.safe,
      confidence: result.confidence,
      blockedReasons: result.blocked_reasons || [],
      routing,
    }
  } catch (err) {
    console.error('[Bot] checkSafety error:', String(err))
    return {
      safe: true,
      confidence: 70,
      blockedReasons: [],
      routing: 'queue',
    }
  }
}

export async function generateMarket(
  figure: AggregatedFigure,
  breakdown: ViralityBreakdown,
  category: PersonCategory
): Promise<GeneratedMarket | null> {
  const contexts = figure.contexts.slice(0, 10).join('\n')
  const sources = Array.from(figure.sources).join(', ')

  const systemPrompt = `You are the world's most creative prediction market designer for "All Eyes On Me" — a platform where people bet on real human lives, careers and events.

Create the single most engaging, provocative and timely YES/NO prediction market about this public figure based on current trending context.

Perfect market criteria:
- References EXACTLY what is trending about them right now
- Creates strong divided opinions (neither obvious YES nor obvious NO)
- 100% verifiable through public sources within the timeframe
- Resolves in 7 to 45 days
- Makes people feel they have insider knowledge

Return ONLY valid JSON, no other text:`

  const userPrompt = `Create a prediction market for:

Name: ${figure.name}
Category: ${category}
Currently trending on: ${sources}
Virality score: ${breakdown.total}/100
Context:
${contexts}

JSON format:
{
  "title": "string (max 100 chars, written as a YES/NO question)",
  "description": "string (max 300 chars, explains the bet context)",
  "category": "one of: career|relationships|finance|creative|personal|sports|entertainment|politics",
  "resolution_date": "ISO date string, 7-45 days from now",
  "resolution_criteria": "string (exact verifiable criteria for YES resolution)",
  "why_viral_now": "string (1 sentence why this is trending NOW)",
  "predicted_engagement_score": number 1-100
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      messages: [
        { role: 'user', content: systemPrompt + '\n\n' + userPrompt },
      ],
    })

    // Extract text from response (thinking blocks + text blocks)
    let text = ''
    for (const block of response.content) {
      if (block.type === 'text') {
        text = block.text
        break
      }
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const market = JSON.parse(jsonMatch[0]) as GeneratedMarket
    if (!market.title || !market.description || !market.resolution_date) return null

    // Validate resolution date is within bounds
    const resolveDate = new Date(market.resolution_date)
    const now = new Date()
    const minDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const maxDate = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000)

    if (resolveDate < minDate) market.resolution_date = minDate.toISOString().split('T')[0]
    if (resolveDate > maxDate) market.resolution_date = maxDate.toISOString().split('T')[0]

    return market
  } catch (err) {
    console.error('[Bot] generateMarket error:', String(err))
    return null
  }
}
