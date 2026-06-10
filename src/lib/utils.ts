export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatCredits(n: number) {
  return n.toLocaleString()
}

export function getProbability(yesPool: number, noPool: number) {
  const total = yesPool + noPool
  if (total === 0) return 50
  return Math.round((yesPool / total) * 100)
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
