import { AggregatedFigure, calculateVelocity } from './aggregator'
import { ViralityBreakdown } from './types'

export function calculateViralityScore(figure: AggregatedFigure): ViralityBreakdown {
  // 1. Sources count — how many different sources mention them (max 30)
  const uniqueSources = figure.sources.size
  const sourcesCount = Math.min(30, Math.round((uniqueSources / 4) * 30))

  // 2. Velocity — mention growth rate last 2h vs previous 2h (max 25)
  const velocityRatio = calculateVelocity(figure.mentions)
  let velocity: number
  if (velocityRatio >= 2.0) velocity = 25
  else if (velocityRatio >= 1.0) velocity = 20
  else if (velocityRatio >= 0.5) velocity = 15
  else if (velocityRatio >= 0) velocity = 10
  else velocity = 5

  // 3. Cross-platform presence — different sourceTypes (max 20)
  const uniqueSourceTypes = figure.sourceTypes.size
  const crossPlatform = Math.min(20, uniqueSourceTypes * 5)

  // 4. Controversy — rough sentiment polarity from context words (max 15)
  const controversyWords = [
    'scandal', 'scandale', 'controverse', 'controversy', 'clash', 'drama', 'polemic',
    'accuse', 'accusé', 'arrest', 'arrêté', 'fire', 'fired', 'licencié', 'divorce',
    'feud', 'beef', 'fight', 'bagarre', 'quitte', 'quit', 'resign', 'démission',
    'cheat', 'trahison', 'infidèle', 'rupture', 'breakup', 'fail', 'échec',
  ]
  const allContext = figure.contexts.join(' ').toLowerCase()
  const controversyHits = controversyWords.filter(w => allContext.includes(w)).length
  const controversy = Math.min(15, controversyHits * 3)

  // 5. Breaking news bonus — if first detected < 1h ago (max 10)
  const ageMs = Date.now() - figure.firstSeen.getTime()
  const breakingBonus = figure.isBreaking && ageMs < 60 * 60 * 1000 ? 10
    : ageMs < 2 * 60 * 60 * 1000 ? 5
    : 0

  const total = sourcesCount + velocity + crossPlatform + controversy + breakingBonus

  return {
    sourcesCount,
    velocity,
    crossPlatform,
    controversy,
    breakingBonus,
    total: Math.min(100, total),
  }
}

export function rankFigures(
  figures: Map<string, AggregatedFigure>,
  minScore = 30
): Array<{ figure: AggregatedFigure; breakdown: ViralityBreakdown }> {
  const ranked: Array<{ figure: AggregatedFigure; breakdown: ViralityBreakdown }> = []

  for (const figure of Array.from(figures.values())) {
    const breakdown = calculateViralityScore(figure)
    if (breakdown.total >= minScore) {
      ranked.push({ figure, breakdown })
    }
  }

  return ranked.sort((a, b) => b.breakdown.total - a.breakdown.total)
}
